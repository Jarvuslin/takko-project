import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { createApp } from "../src/server/app";
import { profile } from "./generation-fixtures";
import type { Project } from "../src/generation/schema";
import { proposalQuestions } from "../src/generation/proposal-questions";
const read = (file: string) =>
  JSON.parse(fs.readFileSync(file, "utf8")) as Project;
const stopped = () =>
  read("docs/results/approval-stall-20260928/project-stopped.json");
const dirs: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const d of dirs.splice(0))
    fs.rmSync(d, { recursive: true, force: true });
});
function dir() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "takko-approval-stall-"));
  dirs.push(d);
  return d;
}
it("does not automatically reassess an unresolved recommendation on repeat requests or reload", async () => {
  const directory = dir();
  const noNative = async () => {
    throw Error("Offline provider has no native evidence");
  };
  const app = createApp(directory, {
    env: {},
    transport: async () => {
      throw Error("No inference authorized");
    },
    marketplaceProvider: {
      studios: async () => [],
      search: async () => [],
      metadata: noNative,
      snapshot: noNative,
    },
  });
  const engine = app.locals.engine,
    p = stopped();
  engine.store.save(p);
  const assess = vi.spyOn(engine, "assessAssetChoices");
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((r) => server.once("listening", r));
  try {
    const url = `http://127.0.0.1:${(server.address() as any).port}/api/projects/${p.id}/asset-options`;
    const body = { revision: p.revision, studioId: p.assetDiscovery!.studioId };
    const post = () =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    const first = await post();
    expect(first.status).toBe(200);
    const result = await first.json();
    const second = await post();
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual(result);
    expect(assess).toHaveBeenCalledTimes(1);
    expect(engine.store.get(p.id).charges).toEqual(p.charges);
    // A new app instance reads the producing route's saved marker, not a fabricated cache entry.
    const reloaded = createApp(directory, {
      env: {},
      transport: async () => {
        throw Error("No inference authorized");
      },
    });
    expect(
      reloaded.locals.engine.store.get(p.id).assetDiscovery
        .recommendationRevision,
    ).toBe(p.revision);
  } finally {
    await new Promise<void>((r) => server.close(() => r()));
  }
});
it("rejects the real accepted combo patch when its output commits three steps but keeps a single animation slot", async () => {
  const prior = read(
      "docs/results/question-modal-20260928/live-project-before.json",
    ),
    after = stopped();
  let calls = 0;
  const app = createApp(dir(), {
    env: {},
    executionPolicy: { maxAttempts: 1, allowFallbacks: false },
    transport: async (_u, init) => {
      calls++;
      const body = JSON.parse(String(init?.body)),
        c = JSON.parse(body.messages[1].content);
      return Response.json({
        choices: [
          {
            finish_reason: "stop",
            message: {
              content: JSON.stringify({
                baseRevision: c.edit.baseRevision,
                baseHash: c.edit.baseHash,
                changes: [
                  { id: "mechanics", value: after.proposal!.mechanics },
                ],
                summary: after.proposal!.summary,
              }),
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 200 },
      });
    },
  });
  const model = profile();
  app.locals.config.save({
    profiles: [model],
    routes: {
      planner: [model.id],
      builder: [model.id],
      reviewer: [model.id],
      repair: [],
    },
    budgetMicros: 8000000,
    generationBudgetMicros: 8000000,
    repairLimit: 0,
  });
  const engine = app.locals.engine;
  engine.store.save(prior);
  expect(proposalQuestions(prior).map((q) => q.id)).toEqual(
    Object.keys(after.answers),
  );
  engine.revise(prior.id, prior.revision, prior.request, after.answers);
  const result = await engine.wait(prior.id);
  expect(calls).toBe(1);
  expect(result.error).toMatch(/individually selectable|Animation/);
  expect(result.proposal).toEqual(prior.proposal);
  expect(result.answers).toEqual(prior.answers);
  expect(result.charges.slice(0, prior.charges.length)).toEqual(prior.charges);
});
