import type { AssetNeed } from "../generation/asset-contract";
import type { Project } from "../generation/schema";
import type { AssetDiscovery } from "./discovery";
import { ROLE_CAPTURE_VERSION } from "./role-capture";
import { punchSegments } from "./punch-segments";
import type { SupportedAssetRole } from "./asset-roles";

export type AssetRole = SupportedAssetRole | "unsupported";
type RoleNeed = Pick<AssetNeed, "kind" | "query" | "role"> & Partial<Pick<AssetNeed, "assetRole" | "intent">>;
export function assetRole(need: RoleNeed): AssetRole {
  if (need.assetRole) return need.assetRole;
  if (need.kind === "Animation") return "animation";
  if (need.kind === "Audio") return "sound";
  if (need.kind === "MeshPart") return "mesh";
  if (need.kind === "Image") return "image";
  // Legacy prose only suggests intended use. Readiness additionally requires
  // matching native structure below, and ambiguous intent stays unknown.
  for (const text of [need.query, need.role, need.intent?.experienceRole ?? "", need.intent?.interaction ?? ""]) {
    if (/\b(animat\w*|keyframes?|clips?)\b/i.test(text)) return "animation";
    if (/\b(sounds?|audio|sfx)\b/i.test(text)) return "sound";
    if (/\b(dumm(?:y|ies)|training target|practice target|punching bag|archery target)\b/i.test(text)) return "static_target";
    if (/\b(npc|character|enemy|villager|humanoid)\b/i.test(text)) return "character";
    if (/\b(tool|weapon|sword|hammer|flashlight|wand)\b/i.test(text)) return "tool";
    if (/\b(vfx|particles?|emitters?|visual effects?)\b/i.test(text) && !/\bno (?:sounds? or )?(?:visual effects?|vfx)\b/i.test(text)) return "vfx";
    if (/\b(prop|decoration|decorative|environment|door|bench|bridge|chest|tree|rock|building)\b/i.test(text)) return "prop";
  }
  return "unsupported";
}
export const previewForRole = (need: RoleNeed) => {
  const role = assetRole(need);
  return role === "animation" ? "animation" as const : role === "sound" ? "audio" as const : need.kind === "Image" ? "image" as const : "model" as const;
};
export const mediaAssetId = (value: string) => value.match(/^(?:rbxassetid:\/\/|https?:\/\/www\.roblox\.com\/asset\/?\?id=)([1-9]\d*)$/)?.[1];
type RoleProject = Pick<Project, "proposal" | "spec" | "assetDiscovery" | "rig">;

export function assetRoleEvidence(project: RoleProject, group: AssetDiscovery["groups"][number]) {
  const need = (project.proposal?.assetNeeds ?? project.spec?.assetNeeds)?.find(n => n.id === (group.assetNeedId ?? group.id));
  const choice = project.assetDiscovery?.choices?.[group.id];
  const role = choice?.roleOverride ?? assetRole(need ?? { kind: group.kind, query: group.needQuery ?? group.query, role: group.label });
  const option = group.options.find(o => o.assetId === choice?.assetId);
  const inspection = option?.inspection;
  const facts = inspection?.nativeRoles;
  const revision = option?.versionId ? "version:" + option.versionId : option?.updated ? "updated:" + option.updated : "";
  const selectedClip = option?.previewData?.pack?.entries.find(entry => entry.key === choice?.clipKey);
  const selectedSound = project.proposal?.assetNeeds?.find(n => n.id === (group.assetNeedId ?? group.id))?.pick?.sound;
  const key = JSON.stringify([facts?.version ?? ROLE_CAPTURE_VERSION, option?.assetId, revision, inspection?.contentHash, role, project.rig?.selected, choice?.clipKey, selectedSound]);
  const result = (status: "ready" | "blocked" | "unknown", reason: string, recapture = false, details: unknown = undefined) => ({ role, status, reason, recapture, key, details });
  if (role === "unsupported") return result("unknown", "Structural checks for this asset role are not available yet. This pick is not ready for build.");
  if (!inspection || !revision || inspection.nativeRevisionKey !== revision)
    return result("unknown", "This role needs a current native inspection tied to the asset revision.", true);
  const legacyCovered = ["static_target", "animation", "sound"].includes(role) && facts?.version === 1;
  if (["Model", "MeshPart"].includes(option!.kind) && facts?.version !== ROLE_CAPTURE_VERSION && !legacyCovered)
    return result("unknown", "The saved inspection did not capture this role's properties. Inspect this pick again.", true);
  if (inspection.status === "limited") return result("unknown", "Inspection coverage is incomplete. Required role properties remain unknown.");
  const identity = { assetId: option!.assetId, revision, contentHash: inspection.contentHash, classCounts: facts?.classes, roleSource: choice?.roleOverride ? "user" : need?.assetRole ? "proposal_intent" : "legacy_intent_suggestion" };
  if (role === "tool") {
    if (!facts?.tools) return result("unknown", "Capture Tool and RequiresHandle evidence first.", true);
    if (!facts.tools.length) return result("blocked", "No Tool was captured. A weapon-shaped model is not an equippable Tool.");
    if (facts.tools.some(t => t.requiresHandle && !t.handle)) return result("blocked", "A Tool requires a direct physical Handle, but none was captured.");
    return result("ready", "Tool structure captured. Equipping and requested behavior remain unverified.", false, { ...identity, tools: facts.tools });
  }
  if (role === "vfx") {
    if (!facts?.effects) return result("unknown", "Capture effect classes first.", true);
    if (!facts.effects.length) return result("blocked", "No supported emitter or effect instance was captured.");
    return result("ready", "Effect instances captured. Visibility, activation and content loading remain unverified.", false, { ...identity, effects: facts.effects, warnings: facts.effects.every(e=>!e.enabled) ? ["All captured effects are disabled and need explicit activation."] : [] });
  }
  if (role === "mesh" || role === "image") {
    const content = role === "mesh" ? facts?.meshes?.map(m=>({path:m.path,content:m.meshId})) : facts?.images?.map(i=>({path:i.path,content:i.content}));
    if (!content) return result("unknown", "Native content identity has not been captured.", true);
    if (!content.some(c=>c.content.trim())) return result("blocked", "No nonempty native content reference was captured.");
    return result("ready", "Native content identity captured. Loading, permissions and rendering remain unverified.", false, {...identity, content});
  }
  if (role === "character") {
    if (!facts?.humanoids.length) return result("blocked", "A character needs a captured Humanoid.");
    if (!facts.humanoids.every(h=>facts.parts.some(p=>p.name === "HumanoidRootPart" && p.path.slice(0,p.path.lastIndexOf(".")) === h.path.slice(0,h.path.lastIndexOf("."))))) return result("blocked", "A captured Humanoid has no HumanoidRootPart in its own model.");
  }
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
      ...identity,
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
  return result("ready", role === "static_target" ? "Physical target parts and bounds captured. Placement, anchoring and hit integration must be implemented and tested. A Humanoid is not required for a static target." : "Native physical structure and bounds captured. Placement and requested behavior remain unverified.", false, {
    ...identity,
    warnings: role === "character" && project.rig?.selected && facts.humanoids.some(h=>h.rig !== project.rig!.selected) ? ["NPC rig differs from the player rig. Use this character's own matching animations."] : [],
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
