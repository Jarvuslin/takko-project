import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { createHash, randomUUID } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { isDeepStrictEqual } from "node:util";
import { Configuration } from "../src/generation/settings";
import { GenerationStore } from "../src/generation/store";
import { Engine } from "../src/generation/engine";
import { validateSpec } from "../src/generation/validation";
// @ts-ignore Research fixtures are deliberately plain data, shared with offline checks.
import {
  cases,
  modulePath,
  scope,
  promptFor,
} from "../research/scripts/agent-effectiveness-cases.mjs";

const output = path.resolve(process.argv[2] ?? ".forge/agent-effectiveness-v1");
const binary = process.argv[3];
const live = process.argv.includes("--live");
const layoutAB = process.argv.includes("--layout-ab");
const rounds = layoutAB ? 2 : 1;
const cohort = randomUUID();
const legacyTemplates: Record<string, any> = {};
if (layoutAB) {
  for (const number of [1, 2]) {
    const saved = JSON.parse(
      fs.readFileSync(
        `research/results/agent-effectiveness-v1/calls/${number}-request.json`,
        "utf8",
      ),
    ).body;
    legacyTemplates[/PHASE: (\w+)/.exec(saved.messages[0].content)![1]] =
      JSON.parse(saved.messages[1].content);
  }
}
if (fs.existsSync(output))
  throw Error("Use a fresh result directory; preserve previous attempts.");
fs.mkdirSync(output, { recursive: true });
const save = (file: string, value: unknown) => {
  const dest = path.join(output, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, JSON.stringify(value, null, 2));
};
const hash = (value: string | Buffer) =>
  createHash("sha256").update(value).digest("hex");
const luau = path.resolve(".forge/tools/luau/luau.exe");
const compiler = path.resolve(".forge/tools/luau/luau-compile.exe");
const model = "openai/gpt-4.1-mini";
const perRun = 0.15,
  aggregate = 1;
type Call = {
  trial: string;
  id: number;
  liability: number;
  charged?: number;
  status?: number;
  inputTokens?: number;
  outputTokens?: number;
  error?: string;
};
const calls: Call[] = [];
const rows: any[] = [];
let activeTrial = "";
let key = "";
let inputRate = 0.4,
  outputRate = 1.6;
const total = (trial?: string) =>
  calls
    .filter((c) => !trial || c.trial === trial)
    .reduce((s, c) => s + (c.charged ?? c.liability), 0);
const record = () =>
  save("progress.json", {
    model,
    perRunCapUSD: perRun,
    aggregateCapUSD: aggregate,
    calls,
    rows,
    accountedUSD: total(),
    nativeStudio: false,
  });
const fixtureHashes = cases.map((c: any) => ({
  id: c.id,
  promptHash: hash(promptFor(c)),
  testHash: hash(c.tests),
}));
save("protocol.json", {
  layoutAB,
  rounds,
  cohort,
  model,
  fixtures: fixtureHashes,
  perRunCapUSD: perRun,
  aggregateCapUSD: aggregate,
  design: layoutAB
    ? "Two rounds per layout per authored logic slice, alternating layout order by case and round. Same actual Takko Engine, model, public tests and monetary ceiling. Baseline restores the frozen pilot's field order with current values; reordered moves reusable context first. Each layout has a distinct cohort prefix to isolate cache entries. No root repairs."
    : "One run per harness per authored logic slice; same model, requirements, public tests and monetary ceiling. Takko uses its existing builder/reviewer/repair; OpenCode uses its real CLI with file tools and a public test command. No root repairs. This measures configured harnesses including their tool-access differences, not isolated prompt quality.",
  limits: layoutAB
    ? "Three small pure-Luau tasks, two rounds, no Marketplace or Studio. Provider cache behavior and sampled output vary; this is a small exploratory A/B, not a guaranteed saving or game-quality result. Public assertions are not held-out tests."
    : "Three small pure-Luau tasks, no Marketplace or Studio, one repetition, no general agent ranking. Public tests measure stated behavior, not held-out generalization.",
  sources: [
    "src/generation/engine.ts",
    "src/generation/providers.ts",
    "src/generation/context-layout.ts",
    "src/generation/roblox-context.ts",
    "scripts/compare-agent-effectiveness.ts",
    "src/generation/settings.ts",
    "research/scripts/agent-effectiveness-cases.mjs",
  ].map((file) => ({ file, sha256: hash(fs.readFileSync(file)) })),
});
// Compile evaluators and ensure they reject a missing implementation before any spend.
for (const c of cases) {
  const folder = path.join(output, "preflight", c.id);
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, "test.luau"), c.tests);
  fs.writeFileSync(path.join(folder, "Logic.luau"), "return {}");
  execFileSync(compiler, ["--null", path.join(folder, "test.luau")], {
    windowsHide: true,
    stdio: "pipe",
  });
  let rejected = false;
  try {
    execFileSync(luau, [path.join(folder, "test.luau")], {
      windowsHide: true,
      stdio: "pipe",
    });
  } catch {
    rejected = true;
  }
  if (!rejected) throw Error("Evaluator accepted missing implementation");
}
save("preflight.json", {
  evaluatorsCompile: true,
  missingImplementationRejected: true,
  paidCalls: 0,
});
if (!live) {
  console.log("Offline preflight passed; no paid calls.");
  process.exit(0);
}
if (!layoutAB && (!binary || !fs.existsSync(binary)))
  throw Error("Supply installed OpenCode executable.");
const version = layoutAB
  ? "not_run"
  : execFileSync(binary!, ["--version"], {
      windowsHide: true,
      encoding: "utf8",
    }).trim();
if (!layoutAB && version !== "1.18.31")
  throw Error("Pinned OpenCode version mismatch");
save("opencode-version.json", {
  version,
  binaryHash: layoutAB ? null : hash(fs.readFileSync(binary!)),
});
try {
  key = execFileSync(
    process.env.TAKKO_TEST_PWSH ?? "pwsh.exe",
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "$s=ConvertTo-SecureString ([IO.File]::ReadAllText((Join-Path $env:LOCALAPPDATA 'Takko\\secrets\\openrouter-testing.dpapi'))); $p=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($s); try {[Console]::Write([Runtime.InteropServices.Marshal]::PtrToStringBSTR($p))} finally {[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($p)}",
    ],
    { windowsHide: true, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ).trim();
} catch {
  throw Error(
    "Could not decrypt Windows testing credential; details suppressed.",
  );
}
const keyInfo = async () => {
  const r = await fetch("https://openrouter.ai/api/v1/key", {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!r.ok) throw Error("Provider key check failed");
  const { data } = (await r.json()) as any;
  return {
    limit: data.limit,
    remaining: data.limit_remaining,
    usage: data.usage,
    expiresAt: data.expires_at,
  };
};
const before = await keyInfo();
save("key-before-public.json", before);
if (!(before.remaining >= aggregate))
  throw Error("Insufficient remaining key allowance for this pilot");
const catalog = (await (
  await fetch("https://openrouter.ai/api/v1/models")
).json()) as any;
const entry = catalog.data.find((x: any) => x.id === model);
if (!entry) throw Error("Comparison model missing");
inputRate = Number(entry.pricing.prompt) * 1e6;
outputRate = Number(entry.pricing.completion) * 1e6;
if (!(inputRate > 0 && inputRate <= 0.4 && outputRate > 0 && outputRate <= 1.6))
  throw Error("Price changed; stop before spending");
save("model-public.json", entry);

async function dispatch(body: any): Promise<Response> {
  if (![model, "gpt-4.1-mini"].includes(body.model))
    throw Error("Unapproved model");
  body.model = model;
  body.max_tokens = Math.min(
    body.max_tokens ?? body.max_completion_tokens ?? 8192,
    8192,
  );
  delete body.max_completion_tokens;
  if (body.plugins?.length)
    throw Error("Paid external tools are outside pilot");
  body.usage = { include: true };
  if (body.stream) body.stream_options = { include_usage: true };
  const request = JSON.stringify(body);
  if (Buffer.byteLength(request) > 250000) throw Error("Input bound exceeded");
  const reserve =
    (Buffer.byteLength(request) * inputRate + body.max_tokens * outputRate) /
    1e6;
  if (
    total() + reserve > aggregate ||
    total(activeTrial) + reserve > perRun ||
    calls.filter((c) => c.trial === activeTrial).length >= 12
  )
    throw Error("Pilot budget/call limit reached before dispatch");
  const item: Call = {
    trial: activeTrial,
    id: calls.length + 1,
    liability: reserve,
  };
  calls.push(item);
  record();
  save(`calls/${item.id}-request.json`, { trial: activeTrial, body });
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: request,
        signal: AbortSignal.timeout(90000),
        redirect: "error",
      },
    );
    const text = await response.text();
    item.status = response.status;
    fs.writeFileSync(
      path.join(output, "calls", `${item.id}-response.txt`),
      text,
    );
    let usage: any;
    if (body.stream) {
      for (const line of text.split("\n")) {
        if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
        try {
          const chunk = JSON.parse(line.slice(6));
          if (chunk.usage) usage = chunk.usage;
        } catch {}
      }
    } else {
      try {
        usage = JSON.parse(text).usage;
      } catch {}
    }
    if (usage && typeof usage.cost === "number" && usage.cost >= 0)
      item.charged = usage.cost;
    item.inputTokens = usage?.prompt_tokens;
    item.outputTokens = usage?.completion_tokens;
    record();
    return new Response(text, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    item.error = "Transport failed; full reservation retained";
    record();
    throw Error(item.error);
  }
}
const server = http.createServer(async (req, res) => {
  try {
    if (req.method !== "POST" || req.url !== "/v1/chat/completions") {
      res.writeHead(404).end();
      return;
    }
    let body = "";
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 300000) throw Error("Input bound");
    }
    const upstream = await dispatch(JSON.parse(body));
    res.writeHead(upstream.status, {
      "Content-Type": upstream.headers.get("content-type")!,
    });
    res.end(await upstream.text());
  } catch {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: {
          message:
            "Pilot admission/transport failed; inspect retained receipts",
        },
      }),
    );
  }
});
await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
const port = (server.address() as any).port;

function evaluate(folder: string, c: any, source: string | undefined) {
  if (!source)
    return { passed: false, reason: "No requested module delivered" };
  const dir = path.join(folder, "evaluation");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "Logic.luau"), source);
  fs.writeFileSync(path.join(dir, "test.luau"), c.tests);
  try {
    execFileSync(compiler, ["--null", path.join(dir, "Logic.luau")], {
      windowsHide: true,
      stdio: "pipe",
      timeout: 10000,
    });
    const result = execFileSync(luau, [path.join(dir, "test.luau")], {
      windowsHide: true,
      encoding: "utf8",
      stdio: "pipe",
      timeout: 10000,
    });
    if (!result.includes(`PASS ${c.id}`))
      throw Error("Evaluator did not finish");
    return { passed: true, output: result, sourceHash: hash(source) };
  } catch (e: any) {
    return {
      passed: false,
      reason: String(e.stderr ?? e.message).slice(0, 4000),
      sourceHash: hash(source),
    };
  }
}
async function takko(c: any, variant = "takko") {
  const folder = path.join(output, activeTrial);
  fs.mkdirSync(folder, { recursive: true });
  const cfg = new Configuration(path.join(folder, "configuration"));
  const id = randomUUID();
  cfg.save({
    profiles: [
      {
        id,
        name: "Matched pilot",
        provider: "openrouter",
        baseUrl: "https://openrouter.ai/api/v1",
        model,
        inputRate,
        outputRate,
        maxOutputTokens: 8192,
        jsonMode: true,
      },
    ],
    routes: { planner: [id], builder: [id], reviewer: [id], repair: [id] },
    budgetMicros: perRun * 1e6,
    repairLimit: 1,
    researchEnabled: false,
  });
  cfg.setKey(id, "local-pilot-transport");
  const store = new GenerationStore(path.join(folder, "projects"));
  const transport = (async (_url: any, options: any) => {
    const body = JSON.parse(options.body);
    if (layoutAB) {
      body.messages[0].content =
        `Evaluation cohort ${cohort}-${variant}.\n` + body.messages[0].content;
      if (variant === "baseline") {
        const phase = /PHASE: (\w+)/.exec(body.messages[0].content)![1];
        const template = legacyTemplates[phase];
        if (!template) throw Error("No frozen baseline order for this phase");
        const [encoded, ...suffix] = body.messages[1].content.split(
          "\nYour last response failed validation.",
        );
        const context = JSON.parse(encoded);
        const reorder = (value: any, reference: any) =>
          Object.fromEntries(
            [
              ...Object.keys(reference).filter((k) => Object.hasOwn(value, k)),
              ...Object.keys(value).filter((k) => !Object.hasOwn(reference, k)),
            ].map((k) => [k, value[k]]),
          );
        const original = reorder(context, template);
        original.runtimeReference = reorder(
          context.runtimeReference,
          template.runtimeReference,
        );
        if (!isDeepStrictEqual(context, original))
          throw Error("Baseline ordering changed semantic context");
        body.messages[1].content =
          JSON.stringify(original) +
          (suffix.length
            ? "\nYour last response failed validation." +
              suffix.join("\nYour last response failed validation.")
            : "");
      }
    }
    return dispatch(body);
  }) as typeof fetch;
  const engine = new Engine(store, cfg, transport);
  const p = engine.create(promptFor(c));
  p.scope = scope;
  p.spec = validateSpec(
    {
      title: c.id,
      summary: promptFor(c),
      visualDirection: "Pure logic slice; no visuals requested.",
      requirements: [
        {
          id: "core",
          description: c.brief,
          sourceId: "request",
          sourceQuote: c.brief,
          origin: "user",
          category: "mechanic",
          priority: "required",
          acceptance:
            "All supplied public acceptance assertions must pass without changing the tests.",
        },
      ],
      questions: [],
      tasks: [
        {
          id: "logic",
          title: "Implement the requested pure Luau state module",
          requirements: ["core"],
          dependsOn: [],
          files: [modulePath],
        },
      ],
      assetNeeds: [],
      assetStrategy:
        "Pure internal state module only; no external content required for this isolated slice.",
    },
    p,
  );
  p.stage = "review";
  store.save(p);
  engine.approve(p.id, p.revision);
  const started = Date.now();
  engine.start(p.id, p.revision, "build");
  const result = await engine.wait(p.id);
  save(`${activeTrial}/project.json`, result);
  return {
    harness: layoutAB ? `Takko ${variant}` : "Takko",
    case: c.id,
    durationMs: Date.now() - started,
    stage: result.stage,
    error: result.error,
    evaluation: evaluate(
      folder,
      c,
      result.artifact?.files.find((f) => f.path === modulePath)?.source,
    ),
  };
}
async function opencode(c: any) {
  const folder = path.join(output, activeTrial);
  fs.mkdirSync(folder, { recursive: true });
  const work = fs.mkdtempSync(
    path.join(os.tmpdir(), "takko-agent-comparison-"),
  );
  fs.mkdirSync(path.join(work, path.dirname(modulePath)), { recursive: true });
  fs.writeFileSync(path.join(work, "TASK.md"), promptFor(c));
  fs.writeFileSync(path.join(work, "acceptance.luau"), c.tests);
  const checker = `import fs from 'node:fs';import{execFileSync}from'node:child_process';fs.copyFileSync(${JSON.stringify(modulePath)},'Logic.luau');process.stdout.write(execFileSync(${JSON.stringify(luau)},['acceptance.luau'],{encoding:'utf8',stdio:'pipe',timeout:10000}));`;
  fs.writeFileSync(path.join(work, "check.mjs"), checker);
  const config = {
    model: "pilot/gpt-4.1-mini",
    small_model: "pilot/gpt-4.1-mini",
    enabled_providers: ["pilot"],
    share: "disabled",
    autoupdate: false,
    snapshot: false,
    plugin: [],
    provider: {
      pilot: {
        npm: "@ai-sdk/openai-compatible",
        name: "Matched OpenRouter pilot",
        options: {
          baseURL: `http://127.0.0.1:${port}/v1`,
          apiKey: "local-only",
        },
        models: {
          "gpt-4.1-mini": {
            name: "GPT-4.1 mini",
            limit: { context: 128000, output: 8192 },
            cost: { input: inputRate, output: outputRate },
          },
        },
      },
    },
    permission: {
      "*": "deny",
      read: "allow",
      glob: "allow",
      grep: "allow",
      list: "allow",
      edit: {
        "*": "deny",
        [modulePath]: "allow",
        ["**/Logic.module.luau"]: "allow",
      },
      bash: { "*": "deny", "node check.mjs": "allow" },
      external_directory: "deny",
    },
    agent: { build: { steps: 10 } },
  };
  fs.writeFileSync(
    path.join(work, "opencode.json"),
    JSON.stringify(config, null, 2),
  );
  save(`${activeTrial}/configuration.json`, config);
  const env: NodeJS.ProcessEnv = {};
  for (const name of [
    "PATH",
    "Path",
    "SystemRoot",
    "WINDIR",
    "TEMP",
    "TMP",
    "USERPROFILE",
    "LOCALAPPDATA",
    "APPDATA",
    "PATHEXT",
    "COMSPEC",
  ])
    if (process.env[name]) env[name] = process.env[name];
  env.OPENCODE_CONFIG_CONTENT = JSON.stringify(config);
  env.OPENCODE_DISABLE_CLAUDE_CODE = "true";
  env.OPENCODE_DISABLE_AUTOUPDATE = "true";
  // Isolate user configuration/data while retaining normal OS runtime paths.
  env.XDG_CONFIG_HOME = path.join(work, ".config");
  env.XDG_DATA_HOME = path.join(work, ".data");
  env.XDG_CACHE_HOME = path.join(work, ".cache");
  const started = Date.now();
  const completion = await new Promise<any>((resolve, reject) => {
    const child = spawn(
      binary!,
      [
        "run",
        "--pure",
        "--format",
        "json",
        "--model",
        "pilot/gpt-4.1-mini",
        "--title",
        `Pilot ${c.id}`,
        "Read TASK.md and implement the requested module. You may run node check.mjs to check it. Do not modify any tests or check scripts. Finish after the implementation is verified.",
      ],
      { cwd: work, env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] },
    );
    let stdout = "",
      stderr = "",
      timeout = false;
    const timer = setTimeout(() => {
      timeout = true;
      child.kill();
    }, 240000);
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      fs.writeFileSync(path.join(folder, "events.jsonl"), stdout);
      fs.writeFileSync(path.join(folder, "stderr.txt"), stderr);
      resolve({ code, timeout });
    });
  });
  const implementation = path.join(work, modulePath);
  const source = fs.existsSync(implementation)
    ? fs.readFileSync(implementation, "utf8")
    : undefined;
  const testsUnchanged =
    fs.readFileSync(path.join(work, "acceptance.luau"), "utf8") === c.tests &&
    fs.readFileSync(path.join(work, "check.mjs"), "utf8") === checker;
  return {
    harness: "OpenCode",
    version,
    case: c.id,
    durationMs: Date.now() - started,
    ...completion,
    workDirectory: work,
    testsUnchanged,
    evaluation: testsUnchanged
      ? evaluate(folder, c, source)
      : { passed: false, reason: "Public evaluator changed" },
  };
}
try {
  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < cases.length; i++) {
      const c = cases[i];
      for (const harness of layoutAB
        ? (i + round) % 2
          ? ["reordered", "baseline"]
          : ["baseline", "reordered"]
        : i % 2
          ? ["opencode", "takko"]
          : ["takko", "opencode"]) {
        activeTrial = `${c.id}-${harness}` + (layoutAB ? `-r${round + 1}` : "");
        console.log(`Starting ${activeTrial}`);
        const row = await (layoutAB || harness === "takko"
          ? takko(c, harness)
          : opencode(c));
        rows.push({
          ...row,
          trial: activeTrial,
          round: round + 1,
          accountedUSD: total(activeTrial),
          calls: calls.filter((x) => x.trial === activeTrial).length,
        });
        record();
        console.log(JSON.stringify(rows.at(-1)));
        if (calls.some((c) => c.charged === undefined))
          throw Error(
            "Unsettled provider liability; stop rather than silently continue",
          );
      }
    }
  }
  save("key-after-public.json", await keyInfo());
  save("results.json", {
    layoutAB,
    rounds,
    model,
    rows,
    calls,
    chargedUSD: total(),
    nativeStudio: false,
    rootRepairs: 0,
    publicFixtures: fixtureHashes,
    conclusion: layoutAB
      ? "Exploratory context-layout comparison: three public logic tasks, two rounds per layout; no general cost or gameplay guarantee."
      : "Pilot only; no general superiority established from three single-run logic tasks.",
  });
} finally {
  key = "";
  await new Promise<void>((r) => server.close(() => r()));
}
