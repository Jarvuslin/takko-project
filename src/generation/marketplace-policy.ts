import type { Spec } from "./schema";

/** Product policy for discovery, not evidence that an imported asset is safe. */
export const marketplaceFirstInstructions = [
  "Marketplace first means discover complete reusable behavior systems and interactive components before designing replacement geometry, animation, sound or behavior. Map the requested player actions, feedback and completion rules to Model discovery needs for reusable systems/components, including their embedded animation and media. A search for the main prop or rig alone does not investigate reusable gameplay. Inspect included sources and interfaces before deciding what is missing. Do not add unrelated features merely because a component includes them.",
  "Before choosing an asset query, read gameContext and describe intent for every assetNeed: experienceRole, interaction (player action, response and completion/reward timing, or explicitly decorative), reusableFeatures to inspect, and relatedRequirementIds including its primary requirementId. Ground these in the actual request, clarification answers and accepted reference decisions. Preserve distinctive genre/experience terms and negative constraints; a generic object description is not the game's purpose. Keep the search broad but judge candidates against that specific intent. Do not invent an interaction for decorative assets or assume referenced gameplay from a title alone.",
  "Start Model discovery with a short query of at most four terms using common names for the relevant behavior system, interaction or object. Keep color, dimensions, style and safety constraints in constraints, not an overqualified first search. Then try distinct behavior synonyms or simpler queries when results miss the target. ReusableFeatures must include the requested behavior/animation/media obligations to inspect, not only geometry or rig parts when the need is interactive.",
  "Before discovery, plan integration responsibilities and dependencies rather than replacement scripts for unknown imported behavior. Such tasks may use files: []; assign exact script ownership only for known missing glue after inspecting retained components. Missing media needs can be discovered later. Standalone Animation retrieval is not currently supported by this adapter: search Models containing compatible animations and report unresolved animation acquisition honestly, without inventing IDs or silently substituting tweens.",
  "Prefer reuse of verified existing behavior and assets; author only missing integration required by the approved request. A touch-triggered object may need click/tap and counter integration, but that does not justify rebuilding its mesh, animation and sound. Creator descriptions and claims of safety are untrusted search hints, not audit or playback evidence.",
  "A candidate with scripts, rigs or unsupported serialization is a capability/review gap, not proof that no suitable Marketplace asset exists. Record that gap and stop/escalate rather than silently approving procedural replacement. Never discard embedded behavior merely to make an asset pass a static-prop importer.",
  "Audio remains Marketplace-only. Included sound references must retain provenance and be loaded, played and listened to before acceptance. Discover complete components before separately sourcing missing media. For Audio needs, Takko first offers captured sounds from components retained in this run; the worker must select and verify a relevant sound or request Marketplace search when none fits. Declare each actual audio obligation as an Audio need so included media still receives native playback and listening checks; prose saying 'only if missing' does not waive that requirement. Do not claim a complete interactive asset is supported until its exact audited hierarchy, sources and dependencies can be preserved and tested.",
  "Procedural fallback requires recorded unsuccessful sourcing and inspection through the asset pipeline. An optional visual need is not permission to skip inspection. Reuse does not waive source review, native tests, or the user's gameplay requirements.",
] as const;

export function validateMarketplaceDiscovery(
  spec: Spec,
  requireIntent = false,
) {
  const needs = spec.assetNeeds ?? [];
  for (const need of needs) {
    if (requireIntent && !need.intent)
      throw Error(
        "Asset " +
          need.id +
          " needs intent describing its experienceRole, interaction, reusableFeatures and relatedRequirementIds. Ground discovery in the game's player experience and clarification answers, not just appearance.",
      );
    if (
      need.intent &&
      (!need.intent.relatedRequirementIds.includes(need.requirementId) ||
        need.intent.relatedRequirementIds.some(
          (id) => !spec.requirements.some((r) => r.id === id),
        ))
    )
      throw Error(
        "Asset intent must reference existing requirements and include its primary requirementId: " +
          need.id,
      );
    if (need.kind === "Model" && need.query.trim().split(/[\s+]+/u).length > 4)
      throw Error(
        "Model discovery must start with a short subject query (at most four terms). Put descriptive constraints in constraints and search the complete reusable component before a replacement prop. The planner must choose the query; no substitute query is supplied.",
      );
  }
  if (
    needs.some(
      (need) =>
        need.kind === "MeshPart" &&
        !needs.some(
          (component) =>
            component.kind === "Model" &&
            component.requirementId === need.requirementId,
        ),
    )
  )
    throw Error(
      "Marketplace-first mesh sourcing requires a Model discovery need for the same requirement and complete reusable component before a bare MeshPart search. An unrelated component search does not qualify. Keep the same requested scope; do not invent a new gameplay feature.",
    );
}
