import type { z } from "zod";
import type { assetEvaluationSchema } from "./asset-contract";
import type { Project } from "./schema";
import { approvedAssetLinks } from "../marketplace/asset-binding";
import { requirementSources } from "./brief-sources";

export const approvedReferenceInstructions =
  "assetNeeds.constraints contains worker-authored SEARCH HINTS, not user acceptance gates. For a user-approved reference, inferred mismatches or unverified fit are visible limitations and must not remove the requested feature. A blocking rejection requires rejectionBasis with an exact actual user sourceId/quote, or an exact native capability/import failure quote. Never cite search hints, inferred requirements or missing integration as a capability failure. Native safety/import checks remain mandatory. Do not claim unobserved fit or playback.";

/** A model verdict alone cannot overrule approval. Its grounds must be in the supplied evidence. */
export function groundedAssetRejection(
  evaluation: z.infer<typeof assetEvaluationSchema>,
  userSources: { id: string; text: string }[],
  nativeReasons: string[],
) {
  const basis = evaluation.rejectionBasis;
  if (!basis?.quote.trim()) return false;
  return basis.kind === "user_statement"
    ? userSources.some(
        (s) => s.id === basis.sourceId && s.text.includes(basis.quote),
      )
    : nativeReasons.some((reason) => reason.includes(basis.quote));
}

/** Read the preserved inspection, never upgrade or rewrite a failed acquisition receipt.
 * This authorizes use of a supplied reference, not an imported hierarchy or verified fit.
 */
export function approvedReferenceLimitations(p: Project) {
  const run = p.assetPipeline;
  if (
    !p.spec ||
    !run ||
    run.status !== "passed" ||
    run.requiresReconciliation ||
    run.revision !== p.revision
  )
    return [];
  return approvedAssetLinks(p).flatMap(({ need, option }) => {
    const entry = run.entries.find((e) => e.needId === need.id);
    const events = run.events.filter((e) => e.needId === need.id);
    const noted = events.filter(
      (e) =>
        e.step === "approval_limitation" &&
        (e.data as any)?.candidateId === option.assetId,
    );
    if (entry?.status === "passed" && noted.length)
      return [
        {
          needId: need.id,
          requirementId: need.requirementId,
          role: need.role,
          assetId: option.assetId,
          kind: "approval_limitation" as const,
          reason: noted.map((e) => (e.data as any).reason).join("\n"),
        },
      ];
    if (!entry || entry.status !== "failed") return [];
    const inspected: any = events.find(
      (e) =>
        e.step === "inspect_result" &&
        (e.data as any)?.candidate?.id === option.assetId,
    )?.data;
    if (
      !inspected?.safe ||
      inspected.capabilityBlock ||
      inspected.reasons?.length ||
      !inspected.functional?.contentLoaded ||
      inspected.functional.scriptCount !== 0
    )
      return [];
    const evaluation: any = events.find(
      (e) => e.step === "inspection_evaluation_result",
    )?.data;
    const rejections = events.filter((e) => e.step === "candidate_rejected");
    if (
      !evaluation ||
      !rejections.length ||
      rejections.some((e) => {
        const data: any = e.data;
        return (
          data.candidateId !== option.assetId ||
          data.phase !== "inspection" ||
          data.reason !==
            "Inspection evaluator rejected candidate: " + evaluation.reason
        );
      }) ||
      events.some(
        (e) => /(?:error|failed)$/.test(e.step) && e.step !== "need_failed",
      ) ||
      groundedAssetRejection(
        evaluation,
        requirementSources(p),
        inspected.reasons ?? [],
      )
    )
      return [];
    return [
      {
        needId: need.id,
        requirementId: need.requirementId,
        role: need.role,
        assetId: option.assetId,
        kind: "approval_limitation" as const,
        reason:
          "Approved reference remains available for implementation. Earlier evaluator rejection has no source-backed blocking grounds. Search hints are advisory. Fit and integration remain unverified. Preserved evaluation: " +
          evaluation.reason,
      },
    ];
  });
}
