import { expect, it } from "vitest";
import {
  minimalReuseCorrection,
  replayPostPlan,
  replayRuns,
  savedReplay,
} from "./post-plan-replay.fixture";
import { bindProposalPlan } from "../src/generation/proposal";
import { validateImplementationPlan } from "../src/generation/plan-validation";
import { affectedTasks } from "../src/generation/proposal";

for (const run of replayRuns)
  it(`replays ${run} through real post-plan orchestration and correction to OpenCode dispatch`, async () => {
    const r = await replayPostPlan(run, {
      correction: run.includes("minimal") ? minimalReuseCorrection : undefined,
    });
    try {
      expect(
        r.dispatched,
        JSON.stringify({
          error: r.project.error,
          effects: r.effects,
          assetEvents: r.project.assetPipeline?.events.filter((e) =>
            /reject|fail/.test(e.step),
          ),
          events: r.project.events.slice(-5),
        }),
      ).toBe(true);
      expect(r.project.assetPipeline?.status).toBe("passed");
      expect(r.project.assetPipeline?.entries).toHaveLength(
        r.original.spec!.assetNeeds!.length,
      );
      expect(r.plannerCalls).toBe(run.includes("minimal") ? 2 : 1);
      expect(r.project.charges.slice(0, r.original.charges.length)).toEqual(
        r.original.charges,
      );
      expect(r.project.generation).toEqual(r.original.generation);
      expect(r.project.assetAttachments).toEqual(r.original.assetAttachments);
      expect(r.project.assetDiscovery).toEqual(r.original.assetDiscovery);
      if (run.includes("minimal"))
        expect(r.requests[1].input).toMatch(/proposal:theme/);
    } finally {
      r.dispose();
    }
  });
it("does not accept arbitrary section tags as missing source coverage", () => {
  const p = savedReplay(replayRuns[1]);
  p.spec!.tasks[0].proposalSections!.push("theme");
  expect(() => bindProposalPlan(p)).toThrow(/proposal:theme/);
});
it("derives dependencies from requirement provenance without requiring duplicate task tags", () => {
  const p = savedReplay(replayRuns[0]);
  for (const t of p.spec!.tasks) delete t.proposalSections;
  expect(() => bindProposalPlan(p)).not.toThrow();
  for (const task of p.spec!.tasks)
    for (const id of task.requirements) {
      const source = p.spec!.requirements.find((r) => r.id === id)!.sourceId;
      if (source?.startsWith("proposal:"))
        expect(p.proposalPlan!.tasks[task.id].sections).toContain(
          source.slice(9),
        );
    }
});
it("corrects structured approved-reference binding inside planning before any Studio effect", async () => {
  const p = savedReplay(replayRuns[0]),
    broken = structuredClone(p.spec!);
  broken.assetNeeds![0].role = "Unrelated decorative object";
  broken.assetNeeds![0].query = "unrelated decorative object";
  const r = await replayPostPlan(replayRuns[0], {
    plan: broken,
    correction: () => p.spec!,
  });
  try {
    expect(r.dispatched, r.project.error ?? "").toBe(true);
    expect(r.plannerCalls).toBe(2);
    expect(r.requests[1].input).toMatch(/linked requirement|asset need/i);
  } finally {
    r.dispose();
  }
});
it("retains the previous plan and all historical spending when correction is exhausted", async () => {
  const r = await replayPostPlan(replayRuns[1], { maxAttempts: 1 });
  try {
    expect(r.project.error).toMatch(/proposal:theme/);
    expect(r.project.spec).toBeNull();
    expect(r.effects).toEqual([]);
    expect({ ...r.project.proposal, approval: undefined }).toEqual({
      ...r.original.proposal,
      approval: undefined,
    });
    expect(r.project.charges.slice(0, r.original.charges.length)).toEqual(
      r.original.charges,
    );
    expect(r.project.reservedMicros).toBe(0);
  } finally {
    r.dispose();
  }
});
for (const section of ["mechanics", "theme", "environment"] as const)
  it(`rejects missing ${section} provenance even if every task stamps that section`, () => {
    const p = savedReplay(replayRuns[0]);
    for (const r of p.spec!.requirements)
      if (r.sourceId === `proposal:${section}`) {
        r.origin = "inferred";
        delete r.sourceId;
        r.sourceQuote = "";
      }
    for (const task of p.spec!.tasks)
      task.proposalSections = ["mechanics", "theme", "environment", "assets"];
    expect(() => validateImplementationPlan(p.spec!, p)).toThrow(
      `proposal:${section}`,
    );
  });
it("derives edit invalidation from provenance and shared requirement ownership", () => {
  const p = savedReplay(replayRuns[1]);
  p.spec = minimalReuseCorrection(p.spec!);
  for (const task of p.spec.tasks) delete task.proposalSections;
  bindProposalPlan(p);
  p.proposal!.changed = ["theme"];
  expect(affectedTasks(p)).toContain("sceneEnvironment");
  expect(affectedTasks(p)).toContain("dummyPlacement");
  expect(p.proposalPlan!.tasks.soundAssetDiscovery.sections).not.toContain(
    "theme",
  );
  // The real plan shares broad requirements across tasks. Its dependency closure
  // legitimately reaches sound too, even though sound has no direct theme source.
  expect(affectedTasks(p)).toContain("soundAssetDiscovery");
});
it("reports external Studio failure without treating it as a correctable planner defect", async () => {
  const r = await replayPostPlan(replayRuns[0], { studioFailure: true });
  try {
    expect(r.dispatched).toBe(false);
    expect(r.plannerCalls).toBe(1);
    expect(r.project.error).toMatch(/Studio unavailable/);
    expect(r.effects.filter((e) => e.startsWith("inspect:"))).toHaveLength(1);
  } finally {
    r.dispose();
  }
});
it("retains an existing saved plan when replacement validation fails", async () => {
  const original = savedReplay(replayRuns[1]);
  const r = await replayPostPlan(replayRuns[1], {
    maxAttempts: 1,
    mutateProject: (p) => {
      p.spec = structuredClone(original.spec);
    },
  });
  try {
    expect(r.project.error).toMatch(/proposal:theme/);
    expect(r.project.spec).toEqual(original.spec);
    expect(r.effects).toEqual([]);
  } finally {
    r.dispose();
  }
});
it("enforces cumulative budget admission before replay inference or Studio effects", async () => {
  const r = await replayPostPlan(replayRuns[0], {
    mutateProject: (p) => {
      p.generation!.budgetMicros =
        p.charges
          .slice(p.generation!.chargeStart)
          .reduce((n, c) => n + c.chargedMicros, 0) + 1000;
    },
  });
  try {
    expect(r.plannerCalls).toBe(0);
    expect(r.dispatched).toBe(false);
    expect(r.project.error).toMatch(/budget/i);
    expect(r.project.charges).toEqual(r.original.charges);
  } finally {
    r.dispose();
  }
});
