import { z } from "zod";

const text = z.string().trim().min(1);
const assetType = z.enum([
  "Model",
  "Animation",
  "Audio",
  "Mesh",
  "MeshPart",
  "Image",
  "Decal",
  "Video",
  "Package",
]);
const refs = z.array(text);
const candidateSchema = z
  .object({
    id: z.string().regex(/^\d+$/),
    type: assetType,
    name: text,
    creator: z.object({ id: text.nullable(), name: text.nullable() }).strict(),
    sourceUrl: z.url(),
    versionId: text.nullable(),
    price: z
      .object({ amount: z.number().finite().nonnegative(), currency: text })
      .strict()
      .nullable(),
    previewEvidenceIds: refs,
    decision: z.enum(["selected", "rejected", "deferred"]),
    reason: text,
  })
  .strict();
export const assetSourcingSchema = z
  .object({
    version: z.literal(1),
    artifactHash: z.string().regex(/^[a-f0-9]{64}$/),
    requirements: z
      .array(
        z
          .object({ id: text, role: text, type: assetType, constraints: text })
          .strict(),
      )
      .min(1),
    searches: z.array(
      z
        .object({
          id: text,
          requirementId: text,
          query: text,
          requestedType: assetType,
          source: text,
          sourceUrl: z.url(),
          toolVersion: text,
          retrievedAt: z.iso.datetime({ offset: true }),
          outcome: z.enum(["results", "empty", "access_error"]),
          error: text.nullable(),
          evidenceIds: refs,
          candidates: z.array(candidateSchema),
        })
        .strict(),
    ),
    selections: z.array(
      z
        .object({
          requirementId: text,
          searchId: text,
          assetId: z.string().regex(/^\d+$/),
          type: assetType,
          reason: text,
          targetPath: text,
          permissionEvidenceIds: refs,
          importEvidenceIds: refs,
          runtimeEvidenceIds: refs,
          visualEvidenceIds: refs,
        })
        .strict(),
    ),
    fallbacks: z.array(
      z
        .object({
          requirementId: text,
          searchIds: refs,
          reason: text,
          replacement: text,
          runtimeEvidenceIds: refs,
          visualEvidenceIds: refs,
        })
        .strict(),
    ),
  })
  .strict();
export type AssetSourcingRecord = z.infer<typeof assetSourcingSchema>;
/** The trusted importer verifies file bytes and the observations themselves.
 * This validator checks attribution/contracts, not whether a prose claim is true. */
export type AssetSourcingEvidence = {
  id: string;
  artifactHash: string;
  kind: string;
  outcome: "passed" | "failed" | "observed";
};
export type SourcingStatus = "complete" | "pending" | "failed";

export function assessAssetSourcing(
  raw: unknown,
  availableEvidence: readonly AssetSourcingEvidence[] = [],
) {
  const record = assetSourcingSchema.parse(raw);
  const reasons: string[] = [];
  let invalid = false,
    discoveryPending = false,
    completionPending = false,
    observedFailure = false;
  const fail = (reason: string) => {
    invalid = true;
    reasons.push(reason);
  };
  const unique = (values: string[], label: string) => {
    if (new Set(values).size !== values.length) fail("Duplicate " + label);
  };
  unique(
    record.requirements.map((r) => r.id),
    "requirements",
  );
  unique(
    record.searches.map((r) => r.id),
    "search IDs",
  );
  unique(
    availableEvidence.map((r) => r.id),
    "available evidence IDs",
  );
  const evidence = new Map(availableEvidence.map((e) => [e.id, e]));
  const requirements = new Map(record.requirements.map((r) => [r.id, r]));
  const searches = new Map(record.searches.map((s) => [s.id, s]));
  const inspect = (
    ids: string[],
    kinds: string[],
    label: string,
    stage: "discovery" | "completion",
    passRequired = true,
    failureFatal = true,
  ) => {
    unique(ids, label + " evidence references");
    let ready = ids.length > 0;
    for (const id of ids) {
      const e = evidence.get(id);
      if (!e) {
        ready = false;
        reasons.push(label + ": missing evidence " + id);
        continue;
      }
      if (e.artifactHash !== record.artifactHash || !kinds.includes(e.kind)) {
        fail(label + ": evidence artifact/type mismatch " + id);
        ready = false;
      }
      if (e.outcome === "failed" && failureFatal) {
        observedFailure = true;
        ready = false;
        reasons.push(label + ": failed observation " + id);
      }
      if (passRequired && e.outcome !== "passed") ready = false;
    }
    if (!ready) {
      reasons.push(label + ": evidence incomplete");
      if (stage === "discovery") discoveryPending = true;
      else completionPending = true;
    }
    return ready;
  };
  const visualKinds = ["screenshot", "gameplay_video", "human_playtest"];
  for (const search of record.searches) {
    const requirement = requirements.get(search.requirementId);
    if (!requirement || requirement.type !== search.requestedType)
      fail(search.id + ": unknown requirement or requested type mismatch");
    unique(
      search.candidates.map((c) => c.id),
      search.id + " candidate IDs",
    );
    if ((search.outcome === "results") !== search.candidates.length > 0)
      fail(search.id + ": result status does not match candidates");
    if (search.outcome === "access_error") {
      discoveryPending = true;
      reasons.push(
        search.id + ": search access unavailable; environment limitation",
      );
      if (!search.error) fail(search.id + ": missing access error detail");
    } else if (search.error !== null)
      fail(search.id + ": unexpected search error");
    inspect(
      search.evidenceIds,
      ["asset_provenance"],
      search.id + " search capture",
      "discovery",
      false,
      search.outcome !== "access_error",
    );
    for (const candidate of search.candidates) {
      // Search tools can return surprising types. Preserve them, but never infer
      // an Animation ID from the title of a Model result.
      if (candidate.previewEvidenceIds.length)
        inspect(
          candidate.previewEvidenceIds,
          visualKinds,
          search.id + "/" + candidate.id + " preview",
          "completion",
          false,
          candidate.decision !== "rejected",
        );
      if (
        candidate.decision === "selected" &&
        !record.selections.some(
          (s) => s.searchId === search.id && s.assetId === candidate.id,
        )
      )
        fail(
          search.id +
            ": selected candidate has no integration record " +
            candidate.id,
        );
    }
  }
  const completedSelections = new Set<string>();
  for (const selected of record.selections) {
    const requirement = requirements.get(selected.requirementId),
      search = searches.get(selected.searchId);
    const candidate = search?.candidates.find((c) => c.id === selected.assetId);
    if (
      !requirement ||
      !search ||
      search.requirementId !== selected.requirementId ||
      !candidate ||
      selected.type !== requirement.type ||
      candidate.type !== selected.type ||
      candidate.decision !== "selected"
    ) {
      fail(
        selected.assetId +
          ": selection must exist in its requirement search with the exact selected asset type",
      );
      continue;
    }
    if (!candidate.creator.id && !candidate.creator.name) {
      completionPending = true;
      reasons.push(selected.assetId + ": creator identity unknown");
    }
    if (
      selected.permissionEvidenceIds.some((id) =>
        record.searches.some((s) => s.evidenceIds.includes(id)),
      )
    )
      fail(
        selected.assetId + ": search metadata cannot also establish permission",
      );
    const checks = [
      inspect(
        candidate.previewEvidenceIds,
        visualKinds,
        selected.assetId + " preview",
        "completion",
        false,
      ),
      inspect(
        selected.permissionEvidenceIds,
        ["asset_provenance"],
        selected.assetId + " permission",
        "completion",
      ),
      inspect(
        selected.importEvidenceIds,
        ["native_test"],
        selected.assetId + " import",
        "completion",
      ),
      inspect(
        selected.runtimeEvidenceIds,
        ["native_test", "native_animation"],
        selected.assetId + " runtime",
        "completion",
      ),
      inspect(
        selected.visualEvidenceIds,
        visualKinds,
        selected.assetId + " visual integration",
        "completion",
      ),
    ];
    if (
      checks.every(Boolean) &&
      (candidate.creator.id || candidate.creator.name)
    )
      completedSelections.add(selected.requirementId);
  }
  for (const fallback of record.fallbacks) {
    if (!requirements.has(fallback.requirementId))
      fail("Unknown fallback requirement " + fallback.requirementId);
    unique(fallback.searchIds, "fallback search IDs");
    if (!fallback.searchIds.length) {
      discoveryPending = true;
      reasons.push(
        fallback.requirementId + ": fallback lacks documented search",
      );
    }
    for (const id of fallback.searchIds) {
      const search = searches.get(id);
      if (!search || search.requirementId !== fallback.requirementId)
        fail("Fallback search does not match requirement: " + id);
      else if (
        search.outcome === "access_error" ||
        search.candidates.some((c) => c.decision !== "rejected")
      ) {
        completionPending = true;
        reasons.push(
          id +
            ": fallback needs a completed search and reasons rejecting considered candidates",
        );
      }
    }
    inspect(
      fallback.runtimeEvidenceIds,
      ["native_test", "native_animation"],
      fallback.requirementId + " procedural runtime",
      "completion",
    );
    inspect(
      fallback.visualEvidenceIds,
      visualKinds,
      fallback.requirementId + " procedural visual",
      "completion",
    );
  }
  for (const requirement of record.requirements) {
    if (
      !record.searches.some(
        (s) =>
          s.requirementId === requirement.id && s.outcome !== "access_error",
      )
    ) {
      discoveryPending = true;
      reasons.push(requirement.id + ": no completed search");
    }
    const choices =
      record.selections.filter((s) => s.requirementId === requirement.id)
        .length +
      record.fallbacks.filter((f) => f.requirementId === requirement.id).length;
    if (!choices) {
      completionPending = true;
      reasons.push(requirement.id + ": no selection or justified fallback");
    }
    if (choices > 1)
      fail(
        requirement.id +
          ": ambiguous duplicate selection/fallback; use separate requirements for separate assets",
      );
  }
  const discovery: SourcingStatus = invalid
    ? "failed"
    : discoveryPending
      ? "pending"
      : "complete";
  const completion: SourcingStatus =
    invalid || observedFailure
      ? "failed"
      : discoveryPending || completionPending
        ? "pending"
        : "complete";
  return {
    discovery,
    completion,
    externalIntegrationComplete:
      completion === "complete" &&
      record.fallbacks.length === 0 &&
      completedSelections.size === record.requirements.length,
    reasons,
  };
}
