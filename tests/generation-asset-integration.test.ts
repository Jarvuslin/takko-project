import { afterEach, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { Engine } from "../src/generation/engine";
import { Configuration } from "../src/generation/settings";
import { GenerationStore } from "../src/generation/store";
import { assessAssetExecution } from "../src/benchmark/asset-execution";
import {
  fixtureBundle,
  fixtureReview,
  profile,
  specification,
} from "./generation-fixtures";
import type {
  AssetAdapter,
  AssetCandidate,
  AssetNeed,
  AssetReceipt,
} from "../src/generation/asset-contract";
import type { Bundle, Project } from "../src/generation/schema";
import { researchInputHash } from "../src/generation/research";
import { componentReviewFixture } from "./component-review.fixture";
import { integrationFixture } from "./component-integration.fixture";

function researchFixture(p: Project): NonNullable<Project["research"]> {
  return {
    referenceGame: "Orchard reference",
    summary: "Harvest trees with readable feedback",
    mechanics: [
      {
        id: "harvest",
        description: "Harvest fruit",
        importance: "core",
        sourceUrls: ["https://example.com/orchard"],
      },
    ],
    unknowns: ["Exact pacing is unverified"],
    sources: [
      {
        url: "https://example.com/orchard",
        title: "Offline research fixture",
        excerpt: "Fixture only",
      },
    ],
    inputHash: researchInputHash(p),
    retrievedAt: "2026-09-16T00:00:00Z",
    method: "openrouter-exa",
  };
}

// These execute the real Engine/asset orchestration; providers, compiler and Studio are offline doubles.
const png =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
const studioId = randomUUID();
const need: AssetNeed = {
  id: "tree",
  requirementId: "core",
  role: "Decorative orchard tree",
  kind: "Model",
  query: "stylized orchard tree",
  constraints: "Script-free mesh within six studs",
  intent: {
    experienceRole: "Give the orchard a recognizable decorative tree",
    interaction:
      "Decorative; harvesting behavior belongs to the game's controller",
    reusableFeatures: ["Tree silhouette and foliage"],
    relatedRequirementIds: ["core"],
  },
  required: true,
  position: [6, 1, 0],
  maxSize: 6,
};
const candidate: AssetCandidate = {
  id: "101",
  name: "Orchard tree",
  kind: "Model",
  creator: "offline-fixture",
  sourceUrl: "https://create.roblox.com/store/asset/101",
  price: 0,
  source: "creator_store",
};
const receipt = (operation: string): AssetReceipt => ({
  operation,
  at: "2026-09-15T00:00:00Z",
  studioId,
  data: { mocked: true },
});
const functional = { contentLoaded: true, instanceCount: 1, scriptCount: 0 };
const directories: string[] = [];
function importedBundle(scope: string): Bundle {
  return {
    files: [],
    coverage: [],
    scene: [
      {
        path: `Workspace/${scope}/Retrieved`,
        className: "Folder",
        properties: {},
      },
      {
        path: `Workspace/${scope}/Retrieved/Tree`,
        className: "MeshPart",
        properties: {
          MeshId: "rbxassetid://202",
          TextureID: "rbxassetid://303",
          Anchored: true,
          Size: { type: "Vector3", value: [4, 6, 4] },
        },
      },
    ],
    assets: [
      {
        id: "tree",
        kind: "mesh",
        requirementId: "core",
        status: "retrieved",
        assetId: "101",
        sourceUrl: candidate.sourceUrl,
        description: "Verified exported tree",
      },
    ],
  };
}
type RecordedCall = {
  model: string;
  phase: string;
  system: string;
  context: any;
  images: string[];
};
function setup(
  options: {
    selectionFailure?: boolean;
    evaluationFailure?: boolean;
    selectionEscalates?: boolean;
    adapterFailure?: "search" | "place";
    bind?: boolean;
    factory?: boolean;
    discoverRock?: boolean;
    registrationBeforeDiscovery?: boolean;
    rockFailure?: boolean;
    componentReview?: boolean;
    componentReviewLines?: boolean;
    invalidComponentReview?: boolean;
    schemaMetadataComponentReview?: boolean;
    componentAdaptation?: boolean;
    componentAdaptationApplied?: boolean;
    componentRepair?: boolean;
    invalidComponentAdaptation?: boolean;
    componentPrepared?: boolean;
    reuseOnly?: boolean;
  } = {},
) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-engine-assets-"));
  directories.push(dir);
  const store = new GenerationStore(dir),
    config = new Configuration(path.join(dir, "config"));
  const worker = { ...profile(), name: "Worker", model: "fixture-worker" },
    evaluator = { ...profile(), name: "Evaluator", model: "fixture-evaluator" },
    fallback = {
      ...profile(),
      name: "Forbidden rescue",
      model: "fixture-strong-rescue",
    };
  config.save({
    profiles: [worker, evaluator, fallback],
    routes: {
      planner: [worker.id],
      builder: [worker.id, fallback.id],
      reviewer: [evaluator.id, fallback.id],
      repair: [worker.id, fallback.id],
    },
    budgetMicros: 2e6,
    repairLimit: 0,
  });
  const calls: RecordedCall[] = [],
    effects: string[] = [];
  let exported: Bundle | undefined;
  let boundProject: Project;
  let preparedFixture: ReturnType<typeof integrationFixture>;
  let requestedRock = false;
  const transport = (async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    const content = body.messages[1].content;
    const user =
      typeof content === "string"
        ? content
        : content
            .filter((item: any) => item.type === "text")
            .map((item: any) => item.text)
            .join("\n");
    const context = JSON.parse(
      user
        .split("\nNative Studio capture")[0]
        .split("\nYour last response failed validation.")[0],
    );
    const phase = /PHASE: (\w+)/.exec(body.messages[0].content)![1];
    const images = Array.isArray(content)
      ? content
          .filter((item) => item.type === "image_url")
          .map((item) => item.image_url.url)
      : [];
    calls.push({
      model: body.model,
      phase,
      system: body.messages[0].content,
      context,
      images,
    });
    let output: unknown;
    if (context.task === "asset-selection") {
      effects.push("select");
      if (options.selectionFailure)
        return Response.json(
          { error: { message: "offline worker unavailable" } },
          { status: 503 },
        );
      output = options.selectionEscalates
        ? {
            action: "escalate",
            candidateId: null,
            query: null,
            reason: "Cannot select safely",
          }
        : {
            action: "select",
            candidateId: context.context.candidates[0].id,
            query: null,
            reason: "Offered tree fits the role",
          };
    } else if (context.task === "component-source-review") {
      effects.push("component-review");
      output = {
        ...componentReviewFixture(
          context.context.requirementIds,
          context.context.evidence.token,
        ).decision,
        packetHash: context.context.evidence.packetHash,
        inputHash: context.context.evidence.inputHash,
        ...(options.invalidComponentReview ? { reason: "x".repeat(2001) } : {}),
        ...(options.schemaMetadataComponentReview
          ? { $schema: "https://json-schema.org/draft/2020-12/schema" }
          : {}),
        ...(options.componentAdaptation ||
        (options.componentAdaptationApplied && !context.context.preservation)
          ? { disposition: "needs_more_evidence" }
          : {}),
      };
      if (options.componentAdaptationApplied && context.context.preservation) {
        const review = output as ReturnType<
          typeof componentReviewFixture
        >["decision"];
        const sha = context.context.evidence.sourceBodies[0].sha256;
        review.sources[0].sha256 = sha;
        review.requirements[0].sourceHashes = [sha];
        review.permissionImpacts[0].sourceHashes = [sha];
        if (
          options.componentRepair &&
          context.context.adaptation?.attempt === 1
        ) {
          review.disposition = "needs_more_evidence";
          review.reason = "Offline review requests a lifecycle repair";
          review.sources[0].unresolved = ["Offline lifecycle defect remains"];
        }
      }
      if (options.componentReviewLines) {
        const review = output as ReturnType<
          typeof componentReviewFixture
        >["decision"];
        const dependency = review.sources[0].dependencies[0];
        if (!("sourceQuote" in dependency))
          throw Error("Expected quote fixture");
        const { sourceQuote: _quote, ...fields } = dependency;
        review.sources[0].dependencies[0] = {
          ...fields,
          sourceLines: { start: 2, end: 2 },
        };
      }
    } else if (context.task === "component-adaptation") {
      effects.push("component-adaptation");
      output = {
        action: "reject",
        reason: "No suitable behavior for this game in the captured component",
      };
      if (options.componentAdaptationApplied) {
        const evidence = context.context.evidence;
        output = {
          action: "adapt",
          plan: {
            packetHash: evidence.packetHash,
            inputHash: evidence.inputHash,
            reason: "Offline preservation handoff",
            removeSubtrees: [],
            replaceSources: [
              {
                indices: [2, 3],
                beforeSha256: evidence.sourceBodies[0].sha256,
                source:
                  evidence.sourceBodies[0].source + "\n-- offline adaptation",
                reason: "Fixture change",
              },
            ],
            preservedBehavior: ["Unverified preservation claim"],
            remainingIntegration: [],
            nativeTestPlan: ["Not run"],
            runtimeVerification: "not_performed",
          },
        };
      }
      if (options.invalidComponentAdaptation)
        output = { action: "reject", reason: "x".repeat(2001) };
    } else if (context.task === "asset-evaluation") {
      effects.push("evaluate:" + context.context.phase);
      if (options.evaluationFailure)
        return Response.json(
          { error: { message: "offline evaluator unavailable" } },
          { status: 503 },
        );
      output = {
        accepted: true,
        reason: "Offline evaluator accepts supplied native fixture image",
        visualFit: true,
        functionalFit: true,
      };
    } else if (phase === "planner") {
      const spec = specification(context.request, context.namespace);
      if (options.reuseOnly) spec.tasks[0].files = [];
      if (options.registrationBeforeDiscovery) {
        spec.tasks[0].files = [];
        spec.tasks.push({
          id: "integrationTask",
          title: "Bind later acquisition",
          requirements: ["core"],
          dependsOn: ["coreTask"],
          files: [],
        });
      }
      spec.assetStrategy =
        "Retrieve and verify a tree before authoring the surrounding gameplay";
      spec.assetNeeds = [structuredClone(need)];
      output = spec;
    } else if (phase === "reviewer") output = fixtureReview;
    else {
      effects.push("code");
      output = fixtureBundle(context.request, context.namespace);
      if (
        options.registrationBeforeDiscovery &&
        context.task.id === "integrationTask"
      ) {
        (output as Bundle).files = [];
        (output as Bundle).scene = [];
      }
      if (options.reuseOnly) {
        const component = context.retainedComponents?.[0];
        if (!component) throw Error("Retained component context missing");
        output = {
          files: [],
          scene: [],
          assets: [],
          coverage: [
            {
              requirementId: "core",
              status: "implemented",
              detail:
                "Reuse the retained fixture component; runtime verification still required",
              files: [component.rootPath],
            },
          ],
        };
      }
      if (
        options.discoverRock &&
        !requestedRock &&
        (!options.registrationBeforeDiscovery ||
          context.task.id === "integrationTask")
      ) {
        requestedRock = true;
        (output as Bundle).assets.push({
          id: "rock",
          requirementId: "core",
          kind: "mesh",
          status: "needed",
          assetId: null,
          sourceUrl: null,
          description: "Orchard boulder",
        });
      }
    }
    return Response.json({
      choices: [
        { finish_reason: "stop", message: { content: JSON.stringify(output) } },
      ],
      usage: { prompt_tokens: 100, completion_tokens: 200 },
    });
  }) as typeof fetch;
  const adapter: AssetAdapter = {
    identity: "offline-engine-adapter",
    ...(options.componentPrepared
      ? {
          prepareComponentIntegration: vi.fn(async () => ({
            ...preparedFixture,
            receipts: [receipt("component-integration")],
          })),
        }
      : {}),
    ...(options.componentAdaptation || options.componentAdaptationApplied
      ? {
          adaptComponent: vi.fn<NonNullable<AssetAdapter["adaptComponent"]>>(
            async (_inspection, original, plan) => {
              if (!options.componentAdaptationApplied)
                throw Error("Rejected component must not be mutated");
              const evidence = structuredClone(original);
              evidence.packetHash = createHash("sha256")
                .update(JSON.stringify(plan))
                .digest("hex");
              evidence.derivativeHash = createHash("sha256")
                .update("archive:" + evidence.packetHash)
                .digest("hex");
              evidence.sourceBodies[0].source = plan.replaceSources[0].source;
              evidence.sourceBodies[0].sha256 = createHash("sha256")
                .update(plan.replaceSources[0].source)
                .digest("hex");
              return { evidence, receipts: [receipt("adaptation")] };
            },
          ),
        }
      : {}),
    search: vi.fn(async (requested) => {
      effects.push("search");
      if (requested.id === "rock" && options.rockFailure)
        throw Error("Rock search fixture failed");
      if (options.adapterFailure === "search")
        throw Error("search fixture failed");
      return { candidates: [candidate], receipts: [receipt("search")] };
    }),
    inspect: vi.fn(async (_need, selected, attemptId) => {
      effects.push("inspect");
      return {
        candidate: selected,
        token: options.componentPrepared ? randomUUID() : attemptId,
        path: "Workspace/OwnedInspection/Tree",
        safe: true,
        reasons: [],
        snapshot: { mocked: true },
        image: png,
        receipts: [receipt("inspect")],
        functional,
        ...(options.componentReview && _need.id === need.id
          ? {
              safe: false,
              functional: { ...functional, scriptCount: 2 },
              capabilityBlock: {
                kind: "interactive_asset_requires_review" as const,
                reason: "Scripted component requires complete review",
              },
            }
          : {}),
      };
    }),
    ...(options.componentReview
      ? {
          prepareComponentReview: vi.fn(
            async (inspection: any, inputHash: string) => {
              effects.push("component-prepare");
              if (options.componentPrepared) {
                preparedFixture = integrationFixture(
                  path.join(dir, "asset-evidence", boundProject.id),
                  boundProject.scope,
                  { need, inputHash, token: inspection.token },
                );
                return {
                  evidence: preparedFixture.evidence,
                  receipts: [receipt("component-prepare")],
                };
              }
              const { evidence } = componentReviewFixture(
                ["core"],
                inspection.token,
              );
              evidence.inputHash = inputHash;
              if (options.componentAdaptationApplied)
                evidence.nodes.push({
                  index: 4,
                  parentIndex: 1,
                  name: "Geometry",
                  className: "Part",
                });
              return { evidence, receipts: [receipt("component-prepare")] };
            },
          ),
        }
      : {}),
    place: vi.fn(async (requested) => {
      effects.push("place");
      if (options.adapterFailure === "place")
        throw Object.assign(Error("Native outcome unknown"), {
          outcome: "unknown",
        });
      const bundle = structuredClone(exported!);
      if (requested.id === "rock") {
        bundle.scene[1].path = bundle.scene[1].path.replace(/Tree$/, "Rock");
        bundle.assets[0].id = "rock";
        bundle.assets[0].description = "Verified exported boulder";
      }
      return {
        passed: true,
        reasons: [],
        snapshot: { mocked: true },
        image: png,
        receipts: [receipt("place")],
        functional,
        bundle,
      };
    }),
    discard: vi.fn(async () => {
      effects.push("release");
      return [receipt("discard")];
    }),
  };
  const close = vi.fn(async () => {
    effects.push("close");
  });
  const factory = vi.fn(async (p: Project) => {
    boundProject = p;
    exported = importedBundle(p.scope);
    return { adapter, close };
  });
  const compiler = vi.fn(async () => [
    {
      id: "offline-compile",
      status: "passed" as const,
      detail: "Compiler double; not native Studio verification",
    },
  ]);
  const engine = new Engine(
    store,
    config,
    transport,
    compiler,
    options.factory === false ? undefined : factory,
  );
  async function plan() {
    let p = engine.create(
      "Build a farming game with a retrieved decorative tree",
    );
    engine.start(p.id, p.revision, "plan");
    p = await engine.wait(p.id);
    expect(p.stage).toBe("review");
    engine.approve(p.id, p.revision);
    if (options.bind !== false)
      engine.bindAssetStudio(p.id, p.revision, studioId);
    return store.get(p.id);
  }
  async function build() {
    const p = await plan();
    engine.start(p.id, p.revision, "build");
    return engine.wait(p.id);
  }
  return {
    engine,
    store,
    config,
    dir,
    calls,
    effects,
    adapter,
    factory,
    close,
    compiler,
    worker,
    evaluator,
    fallback,
    plan,
    build,
    getExported: () => exported!,
  };
}
afterEach(() => {
  for (const directory of directories.splice(0)) {
    const absolute = path.resolve(directory);
    if (
      !absolute.startsWith(path.resolve(os.tmpdir()) + path.sep) ||
      !path.basename(absolute).startsWith("takko-engine-assets-")
    )
      throw Error("Unexpected fixture cleanup path");
    fs.rmSync(absolute, { recursive: true, force: true });
  }
});

it("validates and serializes a bounded optional component reviewer without defaults", () => {
  const s = setup(),
    settings = s.config.read();
  expect(settings.routes).not.toHaveProperty("componentReviewer");
  expect(() =>
    s.config.save({
      ...settings,
      routes: { ...settings.routes, componentReviewer: [randomUUID()] },
    }),
  ).toThrow(/unknown model/);
  expect(() =>
    s.config.save({
      ...settings,
      routes: {
        ...settings.routes,
        componentReviewer: [s.evaluator.id, s.fallback.id],
      },
    }),
  ).toThrow();
  s.config.save({
    ...settings,
    routes: { ...settings.routes, componentReviewer: [s.fallback.id] },
  });
  expect(
    new Configuration(path.join(s.dir, "config")).read().routes
      .componentReviewer,
  ).toEqual([s.fallback.id]);
  expect(s.config.public().routes.componentReviewer).toEqual([s.fallback.id]);
  // Deleting a routed profile requires removing its route reference as well.
  expect(() =>
    s.config.save({
      ...s.config.read(),
      profiles: settings.profiles.filter((p) => p.id !== s.fallback.id),
    }),
  ).toThrow(/unknown model/);
});

it("validates optional component adapter references and persists no default route", () => {
  const s = setup(),
    settings = s.config.read();
  expect(settings.routes).not.toHaveProperty("componentAdapter");
  for (const route of [[randomUUID()], [s.worker.id, s.fallback.id]])
    expect(() =>
      s.config.save({
        ...settings,
        routes: { ...settings.routes, componentAdapter: route },
      }),
    ).toThrow();
  s.config.save({
    ...settings,
    routes: { ...settings.routes, componentAdapter: [s.fallback.id] },
  });
  expect(
    new Configuration(path.join(s.dir, "config")).read().routes
      .componentAdapter,
  ).toEqual([s.fallback.id]);
  expect(() =>
    s.config.save({
      ...s.config.read(),
      profiles: settings.profiles.filter((p) => p.id !== s.fallback.id),
    }),
  ).toThrow(/unknown model/);
});

it("uses one explicit adapter for both native adaptation attempts with shared builder-phase charging", async () => {
  const s = setup({
    componentReview: true,
    componentAdaptationApplied: true,
    componentRepair: true,
  });
  const settings = s.config.read();
  settings.routes.componentAdapter = [s.fallback.id];
  s.config.save(settings);
  const p = await s.build();
  const calls = s.calls.filter(
    (c) => c.context.task === "component-adaptation",
  );
  expect(calls).toHaveLength(2);
  expect(
    calls.map((c) => [c.model, c.phase, c.context.context.adaptation.attempt]),
  ).toEqual([
    [s.fallback.model, "builder", 1],
    [s.fallback.model, "builder", 2],
  ]);
  expect(calls[1].context.context.review.reason).toBe(
    "Offline review requests a lifecycle repair",
  );
  expect(s.adapter.adaptComponent).toHaveBeenCalledTimes(2);
  expect(
    s.calls
      .filter((c) => c.context.task === "component-source-review")
      .every((c) => c.model === s.evaluator.model),
  ).toBe(true);
  expect(
    s.calls
      .filter((c) => c.context.task === "asset-selection")
      .every((c) => c.model === s.worker.model),
  ).toBe(true);
  const charges = p.charges.filter((c) => c.profileId === s.fallback.id);
  expect(charges).toHaveLength(2);
  expect(
    charges.every(
      (c) =>
        c.phase === "builder" && c.reservedMicros > 0 && c.chargedMicros > 0,
    ),
  ).toBe(true);
  expect(p.reservedMicros).toBe(0);
  expect(p.assetPipeline!.inputContext).toMatchObject({
    componentAdapter: s.fallback,
  });
  expect(
    createHash("sha256")
      .update(JSON.stringify(p.assetPipeline!.inputContext))
      .digest("hex"),
  ).toBe(p.assetPipeline!.inputHash);
});

it("keeps invalid adaptation corrections on the selected adapter without falling back", async () => {
  const s = setup({
    componentReview: true,
    componentAdaptation: true,
    invalidComponentAdaptation: true,
  });
  const settings = s.config.read();
  settings.routes.componentAdapter = [s.fallback.id];
  s.config.save(settings);
  const p = await s.build();
  expect(p.stage).toBe("failed");
  const calls = s.calls.filter(
    (c) => c.context.task === "component-adaptation",
  );
  expect(calls).toHaveLength(2);
  expect(calls.every((c) => c.model === s.fallback.model)).toBe(true);
  expect(s.adapter.adaptComponent).not.toHaveBeenCalled();
});

it.each([undefined, []])(
  "inherits builder adaptation and legacy context identity for %j adapter route",
  async (route) => {
    const s = setup({
      componentReview: true,
      componentAdaptationApplied: true,
    });
    const settings = s.config.read();
    if (route) settings.routes.componentAdapter = route;
    s.config.save(settings);
    const p = await s.build();
    expect(
      s.calls.find((c) => c.context.task === "component-adaptation")!.model,
    ).toBe(s.worker.model);
    expect(p.assetPipeline!.inputContext).not.toHaveProperty(
      "componentAdapter",
    );
  },
);

it("keeps ordinary builder, selection, visual evaluation and review separate from the opt-in adapter", async () => {
  const s = setup({
    componentReview: true,
    componentPrepared: true,
    discoverRock: true,
  });
  const settings = s.config.read();
  settings.routes.componentAdapter = [s.fallback.id];
  s.config.save(settings);
  const p = await s.build();
  expect(p.stage, p.error ?? "").toBe("ready_to_test");
  expect(
    s.calls.some(
      (c) => c.phase === "builder" && typeof c.context.task === "object",
    ),
  ).toBe(true);
  expect(
    s.calls
      .filter((c) => c.phase === "builder")
      .every((c) => c.model === s.worker.model),
  ).toBe(true);
  expect(
    s.calls
      .filter((c) => c.phase === "reviewer")
      .every((c) => c.model === s.evaluator.model),
  ).toBe(true);
  expect(s.calls.some((c) => c.model === s.fallback.model)).toBe(false);
});

it.each(["missing-key", "missing-profile", "missing-model"])(
  "preflights an explicit adapter %s before any native connection",
  async (failure) => {
    const s = setup();
    const p = await s.plan();
    const settings = s.config.read();
    settings.routes.componentAdapter = [s.fallback.id];
    if (failure === "missing-key")
      Object.assign(
        settings.profiles.find((p) => p.id === s.fallback.id)!,
        { provider: "openrouter", baseUrl: "https://openrouter.ai/api/v1" },
      );
    if (failure === "missing-model")
      settings.profiles.find((p) => p.id === s.fallback.id)!.model = "";
    s.config.save(settings);
    if (failure === "missing-profile") {
      settings.profiles = settings.profiles.filter(
        (p) => p.id !== s.fallback.id,
      );
      // Simulate stale persisted references that bypass Configuration.save.
      settings.routes.builder = [s.worker.id];
      settings.routes.reviewer = [s.evaluator.id];
      settings.routes.repair = [s.worker.id];
      fs.writeFileSync(
        path.join(s.dir, "config", "models.json"),
        JSON.stringify(settings),
      );
    }
    const calls = s.calls.length;
    expect(() => s.engine.start(p.id, p.revision, "build")).toThrow(
      failure === "missing-key"
        ? /API key/
        : failure === "missing-model"
          ? /model ID/
          : /Unknown model profile/,
    );
    expect(s.factory).not.toHaveBeenCalled();
    expect(s.calls).toHaveLength(calls);
  },
);

it.each([
  "enable",
  "switch",
  "remove",
  "model",
  "inputRate",
  "outputRate",
  "baseUrl",
  "maxOutputTokens",
  "requestTimeoutMs",
  "jsonMode",
])(
  "invalidates retained component identity when the adapter changes: %s",
  async (change) => {
    const s = setup({ componentReview: true, componentPrepared: true });
    const settings = s.config.read();
    if (change !== "enable") settings.routes.componentAdapter = [s.fallback.id];
    s.config.save(settings);
    const p = await s.build();
    expect(p.stage, p.error ?? "").toBe("ready_to_test");
    const original = structuredClone(p.assetPipeline!),
      calls = s.calls.length;
    const changed = s.config.read(),
      selected = changed.profiles.find((p) => p.id === s.fallback.id)!;
    if (change === "enable") changed.routes.componentAdapter = [s.fallback.id];
    else if (change === "switch")
      changed.routes.componentAdapter = [s.evaluator.id];
    else if (change === "remove") delete changed.routes.componentAdapter;
    else if (change === "model") selected.model = "changed-adapter";
    else if (change === "inputRate") selected.inputRate += 1;
    else if (change === "outputRate") selected.outputRate += 1;
    else if (change === "baseUrl")
      selected.baseUrl = "http://localhost:5432/v1";
    else if (change === "maxOutputTokens") selected.maxOutputTokens += 512;
    else if (change === "requestTimeoutMs") selected.requestTimeoutMs = 300000;
    else selected.jsonMode = !selected.jsonMode;
    await expect(
      (s.engine as any).resolveAssets(
        p,
        original.needs,
        changed,
        new Map(),
        new AbortController().signal,
      ),
    ).rejects.toThrow(/Previously accepted/);
    expect(p.assetPipeline!.inputHash).toBe(original.inputHash);
    expect(p.assetPipeline!.entries[0].component).toEqual(
      original.entries[0].component,
    );
    expect(s.calls).toHaveLength(calls);
    expect(s.factory).toHaveBeenCalledOnce();
  },
);

it("starts a fresh asset run with a new adapter identity after a known failed component attempt", async () => {
  const s = setup({ componentReview: true, componentAdaptation: true });
  const p = await s.build();
  expect(p.stage).toBe("failed");
  const before = structuredClone(p.assetPipeline!),
    callCount = s.calls.length;
  const settings = s.config.read();
  settings.routes.componentAdapter = [s.fallback.id];
  await expect(
    (s.engine as any).resolveAssets(
      p,
      before.needs,
      settings,
      new Map(),
      new AbortController().signal,
    ),
  ).rejects.toThrow();
  expect(p.assetPipeline!.inputHash).not.toBe(before.inputHash);
  expect(p.assetPipeline!.inputContext).toMatchObject({
    componentAdapter: s.fallback,
  });
  expect(
    s.calls
      .slice(callCount)
      .filter((c) => c.context.task === "component-adaptation")
      .map((c) => c.model),
  ).toEqual([s.fallback.model]);
  expect(before.entries[0].status).toBe("failed");
});

it("routes initial and post-adaptation source reviews through one explicit profile with normal charges and immutable trace", async () => {
  const s = setup({ componentReview: true, componentAdaptationApplied: true });
  const settings = s.config.read();
  settings.routes.componentReviewer = [s.fallback.id];
  s.config.save(settings);
  const p = await s.build();
  const calls = s.calls.filter(
    (call) => call.context.task === "component-source-review",
  );
  expect(calls).toHaveLength(2);
  expect(calls[0].context.context).not.toHaveProperty("preservation");
  expect(calls[1].context.context).toHaveProperty("preservation");
  expect(calls.map((call) => [call.model, call.phase])).toEqual([
    [s.fallback.model, "reviewer"],
    [s.fallback.model, "reviewer"],
  ]);
  const charges = p.charges.filter(
    (charge) => charge.profileId === s.fallback.id,
  );
  expect(charges).toHaveLength(2);
  expect(
    charges.every(
      (charge) =>
        charge.phase === "reviewer" &&
        charge.chargedMicros > 0 &&
        charge.reservedMicros > 0 &&
        charge.status === "ok",
    ),
  ).toBe(true);
  expect(p.reservedMicros).toBe(0);
  const traces = fs
    .readFileSync(path.join(s.dir, "traces", p.id + ".events.jsonl"), "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  expect(
    traces.filter(
      (trace) =>
        trace.phase === "reviewer" &&
        trace.model === s.fallback.model &&
        trace.response,
    ),
  ).toHaveLength(2);
});

it("keeps visual asset evaluation and general review on the regular reviewer with component override enabled", async () => {
  const s = setup({
    componentReview: true,
    componentPrepared: true,
    discoverRock: true,
  });
  const settings = s.config.read();
  settings.routes.componentReviewer = [s.fallback.id];
  s.config.save(settings);
  const p = await s.build();
  expect(p.stage, p.error ?? "").toBe("ready_to_test");
  expect(p.assetPipeline!.policy.maxSearches).toBe(3);
  const source = s.calls.filter(
    (call) => call.context.task === "component-source-review",
  );
  expect(source.map((call) => call.model)).toEqual([s.fallback.model]);
  const visual = s.calls.filter(
    (call) => call.context.task === "asset-evaluation",
  );
  expect(visual).toHaveLength(2);
  expect(visual.every((call) => call.model === s.evaluator.model)).toBe(true);
  const general = s.calls.filter(
    (call) =>
      call.phase === "reviewer" &&
      !["asset-evaluation", "component-source-review"].includes(
        call.context.task,
      ),
  );
  expect(general.length).toBeGreaterThan(0);
  expect(general.every((call) => call.model === s.evaluator.model)).toBe(true);
  expect(p.assetPipeline!.inputContext).toMatchObject({
    componentReviewer: s.fallback,
  });
  expect(
    createHash("sha256")
      .update(JSON.stringify(p.assetPipeline!.inputContext))
      .digest("hex"),
  ).toBe(p.assetPipeline!.inputHash);
});

it.each([undefined, []])(
  "preserves legacy source routing and hash shape for %j override",
  async (route) => {
    const s = setup({ componentReview: true, componentPrepared: true });
    const settings = s.config.read();
    if (route) settings.routes.componentReviewer = route;
    s.config.save(settings);
    const p = await s.build();
    expect(p.stage, p.error ?? "").toBe("ready_to_test");
    expect(
      s.calls.find((call) => call.context.task === "component-source-review")!
        .model,
    ).toBe(s.evaluator.model);
    expect(p.assetPipeline!.inputContext).not.toHaveProperty(
      "componentReviewer",
    );
    const originalHash = p.assetPipeline!.inputHash,
      callCount = s.calls.length;
    const alternate = s.config.read();
    if (route) delete alternate.routes.componentReviewer;
    else alternate.routes.componentReviewer = [];
    await (s.engine as any).resolveAssets(
      p,
      p.assetPipeline!.needs,
      alternate,
      new Map(),
      new AbortController().signal,
    );
    expect(p.assetPipeline!.inputHash).toBe(originalHash);
    expect(s.calls).toHaveLength(callCount);
  },
);

it.each(["enable", "switch", "remove", "profile"])(
  "invalidates retained component reuse when source reviewer configuration changes: %s",
  async (change) => {
    const s = setup({ componentReview: true, componentPrepared: true });
    const initial = s.config.read();
    if (change !== "enable") initial.routes.componentReviewer = [s.fallback.id];
    s.config.save(initial);
    const p = await s.build();
    expect(p.stage, p.error ?? "").toBe("ready_to_test");
    const retained = structuredClone(p.assetPipeline!),
      callCount = s.calls.length;
    const traceFile = path.join(s.dir, "traces", p.id + ".events.jsonl");
    const originalTrace = fs.readFileSync(traceFile, "utf8");
    const changed = s.config.read();
    if (change === "enable") changed.routes.componentReviewer = [s.fallback.id];
    if (change === "switch")
      changed.routes.componentReviewer = [s.evaluator.id];
    if (change === "remove") delete changed.routes.componentReviewer;
    if (change === "profile")
      changed.profiles.find((p) => p.id === s.fallback.id)!.model =
        "changed-source-review-model";
    for (let attempt = 0; attempt < 2; attempt++) {
      await expect(
        (s.engine as any).resolveAssets(
          p,
          retained.needs,
          changed,
          new Map(),
          new AbortController().signal,
        ),
      ).rejects.toThrow(/Previously accepted/);
      expect(p.assetPipeline!.inputHash).toBe(retained.inputHash);
      expect(p.assetPipeline!.entries[0].component).toEqual(
        retained.entries[0].component,
      );
    }
    expect(s.calls).toHaveLength(callCount);
    expect(s.factory).toHaveBeenCalledOnce();
    expect(fs.readFileSync(traceFile, "utf8").startsWith(originalTrace)).toBe(
      true,
    );
  },
);

it("does not fall back to the ordinary reviewer after invalid component-source responses", async () => {
  const s = setup({ componentReview: true, invalidComponentReview: true });
  const settings = s.config.read();
  settings.routes.componentReviewer = [s.fallback.id];
  s.config.save(settings);
  const p = await s.build();
  expect(p.stage).toBe("failed");
  const source = s.calls.filter(
    (call) => call.context.task === "component-source-review",
  );
  expect(source).toHaveLength(2);
  expect(source.every((call) => call.model === s.fallback.model)).toBe(true);
  expect(s.calls.some((call) => call.model === s.evaluator.model)).toBe(false);
});

it("advertises data-instance contracts without a root dialect annotation in real Engine calls", async () => {
  const s = setup();
  await s.build();
  expect(s.calls.some((call) => call.phase === "planner")).toBe(true);
  expect(s.calls.some((call) => call.context.task === "asset-selection")).toBe(
    true,
  );
  expect(s.calls.some((call) => call.context.task === "asset-evaluation")).toBe(
    true,
  );
  for (const call of s.calls) {
    const schema = JSON.parse(call.system.split("\nOUTPUT SCHEMA: ")[1]);
    expect(schema).not.toHaveProperty("$schema");
    expect(call.system).toContain("Return a JSON data instance");
    expect(call.system).toContain("only when explicitly declared");
    if (call.phase === "planner") {
      const needSchema = schema.properties.assetNeeds.items;
      expect(needSchema.required).toContain("required");
      expect(needSchema.properties.required).not.toHaveProperty("default");
      expect(needSchema.properties.required.type).toBe("boolean");
    }
  }
});

it("rejects raw component review schema metadata on both same-route attempts without stripping it", async () => {
  const s = setup({
    componentReview: true,
    schemaMetadataComponentReview: true,
  });
  const p = await s.build();
  expect(p.assetPipeline?.status).toBe("failed");
  expect(p.error).toContain("$schema");
  const calls = s.calls.filter(
    (call) => call.context.task === "component-source-review",
  );
  expect(calls).toHaveLength(2);
  expect(calls.every((call) => call.model === s.evaluator.model)).toBe(true);
  for (const call of calls)
    expect(
      JSON.parse(call.system.split("\nOUTPUT SCHEMA: ")[1]),
    ).not.toHaveProperty("$schema");
  expect(s.adapter.place).not.toHaveBeenCalled();
  expect(s.adapter.discard).toHaveBeenCalledTimes(1);
});

it("sends bounded before/current preservation evidence only to the actual post-adaptation reviewer", async () => {
  const s = setup({ componentReview: true, componentAdaptationApplied: true });
  const p = await s.build();
  const reviews = s.calls.filter(
    (call) => call.context.task === "component-source-review",
  );
  expect(reviews).toHaveLength(2);
  expect(reviews[0].context.context).not.toHaveProperty("preservation");
  const after = reviews[1].context.context;
  const before = after.preservation.before;
  expect(before.packetHash).toBe(
    reviews[0].context.context.evidence.packetHash,
  );
  expect(before.inputHash).toBe(after.evidence.inputHash);
  expect(before.sourceBodies[0].numberedSource).toBe(
    reviews[0].context.context.evidence.sourceBodies[0].numberedSource,
  );
  expect(after.evidence.sourceBodies[0].numberedSource).toContain(
    "3: -- offline adaptation",
  );
  expect(after.preservation.appliedPlan.replaceSources[0]).not.toHaveProperty(
    "source",
  );
  expect(after.preservation.appliedPlan.replaceSources[0].sourceSha256).toBe(
    after.evidence.sourceBodies[0].sha256,
  );
  expect(after.preservation.mapping.sourceBindings).toHaveLength(2);
  expect(before).not.toHaveProperty("preservation");
  expect(reviews[1].context.instructions).toContain("lifecycle/reset/replay");
  expect(reviews[1].context.instructions).toContain(
    "only current context.evidence",
  );
  const event = p.assetPipeline?.events.find(
    (entry) => entry.step === "component_adapted_review_call",
  )?.data as any;
  expect(event.preservation.appliedPlan.replaceSources[0].source).toContain(
    "-- offline adaptation",
  );
  expect(event.preservation.before.sourceBodies[0].source).toBe(
    componentReviewFixture().evidence.sourceBodies[0].source,
  );
  expect(
    p.assetPipeline?.events.some(
      (entry) => entry.step === "component_adapted_review_result",
    ),
  ).toBe(true);
  expect(s.adapter.adaptComponent).toHaveBeenCalledTimes(1);
  expect(s.adapter.discard).toHaveBeenCalledTimes(1);
});

it("passes the actual rejected adaptation to one bounded repair and presents flat original/parent/current evidence", async () => {
  const s = setup({
    componentReview: true,
    componentAdaptationApplied: true,
    componentRepair: true,
  });
  const p = await s.build();
  const calls = s.calls.filter((call) =>
    ["component-source-review", "component-adaptation"].includes(
      call.context.task,
    ),
  );
  expect(calls.map((call) => call.context.task)).toEqual([
    "component-source-review",
    "component-adaptation",
    "component-source-review",
    "component-adaptation",
    "component-source-review",
  ]);
  const first = calls[0].context.context;
  const rejected = calls[2].context.context;
  const repair = calls[3].context.context;
  const final = calls[4].context.context;
  expect(repair.review.reason).toBe(
    "Offline review requests a lifecycle repair",
  );
  expect(repair.review.sources[0].unresolved).toEqual([
    "Offline lifecycle defect remains",
  ]);
  expect(repair.adaptation).toEqual({
    attempt: 2,
    maxAttempts: 2,
    remainingAttempts: 0,
  });
  expect(repair.evidence.packetHash).toBe(rejected.evidence.packetHash);
  expect(repair.preservation.before.packetHash).toBe(first.evidence.packetHash);
  expect(repair.preservation.appliedPlan.replaceSources[0]).not.toHaveProperty(
    "source",
  );
  expect(calls[3].context.instructions).toContain(
    "current evidence and packet hash",
  );
  expect(final.preservation.original.packetHash).toBe(
    first.evidence.packetHash,
  );
  expect(final.preservation.before.packetHash).toBe(
    rejected.evidence.packetHash,
  );
  expect(final.evidence.packetHash).not.toBe(rejected.evidence.packetHash);
  expect(final.preservation.earlierSteps).toHaveLength(1);
  const earlier = final.preservation.earlierSteps[0];
  expect(earlier.packetHash).toBe(rejected.evidence.packetHash);
  expect(earlier.appliedPlan.replaceSources[0]).not.toHaveProperty("source");
  expect(earlier.appliedPlan.replaceSources[0].sourceSha256).toBe(
    final.preservation.before.sourceBodies[0].sha256,
  );
  expect(final.preservation.appliedPlan.replaceSources[0].sourceSha256).toBe(
    final.evidence.sourceBodies[0].sha256,
  );
  expect(final.preservation.original.sourceBodies[0].numberedSource).toBe(
    first.evidence.sourceBodies[0].numberedSource,
  );
  expect(final.preservation.before.sourceBodies[0].numberedSource).toBe(
    rejected.evidence.sourceBodies[0].numberedSource,
  );
  expect(final.preservation.original).not.toHaveProperty("preservation");
  expect(final.preservation.before).not.toHaveProperty("preservation");
  expect(final.preservation.earlierSteps[0]).not.toHaveProperty("before");
  expect(final.preservation.originalMapping.sourceBindings).toHaveLength(2);
  expect(s.adapter.adaptComponent).toHaveBeenCalledTimes(2);
  expect(s.calls.every((call) => call.model !== s.fallback.model)).toBe(true);
  expect(
    p.assetPipeline?.events.filter(
      (event) => event.step === "component_adapted_review_result",
    ),
  ).toHaveLength(2);
});

it("supplies actual namespace, accepted task ownership and chronological acquisition snapshots to both component roles", async () => {
  const s = setup({ componentReview: true, componentAdaptationApplied: true });
  const p = await s.plan();
  p.spec!.assetNeeds!.push({
    ...need,
    id: "pending-animation",
    role: "Separate animation acquisition",
  });
  s.store.save(p);
  s.engine.start(p.id, p.revision, "build");
  const final = await s.engine.wait(p.id);
  const calls = s.calls.filter((call) =>
    ["component-source-review", "component-adaptation"].includes(
      call.context.task,
    ),
  );
  expect(calls.map((call) => call.context.task)).toEqual([
    "component-source-review",
    "component-adaptation",
    "component-source-review",
  ]);
  const stages = calls.map((call) => call.context.context.stage);
  for (const stage of stages) {
    expect(stage.namespace).toBe(p.scope);
    expect(stage.allowedRoots).toContain(`Workspace/${p.scope}`);
    expect(stage.integrationTasks.tasks).toEqual(p.spec!.tasks);
    expect(stage.needs[1]).toMatchObject({
      need: { id: "pending-animation", required: true },
      status: "pending",
      progress: "unstarted_unverified",
      attempts: 0,
    });
    expect(stage.current.candidate.id).toBe(candidate.id);
  }
  expect(stages[0].eventSequence).toBeLessThan(stages[1].eventSequence);
  expect(stages[1].eventSequence).toBeLessThan(stages[2].eventSequence);
  expect(
    calls.every((call) =>
      call.context.instructions.includes(
        "Do not replace another pending acquisition",
      ),
    ),
  ).toBe(true);
  expect(final.spec!.assetNeeds).toEqual(p.spec!.assetNeeds);
  expect(final.assetPipeline!.inputContext!.scope).toBe(p.scope);
  expect(final.assetPipeline!.inputContext!.integrationTasks).toEqual(
    p.spec!.tasks,
  );
  expect(s.adapter.adaptComponent).toHaveBeenCalledTimes(1);
});

it("includes validated earlier retained components in actual delta review context without rerunning their acquisition", async () => {
  const s = setup({
    componentReview: true,
    componentPrepared: true,
    discoverRock: true,
  });
  const inspect = vi.mocked(s.adapter.inspect).getMockImplementation()!;
  vi.mocked(s.adapter.inspect).mockImplementation(async (...args) => {
    const result = await inspect(...args);
    if (args[0].id === "rock")
      result.capabilityBlock = {
        kind: "interactive_asset_requires_review",
        reason: "Offline delta component",
      };
    return result;
  });
  const p = await s.build();
  const review = s.calls.find(
    (call) =>
      call.context.task === "component-source-review" &&
      call.context.context.need.id === "rock",
  )!;
  expect(review).toBeDefined();
  const stage = review.context.context.stage;
  expect(stage.needs.map((entry: any) => entry.need.id)).toEqual([
    "tree",
    "rock",
  ]);
  expect(stage.needs[0]).toMatchObject({
    status: "passed",
    retainedFromEarlierRun: true,
    retainedComponent: {
      runtimeVerification: "not_performed",
      rootPath: `Workspace/${p.scope}/Assets/tree/Model`,
    },
  });
  expect(stage.needs[1].progress).toBe("current_component");
  expect(
    vi
      .mocked(s.adapter.search)
      .mock.calls.filter(([requested]) => requested.id === "tree"),
  ).toHaveLength(1);
  expect(p.assetPipeline!.entries[0].component!.recordHash).toBe(
    stage.needs[0].retainedComponent.recordHash,
  );
});

it("retains imports across completed-task script registration before later task discovery", async () => {
  const s = setup({
    componentReview: true,
    componentPrepared: true,
    discoverRock: true,
    registrationBeforeDiscovery: true,
  });
  const p = await s.build();
  expect(p.stage, p.error ?? "").toBe("ready_to_test");
  const originalReview = s.calls.find(
    (call) => call.context.task === "component-source-review",
  )!;
  expect(
    originalReview.context.context.stage.integrationTasks.tasks[0].files,
  ).toEqual([]);
  const registered = `ServerScriptService/${p.scope}/Game.server.luau`;
  expect(p.completedBuildTasks).toEqual(["coreTask", "integrationTask"]);
  expect(p.spec!.tasks[0].files).toEqual([registered]);
  expect(p.assetPipeline!.inputContext!.integrationTasks).toEqual(
    p.spec!.tasks,
  );
  expect(p.assetPipeline!.inputHash).not.toBe(
    originalReview.context.context.stage.inputHash,
  );
  expect(p.assetPipeline!.entries[0].componentContextHash).toBe(
    p.assetPipeline!.inputHash,
  );
  expect(p.assetPipeline!.entries[0].component!.inputHash).toBe(
    originalReview.context.context.stage.inputHash,
  );
  expect(
    vi.mocked(s.adapter.search).mock.calls.map(([requested]) => requested.id),
  ).toEqual(["tree", "rock"]);
});

it.each([
  "scope",
  "title",
  "dependency",
  "requirements",
  "removed-file",
  "unregistered-file",
  "unfinished-task",
  "foreign-scope-file",
])(
  "blocks retained context changes beyond validated completed-task file additions (%s)",
  async (change) => {
    const s = setup({ componentReview: true, componentPrepared: true });
    const p = await s.build();
    expect(p.stage, p.error ?? "").toBe("ready_to_test");
    const original = structuredClone(p.assetPipeline!);
    const callCount = s.calls.length;
    if (change === "scope") p.scope += "Changed";
    if (change === "title") p.spec!.tasks[0].title += " changed";
    if (change === "dependency") p.spec!.tasks[0].dependsOn.push("foreignTask");
    if (change === "requirements")
      p.spec!.tasks[0].requirements.push("foreignRequirement");
    if (change === "removed-file") p.spec!.tasks[0].files = [];
    if (change === "unregistered-file")
      p.spec!.tasks[0].files.push(
        `ServerScriptService/${p.scope}/Missing.server.luau`,
      );
    if (change === "unfinished-task" || change === "foreign-scope-file") {
      const added = `ServerScriptService/${change === "foreign-scope-file" ? "Foreign" : p.scope}/Extra.server.luau`;
      p.spec!.tasks[0].files.push(added);
      p.artifact!.files.push({ ...p.artifact!.files[0], path: added });
      if (change === "unfinished-task") p.completedBuildTasks = [];
    }
    await expect(
      (s.engine as any).resolveAssets(
        p,
        original.needs,
        s.config.read(),
        new Map(),
        new AbortController().signal,
      ),
    ).rejects.toThrow(/Previously accepted/);
    expect(p.assetPipeline!.inputHash).toBe(original.inputHash);
    expect(p.assetPipeline!.entries[0].component).toEqual(
      original.entries[0].component,
    );
    expect(s.calls).toHaveLength(callCount);
    expect(s.factory).toHaveBeenCalledOnce();
  },
);

it("names the failed component reviewer instead of an undefined task", async () => {
  const s = setup({ componentReview: true, invalidComponentReview: true });
  const p = await s.build();
  expect(p.error).toContain("component-reviewer");
  expect(p.error).not.toContain("undefined");
  expect(
    s.calls.filter((call) => call.context.task === "component-source-review"),
  ).toHaveLength(2);
  expect(s.adapter.place).not.toHaveBeenCalled();
});

it("routes adaptation decisions to the worker with the original game context, source review and normal metering", async () => {
  const s = setup({ componentReview: true, componentAdaptation: true });
  const p = await s.build();
  const call = s.calls.find(
    (call) => call.context.task === "component-adaptation",
  )!;
  expect(call.model).toBe(s.worker.model);
  expect(call.phase).toBe("builder");
  expect(call.context.gameContext.userSources[0].text).toBe(p.request);
  expect(call.context.gameContext.assetTarget.need).toEqual(need);
  expect(call.context.context.review.disposition).toBe("needs_more_evidence");
  expect(call.context.context.evidence.sourceBodies).toHaveLength(1);
  expect(call.context.instructions).toContain("action reject");
  expect(s.adapter.adaptComponent).not.toHaveBeenCalled();
  expect(s.adapter.discard).toHaveBeenCalledTimes(1);
  expect(s.effects).not.toContain("code");
  expect(s.calls.some((call) => call.model === s.fallback.model)).toBe(false);
  expect(p.charges.some((charge) => charge.phase === "builder")).toBe(true);
});

it("accepts retained component coverage from a discovery-dependent task without forcing replacement scripts", async () => {
  const s = setup({
    componentReview: true,
    componentPrepared: true,
    reuseOnly: true,
  });
  const p = await s.build();
  expect(p.stage, p.error ?? "").toBe("ready_to_test");
  expect(p.spec!.tasks[0].files).toEqual([]);
  expect(p.artifact!.files).toEqual([]);
  expect(p.artifact!.scene).toEqual([]);
  expect(p.artifact!.coverage[0].files).toEqual([
    `Workspace/${p.scope}/Assets/tree/Model`,
  ]);
  expect(p.checks.filter((c) => c.status === "failed")).toEqual([]);
  expect(p.studioEvidence).toBeNull();
  const builder = s.calls.find((c) => typeof c.context.task === "object")!;
  expect(builder.context.retainedComponents[0].sourceBodies).toHaveLength(1);
  expect(
    s.calls.filter((c) => typeof c.context.task === "object"),
  ).toHaveLength(1);
});
it("still stops before the builder when the reviewed component cannot be integrated", async () => {
  const s = setup({ componentReview: true, reuseOnly: true });
  const p = await s.build();
  expect(p.stage).toBe("failed");
  expect(s.calls.some((c) => typeof c.context.task === "object")).toBe(false);
});
it.each([false, true])(
  "continues generation with retained components, including added asset needs (%s)",
  async (discoverRock) => {
    const s = setup({
      componentReview: true,
      componentPrepared: true,
      discoverRock,
    });
    const p = await s.build();
    expect(p.stage, p.error ?? "").toBe("ready_to_test");
    expect(p.assetPipeline?.status).toBe("passed");
    expect(p.assetPipeline?.entries[0].component?.runtimeVerification).toBe(
      "not_performed",
    );
    const builder = s.calls.find((c) => typeof c.context.task === "object")!;
    expect(builder.context.retainedComponents[0].rootPath).toBe(
      `Workspace/${p.scope}/Assets/tree/Model`,
    );
    expect(
      builder.context.retainedComponents[0].sourceBodies[0].bindings,
    ).toHaveLength(2);
    expect(
      builder.context.retainedComponents[0].requestedPlacement.position,
    ).toEqual(need.position);
    expect(s.effects).toContain("code");
    expect(s.adapter.place).toHaveBeenCalledTimes(discoverRock ? 1 : 0);
    expect(s.adapter.discard).toHaveBeenCalledTimes(discoverRock ? 2 : 1);
    expect(p.assetPipeline!.entries[0].componentContextHash).toBe(
      p.assetPipeline!.inputHash,
    );
    if (discoverRock)
      expect(p.assetPipeline!.entries[0].component!.inputHash).not.toBe(
        p.assetPipeline!.inputHash,
      );
  },
);

it.each([false, true])(
  "routes complete source review through the configured evaluator with exact game context and metering (line citation %s)",
  async (componentReviewLines) => {
    const s = setup({ componentReview: true, componentReviewLines });
    const p = await s.build();
    expect(p.assetPipeline?.status).toBe("failed");
    expect(p.error).toContain("source review recorded");
    const review = s.calls.find(
      (call) => call.context.task === "component-source-review",
    )!;
    expect(review.model).toBe(s.evaluator.model);
    expect(review.phase).toBe("reviewer");
    expect(review.context.gameContext.userSources[0].text).toBe(p.request);
    expect(review.context.gameContext.assetTarget.need).toEqual(need);
    expect(review.context.context.requirementIds).toEqual(["core"]);
    expect(
      review.context.context.evidence.sourceBodies[0].bindings,
    ).toHaveLength(2);
    const presented = review.context.context.evidence.sourceBodies[0];
    expect(presented).not.toHaveProperty("source");
    expect(presented.lineCount).toBe(2);
    expect(presented.numberedSource).toBe(
      '1: local sound = Instance.new("Sound")\n2: sound.SoundId = "rbxassetid://123"',
    );
    expect(review.context.instructions).toContain("sourceLines:{start,end}");
    expect(review.context.instructions).toContain("untrusted");
    expect(s.effects).toContain("component-prepare");
    expect(s.effects).toContain("component-review");
    expect(s.effects).not.toContain("code");
    expect(s.adapter.place).not.toHaveBeenCalled();
    expect(s.adapter.discard).toHaveBeenCalledTimes(1);
    expect(s.calls.some((call) => call.model === s.fallback.model)).toBe(false);
    expect(p.charges.some((charge) => charge.phase === "reviewer")).toBe(true);
    expect(
      p.assetPipeline?.events.some(
        (event) => event.step === "component_review_result",
      ),
    ).toBe(true);
    const recorded = p.assetPipeline?.events.find(
      (event) => event.step === "component_review_result",
    )?.data as any;
    expect(recorded.sources[0].dependencies[0]).toEqual(
      componentReviewLines
        ? {
            kind: "media_asset",
            value: "123",
            sourceLines: { start: 2, end: 2 },
            verification: "unverified",
          }
        : componentReviewFixture().decision.sources[0].dependencies[0],
    );
  },
);

it("normal Engine build resolves planned assets before coding, routes worker/evaluator calls and retains authoritative receipts", async () => {
  const s = setup(),
    p = await s.build();
  expect(p.spec?.assetNeeds).toEqual([need]);
  expect(p.stage, p.error ?? "").toBe("ready_to_test");
  expect(s.effects).toEqual([
    "search",
    "select",
    "inspect",
    "evaluate:inspection",
    "place",
    "evaluate:placed",
    "release",
    "close",
    "code",
  ]);
  expect(p.assetPipeline?.status).toBe("passed");
  expect(p.assetPipeline?.entries[0].bundle).toEqual(s.getExported());
  expect(p.artifact!.scene).toEqual(
    expect.arrayContaining(s.getExported().scene),
  );
  expect(p.artifact!.assets).toEqual(s.getExported().assets);
  const assetCalls = s.calls.filter(
    (call) => typeof call.context.task === "string",
  );
  expect(assetCalls.map((call) => call.model)).toEqual([
    s.worker.model,
    s.evaluator.model,
    s.evaluator.model,
  ]);
  expect(
    assetCalls
      .filter((call) => call.context.task === "asset-evaluation")
      .every((call) => call.images[0] === png),
  ).toBe(true);
  for (const call of assetCalls.filter(
    (call) => call.context.task === "asset-evaluation",
  )) {
    expect(call.context.instructions).toContain(
      "NOT the source sound duration",
    );
    expect(call.context.instructions).toContain("native source duration");
    expect(call.context.instructions).toContain(
      "only after listening to the actual supplied clip",
    );
    expect(call.context.instructions).toContain("unheard tail is unverified");
  }
  expect(s.calls.some((call) => call.model === s.fallback.model)).toBe(false);
  expect(p.charges).toHaveLength(6);
  expect(p.charges.every((charge) => charge.chargedMicros > 0)).toBe(true);
  expect(s.close).toHaveBeenCalledOnce();
  const traces = fs
    .readFileSync(path.join(s.dir, "traces", p.id + ".events.jsonl"), "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  const retained = traces
    .filter((trace) => trace.phase === "assets")
    .at(-1).run;
  expect(retained.runId).toBe(p.assetPipeline!.runId);
  expect(retained.events.map((event: any) => event.step)).toEqual(
    expect.arrayContaining([
      "search_call",
      "search_result",
      "inspect_result",
      "place_result",
      "discard_result",
      "asset_released",
      "run_finished",
    ]),
  );
  expect(JSON.stringify(retained)).not.toContain(png);
  const codeCall = s.calls.find(
    (call) => typeof call.context.task === "object" && call.phase === "builder",
  )!;
  expect(codeCall.context.current.scene).toEqual(
    expect.arrayContaining(s.getExported().scene),
  );
});
it("delivers clarification, research and explicit asset purpose to selection and both evaluations, then retains the same context for coding", async () => {
  const s = setup();
  const p = await s.plan();
  p.answers.interaction =
    "Harvest by tapping on phone; no automatic collection";
  p.research = researchFixture(p);
  s.store.save(p);
  s.engine.start(p.id, p.revision, "build");
  const done = await s.engine.wait(p.id);
  expect(done.stage, done.error ?? "").toBe("ready_to_test");
  const calls = s.calls.filter((call) => typeof call.context.task === "string");
  expect(calls).toHaveLength(3);
  for (const call of calls) {
    expect(call.context.gameContext.userSources).toContainEqual({
      id: "answer:interaction",
      text: p.answers.interaction,
      answerId: "interaction",
    });
    expect(call.context.gameContext.referenceResearch).toMatchObject({
      status: "input_matched",
      mechanics: p.research.mechanics,
      unknowns: p.research.unknowns,
    });
    expect(call.context.gameContext.assetTarget).toMatchObject({
      need: { intent: need.intent },
      intentStatus: "explicit",
      requirements: p.spec!.requirements,
    });
  }
  const code = s.calls.find(
    (call) => typeof call.context.task === "object" && call.phase === "builder",
  )!;
  expect(code.context.gameContext.userSources).toEqual(
    calls[0].context.gameContext.userSources,
  );
  expect(done.assetPipeline!.inputContext!.gameContext).toEqual(
    code.context.gameContext,
  );
});

it("adapter failure blocks coding and records ASSET_PIPELINE_FAILED without an external rescue", async () => {
  const s = setup({ adapterFailure: "search" }),
    p = await s.build();
  expect(p.stage).toBe("failed");
  expect(p.failure?.code).toBe("ASSET_PIPELINE_FAILED");
  expect(p.checks).toContainEqual(
    expect.objectContaining({ id: "asset-pipeline", status: "failed" }),
  );
  expect(s.effects).toEqual(["search", "close"]);
  expect(p.completedBuildTasks).toEqual([]);
  expect(p.artifact?.files).toEqual([]);
  expect(s.calls).toHaveLength(1);
  expect(s.close).toHaveBeenCalledOnce();
});
it.each([{ bind: false }, { factory: false }])(
  "unavailable Studio setup blocks before tools or code (%j)",
  async (options) => {
    const s = setup(options),
      p = await s.build();
    expect(p.failure?.code).toBe("ASSET_PIPELINE_FAILED");
    expect(p.error).toContain("select a connected Studio");
    expect(s.factory).not.toHaveBeenCalled();
    expect(s.effects).toEqual([]);
    expect(s.calls).toHaveLength(1);
  },
);
it.each([{ selectionFailure: true }, { selectionEscalates: true }])(
  "asset worker failure/escalation never routes to the configured strong fallback (%j)",
  async (options) => {
    const s = setup(options),
      p = await s.build();
    expect(p.stage).toBe("failed");
    expect(p.failure?.code).toBe("ASSET_PIPELINE_FAILED");
    expect(s.calls.some((call) => call.model === s.fallback.model)).toBe(false);
    expect(s.adapter.inspect).not.toHaveBeenCalled();
    expect(s.effects).not.toContain("code");
    expect(s.close).toHaveBeenCalledOnce();
  },
);
it("asset evaluator failure releases the known temporary import without invoking the strong reviewer fallback or coding", async () => {
  const s = setup({ evaluationFailure: true }),
    p = await s.build();
  expect(p.failure?.code).toBe("ASSET_PIPELINE_FAILED");
  expect(s.effects).toEqual([
    "search",
    "select",
    "inspect",
    "evaluate:inspection",
    "release",
    "close",
  ]);
  expect(
    s.calls
      .filter((call) => call.context.task === "asset-evaluation")
      .map((call) => call.model),
  ).toEqual([s.evaluator.model]);
  expect(s.calls.some((call) => call.model === s.fallback.model)).toBe(false);
  expect(s.adapter.place).not.toHaveBeenCalled();
  expect(s.adapter.discard).toHaveBeenCalledOnce();
});
it("unknown native placement outcome preserves evidence and blocks retry, revision and Studio rebinding", async () => {
  const s = setup({ adapterFailure: "place" }),
    p = await s.build();
  expect(p.failure?.code).toBe("ASSET_PIPELINE_FAILED");
  expect(p.assetPipeline?.requiresReconciliation).toBe(true);
  expect(s.adapter.discard).not.toHaveBeenCalled();
  const events = structuredClone(p.assetPipeline!.events),
    effects = [...s.effects];
  expect(() => s.engine.start(p.id, p.revision, "build")).toThrow(/reconcile/i);
  expect(() =>
    s.engine.revise(p.id, p.revision, "A different request", {}),
  ).toThrow(/reconcile/i);
  expect(() =>
    s.engine.bindAssetStudio(p.id, p.revision, randomUUID()),
  ).toThrow(/reconcile/i);
  expect(s.store.get(p.id).assetPipeline?.events).toEqual(events);
  expect(s.effects).toEqual(effects);
  expect(s.factory).toHaveBeenCalledOnce();
});

it("a builder-discovered need executes only the new asset and retains prior import receipts and full context", async () => {
  const s = setup({ discoverRock: true }),
    p = await s.build();
  expect(p.stage, p.error ?? "").toBe("ready_to_test");
  expect(vi.mocked(s.adapter.search).mock.calls.map(([n]) => n.id)).toEqual([
    "tree",
    "rock",
  ]);
  expect(vi.mocked(s.adapter.search).mock.calls.map(([n]) => n.kind)).toEqual([
    "Model",
    "Model",
  ]);
  expect(vi.mocked(s.adapter.place).mock.calls.map(([n]) => n.id)).toEqual([
    "tree",
    "rock",
  ]);
  expect(p.assetPipeline!.entries.map((e) => [e.needId, e.status])).toEqual([
    ["tree", "passed"],
    ["rock", "passed"],
  ]);
  expect(p.assetPipeline!.entries[0].bundle).toEqual(s.getExported());
  expect(p.artifact!.scene.map((n) => n.path)).toEqual(
    expect.arrayContaining([
      `Workspace/${p.scope}/Retrieved/Tree`,
      `Workspace/${p.scope}/Retrieved/Rock`,
    ]),
  );
  const reuse = p.assetPipeline!.events.find((e) => e.step === "asset_reused")!;
  expect(reuse.needId).toBe("tree");
  expect((reuse.data as any).sourceRunId).not.toBe(p.assetPipeline!.runId);
  expect(
    p.assetPipeline!.events.filter(
      (e) => e.needId === "tree" && e.step === "place_result",
    ),
  ).toHaveLength(1);
  expect(p.assetPipeline!.inputContext?.needs.map((n) => n.id)).toEqual([
    "tree",
    "rock",
  ]);
  expect(p.assetPipeline!.inputContext?.worker).toEqual(s.worker);
  expect(
    createHash("sha256")
      .update(JSON.stringify(p.assetPipeline!.inputContext))
      .digest("hex"),
  ).toBe(p.assetPipeline!.inputHash);
  const trace = fs
    .readFileSync(path.join(s.dir, "traces", p.id + ".events.jsonl"), "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  const original = trace.find((t) => t.phase === "assets-retained").run;
  expect(original.runId).toBe((reuse.data as any).sourceRunId);
  expect(original.status).toBe("passed");
  expect(original.entries[0].bundle).toEqual(
    p.assetPipeline!.entries[0].bundle,
  );
  expect(assessAssetExecution(p, { recordOrigin: "offline_test" }).status).toBe(
    "pending",
  );
});

it("new-need failure remains failed while retaining the original successful asset and provenance", async () => {
  const s = setup({ discoverRock: true, rockFailure: true }),
    p = await s.build();
  expect(p.stage).toBe("failed");
  expect(p.assetPipeline!.status).toBe("failed");
  expect(p.assetPipeline!.entries.map((e) => [e.needId, e.status])).toEqual([
    ["tree", "passed"],
    ["rock", "failed"],
  ]);
  expect(p.assetPipeline!.entries[0].bundle).toEqual(s.getExported());
  expect(
    p.assetPipeline!.events.some(
      (e) => e.needId === "tree" && e.step === "place_result",
    ),
  ).toBe(true);
  expect(vi.mocked(s.adapter.search).mock.calls.map(([n]) => n.id)).toEqual([
    "tree",
    "rock",
  ]);
  expect(s.adapter.place).toHaveBeenCalledOnce();
  expect(p.assetPipeline!.requiresReconciliation).not.toBe(true);
  expect(assessAssetExecution(p, { recordOrigin: "offline_test" }).status).toBe(
    "failed",
  );
});

it("failed delta plus changed profile remains a valid failed execution record, and rebinding is blocked", async () => {
  const s = setup({ discoverRock: true, rockFailure: true }),
    p = await s.build();
  const settings = s.config.read();
  settings.profiles[0].id = randomUUID();
  settings.routes.builder[0] = settings.profiles[0].id;
  await expect(
    (s.engine as any).resolveAssets(
      p,
      structuredClone(p.assetPipeline!.needs),
      settings,
      new Map(),
      new AbortController().signal,
    ),
  ).rejects.toThrow(/Previously accepted/);
  expect(p.assetPipeline!.entries.map((e) => e.needId)).toEqual([
    "tree",
    "rock",
  ]);
  expect(assessAssetExecution(p, { recordOrigin: "offline_test" }).status).toBe(
    "failed",
  );
  expect(() =>
    s.engine.bindAssetStudio(p.id, p.revision, randomUUID()),
  ).toThrow(/new revision/);
  expect(s.factory).toHaveBeenCalledTimes(2);
});

it.each([
  "changed need",
  "removed need",
  "Studio",
  "profile",
  "revision",
  "answer",
  "experience",
  "acceptance",
  "research",
])(
  "accepted assets cannot be silently rebound after %s changes, even on repeated attempts",
  async (change) => {
    const s = setup(),
      p = await s.build();
    const original = structuredClone(p.assetPipeline!);
    const settings = s.config.read();
    let needs = structuredClone(original.needs);
    if (change === "changed need") needs[0].position = [80, 1, 0];
    if (change === "removed need") needs = [];
    if (change === "Studio") p.assetStudioId = randomUUID();
    if (change === "revision") p.revision++;
    if (change === "answer")
      p.answers.input = "Tap only; no walking interaction";
    if (change === "experience")
      p.spec!.summary = "A different player experience";
    if (change === "acceptance")
      p.spec!.requirements[0].acceptance = "Count only after completion";
    if (change === "research") p.research = researchFixture(p);
    if (change === "profile")
      settings.profiles[0].model = "different-model-same-profile-id";
    for (let attempt = 0; attempt < 2; attempt++) {
      await expect(
        (s.engine as any).resolveAssets(
          p,
          needs,
          settings,
          new Map(),
          new AbortController().signal,
        ),
      ).rejects.toThrow(/Previously accepted/);
      expect(p.assetPipeline!.status).toBe("failed");
      expect(p.assetPipeline!.entries[0].bundle).toEqual(
        original.entries[0].bundle,
      );
    }
    expect(s.factory).toHaveBeenCalledOnce();
    expect(s.adapter.search).toHaveBeenCalledOnce();
  },
);
