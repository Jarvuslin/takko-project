import { expect, it } from "vitest";
import { replayPostPlan, savedReplay } from "./post-plan-replay.fixture";
import { buildAssetNeeds } from "../src/marketplace/approved-adapter";
import type { Bundle } from "../src/generation/schema";
import { bundleSchema } from "../src/generation/schema";
import { retainAssetGaps } from "../src/generation/asset-gaps";

const run = "animation-selection";
it("many failed dependencies still produce a schema-valid artifact with full reasons retained in the pipeline", () => {
  const p = savedReplay(run);
  const need = p.assetPipeline!.needs[0];
  p.assetPipeline!.status = "passed";
  p.assetPipeline!.needs = Array.from({ length: 16 }, (_, i) => ({
    ...need,
    id: "asset" + i,
    role: "Role ".repeat(200),
    required: false,
  }));
  p.assetPipeline!.entries = p.assetPipeline!.needs.map((n) => ({
    needId: n.id,
    status: "failed",
    attempts: 1,
    reason: "Failure detail ".repeat(130),
  }));
  const before = structuredClone(p.assetPipeline);
  const bundle = retainAssetGaps(p, {
    files: [],
    scene: [],
    assets: [],
    coverage: [],
  });
  expect(() => bundleSchema.parse(bundle)).not.toThrow();
  expect(p.assetPipeline).toEqual(before);
});
it("still halts before coding when native import effects are unknown", async () => {
  const r = await replayPostPlan(run, { studioFailure: true });
  try {
    expect(r.dispatched).toBe(false);
    expect(r.project.assetPipeline?.requiresReconciliation).toBe(true);
    expect(r.project.stage).toBe("failed");
  } finally {
    r.dispose();
  }
});
it("approval permits acquisition gaps without weakening the real required specification", () => {
  const p = savedReplay(run),
    before = structuredClone(p);
  expect(buildAssetNeeds(p).every((n) => !n.required)).toBe(true);
  expect(p).toEqual(before);
});

it("the preserved rejected approved asset completes coding with blocked coverage and retains other assets", async () => {
  let dispatched = false;
  const r = await replayPostPlan(run, {
    rejectSavedAsset: true,
    realComponentRejection: true,
    backend: {
      preflight() {},
      async run(job) {
        dispatched = true;
        const tool = async (name: string, args = {}) => {
          const t = job.tools.find((t) => t.name === name)!;
          return t.execute(t.schema.parse(args));
        };
        const manifest: any = await tool("manifest");
        expect(manifest.unmetAssetRequirements.length).toBeGreaterThan(0);
        while (
          job.project.completedBuildTasks!.length <
          job.project.spec!.tasks.length
        ) {
          const task = job.project.spec!.tasks.find(
            (t) =>
              !job.project.completedBuildTasks!.includes(t.id) &&
              t.dependsOn.every((id) =>
                job.project.completedBuildTasks!.includes(id),
              ),
          )!;
          await tool("task_context", { taskId: task.id });
          const node = `Workspace/${job.project.scope}/Offline_${task.id}`;
          const patch: Bundle = {
            files: task.files.map((path) => ({
              path,
              kind: path.endsWith(".server.luau")
                ? "Script"
                : path.endsWith(".client.luau")
                  ? "LocalScript"
                  : "ModuleScript",
              source: "return { offline = true }",
            })),
            scene: task.files.length
              ? []
              : [{ path: node, className: "Folder", properties: {} }],
            // Deliberately overclaims, to test host enforcement of the known gap.
            coverage: task.requirements.map((requirementId) => ({
              requirementId,
              status: "implemented",
              detail: "Synthetic model claim, not gameplay evidence",
              files: task.files.length ? task.files : [node],
            })),
            assets: [],
          };
          await tool("submit_task", { taskId: task.id, patch });
        }
      },
    },
  });
  try {
    expect(dispatched, r.project.error ?? JSON.stringify(r.effects)).toBe(true);
    expect(r.project.stage, r.project.error ?? "").toBe("ready_to_test");
    expect(r.project.artifact!.files).toHaveLength(5);
    const failed = r.original.assetPipeline!.entries.find(
      (e) => e.status === "failed",
    )!;
    const need = r.original.assetPipeline!.needs.find(
      (n) => n.id === failed.needId,
    )!;
    expect(
      r.project.artifact!.coverage.find(
        (c) => c.requirementId === need.requirementId,
      )?.status,
    ).toBe("blocked");
    expect(
      r.project.checks.find((c) => c.id === "coverage:" + need.requirementId)
        ?.status,
    ).toBe("pending");
    expect(
      r.project.spec!.requirements.find((q) => q.id === need.requirementId)
        ?.priority,
    ).toBe("required");
    expect(
      r.project.assetPipeline!.entries.filter((e) => e.status === "passed"),
    ).toHaveLength(2); // Native acceptance is separate from unverified audible fit.
    expect(
      r.project.assetPipeline!.entries.some(
        (e) =>
          r.project.assetPipeline!.needs.find((n) => n.id === e.needId)
            ?.kind === "Audio" && e.status === "passed",
      ),
    ).toBe(true);
    expect(
      r.project.assetPipeline!.events.some(
        (e) => e.step === "approval_limitation",
      ),
    ).toBe(true);
    expect(
      r.project.assetPipeline!.events.some(
        (e) => e.step === "candidate_rejected",
      ),
    ).toBe(true);
    expect(r.project.charges.slice(0, r.original.charges.length)).toEqual(
      r.original.charges,
    );
    expect(r.project.generation).toEqual(r.original.generation);
    expect(r.project.assetDiscovery).toEqual(r.original.assetDiscovery);
    for (const task of [
      "component-source-review",
      "component-adaptation",
      "asset-selection",
    ]) {
      const input = JSON.parse(
        r.requests.find((r) => r.input.includes('"' + task + '"'))!.input,
      );
      expect(input.selectedClip).toMatchObject({
        key: "1/1/18/1",
        instanceIndex: 149,
        resolution: "captured",
      });
      expect(
        input.animationCapabilityContract.rawKeyframeSequence.studioPlayback,
      ).toBe("native_probe_passed");
    }
  } finally {
    r.dispose();
  }
});
