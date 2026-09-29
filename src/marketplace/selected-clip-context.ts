import type { AssetNeed } from "../generation/asset-contract";
import type { ComponentReviewEvidence } from "../generation/component-review";
import type { Project } from "../generation/schema";
import { approvedAssetLinks } from "./asset-binding";

export const animationCapabilityContract = {
  publishedAnimation: {
    runtime:
      "Animation.AnimationId = rbxassetid://<approved ID>; Animator:LoadAnimation",
    permissionsAndRigFit: "require native verification",
  },
  rawKeyframeSequence: {
    studioPlayback: "native_probe_passed",
    runtime:
      "In Studio, RegisterKeyframeSequence(sequence) returns a temporary ID. Assign the returned string unchanged to Animation.AnimationId, then Animator:LoadAnimation. Do not prepend hash://.",
    security:
      "Ordinary Script and LocalScript registration and joint motion passed in Studio. Sandboxed scripts require Animation capability. Published-game execution was not tested.",
    publishedGame: "unsupported",
    limitation:
      "Mapped raw KeyframeSequences are usable for Studio testing. Implement their Studio playback using the selected captured sequence. Publishing remains a recorded limitation because Takko does not publish animations. Do not reject Studio integration solely for lacking a published ID and do not replace the selection.",
  },
  evidenceRule:
    "Only evaluate properties for which evidence is supplied. Missing identity, capture mapping, runtime or permission evidence is unresolved, not proof of incompatibility. Do not invent acceptance standards. Preview poses prove readable content, not gameplay or publication rights.",
} as const;

/** Resolve an approved identity against captured nodes, never from reviewer prose. */
export function approvedClipContext(
  p: Project,
  need: AssetNeed,
  evidence?: Pick<ComponentReviewEvidence, "candidateId" | "nodes">,
  previous?: {
    assetId: string;
    key: string;
    name: string | null;
    instancePath: string[] | null;
  },
) {
  const link = approvedAssetLinks(p).find((l) => l.need.id === need.id);
  if (!link) return undefined;
  const group = p.assetDiscovery!.groups.find((g) =>
    g.options.includes(link.option),
  )!;
  const key = p.assetDiscovery!.choices?.[group.id]?.clipKey;
  if (!key) return undefined;
  const entry = link.option.previewData?.pack?.entries.find(
    (e) => e.key === key,
  );
  const base = {
    assetId: link.option.assetId,
    key,
    name: entry?.name ?? null,
    animationId: entry?.animationId ?? null,
    instancePath: null as string[] | null,
    instanceIndex: null as number | null,
    resolution: evidence ? "unresolved" : "capture_pending",
  };
  if (!entry || !evidence || evidence.candidateId !== link.option.assetId)
    return base;
  // Adaptation may add/remove siblings and renumber the capture. Carry forward
  // the already resolved path, then resolve it against the NEW packet. Never
  // reuse a stale node index or remap a disappeared selection by its old ordinal.
  const priorPath =
    previous?.assetId === base.assetId &&
    previous.key === key &&
    previous.name === entry.name
      ? previous.instancePath
      : null;
  const segments = priorPath ?? key.split("/").map(Number);
  if (
    !priorPath &&
    segments.some((s) => typeof s !== "number" || !Number.isInteger(s) || s < 1)
  )
    return base;
  let parent = 0;
  const names: string[] = [];
  for (const segment of segments) {
    const children = evidence.nodes.filter((n) => n.parentIndex === parent);
    const matches = priorPath ? children.filter((n) => n.name === segment) : [];
    const node = priorPath
      ? matches.length === 1
        ? matches[0]
        : undefined
      : children[Number(segment) - 1];
    if (!node) return base;
    names.push(node.name);
    parent = node.index;
  }
  const node = evidence.nodes.find((n) => n.index === parent)!;
  if (
    node.name !== entry.name ||
    !["Animation", "KeyframeSequence", "CurveAnimation"].includes(
      node.className,
    )
  )
    return base;
  // Legacy previews have only ordinal keys. Duplicate names cannot prove identity
  // across separate imports, so do not guess when ordering may be ambiguous.
  if (
    evidence.nodes.filter(
      (n) => n.name === entry.name && n.className === node.className,
    ).length !== 1
  )
    return base;
  return {
    ...base,
    instancePath: names,
    instanceIndex: parent,
    resolution: "captured",
  };
}
