import { isDeepStrictEqual } from "node:util";
import type { Bundle, Project } from "./schema";
import { approvedReferenceLimitations } from "./approved-reference-policy";

/** Content references may be wired at runtime. Models/meshes still require a retained hierarchy. */
export function isInspectedApprovedReference(
  project: Project,
  asset: Bundle["assets"][number],
) {
  return (
    asset.status === "provided" &&
    !["model", "mesh"].includes(asset.kind) &&
    approvedReferenceLimitations(project).some(
      (l) =>
        l.assetId === asset.assetId && l.requirementId === asset.requirementId,
    )
  );
}

/** A selected reference is not an imported hierarchy or verified sound. */
export function requiresNativeAcquisition(
  project: Project,
  asset: Bundle["assets"][number],
) {
  return (
    asset.status === "provided" &&
    ["model", "mesh", "audio"].includes(asset.kind) &&
    !isInspectedApprovedReference(project, asset) &&
    !isRetrievedAsset(project, { ...asset, status: "retrieved" })
  );
}

/** Only explicit attachments and approved clip choices count as supplied references. */
export function suppliedAssetReferences(p: Project): string {
  const ids = (p.assetAttachments ?? []).map((a) => a.assetId);
  const review = p.assetDiscovery;
  if (review?.approved && review.revision === p.revision) {
    for (const group of review.groups) {
      const choice = review.choices?.[group.id];
      if (!choice?.assetId || choice.skip) continue;
      const option = group.options.find((a) => a.assetId === choice.assetId);
      const entry = option?.previewData?.pack?.entries.find(
        (e) => e.key === choice.clipKey && e.clip,
      );
      if (entry?.animationId && ids.includes(choice.assetId))
        ids.push(entry.animationId);
    }
  }
  return [
    p.request,
    ...Object.values(p.answers),
    ...(p.briefChanges ?? []).map((c) => c.text),
    ...ids,
  ].join(" ");
}

/** Only receipts retained by the server-side execution loop confer provenance. */
export function retrievedBundles(project: Project): Bundle[] {
  const run = project.assetPipeline;
  if (
    !run ||
    run.status !== "passed" ||
    run.requiresReconciliation ||
    run.revision !== project.revision
  )
    return [];
  return run.entries
    .filter((e) => e.status === "passed" && e.bundle)
    .map((e) => e.bundle!);
}
export function isRetrievedAsset(
  project: Project,
  asset: Bundle["assets"][number],
) {
  return (
    asset.status === "retrieved" &&
    retrievedBundles(project).some((b) =>
      b.assets.some((a) => isDeepStrictEqual(a, asset)),
    )
  );
}
export function isRetrievedMeshProperty(
  project: Project,
  node: Bundle["scene"][number],
  name: string,
  value: unknown,
) {
  return (
    node.className === "MeshPart" &&
    name === "MeshId" &&
    typeof value === "string" &&
    /^rbxassetid:\/\/\d+$/.test(value) &&
    retrievedBundles(project).some((b) =>
      b.scene.some(
        (n) => isDeepStrictEqual(n, node) && n.properties.MeshId === value,
      ),
    )
  );
}
export function retrievedContentIds(project: Project): Set<string> {
  const result = new Set<string>();
  for (const bundle of retrievedBundles(project))
    for (const node of bundle.scene)
      for (const key of [
        "MeshId",
        "TextureID",
        "SoundId",
        "AnimationId",
        "Texture",
        "Image",
      ]) {
        const value = node.properties[key];
        if (typeof value === "string") {
          const match =
            /^rbxassetid:\/\/([1-9]\d*)$/.exec(value) ??
            /^https?:\/\/www\.roblox\.com\/asset\/\?id=([1-9]\d*)$/.exec(value);
          if (match) result.add(match[1]);
        }
      }
  return result;
}
