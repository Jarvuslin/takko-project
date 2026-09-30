import type { Project } from "../generation/schema";
import { assetRoleEvidence } from "./role-evidence";

/** Correct known legacy planner assertions only after native contradiction.
 * User request, answers and intent interactions are never rewritten here.
 */
export function refreshAssetFacts(p: Project) {
  if (!p.proposal) return;
  for (const group of p.assetDiscovery?.groups ?? []) {
    const need = p.proposal.assetNeeds?.find(n => n.id === (group.assetNeedId ?? group.id));
    const option = group.options.find(o => o.assetId === p.assetDiscovery?.choices?.[group.id]?.assetId);
    if (!need || !option || assetRoleEvidence(p, group).status !== "ready") continue;
    const facts = option.inspection!.nativeRoles;
    if (!facts) continue;
    if (assetRoleEvidence(p, group).role === "static_target") {
      const scripts = option.inspection!.scriptCount;
      const correct = (text: string) => text
        .replace(/Target Dummy \(Respawns\)/g, () => option.name)
        .replace(/Target Dummy \(which contains scripts\)/g, () => `${option.name} (${scripts} captured scripts)`)
        .replace(/Inspect its \d+ scripts and hierarchy first\./g, () => `Inspect its hierarchy. The current native capture contains ${scripts} scripts.`);
      need.constraints = correct(need.constraints);
      for (const section of [p.proposal.mechanics, p.proposal.theme, p.proposal.environment]) {
        section.text = correct(section.text);
        if (!scripts && !facts.humanoids.length) section.assumptions = section.assumptions.map(text =>
          /^A hit counts whether or not the dummy's own scripts react\./.test(text)
            ? "A hit counts against the captured physical target parts. This target has no captured scripts or Humanoid, so health and respawn behavior are not supplied by the asset."
            : correct(text));
      }
      if (!scripts && need.intent) need.intent.reusableFeatures = need.intent.reusableFeatures.map(text =>
        /^Existing respawn or health scripts to inspect for conflicts with hit counting$/.test(text)
          ? "No embedded scripts are present in the current native capture. Implement the requested hit integration."
          : text);
    }
    if (assetRoleEvidence(p, group).role === "animation" && facts.sequences.length && !facts.animations.length) {
      need.constraints = need.constraints
        .replace(/It must be an R6-compatible Animation\./g, "The selected clip must match the project's R6 rig.")
        .replace(/Inspect the model for its Animation instance\(s\) and choose the punch clip\./g, "Inspect the captured KeyframeSequences and choose the punch clip. Raw registration is Studio-only. Publishing needs a permitted published Animation.");
      if (need.intent) need.intent.reusableFeatures = need.intent.reusableFeatures.map(text =>
        /^Animation instance\(s\) with the punch clip and its AnimationId$/.test(text)
          ? "Captured KeyframeSequence identity and pose digest. Raw registration is Studio-only, not a published AnimationId."
          : text);
    }
  }
}
