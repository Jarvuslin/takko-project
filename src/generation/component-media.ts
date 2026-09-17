import type { AssetCandidate, AssetNeed } from "./asset-contract";
import {
  assertIntegrationReview,
  componentReferenceSchema,
  type ComponentReference,
} from "./component-integration";
import type {
  ComponentReviewDecision,
  ComponentReviewEvidence,
} from "./component-review";

/** Exact serialized asset references only; source text and arbitrary URLs are not discovery. */
export function componentAudioId(value: string): string | undefined {
  return /^(?:rbxassetid:\/\/|https?:\/\/www\.roblox\.com\/asset\/\?id=)([1-9]\d{0,19})$/.exec(
    value,
  )?.[1];
}

/** Caller must load these records from immutable storage and establish current adapter ownership. */
export function componentAudioCandidates(args: {
  component: ComponentReference;
  evidence: ComponentReviewEvidence;
  review: ComponentReviewDecision;
  componentNeed: AssetNeed;
  parent: AssetCandidate;
}): AssetCandidate[] {
  const { evidence, componentNeed, parent } = args;
  const component = componentReferenceSchema.parse(args.component);
  if (
    component.needId !== componentNeed.id ||
    componentNeed.kind !== "Model" ||
    component.candidateId !== parent.id ||
    parent.source !== "creator_store" ||
    parent.kind !== "Model" ||
    parent.price !== 0 ||
    parent.sourceUrl !== `https://create.roblox.com/store/asset/${parent.id}` ||
    evidence.candidateId !== component.candidateId ||
    evidence.packetHash !== component.packetHash ||
    evidence.inputHash !== component.inputHash ||
    evidence.derivativeHash !== component.archiveHash
  )
    throw Error(
      "Embedded audio provenance differs from its retained component",
    );
  const review = assertIntegrationReview(evidence, args.review, componentNeed);
  const nodes = new Map(evidence.nodes.map((node) => [node.index, node]));
  const purposes = new Map<string, string>();
  for (const media of review.serializedMedia ?? []) {
    for (const index of "indices" in media ? media.indices : [media.index]) {
      purposes.set(
        JSON.stringify([index, media.property, media.value]),
        media.purpose,
      );
    }
  }
  const groups = new Map<
    string,
    { indices: Set<number>; purposes: Set<string> }
  >();
  for (const ref of evidence.contentReferences ?? []) {
    if (
      nodes.get(ref.index)?.className !== "Sound" ||
      ref.property !== "SoundId"
    )
      continue;
    const id = componentAudioId(ref.value);
    const purpose = purposes.get(
      JSON.stringify([ref.index, ref.property, ref.value]),
    );
    if (!id || !purpose) continue;
    let group = groups.get(id);
    if (!group) {
      if (groups.size === 20) continue;
      group = { indices: new Set(), purposes: new Set() };
      groups.set(id, group);
    }
    if (!Number.isInteger(ref.index) || ref.index < 1 || ref.index > 3000)
      throw Error("Embedded audio binding exceeds component inventory bound");
    group.indices.add(ref.index);
    group.purposes.add(purpose);
  }
  return [...groups].map(([id, group]) => ({
    id,
    name: `Embedded audio ${id} from ${parent.name}`.slice(0, 200),
    description:
      `Unverified embedded audio from Marketplace component ${parent.id}; not independently searched or listened to. Reviewed purpose: ${[...group.purposes].join("; ")}`.slice(
        0,
        1000,
      ),
    kind: "Audio",
    creator: `Audio creator unverified; included by ${parent.creator}`.slice(
      0,
      200,
    ),
    sourceUrl: parent.sourceUrl,
    price: null,
    source: "creator_store_component",
    componentOrigin: {
      needId: component.needId,
      candidateId: component.candidateId,
      recordHash: component.recordHash,
      packetHash: component.packetHash,
      archiveHash: component.archiveHash,
      bindingIndices: [...group.indices].sort((a, b) => a - b),
    },
  }));
}
