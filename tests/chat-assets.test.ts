import fs from "node:fs";
import { afterEach, expect, it } from "vitest";
import type { Project } from "../src/generation/schema";
import { matchMessageAssets, normalizeNeeds } from "../src/marketplace/normalize-needs";
import { applyProposalPatch, proposalHash } from "../src/generation/proposal";
import { inspectSnapshot } from "../src/marketplace/inspection";
import { pickerFixture } from "./asset-picking-fixture";
import { pickStatus } from "../src/marketplace/pick-status";
const saved = (): Project => JSON.parse(fs.readFileSync("tests/fixtures/chat-recovery/failed-project.json", "utf8"));
const fixtures: Awaited<ReturnType<typeof pickerFixture>>[] = [];
afterEach(async () => { for (const f of fixtures.splice(0)) await f.close(); });
it("detects the three selected attachments in the saved project without duplicate rows", () => {
  const p = saved(); normalizeNeeds(p);
  expect(p.assetDiscovery!.groups).toHaveLength(3);
  expect(Object.values(p.assetDiscovery!.choices!).map(c => c.assetId)).toEqual(p.proposal!.assetNeeds!.map(n => n.selectedAssetId));
});
it("fills a missing need from a later message by type and name", () => {
  const p = saved(); const need = p.proposal!.assetNeeds![2]; delete need.selectedAssetId;
  p.assetAttachments = p.assetAttachments!.filter(a => a.assetId === "16583762");
  expect(matchMessageAssets(p)).toEqual([]);
  expect(need.selectedAssetId).toBe("16583762");
});
it("applies a straw dummy planner change and clears the old pick while preserving other needs", () => {
  const p = saved(); normalizeNeeds(p); p.proposal!.hash = proposalHash(p);
  const needs = structuredClone(p.proposal!.assetNeeds!);
  needs[0] = { ...needs[0], query: "straw dummy", constraints: "Use a stationary straw training dummy." }; delete needs[0].selectedAssetId;
  applyProposalPatch(p, { baseRevision: p.revision, baseHash: p.proposal!.hash, changes: [{ id: "mechanics", value: { ...p.proposal!.mechanics, text: "Use a straw dummy instead. " + p.proposal!.mechanics.text } }], assetNeeds: needs, summary: "Changed the target to a straw dummy. Attach one or choose for me." }, ["mechanics"]);
  normalizeNeeds(p);
  expect(p.proposal!.assetNeeds![0].selectedAssetId).toBeUndefined();
  expect(p.assetDiscovery!.choices!.TargetDummy?.assetId).toBeUndefined();
  expect(p.proposal!.assetNeeds![1].selectedAssetId).toBe("15008746676");
});
it("automatically reviews ordinary sources through mocked decisions, accounts cost, and removes a pick durably", async () => {
  const f = await pickerFixture(); fixtures.push(f); f.state.scripts = 1;
  await f.search(); const p = (await f.choose()).data;
  expect(pickStatus(p, p.assetDiscovery.groups[0]).state).toBe("ready");
  expect(p.assetDiscovery.choices.targetDummy.sourceReview.scripts[0].action).toBe("keep");
  expect(p.charges).toHaveLength(1);
  expect((await f.command("asset-picks/remove", { groupId: "targetDummy" })).status).toBe(200);
  expect(f.project().assetDiscovery!.choices!.targetDummy).toBeUndefined();
  expect(f.project().assetAttachments?.some(a => a.assetId === f.dummies[1].assetId)).toBe(false);
});
it.each(["require(12345)", "require(id + 5)", "loadstring(code)()", "HttpService:GetAsync(url)", "TeleportService:Teleport(123)"])("blocks actual dangerous source: %s", source => {
  expect(inspectSnapshot({ complete: true, issues: [], nodes: [{name:"Script",className:"Script"}], scripts: [{name:"Script",source}] }).status).toBe("blocked");
});
it("does not block ordinary indexed properties", () => {
  expect(inspectSnapshot({ complete: true, issues: [], nodes: [{name:"Respawn",className:"Script"}], scripts: [{name:"Respawn",source:'local health = script.Parent["Humanoid"].Health'}] }).status).toBe("no_issues_found");
});
