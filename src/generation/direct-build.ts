import { specSchema, type Project, type Spec } from "./schema";
import { requirementSources } from "./brief-sources";
import { needDefinition } from "../marketplace/proposal-picks";
import { validateImplementationPlan } from "./plan-validation";

/** The approved document is the plan. No paid worker invents a second task graph. */
export function directBuildSpec(p: Project): Spec {
  if (!p.proposal?.approval || p.proposal.approval.hash !== p.proposal.hash)
    throw Error("Approve the saved proposal before building.");
  const needs = (p.proposal.assetNeeds ?? []).filter(n => !n.pick?.skip).map(needDefinition);
  const reserved = new Set(needs.flatMap(n => [n.requirementId, ...(n.intent?.relatedRequirementIds ?? [])]));
  const sources = requirementSources(p);
  const requirements: Spec["requirements"] = sources.map((source, i) => {
    let id = `approved_${i}`;
    while (reserved.has(id)) id = `s_${id}`;
    reserved.add(id);
    return {
      id, origin: "user", sourceId: source.id, sourceQuote: source.text.slice(0, 3000),
      description: `Implement the approved source ${source.id}. The complete source is supplied in the manifest.`,
      category: source.id === "proposal:environment" ? "world" : source.id === "proposal:theme" ? "presentation" : "mechanic",
      priority: "required", acceptance: `The implementation satisfies ${source.id}, including its saved decisions and limits. Native behavior still requires a Studio test.`,
    };
  });
  for (const need of needs) for (const id of [need.requirementId, ...(need.intent?.relatedRequirementIds ?? [])]) {
    if (requirements.some(r => r.id === id)) continue;
    requirements.push({ id, origin: "inferred", sourceQuote: "", category: "mechanic", priority: "required",
      description: `Integrate the approved asset need ${need.id} and its linked behavior. See its complete role, constraints and interaction in assetNeeds.`,
      acceptance: `Use the exact approved pick for ${need.id}. Preserve the approved interaction and report unavailable capabilities without substituting another asset.`,
    });
  }
  return validateImplementationPlan(specSchema.parse({
    title: p.proposal.title, summary: "Build the approved proposal and saved decisions without expanding scope.",
    visualDirection: "Follow the approved theme and environment in the manifest.",
    assetStrategy: "Use the exact approved picks and inspected content. Implement only the missing integration.",
    assetNeeds: needs, requirements, questions: [],
    tasks: [{ id: "implementation", title: "Implement the approved game", requirements: requirements.map(r => r.id),
      dependsOn: [], files: [], proposalSections: ["mechanics", "theme", "environment", "assets"] }],
  }), p);
}

export class NoCodeSpendingStop extends Error {
  constructor(public readonly limitMicros: number) {
    super(`Build paused after reaching the $${(limitMicros / 1e6).toFixed(2)} no-code spending threshold without saved code. Review the diagnostics and continue explicitly. Previous charges and the remaining budget are kept.`);
    this.name = "NoCodeSpendingStop";
  }
}

/** A per-session guard, independent of the unchanged project/generation cap. */
export function noCodeSpendingGuard(p: Project) {
  const chargeStart = p.charges.length;
  const limit = Math.min(500_000, Math.floor((p.generation?.budgetMicros ?? p.budgetMicros) / 4));
  return () => {
    if (p.artifact?.files.some(f => f.source.trim())) return;
    const spent = p.charges.slice(chargeStart).reduce((sum, c) => sum + c.chargedMicros, 0);
    // Stop before the next call. The in-flight call is still bounded by the
    // existing conservative project/generation reservation, never by a quote.
    if (spent >= limit) throw new NoCodeSpendingStop(limit);
  };
}
