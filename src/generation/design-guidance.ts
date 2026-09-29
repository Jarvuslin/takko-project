import type { Project } from "./schema";
import { marketplaceFirstInstructions } from "./marketplace-policy";
import { recordedTemplate, worldInstructions } from "./world-policy";

type DesignPhase = "planner" | "builder" | "reviewer" | "repair";
type DesignProject = Pick<Project, "spec" | "world">;

const scopePolicy = [
  "Ask about consequential choices before narrowing mechanics. A limit or exclusion not grounded in the user's request or answers belongs in a clarification question, not an applied assumption. Keep technical and cosmetic defaults incidental. For any chosen sequence of distinct animated actions, declare one Animation assetNeed per step, bound to that step, and let the user choose each clip. Never replace a multi-step choice with a single clip.",
  "Read gameContext first: preserve the requested player experience, exact clarification answers with their question context, reference mechanics and explicit exclusions throughout planning, building, review and repair. Do not reduce a genre-specific interaction to the appearance of its main prop. When evidence conflicts, report the specific conflict; inferred design is not a user instruction.",
  "Use the actual request and clarification answers to determine scope. A narrowly scoped technical test stays narrow. A request for a polished game needs authored presentation and a complete playable loop, even if its rules are simple.",
  "Do not add upgrades, quests, combat, persistence, monetization, sound, or another mechanic merely to make a game larger. Include progression or meaningful choices when requested or necessary to the proposed core loop; explain inferred choices and omissions before approval.",
  "Represent design work in the existing specification fields and requirement/task schema. Never fabricate user quotations or mark an inferred design decision as a user instruction. Do not introduce extra JSON fields.",
];
const planning = [
  "Describe a concrete first-minute player journey in summary: what is visible from spawn, where the player goes, what action they learn, what immediate response they see, and what goal gives them a reason to continue. Tie this to the requested genre and scope.",
  "Plan the playable space against the recorded world and existing scene. The baseplate_template ground is at y=0. For none/custom/legacy worlds use their actual scene instead. Specify requested landmarks, routes and interaction areas with coherent scale. Make spawn safe without inventing an enclosure. Each area should support an approved action or clear navigation purpose. Walls, ceilings and elevated floors require user-backed spatial requirements.",
  "Make visualDirection actionable: shape language, material/color hierarchy, focal points, environmental composition, readable HUD hierarchy, and visible action/reward feedback. Procedural assets can have designed silhouettes and multiple coordinated parts; random decoration or larger object counts do not establish quality.",
  "If collection/upgrades/progression are in scope, describe the motivation and state transitions: what the player earns, what a choice changes, how its effect is visible, and the next attainable goal. Avoid upgrades that only change a label or unspent score with no role in the approved loop. Keep a small technical demonstration small when that is what the user requested.",
  "Turn the chosen spatial design and presentation into concrete world/presentation/ui requirements with observable acceptance criteria. Assign implementation owners and dependencies, including scene-only tasks where useful. A broad 'looks good' sentence or a global visualDirection alone is not an implementation task.",
  "Put known shared world/interface requirements in summary before building: scene roots/landmarks, interaction locations, distances and state responsibilities. Defer imported interfaces and exact script paths until component discovery reveals the actual hierarchy and behavior. Integration tasks may have files: [] before discovery; this does not waive behavior or testing obligations. Preserve scene ownership, build dependency providers before consumers, and do not let each task invent its own map or economy.",
  "Plan feasible feedback by first discovering reusable Marketplace behavior systems and complete interactive components, including embedded animation and media. A main-object geometry search is not complete behavior discovery. Author only missing integration or an explicitly permitted and evidenced fallback; importer/format limitations are capability gaps, never fallback approval. Never invent an asset ID or add audio to a request that excludes it.",
];
const building = [
  "For HUD work, create an Enabled ScreenGui in PlayerGui at runtime, keep the label and every ancestor Visible, account for ScreenInsets and top-bar safe areas, and use responsive bounds. Validate incoming counter/state values before formatting. Reading label.Text proves state only. Actual screen captures before and after an action at small, desktop and ultrawide viewports are required to establish visibility.",
  "Use applicableRequirements as this task's approved design targets and the full spec as shared context. Implement only the current task's outputContract. Do not implement another task's files or silently expand the approved game's mechanics.",
  "For owned world/presentation work, realize the specified composition and navigation, not just nominal object existence. Place and size landmarks, routes, boundaries and focal objects deliberately; keep walkable paths and interaction ranges consistent with the shared scene contract. Preserve other tasks' scene nodes.",
  "For owned interaction/UI work, make the approved action, reward and progression visible through actual runtime state, responsive feedback and readable hierarchy. Use the shared state/configuration contract, not duplicated guessed values. Preserve correct initialization and respawn behavior.",
  "If the approved plan lacks a necessary shared design decision or cannot satisfy a requirement with available assets, report the concrete gap instead of fabricating a finished result. Source generation alone does not establish visual quality or playable behavior.",
];
const reviewing = [
  "Review the authored player experience against applicableRequirements and the approved summary/visualDirection. Identify missing spatial composition, unclear next action, incoherent scale/navigation, absent action/reward feedback, and nonfunctional progression only where those obligations are in the approved scope.",
  "A named object, a color change, a HUD counter, source file existence, or a large scene-node count is not evidence that the corresponding design requirement is fulfilled. Inspect how the implementation connects the player's action, visible response and next goal.",
  "Report implementation omissions against their actual requirementId. Do not require unapproved mechanics, optional features or unavailable audio to pass a narrower accepted scope. Distinguish a justified scoped omission from an unimplemented approved feature.",
  "Write executable acceptance checks for observable state transitions, configuration consistency, intended spatial relationships and required UI behavior. Preserve protected tests. Static review can identify omissions; rendered composition, readability in context and game feel still require native play and screenshots. Do not claim those observations occurred.",
];
const repairing = [
  "Use the concrete failure evidence and approved design targets to repair the missing experience. A cosmetic rename, extra decoration, more objects or a reviewer saying 'fixed' is not a repair for absent interaction, navigation or progression.",
  "Preserve requirements, protected tests and working shared interfaces. Explain unresolved design decisions through existing issue/coverage fields; do not invent new scope or hide an asset dependency. Changes must be real and relevant to the reported failure.",
  "If the evidence concerns appearance or game feel, implement a concrete change grounded in that evidence and keep native verification pending until the updated game is observed. Do not convert successful source validation into a visual-quality pass.",
];

/** Scope-aware prompt context; this selects real contract targets, not a quality score. */
export function generationDesignGuidance(
  phase: DesignPhase,
  project: DesignProject,
  taskId?: string,
) {
  const spec = phase === "planner" ? null : project.spec;
  if (phase !== "planner" && !spec)
    throw Error("Design execution guidance requires an existing specification");
  const task =
    phase === "builder"
      ? spec!.tasks.find((task) => task.id === taskId)
      : undefined;
  if (phase === "builder" && !task)
    throw Error("Builder design guidance requires a known task owner");
  const applicable =
    spec?.requirements.filter(
      (requirement) => !task || task.requirements.includes(requirement.id),
    ) ?? [];
  return {
    version: 2,
    phase,
    baseWorld: recordedTemplate(project),
    world: project.world ?? null,
    worldInstructions,
    scopePolicy: [...scopePolicy],
    applicableRequirements: applicable.map((requirement) => ({
      id: requirement.id,
      category: requirement.category,
      priority: requirement.priority,
      acceptance: requirement.acceptance,
    })),
    instructions: [
      ...marketplaceFirstInstructions,
      ...(phase === "planner"
        ? planning
        : phase === "builder"
          ? building
          : phase === "reviewer"
            ? reviewing
            : repairing),
    ],
    evidenceBoundary: {
      status: "native_verification_pending" as const,
      explanation:
        "These are design instructions and approved targets, not rendered or gameplay evidence. Do not produce a visual-quality or gameplay pass from this context.",
    },
  };
}
