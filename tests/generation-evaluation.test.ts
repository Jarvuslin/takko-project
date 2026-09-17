import { afterEach, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Configuration } from "../src/generation/settings";
import { profile } from "./generation-fixtures";
import {
  evaluateGeneration,
  generationModels,
  generationPrompt,
  generationSpecification,
} from "../scripts/evaluate-generation";
import type { compileSources } from "../src/generation/validation";
const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0)) {
    if (
      !path
        .resolve(directory)
        .startsWith(path.resolve(os.tmpdir()) + path.sep) ||
      !path.basename(directory).startsWith("forge-evaluation-")
    )
      throw Error("Unexpected cleanup directory");
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
function setup() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "forge-evaluation-"));
  directories.push(directory);
  const source = new Configuration(path.join(directory, "source"));
  const model = profile("openrouter");
  model.baseUrl = "https://openrouter.ai/api/v1";
  source.save({
    profiles: [model],
    routes: {
      planner: [model.id],
      builder: [model.id],
      reviewer: [model.id],
      repair: [model.id],
    },
    budgetMicros: 2e6,
    repairLimit: 1,
  });
  source.setKey(model.id, "secret-test-session-key");
  return { source, directory, output: path.join(directory, "evaluation") };
}
const compiler: typeof compileSources = async (bundle, tests = []) =>
  [
    ...bundle.files.map((file) => file.path),
    ...tests.map((test) => test.id),
  ].map((id) => ({
    id: "compile:" + id,
    status: "passed",
    detail: "Offline compiler fixture",
  }));
function mockTransport(
  options: {
    brokenModel?: string;
    pricing?: Record<string, unknown>;
    observe?: (model: string, phase: string, context: any) => void;
  } = {},
): typeof fetch {
  return (async (url, init) => {
    if (String(url).endsWith("/models"))
      return Response.json({
        data: generationModels.map((id) => ({
          id,
          name: id,
          pricing: options.pricing ?? {
            prompt: "0.00000001",
            completion: "0.00000001",
          },
          top_provider: { max_completion_tokens: 16000 },
        })),
      });
    const body = JSON.parse(String(init?.body));
    const phase = /PHASE: (\w+)/.exec(body.messages[0].content)![1];
    const context = JSON.parse(
      body.messages[1].content.split(
        "\nYour last response failed validation.",
      )[0],
    );
    options.observe?.(body.model, phase, context);
    let result: unknown;
    if (body.model === options.brokenModel && phase === "builder")
      result = { invalid: true };
    else if (phase === "reviewer")
      result = {
        issues: [],
        tests: context.spec.requirements.map((requirement: any) => ({
          id: requirement.id + "Test",
          requirementId: requirement.id,
          mode: "server",
          source: "return function(ctx) assert(ctx.scope) end",
        })),
      };
    else {
      const task = context.task;
      const files = (task?.files ?? []).map((file: string) => ({
        path: file,
        kind: file.endsWith(".server.luau")
          ? "Script"
          : file.endsWith(".client.luau")
            ? "LocalScript"
            : "ModuleScript",
        source: file.endsWith(".module.luau")
          ? "return {}"
          : "local fixture = true",
      }));
      result = {
        files,
        scene: [],
        assets: [],
        coverage: (task?.requirements ?? []).map((id: string) => ({
          requirementId: id,
          status: "implemented",
          detail: "Offline contract fixture only",
          files: files.map((file: any) => file.path),
        })),
      };
    }
    return Response.json({
      choices: [
        { finish_reason: "stop", message: { content: JSON.stringify(result) } },
      ],
      usage: { prompt_tokens: 100, completion_tokens: 100, cost: 0.000002 },
    });
  }) as typeof fetch;
}
it("runs real build/review orchestration with a shared approved spec and fixed reviewer while preserving source configuration", async () => {
  const { source, output } = setup();
  const original = source.read();
  const calls: { model: string; phase: string; spec: unknown }[] = [];
  const report = await evaluateGeneration(source, output, {
    transport: mockTransport({
      observe: (model, phase, c) => calls.push({ model, phase, spec: c.spec }),
    }),
    compiler,
  });
  expect(report.results).toHaveLength(4);
  expect(
    report.results.every(
      (result) =>
        result.stage === "ready_to_test" &&
        result.nativeVerification === "not_run",
    ),
  ).toBe(true);
  expect(calls).toHaveLength(12);
  expect(
    calls.every(
      (call) => call.phase === "builder" || call.phase === "reviewer",
    ),
  ).toBe(true);
  expect(
    calls
      .filter((call) => call.phase === "reviewer")
      .every((call) => call.model === "openai/gpt-5.6-sol"),
  ).toBe(true);
  expect(new Set(calls.map((call) => JSON.stringify(call.spec))).size).toBe(1);
  expect(source.read()).toEqual(original);
  expect(report.reservedMicros).toBeLessThanOrEqual(report.aggregateCapMicros);
  expect(
    JSON.parse(fs.readFileSync(path.join(output, "progress.json"), "utf8"))
      .results,
  ).toHaveLength(4);
  const files = fs
    .readdirSync(output, { recursive: true })
    .map(String)
    .filter((file) => fs.statSync(path.join(output, file)).isFile());
  expect(files.some((file) => file.endsWith(".events.jsonl"))).toBe(true);
  for (const file of files)
    expect(fs.readFileSync(path.join(output, file), "utf8")).not.toContain(
      "secret-test-session-key",
    );
  await expect(evaluateGeneration(source, output)).rejects.toThrow(
    "fresh output",
  );
});
it("preserves failed model artifacts and attempts then continues to another candidate", async () => {
  const { source, output } = setup();
  const report = await evaluateGeneration(source, output, {
    models: generationModels.slice(0, 2),
    transport: mockTransport({ brokenModel: generationModels[0] }),
    compiler,
  });
  expect(report.results[0]).toMatchObject({
    stage: "failed",
    completedBuildTasks: [],
    nativeVerification: "not_run",
  });
  expect(report.results[1]).toMatchObject({ stage: "ready_to_test" });
  const projectId = String(report.results[0].projectId);
  const trace = fs.readFileSync(
    path.join(output, "trial-1/projects/traces", projectId + ".events.jsonl"),
    "utf8",
  );
  expect(trace).toContain("invalid");
  expect(trace.trim().split("\n")).toHaveLength(2);
});
it("reserves request fees before network dispatch and records local budget rejection as zero cost", async () => {
  const { source, output } = setup();
  let paidCalls = 0;
  const report = await evaluateGeneration(source, output, {
    aggregateCapMicros: 1000,
    models: [generationModels[0]],
    reviewerModel: generationModels[0],
    transport: mockTransport({
      pricing: { prompt: "0", completion: "0", request: "1" },
      observe: () => paidCalls++,
    }),
    compiler,
  });
  expect(paidCalls).toBe(0);
  expect(report.reservedMicros).toBe(0);
  expect(report.chargedMicros).toBe(0);
  expect(report.results[0]).toMatchObject({
    stage: "failed",
    budgetSkipped: true,
  });
});
it("uses the highest listed price override for reservations, refuses missing models and enforces fresh directories", async () => {
  const { source, output, directory } = setup();
  let calls = 0;
  const report = await evaluateGeneration(source, output, {
    aggregateCapMicros: 1000,
    models: [generationModels[0]],
    reviewerModel: generationModels[0],
    transport: mockTransport({
      pricing: {
        prompt: "0",
        completion: "0",
        overrides: [{ prompt: "0.001", completion: "0.001" }],
      },
      observe: () => calls++,
    }),
    compiler,
  });
  expect(calls).toBe(0);
  expect(report.results[0]).toMatchObject({ budgetSkipped: true });
  await expect(
    evaluateGeneration(source, path.join(directory, "missing"), {
      models: ["missing/model"],
      transport: mockTransport(),
    }),
  ).rejects.toThrow("unavailable");
  expect(fs.existsSync(path.join(directory, "missing"))).toBe(false);
  await expect(
    evaluateGeneration(source, path.join(directory, "overspend"), {
      aggregateCapMicros: 5000001,
    }),
  ).rejects.toThrow("$5");
});
it("fixed test specification identifies shared contract and supported interaction paths", () => {
  const spec = generationSpecification("Forge_GenerationPilot");
  expect(spec.tasks[1].dependsOn).toEqual(["server"]);
  expect(spec.summary).toContain("CollectSellHUD");
  expect(spec.summary).toContain("'collect' or 'sell'");
  expect(spec.summary).toContain("INTERACT_DISTANCE=10");
  expect(spec.requirements).toHaveLength(3);
});
it("runs an explicitly supplied authored scenario and forwards scoped design guidance", async () => {
  const { source, output } = setup();
  const prompt = generationPrompt + " Use a coordinated crystal-quarry theme.";
  const phases: string[] = [];
  const report = await evaluateGeneration(source, output, {
    models: [generationModels[0]],
    reviewerModel: generationModels[0],
    scenario: {
      prompt,
      specification: (scope) => ({
        ...generationSpecification(scope),
        title: "Themed collection scenario",
        visualDirection: "Teal crystals and warm gold stations",
      }),
    },
    transport: mockTransport({
      observe: (_model, phase, context) => {
        phases.push(phase);
        expect(context.request).toBe(prompt);
        expect(context.spec.title).toBe("Themed collection scenario");
        expect(context.designGuidance).toBeDefined();
        if (phase === "builder")
          expect(context.outputContract.requirementIds).toEqual(
            context.task.requirements,
          );
      },
    }),
    compiler,
  });
  expect(report.prompt).toBe(prompt);
  expect(report.specification.title).toBe("Themed collection scenario");
  expect(report.results[0]).toMatchObject({
    stage: "ready_to_test",
    nativeVerification: "not_run",
  });
  expect(phases).toContain("reviewer");
});
