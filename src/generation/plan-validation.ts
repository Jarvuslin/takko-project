import type { Project, Spec } from "./schema";
import { validateSpec } from "./validation";
import { validateReferenceDecisions } from "./research";
import { validateMarketplaceDiscovery } from "./marketplace-policy";
import { proposalPlanFor } from "./proposal";
import { buildAssetNeeds } from "../marketplace/approved-adapter";
import { assetNeedSchema } from "./asset-contract";
import { z } from "zod";

/** Validate the whole candidate before committing it or issuing external effects. */
export function validateImplementationPlan(
  value: Spec,
  project: Project,
): Spec {
  const errors: string[] = [];
  const collect = <T>(fn: () => T): T | undefined => {
    try {
      return fn();
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  };
  const spec = collect(() => validateSpec(value, project)) ?? value;
  collect(() => validateReferenceDecisions(spec, project));
  collect(() => validateMarketplaceDiscovery(spec, true));
  if (
    /\b(asmr|marketplace|creator store)\b/i.test(project.request) &&
    (!spec.assetStrategy || !spec.assetNeeds?.length)
  )
    errors.push(
      "spec.assetStrategy / spec.assetNeeds: This request requires an explicit asset strategy and assetNeeds for relevant external content.",
    );
  const ids = new Set(spec.requirements.map((r) => r.id));
  for (const need of spec.assetNeeds ?? [])
    if (!ids.has(need.requirementId))
      errors.push(
        `Asset ${need.id}: Asset needs must have unique IDs and refer to existing requirements. Unknown requirement ${need.requirementId}`,
      );
  const candidate = { ...project, spec };
  // These same producers are consumed after acceptance. No mutations or external calls here.
  collect(() => proposalPlanFor(candidate, spec));
  const needs = collect(() =>
    z.array(assetNeedSchema).max(16).parse(buildAssetNeeds(candidate)),
  );
  for (const need of needs ?? [])
    if (!need.query.trim() || !need.role.trim() || !need.constraints.trim())
      errors.push(
        `Asset ${need.id}: Asset need query, role and constraints cannot be blank`,
      );
  if (errors.length)
    throw Error(
      [...new Set(errors.flatMap((error) => error.split("\n")))].join("\n"),
    );
  return spec;
}
