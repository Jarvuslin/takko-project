import { describe, expect, it } from "vitest";
import {
  assessAssetSourcing,
  type AssetSourcingRecord,
  type AssetSourcingEvidence,
} from "../src/benchmark/asset-provenance";

const hash = "a".repeat(64);
function fixture(): AssetSourcingRecord {
  return {
    version: 1,
    artifactHash: hash,
    requirements: [
      {
        id: "pick",
        role: "Mining implement",
        type: "Model",
        constraints: "R15 hand scale; coherent low-poly quarry style",
      },
    ],
    searches: [
      {
        id: "search",
        requirementId: "pick",
        query: "mining pickaxe",
        requestedType: "Model",
        source: "creator_store",
        sourceUrl: "https://create.roblox.com/store",
        toolVersion: "studio-mcp-snapshot-20260915",
        retrievedAt: "2026-09-15T12:00:00Z",
        outcome: "results",
        error: null,
        evidenceIds: ["search-capture"],
        candidates: [
          {
            id: "12323715543",
            type: "Model",
            name: "Mining Pickaxe Gem",
            creator: { id: null, name: "Im_Potato11044" },
            sourceUrl: "https://create.roblox.com/store/asset/12323715543",
            versionId: null,
            price: { amount: 0, currency: "USD" },
            previewEvidenceIds: ["preview"],
            decision: "selected",
            reason: "Silhouette and hand scale fit the scoped mining action",
          },
        ],
      },
    ],
    selections: [
      {
        requirementId: "pick",
        searchId: "search",
        assetId: "12323715543",
        type: "Model",
        reason: "Compatible inspected geometry",
        targetPath: "Workspace/Forge/Tool",
        permissionEvidenceIds: ["permission"],
        importEvidenceIds: ["import"],
        runtimeEvidenceIds: ["runtime"],
        visualEvidenceIds: ["visual"],
      },
    ],
    fallbacks: [],
  };
}
function evidence(): AssetSourcingEvidence[] {
  return [
    ["search-capture", "asset_provenance", "observed"],
    ["preview", "screenshot", "observed"],
    ["permission", "asset_provenance", "passed"],
    ["import", "native_test", "passed"],
    ["runtime", "native_test", "passed"],
    ["visual", "gameplay_video", "passed"],
  ].map(([id, kind, outcome]) => ({
    id,
    kind,
    outcome: outcome as AssetSourcingEvidence["outcome"],
    artifactHash: hash,
  }));
}

describe("structured asset sourcing evidence", () => {
  it("keeps metadata-only search distinct from integration, including unknown price", () => {
    const record = fixture();
    record.searches[0].candidates[0].price = null;
    const result = assessAssetSourcing(record, evidence().slice(0, 2));
    expect(result.discovery).toBe("complete");
    expect(result.completion).toBe("pending");
    expect(result.externalIntegrationComplete).toBe(false);
    expect(assessAssetSourcing(record).discovery).toBe("pending");
  });
  it("accepts one well-supported selection without requiring a candidate quota", () => {
    expect(assessAssetSourcing(fixture(), evidence())).toMatchObject({
      discovery: "complete",
      completion: "complete",
      externalIntegrationComplete: true,
      reasons: [],
    });
  });
  it("never treats a Model named Mining Animation as an Animation asset", () => {
    const record = fixture();
    record.requirements[0].type = "Animation";
    record.searches[0].requestedType = "Animation";
    record.searches[0].candidates[0].name = "Mining Animation";
    record.selections[0].type = "Animation";
    expect(assessAssetSourcing(record, evidence()).completion).toBe("failed");
  });
  it("rejects nonexistent selected IDs, wrong search attribution and duplicate choices", () => {
    const absent = fixture();
    absent.selections[0].assetId = "1";
    expect(assessAssetSourcing(absent, evidence()).completion).toBe("failed");
    const wrong = fixture();
    wrong.selections[0].searchId = "missing";
    expect(assessAssetSourcing(wrong, evidence()).completion).toBe("failed");
    const duplicate = fixture();
    duplicate.selections.push(structuredClone(duplicate.selections[0]));
    expect(assessAssetSourcing(duplicate, evidence()).completion).toBe(
      "failed",
    );
  });
  it("does not turn search metadata into permission or mocked imports into native evidence", () => {
    const record = fixture();
    record.selections[0].permissionEvidenceIds = ["search-capture"];
    const items = evidence();
    items[0].outcome = "passed";
    expect(assessAssetSourcing(record, items).completion).toBe("failed");
    const mocked = evidence();
    mocked.find((e) => e.id === "import")!.kind = "deterministic_test";
    expect(assessAssetSourcing(fixture(), mocked).completion).toBe("failed");
  });
  it("requires successful permission, import, runtime and visual observations individually", () => {
    for (const id of ["permission", "import", "runtime", "visual"]) {
      const items = evidence();
      items.find((e) => e.id === id)!.outcome = "observed";
      expect(assessAssetSourcing(fixture(), items).completion, id).toBe(
        "pending",
      );
    }
    const failed = evidence();
    failed.find((e) => e.id === "runtime")!.outcome = "failed";
    expect(assessAssetSourcing(fixture(), failed).completion).toBe("failed");
  });
  it("rejects stale artifact evidence and ambiguous duplicate evidence IDs", () => {
    const stale = evidence();
    stale[0].artifactHash = "b".repeat(64);
    expect(assessAssetSourcing(fixture(), stale).completion).toBe("failed");
    const duplicate = evidence();
    duplicate.push({ ...duplicate[0] });
    expect(assessAssetSourcing(fixture(), duplicate).completion).toBe("failed");
  });
  it("allows a justified zero-result procedural fallback without calling it external integration", () => {
    const record = fixture();
    record.searches[0].outcome = "empty";
    record.searches[0].candidates = [];
    record.selections = [];
    record.fallbacks = [
      {
        requirementId: "pick",
        searchIds: ["search"],
        reason: "No compatible results for the recorded query",
        replacement:
          "Scoped procedural pickaxe geometry with authored joint motion",
        runtimeEvidenceIds: ["runtime"],
        visualEvidenceIds: ["visual"],
      },
    ];
    expect(assessAssetSourcing(record, evidence())).toMatchObject({
      discovery: "complete",
      completion: "complete",
      externalIntegrationComplete: false,
    });
    record.fallbacks[0].searchIds = [];
    expect(assessAssetSourcing(record, evidence()).completion).toBe("pending");
  });
  it("keeps unavailable Store access as pending environment evidence, not a passed fallback", () => {
    const record = fixture();
    record.searches[0].outcome = "access_error";
    record.searches[0].error = "Tool unavailable in worker runtime";
    record.searches[0].candidates = [];
    record.selections = [];
    record.fallbacks = [
      {
        requirementId: "pick",
        searchIds: ["search"],
        reason: "Tool unavailable",
        replacement: "Procedural pick",
        runtimeEvidenceIds: ["runtime"],
        visualEvidenceIds: ["visual"],
      },
    ];
    const items = evidence();
    items[0].outcome = "failed";
    expect(assessAssetSourcing(record, items)).toMatchObject({
      discovery: "pending",
      completion: "pending",
      externalIntegrationComplete: false,
    });
  });
  it("requires reasons for rejecting considered candidates before fallback and validates record shape", () => {
    const record = fixture();
    record.searches[0].candidates[0].decision = "deferred";
    record.selections = [];
    record.fallbacks = [
      {
        requirementId: "pick",
        searchIds: ["search"],
        reason: "No compatible rig",
        replacement: "Procedural pick",
        runtimeEvidenceIds: ["runtime"],
        visualEvidenceIds: ["visual"],
      },
    ];
    expect(assessAssetSourcing(record, evidence()).completion).toBe("pending");
    record.searches[0].candidates[0].decision = "rejected";
    expect(assessAssetSourcing(record, evidence()).completion).toBe("complete");
    record.searches[0].query = " ";
    expect(() => assessAssetSourcing(record, evidence())).toThrow();
    expect(() =>
      assessAssetSourcing({ ...fixture(), imported: true }, evidence()),
    ).toThrow();
  });
});
