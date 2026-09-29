import fs from "node:fs";
import { expect, it } from "vitest";
import {
  motionEvidence,
  assessEvidenceOptions,
  rankByVotes,
} from "../src/marketplace/relevance";
import {
  studioAnimationPack,
  animationTier,
} from "../src/marketplace/animations";
import { unmetAssetRequirements } from "../src/generation/asset-gaps";
import { savedReplay } from "./post-plan-replay.fixture";
const project = savedReplay("opencode-step3-live-20260925");
const group = project.assetDiscovery!.groups.find(
  (g) => g.preview === "animation",
)!;
const option = group.options.find((o) => o.previewData?.pack)!;
const pack = option.previewData!.pack!;

it("delivers real kinematics unchanged when all listing and clip names are junk", () => {
  const before = motionEvidence(pack.entries[0].clip!);
  const renamed = structuredClone(pack.entries[0].clip!);
  renamed.name = "unrelated junk";
  expect(motionEvidence(renamed)).toEqual(before);
  expect(before.tracks.some((t) => t.rotationRange.some((n) => n > 0.1))).toBe(
    true,
  );
  expect(before.rig).toBe("R15");
});

it("gates each real captured clip before ranking votes and retains the assessed clip identity", async () => {
  const low = { ...structuredClone(option), votes: { up: 10, down: 0 } };
  const sword = JSON.parse(
    fs.readFileSync(
      "docs/results/asset-evidence-selection-20260926/captured-pack-77935648543779.json",
      "utf8",
    ),
  );
  const high = {
    ...structuredClone(option),
    assetId: sword.assetId,
    votes: { up: 10000, down: 0 },
    previewData: { pack: sword },
  };
  const decisions: any[] = [];
  // Transport double tests host gating, NOT Jev's ability to classify a motion.
  const decide = async (request: any) => {
    decisions.push(request);
    return {
      model: "typesafe/jev-1.13",
      answers: Object.fromEntries(
        request.state.candidates.map((c: any, i: number) => [
          "relevant_" + i,
          {
            type: "choice",
            choice: c.id === low.assetId ? "yes" : "no",
            confidence: 0.95,
          },
        ]),
      ),
    };
  };
  const result = await assessEvidenceOptions(
    project,
    { ...group, options: [high, low] },
    decide,
  );
  expect(result?.candidateId).toBe(low.assetId);
  expect(result?.clipKey).toBe(pack.entries[0].key);
  expect(decisions.flatMap((r) => r.state.candidates)).toHaveLength(
    pack.entries.filter((e) => e.clip).length +
      sword.entries.filter((e: any) => e.clip).length,
  );
  expect(decisions[0].state.candidates[0].motion).toEqual(
    motionEvidence(sword.entries[0].clip!),
  );
  expect(decisions[0].state.candidates[0].motion).not.toEqual(
    motionEvidence(pack.entries[0].clip!),
  );
  expect(
    decisions[0].state.candidates[0].hierarchy.siblings.some(
      (s: any) => s.name === "Katana",
    ),
  ).toBe(true);
  expect(decisions[0].state.candidates[0].votes).toEqual(high.votes);
  const relevant = [
    low,
    { ...low, assetId: "9002", votes: { up: 30, down: 0 } },
  ];
  expect(rankByVotes(relevant)[0].assetId).toBe("9002");
  relevant[0].votes = { up: 200, down: 0 };
  expect(rankByVotes(relevant)[0].assetId).toBe(low.assetId);
});

it("offers mapped raw clips with a recorded publishing limitation, excluding unmappable clips", () => {
  expect(studioAnimationPack(pack).entries).toHaveLength(pack.entries.length);
  expect(animationTier(pack.entries[0])).toBe("studio_only");
  expect(
    studioAnimationPack({
      ...pack,
      entries: [{ ...pack.entries[0], key: "unmapped" }],
    }).entries,
  ).toEqual([]);
  // Published identity comes from the existing producer fixture, not a synthesized raw-pack ID.
  const published = JSON.parse(
    fs.readFileSync(
      "docs/results/marketplace-animation/native-pack.json",
      "utf8",
    ),
  );
  expect(animationTier(published.entries[0])).toBe("published");
  const p = structuredClone(project);
  const g = p.assetDiscovery!.groups.find((g) => g.preview === "animation")!;
  const o = g.options.find((o) => o.assetId === g.options[0].assetId)!;
  o.previewData!.pack = published;
  p.assetDiscovery!.choices![g.id].clipKey = published.entries[0].key;
  expect(
    unmetAssetRequirements(p).filter(
      (gap) => gap.kind === "publishing_limitation",
    ),
  ).toEqual([]);
  const gaps = unmetAssetRequirements(project);
  expect(gaps.some((g) => g.kind === "publishing_limitation")).toBe(true);
});

it("keeps the 0.8 gate even for a unanimous relevance choice with very high votes", async () => {
  const result = await assessEvidenceOptions(
    project,
    { ...group, options: [{ ...option, votes: { up: 1000000, down: 0 } }] },
    async (request) => ({
      model: "typesafe/jev-1.13",
      answers: Object.fromEntries(
        Object.keys(request.questions).map((key) => [
          key,
          { type: "choice" as const, choice: "yes", confidence: 0.79 },
        ]),
      ),
    }),
  );
  expect(result).toBeNull();
});

for (const file of ["docs/results/asset-evidence-selection-20260926/captured-pack-12061946559.json", "docs/results/asset-evidence-selection-20260926/captured-pack-77935648543779.json"]) {
  it(`supplies captured variant identity and distinguishes uncertainty from rejection: ${file}`, async () => {
    const captured = JSON.parse(fs.readFileSync(file,"utf8"));
    const records:any[]=[];
    await assessEvidenceOptions(project,{...group,options:[{...option,assetId:captured.assetId,previewData:{pack:captured}}]},async request=>{
      const state=request.state as any;
      for(const candidate of state.candidates) {
        const entry=captured.entries.find((e:any)=>e.key===candidate.clipKey);
        expect(candidate.variant).toMatchObject({key:entry.key,name:entry.name});
        expect(candidate.motion).toEqual(motionEvidence(entry.clip));
      }
      return {model:"typesafe/jev-1.13",answers:Object.fromEntries(Object.keys(request.questions).map(k=>[k,{type:"choice" as const,choice:"yes",confidence:0.7}]))};
    },r=>records.push(r));
    expect(records.length).toBeGreaterThan(0);
    expect(records.every(r=>r.choice==="yes" && r.state==="uncertain" && !r.relevant)).toBe(true);
  });
}
