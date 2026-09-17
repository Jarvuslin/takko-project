import { it, expect, afterEach, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Bridge } from "../src/generation/bridge";
import { GenerationStore, newProject } from "../src/generation/store";
import { bundleHash } from "../src/generation/validation";
import {
  fixtureBundle,
  fixtureReview,
  specification,
} from "./generation-fixtures";
const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0))
    fs.rmSync(d, { recursive: true, force: true });
});
function setup(options: ConstructorParameters<typeof Bridge>[1] = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-bridge-"));
  dirs.push(dir);
  const store = new GenerationStore(dir);
  const p = newProject("Build a farming game", 2e6);
  p.spec = specification(p.request, p.scope);
  p.artifact = fixtureBundle(p.request, p.scope);
  p.review = structuredClone(fixtureReview);
  p.approvedRevision = 1;
  p.stage = "ready_to_test";
  store.save(p);
  const bridge = new Bridge(store, options);
  const session = bridge.connect("Test place", {
    protocolVersion: 2,
    capabilities: ["apply", "test"],
  });
  return { p, store, bridge, session };
}
it("retains pairing, queued work and acknowledged results across backend reconstruction", () => {
  const { p, store, bridge, session } = setup();
  const token = bridge.pairing();
  const operation = bridge.enqueue(p.id, session.id, "test");
  const restarted = new Bridge(store);
  expect(restarted.authorized(token)).toBe(true);
  const dispatched = restarted.poll(session.id)!;
  expect(dispatched.id).toBe(operation.id);
  const result = {
    operationId: operation.id,
    dispatchId: dispatched.dispatchId,
    revision: p.revision,
    artifactHash: operation.artifactHash,
    ok: true,
    checks: [{ id: "coreTest", status: "passed", detail: "Native result" }],
    logs: [],
  };
  restarted.result(session.id, result);
  const again = new Bridge(store);
  expect(again.poll(session.id)).toBeNull();
  expect(again.result(session.id, result)).toEqual({ duplicate: true });
  expect(store.get(p.id).studioEvidence?.checks).toEqual(result.checks);
});
it("dispatches once and accepts its identical receipt only once", () => {
  const { p, bridge, session } = setup();
  const op = bridge.enqueue(p.id, session.id, "apply");
  expect(bridge.list()[0].operation).toMatchObject({
    kind: "apply",
    state: "queued",
    ok: null,
  });
  const dispatched = bridge.poll(session.id)!;
  expect(dispatched.id).toBe(op.id);
  expect(bridge.poll(session.id)).toBeNull();
  const result = {
    operationId: op.id,
    dispatchId: bridge.status(session.id, op.id).dispatchId,
    revision: 1,
    artifactHash: op.artifactHash,
    ok: true,
    checks: [],
    logs: [],
  };
  expect(bridge.result(session.id, result)).toEqual({ duplicate: false });
  expect(bridge.result(session.id, result)).toEqual({ duplicate: true });
  expect(bridge.poll(session.id)).toBeNull();
  expect(bridge.list()[0].operation).toMatchObject({
    kind: "apply",
    state: "done",
    ok: true,
  });
});
it("marks absent acceptance tests pending and does not turn model-written tests into a visual-quality pass", () => {
  const { p, bridge, session, store } = setup();
  const op = bridge.enqueue(p.id, session.id, "test");
  bridge.poll(session.id);
  bridge.result(session.id, {
    operationId: op.id,
    dispatchId: bridge.status(session.id, op.id).dispatchId,
    revision: 1,
    artifactHash: bundleHash(p.artifact!),
    ok: true,
    checks: [{ id: "invented", status: "passed", detail: "unrelated" }],
    logs: [],
  });
  const saved = store.get(p.id);
  expect(saved.studioEvidence!.checks).toEqual([
    {
      id: "coreTest",
      status: "pending",
      detail: "Studio did not return this acceptance test.",
    },
  ]);
  expect(saved.stage).toBe("ready_to_test");
});
it("rejects stale revisions and mismatched artifacts", () => {
  const { p, bridge, session, store } = setup();
  const op = bridge.enqueue(p.id, session.id, "test");
  expect(() =>
    bridge.result(session.id, {
      operationId: op.id,
      dispatchId: p.id,
      revision: 2,
      artifactHash: op.artifactHash,
      ok: true,
      checks: [],
      logs: [],
    }),
  ).toThrow("revision");
  p.revision++;
  store.save(p);
  expect(bridge.poll(session.id)).toBeNull();
});
it("never queues a partial failed generation even before static checks exist", () => {
  const { p, bridge, session, store } = setup();
  p.stage = "failed";
  p.checks = [];
  store.save(p);
  expect(() => bridge.enqueue(p.id, session.id, "apply")).toThrow(
    "Build and resolve",
  );
});
function receipt(bridge: Bridge, sessionId: string, operationId: string) {
  const op = bridge.status(sessionId, operationId);
  return {
    operationId,
    dispatchId: op.dispatchId,
    revision: op.revision,
    artifactHash: op.artifactHash,
    ok: true,
    checks: [{ id: "coreTest", status: "passed", detail: "Observed" }],
    logs: [],
  };
}
it("records dispatch before delivery and never replays after restart, but accepts its late receipt", () => {
  const { p, store, bridge, session } = setup();
  const op = bridge.enqueue(p.id, session.id, "apply");
  const command = bridge.poll(session.id)!;
  const disk = JSON.parse(
    fs.readFileSync(path.join(store.directory, "bridge/state.json"), "utf8"),
  );
  expect(disk.operations[0]).toMatchObject({
    state: "dispatched",
    dispatchId: command.dispatchId,
  });
  const result = receipt(bridge, session.id, op.id);
  const recovered = new Bridge(store);
  expect(recovered.status(session.id, op.id).state).toBe("unknown");
  expect(recovered.poll(session.id)).toBeNull();
  expect(() => recovered.enqueue(p.id, session.id, "test")).toThrow(
    "unresolved",
  );
  expect(() => recovered.cancel(session.id, op.id)).toThrow("undispatched");
  expect(recovered.result(session.id, result)).toEqual({ duplicate: false });
  expect(recovered.enqueue(p.id, session.id, "test").state).toBe("queued");
});
it("expires undelivered commands, while a missing dispatched receipt becomes unknown", () => {
  let now = 1_000;
  const { p, bridge, session } = setup({
    now: () => now,
    queueTtlMs: 100,
    outcomeTimeoutMs: 200,
  });
  const old = bridge.enqueue(p.id, session.id, "apply");
  now += 100;
  expect(bridge.poll(session.id)).toBeNull();
  expect(bridge.status(session.id, old.id).state).toBe("expired");
  const next = bridge.enqueue(p.id, session.id, "apply");
  bridge.poll(session.id);
  now += 200;
  expect(bridge.status(session.id, next.id).state).toBe("unknown");
  expect(bridge.poll(session.id)).toBeNull();
  expect(() => bridge.enqueue(p.id, session.id, "apply")).toThrow("unresolved");
});
it("cancels queued work and refuses cancellation after dispatch", () => {
  const { p, bridge, session } = setup();
  const first = bridge.enqueue(p.id, session.id, "apply");
  expect(bridge.cancel(session.id, first.id).state).toBe("cancelled");
  expect(bridge.poll(session.id)).toBeNull();
  const second = bridge.enqueue(p.id, session.id, "apply");
  bridge.poll(session.id);
  expect(() => bridge.cancel(session.id, second.id)).toThrow("undispatched");
  expect(() => bridge.enqueue(p.id, session.id, "test")).toThrow("active");
});
it("validates session and dispatch identity even after an operation is done", () => {
  const { p, bridge, session } = setup();
  const op = bridge.enqueue(p.id, session.id, "apply");
  bridge.poll(session.id);
  const input = receipt(bridge, session.id, op.id);
  bridge.result(session.id, input);
  expect(() => bridge.result(bridge.connect("Other").id, input)).toThrow(
    "not found",
  );
  expect(() =>
    bridge.result(session.id, { ...input, dispatchId: p.id }),
  ).toThrow("identity");
  expect(() => bridge.result(session.id, { ...input, revision: 2 })).toThrow(
    "revision",
  );
  expect(() =>
    bridge.result(session.id, { ...input, logs: ["changed"] }),
  ).toThrow("Conflicting");
});
it("settles stale receipts without changing current project evidence", () => {
  const { p, store, bridge, session } = setup();
  const op = bridge.enqueue(p.id, session.id, "test");
  bridge.poll(session.id);
  const input = receipt(bridge, session.id, op.id);
  p.revision++;
  p.approvedRevision = p.revision;
  store.save(p);
  expect(bridge.result(session.id, input)).toMatchObject({ stale: true });
  expect(bridge.status(session.id, op.id).state).toBe("done");
  expect(store.get(p.id).studioEvidence).toBeNull();
  expect(bridge.enqueue(p.id, session.id, "test").state).toBe("queued");
});
it("migrates legacy queued commands to unknown while preserving tokens and terminal receipts", () => {
  const { p, store, bridge, session } = setup();
  const op = bridge.enqueue(p.id, session.id, "apply");
  const file = path.join(store.directory, "bridge/state.json");
  fs.writeFileSync(
    file,
    JSON.stringify({
      version: 1,
      token: bridge.pairing(),
      sessions: [{ id: session.id, name: "Legacy", lastSeen: Date.now() }],
      operations: [
        {
          id: op.id,
          studioId: session.id,
          projectId: p.id,
          revision: op.revision,
          artifactHash: op.artifactHash,
          kind: "apply",
          state: "queued",
        },
        {
          id: p.id,
          studioId: session.id,
          projectId: p.id,
          revision: op.revision,
          artifactHash: op.artifactHash,
          kind: "test",
          state: "done",
          result: {
            operationId: p.id,
            revision: op.revision,
            artifactHash: op.artifactHash,
            ok: false,
            checks: [],
            logs: ["Historical receipt"],
          },
        },
      ],
    }),
  );
  const recovered = new Bridge(store);
  expect(recovered.pairing()).toBe(bridge.pairing());
  expect(recovered.poll(session.id)).toBeNull();
  expect(recovered.status(session.id, op.id).state).toBe("unknown");
  expect(recovered.status(session.id, p.id)).toMatchObject({
    state: "done",
    result: { ok: false, logs: ["Historical receipt"] },
  });
  expect(recovered.list()[0].protocolVersion).toBe(1);
});
it("requires compatible capabilities and acceptance tests", () => {
  const { p, store, bridge, session } = setup();
  expect(() => bridge.enqueue(p.id, bridge.connect("Old").id, "apply")).toThrow(
    "incompatible",
  );
  const limited = bridge.connect("Limited", {
    protocolVersion: 2,
    capabilities: ["apply"],
  });
  expect(() => bridge.enqueue(p.id, limited.id, "test")).toThrow(
    "does not support",
  );
  p.review!.tests = [];
  store.save(p);
  expect(() => bridge.enqueue(p.id, session.id, "test")).toThrow(
    "acceptance tests",
  );
});
it.each([
  { checks: [] },
  { checks: [{ id: "coreTest", status: "failed", detail: "Failure" }] },
  {
    checks: [
      { id: "coreTest", status: "passed", detail: "A" },
      { id: "coreTest", status: "passed", detail: "B" },
    ],
  },
])(
  "does not trust success when required test evidence is absent, failed or duplicated (%j)",
  ({ checks }) => {
    const { p, bridge, session } = setup();
    const op = bridge.enqueue(p.id, session.id, "test");
    bridge.poll(session.id);
    const input = { ...receipt(bridge, session.id, op.id), checks };
    bridge.result(session.id, input);
    expect(bridge.list()[0].operation?.ok).toBe(false);
    expect(bridge.result(session.id, input)).toEqual({ duplicate: true });
  },
);
it("does not return or advance a command when persisting dispatch fails", () => {
  const { p, bridge, session } = setup();
  const op = bridge.enqueue(p.id, session.id, "apply");
  const rename = vi.spyOn(fs, "renameSync").mockImplementationOnce(() => {
    throw Error("disk unavailable");
  });
  expect(() => bridge.poll(session.id)).toThrow("disk unavailable");
  rename.mockRestore();
  expect(bridge.status(session.id, op.id).state).toBe("queued");
  expect(bridge.poll(session.id)?.id).toBe(op.id);
});
it.each(["revision", "approval", "job", "tests", "checks"])(
  "withholds execution confirmation if %s changes after dispatch",
  (change) => {
    const { p, store, bridge, session } = setup();
    const op = bridge.enqueue(p.id, session.id, "test");
    bridge.poll(session.id);
    if (change === "revision") p.revision++;
    if (change === "approval") p.approvedRevision = null;
    if (change === "job") p.jobId = p.id;
    if (change === "tests") p.review!.tests[0].source += "\n-- Changed test";
    if (change === "checks")
      p.checks.push({ id: "fail", status: "failed", detail: "Blocked" });
    store.save(p);
    expect(bridge.status(session.id, op.id).state).toBe("unknown");
    expect(bridge.poll(session.id)).toBeNull();
  },
);
it("accepts proof of no execution after recovery without attaching test evidence", () => {
  const { p, store, bridge, session } = setup();
  const op = bridge.enqueue(p.id, session.id, "test");
  bridge.poll(session.id);
  const input = {
    ...receipt(bridge, session.id, op.id),
    ok: false,
    executionStatus: "not_started",
    checks: [],
  };
  const recovered = new Bridge(store);
  expect(recovered.result(session.id, input)).toEqual({ duplicate: false });
  expect(recovered.result(session.id, input)).toEqual({ duplicate: true });
  expect(recovered.status(session.id, op.id).state).toBe("cancelled");
  expect(store.get(p.id).studioEvidence).toBeNull();
  expect(recovered.enqueue(p.id, session.id, "test").state).toBe("queued");
});
it("rejects contradictory no-execution success and receipts before dispatch", () => {
  const { p, bridge, session } = setup();
  const op = bridge.enqueue(p.id, session.id, "apply");
  const input = { ...receipt(bridge, session.id, op.id), dispatchId: p.id };
  expect(() => bridge.result(session.id, input)).toThrow("identity");
  bridge.poll(session.id);
  expect(() =>
    bridge.result(session.id, {
      ...receipt(bridge, session.id, op.id),
      executionStatus: "not_started",
    }),
  ).toThrow("cannot succeed");
});
it("locks server project writes during dispatch and unknown outcomes, then releases only after a receipt", () => {
  let now = 1_000;
  const { p, store, bridge, session } = setup({
    now: () => now,
    outcomeTimeoutMs: 100,
  });
  const op = bridge.enqueue(p.id, session.id, "apply");
  expect(() => bridge.assertProjectWritable(p.id)).not.toThrow();
  bridge.poll(session.id);
  expect(() => bridge.assertProjectWritable(p.id)).toThrow("unresolved");
  expect(() => bridge.assertProjectWritable(session.id)).not.toThrow();
  now += 100;
  expect(() => bridge.assertProjectWritable(p.id)).toThrow("unresolved");
  const recovered = new Bridge(store, { now: () => now });
  expect(() => recovered.assertProjectWritable(p.id)).toThrow("unresolved");
  recovered.result(session.id, {
    ...receipt(recovered, session.id, op.id),
    ok: false,
    executionStatus: "not_started",
    checks: [],
  });
  expect(() => recovered.assertProjectWritable(p.id)).not.toThrow();
  const next = recovered.enqueue(p.id, session.id, "apply");
  recovered.poll(session.id);
  recovered.result(session.id, receipt(recovered, session.id, next.id));
  expect(() => recovered.assertProjectWritable(p.id)).not.toThrow();
});
