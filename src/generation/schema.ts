import { architectureSchema } from "./architecture";
import { sceneClasses } from "./capabilities";
import { z } from "zod";
import { assetNeedSchema, type AssetPipelineRun } from "./asset-contract";
import type { ResearchDossier } from "./research";
export const phaseSchema = z.enum([
  "research",
  "planner",
  "builder",
  "reviewer",
  "repair",
]);
export type Phase = z.infer<typeof phaseSchema>;
export const DEFAULT_REQUEST_TIMEOUT_MS = 600000;
const id = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/);
const text = z.string().trim().min(1).max(12000);
const scriptPath = z
  .string()
  .min(1)
  .max(240)
  .regex(/\.luau$/)
  .describe(
    "A script path ending in .luau, .server.luau or .client.luau; never a scene object path",
  );
export const providerSchema = z
  .object({
    id: z.uuid(),
    name: z.string().min(1).max(80),
    provider: z.enum([
      "openrouter",
      "openai",
      "anthropic",
      "gemini",
      "compatible",
    ]),
    baseUrl: z.url(),
    model: z.string().trim().max(160),
    inputRate: z.number().finite().min(0).max(1000),
    outputRate: z.number().finite().min(0).max(1000),
    pricingSource: z.enum(["catalog", "manual", "unknown"]).optional(),
    maxOutputTokens: z.number().int().min(512).max(32768).default(8192),
    reasoningEffort: z.enum(["low", "medium", "high"]).optional(),
    requestTimeoutMs: z.number().int().min(1000).max(600000).optional(),
    jsonMode: z.boolean().default(true),
    /** Opt-in concept contract, capability-checked against the pinned endpoint. */
    structuredOutput: z.literal("anthropic").optional(),
  })
  .strict();
export type Profile = z.infer<typeof providerSchema>;
const baseSettingsSchema = z
  .object({
    profiles: z.array(providerSchema).max(30),
    routes: z
      .object({
        research: z.array(z.uuid()).max(3).optional(),
        planner: z.array(z.uuid()).max(3),
        builder: z.array(z.uuid()).max(3),
        reviewer: z.array(z.uuid()).max(3),
        componentReviewer: z.array(z.uuid()).max(1).optional(),
        componentAdapter: z.array(z.uuid()).max(1).optional(),
        decisions: z.array(z.uuid()).max(1).optional(),
        repair: z.array(z.uuid()).max(3),
      })
      .strict(),
    budgetMicros: z.number().int().min(1000).max(100_000_000),
    generationBudgetMicros: z
      .number()
      .int()
      .min(1000)
      .max(100_000_000)
      .optional(),
    reservationBudgetMicros: z
      .number()
      .int()
      .min(1000)
      .max(100_000_000)
      .optional(),
    repairLimit: z.number().int().min(0).max(3),
    researchEnabled: z.boolean().optional(),
  })
  .strict();
export const presetSchema = baseSettingsSchema.omit({ profiles: true }).extend({
  id: z.uuid(),
  name: z.string().trim().min(1).max(60),
  icon: z
    .enum(["taco", "bolt", "spark", "leaf", "rocket", "robot"])
    .default("taco"),
});
export type ModelPreset = z.infer<typeof presetSchema>;
export const settingsSchema = baseSettingsSchema.extend({
  presets: z.array(presetSchema).max(50).optional(),
  activePresetId: z.uuid().nullable().optional(),
});
export type Settings = z.infer<typeof settingsSchema>;
export const requirementSchema = z
  .object({
    id,
    description: text,
    sourceId: z
      .string()
      .min(1)
      .max(100)
      .optional()
      .describe(
        "For user requirements, select an id from userSources. Forge copies the evidence from that source.",
      ),
    sourceQuote: z.string().max(3000).default(""),
    origin: z.enum(["user", "inferred"]),
    category: z.enum([
      "mechanic",
      "world",
      "ui",
      "animation",
      "audio",
      "network",
      "lifecycle",
      "presentation",
    ]),
    priority: z.enum(["required", "optional"]),
    acceptance: text,
  })
  .strict();
export const taskSchema = z
  .object({
    proposalSections: z
      .array(z.enum(["mechanics", "theme", "environment", "assets"]))
      .min(1)
      .optional()
      .describe(
        "Approved document section dependencies, NOT requirement category labels. Only mechanics, theme, environment, assets are legal. UI, animation, audio, network and lifecycle are categories, never section names. A HUD behavior depends on mechanics, its styling on theme, and its placement on environment. An animation asset depends on assets and its trigger on mechanics. Include only actual dependencies.",
      ),
    id,
    title: text,
    requirements: z.array(id).min(1),
    dependsOn: z.array(id),
    files: z
      .array(scriptPath)
      .max(8)
      .describe(
        "Owned script paths; use an empty array for scene-only tasks or discovery-dependent tasks whose necessary integration scripts are not yet known. After inspection, declare only necessary integration scripts with exclusive ownership.",
      ),
  })
  .strict();
export const specSchema = z
  .object({
    architectureProposal: architectureSchema
      .optional()
      .describe(
        "Propose the game runtime systems and their event/state connections. This is a proposed architecture, not the build-task dependency DAG. Include server authority for gameplay rules. User acceptance is required before it becomes a saved architecture contract.",
      ),
    assetNeeds: z.array(assetNeedSchema).max(16).optional(),
    assetStrategy: z.string().min(1).max(3000).optional(),
    title: z.string().min(1).max(80),
    summary: text,
    visualDirection: text,
    requirements: z.array(requirementSchema).min(1).max(40),
    questions: z
      .array(
        z
          .object({
            id,
            prompt: text,
            selection: z.enum(["single", "multiple", "text"]).optional(),
            optional: z.boolean().optional(),
            options: z.array(z.string().max(200)).max(5),
          })
          .strict(),
      )
      .max(6),
    tasks: z.array(taskSchema).min(1).max(64),
    referenceDecisions: z
      .array(
        z
          .object({
            mechanicId: id,
            action: z.enum(["include", "adapt", "omit"]),
            requirementIds: z.array(id).max(40),
            reason: z.string().min(1).max(1500),
            userSourceId: z.string().max(100).optional(),
            userQuote: z.string().max(3000).optional(),
          })
          .strict(),
      )
      .max(20)
      .optional(),
  })
  .strict();
export type Spec = z.infer<typeof specSchema>;
export const valueSchema = z.union([
  z.string().max(3000),
  z.number().finite(),
  z.boolean(),
  z
    .object({
      type: z.literal("Ref"),
      path: z.string().min(1).max(240).nullable(),
    })
    .strict()
    .describe(
      "Instance reference to an exact scene path in this project; null clears the reference. Resolve after all instances exist.",
    ),
  z
    .object({
      type: z.enum(["Vector3", "Color3", "CFrame", "UDim2", "UDim", "Vector2"]),
      value: z.array(z.number().finite()).max(12),
    })
    .strict(),
  z
    .object({
      type: z.literal("Enum"),
      enum: z.string().regex(/^[A-Za-z]+$/),
      value: z.number().int().nonnegative(),
    })
    .strict(),
]);
export type PropertyValue = z.infer<typeof valueSchema>;
export const nodeSchema = z
  .object({
    path: z.string().min(1).max(240),
    className: z.enum(sceneClasses),
    properties: z.record(z.string(), valueSchema),
  })
  .strict();
export const fileSchema = z
  .object({
    path: z.string().min(1).max(240),
    kind: z.enum(["Script", "LocalScript", "ModuleScript"]),
    source: z.string().min(1).max(120000),
  })
  .strict();
export const coverageSchema = z
  .object({
    requirementId: id,
    status: z.enum(["implemented", "blocked"]),
    detail: text,
    files: z
      .array(z.string())
      .max(20)
      .describe(
        "Exact existing script OR scene-node paths proving this requirement. Implemented coverage must have at least one path, including for scene-only tasks.",
      ),
  })
  .strict();
export const assetSchema = z
  .object({
    id,
    requirementId: id,
    kind: z.enum(["animation", "audio", "image", "mesh", "model"]),
    assetId: z.string().regex(/^\d+$/).nullable(),
    sourceUrl: z.string().max(2000).nullable().default(null),
    status: z.enum([
      "provided",
      "needed",
      "procedural",
      "builtin",
      "retrieved",
    ]),
    description: text,
  })
  .strict();
export const bundleSchema = z
  .object({
    files: z.array(fileSchema).max(60).default([]),
    scene: z.array(nodeSchema).max(600).default([]),
    coverage: z.array(coverageSchema).max(80).default([]),
    assets: z.array(assetSchema).max(80).default([]),
    retainedPhysics: z
      .array(
        z
          .object({
            needId: id,
            mode: z.enum(["anchor_all", "deliberately_dynamic"]),
            reason: z.string().trim().min(1).max(1200),
          })
          .strict(),
      )
      .max(16)
      .optional()
      .describe(
        "Explicit integration decisions for retained visible props with disconnected unanchored parts. anchor_all is applied by the host to the delivery copy. deliberately_dynamic requires a gameplay reason and native verification.",
      ),
  })
  .strict();
export type Bundle = z.infer<typeof bundleSchema>;
export const reviewSchema = z
  .object({
    issues: z
      .array(
        z
          .object({
            requirementId: id,
            severity: z.enum(["error", "warning"]),
            message: text,
          })
          .strict(),
      )
      .max(80),
    tests: z
      .array(
        z
          .object({
            id,
            requirementId: id,
            mode: z.enum(["server", "client"]),
            source: z.string().min(1).max(12000),
          })
          .strict(),
      )
      .min(1)
      .max(40),
  })
  .strict();
export type Review = z.infer<typeof reviewSchema>;
export type Check = {
  id: string;
  status: "passed" | "failed" | "pending";
  detail: string;
};
export type Charge = {
  requestId?: string;
  opencodeRunId?: string;
  billingSource?: "provider" | "configured-rate" | "reservation";
  phase: Phase;
  profileId: string;
  model: string;
  reservedMicros: number;
  chargedMicros: number;
  estimated: boolean;
  inputTokens: number | null;
  outputTokens: number | null;
  /** Provider-reported cache reads; absent means unreported, not zero. */
  cachedInputTokens?: number;
  status: "ok" | "error";
  at: string;
};
export type Project = {
  assetChoiceRequest?: { id: string; groupId: string };
  clarificationQuestions?: import("./questions").StructuredQuestion[];
  /** Absent on legacy projects. Never infer a template while loading/exporting. */
  world?: import("./world-policy").WorldDecision;
  platform?: import("./platform-policy").PlatformDecision;
  rig?: import("./rig-policy").RigDecision;
  /** User-owned exclusions for this project/run, never a global catalog blacklist. */
  excludedAssetIds?: string[];
  assetPipelineHistory?: AssetPipelineRun[];
  assetEvidenceBindings?: Record<
    string,
    {
      fingerprint: string;
      origin: { runId: string; revision: number; inputHash: string };
    }
  >;
  proposal?: import("./proposal").Proposal;
  proposalPlan?: import("./proposal").ProposalPlan;
  pendingProposalEdit?: {
    id: string;
    text: string;
    baseRevision: number;
    baseHash: string;
    submissionHash: string;
    answers?: Record<string, string>;
  };
  implementationBackup?: {
    artifact: Bundle;
    completedBuildTasks: string[];
    review: Review | null;
    checks: Check[];
    spec: Spec;
    plan?: import("./proposal").ProposalPlan;
    changed: import("./proposal").Proposal["changed"];
    scopedPaths?: { files: string[]; scene: string[] };
  };
  implementationCandidate?: {
    hash: string;
    artifact: Bundle;
    completedBuildTasks: string[];
    spec: Spec;
    plan?: import("./proposal").ProposalPlan;
    scopedPaths?: { files: string[]; scene: string[] };
  };
  staleImplementation?: boolean;
  decisionAdvice?: {
    identity: string;
    task: string;
    at: string;
    result: import("./decisions").DecisionResult;
  }[];
  executionMode?: "coordinator" | "opencode";
  opencodeRuns?: import("./opencode-runtime").OpenCodeRun[];
  opencodePending?: {
    requestId: string;
    runId?: string;
    profileId: string;
    model: string;
    phase: Phase;
    reservedMicros: number;
    at: string;
  }[];
  coordination?: import("./coordinator").Coordination;
  briefApprovedRevision?: number;
  assetDiscovery?: import("../marketplace/discovery").AssetDiscovery;
  assetChoiceAttachmentIds?: string[];
  conversationBefore?: string | null;
  conversation?: import("./conversation").ConversationTurn[];
  briefChanges?: import("./conversation").BriefChange[];
  architecture?: import("./architecture").GameArchitecture;
  queuedMessages?: import("./message-queue").QueuedMessage[];
  submissions?: { id: string; hash: string }[];
  conceptAcceptedRevision?: number;
  animationClips?: import("./animation").SavedAnimation[];
  animationPacks?: import("../marketplace/animations").SavedAnimationPack[];
  concept?: import("./concept").GameConcept | null;
  assetAttachments?: import("../marketplace/types").AssetAttachment[];
  assetStudioId?: string;
  assetPipeline?: AssetPipelineRun | null;
  schemaVersion: 2;
  id: string;
  name: string;
  request: string;
  revision: number;
  scope: string;
  spec: Spec | null;
  research?: ResearchDossier | null;
  answers: Record<string, string>;
  /** Planner-authored question text retained to interpret exact user answers. */
  answerQuestions?: Record<string, string>;
  /** Accepted question identities are owned by the saved revision, not regenerated. */
  conceptQuestions?: Record<string, string>;
  approvedRevision: number | null;
  stage:
    | "draft"
    | "planning"
    | "clarification"
    | "review"
    | "generating"
    | "repairing"
    | "ready_to_test"
    | "verified"
    | "failed"
    | "interrupted"
    | "needs_input";
  artifact: Bundle | null;
  completedBuildTasks?: string[];
  review: Review | null;
  checks: Check[];
  charges: Charge[];
  budgetMicros: number;
  /** One plan/build/repair cycle. Retrying work retains this accounting boundary. */
  generation?: {
    id: string;
    budgetMicros: number;
    chargeStart: number;
    briefHash?: string;
  };
  reservedMicros: number;
  events: { at: string; message: string }[];
  jobId: string | null;
  error: string | null;
  failure?: {
    code: string;
    phase: Phase;
    taskId?: string;
    attempts: number;
    details: string;
    at: string;
  } | null;
  createdAt: string;
  studioEvidence: {
    revision: number;
    artifactHash: string;
    checks: Check[];
    logs: string[];
    at: string;
    screenshot?: string;
  } | null;
  legacyImport?: boolean;
  visualEvidence?: {
    revision: number;
    artifactHash: string;
    dataUrl: string;
    notes: string;
    at: string;
    source: "user-upload";
    reviewStatus?: "unaddressed" | "awaiting_inspection";
  } | null;
};
