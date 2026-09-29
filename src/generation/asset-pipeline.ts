import { createHash } from "node:crypto";
import { groundedAssetRejection } from "./approved-reference-policy";
import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import {
  assetDecisionSchema,
  assetDecisionInstructions,
  validateAssetDecision,
  AssetOperationError,
  assetEvaluationSchema,
  assetNeedSchema,
  type AssetCandidate,
  type AssetInspection,
  type AssetNeed,
  type AssetSearchHistoryEntry,
  type AssetPipelineInput,
  type AssetPipelineRun,
} from "./asset-contract";
import { bundleSchema, taskSchema } from "./schema";
import { validateComponentReview } from "./component-review";
import {
  componentPreservationChainContext,
  type ComponentPreservationContext,
} from "./component-preservation";
import { componentReferenceSchema } from "./component-integration";
import { componentArchiveLimits } from "./component-archive";
import {
  componentAdaptationDecisionSchema,
  maxComponentAdaptations,
  type ComponentAdaptation,
  validateComponentAdaptation,
} from "./component-adaptation";
import {
  validateStudioAudio,
  type StudioAudioEvidence,
} from "./audio-evidence";

const policySchema = z
  .object({
    maxSearches: z.number().int().min(1).max(3),
    maxCandidates: z.number().int().min(1).max(5),
    allowEscalation: z.boolean(),
    workerRoute: z.string().trim().min(1).max(300),
    evaluatorRoute: z.string().trim().min(1).max(300),
  })
  .strict();
const candidateSchema = z
  .object({
    id: z.string().trim().min(1).max(64),
    name: z.string().max(500),
    description: z.string().max(1000).optional(),
    kind: assetNeedSchema.shape.kind,
    creator: z.string().max(500),
    sourceUrl: z.string().max(2000),
    price: z.number().finite().nonnegative().nullable(),
    source: z.literal("creator_store"),
  })
  .strict();
const componentAudioCandidateSchema = candidateSchema
  .extend({
    id: z.string().regex(/^[1-9]\d{0,63}$/),
    kind: z.literal("Audio"),
    source: z.literal("creator_store_component"),
    componentOrigin: z
      .object({
        needId: z.string().min(1).max(64),
        candidateId: z.string().min(1).max(64),
        recordHash: z.string().regex(/^[a-f0-9]{64}$/),
        packetHash: z.string().regex(/^[a-f0-9]{64}$/),
        archiveHash: z.string().regex(/^[a-f0-9]{64}$/),
        bindingIndices: z
          .array(
            z.number().int().positive().max(componentArchiveLimits.instances),
          )
          .min(1)
          .max(componentArchiveLimits.instances)
          .refine(
            (values) => new Set(values).size === values.length,
            "Component binding indices must be unique",
          ),
      })
      .strict(),
  })
  .strict();
const receiptsSchema = z
  .array(
    z.object({
      operation: z.string().min(1),
      at: z.string().min(1),
      studioId: z.string().min(1),
      data: z.unknown(),
    }),
  )
  .min(1)
  .max(100);
const functionalSchema = z.object({
  contentLoaded: z.boolean(),
  instanceCount: z.number().int().nonnegative(),
  scriptCount: z.number().int().nonnegative(),
  playbackObserved: z.boolean().optional(),
});
const imageKinds = new Set(["Model", "MeshPart", "Image"]);
// Bound worker context independently of the number of native imports permitted.
const maxOfferedCandidates = 20;
const capabilityBlockSchema = z
  .object({
    kind: z.enum([
      "interactive_asset_requires_review",
      "unsupported_structure",
    ]),
    reason: z.string().trim().min(1).max(3000),
  })
  .strict();
const now = () => new Date().toISOString();
const sha = (text: string) => createHash("sha256").update(text).digest("hex");

export const componentStageInstructions =
  "context.stage is a host snapshot of acquisition progress, namespace and accepted task ownership at this call. " +
  "Adapt and review this captured component for its assigned need within the full requested experience; this stage does not implement the whole game. " +
  "Preserve useful component behavior and expose the interfaces needed for later integration. Do not replace another pending acquisition with new code, geometry, animation or invented media, and do not assume an unstarted, failed or unknown need is absent or satisfied. " +
  "Required flags and all native/media verification remain mandatory. Retained content is not evidence of full-game runtime success. " +
  "Accepted task declarations describe planned ownership, not completed implementation. Cross-component binding, placement and missing interfaces belong in the adaptation plan's remainingIntegration and reviewer findings; identify concrete contracts and evidence gaps without fabricating other components. " +
  "Pending native/audio verification or a separately owned integration task alone is not a static defect in this component; keep that work explicitly unverified and deferred. Captured media awaiting audition, central HUD/counter integration and scheduled native testing belong in requirement integration_needed and integrationNotes/remainingIntegration, not by themselves in unresolved executable dependencies. This does not verify media or skip later mandatory acquisition, audition or native acceptance. Concrete unsafe source behavior, unresolved executable dependencies, reset/authentication defects or lost useful behavior still require needs_more_evidence or unsuitable. A pending integration dependency alone does not require implementing a second component here; independently assess this component's own correctness, security, lifecycle and reset behavior. Use only the actual allowed scope roots; if namespace or ownership is unavailable, report the gap instead of guessing.";

/** Context only: never grants coverage, native acceptance or permission to skip a need. */
export function componentStageContext(
  run: AssetPipelineRun,
  need: AssetNeed,
  candidate: AssetCandidate,
  retainedEntries: AssetPipelineRun["entries"] = [],
) {
  const declared = z
    .array(assetNeedSchema)
    .max(16)
    .parse(run.inputContext?.needs ?? run.needs);
  if (
    new Set(declared.map((item) => item.id)).size !== declared.length ||
    !isDeepStrictEqual(
      declared.find((item) => item.id === need.id),
      need,
    )
  )
    throw Error(
      "Component stage need differs from declared acquisition context",
    );
  const entries = [...retainedEntries, ...run.entries];
  if (
    new Set(entries.map((entry) => entry.needId)).size !== entries.length ||
    entries.some((entry) => !declared.some((item) => item.id === entry.needId))
  )
    throw Error(
      "Component stage entries differ from declared acquisition context",
    );
  const current = run.entries.find((entry) => entry.needId === need.id);
  if (
    !current ||
    candidate.kind !== need.kind ||
    (current.selected && !isDeepStrictEqual(current.selected, candidate))
  )
    throw Error("Component stage candidate differs from current selection");
  const scope = run.inputContext?.scope ?? null;
  if (scope !== null && !/^[A-Za-z][A-Za-z0-9_]*$/.test(scope))
    throw Error("Component stage namespace is invalid");
  const tasks = run.inputContext?.integrationTasks;
  return structuredClone({
    version: 1 as const,
    runId: run.runId,
    inputHash: run.inputHash,
    revision: run.revision,
    eventSequence: run.events.length,
    namespace: scope,
    namespaceStatus: scope === null ? "unavailable_do_not_guess" : "host_bound",
    allowedRoots:
      scope === null
        ? []
        : [
            "Workspace",
            "ReplicatedStorage",
            "ServerScriptService",
            "ServerStorage",
            "StarterGui",
            "StarterPlayer/StarterPlayerScripts",
          ].map((root) => root + "/" + scope),
    rootPolicy:
      "Only descendants of the allowed project roots; no global service changes or unscoped world scans. Component quarantine paths are inspection locations, not final runtime paths.",
    current: {
      needId: need.id,
      candidate,
      status: "selected_for_inspection_not_accepted",
    },
    needs: declared.map((item) => {
      const entry = entries.find((value) => value.needId === item.id);
      let retainedComponent = null;
      if (entry?.component) {
        const reference = componentReferenceSchema.parse(entry.component);
        if (
          entry.status !== "passed" ||
          entry.componentContextHash !== run.inputHash ||
          reference.needId !== item.id ||
          reference.candidateId !== entry.selected?.id ||
          (scope !== null &&
            reference.destinationPath !==
              `Workspace/${scope}/Assets/${item.id}`)
        )
          throw Error(
            "Component stage retained reference is not bound to this accepted context",
          );
        retainedComponent = {
          recordHash: reference.recordHash,
          packetHash: reference.packetHash,
          archiveHash: reference.archiveHash,
          rootPath: reference.destinationPath + "/" + reference.rootName,
          runtimeVerification: reference.runtimeVerification,
        };
      }
      return {
        need: item,
        status: entry?.status ?? "unknown",
        progress:
          item.id === need.id
            ? "current_component"
            : !entry
              ? "unknown_unverified"
              : entry.status === "pending" && entry.attempts === 0
                ? "unstarted_unverified"
                : entry.status === "passed"
                  ? "retained_full_game_unverified"
                  : "not_retained_unverified",
        attempts: entry?.attempts ?? 0,
        selectedCandidate: entry?.selected ?? null,
        reason: entry?.reason ?? null,
        retainedFromEarlierRun: retainedEntries.some(
          (value) => value.needId === item.id,
        ),
        retainedComponent,
      };
    }),
    integrationTasks: {
      status: tasks
        ? "accepted_plan_not_execution_evidence"
        : "unavailable_do_not_guess",
      tasks: tasks ? z.array(taskSchema).max(12).parse(tasks) : [],
    },
  });
}
export type ComponentStageContext = ReturnType<typeof componentStageContext>;

/** Keep image payloads out of the durable event history; evaluators still get originals. */
function eventData(value: unknown, key = "", depth = 0): unknown {
  if (typeof value === "string") {
    if (
      /image|base64/i.test(key) ||
      value.startsWith("data:image/") ||
      value.startsWith("data:audio/")
    )
      return { sha256: sha(value), bytes: Buffer.byteLength(value) };
    return value.length <= 6000
      ? value
      : {
          preview: value.slice(0, 6000),
          length: value.length,
          sha256: sha(value),
        };
  }
  if (value === null || typeof value === "number" || typeof value === "boolean")
    return value;
  if (value === undefined) return null;
  if (depth > 10) return { omitted: "depth limit" };
  if (Array.isArray(value))
    return value
      .slice(0, 150)
      .map((v) => eventData(v, key, depth + 1))
      .concat(value.length > 150 ? [{ omittedItems: value.length - 150 }] : []);
  if (typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 150)
        .map(([k, v]) => [k, eventData(v, k, depth + 1)]),
    );
  return String(value);
}

// Native observations only. Do not repeat raw tool receipts, screenshots or
// serialized scene/source payloads in the evaluator's text context.
function observationSummary(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const snapshot = value as Record<string, unknown>;
  return eventData(
    Object.fromEntries(
      ["ok", "center", "size", "functionalVerified", "audibilityVerified"]
        .filter((key) => key in snapshot)
        .map((key) => [key, snapshot[key]]),
    ),
  );
}
function geometrySummary(scene: unknown) {
  if (!Array.isArray(scene)) return { sceneEntries: 0, classes: {} };
  const classes: Record<string, number> = {};
  for (const node of scene.slice(0, 1000)) {
    if (node && typeof node.className === "string")
      classes[node.className] = (classes[node.className] ?? 0) + 1;
  }
  return {
    sceneEntries: scene.length,
    classes,
    summarizedEntries: Math.min(scene.length, 1000),
  };
}
function audioSummary(audio: StudioAudioEvidence | undefined) {
  if (!audio) return undefined;
  const { dataUrl: _, durationMs, ...metadata } = audio;
  return eventData({
    ...metadata,
    captureWindowDurationMs: durationMs,
    nativeSoundTimeLengthSeconds:
      audio.source.audition?.nativeTimeLengthSeconds ?? null,
  });
}
function validateBoundAudio(
  audio: StudioAudioEvidence,
  receipts: AssetInspection["receipts"],
  candidateId: string,
  token: string,
  previous?: StudioAudioEvidence,
) {
  const studioIds = new Set(receipts.map((receipt) => receipt.studioId));
  if (studioIds.size !== 1)
    throw Error("Audio receipts do not identify one selected Studio");
  const wav = validateStudioAudio(audio, {
    studioId: receipts[0].studioId,
    candidateId,
    token,
  });
  if (
    previous &&
    (audio.source.studioId !== previous.source.studioId ||
      audio.source.processId !== previous.source.processId ||
      audio.source.processStartedAt !== previous.source.processStartedAt ||
      Date.parse(audio.source.capturedAt) <=
        Date.parse(previous.source.capturedAt))
  )
    throw Error(
      "Placement audio must be a fresh capture from the same bound Studio process",
    );
  return wav;
}

class PipelineHalt extends Error {
  constructor(
    message: string,
    readonly status: "failed" | "interrupted" = "failed",
    readonly unsafeToClean = false,
  ) {
    super(message);
  }
}
class PersistenceHalt extends Error {
  constructor(
    message: string,
    readonly requiresReconciliation: boolean,
  ) {
    super(message);
  }
}

/** Fresh runs only. All external effects are preceded by an awaited durable event. */
export async function runAssetPipeline(
  input: AssetPipelineInput,
): Promise<AssetPipelineRun> {
  const { adapter, model, signal, persist } = input;
  const run = structuredClone(input.run);
  const retainedEntries = structuredClone(input.retainedEntries ?? []);
  // Reject resume/reuse before changing or persisting the historical run.
  if (
    run.version !== 1 ||
    run.status !== "running" ||
    run.requiresReconciliation ||
    run.finishedAt ||
    run.events.length ||
    run.entries.some(
      (e) =>
        e.status !== "pending" || e.attempts !== 0 || e.bundle || e.selected,
    )
  )
    throw Error(
      "Asset pipeline requires a fresh run; historical/interrupted receipts cannot be reused",
    );
  run.policy = policySchema.parse(run.policy);
  run.needs = z.array(assetNeedSchema).max(16).parse(run.needs);
  if (new Set(run.needs.map((n) => n.id)).size !== run.needs.length)
    throw Error("Duplicate asset need IDs");
  if (
    run.needs.some(
      (n) => !n.query.trim() || !n.role.trim() || !n.constraints.trim(),
    )
  )
    throw Error("Asset need query, role and constraints cannot be blank");
  if (
    !run.runId ||
    !run.inputHash ||
    !adapter.identity ||
    run.adapter !== adapter.identity
  )
    throw Error("Asset run/adapter identity mismatch");
  if (
    run.entries.length &&
    (run.entries.length !== run.needs.length ||
      new Set(run.entries.map((e) => e.needId)).size !== run.needs.length ||
      run.entries.some((e) => !run.needs.some((n) => n.id === e.needId)))
  )
    throw Error("Asset run entries do not match needs");
  run.entries = run.needs.map((need) => ({
    needId: need.id,
    status: "pending",
    attempts: 0,
  }));
  let current = "";
  let owned: AssetInspection | undefined;
  // Never seed discovery from historical or merely prepared imports. These
  // snapshots enter the map only after cleanup and durable current-run retention.
  const retainedComponents = new Map<
    string,
    z.infer<typeof componentReferenceSchema>
  >();
  const record = async (step: string, data: unknown) => {
    run.events.push({
      at: now(),
      needId: current,
      step,
      data: eventData(data),
    });
    if (
      run.events.length > 2000 ||
      Buffer.byteLength(JSON.stringify(run)) > 8 * 1024 * 1024
    )
      throw new PersistenceHalt(
        "Asset history exceeded its bounded storage limit",
        !!owned || run.requiresReconciliation === true,
      );
    try {
      await persist(structuredClone(run));
    } catch (error) {
      throw new PersistenceHalt(
        "Cannot persist asset pipeline history: " + String(error),
        !!owned || run.requiresReconciliation === true,
      );
    }
  };
  const active = () => {
    if (signal.aborted)
      throw new PipelineHalt("Asset pipeline cancelled", "interrupted");
  };
  const call = async <T>(
    step: string,
    details: unknown,
    invoke: () => Promise<T>,
    external: "adapter" | "model",
    received?: (result: T) => void,
  ): Promise<T> => {
    active();
    await record(step + "_call", details);
    active();
    try {
      const result = await invoke();
      received?.(result);
      await record(step + "_result", result);
      return result;
    } catch (error) {
      if (error instanceof PersistenceHalt) throw error;
      const adapterFailure =
        external === "adapter" &&
        error instanceof AssetOperationError &&
        receiptsSchema.safeParse(error.receipts).success
          ? error
          : undefined;
      const readOnly =
        step === "search" || step === "component_audio_discovery";
      const uncertainMutation =
        external === "adapter" &&
        (adapterFailure?.effects === "unknown" ||
          adapterFailure?.classification === "unknown_effects" ||
          (!readOnly &&
            (!adapterFailure ||
              (adapterFailure.effects === "owned" && !owned))));
      // An adapter may have cleaned the token before returning a completed failure.
      // Release our stale handle only on an explicit, receipted no-effects result.
      if (adapterFailure?.effects === "none" && !uncertainMutation && !readOnly)
        owned = undefined;
      const retry =
        !signal.aborted &&
        !uncertainMutation &&
        adapterFailure?.classification === "candidate_rejected" &&
        adapterFailure.effects === "none" &&
        !adapterFailure.haltRequired &&
        (step === "inspect" || step === "place");
      // Preserve uncertainty even when saving the following error receipt fails.
      if (uncertainMutation) run.requiresReconciliation = true;
      await record(step + "_error", {
        message: String(error),
        outcome: (error as { outcome?: unknown })?.outcome,
        receipts: (error as { receipts?: unknown })?.receipts,
        effects: (error as { effects?: unknown })?.effects,
        haltRequired: (error as { haltRequired?: unknown })?.haltRequired,
        classification: uncertainMutation
          ? "unknown_effects"
          : (adapterFailure?.classification ?? "infrastructure_failure"),
        retry,
      });
      if (retry) throw adapterFailure;
      throw new PipelineHalt(
        String(error),
        signal.aborted ? "interrupted" : "failed",
        uncertainMutation,
      );
    }
  };
  const cleanup = async (reason: string) => {
    if (!owned) return;
    const inspection = owned;
    await record("discard_call", {
      token: inspection.token,
      path: inspection.path,
      reason,
    });
    // Cancellation of generation must not prevent cleanup of an already-owned token.
    const cleanupSignal = AbortSignal.timeout(5000);
    try {
      const receipts = await adapter.discard(inspection, cleanupSignal);
      await record("discard_result", { token: inspection.token, receipts });
      receiptsSchema.parse(receipts);
      owned = undefined;
    } catch (error) {
      if (error instanceof PersistenceHalt) throw error;
      const cleaned =
        error instanceof AssetOperationError &&
        error.effects === "none" &&
        error.classification !== "unknown_effects" &&
        receiptsSchema.safeParse(error.receipts).success;
      if (cleaned) owned = undefined;
      else run.requiresReconciliation = true;
      await record("discard_error", {
        token: inspection.token,
        reason: String(error),
        outcome: (error as { outcome?: unknown })?.outcome,
        receipts: (error as { receipts?: unknown })?.receipts,
        effects: (error as { effects?: unknown })?.effects,
        haltRequired: (error as { haltRequired?: unknown })?.haltRequired,
        classification: cleaned
          ? (error as AssetOperationError).classification
          : "unknown_effects",
        retry: false,
      });
      throw new PipelineHalt(
        "Owned asset cleanup failed: " + String(error),
        signal.aborted ? "interrupted" : "failed",
        !cleaned,
      );
    }
  };
  const failNeed = async (reason: string) => {
    const entry = run.entries.find((e) => e.needId === current)!;
    entry.status = "failed";
    entry.reason = reason;
    delete entry.bundle;
    delete entry.selected;
    await record("need_failed", {
      reason,
      required: run.needs.find((n) => n.id === current)!.required,
    });
  };
  const escalate = async (reason: string) => {
    if (
      adapter.searchScope === "approved_references" &&
      !run.needs.find((n) => n.id === current)!.required
    ) {
      await failNeed(reason);
      await record("escalation_request", {
        reason,
        allowed: run.policy.allowEscalation,
        executed: false,
        buildMayContinue: true,
      });
      return;
    }
    const entry = run.entries.find((e) => e.needId === current)!;
    entry.status = run.policy.allowEscalation
      ? "escalation_required"
      : "failed";
    entry.reason = reason;
    run.status = run.policy.allowEscalation ? "escalation_required" : "failed";
    run.error = reason;
    run.finishedAt = now();
    await record("escalation_request", {
      reason,
      allowed: run.policy.allowEscalation,
      executed: false,
    });
  };
  const functional = (
    need: AssetNeed,
    value: unknown,
    requirePlayback = true,
  ) => {
    const f = functionalSchema.parse(value);
    return (
      f.contentLoaded &&
      f.instanceCount > 0 &&
      f.scriptCount === 0 &&
      (!requirePlayback ||
        !(need.kind === "Audio" || need.kind === "Animation") ||
        f.playbackObserved === true)
    );
  };
  const imagePresent = (need: AssetNeed, image: unknown) => {
    if (!imageKinds.has(need.kind)) return true;
    if (typeof image !== "string" || image.length > 8 * 1024 * 1024)
      return false;
    const match =
      /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(image);
    if (!match || match[2].length % 4 !== 0) return false;
    const bytes = Buffer.from(match[2], "base64");
    if (match[1] === "png")
      return (
        bytes.length >= 8 &&
        bytes
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      );
    if (match[1] === "jpeg")
      return (
        bytes.length >= 3 &&
        bytes[0] === 255 &&
        bytes[1] === 216 &&
        bytes[2] === 255
      );
    return (
      bytes.length >= 12 &&
      bytes.subarray(0, 4).toString() === "RIFF" &&
      bytes.subarray(8, 12).toString() === "WEBP"
    );
  };

  try {
    const executionNeeds = [...run.needs].sort(
      (a, b) => Number(b.kind === "Model") - Number(a.kind === "Model"),
    );
    await record("run_started", {
      policy: run.policy,
      adapter: run.adapter,
      inputHash: run.inputHash,
      needIds: run.needs.map((n) => n.id),
      needExecutionOrder: executionNeeds.map((n) => n.id),
    });
    needsLoop: for (const need of executionNeeds) {
      current = need.id;
      active();
      const entry = run.entries.find((e) => e.needId === need.id)!;
      try {
        let searches = 0,
          query = need.query.trim(),
          candidates: AssetCandidate[] = [];
        let sourcePhase: "component_audio" | "marketplace" = "marketplace";
        const attempted = new Set<string>();
        const executedQueries = new Set<string>();
        const searchHistory: AssetSearchHistoryEntry[] = [];
        const offeredIds = new Set<string>();
        let completedInspections = 0;
        const fallbackPolicy = () => {
          // A fixed approval pool cannot execute alternative searches. Failure leaves
          // a requirement gap, never authorization for a procedural replacement.
          if (
            adapter.searchScope === "approved_references" ||
            need.required ||
            !imageKinds.has(need.kind)
          )
            return undefined;
          const blockingReason =
            executedQueries.size < 2
              ? "Optional visual fallback requires at least two distinct executed search queries."
              : offeredIds.size > 0 && completedInspections === 0
                ? "Optional visual fallback requires at least one completed native inspection because search candidates were offered."
                : null;
          return {
            requiredDistinctSearchQueries: 2,
            distinctSearchQueries: [...executedQueries],
            offeredCandidateCount: offeredIds.size,
            requiredCompletedInspections: offeredIds.size ? 1 : 0,
            completedInspections,
            blockingReason,
          };
        };
        const rejected: { candidateId: string; reason: string }[] = [];
        const candidateOperation = async <T>(
          phase: "inspection" | "placed",
          candidate: AssetCandidate,
          invoke: () => Promise<T>,
        ): Promise<T | undefined> => {
          try {
            return await invoke();
          } catch (error) {
            if (!(error instanceof AssetOperationError) || error.haltRequired)
              throw error;
            const reason = error.message;
            await record("candidate_rejected", {
              candidateId: candidate.id,
              phase,
              reason,
              classification: error.classification,
              effects: error.effects,
              cleanupConfirmed: true,
            });
            rejected.push({ candidateId: candidate.id, reason });
            return undefined;
          }
        };
        const search = async () => {
          sourcePhase = "marketplace";
          searches++;
          const result = await call(
            "search",
            { need, query, searchNumber: searches },
            () => adapter.search(need, query, signal),
            "adapter",
          );
          receiptsSchema.parse(result.receipts);
          active();
          executedQueries.add(query.trim().replace(/\s+/g, " ").toLowerCase());
          candidates = [];
          for (const raw of result.candidates.slice(0, 100)) {
            const candidate = candidateSchema.parse(raw);
            if (
              candidate.kind === need.kind &&
              !attempted.has(candidate.id) &&
              !candidates.some((c) => c.id === candidate.id)
            )
              candidates.push(candidate);
            if (candidates.length >= maxOfferedCandidates) break;
          }
          for (const candidate of candidates) offeredIds.add(candidate.id);
          const completedSearch = {
            searchNumber: searches,
            query,
            candidatesReturnedByAdapter: result.candidates.length,
            candidatesOffered: candidates.length,
          };
          searchHistory.push(completedSearch);
          await record("search_candidates", {
            ...completedSearch,
            candidates,
            candidatesReturned: result.candidates.length,
            candidatesOffered: candidates.length,
            searchesRemaining: run.policy.maxSearches - searches,
          });
        };
        if (need.kind === "Audio" && adapter.discoverComponentAudio) {
          for (const [
            retainedNeedId,
            retainedReference,
          ] of retainedComponents) {
            active();
            const retainedEntry = run.entries.find(
              (item) => item.needId === retainedNeedId,
            );
            const component = componentReferenceSchema.parse(
              retainedEntry?.component,
            );
            if (
              retainedEntry?.status !== "passed" ||
              retainedEntry.componentContextHash !== run.inputHash ||
              component.inputHash !== run.inputHash ||
              component.needId !== retainedNeedId ||
              component.candidateId !== retainedEntry.selected?.id ||
              !isDeepStrictEqual(component, retainedReference)
            )
              throw new PipelineHalt(
                "Embedded audio discovery requires an unchanged current-run retained component",
              );
            const found = await call(
              "component_audio_discovery",
              { needId: need.id, component },
              () =>
                adapter.discoverComponentAudio!(
                  need,
                  structuredClone(component),
                  signal,
                ),
              "adapter",
            );
            receiptsSchema.parse(found.receipts);
            active();
            const offered = z
              .array(componentAudioCandidateSchema)
              .max(maxOfferedCandidates)
              .parse(found.candidates);
            for (const candidate of offered) {
              const origin = candidate.componentOrigin;
              if (
                origin.needId !== component.needId ||
                origin.candidateId !== component.candidateId ||
                origin.recordHash !== component.recordHash ||
                origin.packetHash !== component.packetHash ||
                origin.archiveHash !== component.archiveHash
              )
                throw new PipelineHalt(
                  "Embedded audio candidate origin differs from the retained component reference",
                );
            }
            for (const candidate of offered) {
              if (!candidates.some((item) => item.id === candidate.id))
                candidates.push(candidate);
              if (candidates.length >= maxOfferedCandidates) break;
            }
            if (candidates.length >= maxOfferedCandidates) break;
          }
          if (candidates.length) {
            sourcePhase = "component_audio";
            await record("component_audio_candidates", {
              candidates,
              candidatesOffered: candidates.length,
              searchesRemaining: run.policy.maxSearches,
            });
          }
        }
        if (!candidates.length) await search();
        if (
          !candidates.length &&
          adapter.searchScope === "approved_references"
        ) {
          await failNeed(
            "No approved asset is bound to this requirement. " +
              (need.required
                ? "Review asset choices before building."
                : "Optional decoration omitted. Core requirements remain in scope."),
          );
          continue;
        }
        while (entry.attempts < run.policy.maxCandidates) {
          active();
          const decisionContext = {
            need,
            candidates,
            rejected,
            searches,
            searchHistory: structuredClone(searchHistory),
            attempts: entry.attempts,
            policy: run.policy,
            sourcePhase,
            searchesRemaining: run.policy.maxSearches - searches,
            candidatesRemaining: run.policy.maxCandidates - entry.attempts,
            inspectionAttemptsRemaining:
              run.policy.maxCandidates - entry.attempts,
            offeredCandidateCount: candidates.length,
            fallbackPolicy: fallbackPolicy(),
            allowedActions: [
              ...(candidates.length ? ["select"] : []),
              ...(adapter.searchScope !== "approved_references" &&
              searches < run.policy.maxSearches
                ? ["retry"]
                : []),
              ...(!fallbackPolicy()?.blockingReason ? ["reject"] : []),
              "escalate",
            ],
            instruction:
              assetDecisionInstructions +
              (sourcePhase === "component_audio"
                ? " These audio candidates were discovered in retained current-run Marketplace components. Match them to the requested experience; their references are not listening or playback evidence. Select authorizes the normal audition and verification process. If they are unsuitable, retry with a relevant query to search Marketplace; no Marketplace search budget has been consumed by embedded discovery."
                : ""),
          };
          const decision = assetDecisionSchema.parse(
            await call(
              "decision",
              {
                needId: need.id,
                route: run.policy.workerRoute,
                searches,
                attempts: entry.attempts,
              },
              () => model.decide(decisionContext, signal),
              "model",
            ),
          );
          active();
          validateAssetDecision(decision, decisionContext);
          if (decision.action === "escalate") {
            await escalate(decision.reason);
            if (!need.required && adapter.searchScope === "approved_references")
              continue needsLoop;
            return run;
          }
          if (decision.action === "reject") {
            if (fallbackPolicy())
              await record("visual_fallback_eligible", fallbackPolicy());
            await failNeed(decision.reason);
            break;
          }
          if (decision.action === "retry") {
            if (!decision.query?.trim())
              throw new PipelineHalt(
                "Retry decision requires a nonblank query",
              );
            if (searches >= run.policy.maxSearches) {
              await failNeed("Search budget exhausted: " + decision.reason);
              break;
            }
            query = decision.query.trim();
            await search();
            continue;
          }
          const candidate = candidates.find(
            (c) => c.id === decision.candidateId,
          );
          if (!candidate || attempted.has(candidate.id))
            throw new PipelineHalt(
              "Model selected an unoffered or already attempted candidate ID",
            );
          attempted.add(candidate.id);
          candidates = candidates.filter((c) => c.id !== candidate.id);
          entry.attempts++;
          await record("candidate_selected", {
            candidate,
            reason: decision.reason,
            attempt: entry.attempts,
          });
          const inspection = await candidateOperation(
            "inspection",
            candidate,
            () =>
              call(
                "inspect",
                { needId: need.id, candidate, attempt: entry.attempts },
                () =>
                  adapter.inspect(
                    need,
                    candidate,
                    `${run.runId}:${need.id}:${entry.attempts}`,
                    signal,
                  ),
                "adapter",
                (result) => {
                  if (
                    result &&
                    typeof result.token === "string" &&
                    result.token
                  )
                    owned = result;
                  else
                    throw Error(
                      "Inspection returned no owned token; native import outcome is unresolved",
                    );
                },
              ),
          );
          if (!inspection) continue;
          active();
          if (
            !owned ||
            inspection.candidate.id !== candidate.id ||
            inspection.candidate.kind !== need.kind ||
            inspection.candidate.source !== candidate.source ||
            (candidate.source === "creator_store_component" &&
              !isDeepStrictEqual(
                inspection.candidate.componentOrigin,
                candidate.componentOrigin,
              ))
          )
            throw new PipelineHalt(
              "Inspection did not return the selected candidate and an owned token",
            );
          receiptsSchema.parse(inspection.receipts);
          completedInspections++;
          if (inspection.capabilityBlock !== undefined) {
            const block = capabilityBlockSchema.parse(
              inspection.capabilityBlock,
            );
            await record("capability_blocked", {
              candidateId: candidate.id,
              ...block,
              proceduralFallbackAllowed: false,
            });
            if (
              block.kind === "interactive_asset_requires_review" &&
              adapter.prepareComponentReview &&
              model.reviewComponent
            ) {
              const prepared = await call(
                "component_prepare",
                {
                  token: inspection.token,
                  candidateId: candidate.id,
                  inputHash: run.inputHash,
                  policy:
                    "retain_original_then_capture_restricted_derivative_for_review_only",
                },
                () =>
                  adapter.prepareComponentReview!(
                    inspection,
                    run.inputHash,
                    signal,
                  ),
                "adapter",
                (result) => {
                  receiptsSchema.parse(result.receipts);
                  if (
                    result.evidence.token !== inspection.token ||
                    result.evidence.candidateId !== candidate.id ||
                    result.evidence.inputHash !== run.inputHash
                  )
                    throw Error(
                      "Prepared component identity differs from selected asset or game context",
                    );
                },
              );
              const requirementIds = [
                ...new Set([
                  need.requirementId,
                  ...(need.intent?.relatedRequirementIds ?? []),
                ]),
              ];
              let context: {
                need: AssetNeed;
                evidence: typeof prepared.evidence;
                requirementIds: string[];
                stage: ComponentStageContext;
                preservation?: ComponentPreservationContext;
                adaptation: {
                  attempt: number;
                  maxAttempts: 2;
                  remainingAttempts: number;
                };
              } = {
                need,
                evidence: prepared.evidence,
                requirementIds,
                stage: componentStageContext(
                  run,
                  need,
                  candidate,
                  retainedEntries,
                ),
                adaptation: {
                  attempt: 1,
                  maxAttempts: maxComponentAdaptations,
                  remainingAttempts: maxComponentAdaptations - 1,
                },
              };
              let review = await call(
                "component_review",
                {
                  candidateId: candidate.id,
                  packetHash: prepared.evidence.packetHash,
                  inputHash: run.inputHash,
                  requirementIds,
                  stage: context.stage,
                  adaptation: context.adaptation,
                },
                async () =>
                  validateComponentReview(
                    await model.reviewComponent!(
                      structuredClone(context),
                      signal,
                    ),
                    prepared.evidence,
                    requirementIds,
                  ),
                "model",
              );
              const appliedSteps: {
                plan: ComponentAdaptation;
                evidence: typeof prepared.evidence;
              }[] = [];
              while (
                adapter.adaptComponent &&
                model.adaptComponent &&
                (appliedSteps.length === 0
                  ? review.disposition !== "integration_candidate" ||
                    review.sources.some((source) => source.reuse === "adapt")
                  : appliedSteps.length < maxComponentAdaptations &&
                    review.disposition === "needs_more_evidence")
              ) {
                context.adaptation = {
                  attempt: appliedSteps.length + 1,
                  maxAttempts: maxComponentAdaptations,
                  remainingAttempts:
                    maxComponentAdaptations - appliedSteps.length - 1,
                };
                context.stage = componentStageContext(
                  run,
                  need,
                  candidate,
                  retainedEntries,
                );
                const decision = componentAdaptationDecisionSchema.parse(
                  await call(
                    "component_adaptation_decision",
                    {
                      candidateId: candidate.id,
                      packetHash: context.evidence.packetHash,
                      inputHash: run.inputHash,
                      stage: context.stage,
                      adaptation: context.adaptation,
                    },
                    () =>
                      model.adaptComponent!(
                        structuredClone({ ...context, review }),
                        signal,
                      ),
                    "model",
                  ),
                );
                active();
                if (decision.action === "reject") {
                  review = {
                    ...review,
                    disposition: "unsuitable",
                    reason: decision.reason,
                  };
                  break;
                } else {
                  const plan = validateComponentAdaptation(
                    decision.plan,
                    context.evidence,
                  );
                  const beforeAdaptation = structuredClone(context.evidence);
                  const adapted = await call(
                    "component_adapt",
                    {
                      candidateId: candidate.id,
                      packetHash: context.evidence.packetHash,
                      inputHash: run.inputHash,
                      plan,
                      adaptation: context.adaptation,
                    },
                    () =>
                      adapter.adaptComponent!(
                        inspection,
                        structuredClone(beforeAdaptation),
                        structuredClone(plan),
                        signal,
                      ),
                    "adapter",
                    (result) => {
                      receiptsSchema.parse(result.receipts);
                      if (
                        result.evidence.token !== inspection.token ||
                        result.evidence.candidateId !== candidate.id ||
                        result.evidence.inputHash !== run.inputHash ||
                        result.evidence.packetHash ===
                          context.evidence.packetHash
                      )
                        throw Error(
                          "Adapted component identity differs from selected asset/context or was not recaptured",
                        );
                    },
                  );
                  active();
                  appliedSteps.push({
                    plan: structuredClone(plan),
                    evidence: structuredClone(adapted.evidence),
                  });
                  context = {
                    ...context,
                    stage: componentStageContext(
                      run,
                      need,
                      candidate,
                      retainedEntries,
                    ),
                    evidence: adapted.evidence,
                    preservation: componentPreservationChainContext(
                      prepared.evidence,
                      appliedSteps,
                    ),
                  };
                  review = await call(
                    "component_adapted_review",
                    {
                      candidateId: candidate.id,
                      packetHash: context.evidence.packetHash,
                      inputHash: run.inputHash,
                      requirementIds,
                      stage: context.stage,
                      adaptation: context.adaptation,
                      preservation: context.preservation,
                    },
                    async () =>
                      validateComponentReview(
                        await model.reviewComponent!(
                          structuredClone(context),
                          signal,
                        ),
                        context.evidence,
                        requirementIds,
                      ),
                    "model",
                  );
                }
              }
              if (
                review.disposition === "integration_candidate" &&
                adapter.prepareComponentIntegration
              ) {
                const preparedIntegration = await call(
                  "component_integration_prepare",
                  {
                    candidateId: candidate.id,
                    packetHash: context.evidence.packetHash,
                    inputHash: run.inputHash,
                  },
                  () =>
                    adapter.prepareComponentIntegration!(
                      need,
                      inspection,
                      context.evidence,
                      review,
                      signal,
                    ),
                  "adapter",
                  (result) => {
                    receiptsSchema.parse(result.receipts);
                    const ref = componentReferenceSchema.parse(
                      result.component,
                    );
                    if (
                      ref.needId !== need.id ||
                      ref.candidateId !== candidate.id ||
                      ref.inputHash !== run.inputHash ||
                      ref.packetHash !== context.evidence.packetHash ||
                      ref.archiveHash !== context.evidence.derivativeHash
                    )
                      throw Error(
                        "Integration reference differs from reviewed need/component",
                      );
                  },
                );
                const retainedBundle = bundleSchema.parse(
                  preparedIntegration.bundle,
                );
                if (
                  retainedBundle.files.length ||
                  retainedBundle.scene.length ||
                  retainedBundle.assets.length !== 1 ||
                  retainedBundle.assets[0].id !== need.id ||
                  retainedBundle.assets[0].assetId !== candidate.id ||
                  retainedBundle.assets[0].status !== "retrieved"
                )
                  throw new PipelineHalt(
                    "Component preparation returned an unrelated generated bundle",
                  );
                await cleanup(
                  "Verified component export retained; release quarantine before game integration",
                );
                active();
                entry.component = preparedIntegration.component;
                entry.componentContextHash = run.inputHash;
                entry.bundle = retainedBundle;
                entry.selected = candidate;
                entry.status = "passed";
                entry.reason =
                  "Component source and export checked; retained for worker integration. Placement, media playback and gameplay remain unverified.";
                await record("component_prepared", {
                  component: entry.component,
                  stillPresentInStudio: false,
                  runtimeVerification: "not_performed",
                  placement: "worker_integration_required",
                });
                retainedComponents.set(
                  need.id,
                  structuredClone(
                    componentReferenceSchema.parse(entry.component),
                  ),
                );
                break;
              }
              await cleanup(
                "Component source review complete; execution and integration remain unavailable",
              );
              if (review.disposition === "unsuitable") {
                const reason =
                  "Component review rejected this candidate: " + review.reason;
                await record("candidate_rejected", {
                  candidateId: candidate.id,
                  phase: "component_review",
                  packetHash: context.evidence.packetHash,
                  reason,
                  classification: "candidate_rejected",
                  effects: "none",
                  cleanupConfirmed: true,
                });
                rejected.push({ candidateId: candidate.id, reason });
                continue;
              }
              await escalate(
                "Component source review recorded (" +
                  review.disposition +
                  "): " +
                  review.reason +
                  ". Complete dependency verification and supported native integration are still required; procedural fallback is not authorized.",
              );
              if (
                !need.required &&
                adapter.searchScope === "approved_references"
              )
                continue needsLoop;
              return run;
            }
            await cleanup("Capability review required: " + block.reason);
            await escalate("Asset reuse capability blocked: " + block.reason);
            if (!need.required && adapter.searchScope === "approved_references")
              continue needsLoop;
            return run;
          }
          let reason = !inspection.safe
            ? "Inspection is unsafe: " + inspection.reasons.join("; ")
            : !functional(need, inspection.functional, need.kind !== "Audio")
              ? "Inspection lacks loaded, script-free native functional evidence"
              : !imagePresent(need, inspection.image)
                ? "Inspection lacks an actual image for visual evaluation"
                : "";
          if (!reason && need.kind === "Audio" && !inspection.audio) {
            await cleanup("Audio semantic/listening evaluation is unavailable");
            if (need.required) {
              await escalate(
                "Audio playback does not establish audible semantic fit; listening capability requires actual bound audio evidence",
              );
              return run;
            }
            await failNeed(
              "Optional audio omitted: playback cannot establish audible semantic fit without listening evidence",
            );
            break;
          }
          if (!reason && need.kind === "Audio") {
            try {
              validateBoundAudio(
                inspection.audio!,
                inspection.receipts,
                candidate.id,
                inspection.token,
              );
            } catch (error) {
              reason = "Inspection audio evidence rejected: " + String(error);
            }
          }
          if (!reason) {
            const evaluation = assetEvaluationSchema.parse(
              await call(
                "inspection_evaluation",
                {
                  candidateId: candidate.id,
                  image: inspection.image,
                  audio: audioSummary(
                    need.kind === "Audio" ? inspection.audio : undefined,
                  ),
                  route: run.policy.evaluatorRoute,
                },
                () =>
                  model.evaluate(
                    {
                      phase: "inspection",
                      need,
                      candidate,
                      inspection: {
                        path: inspection.path,
                        safe: inspection.safe,
                        reasons: inspection.reasons,
                        functional: inspection.functional,
                        snapshot: observationSummary(inspection.snapshot),
                        audio: audioSummary(
                          need.kind === "Audio" ? inspection.audio : undefined,
                        ),
                      },
                    },
                    inspection.image,
                    signal,
                    need.kind === "Audio" ? inspection.audio : undefined,
                  ),
                "model",
              ),
            );
            active();
            if (
              !evaluation.accepted ||
              (need.kind === "Audio"
                ? evaluation.audioFit !== true
                : !evaluation.visualFit) ||
              !evaluation.functionalFit
            ) {
              if (
                adapter.searchScope === "approved_references" &&
                !groundedAssetRejection(
                  evaluation,
                  (run.inputContext?.gameContext as any)?.userSources ?? [],
                  inspection.reasons,
                )
              )
                await record("approval_limitation", {
                  candidateId: candidate.id,
                  phase: "inspection",
                  reason: evaluation.reason,
                });
              else
                reason =
                  "Inspection evaluator rejected candidate: " +
                  evaluation.reason;
            }
          }
          if (reason) {
            await record("candidate_rejected", {
              candidateId: candidate.id,
              phase: "inspection",
              reason,
            });
            await cleanup(reason);
            rejected.push({ candidateId: candidate.id, reason });
            continue;
          }
          const placed = await candidateOperation("placed", candidate, () =>
            call(
              "place",
              {
                needId: need.id,
                candidateId: candidate.id,
                token: inspection.token,
              },
              () => adapter.place(need, inspection, signal),
              "adapter",
            ),
          );
          if (!placed) continue;
          active();
          receiptsSchema.parse(placed.receipts);
          reason = !placed.passed
            ? "Native placement verification failed: " +
              placed.reasons.join("; ")
            : !functional(need, placed.functional)
              ? "Placed asset lacks loaded, script-free native functional evidence"
              : !imagePresent(need, placed.image)
                ? "Placed asset lacks an actual image for evaluation"
                : "";
          if (!reason && need.kind === "Audio") {
            if (!placed.audio)
              reason =
                "Placed asset lacks actual audio evidence; listening verification remains unavailable";
            else
              try {
                validateBoundAudio(
                  placed.audio,
                  placed.receipts,
                  candidate.id,
                  inspection.token,
                  inspection.audio,
                );
              } catch (error) {
                reason = "Placement audio evidence rejected: " + String(error);
              }
          }
          if (!reason) {
            const evaluation = assetEvaluationSchema.parse(
              await call(
                "placement_evaluation",
                {
                  candidateId: candidate.id,
                  image: placed.image,
                  audio: audioSummary(
                    need.kind === "Audio" ? placed.audio : undefined,
                  ),
                  route: run.policy.evaluatorRoute,
                },
                () =>
                  model.evaluate(
                    {
                      phase: "placed",
                      need,
                      candidate,
                      verification: {
                        passed: placed.passed,
                        reasons: placed.reasons,
                        functional: placed.functional,
                        snapshot: observationSummary(placed.snapshot),
                        geometry: geometrySummary(placed.bundle?.scene),
                        audio: audioSummary(
                          need.kind === "Audio" ? placed.audio : undefined,
                        ),
                      },
                    },
                    placed.image,
                    signal,
                    need.kind === "Audio" ? placed.audio : undefined,
                  ),
                "model",
              ),
            );
            active();
            if (
              !evaluation.accepted ||
              (need.kind === "Audio"
                ? evaluation.audioFit !== true
                : !evaluation.visualFit) ||
              !evaluation.functionalFit
            ) {
              if (
                adapter.searchScope === "approved_references" &&
                !groundedAssetRejection(
                  evaluation,
                  (run.inputContext?.gameContext as any)?.userSources ?? [],
                  placed.reasons,
                )
              )
                await record("approval_limitation", {
                  candidateId: candidate.id,
                  phase: "placed",
                  reason: evaluation.reason,
                });
              else
                reason =
                  "Placed-asset evaluator rejected candidate: " +
                  evaluation.reason;
            }
          }
          if (reason) {
            await record("candidate_rejected", {
              candidateId: candidate.id,
              phase: "placed",
              reason,
            });
            await cleanup(reason);
            rejected.push({ candidateId: candidate.id, reason });
            continue;
          }
          const verifiedBundle = bundleSchema.parse(placed.bundle);
          if (
            !verifiedBundle.scene.length ||
            verifiedBundle.files.length ||
            verifiedBundle.scene.some((node) =>
              ["Script", "LocalScript", "ModuleScript"].includes(
                node.className,
              ),
            )
          )
            throw new PipelineHalt(
              "Asset export must contain scene objects and no executable scripts",
            );
          // The whole-game plugin owns the final namespace. Retain the verified export,
          // then release only this adapter-owned temporary import before claiming success.
          await cleanup(
            "Verified export retained; release temporary imports before the whole-game apply",
          );
          active();
          await record("asset_released", {
            candidateId: candidate.id,
            bundleHash: sha(JSON.stringify(verifiedBundle)),
            finalGameVerification: "pending",
            stillPresentInStudio: false,
          });
          entry.bundle = verifiedBundle;
          entry.status = "passed";
          entry.selected = candidate;
          entry.reason =
            "Temporary inspection and placement verified by both evaluator observations, then owned imports released; exported bundle retained. Final whole-game verification remains pending.";
          await record("need_passed", {
            candidate,
            bundleHash: sha(JSON.stringify(entry.bundle)),
            attempts: entry.attempts,
          });
          owned = undefined;
          break;
        }
        if (entry.status === "pending" && fallbackPolicy()?.blockingReason) {
          const reason = fallbackPolicy()!.blockingReason!;
          await record("visual_fallback_blocked", fallbackPolicy());
          await escalate(reason);
          if (!need.required && adapter.searchScope === "approved_references")
            continue needsLoop;
          return run;
        }
        if (entry.status === "pending") {
          if (fallbackPolicy())
            await record("visual_fallback_eligible", fallbackPolicy());
          await failNeed("Candidate attempt budget exhausted");
        }
      } catch (error) {
        // A settled acquisition failure leaves a gap. Cancellation, uncertain
        // native effects and failed durable logging still halt the entire run.
        if (
          need.required ||
          adapter.searchScope !== "approved_references" ||
          signal.aborted ||
          error instanceof PersistenceHalt ||
          (error instanceof PipelineHalt && error.unsafeToClean)
        )
          throw error;
        if (owned) await cleanup("Acquisition failed: " + String(error));
        await failNeed(String(error));
      }
    }
    active();
    run.status = run.entries.some(
      (e) =>
        e.status !== "passed" &&
        run.needs.find((n) => n.id === e.needId)!.required,
    )
      ? "failed"
      : "passed";
    run.finishedAt = now();
    if (run.status === "failed")
      run.error = "One or more required asset needs failed";
    await record("run_finished", {
      status: run.status,
      optionalFailedNeedIds: run.entries
        .filter(
          (e) =>
            e.status !== "passed" &&
            !run.needs.find((n) => n.id === e.needId)!.required,
        )
        .map((e) => e.needId),
    });
    return run;
  } catch (error) {
    if (error instanceof PersistenceHalt) throw error; // Never issue an unlogged follow-up mutation.
    let failure =
      error instanceof PipelineHalt
        ? error
        : new PipelineHalt(
            String(error),
            signal.aborted ? "interrupted" : "failed",
          );
    if (owned && !failure.unsafeToClean) {
      try {
        await cleanup("Pipeline stopped: " + failure.message);
      } catch (cleanupError) {
        if (cleanupError instanceof PersistenceHalt) throw cleanupError;
        failure = cleanupError as PipelineHalt;
      }
    } else if (owned)
      await record("cleanup_deferred", {
        token: owned.token,
        path: owned.path,
        reason:
          "Transport/write outcome uncertain; no automatic follow-up mutation",
        recoveryRequired: true,
      });
    run.status = failure.status;
    if (failure.unsafeToClean || owned) run.requiresReconciliation = true;
    run.error = failure.message;
    run.finishedAt = now();
    const entry = run.entries.find((e) => e.needId === current);
    if (entry && entry.status !== "passed") {
      entry.status = "failed";
      entry.reason = failure.message;
      delete entry.bundle;
      delete entry.selected;
    }
    await record("run_halted", {
      status: run.status,
      reason: failure.message,
      ownedToken: owned?.token,
      requiresReconciliation: run.requiresReconciliation === true,
      retry: false,
    });
    return run;
  }
}
