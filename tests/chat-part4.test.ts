import { afterEach, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { GenerationStore, newProject } from "../src/generation/store";
import { queueReceipt } from "../src/generation/message-queue";
import { Engine } from "../src/generation/engine";
import { Configuration } from "../src/generation/settings";
import { specification, fixtureBundle } from "./generation-fixtures";
import { stepRetry } from "../src/generation/retry";
import { chatState } from "../src/web/chat-state";
const dirs: string[] = [];
afterEach(() =>
  dirs.splice(0).forEach((d) => fs.rmSync(d, { recursive: true, force: true })),
);
function fixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "takko-queue-"));
  dirs.push(directory);
  const store = new GenerationStore(directory);
  const p = newProject("A wind gliding game", 1000000);
  p.jobId = randomUUID();
  p.stage = "generating";
  store.save(p);
  const engine = new Engine(
    store,
    new Configuration(path.join(directory, "config")),
  );
  store.save(p);
  return { store, p, engine };
}
it("worker checkpoints cannot lose a queue submission or its conversation receipt", () => {
  const { store, p } = fixture();
  const incoming = store.get(p.id);
  const id = randomUUID();
  queueReceipt(incoming, {
    id,
    hash: "hash",
    text: "Make it louder",
    revision: p.revision,
    jobId: p.jobId!,
    status: "queued",
    at: new Date().toISOString(),
  });
  store.save(incoming);
  p.artifact = fixtureBundle(p.request, p.scope);
  p.completedBuildTasks = ["coreTask"];
  store.save(p);
  const loaded = store.get(p.id);
  expect(loaded.queuedMessages?.map((q) => q.id)).toEqual([id]);
  expect(loaded.conversation?.filter((t) => t.id === id)).toHaveLength(1);
  expect(loaded.artifact).toEqual(p.artifact);
});
it("restart holds queued work, preserves checkpoints and never dispatches", () => {
  const { store, p } = fixture();
  queueReceipt(p, {
    id: randomUUID(),
    hash: "hash",
    text: "Not that one",
    revision: p.revision,
    jobId: p.jobId!,
    status: "queued",
    at: new Date().toISOString(),
  });
  p.artifact = fixtureBundle(p.request, p.scope);
  store.save(p);
  new GenerationStore(store.directory).recover();
  const loaded = store.get(p.id);
  expect(loaded.queuedMessages![0].status).toBe("held");
  expect(loaded.jobId).toBeNull();
  expect(loaded.artifact).toEqual(p.artifact);
  expect(
    loaded.conversation!.find((t) => t.id === loaded.queuedMessages![0].id)
      ?.status,
  ).toBe("held");
});
it("changed context holds a queue instead of applying it to the wrong revision", async () => {
  const { store, p, engine } = fixture();
  queueReceipt(p, {
    id: randomUUID(),
    hash: "hash",
    text: "Not that one",
    revision: p.revision,
    jobId: p.jobId!,
    status: "held",
    at: new Date().toISOString(),
  });
  p.jobId = null;
  p.revision++;
  store.save(p);
  const loaded = await engine.applyQueuedChanges(p.id);
  expect(loaded.queuedMessages![0].status).toBe("held");
  expect(loaded.queuedMessages![0].reason).toContain("context changed");
  expect(loaded.charges).toHaveLength(0);
});
it("non-planning retry retains completed tasks and refuses stale approvals", () => {
  const { p } = fixture();
  p.jobId = null;
  p.stage = "failed";
  p.spec = specification(p.request, p.scope);
  p.artifact = fixtureBundle(p.request, p.scope);
  p.approvedRevision = p.revision;
  p.charges = [
    {
      phase: "builder",
      profileId: "fixture",
      model: "fixture",
      reservedMicros: 200,
      chargedMicros: 100,
      estimated: true,
      inputTokens: 10,
      outputTokens: 10,
      status: "error",
      at: new Date().toISOString(),
    },
  ];
  expect(stepRetry(p)).toMatchObject({
    kind: "repair",
    estimatedMicros: 100,
    completed: 0,
  });
  p.revision++;
  expect(stepRetry(p)).toBeUndefined();
});
it("status has one authoritative value for each chat state", () => {
  const { p } = fixture();
  expect(chatState(p)).toBe("Building");
  p.stage = "planning";
  expect(chatState(p)).toBe("Working");
  p.jobId = null;
  p.stage = "draft";
  expect(chatState(p)).toBe("Ready");
  p.stage = "review";
  expect(chatState(p)).toBe("Needs you");
  p.stage = "needs_input";
  expect(chatState(p)).toBe("Needs you");
  p.stage = "ready_to_test";
  expect(chatState(p)).toBe("Ready to test");
  p.stage = "failed";
  expect(chatState(p)).toBe("Failed");
  p.stage = "interrupted";
  expect(chatState(p)).toBe("Stopped");
});
it("removing a queued message survives a stale worker save", () => {
  const { store, p, engine } = fixture();
  const queued = engine.submitChange(p.id, p.revision, randomUUID(), {
    text: "Make it louder",
  });
  const worker = store.get(p.id);
  engine.cancelQueuedMessage(p.id, p.revision, queued.queuedMessages![0].id);
  worker.events.push({
    at: new Date().toISOString(),
    message: "Saved current task",
  });
  store.save(worker);
  expect(store.get(p.id).queuedMessages![0].status).toBe("cancelled");
});
