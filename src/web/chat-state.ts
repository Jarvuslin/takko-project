import type { Project } from "../generation/schema";

export function chatState(p: Project) {
  if (p.jobId) {
    if (p.assetPipeline?.status === "running") return "Checking assets";
    return ["generating", "repairing"].includes(p.stage)
      ? "Building"
      : "Working";
  }
  if (p.stage === "failed") return "Failed";
  if (p.stage === "interrupted") return "Stopped";
  if (["ready_to_test", "verified"].includes(p.stage) && !p.staleImplementation)
    return "Ready to test";
  if (
    p.clarificationQuestions?.some((q) => !p.answers[q.id]) ||
    ["needs_input", "review", "clarification"].includes(p.stage) ||
    p.pendingProposalEdit ||
    (p.proposal && !p.proposal.approval)
  )
    return "Needs you";
  return "Ready";
}

export function buildEstimate(p: Project) {
  const calls = p.charges.filter(
    (c) => c.phase === "builder" && c.status === "ok",
  );
  if (!calls.length || !p.spec) return p.historicalBuildAverageMicros ?? null;
  const remaining = p.spec.tasks.filter(
    (t) => !p.completedBuildTasks?.includes(t.id),
  ).length;
  return remaining
    ? Math.ceil(
        (calls.reduce((n, c) => n + c.chargedMicros, 0) / calls.length) *
          remaining,
      )
    : null;
}

export function buildEstimateNote(p: Project) {
  if (p.charges.some(c => c.phase === "builder" && c.status === "ok") && p.spec) return "Based on previous builder calls. Review and repair may cost more.";
  return p.historicalBuildAverageMicros !== undefined
    ? "Historical average of previous builds in this workspace. Actual cost may differ."
    : `No build history yet. Your $${((p.generation?.budgetMicros ?? p.budgetMicros) / 1e6).toFixed(2)} spending cap applies. This does not block building.`;
}
