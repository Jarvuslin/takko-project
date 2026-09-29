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
import { nameComponentRoot, anchorComponentParts } from "./component-xml";
import { componentPhysics } from "./component-physics";
import { assertNoRuntimeSourceWrites } from "./runtime-source-check";
import type { AssetNeed } from "./asset-contract";
import type { Project, Bundle, Check } from "./schema";
import { retainedStudioAnimation } from "./retained-animation";
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
    instanceName?: string;
    version?: 1 | 2;
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
  const version = args.version ?? 2;
  const sourceData = args.need.kind === "Animation" || args.need.kind === "Audio" || args.need.deliveryRole === "source_data";
  const destinationPath = `${version === 2 && sourceData ? "ReplicatedStorage" : "Workspace"}/${args.scope}/Assets/${args.need.id}`;
  const retainedXml = loadComponentXml(
    directory,
    args.conversionHash,
    destinationPath,
  );
  if (args.instanceName !== undefined && args.instanceName !== args.need.id)
    throw Error("Component instance name must match its stable need identity");
  const xml = args.instanceName
    ? nameComponentRoot(retainedXml, args.instanceName)
    : retainedXml;
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
    rootName: args.instanceName ?? fresh.nodes[0].name,
    runtimeVerification: "not_performed" as const,
    placement: "worker_integration_required" as const,
  };
  const record = {
    version,
    kind: "takko-component-integration",
    preparedHash: args.preparedHash,
    scope: args.scope,
    need: args.need,
    ...(args.instanceName ? { instanceName: args.instanceName } : {}),
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
    ![1, 2].includes(record.version) ||
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
    xml: record.instanceName
      ? nameComponentRoot(
          loadComponentXml(directory, ref.conversionHash, ref.destinationPath),
          record.instanceName,
        )
      : loadComponentXml(directory, ref.conversionHash, ref.destinationPath),
  };
}
export function projectComponents(project: Project, directory: string, bundle: Bundle | null = project.artifact) {
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
      entry.componentContextHash !==
        (entry.reusedFrom?.inputHash ?? run.inputHash) ||
      ref.candidateId !== entry.selected?.id ||
      !["Workspace", "ReplicatedStorage"].some(root => ref.destinationPath === `${root}/${project.scope}/Assets/${entry.needId}`)
    )
      throw Error("Component reference is not bound to the accepted need");
    const loaded = loadComponentIntegration(directory, ref);
    if (
      !isDeepStrictEqual(loaded.record.need, need) ||
      loaded.record.scope !== project.scope
    )
      throw Error("Component need or scope changed");
    const physics = componentPhysics(loaded.xml.xml);
    const decision = bundle?.retainedPhysics?.find(d=>d.needId===entry.needId);
    return { reference: ref, ...loaded, physics,
      xml: decision?.mode === "anchor_all" ? anchorComponentParts(loaded.xml) : loaded.xml };
  });
}
export function componentBuilderContext(project: Project, directory: string) {
  return projectComponents(project, directory).map(
    ({ reference, record, evidence, physics }) => ({
      reference,
      physics,
      physicsObligation: reference.destinationPath.startsWith("Workspace/") && physics.unsupportedParts.length
        ? "This retained visible prop has disconnected unanchored parts. Submit retainedPhysics with its needId and mode anchor_all to anchor the delivery copy, or deliberately_dynamic with the intended gameplay reason. Do not claim these loose parts are physically sound. The original retained archive stays unchanged."
        : undefined,
      localContent: {
        destinationPath: reference.destinationPath,
        rootName: reference.rootName,
        instruction:
          "Content is already retained in the Studio place. Reference it in place, never re-fetch it by asset ID.",
      },
      studioAnimation: retainedStudioAnimation(project, {
        reference,
        record,
        evidence,
      }),
      requestedPlacement: {
        position: record.need.position,
        maxSize: record.need.maxSize,
      },
      integrationNotes: record.review.integrationNotes,
      rootPath: reference.destinationPath + "/" + reference.rootName,
      nodes: evidence.nodes,
      originalRootName: evidence.nodes[0].name,
      instanceName: reference.rootName,
      sourceBodies: evidence.sourceBodies,
      media: evidence.contentReferences,
      runtimeOnlyInstances: evidence.runtimeOnlyInstances,
      runtimeOnlyHistory: evidence.runtimeOnlyHistory,
      instructions:
        "Use this retained component at rootPath. The host gives its root the stable instanceName, so never use the uploader's originalRootName to locate it. Descendant names, sources and relative geometry are retained. Account for any name-sensitive behavior in the reviewed sources. Do not recreate it or declare scene/files under destinationPath. Integrate its actual behavior with the game. Requested placement/scaling, media playback and gameplay remain unverified and must be implemented/tested by the game worker; a source review is not a runtime pass. Preserve Marketplace audio and animations.",
    }),
  );
}

export function checkRetainedPhysics(project: Project, directory: string, bundle: Bundle): Check[] {
  const components=projectComponents(project,directory,bundle);
  const checks:Check[]=[];
  for(const action of bundle.retainedPhysics??[]) {
    if(!components.some(c=>c.reference.needId===action.needId)) checks.push({id:"physics:unknown:"+action.needId,status:"failed",detail:"Physics integration names an unknown retained need: "+action.needId});
    if((bundle.retainedPhysics??[]).filter(d=>d.needId===action.needId).length!==1) checks.push({id:"physics:duplicate:"+action.needId,status:"failed",detail:"Duplicate physics integration decision: "+action.needId});
  }
  for(const c of components) {
    if(!c.reference.destinationPath.startsWith("Workspace/") || !c.physics.unsupportedParts.length) continue;
    const action=bundle.retainedPhysics?.find(d=>d.needId===c.reference.needId);
    checks.push({id:"physics:"+c.reference.needId,status:action?.mode==="anchor_all"?"passed":action?"pending":"failed",detail:action?.mode==="anchor_all"?"Delivery copy anchors retained parts. Native placement remains unverified.":action?"Deliberately dynamic retained prop requires native verification: "+action.reason:`Retained need ${c.reference.needId} has ${c.physics.unsupportedParts.length} unanchored parts without a joint path to an anchor or rig. Supply its explicit retainedPhysics integration decision.`});
  }
  return checks;
}
