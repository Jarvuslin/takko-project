import type { Bundle, Project } from "./schema";
import { approvedReferenceLimitations } from "./approved-reference-policy";
import { approvedAssetLinks } from "../marketplace/asset-binding";
import {
  animationTier,
  studioPublishingLimitation,
} from "../marketplace/animations";

export function publishingAssetRequirements(p: Project) {
  if (!p.spec) return [];
  return approvedAssetLinks(p).flatMap((link) => {
    const group = p.assetDiscovery!.groups.find((g) =>
      g.options.includes(link.option),
    )!;
    const key = p.assetDiscovery!.choices?.[group.id]?.clipKey;
    const entry = link.option.previewData?.pack?.entries.find(
      (e) => e.key === key,
    );
    if (!entry || animationTier(entry) !== "studio_only") return [];
    return [
      {
        needId: link.need.id,
        requirementId: link.need.requirementId,
        role: link.need.role,
        kind: "publishing_limitation" as const,
        reason: studioPublishingLimitation,
      },
    ];
  });
}

/** Only settled host acquisition evidence authorizes a partial build. */
export function unmetAssetRequirements(p: Project) {
  const run = p.assetPipeline;
  const limitations = [
    ...approvedReferenceLimitations(p),
    ...publishingAssetRequirements(p),
    ...(p.spec
      ? approvedAssetLinks(p).flatMap((link) => {
          const reasons = p.assetAttachments?.find(
            (a) => a.assetId === link.option.assetId,
          )?.inspectionLimitations;
          return reasons?.length
            ? [
                {
                  needId: link.need.id,
                  requirementId: link.need.requirementId,
                  role: link.need.role,
                  kind: "inspection_limitation" as const,
                  reason:
                    "Acknowledged inspection coverage limitation. " +
                    reasons.join(" "),
                },
              ]
            : [];
        })
      : []),
  ];
  if (!run || run.status !== "passed" || run.requiresReconciliation)
    return limitations;
  return [
    ...limitations,
    ...run.needs.flatMap((need) => {
      const entry = run.entries.find((e) => e.needId === need.id);
      if (
        need.required ||
        limitations.some(
          (l) => l.needId === need.id && l.kind === "approval_limitation",
        ) ||
        !entry ||
        !["failed", "escalation_required"].includes(entry.status)
      )
        return [];
      return [...new Set([need.requirementId])].map((requirementId) => ({
        needId: need.id,
        requirementId,
        role: need.role,
        kind: "missing_dependency" as const,
        reason: entry.reason ?? "Asset acquisition failed",
      }));
    }),
  ];
}

/** A coding model cannot upgrade a known missing dependency into implemented evidence. */
export function retainAssetGaps(p: Project, bundle: Bundle): Bundle {
  const gaps = unmetAssetRequirements(p).filter(
    (g) => g.kind !== "approval_limitation",
  );
  const result = structuredClone(bundle);
  for (const id of new Set(gaps.map((g) => g.requirementId))) {
    const previous = result.coverage.find((c) => c.requirementId === id);
    result.coverage = result.coverage.filter((c) => c.requirementId !== id);
    const detail =
      "Unmet asset requirement. " +
      gaps
        .filter((g) => g.requirementId === id)
        .map((g) => g.role + ": " + g.reason)
        .join("\n");
    result.coverage.push({
      requirementId: id,
      status: "blocked",
      files: previous?.files ?? [],
      // The artifact summary is bounded. Original failure evidence stays intact.
      detail:
        detail.length <= 12000
          ? detail
          : detail.slice(0, 11800) +
            "\nAdditional details retained in the asset pipeline failure records.",
    });
  }
  return result;
}

export const assetGapInstructions =
  "For approval_limitation, implement the approved supplied reference (asset status provided, not retrieved). Search hints and unverified fit cannot discard it. Keep the visible limitation in context/review without marking implemented behavior blocked merely for that limitation. " +
  "Host-reported unmetAssetRequirements remain recorded as blocked coverage and review warnings. For publishing_limitation, the mapped raw animation IS available for Studio testing: implement its playback via RegisterKeyframeSequence, assign the returned ID unchanged, and retain only the publishing limitation. Do not omit Studio playback because publishing is blocked. For inspection_limitation, preserve the acknowledged coverage limitation while implementing the available asset. This is not a detected safety finding and does not authorize bypassing actual acquisition safety findings. For missing_dependency, implement all independent behavior and safe missing-asset handling. Do not invent replacements or retry acquisition. Keep acceptance tests for intended behavior, which remains unverified. Unrelated defects, including unsafe handling of absent assets, are still errors.";
