import type { Project } from "./schema";
import type { StructuredQuestion } from "./questions";
export type Rig = "R6" | "R15";
export type RigDecision = { selected?: Rig; recommended: Rig; reason: string };
export const rigQuestionId = "character_rig";
export function requestedRig(text: string, previous?: RigDecision): RigDecision {
  const matches = [...new Set(text.toUpperCase().match(/\bR(?:6|15)\b/g))] as Rig[];
  if (matches.length === 1 && !/\b(maybe|either|not sure)\b/i.test(text)) return { selected: matches[0], recommended: matches[0], reason: "You requested this rig." };
  return previous ?? { recommended: "R15", reason: "R15 supports more articulated movement. Choose R6 for classic six-part animations." };
}
export function recommendRig(p: Project): RigDecision {
  let decision = requestedRig(p.answers[rigQuestionId] ?? p.request, p.rig);
  if (decision.selected) return decision;
  const rigs = new Set<Rig>();
  for (const g of p.assetDiscovery?.groups ?? []) {
    const c = p.assetDiscovery?.choices?.[g.id];
    const option = g.options.find(o => o.assetId === c?.assetId);
    for (const entry of option?.previewData?.pack?.entries ?? []) if ((!c?.clipKey || c.clipKey === entry.key) && ["R6", "R15"].includes(entry.clip?.rig ?? "")) rigs.add(entry.clip!.rig as Rig);
  }
  if (!rigs.size) for (const a of p.assetAttachments ?? []) {
    if (a.kind === "Animation" || /animat/i.test(a.name + a.usage)) for (const match of (a.name + " " + a.usage).toUpperCase().match(/\bR(?:6|15)\b/g) ?? []) rigs.add(match as Rig);
  }
  if (rigs.size === 1) { const recommended = [...rigs][0]; decision = { recommended, reason: `Your attached animation is marked ${recommended}. Matching the rig lets that animation use the expected joints.` }; }
  return decision;
}
export function rigQuestion(p: Project): StructuredQuestion | undefined {
  if (!p.rig || p.rig.selected) return;
  const d = recommendRig(p);
  return { id: rigQuestionId, prompt: "Which character rig should this game use?", source: "Which character rig should this game use?", options: [
    { id: "r6", label: "R6", description: "Classic six-part characters. Use with R6 animations." },
    { id: "r15", label: "R15", description: "Fifteen-part characters. Use with R15 animations." }
  ], recommendedOptionId: d.recommended.toLowerCase(), recommendationReason: d.reason, allowOther: true };
}
export function rigInstructions(p: Pick<Project, "rig">) {
  return p.rig?.selected ? `Project rig: ${p.rig.selected}. Use only matching animations. The host sets the exported place avatar type and supplies a matching StarterCharacter on Studio push. Do not implement character rig-swap services or assume R15.` : p.rig ? "Ask the pending R6/R15 rig question before building. Do not assume a rig." : "Preserve this existing project's rig.";
}
