// No keys, vault, network provider, Studio or actual game compilation. Real pinned CLI + host MCP.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  createOpenCodeBackend,
  type OpenCodeJob,
} from "../src/generation/opencode-runtime";
import {
  replayPostPlan,
  replayRuns,
  minimalReuseCorrection,
} from "../tests/post-plan-replay.fixture";
import type { Bundle } from "../src/generation/schema";
import { checkWorldScene } from "../src/generation/world-scene-check";
import { scopeQuestions } from "../src/generation/scope-questions";
import { newProject } from "../src/generation/store";
const output = path.resolve(
  process.argv[2] ?? "docs/results/post-plan-replay-20260925/runtime",
);
if (fs.existsSync(output))
  throw Error(
    "Choose a new evidence directory. Existing replays are preserved.",
  );
fs.mkdirSync(output, { recursive: true });
const runtime = createOpenCodeBackend(
  path.resolve(".forge/tools/opencode-1.18.31/opencode.exe"),
);
runtime.preflight();
let failed = false;
const cases = [...replayRuns, "opencode-step3-live-20260925"] as const;
for (const run of cases) {
  const snapshots = cases.map((name) => {
    const file = `docs/results/${name}/terminal-project.json`;
    return {
      file,
      sha: createHash("sha256").update(fs.readFileSync(file)).digest("hex"),
    };
  });
  let job: OpenCodeJob,
    manifest = false,
    context: any,
    calls = 0;
  const trace: any[] = [];
  const result = await replayPostPlan(run, {
    rejectSavedAsset: run === "opencode-step3-live-20260925",
    realComponentRejection: run === "opencode-step3-live-20260925",
    correction: run.includes("minimal") ? minimalReuseCorrection : undefined,
    backend: {
      preflight: runtime.preflight,
      async run(value) {
        job = value;
        await runtime.run({
          ...value,
          signal: AbortSignal.any([value.signal, AbortSignal.timeout(120000)]),
          tools: value.tools.map((tool) => ({
            ...tool,
            async execute(input, signal) {
              try {
                const result = await tool.execute(input, signal);
                trace.push({
                  at: new Date().toISOString(),
                  tool: tool.name,
                  input,
                  result,
                });
                if (tool.name === "manifest") manifest = true;
                if (tool.name === "task_context") {
                  context = result;
                  assert.equal(context.designGuidance.baseWorld, undefined);
                  assert.equal(context.existingProject.world, null);
                  assert.ok(Array.isArray(context.existingProject.currentScene));
                  assert.ok(context.designGuidance.scopePolicy.some((s: string) => s.includes("one Animation assetNeed per step")));
                }
                if (tool.name === "submit_task") context = undefined;
                return result;
              } catch (e) {
                trace.push({
                  at: new Date().toISOString(),
                  tool: tool.name,
                  error: String(e),
                });
                throw e;
              }
            },
          })),
        });
      },
    },
    transport: async (_url, init) => {
      calls++;
      if (calls > 40)
        throw Error("Offline fixture exhausted its own request bound");
      const request = JSON.parse(String(init?.body));
      let tool: string | undefined, args: unknown;
      if (!manifest) {
        tool = "manifest";
        args = {};
      } else {
        const p = job.project,
          next = p.spec!.tasks.find(
            (t) =>
              !p.completedBuildTasks?.includes(t.id) &&
              t.dependsOn.every((id) => p.completedBuildTasks?.includes(id)),
          );
        if (next) {
          if (!context) {
            tool = "task_context";
            args = { taskId: next.id };
          } else {
            // Consume the real host task_context output, not a handwritten equivalent.
            const task = context.task;
            assert.equal(task.id, next.id);
            const scenePath = `Workspace/${p.scope}/Replay_${task.id}`;
            const files: Bundle["files"] = task.files.map((file: string) => ({
              path: file,
              kind: file.endsWith(".server.luau")
                ? "Script"
                : file.endsWith(".client.luau")
                  ? "LocalScript"
                  : "ModuleScript",
              source:
                file.endsWith(".server.luau") || file.endsWith(".client.luau")
                  ? '-- Synthetic offline transport output, not game behavior.\nlocal marker = Instance.new("Folder")\nmarker.Name = "OfflineReplay"\nmarker.Parent = script\n'
                  : "-- Synthetic offline transport output, not game behavior.\nreturn { offlineReplay = true }\n",
            }));
            const patch: Bundle = {
              files,
              scene: files.length
                ? []
                : [
                    {
                      path: scenePath,
                      className: "Part",
                      properties: { Anchored: true },
                    },
                  ],
              coverage: task.requirements.map((id: string) => ({
                requirementId: id,
                status: "implemented",
                detail:
                  "Synthetic external model assertion for transport/contract replay only, not actual implementation evidence.",
                files: files.length ? files.map((f) => f.path) : [scenePath],
              })),
              assets: [],
            };
            tool = "submit_task";
            args = { taskId: task.id, patch };
          }
        }
      }
      const name = tool
        ? request.tools?.find((t: any) => t.function?.name === `takko_${tool}`)
            ?.function.name
        : undefined;
      if (tool && !name)
        throw Error("Runtime omitted allowlisted host tool " + tool);
      const message = tool
        ? {
            role: "assistant",
            content: null,
            tool_calls: [
              {
                id: "replay_" + calls,
                type: "function",
                function: { name, arguments: JSON.stringify(args) },
              },
            ],
          }
        : {
            role: "assistant",
            content:
              "Offline protocol replay complete. Synthetic code only. No gameplay claim.",
          };
      const usage = { prompt_tokens: 100, completion_tokens: 100, cost: 0 },
        base = { id: "offline-" + calls, model: "fixture", created: 1 };
      trace.push({
        at: new Date().toISOString(),
        inference: calls,
        tool,
        syntheticCost: 0,
      });
      if (!request.stream)
        return Response.json({
          ...base,
          object: "chat.completion",
          choices: [
            { index: 0, message, finish_reason: tool ? "tool_calls" : "stop" },
          ],
          usage,
        });
      const delta = tool
        ? {
            ...message,
            tool_calls: message.tool_calls!.map((t, index) => ({
              index,
              ...t,
            })),
          }
        : message;
      return new Response(
        [
          {
            ...base,
            object: "chat.completion.chunk",
            choices: [{ index: 0, delta, finish_reason: null }],
          },
          {
            ...base,
            object: "chat.completion.chunk",
            choices: [
              {
                index: 0,
                delta: {},
                finish_reason: tool ? "tool_calls" : "stop",
              },
            ],
            usage,
          },
        ]
          .map((c) => "data: " + JSON.stringify(c) + "\n\n")
          .join("") + "data: [DONE]\n\n",
        { headers: { "Content-Type": "text/event-stream" } },
      );
    },
  });
  fs.writeFileSync(
    path.join(output, run + ".json"),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        calls,
        directory: result.directory,
        project: result.project,
        effects: result.effects,
        trace,
      },
      null,
      2,
    ),
  );
  fs.cpSync(
    path.join(result.directory, "traces"),
    path.join(output, run + "-traces"),
    { recursive: true },
  );
  try {
    const historical = JSON.parse(fs.readFileSync("docs/results/approved-reference-finish-20260927/terminal-project.json", "utf8"));
    assert.equal(result.project.world, undefined, "Legacy replay must not gain an implicit template");
    const sceneFailures = checkWorldScene(historical.artifact, {...result.project,world:newProject(result.project.request,8000000).world}).filter(c=>c.status === "failed");
    // This preserved user's third request explicitly asks for a plain floor.
    // The two earlier requests do not. Preserve that difference in the replay.
    assert.equal(sceneFailures.some(c=>c.id.startsWith("world:ground:")), run !== "opencode-step3-live-20260925");
    assert.ok(sceneFailures.some(c=>c.id.startsWith("world:enclosure:")));
    assert.ok(sceneFailures.some(c=>c.id.startsWith("world:lights:")));
    const questions = scopeQuestions(result.original.proposal!.mechanics.assumptions, {...result.original, answers: {}});
    if (run === "opencode-minimal-fighting-20260925") assert.deepEqual(questions, []);
    else assert.ok(questions.some(q=>/combo|additional attack/i.test(q)));
    assert.equal(
      result.project.stage,
      "ready_to_test",
      result.project.error ?? "",
    );
    assert.equal(result.project.assetPipeline?.status, "passed");
    assert.equal(result.project.opencodeRuns?.length, 1);
    assert.equal(result.project.opencodeRuns![0].status, "completed");
    assert.equal(
      result.project.completedBuildTasks?.length,
      result.project.spec!.tasks.length,
    );
    assert.ok(result.project.artifact!.files.length > 0);
    if (run === "opencode-step3-live-20260925") {
      assert.ok(
        result.project.artifact!.coverage.some((c) => c.status === "blocked"),
      );
      assert.equal(
        result.project.assetPipeline!.entries.filter(
          (e) => e.status === "passed",
        ).length,
        2, // Approved native placement may continue while audible fit remains unverified.
      );
      assert.ok(
        result.project.assetPipeline!.events.some(
          (e) => e.step === "approval_limitation",
        ),
      );
      assert.ok(
        result.project.checks.some(
          (c) => c.id.startsWith("coverage:") && c.status === "pending",
        ),
      );
    }
    assert.equal(result.project.reservedMicros, 0);
    assert.deepEqual(result.project.generation, result.original.generation);
    assert.deepEqual(
      result.project.charges.slice(0, result.original.charges.length),
      result.original.charges,
    );
    assert.ok(
      result.project.charges
        .slice(result.original.charges.length)
        .every((c) => c.chargedMicros === 0),
    );
    for (const e of snapshots)
      assert.equal(
        createHash("sha256").update(fs.readFileSync(e.file)).digest("hex"),
        e.sha,
      );
    console.log(
      JSON.stringify({
        run,
        passed: true,
        plannerCalls: result.plannerCalls,
        runtimeCalls: calls,
        tasks: result.project.completedBuildTasks!.length,
        syntheticFiles: result.project.artifact!.files.length,
        actualCost: 0,
        legacyWorldPreserved: true,
        existingSceneContext: true,
        freshTemplateLightingGate: true,
        sceneGateRejectedHistoricalDefects: sceneFailures.map(c=>c.id),
        scopeQuestions: questions,
        evidenceBoundary: "Mock replay only. No real generation or gameplay.",
      }),
    );
  } catch (e) {
    failed = true;
    console.error(
      JSON.stringify({
        run,
        passed: false,
        error: String(e),
        stage: result.project.stage,
        calls,
        lastTrace: trace.slice(-2),
      }),
    );
  }
  // Retain temporary workspace paths for failure inspection. Never mutate the source projects.
}
if (failed) process.exitCode = 1;
