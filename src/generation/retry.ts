import type { Project } from "./schema";
import { coordinationInputHash } from "./coordinator";
import { normalizeNeeds } from "../marketplace/normalize-needs";
import { proposalHash } from "./proposal";

/** Read migration only. Preserve checkpoints only when their original input still matches. */
export function migrateAssetNeeds(p: Project) {
  const reusable = p.coordination?.inputHash === coordinationInputHash(p);
  const approved = p.proposal?.approval?.hash === p.proposal?.hash;
  if (!normalizeNeeds(p)) return;
  if (p.proposal) {
    const old = p.proposal.hash;
    p.proposal.hash = proposalHash(p);
    if (approved && p.proposal.approval) p.proposal.approval.hash = p.proposal.hash;
    if (p.proposalPlan?.hash === old) p.proposalPlan.hash = p.proposal.hash;
  }
  if (reusable && p.coordination) p.coordination.inputHash = coordinationInputHash(p);
}

export function planningRetry(p: Project) {
  if (p.jobId || !["failed", "interrupted"].includes(p.stage) || !p.coordination?.outline || p.spec) return;
  const area = p.coordination.outline.areas.find(a => !p.coordination!.areas[a.id]);
  if (!area || p.coordination.inputHash !== coordinationInputHash(p)) return;
  const last = p.charges.filter(c => c.phase === "planner").at(-1);
  if (!last) return;
  return { step: area.title, estimatedMicros: last.chargedMicros, reservationMicros: last.reservedMicros,
    completed: Object.keys(p.coordination.areas).length };
}
