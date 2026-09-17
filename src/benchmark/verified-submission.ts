import fs from "node:fs";
import path from "node:path";
import { getBenchmarkCase } from "./cases";
import {
  assetSourcingSchema,
  assessAssetSourcing,
  type AssetSourcingRecord,
} from "./asset-provenance";
import { qualitySubmissionSchema, type QualitySubmission } from "./quality";

function localJson(root: string, uri: string): unknown {
  if (path.isAbsolute(uri) || /^[a-z][a-z0-9+.-]*:/i.test(uri))
    throw Error("Asset evidence must use a workspace-relative file");
  const base = fs.realpathSync(root),
    file = fs.realpathSync(path.resolve(base, uri));
  const relative = path.relative(base, file);
  if (
    !relative ||
    relative === ".." ||
    relative.startsWith(".." + path.sep) ||
    path.isAbsolute(relative)
  )
    throw Error("Asset evidence escapes workspace");
  const stat = fs.statSync(file);
  if (!stat.isFile() || stat.size > 64 * 1024 * 1024)
    throw Error("Asset evidence is not an admissible regular file");
  try {
    return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
  } catch (error) {
    if (error instanceof SyntaxError) return null;
    throw error;
  }
}

function nestedEvidenceIds(record: AssetSourcingRecord) {
  return [
    ...record.searches.flatMap((s) => [
      ...s.evidenceIds,
      ...s.candidates.flatMap((c) => c.previewEvidenceIds),
    ]),
    ...record.selections.flatMap((s) => [
      ...s.permissionEvidenceIds,
      ...s.importEvidenceIds,
      ...s.runtimeEvidenceIds,
      ...s.visualEvidenceIds,
    ]),
    ...record.fallbacks.flatMap((f) => [
      ...f.runtimeEvidenceIds,
      ...f.visualEvidenceIds,
    ]),
  ];
}

/** Call AFTER verifyEvidenceFileManifest for both scoring and comparison.
 * Validates structured sourcing, not the authenticity or relevance of observations.
 * Missing/failed claims stay with the scorer; this rejects unsupported passed claims.
 */
export function assertVerifiedAssetSourcing(
  input: QualitySubmission,
  workspaceRoot: string,
) {
  const submission = qualitySubmissionSchema.parse(input);
  const definition = getBenchmarkCase(submission.caseId);
  if (
    submission.caseVersion !== definition.version ||
    submission.track !== definition.track
  )
    throw Error(
      "Asset sourcing submission does not match fixed benchmark case",
    );
  const checks: { label: string; evidenceIds: string[]; external: boolean }[] =
    [];
  for (const result of submission.gateResults) {
    if (
      result.status === "passed" &&
      ["asset_sourcing", "asset_integration"].includes(result.gate)
    )
      checks.push({
        label: result.gate,
        evidenceIds: result.evidenceIds,
        external: result.gate === "asset_integration",
      });
  }
  for (const result of submission.devChecks) {
    if (
      result.status === "passed" &&
      definition.requiredDevChecks.includes(result.id) &&
      definition.devCheckEvidence?.[result.id]?.some((group) =>
        group.includes("asset_provenance"),
      )
    )
      checks.push({
        label: result.id,
        evidenceIds: result.evidenceIds,
        external: result.id === "permission-and-import",
      });
  }
  const evidence = new Map(submission.evidence.map((e) => [e.id, e]));
  const records = new Map<string, AssetSourcingRecord>();
  // Only references attached to asset-related passed claims are full-record
  // candidates. Raw search receipts elsewhere remain ordinary evidence files.
  for (const id of new Set(checks.flatMap((c) => c.evidenceIds))) {
    const item = evidence.get(id);
    if (!item) throw Error("Asset claim references missing evidence: " + id);
    if (item.kind !== "asset_provenance") continue;
    const raw = localJson(workspaceRoot, item.uri);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    if (!("requirements" in raw || "selections" in raw || "fallbacks" in raw))
      continue;
    const record = assetSourcingSchema.parse(raw);
    if (
      record.artifactHash !== submission.artifactHash ||
      item.artifactHash !== submission.artifactHash
    )
      throw Error("Structured asset record artifact mismatch: " + id);
    if (item.outcome !== "passed")
      throw Error("Passed asset claim needs a passed structured record: " + id);
    records.set(id, record);
  }
  for (const [id, record] of records) {
    if (nestedEvidenceIds(record).some((ref) => records.has(ref)))
      throw Error(
        "Structured asset record cannot serve as its own underlying evidence: " +
          id,
      );
  }
  const assessments = new Map(
    [...records].map(([id, record]) => [
      id,
      assessAssetSourcing(record, submission.evidence),
    ]),
  );
  return checks.map((check) => {
    const ids = check.evidenceIds.filter((id) => assessments.has(id));
    if (!ids.length)
      throw Error(
        check.label + " requires a full structured asset-sourcing record",
      );
    for (const id of ids) {
      const result = assessments.get(id)!;
      if (
        result.completion !== "complete" ||
        (check.external && !result.externalIntegrationComplete)
      )
        throw Error(
          check.label +
            " has incomplete asset evidence: " +
            id +
            "; " +
            (result.reasons.join("; ") ||
              "External integration is required; procedural fallback is insufficient"),
        );
    }
    return { claim: check.label, evidenceIds: ids, verified: true as const };
  });
}
