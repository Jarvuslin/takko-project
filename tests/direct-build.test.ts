import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, expect, it } from "vitest";
import { directBuildSpec, noCodeSpendingGuard } from "../src/generation/direct-build";
import { specSchema, type Project } from "../src/generation/schema";
import { buildAssetNeeds } from "../src/marketplace/approved-adapter";
import { approvedAssetLinks } from "../src/marketplace/asset-binding";
import { GenerationStore } from "../src/generation/store";
import { bindProposalPlan } from "../src/generation/proposal";
import { chatJourneyFixture } from "./chat-journey-fixture";
import { pickStatus } from "../src/marketplace/pick-status";

const dirs: string[] = [];
afterEach(() => dirs.splice(0).forEach(d => fs.rmSync(d, { recursive: true, force: true })));
const saved = (id: string): Project => JSON.parse(fs.readFileSync(`tests/fixtures/direct-build/${id}.json`, "utf8"));

for (const id of ["6e6ffc7f", "07a88f8e"]) it(`replays approval eligibility and the direct engine boundary for failed ${id}`, async () => {
  const f = await chatJourneyFixture(true);
  try {
    const engine = f.app.locals.engine;
    const wire: any[] = [];
    const transport = engine.transport;
    engine.transport = async (url: any, init: any) => {
      const body = JSON.parse(String(init.body));
      if (body.messages?.[0]?.content?.includes("PHASE: reviewer")) wire.push(body);
      return transport(url, init);
    };
    const raw = saved(id);
    engine.store.save(raw);
    const migrated: Project = engine.store.get(raw.id);
    const picks = structuredClone(migrated.proposal!.assetNeeds!.map(n => n.pick));
    const response = await fetch(`${f.origin}/api/projects/${raw.id}/approve-proposal`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revision: migrated.revision, hash: migrated.proposal!.hash }),
    });
    const body = await response.json();
    if (id === "07a88f8e") {
      // This historical selection predates source review and contained-sound
      // selection. The public API must not pretend those checks happened.
      expect(response.status).toBe(409);
      expect(body.error).toMatch(/Choose or skip/);
      const statuses = migrated.assetDiscovery!.groups.map(g => pickStatus(migrated, g));
      expect(statuses.filter(s => !s.canBuild).map(s => s.reason)).toEqual([
        expect.stringMatching(/actual script sources/), expect.stringMatching(/actual script sources/),
      ]);
      expect(f.control.buildCalls).toBe(0);
      // Separately replay the engine's already-approved boundary, with the
      // original picks unchanged and native/model effects doubled. This is
      // not evidence that the historical project is currently UI-buildable.
      migrated.proposal!.approval = { hash: migrated.proposal!.hash, revision: migrated.revision, at: new Date().toISOString() };
      engine.store.save(migrated);
      engine.start(raw.id, migrated.revision, "proposal-build");
    } else expect(response.status, JSON.stringify(body)).toBe(202);
    const result: Project = await engine.wait(raw.id);
    expect(result.artifact?.files.length, result.error ?? "").toBeGreaterThan(0);
    expect(f.control.buildCalls).toBe(1);
    expect(result.coordination).toBeUndefined();
    const finalReview = wire.filter(body => {
      const content = body.messages[1].content;
      return typeof content === "string" && JSON.parse(content).artifact;
    });
    expect(finalReview).toHaveLength(1);
    expect(finalReview[0]).toMatchObject({ max_tokens: 32768, reasoning: { effort: "medium" } });
    expect(result.protectedReview).toMatchObject({ status: "consumed", policy: { maxOutputTokens: 32768, reasoningEffort: "medium" } });
    expect(result.proposal!.assetNeeds!.map(n => n.pick)).toEqual(picks);
    expect(result.charges.slice(0, raw.charges.length)).toEqual(raw.charges);
    expect(f.control.contexts.some(c => c.coordination?.step)).toBe(false);
  } finally { await f.close(); }
});

for (const id of ["6e6ffc7f", "07a88f8e"]) it(`builds a valid contract from the actual failed ${id} input without re-planning or rebinding picks`, () => {
  const raw = saved(id);
  expect(raw.artifact).toBeNull();
  expect(raw.error).toMatch(id === "6e6ffc7f" ? /<=40/ : /Multiple approved groups/);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-direct-real-")); dirs.push(dir);
  const store = new GenerationStore(dir); store.save(raw);
  const p = store.get(raw.id); // Consume the actual saved-project migration producer.
  // Migration may require renewed approval. This isolated test approves its migrated document.
  p.proposal!.approval = { hash: p.proposal!.hash, revision: p.revision, at: "2026-09-30T00:00:00Z" };
  const previous = structuredClone(p.charges);
  p.spec = directBuildSpec(p);
  bindProposalPlan(p);
  expect(p.spec.tasks).toHaveLength(1);
  expect(p.spec.requirements.length).toBeLessThanOrEqual(40);
  expect(p.spec.tasks[0].files).toEqual([]);
  expect(p.spec.assetNeeds?.map(n => n.id)).toEqual(p.proposal!.assetNeeds!.filter(n => !n.pick?.skip).map(n => n.id));
  const links = approvedAssetLinks(p);
  expect(links.map(l => l.option.assetId)).toEqual(id === "07a88f8e" ? ["112770048", "15008746676", "16583762"] : p.proposal!.assetNeeds!.flatMap(n => n.pick?.assetId ?? []));
  const needs = buildAssetNeeds(p);
  for (const link of links) expect(needs.find(n => n.id === link.need.id)?.requirementId).toBe(link.need.requirementId);
  expect(p.charges).toEqual(previous);
});

it("reproduces the recorded merged requirement overflow from the actual final worker output", () => {
  const p = saved("6e6ffc7f");
  const raw = fs.readFileSync("tests/fixtures/direct-build/final-worker-response.txt", "utf8").trim().replace(/^```json\s*|\s*```$/g, "");
  const response = JSON.parse(raw);
  const { areas: _, sharedContracts: __, ...head } = p.coordination!.outline!;
  const parts = [...Object.values(p.coordination!.areas), response];
  const merged = { ...head, requirements: parts.flatMap(x => x.requirements), tasks: parts.flatMap(x => x.tasks), assetNeeds: parts.flatMap(x => x.assetNeeds ?? []) };
  expect(merged.requirements.length).toBeGreaterThan(40);
  expect(() => specSchema.parse(merged)).toThrow(/<=40/);
});

it("stops another request after the no-code threshold, preserves cumulative spend and permits explicit continuation", () => {
  const p = saved("6e6ffc7f"), previous = structuredClone(p.charges);
  const check = noCodeSpendingGuard(p);
  expect(check).not.toThrow(); // Earlier failed planning is retained, not charged to this session twice.
  p.charges.push({ ...p.charges[0], phase: "builder", chargedMicros: 500000 });
  expect(check).toThrow(/no-code spending threshold/);
  expect(p.charges.slice(0, previous.length)).toEqual(previous);
  expect(noCodeSpendingGuard(p)).not.toThrow(); // Explicit new session, same project ledger.
  p.artifact = { files: [{ path: `ServerScriptService/${p.scope}/Game.server.luau`, kind: "Script", source: "return 1" }], scene: [], coverage: [], assets: [] };
  expect(check).not.toThrow();
});
