import type { AssetNeed } from "../generation/asset-contract";
import type { Project } from "../generation/schema";
import type { AssetDiscovery } from "./discovery";
import { ROLE_CAPTURE_VERSION } from "./role-capture";
import { punchSegments } from "./punch-segments";

export type AssetRole = "static_target" | "animation" | "sound" | "unsupported";
export function assetRole(need: Pick<AssetNeed, "kind" | "query" | "role">): AssetRole {
  if (need.kind === "Animation") return "animation";
  if (need.kind === "Audio") return "sound";
  for (const text of [need.query, need.role]) {
    if (/\b(animat\w*|keyframes?|clips?)\b/i.test(text)) return "animation";
    if (/\b(sounds?|audio|sfx)\b/i.test(text)) return "sound";
    if (/\b(dumm(?:y|ies)|training target|practice target)\b/i.test(text)) return "static_target";
  }
  return "unsupported";
}
export const previewForRole = (need: Pick<AssetNeed, "kind" | "query" | "role">) => {
  const role = assetRole(need);
  return role === "animation" ? "animation" as const : role === "sound" ? "audio" as const : need.kind === "Image" ? "image" as const : "model" as const;
};
export const mediaAssetId = (value: string) => value.match(/^(?:rbxassetid:\/\/|https?:\/\/www\.roblox\.com\/asset\/?\?id=)([1-9]\d*)$/)?.[1];
type RoleProject = Pick<Project, "proposal" | "spec" | "assetDiscovery" | "rig">;

export function assetRoleEvidence(project: RoleProject, group: AssetDiscovery["groups"][number]) {
  const need = (project.proposal?.assetNeeds ?? project.spec?.assetNeeds)?.find(n => n.id === (group.assetNeedId ?? group.id));
  const role = assetRole(need ?? { kind: group.kind, query: group.needQuery ?? group.query, role: group.label });
  const choice = project.assetDiscovery?.choices?.[group.id];
  const option = group.options.find(o => o.assetId === choice?.assetId);
  const inspection = option?.inspection;
  const facts = inspection?.nativeRoles;
  const revision = option?.versionId ? "version:" + option.versionId : option?.updated ? "updated:" + option.updated : "";
  const selectedClip = option?.previewData?.pack?.entries.find(entry => entry.key === choice?.clipKey);
  const selectedSound = project.proposal?.assetNeeds?.find(n => n.id === (group.assetNeedId ?? group.id))?.pick?.sound;
  const key = JSON.stringify([ROLE_CAPTURE_VERSION, option?.assetId, revision, inspection?.contentHash, role, project.rig?.selected, choice?.clipKey, selectedSound]);
  const result = (status: "ready" | "blocked" | "unknown", reason: string, recapture = false, details: unknown = undefined) => ({ role, status, reason, recapture, key, details });
  if (role === "unsupported") return result("unknown", "Structural checks for this asset role are not available yet. This pick is not ready for build.");
  if (!inspection || !revision || inspection.nativeRevisionKey !== revision)
    return result("unknown", "This role needs a current native inspection tied to the asset revision.", true);
  if (["Model", "MeshPart"].includes(option!.kind) && facts?.version !== ROLE_CAPTURE_VERSION)
    return result("unknown", "The saved inspection did not capture this role's properties. Inspect this pick again.", true);
  if (inspection.status === "limited") return result("unknown", "Inspection coverage is incomplete. Required role properties remain unknown.");
  if (role === "animation") {
    if (!selectedClip?.clip) return result("unknown", "Choose a playable clip from this animation pack.", !option?.previewData?.pack);
    if (option?.previewData?.pack?.revisionKey !== revision)
      return result("unknown", "The animation capture belongs to an older asset revision. Capture it again.", true);
    if (!project.rig?.selected) return result("unknown", "Choose the project rig before using this animation.");
    if (selectedClip.clip.rig !== project.rig.selected)
      return result("blocked", `This animation is ${selectedClip.clip.rig}, but the game uses ${project.rig.selected}. Choose a matching clip or change the rig.`);
    if (selectedClip.clip.duration <= 0) return result("blocked", "This clip has no playable duration.");
    const sequence = facts?.sequences.find(s => s.key === selectedClip.key && s.name === selectedClip.name);
    if (selectedClip.animationId && option!.kind === "Model" && !facts?.animations.some(a => a.key === selectedClip.key && mediaAssetId(a.animationId) === selectedClip.animationId))
      return result("unknown", "The selected Animation reference is absent from the current native capture. Capture the pack again.", true);
    if (!selectedClip.clip.sourcePoseDigest || (!selectedClip.animationId && sequence?.poseDigest !== selectedClip.clip.sourcePoseDigest))
      return result("unknown", "The selected clip is not bound to the current native pose capture. Capture the pack again.", true);
    return result("ready", selectedClip.animationId ? "Captured animation structure matches the project rig. Runtime permissions and playback remain unverified." : "Captured raw clip matches the project rig. Studio-only playback. Publishing needs a permitted published Animation.", false, {
      assetId: option!.assetId, revision, contentHash: inspection.contentHash, classCounts: facts?.classes,
      clip: { key: selectedClip.key, name: selectedClip.name, rig: selectedClip.clip.rig, duration: selectedClip.clip.duration, poseDigest: selectedClip.clip.sourcePoseDigest, animationId: selectedClip.animationId, frames: sequence?.frames, loop: sequence?.loop, priority: sequence?.priority },
      ...(sequence ? { proposedPunchSegments: punchSegments(selectedClip.clip, sequence) } : {}),
    });
  }
  if (role === "sound") {
    if (option!.kind === "Audio") return result("ready", "Audio reference identified. Loading, playback and audible fit still require native acquisition checks.", false, { assetId: option!.assetId, revision, contentHash: inspection.contentHash, nativePlayback: "not_verified" });
    if (!selectedSound) return result("unknown", "Choose a Sound from this model. Preview is optional.");
    const sound = facts?.sounds.find(s => s.path === selectedSound.path && mediaAssetId(s.soundId) === selectedSound.assetId);
    if (!sound) return result("blocked", "The chosen Sound identity is absent from the current native capture. Choose a current sound.");
    return result("ready", "Selected Sound and SoundId were captured. Playback and audible fit remain unverified.", false, { assetId: option!.assetId, revision, contentHash: inspection.contentHash, sound });
  }
  if (!facts?.parts.length) return result("blocked", "A static target needs captured physical hit parts. None were found.");
  if (facts.parts.some(part => part.size.some(size => size <= 0))) return result("blocked", "The target has invalid physical dimensions.");
  const low = [Infinity, Infinity, Infinity], high = [-Infinity, -Infinity, -Infinity];
  for (const part of facts.parts) for (let axis = 0; axis < 3; axis++) {
    const half = part.size.reduce((sum, size, j) => sum + Math.abs(part.cframe[3 + axis * 3 + j]) * size / 2, 0);
    low[axis] = Math.min(low[axis], part.cframe[axis] - half);
    high[axis] = Math.max(high[axis], part.cframe[axis] + half);
  }
  return result("ready", "Physical target parts and bounds captured. Placement, anchoring and hit integration must be implemented and tested. A Humanoid is not required for a static target.", false, {
    assetId: option!.assetId, revision, contentHash: inspection.contentHash, classCounts: facts.classes,
    scriptCount: inspection.scriptCount, bounds: { min: low, max: high, size: high.map((value, axis) => value - low[axis]) },
    parts: facts.parts, humanoids: facts.humanoids,
    needsAnchoring: facts.parts.some(part => !part.anchored), needsHitQuery: facts.parts.every(part => !part.canQuery),
  });
}

export function selectedRoleEvidence(project: RoleProject) {
  return (project.assetDiscovery?.groups ?? []).filter(group => project.assetDiscovery?.choices?.[group.id]?.assetId && !project.assetDiscovery?.choices?.[group.id]?.skip)
    .map(group => ({ needId: group.assetNeedId ?? group.id, ...assetRoleEvidence(project, group) }));
}
