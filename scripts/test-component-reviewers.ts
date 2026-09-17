import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { Engine } from "../src/generation/engine";
import { Configuration } from "../src/generation/settings";
import { GenerationStore } from "../src/generation/store";
import {
  loadComponentReviewEvidence,
  componentReviewDecisionSchema,
  componentReviewInstructions,
  validateComponentReview,
} from "../src/generation/component-review";
import {
  componentAdaptationInstructions,
  componentAdaptationSchema,
  validateComponentAdaptation,
  loadAdaptedComponentEvidence,
} from "../src/generation/component-adaptation";

// Diagnostic replay of frozen worker choices, not a fresh discovery or gameplay trial.
// Invokes the same Engine.call boundary as production component review; no authored answer.
const [inputDirectory, outputDirectory] = process.argv.slice(2);
const adaptationReviews = process.argv
  .find((arg) => arg.startsWith("--adapt-from="))
  ?.slice(13);
const adaptedDirectory = process.argv
  .find((arg) => arg.startsWith("--review-adapted="))
  ?.slice(17);
if (adaptationReviews && adaptedDirectory)
  throw Error("Choose adaptation or post-adaptation review, not both");
const modelId =
  process.argv.find((arg) => arg.startsWith("--model="))?.slice(8) ??
  "openai/gpt-4.1-mini";
if (!["openai/gpt-4.1-mini", "google/gemini-3.7-flash"].includes(modelId))
  throw Error("Model outside diagnostic allowance");
const perCaseUSD = modelId === "openai/gpt-4.1-mini" ? 0.15 : 0.25;
const batchUSD = perCaseUSD * 3;
if (!inputDirectory || !outputDirectory)
  throw Error("Usage: NATIVE_INPUT_DIRECTORY FRESH_OUTPUT_DIRECTORY [--live]");
const output = path.resolve(outputDirectory);
if (fs.existsSync(output))
  throw Error("Preserve previous attempts; use a fresh output directory");
fs.mkdirSync(output, { recursive: true });
const hash = (x: string | Buffer) =>
  createHash("sha256").update(x).digest("hex");
const save = (name: string, value: unknown) =>
  fs.writeFileSync(path.join(output, name), JSON.stringify(value, null, 2));
const native = JSON.parse(
  fs.readFileSync(path.join(inputDirectory, "result.json"), "utf8"),
);
const requestedCases = process.argv
  .find((arg) => arg.startsWith("--cases="))
  ?.slice(8)
  .split(",");
if (
  requestedCases &&
  (new Set(requestedCases).size !== requestedCases.length ||
    requestedCases.some(
      (name) => !native.results.some((r: any) => r.case === name),
    ))
)
  throw Error("Unknown or duplicate case filter");
const contexts = native.results
  .filter((row: any) => !requestedCases || requestedCases.includes(row.case))
  .map((row: any) => {
    let evidence = loadComponentReviewEvidence(
      path.join(inputDirectory, row.case),
      row.result.sha256,
      row.inputHash,
    );
    if (adaptedDirectory) {
      const adapted = JSON.parse(
        fs.readFileSync(
          path.join(adaptedDirectory, row.case + "-result.json"),
          "utf8",
        ),
      );
      evidence = loadAdaptedComponentEvidence(
        path.join(adaptedDirectory, row.case),
        adapted.result.sha256,
        evidence,
      );
    }
    const need = row.inputContext.assetTarget.need;
    return {
      name: row.case,
      gameContext: row.inputContext,
      request: row.inputContext.userSources.find(
        (source: any) => source.id === "request",
      )?.text,
      context: {
        ...(adaptationReviews
          ? {
              review: validateComponentReview(
                JSON.parse(
                  fs.readFileSync(
                    path.join(adaptationReviews, row.case + "-decision.json"),
                    "utf8",
                  ),
                ),
                evidence,
                [
                  ...new Set([
                    need.requirementId,
                    ...(need.intent?.relatedRequirementIds ?? []),
                  ]),
                ] as string[],
              ),
            }
          : {}),
        need,
        requirementIds: [
          ...new Set([
            need.requirementId,
            ...(need.intent?.relatedRequirementIds ?? []),
          ]),
        ],
        evidence,
      },
    };
  });
save("protocol.json", {
  type: adaptationReviews
    ? "component-adaptation-diagnostic-replay"
    : "component-review-diagnostic-replay",
  nativeStudioOperations: 0,
  importedCodeExecution: false,
  model: modelId,
  perCaseUSD,
  batchUSD,
  maxOutputTokens: 12288,
  intervention:
    "No supplied decisions or replacement code. Frozen prior worker selections and game context, retained native archives, production instructions/schema and automatic validation feedback only.",
  boundary:
    "Schema/source-quote/media-coverage validation is not semantic accuracy, dependency verification or gameplay proof.",
  sources: [
    "src/generation/engine.ts",
    "src/generation/component-review.ts",
    ...(adaptationReviews ? ["src/generation/component-adaptation.ts"] : []),
    "scripts/test-component-reviewers.ts",
  ].map((file) => ({ file, sha256: hash(fs.readFileSync(file)) })),
  inputs: contexts.map((x: any) => ({
    case: x.name,
    sha256: hash(JSON.stringify(x)),
  })),
});
for (const item of contexts) save(item.name + "-input.json", item);
if (!process.argv.includes("--live")) {
  console.log("Complete native input reconstruction passed; no paid calls.");
  process.exit(0);
}
let key = "";
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
  throw Error("Could not decrypt testing key; details suppressed");
}
const keyInfo = async () => {
  const res = await fetch("https://openrouter.ai/api/v1/key", {
    headers: { Authorization: `Bearer ${key}` },
    redirect: "error",
  });
  if (!res.ok) throw Error("Key metadata unavailable");
  const { data } = (await res.json()) as any;
  return {
    checkedAt: new Date().toISOString(),
    limit: data.limit,
    remaining: data.limit_remaining,
    usage: data.usage,
    expiresAt: data.expires_at,
  };
};
const before = await keyInfo();
save("key-before.json", before);
if (before.remaining < batchUSD)
  throw Error("Insufficient shared key allowance");
const catalog = (await (
  await fetch("https://openrouter.ai/api/v1/models")
).json()) as any;
const model = catalog.data.find((x: any) => x.id === modelId);
const inputRate = Number(model?.pricing.prompt) * 1e6,
  outputRate = Number(model?.pricing.completion) * 1e6;
if (
  !model ||
  !Number.isFinite(inputRate) ||
  inputRate <= 0 ||
  inputRate > 0.75 ||
  !Number.isFinite(outputRate) ||
  outputRate <= 0 ||
  outputRate > 3.75
)
  throw Error("Model price missing or exceeds approved ceiling");
save("model.json", model);
const calls: any[] = [],
  results: any[] = [];
const liability = (name?: string) =>
  calls
    .filter((c) => !name || c.case === name)
    .reduce((n, c) => n + (c.cost ?? c.reserve), 0);
try {
  for (const item of contexts) {
    console.log("Reviewing frozen " + item.name);
    const folder = path.join(output, item.name);
    const cfg = new Configuration(path.join(folder, "config")),
      id = randomUUID();
    cfg.save({
      profiles: [
        {
          id,
          name: "Component review diagnostic",
          provider: "openrouter",
          baseUrl: "https://openrouter.ai/api/v1",
          model: model.id,
          inputRate,
          outputRate,
          maxOutputTokens: 12288,
          jsonMode: true,
        },
      ],
      routes: { planner: [id], builder: [id], reviewer: [id], repair: [id] },
      budgetMicros: Math.round(perCaseUSD * 1e6),
      repairLimit: 0,
      researchEnabled: false,
    });
    cfg.setKey(id, key);
    const transport = (async (url: any, options: any) => {
      if (url !== "https://openrouter.ai/api/v1/chat/completions")
        throw Error("Unexpected provider endpoint");
      const body = JSON.parse(options.body);
      if (
        body.model !== model.id ||
        body.stream ||
        body.plugins?.length ||
        body.max_tokens > 12288
      )
        throw Error("Unexpected request");
      const reserve =
        (Buffer.byteLength(options.body) * inputRate + 12288 * outputRate) /
        1e6;
      if (
        liability() + reserve > batchUSD ||
        liability(item.name) + reserve > perCaseUSD ||
        calls.filter((c) => c.case === item.name).length >= 2
      )
        throw Error("Diagnostic admission limit");
      const call: any = { case: item.name, id: calls.length + 1, reserve };
      calls.push(call);
      save("calls.json", calls);
      save(`call-${call.id}-request.json`, body);
      const response = await fetch(url, { ...options, redirect: "error" });
      const text = (await response.text()).replaceAll(key, "[REDACTED]");
      fs.writeFileSync(path.join(output, `call-${call.id}-response.txt`), text);
      call.status = response.status;
      try {
        const data = JSON.parse(text);
        const usage = data.usage;
        if (
          typeof usage?.cost === "number" &&
          Number.isFinite(usage.cost) &&
          usage.cost >= 0
        )
          call.cost = usage.cost;
        call.usage = usage;
      } catch {}
      save("calls.json", calls);
      return new Response(text, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;
    const store = new GenerationStore(path.join(folder, "projects")),
      engine = new Engine(store, cfg, transport);
    if (typeof item.request !== "string" || !item.request.trim())
      throw Error("Original user request missing");
    const p = engine.create(item.request);
    const started = Date.now();
    try {
      const decision = await (engine as any).call(
        p,
        adaptationReviews ? "builder" : "reviewer",
        {
          task: adaptationReviews
            ? "component-adaptation"
            : "component-source-review",
          request: p.request,
          gameContext: item.gameContext,
          context: item.context,
          instructions: adaptationReviews
            ? componentAdaptationInstructions
            : componentReviewInstructions,
        },
        adaptationReviews
          ? componentAdaptationSchema
          : componentReviewDecisionSchema,
        cfg.read(),
        new Map([[id, key]]),
        AbortSignal.timeout(240000),
        (value: unknown) =>
          adaptationReviews
            ? validateComponentAdaptation(value, item.context.evidence)
            : validateComponentReview(
                value,
                item.context.evidence,
                item.context.requirementIds,
              ),
        {
          label: adaptationReviews ? "component-adapter" : "component-reviewer",
        },
      );
      save(item.name + "-decision.json", decision);
      results.push({
        case: item.name,
        contractPassed: true,
        ...(adaptationReviews
          ? {
              removedSubtrees: decision.removeSubtrees.length,
              replacedSources: decision.replaceSources.length,
            }
          : { disposition: decision.disposition }),
        reason: decision.reason,
        ...(adaptationReviews ? {} : { sourceBodies: decision.sources.length }),
        mediaBindings: (decision.serializedMedia ?? []).reduce(
          (n: number, r: any) => n + (r.indices?.length ?? 1),
          0,
        ),
        mediaGroups: decision.serializedMedia?.length ?? 0,
        costUSD: liability(item.name),
        durationMs: Date.now() - started,
      });
    } catch (e) {
      results.push({
        case: item.name,
        contractPassed: false,
        error: (e as Error).message,
        costUSD: liability(item.name),
        durationMs: Date.now() - started,
      });
    }
    save(item.name + "-project.json", p);
    save("results.json", {
      results,
      costUSD: liability(),
      semanticAccuracy: "not_scored",
      nativeGameplay: false,
    });
    console.log(JSON.stringify(results.at(-1)));
    if (calls.some((c) => c.cost === undefined))
      throw Error("Unsettled liability; stop before another trial");
  }
  save("key-after.json", await keyInfo());
} finally {
  key = "";
}
