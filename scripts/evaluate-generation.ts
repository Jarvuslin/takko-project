import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Configuration, endpoints } from "../src/generation/settings";
import { GenerationStore } from "../src/generation/store";
import { Engine } from "../src/generation/engine";
import { compileSources, validateSpec } from "../src/generation/validation";
import type { Profile, Spec } from "../src/generation/schema";

export const generationModels = [
  "openai/gpt-5.6-luna",
  "xiaomi/mimo-v2.5",
  "deepseek/deepseek-v4.1-flash",
  "openai/gpt-5.6-sol",
];
export const generationPrompt =
  "Build a small multiplayer Roblox collect-and-sell game with procedural parts and a readable HUD. Near a green pickup, E or a Collect button adds one item up to a carry capacity of five. Near a yellow sell pad, Q or a Sell button sells all carried items for ten coins each and clears the carry count. The server validates action, distance, rate, capacity, and player state; clients never supply trusted counts or rewards. Each player has independent Carry and Coins attributes that survive character respawn within the session. The HUD shows current carry/capacity and coins immediately and after each update and respawn, with no duplicate controls. Include a safe floor, spawn, clear pickup/sell labels, and no uploaded assets, audio, monetization, persistence across joins, or additional mechanics.";
export function generationSpecification(scope: string): Spec {
  const roots = {
    shared: `ReplicatedStorage/${scope}`,
    server: `ServerScriptService/${scope}`,
    client: `StarterPlayer/StarterPlayerScripts/${scope}`,
  };
  const requirement = (
    id: string,
    category: "mechanic" | "network" | "ui",
    description: string,
    acceptance: string,
  ) => ({
    id,
    description,
    acceptance,
    category,
    priority: "required" as const,
    origin: "user" as const,
    sourceId: "request",
    sourceQuote: generationPrompt,
  });
  return {
    title: "Collect and Sell",
    visualDirection:
      "Simple green pickup, yellow sell pad, safe gray floor, clear labels and a high-contrast text HUD.",
    summary: `${generationPrompt} Shared interface is fixed: ${roots.shared}/Contract.module.luau returns {CAPACITY=5, SELL_VALUE=10, INTERACT_DISTANCE=10, ACTION_COOLDOWN=0.2}; declare RemoteEvent ${roots.shared}/Action. Client FireServer receives only action string 'collect' or 'sell'. Server owns player attributes Carry and Coins. World nodes are Workspace/${scope}/Pickup (position 0,3,0) and Workspace/${scope}/SellPad (position 12,1,0). Preserve these exact names and interfaces. Runtime module name is Contract; client reads replicated attributes and module constants. HUD ScreenGui name is CollectSellHUD under PlayerGui, with descendants CarryLabel and CoinsLabel (TextLabels), CollectButton and SellButton (TextButtons); text is exactly 'Carry: <Carry>/5' and 'Coins: <Coins>' using current numeric attributes. Server initializes existing and new players and retains their state across CharacterAdded, cleans player bookkeeping on leave. Test current behavior honestly without claiming an unexecuted scenario passed.`,
    requirements: [
      requirement(
        "loop",
        "mechanic",
        "Collect and sell with distinct world interactions",
        "Collect five times while near Pickup -> Carry=5; a sixth collect cannot increase it. At SellPad sell -> Carry=0, Coins=50; selling empty adds zero. Floor, spawn and both labeled interactions exist.",
      ),
      requirement(
        "authority",
        "network",
        "Independent server-authoritative player state and validation",
        "Invalid actions, distant/dead players and rapid requests do not award items/coins. Two players cannot alter one another's inventory. Character respawn preserves that player's Carry and Coins; leaving cleans bookkeeping.",
      ),
      requirement(
        "hud",
        "ui",
        "Readable live HUD and keyboard/touch controls",
        "At join and after updates or respawn, exactly one HUD displays actual Carry/5 and Coins. E/Collect and Q/Sell send only action strings through the declared Action RemoteEvent.",
      ),
    ],
    questions: [],
    tasks: [
      {
        id: "server",
        title: "Shared contract, authoritative gameplay and world",
        requirements: ["loop", "authority"],
        dependsOn: [],
        files: [
          `${roots.shared}/Contract.module.luau`,
          `${roots.server}/Game.server.luau`,
        ],
      },
      {
        id: "client",
        title: "HUD and input using the existing shared contract",
        requirements: ["hud"],
        dependsOn: ["server"],
        files: [`${roots.client}/Controller.client.luau`],
      },
    ],
  };
}
type Options = {
  aggregateCapMicros?: number;
  models?: string[];
  reviewerModel?: string;
  maxOutputTokens?: number;
  repairLimit?: 0 | 1;
  scenario?: {
    prompt: string;
    specification: (scope: string) => Spec;
  };
  transport?: typeof fetch;
  compiler?: typeof compileSources;
};
type CatalogModel = {
  id: string;
  name: string;
  pricing: Record<string, unknown>;
  top_provider?: { max_completion_tokens?: number | null };
};
function rate(model: CatalogModel, key: string) {
  const values = [
    model.pricing[key],
    ...(
      (model.pricing.overrides as Record<string, unknown>[] | undefined) ?? []
    )
      .map((row) => row[key])
      .filter((v) => v !== undefined),
  ];
  if (
    values.some(
      (value) =>
        (typeof value !== "string" && typeof value !== "number") ||
        !Number.isFinite(Number(value)) ||
        Number(value) < 0,
    )
  )
    throw Error(`Invalid ${key} pricing for ${model.id}`);
  return Math.max(...values.map(Number)) * 1e6;
}
/** Runs only isolated model builds. Native gameplay and visual evaluation remain pending. */
export async function evaluateGeneration(
  source: Configuration,
  outputDirectory: string,
  options: Options = {},
) {
  const cap = options.aggregateCapMicros ?? 2_000_000,
    models = options.models ?? generationModels;
  const prompt = options.scenario?.prompt ?? generationPrompt;
  const specification =
    options.scenario?.specification ?? generationSpecification;
  const reviewerModel = options.reviewerModel ?? "openai/gpt-5.6-sol",
    maxOutputTokens = options.maxOutputTokens ?? 8000;
  if (!Number.isInteger(cap) || cap < 1000 || cap > 5_000_000)
    throw Error("Generation evaluation cap must be between $0.001 and $5.");
  if (
    !models.length ||
    models.length > 8 ||
    new Set(models).size !== models.length
  )
    throw Error("Select one to eight unique exact catalog model IDs.");
  if (
    !Number.isInteger(maxOutputTokens) ||
    maxOutputTokens < 512 ||
    maxOutputTokens > 16000
  )
    throw Error("Output limit must be between 512 and 16000 tokens.");
  if (
    options.repairLimit !== undefined &&
    ![0, 1].includes(options.repairLimit)
  )
    throw Error("Evaluation allows at most one repair round.");
  const output = path.resolve(outputDirectory);
  if (fs.existsSync(output))
    throw Error(
      "Use a fresh output directory; evaluation evidence cannot be overwritten.",
    );
  const existing = source
    .read()
    .profiles.find(
      (p) =>
        p.provider === "openrouter" &&
        p.baseUrl.replace(/\/$/, "") === endpoints.openrouter &&
        source.key(p.id),
    );
  if (!existing)
    throw Error("An existing in-memory OpenRouter key is required.");
  const transport = options.transport ?? fetch;
  const response = await transport(`${endpoints.openrouter}/models`, {
    signal: AbortSignal.timeout(15000),
    redirect: "error",
  });
  if (!response.ok)
    throw Error("Cannot verify current model catalog and pricing.");
  const catalog = (await response.json()).data as CatalogModel[];
  if (!Array.isArray(catalog)) throw Error("Invalid model catalog");
  const selected = [...new Set([...models, reviewerModel])].map((id) => {
    const entry = catalog.find((m) => m.id === id);
    if (!entry?.pricing) throw Error("Model/pricing unavailable: " + id);
    const inputRate = rate(entry, "prompt"),
      outputRate = rate(entry, "completion");
    const requestFee =
      entry.pricing.request === undefined ? 0 : rate(entry, "request");
    if (
      entry.top_provider?.max_completion_tokens &&
      entry.top_provider.max_completion_tokens < maxOutputTokens
    )
      throw Error("Output limit exceeds catalog maximum for " + id);
    return {
      entry,
      requestFee,
      profile: {
        id: randomUUID(),
        name: entry.name.slice(0, 80),
        provider: "openrouter" as const,
        baseUrl: endpoints.openrouter,
        model: id,
        inputRate,
        outputRate,
        maxOutputTokens,
        jsonMode: true,
      } satisfies Profile,
    };
  });
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.mkdirSync(output); // Exclusive ownership: simultaneous calls cannot share evidence.
  const catalogSnapshot = {
    fetchedAt: new Date().toISOString(),
    selected: selected.map(({ entry }) => entry),
  };
  fs.writeFileSync(
    path.join(output, "catalog.json"),
    JSON.stringify(catalogSnapshot, null, 2),
    { flag: "wx" },
  );
  const ledger: {
    model: string;
    trial: number;
    reservedMicros: number;
    at: string;
  }[] = [];
  const results: Record<string, unknown>[] = [];
  let reserved = 0,
    charged = 0,
    currentTrial = -1,
    trialReserved = 0,
    trialCap = 0;
  let budgetFailure: string | null = null;
  let dispatchFlags: boolean[] = [];
  const report = () => ({
    at: new Date().toISOString(),
    prompt,
    scope: "Forge_GenerationPilot",
    specification: specification("Forge_GenerationPilot"),
    models,
    reviewerModel,
    maxOutputTokens,
    repairLimit: options.repairLimit ?? 1,
    aggregateCapMicros: cap,
    reservedMicros: reserved,
    chargedMicros: charged,
    results,
    reservations: ledger,
    limits: [
      "One sample per candidate with a fixed approved specification; this does not evaluate planning.",
      "Builder and repair use the candidate; reviewer uses one fixed model for every trial, with no fallback.",
      "Reservations use UTF-8 request bytes and worst listed price overrides, are committed before dispatch, and never refunded. Provider billing is external; these are conservative estimates, not a provider-enforced cap.",
      "Ready_to_test means static validation only. Native gameplay, multiplayer and visual-quality verification remain pending.",
    ],
  });
  const progress = () => {
    const file = path.join(output, "progress.json");
    fs.writeFileSync(file + ".tmp", JSON.stringify(report(), null, 2));
    fs.renameSync(file + ".tmp", file);
  };
  const guarded = (async (address, init) => {
    if (String(address) !== `${endpoints.openrouter}/chat/completions`)
      throw Error("Unexpected evaluation endpoint");
    const body = JSON.parse(String(init?.body));
    const item = selected.find((item) => item.profile.model === body.model);
    if (!item || body.plugins?.length || body.tools?.length)
      throw Error("Unexpected evaluation model or paid tool request");
    const outputTokens = body.max_tokens ?? body.max_completion_tokens;
    if (
      !Number.isInteger(outputTokens) ||
      outputTokens > maxOutputTokens ||
      outputTokens < 1
    )
      throw Error("Unexpected output reservation");
    const estimate = Math.ceil(
      (Buffer.byteLength(JSON.stringify(body)) + 1024) *
        item.profile.inputRate +
        outputTokens * item.profile.outputRate +
        item.requestFee,
    );
    if (estimate + reserved > cap || estimate + trialReserved > trialCap) {
      budgetFailure =
        "Evaluation aggregate/trial reservation cap exhausted before dispatch";
      dispatchFlags.push(false);
      throw Error(budgetFailure);
    }
    dispatchFlags.push(true);
    reserved += estimate;
    trialReserved += estimate;
    ledger.push({
      model: body.model,
      trial: currentTrial,
      reservedMicros: estimate,
      at: new Date().toISOString(),
    });
    progress();
    return transport(address, init);
  }) as typeof fetch;
  progress();
  for (const [index, model] of models.entries()) {
    currentTrial = index;
    trialReserved = 0;
    dispatchFlags = [];
    budgetFailure = null;
    trialCap = Math.floor((cap - reserved) / (models.length - index));
    if (trialCap < 1000 || charged > cap) {
      results.push({
        model,
        skipped: "Aggregate budget unavailable",
        nativeVerification: "not_run",
      });
      progress();
      continue;
    }
    const trialDirectory = path.join(output, `trial-${index + 1}`),
      config = new Configuration(path.join(trialDirectory, "configuration"));
    const candidate = selected.find(
        (item) => item.profile.model === model,
      )!.profile,
      reviewer = selected.find(
        (item) => item.profile.model === reviewerModel,
      )!.profile;
    const profiles = [
      ...new Map(
        [candidate, reviewer].map((profile) => [profile.id, profile]),
      ).values(),
    ];
    config.save({
      profiles,
      routes: {
        planner: [],
        builder: [candidate.id],
        reviewer: [reviewer.id],
        repair: [candidate.id],
      },
      researchEnabled: false,
      budgetMicros: trialCap,
      repairLimit: options.repairLimit ?? 1,
    });
    for (const profile of profiles)
      config.setKey(profile.id, source.key(existing.id));
    const store = new GenerationStore(path.join(trialDirectory, "projects")),
      engine = new Engine(
        store,
        config,
        guarded,
        options.compiler ?? compileSources,
      );
    const project = engine.create(prompt);
    project.scope = "Forge_GenerationPilot";
    project.spec = validateSpec(specification(project.scope), project);
    project.stage = "review";
    store.save(project);
    engine.approve(project.id, project.revision);
    const started = Date.now();
    let dispatchError: string | null = null;
    try {
      engine.start(project.id, project.revision, "build");
      await engine.wait(project.id);
    } catch (error) {
      dispatchError = error instanceof Error ? error.message : String(error);
    }
    const result = store.get(project.id);
    // The production transport hides local exceptions as connection failures. These
    // calls never left this harness, so remove their estimated network charges.
    result.charges.forEach((charge, i) => {
      if (dispatchFlags[i] === false) {
        charge.chargedMicros = 0;
        charge.estimated = false;
        charge.billingSource = "configured-rate";
      }
    });
    if (budgetFailure) {
      result.error = budgetFailure;
      result.events.push({
        at: new Date().toISOString(),
        message:
          "Evaluation stopped before provider dispatch; the rejected request incurred zero provider charge.",
      });
    }
    store.save(result);
    const cost = result.charges.reduce(
      (sum, item) => sum + item.chargedMicros,
      0,
    );
    charged += cost;
    results.push({
      model,
      reviewerModel,
      projectId: project.id,
      trialDirectory: path.basename(trialDirectory),
      stage: result.stage,
      error: dispatchError ?? result.error,
      budgetSkipped: /budget|reservation cap/i.test(
        dispatchError ?? result.error ?? "",
      ),
      failure: result.failure ?? null,
      durationMs: Date.now() - started,
      trialCapMicros: trialCap,
      reservedMicros: trialReserved,
      chargedMicros: cost,
      attempts: result.charges.map((item) => ({
        phase: item.phase,
        model: item.model,
        status: item.status,
        chargedMicros: item.chargedMicros,
        estimated: item.estimated,
      })),
      completedBuildTasks: result.completedBuildTasks ?? [],
      files: result.artifact?.files.length ?? 0,
      sceneNodes: result.artifact?.scene.length ?? 0,
      staticFailures: result.checks.filter(
        (check) => check.status === "failed",
      ),
      nativeVerification: "not_run",
    });
    progress();
  }
  const final = report();
  fs.writeFileSync(
    path.join(output, "report.json"),
    JSON.stringify(final, null, 2),
    { flag: "wx" },
  );
  return final;
}
