import type { Project } from "./schema";
import { coordinationInputHash } from "./coordinator";
import { normalizeNeeds } from "../marketplace/normalize-needs";
import { proposalHash } from "./proposal";

/** Read migration only. Preserve checkpoints only when their original input still matches. */
export function migrateAssetNeeds(p: Project) {
  // Do not re-key accepted legacy acquisition records whose hashes bind their rows.
  // The failed pre-plan proposal and projects with duplicate rows need migration.
  const needs = p.spec?.assetNeeds ?? p.proposal?.assetNeeds;
  if (
    p.spec ||
    !p.proposal?.assetNeeds?.some((n) => n.selectedAssetId) ||
    !needs?.length
  )
    return;
  if (
    p.assetDiscovery?.groups.length === needs.length &&
    p.assetDiscovery.groups.every((g) => needs.some((n) => n.id === g.id))
  )
    return;
  const reusable = p.coordination?.inputHash === coordinationInputHash(p);
  const approved = p.proposal?.approval?.hash === p.proposal?.hash;
  if (!normalizeNeeds(p)) return;
  if (p.proposal) {
    const old = p.proposal.hash;
    p.proposal.hash = proposalHash(p);
    if (approved && p.proposal.approval)
      p.proposal.approval.hash = p.proposal.hash;
    if (p.proposalPlan?.hash === old) p.proposalPlan.hash = p.proposal.hash;
  }
  if (reusable && p.coordination)
    p.coordination.inputHash = coordinationInputHash(p);
}

export function planningRetry(p: Project) {
  if (
    p.jobId ||
    !["failed", "interrupted"].includes(p.stage) ||
    !p.coordination?.outline ||
    p.spec
  )
    return;
  const area = p.coordination.outline.areas.find(
    (a) => !p.coordination!.areas[a.id],
  );
  if (!area || p.coordination.inputHash !== coordinationInputHash(p)) return;
  const last = p.charges.filter((c) => c.phase === "planner").at(-1);
  if (!last) return;
  return {
    step: area.title,
    estimatedMicros: last.chargedMicros,
    reservationMicros: last.reservedMicros,
    completed: Object.keys(p.coordination.areas).length,
  };
}

/** A retry is an explicit new dispatch against the same ledger and checkpoints. */
export function stepRetry(p: Project) {
  if (p.queuedMessages?.some((q) => !["applied", "cancelled"].includes(q.status))) return;
  const planning = planningRetry(p);
  if (planning)
    return {
      ...planning,
      kind: "plan" as const,
      kept: `${planning.completed} completed area plans`,
    };
  if (
    p.jobId ||
    !["failed", "interrupted"].includes(p.stage) ||
    !p.spec ||
    p.pendingProposalEdit ||
    p.queuedMessages?.some((q) => !["applied", "cancelled"].includes(q.status))
  )
    return;
  if (p.proposal && p.proposal.approval?.hash !== proposalHash(p)) return;
  if (
    !p.proposal &&
    (p.approvedRevision !== p.revision || p.staleImplementation)
  )
    return;
  const spec = p.implementationCandidate?.spec ?? p.spec;
  const completed =
    p.implementationCandidate?.completedBuildTasks ??
    p.completedBuildTasks ??
    [];
  const task = spec.tasks.find((t) => !completed.includes(t.id));
  const phase = p.failure?.phase ?? (task ? "builder" : "reviewer");
  const last = p.charges.filter((c) => c.phase === phase).at(-1);
  if (!last) return;
  return {
    step: task?.title ?? `${phase} checks`,
    estimatedMicros: last.chargedMicros,
    reservationMicros: last.reservedMicros,
    completed: completed.length,
    kept: `${completed.length} completed tasks and saved files`,
    kind: p.proposal
      ? ("proposal-build" as const)
      : p.artifact
        ? ("repair" as const)
        : ("build" as const),
  };
}
