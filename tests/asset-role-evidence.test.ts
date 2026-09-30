import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, expect, it } from "vitest";
import saved from "../docs/results/direct-build-acceptance/terminal-project.json";
import straw from "./fixtures/asset-roles/10161087974.json";
import animation from "./fixtures/asset-roles/15008746676.json";
import infinity from "./fixtures/asset-roles/15008746676-infinity.json";
import oldDummy from "./fixtures/asset-roles/112770048.json";
import type { Project } from "../src/generation/schema";
import { AssetLibrary, revisionKey } from "../src/marketplace/library";
import { metadataSchema, snapshotSchema } from "../src/marketplace/types";
import { animationPackSchema } from "../src/marketplace/animations";
import { projectProposalPicks } from "../src/marketplace/proposal-picks";
import { assetRoleEvidence } from "../src/marketplace/role-evidence";
import { pickStatus, missingPicks } from "../src/marketplace/pick-status";
import { refreshProposal } from "../src/generation/proposal";
import { snapshotHash } from "../src/marketplace/inspection";
import { gameContext } from "../src/generation/game-context";

const directories: string[] = [];
afterEach(() => { for (const dir of directories.splice(0)) fs.rmSync(dir, { recursive: true, force: true }); });
async function capturedProject() {
  const p = structuredClone(saved) as unknown as Project;
  projectProposalPicks(p);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "takko-native-role-"));
  directories.push(directory);
  const fixtures = [straw, animation];
  const library = new AssetLibrary(directory, {
    studios: async () => [{ id: straw.studioId, name: "Recorded native producer" }], search: async () => [],
    metadata: async (_studio, id) => metadataSchema.strip().parse(p.assetDiscovery!.groups.flatMap(g => g.options).find(o => o.assetId === id)),
    snapshot: async (_studio, m) => snapshotSchema.parse(fixtures.find(f => f.assetId === m.assetId)!.snapshot),
  });
  for (const group of p.assetDiscovery!.groups) {
    const choice = p.assetDiscovery!.choices![group.id];
    const option = group.options.find(o => o.assetId === choice.assetId)!;
    const { asset } = await library.inspect(straw.studioId, option.assetId);
    Object.assign(option, asset);
    // The recorded captures contain zero scripts. Consume the real inspection
    // output, as the no-source producer does, without fabricating a review pass.
    expect(asset.inspection!.scriptCount).toBe(0);
    delete choice.sourceReview;
    if (group.preview === "animation") {
      const sequence = animation.snapshot.nativeRoles.sequences.find(s => s.name === infinity.clip.name)!;
      const pack = animationPackSchema.parse({ assetId: asset.assetId, name: asset.name, revisionKey: revisionKey(asset), entries: [{ key: sequence.key, name: sequence.name, clip: infinity.clip }] });
      option.previewData = { pack, revisionKey: revisionKey(asset) };
      choice.clipKey = sequence.key;
      const timing=(assetRoleEvidence(p,group).details as any).timing;
      if(timing?.segments.length) choice.timingDecision={key:timing.key,segments:timing.segments.map(({start,hit,end}:any)=>({start,hit,end})),source:"user"};
    }
  }
  return p;
}

it("blocks the actual saved trial picks until role capture replaces security-only evidence", () => {
  const p = structuredClone(saved) as unknown as Project;
  projectProposalPicks(p);
  expect(p.assetDiscovery!.groups.find(g => g.id === "punch_animation")!.preview).toBe("animation");
  expect(missingPicks(p)).toHaveLength(2);
  for (const g of p.assetDiscovery!.groups) expect(assetRoleEvidence(p, g).recapture).toBe(true);
});
it("accepts native straw hit geometry without inventing a Humanoid and binds the raw clip digest", async () => {
  const p = await capturedProject();
  const [target, clip] = p.assetDiscovery!.groups;
  expect(missingPicks(p)).toEqual([]);
  const evidence = assetRoleEvidence(p, target);
  expect(evidence.details).toMatchObject({ scriptCount: 0, humanoids: [], classCounts: { Part: 7, UnionOperation: 4, Model: 6 } });
  expect((evidence.details as any).parts).toHaveLength(11);
  expect((evidence.details as any).bounds.size.every((n: number) => n > 0)).toBe(true);
  expect(assetRoleEvidence(p, clip)).toMatchObject({ status: "ready", reason: expect.stringContaining("Studio-only") });
  expect((assetRoleEvidence(p, clip).details as any).clip).toMatchObject({ rig: "R6", duration: 2.75, poseDigest: infinity.clip.sourcePoseDigest });
  const segments = (assetRoleEvidence(p, clip).details as any).proposedPunchSegments.segments;
  expect(segments).toHaveLength(13);
  // Independently recorded Edit inspection table in the approved D1 plan.
  const ends = [.4667, .8167, .9500, 1.2000, 1.2833, 1.4500, 1.5500, 1.7333, 1.8000, 1.9500, 2.0167, 2.2833, 2.7500];
  const hits = [.3833, .6667, .8833, 1.1167, 1.2667, 1.3833, 1.5000, 1.6500, 1.7667, 1.8833, 1.9833, 2.0833, 2.4500];
  segments.forEach((s: any, i: number) => {
    expect(s.hit).toBeCloseTo(hits[i], 3);
    expect(s.end).toBeCloseTo(ends[i], 3);
    expect(s.arm).toBe(i % 2 ? "Left Arm" : "Right Arm");
    expect(s.label).toBe(i === 12 ? "Heavy" : "Dmg");
    expect(s.start).toBe(i ? segments[i - 1].end : 0);
  });
  expect(oldDummy.snapshot.scripts).toHaveLength(3);
});
it("blocks a missing clip and a mismatched rig even for a kept choice", async () => {
  const p = await capturedProject(), group = p.assetDiscovery!.groups[1];
  const choice = p.assetDiscovery!.choices![group.id];
  const key = choice.clipKey;
  delete choice.clipKey;
  expect(pickStatus(p, group).canBuild).toBe(false);
  choice.clipKey = key;
  choice.kept = true;
  p.rig!.selected = "R15";
  expect(pickStatus(p, group)).toMatchObject({ canBuild: false, reason: expect.stringContaining("R15") });
});
it("recaptures revision, capture-version and pose-identity mismatches", async () => {
  const original = await capturedProject();
  for (const mutate of [
    (p: Project) => { p.assetDiscovery!.groups[1].options[0].versionId = "99999999"; },
    (p: Project) => { delete p.assetDiscovery!.groups[1].options[0].inspection!.nativeRoles; },
    (p: Project) => { p.assetDiscovery!.groups[1].options[0].previewData!.pack!.entries[0].clip!.sourcePoseDigest = "0".repeat(64); },
  ]) {
    const p = structuredClone(original); mutate(p);
    expect(assetRoleEvidence(p, p.assetDiscovery!.groups[1])).toMatchObject({ status: "unknown", recapture: true });
  }
});
it("includes geometry and pose changes in the snapshot content hash", () => {
  for (const [fixture, mutate] of [
    [straw, (s: any) => s.nativeRoles.parts[0].size[0] += 1],
    [animation, (s: any) => s.nativeRoles.sequences[0].poseDigest = "0".repeat(64)],
  ] as const) {
    const before = snapshotSchema.parse(fixture.snapshot), after = structuredClone(before);
    mutate(after);
    expect(snapshotHash(after)).not.toBe(snapshotHash(before));
  }
});
it("removes contradicted legacy asset facts, invalidates approval and preserves user intent", async () => {
  const p = await capturedProject();
  const intent = { request: p.request, answers: p.answers, interactions: p.proposal!.assetNeeds!.map(n => n.intent?.interaction) };
  refreshProposal(p, ["assets"]);
  expect(p.proposal!.approval).toBeUndefined();
  expect(p.proposal!.assetNeeds![0].constraints).toContain("Straw Target Dummy");
  expect(p.proposal!.assetNeeds![0].constraints).not.toContain("3 scripts");
  expect(p.proposal!.mechanics.text).not.toContain("which contains scripts");
  expect(p.proposal!.assetNeeds![1].constraints).toContain("KeyframeSequences");
  expect({ request: p.request, answers: p.answers, interactions: p.proposal!.assetNeeds!.map(n => n.intent?.interaction) }).toEqual(intent);
  const firstHash = p.proposal!.hash;
  refreshProposal(p);
  expect(p.proposal!.hash).toBe(firstHash);
  expect(gameContext(p).assetRoleEvidence).toEqual(gameContext(p, undefined, true).assetRoleEvidence);
});
it("keeps newly supported roles unresolved until their native facts are captured", async () => {
  const p = await capturedProject();
  p.proposal!.assetNeeds![0].query = "magic particles";
  p.proposal!.assetNeeds![0].role = "decorative effect";
  expect(pickStatus(p, p.assetDiscovery!.groups[0])).toMatchObject({ canBuild: false, reason: expect.stringContaining("capture") });
});
