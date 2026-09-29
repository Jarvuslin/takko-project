import type { Project } from "../generation/schema";
import { assetSearches, type AssetDiscovery, type AssetOption } from "./discovery";
import { assetNeedForGroup } from "./asset-binding";

/** Canonical rows are keyed by needs, never by searches or attachment IDs. */
export function normalizeNeeds(p: Project, lookup?: (id: string) => AssetOption | undefined) {
  const needs = p.spec?.assetNeeds ?? p.proposal?.assetNeeds;
  if (!needs?.length || !p.assetDiscovery) return false;
  const prior = p.assetDiscovery;
  for (const g of prior.groups) {
    if (g.assetNeedId && !needs.some(n => n.id === g.assetNeedId)) {
      if (!p.proposal?.assetNeeds?.some(n => n.id === g.assetNeedId && needs.some(s => s.id.endsWith("_" + n.id))))
        throw Error("Approved asset need link is stale: " + g.label);
    }
    if (!g.assetNeedId) assetNeedForGroup(p, g);
  }
  const choices: NonNullable<AssetDiscovery["choices"]> = {};
  const pinned: string[] = [];
  const groups = assetSearches(p).map(row => {
    const need = needs.find(n => n.id === row.id)!;
    const sources = prior.groups.filter(g => {
      if (g.assetNeedId === need.id || g.id === need.id) return true;
      try { return assetNeedForGroup(p, { ...g, assetNeedId: undefined })?.id === need.id; }
      catch { return false; }
    });
    const selected = need.selectedAssetId ?? p.proposal?.assetNeeds?.find(n =>
      n.id === need.id || need.id.endsWith("_" + n.id))?.selectedAssetId;
    const matching = selected ? prior.groups.filter(g => prior.choices?.[g.id]?.assetId === selected) : sources;
    const chosen = matching.find(g => prior.choices?.[g.id]?.clipKey) ?? matching.find(g => prior.choices?.[g.id]);
    const choice = chosen ? { ...prior.choices![chosen.id] } : selected ? { assetId: selected, reason: "Detected from your message" } : undefined;
    const options = [...new Map([...sources, ...matching].flatMap(g => g.options).map(o => [o.assetId, o])).values()];
    if (choice?.assetId && !options.some(o => o.assetId === choice.assetId)) {
      const cached = lookup?.(choice.assetId);
      if (cached) options.push(cached);
    }
    if (choice) choices[row.id] = choice;
    if (selected || chosen && prior.pinned?.includes(chosen.id)) pinned.push(row.id);
    const option = options.find(o => o.assetId === choice?.assetId);
    return { ...sources.find(g => g.id === row.id), ...row, ...(option ? { kind: option.kind } : {}), options };
  });
  const next = { ...prior, groups, choices, pinned };
  if (JSON.stringify(next) === JSON.stringify(prior)) return false;
  p.assetDiscovery = next;
  return true;
}
