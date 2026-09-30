import { afterEach, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Engine } from "../src/generation/engine";
import { Configuration } from "../src/generation/settings";
import { GenerationStore } from "../src/generation/store";
import type {
  OpenCodeBackend,
  OpenCodeJob,
} from "../src/generation/opencode-runtime";
import {
  fakeTransport,
  fixtureBundle,
  fixtureReview,
  profile,
} from "./generation-fixtures";
import type { Bundle } from "../src/generation/schema";
import { OpenCodeGateway } from "../src/generation/opencode-gateway";
import { trialFinalReviewPolicy } from "../src/generation/review-budget";

const directories: string[] = [];
it("interrupts the real Engine before coding consumes review funds and retains its submitted checkpoint", async () => {
  let dispatches = 0;
  const ledger = JSON.parse(fs.readFileSync("docs/results/approved-reference-finish-20260927/ledger.json", "utf8"));
  const recorded = ledger.charges.filter((c: any) => c.opencodeRunId === "57c4993b-1165-4740-a7a0-b797074b19f7").map((c: any) => ({ ...c, chargedMicros: c.inputTokens * 2 + c.outputTokens * 10 }));
  const s = setup(async job => {
    const context = await tool(job, "task_context", { taskId: "coreTask" });
    await tool(job, "submit_task", { taskId: "coreTask", patch: patch(job) });
    // Repeat the preserved workload as a fixed no-cache budget stress scenario.
    job.project.charges.push(...structuredClone(recorded), ...structuredClone(recorded));
    const request = { messages: [{ role: "user", content: JSON.stringify(context) }] };
    const bytes = Buffer.byteLength(JSON.stringify({ ...request, model: job.profile.model, max_tokens: job.profile.maxOutputTokens, stream: false }));
    const reserve = (bytes + 1024) * job.profile.inputRate + job.profile.maxOutputTokens * job.profile.outputRate;
    expect(job.project.charges.reduce((sum, c) => sum + c.chargedMicros, 0) + reserve).toBeLessThan(7500000);
    const gateway = new OpenCodeGateway({ ...job, transport: async () => { dispatches++; throw Error("Unexpected provider dispatch"); } });
    await gateway.dispatch(request, async () => {});
  });
  const p = await plan(s);
  const settings = s.config.read();
  s.config.save({ ...settings, budgetMicros: 7500000, generationBudgetMicros: 7500000, profiles: settings.profiles.map(model => ({ ...model, inputRate: 2, outputRate: 10, maxOutputTokens: 8192 })) });
  const engine = new Engine(s.store, s.config, s.transport, s.compiler, undefined, { opencode: s.backend, finalReview: trialFinalReviewPolicy });
  engine.start(p.id, p.revision, "build", 7500000);
  const stopped = await engine.wait(p.id);
  expect(stopped.stage, stopped.error ?? "").toBe("interrupted");
  expect(stopped.failure?.code).toBe("REVIEW_BUDGET_STOP");
  expect(stopped.artifact!.files.length).toBeGreaterThan(0);
  expect(stopped.completedBuildTasks).toContain("coreTask");
  expect(stopped.protectedReview!.status).toBe("protected");
  expect(stopped.reservedMicros).toBe(0);
  expect(dispatches).toBe(0);
  expect(s.calls).not.toContain("reviewer");
});
it("pauses no-code spending before another provider dispatch and settles the real gateway receipt", async () => {
  let requests = 0;
  const s = setup(async job => {
    const gateway = new OpenCodeGateway({ ...job, profile: { ...job.profile, inputRate: 3, outputRate: 30, maxOutputTokens: 32768 }, transport: async () => {
      requests++;
      return Response.json({ choices: [{ message: { content: "Still considering" } }], usage: { prompt_tokens: 100, completion_tokens: 10, cost: 0.5 } });
    } });
    await gateway.dispatch({ messages: [{ role: "user", content: "Build" }] }, async () => {});
    await gateway.dispatch({ messages: [{ role: "user", content: "Continue" }] }, async () => {});
  });
  const p = await plan(s);
  s.engine.start(p.id, p.revision, "build");
  const stopped = await s.engine.wait(p.id);
  expect(requests).toBe(1);
  expect(stopped.stage, stopped.error ?? "").toBe("interrupted");
  expect(stopped.failure?.code).toBe("NO_CODE_SPENDING_STOP");
  expect(stopped.reservedMicros).toBe(0);
  expect(stopped.charges.at(-1)?.chargedMicros).toBe(500000);
});
afterEach(() =>
  directories
    .splice(0)
    .forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })),
);
function setup(
  run: OpenCodeBackend["run"],
  twoTasks = false,
  needsRepair = false,
) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-opencode-engine-"));
  directories.push(dir);
  const config = new Configuration(path.join(dir, "config"));
  const model = profile();
  config.save({
    profiles: [model],
    routes: {
      planner: [model.id],
      builder: [model.id],
      reviewer: [model.id],
      repair: [model.id],
    },
    budgetMicros: 2000000,
    generationBudgetMicros: 1800000,
    repairLimit: 1,
  });
  const calls: string[] = [];
  const base = fakeTransport({ inspect: (phase) => calls.push(phase) });
  const transport: typeof fetch = async (url, init) => {
    const response = await base(url, init);
    if (!twoTasks && !needsRepair) return response;
    const payload = await response.json();
    const value = JSON.parse(payload.choices[0].message.content);
    if (twoTasks && value.tasks) {
      value.requirements.push({
        ...value.requirements[0],
        id: "display",
        origin: "inferred",
        sourceQuote: "",
        description: "Show the current course progress",
      });
      value.tasks.push({
        id: "displayTask",
        title: "Show progress",
        requirements: ["display"],
        dependsOn: ["coreTask"],
        files: [
          value.tasks[0].files[0].replace("Game.server", "Progress.server"),
        ],
      });
    }
    if (twoTasks && value.tests)
      value.tests.push({
        ...fixtureReview.tests[0],
        id: "displayTest",
        requirementId: "display",
      });
    if (
      needsRepair &&
      value.tests &&
      calls.filter((phase) => phase === "reviewer").length === 1
    )
      value.issues = [
        {
          requirementId: "core",
          severity: "error",
          message: "Synthetic observable state failure",
        },
      ];
    payload.choices[0].message.content = JSON.stringify(value);
    return Response.json(payload);
  };
  const store = new GenerationStore(dir);
  const backend = { preflight() {}, run };
  const compiler = async () => [];
  const engine = new Engine(store, config, transport, compiler, undefined, {
    coordinated: true,
    opencode: backend,
  });
  return { engine, store, config, calls, backend, transport, compiler };
}
async function tool(job: OpenCodeJob, name: string, args: unknown = {}) {
  const tool = job.tools.find((tool) => tool.name === name)!;
  return tool.execute(tool.schema.parse(args));
}
async function plan(s: ReturnType<typeof setup>) {
  const p = s.engine.create("Create a wind-powered racing course");
  s.engine.start(p.id, p.revision, "plan");
  const planned = await s.engine.wait(p.id);
  expect(planned.stage, planned.error ?? "").toBe("review");
  s.engine.approve(p.id, planned.revision);
  return s.store.get(p.id);
}
function patch(job: OpenCodeJob, second = false): Bundle {
  const value = fixtureBundle(job.project.request, job.project.scope);
  if (second) {
    value.files[0].path = value.files[0].path.replace(
      "Game.server",
      "Progress.server",
    );
    value.scene = [];
    value.coverage[0].requirementId = "display";
    value.coverage[0].files = [value.files[0].path];
  }
  return value;
}

it("uses one compact plan and one OpenCode session for multiple dependency tasks, then one independent review", async () => {
  let sessions = 0;
  const s = setup(async (job) => {
    sessions++;
    await expect(
      tool(job, "task_context", { taskId: "displayTask" }),
    ).rejects.toThrow(/dependencies/i);
    await tool(job, "submit_task", { taskId: "coreTask", patch: patch(job) });
    const original = structuredClone(job.project.artifact);
    await expect(
      tool(job, "submit_task", { taskId: "coreTask", patch: patch(job) }),
    ).rejects.toThrow(/read-only/i);
    const bad = patch(job, true);
    bad.files[0].path = original!.files[0].path;
    await expect(
      tool(job, "submit_task", { taskId: "displayTask", patch: bad }),
    ).rejects.toThrow();
    expect(job.project.artifact).toEqual(original);
    await tool(job, "submit_task", {
      taskId: "displayTask",
      patch: patch(job, true),
    });
  }, true);
  const p = await plan(s);
  s.engine.start(p.id, p.revision, "build");
  const built = await s.engine.wait(p.id);
  expect(built.stage, built.error ?? "").toBe("ready_to_test");
  expect(built.completedBuildTasks).toEqual(["coreTask", "displayTask"]);
  expect(sessions).toBe(1);
  expect(s.calls).toEqual(["planner", "reviewer"]);
  expect(built.coordination).toBeUndefined();
  expect(built.checks.find((check) => check.id === "studio")?.status).toBe(
    "pending",
  );
});

it("retains validated files and original allowance after an interrupted session, then resumes only unfinished work", async () => {
  let sessions = 0;
  const s = setup(async (job) => {
    sessions++;
    if (sessions === 1) {
      await tool(job, "submit_task", { taskId: "coreTask", patch: patch(job) });
      throw Error("Synthetic runtime failure");
    }
    expect(job.project.completedBuildTasks).toEqual(["coreTask"]);
    await tool(job, "submit_task", {
      taskId: "displayTask",
      patch: patch(job, true),
    });
  }, true);
  const p = await plan(s);
  s.engine.start(p.id, p.revision, "build");
  const failed = await s.engine.wait(p.id);
  expect(failed.stage).toBe("failed");
  expect(failed.completedBuildTasks).toEqual(["coreTask"]);
  const oldFile = structuredClone(failed.artifact!.files[0]);
  const generation = structuredClone(failed.generation);
  const priorCharges = structuredClone(failed.charges);
  s.engine.start(p.id, p.revision, "repair");
  const resumed = await s.engine.wait(p.id);
  expect(resumed.stage, resumed.error ?? "").toBe("ready_to_test");
  expect(resumed.artifact!.files[0]).toEqual(oldFile);
  expect(resumed.generation).toEqual(generation);
  expect(resumed.charges.slice(0, priorCharges.length)).toEqual(priorCharges);
});

it("rejects late patches after cancellation without committing their files", async () => {
  let entered!: () => void;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const s = setup(async (job) => {
    entered();
    await pending;
    await tool(job, "submit_task", { taskId: "coreTask", patch: patch(job) });
  });
  const p = await plan(s);
  s.engine.start(p.id, p.revision, "build");
  await started;
  s.engine.cancel(p.id);
  release();
  const cancelled = await s.engine.wait(p.id);
  expect(cancelled.artifact?.files ?? []).toHaveLength(0);
  expect(cancelled.completedBuildTasks ?? []).toHaveLength(0);
});

it("never silently switches a saved coordinator project to OpenCode", async () => {
  let runs = 0;
  const s = setup(async () => {
    runs++;
  });
  const old = new Engine(
    s.store,
    s.config,
    s.transport,
    s.compiler,
    undefined,
    { coordinated: true },
  );
  const p = old.create("Create a wind-powered racing course");
  s.engine.start(p.id, p.revision, "plan");
  const planned = await s.engine.wait(p.id);
  expect(planned.executionMode).toBe("coordinator");
  expect(planned.coordination).toBeDefined();
  expect(runs).toBe(0);
});

it("fails before paid planning if the configured runtime cannot be verified", () => {
  const s = setup(async () => {});
  s.backend.preflight = () => {
    throw Error("Pinned runtime missing");
  };
  const p = s.engine.create("Build a wind-powered course");
  expect(() => s.engine.start(p.id, p.revision, "plan")).toThrow(
    /runtime missing/,
  );
  expect(s.calls).toHaveLength(0);
  expect(s.store.get(p.id).charges).toHaveLength(0);
});

it("repairs through OpenCode and re-reviews independently without changing protected tests", async () => {
  const phases: string[] = [];
  const s = setup(
    async (job) => {
      phases.push(job.phase);
      if (job.phase === "builder") {
        await tool(job, "submit_task", {
          taskId: "coreTask",
          patch: patch(job),
        });
        return;
      }
      const context: any = await tool(job, "repair_context");
      expect(context.protectedTests).toEqual(fixtureReview.tests);
      expect(
        context.failures.some((failure: any) =>
          failure.detail.includes("observable state"),
        ),
      ).toBe(true);
      const repair = patch(job);
      repair.files[0].source = repair.files[0].source.replace(
        "state.Value = 1",
        "state.Value = 2",
      );
      await expect(
        tool(job, "submit_repair", { ...repair, tests: [] }),
      ).rejects.toThrow();
      await tool(job, "submit_repair", repair);
    },
    false,
    true,
  );
  const p = await plan(s);
  s.engine.start(p.id, p.revision, "build");
  const repaired = await s.engine.wait(p.id);
  expect(repaired.stage, repaired.error ?? "").toBe("ready_to_test");
  expect(phases).toEqual(["builder", "repair"]);
  expect(s.calls).toEqual(["planner", "reviewer", "reviewer"]);
  expect(repaired.review!.tests).toEqual(fixtureReview.tests);
  expect(repaired.artifact!.files[0].source).toContain("state.Value = 2");
});

it("makes ordinary host-call reservations visible before an asynchronous policy hook can admit a helper", async () => {
  const s = setup(async () => {});
  let observed = 0;
  const engine = new Engine(
    s.store,
    s.config,
    s.transport,
    s.compiler,
    undefined,
    {
      opencode: s.backend,
      beforeDispatch: async () => {
        observed = s.store.list()[0].reservedMicros;
        throw Error("Synthetic dispatch denial");
      },
    },
  );
  const p = engine.create("Create a racing course");
  engine.start(p.id, p.revision, "plan");
  const stopped = await engine.wait(p.id);
  expect(observed).toBeGreaterThan(0);
  expect(stopped.reservedMicros).toBe(0);
  expect(stopped.charges).toHaveLength(0);
  expect(s.calls).toHaveLength(0);
});
