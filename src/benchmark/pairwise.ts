import { createHash } from "node:crypto";
import { z } from "zod";
import {
  compareCandidates,
  dimensionEvidenceKinds,
  DIMENSION_IDS,
  qualitySubmissionSchema,
  type Dimension,
  type EvidenceKind,
  type QualitySubmission,
} from "./quality";

const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export type PairwiseSide = "A" | "B";
export type PairwisePacket = {
  schemaVersion: 1;
  packetId: string;
  case: {
    id: string;
    version: string;
    protocolVersion: string;
    track: "dev_task" | "game_quality";
  };
  dimensions: readonly Dimension[];
  candidates: Record<
    PairwiseSide,
    {
      label: PairwiseSide;
      evidence: {
        id: string;
        kind: EvidenceKind;
        uri: string;
        dimensions: Dimension[];
      }[];
    }
  >;
  instructions: string[];
  limitations: string[];
};

export const pairwiseReviewSchema = z
  .object({
    schemaVersion: z.literal(1),
    packetId: z.string().min(1),
    reviewerId: z.string().trim().min(1),
    limitations: z.array(z.string().trim().min(1)),
    judgments: z
      .array(
        z
          .object({
            dimension: z.enum(DIMENSION_IDS),
            choice: z.enum(["A", "B", "tie", "insufficient"]),
            confidence: z.enum(["low", "medium", "high"]),
            rationale: z.string().trim().min(1),
            evidence: z.array(
              z
                .object({
                  evidenceId: z.string().min(1),
                  location: z.string().trim().min(1),
                  observation: z.string().trim().min(1),
                })
                .strict(),
            ),
            limitations: z.array(z.string().trim().min(1)),
          })
          .strict(),
      )
      .length(DIMENSION_IDS.length),
  })
  .strict();
export type PairwiseReview = z.infer<typeof pairwiseReviewSchema>;

/** Pure packet preparation; file verification belongs to the CLI's manifest importer. */
export function createPairwiseReviewPacket(
  aInput: QualitySubmission,
  bInput: QualitySubmission,
  seedInput: string,
) {
  const seed = z.string().trim().min(1).max(256).parse(seedInput);
  const a = qualitySubmissionSchema.parse(aInput),
    b = qualitySubmissionSchema.parse(bInput);
  const comparison = compareCandidates(a, b);
  if (!comparison.comparable)
    throw Error(
      "Candidates are not comparable: " + comparison.reasons.join("; "),
    );
  for (const submission of [a, b]) {
    if (
      new Set(submission.evidence.map((e) => e.id)).size !==
      submission.evidence.length
    )
      throw Error("Duplicate candidate evidence IDs");
    if (
      submission.evidence.some(
        (e) => e.artifactHash !== submission.artifactHash,
      )
    )
      throw Error("Evidence belongs to another candidate artifact");
  }
  // Canonical candidate ordering makes the assignment stable even when --a/--b reverse.
  const canonical = [a, b].sort((left, right) =>
    left.candidateId < right.candidateId ? -1 : 1,
  );
  const swap =
    parseInt(hash("roblox-pairwise-v1:" + seed).slice(0, 2), 16) % 2 === 1;
  const ordered = swap ? canonical.slice().reverse() : canonical;
  const packetId =
    "pairwise-" +
    hash(
      JSON.stringify({
        seed,
        candidates: ordered.map((s) => [
          s.candidateId,
          s.artifactHash,
          hash(JSON.stringify(s)),
        ]),
      }),
    ).slice(0, 24);
  const candidates = {} as PairwisePacket["candidates"];
  const identities = {} as Record<
    PairwiseSide,
    {
      candidateId: string;
      artifactHash: string;
      submissionSha256: string;
      toolProfile: string;
      environmentProfile: string;
      evidence: { packetEvidenceId: string; sourceEvidenceId: string }[];
      excludedModelReviewEvidenceIds: string[];
    }
  >;
  (["A", "B"] as const).forEach((side, index) => {
    const submission = ordered[index];
    const evidence = submission.evidence
      .filter((e) => e.kind !== "model_review")
      .sort((left, right) => (left.id < right.id ? -1 : 1));
    candidates[side] = {
      label: side,
      evidence: evidence.map((item, i) => ({
        id: `${side}-E${String(i + 1).padStart(3, "0")}`,
        kind: item.kind,
        uri: item.uri,
        dimensions: [...item.dimensions].sort(),
      })),
    };
    identities[side] = {
      candidateId: submission.candidateId,
      artifactHash: submission.artifactHash,
      submissionSha256: hash(JSON.stringify(submission)),
      toolProfile: submission.toolProfile,
      environmentProfile: submission.environmentProfile,
      evidence: evidence.map((item, i) => ({
        packetEvidenceId: candidates[side].evidence[i].id,
        sourceEvidenceId: item.id,
      })),
      excludedModelReviewEvidenceIds: submission.evidence
        .filter((e) => e.kind === "model_review")
        .map((e) => e.id),
    };
  });
  const packet: PairwisePacket = {
    schemaVersion: 1,
    packetId,
    case: {
      id: a.caseId,
      version: a.caseVersion,
      protocolVersion: a.protocolVersion,
      track: a.track,
    },
    dimensions: [...DIMENSION_IDS],
    candidates,
    instructions: [
      "Review the actual cited evidence before selecting A, B, tie or insufficient for each dimension. No existing model score or review is supplied.",
      "For A/B/tie, cite at least one observation from each side with a matching dimension tag and eligible observation kind, plus a timestamp, frame, test ID or other precise location. A missing side or irrelevant task dimension should be insufficient, with an explicit limitation.",
      "Record low/medium/high confidence, a concise rationale, reviewer ID and limitations. Confidence describes the judgment, not the candidate's objective quality.",
      "Keep the mapping file private until the review is complete. Evidence tags help navigation but do not prove quality or require a reviewer to trust source claims.",
      "The form records pairwise judgments only; it does not create absolute scores, pass a benchmark or establish commercial/front-page quality.",
    ],
    limitations: [
      "Candidate IDs, artifact hashes, model-associated profiles, source evidence IDs, observations, supplied scores and model-review records are omitted from displayed metadata.",
      "Evidence URIs, filenames, titles inside files and media content may reveal identity. This is masked metadata, not guaranteed blindness. Record any identity leak in the review limitations.",
      "No media files are copied or inspected by this helper. The caller must verify the source submissions and evidence manifests before distribution; referenced evidence remains untrusted data.",
    ],
  };
  const form = {
    schemaVersion: 1 as const,
    packetId,
    reviewerId: "",
    limitations: [] as string[],
    judgments: DIMENSION_IDS.map((dimension) => ({
      dimension,
      choice: null,
      confidence: null,
      rationale: "",
      evidence: [] as PairwiseReview["judgments"][number]["evidence"],
      limitations: [] as string[],
    })),
  };
  const mapping = {
    schemaVersion: 1 as const,
    packetId,
    private: true,
    seed,
    assignmentAlgorithm:
      "SHA256 roblox-pairwise-v1 seed parity after canonical candidateId ordering",
    identities,
    warning:
      "Keep separate from the reviewer packet and form; contains candidate identities and source evidence mappings.",
  };
  return { packet, form, mapping };
}

/** Validate structure and references, not the truth or quality of a human judgment. */
export function validatePairwiseReview(
  packet: PairwisePacket,
  input: unknown,
): PairwiseReview {
  const review = pairwiseReviewSchema.parse(input);
  if (review.packetId !== packet.packetId)
    throw Error("Review belongs to another packet");
  if (
    new Set(review.judgments.map((j) => j.dimension)).size !==
    DIMENSION_IDS.length
  )
    throw Error("Review must cover each dimension exactly once");
  const known = new Map(
    (["A", "B"] as const).flatMap((side) =>
      packet.candidates[side].evidence.map(
        (e) => [e.id, { side, evidence: e }] as const,
      ),
    ),
  );
  for (const judgment of review.judgments) {
    const sides = new Set<PairwiseSide>();
    for (const pointer of judgment.evidence) {
      const found = known.get(pointer.evidenceId);
      if (!found)
        throw Error("Unknown packet evidence reference: " + pointer.evidenceId);
      if (
        found.evidence.dimensions.includes(judgment.dimension) &&
        dimensionEvidenceKinds[judgment.dimension].includes(found.evidence.kind)
      )
        sides.add(found.side);
    }
    if (judgment.choice === "insufficient") {
      if (!judgment.limitations.length)
        throw Error(
          "Insufficient evidence requires an explicit limitation: " +
            judgment.dimension,
        );
    } else if (sides.size !== 2)
      throw Error(
        "A/B/tie requires matching dimension and eligible observation evidence from both candidates: " +
          judgment.dimension,
      );
  }
  return review;
}
