import fs from "node:fs";
import { afterEach, expect, it, vi } from "vitest";
import { pickerFixture } from "./asset-picking-fixture";
import { GenerationStore } from "../src/generation/store";
import { pickStatus } from "../src/marketplace/pick-status";
import type { Project } from "../src/generation/schema";
import path from "node:path";
import liveDiscovery from "./fixtures/asset-picking/live-searched-discovery.json";
it("recovers the real live saved listing after the old search removed it from the result page", async () => {
  f = await pickerFixture();
  fs.copyFileSync(
    "tests/fixtures/asset-picking/saved-spiderman-library.json",
    path.join(f.app.locals.assetLibrary.directory, "108353927891814.json"),
  );
  const p = f.project();
  delete p.proposal!.assetStateVersion;
  p.assetDiscovery = structuredClone(
    liveDiscovery,
  ) as Project["assetDiscovery"];
  const before = structuredClone(p.assetDiscovery!.choices);
  expect(
    p.assetDiscovery!.groups[0].options.some(
      (o) => o.assetId === before!.targetDummy.assetId,
    ),
  ).toBe(false);
  f.app.locals.engine.store.save(p);
  const result = await f.command("asset-picks");
  expect(result.status).toBe(200);
  const saved = f.project();
  expect(saved.assetDiscovery!.choices).toEqual(before);
  expect(pickStatus(saved, saved.assetDiscovery!.groups[0]).state).toBe(
    "checking",
  );
  expect(f.state.inspections).toEqual([]);
  expect(f.state.calls).toBe(0);
});
const recorded = JSON.parse(
  fs.readFileSync(
    "docs/results/scope-answer-reuse-20260929/live-after.json",
    "utf8",
  ),
) as Project;
const earlier = JSON.parse(
  fs.readFileSync(
    "docs/results/question-modal-20260928/live-project-before.json",
    "utf8",
  ),
) as Project;
let f: Awaited<ReturnType<typeof pickerFixture>>;
afterEach(async () => {
  await f?.close();
});
it("replaces c8550a5b's saved Spider-Man without resurrecting it after search, reload or revision", async () => {
  f = await pickerFixture();
  const p = f.project();
  delete p.proposal!.assetStateVersion;
  p.assetDiscovery = structuredClone(recorded.assetDiscovery);
  p.answers = structuredClone(recorded.answers);
  p.answerQuestions = structuredClone(recorded.answerQuestions);
  f.app.locals.engine.store.save(p);
  const g = p.assetDiscovery!.groups.find((g) => g.id === "targetDummy")!;
  expect(p.assetDiscovery!.choices!.targetDummy.assetId).toBe(
    "108353927891814",
  );
  expect(pickStatus(p, g).state).toBe("warning");
  const original = earlier.assetDiscovery!.groups.find(
    (g) => g.id === "targetDummy",
  )!;
  expect(original.relevance?.candidateId).toBe("92960550414449");
  expect(
    original.relevance?.assessments?.find(
      (a) => a.candidateId === "108353927891814",
    ),
  ).toMatchObject({ state: "irrelevant", confidence: 0.93 });
  await f.search();
  expect((await f.choose()).status).toBe(200);
  const reloaded = new GenerationStore(f.directory).get(p.id);
  expect(reloaded.assetDiscovery?.choices?.targetDummy.assetId).toBe(
    f.dummies[1].assetId,
  );
  expect(reloaded.assetDiscovery?.choices?.hitSound).toEqual(
    recorded.assetDiscovery?.choices?.hitSound,
  );
  expect(reloaded.answers).toEqual(recorded.answers);
  const next = f.app.locals.engine.revise(
    p.id,
    reloaded.revision,
    reloaded.request,
    reloaded.answers,
  );
  expect(next.assetDiscovery?.choices?.targetDummy.assetId).toBe(
    f.dummies[1].assetId,
  );
  await f.search("targetDummy", "another dummy");
  expect(f.project().assetDiscovery?.choices?.targetDummy.assetId).toBe(
    f.dummies[1].assetId,
  );
  expect(f.state.calls).toBe(0);
});
it("persists the replacement even when attachment reconciliation fails", async () => {
  f = await pickerFixture();
  await f.search();
  await f.choose(f.dummies[0].assetId);
  vi.spyOn(f.app.locals.assetLibrary, "attachments").mockImplementation(() => {
    throw Error("Recorded inspection is unavailable");
  });
  const result = await f.choose(f.dummies[1].assetId);
  expect(result.status).toBe(200);
  const p = new GenerationStore(f.directory).get(f.project().id);
  expect(p.assetDiscovery?.choices?.targetDummy.assetId).toBe(
    f.dummies[1].assetId,
  );
  expect(p.assetDiscovery?.choices?.targetDummy.error).toMatch(
    /pick was saved.*Choose this asset again/,
  );
  expect(pickStatus(p, p.assetDiscovery!.groups[0]).canBuild).toBe(false);
});
