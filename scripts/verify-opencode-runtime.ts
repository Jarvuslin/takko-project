// Offline protocol smoke: a real pinned CLI, real loopback MCP, scripted inference only.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
import { z } from "zod";
import { createOpenCodeBackend } from "../src/generation/opencode-runtime";
import { GenerationStore, newProject } from "../src/generation/store";
import { profile } from "../tests/generation-fixtures";

const directory = fs.mkdtempSync(
  path.join(os.tmpdir(), "takko-opencode-offline-"),
);
const store = new GenerationStore(directory);
const project = newProject("Offline protocol verification only", 1000000);
project.executionMode = "opencode";
project.jobId = "offline-protocol";
store.save(project);
let committed = false;
let calls = 0;
const requests: unknown[] = [];
const backend = createOpenCodeBackend(
  path.resolve(process.argv[2] ?? ".forge/tools/opencode-1.18.31/opencode.exe"),
);
try {
  await backend.run({
    project,
    store,
    phase: "builder",
    profile: { ...profile(), model: "anthropic/claude-sonnet-5" },
    key: "synthetic-host-credential",
    signal: AbortSignal.timeout(120000),
    transport: async (_url, init) => {
      calls++;
      assert.equal(
        (init!.headers as Record<string, string>).Authorization,
        "Bearer synthetic-host-credential",
      );
      const body = JSON.parse(String(init!.body));
      requests.push(body);
      const hasTool = body.tools?.some(
        (t: any) => t.function?.name === "takko_checkpoint",
      );
      const callTool = hasTool && !committed;
      const message = callTool
        ? {
            role: "assistant",
            content: null,
            tool_calls: [
              {
                id: "call_checkpoint",
                type: "function",
                function: {
                  name: "takko_checkpoint",
                  arguments: '{"value":"saved"}',
                },
              },
            ],
          }
        : { role: "assistant", content: "Completed the offline checkpoint." };
      const usage = { prompt_tokens: 100, completion_tokens: 20, cost: 0.0001 };
      const base = { id: "offline-" + calls, model: "fixture", created: 1 };
      if (!body.stream)
        return Response.json({
          ...base,
          object: "chat.completion",
          choices: [
            {
              index: 0,
              message,
              finish_reason: callTool ? "tool_calls" : "stop",
            },
          ],
          usage,
        });
      const delta = callTool
        ? {
            ...message,
            tool_calls: message.tool_calls!.map((tool, index) => ({
              index,
              ...tool,
            })),
          }
        : message;
      const chunks = [
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
              finish_reason: callTool ? "tool_calls" : "stop",
            },
          ],
          usage,
        },
      ];
      return new Response(
        chunks
          .map((chunk) => "data: " + JSON.stringify(chunk) + "\n\n")
          .join("") + "data: [DONE]\n\n",
        { headers: { "Content-Type": "text/event-stream" } },
      );
    },
    tools: [
      {
        name: "checkpoint",
        description: "Save the offline checkpoint",
        schema: z.object({ value: z.literal("saved") }).strict(),
        execute: () => {
          committed = true;
          return { saved: true };
        },
      },
    ],
    prompt: "Call checkpoint with value saved, then finish.",
    finished: () => committed,
    progress: () => String(committed),
  });
  assert.equal(committed, true);
  assert.ok(calls >= 2);
  assert.equal(project.charges.length, calls);
  assert.ok(
    project.charges.every(
      (charge) => charge.chargedMicros === 100 && !charge.estimated,
    ),
  );
  assert.equal(project.reservedMicros, 0);
  assert.equal(project.opencodeRuns![0].status, "completed");
  assert.ok(project.opencodeRuns![0].sessionIds.length > 0);
  assert.ok(!JSON.stringify(project).includes("synthetic-host-credential"));
  assert.ok(
    JSON.stringify(requests).includes('"cache_control":{"type":"ephemeral"}'),
    "Claude cache markers must survive runtime serialization and the gateway",
  );
  assert.ok(
    requests.every((value: any) => value.model === "anthropic/claude-sonnet-5"),
  );
  assert.ok(
    requests.every((value: any) =>
      value.tools.every((tool: any) =>
        ["takko_checkpoint", "takko_read_output"].includes(tool.function.name),
      ),
    ),
    "No shell, filesystem or delegation tools may be exposed",
  );
  console.log(
    JSON.stringify(
      {
        passed: true,
        assertions: 11,
        providerCalls: calls,
        simulatedChargeMicros: calls * 100,
        actualPaidCost: 0,
        directory,
        run: project.opencodeRuns![0],
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(
    JSON.stringify(
      {
        passed: false,
        error: String(error),
        directory,
        run: project.opencodeRuns?.[0],
        calls,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
} finally {
  fs.writeFileSync(
    path.join(directory, "scripted-requests.json"),
    JSON.stringify(requests, null, 2),
  );
}
