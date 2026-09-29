// No credentials or live provider transport. Original runtime and project are read-only.
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { z } from "zod";
import {
  runtimeConfig,
  runtimeEnvironment,
  startOpenCodeHost,
} from "../src/generation/opencode-runtime";
import { GenerationStore } from "../src/generation/store";
import { bundleSchema } from "../src/generation/schema";
const output = path.resolve(process.argv[2]);
if (!process.argv[2] || fs.existsSync(output))
  throw Error("Choose a new diagnostic directory");
fs.mkdirSync(output, { recursive: true });
const workspace = path.join(output, "workspace");
fs.cpSync("docs/results/planner-sweep-20260927/opencode-runtime", workspace, {
  recursive: true,
});
const project = JSON.parse(
  fs.readFileSync(
    "docs/results/planner-sweep-20260927/terminal-project.json",
    "utf8",
  ),
);
project.jobId = "offline-startup-diagnostic";
// Counterfactual copy only: test whether the earlier definite HTTP refusal is
// the startup blocker. Never reconcile or rewrite the preserved live ledger.
if (process.argv.includes("--without-refusal-hold")) {
  project.charges = project.charges.map((charge: any) =>
    charge.billingSource === "reservation" && charge.status === "error"
      ? {
          ...charge,
          chargedMicros: 0,
          estimated: false,
          billingSource: "provider",
          inputTokens: 0,
          outputTokens: 0,
        }
      : charge,
  );
}
const store = new GenerationStore(path.join(output, "project"));
store.save(project);
const { hasKey, ...profile } = JSON.parse(
  fs.readFileSync(
    "docs/results/fighting-open-app/model-after-timeout-change.json",
    "utf8",
  ),
).profile;
let mockCalls = 0;
const tools = [
  {
    name: "manifest",
    description: "Read approved manifest",
    schema: z.object({}).strict(),
    execute: () => project,
  },
  {
    name: "task_context",
    description: "Read task context",
    schema: z.object({ taskId: z.string() }).strict(),
    execute: () => ({ diagnostic: true }),
  },
  {
    name: "submit_task",
    description: "Validate task patch",
    schema: z.object({ taskId: z.string(), patch: bundleSchema }).strict(),
    execute: () => {
      throw Error("Diagnostic cannot commit patches");
    },
  },
];
const host = await startOpenCodeHost({
  project,
  store,
  profile,
  key: "offline-no-provider-credential",
  phase: "builder",
  signal: new AbortController().signal,
  tools,
  prompt: "Diagnostic",
  finished: () => false,
  progress: () => "none",
  transport: async () => {
    mockCalls++;
    const chunk = (choices: unknown[], usage?: unknown) =>
      `data: ${JSON.stringify({ id: "offline", object: "chat.completion.chunk", created: 1, model: profile.model, choices, ...(usage ? { usage } : {}) })}\n\n`;
    return new Response(
      chunk([
        {
          index: 0,
          delta: {
            role: "assistant",
            content: "Offline startup diagnostic complete.",
          },
          finish_reason: null,
        },
      ]) +
        chunk([{ index: 0, delta: {}, finish_reason: "stop" }], {
          prompt_tokens: 1,
          completion_tokens: 1,
          total_tokens: 2,
          cost: 0,
        }) +
        "data: [DONE]\n\n",
      { headers: { "content-type": "text/event-stream" } },
    );
  },
});
const args = [
  "run",
  "--pure",
  "--format",
  "json",
  "--model",
  "takko/agent",
  "--title",
  "Takko builder",
  "--print-logs",
  "--log-level",
  "DEBUG",
  "Read manifest, then task_context for ready tasks. Implement every unfinished task in dependency order using submit_task. Its compiler/contract feedback is authoritative. Correct rejected patches without rewriting completed tasks. Finish once every task is saved. Do not claim Studio gameplay was tested.",
];
const env = runtimeEnvironment(
  workspace,
  runtimeConfig(host.url, host.token, profile, tools),
);
if (process.argv.includes("--system-path")) {
  delete env.Path;
  env.PATH = `${process.env.SystemRoot}\\System32;${process.env.SystemRoot}\\System32\\WindowsPowerShell\\v1.0`;
}
for (const name of [
  "HOME",
  "USERPROFILE",
  "APPDATA",
  "LOCALAPPDATA",
  "TEMP",
  "TMP",
  "XDG_CONFIG_HOME",
  "XDG_DATA_HOME",
  "XDG_CACHE_HOME",
  "XDG_STATE_HOME",
])
  fs.mkdirSync(env[name]!, { recursive: true });
const clean = (text: string) =>
  text.replaceAll(host.token, "[local gateway token]");
const started = Date.now();
let stdout = "",
  stderr = "";
try {
  const result = await new Promise((resolve, reject) => {
    const child = spawn(
      path.resolve(".forge/tools/opencode-1.18.31/opencode.exe"),
      args,
      {
        cwd: workspace,
        env,
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    const timer = setTimeout(() => child.kill(), 60000);
    child.stdout.on(
      "data",
      (data) => (stdout = (stdout + data.toString()).slice(-131072)),
    );
    child.stderr.on(
      "data",
      (data) => (stderr = (stderr + data.toString()).slice(-131072)),
    );
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal });
    });
  });
  const record = {
    ...(result as object),
    elapsedMs: Date.now() - started,
    mockCalls,
    paidCalls: 0,
    args,
    stdout: clean(stdout),
    stderr: clean(stderr),
    inheritedPath: env.PATH ?? env.Path,
  };
  fs.writeFileSync(
    path.join(output, "result.json"),
    JSON.stringify(record, null, 2),
  );
  fs.writeFileSync(path.join(output, "stdout.txt"), clean(stdout));
  fs.writeFileSync(path.join(output, "stderr.txt"), clean(stderr));
  console.log(
    JSON.stringify({
      result,
      mockCalls,
      elapsedMs: record.elapsedMs,
      stderr: clean(stderr).slice(-10000),
      stdout: clean(stdout).slice(-3000),
    }),
  );
} finally {
  await host.close();
}
