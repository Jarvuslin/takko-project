import fs from "node:fs";
import { expect, it } from "vitest";
import type { Project } from "../src/generation/schema";
import {
  unmetAssetRequirements,
  retainAssetGaps,
} from "../src/generation/asset-gaps";
import { requiresNativeAcquisition } from "../src/generation/asset-provenance";
import { validateBundle } from "../src/generation/validation";

const saved: Project = JSON.parse(
  fs.readFileSync(
    "docs/results/animation-resume-20260927/terminal-project.json",
    "utf8",
  ),
);
const need = saved.assetPipeline!.needs.find(
  (n) => n.requirementId === "hit_sound",
)!;
const inspection: any = saved.assetPipeline!.events.find(
  (e) => e.needId === need.id && e.step === "inspect_result",
)!.data;
const reference = {
  id: need.id,
  requirementId: need.requirementId,
  kind: "audio" as const,
  status: "provided" as const,
  assetId: inspection.candidate.id,
  sourceUrl: inspection.candidate.sourceUrl,
  description: need.role,
};

it("the real search-hint rejection becomes a visible limitation without changing acquisition evidence", () => {
  const p = structuredClone(saved);
  const gaps = unmetAssetRequirements(p);
  expect(
    gaps
      .filter((g) => g.needId === need.id)
      .map((g) => [g.requirementId, g.kind]),
  ).toEqual([[need.requirementId, "approval_limitation"]]);
  const bundle = structuredClone(p.artifact!);
  bundle.coverage = bundle.coverage.map((c) =>
    c.requirementId === "hit_sound" || c.requirementId === "target_dummy"
      ? { ...c, status: "implemented" }
      : c,
  );
  const retained = retainAssetGaps(p, bundle);
  expect(
    retained.coverage
      .filter((c) => ["hit_sound", "target_dummy"].includes(c.requirementId))
      .every((c) => c.status === "implemented"),
  ).toBe(true);
  expect(p).toEqual(saved);
});

it("the approved, safely inspected reference can be supplied without claiming a retained import or reacquiring", () => {
  expect(requiresNativeAcquisition(saved, reference)).toBe(false);
  expect(reference.status).toBe("provided");
  const bundle = structuredClone(saved.artifact!);
  bundle.assets.push(reference);
  expect(
    validateBundle(bundle, saved).find((c) => c.id === "asset:" + reference.id)
      ?.status,
  ).toBe("passed");
});

it("approval cannot override unsafe inspection, capability failures, stale evidence or an unapproved reference", () => {
  for (const change of [
    (p: Project) => {
      (
        p.assetPipeline!.events.find(
          (e) => e.needId === need.id && e.step === "inspect_result",
        )!.data as any
      ).safe = false;
    },
    (p: Project) => {
      (
        p.assetPipeline!.events.find(
          (e) => e.needId === need.id && e.step === "inspect_result",
        )!.data as any
      ).capabilityBlock = {
        kind: "unsupported_structure",
        reason: "Cannot import",
      };
    },
    (p: Project) => {
      p.assetPipeline!.revision++;
    },
    (p: Project) => {
      p.assetDiscovery!.approved = false;
    },
  ]) {
    const p = structuredClone(saved);
    change(p);
    expect(requiresNativeAcquisition(p, reference)).toBe(true);
  }
});
