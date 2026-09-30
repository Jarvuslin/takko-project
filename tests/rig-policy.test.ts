import fs from "node:fs";
import { expect, it } from "vitest";
import { recommendRig, requestedRig, rigQuestion, rigInstructions } from "../src/generation/rig-policy";
import { newProject } from "../src/generation/store";
import { exportBundle } from "../src/generation/export";
import { normalizeNeeds } from "../src/marketplace/normalize-needs";
import { pickStatus } from "../src/marketplace/pick-status";
import type { Project } from "../src/generation/schema";
it("recommends R6 from the saved animation and asks when the user has not chosen", () => {
  const p: Project = JSON.parse(fs.readFileSync("tests/fixtures/chat-recovery/failed-project.json", "utf8"));
  p.rig = recommendRig(p);
  expect(p.rig.recommended).toBe("R6");
  expect(rigQuestion(p)?.recommendedOptionId).toBe("r6");
  expect(rigQuestion(p)?.recommendationReason).toContain("animation");
});
it.each(["R6", "R15"] as const)("a stated %s rig skips the question and is serialized in the actual place export", rig => {
  const p = newProject(`Make a game using ${rig} avatars`, 1000000);
  p.rig = recommendRig(p);
  expect(rigQuestion(p)).toBeUndefined();
  expect(rigInstructions(p)).toContain(`Project rig: ${rig}`);
  const xml = exportBundle({ files: [], scene: [], assets: [], coverage: [] } as any, p.scope, [], p.world, p.rig);
  expect(xml).toContain(`<token name="GameSettingsAvatar">${rig === "R6" ? 0 : 1}</token>`);
});
it("blocks a historical mismatched animation whose native role capture is stale", () => {
  const p: Project = JSON.parse(fs.readFileSync("tests/fixtures/chat-recovery/failed-project.json", "utf8"));
  normalizeNeeds(p); p.rig = requestedRig("R15");
  const g = p.assetDiscovery!.groups.find(g => g.id === "PunchAnimation")!;
  const option = g.options.find(o => o.assetId === p.assetDiscovery!.choices![g.id].assetId)!;
  // This pack's captured producer clip is retained in the saved project.
  expect(option.previewData!.pack!.entries.find(e => e.key === "1/11/1")!.clip!.rig).toBe("R6");
  if (option.inspection?.scriptCount) p.assetDiscovery!.choices![g.id].sourceReview = { contentHash: option.inspection.contentHash, scripts: [], costMicros: 0 };
  expect(pickStatus(p, g)).toMatchObject({ state: "problem", canBuild: false });
  expect(pickStatus(p, g).reason).toContain("native inspection");
});
