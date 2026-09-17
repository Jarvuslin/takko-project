import { describe, expect, it } from "vitest";
import {
  benchmarkCases,
  benchmarkVersion,
  caseVersion,
  getBenchmarkCase,
  comparisonProfiles,
  assistanceTracks,
  assetSearchPolicy,
  referenceLibrary,
  nativeSessionProtocol,
  primaryBenchmarkCaseIds,
} from "../src/benchmark/cases";
import {
  DIMENSION_WEIGHTS,
  EVIDENCE_KINDS,
  qualityCaseSchema,
  scoreQuality,
  type QualitySubmission,
} from "../src/benchmark/quality";

describe("Roblox quality V1 fixed case catalog", () => {
  it("pins nine unique versioned definitions compatible with the scorer", () => {
    expect(benchmarkCases.map((c) => c.id)).toEqual([
      "dev.animated-ability",
      "dev.asset-integration",
      "dev.replication-repair",
      "game.crystal-hollow",
      "game.round-combat",
      "game.lantern-adventure",
      "game.asmr-interaction",
      "game.collect-and-steal",
      "game.small-fighting",
    ]);
    for (const c of benchmarkCases) {
      expect(qualityCaseSchema.safeParse(c).success).toBe(true);
      expect(c.version).toBe(caseVersion);
      expect(c.suiteVersion).toBe(benchmarkVersion);
      expect(c.status).toBe("unrun");
      expect(c.prompt.length).toBeGreaterThan(350);
      expect(new Set(c.featureDoD.map((f) => f.id)).size).toBe(
        c.featureDoD.length,
      );
      for (const f of c.featureDoD)
        for (const kind of f.evidence) expect(EVIDENCE_KINDS).toContain(kind);
      expect(
        c.requiredDevChecks.every((id) =>
          c.featureDoD.some((f) => f.id === id),
        ),
      ).toBe(true);
      expect(
        c.referenceIds.every((id) =>
          referenceLibrary.some((ref) => ref.id === id),
        ),
      ).toBe(true);
    }
    const copy = getBenchmarkCase("game.crystal-hollow");
    copy.requiredGates.length = 0;
    expect(getBenchmarkCase(copy.id).requiredGates.length).toBeGreaterThan(0);
    expect(() => getBenchmarkCase("invented")).toThrow(
      "Unknown benchmark case",
    );
  });

  it("keeps focused repair/asset tasks free from unrelated full-game gates", () => {
    const repair = getBenchmarkCase("dev.replication-repair"),
      asset = getBenchmarkCase("dev.asset-integration"),
      ability = getBenchmarkCase("dev.animated-ability");
    for (const c of [repair, asset]) {
      expect(c.requiredGates).not.toContain("animation");
      expect(c.requiredGates).not.toContain("combat_feedback");
      expect(c.requiredCheckpoints).toEqual([]);
      expect(c.actionStoryboard).toEqual([]);
      expect(
        comparisonProfiles[c.comparisonProfileId].nativePlaySeconds,
      ).toBeNull();
    }
    expect(repair.assetPolicy).toBeNull();
    expect(asset.requiredGates).toContain("asset_integration");
    expect(ability.requiredGates).toEqual(
      expect.arrayContaining(["animation", "combat_feedback"]),
    );
    expect(ability.actionStoryboard[0].execution).toContain("release marker");
    expect(
      [repair, ability].every(
        (c) =>
          c.fixture.status === "unprepared" &&
          c.fixture.artifactSha256 === null,
      ),
    ).toBe(true);
    expect(asset.fixture.status).toBe("prepared");
  });

  it("requires real progressive fifteen-minute observation only for complete game cases", () => {
    const games = benchmarkCases.filter((c) => c.track === "game_quality");
    expect(games).toHaveLength(6);
    for (const c of games) {
      expect(c.requiredCheckpoints?.map((p) => p.minElapsedSeconds)).toEqual([
        120, 300, 600, 900,
      ]);
      expect(c.checkpoints.map((p) => p.id)).toEqual(
        c.requiredCheckpoints?.map((p) => p.id),
      );
      expect(c.checkpoints.every((p) => p.evidenceStatus === "pending")).toBe(
        true,
      );
      expect(c.actionStoryboard.length).toBeGreaterThan(0);
      expect(c.requiredGates).toEqual(
        expect.arrayContaining([
          "runtime_errors",
          "core_progress",
          "required_features",
          "animation",
          "ui",
        ]),
      );
      expect(c.featureDoD.some((f) => f.id === "asset-search-and-fit")).toBe(
        true,
      );
      expect(c.comparisonProfileId).toBe("game-v1");
    }
    expect(
      getBenchmarkCase("game.lantern-adventure").requiredGates,
    ).not.toContain("combat_feedback");
    expect(getBenchmarkCase("game.crystal-hollow").requiredGates).not.toContain(
      "combat_feedback",
    );
    expect(Object.values(DIMENSION_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(
      100,
    );
    expect(nativeSessionProtocol.activePlayClock).toContain(
      "unaccelerated active gameplay",
    );
    expect(nativeSessionProtocol.activePlayClock).toContain(
      "Wall-clock waiting alone",
    );
  });

  it("makes the user archetypes primary without treating them as verified named references", () => {
    expect(primaryBenchmarkCaseIds).toEqual([
      "game.asmr-interaction",
      "game.collect-and-steal",
      "game.small-fighting",
    ]);
    const primary = primaryBenchmarkCaseIds.map(getBenchmarkCase);
    expect(primary.map((c) => c.caseTier)).toEqual(["easy", "medium", "hard"]);
    expect(primary.map((c) => c.primaryPlayerSetup)).toEqual([
      { count: 1, mode: "solo" },
      { count: 2, mode: "competitive" },
      { count: 2, mode: "competitive" },
    ]);
    expect(nativeSessionProtocol.players).toContain(
      "case-appropriate solo, cooperative or competitive",
    );
    expect(nativeSessionProtocol.players).toContain(
      "two actual clients during primary active play",
    );
    expect(
      primary.every(
        (c) =>
          c.referenceIds.length === 0 &&
          c.fixture.directory ===
            "benchmarks/fixtures/v1/fresh-game-primary-v1",
      ),
    ).toBe(true);
    for (const c of primary) {
      expect(c.requiredDevChecks.length).toBeGreaterThanOrEqual(8);
      expect(new Set(c.requiredDevChecks)).toEqual(
        new Set(c.featureDoD.map((f) => f.id)),
      );
      expect(Object.keys(c.devCheckEvidence!).sort()).toEqual(
        [...c.requiredDevChecks].sort(),
      );
      expect(c.requiredGates).toContain("asset_sourcing");
    }
    expect(primary[0].requiredGates).not.toContain("combat_feedback");
    expect(
      primary[0].featureDoD.find((f) => f.id === "asmr-action-motion")
        ?.requirement,
    ).toContain("avatar combat clips are not required");
    expect(primary[1].prompt).toContain("original characters");
    expect(primary[1].devCheckEvidence?.["heist-service-save"]).toEqual([
      ["native_test"],
    ]);
    expect(
      primary[1].featureDoD.find((f) => f.id === "heist-service-save")
        ?.requirement,
    ).toContain("Rejoin a fresh server/session");
    expect(primary[2].requiredGates).toContain("combat_feedback");
    expect(
      primary[2].devCheckEvidence?.["fight-two-client-replication"],
    ).toEqual([["native_test"], ["gameplay_video"]]);
  });

  it("does not accept mocked storage as the primary medium game's real persistence proof", () => {
    const c = getBenchmarkCase("game.collect-and-steal"),
      artifactHash = "b".repeat(64);
    const input: QualitySubmission = {
      candidateId: "test-only",
      artifactHash,
      caseId: c.id,
      caseVersion: c.version,
      protocolVersion: benchmarkVersion,
      track: c.track,
      budgetMicros: 2_000_000,
      runKind: "prospective",
      assistance: "untouched_model",
      toolProfile: "test",
      environmentProfile: "test",
      evidence: [
        {
          id: "mock-store",
          artifactHash,
          kind: "deterministic_test",
          uri: "fixture://mock-store",
          observation: "In-memory store saved a value",
          outcome: "passed",
          devChecks: ["heist-service-save"],
        },
      ],
      dimensionScores: [],
      gateResults: [],
      devChecks: [
        {
          id: "heist-service-save",
          status: "passed",
          evidenceIds: ["mock-store"],
        },
      ],
    };
    expect(() => scoreQuality(c, input)).toThrow();
  });

  it("never turns unrun cases or unreviewed references into scores", () => {
    for (const c of benchmarkCases) {
      const input: QualitySubmission = {
        candidateId: "unrun-template",
        artifactHash: "a".repeat(64),
        caseId: c.id,
        caseVersion: c.version,
        protocolVersion: benchmarkVersion,
        track: c.track,
        budgetMicros: null,
        runKind: "retrospective",
        assistance: "untouched_model",
        toolProfile: "unprepared",
        environmentProfile: "unprepared",
        evidence: [],
        dimensionScores: [],
        gateResults: [],
        devChecks: [],
      };
      const result = scoreQuality(c, input);
      expect(result.status).toBe("pending");
      expect(result.finalScore).toBeNull();
      expect(result.goodRatingEligible).not.toBe(true);
    }
    for (const reference of referenceLibrary) {
      expect(reference.reviewStatus).toBe("unreviewed");
      expect(reference.rating).toBeNull();
      expect(reference.captures).toEqual([]);
    }
    expect(
      referenceLibrary.find((r) => r.kind === "retrospective_anchor")
        ?.provenance,
    ).toContain("not run under this benchmark");
  });

  it("requires meaningful search and rights/import evidence without a candidate-count quota", () => {
    expect(assetSearchPolicy.requiredBeforeProceduralFallback).toBe(true);
    expect(assetSearchPolicy.minimumCandidateQuota).toBeNull();
    const evidence = assetSearchPolicy.searchEvidence.join(" ");
    for (const phrase of [
      "query",
      "candidate IDs",
      "chosen or rejected",
      "permission",
      "Import receipt",
      "style",
      "performance",
    ])
      expect(evidence).toContain(phrase);
    expect(assetSearchPolicy.fallbackRule).toContain(
      "relevant accepted first result",
    );
    expect(assetSearchPolicy.fallbackRule).toContain("fallback does not pass");
    expect(assistanceTracks).toEqual([
      "untouched_model",
      "automated_repair",
      "expert_assisted",
    ]);
    expect(comparisonProfiles["game-v1"].maxModelCostMicros).toBe(2_000_000);
  });
});
