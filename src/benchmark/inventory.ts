import type { Bundle } from "../generation/schema";
import { bundleHash } from "../generation/validation";

/** Authored-manifest inventory only. Counts are diagnostics, never quality scores. */
export function inspectBenchmarkArtifact(bundle: Bundle) {
  const classes: Record<string, number> = {};
  const primitiveClasses = new Set([
    "Part",
    "WedgePart",
    "CornerWedgePart",
    "TrussPart",
    "SpawnLocation",
  ]);
  const ids: Record<string, Set<string>> = {
    model: new Set(),
    animation: new Set(),
    audio: new Set(),
    mesh: new Set(),
    image: new Set(),
  };
  const idProperties: Record<string, string> = {
    AnimationId: "animation",
    SoundId: "audio",
    MeshId: "mesh",
    TextureID: "image",
    Texture: "image",
    Image: "image",
  };
  let primitiveGeometry = 0,
    meshParts = 0,
    unspecifiedPrimitiveMaterials = 0;
  for (const node of bundle.scene) {
    classes[node.className] = (classes[node.className] ?? 0) + 1;
    if (primitiveClasses.has(node.className)) {
      primitiveGeometry++;
      if (!Object.hasOwn(node.properties, "Material"))
        unspecifiedPrimitiveMaterials++;
    }
    if (node.className === "MeshPart") meshParts++;
    for (const [key, kind] of Object.entries(idProperties)) {
      const value = node.properties[key];
      if (typeof value === "string" && value.trim())
        ids[kind].add(value.trim());
    }
  }
  for (const asset of bundle.assets)
    if (asset.assetId) ids[asset.kind].add(`rbxassetid://${asset.assetId}`);
  const mentions = (pattern: RegExp) =>
    bundle.files
      .filter((file) => pattern.test(file.source))
      .map((file) => file.path);
  return {
    artifactHash: bundleHash(bundle),
    evidenceLevel: "authored_manifest" as const,
    scripts: bundle.files.length,
    sceneEntries: bundle.scene.length,
    classes,
    primitiveGeometry,
    meshParts,
    unspecifiedPrimitiveMaterials,
    declaredAnimationInstances: classes.Animation ?? 0,
    declaredSoundInstances: classes.Sound ?? 0,
    declaredParticleEmitters: classes.ParticleEmitter ?? 0,
    declaredScreenGuis: classes.ScreenGui ?? 0,
    declaredAssetRecords: bundle.assets.length,
    declaredAssetIds: Object.fromEntries(
      Object.entries(ids).map(([kind, values]) => [kind, [...values].sort()]),
    ),
    sourceMentions: {
      animationApi: mentions(
        /\b(?:LoadAnimation|AnimationId|AnimationTrack|KeyframeSequence)\b/,
      ),
      proceduralMotion: mentions(/\b(?:Motor6D|Bone|Transform|TweenService)\b/),
      audioApi: mentions(/\b(?:SoundId|SoundService|AudioPlayer)\b/),
      particleApi: mentions(/\bParticleEmitter\b/),
      runtimeGui: mentions(/\b(?:ScreenGui|PlayerGui)\b/),
    },
    limits: [
      "Runtime-created objects and inherited avatar content are not counted in the authored manifest.",
      "Source mentions can occur in comments or unused code and do not prove execution or semantic action animation.",
      "Primitive ratios, part counts, asset IDs and material choices do not determine visual quality.",
      "Marketplace search history, asset permissions, playback, content depth and frame time require separate evidence.",
    ],
  };
}
