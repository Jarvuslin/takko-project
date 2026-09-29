import fs from "node:fs";
import { expect, it, vi } from "vitest";
import type { Project, Spec } from "../src/generation/schema";
import { migrateAssetNeeds, planningRetry } from "../src/generation/retry";
import { planWithCoordinator, type CoordinatorHost } from "../src/generation/coordinator";
import { approvedAssetLinks } from "../src/marketplace/asset-binding";
import { validateImplementationPlan } from "../src/generation/plan-validation";
export const failedProject = (): Project => JSON.parse(fs.readFileSync("tests/fixtures/chat-recovery/failed-project.json", "utf8"));
const response = () => JSON.parse(fs.readFileSync("tests/fixtures/chat-recovery/failed-worker-response.txt", "utf8").replace(/^```json\s*|\s*```$/g, ""));
function assembled(p: Project): Spec {
  const { areas: _, sharedContracts: __, ...head } = p.coordination!.outline!;
  const parts = [...Object.values(p.coordination!.areas), response()];
  return { ...head, requirements: parts.flatMap(x => x.requirements), tasks: parts.flatMap(x => x.tasks), assetNeeds: parts.flatMap(x => x.assetNeeds ?? []), referenceDecisions: parts.flatMap(x => x.referenceDecisions ?? []) };
}
it("replays the recorded duplicate-need failure using the actual final worker output", () => {
  const p = failedProject();
  expect(p.error).toContain("Multiple approved groups link to the same asset need: foundation_TargetDummy");
  expect(p.assetDiscovery!.groups).toHaveLength(6);
  const spec = assembled(p);
  expect(() => validateImplementationPlan(spec, p)).not.toThrow();
  const links = approvedAssetLinks({ ...p, spec });
  expect(links.map(x => x.option.assetId)).toEqual(["112770048", "15008746676", "16583762"]);
  migrateAssetNeeds(p);
  expect(p.assetDiscovery!.groups.map(g => g.id)).toEqual(["TargetDummy", "PunchAnimation", "PunchHitSound"]);
  expect(p.assetDiscovery!.choices!.PunchAnimation.clipKey).toBe("1/11/1");
});
it("retries only the failed worker and retains the real completed area outputs", async () => {
  const p = failedProject();
  const saved = structuredClone(p.coordination!.areas);
  migrateAssetNeeds(p);
  expect(planningRetry(p)).toMatchObject({ step: "Hit Sound and HUD Counter", estimatedMicros: 178382, completed: 3 });
  const request = vi.fn(async (_phase, context, schema, validate) => {
    expect(context.coordination.area.id).toBe("hitFeedback");
    const value = schema.parse(response());
    await validate?.(value);
    return value;
  });
  await planWithCoordinator({ project: p, signal: new AbortController().signal, request, save: () => {}, validatePlan: s => validateImplementationPlan(s, p), execute: async () => {}, repairLimit: 0 } as CoordinatorHost, {});
  expect(request).toHaveBeenCalledTimes(1);
  for (const [id, value] of Object.entries(saved)) expect(p.coordination!.areas[id]).toEqual(value);
});
