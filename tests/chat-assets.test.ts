import fs from "node:fs";
import { createHash } from "node:crypto";
import { exportBundle } from "../src/generation/export";
import { disableReviewedScripts } from "../src/generation/component-xml";
import { afterEach, expect, it } from "vitest";
import type { Project } from "../src/generation/schema";
import { matchMessageAssets, normalizeNeeds } from "../src/marketplace/normalize-needs";
import { applyProposalPatch, proposalHash } from "../src/generation/proposal";
import { inspectSnapshot } from "../src/marketplace/inspection";
import { pickerFixture, pickerStudio } from "./asset-picking-fixture";
import { pickStatus } from "../src/marketplace/pick-status";
const saved = (): Project => JSON.parse(fs.readFileSync("tests/fixtures/chat-recovery/failed-project.json", "utf8"));
const fixtures: Awaited<ReturnType<typeof pickerFixture>>[] = [];
afterEach(async () => { for (const f of fixtures.splice(0)) await f.close(); });
it("detects the three selected attachments in the saved project without duplicate rows", () => {
  const p = saved(); normalizeNeeds(p);
  expect(p.assetDiscovery!.groups).toHaveLength(3);
  expect(Object.values(p.assetDiscovery!.choices!).map(c => c.assetId)).toEqual(p.proposal!.assetNeeds!.map(n => n.selectedAssetId));
});
it("reviews the saved dummy's actual three source bodies and reports green without a computed-access block", async () => {
  const f = await pickerFixture(); fixtures.push(f);
  const p = saved(); normalizeNeeds(p);
  const cache = JSON.parse(fs.readFileSync("tests/fixtures/chat-recovery/dummy-cache.json", "utf8"));
  const inspection = inspectSnapshot(cache.snapshot);
  expect(inspection.status).not.toBe("blocked");
  expect(inspection.scriptCount).toBe(3);
  const group = p.assetDiscovery!.groups.find(g => g.id === "TargetDummy")!;
  group.options.find(o => o.assetId === "112770048")!.inspection = inspection;
  f.app.locals.engine.store.save(p);
  await f.app.locals.engine.reviewAttachedSources(p, group.id, cache.snapshot, inspection.contentHash);
  expect(pickStatus(p, group)).toMatchObject({ state: "ready", canBuild: true });
  expect(pickStatus(p, group).reason).toContain("3 scripts kept");
  expect(p.assetDiscovery!.choices![group.id].sourceReview?.scripts.map(s => s.name)).toEqual(cache.snapshot.scripts.map((s: {name:string}) => s.name));
});
it("fills a missing need from a later message by type and name", () => {
  const p = saved(); const need = p.proposal!.assetNeeds![2]; delete need.selectedAssetId;
  p.assetAttachments = p.assetAttachments!.filter(a => a.assetId === "16583762");
  expect(matchMessageAssets(p)).toEqual([]);
  expect(need.selectedAssetId).toBe("16583762");
});
it("accepts a later attachment through the actual message API and planner patch", async () => {
  const f = await pickerFixture(); fixtures.push(f);
  const inspection = await fetch(`${f.origin}/api/marketplace/inspect`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ studioId: pickerStudio, reference: f.sound.assetId }) }).then(r => r.json());
  const sent = await f.command("messages", { id: crypto.randomUUID(), text: "Use this for the hit sound", assetAttachments: [{ assetId: f.sound.assetId, contentHash: inspection.asset.inspection.contentHash, usage: "hitSound" }] });
  expect(sent.status).toBe(200);
  const p: Project = await f.app.locals.engine.wait(f.project().id);
  expect(p.error).toBeNull();
  expect(p.proposal?.assetNeeds?.find(n => n.id === "hitSound")?.selectedAssetId).toBe(f.sound.assetId);
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
it("disables only unneeded script sources in the delivered XML and retains the original", () => {
  const xml = exportBundle({ files: [{ path: "ServerScriptService/Forge_fixture/Extra.server.luau", kind: "Script", source: "print('unneeded')" }, { path: "ServerScriptService/Forge_fixture/Respawn.server.luau", kind: "Script", source: "print('respawn')" }], scene: [], assets: [], coverage: [] } as any, "Forge_fixture");
  const original = { destinationPath: "ServerScriptService/Forge_fixture", xml, sha256: createHash("sha256").update(xml).digest("hex") };
  const delivered = disableReviewedScripts(original, ["Extra"]);
  expect(delivered.xml).toContain('<bool name="Disabled">true</bool>');
  expect(delivered.xml).not.toContain("unneeded");
  expect(delivered.xml).toContain("respawn");
  expect(original.xml).toBe(xml);
});
