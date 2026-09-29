import { afterEach, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Engine } from "../src/generation/engine";
import { coordinationInputHash } from "../src/generation/coordinator";
import { Configuration } from "../src/generation/settings";
import { GenerationStore, newProject } from "../src/generation/store";
import { profile } from "./generation-fixtures";

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0))
    fs.rmSync(directory, { recursive: true, force: true });
});

const reply = (value: unknown) => Response.json({
  choices: [{ finish_reason: "stop", message: { content: JSON.stringify(value) } }],
  usage: { prompt_tokens: 50, completion_tokens: 50 },
});

it("reserves global review capacity for every required requirement", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "takko-review-capacity-"));
  directories.push(directory);
  const config = new Configuration(path.join(directory, "config"));
  const model = profile();
  config.save({
    profiles: [model],
    routes: { planner: [model.id], builder: [model.id], reviewer: [model.id], repair: [model.id] },
    budgetMicros: 2_000_000,
    generationBudgetMicros: 2_000_000,
    repairLimit: 1,
  });
  const store = new GenerationStore(directory);
  const project = newProject("Build a systems game with forty separately reviewable behaviors.", 2_000_000);
  const requirements = Array.from({ length: 40 }, (_, index) => ({
    id: `req_${String(index).padStart(2, "0")}`,
    description: `Observable behavior ${index}`,
    sourceId: "request",
    sourceQuote: project.request,
    origin: "user" as const,
    category: "mechanic" as const,
    priority: index === 39 ? "optional" as const : "required" as const,
    acceptance: `Behavior ${index} exposes its state.`,
  }));
  const evidencePath = `Workspace/${project.scope}/Evidence`;
  project.spec = {
    title: "Systems Review",
    summary: "Forty independently reviewable behaviors.",
    visualDirection: "Readable state.",
    questions: [],
    requirements,
    tasks: requirements.map((requirement) => ({
      id: `task_${requirement.id}`,
      title: `Implement ${requirement.id}`,
      requirements: [requirement.id],
      dependsOn: [],
      files: [],
    })),
  };
  project.executionMode = "coordinator";
  project.approvedRevision = project.revision;
  project.stage = "failed";
  project.artifact = {
    files: [],
    scene: [{ path: evidencePath, className: "Part", properties: { Anchored: true } }],
    coverage: requirements.map((requirement) => ({
      requirementId: requirement.id,
      status: "implemented" as const,
      detail: "Shared fixture exposes this behavior.",
      files: [evidencePath],
    })),
    assets: [],
  };
  project.completedBuildTasks = project.spec.tasks.map((task) => task.id);
  project.coordination = {
    version: 1,
    revision: project.revision,
    inputHash: coordinationInputHash(project),
    areas: {},
    workers: [],
    decisions: 0,
    repairs: 0,
    status: "executing",
  };
  store.save(project);

  const capacities: { requirementId: string; available: number; emitted: number }[] = [];
  const transport: typeof fetch = (async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    const phase = /PHASE: (\w+)/.exec(body.messages[0].content)![1];
    const context = JSON.parse(body.messages[1].content.split("\nYour last response failed validation.")[0]);
    if (phase === "planner")
      return reply(context.coordination.currentReview
        ? { action: "finish" }
        : { action: "review", objective: "Review every requirement within the protected catalog limit" });
    if (phase !== "reviewer") throw Error(`Unexpected phase ${phase}`);
    const requirement = context.spec.requirements[0];
    const emitted = requirement.priority === "required"
      ? Math.min(2, context.availableNewTestSlots)
      : 0;
    capacities.push({
      requirementId: requirement.id,
      available: context.availableNewTestSlots,
      emitted,
    });
    return reply({
      issues: [],
      tests: Array.from({ length: emitted }, (_, index) => ({
        id: `${requirement.id}_test_${index}`,
        requirementId: requirement.id,
        mode: "server",
        source: `return function(ctx) assert(ctx.scope ~= nil, "${requirement.id} observable") end`,
      })),
    });
  }) as typeof fetch;
  const engine = new Engine(store, config, transport, async () => [], undefined, { coordinated: true });
  engine.start(project.id, project.revision, "repair");
  const finished = await engine.wait(project.id);

  expect(finished.stage, finished.error ?? JSON.stringify(finished.checks)).toBe("ready_to_test");
  expect(capacities).toHaveLength(40);
  expect(capacities[0]).toMatchObject({ available: 2, emitted: 2 });
  expect(capacities.at(-1)).toMatchObject({ requirementId: "req_39", available: 0, emitted: 0 });
  const catalog = finished.review!.tests;
  expect(catalog).toHaveLength(40);
  expect(new Set(catalog.map((test) => test.id)).size).toBe(40);
  for (const requirement of requirements.filter((entry) => entry.priority === "required"))
    expect(catalog.some((test) => test.requirementId === requirement.id)).toBe(true);
  expect(catalog.some((test) => test.requirementId === "req_39")).toBe(false);
});
