import { z } from "zod";
import type { Bundle, Profile } from "./schema";
import type { StudioAudioEvidence } from "./audio-evidence";
import type {
  ComponentReviewEvidence,
  ComponentReviewDecision,
} from "./component-review";

export const assetIntentSchema = z
  .object({
    experienceRole: z
      .string()
      .trim()
      .min(1)
      .max(1000)
      .describe(
        "Why this asset matters to the requested player experience, beyond its appearance.",
      ),
    interaction: z
      .string()
      .trim()
      .min(1)
      .max(1000)
      .describe(
        "Player action, response and completion/reward timing; say explicitly when decorative or noninteractive.",
      ),
    reusableFeatures: z
      .array(z.string().trim().min(1).max(300))
      .min(1)
      .max(8)
      .describe(
        "Existing geometry, behavior, animation or media to look for and inspect before authoring missing integration.",
      ),
    relatedRequirementIds: z
      .array(z.string().min(1).max(64))
      .min(1)
      .max(40)
      .describe(
        "Actual requirement IDs grounding this purpose, including the asset's primary requirementId.",
      ),
  })
  .strict();

export const assetNeedSchema = z
  .object({
    id: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,63}$/),
    requirementId: z.string().min(1).max(64),
    role: z.string().min(1).max(1000),
    selectedAssetId: z.string().regex(/^\d+$/).optional().describe("When this need uses a user-selected attachment, copy its exact assetId from gameContext.selectedAssets. Never invent an ID or search for a replacement."),
    kind: z.enum(["Model", "MeshPart", "Audio", "Animation", "Image"]),
    deliveryRole: z.enum(["visible_prop", "source_data"]).optional().describe("Use source_data for packs/libraries retained only as animation, audio or other source data. They are delivered to ReplicatedStorage, not rendered in Workspace."),
    sequence: z.object({id:z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/),step:z.number().int().min(1).max(16),total:z.number().int().min(2).max(16)}).strict().optional().describe("For a chosen animated action sequence, one separate Animation need per step with the same sequence id and total. Each step gets its own user-selected clip."),
    query: z.string().min(1).max(200).describe("1-3 broad Creator Store keywords naming the object or media, such as training dummy, punch sound or punch animation. Keep detailed requirements in role and constraints."),
    constraints: z.string().min(1).max(2000),
    intent: assetIntentSchema.optional(),
    required: z.boolean().default(true),
    position: z.tuple([
      z.number().finite().min(-10000).max(10000),
      z.number().finite().min(-10000).max(10000),
      z.number().finite().min(-10000).max(10000),
    ]),
    maxSize: z.number().positive().max(200).default(12),
  })
  .strict();
export type AssetNeed = z.infer<typeof assetNeedSchema>;
export type AssetSearchHistoryEntry = {
  searchNumber: number;
  query: string;
  candidatesReturnedByAdapter: number;
  candidatesOffered: number;
};
export type AssetCandidate = {
  id: string;
  name: string;
  description?: string;
  kind: AssetNeed["kind"];
  creator: string;
  sourceUrl: string;
  price: number | null;
  source: "creator_store" | "creator_store_component";
  componentOrigin?: {
    needId: string;
    candidateId: string;
    recordHash: string;
    packetHash: string;
    archiveHash: string;
    bindingIndices: number[];
  };
};
export type AssetReceipt = {
  operation: string;
  at: string;
  studioId: string;
  data: unknown;
};
export type AssetFailureClassification =
  "candidate_rejected" | "infrastructure_failure" | "unknown_effects";

/**
 * Adapter assertions about completed operations, never inferred from error text.
 * `none` means the candidate has no outstanding owned effects (including earlier
 * inspection/placement effects), not merely that this invocation did no work.
 * `owned` requires a still-valid inspection token for caller-managed cleanup.
 */
export class AssetOperationError extends Error {
  readonly classification: AssetFailureClassification;
  readonly haltRequired: boolean;
  constructor(
    message: string,
    readonly receipts: AssetReceipt[],
    readonly effects: "none" | "owned" | "unknown",
    classification: AssetFailureClassification = "infrastructure_failure",
  ) {
    super(message);
    this.name = "AssetOperationError";
    this.classification =
      effects === "unknown" ? "unknown_effects" : classification;
    this.haltRequired =
      this.classification !== "candidate_rejected" || effects !== "none";
  }
}
export type AssetInspection = {
  candidate: AssetCandidate;
  token: string;
  path: string;
  safe: boolean;
  reasons: string[];
  capabilityBlock?: {
    kind: "interactive_asset_requires_review" | "unsupported_structure";
    reason: string;
  };
  snapshot: unknown;
  image?: string;
  audio?: StudioAudioEvidence;
  receipts: AssetReceipt[];
  functional: {
    contentLoaded: boolean;
    instanceCount: number;
    scriptCount: number;
    playbackObserved?: boolean;
  };
};
export type AssetVerification = {
  passed: boolean;
  reasons: string[];
  snapshot: unknown;
  image?: string;
  audio?: StudioAudioEvidence;
  receipts: AssetReceipt[];
  bundle: Bundle;
  functional: AssetInspection["functional"];
};
export interface AssetAdapter {
  identity: string;
  /** A fixed, role-bound approval pool. Changing the query cannot find new candidates. */
  searchScope?: "approved_references";
  /** Host-validated user approval, separate from Marketplace search provenance. */
  bindApprovedReference?(
    need: AssetNeed,
    candidate: AssetCandidate,
    approval: { discoveryId: string; revision: number },
  ): Promise<void>;
  discoverComponentAudio?(
    need: AssetNeed,
    component: import("./component-integration").ComponentReference,
    signal: AbortSignal,
  ): Promise<{ candidates: AssetCandidate[]; receipts: AssetReceipt[] }>;
  prepareComponentIntegration?(
    need: AssetNeed,
    inspection: AssetInspection,
    evidence: ComponentReviewEvidence,
    review: ComponentReviewDecision,
    signal: AbortSignal,
  ): Promise<{
    component: import("./component-integration").ComponentReference;
    bundle: Bundle;
    receipts: AssetReceipt[];
  }>;
  adaptComponent?(
    inspection: AssetInspection,
    evidence: ComponentReviewEvidence,
    plan: import("./component-adaptation").ComponentAdaptation,
    signal: AbortSignal,
  ): Promise<{ evidence: ComponentReviewEvidence; receipts: AssetReceipt[] }>;
  prepareComponentReview?(
    inspection: AssetInspection,
    inputHash: string,
    signal: AbortSignal,
  ): Promise<{ evidence: ComponentReviewEvidence; receipts: AssetReceipt[] }>;
  search(
    need: AssetNeed,
    query: string,
    signal: AbortSignal,
  ): Promise<{ candidates: AssetCandidate[]; receipts: AssetReceipt[] }>;
  inspect(
    need: AssetNeed,
    candidate: AssetCandidate,
    attemptId: string,
    signal: AbortSignal,
  ): Promise<AssetInspection>;
  place(
    need: AssetNeed,
    inspection: AssetInspection,
    signal: AbortSignal,
  ): Promise<AssetVerification>;
  discard(
    inspection: AssetInspection,
    signal: AbortSignal,
  ): Promise<AssetReceipt[]>;
}
const decisionReason = z.string().trim().min(1).max(2000);
export const assetDecisionSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("select"),
      candidateId: z.string().trim().min(1).max(64),
      query: z.null(),
      reason: decisionReason,
    })
    .strict(),
  z
    .object({
      action: z.literal("retry"),
      candidateId: z.null(),
      query: z.string().trim().min(1).max(200),
      reason: decisionReason,
    })
    .strict(),
  z
    .object({
      action: z.literal("reject"),
      candidateId: z.null(),
      query: z.null(),
      reason: decisionReason,
    })
    .strict(),
  z
    .object({
      action: z.literal("escalate"),
      candidateId: z.null(),
      query: z.null(),
      reason: decisionReason,
    })
    .strict(),
]);
export const assetDecisionInstructions =
  "Return exactly one complete JSON decision with action, candidateId, query and reason. " +
  "select: choose an exact offered candidateId and set query=null. " +
  "Selection authorizes native import and inspection/audition; it is not asset acceptance. " +
  "Read gameContext before selecting or changing a query. Its userSources, playerExperience and assetTarget explain the game's purpose, clarified interaction and acceptance criteria. Match the asset's role in that experience, not merely its shape or color. In reason, connect the candidate or revised search to the target interaction/media and identify what still needs inspection or adaptation. A short common-name query can discover a behavior-rich component; do not require every gameplay constraint in the search string. Existing behavior with a different trigger can still be relevant for reuse, subject to the supported audit path. " +
  "Image or listening evidence is normally unavailable before selection: Takko collects that evidence after selection, then requires native checks and evaluator acceptance. " +
  "Use search metadata to choose a plausible candidate to inspect; do not require prior verified media just to select it. " +
  "retry: request another Marketplace search with a nonblank relevant query and candidateId=null; this is allowed only with search budget remaining. " +
  "searchHistory lists completed searches in order, including the exact submitted query, candidatesReturnedByAdapter and candidatesOffered after pipeline filtering. Adapter counts are not a claim about all raw Marketplace results. When no candidates are offered and searches remain, use that history to choose a distinct shorter common-name query or relevant synonym, keeping detailed requirements in the asset intent/constraints. You must author the exact query; no replacement query is supplied. Broader discovery does not waive the requested behavior, required acquisition flags, Marketplace-only audio or native verification. " +
  "Searches and inspection attempts have separate budgets. Zero searchesRemaining disables retry, but select remains available for offered candidates while inspectionAttemptsRemaining is positive. " +
  "reject: terminally abandon this entire asset need, not just one candidate; candidateId=null and query=null. " +
  "escalate: terminally request recorded intervention, with candidateId=null and query=null; no intervention is automatically executed. " +
  "Use the action matching your intention; prose cannot request a retry when action is reject. " +
  "Candidate names are not playback, duration, rig or suitability evidence. Never invent assets or waive native verification. " +
  "A rejected candidate is already excluded; select another offered candidate or retry search if budget remains. " +
  "Optional visual fallback requires two distinct executed search queries and at least one completed native inspection when candidates were offered. Follow fallbackPolicy before terminal reject. Unsupported reusable content requires capability review, not an automatic procedural substitute.";

export function validateAssetDecision(
  decision: z.infer<typeof assetDecisionSchema>,
  context: unknown,
) {
  const state = context as {
    candidates: AssetCandidate[];
    searches: number;
    policy: { maxSearches: number };
    fallbackPolicy?: { blockingReason: string | null };
  };
  if (
    decision.action === "select" &&
    !state.candidates.some((c) => c.id === decision.candidateId)
  )
    throw Error(
      "Model selected an unoffered or already attempted candidate ID. Choose an exact candidateId from context.candidates or use retry/reject/escalate.",
    );
  if (decision.action === "retry" && state.searches >= state.policy.maxSearches)
    throw Error(
      "Search budget exhausted. Select an offered candidate or return terminal reject/escalate; another search is unavailable.",
    );
  if (decision.action === "reject" && state.fallbackPolicy?.blockingReason)
    throw Error(
      state.fallbackPolicy.blockingReason +
        " Select an offered candidate for inspection, retry with a distinct query if search budget remains, or escalate. Do not replace the asset procedurally without the required sourcing evidence.",
    );
}
export const assetEvaluationSchema = z
  .object({
    accepted: z.boolean(),
    reason: z.string().min(1).max(3000),
    visualFit: z.boolean(),
    functionalFit: z.boolean(),
    audioFit: z.boolean().optional(),
    rejectionBasis: z
      .object({
        kind: z.enum(["user_statement", "capability"]),
        sourceId: z.string().optional(),
        quote: z.string().min(1).max(3000),
      })
      .strict()
      .optional(),
  })
  .strict();
export type AssetModel = {
  adaptComponent?(
    context: {
      need: AssetNeed;
      evidence: ComponentReviewEvidence;
      requirementIds: string[];
      review: ComponentReviewDecision;
      stage?: import("./asset-pipeline").ComponentStageContext;
      preservation?: import("./component-preservation").ComponentPreservationContext;
      adaptation?: {
        attempt: number;
        maxAttempts: 2;
        remainingAttempts: number;
      };
    },
    signal: AbortSignal,
  ): Promise<import("./component-adaptation").ComponentAdaptationDecision>;
  reviewComponent?(
    context: {
      need: AssetNeed;
      evidence: ComponentReviewEvidence;
      requirementIds: string[];
      stage?: import("./asset-pipeline").ComponentStageContext;
      preservation?: import("./component-preservation").ComponentPreservationContext;
      adaptation?: {
        attempt: number;
        maxAttempts: 2;
        remainingAttempts: number;
      };
    },
    signal: AbortSignal,
  ): Promise<ComponentReviewDecision>;
  decide(
    context: unknown,
    signal: AbortSignal,
  ): Promise<z.infer<typeof assetDecisionSchema>>;
  evaluate(
    context: unknown,
    image: string | undefined,
    signal: AbortSignal,
    audio?: StudioAudioEvidence,
  ): Promise<z.infer<typeof assetEvaluationSchema>>;
};
export type AssetPipelineRun = {
  version: 1;
  runId: string;
  revision: number;
  inputHash: string;
  inputContext?: {
    revision: number;
    request: string;
    needs: AssetNeed[];
    studio?: string;
    worker?: Profile;
    evaluator?: Profile;
    gameContext?: unknown;
    scope?: string;
    integrationTasks?: import("./schema").Spec["tasks"];
  };
  status:
    "running" | "passed" | "failed" | "escalation_required" | "interrupted";
  startedAt: string;
  finishedAt?: string;
  policy: {
    maxSearches: number;
    maxCandidates: number;
    allowEscalation: boolean;
    workerRoute: string;
    evaluatorRoute: string;
  };
  adapter: string;
  needs: AssetNeed[];
  entries: {
    reusedFrom?: { runId: string; revision: number; inputHash: string };
    needId: string;
    status: "pending" | "passed" | "failed" | "escalation_required";
    selected?: AssetCandidate;
    reason?: string;
    bundle?: Bundle;
    component?: import("./component-integration").ComponentReference;
    componentContextHash?: string;
    attempts: number;
  }[];
  events: { at: string; needId: string; step: string; data: unknown }[];
  error?: string;
  requiresReconciliation?: boolean;
};
export type AssetPipelineInput = {
  run: AssetPipelineRun;
  adapter: AssetAdapter;
  model: AssetModel;
  signal: AbortSignal;
  persist: (run: AssetPipelineRun) => void | Promise<void>;
  /** Engine-validated accepted entries outside this fresh delta; context only. */
  retainedEntries?: AssetPipelineRun["entries"];
};
