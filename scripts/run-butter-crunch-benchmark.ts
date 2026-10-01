import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import {
  settingsSchema,
  providerSchema,
  specSchema,
  type Project,
  type Settings,
} from "../src/generation/schema";

export const benchmarkLimits = Object.freeze({
  ceilingMicros: 6_000_000,
  maxCeilingMicros: 10_000_000,
  headroomMicros: 400_000,
  defaultProjectMicros: 1_400_000,
  maxProjectMicros: 2_000_000,
  historicalReservationsMicros: 1_490_554,
  historicalChargedMicros: 161_094,
});
export const benchmarkWorkers = [
  "google/gemini-3.7-flash",
  "minimax/minimax-m3",
  "xiaomi/mimo-v2.5-pro",
  "x-ai/grok-build-0.1",
] as const;
const defaultPlannerReviewerModel = "google/gemini-3.7-flash";
const promptRelative =
  "tests/fixtures/asset-pipeline/butter-crunch-marketplace-v3/prompt.txt";
// Exact full hash is checked before any server mutation.
const frozenPromptSha256 =
  "591fb62a702e0b7c96925f36def1179cd8d9f7c21999cbe4ecf648cf2e48a0bd";
export type BenchmarkOptions = {
  mode?: "plan" | "build";
  plannerModel?: string;
  componentReviewerModel?: string;
  componentAdapterModel?: string;
  campaignCeilingMicros?: number;
  version?: number;
  model: (typeof benchmarkWorkers)[number];
  studioId: string;
  output: string;
  priorReservationsMicros: number;
  priorChargedMicros: number;
  budgetMicros?: number;
  root?: string;
  dataDirectory?: string;
  baseUrl?: string;
  workerRequestTimeoutMs?: number;
};
type Dependencies = {
  transport?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
};
export type AssetBenchmarkDefinition = {
  id: string;
  promptRelative: string;
  promptSha256: string;
  exportFilename: string;
  budgetPolicy: "cumulative-reservations" | "settled-plus-active";
  planGate: (raw: unknown) => string[];
};
const hash = (value: string | Buffer) =>
  createHash("sha256").update(value).digest("hex");
const campaignCeilingSchema = z
  .number()
  .int()
  .min(1000)
  .max(benchmarkLimits.maxCeilingMicros)
  .default(benchmarkLimits.ceilingMicros);
const json = (file: string, value: unknown) =>
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", { flag: "wx" });

/** Gate only: never edits, repairs, supplements or replaces the worker plan. */
export function butterCrunchPlanGate(raw: unknown): string[] {
  const parsed = specSchema.safeParse(raw);
  if (!parsed.success)
    return ["Plan does not satisfy the application specification schema"];
  const spec = parsed.data,
    needs = spec.assetNeeds ?? [],
    failures: string[] = [];
  if (spec.questions.length)
    failures.push(
      "Plan requests clarification; benchmark cannot author answers",
    );
  if (
    !needs.some(
      (need) =>
        need.kind === "Audio" &&
        need.required &&
        spec.requirements.some(
          (r) =>
            r.id === need.requirementId &&
            r.category === "audio" &&
            r.priority === "required",
        ),
    )
  )
    failures.push(
      "Missing required Audio asset need linked to a required audio requirement",
    );
  if (
    !needs.some(
      (need) =>
        ["Model", "MeshPart", "Image"].includes(need.kind) &&
        need.query.trim() &&
        need.role.trim() &&
        need.constraints.trim() &&
        spec.requirements.some((r) => r.id === need.requirementId),
    )
  )
    failures.push(
      "Missing executable Model/MeshPart/Image Marketplace visual search",
    );
  return failures;
}

export function reservationLedger(
  project: Pick<Project, "charges" | "reservedMicros">,
  priorReservationsMicros: number,
  campaignCeilingMicros: number = benchmarkLimits.ceilingMicros,
) {
  const ceilingMicros = campaignCeilingSchema.parse(campaignCeilingMicros);
  const amounts = project.charges.map((charge) => charge.reservedMicros);
  if (
    [priorReservationsMicros, project.reservedMicros, ...amounts].some(
      (n) => !Number.isSafeInteger(n) || n < 0,
    )
  )
    throw Error("Malformed reservation ledger; stop before additional calls");
  const completedReservationsMicros = amounts.reduce(
    (sum, amount) => sum + amount,
    0,
  );
  const committedMicros =
    priorReservationsMicros +
    completedReservationsMicros +
    project.reservedMicros;
  return {
    completedReservationsMicros,
    inFlightReservationsMicros: project.reservedMicros,
    committedMicros,
    shouldCancel:
      committedMicros >= ceilingMicros - benchmarkLimits.headroomMicros,
  };
}

/** Unknown calls already retain their full reservation as chargedMicros in Engine. */
export function monetaryLedger(
  project: Pick<Project, "charges" | "reservedMicros">,
  priorChargedMicros: number,
  campaignCeilingMicros: number = benchmarkLimits.ceilingMicros,
) {
  const ceilingMicros = campaignCeilingSchema.parse(campaignCeilingMicros);
  const liabilities = project.charges.map((charge) =>
    charge.billingSource === "reservation"
      ? Math.max(charge.reservedMicros, charge.chargedMicros)
      : charge.chargedMicros,
  );
  if (
    [priorChargedMicros, project.reservedMicros, ...liabilities].some(
      (n) => !Number.isSafeInteger(n) || n < 0,
    )
  )
    throw Error("Malformed monetary ledger; stop before additional calls");
  const settledAndUnknownMicros = liabilities.reduce((sum, n) => sum + n, 0);
  const committedMicros =
    priorChargedMicros + settledAndUnknownMicros + project.reservedMicros;
  if (!Number.isSafeInteger(committedMicros))
    throw Error("Monetary ledger overflow");
  return {
    settledAndUnknownMicros,
    inFlightReservationsMicros: project.reservedMicros,
    committedMicros,
    shouldCancel:
      committedMicros >= ceilingMicros - benchmarkLimits.headroomMicros,
  };
}

function sourceHashes(root: string) {
  const result: Record<string, string> = {};
  const walk = (directory: string) => {
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, item.name);
      if (item.isDirectory()) walk(file);
      else if (item.isFile())
        result[path.relative(root, file).replaceAll("\\", "/")] = hash(
          fs.readFileSync(file),
        );
    }
  };
  walk(path.join(root, "src"));
  for (const relative of [
    "scripts/run-butter-crunch-benchmark.ts",
    "scripts/run-marketplace-diversity-benchmark.ts",
    "package.json",
    "package-lock.json",
    "plugin/Forge.plugin.luau",
  ])
    result[relative] = hash(fs.readFileSync(path.join(root, relative)));
  return result;
}

export async function runButterCrunchBenchmark(
  options: BenchmarkOptions,
  dependencies: Dependencies = {},
) {
  return runAssetBenchmark(
    options,
    {
      id: "butter-crunch-marketplace",
      promptRelative,
      promptSha256: frozenPromptSha256,
      exportFilename: "Takko-Butter-Crunch.rbxlx",
      budgetPolicy: "cumulative-reservations",
      planGate: butterCrunchPlanGate,
    },
    dependencies,
  );
}

export async function runAssetBenchmark(
  options: BenchmarkOptions,
  definition: AssetBenchmarkDefinition,
  dependencies: Dependencies = {},
) {
  const mode = z.enum(["plan", "build"]).default("build").parse(options.mode);
  const componentReviewerModel = z
    .string()
    .trim()
    .min(1)
    .max(160)
    .optional()
    .parse(options.componentReviewerModel);
  const componentAdapterModel = z
    .string()
    .trim()
    .min(1)
    .max(160)
    .optional()
    .parse(options.componentAdapterModel);
  const campaignCeilingMicros = campaignCeilingSchema.parse(
    options.campaignCeilingMicros,
  );
  const plannerModel = z
    .string()
    .trim()
    .min(1)
    .max(160)
    .default(defaultPlannerReviewerModel)
    .parse(options.plannerModel);
  const version = z
    .number()
    .int()
    .min(4)
    .max(100)
    .parse(options.version ?? 4);
  if (!options.output.trim())
    throw Error("An explicit fresh output directory is required");
  const root = path.resolve(options.root ?? "."),
    output = path.resolve(root, options.output);
  const dataDirectory = path.resolve(
    root,
    options.dataDirectory ?? ".forge/asset-loop-runtime",
  );
  const baseUrl = options.baseUrl ?? "http://127.0.0.1:4324";
  const workerRequestTimeoutMs = providerSchema.shape.requestTimeoutMs.parse(
    options.workerRequestTimeoutMs,
  );
  if (!/^http:\/\/127\.0\.0\.1:\d{4,5}$/.test(baseUrl))
    throw Error("Benchmark requires an explicit loopback HTTP port");
  const port = Number(new URL(baseUrl).port);
  if (port < 1024 || port > 65535)
    throw Error("Benchmark requires an unprivileged valid port");
  if (baseUrl !== "http://127.0.0.1:4324" && !options.dataDirectory?.trim())
    throw Error(
      "An alternate test service requires its explicit data directory",
    );
  if (!benchmarkWorkers.includes(options.model))
    throw Error("Choose one explicit supported worker model");
  z.uuid().parse(options.studioId);
  const budgetMicros =
    options.budgetMicros ?? benchmarkLimits.defaultProjectMicros;
  if (
    !Number.isSafeInteger(budgetMicros) ||
    budgetMicros < 1000 ||
    budgetMicros > benchmarkLimits.maxProjectMicros
  )
    throw Error("Per-run budget must be 1000..2000000 micros");
  if (
    !Number.isSafeInteger(options.priorReservationsMicros) ||
    options.priorReservationsMicros <
      benchmarkLimits.historicalReservationsMicros ||
    !Number.isSafeInteger(options.priorChargedMicros) ||
    options.priorChargedMicros < benchmarkLimits.historicalChargedMicros
  )
    throw Error(
      "Prior ledger must include all v1-v3 costs and every later trial",
    );
  if (
    (definition.budgetPolicy === "settled-plus-active"
      ? options.priorChargedMicros
      : options.priorReservationsMicros) +
      budgetMicros +
      benchmarkLimits.headroomMicros >
    campaignCeilingMicros
  )
    throw Error(
      "Insufficient conservative budget for another trial plus cancellation headroom",
    );
  const promptBytes = fs.readFileSync(
    path.join(root, definition.promptRelative),
  );
  if (hash(promptBytes) !== definition.promptSha256)
    throw Error("Immutable benchmark prompt hash mismatch");
  if (fs.existsSync(output))
    throw Error(
      "Benchmark output already exists; a fresh directory is required",
    );
  const transport = dependencies.transport ?? fetch;
  const sleep =
    dependencies.sleep ??
    ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const now = dependencies.now ?? Date.now;
  const api = async <T>(
    route: string,
    method = "GET",
    body?: unknown,
  ): Promise<T> => {
    const response = await transport(baseUrl + route, {
      method,
      ...(body !== undefined
        ? {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        : {}),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok)
      throw Error(
        `Takko ${method} ${route}: HTTP ${response.status} ${(await response.text()).slice(0, 1500)}`,
      );
    return response.json() as Promise<T>;
  };
  const publicSettings = await api<
    Omit<Settings, "profiles"> & {
      profiles: (Settings["profiles"][number] & { hasKey?: boolean })[];
    }
  >("/api/models");
  const original = settingsSchema.parse({
    ...publicSettings,
    profiles: publicSettings.profiles.map(
      ({ hasKey: _, ...profile }) => profile,
    ),
  });
  const selectProfile = (model: string) => {
    const matches = publicSettings.profiles.filter(
      (profile) => profile.model === model,
    );
    if (matches.length !== 1 || matches[0].hasKey !== true)
      throw Error("Expected one configured keyed profile for " + model);
    return matches[0];
  };
  const worker = selectProfile(options.model),
    planner = selectProfile(plannerModel),
    reviewer = selectProfile(defaultPlannerReviewerModel),
    componentReviewer =
      componentReviewerModel === undefined
        ? undefined
        : selectProfile(componentReviewerModel),
    componentAdapter =
      componentAdapterModel === undefined
        ? undefined
        : selectProfile(componentAdapterModel);
  const projectList =
    await api<{ id: string; stage: string; jobId?: string | null }[]>(
      "/api/projects",
    );
  if (
    projectList.some(
      (p) =>
        p.jobId || ["planning", "generating", "repairing"].includes(p.stage),
    )
  )
    throw Error("Another generation is active; benchmark must be serialized");
  // Validate every model and active-job precondition before filesystem or API mutations.
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.mkdirSync(output);
  fs.writeFileSync(path.join(output, "prompt.txt"), promptBytes, {
    flag: "wx",
  });
  json(path.join(output, "settings-before-public.json"), publicSettings);
  const trialSettings: Settings = {
    ...original,
    profiles: original.profiles.map((p) =>
      p.id === worker.id && workerRequestTimeoutMs !== undefined
        ? { ...p, requestTimeoutMs: workerRequestTimeoutMs }
        : p,
    ),
    routes: {
      planner: [planner.id],
      builder: [worker.id],
      reviewer: [reviewer.id],
      ...(componentReviewer
        ? { componentReviewer: [componentReviewer.id] }
        : {}),
      ...(componentAdapter ? { componentAdapter: [componentAdapter.id] } : {}),
      repair: [worker.id],
      research: [],
    },
    researchEnabled: false,
    repairLimit: 1,
    budgetMicros,
    reservationBudgetMicros: budgetMicros,
  };
  if (definition.budgetPolicy === "settled-plus-active")
    delete trialSettings.reservationBudgetMicros;
  // Explicit adapter profiles keep their own options. When the adapter inherits
  // (or selects) the worker, report any applied worker timeout override too.
  const resolvedComponentAdapter = {
    ...(componentAdapter ?? worker),
    ...trialSettings.profiles.find(
      (profile) => profile.id === (componentAdapter ?? worker).id,
    )!,
  };
  const spendingLedger = (p: Project) =>
    definition.budgetPolicy === "settled-plus-active"
      ? monetaryLedger(p, options.priorChargedMicros, campaignCeilingMicros)
      : reservationLedger(
          p,
          options.priorReservationsMicros,
          campaignCeilingMicros,
        );
  json(path.join(output, "experiment.json"), {
    version,
    mode,
    benchmark: definition.id,
    budgetPolicy: definition.budgetPolicy,
    createdAt: new Date(now()).toISOString(),
    model: options.model,
    worker,
    planner,
    reviewer,
    componentReviewer: componentReviewer ?? reviewer,
    componentReviewerModel: (componentReviewer ?? reviewer).model,
    componentReviewerOverride: componentReviewer !== undefined,
    componentAdapter: resolvedComponentAdapter,
    componentAdapterModel: resolvedComponentAdapter.model,
    componentAdapterOverride: componentAdapter !== undefined,
    campaignCeilingMicros,
    plannerModel: planner.model,
    reviewerModel: reviewer.model,
    plannerReviewer: planner.id === reviewer.id ? planner : null,
    studioId: options.studioId,
    baseUrl,
    dataDirectory,
    limits: { ...benchmarkLimits, ceilingMicros: campaignCeilingMicros },
    priorReservationsMicros: options.priorReservationsMicros,
    priorChargedMicros: options.priorChargedMicros,
    promptFileSha256: hash(promptBytes),
    submittedRequestSha256: hash(promptBytes.toString("utf8").trim()),
    sourceHashes: sourceHashes(root),
    settings: trialSettings,
    qualityScore: null,
    manualGameAssetOrPlanRescue: false,
    budgetEnforcement:
      definition.budgetPolicy === "settled-plus-active"
        ? `Serialized trial admission uses all prior settled charges/unknown-call liabilities plus the full project cap and 400000 micros headroom within the recorded ${campaignCeilingMicros} micros aggregate ceiling. Engine checks settled charges + active + next reservation before dispatch; unknown usage retains full reservation. Historical cumulative reservations remain recorded separately. Polling is defense in depth; no concurrent external generation is permitted during this campaign.`
        : "App pre-dispatch cumulative reservation cap bounds this trial. Admission requires prior reservations plus this cap plus 400000 micros headroom within the aggregate ceiling. 100ms monitoring is defense in depth, not an atomic budget guarantee. No new trials without updated prior ledger.",
  });
  let project: Project | undefined,
    error: string | null = null,
    settingsChanged = false,
    routesRestored = false;
  let planAccepted: boolean | null = null;
  let cancellationReason: string | null = null,
    stopConfirmed = true;
  const readProject = async () => {
    project = await api<Project>(`/api/projects/${project!.id}`);
    return project;
  };
  const waitForIdle = async (cancelling = false) => {
    const deadline = now() + (cancelling ? 180_000 : 30 * 60_000);
    while (true) {
      await readProject();
      const ledger = spendingLedger(project!);
      if (!project!.jobId) {
        stopConfirmed = true;
        if (project!.reservedMicros !== 0)
          throw Error("Stopped job retains an in-flight reservation");
        return;
      }
      stopConfirmed = false;
      if (!cancelling && (ledger.shouldCancel || now() >= deadline)) {
        cancellationReason = ledger.shouldCancel
          ? "Budget ceiling reached cancellation headroom"
          : "Bounded benchmark duration exhausted";
        fs.appendFileSync(
          path.join(output, "monitor.jsonl"),
          JSON.stringify({
            at: new Date(now()).toISOString(),
            reason: cancellationReason,
            ledger,
          }) + "\n",
        );
        await api(`/api/projects/${project!.id}/cancel`, "POST");
        await waitForIdle(true);
        throw Error(cancellationReason);
      }
      if (cancelling && now() >= deadline)
        throw Error(
          "Cancellation not confirmed; no further trial is authorized",
        );
      await sleep(100);
    }
  };
  try {
    settingsChanged = true; // Even a lost PUT response requires restoration.
    await api("/api/models", "PUT", trialSettings);
    project = await api<Project>("/api/projects", "POST", {
      request: promptBytes.toString("utf8"),
    });
    json(path.join(output, "created-project.json"), project);
    if (mode === "build")
      project = await api<Project>(
        `/api/projects/${project.id}/asset-studio`,
        "POST",
        { revision: project.revision, studioId: options.studioId },
      );
    await api(`/api/projects/${project.id}/plan`, "POST", {
      revision: project.revision,
    });
    await waitForIdle();
    json(path.join(output, "plan-project.json"), project);
    const gateFailures =
      project.stage === "review"
        ? definition.planGate(project.spec)
        : ["Planning ended at " + project.stage];
    planAccepted = gateFailures.length === 0;
    json(path.join(output, "plan-gate.json"), {
      passed: gateFailures.length === 0,
      failures: gateFailures,
      planSha256: hash(JSON.stringify(project.spec)),
      changedPlan: false,
    });
    if (project.stage !== "review")
      throw Error("Planning ended at " + project.stage);
    if (gateFailures.length)
      throw Error(
        "External plan gate rejected unchanged plan: " +
          gateFailures.join("; "),
      );
    if (mode === "build") {
      if (spendingLedger(project).shouldCancel)
        throw Error("Conservative budget leaves no room to start build");
      project = await api<Project>(
        `/api/projects/${project.id}/approve`,
        "POST",
        { revision: project.revision },
      );
      await api(`/api/projects/${project.id}/build`, "POST", {
        revision: project.revision,
      });
      await waitForIdle();
      if (project.stage !== "ready_to_test" && project.stage !== "verified")
        throw Error(
          "Build ended at " +
            project.stage +
            ": " +
            (project.error ?? "No game artifact ready"),
        );
      const exported = await transport(
        `${baseUrl}/api/projects/${project.id}/export`,
        { signal: AbortSignal.timeout(15_000) },
      );
      if (!exported.ok)
        throw Error("Artifact export failed: HTTP " + exported.status);
      fs.writeFileSync(
        path.join(output, definition.exportFilename),
        Buffer.from(await exported.arrayBuffer()),
        { flag: "wx" },
      );
    }
  } catch (failure) {
    error = String(failure);
    if (project) {
      try {
        await readProject();
        if (project!.jobId) {
          cancellationReason ??= "Benchmark controller stopped after error";
          await api(`/api/projects/${project!.id}/cancel`, "POST");
          await waitForIdle(true);
        }
      } catch (stopError) {
        stopConfirmed = false;
        error += "; stop verification: " + String(stopError);
      }
    }
  } finally {
    if (settingsChanged) {
      try {
        await api("/api/models", "PUT", original);
        const restored = await api<typeof publicSettings>("/api/models");
        const restoredSettings = settingsSchema.parse({
          ...restored,
          profiles: restored.profiles.map(
            ({ hasKey: _, ...profile }) => profile,
          ),
        });
        routesRestored =
          JSON.stringify(restoredSettings) === JSON.stringify(original);
        if (!routesRestored)
          throw Error("Settings restoration did not match frozen original");
      } catch (restoreError) {
        error =
          (error ? error + "; " : "") +
          "Settings restoration failed: " +
          String(restoreError);
      }
    }
    if (project) {
      json(path.join(output, "final-project.json"), project);
      const evidenceFiles = [
        [
          path.join(dataDirectory, project.id + ".json"),
          "final-project-from-disk.json",
        ],
        [
          path.join(dataDirectory, "traces", project.id + ".json"),
          "model-trace.json",
        ],
        [
          path.join(dataDirectory, "traces", project.id + ".events.jsonl"),
          "model-events.jsonl",
        ],
      ];
      for (const [source, destination] of evidenceFiles)
        if (fs.existsSync(source))
          fs.copyFileSync(
            source,
            path.join(output, destination),
            fs.constants.COPYFILE_EXCL,
          );
      const mediaDirectory = path.join(
        dataDirectory,
        "asset-evidence",
        project.id,
      );
      if (fs.existsSync(mediaDirectory))
        fs.cpSync(mediaDirectory, path.join(output, "asset-evidence"), {
          recursive: true,
          errorOnExist: true,
          force: false,
        });
    }
    const ledger = project
      ? reservationLedger(
          project,
          options.priorReservationsMicros,
          campaignCeilingMicros,
        )
      : null;
    const chargedMicros =
      project?.charges.reduce((sum, charge) => sum + charge.chargedMicros, 0) ??
      0;
    const result = {
      version,
      mode,
      planner,
      reviewer,
      componentReviewer: componentReviewer ?? reviewer,
      componentReviewerModel: (componentReviewer ?? reviewer).model,
      componentReviewerOverride: componentReviewer !== undefined,
      componentAdapter: resolvedComponentAdapter,
      componentAdapterModel: resolvedComponentAdapter.model,
      componentAdapterOverride: componentAdapter !== undefined,
      campaignCeilingMicros,
      plannerModel: planner.model,
      reviewerModel: reviewer.model,
      planAccepted,
      benchmark: definition.id,
      budgetPolicy: definition.budgetPolicy,
      monetaryLedger: project
        ? monetaryLedger(
            project,
            options.priorChargedMicros,
            campaignCeilingMicros,
          )
        : null,
      model: options.model,
      projectId: project?.id ?? null,
      stage: project?.stage ?? "not_started",
      error,
      failure: project?.failure ?? null,
      cancellationReason,
      routesRestored,
      noFurtherCallsPending: stopConfirmed && !project?.jobId,
      priorReservationsMicros: options.priorReservationsMicros,
      priorChargedMicros: options.priorChargedMicros,
      reservedMicros: ledger?.completedReservationsMicros ?? 0,
      inFlightReservationsMicros: ledger?.inFlightReservationsMicros ?? 0,
      combinedReservationsMicros:
        ledger?.committedMicros ?? options.priorReservationsMicros,
      chargedMicros,
      combinedChargedMicros: options.priorChargedMicros + chargedMicros,
      charges: project?.charges ?? [],
      requiresReconciliation:
        project?.assetPipeline?.requiresReconciliation === true,
      assetEntries: project?.assetPipeline?.entries ?? [],
      artifactProduced:
        mode === "build" &&
        !!project?.artifact &&
        ["ready_to_test", "verified"].includes(project.stage),
      finishedGame: false,
      qualityScore: null,
      nativeGameplayVerification: "not run by this harness",
      manualRescue: false,
    };
    json(path.join(output, "results.json"), result);
  }
  const result = JSON.parse(
    fs.readFileSync(path.join(output, "results.json"), "utf8"),
  );
  return result as {
    error: string | null;
    noFurtherCallsPending: boolean;
    routesRestored: boolean;
    [key: string]: unknown;
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const argumentsByName = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 2) {
    const name = process.argv[index],
      value = process.argv[index + 1];
    if (
      !value ||
      ![
        "--model",
        "--studio",
        "--out",
        "--prior-reservations",
        "--prior-charged",
        "--budget",
        "--version",
        "--mode",
        "--planner-model",
        "--component-reviewer-model",
        "--component-adapter-model",
        "--campaign-ceiling",
      ].includes(name) ||
      argumentsByName.has(name)
    )
      throw Error(
        "Usage: --model MODEL --studio UUID --out FRESH_DIRECTORY --prior-reservations MICROS --prior-charged MICROS [--budget MICROS] [--version INTEGER] [--mode plan|build] [--planner-model MODEL] [--component-reviewer-model MODEL] [--component-adapter-model MODEL] [--campaign-ceiling MICROS (maximum 10000000)]",
      );
    argumentsByName.set(name, value);
  }
  const result = await runButterCrunchBenchmark({
    ...(argumentsByName.has("--mode")
      ? { mode: argumentsByName.get("--mode") as BenchmarkOptions["mode"] }
      : {}),
    ...(argumentsByName.has("--planner-model")
      ? { plannerModel: argumentsByName.get("--planner-model") }
      : {}),
    ...(argumentsByName.has("--component-reviewer-model")
      ? {
          componentReviewerModel: argumentsByName.get(
            "--component-reviewer-model",
          ),
        }
      : {}),
    ...(argumentsByName.has("--campaign-ceiling")
      ? {
          campaignCeilingMicros: Number(
            argumentsByName.get("--campaign-ceiling"),
          ),
        }
      : {}),
    ...(argumentsByName.has("--component-adapter-model")
      ? {
          componentAdapterModel: argumentsByName.get(
            "--component-adapter-model",
          ),
        }
      : {}),
    ...(argumentsByName.has("--version")
      ? { version: Number(argumentsByName.get("--version")) }
      : {}),
    model: argumentsByName.get("--model") as BenchmarkOptions["model"],
    studioId: argumentsByName.get("--studio") ?? "",
    output: argumentsByName.get("--out") ?? "",
    priorReservationsMicros: Number(
      argumentsByName.get("--prior-reservations"),
    ),
    priorChargedMicros: Number(argumentsByName.get("--prior-charged")),
    ...(argumentsByName.has("--budget")
      ? { budgetMicros: Number(argumentsByName.get("--budget")) }
      : {}),
  });
  console.log(JSON.stringify(result, null, 2));
  if (result.error || !result.routesRestored || !result.noFurtherCallsPending)
    process.exitCode = 1;
}
