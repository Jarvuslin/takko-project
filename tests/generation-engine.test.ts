import { afterEach, describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Configuration } from "../src/generation/settings";
import { GenerationStore } from "../src/generation/store";
import {
  Engine,
  dependencyContext,
  mergeReview,
  normalizeGeneratedBundle,
  validateReview,
  validateTaskFiles,
} from "../src/generation/engine";
import { fakeTransport, profile, specification } from "./generation-fixtures";
import {
  bundleHash,
  validateBundle,
  validateSpec,
} from "../src/generation/validation";
import { exportBundle } from "../src/generation/export";
import { attachVisual } from "../src/generation/visual";
import { bundleSchema } from "../src/generation/schema";
import { componentReviewFixture } from "./component-review.fixture";
import { createHash } from "node:crypto";
import {
  componentReviewDecisionSchema,
  componentReviewInstructions,
  validateComponentReview,
} from "../src/generation/component-review";
const directories: string[] = [];
function setup(transport: typeof fetch = fakeTransport(), repairLimit = 1) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-engine-"));
  directories.push(dir);
  const config = new Configuration(path.join(dir, "config"));
  const model = profile();
  config.save({
    profiles: [model],
    routes: {
      planner: [model.id],
      builder: [model.id],
      reviewer: [model.id],
      repair: [model.id],
    },
    budgetMicros: 2e6,
    repairLimit,
  });
  const store = new GenerationStore(dir);
  return {
    engine: new Engine(store, config, transport),
    config,
    store,
    dir,
    model,
  };
}
afterEach(() => {
  for (const dir of directories.splice(0))
    fs.rmSync(dir, { recursive: true, force: true });
});
async function build(engine: Engine, request: string) {
  let p = engine.create(request);
  engine.start(p.id, 1, "plan");
  p = await engine.wait(p.id);
  expect(p.stage).toBe("review");
  engine.approve(p.id, p.revision);
  engine.start(p.id, p.revision, "build");
  return engine.wait(p.id);
}
describe("request-driven generation", () => {
  it.each([false, true])(
    "delivers independent component review diagnostics together on the same route with at most two responses (repeat invalid: %s)",
    async (repeatInvalid) => {
      const { evidence, decision } = componentReviewFixture();
      const body = evidence.sourceBodies[0];
      body.source =
        "local helper = require(script.Parent.Utility)\n" + body.source;
      body.sha256 = createHash("sha256").update(body.source).digest("hex");
      decision.sources[0].sha256 = body.sha256;
      decision.requirements[0].sourceHashes = [body.sha256];
      decision.permissionImpacts[0].sourceHashes = [body.sha256];
      evidence.nodes.push({
        index: 4,
        parentIndex: 1,
        name: "Utility",
        className: "ModuleScript",
      });
      const helperHash = createHash("sha256").update("return {}").digest("hex");
      evidence.sourceBodies.push({
        source: "return {}",
        sha256: helperHash,
        bindings: [{ index: 4, className: "ModuleScript" }],
      });
      decision.sources.push({
        sha256: helperHash,
        behavior: "Returns a utility table",
        reuse: "preserve",
        dependencies: [],
        unresolved: [],
      });
      decision.sources[0].dependencies.push({
        kind: "instance_reference",
        value: "script.Parent.Utility local ModuleScript",
        sourceLines: { start: 1, end: 1 },
        verification: "unverified",
      });
      const invalid = structuredClone(decision);
      invalid.sources[0].dependencies[1].kind = "module_asset";
      invalid.permissionImpacts.push({
        capability: "Audio",
        impact: "none_observed",
        reason: "Synthetic extra permission row",
        sourceHashes: [],
      });
      const rawInvalid = JSON.stringify(invalid);
      const requests: any[] = [];
      const s = setup((async (_url, init) => {
        const request = JSON.parse(String(init?.body));
        requests.push(request);
        return Response.json({
          choices: [
            {
              finish_reason: "stop",
              message: {
                content:
                  requests.length === 1 || repeatInvalid
                    ? rawInvalid
                    : JSON.stringify(decision),
              },
            },
          ],
          usage: { prompt_tokens: 10, completion_tokens: 20 },
        });
      }) as typeof fetch);
      const project = s.engine.create("Synthetic component review correction");
      const result = (s.engine as any).call(
        project,
        "reviewer",
        {
          task: "component-source-review",
          context: { evidence },
          instructions: componentReviewInstructions,
        },
        componentReviewDecisionSchema,
        s.config.read(),
        new Map(),
        new AbortController().signal,
        (value: unknown) => validateComponentReview(value, evidence, ["style"]),
        { label: "component-reviewer" },
      );
      if (repeatInvalid)
        await expect(result).rejects.toThrow(
          "Could not complete component-reviewer",
        );
      else expect(await result).toEqual(decision);
      expect(requests).toHaveLength(2);
      expect(requests.map((request) => request.model)).toEqual([
        s.model.model,
        s.model.model,
      ]);
      const correction = requests[1].messages[1].content;
      expect(correction).toContain(
        'Expected permissionImpacts capabilities: ["Network"]',
      );
      expect(correction).toContain("value must be a numeric asset ID");
      expect(correction).toContain(
        "Local ModuleScript requires use instance_reference",
      );
      expect(correction).toContain(rawInvalid);
      expect(project.charges).toHaveLength(2);
      const responses = fs
        .readFileSync(
          path.join(s.dir, "traces", project.id + ".events.jsonl"),
          "utf8",
        )
        .trim()
        .split(/\r?\n/)
        .map((line) => JSON.parse(line))
        .filter((event) => typeof event.response === "string");
      expect(responses[0].response).toBe(rawInvalid);
      expect(invalid.sources[0].dependencies[1].kind).toBe("module_asset");
    },
  );
  it("delivers complete Marketplace reuse and discovery-dependent ownership guidance in the actual planner system and schema", async () => {
    // This exercises prompt delivery and schema acceptance through a controlled
    // provider boundary; it is not evidence of live model or gameplay quality.
    let calls = 0;
    const transport = (async (_url, init) => {
      calls++;
      const body = JSON.parse(String(init?.body));
      const system = body.messages[0].content;
      expect(system).toContain(
        "Prioritize complete reusable Marketplace systems and components, including their existing behavior, animation and media",
      );
      expect(system).toContain(
        "implement the missing integration and requirements established by inspection",
      );
      expect(system).toContain(
        "Import or capability limitations require explicit review or escalation and do not authorize procedural replacement",
      );
      expect(system).toContain("Require native gameplay verification");
      expect(system).toContain(
        "Never execute arbitrary HTTP code or numeric require IDs",
      );
      expect(system).not.toContain("procedural joints");
      expect(system).not.toContain("For combat implement");
      const contract = JSON.parse(system.split("\nOUTPUT SCHEMA: ")[1]);
      const files = contract.properties.tasks.items.properties.files;
      expect(files.type).toBe("array");
      expect(files.description).toContain(
        "discovery-dependent tasks whose necessary integration scripts are not yet known",
      );
      expect(files.description).toContain("exclusive ownership");
      expect(files.minItems ?? 0).toBe(0);
      const context = JSON.parse(body.messages[1].content);
      const spec = specification(context.request, context.namespace);
      spec.tasks[0].files = [];
      return Response.json({
        choices: [
          { message: { content: JSON.stringify(spec) }, finish_reason: "stop" },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 20 },
      });
    }) as typeof fetch;
    const { engine } = setup(transport);
    const project = engine.create("Build a repeatable interaction game");
    engine.start(project.id, project.revision, "plan");
    const result = await engine.wait(project.id);
    expect(result.stage, result.error ?? "").toBe("review");
    expect(result.spec!.tasks[0].files).toEqual([]);
    expect(calls).toBe(1);
    expect(result.charges).toHaveLength(1);
  });
  it("preserves clarification questions across revisions and supplies them to replanning without fabricating user evidence", async () => {
    const observed: any[] = [];
    const { engine, store } = setup(
      fakeTransport({
        inspect: (phase, context) => {
          if (phase === "planner") observed.push(context);
        },
      }),
    );
    let p = engine.create("Build a satisfying interaction game");
    p.spec = specification(p.request, p.scope);
    p.spec.questions = [
      {
        id: "timing",
        prompt: "Count only after the animation finishes?",
        options: ["Yes", "No"],
      },
    ];
    store.save(p);
    p = engine.revise(p.id, p.revision, p.request, { timing: "Yes" });
    expect(p.spec).toBeNull();
    expect(store.get(p.id).answerQuestions).toEqual({
      timing: "Count only after the animation finishes?",
    });
    engine.start(p.id, p.revision, "plan");
    p = await engine.wait(p.id);
    expect(p.stage, p.error ?? "").toBe("review");
    expect(observed[0].gameContext.clarifications).toEqual([
      {
        sourceId: "answer:timing",
        question: "Count only after the animation finishes?",
        questionOrigin: "planner_context_not_user_instruction",
        answer: "Yes",
      },
    ]);
    expect(observed[0].userSources).toContainEqual({
      id: "answer:timing",
      text: "Yes",
      answerId: "timing",
    });
    p = engine.revise(p.id, p.revision, p.request, { timing: "No" });
    expect(p.answerQuestions!.timing).toBe(
      "Count only after the animation finishes?",
    );
    p = engine.revise(p.id, p.revision, p.request, {});
    expect(p.answerQuestions).toEqual({});
  });

  it("corrects a purpose-free asset plan on the planner route before any search", async () => {
    let attempts = 0;
    const transport = (async (_url, init) => {
      const body = JSON.parse(String(init?.body));
      const input = body.messages[1].content;
      const context = JSON.parse(input.split("\nYour last response")[0]);
      const spec = specification(context.request, context.namespace);
      spec.assetStrategy = "Inspect reusable interaction components first";
      spec.assetNeeds = [
        {
          id: "main",
          requirementId: "core",
          role: "Main prop",
          kind: "Model",
          query: "object",
          constraints: "Fits game",
          position: [0, 0, 0],
          maxSize: 12,
          required: true,
        },
      ];
      if (++attempts > 1) {
        expect(input).toContain("needs intent");
        spec.assetNeeds[0].intent = {
          experienceRole: "Satisfying tactile feedback",
          interaction: "Tap then squash and recover",
          reusableFeatures: ["Squash behavior"],
          relatedRequirementIds: ["core"],
        };
      }
      return Response.json({
        choices: [
          { message: { content: JSON.stringify(spec) }, finish_reason: "stop" },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 20 },
      });
    }) as typeof fetch;
    const { engine } = setup(transport);
    const p = engine.create("Build an ASMR interaction game");
    engine.start(p.id, p.revision, "plan");
    const done = await engine.wait(p.id);
    expect(done.stage, done.error ?? "").toBe("review");
    expect(attempts).toBe(2);
    expect(done.spec!.assetNeeds![0].intent!.experienceRole).toBe(
      "Satisfying tactile feedback",
    );
    expect(done.assetPipeline).toBeUndefined();
  });
  it("enforces an optional cumulative reservation ceiling before any provider dispatch", async () => {
    let calls = 0;
    const fixture = fakeTransport();
    const { engine, config } = setup((async (...args) => {
      calls++;
      return fixture(...args);
    }) as typeof fetch);
    config.save({ ...config.read(), reservationBudgetMicros: 1000 });
    let p = engine.create("Build a farming game");
    engine.start(p.id, p.revision, "plan");
    p = await engine.wait(p.id);
    expect(calls).toBe(0);
    expect(p.charges).toEqual([]);
    expect(p.reservedMicros).toBe(0);
    expect(p.error).toContain("Cumulative reservation budget");
  });
  it("counts completed conservative reservations even when actual charges are lower", async () => {
    let calls = 0;
    const fixture = fakeTransport();
    const { engine, config } = setup((async (...args) => {
      calls++;
      return fixture(...args);
    }) as typeof fetch);
    let p = engine.create("Build a farming game");
    engine.start(p.id, p.revision, "plan");
    p = await engine.wait(p.id);
    const reserved = p.charges[0].reservedMicros;
    expect(reserved).toBeGreaterThan(p.charges[0].chargedMicros);
    config.save({ ...config.read(), reservationBudgetMicros: reserved });
    engine.start(p.id, p.revision, "plan");
    p = await engine.wait(p.id);
    expect(calls).toBe(1);
    expect(p.charges).toHaveLength(1);
    expect(p.error).toContain("Cumulative reservation budget");
    const { reservationBudgetMicros: _, ...normal } = config.read();
    config.save(normal);
    engine.start(p.id, p.revision, "plan");
    p = await engine.wait(p.id);
    expect(p.stage).toBe("review");
    expect(calls).toBe(2);
  });
  it("corrects scene properties before checkpointing a task and preserves every model attempt", async () => {
    const fixture = fakeTransport();
    let attempts = 0;
    const transport = (async (url, init) => {
      const response = await (await fixture(url, init)).json();
      const input = JSON.parse(String(init?.body));
      if (input.messages[0].content.includes("PHASE: builder")) {
        const bundle = JSON.parse(response.choices[0].message.content);
        if (++attempts === 1) bundle.scene[0].properties.Scale = 2;
        else expect(input.messages[1].content).toContain("Part.Scale");
        response.choices[0].message.content = JSON.stringify(bundle);
      }
      return Response.json(response);
    }) as typeof fetch;
    const { engine, dir } = setup(transport);
    const p = await build(engine, "Build a farming game");
    expect(p.stage).toBe("ready_to_test");
    expect(attempts).toBe(2);
    expect(p.artifact!.scene[0].properties).not.toHaveProperty("Scale");
    const traces = fs
      .readFileSync(path.join(dir, "traces", p.id + ".events.jsonl"), "utf8")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    expect(traces.filter((t) => t.phase === "builder")).toHaveLength(2);
  });
  it("records unavailable asset execution as failure without manual rescue or a completed task", async () => {
    const fixture = fakeTransport();
    let calls = 0;
    const transport = (async (url, init) => {
      const response = await (await fixture(url, init)).json();
      const input = JSON.parse(String(init?.body));
      if (input.messages[0].content.includes("PHASE: builder")) {
        calls++;
        const bundle = JSON.parse(response.choices[0].message.content);
        bundle.assets = [
          {
            id: "cookieImage",
            kind: "image",
            requirementId: "core",
            status: "needed",
            assetId: null,
            sourceUrl: null,
            description: "Cookie texture image",
          },
        ];
        response.choices[0].message.content = JSON.stringify(bundle);
      }
      return Response.json(response);
    }) as typeof fetch;
    const { engine } = setup(transport);
    const p = await build(engine, "Build a cookie game");
    expect(calls).toBe(1);
    expect(p.stage).toBe("failed");
    expect(p.completedBuildTasks).toEqual([]);
    expect(p.failure?.code).toBe("ASSET_PIPELINE_FAILED");
    expect(p.artifact!.scene).toEqual([]);
    expect(p.assetPipeline?.status).toBe("failed");
    expect(
      p.checks.some((c) => c.id === "asset-pipeline" && c.status === "failed"),
    ).toBe(true);
  });
  it("accepts explicit namespace folders but rejects root mutations and foreign namespaces", async () => {
    const { engine } = setup();
    const p = await build(engine, "Build a farming game");
    const original = p.artifact!;
    for (const [node, valid] of [
      [
        { path: `Workspace/${p.scope}`, className: "Folder", properties: {} },
        true,
      ],
      [
        { path: `Workspace/${p.scope}`, className: "Part", properties: {} },
        false,
      ],
      [
        {
          path: `Workspace/${p.scope}`,
          className: "Folder",
          properties: { Archivable: false },
        },
        false,
      ],
      [
        {
          path: "Workspace/Forge_foreign",
          className: "Folder",
          properties: {},
        },
        false,
      ],
    ] as const) {
      const bundle = bundleSchema.parse({
        ...original,
        scene: [...original.scene, node],
      });
      expect(
        validateBundle(bundle, p).find((c) => c.id === "structure")?.status,
      ).toBe(valid ? "passed" : "failed");
    }
  });
  it.each(["truncated", "empty"])(
    "tries the configured fallback after %s output without accepting invalid output or losing billing",
    async (failure) => {
      const fixture = fakeTransport();
      let count = 0;
      const transport = (async (url, init) => {
        const data = await (await fixture(url, init)).json();
        if (++count === 1) {
          if (failure === "truncated") data.choices[0].finish_reason = "length";
          else data.choices[0].message.content = "";
        }
        return Response.json(data);
      }) as typeof fetch;
      const { engine, config, model } = setup(transport);
      const fallback = { ...profile(), maxOutputTokens: 8192 };
      const settings = config.read();
      config.save({
        ...settings,
        profiles: [model, fallback],
        routes: { ...settings.routes, planner: [model.id, fallback.id] },
      });
      const created = engine.create("Build a farming game");
      engine.start(created.id, 1, "plan");
      const p = await engine.wait(created.id);
      expect(p.stage).toBe("review");
      expect(p.charges.map((c) => [c.profileId, c.status])).toEqual([
        [model.id, "error"],
        [fallback.id, "ok"],
      ]);
      expect(p.charges[0].chargedMicros).toBeGreaterThan(0);
    },
  );
  it("retains usage on truncated output without treating the partial JSON as valid", async () => {
    const fixture = fakeTransport();
    const transport = (async (url, init) => {
      const data = await (await fixture(url, init)).json();
      data.choices[0].finish_reason = "length";
      data.usage = {
        prompt_tokens: 12,
        completion_tokens: 7,
        prompt_tokens_details: { cached_tokens: 8 },
      };
      return Response.json(data);
    }) as typeof fetch;
    const { engine } = setup(transport);
    const p = engine.create("Build a farming game");
    engine.start(p.id, 1, "plan");
    const done = await engine.wait(p.id);
    expect(done.stage).toBe("failed");
    expect(done.spec).toBeNull();
    expect(done.charges).toHaveLength(1);
    expect(done.charges[0]).toMatchObject({
      status: "error",
      estimated: false,
      chargedMicros: 26,
      billingSource: "configured-rate",
      cachedInputTokens: 8,
    });
  });
  it("rejects built-in audio even when the stock path exists, as well as unknown paths and unverified IDs", () => {
    const { engine } = setup();
    const p = engine.create("Build a farming game");
    const b = bundleSchema.parse({
      assets: [
        {
          id: "wind",
          requirementId: "core",
          kind: "audio",
          assetId: null,
          sourceUrl: "rbxasset://sounds/action_falling.ogg",
          status: "builtin",
          description: "Bundled wind sound",
        },
      ],
    });
    expect(
      validateBundle(b, p).find((c) => c.id === "asset:wind")?.status,
    ).toBe("failed");
    b.assets[0].sourceUrl = "rbxasset://sounds/invented.ogg";
    expect(
      validateBundle(b, p).find((c) => c.id === "asset:wind")?.status,
    ).toBe("failed");
    b.assets[0].sourceUrl = "rbxasset://sounds/action_falling.ogg";
    b.assets[0].assetId = "12345";
    expect(
      validateBundle(b, p).find((c) => c.id === "asset:wind")?.status,
    ).toBe("failed");
  });
  it("rejects generated audio and undeclared built-in audio embedded directly in scripts", () => {
    const { engine } = setup();
    const p = engine.create("Build a game with Marketplace audio");
    const b = bundleSchema.parse({
      assets: [
        {
          id: "generated",
          requirementId: "core",
          kind: "audio",
          assetId: null,
          status: "procedural",
          description: "synthetic sound",
        },
      ],
      files: [
        {
          path: `ServerScriptService/${p.scope}/Game.server.luau`,
          kind: "Script",
          source:
            'local sound = Instance.new("Sound")\nsound.SoundId = "rbxasset://sounds/action_jump.mp3"',
        },
      ],
    });
    const checks = validateBundle(b, p);
    expect(checks.find((c) => c.id === "asset:generated")?.status).toBe(
      "failed",
    );
    expect(
      checks.find((c) => c.id.startsWith("marketplace-audio:"))?.status,
    ).toBe("failed");
  });
  it("tries an affordable configured route without spending on an unaffordable route", async () => {
    const { engine, config, model } = setup();
    const expensive = {
      ...model,
      id: "12345678-1234-4234-8234-123456789abc",
      inputRate: 1000,
      outputRate: 1000,
    };
    config.save({
      ...config.read(),
      profiles: [expensive, model],
      routes: { ...config.read().routes, planner: [expensive.id, model.id] },
    });
    const p = engine.create("Build a farming game");
    engine.start(p.id, 1, "plan");
    const done = await engine.wait(p.id);
    expect(done.stage).toBe("review");
    expect(done.charges.map((c) => c.profileId)).toEqual([model.id]);
  });
  it("preserves the previous artifact and review before a fresh build", async () => {
    const { engine, dir } = setup();
    const before = await build(engine, "Build a farming game");
    engine.start(before.id, before.revision, "build");
    await engine.wait(before.id);
    const files = fs.readdirSync(path.join(dir, "history"));
    expect(files).toHaveLength(1);
    const saved = JSON.parse(
      fs.readFileSync(path.join(dir, "history", files[0]), "utf8"),
    );
    expect(saved.artifact).toEqual(before.artifact);
    expect(saved.review).toEqual(before.review);
  });
  it.each([false, true])(
    "falls back after a provider timeout but respects cancellation (%s)",
    async (cancel) => {
      let calls = 0;
      const fixture = fakeTransport();
      let stop = () => {};
      const transport = (async (url, init) => {
        if (++calls === 1) {
          if (cancel) stop();
          throw new DOMException("Provider timed out", "TimeoutError");
        }
        return fixture(url, init);
      }) as typeof fetch;
      const { engine, config, model } = setup(transport);
      const fallback = {
        ...model,
        id: "12345678-1234-4234-8234-123456789abc",
        name: "Fallback",
      };
      config.save({
        ...config.read(),
        profiles: [model, fallback],
        routes: { ...config.read().routes, planner: [model.id, fallback.id] },
      });
      const p = engine.create("Build a farming game");
      // Defer cancellation until start() has registered its job.
      stop = () => queueMicrotask(() => engine.cancel(p.id));
      engine.start(p.id, 1, "plan");
      const done = await engine.wait(p.id);
      expect(done.stage).toBe(cancel ? "interrupted" : "review");
      expect(calls).toBe(cancel ? 1 : 2);
      expect(done.reservedMicros).toBe(0);
      expect(done.charges[0].estimated).toBe(true);
    },
  );
  it("accepts an absent source URL without treating a missing asset as implemented", () => {
    const b = bundleSchema.parse({
      assets: [
        {
          id: "ambience",
          requirementId: "core",
          kind: "audio",
          assetId: null,
          sourceUrl: null,
          status: "needed",
          description: "An ambient track is required",
        },
      ],
    });
    const { engine } = setup();
    const p = engine.create("Build a farming game");
    expect(b.assets[0].sourceUrl).toBeNull();
    expect(
      validateBundle(b, p).find((c) => c.id === "asset:ambience")?.status,
    ).toBe("failed");
  });
  it("registers a necessary script omitted by a scene-only plan", async () => {
    const fixture = fakeTransport();
    const transport = (async (url, init) => {
      const body = JSON.parse(String(init?.body));
      const data = await (await fixture(url, init)).json();
      if (body.messages[0].content.includes("PHASE: planner")) {
        const spec = JSON.parse(data.choices[0].message.content);
        spec.tasks[0].files = [];
        data.choices[0].message.content = JSON.stringify(spec);
      }
      return Response.json(data);
    }) as typeof fetch;
    const { engine } = setup(transport);
    const p = await build(engine, "Build a farming game");
    expect(p.stage).toBe("ready_to_test");
    expect(p.spec!.tasks[0].files).toEqual(
      p.artifact!.files.map((f) => f.path),
    );
    expect(p.charges.filter((c) => c.phase === "builder")).toHaveLength(1);
  });
  it("rejects ownership collisions, external paths and invalid script placement without changing the plan", () => {
    const s = specification("Build a farming game", "Scope");
    s.tasks.push({
      id: "other",
      title: "Other system",
      requirements: ["core"],
      dependsOn: [],
      files: ["ReplicatedStorage/Scope/Owned.luau"],
    });
    const before = structuredClone(s);
    for (const f of [
      {
        path: "ReplicatedStorage/Scope/Owned.luau",
        kind: "ModuleScript" as const,
        source: "return {}",
      },
      {
        path: "ServerScriptService/Other/Game.server.luau",
        kind: "Script" as const,
        source: "print(1)",
      },
      {
        path: "ReplicatedStorage/Scope/Extra.luau",
        kind: "LocalScript" as const,
        source: "print(1)",
      },
    ])
      expect(() => validateTaskFiles(s, "coreTask", [f], "Scope")).toThrow();
    expect(s).toEqual(before);
  });
  it.each(["checkpoint", "legacy"])(
    "resumes unfinished %s tasks after builder failure and preserves completed output",
    async (format) => {
      const fixture = fakeTransport();
      let fail = true;
      const built: string[] = [];
      const transport = (async (url, init) => {
        const body = JSON.parse(String(init?.body));
        const data = await (await fixture(url, init)).json();
        const phase = /PHASE: (\w+)/.exec(body.messages[0].content)![1];
        const context = JSON.parse(
          body.messages[1].content.split(
            "\nYour last response failed validation.",
          )[0],
        );
        const value = JSON.parse(data.choices[0].message.content);
        if (phase === "planner")
          value.tasks.push({
            id: "second",
            title: "Finish setup",
            requirements: ["core"],
            dependsOn: ["coreTask"],
            files: [
              `ServerScriptService/${context.namespace}/Finish.server.luau`,
            ],
          });
        if (phase === "builder") {
          built.push(context.task.id);
          if (context.task.id === "second") {
            value.files = fail
              ? []
              : [
                  {
                    path: context.task.files[0],
                    kind: "Script",
                    source: "local complete = true",
                  },
                ];
            value.scene = [];
            value.coverage = [];
          }
        }
        data.choices[0].message.content = JSON.stringify(value);
        return Response.json(data);
      }) as typeof fetch;
      const { engine, store, dir } = setup(transport);
      let p = await build(engine, "Build a farming game");
      expect(p.stage).toBe("failed");
      expect(p.completedBuildTasks).toEqual(["coreTask"]);
      const original = structuredClone(p.artifact);
      if (format === "legacy") {
        p.completedBuildTasks = undefined;
        p.review = {
          issues: [],
          tests: [
            {
              id: "brokenLegacyTest",
              requirementId: "core",
              mode: "server",
              source: "return function() assert(true) end end",
            },
          ],
        };
        store.save(p);
      }
      fail = false;
      engine.start(p.id, p.revision, "repair");
      p = await engine.wait(p.id);
      expect(p.stage).toBe("ready_to_test");
      expect(built.filter((t) => t === "coreTask")).toHaveLength(1);
      expect(p.artifact!.files[0]).toEqual(original!.files[0]);
      expect(p.completedBuildTasks).toEqual(["coreTask", "second"]);
      expect(fs.readdirSync(path.join(dir, "history"))).toHaveLength(1);
      expect(store.get(p.id).review).not.toBeNull();
    },
  );
  it("allows coordination tasks to cite implemented dependencies without inventing scene objects", async () => {
    const fixture = fakeTransport();
    const transport = (async (url, init) => {
      const body = JSON.parse(String(init?.body));
      const context = JSON.parse(
        body.messages[1].content.split(
          "\nYour last response failed validation.",
        )[0],
      );
      const data = await (await fixture(url, init)).json();
      const value = JSON.parse(data.choices[0].message.content);
      if (body.messages[0].content.includes("PHASE: planner"))
        value.tasks.push({
          id: "integration",
          title: "Check integration",
          requirements: ["core"],
          dependsOn: ["coreTask"],
          files: [],
        });
      if (context.task?.id === "integration") {
        value.files = [];
        value.scene = [];
      }
      data.choices[0].message.content = JSON.stringify(value);
      return Response.json(data);
    }) as typeof fetch;
    const { engine } = setup(transport);
    const p = await build(engine, "Build a farming game");
    expect(p.stage).toBe("ready_to_test");
    expect(p.artifact!.scene).toHaveLength(1);
    expect(p.completedBuildTasks).toEqual(["coreTask", "integration"]);
  });
  it("corrects invalid reviewer Luau before freezing protected acceptance tests", async () => {
    let attempts = 0;
    const fixture = fakeTransport();
    const transport = (async (url, init) => {
      const body = JSON.parse(String(init?.body));
      const data = await (await fixture(url, init)).json();
      if (body.messages[0].content.includes("PHASE: reviewer")) {
        const value = JSON.parse(data.choices[0].message.content);
        if (++attempts === 1) value.tests[0].source += "\nend";
        else
          expect(body.messages[1].content).toContain(
            "Reviewer tests must compile",
          );
        data.choices[0].message.content = JSON.stringify(value);
      }
      return Response.json(data);
    }) as typeof fetch;
    const { engine } = setup(transport);
    const p = await build(engine, "Build a farming game");
    expect(p.stage).toBe("ready_to_test");
    expect(attempts).toBe(2);
    expect(p.charges.filter((c) => c.phase === "repair")).toHaveLength(0);
    expect(p.review!.tests[0].source).not.toMatch(/end\nend$/);
  });
  it("uses the next configured model after two invalid schema responses", async () => {
    const fixture = fakeTransport();
    let badAttempts = 0;
    const transport = (async (url, init) => {
      const body = JSON.parse(String(init?.body));
      if (body.model === "invalid-model") {
        badAttempts++;
        return Response.json({
          choices: [{ finish_reason: "stop", message: { content: "{}" } }],
          usage: { prompt_tokens: 100, completion_tokens: 10 },
        });
      }
      return fixture(url, init);
    }) as typeof fetch;
    const { engine, config, model } = setup(transport);
    const bad = { ...profile(), model: "invalid-model" };
    const s = config.read();
    s.profiles.push(bad);
    s.routes.planner = [bad.id, model.id];
    config.save(s);
    const p = await build(engine, "Build a farming game");
    expect(p.stage).toBe("ready_to_test");
    expect(badAttempts).toBe(2);
    expect(p.charges.filter((c) => c.model === "invalid-model")).toHaveLength(
      2,
    );
  });
  it("accepts absent empty patch collections and removes only redundant scene names", () => {
    const bundle = bundleSchema.parse({
      scene: [
        {
          path: "Workspace/Scope/Ground",
          className: "Part",
          properties: { Name: "Ground", Anchored: true },
        },
      ],
    });
    expect(bundle.files).toEqual([]);
    expect(bundle.assets).toEqual([]);
    expect(normalizeGeneratedBundle(bundle).scene[0].properties).toEqual({
      Anchored: true,
    });
    expect(bundle.scene[0].properties.Name).toBe("Ground");
    bundle.scene[0].properties.Name = "Conflict";
    expect(normalizeGeneratedBundle(bundle).scene[0].properties.Name).toBe(
      "Conflict",
    );
  });
  it("lists missing reviewer tests before attempting code repair", () => {
    const s = specification("Build a farming game", "Scope");
    s.requirements.push({ ...s.requirements[0], id: "ui" });
    expect(() => validateReview({ issues: [], tests: [] }, s)).toThrow(
      "core, ui",
    );
    expect(() =>
      validateReview(
        {
          issues: [],
          tests: [
            {
              id: "coreTest",
              requirementId: "core",
              mode: "server",
              source: "return true",
            },
          ],
        },
        s,
      ),
    ).toThrow("core, ui");
  });
  it("adds missing acceptance tests without replacing protected tests", () => {
    const existing = {
      id: "keep",
      requirementId: "core",
      mode: "server" as const,
      source: "return function() assert(false) end",
    };
    const added = {
      id: "new",
      requirementId: "ui",
      mode: "client" as const,
      source: "return function() assert(true) end",
    };
    const result = mergeReview(
      { issues: [], tests: [existing] },
      {
        issues: [],
        tests: [
          { ...existing, source: "return true" },
          { ...added, id: "keep" },
          added,
        ],
      },
    );
    expect(result.tests).toEqual([existing, added]);
    expect(mergeReview(result, { issues: [], tests: [added] }).tests).toEqual(
      result.tests,
    );
  });
  it("reports all missing task coverage and invalid quotes in one correction", () => {
    const { engine } = setup();
    const p = engine.create("Build a farming game");
    const s = specification(p.request, p.scope);
    s.requirements[0].sourceQuote = "invented";
    s.requirements.push({ ...s.requirements[0], id: "second" });
    s.tasks[0].requirements = ["unknown"];
    let message = "";
    try {
      validateSpec(s, p);
    } catch (e) {
      message = (e as Error).message;
    }
    expect(message).toContain("Unplanned requirement core");
    expect(message).toContain("Unplanned requirement second");
    expect(message).toContain("sourceQuote must copy");
    expect(message).toContain("unknown requirement unknown");
  });
  it("retries an omitted owned script with its exact path in the feedback", async () => {
    const fixture = fakeTransport();
    let attempts = 0;
    const transport = (async (url, init) => {
      const body = JSON.parse(String(init?.body));
      const data = await (await fixture(url, init)).json();
      const value = JSON.parse(data.choices[0].message.content);
      if (body.messages[0].content.includes("PHASE: builder")) {
        if (++attempts === 1) value.files = [];
        else
          expect(body.messages[1].content).toContain(
            "Builder omitted planned scripts: ServerScriptService/",
          );
      }
      data.choices[0].message.content = JSON.stringify(value);
      return Response.json(data);
    }) as typeof fetch;
    const { engine } = setup(transport);
    expect((await build(engine, "Build a farming game")).stage).toBe(
      "ready_to_test",
    );
    expect(attempts).toBe(2);
  });
  it("supplies the real namespace and runtime API reference to every generation phase", async () => {
    const observed: string[] = [];
    const { engine, store } = setup(
      fakeTransport({
        repairWorks: true,
        inspect: (phase, c) => {
          observed.push(phase);
          expect(c.runtimeReference.hierarchy.lookup).toContain(
            'WaitForChild("' + c.namespace + '")',
          );
          expect(c.runtimeReference.animation).toContain("TweenService:Create");
          expect(c.runtimeReference.interactions).toContain(
            "ProximityPrompt.Triggered",
          );
        },
      }),
    );
    let p = await build(engine, "Build a farming game");
    expect(p.stage).toBe("ready_to_test");
    p.artifact!.files[0].source = "local = broken";
    store.save(p);
    engine.start(p.id, p.revision, "repair");
    p = await engine.wait(p.id);
    expect(p.stage).toBe("ready_to_test");
    expect(new Set(observed)).toEqual(
      new Set(["planner", "builder", "reviewer", "repair"]),
    );
  });
  it("builds scene-only tasks and validates scene-backed coverage", async () => {
    const fixture = fakeTransport();
    const transport = (async (url, init) => {
      const response = await fixture(url, init);
      const data = await response.json();
      const value = JSON.parse(data.choices[0].message.content);
      if (value.tasks) value.tasks[0].files = [];
      if (value.scene) {
        value.files = [];
        value.coverage[0].files = [value.scene[0].path];
      }
      data.choices[0].message.content = JSON.stringify(value);
      return Response.json(data);
    }) as typeof fetch;
    const { engine, dir } = setup(transport);
    const p = await build(engine, "Build a farming landscape");
    expect(p.stage).toBe("ready_to_test");
    expect(p.artifact?.files).toEqual([]);
    expect(p.checks.filter((c) => c.status === "failed")).toEqual([]);
    const trace = JSON.parse(
      fs.readFileSync(path.join(dir, "traces", p.id + ".json"), "utf8"),
    );
    expect(trace.phase).toBe("reviewer");
    expect(Object.keys(trace).sort()).toEqual([
      "at",
      "model",
      "phase",
      "response",
    ]);
  });
  it("rejects a scene-only task that produces no objects", async () => {
    const fixture = fakeTransport();
    const transport = (async (url, init) => {
      const data = await (await fixture(url, init)).json();
      const value = JSON.parse(data.choices[0].message.content);
      if (value.tasks) value.tasks[0].files = [];
      if (value.scene) {
        value.files = [];
        value.scene = [];
      }
      data.choices[0].message.content = JSON.stringify(value);
      return Response.json(data);
    }) as typeof fetch;
    const { engine } = setup(transport);
    const p = await build(engine, "Build a landscape");
    expect(p.stage).toBe("failed");
    expect(p.error).toContain("empty task");
  });
  it("resolves a redundant task from concrete shared requirement evidence even when the planner omitted its dependency", async () => {
    const fixture = fakeTransport();
    let reuseCalls = 0;
    const transport = (async (url, init) => {
      const body = JSON.parse(String(init?.body));
      const context = JSON.parse(
        body.messages[1].content.split(
          "\nYour last response failed validation.",
        )[0],
      );
      const data = await (await fixture(url, init)).json();
      const value = JSON.parse(data.choices[0].message.content);
      if (value.tasks)
        value.tasks.push({
          id: "reuse",
          title: "Shared feature setup",
          requirements: ["core"],
          dependsOn: [],
          files: [],
        });
      if (context.task?.id === "reuse") {
        reuseCalls++;
        expect(context.current.files).toHaveLength(1);
        value.files = [];
        value.scene = [];
        value.coverage[0].files = [context.current.files[0].path];
      }
      data.choices[0].message.content = JSON.stringify(value);
      return Response.json(data);
    }) as typeof fetch;
    const { engine } = setup(transport);
    const p = await build(engine, "Build a farming game");
    expect(p.stage).toBe("ready_to_test");
    expect(reuseCalls).toBe(1);
    expect(p.completedBuildTasks).toEqual(["coreTask", "reuse"]);
    expect(p.artifact?.files).toHaveLength(1);
    expect(p.spec?.tasks[1].dependsOn).toEqual([]);
  });
  it("plans from saved source IDs without a quotation retry or extra charge", async () => {
    let count = 0;
    const transport = (async (_url, init) => {
      count++;
      const system = JSON.parse(String(init?.body)).messages[0].content;
      const contract = JSON.parse(system.split("\nOUTPUT SCHEMA: ")[1]);
      const userRequirement = contract.properties.requirements.items.oneOf.find(
        (v: any) => v.properties.origin.const === "user",
      );
      expect(userRequirement.required).toContain("sourceId");
      expect(userRequirement.required).toContain("description");
      expect(userRequirement.required).not.toContain("sourceQuote");
      expect(userRequirement.properties.sourceId.enum).toEqual([
        "request",
        "answer:respawnRules",
      ]);
      const context = JSON.parse(
        JSON.parse(String(init?.body)).messages[1].content,
      );
      expect(
        context.requirementContract.requiredFieldsForEveryRequirement,
      ).toContain("description");
      expect(context.requirementContract.allowedUserSourceIds).toEqual([
        "request",
        "answer:respawnRules",
      ]);
      expect(context.userSources).toEqual([
        { id: "request", text: context.request, answerId: null },
        {
          id: "answer:respawnRules",
          text: "Instant respawn after short delay",
          answerId: "respawnRules",
        },
      ]);
      const s: any = specification(context.request, context.namespace);
      s.requirements[0].sourceId = "answer:respawnRules";
      delete s.requirements[0].sourceQuote;
      return Response.json({
        choices: [
          { message: { content: JSON.stringify(s) }, finish_reason: "stop" },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 20 },
      });
    }) as typeof fetch;
    const { engine } = setup(transport);
    let p = engine.create("Build a brainrot game");
    p = engine.revise(p.id, p.revision, p.request, {
      respawnRules: "Instant respawn after short delay",
    });
    engine.start(p.id, p.revision, "plan");
    const result = await engine.wait(p.id);
    expect(result.stage).toBe("review");
    expect(count).toBe(1);
    expect(result.charges).toHaveLength(1);
    expect(result.spec!.requirements[0].sourceQuote).toBe(
      "Instant respawn after short delay",
    );
    expect(engine.approve(p.id, p.revision).approvedRevision).toBe(p.revision);
  });
  it("corrects overqualified Marketplace discovery on the same planner route without supplying a query", async () => {
    let calls = 0;
    const transport = (async (_url, init) => {
      const input = JSON.parse(String(init?.body)).messages[1].content;
      const context = JSON.parse(input.split("\nYour last response")[0]);
      const s = specification(context.request, context.namespace);
      s.assetStrategy =
        "Inspect a reusable component before writing replacements";
      s.assetNeeds = [
        {
          id: "component",
          requirementId: "core",
          role: "Interactive reusable component",
          kind: "Model",
          query:
            ++calls === 1
              ? "small yellow polished interactive object model"
              : "interactive object",
          constraints: "Inspect existing behavior",
          intent: {
            experienceRole: "Main interaction for the requested experience",
            interaction: "Activate the object and observe its response",
            reusableFeatures: ["Existing response animation"],
            relatedRequirementIds: ["core"],
          },
          required: false,
          position: [0, 0, 0],
          maxSize: 12,
        },
      ];
      if (calls === 2)
        expect(input).toContain(
          "Model discovery must start with a short subject query",
        );
      return Response.json({
        choices: [
          { message: { content: JSON.stringify(s) }, finish_reason: "stop" },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 20 },
      });
    }) as typeof fetch;
    const { engine } = setup(transport);
    const p = engine.create("Build a Marketplace-first interactive object");
    engine.start(p.id, 1, "plan");
    const result = await engine.wait(p.id);
    expect(result.stage).toBe("review");
    expect(calls).toBe(2);
    expect(result.spec!.assetNeeds![0].query).toBe("interactive object");
    expect(new Set(result.charges.map((c) => c.profileId)).size).toBe(1);
  });
  it("repairs invalid requirement quotations using bounded, explicit feedback", async () => {
    let count = 0;
    const transport = (async (_url, init) => {
      const input = JSON.parse(String(init?.body)).messages[1].content;
      const context = JSON.parse(input.split("\nYour last response")[0]);
      const s = specification(context.request, context.namespace);
      if (++count === 1)
        s.requirements[0].sourceQuote = "paraphrase not present";
      else {
        expect(input).toContain("sourceQuote must copy an exact substring");
        expect(input).toContain('Set sourceId to one of ["request"]');
        s.requirements[0].sourceId = "request";
        s.requirements[0].sourceQuote = "";
      }
      return Response.json({
        choices: [
          { message: { content: JSON.stringify(s) }, finish_reason: "stop" },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 20 },
      });
    }) as typeof fetch;
    const { engine } = setup(transport);
    const p = engine.create("Build a farming game");
    engine.start(p.id, 1, "plan");
    const result = await engine.wait(p.id);
    expect(result.stage).toBe("review");
    expect(result.charges).toHaveLength(2);
    expect(
      result.events.some((e) => e.message.includes("Validation feedback")),
    ).toBe(true);
  });
  it("retains rejected visual feedback after repair without treating its screenshot as current or repeating repair", async () => {
    const phases: string[] = [];
    let repairCalls = 0;
    const fixture = fakeTransport();
    const transport = (async (url, init) => {
      const body = JSON.parse(String(init?.body));
      if (Array.isArray(body.messages[1].content)) {
        phases.push(/PHASE: (\w+)/.exec(body.messages[0].content)![1]);
        body.messages[1].content = body.messages[1].content.find(
          (c: any) => c.type === "text",
        ).text;
      }
      body.messages[1].content = body.messages[1].content.split(
        "\nUser-supplied screenshot",
      )[0];
      const data = await (
        await fixture(url, { ...init, body: JSON.stringify(body) })
      ).json();
      if (body.messages[0].content.includes("PHASE: repair")) {
        repairCalls++;
        const bundle = JSON.parse(data.choices[0].message.content);
        bundle.scene[0].properties.Color.value = [0.8, 0.9, 0.2];
        data.choices[0].message.content = JSON.stringify(bundle);
      }
      return Response.json(data);
    }) as typeof fetch;
    const { engine, store } = setup(transport);
    let p = await build(engine, "Build a farming game");
    store.save(
      attachVisual(p, {
        revision: 1,
        dataUrl:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=",
        notes: "Make the crop HUD readable",
      }),
    );
    const originalEvidence = structuredClone(p.visualEvidence);
    engine.start(p.id, 1, "repair");
    p = await engine.wait(p.id);
    expect(phases).toEqual(["reviewer", "repair"]);
    expect(p.visualEvidence).toEqual({
      ...originalEvidence,
      reviewStatus: "awaiting_inspection",
    });
    expect(p.visualEvidence!.artifactHash).not.toBe(bundleHash(p.artifact!));
    expect(p.checks).toContainEqual(
      expect.objectContaining({
        id: "visual:inspection",
        status: "pending",
      }),
    );
    expect(p.stage).toBe("ready_to_test");
    engine.start(p.id, 1, "repair");
    p = await engine.wait(p.id);
    expect(repairCalls).toBe(1);
    expect(phases).toEqual(["reviewer", "repair"]);
    expect(p.stage).toBe("ready_to_test");
    expect(p.visualEvidence?.reviewStatus).toBe("awaiting_inspection");
    expect(p.checks).toContainEqual(
      expect.objectContaining({
        id: "visual:inspection",
        status: "pending",
      }),
    );
  });
  it("passes unrelated requests through the model and exports distinct generated code, never a combat template", async () => {
    const seen: string[] = [];
    const { engine } = setup(
      fakeTransport({
        inspect: (phase, c) => {
          if (phase === "builder") seen.push(c.request);
        },
      }),
    );
    const farming = await build(engine, "Build a farming game");
    const racing = await build(engine, "Build a racing game");
    expect(seen).toEqual(["Build a farming game", "Build a racing game"]);
    expect(farming.stage).toBe("ready_to_test");
    expect(racing.artifact!.files[0].source).toContain("Lap");
    expect(farming.artifact!.files[0].source).toContain("Harvest");
    expect(bundleHash(farming.artifact!)).not.toBe(
      bundleHash(racing.artifact!),
    );
    expect(exportBundle(farming.artifact!, farming.scope)).toContain("Harvest");
    expect(farming.studioEvidence).toBeNull();
    expect(farming.charges).toHaveLength(3);
    expect(farming.charges.reduce((s, c) => s + c.chargedMicros, 0)).toBe(1500);
  });
  it("requires answers, replanning and current approval; edits invalidate the artifact", async () => {
    const { engine } = setup(fakeTransport({ question: true }));
    let p = engine.create("Build a farming game");
    engine.start(p.id, 1, "plan");
    p = await engine.wait(p.id);
    expect(p.stage).toBe("clarification");
    expect(() => engine.approve(p.id, 1)).toThrow("Answer");
    p = engine.revise(p.id, 1, p.request, { device: "Mobile" });
    engine.start(p.id, 2, "plan");
    p = await engine.wait(p.id);
    expect(p.spec!.questions).toEqual([]);
    engine.approve(p.id, 2);
    expect(() => engine.start(p.id, 1, "build")).toThrow("Revision");
    engine.start(p.id, 2, "build");
    p = await engine.wait(p.id);
    p = engine.revise(p.id, 2, "Build a racing game", {});
    expect(p.artifact).toBeNull();
    expect(p.approvedRevision).toBeNull();
    expect(() => engine.start(p.id, 3, "build")).toThrow("Approve");
  });
  it("repairs syntax errors with diagnostics and retains the protected acceptance tests", async () => {
    let protectedSource = "";
    const { engine, store } = setup(
      fakeTransport({
        repairWorks: true,
        inspect: (phase, c) => {
          if (phase === "repair") {
            expect(
              c.failures.some((x: any) => x.id.startsWith("compile:")),
            ).toBe(true);
            protectedSource = c.protectedTests[0].source;
          }
        },
      }),
    );
    let p = await build(engine, "Build a farming game");
    p.artifact!.files[0].source = "local = broken";
    store.save(p);
    engine.start(p.id, p.revision, "repair");
    p = await engine.wait(p.id);
    expect(p.stage).toBe("ready_to_test");
    expect(p.review!.tests[0].source).toBe(protectedSource);
    expect(p.charges.map((c) => c.phase)).toEqual([
      "planner",
      "builder",
      "reviewer",
      "reviewer",
      "repair",
      "reviewer",
    ]);
  });
  it("stops after the bounded repair limit instead of labeling invalid code ready", async () => {
    const fixture = fakeTransport();
    const transport = (async (url, init) => {
      const data = await (await fixture(url, init)).json();
      if (
        JSON.parse(String(init?.body)).messages[0].content.includes(
          "PHASE: repair",
        )
      ) {
        const bundle = JSON.parse(data.choices[0].message.content);
        bundle.files[0].source = "local = stillBroken";
        data.choices[0].message.content = JSON.stringify(bundle);
      }
      return Response.json(data);
    }) as typeof fetch;
    const { engine, store } = setup(transport, 1);
    let p = await build(engine, "Build a racing game");
    p.artifact!.files[0].source = "local = broken";
    store.save(p);
    engine.start(p.id, p.revision, "repair");
    p = await engine.wait(p.id);
    expect(p.stage).toBe("failed");
    expect(
      p.checks.some(
        (c) => c.id.startsWith("compile:") && c.status === "failed",
      ),
    ).toBe(true);
    expect(p.charges.filter((c) => c.phase === "repair")).toHaveLength(1);
  });
  it("blocks unknown assets, missing coverage and escaping paths", async () => {
    const { engine } = setup();
    const p = await build(engine, "Build a farming game");
    const b = structuredClone(p.artifact!);
    b.coverage = [];
    b.files[0].source += '\nlocal asset="rbxassetid://12345"';
    b.scene[0].path = "Workspace/Other/Ground";
    const checks = validateBundle(b, p);
    expect(
      checks.filter((c) => c.status === "failed").map((c) => c.id),
    ).toEqual(
      expect.arrayContaining([
        "structure",
        "coverage:core",
        "undeclared-asset:12345",
      ]),
    );
  });
  it("validates provenance, complete task ownership and acyclic dependencies", async () => {
    const { engine } = setup();
    const p = await build(engine, "Build a farming game");
    const s = structuredClone(p.spec!);
    s.tasks[0].dependsOn = ["coreTask"];
    expect(() => validateSpec(s, p)).toThrow("cycle");
    s.tasks[0].dependsOn = [];
    delete s.requirements[0].sourceId;
    s.requirements[0].sourceQuote = "not present";
    expect(() => validateSpec(s, p)).toThrow("quotation");
  });
  it("rejects overlapping jobs and persists conservative spend after cancellation", async () => {
    const { engine, store } = setup(fakeTransport({ delay: 100 }));
    const p = engine.create("Build a farming game");
    engine.start(p.id, 1, "plan");
    expect(() => engine.start(p.id, 1, "plan")).toThrow("already");
    engine.cancel(p.id);
    const done = await engine.wait(p.id);
    expect(done.stage).toBe("interrupted");
    expect(done.charges[0].estimated).toBe(true);
    expect(done.charges[0].chargedMicros).toBeGreaterThan(0);
    expect(store.get(p.id).reservedMicros).toBe(0);
  });
  it("prevents a provider call that cannot fit the budget", async () => {
    let called = false;
    const { engine, config } = setup(
      fakeTransport({ inspect: () => (called = true) }),
    );
    config.save({ ...config.read(), budgetMicros: 1000 });
    const p = engine.create("Build a farming game");
    engine.start(p.id, 1, "plan");
    const done = await engine.wait(p.id);
    expect(done.error).toContain("budget");
    expect(called).toBe(false);
  });
  it("recovers interrupted reservations and preserves legacy projects before migration", () => {
    const { store, dir } = setup();
    const p = new Engine(
      store,
      new Configuration(path.join(dir, "config")),
    ).create("Build a farming game");
    p.jobId = "interrupted";
    p.reservedMicros = 9000;
    store.save(p);
    store.recover();
    expect(store.get(p.id).charges[0].chargedMicros).toBe(9000);
    fs.writeFileSync(
      path.join(dir, p.id + ".json"),
      JSON.stringify({ request: p.request, artifact: "legacy" }),
    );
    const migrated = store.get(p.id);
    expect(migrated.legacyImport).toBe(true);
    expect(migrated.artifact).toBeNull();
    expect(
      fs.readFileSync(path.join(dir, p.id + ".json.legacy"), "utf8"),
    ).toContain("legacy");
  });
  it("selects only declared dependency sources for a builder task", async () => {
    const { engine } = setup();
    const p = await build(engine, "Build a farming game");
    const s = structuredClone(p.spec!);
    s.tasks.push(
      {
        id: "unrelated",
        title: "Unrelated",
        requirements: ["core"],
        dependsOn: [],
        files: ["ServerScriptService/" + p.scope + "/Other.server.luau"],
      },
      {
        id: "dependent",
        title: "Dependent",
        requirements: ["core"],
        dependsOn: ["coreTask"],
        files: ["ServerScriptService/" + p.scope + "/Next.server.luau"],
      },
    );
    const b = structuredClone(p.artifact!);
    b.files.push({
      path: s.tasks[1].files[0],
      kind: "Script",
      source: 'print("unrelated")',
    });
    expect(
      dependencyContext(s, "dependent", b).files.map((f) => f.path),
    ).toEqual(s.tasks[0].files);
  });
  it("repairs reported Studio failures without replacing protected tests", async () => {
    let observed = false;
    const fixture = fakeTransport({
      inspect: (phase, c) => {
        if (
          phase === "repair" &&
          c.failures.some((f: any) => f.id === "studio:coreTest")
        )
          observed = true;
      },
    });
    const transport = (async (url, init) => {
      const data = await (await fixture(url, init)).json();
      if (
        JSON.parse(String(init?.body)).messages[0].content.includes(
          "PHASE: repair",
        )
      ) {
        const bundle = JSON.parse(data.choices[0].message.content);
        bundle.files[0].source = bundle.files[0].source.replace(
          "state.Value = 1",
          "state.Value = 2",
        );
        data.choices[0].message.content = JSON.stringify(bundle);
      }
      return Response.json(data);
    }) as typeof fetch;
    const { engine, store } = setup(transport);
    let p = await build(engine, "Build a farming game");
    const tests = structuredClone(p.review!.tests);
    p.studioEvidence = {
      revision: 1,
      artifactHash: bundleHash(p.artifact!),
      checks: [
        {
          id: "coreTest",
          status: "failed",
          detail: "Harvest failed after respawn",
        },
      ],
      logs: [],
      at: new Date().toISOString(),
    };
    store.save(p);
    engine.start(p.id, 1, "repair");
    p = await engine.wait(p.id);
    expect(observed).toBe(true);
    expect(p.review!.tests).toEqual(tests);
    expect(p.studioEvidence).toBeNull();
    expect(p.stage).toBe("ready_to_test");
  });
});
