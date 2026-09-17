import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import { GenerationStore } from "./store";
import { bundleHash } from "./validation";
import { retrievedBundles } from "./asset-provenance";
const check = z
  .object({
    id: z.string().max(160),
    status: z.enum(["passed", "failed", "pending"]),
    detail: z.string().max(5000),
  })
  .strict();
const legacyResultSchema = z
  .object({
    operationId: z.uuid(),
    revision: z.number().int(),
    artifactHash: z.string().regex(/^[0-9a-f]{64}$/),
    ok: z.boolean(),
    checks: z.array(check).max(120),
    logs: z.array(z.string().max(5000)).max(100),
  })
  .strict();
export const resultSchema = legacyResultSchema
  .extend({
    dispatchId: z.uuid(),
    executionStatus: z.enum(["completed", "not_started"]).default("completed"),
  })
  .refine((r) => r.executionStatus !== "not_started" || !r.ok, {
    message: "An operation that did not start cannot succeed",
  });
export const connectionMetadataSchema = z
  .object({
    protocolVersion: z.number().int().min(1).max(2).default(1),
    capabilities: z
      .array(z.enum(["apply", "test"]))
      .max(2)
      .default([]),
  })
  .strict();
const sessionSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  lastSeen: z.number(),
  protocolVersion: z.number().int().default(1),
  capabilities: z.array(z.enum(["apply", "test"])).default([]),
});
const operationBase = z.object({
  id: z.uuid(),
  studioId: z.uuid(),
  projectId: z.uuid(),
  revision: z.number().int(),
  artifactHash: z.string().regex(/^[0-9a-f]{64}$/),
  kind: z.enum(["apply", "test"]),
});
const operationSchema = operationBase.extend({
  protocolVersion: z.literal(2),
  state: z.enum([
    "queued",
    "dispatched",
    "done",
    "cancelled",
    "expired",
    "unknown",
  ]),
  createdAt: z.number(),
  expiresAt: z.number(),
  dispatchId: z.uuid().optional(),
  dispatchedAt: z.number().optional(),
  outcomeDeadline: z.number().optional(),
  reason: z.string().optional(),
  expectedTestIds: z.array(z.string()).default([]),
  testsHash: z.string().optional(),
  result: z.union([resultSchema, legacyResultSchema]).optional(),
});
type Operation = z.infer<typeof operationSchema>;
const bridgeStateSchema = z.object({
  version: z.literal(2),
  token: z.string().regex(/^[0-9a-f]{64}$/),
  sessions: z.array(sessionSchema),
  operations: z.array(operationSchema),
});
const legacyStateSchema = bridgeStateSchema.extend({
  version: z.literal(1),
  operations: z.array(
    operationBase.extend({
      state: z.enum(["queued", "done"]),
      result: legacyResultSchema.optional(),
    }),
  ),
});
const active = new Set<Operation["state"]>(["queued", "dispatched", "unknown"]);
export class Bridge {
  private token = randomBytes(32).toString("hex");
  private sessions = new Map<string, z.infer<typeof sessionSchema>>();
  private operations = new Map<string, Operation>();
  private now: () => number;
  private queueTtlMs: number;
  private outcomeTimeoutMs: number;
  constructor(
    private store: GenerationStore,
    options: {
      now?: () => number;
      queueTtlMs?: number;
      outcomeTimeoutMs?: number;
    } = {},
  ) {
    this.now = options.now ?? Date.now;
    this.queueTtlMs = options.queueTtlMs ?? 60_000;
    this.outcomeTimeoutMs = options.outcomeTimeoutMs ?? 600_000;
    if (this.queueTtlMs <= 0 || this.outcomeTimeoutMs <= 0)
      throw Error("Bridge deadlines must be positive");
    if (fs.existsSync(this.stateFile)) {
      const raw = JSON.parse(fs.readFileSync(this.stateFile, "utf8"));
      const state =
        raw.version === 1
          ? legacyStateSchema.parse(raw)
          : bridgeStateSchema.parse(raw);
      this.token = state.token;
      this.sessions = new Map(state.sessions.map((s) => [s.id, s]));
      for (const previous of state.operations) {
        const op: Operation =
          state.version === 1
            ? {
                ...previous,
                expectedTestIds: [],
                protocolVersion: 2,
                createdAt: this.now(),
                expiresAt: this.now(),
                state: previous.state === "queued" ? "unknown" : "done",
                reason:
                  previous.state === "queued"
                    ? "Legacy delivery was not recorded; inspect Studio before taking further action."
                    : undefined,
              }
            : operationSchema.parse(previous);
        if (op.state === "dispatched") {
          op.state = "unknown";
          op.reason =
            "Backend restarted after dispatch; awaiting the original receipt. Command will not be replayed.";
        }
        this.operations.set(op.id, op);
      }
    }
    this.refresh();
    this.persist();
  }
  private get stateFile() {
    return path.join(this.store.directory, "bridge", "state.json");
  }
  private persist(operations = this.operations) {
    fs.mkdirSync(path.dirname(this.stateFile), { recursive: true });
    const fd = fs.openSync(this.stateFile + ".tmp", "w", 0o600);
    try {
      fs.writeFileSync(
        fd,
        JSON.stringify({
          version: 2,
          token: this.token,
          sessions: [...this.sessions.values()],
          operations: [...operations.values()],
        }),
      );
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    fs.renameSync(this.stateFile + ".tmp", this.stateFile);
  }
  private saveOperation(op: Operation) {
    const next = new Map(this.operations);
    next.set(op.id, op);
    // A command can leave the bridge only after its dispatch record is persisted.
    this.persist(next);
    this.operations = next;
  }
  private refresh() {
    for (const op of this.operations.values()) {
      if (op.state === "queued" && this.now() >= op.expiresAt)
        this.saveOperation({
          ...op,
          state: "expired",
          reason: "Command expired before dispatch.",
        });
      if (op.state === "dispatched" && this.now() >= op.outcomeDeadline!)
        this.saveOperation({
          ...op,
          state: "unknown",
          reason:
            "Receipt deadline elapsed. Execution may have occurred; command will not be replayed.",
        });
    }
  }
  private testsHash(tests: unknown) {
    return createHash("sha256").update(JSON.stringify(tests)).digest("hex");
  }
  private currentProject(op: Operation) {
    try {
      const p = this.store.get(op.projectId);
      if (
        p.jobId ||
        p.assetPipeline?.entries.some((e) => e.component) ||
        p.revision !== op.revision ||
        !p.artifact ||
        p.approvedRevision !== op.revision ||
        !["ready_to_test", "verified"].includes(p.stage) ||
        p.checks.some((c) => c.status === "failed") ||
        bundleHash(p.artifact) !== op.artifactHash ||
        (op.testsHash && this.testsHash(p.review?.tests ?? []) !== op.testsHash)
      )
        return null;
      return p;
    } catch {
      return null;
    }
  }
  pairing() {
    return this.token;
  }
  assertProjectWritable(projectId: string) {
    this.refresh();
    if (
      [...this.operations.values()].some(
        (op) =>
          op.projectId === projectId &&
          (op.state === "dispatched" || op.state === "unknown"),
      )
    ) {
      throw Error(
        "Project has a dispatched or unresolved Studio operation; wait for its receipt before editing",
      );
    }
  }
  authorized(value: string) {
    const a = Buffer.from(value),
      b = Buffer.from(this.token);
    return a.length === b.length && timingSafeEqual(a, b);
  }
  list() {
    this.refresh();
    return [...this.sessions.values()]
      .filter((s) => this.now() - s.lastSeen < 15000)
      .map((session) => {
        const operation = [...this.operations.values()]
          .filter((op) => op.studioId === session.id)
          .at(-1);
        return {
          ...session,
          operation: operation
            ? {
                id: operation.id,
                kind: operation.kind,
                state: operation.state,
                ok: operation.result?.ok ?? null,
                logs: operation.result?.logs ?? [],
                reason: operation.reason ?? null,
                expiresAt: operation.expiresAt,
              }
            : null,
        };
      });
  }
  connect(name: string, metadata: unknown = {}) {
    const id = randomUUID();
    this.sessions.set(id, {
      id,
      name,
      lastSeen: this.now(),
      ...connectionMetadataSchema.parse(metadata),
    });
    this.persist();
    return { id, protocolVersion: 2 as const };
  }
  status(studioId: string, operationId: string) {
    this.refresh();
    let op = this.operations.get(operationId);
    if (!op || op.studioId !== studioId) throw Error("Operation not found");
    if (
      (op.state === "queued" || op.state === "dispatched") &&
      !this.currentProject(op)
    ) {
      op = {
        ...op,
        state: op.state === "queued" ? "cancelled" : "unknown",
        reason:
          "Project or approval changed. Execution is no longer authorized; awaiting any dispatched receipt.",
      };
      this.saveOperation(op);
    }
    return structuredClone(op);
  }
  cancel(studioId: string, operationId: string) {
    const op = this.status(studioId, operationId);
    if (op.state === "cancelled") return op;
    if (op.state !== "queued")
      throw Error("Only an undispatched queued operation can be cancelled");
    this.saveOperation({
      ...op,
      state: "cancelled",
      reason: "Cancelled before dispatch.",
    });
    return this.status(studioId, operationId);
  }
  poll(id: string) {
    const session = this.sessions.get(id);
    if (!session) throw Error("Studio session not found");
    session.lastSeen = this.now();
    this.refresh();
    const op = [...this.operations.values()].find(
      (o) => o.studioId === id && o.state === "queued",
    );
    if (!op) return null;
    const p = this.currentProject(op);
    if (!p) {
      this.saveOperation({
        ...op,
        state: "cancelled",
        reason: "Project changed or approval was withdrawn before dispatch.",
      });
      return null;
    }
    const dispatched: Operation = {
      ...op,
      state: "dispatched",
      dispatchId: randomUUID(),
      dispatchedAt: this.now(),
      outcomeDeadline: this.now() + this.outcomeTimeoutMs,
    };
    this.saveOperation(dispatched);
    return {
      ...dispatched,
      scope: p.scope,
      bundle: p.artifact,
      importedMeshIds: [
        ...new Set(
          retrievedBundles(p).flatMap((b) =>
            b.scene
              .filter((n) => n.className === "MeshPart")
              .map((n) => n.properties.MeshId)
              .filter((id): id is string => typeof id === "string"),
          ),
        ),
      ],
      tests: p.review?.tests ?? [],
    };
  }
  enqueue(projectId: string, studioId: string, kind: "apply" | "test") {
    const session = this.list().find((s) => s.id === studioId);
    if (!session) throw Error("Studio is not connected");
    if (session.protocolVersion !== 2)
      throw Error(
        "Studio plugin protocol is incompatible; update the Forge plugin and reconnect",
      );
    if (!session.capabilities.includes(kind))
      throw Error(`Studio session does not support ${kind}`);
    const p = this.store.get(projectId);
    if (p.assetPipeline?.entries.some((e) => e.component))
      throw Error(
        "This Studio bridge does not yet deliver native components. Use the complete place export; component content must not be silently omitted.",
      );
    if (
      p.jobId ||
      !["ready_to_test", "verified"].includes(p.stage) ||
      !p.artifact ||
      p.approvedRevision !== p.revision ||
      p.checks.some((c) => c.status === "failed")
    )
      throw Error("Build and resolve static checks before applying to Studio");
    if (
      [...this.operations.values()].some(
        (o) => o.studioId === studioId && active.has(o.state),
      )
    )
      throw Error("Studio already has an active or unresolved operation");
    if (kind === "test" && !p.review?.tests.length)
      throw Error("Studio testing requires acceptance tests");
    const op: Operation = {
      expectedTestIds: (p.review?.tests ?? []).map((t) => t.id),
      testsHash: this.testsHash(p.review?.tests ?? []),
      id: randomUUID(),
      studioId,
      projectId,
      revision: p.revision,
      artifactHash: bundleHash(p.artifact),
      kind,
      state: "queued",
      protocolVersion: 2,
      createdAt: this.now(),
      expiresAt: this.now() + this.queueTtlMs,
    };
    this.saveOperation(op);
    return structuredClone(op);
  }
  result(studioId: string, input: unknown) {
    const result = resultSchema.parse(input),
      op = this.operations.get(result.operationId);
    if (!op || op.studioId !== studioId) throw Error("Operation not found");
    if (
      op.revision !== result.revision ||
      op.artifactHash !== result.artifactHash
    )
      throw Error("Studio result revision conflict");
    if (!op.dispatchId || op.dispatchId !== result.dispatchId)
      throw Error("Studio dispatch identity conflict");
    if (op.kind === "test")
      result.ok =
        result.ok &&
        op.expectedTestIds.length > 0 &&
        op.expectedTestIds.every((id) => {
          const checks = result.checks.filter((c) => c.id === id);
          return checks.length === 1 && checks[0].status === "passed";
        });
    if ((op.state === "done" || op.state === "cancelled") && op.result) {
      if (JSON.stringify(op.result) !== JSON.stringify(result))
        throw Error("Conflicting duplicate Studio result");
      return { duplicate: true };
    }
    if (op.state !== "dispatched" && op.state !== "unknown")
      throw Error("Operation was not dispatched");
    if (result.executionStatus === "not_started") {
      this.saveOperation({
        ...op,
        state: "cancelled",
        result,
        reason: "Studio confirmed the dispatched command did not start.",
      });
      return { duplicate: false };
    }
    const p = this.currentProject(op);
    if (!p) {
      this.saveOperation({
        ...op,
        state: "done",
        result,
        reason:
          "Receipt retained; project changed, so evidence was not applied.",
      });
      return { duplicate: false, stale: true };
    }
    if (op.kind === "test") {
      const expected = p.review?.tests ?? [];
      const checks = expected.map((t) => {
        const observations = result.checks.filter((c) => c.id === t.id);
        return observations.length === 1
          ? observations[0]
          : {
              id: t.id,
              status: "pending" as const,
              detail: observations.length
                ? "Studio returned duplicate observations for this acceptance test."
                : "Studio did not return this acceptance test.",
            };
      });
      p.studioEvidence = {
        revision: p.revision,
        artifactHash: op.artifactHash,
        checks,
        logs: result.logs,
        at: new Date(this.now()).toISOString(),
      };
      p.stage = "ready_to_test";
      p.events.push({
        at: new Date(this.now()).toISOString(),
        message: result.ok
          ? "Studio returned test observations. Inspect behavior and visual quality."
          : "Studio testing failed. Repair using the returned diagnostics.",
      });
      this.store.save(p);
    }
    this.saveOperation({ ...op, state: "done", result, reason: undefined });
    return { duplicate: false };
  }
}
