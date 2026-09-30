import { z } from "zod";
import type { Profile, Project } from "./schema";
import { gameContext } from "./game-context";

export const finalReviewPolicySchema = z.object({
  maxOutputTokens: z.number().int().min(512).max(32768),
  reasoningEffort: z.enum(["low", "medium", "high"]),
  inputEnvelopeBytes: z.number().int().min(1024).max(8 * 1024 * 1024),
}).strict();
export type FinalReviewPolicy = z.infer<typeof finalReviewPolicySchema>;
export const trialFinalReviewPolicy: FinalReviewPolicy = {
  maxOutputTokens: 32768, reasoningEffort: "medium", inputEnvelopeBytes: 400000,
};
export const protectedReviewSchema = z.object({
  policy: finalReviewPolicySchema,
  profileId: z.uuid(),
  model: z.string(),
  inputRate: z.number().finite().nonnegative(),
  outputRate: z.number().finite().nonnegative(),
  allowanceMicros: z.number().int().nonnegative(),
  status: z.enum(["protected", "reserved", "consumed"]),
}).strict();
export type ProtectedReview = z.infer<typeof protectedReviewSchema>;

export class ReviewBudgetStop extends Error {
  constructor(detail: string) {
    super("Protected final-review budget: " + detail + ". No inference request was dispatched.");
  }
}

export function prepareReviewBudget(p: Project, profile: Profile, policy: FinalReviewPolicy) {
  const previous = p.protectedReview;
  p.protectedReview = {
    policy: { ...finalReviewPolicySchema.parse(policy), inputEnvelopeBytes: Math.max(policy.inputEnvelopeBytes, previous?.policy.inputEnvelopeBytes ?? 0) },
    profileId: profile.id, model: profile.model,
    inputRate: profile.inputRate, outputRate: profile.outputRate,
    allowanceMicros: 0, status: "protected",
  };
  refreshReviewBudget(p);
}

/** Persist a growing envelope, not a provider charge or an unknown billing hold. */
export function refreshReviewBudget(p: Project, inputBytes = 0) {
  const hold = p.protectedReview;
  if (!hold || hold.status !== "protected") return 0;
  // Includes saved source/evidence twice for repeated review context, with room
  // for the schema, instructions and screenshot allowance. Actual review input
  // is checked again at dispatch, so this estimate can never bypass admission.
  // Use the actual prompt producer. Search-result preview pages, old pipeline
  // history and conversation logs are not final-review input.
  const context = {
    gameContext: gameContext(p), spec: p.spec, artifact: p.artifact,
    approvedProposal: p.proposal, research: p.research, architecture: p.architecture,
    assetPipeline: p.assetPipeline && {
      status: p.assetPipeline.status,
      entries: p.assetPipeline.entries.map(({ needId, status, selected, reason, bundle }) => ({ needId, status, selected, reason, bundle })),
    },
  };
  const projected = Buffer.byteLength(JSON.stringify(context)) * 2 + 65536;
  const bytes = Math.max(hold.policy.inputEnvelopeBytes, inputBytes, projected);
  if (bytes > 8 * 1024 * 1024) throw new ReviewBudgetStop("review context exceeds its supported envelope");
  hold.policy.inputEnvelopeBytes = bytes;
  hold.allowanceMicros = Math.ceil((bytes + 1024) * hold.inputRate + hold.policy.maxOutputTokens * hold.outputRate);
  return hold.allowanceMicros;
}

/** Synchronous check immediately before the caller persists its reservation. */
export function assertReviewBudget(p: Project, reserve: number, finalReview = false, inputBytes = 0) {
  const hold = p.protectedReview;
  if (!hold || hold.status === "consumed") return;
  if (hold.status === "reserved") throw new ReviewBudgetStop("final review is already in flight");
  if (p.charges.some(charge => charge.estimated && charge.inputTokens === null && charge.outputTokens === null))
    throw new ReviewBudgetStop("unknown provider billing must be reconciled first");
  const protectedMicros = refreshReviewBudget(p, finalReview ? inputBytes : 0);
  const addition = reserve + (finalReview ? 0 : protectedMicros);
  const total = p.charges.reduce((sum, charge) => sum + charge.chargedMicros, 0);
  const cycle = p.generation && p.charges.slice(p.generation.chargeStart).reduce((sum, charge) => sum + charge.chargedMicros, 0);
  if (total + p.reservedMicros + addition > p.budgetMicros ||
      (p.generation && cycle! + p.reservedMicros + addition > p.generation.budgetMicros))
    throw new ReviewBudgetStop(finalReview ? "the actual review request no longer fits" : "this request would consume funds set aside for review");
}
