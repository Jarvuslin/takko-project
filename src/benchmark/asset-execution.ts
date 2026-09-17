import { createHash } from "node:crypto";
import { z } from "zod";
import { assetNeedSchema } from "../generation/asset-contract";
import { bundleSchema, providerSchema, taskSchema } from "../generation/schema";
import { bundleHash } from "../generation/validation";
import {
  qualityCaseSchema,
  scoreQuality,
  type GateId,
  type QualityCase,
  type QualitySubmission,
} from "./quality";

const text = z.string().trim().min(1);
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const inputContextSchema = z
  .object({
    revision: z.number().int().positive(),
    request: text,
    needs: z.array(assetNeedSchema).max(16),
    studio: text.optional(),
    worker: providerSchema.optional(),
    evaluator: providerSchema.optional(),
    componentReviewer: providerSchema.optional(),
    componentAdapter: providerSchema.optional(),
    // Retain the new source-backed context in its hashed form; old records lack it.
    // This is input identity, never evidence of semantic or native quality.
    gameContext: z.unknown().optional(),
    scope: text.optional(),
    integrationTasks: z.array(taskSchema).max(12).optional(),
  })
  .strict();
const runSchema = z.object({
  version: z.literal(1),
  runId: text,
  revision: z.number().int().positive(),
  inputHash: hash,
  inputContext: inputContextSchema.optional(),
  status: z.enum([
    "running",
    "passed",
    "failed",
    "interrupted",
    "escalation_required",
  ]),
  startedAt: z.string().datetime({ offset: true }),
  finishedAt: z.string().datetime({ offset: true }).optional(),
  policy: z.object({
    maxSearches: z.number().int().min(1).max(3),
    maxCandidates: z.number().int().min(1).max(5),
    allowEscalation: z.boolean(),
    workerRoute: text,
    evaluatorRoute: text,
  }),
  adapter: text,
  needs: z.array(assetNeedSchema).max(16),
  entries: z
    .array(
      z.object({
        needId: text,
        status: z.enum(["pending", "passed", "failed", "escalation_required"]),
        attempts: z.number().int().min(0).max(5),
        reason: text.optional(),
        selected: z.object({ id: text }).optional(),
        bundle: bundleSchema.optional(),
      }),
    )
    .max(16),
  events: z
    .array(
      z.object({
        at: z.string().datetime({ offset: true }),
        needId: z.string(),
        step: text,
        data: z.unknown(),
      }),
    )
    .max(2000),
  error: text.optional(),
  requiresReconciliation: z.boolean().optional(),
});
const projectSchema = z.object({
  schemaVersion: z.literal(2),
  id: text,
  request: text,
  revision: z.number().int().positive(),
  artifact: bundleSchema.nullable(),
  assetStudioId: text.optional(),
  assetPipeline: runSchema.nullish(),
});
export type AssetExecutionOptions = {
  sourceUri?: string;
  /** An importer declaration, never inferred from a file path, adapter name or hashes. */
  recordOrigin?: "production_execution" | "offline_test" | "unverified";
  definition?: QualityCase & { prompt: string };
};

/** Retained system execution is distinct from gameplay/native-quality evidence.
 * Pure projection: no file IO, Studio tools or model calls. Source authenticity
 * must be established by the importer; hashing the record establishes identity only.
 */
export function assessAssetExecution(
  projectInput: unknown,
  options: AssetExecutionOptions = {},
) {
  const serialized = JSON.stringify(projectInput);
  if (!serialized || Buffer.byteLength(serialized) > 64 * 1024 * 1024)
    throw Error("Invalid or oversized retained project record");
  const project = projectSchema.parse(projectInput),
    run = project.assetPipeline;
  const origin = z
    .enum(["production_execution", "offline_test", "unverified"])
    .parse(options.recordOrigin ?? "unverified");
  const definition = options.definition
    ? qualityCaseSchema.parse(options.definition)
    : undefined;
  if (definition && project.request !== options.definition!.prompt)
    throw Error(
      "Project request does not match the fixed benchmark case prompt",
    );
  if (run) {
    if (Buffer.byteLength(JSON.stringify(run)) > 8 * 1024 * 1024)
      throw Error("Asset execution history exceeds storage limit");
    if (run.revision !== project.revision)
      throw Error("Asset run revision does not match project revision");
    const context = run.inputContext;
    if (
      context &&
      (context.revision !== project.revision ||
        context.request !== project.request ||
        context.studio !== project.assetStudioId ||
        (context.worker?.id ?? "unconfigured") !== run.policy.workerRoute ||
        (context.evaluator?.id ?? "unconfigured") !==
          run.policy.evaluatorRoute ||
        new Set(context.needs.map((n) => n.id)).size !== context.needs.length ||
        run.needs.some(
          (need) =>
            !context.needs.some(
              (n) =>
                n.id === need.id && JSON.stringify(n) === JSON.stringify(need),
            ),
        ))
    )
      throw Error(
        "Frozen asset input context does not match project, need scope or route identities",
      );
    const expectedInput = digest(
      JSON.stringify(
        context
          ? (projectInput as { assetPipeline: { inputContext: unknown } })
              .assetPipeline.inputContext
          : {
              revision: project.revision,
              request: project.request,
              // The engine hashes its serialized needs. Preserve their original key
              // order after validation instead of reordering them through Zod output.
              needs: (projectInput as { assetPipeline: { needs: unknown } })
                .assetPipeline.needs,
              studio: project.assetStudioId,
              worker: run.policy.workerRoute,
              evaluator: run.policy.evaluatorRoute,
            },
      ),
    );
    if (run.inputHash !== expectedInput)
      throw Error(
        "Asset run input hash does not match retained project and routes",
      );
    if (
      new Set(run.needs.map((n) => n.id)).size !== run.needs.length ||
      new Set(run.entries.map((e) => e.needId)).size !== run.entries.length ||
      run.entries.length !== run.needs.length ||
      run.entries.some((e) => !run.needs.some((n) => n.id === e.needId))
    )
      throw Error("Asset execution need/entry identity mismatch");
    if (
      run.events.some(
        (e) => e.needId && !run.needs.some((n) => n.id === e.needId),
      )
    )
      throw Error("Asset event refers to an unknown need");
    if (run.entries.some((e) => e.attempts > run.policy.maxCandidates))
      throw Error("Asset execution exceeds candidate attempt budget");
    if (
      run.status === "passed" &&
      run.needs.some(
        (n) =>
          n.required &&
          run.entries.find((e) => e.needId === n.id)?.status !== "passed",
      )
    )
      throw Error("Passed asset run has an incomplete required need");
    if (
      run.entries.some(
        (e) => e.status === "passed" && (!e.selected || !e.bundle),
      )
    )
      throw Error("Passed asset entry lacks retained candidate/export");
  }
  const failed =
    !!run &&
    (run.requiresReconciliation === true ||
      ["failed", "interrupted", "escalation_required"].includes(run.status));
  const integrationAttempted = !!run?.events.some((e) =>
    /^(inspect|place|discard)_/.test(e.step),
  );
  const assetGates: GateId[] = definition
    ? definition.requiredGates.filter(
        (g) => g === "asset_sourcing" || g === "asset_integration",
      )
    : [
        "asset_sourcing",
        ...(integrationAttempted ? ["asset_integration" as const] : []),
      ];
  const reason = failed
    ? (run!.error ??
      `Asset execution ${run!.status}${run!.requiresReconciliation ? "; native effects require reconciliation" : ""}`)
    : run?.status === "passed"
      ? "Asset stage completed; temporary imports were released. Full-game asset sourcing/integration and gameplay acceptance remain unverified."
      : run
        ? "Asset execution is still running; no completed execution result is claimed."
        : "No retained asset execution exists; no asset quality result is claimed.";
  return {
    version: 1 as const,
    assessmentKind: "system_asset_execution" as const,
    status: failed ? ("failed" as const) : ("pending" as const),
    finalScore: null,
    goodRatingEligible: failed ? false : null,
    reason,
    case: definition
      ? {
          id: definition.id,
          version: definition.version,
          track: definition.track,
        }
      : null,
    provenance: {
      source: "retained_project_record" as const,
      sourceUri: options.sourceUri ?? null,
      recordOrigin: origin,
      projectRecordSha256: digest(serialized),
      authenticity: "not established by hashes" as const,
    },
    project: {
      id: project.id,
      revision: project.revision,
      requestHash: digest(project.request),
      artifactHash: project.artifact
        ? bundleHash(
            (projectInput as { artifact: NonNullable<typeof project.artifact> })
              .artifact,
          )
        : null,
    },
    execution: run
      ? {
          runId: run.runId,
          revision: run.revision,
          inputHash: run.inputHash,
          inputBinding: run.inputContext
            ? ("full_profiles" as const)
            : ("legacy_route_ids" as const),
          inputNeedCount: run.inputContext?.needs.length ?? run.needs.length,
          // Hash the original retained run, including fields not needed by this projection.
          recordHash: digest(
            JSON.stringify(
              (projectInput as { assetPipeline: unknown }).assetPipeline,
            ),
          ),
          status: run.status,
          adapter: run.adapter,
          startedAt: run.startedAt,
          finishedAt: run.finishedAt ?? null,
          requiresReconciliation: run.requiresReconciliation ?? false,
          workerRoute: run.policy.workerRoute,
          evaluatorRoute: run.policy.evaluatorRoute,
          eventCount: run.events.length,
          lastStep: run.events.at(-1)?.step ?? null,
          needs: run.needs.map((n) => {
            const entry = run.entries.find((e) => e.needId === n.id)!;
            return {
              needId: n.id,
              requirementId: n.requirementId,
              required: n.required,
              status: entry.status,
              attempts: entry.attempts,
              reason: entry.reason ?? null,
            };
          }),
        }
      : null,
    gates: assetGates.map((gate) => ({
      gate,
      status: failed ? ("failed" as const) : ("pending" as const),
      reason,
      source: "system_execution" as const,
    })),
    limits: [
      "This is an execution assessment, not native_test, asset_provenance or model-quality evidence.",
      "Production/offline origin is an importer declaration; this helper does not authenticate source records.",
      "A completed asset stage never awards a gameplay, visual, audio, asset-sourcing or final integration pass.",
      "Pre-artifact failures have no fabricated artifact hash or numeric quality score; status is explicitly failed.",
    ],
  };
}
export type AssetExecutionAssessment = ReturnType<typeof assessAssetExecution>;

/** For an artifact-backed submission only. Existing evidence integrity/import checks
 * remain required at the caller. System failures can veto success, never grant it.
 */
export function scoreQualityWithAssetExecution(
  definition: QualityCase & { prompt: string },
  submission: QualitySubmission,
  project: unknown,
  options: Omit<AssetExecutionOptions, "definition"> = {},
) {
  const execution = assessAssetExecution(project, { ...options, definition });
  if (
    !execution.project.artifactHash ||
    execution.project.artifactHash !== submission.artifactHash
  )
    throw Error(
      "Asset execution project artifact does not match quality submission",
    );
  const quality = scoreQuality(definition, submission);
  if (execution.status !== "failed")
    return { ...quality, systemExecution: execution };
  const failedGates = new Set(
    execution.gates.filter((g) => g.status === "failed").map((g) => g.gate),
  );
  return {
    ...quality,
    status: "failed" as const,
    finalScore: null,
    goodRatingEligible: definition.track === "game_quality" ? false : null,
    gates: quality.gates.map((g) =>
      failedGates.has(g.gate)
        ? {
            ...g,
            status: "failed" as const,
            evidenceIds: [],
            reason:
              "Retained system asset execution failed; see systemExecution provenance.",
          }
        : g,
    ),
    pending: quality.pending.filter(
      (p) => !Array.from(failedGates).some((g) => p === `gate:${g}`),
    ),
    systemExecution: execution,
  };
}
