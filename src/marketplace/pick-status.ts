import type { Project } from "../generation/schema";
import type { AssetDiscovery } from "./discovery";

export type PickState =
  "empty" | "finding" | "checking" | "ready" | "warning" | "problem";
export type PickStatus = {
  state: PickState;
  label: string;
  reason?: string;
  canBuild: boolean;
};
const labels: Record<PickState, string> = {
  empty: "Not chosen",
  finding: "Finding a match",
  checking: "Checking",
  ready: "Ready",
  warning: "Check this pick",
  problem: "Problem",
};
export function assetLabel(group: AssetDiscovery["groups"][number]) {
  // Planner roles are purpose sentences. The query supplies the short display name.
  const value =
    group.label.length <= 45
      ? group.label
      : group.id
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/[-_]/g, " ")
          .toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
}
export function pickStatus(
  project: Project,
  group: AssetDiscovery["groups"][number],
): PickStatus {
  const choice = project.assetDiscovery?.choices?.[group.id];
  const option = group.options.find((o) => o.assetId === choice?.assetId);
  const status = (
    state: PickState,
    reason?: string,
    canBuild = state === "ready",
  ): PickStatus => ({ state, label: labels[state], reason, canBuild });
  if (choice?.operation === "finding") return status("finding");
  if (choice?.operation === "checking") return status("checking");
  if (choice?.error) return status("problem", choice.error);
  if (choice?.skip)
    return status(
      "warning",
      "This asset was deferred in the saved project.",
      !!project.assetDiscovery?.approved,
    );
  if (!choice?.assetId) return status("empty", choice?.reason);
  if (project.excludedAssetIds?.includes(choice.assetId))
    return status("problem", "Excluded by you. Choose another asset.");
  if (!option)
    return status(
      "problem",
      "The saved listing is unavailable. Choose another asset.",
    );
  if (option.kind !== group.kind || option.isFree === false)
    return status(
      "problem",
      "This pick must be free and the right type. Choose another asset.",
    );
  const inspection = option.inspection;
  if (inspection && (inspection.status === "blocked" || inspection.findings.some(f => f.severity === "blocked")))
    return status(
      "problem",
      `${inspection.findings.map((f) => f.message).join(" ") || "Static inspection failed."} Choose another asset.`,
    );
  const rejected = group.relevance?.assessments?.some(
    (a) =>
      a.candidateId === option.assetId &&
      (!a.clipKey || a.clipKey === choice.clipKey) &&
      (a.state === "irrelevant" ||
        (a.relevant === false && (a.confidence ?? 0) >= 0.8)),
  );
  const need = (project.spec?.assetNeeds ?? project.proposal?.assetNeeds)?.find(
    (n) => n.id === (group.assetNeedId ?? group.id),
  );
  const words =
    (need?.query ?? group.needQuery ?? group.query)
      .toLowerCase()
      .match(/[a-z]{3,}/g)
      ?.filter((w) => !["model", "asset", "pack", "the", "for"].includes(w)) ??
    [];
  const mismatch =
    words.length > 0 &&
    !words.some((w) => option.name.toLowerCase().includes(w.replace(/s$/, "")));
  if (choice.sourceReview?.scripts.some(s => s.action === "danger")) return status("problem", "Source review found dangerous behavior. Choose another asset.");
  if (inspection?.scriptCount && choice.sourceReview?.contentHash !== inspection.contentHash) return status("checking", "Checking actual script sources automatically. Validation uses the decisions route and counts against your cap.");
  const warnings = [
    rejected
      ? "The relevance check judged this pick unrelated to the need."
      : mismatch
        ? "The name doesn't match this need. Check the contents before keeping it."
        : "",
    ...(inspection?.limitations ?? option.inspectionLimitations ?? []),
  ].filter(Boolean);
  const clip = option.previewData?.pack?.entries.find(
    (e) => e.key === choice.clipKey && e.clip,
  );
  // Warnings remain visible on old choices, including the saved irrelevant dummy.
  if (!inspection || option.isFree !== true)
    return status(
      "problem",
      "This saved pick needs current verification. Choose it again in Marketplace to check it.",
    );
  if (group.preview === "animation" && !clip)
    return status(
      "problem",
      "Choose a playable clip from this animation pack.",
    );
  if (clip?.clip?.rig && project.rig?.selected && clip.clip.rig !== project.rig.selected) return status("warning", `This animation is ${clip.clip.rig}, but the game uses ${project.rig.selected}. Choose a matching animation or change the project rig.`, true);
  if (need?.kind === "Audio" && option.kind === "Model") return status("warning", "This is a model containing audio. Choose the sound within it for playback.", true);
  if (warnings.length && !choice.kept) return status("warning", warnings.join(" ") + " Choose a closer match if needed.", true);
  return status(
    "ready",
    choice.sourceReview ? `${choice.sourceReview.scripts.filter(s => s.action === "keep").length} scripts kept for this role. ${choice.sourceReview.scripts.filter(s => s.action === "disable").map(s => `${s.name}: disabled in delivered copy`).join(" ")} Validation $${(choice.sourceReview.costMicros / 1e6).toFixed(4)}.` : choice.kept ? "Kept by you. " + warnings.join(" ") : choice.reason,
  );
}

export function missingPicks(project: Project) {
  return (project.assetDiscovery?.groups ?? []).filter(
    (g) => !pickStatus(project, g).canBuild,
  );
}
