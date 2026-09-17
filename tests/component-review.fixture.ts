import { createHash } from "node:crypto";
import type {
  ComponentReviewDecision,
  ComponentReviewEvidence,
} from "../src/generation/component-review";

export function componentReviewFixture(
  requirementIds = ["style"],
  token = "owned-101",
) {
  const source =
    'local sound = Instance.new("Sound")\nsound.SoundId = "rbxassetid://123"';
  const hash = createHash("sha256").update(source).digest("hex");
  const evidence: ComponentReviewEvidence = {
    packetHash: "a".repeat(64),
    inputHash: "f".repeat(64),
    candidateId: "101",
    token,
    originalHash: "b".repeat(64),
    derivativeHash: "c".repeat(64),
    nodes: [
      { index: 1, parentIndex: 0, name: "Model", className: "Model" },
      { index: 2, parentIndex: 1, name: "SoundScript", className: "Script" },
      { index: 3, parentIndex: 1, name: "SoundScript2", className: "Script" },
    ],
    sourceBodies: [
      {
        sha256: hash,
        source,
        bindings: [2, 3].map((index) => ({
          index,
          className: "Script",
          disabled: false,
          runContext: "Enum.RunContext.Legacy",
        })),
      },
    ],
    removedCapabilities: ["Network"],
    boundary: "Offline fixture, never execution evidence",
  };
  const decision: ComponentReviewDecision = {
    packetHash: evidence.packetHash,
    inputHash: evidence.inputHash,
    disposition: "integration_candidate",
    reason:
      "Synthetic review recommends integration work; playback remains unverified",
    sources: [
      {
        sha256: hash,
        behavior: "Constructs a sound reference",
        reuse: "preserve",
        dependencies: [
          {
            kind: "media_asset",
            value: "123",
            sourceQuote: 'sound.SoundId = "rbxassetid://123"',
            verification: "unverified",
          },
        ],
        unresolved: [],
      },
    ],
    requirements: requirementIds.map((requirementId) => ({
      requirementId,
      status: "integration_needed",
      reason: "Needs integration and native playback evidence",
      sourceHashes: [hash],
      nodeIndices: [2, 3],
    })),
    permissionImpacts: [
      {
        capability: "Network",
        impact: "none_observed",
        reason: "No explicit HTTP call seen in this source",
        sourceHashes: [hash],
      },
    ],
    integrationNotes: ["Wire the requested input and verify playback"],
    runtimeVerification: "not_performed",
  };
  return { evidence, decision };
}
