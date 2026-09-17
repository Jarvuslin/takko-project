import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import { Configuration } from "../src/generation/settings";
import { GenerationStore } from "../src/generation/store";
import { Engine } from "../src/generation/engine";
import type { Project, Profile } from "../src/generation/schema";

export const benchmarkPrompt =
  "Create a Steal a Brainrot style multiplayer Roblox game. Preserve its recognizable core loop. Use original procedural characters and UI, no uploaded assets or monetization. Choose sensible defaults, ask no questions. Plan a feasible first playable slice and explicitly state what is deferred.";
// Diagnostic indicators, not a semantic judge or proof of implementation. Inspect saved briefs.
export function fidelityIndicators(p: Project) {
  const text = JSON.stringify(p.spec ?? {}).toLowerCase();
  return {
    acquisition:
      /buy|purchas/.test(text) && /brainrot|character|creature/.test(text),
    income: /passive|income|per.second|generate.{0,20}(money|cash)/.test(text),
    stealing:
      /steal|theft/.test(text) && /other player|rival|opponent/.test(text),
    rebirth: /rebirth/.test(text),
    defense: /lock|protect|defen/.test(text),
    transportRisk: /carry|carrying|carried|transport/.test(text),
    serverAuthority: /server.authoritat|server.validat/.test(text),
    uncertainty: /uncertain|unverified|assum|defer/.test(text),
  };
}
/** Uses an existing in-memory key without serializing it or changing live routes. */
export async function evaluatePlanners(
  source: Configuration,
  outputDirectory: string,
  aggregateCapMicros = 1_000_000,
  transport: typeof fetch = fetch,
) {
  if (aggregateCapMicros <= 0 || aggregateCapMicros > 1_000_000)
    throw Error("This pilot is capped at $1 total.");
  if (fs.existsSync(path.join(outputDirectory, "report.json")))
    throw Error(
      "Use a fresh output directory; benchmark evidence is immutable.",
    );
  fs.mkdirSync(outputDirectory, { recursive: true });
  const existing = source
    .read()
    .profiles.find((p) => p.provider === "openrouter" && source.key(p.id));
  if (!existing)
    throw Error(
      "Enter an OpenRouter key in Models before running this comparison.",
    );
  const response = await transport("https://openrouter.ai/api/v1/models", {
    signal: AbortSignal.timeout(15000),
    redirect: "error",
  });
  if (!response.ok) throw Error("Cannot verify model catalog/pricing.");
  const catalog = (await response.json()).data;
  const models = [
    "openai/gpt-4.1-mini",
    "openai/gpt-5.6-sol",
    "anthropic/claude-sonnet-5",
  ];
  const profiles: Profile[] = models.map((model) => {
    const m = catalog.find((m: any) => m.id === model);
    if (!m || !m.pricing?.prompt || !m.pricing?.completion)
      throw Error("Model/pricing unavailable: " + model);
    return {
      ...existing,
      id: randomUUID(),
      name: m.name,
      model,
      inputRate: Number(m.pricing.prompt) * 1e6,
      outputRate: Number(m.pricing.completion) * 1e6,
      maxOutputTokens: 6000,
    };
  });
  const config = new Configuration(path.join(outputDirectory, "configuration"));
  config.save({
    profiles,
    routes: {
      research: [profiles[1].id],
      planner: [profiles[1].id],
      builder: [],
      reviewer: [],
      repair: [],
    },
    researchEnabled: true,
    budgetMicros: aggregateCapMicros,
    repairLimit: 0,
  });
  for (const p of profiles) config.setKey(p.id, source.key(existing.id));
  const store = new GenerationStore(path.join(outputDirectory, "projects")),
    engine = new Engine(store, config, transport);
  let spent = 0,
    evidence: Project["research"];
  const results: unknown[] = [];
  const report = () => ({
    at: new Date().toISOString(),
    prompt: benchmarkPrompt,
    aggregateCapMicros,
    chargedMicros: spent,
    candidates: profiles.map(({ id, ...p }) => p),
    results,
    limits: [
      "One prompt, one sample per cell; no statistical ranking.",
      "Six diagnostic planning cells: three models, with/without the same saved web research.",
      "Keyword indicators require manual review; they are not gameplay or visual quality scores.",
      "No generated implementation or native Studio run in this comparison.",
    ],
  });
  // First cell also runs the real production research path; reuse its dossier byte-for-byte.
  const cells = [
    [1, true],
    [0, false],
    [0, true],
    [1, false],
    [2, false],
    [2, true],
  ] as const;
  for (const [index, withResearch] of cells) {
    const remaining = aggregateCapMicros - spent;
    if (remaining < 1000) {
      results.push({
        model: profiles[index].model,
        withResearch,
        skipped: "Aggregate cap exhausted",
      });
      continue;
    }
    if (withResearch && results.length && !evidence) {
      results.push({
        model: profiles[index].model,
        withResearch,
        skipped: "No validated common research",
      });
      continue;
    }
    config.save({
      ...config.read(),
      researchEnabled: withResearch,
      routes: { ...config.read().routes, planner: [profiles[index].id] },
      budgetMicros: remaining,
    });
    const p = engine.create(benchmarkPrompt);
    p.scope = "Forge_PlanningBenchmark";
    if (withResearch && evidence) p.research = structuredClone(evidence);
    store.save(p);
    const start = Date.now();
    engine.start(p.id, 1, "plan");
    const result = await engine.wait(p.id);
    const charges = result.charges.reduce((n, c) => n + c.chargedMicros, 0);
    spent += charges;
    if (result.research && !evidence)
      evidence = structuredClone(result.research);
    results.push({
      model: profiles[index].model,
      withResearch,
      projectId: p.id,
      stage: result.stage,
      error: result.error,
      durationMs: Date.now() - start,
      chargedMicros: charges,
      planningMicros: result.charges
        .filter((c) => c.phase === "planner")
        .reduce((n, c) => n + c.chargedMicros, 0),
      attempts: result.charges.filter((c) => c.phase === "planner").length,
      indicators: fidelityIndicators(result),
      spec: result.spec,
      research: withResearch ? result.research : null,
    });
    fs.writeFileSync(
      path.join(outputDirectory, "progress.json"),
      JSON.stringify(report(), null, 2),
    );
  }
  const final = report();
  fs.writeFileSync(
    path.join(outputDirectory, "report.json"),
    JSON.stringify(final, null, 2),
  );
  return final;
}
/** Separate paired reruns for truncated cells; preserve the original six-cell evidence. */
export async function retryTruncatedPlannerCells(
  source: Configuration,
  directory: string,
  transport: typeof fetch = fetch,
) {
  const original = JSON.parse(
    fs.readFileSync(path.join(directory, "report.json"), "utf8"),
  );
  const output = path.join(directory, "extended-output-report.json");
  if (fs.existsSync(output))
    throw Error("Expanded-output results already exist.");
  const keyProfile = source
    .read()
    .profiles.find((p) => p.provider === "openrouter" && source.key(p.id));
  if (!keyProfile) throw Error("No OpenRouter session key.");
  const cap = Math.min(original.aggregateCapMicros, 1_000_000);
  let spent = original.chargedMicros;
  if (!Number.isFinite(spent) || spent < 0 || !Number.isFinite(cap))
    throw Error("Invalid benchmark accounting.");
  const results: unknown[] = [];
  const config = new Configuration(
    path.join(directory, "expanded", "configuration"),
  );
  const store = new GenerationStore(
    path.join(directory, "expanded", "projects"),
  );
  const engine = new Engine(store, config, transport);
  for (const cell of original.results.filter((r: any) =>
    /truncated/i.test(r.error ?? ""),
  )) {
    const candidate = original.candidates.find(
      (p: Profile) => p.model === cell.model,
    );
    if (
      !candidate ||
      candidate.provider !== "openrouter" ||
      candidate.baseUrl !== keyProfile.baseUrl
    )
      throw Error("Invalid benchmark endpoint.");
    const remaining = cap - spent;
    if (remaining < 1000) {
      results.push({
        model: cell.model,
        withResearch: cell.withResearch,
        skipped: "Aggregate cap exhausted",
      });
      continue;
    }
    const model: Profile = {
      ...candidate,
      id: randomUUID(),
      maxOutputTokens: 12000,
    };
    config.save({
      profiles: [model],
      routes: {
        planner: [model.id],
        research: [model.id],
        builder: [],
        reviewer: [],
        repair: [],
      },
      researchEnabled: cell.withResearch,
      budgetMicros: remaining,
      repairLimit: 0,
    });
    config.setKey(model.id, source.key(keyProfile.id));
    const p = engine.create(original.prompt);
    p.scope = "Forge_PlanningBenchmark";
    if (cell.withResearch) {
      if (!cell.research) throw Error("Missing paired research dossier.");
      p.research = structuredClone(cell.research);
    }
    store.save(p);
    const started = Date.now();
    engine.start(p.id, 1, "plan");
    const next = await engine.wait(p.id);
    const cost = next.charges.reduce((n, c) => n + c.chargedMicros, 0);
    spent += cost;
    results.push({
      model: cell.model,
      withResearch: cell.withResearch,
      maxOutputTokens: 12000,
      projectId: p.id,
      stage: next.stage,
      error: next.error,
      durationMs: Date.now() - started,
      chargedMicros: cost,
      attempts: next.charges.length,
      indicators: fidelityIndicators(next),
      spec: next.spec,
      research: next.research,
    });
    fs.writeFileSync(
      path.join(directory, "expanded-progress.json"),
      JSON.stringify({ chargedMicros: spent, results }, null, 2),
    );
  }
  const final = {
    at: new Date().toISOString(),
    aggregateCapMicros: cap,
    originalChargedMicros: original.chargedMicros,
    chargedMicros: spent,
    results,
    limits: [
      "Supplementary paired reruns only for truncated cells, raising output cap from 6000 to 12000.",
      "Same prompt, dossier and provider configuration; samples are stochastic.",
      "Total accounting includes the original six-cell pilot. No native gameplay tests.",
    ],
  };
  fs.writeFileSync(output, JSON.stringify(final, null, 2));
  return final;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const config = new Configuration(path.resolve(".forge/eval-cli-config"));
  config.importEnvironment(process.env);
  const report = await evaluatePlanners(
    config,
    path.resolve(process.argv[2] ?? ".forge/evaluations/" + Date.now()),
  );
  console.log(
    JSON.stringify({
      chargedMicros: report.chargedMicros,
      cells: report.results.length,
    }),
  );
}
