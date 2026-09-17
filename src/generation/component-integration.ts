import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import {
  validateComponentReview,
  type ComponentReviewEvidence,
  type ComponentReviewDecision,
} from "./component-review";
import { loadComponentAdaptationChain } from "./component-adaptation";
import { loadComponentXml } from "./component-xml-conversion";
import { assertNoRuntimeSourceWrites } from "./runtime-source-check";
import type { AssetNeed } from "./asset-contract";
import type { Project } from "./schema";
const hash = (v: string | Buffer) =>
  createHash("sha256").update(v).digest("hex");
const digest = z.string().regex(/^[a-f0-9]{64}$/);
export const componentReferenceSchema = z
  .object({
    recordHash: digest,
    needId: z.string(),
    candidateId: z.string(),
    inputHash: digest,
    packetHash: digest,
    archiveHash: digest,
    conversionHash: digest,
    destinationPath: z.string(),
    rootName: z.string(),
    runtimeVerification: z.literal("not_performed"),
    placement: z.literal("worker_integration_required"),
  })
  .strict();
export type ComponentReference = z.infer<typeof componentReferenceSchema>;
export function componentEvidence(
  directory: string,
  preparedHash: string,
  packetHash: string,
  inputHash: string,
) {
  return loadComponentAdaptationChain(
    directory,
    preparedHash,
    packetHash,
    inputHash,
  ).evidence;
}
export function assertIntegrationReview(
  evidence: ComponentReviewEvidence,
  review: ComponentReviewDecision,
  need: AssetNeed,
) {
  const checked = validateComponentReview(review, evidence, [
    ...new Set([
      need.requirementId,
      ...(need.intent?.relatedRequirementIds ?? []),
    ]),
  ]);
  if (checked.disposition !== "integration_candidate")
    throw Error("Component still needs source/dependency review");
  for (const body of evidence.sourceBodies)
    assertNoRuntimeSourceWrites(body.source);
  return checked;
}
export function persistComponentIntegration(
  directory: string,
  args: {
    preparedHash: string;
    evidence: ComponentReviewEvidence;
    review: ComponentReviewDecision;
    need: AssetNeed;
    scope: string;
    conversionHash: string;
    comparison: unknown;
  },
) {
  const fresh = componentEvidence(
    directory,
    args.preparedHash,
    args.evidence.packetHash,
    args.evidence.inputHash,
  );
  if (!isDeepStrictEqual(fresh, args.evidence))
    throw Error("Integration evidence differs from retained component");
  assertIntegrationReview(fresh, args.review, args.need);
  const destinationPath = `Workspace/${args.scope}/Assets/${args.need.id}`;
  const xml = loadComponentXml(directory, args.conversionHash, destinationPath);
  const conversion = JSON.parse(
    fs.readFileSync(
      path.join(directory, args.conversionHash + ".conversion.json"),
      "utf8",
    ),
  );
  if (conversion.source.archiveHash !== fresh.derivativeHash)
    throw Error("Conversion differs from reviewed component");
  const comparison = z
    .object({
      passed: z.literal(true),
      checkedProperties: z.number().int().nonnegative(),
      checkedAttributes: z.number().int().nonnegative(),
      checkedReferences: z.number().int().nonnegative(),
      unobservableProperties: z.array(z.string()),
      ignoredIdentityProperties: z.array(z.string()),
    })
    .strict()
    .parse(args.comparison);
  const metadata = {
    needId: args.need.id,
    candidateId: fresh.candidateId,
    inputHash: fresh.inputHash,
    packetHash: fresh.packetHash,
    archiveHash: fresh.derivativeHash,
    conversionHash: args.conversionHash,
    destinationPath,
    rootName: fresh.nodes[0].name,
    runtimeVerification: "not_performed" as const,
    placement: "worker_integration_required" as const,
  };
  const record = {
    version: 1,
    kind: "takko-component-integration",
    preparedHash: args.preparedHash,
    scope: args.scope,
    need: args.need,
    review: args.review,
    comparison,
    xmlHash: xml.sha256,
    metadata,
  };
  const bytes = JSON.stringify(record, null, 2) + "\n",
    recordHash = hash(bytes),
    file = path.join(directory, recordHash + ".integration.json");
  if (fs.existsSync(file)) {
    if (fs.readFileSync(file, "utf8") !== bytes)
      throw Error("Integration record collision");
  } else fs.writeFileSync(file, bytes, { flag: "wx" });
  return componentReferenceSchema.parse({ recordHash, ...metadata });
}
export function loadComponentIntegration(
  directory: string,
  reference: ComponentReference,
) {
  const ref = componentReferenceSchema.parse(reference),
    file = path.join(directory, ref.recordHash + ".integration.json");
  if (fs.statSync(file).size > 4 * 1024 * 1024)
    throw Error("Integration record exceeds bound");
  const bytes = fs.readFileSync(file);
  if (hash(bytes) !== ref.recordHash)
    throw Error("Integration record identity mismatch");
  const record = JSON.parse(bytes.toString("utf8"));
  if (
    record.version !== 1 ||
    record.kind !== "takko-component-integration" ||
    !isDeepStrictEqual(
      record.metadata,
      (({ recordHash: _hash, ...rest }) => rest)(ref),
    )
  )
    throw Error("Integration reference differs from retained record");
  const evidence = componentEvidence(
    directory,
    record.preparedHash,
    ref.packetHash,
    ref.inputHash,
  );
  const checked = persistComponentIntegration(directory, {
    ...record,
    evidence,
    conversionHash: ref.conversionHash,
  });
  if (!isDeepStrictEqual(checked, ref))
    throw Error("Integration record failed revalidation");
  return {
    record,
    evidence,
    xml: loadComponentXml(directory, ref.conversionHash, ref.destinationPath),
  };
}
export function projectComponents(project: Project, directory: string) {
  const run = project.assetPipeline,
    entries = run?.entries.filter((e) => e.component) ?? [];
  if (!entries.length) return [];
  if (
    !run ||
    run.status !== "passed" ||
    run.requiresReconciliation ||
    run.revision !== project.revision
  )
    throw Error("Component acquisition is incomplete or stale");
  return entries.map((entry) => {
    const ref = componentReferenceSchema.parse(entry.component);
    const need = run.needs.find((n) => n.id === entry.needId);
    if (
      entry.status !== "passed" ||
      !need ||
      ref.needId !== entry.needId ||
      entry.componentContextHash !== run.inputHash ||
      ref.candidateId !== entry.selected?.id ||
      ref.destinationPath !==
        `Workspace/${project.scope}/Assets/${entry.needId}`
    )
      throw Error("Component reference is not bound to the accepted need");
    const loaded = loadComponentIntegration(directory, ref);
    if (
      !isDeepStrictEqual(loaded.record.need, need) ||
      loaded.record.scope !== project.scope
    )
      throw Error("Component need or scope changed");
    return { reference: ref, ...loaded };
  });
}
export function componentBuilderContext(project: Project, directory: string) {
  return projectComponents(project, directory).map(
    ({ reference, record, evidence }) => ({
      reference,
      requestedPlacement: {
        position: record.need.position,
        maxSize: record.need.maxSize,
      },
      integrationNotes: record.review.integrationNotes,
      rootPath: reference.destinationPath + "/" + reference.rootName,
      nodes: evidence.nodes,
      sourceBodies: evidence.sourceBodies,
      media: evidence.contentReferences,
      runtimeOnlyInstances: evidence.runtimeOnlyInstances,
      runtimeOnlyHistory: evidence.runtimeOnlyHistory,
      instructions:
        "Use this retained component at rootPath; its original hierarchy, sources and relative geometry are exported automatically. Do not recreate it or declare scene/files under destinationPath. Integrate its actual behavior with the game. Requested placement/scaling, media playback and gameplay remain unverified and must be implemented/tested by the game worker; a source review is not a runtime pass. Preserve Marketplace audio and animations.",
    }),
  );
}
