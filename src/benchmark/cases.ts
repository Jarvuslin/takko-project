import type { QualityCase, EvidenceKind } from "./quality";
import quarryFixture from "../../benchmarks/fixtures/v1/quarry-asset-integration/manifest.json";
import freshFixture from "../../benchmarks/fixtures/v1/fresh-game/manifest.json";

/** Authored benchmark definitions, not generated results or authority to spend. */
export const benchmarkVersion = "roblox-quality-v1";
export const caseVersion = "1.0.0";
export const primaryBenchmarkCaseIds = [
  "game.asmr-interaction",
  "game.collect-and-steal",
  "game.small-fighting",
] as const;
export const assistanceTracks = [
  "untouched_model",
  "automated_repair",
  "expert_assisted",
] as const;

export type FeatureDefinition = {
  id: string;
  requirement: string;
  evidence: EvidenceKind[];
};
export type ActionStoryboard = {
  action: string;
  anticipation: string;
  execution: string;
  recovery: string;
  feedback: string;
  nativeEvidence: string;
};
export type BenchmarkCase = QualityCase & {
  suiteVersion: typeof benchmarkVersion;
  title: string;
  caseTier?: "easy" | "medium" | "hard";
  primaryPlayerSetup?: {
    count: 1 | 2;
    mode: "solo" | "cooperative" | "competitive";
  };
  status: "unrun";
  prompt: string;
  comparisonProfileId: "dev-v1" | "game-v1";
  assistanceTracks: typeof assistanceTracks;
  fixture: {
    status: "unprepared" | "prepared";
    description: string;
    artifactSha256: string | null;
    exportHash?: string;
    directory?: string;
  };
  scope: string[];
  exclusions: string[];
  featureDoD: FeatureDefinition[];
  actionStoryboard: ActionStoryboard[];
  assetPolicy: typeof assetSearchPolicy | null;
  checkpoints: { id: string; observe: string; evidenceStatus: "pending" }[];
  referenceIds: string[];
};

export const comparisonProfiles = {
  "dev-v1": {
    generationWallSeconds: 600,
    maxModelCostMicros: 1_000_000,
    maxOutputTokens: 30_000,
    nativePlaySeconds: null,
    automaticRepairAttempts: 2,
    interpretation:
      "Focused task verification; no mandatory fifteen-minute session or whole-game polish score.",
  },
  "game-v1": {
    generationWallSeconds: 1_800,
    maxModelCostMicros: 2_000_000,
    maxOutputTokens: 90_000,
    nativePlaySeconds: 900,
    automaticRepairAttempts: 2,
    interpretation:
      "Same ceilings for every game case and compared model; generation and native evaluation clocks are separate.",
  },
} as const;

export const nativeSessionProtocol = {
  warmup:
    "Before the scored run, allow a separate 60-second renderer/network warmup in an isolated copy; do not earn progression. Restart into a fresh session and reset all player state before starting the scored timer.",
  freshSession:
    "Use the same pinned project export, seed and template. Confirm no inherited currency, upgrades, checkpoint flags, client effects or old Studio test scripts. Record start artifact hash and session identity.",
  activePlayClock:
    "Measure real unaccelerated active gameplay with timestamped capture. Pause the scored clock during disconnected clients, setup, evaluator idle time or gaps between MCP commands. Wall-clock waiting alone is not gameplay/content evidence; do not advance game clocks to satisfy checkpoints.",
  checkpointCapture:
    "At 120, 300, 600 and 900 seconds or later, record the same session's active elapsed time, player/state snapshot, actual decision/transition, capture segment and any stalls. Unreached checkpoints remain pending; do not invent observations. If play ends early, document why and observe actual replay/mastery for the remaining session.",
  device:
    "Predeclare one matched primary device/viewport/input mode and graphics level for the 15-minute session. Also run a separate fresh desktop/touch usability check; do not splice different devices or sessions into one long-form result.",
  players:
    "Predeclare the case-appropriate solo, cooperative or competitive primary player count, roles and join schedule, identically for both candidates. ASMR uses solo primary observation; collect-and-steal and small-fighting use two actual clients during primary active play. Run separate targeted correctness/reconnect sessions as needed; never compare solo footage to a multiplayer session as equivalent.",
  performance:
    "Record identical warmup, capture duration, camera route and hardware for baseline/candidate performance. Report frame-time distribution, memory and observed hitches; do not infer frame rate from instance counts.",
} as const;

export const comparisonProtocol = {
  status: "planned_not_executed",
  pairedUnit:
    "Same case version, immutable starting artifact, assistance track, seed and replicate index.",
  requiredFrozenManifest: [
    "caseId",
    "caseVersion",
    "suiteVersion",
    "assistance",
    "startingArtifactSha256",
    "promptSha256",
    "providerModelId",
    "modelSettings",
    "pricingSnapshot",
    "wallClockCeiling",
    "costCeilingMicros",
    "outputTokenCeiling",
    "toolProfile",
    "environmentProfile",
    "assetCatalogSnapshotOrQueryCapture",
    "seed",
    "replicateId",
    "repairPolicy",
  ],
  toolProfile:
    "Pin tool names/versions, permissions, Studio bridge, asset-search access, animation/audio import rights, and model-tool context. Missing tool access is an environment limitation, not silent model failure.",
  environmentProfile:
    "Pin Studio version, OS, test hardware, viewport, graphics level, network/client count and latency policy. Capture baseline and generated frame time/memory with the same measurement procedure.",
  assistance: {
    untouched_model:
      "Freeze the first completed candidate before evaluator-directed edits. Log tool use and every model call; deterministic validators may report findings but no post-freeze repair is included.",
    automated_repair:
      "Fork that exact frozen candidate. Count all automated repairs, reviewer calls and retry costs inside the same run ceiling; preserve each attempt. No expert edits.",
    expert_assisted:
      "Fork a named candidate and log every human/stronger-agent code, scene or design edit, attribution, time and available cost. Never merge this score into untouched-model results.",
  },
  reporting:
    "Report per-case outcomes and variance across predeclared matched seeds. Do not select only the best attempt, compare across assistance tracks, or infer commercial competitiveness from a rubric total.",
} as const;

export const assetSearchPolicy = {
  requiredBeforeProceduralFallback: true,
  minimumCandidateQuota: null,
  searchEvidence: [
    "Timestamped query, retrieval tool/catalog URL/version and desired role/style/rig/platform constraints.",
    "Returned candidate IDs and canonical source URLs, including zero-result or access-error evidence.",
    "Reason each seriously considered candidate was chosen or rejected: relevance, permission, style, rig/animation compatibility, script trust and measured/estimated performance.",
    "Chosen candidate creator/owner, exact asset/version identity and available license/usage/experience permission evidence; public availability alone is not permission proof.",
    "Import receipt and resulting scoped instance path, native hierarchy/visual inspection, sanitized executable content and runtime compatibility proof for every imported choice.",
    "Record dimensions, collision behavior, material palette, rig mapping, animation ownership, mesh/texture costs and measured runtime impact where relevant.",
  ],
  fallbackRule:
    "After a relevant search, record why no suitable permissioned compatible match was available and identify the exact procedural replacement. A relevant accepted first result may finish the search; unrelated queries or a token candidate count cannot satisfy it. In the focused integration case, fallback does not pass the external-integration gate.",
  incompletePermissionRule:
    "Keep permission/import evidence pending and do not claim integration complete; do not spend or upload without the run's existing authorization.",
} as const;

const gameCheckpoints = [
  { id: "onboarding", minElapsedSeconds: 120 },
  { id: "development", minElapsedSeconds: 300 },
  { id: "progression", minElapsedSeconds: 600 },
  { id: "continued_play", minElapsedSeconds: 900 },
];
const pendingCheckpoint = (id: string, observe: string) => ({
  id,
  observe,
  evidenceStatus: "pending" as const,
});
const commonGameDoD: FeatureDefinition[] = [
  {
    id: "asset-search-and-fit",
    requirement:
      "Record relevant asset searches, considered choices, permission/import proof and style/performance compatibility; document exact procedural fallback only after a relevant search finds no suitable authorized match.",
    evidence: ["asset_provenance", "native_test"],
  },
  {
    id: "audio-and-performance",
    requirement:
      "Contextual sound is audible and proportionate to the requested actions. Record same-environment frame-time/memory observations and actual hitches rather than inferring quality from object/audio counts.",
    evidence: ["audio_capture", "performance_capture"],
  },
];
const devBase = {
  version: caseVersion,
  suiteVersion: benchmarkVersion as typeof benchmarkVersion,
  track: "dev_task" as const,
  status: "unrun" as const,
  comparisonProfileId: "dev-v1" as const,
  assistanceTracks,
  requiredCheckpoints: [],
  checkpoints: [],
  referenceIds: [],
};
const gameBase = {
  version: caseVersion,
  suiteVersion: benchmarkVersion as typeof benchmarkVersion,
  track: "game_quality" as const,
  status: "unrun" as const,
  comparisonProfileId: "game-v1" as const,
  assistanceTracks,
  requiredCheckpoints: gameCheckpoints,
  requiredDevChecks: [],
  assetPolicy: assetSearchPolicy,
  fixture: {
    status: "prepared" as const,
    description:
      "Prepared empty floor/spawn template shared byte-for-byte across all three game cases; use its pinned export as the fresh session starting point.",
    artifactSha256: freshFixture.artifactSha256,
    exportHash: freshFixture.exportHash,
    directory: "benchmarks/fixtures/v1/fresh-game",
  },
};
const primaryGameBase = {
  ...gameBase,
  fixture: {
    ...gameBase.fixture,
    directory: "benchmarks/fixtures/v1/fresh-game-primary-v1",
  },
};

export const benchmarkCases: BenchmarkCase[] = [
  {
    ...devBase,
    id: "dev.animated-ability",
    title: "Readable server-authoritative firebolt",
    prompt:
      "In the supplied R15 test arena, add one firebolt ability without replacing the existing movement or HUD. Input starts a readable cast anticipation, then launches one projectile, followed by recovery. Use an actual rig-compatible animation or verifiable authored joint/keyframe motion, travel and impact VFX, scoped cast/impact sound, and a visible cooldown. The server owns cooldown, range, hit detection and damage. Verify accepted/rejected casts and the action as seen by a second client, including interruption and respawn. Keep this a focused feature; do not build a new game.",
    requiredGates: [
      "runtime_errors",
      "required_features",
      "animation",
      "combat_feedback",
      "ui",
    ],
    requiredDevChecks: [
      "cast-input",
      "server-hit-validation",
      "cooldown-rejection",
      "animation-replication",
      "interrupt-respawn-cleanup",
      "cooldown-ui",
    ],
    devCheckEvidence: {
      "cast-input": [["native_test"]],
      "server-hit-validation": [["deterministic_test"], ["native_test"]],
      "cooldown-rejection": [["deterministic_test"], ["native_test"]],
      "animation-replication": [
        ["gameplay_video", "native_animation"],
        ["native_test"],
      ],
      "interrupt-respawn-cleanup": [["native_test"]],
      "cooldown-ui": [["native_test"], ["gameplay_video"]],
    },
    fixture: {
      status: "unprepared",
      description:
        "Pin a minimal R15 arena with movement, basic HUD, server-owned target health and two-client test harness. Record starting hashes and known passing tests before running any model.",
      artifactSha256: null,
    },
    scope: [
      "One ability, one target class, one arena, desktop and touch activation",
      "Two-client observation of the same accepted cast",
    ],
    exclusions: [
      "No round system, progression, shop or fifteen-minute content requirement",
      "No general requirement for custom locomotion animations",
    ],
    featureDoD: [
      {
        id: "cast-input",
        requirement:
          "One valid activation produces one cast; rejected input never launches a duplicate projectile.",
        evidence: ["native_test", "gameplay_video"],
      },
      {
        id: "server-hit-validation",
        requirement:
          "Damage occurs only on a valid server hit; spoofed targets/range and client-reported damage are rejected.",
        evidence: ["deterministic_test", "native_test"],
      },
      {
        id: "cooldown-rejection",
        requirement:
          "Requests before and at the exact cooldown boundary behave correctly without duplicate damage.",
        evidence: ["deterministic_test", "native_test"],
      },
      {
        id: "animation-replication",
        requirement:
          "Anticipation, projectile release and recovery are visually distinguishable, rig-compatible and visible to the observing client.",
        evidence: ["gameplay_video", "native_test", "asset_provenance"],
      },
      {
        id: "interrupt-respawn-cleanup",
        requirement:
          "Death/interruption cancels stale cast state; respawn restores one working input binding and no leaked effects.",
        evidence: ["native_test", "runtime_log"],
      },
      {
        id: "cooldown-ui",
        requirement:
          "HUD shows availability and rejection reason without obscuring the target; actual cast and impact include audible and visible feedback.",
        evidence: ["gameplay_video", "screenshot"],
      },
    ],
    actionStoryboard: [
      {
        action: "Cast firebolt",
        anticipation:
          "0.15–0.35 second readable arm/upper-body windup and cast cue",
        execution:
          "Projectile leaves the indicated hand direction at a documented release marker",
        recovery:
          "Arm settles and cooldown remains visible; interruption cleans up",
        feedback:
          "Travel trail, localized impact flash and cast/impact sound; distinct miss versus hit",
        nativeEvidence:
          "Synchronized caster/observer capture including accepted cast, early retry, miss, hit and respawn",
      },
    ],
    assetPolicy: assetSearchPolicy,
  },
  {
    ...devBase,
    id: "dev.asset-integration",
    title: "Retrieve and integrate a coherent merchant prop",
    prompt:
      "In the supplied stylized quarry scene, search the available Roblox Creator Store or authorized catalog for a suitable merchant kiosk/workbench asset. Record the query, actual candidates, relevance and rejection reasoning, exact chosen identity and permission evidence. Import one appropriate asset into the assigned World scope, remove or justify executable content, match scale/materials and preserve the existing sell interaction. Show its appearance and collision/access behavior in Studio and record performance impact. If no suitable permissioned asset exists, document a procedural fallback honestly; that is useful progress but not a successful external-integration benchmark result.",
    requiredGates: ["runtime_errors", "required_features", "asset_integration"],
    requiredDevChecks: [
      "relevant-search",
      "selection-provenance",
      "permission-and-import",
      "style-and-scale",
      "interaction-preservation",
      "asset-performance",
    ],
    devCheckEvidence: {
      "relevant-search": [["asset_provenance"]],
      "selection-provenance": [["asset_provenance"]],
      "permission-and-import": [["asset_provenance"], ["native_test"]],
      "style-and-scale": [["screenshot", "gameplay_video"], ["native_test"]],
      "interaction-preservation": [["native_test"]],
      "asset-performance": [["performance_capture"]],
    },
    fixture: {
      status: "prepared",
      description:
        "Prepared public bundle of the frozen authored Crystal Hollow visual V2 quarry with its existing sell interaction. This is a starting fixture, not evidence that a model completed the asset task. Pin equal catalog access and permissions; no preselected asset IDs.",
      artifactSha256: quarryFixture.artifactSha256,
      exportHash: quarryFixture.exportHash,
      directory: "benchmarks/fixtures/v1/quarry-asset-integration",
    },
    scope: [
      "One external asset integrated into an existing interaction",
      "Search quality and import evidence, not candidate-count quotas",
    ],
    exclusions: [
      "No new gameplay loop, animation or audio requirement",
      "No paid purchase/upload implied by this case",
      "No fifteen-minute play requirement",
    ],
    featureDoD: [
      {
        id: "relevant-search",
        requirement:
          "Query matches intended function, visual style and available runtime/tool constraints; preserve returned evidence even if empty.",
        evidence: ["asset_provenance"],
      },
      {
        id: "selection-provenance",
        requirement:
          "Record chosen/rejected candidate reasoning and exact source/creator/version identity.",
        evidence: ["asset_provenance"],
      },
      {
        id: "permission-and-import",
        requirement:
          "Show permission for this use plus a real import receipt and scoped hierarchy; search results alone cannot pass.",
        evidence: ["asset_provenance", "native_test"],
      },
      {
        id: "style-and-scale",
        requirement:
          "The imported asset fits the quarry palette and human scale, reads as the merchant and does not visually duplicate unrelated kits.",
        evidence: ["screenshot", "gameplay_video"],
      },
      {
        id: "interaction-preservation",
        requirement:
          "Player can reach, face and use the original station; no unwanted scripts, collisions or interaction identity changes.",
        evidence: ["native_test", "runtime_log"],
      },
      {
        id: "asset-performance",
        requirement:
          "Record mesh/texture/instance cost and same-environment before/after frame-time and memory observations; counts are diagnostics, not visual scores.",
        evidence: ["performance_capture", "native_test"],
      },
    ],
    actionStoryboard: [],
    assetPolicy: assetSearchPolicy,
  },
  {
    ...devBase,
    id: "dev.replication-repair",
    title: "Repair double rewards and late-join state",
    prompt:
      "Repair the supplied collect-and-sell fixture: rapid duplicate sell requests can award coins twice, late joiners see stale shared-node stock, and respawn sometimes installs duplicate listeners. Preserve the existing economics, visuals and public interaction contract. Reproduce each bug, implement server-authoritative correction, and verify two clients, replayed requests, late join, death/respawn and repeated successful sales. Submit the minimal repair with before/after evidence; do not redesign the game.",
    requiredGates: ["runtime_errors", "required_features"],
    requiredDevChecks: [
      "bug-reproduced",
      "single-award",
      "late-join-stock",
      "respawn-listeners",
      "existing-economics",
    ],
    devCheckEvidence: {
      "bug-reproduced": [["deterministic_test"], ["native_test"]],
      "single-award": [["deterministic_test"], ["native_test"]],
      "late-join-stock": [["native_test"]],
      "respawn-listeners": [["native_test"]],
      "existing-economics": [["deterministic_test"], ["source_inspection"]],
    },
    fixture: {
      status: "unprepared",
      description:
        "Create and freeze an intentionally buggy isolated fixture with exactly the three documented failures and protected passing economics tests. A retrospective real project is not an equivalent paired starting state.",
      artifactSha256: null,
    },
    scope: [
      "Three linked replication/lifecycle defects in existing code",
      "Two-client native tests plus adversarial deterministic requests",
    ],
    exclusions: [
      "No new art, animation, VFX, audio, combat or fifteen-minute content gate",
      "Do not alter prices or rewards to hide failures",
    ],
    featureDoD: [
      {
        id: "bug-reproduced",
        requirement:
          "Each named regression fails on the immutable fixture and is tied to a specific observed behavior.",
        evidence: ["deterministic_test", "native_test"],
      },
      {
        id: "single-award",
        requirement:
          "Concurrent/replayed sell requests award exactly once and preserve nonnegative carry/coins.",
        evidence: ["deterministic_test", "native_test"],
      },
      {
        id: "late-join-stock",
        requirement:
          "A newly joined observer sees authoritative current stock and its next respawn transition.",
        evidence: ["native_test"],
      },
      {
        id: "respawn-listeners",
        requirement:
          "Repeated respawns produce one active interaction listener, no stale callback effects and continued valid sales.",
        evidence: ["native_test", "runtime_log"],
      },
      {
        id: "existing-economics",
        requirement:
          "Protected prices, yields and progression remain unchanged; unrelated passing paths still work.",
        evidence: ["deterministic_test", "source_inspection"],
      },
    ],
    actionStoryboard: [],
    assetPolicy: null,
  },
  {
    ...gameBase,
    id: "game.crystal-hollow",
    title: "Crystal Hollow: collect and upgrade",
    prompt:
      "Create Crystal Hollow, a small inviting luminous quarry for solo play that remains correct with a second player. The complete loop is harvest crystals, sell, choose between pick power and bag capacity, open a second quarry tier and light a personal beacon. Compose a readable camp, connected mining routes and a distinct deeper pocket before Play. Add two ore behaviors with a meaningful tradeoff, a readable harvesting action animation, depletion/respawn feedback, contextual audio and a responsive HUD. Introduce a short optional route challenge or changing quarry condition that gives repeat play a different decision. Search relevant authorized assets before procedural fallback and preserve provenance. Target a fifteen-minute observed session with early completion permitted only if replay/mastery remains meaningful; avoid timer padding or pure repeated grinding. No monetization or persistence is required.",
    requiredGates: [
      "runtime_errors",
      "core_progress",
      "required_features",
      "animation",
      "ui",
      "asset_sourcing",
    ],
    scope: [
      "Two connected quarry regions, one camp, two ore behaviors, two upgrade tracks and one personal goal",
      "A bounded optional route/condition variation rather than an enormous world",
      "Solo primary; two-client state and shared-stock verification",
    ],
    exclusions: [
      "No combat requirement",
      "No pets, trading, paid assets or live persistence",
      "Primitive geometry is allowed when deliberately composed; object counts alone never establish polish",
    ],
    featureDoD: [
      {
        id: "collect-loop",
        requirement:
          "Server-owned harvesting, selling and both upgrade choices work repeatedly; stock/carry/currency cannot be spoofed or duplicated.",
        evidence: ["deterministic_test", "native_test"],
      },
      {
        id: "quarry-progression",
        requirement:
          "New ore/tier access and optional route/condition variation change a decision rather than only increasing numbers.",
        evidence: ["gameplay_checkpoint", "gameplay_video"],
      },
      {
        id: "quarry-presentation",
        requirement:
          "Camp, paths, resources and goal have distinct silhouettes and coherent style; mining uses anticipation, strike and recovery with visible/audible outcome.",
        evidence: ["screenshot", "gameplay_video", "asset_provenance"],
      },
      {
        id: "quarry-usability",
        requirement:
          "Desktop/touch HUD communicates bag, coins, upgrade benefits and next goal; respawn and second-client stock preserve correct state.",
        evidence: ["native_test", "screenshot", "runtime_log"],
      },
      ...commonGameDoD,
    ],
    actionStoryboard: [
      {
        action: "Harvest a crystal",
        anticipation:
          "Player/tool draws back toward the selected reachable node",
        execution:
          "A visible stroke reaches a documented impact moment; server applies one allowed yield",
        recovery:
          "Tool settles with cooldown feedback and can be interrupted by death or movement",
        feedback:
          "Node hit, remaining stock, bag gain and depletion are distinct; contextual impact sound matches the contact",
        nativeEvidence:
          "Uncut action at first node plus depleted/full-bag rejection and an observing client",
      },
    ],
    checkpoints: [
      pendingCheckpoint(
        "onboarding",
        "At >=2 minutes: identify next goal and complete harvest→sell→first meaningful purchase without evaluator instructions.",
      ),
      pendingCheckpoint(
        "development",
        "At >=5 minutes: demonstrate both ore behaviors and explain a real power-versus-capacity tradeoff.",
      ),
      pendingCheckpoint(
        "progression",
        "At >=10 minutes: reach a new tier/route or changed quarry condition; capture the actual state transition and player decision.",
      ),
      pendingCheckpoint(
        "continued_play",
        "At >=15 minutes: show goal completion or a documented progression obstacle, then meaningful replay/mastery variation. Repeated unchanged harvesting is evidence of weak depth.",
      ),
    ],
    referenceIds: ["reference.mining-simulator-2", "history.crystal-hollow-v2"],
  },
  {
    ...gameBase,
    id: "game.round-combat",
    title: "Rift Watch: compact combat rounds",
    prompt:
      "Create Rift Watch, a compact stylized round-based PvE arena for one or two cooperating players. Use one readable arena with cover and safe spawn, three short escalating round patterns, two enemy behaviors with distinguishable telegraphs, one basic attack, one cooldown ability and one evade. The server owns damage, enemy state, cooldowns, rewards and round transitions. Animate attack anticipation, contact/release, recovery, enemy hit/death and relevant locomotion; align impact VFX and audio with actual accepted hits. Show health, ability state, enemy threat and round progression clearly on desktop and touch. After the initial sequence, offer a different round modifier or tactical challenge for meaningful replay during a fifteen-minute session. Search authorized compatible assets/animations/audio and document imports or justified fallback. No PvP, monetization, persistent inventory or large campaign.",
    requiredGates: [
      "runtime_errors",
      "core_progress",
      "required_features",
      "animation",
      "combat_feedback",
      "ui",
      "asset_sourcing",
    ],
    scope: [
      "One arena, two enemy behaviors, three round patterns, two attacks and one evade",
      "One/two-player PvE and bounded replay modifiers",
      "Two-client hit/round/respawn consistency",
    ],
    exclusions: [
      "No PvP matchmaking, open world, inventory economy or persistence",
      "No requirement for a full studio-scale animation library",
    ],
    featureDoD: [
      {
        id: "combat-authority",
        requirement:
          "Valid hits, misses, cooldowns, death, respawn and second-client observations agree with server state.",
        evidence: ["deterministic_test", "native_test", "runtime_log"],
      },
      {
        id: "combat-loop",
        requirement:
          "Rounds start, progress, end and restart without softlock; both enemy behaviors require distinguishable player responses.",
        evidence: ["native_test", "gameplay_checkpoint"],
      },
      {
        id: "combat-feel",
        requirement:
          "Telegraphs, action animation, hit reactions, VFX, audio and HUD communicate the same actual events; no silent instantaneous damage-only attacks.",
        evidence: ["gameplay_video", "native_test", "asset_provenance"],
      },
      {
        id: "combat-replay",
        requirement:
          "Later patterns/modifiers change positioning, target priority or timing; difficulty is readable and not merely inflated enemy health.",
        evidence: ["gameplay_checkpoint", "gameplay_video"],
      },
      ...commonGameDoD,
    ],
    actionStoryboard: [
      {
        action: "Attack and evade a telegraphed enemy",
        anticipation:
          "Distinct player windup and enemy warning define readable vulnerability windows",
        execution:
          "Release/contact marker aligns with authoritative hit resolution and evade state",
        recovery:
          "Attack settles, cooldown/health update, interrupted or dead actors stop acting",
        feedback:
          "Different hit, miss, damage-taken and enemy-death visual/audio outcomes without obscuring targets",
        nativeEvidence:
          "Caster and observer capture, repeated round transition, loss/respawn and both enemy patterns",
      },
    ],
    checkpoints: [
      pendingCheckpoint(
        "onboarding",
        "At >=2 minutes: complete first round using basic attack, cooldown ability and evade; identify enemy warning cues.",
      ),
      pendingCheckpoint(
        "development",
        "At >=5 minutes: encounter both enemy behaviors and a changed round pattern requiring a different response.",
      ),
      pendingCheckpoint(
        "progression",
        "At >=10 minutes: finish the initial round sequence and demonstrate recovery after death or loss without state corruption.",
      ),
      pendingCheckpoint(
        "continued_play",
        "At >=15 minutes: show a materially different modifier/tactic, readable challenge and stable repeated round lifecycle.",
      ),
    ],
    referenceIds: ["reference.super-bomb-survival"],
  },
  {
    ...gameBase,
    id: "game.lantern-adventure",
    title: "Lantern Vale: small environmental adventure",
    prompt:
      "Create Lantern Vale, a compact solo environmental adventure in two connected stylized regions. Restore a dim village lantern by solving three distinct environmental interactions: redirect light, operate a timed traversal mechanism and unlock a route using an observed clue. Use safe checkpoints, recoverable falls and an optional discovery route; completion should resolve a visible world state. Give lantern use and mechanism operation readable anticipation, motion and recovery, with contextual VFX/audio and clear objective feedback on desktop and touch. Compose landmarks, paths and scenery in Edit mode. Support a fifteen-minute observed session through exploration and one purposeful alternate-solution or mastery variation after early completion, not empty travel or forced waits. Search authorized style-compatible assets and record imports or a reasoned procedural fallback. No combat, collectible currency economy or monetization is required.",
    requiredGates: [
      "runtime_errors",
      "core_progress",
      "required_features",
      "animation",
      "ui",
      "asset_sourcing",
    ],
    scope: [
      "Two connected regions, three distinct interactions, checkpoint recovery and one optional discovery",
      "Solo primary, with a second client verifying personal progress isolation",
      "One bounded post-completion alternate route/solution",
    ],
    exclusions: [
      "No combat, enemy animation, shop, currency or persistence requirement",
      "No large narrative campaign or dialogue tree quota",
    ],
    featureDoD: [
      {
        id: "adventure-interactions",
        requirement:
          "Three interactions have different reasoning/action requirements and observable persistent-in-session consequences.",
        evidence: ["native_test", "gameplay_video"],
      },
      {
        id: "adventure-recovery",
        requirement:
          "Falls, respawn, re-entry and repeated mechanism use cannot softlock progress or grant another player personal completion.",
        evidence: ["deterministic_test", "native_test", "runtime_log"],
      },
      {
        id: "adventure-guidance",
        requirement:
          "Landmarks and clues make next steps discoverable; objective/HUD text fits and readable action animation confirms accepted interaction.",
        evidence: ["screenshot", "gameplay_video", "asset_provenance"],
      },
      {
        id: "adventure-depth",
        requirement:
          "Second region and optional variation introduce a new route or solution decision; a completed goal changes the visible world.",
        evidence: ["gameplay_checkpoint", "gameplay_video"],
      },
      ...commonGameDoD,
    ],
    actionStoryboard: [
      {
        action: "Aim lantern and operate a mechanism",
        anticipation:
          "Player raises the lantern or reaches for the mechanism with a visible target cue",
        execution:
          "Lantern/mechanism motion reveals the beam, clue or timed traversal state",
        recovery:
          "Interaction releases cleanly, restores locomotion and can be repeated after failure",
        feedback:
          "Light/color change, localized mechanism sound and concise objective update agree with server-accepted state",
        nativeEvidence:
          "Capture intended solution, wrong alignment, interrupted use, fall recovery and final world-state change",
      },
    ],
    checkpoints: [
      pendingCheckpoint(
        "onboarding",
        "At >=2 minutes: discover the first clue and complete the first light interaction without evaluator walkthrough.",
      ),
      pendingCheckpoint(
        "development",
        "At >=5 minutes: reach a new region or mechanism with a different interaction requirement.",
      ),
      pendingCheckpoint(
        "progression",
        "At >=10 minutes: complete the clue/traversal sequence and demonstrate checkpoint recovery after a failed attempt.",
      ),
      pendingCheckpoint(
        "continued_play",
        "At >=15 minutes: show final world-state resolution and optional discovery or alternate-solution mastery, recording any repetition or empty travel.",
      ),
    ],
    referenceIds: ["reference.adventure-forward-2"],
  },
  {
    ...primaryGameBase,
    id: "game.asmr-interaction",
    title: "Cloud Workshop: satisfying ASMR interactions",
    caseTier: "easy",
    primaryPlayerSetup: { count: 1, mode: "solo" },
    prompt:
      "Create Cloud Workshop, a small polished ASMR interaction game in one inviting workshop with three distinct stations: press a deformable-looking object, release and sort a small stream of physical marbles, and stamp or stack a finished piece. Search relevant authorized props, materials, sound and animation resources before a documented procedural fallback. Each action needs readable object/tool anticipation, satisfying motion/contact and recovery, synchronized sound, restrained VFX, and immediate understandable feedback. Make the marble station use actual bounded physics with containment and cleanup rather than only a scripted counter. Provide mouse/touch controls, volume and reduced-motion controls, clear goals and a small progression path that unlocks a new material/shape or interaction variation. Sustain a fifteen-minute observed session with genuinely different tactile decisions rather than forced waiting or repeating one action for larger numbers. Keep rewards server-owned and repeated interactions/respawn reliable. No combat, avatar attack-animation library, trading, saving or large world is required.",
    requiredGates: [
      "runtime_errors",
      "core_progress",
      "required_features",
      "animation",
      "ui",
      "asset_sourcing",
    ],
    requiredDevChecks: [
      "asmr-distinct-actions",
      "asmr-action-motion",
      "asmr-physics",
      "asmr-synchronized-sound",
      "asmr-ui-controls",
      "asmr-progression",
      "asset-search-and-fit",
      "audio-and-performance",
    ],
    devCheckEvidence: {
      "asmr-distinct-actions": [["native_test"], ["gameplay_video"]],
      "asmr-action-motion": [["native_animation"], ["gameplay_video"]],
      "asmr-physics": [["native_test"], ["performance_capture"]],
      "asmr-synchronized-sound": [["audio_capture"], ["gameplay_video"]],
      "asmr-ui-controls": [["native_test"], ["gameplay_video"]],
      "asmr-progression": [["native_test"], ["gameplay_checkpoint"]],
      "asset-search-and-fit": [["asset_provenance"], ["native_test"]],
      "audio-and-performance": [["audio_capture"], ["performance_capture"]],
    },
    scope: [
      "One composed workshop, three tactile stations, two unlockable material/shape variations and one short goal chain",
      "No more than 32 active loose physics pieces; recycle/clean up after interaction",
      "Solo primary with server-owned progression and separate observer/respawn checks",
    ],
    exclusions: [
      "No combat, avatar attack-animation quota, persistence, player economy or large map",
      "Deformable-looking authored motion is allowed; do not claim unsupported general soft-body physics",
      "Satisfaction is judged from actual motion/audio and player observation, not VFX or asset counts",
    ],
    featureDoD: [
      {
        id: "asmr-distinct-actions",
        requirement:
          "Pressing, physical marble release/sorting and stamping/stacking have visibly different inputs, outcomes and tactile decisions; repeated cycles work without duplicate rewards.",
        evidence: ["native_test", "gameplay_video"],
      },
      {
        id: "asmr-action-motion",
        requirement:
          "Actual object/deformation/mechanism motion has anticipation, contact and recovery, cancels safely and remains aligned with input; avatar combat clips are not required.",
        evidence: ["native_animation", "gameplay_video"],
      },
      {
        id: "asmr-physics",
        requirement:
          "Marbles fall and collide under native physics, remain contained, and recycle within the 32-piece bound; repeated release/spam and reset remain stable on the pinned device.",
        evidence: ["native_test", "performance_capture"],
      },
      {
        id: "asmr-synchronized-sound",
        requirement:
          "Distinct press, rolling/contact and stamping sound fits the actual action timing and material; capture the audible result and verify volume control.",
        evidence: ["audio_capture", "gameplay_video"],
      },
      {
        id: "asmr-ui-controls",
        requirement:
          "Mouse/touch targets, goal/reward feedback, volume and reduced-motion settings work without obstructing the interaction; respawn restores usable controls.",
        evidence: ["native_test", "gameplay_video"],
      },
      {
        id: "asmr-progression",
        requirement:
          "Unlocks change material response, shape or a sorting/stacking decision; server-owned progress cannot be inflated by rapid client claims and later play is more than repetition.",
        evidence: ["native_test", "gameplay_checkpoint"],
      },
      ...commonGameDoD,
    ],
    actionStoryboard: [
      {
        action: "Press and release",
        anticipation: "Tool/object visibly aligns and begins compression",
        execution:
          "Compression/contact reaches a clear moment with material-specific sound and subtle particles",
        recovery:
          "Object/tool settles or springs back; cancel/reset returns to a valid state",
        feedback:
          "Local contact sound, visible material response and concise completion cue",
        nativeEvidence:
          "Actual mechanism/deformation capture at normal speed, held input, cancellation, repeated cycle and reduced-motion mode",
      },
      {
        action: "Release and sort marbles",
        anticipation:
          "Gate opens with a visible target tray and expected amount",
        execution:
          "Native physical pieces roll/fall/collide and can be directed into different trays",
        recovery:
          "Gate closes, pieces settle or recycle and the station becomes ready",
        feedback:
          "Rolling/contact sounds and clear sorting outcome reflect actual positions",
        nativeEvidence:
          "Native physics capture plus active-body count, repeated releases and frame-time observations",
      },
    ],
    checkpoints: [
      pendingCheckpoint(
        "onboarding",
        "At >=2 active minutes: discover and complete a satisfying first action with aligned motion, sound and visible outcome.",
      ),
      pendingCheckpoint(
        "development",
        "At >=5 active minutes: use all three distinct stations and show a real physical sorting or stacking decision.",
      ),
      pendingCheckpoint(
        "progression",
        "At >=10 active minutes: unlock and use a material/shape variation that changes the action, not just its score.",
      ),
      pendingCheckpoint(
        "continued_play",
        "At >=15 active minutes: demonstrate a new combination/mastery goal and stable repeated physics; record boredom, repetition or timing faults honestly.",
      ),
    ],
    referenceIds: [],
  },
  {
    ...primaryGameBase,
    id: "game.collect-and-steal",
    title: "Hatchling Heist: collect, defend and steal",
    caseTier: "medium",
    primaryPlayerSetup: { count: 2, mode: "competitive" },
    prompt:
      "Create Hatchling Heist, a bounded multiplayer collect-and-steal game inspired by the gameplay archetype of Steal a Brainrot, using original characters, names, art and branding. Build two readable player bases with six slots each and a shared market/collection lane with six original collectible types across three value tiers. Players collect or buy creatures, carry and deposit them to produce currency, purchase meaningful base/carry upgrades, attempt telegraphed thefts and complete one clearly explained rebirth/reset with a bounded retained bonus. Implement safe zones and timed base protection, explicit ownership, interrupted carry/theft recovery and readable risk/reward. Use real two-client tests for simultaneous steal/deposit attempts, protection boundaries and final ownership; clients never choose authoritative rewards or owners. Save currency, owned collectibles, upgrades and rebirth state with Roblox's real service in an already-authorized namespaced test experience. Prove write/read and reconnect/rejoin in a fresh server/session with service-backed receipts; mock DataStores and same-session memory do not establish saving. If service access is unavailable, leave that requirement pending. Include creature/interaction animations, contextual VFX/SFX, legible desktop/touch UI and a coherent market/base environment. Search authorized assets with provenance and original-character compatibility. Observe fifteen active minutes of economy, theft/defense and progression. No paid monetization, real-money transactions, cross-server trading or large world.",
    requiredGates: [
      "runtime_errors",
      "core_progress",
      "required_features",
      "animation",
      "ui",
      "asset_sourcing",
    ],
    requiredDevChecks: [
      "heist-collect-deposit",
      "heist-authoritative-economy",
      "heist-two-client-theft",
      "heist-safe-zones",
      "heist-upgrades-rebirth",
      "heist-service-save",
      "heist-lifecycle",
      "heist-presentation",
      "asset-search-and-fit",
      "audio-and-performance",
    ],
    devCheckEvidence: {
      "heist-collect-deposit": [["native_test"]],
      "heist-authoritative-economy": [["deterministic_test"], ["native_test"]],
      "heist-two-client-theft": [["native_test"], ["gameplay_video"]],
      "heist-safe-zones": [["native_test"], ["gameplay_video"]],
      "heist-upgrades-rebirth": [["native_test"], ["gameplay_checkpoint"]],
      "heist-service-save": [["native_test"]],
      "heist-lifecycle": [["native_test"], ["runtime_log"]],
      "heist-presentation": [
        ["native_animation"],
        ["gameplay_video"],
        ["audio_capture"],
      ],
      "asset-search-and-fit": [["asset_provenance"], ["native_test"]],
      "audio-and-performance": [["audio_capture"], ["performance_capture"]],
    },
    scope: [
      "Two bases with six slots, six original collectible types in three value tiers and one shared market lane",
      "Collect/buy→carry→deposit→income, two meaningful upgrade choices, one rebirth tier and telegraphed theft/defense",
      "Two real clients for ownership tests; real service-backed namespaced persistence across a fresh server/session",
    ],
    exclusions: [
      "Do not copy protected Brainrot characters, branding or assets; the user supplied a gameplay archetype, not a named reference asset license",
      "No real-money monetization, cross-server trading, sprawling world or unlimited rebirth grind",
      "No mock-only persistence pass, automatic publishing or unrequested enabling of production API access",
    ],
    featureDoD: [
      {
        id: "heist-collect-deposit",
        requirement:
          "Both players can obtain, carry and deposit creatures into their own bounded slots; accepted deposits establish one owner and visibly produce server-owned income.",
        evidence: ["native_test"],
      },
      {
        id: "heist-authoritative-economy",
        requirement:
          "Spoofed prices/rewards/owners, duplicate purchases/deposits and concurrent requests cannot mint currency, duplicate creatures or create multiple owners.",
        evidence: ["deterministic_test", "native_test"],
      },
      {
        id: "heist-two-client-theft",
        requirement:
          "Two actual clients observe the same telegraphed theft, interruption/drop and final deposit; simultaneous attempts yield exactly one authoritative final owner with no duplicate inventory.",
        evidence: ["native_test", "gameplay_video"],
      },
      {
        id: "heist-safe-zones",
        requirement:
          "Safe-zone/protection boundaries and expiration are enforced server-side and visibly explained to both clients, including a request exactly at the protection transition.",
        evidence: ["native_test", "gameplay_video"],
      },
      {
        id: "heist-upgrades-rebirth",
        requirement:
          "Base/carry upgrades change a decision; one confirmation-led rebirth resets declared fields, preserves only the documented bonus and is not applied twice.",
        evidence: ["native_test", "gameplay_checkpoint"],
      },
      {
        id: "heist-service-save",
        requirement:
          "Record real Roblox service-backed write/read receipts in an already-authorized isolated test namespace, including anonymized player/session identity and saved revision/fields. Rejoin a fresh server/session and verify currency, collectible ownership, upgrades and rebirth state. In-memory or mocked stores cannot pass; access/errors or absent fresh-session proof remain pending. Do not expose credentials or treat this criterion as permission to publish/enable production services.",
        evidence: ["native_test"],
      },
      {
        id: "heist-lifecycle",
        requirement:
          "Disconnect/death while carrying or stealing has a defined nonduplicating recovery; both players' respawn and late join show consistent current ownership and base state without runtime errors.",
        evidence: ["native_test", "runtime_log"],
      },
      {
        id: "heist-presentation",
        requirement:
          "Original creatures have readable idle/carry/deposit or theft motion; warnings, VFX/SFX, ownership indicators and currency/upgrade/rebirth UI remain coherent and legible on desktop/touch.",
        evidence: ["native_animation", "gameplay_video", "audio_capture"],
      },
      ...commonGameDoD,
    ],
    actionStoryboard: [
      {
        action: "Carry, steal and deposit",
        anticipation:
          "Creature and target base highlight, protection status and a visible theft warning establish intent",
        execution:
          "Carry/steal motion follows server-accepted state while the defender sees the same threat",
        recovery:
          "Deposit, interruption or drop resolves to one owner and restores normal controls",
        feedback:
          "Distinct theft alarm, deposit confirmation, ownership marker and income update match authoritative state",
        nativeEvidence:
          "Synchronized two-client attempt, defender interruption, simultaneous thief requests and final inventories",
      },
      {
        action: "Rebirth and reconnect",
        anticipation:
          "UI explains exactly what resets and what is retained, requiring a deliberate confirmation",
        execution:
          "Server applies one reset and writes a versioned state to the approved test service",
        recovery:
          "Fresh server/session reload restores the correct post-rebirth state",
        feedback:
          "Celebration and clear retained bonus; service errors are reported without a fake success",
        nativeEvidence:
          "Actual approved service receipts plus fresh-session state observations, distinct from local mocks",
      },
    ],
    checkpoints: [
      pendingCheckpoint(
        "onboarding",
        "At >=2 active minutes: each client claims a base, obtains a creature and performs a valid deposit with clear income/ownership.",
      ),
      pendingCheckpoint(
        "development",
        "At >=5 active minutes: demonstrate a defended theft attempt, protection boundary and meaningful upgrade choice.",
      ),
      pendingCheckpoint(
        "progression",
        "At >=10 active minutes: execute a successful/interrupted theft and bounded rebirth without duplication; show changing economy decisions.",
      ),
      pendingCheckpoint(
        "continued_play",
        "At >=15 active minutes: both clients still have consistent ownership and meaningful collect/defend/steal choices. Run the service-backed fresh-session persistence proof separately; do not splice that reset into this session's active-time evidence.",
      ),
    ],
    referenceIds: [],
  },
  {
    ...primaryGameBase,
    id: "game.small-fighting",
    title: "Pulse Duel: small polished fighting game",
    caseTier: "hard",
    primaryPlayerSetup: { count: 2, mode: "competitive" },
    prompt:
      "Create Pulse Duel, a small polished fighting game with one coherent arena, one original fighter moveset, a three-hit light combo with a clear continuation/recovery window, two distinct cooldown abilities and one defensive evade. Include a training target and real two-client duels through short rounds with loss, respawn and replay. The server owns move legality, hitboxes, damage, stun, invulnerability, cooldowns and round outcome. Animate locomotion as relevant, combo anticipation/contact/recovery, both abilities, hit reaction and defeat; animation IDs alone are not evidence of playing motion. Align VFX, audible SFX, modest configurable camera feedback and cooldown/health UI with actual accepted hits, with distinct hit/miss/block-or-evade results and reduced-motion support. Verify combo timing, overlapping/simultaneous hits, range/occlusion, cooldown spam and replication from both viewpoints under a declared latency profile. Compose a readable finished arena and original visual identity; search compatible authorized character, animation, VFX and audio assets with permission/import proof or justified fallback. Fifteen active minutes should expose tactical variety and repeated stable rounds, not just a damage counter on a dummy. No ranked matchmaking, large roster, open world, monetization or persistence.",
    requiredGates: [
      "runtime_errors",
      "core_progress",
      "required_features",
      "animation",
      "combat_feedback",
      "ui",
      "asset_sourcing",
    ],
    requiredDevChecks: [
      "fight-combo-timing",
      "fight-hitbox-authority",
      "fight-abilities-cooldowns",
      "fight-native-motion",
      "fight-feedback-camera",
      "fight-two-client-replication",
      "fight-round-lifecycle",
      "fight-ui",
      "asset-search-and-fit",
      "audio-and-performance",
    ],
    devCheckEvidence: {
      "fight-combo-timing": [["native_test"], ["gameplay_video"]],
      "fight-hitbox-authority": [["deterministic_test"], ["native_test"]],
      "fight-abilities-cooldowns": [["deterministic_test"], ["native_test"]],
      "fight-native-motion": [["native_animation"], ["gameplay_video"]],
      "fight-feedback-camera": [["gameplay_video"], ["audio_capture"]],
      "fight-two-client-replication": [["native_test"], ["gameplay_video"]],
      "fight-round-lifecycle": [["native_test"], ["runtime_log"]],
      "fight-ui": [["native_test"], ["gameplay_video"]],
      "asset-search-and-fit": [["asset_provenance"], ["native_test"]],
      "audio-and-performance": [["audio_capture"], ["performance_capture"]],
    },
    scope: [
      "One arena, one original moveset, three-hit light combo, two cooldown abilities and one evade",
      "One training target plus actual two-client duels, short rounds and replay",
      "Readable polish and tactical interaction within a small scope, not a competitive commercial release",
    ],
    exclusions: [
      "No ranked matchmaking, large character roster, open world, saving or monetization",
      "Do not substitute a dummy-only test for replication or a source-defined Animation object for observed playing motion",
    ],
    featureDoD: [
      {
        id: "fight-combo-timing",
        requirement:
          "Combo steps have actual anticipation, contact and recovery windows; timely continuation, late input, interruption and reset produce documented distinct outcomes.",
        evidence: ["native_test", "gameplay_video"],
      },
      {
        id: "fight-hitbox-authority",
        requirement:
          "Server checks move state, range/occlusion and hit eligibility; overlapping/simultaneous attacks, invulnerability and spoofed client damage cannot duplicate or invent accepted hits.",
        evidence: ["deterministic_test", "native_test"],
      },
      {
        id: "fight-abilities-cooldowns",
        requirement:
          "Both abilities and evade have different tactical uses and consistent server-enforced cooldown/cancel rules, including spam and exact boundary tests.",
        evidence: ["deterministic_test", "native_test"],
      },
      {
        id: "fight-native-motion",
        requirement:
          "Actual rig-compatible combo, abilities, hit reaction and defeat motion plays with coherent transitions; release/contact markers align with move resolution in native capture.",
        evidence: ["native_animation", "gameplay_video"],
      },
      {
        id: "fight-feedback-camera",
        requirement:
          "Hit, miss and evade have distinguishable synchronized VFX/SFX; camera feedback is modest, configurable and respects reduced motion without hiding opponents or altering server outcomes.",
        evidence: ["gameplay_video", "audio_capture"],
      },
      {
        id: "fight-two-client-replication",
        requirement:
          "Two real clients agree on accepted hits, health, stun, cooldown and round winner under the declared latency profile; capture both viewpoints and reconcile any discrepancy.",
        evidence: ["native_test", "gameplay_video"],
      },
      {
        id: "fight-round-lifecycle",
        requirement:
          "Training and repeated duels support death, respawn, disconnect/late join and restart without stale listeners, effects or round state; runtime errors are absent in covered paths.",
        evidence: ["native_test", "runtime_log"],
      },
      {
        id: "fight-ui",
        requirement:
          "Desktop/touch health, round and cooldown displays track authoritative state; input targets remain usable while camera/motion feedback occurs.",
        evidence: ["native_test", "gameplay_video"],
      },
      ...commonGameDoD,
    ],
    actionStoryboard: [
      {
        action: "Three-hit combo into ability or evade",
        anticipation:
          "Readable windup signals each strike and a clear continuation window",
        execution:
          "Contact/release markers align with server hitboxes; abilities and evade visibly differ",
        recovery:
          "Miss/hit/cancel leads to documented recovery, vulnerability or reset instead of instant repeated attacks",
        feedback:
          "Localized impact SFX/VFX, hit reaction, restrained camera impulse and cooldown/health change agree across clients",
        nativeEvidence:
          "Both-client footage of full combo, dropped combo, simultaneous hit, evade, ability use and reduced-motion mode",
      },
    ],
    checkpoints: [
      pendingCheckpoint(
        "onboarding",
        "At >=2 active minutes: demonstrate readable combo stages, both abilities and evade on a training target with actual playing motion.",
      ),
      pendingCheckpoint(
        "development",
        "At >=5 active minutes: complete a real two-client duel and show consistent hits, reactions, cooldowns and outcome.",
      ),
      pendingCheckpoint(
        "progression",
        "At >=10 active minutes: demonstrate tactical variation through combo interruption, spacing, ability timing and defense rather than repeated identical hits.",
      ),
      pendingCheckpoint(
        "continued_play",
        "At >=15 active minutes: repeated rounds remain stable and readable under the declared latency profile; capture death/respawn and player-observed responsiveness limits.",
      ),
    ],
    referenceIds: [],
  },
];

export const referenceLibrary = [
  {
    id: "reference.mining-simulator-2",
    title: "Mining Simulator 2",
    creator: "Rumble Studios",
    sourceUrl: "https://www.roblox.com/games/9551640993/Mining-Simulator-2",
    kind: "external_reference",
    provenance:
      "Official experience page title/creator checked 2026-09-15; no gameplay review performed.",
    intendedComparison:
      "Potential reference for resource-loop clarity and presentation, not an equal-budget or required feature-depth target.",
    reviewStatus: "unreviewed",
    rating: null,
    captures: [],
    rightsStatus: "metadata_only_no_reuse_permission_inferred",
  },
  {
    id: "reference.super-bomb-survival",
    title: "Super Bomb Survival",
    creator: "Polyhex Games",
    sourceUrl: "https://www.roblox.com/games/164051105/Super-Bomb-Survival",
    kind: "external_reference",
    provenance:
      "Official experience page title/creator checked 2026-09-15; no gameplay review performed.",
    intendedComparison:
      "Potential reference for hazard/round readability and feedback; different mechanics and production scale from Rift Watch.",
    reviewStatus: "unreviewed",
    rating: null,
    captures: [],
    rightsStatus: "metadata_only_no_reuse_permission_inferred",
  },
  {
    id: "reference.adventure-forward-2",
    title: "Adventure Forward 2",
    creator: null,
    sourceUrl: "https://www.roblox.com/games/718034741/Adventure-Forward-2",
    kind: "external_reference",
    provenance:
      "Official Roblox page title located 2026-09-15; creator/version/current playability not independently verified.",
    intendedComparison:
      "Candidate for later landmark/traversal study only; no quality tier assigned.",
    reviewStatus: "unreviewed",
    rating: null,
    captures: [],
    rightsStatus: "metadata_only_no_reuse_permission_inferred",
  },
  {
    id: "history.crystal-hollow-v2",
    title: "Crystal Hollow visual V2 (authored expert refinement)",
    creator: "Takko evaluation with expert assistance",
    sourceUrl: null,
    localEvidence: "docs/crystal-hollow-polished-native-verification.md",
    kind: "retrospective_anchor",
    provenance:
      "Historical gameplay/visual evidence exists, but the candidate was not run under this benchmark's prompt, budgets or fifteen-minute protocol.",
    intendedComparison:
      "Retrospective debugging/presentation discussion only. Not a fair paired run or preassigned quality tier.",
    reviewStatus: "unreviewed",
    rating: null,
    captures: [],
    rightsStatus: "local_evidence_preserve_originals",
  },
] as const;

export function getBenchmarkCase(id: string): BenchmarkCase {
  const definition = benchmarkCases.find((c) => c.id === id);
  if (!definition) throw Error("Unknown benchmark case: " + id);
  return structuredClone(definition);
}
