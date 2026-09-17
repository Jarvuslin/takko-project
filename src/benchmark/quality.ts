import { z } from "zod";

export const DIMENSION_IDS = [
  "mechanics",
  "content_depth",
  "art_environment",
  "animation",
  "ui_ux",
  "vfx",
  "audio",
  "game_feel",
  "reliability",
  "performance",
  "intent_alignment",
] as const;
export type Dimension = (typeof DIMENSION_IDS)[number];
export const DIMENSION_WEIGHTS: Readonly<Record<Dimension, number>> =
  Object.freeze({
    mechanics: 15,
    content_depth: 15,
    art_environment: 15,
    animation: 10,
    ui_ux: 8,
    vfx: 7,
    audio: 5,
    game_feel: 10,
    reliability: 5,
    performance: 5,
    intent_alignment: 5,
  });
export const GATE_IDS = [
  "runtime_errors",
  "core_progress",
  "required_features",
  "animation",
  "asset_integration",
  "asset_sourcing",
  "combat_feedback",
  "ui",
  "longform_progression",
] as const;
export type GateId = (typeof GATE_IDS)[number];
export type BenchmarkTrack = "dev_task" | "game_quality";
export const EVIDENCE_KINDS = [
  "native_test",
  "deterministic_test",
  "gameplay_video",
  "screenshot",
  "runtime_log",
  "performance_capture",
  "asset_provenance",
  "native_animation",
  "audio_capture",
  "human_playtest",
  "gameplay_checkpoint",
  "static_analysis",
  "source_inspection",
  "model_review",
] as const;
export type EvidenceKind = (typeof EVIDENCE_KINDS)[number];
const text = z.string().trim().min(1);
const ids = z.array(text).max(100);
const checkpointSchema = z.object({
  id: text,
  minElapsedSeconds: z.number().finite().nonnegative(),
});
export const qualityCaseSchema = z.object({
  id: text,
  version: text,
  track: z.enum(["dev_task", "game_quality"]),
  requiredGates: z.array(z.enum(GATE_IDS)),
  requiredDevChecks: ids,
  requiredCheckpoints: z.array(checkpointSchema).optional(),
  devCheckEvidence: z
    .record(text, z.array(z.array(z.enum(EVIDENCE_KINDS)).min(1)).min(1))
    .optional(),
});
export type QualityCase = z.infer<typeof qualityCaseSchema>;
const evidenceSchema = z
  .object({
    id: text,
    artifactHash: z.string().regex(/^[a-f0-9]{64}$/),
    kind: z.enum(EVIDENCE_KINDS),
    uri: text,
    observation: text,
    outcome: z.enum(["passed", "failed", "observed"]),
    dimensions: z.array(z.enum(DIMENSION_IDS)).default([]),
    gates: z.array(z.enum(GATE_IDS)).default([]),
    devChecks: ids.default([]),
    checkpoint: z
      .object({
        id: text,
        elapsedSeconds: z.number().finite().nonnegative(),
        sessionId: text.optional(),
        sessionStartedAt: z.string().datetime({ offset: true }).optional(),
        observedAt: z.string().datetime({ offset: true }).optional(),
        activeElapsedSeconds: z.number().finite().nonnegative().optional(),
      })
      .optional(),
  })
  .strict();
export type QualityEvidence = z.input<typeof evidenceSchema>;
const resultStatus = z.enum(["passed", "failed"]);
export const qualitySubmissionSchema = z
  .object({
    candidateId: text,
    artifactHash: z.string().regex(/^[a-f0-9]{64}$/),
    caseId: text,
    caseVersion: text,
    protocolVersion: text,
    track: z.enum(["dev_task", "game_quality"]),
    budgetMicros: z.number().int().nonnegative().nullable(),
    runKind: z.enum(["prospective", "retrospective"]),
    assistance: z.enum([
      "untouched_model",
      "automated_repair",
      "expert_assisted",
    ]),
    toolProfile: text,
    environmentProfile: text,
    seed: text.optional(),
    replicateId: text.optional(),
    evidence: z.array(evidenceSchema).max(2000),
    dimensionScores: z.array(
      z
        .object({
          dimension: z.enum(DIMENSION_IDS),
          score: z.number().finite().min(0).max(10),
          evidenceIds: ids,
        })
        .strict(),
    ),
    gateResults: z.array(
      z
        .object({
          gate: z.enum(GATE_IDS),
          status: resultStatus,
          evidenceIds: ids,
        })
        .strict(),
    ),
    devChecks: z.array(
      z.object({ id: text, status: resultStatus, evidenceIds: ids }).strict(),
    ),
  })
  .strict();
export type QualitySubmission = z.input<typeof qualitySubmissionSchema>;
type Evidence = z.output<typeof evidenceSchema>;
export type ObservationStatus = "passed" | "failed" | "pending";
export type QualityResult = {
  candidateId: string;
  artifactHash: string;
  track: BenchmarkTrack;
  status: "failed" | "pending" | "evaluated" | "passed";
  finalScore: number | null;
  observedWeightedScore: number | null;
  goodRatingEligible: boolean | null;
  dimensions: {
    dimension: Dimension;
    weight: number;
    status: "scored" | "pending";
    score: number | null;
    evidenceIds: string[];
  }[];
  gates: {
    gate: GateId;
    status: ObservationStatus;
    evidenceIds: string[];
    reason?: string;
  }[];
  devChecks: { id: string; status: ObservationStatus; evidenceIds: string[] }[];
  pending: string[];
};

// These contracts check evidence labels and attribution, not file authenticity.
// The importer must hash/read the referenced files and verify their provenance.
export const dimensionEvidenceKinds: Readonly<
  Record<Dimension, readonly EvidenceKind[]>
> = {
  mechanics: ["native_test", "human_playtest"],
  content_depth: ["gameplay_video", "human_playtest", "gameplay_checkpoint"],
  art_environment: ["screenshot", "gameplay_video", "human_playtest"],
  animation: ["gameplay_video", "native_animation", "human_playtest"],
  ui_ux: ["gameplay_video", "human_playtest"],
  vfx: ["gameplay_video", "human_playtest"],
  audio: ["audio_capture", "human_playtest"],
  game_feel: ["human_playtest", "gameplay_video"],
  reliability: ["native_test", "runtime_log"],
  performance: ["performance_capture"],
  intent_alignment: ["human_playtest", "native_test"],
};
const gateKinds: Record<GateId, EvidenceKind[][]> = {
  runtime_errors: [["runtime_log", "native_test"]],
  core_progress: [["native_test", "human_playtest", "gameplay_checkpoint"]],
  required_features: [["native_test", "human_playtest"]],
  animation: [["gameplay_video", "native_animation", "human_playtest"]],
  asset_integration: [["asset_provenance"], ["native_test", "human_playtest"]],
  asset_sourcing: [["asset_provenance"], ["native_test", "human_playtest"]],
  combat_feedback: [
    ["gameplay_video", "human_playtest"],
    ["audio_capture", "human_playtest"],
  ],
  ui: [["gameplay_video", "human_playtest", "native_test"]],
  longform_progression: [["gameplay_checkpoint"]],
};
function unique(values: readonly string[], label: string) {
  if (new Set(values).size !== values.length) throw Error("Duplicate " + label);
}
function requiredGates(definition: QualityCase): GateId[] {
  return [
    ...new Set<GateId>([
      ...definition.requiredGates,
      ...(definition.track === "game_quality"
        ? ([
            "runtime_errors",
            "core_progress",
            "required_features",
            "longform_progression",
          ] as GateId[])
        : []),
    ]),
  ];
}
function references(all: Map<string, Evidence>, ids: string[], label: string) {
  unique(ids, label + " evidence IDs");
  if (!ids.length) throw Error(label + " requires observation evidence");
  return ids.map((id) => {
    const found = all.get(id);
    if (!found) throw Error(label + " references unknown evidence: " + id);
    return found;
  });
}
function hasKinds(evidence: Evidence[], groups: EvidenceKind[][]) {
  return groups.every((group) =>
    evidence.some((item) => group.includes(item.kind)),
  );
}
function hasCompletePlaySession(
  checkpoints: NonNullable<QualityCase["requiredCheckpoints"]>,
  evidence: Evidence[],
) {
  const sessions = new Map<string, Evidence[]>();
  for (const item of evidence) {
    const point = item.checkpoint;
    if (
      item.outcome !== "passed" ||
      !point?.sessionId ||
      !point.sessionStartedAt ||
      !point.observedAt ||
      point.activeElapsedSeconds === undefined
    )
      continue;
    const items = sessions.get(point.sessionId) ?? [];
    items.push(item);
    sessions.set(point.sessionId, items);
  }
  return (
    checkpoints.length > 0 &&
    [...sessions.values()].some((items) => {
      if (
        new Set(
          items.map((item) => Date.parse(item.checkpoint!.sessionStartedAt!)),
        ).size !== 1
      )
        return false;
      let previousTime = Date.parse(items[0].checkpoint!.sessionStartedAt!),
        previousActive = 0,
        previousElapsed = 0;
      for (const required of [...checkpoints].sort(
        (a, b) => a.minElapsedSeconds - b.minElapsedSeconds,
      )) {
        const matches = items
          .filter(
            (item) =>
              item.checkpoint!.id === required.id &&
              item.checkpoint!.activeElapsedSeconds! >=
                required.minElapsedSeconds,
          )
          .sort(
            (a, b) =>
              Date.parse(a.checkpoint!.observedAt!) -
              Date.parse(b.checkpoint!.observedAt!),
          );
        const next = matches.find((item) => {
          const point = item.checkpoint!,
            time = Date.parse(point.observedAt!);
          return (
            time > previousTime &&
            point.activeElapsedSeconds! >= previousActive &&
            point.elapsedSeconds >= previousElapsed &&
            point.activeElapsedSeconds! - previousActive <=
              (time - previousTime) / 1000
          );
        });
        if (!next) return false;
        previousTime = Date.parse(next.checkpoint!.observedAt!);
        previousActive = next.checkpoint!.activeElapsedSeconds!;
        previousElapsed = next.checkpoint!.elapsedSeconds;
      }
      return true;
    })
  );
}

/** Score an attributed evidence submission against a separately selected fixed case. */
export function scoreQuality(
  caseInput: QualityCase,
  input: QualitySubmission,
): QualityResult {
  const definition = qualityCaseSchema.parse(caseInput),
    submission = qualitySubmissionSchema.parse(input);
  if (
    submission.caseId !== definition.id ||
    submission.caseVersion !== definition.version ||
    submission.track !== definition.track
  )
    throw Error("Submission does not match the benchmark case/version/track");
  unique(definition.requiredGates, "required gates");
  unique(definition.requiredDevChecks, "required development checks");
  for (const id of Object.keys(definition.devCheckEvidence ?? {})) {
    if (!definition.requiredDevChecks.includes(id))
      throw Error(
        "Evidence policy references an unknown development check: " + id,
      );
  }
  const checkpoints = definition.requiredCheckpoints ?? [];
  unique(
    checkpoints.map((item) => item.id),
    "required checkpoints",
  );
  if (
    definition.track === "game_quality" &&
    !checkpoints.some((item) => item.minElapsedSeconds >= 900)
  )
    throw Error(
      "Game quality requires checkpoint observations through at least 15 minutes",
    );
  if (definition.track === "dev_task" && !definition.requiredDevChecks.length)
    throw Error("Development benchmark requires explicit development checks");
  unique(
    submission.evidence.map((item) => item.id),
    "evidence IDs",
  );
  unique(
    submission.dimensionScores.map((item) => item.dimension),
    "dimension scores",
  );
  unique(
    submission.gateResults.map((item) => item.gate),
    "gate results",
  );
  unique(
    submission.devChecks.map((item) => item.id),
    "development results",
  );
  const evidence = new Map(submission.evidence.map((item) => [item.id, item]));
  for (const item of submission.evidence) {
    if (item.artifactHash !== submission.artifactHash)
      throw Error("Evidence artifact hash mismatch: " + item.id);
    unique(item.dimensions, "evidence dimension targets");
    unique(item.gates, "evidence gate targets");
    unique(item.devChecks, "evidence check targets");
    if (
      item.checkpoint &&
      (item.kind !== "gameplay_checkpoint" ||
        !checkpoints.some((point) => point.id === item.checkpoint!.id))
    )
      throw Error("Unexpected checkpoint evidence: " + item.id);
    if (item.kind === "gameplay_checkpoint" && !item.checkpoint)
      throw Error(
        "Gameplay checkpoint evidence requires a checkpoint observation",
      );
    if (item.checkpoint) {
      const point = item.checkpoint;
      if (
        point.activeElapsedSeconds !== undefined &&
        point.activeElapsedSeconds > point.elapsedSeconds
      )
        throw Error("Checkpoint active play exceeds elapsed time: " + item.id);
      if (
        point.sessionStartedAt &&
        point.observedAt &&
        point.elapsedSeconds >
          (Date.parse(point.observedAt) - Date.parse(point.sessionStartedAt)) /
            1000
      )
        throw Error(
          "Checkpoint elapsed time contradicts observation timestamps: " +
            item.id,
        );
    }
  }
  const gates = requiredGates(definition);
  for (const result of submission.gateResults) {
    if (!gates.includes(result.gate))
      throw Error("Gate is outside case scope: " + result.gate);
    if (result.gate === "longform_progression")
      throw Error(
        "Longform gate is derived from checkpoint observations, not submitted as a claim",
      );
    const refs = references(evidence, result.evidenceIds, result.gate);
    if (
      refs.some(
        (item) =>
          !item.gates.includes(result.gate) || item.outcome !== result.status,
      )
    )
      throw Error("Gate evidence target/outcome mismatch: " + result.gate);
    if (!hasKinds(refs, gateKinds[result.gate]))
      throw Error("Gate requires native observation kinds: " + result.gate);
  }
  for (const result of submission.dimensionScores) {
    if (definition.track !== "game_quality")
      throw Error(
        "Development tasks do not receive an overall game-quality score",
      );
    const refs = references(evidence, result.evidenceIds, result.dimension);
    if (
      refs.some(
        (item) =>
          !item.dimensions.includes(result.dimension) ||
          !dimensionEvidenceKinds[result.dimension].includes(item.kind),
      )
    )
      throw Error(
        "Dimension requires matching observation kinds: " + result.dimension,
      );
  }
  for (const result of submission.devChecks) {
    if (!definition.requiredDevChecks.includes(result.id))
      throw Error("Development check is outside case scope: " + result.id);
    const refs = references(evidence, result.evidenceIds, result.id);
    const policy = definition.devCheckEvidence?.[result.id] ?? [
      ["native_test", "deterministic_test"],
    ];
    const allowed: EvidenceKind[] =
      result.status === "failed"
        ? [
            ...policy.flat(),
            "native_test",
            "deterministic_test",
            "static_analysis",
          ]
        : policy.flat();
    if (
      refs.some(
        (item) =>
          !item.devChecks.includes(result.id) ||
          item.outcome !== result.status ||
          !allowed.includes(item.kind),
      )
    )
      throw Error(
        "Development check requires matching deterministic test evidence: " +
          result.id,
      );
    if (result.status === "passed" && !hasKinds(refs, policy))
      throw Error(
        "Development check requires its case-specific observation kinds: " +
          result.id,
      );
  }
  const gateOutcomes: QualityResult["gates"] = gates.map((gate) => {
    if (gate === "longform_progression") {
      const observed = submission.evidence.filter(
        (item) =>
          item.kind === "gameplay_checkpoint" && item.gates.includes(gate),
      );
      const failed = observed.filter((item) => item.outcome === "failed");
      const complete = hasCompletePlaySession(checkpoints, observed);
      return {
        gate,
        status: failed.length ? "failed" : complete ? "passed" : "pending",
        evidenceIds: observed.map((item) => item.id),
        ...(!failed.length && !complete
          ? {
              reason:
                "Requires completed checkpoints from one session with consistent timestamps and active-play elapsed time",
            }
          : {}),
      };
    }
    const nativeFailures = submission.evidence.filter(
      (item) =>
        item.gates.includes(gate) &&
        item.outcome === "failed" &&
        gateKinds[gate].flat().includes(item.kind),
    );
    if (nativeFailures.length)
      return {
        gate,
        status: "failed",
        evidenceIds: nativeFailures.map((item) => item.id),
      };
    const result = submission.gateResults.find((item) => item.gate === gate);
    return {
      gate,
      status: result?.status ?? "pending",
      evidenceIds: result?.evidenceIds ?? [],
    };
  });
  const development: QualityResult["devChecks"] =
    definition.requiredDevChecks.map((id) => {
      const failureKinds: EvidenceKind[] = [
        ...(definition.devCheckEvidence?.[id]?.flat() ?? []),
        "native_test",
        "deterministic_test",
        "static_analysis",
      ];
      const failures = submission.evidence.filter(
        (item) =>
          item.devChecks.includes(id) &&
          item.outcome === "failed" &&
          failureKinds.includes(item.kind),
      );
      if (failures.length)
        return {
          id,
          status: "failed",
          evidenceIds: failures.map((item) => item.id),
        };
      const result = submission.devChecks.find((item) => item.id === id);
      return {
        id,
        status: result?.status ?? "pending",
        evidenceIds: result?.evidenceIds ?? [],
      };
    });
  const dimensions: QualityResult["dimensions"] =
    definition.track === "game_quality"
      ? DIMENSION_IDS.map((dimension) => {
          const result = submission.dimensionScores.find(
            (item) => item.dimension === dimension,
          );
          return {
            dimension,
            weight: DIMENSION_WEIGHTS[dimension],
            status: result ? "scored" : "pending",
            score: result?.score ?? null,
            evidenceIds: result?.evidenceIds ?? [],
          };
        })
      : [];
  const pending = [
    ...gateOutcomes
      .filter((item) => item.status === "pending")
      .map((item) => "gate:" + item.gate),
    ...development
      .filter((item) => item.status === "pending")
      .map((item) => "check:" + item.id),
    ...dimensions
      .filter((item) => item.status === "pending")
      .map((item) => "dimension:" + item.dimension),
  ];
  const failed = [...gateOutcomes, ...development].some(
    (item) => item.status === "failed",
  );
  const weighted =
    dimensions.length && dimensions.every((item) => item.score !== null)
      ? Math.round(
          dimensions.reduce((sum, item) => sum + item.score! * item.weight, 0),
        ) / 100
      : null;
  const finalScore = !failed && !pending.length ? weighted : null;
  const floors: Dimension[] = [
    "mechanics",
    "content_depth",
    "art_environment",
    "animation",
  ];
  return {
    candidateId: submission.candidateId,
    artifactHash: submission.artifactHash,
    track: definition.track,
    status: failed
      ? "failed"
      : pending.length
        ? "pending"
        : definition.track === "dev_task"
          ? "passed"
          : "evaluated",
    finalScore,
    observedWeightedScore: weighted,
    goodRatingEligible:
      definition.track === "dev_task"
        ? null
        : failed
          ? false
          : finalScore === null
            ? null
            : finalScore >= 7 &&
              dimensions
                .filter((item) => floors.includes(item.dimension))
                .every((item) => item.score! >= 5),
    dimensions,
    gates: gateOutcomes,
    devChecks: development,
    pending,
  };
}

/** Repeated runs may have distinct replicate IDs; protocol, scope and resources must match. */
export function compareCandidates(
  aInput: QualitySubmission,
  bInput: QualitySubmission,
) {
  const a = qualitySubmissionSchema.parse(aInput),
    b = qualitySubmissionSchema.parse(bInput);
  const keys = [
    "caseId",
    "caseVersion",
    "protocolVersion",
    "track",
    "budgetMicros",
    "assistance",
    "toolProfile",
    "environmentProfile",
    "seed",
  ] as const;
  const reasons = keys
    .filter((key) => a[key] !== b[key])
    .map((key) => "Different " + key);
  if (a.runKind !== "prospective" || b.runKind !== "prospective")
    reasons.push("Retrospective records are not controlled model comparisons");
  if (a.budgetMicros === null || b.budgetMicros === null)
    reasons.push("Unknown budget prevents controlled comparison");
  if (a.candidateId === b.candidateId)
    reasons.push("Candidates must have distinct IDs");
  return { comparable: reasons.length === 0, reasons };
}
