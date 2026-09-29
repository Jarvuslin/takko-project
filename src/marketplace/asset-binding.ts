import type { Project } from "../generation/schema";
import type { AssetNeed } from "../generation/asset-contract";
import type { AssetSearch } from "./discovery";
import { normalizeNeeds } from "./normalize-needs";

// Compare host roles/search intent, never uploader names or required catalog numbers.
function words(text: string): Set<string> {
  return new Set(
    text
      .normalize("NFKC")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .toLowerCase()
      .match(/[\p{L}][\p{L}\p{N}]*/gu)
      ?.map((w) => w.replace(/s$/, ""))
      .filter(
        (w) =>
          ![
            "a",
            "the",
            "for",
            "with",
            "of",
            "and",
            "asset",
            "model",
            "pack",
            "reference",
          ].includes(w),
      ) ?? [],
  );
}
export function similarity(a: string, b: string) {
  const left = words(a),
    right = words(b);
  const common = [...left].filter((w) => right.has(w)).length;
  return common ? common / (left.size + right.size - common) : 0;
}
export function compatibleSearchKind(group: AssetSearch, need: AssetNeed) {
  return (
    group.kind === need.kind ||
    (group.kind === "Model" &&
      group.preview === "animation" &&
      need.kind === "Animation") ||
    (group.kind === "Model" && group.preview === "audio" && need.kind === "Audio")
  );
}

/** Resolve explicit identity first. Legacy semantic matches must have a unique best result. */
export function assetNeedForGroup(
  p: Pick<Project, "spec"> & Partial<Pick<Project, "proposal">>,
  group: AssetSearch,
): AssetNeed | undefined {
  const needs = p.spec?.assetNeeds ?? p.proposal?.assetNeeds ?? [];
  if (group.assetNeedId) {
    const matches = needs.filter(n => n.id === group.assetNeedId || n.id.endsWith("_" + group.assetNeedId));
    const need = matches.length === 1 ? matches[0] : undefined;
    if (!need || !compatibleSearchKind(group, need))
      throw Error(
        "Approved asset need link is stale or incompatible: " + group.label,
      );
    return need;
  }
  const ranked = needs
    .filter((n) => compatibleSearchKind(group, n))
    .map((need) => ({
      need,
      score: Math.max(
        ...[group.label, group.query].flatMap((a) =>
          [need.role, need.query].map((b) => similarity(a, b)),
        ),
      ),
    }))
    .filter((r) => r.score >= 0.25)
    .sort((a, b) => b.score - a.score);
  if (
    ranked.length > 1 &&
    Math.abs(ranked[0].score - ranked[1].score) < 0.000001
  )
    throw Error("Ambiguous approved asset need link: " + group.label);
  return ranked[0]?.need;
}

export function approvedAssetLinks(p: Project) {
  p = { ...p };
  const needs = p.spec?.assetNeeds ?? p.proposal?.assetNeeds ?? [];
  if ((p.assetDiscovery?.groups.length ?? 0) > needs.length || p.assetDiscovery?.groups.some(g => g.assetNeedId && p.proposal?.assetNeeds?.some(n => n.id === g.assetNeedId) && !needs.some(n => n.id === g.assetNeedId))) normalizeNeeds(p);
  const review = p.assetDiscovery;
  if (!review?.approved || review.revision !== p.revision) return [];
  const used = new Set<string>();
  return review.groups.flatMap((group) => {
    const choice = review.choices?.[group.id];
    if (!choice?.assetId || choice.skip) return [];
    const option = group.options.find((o) => o.assetId === choice.assetId);
    if (!option)
      throw Error("Approved asset option is missing: " + group.label);
    if (!p.assetAttachments?.some((a) => a.assetId === option.assetId))
      throw Error("Approved asset attachment is missing: " + group.label);
    let need = assetNeedForGroup(p, group);
    // Compatibility only for already-saved plans that encoded identity in prose.
    // Fresh plans resolve through need identity or role, with no catalog-number requirement.
    if (!need && !group.assetNeedId) {
      const requirements =
        p.spec?.requirements.filter((r) =>
          [r.description, r.acceptance]
            .join(" ")
            .match(/\b\d+\b/g)
            ?.includes(option.assetId),
        ) ?? [];
      if (requirements.length > 1)
        throw Error(
          "Ambiguous legacy approved asset requirement: " + group.label,
        );
      if (requirements.length === 1) {
        const matches = (p.spec?.assetNeeds ?? []).filter(
          (n) =>
            n.requirementId === requirements[0].id &&
            compatibleSearchKind(group, n),
        );
        if (matches.length > 1)
          throw Error("Ambiguous legacy approved asset need: " + group.label);
        need = matches[0] ?? {
          id: "approved_" + option.assetId,
          requirementId: requirements[0].id,
          role: group.label,
          kind: option.kind,
          query: group.query,
          constraints: requirements[0].description,
          required: true,
          position: [0, 3, 0],
          maxSize: 12,
        };
      }
    }
    if (!need || !p.spec?.requirements.some((r) => r.id === need.requirementId))
      throw Error(
        "Approved asset needs a linked requirement before building: " +
          group.label +
          " #" +
          option.assetId,
      );
    if (!compatibleSearchKind({ ...group, kind: option.kind }, need))
      throw Error(
        "Approved asset kind is incompatible with its linked need: " +
          group.label,
      );
    if (used.has(need.id)) return [];
    used.add(need.id);
    return [{ group, choice, option, need }];
  });
}
