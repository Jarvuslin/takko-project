import { describe, expect, it } from "vitest";
import {
  compareCandidates,
  DIMENSION_IDS,
  DIMENSION_WEIGHTS,
  scoreQuality,
  type Dimension,
  type EvidenceKind,
  type QualityCase,
  type QualitySubmission,
} from "../src/benchmark/quality";

const hash = "a".repeat(64);
const game: QualityCase = {
  id: "game.fixture",
  version: "1",
  track: "game_quality",
  requiredGates: ["animation", "asset_integration"],
  requiredDevChecks: [],
  requiredCheckpoints: [
    { id: "start", minElapsedSeconds: 120 },
    { id: "progress", minElapsedSeconds: 600 },
    { id: "continued", minElapsedSeconds: 900 },
  ],
};
const dev: QualityCase = {
  id: "dev.fixture",
  version: "1",
  track: "dev_task",
  requiredGates: ["animation"],
  requiredDevChecks: ["rig-playback"],
};
function empty(definition = game): QualitySubmission {
  return {
    candidateId: "candidate-a",
    artifactHash: hash,
    caseId: definition.id,
    caseVersion: definition.version,
    protocolVersion: "quality-v1",
    track: definition.track,
    budgetMicros: 2_000_000,
    runKind: "prospective",
    assistance: "untouched_model",
    toolProfile: "studio-native-v1",
    environmentProfile: "solo-desktop-v1",
    seed: "1",
    replicateId: "run-1",
    evidence: [],
    dimensionScores: [],
    gateResults: [],
    devChecks: [],
  };
}
const kinds: Record<Dimension, EvidenceKind> = {
  mechanics: "native_test",
  content_depth: "gameplay_video",
  art_environment: "screenshot",
  animation: "native_animation",
  ui_ux: "gameplay_video",
  vfx: "gameplay_video",
  audio: "audio_capture",
  game_feel: "human_playtest",
  reliability: "runtime_log",
  performance: "performance_capture",
  intent_alignment: "native_test",
};
function complete(): QualitySubmission {
  const candidate = empty();
  for (const dimension of DIMENSION_IDS) {
    candidate.evidence.push({
      id: dimension,
      artifactHash: hash,
      kind: kinds[dimension],
      uri: "results/" + dimension + ".json",
      observation: "Recorded scoped observation for " + dimension,
      outcome: "observed",
      dimensions: [dimension],
    });
    candidate.dimensionScores.push({
      dimension,
      score: 8,
      evidenceIds: [dimension],
    });
  }
  for (const gate of [
    "runtime_errors",
    "core_progress",
    "required_features",
    "animation",
    "asset_integration",
  ] as const) {
    const id = "gate-" + gate;
    candidate.evidence.push({
      id,
      artifactHash: hash,
      kind: gate === "animation" ? "native_animation" : "native_test",
      uri: "results/" + id + ".json",
      observation: "Observed required scenario",
      outcome: "passed",
      gates: [gate],
    });
    const evidenceIds = [id];
    if (gate === "asset_integration") {
      candidate.evidence.push({
        id: "asset-origin",
        artifactHash: hash,
        kind: "asset_provenance",
        uri: "results/asset-origin.json",
        observation:
          "Retrieved permissioned asset and checked source identifier",
        outcome: "passed",
        gates: [gate],
      });
      evidenceIds.push("asset-origin");
    }
    candidate.gateResults.push({ gate, status: "passed", evidenceIds });
  }
  for (const point of game.requiredCheckpoints!)
    candidate.evidence.push({
      id: "checkpoint-" + point.id,
      artifactHash: hash,
      kind: "gameplay_checkpoint",
      uri: "results/" + point.id + ".json",
      observation:
        "Completed scenario and observed progressing state at checkpoint",
      outcome: "passed",
      gates: ["longform_progression"],
      checkpoint: {
        id: point.id,
        elapsedSeconds: point.minElapsedSeconds,
        activeElapsedSeconds: point.minElapsedSeconds,
        sessionId: "session-1",
        sessionStartedAt: "2026-09-15T00:00:00Z",
        observedAt: new Date(
          Date.parse("2026-09-15T00:00:00Z") + point.minElapsedSeconds * 1000,
        ).toISOString(),
      },
    });
  return candidate;
}

describe("evidence-based Roblox quality scoring", () => {
  it("keeps the fixed eleven weights totaling100 and missing observations pending, never zero", () => {
    expect(DIMENSION_IDS).toHaveLength(11);
    expect(Object.values(DIMENSION_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(
      100,
    );
    const result = scoreQuality(game, empty());
    expect(result.status).toBe("pending");
    expect(result.finalScore).toBeNull();
    expect(result.observedWeightedScore).toBeNull();
    expect(result.goodRatingEligible).toBeNull();
    expect(
      result.dimensions.every(
        (item) => item.status === "pending" && item.score === null,
      ),
    ).toBe(true);
  });
  it("computes a final weighted score only after all dimensions and mandatory observations", () => {
    const result = scoreQuality(game, complete());
    expect(result.status).toBe("evaluated");
    expect(result.finalScore).toBe(8);
    expect(result.goodRatingEligible).toBe(true);
    expect(result.pending).toEqual([]);
  });
  it("withholds final score for one unknown dimension without reweighting the rest", () => {
    const candidate = complete();
    candidate.dimensionScores.pop();
    const result = scoreQuality(game, candidate);
    expect(result.finalScore).toBeNull();
    expect(result.observedWeightedScore).toBeNull();
    expect(result.pending).toContain("dimension:intent_alignment");
  });
  it.each(["runtime_errors", "core_progress"] as const)(
    "cannot average away native %s failure, even with a claimed passing gate",
    (gate) => {
      const candidate = complete();
      candidate.dimensionScores.forEach((item) => (item.score = 10));
      candidate.evidence.push({
        id: "late-failure",
        artifactHash: hash,
        kind: "native_test",
        uri: "results/late.json",
        observation: "Observed scenario failure",
        outcome: "failed",
        gates: [gate],
      });
      const result = scoreQuality(game, candidate);
      expect(result.status).toBe("failed");
      expect(result.finalScore).toBeNull();
      expect(result.observedWeightedScore).toBe(10);
      expect(result.goodRatingEligible).toBe(false);
      expect(result.gates.find((item) => item.gate === gate)?.status).toBe(
        "failed",
      );
    },
  );
  it("requires low-scoring core quality dimensions to meet a floor despite a high mean", () => {
    const candidate = complete();
    candidate.dimensionScores.forEach((item) => (item.score = 10));
    candidate.dimensionScores.find(
      (item) => item.dimension === "animation",
    )!.score = 4;
    const result = scoreQuality(game, candidate);
    expect(result.finalScore).toBe(9.4);
    expect(result.goodRatingEligible).toBe(false);
  });
  it.each(["model_review", "source_inspection", "static_analysis"] as const)(
    "does not award gameplay, animation or performance from %s",
    (kind) => {
      for (const dimension of [
        "mechanics",
        "animation",
        "performance",
      ] as const) {
        const candidate = complete();
        candidate.evidence.find((item) => item.id === dimension)!.kind = kind;
        expect(() => scoreQuality(game, candidate)).toThrow(
          "observation kinds",
        );
      }
    },
  );
  it("rejects another artifact's evidence even when unused", () => {
    const candidate = complete();
    candidate.evidence[0].artifactHash = "b".repeat(64);
    expect(() => scoreQuality(game, candidate)).toThrow(
      "artifact hash mismatch",
    );
  });
  it("rejects unknown evidence, duplicate evidence and mismatched observation targets", () => {
    let candidate = complete();
    candidate.dimensionScores[0].evidenceIds = ["missing"];
    expect(() => scoreQuality(game, candidate)).toThrow("unknown evidence");
    candidate = complete();
    candidate.evidence.push(candidate.evidence[0]);
    expect(() => scoreQuality(game, candidate)).toThrow("Duplicate evidence");
    candidate = complete();
    candidate.evidence[0].dimensions = ["animation"];
    expect(() => scoreQuality(game, candidate)).toThrow("observation kinds");
  });
  it("rejects score claims without evidence, invalid numeric scores and duplicate scores", () => {
    let candidate = complete();
    candidate.dimensionScores[0].evidenceIds = [];
    expect(() => scoreQuality(game, candidate)).toThrow(
      "requires observation evidence",
    );
    candidate = complete();
    candidate.dimensionScores[0].score = NaN;
    expect(() => scoreQuality(game, candidate)).toThrow();
    candidate = complete();
    candidate.dimensionScores.push(candidate.dimensionScores[0]);
    expect(() => scoreQuality(game, candidate)).toThrow("Duplicate dimension");
  });
  it("requires both asset provenance and observed engine integration", () => {
    const candidate = complete();
    candidate.gateResults.find(
      (item) => item.gate === "asset_integration",
    )!.evidenceIds = ["asset-origin"];
    expect(() => scoreQuality(game, candidate)).toThrow(
      "native observation kinds: asset_integration",
    );
    candidate.gateResults.find(
      (item) => item.gate === "asset_integration",
    )!.evidenceIds = ["gate-asset_integration"];
    expect(() => scoreQuality(game, candidate)).toThrow(
      "native observation kinds: asset_integration",
    );
  });
  it("does not infer polish from mesh, primitive or asset counts", () => {
    const candidate = empty();
    candidate.evidence.push({
      id: "inventory",
      artifactHash: hash,
      kind: "source_inspection",
      uri: "results/inventory.json",
      observation: "1000meshes,0primitive blocks,20animations in inventory",
      outcome: "observed",
      dimensions: ["art_environment", "animation"],
    });
    expect(
      scoreQuality(game, candidate).dimensions.every(
        (item) => item.score === null,
      ),
    ).toBe(true);
  });
  it("enforces feature gates from the case and rejects optional invented gates", () => {
    const candidate = complete();
    candidate.gateResults = candidate.gateResults.filter(
      (item) => item.gate !== "animation",
    );
    expect(scoreQuality(game, candidate).pending).toContain("gate:animation");
    candidate.gateResults.push({
      gate: "combat_feedback",
      status: "passed",
      evidenceIds: ["mechanics"],
    });
    expect(() => scoreQuality(game, candidate)).toThrow("outside case scope");
  });
  it("requires every long-form checkpoint with observed completion and sufficient elapsed time", () => {
    const candidate = complete();
    candidate.evidence.find(
      (item) => item.id === "checkpoint-continued",
    )!.checkpoint!.activeElapsedSeconds = 899;
    expect(scoreQuality(game, candidate).pending).toContain(
      "gate:longform_progression",
    );
    candidate.evidence.find(
      (item) => item.id === "checkpoint-continued",
    )!.checkpoint!.activeElapsedSeconds = 900;
    candidate.evidence.find(
      (item) => item.id === "checkpoint-progress",
    )!.outcome = "observed";
    expect(scoreQuality(game, candidate).finalScore).toBeNull();
    candidate.evidence.find(
      (item) => item.id === "checkpoint-progress",
    )!.outcome = "failed";
    expect(scoreQuality(game, candidate).status).toBe("failed");
  });
  it("rejects a self-declared long-form passing gate and inadequate case protocol", () => {
    const candidate = complete();
    candidate.gateResults.push({
      gate: "longform_progression",
      status: "passed",
      evidenceIds: ["checkpoint-continued"],
    });
    expect(() => scoreQuality(game, candidate)).toThrow(
      "derived from checkpoint",
    );
    expect(() =>
      scoreQuality(
        {
          ...game,
          requiredCheckpoints: [{ id: "brief", minElapsedSeconds: 30 }],
        },
        empty(),
      ),
    ).toThrow("15 minutes");
  });
  it("keeps development correctness separate from whole-game quality", () => {
    const candidate = empty(dev);
    candidate.evidence.push(
      {
        id: "test",
        artifactHash: hash,
        kind: "native_test",
        uri: "results/test.json",
        observation: "Required rig playback test passed",
        outcome: "passed",
        devChecks: ["rig-playback"],
      },
      {
        id: "animation",
        artifactHash: hash,
        kind: "native_animation",
        uri: "results/animation.json",
        observation: "Playback observed",
        outcome: "passed",
        gates: ["animation"],
      },
    );
    candidate.devChecks.push({
      id: "rig-playback",
      status: "passed",
      evidenceIds: ["test"],
    });
    candidate.gateResults.push({
      gate: "animation",
      status: "passed",
      evidenceIds: ["animation"],
    });
    const result = scoreQuality(dev, candidate);
    expect(result.status).toBe("passed");
    expect(result.finalScore).toBeNull();
    expect(result.dimensions).toEqual([]);
    expect(result.goodRatingEligible).toBeNull();
    candidate.dimensionScores.push({
      dimension: "animation",
      score: 10,
      evidenceIds: ["animation"],
    });
    expect(() => scoreQuality(dev, candidate)).toThrow("do not receive");
  });
  it("keeps development checks pending until actual evidence and lets deterministic failure override claims", () => {
    const candidate = empty({ ...dev, requiredGates: [] });
    expect(scoreQuality({ ...dev, requiredGates: [] }, candidate).status).toBe(
      "pending",
    );
    candidate.evidence.push({
      id: "syntax",
      artifactHash: hash,
      kind: "static_analysis",
      uri: "results/syntax.json",
      observation: "Compilation failed",
      outcome: "failed",
      devChecks: ["rig-playback"],
    });
    expect(scoreQuality({ ...dev, requiredGates: [] }, candidate).status).toBe(
      "failed",
    );
  });
});

it("requires native evidence for replication checks even when isolated mock tests pass", () => {
  const definition: QualityCase = {
    ...dev,
    requiredGates: [],
    devCheckEvidence: { "rig-playback": [["native_test"]] },
  };
  const candidate = empty(definition);
  candidate.evidence.push({
    id: "mock",
    artifactHash: hash,
    kind: "deterministic_test",
    uri: "results/mock.json",
    observation: "Isolated rig mock passed",
    outcome: "passed",
    devChecks: ["rig-playback"],
  });
  candidate.devChecks.push({
    id: "rig-playback",
    status: "passed",
    evidenceIds: ["mock"],
  });
  expect(() => scoreQuality(definition, candidate)).toThrow(
    "matching deterministic test evidence",
  );
  candidate.evidence[0].kind = "native_test";
  expect(scoreQuality(definition, candidate).status).toBe("passed");
});
it("requires sourcing proof separately from a functioning procedurally built game", () => {
  const definition: QualityCase = {
    ...game,
    requiredGates: [...game.requiredGates, "asset_sourcing"],
  };
  const candidate = complete();
  expect(scoreQuality(definition, candidate).pending).toContain(
    "gate:asset_sourcing",
  );
  candidate.evidence.push({
    id: "search",
    artifactHash: hash,
    kind: "asset_provenance",
    uri: "results/search.json",
    observation:
      "Relevant search with documented candidates and fallback reason",
    outcome: "passed",
    gates: ["asset_sourcing"],
  });
  candidate.gateResults.push({
    gate: "asset_sourcing",
    status: "passed",
    evidenceIds: ["search"],
  });
  expect(() => scoreQuality(definition, candidate)).toThrow(
    "native observation kinds: asset_sourcing",
  );
  candidate.evidence.push({
    id: "fit",
    artifactHash: hash,
    kind: "human_playtest",
    uri: "results/fit.json",
    observation:
      "Observed fallback fits the intended game and collision behavior",
    outcome: "passed",
    gates: ["asset_sourcing"],
  });
  candidate.gateResults.at(-1)!.evidenceIds.push("fit");
  expect(scoreQuality(definition, candidate).status).toBe("evaluated");
});

it.each(["performance_capture", "gameplay_video", "asset_provenance"] as const)(
  "retains a failed case-allowed %s result and invalidates an earlier pass",
  (kind) => {
    const definition: QualityCase = {
      ...dev,
      requiredGates: [],
      devCheckEvidence: { "rig-playback": [[kind]] },
    };
    const candidate = empty(definition);
    candidate.evidence.push({
      id: "pass",
      artifactHash: hash,
      kind,
      uri: "results/pass.json",
      observation: "Initial measurement passed",
      outcome: "passed",
      devChecks: ["rig-playback"],
    });
    candidate.devChecks.push({
      id: "rig-playback",
      status: "passed",
      evidenceIds: ["pass"],
    });
    expect(scoreQuality(definition, candidate).status).toBe("passed");
    candidate.evidence.push({
      id: "failure",
      artifactHash: hash,
      kind,
      uri: "results/failure.json",
      observation: "Later measurement failed",
      outcome: "failed",
      devChecks: ["rig-playback"],
    });
    expect(scoreQuality(definition, candidate).status).toBe("failed");
    candidate.devChecks[0] = {
      id: "rig-playback",
      status: "failed",
      evidenceIds: ["failure"],
    };
    expect(scoreQuality(definition, candidate).devChecks[0].status).toBe(
      "failed",
    );
  },
);
it.each([
  "missing-session",
  "mixed-sessions",
  "missing-timestamp",
  "missing-active-time",
  "different-session-start",
  "accelerated-active-time",
])("cannot pass longform using %s checkpoint records", (mode) => {
  const candidate = complete();
  const point = candidate.evidence.find(
    (item) => item.id === "checkpoint-progress",
  )!.checkpoint!;
  if (mode === "missing-session") delete point.sessionId;
  if (mode === "mixed-sessions") point.sessionId = "other-session";
  if (mode === "missing-timestamp") delete point.observedAt;
  if (mode === "missing-active-time") delete point.activeElapsedSeconds;
  if (mode === "different-session-start")
    point.sessionStartedAt = "2026-09-14T23:59:00Z";
  if (mode === "accelerated-active-time")
    point.observedAt = "2026-09-15T00:14:59Z";
  const result = scoreQuality(game, candidate);
  expect(result.finalScore).toBeNull();
  expect(
    result.gates.find((item) => item.gate === "longform_progression"),
  ).toMatchObject({
    status: "pending",
    reason: expect.stringContaining("one session"),
  });
});
it("rejects impossible timestamp and elapsed active-play observations", () => {
  const candidate = complete();
  const point = candidate.evidence.find(
    (item) => item.id === "checkpoint-continued",
  )!.checkpoint!;
  point.activeElapsedSeconds = 901;
  expect(() => scoreQuality(game, candidate)).toThrow(
    "active play exceeds elapsed",
  );
  point.activeElapsedSeconds = 900;
  point.observedAt = "2026-09-15T00:00:10Z";
  expect(() => scoreQuality(game, candidate)).toThrow(
    "contradicts observation timestamps",
  );
});

describe("controlled pairwise comparability", () => {
  it("permits different candidates/replicates under the same fixed conditions", () => {
    const a = empty(),
      b = empty();
    b.candidateId = "candidate-b";
    b.artifactHash = "b".repeat(64);
    b.replicateId = "run-2";
    expect(compareCandidates(a, b)).toEqual({ comparable: true, reasons: [] });
  });
  it.each([
    "caseId",
    "caseVersion",
    "protocolVersion",
    "assistance",
    "toolProfile",
    "environmentProfile",
    "seed",
  ] as const)("separates mismatched %s", (key) => {
    const a = empty(),
      b = empty();
    b.candidateId = "candidate-b";
    if (key === "assistance") b[key] = "expert_assisted";
    else b[key] = "different";
    expect(compareCandidates(a, b).reasons).toContain("Different " + key);
  });
  it("separates known budgets and refuses unknown historical budgets or retrospective comparisons", () => {
    const a = empty(),
      b = empty();
    b.candidateId = "candidate-b";
    b.budgetMicros = 3_000_000;
    expect(compareCandidates(a, b).reasons).toContain("Different budgetMicros");
    b.budgetMicros = null;
    expect(compareCandidates(a, b).reasons).toContain(
      "Unknown budget prevents controlled comparison",
    );
    b.budgetMicros = a.budgetMicros;
    b.runKind = "retrospective";
    expect(compareCandidates(a, b).reasons).toContain(
      "Retrospective records are not controlled model comparisons",
    );
  });
});
