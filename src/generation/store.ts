import { recordConversation } from "./conversation";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Project } from "./schema";
import { RequestError, StoredDataError } from "../errors";
import { initialWorld } from "./world-policy";

/** Keep the last published artifact visible while preserving resumable candidate work. */
export function retainFailedImplementation(p: Project) {
  const backup = p.implementationBackup;
  if (!backup) return;
  if (p.proposalPlan?.hash === p.proposal!.hash)
    p.implementationCandidate = {
      hash: p.proposal!.hash,
      artifact: p.artifact!,
      completedBuildTasks: p.completedBuildTasks ?? [],
      spec: p.spec!,
      plan: p.proposalPlan,
      scopedPaths: backup.scopedPaths,
    };
  p.artifact = backup.artifact;
  p.completedBuildTasks = backup.completedBuildTasks;
  p.review = backup.review;
  p.checks = backup.checks;
  p.spec = backup.spec;
  p.proposalPlan = backup.plan;
  p.proposal!.changed = backup.changed;
  p.staleImplementation = true;
  p.approvedRevision = null;
  delete p.implementationBackup;
}

// Validate the envelope used by listing/recovery without stripping newer fields.
const storedProject = z
  .object({
    schemaVersion: z.literal(2),
    id: z.uuid(),
    name: z.string(),
    request: z.string(),
    createdAt: z.string(),
    stage: z.string(),
    jobId: z.string().nullable(),
    reservedMicros: z.number().int().nonnegative(),
    generation: z
      .object({
        id: z.uuid(),
        budgetMicros: z.number().int().min(1000).max(100_000_000),
        chargeStart: z.number().int().nonnegative(),
        briefHash: z
          .string()
          .regex(/^[a-f0-9]{64}$/)
          .optional(),
      })
      .optional(),
    charges: z.array(z.unknown()),
    events: z.array(z.unknown()),
    assetPipeline: z.object({ status: z.string() }).passthrough().nullish(),
  })
  .passthrough();
export function newProject(request: string, budgetMicros: number): Project {
  request = z.string().trim().min(5).max(12000).parse(request);
  const id = randomUUID();
  return {
    schemaVersion: 2,
    world: initialWorld(),
    id,
    name: request.slice(0, 64),
    request,
    revision: 1,
    scope: "Forge_" + id.replaceAll("-", "").slice(0, 12),
    spec: null,
    answers: {},
    approvedRevision: null,
    stage: "draft",
    artifact: null,
    review: null,
    checks: [],
    charges: [],
    budgetMicros,
    reservedMicros: 0,
    events: [],
    jobId: null,
    error: null,
    createdAt: new Date().toISOString(),
    studioEvidence: null,
  };
}
export class GenerationStore {
  private unreadable = new Set<string>();
  checkpoint(p: Project) {
    const folder = path.join(this.directory, "history");
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(
      path.join(folder, z.uuid().parse(p.id) + "-" + randomUUID() + ".json"),
      JSON.stringify(p, null, 2),
    );
  }
  trace(id: string, event: unknown) {
    const folder = path.join(this.directory, "traces");
    fs.mkdirSync(folder, { recursive: true });
    fs.appendFileSync(
      path.join(folder, z.uuid().parse(id) + ".events.jsonl"),
      JSON.stringify(event) + "\n",
    );
    fs.writeFileSync(
      path.join(folder, z.uuid().parse(id) + ".json"),
      JSON.stringify(event, null, 2),
    );
  }
  constructor(readonly directory: string) {
    fs.mkdirSync(directory, { recursive: true });
  }
  private file(id: string) {
    return path.join(this.directory, z.uuid().parse(id) + ".json");
  }
  save(p: Project) {
    const file = this.file(p.id);
    const previous = fs.existsSync(file)
      ? (JSON.parse(fs.readFileSync(file, "utf8")) as Project)
      : undefined;
    recordConversation(p, previous);
    fs.writeFileSync(file + ".tmp", JSON.stringify(p, null, 2));
    fs.renameSync(file + ".tmp", file);
    return p;
  }
  get(id: string): Project {
    const file = this.file(id);
    let p: any;
    try {
      p = JSON.parse(fs.readFileSync(file, "utf8"));
      if (p?.schemaVersion === 2) {
        storedProject.parse(p);
        if (p.id !== id) throw Error("Project identity mismatch");
        return p;
      }
      if (
        !p ||
        typeof p !== "object" ||
        Array.isArray(p) ||
        (p.schemaVersion !== undefined && p.schemaVersion !== 1) ||
        typeof p.request !== "string"
      )
        throw Error("Invalid legacy project");
      z.string().trim().min(5).max(12000).parse(p.request);
    } catch (cause) {
      if ((cause as NodeJS.ErrnoException).code === "ENOENT")
        throw new RequestError("Project not found", 404);
      throw new StoredDataError("project", { cause });
    }
    // Preserve the rejected template project intact before migrating its request.
    if (!fs.existsSync(file + ".legacy"))
      fs.copyFileSync(file, file + ".legacy");
    const next = newProject(String(p.request ?? ""), 2_000_000);
    next.id = id;
    next.legacyImport = true;
    next.events.push({
      at: new Date().toISOString(),
      message:
        "Imported the original request. The old template artifact is retained in a legacy backup.",
    });
    return this.save(next);
  }
  list() {
    return fs
      .readdirSync(this.directory)
      .filter(
        (f) =>
          f.endsWith(".json") && z.uuid().safeParse(f.slice(0, -5)).success,
      )
      .flatMap((f) => {
        try {
          const p = this.get(f.slice(0, -5));
          this.unreadable.delete(f);
          return [p];
        } catch (error) {
          if (
            !(error instanceof StoredDataError) &&
            !(error instanceof RequestError && error.status === 404)
          )
            throw error;
          if (!this.unreadable.has(f)) {
            console.warn(
              `Skipped unreadable project ${f}. Original file preserved.`,
            );
            this.unreadable.add(f);
          }
          return [];
        }
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  recover() {
    for (const p of this.list())
      if (p.jobId) {
        retainFailedImplementation(p);
        for (const run of p.opencodeRuns ?? []) {
          if (run.status !== "running") continue;
          run.status = "interrupted";
          run.finishedAt = new Date().toISOString();
          run.error =
            "Host restarted. Validated checkpoints and conservative billing are retained.";
        }
        for (const worker of p.coordination?.workers ?? []) {
          if (worker.status === "running") {
            worker.status = "interrupted";
            worker.finishedAt = new Date().toISOString();
            worker.error =
              "Server restarted. Resume from the last validated checkpoint.";
          }
        }
        if (p.assetPipeline?.status === "running") {
          p.assetPipeline.status = "interrupted";
          p.assetPipeline.requiresReconciliation = true;
          p.assetPipeline.error =
            "Server restarted during asset execution. Retained receipts are diagnostic; uncertain tool effects require reconciliation before retry.";
          p.assetPipeline.finishedAt = new Date().toISOString();
        }
        for (const request of p.opencodePending ?? []) {
          p.charges.push({
            requestId: request.requestId,
            opencodeRunId: request.runId,
            phase: request.phase,
            profileId: request.profileId,
            model: request.model,
            reservedMicros: request.reservedMicros,
            chargedMicros: request.reservedMicros,
            billingSource: "reservation",
            estimated: true,
            inputTokens: null,
            outputTokens: null,
            status: "error",
            at: request.at,
          });
          p.reservedMicros = Math.max(
            0,
            p.reservedMicros - request.reservedMicros,
          );
        }
        if (p.opencodePending) p.opencodePending = [];
        if (p.reservedMicros)
          p.charges.push({
            phase: "repair",
            profileId: "interrupted",
            model: "unknown",
            reservedMicros: p.reservedMicros,
            chargedMicros: p.reservedMicros,
            estimated: true,
            inputTokens: null,
            outputTokens: null,
            status: "error",
            at: new Date().toISOString(),
          });
        p.reservedMicros = 0;
        p.jobId = null;
        p.stage = "interrupted";
        p.error =
          "The server restarted during generation. Any unresolved reservation remains charged conservatively.";
        this.save(p);
      }
  }
}
