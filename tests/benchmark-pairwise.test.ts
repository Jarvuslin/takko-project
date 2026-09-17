import { describe, expect, it } from "vitest";
import {
  createPairwiseReviewPacket,
  validatePairwiseReview,
} from "../src/benchmark/pairwise";
import {
  DIMENSION_IDS,
  dimensionEvidenceKinds,
  type QualitySubmission,
} from "../src/benchmark/quality";

function submission(id: string, hash: string): QualitySubmission {
  return {
    candidateId: id,
    artifactHash: hash.repeat(64),
    caseId: "game.crystal-hollow",
    caseVersion: "1.0.0",
    protocolVersion: "roblox-quality-v1",
    track: "game_quality",
    budgetMicros: 2_000_000,
    runKind: "prospective",
    assistance: "untouched_model",
    toolProfile: "same-frozen-toolset",
    environmentProfile: "same-frozen-device",
    seed: "run-seed",
    evidence: [
      {
        id: id + "-footage",
        artifactHash: hash.repeat(64),
        kind: "gameplay_video",
        uri: "evidence/video-" + hash + ".mp4",
        observation: "Untrusted identity-bearing observation " + id,
        outcome: "observed",
        dimensions: ["art_environment", "animation"],
      },
      {
        id: id + "-model-review",
        artifactHash: hash.repeat(64),
        kind: "model_review",
        uri: "private-model-review.txt",
        observation: "Model says " + id + " is best",
        outcome: "passed",
      },
    ],
    dimensionScores: [],
    gateResults: [],
    devChecks: [],
  };
}

describe("masked pairwise review packets", () => {
  it("accepts unscored comparable candidates and keeps identities outside the displayed packet/form", () => {
    const a = submission("candidate-luna", "a"),
      b = submission("candidate-sol", "b");
    const { packet, form, mapping } = createPairwiseReviewPacket(
      a,
      b,
      "review-seed",
    );
    const visible = JSON.stringify({ packet, form });
    for (const privateValue of [
      a.candidateId,
      b.candidateId,
      a.artifactHash,
      b.artifactHash,
      a.toolProfile,
      a.environmentProfile,
      "private-model-review.txt",
    ])
      expect(visible).not.toContain(privateValue);
    expect(packet.candidates.A.evidence[0].id).toBe("A-E001");
    expect(packet.candidates.B.evidence[0].id).toBe("B-E001");
    expect(form.judgments.map((j) => j.dimension)).toEqual(DIMENSION_IDS);
    expect(
      form.judgments.every((j) => j.choice === null && j.confidence === null),
    ).toBe(true);
    expect(mapping.private).toBe(true);
    expect(
      new Set(Object.values(mapping.identities).map((i) => i.candidateId)),
    ).toEqual(new Set([a.candidateId, b.candidateId]));
    expect(packet.limitations.join(" ")).toContain("may reveal identity");
    expect(() => validatePairwiseReview(packet, form)).toThrow();
  });

  it("assigns deterministically from seed, including reversed CLI input order", () => {
    const a = submission("candidate-one", "a"),
      b = submission("candidate-two", "b");
    const original = createPairwiseReviewPacket(a, b, "fixed");
    expect(createPairwiseReviewPacket(a, b, "fixed")).toEqual(original);
    expect(createPairwiseReviewPacket(b, a, "fixed")).toEqual(original);
    const observed = new Set(
      Array.from(
        { length: 20 },
        (_, i) =>
          createPairwiseReviewPacket(a, b, "seed" + i).mapping.identities.A
            .candidateId,
      ),
    );
    expect(observed.size).toBe(2);
    expect(a.evidence[0].id).toBe("candidate-one-footage");
  });

  it("refuses unequal budgets/tracks or retrospective runs without requiring scores", () => {
    const a = submission("a", "a"),
      b = submission("b", "b");
    for (const changed of [
      { ...b, budgetMicros: 1 },
      { ...b, runKind: "retrospective" as const },
      { ...b, assistance: "expert_assisted" as const },
      { ...b, environmentProfile: "other" },
    ])
      expect(() => createPairwiseReviewPacket(a, changed, "seed")).toThrow(
        "not comparable",
      );
    expect(() => createPairwiseReviewPacket(a, b, " ")).toThrow();
    expect(() =>
      createPairwiseReviewPacket(
        a,
        {
          ...b,
          evidence: [{ ...b.evidence[0], artifactHash: a.artifactHash }],
        },
        "seed",
      ),
    ).toThrow("another candidate artifact");
    expect(() =>
      createPairwiseReviewPacket(
        a,
        { ...b, evidence: [b.evidence[0], b.evidence[0]] },
        "seed",
      ),
    ).toThrow("Duplicate candidate evidence");
  });

  it("validates all eleven evidence-backed judgments and explicit insufficiency", () => {
    const a = submission("a", "a"),
      b = submission("b", "b");
    for (const candidate of [a, b]) {
      candidate.evidence = DIMENSION_IDS.map((dimension) => ({
        id: dimension,
        artifactHash: candidate.artifactHash,
        kind: dimensionEvidenceKinds[dimension][0],
        uri: dimension + ".json",
        observation: "Synthetic eligible observation fixture",
        outcome: "observed",
        dimensions: [dimension],
      }));
    }
    const { packet, form } = createPairwiseReviewPacket(a, b, "seed");
    const completed = {
      ...form,
      reviewerId: "reviewer-17",
      judgments: form.judgments.map((j) => ({
        ...j,
        choice: "tie",
        confidence: "medium",
        rationale: "Comparable visible behavior in the cited segments.",
        evidence: [
          {
            evidenceId: packet.candidates.A.evidence.find((e) =>
              e.dimensions.includes(j.dimension),
            )!.id,
            location: "00:15–00:22",
            observation: "Observed action and its feedback.",
          },
          {
            evidenceId: packet.candidates.B.evidence.find((e) =>
              e.dimensions.includes(j.dimension),
            )!.id,
            location: "00:16–00:23",
            observation: "Observed equivalent action and feedback.",
          },
        ],
      })),
    };
    expect(validatePairwiseReview(packet, completed).judgments).toHaveLength(
      11,
    );
    const insufficient = {
      ...completed,
      judgments: completed.judgments.map((j) => ({
        ...j,
        choice: "insufficient",
        evidence: [],
        limitations: ["No suitable capture for this dimension."],
      })),
    };
    expect(
      validatePairwiseReview(packet, insufficient).judgments.every(
        (j) => j.choice === "insufficient",
      ),
    ).toBe(true);
    expect(() =>
      validatePairwiseReview(packet, { ...completed, packetId: "wrong" }),
    ).toThrow("another packet");
    expect(() =>
      validatePairwiseReview(packet, {
        ...completed,
        judgments: completed.judgments.map(() => completed.judgments[0]),
      }),
    ).toThrow("exactly once");
    expect(() =>
      validatePairwiseReview(packet, {
        ...completed,
        judgments: completed.judgments.map((j) => ({
          ...j,
          evidence: j.evidence.slice(0, 1),
        })),
      }),
    ).toThrow("both candidates");
    expect(() =>
      validatePairwiseReview(packet, {
        ...completed,
        judgments: completed.judgments.map((j) => ({
          ...j,
          evidence: [{ ...j.evidence[0], evidenceId: "candidate-unmasked" }],
        })),
      }),
    ).toThrow("Unknown packet evidence");
    expect(() =>
      validatePairwiseReview(packet, {
        ...insufficient,
        judgments: insufficient.judgments.map((j) => ({
          ...j,
          limitations: [],
        })),
      }),
    ).toThrow("explicit limitation");
  });

  it("rejects audio, performance and animation judgments based on irrelevant or ineligible evidence", () => {
    const { packet, form } = createPairwiseReviewPacket(
      submission("a", "a"),
      submission("b", "b"),
      "seed",
    );
    const review = {
      ...form,
      reviewerId: "fixture-reviewer",
      judgments: form.judgments.map((j) => ({
        ...j,
        choice: "insufficient",
        confidence: "low",
        rationale: "No eligible observed evidence",
        limitations: ["Missing observation"],
        evidence: [] as {
          evidenceId: string;
          location: string;
          observation: string;
        }[],
      })),
    };
    for (const dimension of ["audio", "performance", "animation"] as const) {
      const altered = structuredClone(packet),
        completed = structuredClone(review);
      for (const side of ["A", "B"] as const) {
        altered.candidates[side].evidence[0].dimensions = [dimension];
        altered.candidates[side].evidence[0].kind = "screenshot";
      }
      const judgment = completed.judgments.find(
        (j) => j.dimension === dimension,
      )!;
      judgment.choice = "tie";
      judgment.evidence = ["A-E001", "B-E001"].map((evidenceId) => ({
        evidenceId,
        location: "frame 1",
        observation: "Still frame fixture",
      }));
      expect(() => validatePairwiseReview(altered, completed)).toThrow(
        "eligible observation",
      );
      // A valid side cannot compensate for the other side's missing evidence.
      altered.candidates.A.evidence[0].kind =
        dimensionEvidenceKinds[dimension][0];
      expect(() => validatePairwiseReview(altered, completed)).toThrow(
        "both candidates",
      );
      altered.candidates.B.evidence[0].kind =
        dimensionEvidenceKinds[dimension][0];
      expect(
        validatePairwiseReview(altered, completed).judgments.find(
          (j) => j.dimension === dimension,
        )!.choice,
      ).toBe("tie");
      altered.candidates.B.evidence[0].dimensions = ["art_environment"];
      expect(() => validatePairwiseReview(altered, completed)).toThrow(
        "matching dimension",
      );
      judgment.choice = "insufficient";
      expect(
        validatePairwiseReview(altered, completed).judgments.find(
          (j) => j.dimension === dimension,
        )!.choice,
      ).toBe("insufficient");
    }
  });
});
