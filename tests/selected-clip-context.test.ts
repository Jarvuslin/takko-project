import fs from "node:fs";
import { expect, it } from "vitest";
import { savedReplay } from "./post-plan-replay.fixture";
import {
  approvedClipContext,
  animationCapabilityContract,
} from "../src/marketplace/selected-clip-context";
import { publishableAnimationPack } from "../src/marketplace/animations";
const project = savedReplay("animation-selection");
const evidence = JSON.parse(
  fs.readFileSync(
    "tests/fixtures/regression/animation-selection/asset-evidence/eb4c0269-8c7d-4933-bbe4-f637ecf68d22/59a3136837a54a1f5a83ef223711f634c35a3a6d992e504aadeddcd8c938282c.review.json",
    "utf8",
  ),
);
const need = project.assetPipeline!.needs.find(
  (n) => n.id === "punchAnimationAsset",
)!;
it("maps the real approved clip key to the actual captured sequence without model inference", () => {
  const context = approvedClipContext(project, need, {
    ...evidence,
    candidateId: evidence.binding.candidateId,
  });
  expect(context).toMatchObject({
    key: "1/1/18/1",
    name: "punching animation",
    instanceIndex: 149,
    instancePath: [
      "Imported",
      "punching animation 1",
      "AnimSaves",
      "punching animation",
    ],
    animationId: null,
    resolution: "captured",
  });
});
it("reports unavailable or changed capture evidence instead of asking the model to guess a mapping", () => {
  expect(approvedClipContext(project, need)?.resolution).toBe(
    "capture_pending",
  );
  expect(
    approvedClipContext(project, need, { ...evidence, candidateId: "other" })
      ?.resolution,
  ).toBe("unresolved");
  const changed = structuredClone(evidence);
  changed.nodes.find((n: any) => n.index === 149).name = "Different clip";
  expect(
    approvedClipContext(project, need, {
      ...changed,
      candidateId: evidence.binding.candidateId,
    })?.resolution,
  ).toBe("unresolved");
});
it("keeps the mapped clip through an unrelated adaptation that shifts capture indices", () => {
  const before = { ...evidence, candidateId: evidence.binding.candidateId };
  const selected = approvedClipContext(project, need, before)!;
  const after = structuredClone(before);
  const at = after.nodes.findIndex((n: any) => n.index === 148);
  after.nodes.splice(at, 0, {
    index: 10000,
    parentIndex: 2,
    name: "AdditionalMetadata",
    className: "Folder",
  });
  const indices = new Map(
    after.nodes.map((n: any, i: number) => [n.index, i + 1]),
  );
  after.nodes = after.nodes.map((n: any) => ({
    ...n,
    index: indices.get(n.index),
    parentIndex: n.parentIndex ? indices.get(n.parentIndex) : 0,
  }));
  expect(approvedClipContext(project, need, after, selected)).toMatchObject({
    resolution: "captured",
    instanceIndex: 150,
    instancePath: selected.instancePath,
  });
});
it("discovery includes mapped Studio-only clips without mutating saved choices", () => {
  const group = project.assetDiscovery!.groups.find(
    (g) => g.preview === "animation",
  )!;
  const pack = group.options.find((o) => o.previewData?.pack)?.previewData!
    .pack!;
  const before = structuredClone(pack);
  expect(publishableAnimationPack(pack).entries).toHaveLength(
    pack.entries.length,
  );
  expect(pack).toEqual(before);
  expect(animationCapabilityContract.rawKeyframeSequence.publishedGame).toBe(
    "unsupported",
  );
  expect(animationCapabilityContract.rawKeyframeSequence.studioPlayback).toBe(
    "native_probe_passed",
  );
});
