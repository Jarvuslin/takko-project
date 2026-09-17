import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  benchmarkLimits,
  butterCrunchPlanGate,
  reservationLedger,
  runButterCrunchBenchmark,
  runAssetBenchmark,
  monetaryLedger,
} from "../scripts/run-butter-crunch-benchmark";
import {
  diversityCases,
  diversityPlanGate,
} from "../scripts/run-marketplace-diversity-benchmark";
import { newProject } from "../src/generation/store";
import { profile, specification } from "./generation-fixtures";
import type { Charge, Settings, Profile } from "../src/generation/schema";

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0))
    fs.rmSync(directory, { recursive: true, force: true });
});
function spec() {
  const value = specification(
    "Offline Butter Crunch harness fixture",
    "Fixture",
  );
  value.requirements.push({
    ...value.requirements[0],
    id: "audio",
    category: "audio",
    description: "Required crunch sound",
  });
  value.assetNeeds = [
    {
      id: "crunch",
      requirementId: "audio",
      role: "Crunch audio",
      kind: "Audio",
      query: "food crunch",
      constraints: "Short audible crunch",
      required: true,
      position: [0, 0, 0],
      maxSize: 5,
    },
    {
      id: "butter",
      requirementId: "core",
      role: "Butter visual",
      kind: "Model",
      query: "butter food",
      constraints: "Safe compact food prop",
      required: false,
      position: [0, 0, 0],
      maxSize: 5,
    },
  ];
  for (const need of value.assetNeeds)
    need.intent = {
      experienceRole: "Fixture interaction feedback",
      interaction:
        "Player presses the object, waits for completion, then receives feedback",
      reusableFeatures: ["existing behavior", "animation", "audio"],
      relatedRequirementIds: [need.requirementId],
    };
  return value;
}
function charge(reservedMicros = 100_000): Charge {
  return {
    phase: "planner",
    profileId: "fixture",
    model: "fixture",
    reservedMicros,
    chargedMicros: 100,
    estimated: false,
    billingSource: "provider",
    inputTokens: 100,
    outputTokens: 100,
    status: "ok",
    at: "2026-09-16T00:00:00Z",
  };
}
function setup(
  mode:
    | "success"
    | "gate"
    | "budget"
    | "build-error"
    | "planning-error" = "success",
  initialComponentRoute = false,
) {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "takko-butter-harness-"),
  );
  directories.push(directory);
  const worker = {
    ...profile("openrouter"),
    model: "minimax/minimax-m3",
    baseUrl: "https://openrouter.ai/api/v1",
  };
  const planner = {
    ...profile("openrouter"),
    model: "google/gemini-3.7-flash",
    baseUrl: "https://openrouter.ai/api/v1",
  };
  const original: Settings = {
    profiles: [worker, planner],
    routes: {
      builder: [planner.id],
      planner: [planner.id],
      reviewer: [worker.id],
      repair: [worker.id],
      ...(initialComponentRoute
        ? { componentReviewer: [worker.id], componentAdapter: [planner.id] }
        : {}),
    },
    budgetMicros: 2_000_000,
    repairLimit: 2,
    researchEnabled: true,
  };
  let current = structuredClone(original);
  const project = newProject("placeholder", 1_400_000),
    calls: { route: string; method: string; body: any }[] = [];
  const transport = vi.fn<typeof fetch>(async (url, init) => {
    const route = new URL(String(url)).pathname,
      method = init?.method ?? "GET",
      body = init?.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ route, method, body });
    let value: unknown;
    if (route === "/api/models") {
      if (method === "PUT") current = body;
      value = {
        ...current,
        profiles: current.profiles.map((p) => ({ ...p, hasKey: true })),
      };
    } else if (route === "/api/projects" && method === "GET") value = [];
    else if (route === "/api/projects" && method === "POST") {
      project.request = body.request.trim();
      value = project;
    } else if (route.endsWith("/asset-studio")) {
      project.assetStudioId = body.studioId;
      value = project;
    } else if (route.endsWith("/plan")) {
      project.spec = spec();
      if (mode === "gate") project.spec.assetNeeds = [];
      project.stage = "review";
      project.charges.push(charge());
      if (mode === "planning-error") {
        project.stage = "failed";
        project.spec = null;
        project.error = "Original planner failure fixture";
      }
      if (mode === "budget") {
        project.charges = [charge(1_300_000)];
        project.reservedMicros = 400_000;
        project.jobId = "inflight-fixture";
        project.stage = "planning";
      }
      value = project;
    } else if (route.endsWith("/approve")) {
      project.approvedRevision = project.revision;
      value = project;
    } else if (route.endsWith("/build")) {
      if (mode === "build-error") {
        project.jobId = "inflight-fixture";
        project.stage = "generating";
        return new Response("mock disconnection", { status: 503 });
      }
      project.stage = "ready_to_test";
      project.artifact = { files: [], scene: [], assets: [], coverage: [] };
      project.charges.push({ ...charge(), phase: "builder" });
      value = project;
    } else if (route.endsWith("/cancel")) {
      project.stage = "interrupted";
      project.jobId = null;
      if (project.reservedMicros)
        project.charges.push(charge(project.reservedMicros));
      project.reservedMicros = 0;
      value = project;
    } else if (route.endsWith("/export"))
      return new Response("<roblox>offline export fixture</roblox>");
    else value = project;
    return new Response(JSON.stringify(value), { status: 200 });
  });
  const options = {
    model: "minimax/minimax-m3" as const,
    studioId: "11111111-1111-4111-8111-111111111111",
    output: path.join(directory, "run"),
    dataDirectory: directory,
    priorReservationsMicros:
      mode === "budget"
        ? 4_000_000
        : benchmarkLimits.historicalReservationsMicros,
    priorChargedMicros: benchmarkLimits.historicalChargedMicros,
  };
  return {
    directory,
    original,
    options,
    project,
    calls,
    transport,
    settings: () => current,
  };
}

describe("Butter Crunch benchmark controller (offline HTTP fixtures only)", () => {
  it.each([undefined, "google/gemini-3.7-flash"])(
    "applies only an explicit adapter override (%s) and restores all original routes",
    async (componentAdapterModel) => {
      const s = setup("success", true);
      const result = await runButterCrunchBenchmark(
        { ...s.options, componentAdapterModel },
        { transport: s.transport },
      );
      const trial = s.calls.find(
        (c) => c.route === "/api/models" && c.method === "PUT",
      )!.body;
      if (componentAdapterModel)
        expect(trial.routes.componentAdapter).toEqual([
          s.original.profiles[1].id,
        ]);
      else expect(trial.routes).not.toHaveProperty("componentAdapter");
      expect(trial.routes.builder).toEqual([s.original.profiles[0].id]);
      expect(trial.routes.reviewer).toEqual([s.original.profiles[1].id]);
      expect(trial.routes).not.toHaveProperty("componentReviewer");
      const expected = {
        componentAdapterModel: componentAdapterModel ?? "minimax/minimax-m3",
        componentAdapterOverride: !!componentAdapterModel,
        componentAdapter: {
          id: s.original.profiles[componentAdapterModel ? 1 : 0].id,
        },
      };
      expect(result).toMatchObject(expected);
      expect(
        JSON.parse(
          fs.readFileSync(
            path.join(s.options.output, "experiment.json"),
            "utf8",
          ),
        ),
      ).toMatchObject(expected);
      expect(result.chargedMicros).toBe(200);
      expect(s.settings()).toEqual(s.original);
    },
  );
  it.each([undefined, "google/gemini-3.7-flash", "minimax/minimax-m3"])(
    "records effective adapter options with a worker timeout override: %s",
    async (componentAdapterModel) => {
      const s = setup();
      const result = await runButterCrunchBenchmark(
        { ...s.options, componentAdapterModel, workerRequestTimeoutMs: 300000 },
        { transport: s.transport },
      );
      const trial = s.calls.find(
        (c) => c.route === "/api/models" && c.method === "PUT",
      )!.body;
      const selectedAdapter = result.componentAdapter as Profile;
      const effective = trial.profiles.find(
        (p: any) => p.id === selectedAdapter.id,
      );
      expect(selectedAdapter).toMatchObject(effective);
      expect(selectedAdapter.requestTimeoutMs).toBe(
        componentAdapterModel === "google/gemini-3.7-flash"
          ? undefined
          : 300000,
      );
      expect(s.settings()).toEqual(s.original);
    },
  );
  it.each(["gate", "build-error"] as const)(
    "restores explicit adapter routing after %s failure and keeps the charge ledger",
    async (mode) => {
      const s = setup(mode, true);
      const result = await runButterCrunchBenchmark(
        { ...s.options, componentAdapterModel: "google/gemini-3.7-flash" },
        { transport: s.transport, sleep: async () => {} },
      );
      expect(result.error).toBeTruthy();
      expect(result.routesRestored).toBe(true);
      expect(result.chargedMicros).toBeGreaterThan(0);
      expect(s.settings()).toEqual(s.original);
    },
  );
  it.each(["missing", "unkeyed", "duplicate"])(
    "rejects a %s explicit adapter before output/settings/project mutations",
    async (failure) => {
      const s = setup();
      const transport = vi.fn<typeof fetch>(async (url, init) => {
        const data = await (await s.transport(url, init)).json();
        if (new URL(String(url)).pathname === "/api/models") {
          if (failure === "unkeyed") data.profiles[0].hasKey = false;
          if (failure === "duplicate")
            data.profiles.push({ ...data.profiles[0], id: profile().id });
        }
        return Response.json(data);
      });
      await expect(
        runButterCrunchBenchmark(
          {
            ...s.options,
            model: "google/gemini-3.7-flash",
            componentAdapterModel:
              failure === "missing" ? "missing/adapter" : "minimax/minimax-m3",
          },
          { transport },
        ),
      ).rejects.toThrow("configured keyed profile");
      expect(s.calls.every((c) => c.method === "GET")).toBe(true);
      expect(fs.existsSync(s.options.output)).toBe(false);
      expect(s.settings()).toEqual(s.original);
    },
  );
  it.each([undefined, "minimax/minimax-m3"])(
    "uses only an explicit component reviewer override (%s) and restores the original route",
    async (componentReviewerModel) => {
      const s = setup("success", true);
      const result = await runButterCrunchBenchmark(
        { ...s.options, componentReviewerModel },
        { transport: s.transport },
      );
      const trial = s.calls.find(
        (call) => call.route === "/api/models" && call.method === "PUT",
      )!.body;
      expect(trial.routes.planner).toEqual([s.original.profiles[1].id]);
      expect(trial.routes.reviewer).toEqual([s.original.profiles[1].id]);
      expect(trial.routes.builder).toEqual([s.original.profiles[0].id]);
      expect(trial.routes.repair).toEqual([s.original.profiles[0].id]);
      if (componentReviewerModel)
        expect(trial.routes.componentReviewer).toEqual([
          s.original.profiles[0].id,
        ]);
      else expect(trial.routes).not.toHaveProperty("componentReviewer");
      const expected = {
        componentReviewerModel:
          componentReviewerModel ?? "google/gemini-3.7-flash",
        componentReviewerOverride: !!componentReviewerModel,
        componentReviewer: {
          id: s.original.profiles[componentReviewerModel ? 0 : 1].id,
        },
        campaignCeilingMicros: 6_000_000,
      };
      expect(result).toMatchObject(expected);
      const experiment = JSON.parse(
        fs.readFileSync(path.join(s.options.output, "experiment.json"), "utf8"),
      );
      expect(experiment).toMatchObject(expected);
      expect(experiment.limits.ceilingMicros).toBe(6_000_000);
      expect(s.settings()).toEqual(s.original);
    },
  );

  it.each(["missing", "unkeyed", "duplicate"])(
    "rejects a %s component reviewer before output/settings/project mutation",
    async (failure) => {
      const s = setup();
      const transport = vi.fn<typeof fetch>(async (url, init) => {
        const data = await (await s.transport(url, init)).json();
        if (new URL(String(url)).pathname === "/api/models") {
          if (failure === "unkeyed") data.profiles[0].hasKey = false;
          if (failure === "duplicate")
            data.profiles.push({ ...data.profiles[0], id: profile().id });
        }
        return Response.json(data);
      });
      await expect(
        runButterCrunchBenchmark(
          {
            ...s.options,
            model: "google/gemini-3.7-flash",
            componentReviewerModel:
              failure === "missing" ? "missing/reviewer" : "minimax/minimax-m3",
          },
          { transport },
        ),
      ).rejects.toThrow("configured keyed profile");
      expect(s.calls.every((call) => call.method === "GET")).toBe(true);
      expect(fs.existsSync(s.options.output)).toBe(false);
      expect(s.settings()).toEqual(s.original);
    },
  );

  it.each([
    { componentReviewerModel: "" },
    { componentReviewerModel: " " },
    { componentReviewerModel: null },
    { componentReviewerModel: 1 },
    { componentReviewerModel: "x".repeat(161) },
    { componentAdapterModel: "" },
    { componentAdapterModel: " " },
    { componentAdapterModel: null },
    { componentAdapterModel: 1 },
    { componentAdapterModel: "x".repeat(161) },
    { campaignCeilingMicros: 0 },
    { campaignCeilingMicros: 10_000_001 },
    { campaignCeilingMicros: 6_000_000.5 },
    { campaignCeilingMicros: "10000000" },
    { campaignCeilingMicros: null },
    { campaignCeilingMicros: NaN },
    { campaignCeilingMicros: Infinity },
  ])(
    "rejects invalid explicit reviewer/ceiling configuration before any requests: %j",
    async (invalid) => {
      const s = setup();
      await expect(
        runButterCrunchBenchmark({ ...s.options, ...invalid } as any, {
          transport: s.transport,
        }),
      ).rejects.toThrow();
      expect(s.transport).not.toHaveBeenCalled();
      expect(fs.existsSync(s.options.output)).toBe(false);
    },
  );

  it.each(["cumulative-reservations", "settled-plus-active"] as const)(
    "uses the explicit ceiling in admission and recorded ledgers for %s",
    async (budgetPolicy) => {
      const s = setup();
      const definition = {
        id: "ceiling-offline-fixture",
        promptRelative:
          "benchmarks/fixtures/marketplace-diversity-v1/combat-training.txt",
        promptSha256: diversityCases["combat-training"],
        exportFilename: "fixture.rbxlx",
        budgetPolicy,
        planGate: diversityPlanGate,
      };
      const options = {
        ...s.options,
        priorReservationsMicros: 6_500_000,
        priorChargedMicros: 6_500_000,
      };
      await expect(
        runAssetBenchmark(options, definition, { transport: s.transport }),
      ).rejects.toThrow("Insufficient conservative budget");
      expect(s.transport).not.toHaveBeenCalled();
      const result = await runAssetBenchmark(
        { ...options, campaignCeilingMicros: 10_000_000 },
        definition,
        { transport: s.transport },
      );
      expect(result).toMatchObject({
        campaignCeilingMicros: 10_000_000,
        error: null,
        routesRestored: true,
        monetaryLedger: { shouldCancel: false },
      });
      const experiment = JSON.parse(
        fs.readFileSync(path.join(s.options.output, "experiment.json"), "utf8"),
      );
      expect(experiment.limits.ceilingMicros).toBe(10_000_000);
      expect(experiment.budgetEnforcement).not.toContain("unchanged $6");
      const trial = s.calls.find((call) => call.method === "PUT")!.body;
      if (budgetPolicy === "cumulative-reservations")
        expect(trial.reservationBudgetMicros).toBe(1_400_000);
      else expect(trial).not.toHaveProperty("reservationBudgetMicros");
      expect(s.settings()).toEqual(s.original);
    },
  );

  it("applies chosen ceiling and headroom to reservation and settled/unknown active ledgers", () => {
    const p = {
      charges: [
        {
          ...charge(5_000_000),
          chargedMicros: 100,
          billingSource: "reservation" as const,
        },
      ],
      reservedMicros: 0,
    };
    for (const ledger of [reservationLedger, monetaryLedger]) {
      expect(ledger(p, 2_000_000).shouldCancel).toBe(true);
      expect(ledger(p, 2_000_000, 10_000_000).shouldCancel).toBe(false);
      expect(
        ledger({ ...p, reservedMicros: 600_000 }, 4_000_000, 10_000_000)
          .shouldCancel,
      ).toBe(true);
      expect(() => ledger(p, 2_000_000, 10_000_001)).toThrow();
    }
  });
  it("cancels at the selected ten-million ceiling's headroom and restores the explicit reviewer route", async () => {
    const s = setup("budget", true);
    const result = await runButterCrunchBenchmark(
      {
        ...s.options,
        mode: "plan",
        campaignCeilingMicros: 10_000_000,
        priorReservationsMicros: 8_000_000,
        componentReviewerModel: "minimax/minimax-m3",
      },
      { transport: s.transport },
    );
    expect(result).toMatchObject({
      campaignCeilingMicros: 10_000_000,
      cancellationReason: "Budget ceiling reached cancellation headroom",
      routesRestored: true,
      noFurtherCallsPending: true,
      combinedReservationsMicros: 9_700_000,
    });
    expect(s.calls.some((call) => call.route.endsWith("/cancel"))).toBe(true);
    expect(s.calls.some((call) => call.route.endsWith("/build"))).toBe(false);
    expect(s.settings()).toEqual(s.original);
  });

  it.each([undefined, "minimax/minimax-m3"])(
    "records a successful plan-only probe with planner %s, restoring routes without any asset or build dispatch",
    async (plannerModel) => {
      const s = setup();
      const result = await runButterCrunchBenchmark(
        {
          ...s.options,
          mode: "plan",
          ...(plannerModel ? { plannerModel } : {}),
        },
        { transport: s.transport },
      );
      const chosenPlanner = plannerModel ?? "google/gemini-3.7-flash";
      expect(result).toMatchObject({
        mode: "plan",
        plannerModel: chosenPlanner,
        reviewerModel: "google/gemini-3.7-flash",
        model: s.options.model,
        planAccepted: true,
        error: null,
        artifactProduced: false,
        finishedGame: false,
        qualityScore: null,
        routesRestored: true,
        noFurtherCallsPending: true,
        reservedMicros: 100000,
        chargedMicros: 100,
      });
      const trial = s.calls.find(
        (c) => c.route === "/api/models" && c.method === "PUT",
      )!.body;
      expect(trial.routes.planner).toEqual([
        s.original.profiles.find((p) => p.model === chosenPlanner)!.id,
      ]);
      expect(trial.routes.reviewer).toEqual([s.original.profiles[1].id]);
      expect(trial.routes.builder).toEqual([s.original.profiles[0].id]);
      expect(trial.routes.repair).toEqual([s.original.profiles[0].id]);
      expect(s.settings()).toEqual(s.original);
      expect(
        s.calls.filter((c) => c.method === "POST").map((c) => c.route),
      ).toEqual(["/api/projects", `/api/projects/${s.project.id}/plan`]);
      expect(
        s.calls.every((c) =>
          [
            "/api/models",
            "/api/projects",
            `/api/projects/${s.project.id}`,
            `/api/projects/${s.project.id}/plan`,
          ].includes(c.route),
        ),
      ).toBe(true);
      expect(
        fs.existsSync(path.join(s.options.output, "Takko-Butter-Crunch.rbxlx")),
      ).toBe(false);
      const recorded = JSON.parse(
        fs.readFileSync(
          path.join(s.options.output, "plan-project.json"),
          "utf8",
        ),
      );
      expect(recorded.spec).toEqual(s.project.spec);
      const gate = JSON.parse(
        fs.readFileSync(path.join(s.options.output, "plan-gate.json"), "utf8"),
      );
      expect(gate).toMatchObject({
        passed: true,
        failures: [],
        changedPlan: false,
      });
      const experiment = JSON.parse(
        fs.readFileSync(path.join(s.options.output, "experiment.json"), "utf8"),
      );
      expect(experiment).toMatchObject({
        mode: "plan",
        planner: { model: chosenPlanner },
        reviewer: { model: "google/gemini-3.7-flash" },
        plannerModel: chosenPlanner,
        reviewerModel: "google/gemini-3.7-flash",
      });
      expect(experiment.plannerReviewer).toEqual(
        plannerModel
          ? null
          : expect.objectContaining({ model: "google/gemini-3.7-flash" }),
      );
    },
  );
  it.each(["gate", "planning-error"] as const)(
    "retains a %s plan-only failure and its gate without approving, building or modifying the plan",
    async (failure) => {
      const s = setup(failure);
      const result = await runButterCrunchBenchmark(
        { ...s.options, mode: "plan", plannerModel: "minimax/minimax-m3" },
        { transport: s.transport },
      );
      expect(result).toMatchObject({
        mode: "plan",
        planAccepted: false,
        artifactProduced: false,
        finishedGame: false,
        routesRestored: true,
        noFurtherCallsPending: true,
      });
      expect(result.error).toContain(
        failure === "gate"
          ? "External plan gate rejected unchanged plan"
          : "Planning ended at failed",
      );
      expect(
        s.calls.filter((c) => c.method === "POST").map((c) => c.route),
      ).toEqual(["/api/projects", `/api/projects/${s.project.id}/plan`]);
      expect(
        JSON.parse(
          fs.readFileSync(
            path.join(s.options.output, "plan-project.json"),
            "utf8",
          ),
        ).spec,
      ).toEqual(s.project.spec);
      expect(
        JSON.parse(
          fs.readFileSync(
            path.join(s.options.output, "plan-gate.json"),
            "utf8",
          ),
        ),
      ).toMatchObject({ passed: false, changedPlan: false });
      expect(s.settings()).toEqual(s.original);
    },
  );
  it("settles plan-only cancellation at budget headroom and restores routes without asset or build calls", async () => {
    const s = setup("budget");
    const result = await runButterCrunchBenchmark(
      { ...s.options, mode: "plan" },
      { transport: s.transport },
    );
    expect(result).toMatchObject({
      mode: "plan",
      artifactProduced: false,
      finishedGame: false,
      routesRestored: true,
      noFurtherCallsPending: true,
      inFlightReservationsMicros: 0,
      reservedMicros: 1700000,
    });
    expect(result.error).toContain("headroom");
    expect(
      s.calls.filter((c) => c.method === "POST").map((c) => c.route),
    ).toEqual([
      "/api/projects",
      `/api/projects/${s.project.id}/plan`,
      `/api/projects/${s.project.id}/cancel`,
    ]);
    expect(s.settings()).toEqual(s.original);
  });
  it.each([
    { mode: "unknown" },
    { mode: "" },
    { mode: null },
    { plannerModel: "" },
    { plannerModel: " " },
    { plannerModel: "x".repeat(161) },
    { plannerModel: 123 },
    { plannerModel: null },
  ])(
    "rejects malformed probe configuration before any requests or output mutation: %j",
    async (invalid) => {
      const s = setup();
      await expect(
        runButterCrunchBenchmark({ ...s.options, ...invalid } as any, {
          transport: s.transport,
        }),
      ).rejects.toThrow();
      expect(s.transport).not.toHaveBeenCalled();
      expect(fs.existsSync(s.options.output)).toBe(false);
    },
  );
  it.each(["missing", "unkeyed", "duplicate"])(
    "rejects a %s planner profile before output or API mutations",
    async (failure) => {
      const s = setup();
      const transport = vi.fn<typeof fetch>(async (url, init) => {
        const response = await s.transport(url, init);
        const data = await response.json();
        if (new URL(String(url)).pathname === "/api/models") {
          if (failure === "unkeyed") data.profiles[0].hasKey = false;
          if (failure === "duplicate")
            data.profiles.push({ ...data.profiles[0], id: profile().id });
        }
        return Response.json(data);
      });
      await expect(
        runButterCrunchBenchmark(
          {
            ...s.options,
            mode: "plan",
            plannerModel:
              failure === "missing" ? "missing/planner" : "minimax/minimax-m3",
            model: "google/gemini-3.7-flash",
          },
          { transport },
        ),
      ).rejects.toThrow("configured keyed profile");
      expect(s.calls.every((c) => c.method === "GET")).toBe(true);
      expect(fs.existsSync(s.options.output)).toBe(false);
      expect(s.settings()).toEqual(s.original);
    },
  );
  it("supports a shared Gemini planner and worker profile and restores its deadline and routes", async () => {
    const s = setup();
    const result = await runButterCrunchBenchmark(
      {
        ...s.options,
        model: "google/gemini-3.7-flash",
        workerRequestTimeoutMs: 300000,
      },
      { transport: s.transport },
    );
    const trial = s.calls.find(
      (c) => c.route === "/api/models" && c.method === "PUT",
    )!.body;
    const gemini = trial.profiles.find(
      (p: any) => p.model === "google/gemini-3.7-flash",
    );
    expect(trial.routes.planner).toEqual([gemini.id]);
    expect(trial.routes.builder).toEqual([gemini.id]);
    expect(trial.routes.reviewer).toEqual([gemini.id]);
    expect(gemini.requestTimeoutMs).toBe(300000);
    expect(trial.budgetMicros).toBe(benchmarkLimits.defaultProjectMicros);
    expect(result.noFurtherCallsPending).toBe(true);
    expect(result.routesRestored).toBe(true);
    expect(s.settings()).toEqual(s.original);
  });
  it("uses an explicit isolated loopback service and records its evidence directory", async () => {
    const s = setup();
    await runButterCrunchBenchmark(
      {
        ...s.options,
        baseUrl: "http://127.0.0.1:4335",
        workerRequestTimeoutMs: 300000,
      },
      { transport: s.transport },
    );
    expect(
      s.transport.mock.calls.every(([url]) =>
        String(url).startsWith("http://127.0.0.1:4335/"),
      ),
    ).toBe(true);
    expect(
      JSON.parse(
        fs.readFileSync(path.join(s.options.output, "experiment.json"), "utf8"),
      ),
    ).toMatchObject({
      baseUrl: "http://127.0.0.1:4335",
      dataDirectory: s.directory,
    });
    expect(s.settings()).toEqual(s.original);
    const trial = s.calls.find(
      (c) => c.route === "/api/models" && c.method === "PUT",
    )!.body;
    expect(
      trial.profiles.find((p: any) => p.model === "minimax/minimax-m3")
        .requestTimeoutMs,
    ).toBe(300000);
    expect(trial.budgetMicros).toBe(benchmarkLimits.defaultProjectMicros);
  });
  it.each([
    "https://example.com:4335",
    "http://127.0.0.1:4335/path",
    "http://user@127.0.0.1:4335",
    "http://127.0.0.1:4335?key=x",
    "http://127.0.0.1:1023",
    "http://127.0.0.1:99999",
  ])("refuses a non-test endpoint before requests: %s", async (baseUrl) => {
    const s = setup();
    await expect(
      runButterCrunchBenchmark(
        { ...s.options, baseUrl },
        { transport: s.transport },
      ),
    ).rejects.toThrow();
    expect(s.transport).not.toHaveBeenCalled();
  });
  it("requires the evidence directory for an alternate service", async () => {
    const s = setup();
    await expect(
      runButterCrunchBenchmark(
        {
          ...s.options,
          dataDirectory: undefined,
          baseUrl: "http://127.0.0.1:4335",
        },
        { transport: s.transport },
      ),
    ).rejects.toThrow("explicit data directory");
    expect(s.transport).not.toHaveBeenCalled();
  });
  it("records cumulative exposure separately while admitting a diverse trial against settled cost", async () => {
    const s = setup();
    const result = await runAssetBenchmark(
      {
        ...s.options,
        priorReservationsMicros: 5_900_000,
        priorChargedMicros: 510_904,
        budgetMicros: 1_000_000,
      },
      {
        id: "diversity-offline-fixture",
        promptRelative:
          "benchmarks/fixtures/marketplace-diversity-v1/combat-training.txt",
        promptSha256: diversityCases["combat-training"],
        exportFilename: "fixture.rbxlx",
        budgetPolicy: "settled-plus-active",
        planGate: diversityPlanGate,
      },
      { transport: s.transport },
    );
    expect(result).toMatchObject({
      error: null,
      finishedGame: false,
      manualRescue: false,
      combinedReservationsMicros: 6_100_000,
      monetaryLedger: { committedMicros: 511_104, shouldCancel: false },
    });
    const trial = s.calls.find(
      (c) => c.route === "/api/models" && c.method === "PUT",
    )!.body;
    expect(trial.budgetMicros).toBe(1_000_000);
    expect(trial).not.toHaveProperty("reservationBudgetMicros");
    expect(s.settings()).toEqual(s.original);
    expect(
      s.calls.find((c) => c.route === "/api/projects" && c.method === "POST")!
        .body.request,
    ).toContain("Strike Lab");
    expect(s.calls.some((c) => c.method === "PATCH")).toBe(false);
  });
  it("keeps full unknown-call liabilities and current reservations, rejecting invalid amounts", () => {
    const unknown = {
      ...charge(700_000),
      chargedMicros: 100,
      billingSource: "reservation" as const,
    };
    expect(
      monetaryLedger(
        { charges: [charge(1_000_000), unknown], reservedMicros: 200_000 },
        510_904,
      ),
    ).toMatchObject({
      settledAndUnknownMicros: 700_100,
      committedMicros: 1_411_004,
      shouldCancel: false,
    });
    expect(
      monetaryLedger({ charges: [unknown], reservedMicros: 200_000 }, 4_700_000)
        .shouldCancel,
    ).toBe(true);
    expect(() =>
      monetaryLedger(
        { charges: [{ ...charge(), chargedMicros: NaN }], reservedMicros: 0 },
        0,
      ),
    ).toThrow("Malformed");
  });
  it("does not require redundant standalone audio when a complete component can contain media", () => {
    const value = spec();
    value.assetNeeds = value.assetNeeds!.filter((n) => n.kind === "Model");
    const original = structuredClone(value);
    expect(diversityPlanGate(value)).toEqual([]);
    expect(value).toEqual(original);
    delete value.assetNeeds![0].intent;
    expect(diversityPlanGate(value).join(" ")).toContain("needs intent");
  });
  it("still refuses a diverse trial whose actual liabilities plus cap exceed the aggregate ceiling", async () => {
    const s = setup();
    await expect(
      runAssetBenchmark(
        {
          ...s.options,
          priorChargedMicros: 5_000_000,
          budgetMicros: 1_000_000,
        },
        {
          id: "blocked-fixture",
          promptRelative: "unused",
          promptSha256: "unused",
          exportFilename: "unused",
          budgetPolicy: "settled-plus-active",
          planGate: diversityPlanGate,
        },
        { transport: s.transport },
      ),
    ).rejects.toThrow("Insufficient conservative budget");
    expect(s.transport).not.toHaveBeenCalled();
  });
  it("allows a frozen two-dollar targeted trial only when all prior reservations fit the aggregate ceiling", async () => {
    const allowed = setup();
    await runButterCrunchBenchmark(
      {
        ...allowed.options,
        budgetMicros: 2_000_000,
        priorReservationsMicros: 3_284_009,
      },
      { transport: allowed.transport },
    );
    expect(
      allowed.calls.find(
        (call) => call.route === "/api/models" && call.method === "PUT",
      )!.body,
    ).toMatchObject({
      budgetMicros: 2_000_000,
      reservationBudgetMicros: 2_000_000,
    });
    const blocked = setup();
    await expect(
      runButterCrunchBenchmark(
        {
          ...blocked.options,
          budgetMicros: 2_000_000,
          priorReservationsMicros: 3_700_000,
        },
        { transport: blocked.transport },
      ),
    ).rejects.toThrow("Insufficient conservative budget");
    expect(blocked.transport).not.toHaveBeenCalled();
  });
  it("requires required audio linked to a required audio requirement and an executable visual search", () => {
    expect(butterCrunchPlanGate(spec())).toEqual([]);
    const requiredVisual = spec();
    requiredVisual.assetNeeds![1].required = true;
    expect(butterCrunchPlanGate(requiredVisual)).toEqual([]);
    for (const mutate of [
      (s: ReturnType<typeof spec>) => {
        s.assetNeeds![0].required = false;
      },
      (s: ReturnType<typeof spec>) => {
        s.requirements[1].priority = "optional";
      },
      (s: ReturnType<typeof spec>) => {
        s.requirements[1].category = "world";
      },
      (s: ReturnType<typeof spec>) => {
        s.assetNeeds![0].requirementId = "missing";
      },
      (s: ReturnType<typeof spec>) => {
        s.assetNeeds!.pop();
      },
      (s: ReturnType<typeof spec>) => {
        s.assetNeeds![1].query = " ";
      },
      (s: ReturnType<typeof spec>) => {
        s.assetNeeds![1].kind = "Animation";
      },
      (s: ReturnType<typeof spec>) => {
        s.questions.push({
          id: "question",
          prompt: "Pick a color",
          options: [],
        });
      },
    ]) {
      const value = spec();
      mutate(value);
      const before = structuredClone(value);
      expect(butterCrunchPlanGate(value).length).toBeGreaterThan(0);
      expect(value).toEqual(before);
    }
  });
  it("counts completed conservative reservations plus pending calls, not just reported charges", () => {
    const ledger = reservationLedger(
      { charges: [charge(1_000_000)], reservedMicros: 600_000 },
      4_000_000,
    );
    expect(ledger).toMatchObject({
      committedMicros: 5_600_000,
      shouldCancel: true,
    });
    expect(() =>
      reservationLedger({ charges: [charge(NaN)], reservedMicros: 0 }, 0),
    ).toThrow("Malformed");
  });
  it("creates a fresh unchanged plan trial, freezes evidence and restores settings without claiming native success", async () => {
    const s = setup();
    fs.mkdirSync(path.join(s.directory, "traces"));
    fs.writeFileSync(
      path.join(s.directory, s.project.id + ".json"),
      '{"fixture":"raw stored record"}',
    );
    fs.writeFileSync(
      path.join(s.directory, "traces", s.project.id + ".events.jsonl"),
      '{"fixture":"original model output"}\n',
    );
    const result = await runButterCrunchBenchmark(
      { ...s.options, version: 5 },
      {
        transport: s.transport,
        sleep: async () => {},
      },
    );
    expect(result).toMatchObject({
      version: 5,
      mode: "build",
      plannerModel: "google/gemini-3.7-flash",
      reviewerModel: "google/gemini-3.7-flash",
      error: null,
      routesRestored: true,
      noFurtherCallsPending: true,
      artifactProduced: true,
      finishedGame: false,
      qualityScore: null,
      reservedMicros: 200_000,
      chargedMicros: 200,
    });
    expect(s.settings()).toEqual(s.original);
    const trial = s.calls.find(
      (c) => c.route === "/api/models" && c.method === "PUT",
    )!.body;
    expect(trial).toMatchObject({
      repairLimit: 1,
      researchEnabled: false,
      budgetMicros: 1_400_000,
      reservationBudgetMicros: 1_400_000,
    });
    expect(trial.routes.builder).toEqual([s.original.profiles[0].id]);
    expect(trial.routes.reviewer).toEqual([s.original.profiles[1].id]);
    expect(s.calls.some((c) => c.method === "PATCH")).toBe(false);
    expect(
      fs.existsSync(path.join(s.options.output, "Takko-Butter-Crunch.rbxlx")),
    ).toBe(true);
    expect(
      fs.readFileSync(
        path.join(s.options.output, "final-project-from-disk.json"),
        "utf8",
      ),
    ).toBe('{"fixture":"raw stored record"}');
    expect(
      fs.readFileSync(
        path.join(s.options.output, "model-events.jsonl"),
        "utf8",
      ),
    ).toBe('{"fixture":"original model output"}\n');
    const experiment = JSON.parse(
      fs.readFileSync(path.join(s.options.output, "experiment.json"), "utf8"),
    );
    expect(experiment.version).toBe(5);
    expect(experiment.sourceHashes["src/generation/asset-pipeline.ts"]).toMatch(
      /^[a-f0-9]{64}$/,
    );
    expect(experiment.promptFileSha256).toBe(
      "591fb62a702e0b7c96925f36def1179cd8d9f7c21999cbe4ecf648cf2e48a0bd",
    );
    const callCount = s.calls.length;
    await expect(
      runButterCrunchBenchmark(s.options, { transport: s.transport }),
    ).rejects.toThrow();
    expect(s.calls).toHaveLength(callCount);
  });
  it("records an unchanged rejected plan and never approves, builds or authors answers", async () => {
    const s = setup("gate");
    const result = await runButterCrunchBenchmark(s.options, {
      transport: s.transport,
    });
    expect(result.error).toContain(
      "External plan gate rejected unchanged plan",
    );
    expect(result.routesRestored).toBe(true);
    expect(
      s.calls.some(
        (c) =>
          c.route.endsWith("/approve") ||
          c.route.endsWith("/build") ||
          c.method === "PATCH",
      ),
    ).toBe(false);
    const recorded = JSON.parse(
      fs.readFileSync(path.join(s.options.output, "plan-project.json"), "utf8"),
    );
    expect(recorded.spec).toEqual(s.project.spec);
  });
  it("cancels on conservative headroom, waits for pending settlement and reports all reservations", async () => {
    const s = setup("budget");
    const result = await runButterCrunchBenchmark(s.options, {
      transport: s.transport,
    });
    expect(result).toMatchObject({
      routesRestored: true,
      noFurtherCallsPending: true,
      combinedReservationsMicros: 5_700_000,
      reservedMicros: 1_700_000,
    });
    expect(result.error).toContain("headroom");
    expect(s.calls.filter((c) => c.route.endsWith("/cancel"))).toHaveLength(1);
    expect(s.calls.some((c) => c.route.endsWith("/build"))).toBe(false);
  });
  it("cancels a dispatch with a lost response and restores routes", async () => {
    const s = setup("build-error");
    const result = await runButterCrunchBenchmark(s.options, {
      transport: s.transport,
    });
    expect(result.error).toContain("HTTP 503");
    expect(result).toMatchObject({
      routesRestored: true,
      noFurtherCallsPending: true,
    });
    expect(s.calls.filter((c) => c.route.endsWith("/cancel"))).toHaveLength(1);
  });
  it.each([1_490_553, 4_200_001])(
    "refuses underreported or exhausted prior reservations before contacting the server: %s",
    async (priorReservationsMicros) => {
      const s = setup();
      await expect(
        runButterCrunchBenchmark(
          { ...s.options, priorReservationsMicros },
          { transport: s.transport },
        ),
      ).rejects.toThrow();
      expect(s.transport).not.toHaveBeenCalled();
    },
  );
});
