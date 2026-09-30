import type { Project } from "../generation/schema";
import type { AssetDiscovery, AssetOption } from "./discovery";
import type { AssetNeed } from "../generation/asset-contract";
import { previewForRole } from "./role-evidence";

export type ProposalPick = NonNullable<AssetDiscovery["choices"]>[string] & {
  option?: AssetOption;
  sound?: { path: string; assetId: string; name: string };
};

export function proposalNeed(p: Project, id: string) {
  const needs = p.proposal?.assetNeeds ?? [];
  return needs.find(n => n.id === id) ?? needs.find(n => id.endsWith("_" + n.id));
}

export function needDefinition(need: AssetNeed & { pick?: ProposalPick }) {
  const { pick: _pick, ...definition } = need;
  return definition;
}

export function authoringProposal(p: Project) {
  if (!p.proposal) return undefined;
  const { assetStateVersion: _version, ...proposal } = p.proposal;
  return { ...proposal, assetNeeds: proposal.assetNeeds?.map(needDefinition) };
}

/** Prompt view keeps selection intent without repeating native pose/preview data. */
export function approvedProposalContext(p: Project) {
  if (!p.proposal) return undefined;
  return { ...p.proposal, assetNeeds: p.proposal.assetNeeds?.map(n => {
    const { pick, ...definition } = n;
    return { ...definition, ...(pick ? { pick: { assetId: pick.assetId, clipKey: pick.clipKey, skip: pick.skip, sound: pick.sound, roleOverride: pick.roleOverride, timingDecision: pick.timingDecision } } : {}) };
  }) };
}

/** One-time import. Conflicting legacy choices are left for the user to resolve. */
export function importProposalPicks(p: Project) {
  if (!p.proposal?.assetNeeds || p.proposal.assetStateVersion === 1) return;
  let conflict = false;
  for (const n of p.proposal.assetNeeds) {
    const groups = p.assetDiscovery?.groups.filter(g =>
      g.id === n.id || g.assetNeedId === n.id || g.assetNeedId?.endsWith("_" + n.id) ||
      n.selectedAssetId && p.assetDiscovery?.choices?.[g.id]?.assetId === n.selectedAssetId,
    ) ?? [];
    const candidates = groups.flatMap(g => {
      const c = p.assetDiscovery?.choices?.[g.id];
      return c ? [{ ...c, option: g.options.find(o => o.assetId === c.assetId) }] : [];
    });
    const identities = new Set(candidates.map(c => JSON.stringify([c.assetId, c.skip])));
    const clips = new Set(candidates.flatMap(c => c.clipKey ? [c.clipKey] : []));
    if (identities.size === 1 && clips.size <= 1) n.pick = structuredClone(candidates.find(c => c.clipKey) ?? candidates[0]);
    else if (identities.size > 1 || clips.size > 1) {
      conflict = true;
      n.pick = { error: "Saved picks conflict. Choose an asset or Skip for now." };
    }
    else if (n.selectedAssetId) n.pick = { assetId: n.selectedAssetId, fromMessage: true };
  }
  p.proposal.assetStateVersion = 1;
  return { conflict };
}

/** Translate a selection command's working view into its owning proposal need. */
export function captureProposalPicks(p: Project) {
  if (!p.proposal?.assetNeeds || !p.assetDiscovery) return;
  importProposalPicks(p);
  for (const n of p.proposal.assetNeeds) {
    const g = p.assetDiscovery.groups.find(g => g.id === n.id);
    if (!g) continue;
    const c = p.assetDiscovery.choices?.[g.id];
    n.pick = c ? { ...structuredClone(c), option: structuredClone(g.options.find(o => o.assetId === c.assetId)), ...(n.pick?.sound && n.pick.assetId === c.assetId ? { sound: n.pick.sound } : {}) } : n.selectedAssetId ? { assetId: n.selectedAssetId, fromMessage: true } : undefined;
    if (n.pick?.skip) delete n.selectedAssetId;
  }
}

/** Search pages survive, but saved selections always come from proposal needs. */
export function projectProposalPicks(p: Project) {
  if (!p.proposal?.assetNeeds || p.proposal.assetStateVersion !== 1) return;
  const old = p.assetDiscovery;
  const choices: NonNullable<AssetDiscovery["choices"]> = {};
  const groups = p.proposal.assetNeeds.map(n => {
    const prior = old?.groups.find(g => g.id === n.id || g.assetNeedId === n.id);
    const { option, sound: _sound, ...choice } = n.pick ?? {};
    if (n.pick) choices[n.id] = choice;
    const options = (prior?.options ?? []).filter(o => o.assetId !== option?.assetId);
    if (option) options.unshift(option);
    return {
      ...prior, id: n.id, assetNeedId: n.id, label: prior?.label ?? n.role,
      query: prior?.query ?? n.query, needQuery: n.query,
      kind: option?.kind ?? (n.kind === "Animation" ? "Model" as const : n.kind),
      preview: previewForRole({ ...n, assetRole: n.pick?.roleOverride ?? n.assetRole }),
      options,
    };
  });
  const next = { ...old, id: old?.id ?? `proposal-${p.id}`, revision: p.revision, studioId: old?.studioId ?? "", groups, choices,
    approved: p.proposal.approval ? true : undefined, pinned: groups.filter(g => choices[g.id]?.assetId).map(g => g.id) };
  if (JSON.stringify(old) !== JSON.stringify(next)) p.assetDiscovery = next;
}

export function skipProposalNeed(p: Project, id: string) {
  importProposalPicks(p);
  const need = proposalNeed(p, id);
  if (!need) return false;
  const removed = need.pick?.assetId ?? need.selectedAssetId;
  if (removed && !p.proposal!.assetNeeds!.some(n => n.id !== need.id && n.pick?.assetId === removed)) p.assetAttachments = p.assetAttachments?.filter(a => a.assetId !== removed);
  need.pick = { skip: true, reason: "Skipped for now by you." };
  const text = `Skip ${need.query} (${need.id}) for now. Omit this asset and its dependent media requirement from this build.`;
  (p.briefChanges ??= []).push({ id: `skip-${need.id}-${p.revision}`, text });
  delete need.selectedAssetId;
  p.proposal!.approval = undefined;
  p.proposal!.changed = [...new Set([...p.proposal!.changed, "assets" as const])];
  p.approvedRevision = null;
  p.staleImplementation = !!p.artifact;
  projectProposalPicks(p);
  return true;
}

export function skipTarget(p: Project, text: string) {
  if (!/^\s*(?:(?:please|can you|could you)\s+)?(?:skip|drop|omit)\s+[^.!?]+[.!?]?\s*$/i.test(text)) return;
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  const targets = p.proposal?.assetNeeds?.filter(n => {
    const terms: string[] = `${n.id.replace(/([a-z])([A-Z])/g, "$1 $2")} ${n.query} ${n.kind}`.toLowerCase().match(/[a-z]+/g) ?? [];
    return words.some(w => !["the", "for", "now", "asset", "skip", "drop", "without"].includes(w) && terms.includes(w));
  }) ?? [];
  return targets.length === 1 ? targets[0] : undefined;
}
