import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { assertVerifiedAssetSourcing } from "../src/benchmark/verified-submission";
import {
  createEvidenceFileManifest,
  verifyEvidenceFileManifest,
} from "../src/benchmark/evidence-files";
import type { AssetSourcingRecord } from "../src/benchmark/asset-provenance";
import type { QualitySubmission } from "../src/benchmark/quality";
import { getBenchmarkCase } from "../src/benchmark/cases";

const directories: string[] = [],
  hash = "a".repeat(64);
afterEach(() => {
  for (const directory of directories.splice(0)) {
    if (
      path.dirname(path.resolve(directory)) !== path.resolve(os.tmpdir()) ||
      !path.basename(directory).startsWith("takko-verified-assets-")
    )
      throw Error("Unexpected cleanup target");
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
function fixture(external = false) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "takko-verified-assets-"));
  directories.push(root);
  const definition = getBenchmarkCase(
    external ? "dev.asset-integration" : "game.crystal-hollow",
  );
  const gate = external ? "asset_integration" : "asset_sourcing";
  const record: AssetSourcingRecord = {
    version: 1,
    artifactHash: hash,
    requirements: [
      {
        id: "prop",
        role: "Merchant kiosk",
        type: "Model",
        constraints: "Quarry scale and palette",
      },
    ],
    searches: [
      {
        id: "lookup",
        requirementId: "prop",
        query: "quarry merchant kiosk",
        requestedType: "Model",
        source: "creator_store",
        sourceUrl: "https://create.roblox.com/store",
        toolVersion: "pinned-mcp-v1",
        retrievedAt: "2026-09-15T12:00:00Z",
        outcome: "empty",
        error: null,
        evidenceIds: ["capture"],
        candidates: [],
      },
    ],
    selections: [],
    fallbacks: [
      {
        requirementId: "prop",
        searchIds: ["lookup"],
        reason: "No matching assets returned",
        replacement: "Scoped authored kiosk geometry",
        runtimeEvidenceIds: ["native"],
        visualEvidenceIds: ["visual"],
      },
    ],
  };
  if (external) {
    record.searches[0].outcome = "results";
    record.searches[0].candidates = [
      {
        id: "123",
        type: "Model",
        name: "Kiosk",
        creator: { id: "456", name: "Fixture creator" },
        sourceUrl: "https://create.roblox.com/store/asset/123",
        versionId: "1",
        price: null,
        previewEvidenceIds: ["visual"],
        decision: "selected",
        reason: "Inspected fit",
      },
    ];
    record.fallbacks = [];
    record.selections = [
      {
        requirementId: "prop",
        searchId: "lookup",
        assetId: "123",
        type: "Model",
        reason: "Scoped fit",
        targetPath: "Workspace/Forge/Kiosk",
        permissionEvidenceIds: ["permission"],
        importEvidenceIds: ["native"],
        runtimeEvidenceIds: ["native"],
        visualEvidenceIds: ["visual"],
      },
    ];
  }
  const submission: QualitySubmission = {
    candidateId: "fixture",
    artifactHash: hash,
    caseId: definition.id,
    caseVersion: definition.version,
    protocolVersion: "v1",
    track: definition.track,
    budgetMicros: null,
    runKind: "retrospective",
    assistance: "expert_assisted",
    toolProfile: "fixture",
    environmentProfile: "fixture",
    dimensionScores: [],
    devChecks: [],
    gateResults: [
      { gate, status: "passed", evidenceIds: ["record", "native"] },
    ],
    evidence: [
      {
        id: "record",
        kind: "asset_provenance",
        uri: "record.json",
        artifactHash: hash,
        observation: "Structured fixture only",
        outcome: "passed",
        gates: [gate],
      },
      {
        id: "capture",
        kind: "asset_provenance",
        uri: "capture.json",
        artifactHash: hash,
        observation: "Synthetic search metadata fixture",
        outcome: "observed",
      },
      {
        id: "permission",
        kind: "asset_provenance",
        uri: "permission.json",
        artifactHash: hash,
        observation: "Synthetic permission receipt",
        outcome: "passed",
      },
      {
        id: "native",
        kind: "native_test",
        uri: "native.json",
        artifactHash: hash,
        observation: "Synthetic native receipt; no Studio run",
        outcome: "passed",
        gates: [gate],
      },
      {
        id: "visual",
        kind: "screenshot",
        uri: "visual.json",
        artifactHash: hash,
        observation: "Synthetic reviewed visual receipt",
        outcome: "passed",
      },
    ],
  };
  for (const e of submission.evidence)
    fs.writeFileSync(
      path.join(root, e.uri),
      JSON.stringify({ fixture: true, observation: e.observation }),
    );
  const save = () =>
    fs.writeFileSync(path.join(root, "record.json"), JSON.stringify(record));
  save();
  const verify = () =>
    verifyEvidenceFileManifest(
      submission,
      createEvidenceFileManifest(submission, root),
      root,
    );
  return { root, record, submission, save, verify };
}

describe("verified asset-related submission claims", () => {
  it("accepts completed sourcing after file verification without parsing raw capture files as records", () => {
    const f = fixture();
    f.verify();
    expect(assertVerifiedAssetSourcing(f.submission, f.root)).toEqual([
      { claim: "asset_sourcing", evidenceIds: ["record"], verified: true },
    ]);
  });
  it("rejects generic searched prose even if every file hash is valid", () => {
    const f = fixture();
    fs.writeFileSync(
      path.join(f.root, "record.json"),
      "Searched Creator Store and found useful assets.",
    );
    f.verify();
    expect(() => assertVerifiedAssetSourcing(f.submission, f.root)).toThrow(
      "full structured",
    );
  });
  it("rejects a stale record and incomplete native evidence", () => {
    const stale = fixture();
    stale.record.artifactHash = "b".repeat(64);
    stale.save();
    stale.verify();
    expect(() =>
      assertVerifiedAssetSourcing(stale.submission, stale.root),
    ).toThrow("artifact mismatch");
    const incomplete = fixture();
    incomplete.submission.evidence.find((e) => e.id === "native")!.outcome =
      "observed";
    incomplete.verify();
    expect(() =>
      assertVerifiedAssetSourcing(incomplete.submission, incomplete.root),
    ).toThrow("incomplete asset evidence");
  });
  it("requires external integration for its gate, while a real structured import may pass", () => {
    const f = fixture(true);
    f.verify();
    expect(assertVerifiedAssetSourcing(f.submission, f.root)[0].verified).toBe(
      true,
    );
    const fallback = fixture();
    fallback.submission.caseId = "dev.asset-integration";
    fallback.submission.track = "dev_task";
    fallback.submission.gateResults[0].gate = "asset_integration";
    expect(() =>
      assertVerifiedAssetSourcing(fallback.submission, fallback.root),
    ).toThrow("External integration is required");
  });
  it("enforces structured records for catalog provenance dev checks even with no gate claim", () => {
    for (const id of [
      "relevant-search",
      "selection-provenance",
      "permission-and-import",
    ]) {
      const f = fixture(true);
      f.submission.gateResults = [];
      f.submission.devChecks = [
        { id, status: "passed", evidenceIds: ["record", "native"] },
      ];
      f.verify();
      expect(assertVerifiedAssetSourcing(f.submission, f.root)[0].claim).toBe(
        id,
      );
      fs.writeFileSync(
        path.join(f.root, "record.json"),
        JSON.stringify({ searched: true }),
      );
      f.verify();
      expect(() => assertVerifiedAssetSourcing(f.submission, f.root)).toThrow(
        "full structured",
      );
    }
  });
  it("does not inspect unclaimed provenance or turn pending/failed claims into passes", () => {
    const f = fixture();
    f.submission.gateResults = [];
    fs.writeFileSync(
      path.join(f.root, "record.json"),
      "unstructured search capture",
    );
    f.verify();
    expect(assertVerifiedAssetSourcing(f.submission, f.root)).toEqual([]);
    f.submission.gateResults = [
      { gate: "asset_sourcing", status: "failed", evidenceIds: ["record"] },
    ];
    expect(assertVerifiedAssetSourcing(f.submission, f.root)).toEqual([]);
  });
  it("rejects circular record-as-permission proof and malformed full records", () => {
    const f = fixture(true);
    f.record.selections[0].permissionEvidenceIds = ["record"];
    f.save();
    f.verify();
    expect(() => assertVerifiedAssetSourcing(f.submission, f.root)).toThrow(
      "own underlying evidence",
    );
    fs.writeFileSync(
      path.join(f.root, "record.json"),
      JSON.stringify({ requirements: [], imported: true }),
    );
    f.verify();
    expect(() => assertVerifiedAssetSourcing(f.submission, f.root)).toThrow();
  });
  it("does not hide an incomplete full record behind a second completed record", () => {
    const f = fixture();
    const bad = structuredClone(f.record);
    bad.fallbacks[0].runtimeEvidenceIds = [];
    fs.writeFileSync(path.join(f.root, "bad.json"), JSON.stringify(bad));
    f.submission.evidence.push({
      ...f.submission.evidence[0],
      id: "bad",
      uri: "bad.json",
    });
    f.submission.gateResults[0].evidenceIds.push("bad");
    f.verify();
    expect(() => assertVerifiedAssetSourcing(f.submission, f.root)).toThrow(
      "incomplete asset evidence: bad",
    );
  });
});
