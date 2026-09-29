import { approvedAssetLinks } from "./asset-binding";
import { proposalNeed } from "./proposal-picks";
import {
  AssetOperationError,
  type AssetAdapter,
  type AssetCandidate,
  type AssetNeed,
} from "../generation/asset-contract";
import type { Project } from "../generation/schema";

/** Acquire selected physical content before asking a worker to integrate it. */
export function buildAssetNeeds(p: Project): AssetNeed[] {
  const needs = structuredClone((p.spec?.assetNeeds ?? []).filter(n => !proposalNeed(p, n.id)?.pick?.skip));
  for (const need of needs) if (need.kind === "Animation" || need.kind === "Audio") need.deliveryRole = "source_data";
  for (const { need, option, group } of approvedAssetLinks(p)) {
    // A selected animation can be packaged in a Model. Import that container
    // under the same need identity, without rewriting the saved logical spec.
    const bound = {
      ...structuredClone(need),
      kind: option.kind,
      ...(need.kind === "Animation" || need.kind === "Audio" || group.preview === "animation" || need.deliveryRole === "source_data"
        ? { deliveryRole: "source_data" as const } : {}),
      // Acquisition may fail. The specification's requirement remains required.
      required: false,
    };
    const index = needs.findIndex((n) => n.id === need.id);
    if (index >= 0) needs[index] = bound;
    else needs.push(bound);
  }
  // Re-reading an accepted legacy acquisition must not silently rebind its hash.
  if(p.assetPipeline?.revision===p.revision) for(const entry of p.assetPipeline.entries) {
    const accepted=p.assetPipeline.needs.find(n=>n.id===entry.needId);
    const current=needs.find(n=>n.id===entry.needId);
    if(accepted && current && accepted.deliveryRole===undefined) delete current.deliveryRole;
  }
  return needs;
}
/** A later build may inspect approved references, but cannot silently choose replacements. */
export function approvedAssetAdapter(
  adapter: AssetAdapter,
  p: Project,
): AssetAdapter {
  const review = p.assetDiscovery;
  if (!review?.approved || review.revision !== p.revision) return adapter;
  const candidates: AssetCandidate[] = [];
  for (const group of review.groups) {
    const choice = review.choices?.[group.id];
    if (!choice?.assetId || choice.skip) continue;
    const option = group.options.find((a) => a.assetId === choice.assetId);
    if (
      !option ||
      !p.assetAttachments?.some((a) => a.assetId === option.assetId)
    )
      continue;
    if (!candidates.some((c) => c.id === option.assetId))
      candidates.push({
        id: option.assetId,
        name: option.name,
        kind: option.kind,
        creator: option.creatorName,
        sourceUrl: `https://create.roblox.com/store/asset/${option.assetId}`,
        price: 0,
        source: "creator_store",
        description: "User-approved reference for " + group.label,
      });
    const entry = option.previewData?.pack?.entries.find(
      (e) => e.key === choice.clipKey && e.clip,
    );
    if (
      entry?.animationId &&
      !candidates.some((c) => c.id === entry.animationId)
    )
      candidates.push({
        id: entry.animationId,
        name: entry.name,
        kind: "Animation",
        creator: option.creatorName,
        sourceUrl: `https://create.roblox.com/store/asset/${entry.animationId}`,
        price: 0,
        source: "creator_store",
        description: "User-approved clip from pack " + option.assetId,
      });
  }
  // Resolve the same identities used by buildAssetNeeds. Raw lookup callers
  // before planning retain only the legacy role/ID compatibility path.
  const links = p.spec ? approvedAssetLinks(p) : [];
  const matchesFor = (need: Parameters<AssetAdapter["search"]>[0]) => {
    const link = links.find((link) => link.need.id === need.id);
    if (link) {
      if (
        need.requirementId !== link.need.requirementId ||
        need.kind !== link.option.kind
      )
        return [];
      return candidates.filter(
        (c) => c.id === link.option.assetId && c.kind === link.option.kind,
      );
    }
    if (p.spec) return [];
    const role = need.role?.trim().toLowerCase();
    const ids = review.groups
      .filter(
        (g) =>
          role === g.id.toLowerCase() || role === g.label.trim().toLowerCase(),
      )
      .flatMap((g) => review.choices?.[g.id]?.assetId ?? []);
    return candidates.filter((c) => c.kind === need.kind && ids.includes(c.id));
  };
  return new Proxy(adapter, {
    get(target, key, receiver) {
      if (key === "searchScope") return "approved_references";
      if (key === "discoverComponentAudio") return undefined;
      if (key === "search")
        return async (need: Parameters<AssetAdapter["search"]>[0]) => {
          const matches = matchesFor(need);
          if (!matches.length && need.required !== false)
            throw new AssetOperationError(
              "No approved asset matches " +
                need.role +
                ". Review asset choices before building. Find later remains unresolved.",
              [],
              "none",
            );
          return {
            candidates: matches,
            receipts: [
              {
                operation: "user_approved_references",
                at: new Date().toISOString(),
                studioId: review.studioId,
                data: {
                  discoveryId: review.id,
                  candidateIds: matches.map((c) => c.id),
                  nativeVerification: "not_performed",
                },
              },
            ],
          };
        };
      if (key === "inspect")
        return (...args: Parameters<AssetAdapter["inspect"]>) => {
          if (
            !matchesFor(args[0]).some(
              (c) => c.id === args[1].id && c.kind === args[1].kind,
            )
          )
            throw new AssetOperationError(
              "This asset was not approved for this requirement. Review the asset choices before importing a replacement.",
              [],
              "none",
            );
          return (async () => {
            await target.bindApprovedReference?.(args[0], args[1], {
              discoveryId: review.id,
              revision: review.revision,
            });
            return target.inspect(...args);
          })();
        };
      const value = Reflect.get(target, key, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}
