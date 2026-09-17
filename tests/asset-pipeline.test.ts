import { describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { runAssetPipeline } from "../src/generation/asset-pipeline";
import { componentReviewFixture } from "./component-review.fixture";
import { AssetOperationError } from "../src/generation/asset-contract";
import {
  inspectPcmWav,
  type StudioAudioEvidence,
} from "../src/generation/audio-evidence";
import type {
  AssetAdapter,
  AssetCandidate,
  AssetInspection,
  AssetModel,
  AssetNeed,
  AssetPipelineInput,
  AssetPipelineRun,
  AssetReceipt,
  AssetVerification,
} from "../src/generation/asset-contract";

// Offline adapter/model mocks only. These are not Studio or model-quality observations.
const image =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
const placedImage = image.replace("CAAAAC0", "CAAAAD0");
const receipt = (operation: string): AssetReceipt => ({
  operation,
  at: "2026-09-15T00:00:00Z",
  studioId: "offline-studio",
  data: { mocked: true },
});
const need = (
  id = "prop",
  required = true,
  kind: AssetNeed["kind"] = "Model",
): AssetNeed => ({
  id,
  requirementId: "style",
  role: "A matching prop",
  kind,
  query: "stylized bakery",
  constraints: "Readable safe prop",
  required,
  position: [0, 0, 0],
  maxSize: 12,
});
const candidate = (
  id = "101",
  kind: AssetNeed["kind"] = "Model",
): AssetCandidate => ({
  id,
  name: "Test prop " + id,
  kind,
  creator: "offline",
  sourceUrl: "https://example.test/asset/" + id,
  price: 0,
  source: "creator_store",
});
const functional = { contentLoaded: true, instanceCount: 1, scriptCount: 0 };
function setup(needs = [need()]) {
  const run: AssetPipelineRun = {
    version: 1,
    runId: "run-test",
    revision: 1,
    inputHash: "f".repeat(64),
    status: "running",
    startedAt: "2026-09-15T00:00:00Z",
    policy: {
      maxSearches: 2,
      maxCandidates: 3,
      allowEscalation: false,
      workerRoute: "test-worker",
      evaluatorRoute: "test-evaluator",
    },
    adapter: "offline-adapter",
    needs,
    entries: [],
    events: [],
  };
  const inspect = (c: AssetCandidate): AssetInspection => ({
    candidate: c,
    token: "owned-" + c.id,
    path: "Workspace/Test/Staged" + c.id,
    safe: true,
    reasons: [],
    snapshot: { mocked: true },
    image,
    receipts: [receipt("inspect")],
    functional: { ...functional, playbackObserved: true },
  });
  const verification: AssetVerification = {
    passed: true,
    reasons: [],
    snapshot: { mocked: true },
    image: placedImage,
    receipts: [receipt("place")],
    functional: { ...functional, playbackObserved: true },
    bundle: {
      files: [],
      assets: [],
      coverage: [],
      scene: [
        {
          path: "Workspace/Test/Prop",
          className: "Part",
          properties: { Anchored: true },
        },
      ],
    },
  };
  const adapter: AssetAdapter = {
    identity: "offline-adapter",
    search: vi.fn(async (n) => ({
      candidates: [
        candidate("101", n.kind),
        candidate("102", n.kind),
        candidate("103", n.kind),
      ],
      receipts: [receipt("search")],
    })),
    inspect: vi.fn(async (_n, c) => inspect(c)),
    place: vi.fn(async () => structuredClone(verification)),
    discard: vi.fn(async () => [receipt("discard")]),
  };
  const model: AssetModel = {
    decide: vi.fn(async (context) => {
      const c = (context as { candidates: AssetCandidate[] }).candidates[0];
      return c
        ? {
            action: "select" as const,
            candidateId: c.id,
            query: null,
            reason: "Best available match",
          }
        : {
            action: "reject" as const,
            candidateId: null,
            query: null,
            reason: "No suitable candidate",
          };
    }),
    evaluate: vi.fn(async () => ({
      accepted: true,
      reason: "Mock accepts observed candidate",
      visualFit: true,
      functionalFit: true,
    })),
  };
  const controller = new AbortController();
  const saved: AssetPipelineRun[] = [];
  const persist = vi.fn(async (value: AssetPipelineRun) => {
    saved.push(structuredClone(value));
  });
  const input: AssetPipelineInput = {
    run,
    adapter,
    model,
    persist,
    signal: controller.signal,
  };
  return {
    run,
    adapter,
    model,
    saved,
    persist,
    input,
    controller,
    inspect,
    verification,
  };
}

it.each([
  "repaired",
  "limit",
  "accepted-first",
  "unsuitable-first",
  "repair-reject",
  "second-unknown",
  "second-known",
  "cancelled",
  "invalid-review",
  "stale-plan",
])(
  "bounds model-authored repair to a second verified adaptation (%s)",
  async (mode) => {
    const s = setup(),
      fixture = componentReviewFixture();
    fixture.evidence.nodes.push({
      index: 4,
      parentIndex: 1,
      name: "Geometry",
      className: "Part",
    });
    vi.mocked(s.adapter.inspect).mockImplementationOnce(
      async (_need, selected) => ({
        ...s.inspect(selected),
        safe: false,
        capabilityBlock: {
          kind: "interactive_asset_requires_review",
          reason: "Fixture requires review",
        },
      }),
    );
    s.adapter.prepareComponentReview = vi.fn(async () => ({
      evidence: structuredClone(fixture.evidence),
      receipts: [receipt("prepared")],
    }));
    const reviewed: ReturnType<typeof componentReviewFixture>["decision"][] =
      [];
    const nativeEvidence: (typeof fixture.evidence)[] = [];
    s.model.reviewComponent = vi.fn(async (context) => {
      const review = structuredClone(fixture.decision);
      const count = reviewed.length;
      review.packetHash = context.evidence.packetHash;
      review.sources[0].sha256 = context.evidence.sourceBodies[0].sha256;
      review.sources[0].reuse = "adapt";
      review.requirements[0].sourceHashes = [review.sources[0].sha256];
      review.permissionImpacts[0].sourceHashes = [review.sources[0].sha256];
      review.disposition =
        count === 0 ||
        (count === 1 &&
          mode !== "accepted-first" &&
          mode !== "unsuitable-first") ||
        mode === "limit"
          ? "needs_more_evidence"
          : mode === "unsuitable-first"
            ? "unsuitable"
            : "integration_candidate";
      review.reason =
        count === 1
          ? "Synthetic reviewer found a reset callback race"
          : "Synthetic review";
      if (count === 1 && mode === "invalid-review")
        review.packetHash = "0".repeat(64);
      if (count === 1 && mode === "cancelled") s.controller.abort();
      reviewed.push(structuredClone(review));
      return review;
    });
    s.model.adaptComponent = vi.fn(async (context) => {
      expect(context.review).toEqual(reviewed.at(-1));
      const attempt = context.adaptation!.attempt;
      expect(context.adaptation).toEqual({
        attempt,
        maxAttempts: 2,
        remainingAttempts: 2 - attempt,
      });
      if (attempt === 2) {
        expect(context.review.reason).toContain("reset callback race");
        expect(context.evidence).toEqual(nativeEvidence[0]);
        expect(context.preservation!.before).toEqual(fixture.evidence);
        if (mode === "repair-reject")
          return {
            action: "reject" as const,
            reason: "Worker declined repair",
          };
      }
      return {
        action: "adapt" as const,
        plan: {
          packetHash:
            attempt === 2 && mode === "stale-plan"
              ? fixture.evidence.packetHash
              : context.evidence.packetHash,
          inputHash: context.evidence.inputHash,
          reason: "Worker authored fixture repair",
          removeSubtrees: [],
          replaceSources: [
            {
              indices: [2, 3],
              beforeSha256: context.evidence.sourceBodies[0].sha256,
              source:
                context.evidence.sourceBodies[0].source +
                `\n-- worker edit ${attempt}`,
              reason: "Apply reviewer feedback",
            },
          ],
          preservedBehavior: ["Unverified claim"],
          remainingIntegration: ["Audio audition remains required"],
          nativeTestPlan: ["Observe interaction"],
          runtimeVerification: "not_performed" as const,
        },
      };
    });
    s.adapter.adaptComponent = vi.fn(async (_inspection, before, plan) => {
      const attempt = nativeEvidence.length + 1;
      if (attempt === 2 && ["second-known", "second-unknown"].includes(mode))
        throw new AssetOperationError(
          "Synthetic repair failure",
          [receipt("adapt-failure")],
          mode === "second-unknown" ? "unknown" : "owned",
        );
      const evidence = structuredClone(before);
      evidence.packetHash = String(attempt + 1).repeat(64);
      evidence.derivativeHash = String(attempt + 5).repeat(64);
      evidence.sourceBodies[0].source = plan.replaceSources[0].source;
      evidence.sourceBodies[0].sha256 = createHash("sha256")
        .update(evidence.sourceBodies[0].source)
        .digest("hex");
      nativeEvidence.push(structuredClone(evidence));
      return { evidence, receipts: [receipt("adapted")] };
    });
    s.adapter.prepareComponentIntegration = vi.fn(
      async (requested, _inspection, evidence, review) => {
        expect(review).toEqual(reviewed.at(-1));
        return {
          component: {
            needId: requested.id,
            candidateId: "101",
            inputHash: s.run.inputHash,
            recordHash: "8".repeat(64),
            packetHash: evidence.packetHash,
            archiveHash: evidence.derivativeHash,
            conversionHash: "9".repeat(64),
            destinationPath: "Workspace/Test/Assets/prop",
            rootName: "Model",
            runtimeVerification: "not_performed" as const,
            placement: "worker_integration_required" as const,
          },
          receipts: [receipt("integration")],
          bundle: {
            files: [],
            scene: [],
            coverage: [],
            assets: [
              {
                id: requested.id,
                requirementId: requested.requirementId,
                kind: "model" as const,
                status: "retrieved" as const,
                assetId: "101",
                sourceUrl: "https://example.test/asset/101",
                description: requested.role,
              },
            ],
          },
        };
      },
    );
    const result = await runAssetPipeline(s.input);
    const noRepair = [
      "accepted-first",
      "unsuitable-first",
      "invalid-review",
      "cancelled",
    ].includes(mode);
    expect(s.model.adaptComponent).toHaveBeenCalledTimes(noRepair ? 1 : 2);
    expect(s.adapter.adaptComponent).toHaveBeenCalledTimes(
      noRepair || ["repair-reject", "stale-plan"].includes(mode) ? 1 : 2,
    );
    if (mode === "second-unknown") {
      expect(result.requiresReconciliation).toBe(true);
      expect(s.adapter.discard).not.toHaveBeenCalled();
    } else
      expect(s.adapter.discard).toHaveBeenCalledTimes(
        ["unsuitable-first", "repair-reject"].includes(mode) ? 2 : 1,
      );
    if (["repaired", "accepted-first"].includes(mode)) {
      expect(result.status).toBe("passed");
      expect(s.adapter.prepareComponentIntegration).toHaveBeenCalledOnce();
      expect(result.entries[0].component?.packetHash).toBe(
        nativeEvidence.at(-1)!.packetHash,
      );
      expect(
        result.events.findIndex((event) => event.step === "discard_result"),
      ).toBeLessThan(
        result.events.findIndex((event) => event.step === "component_prepared"),
      );
    } else expect(s.adapter.prepareComponentIntegration).not.toHaveBeenCalled();
    if (mode === "repaired" || mode === "limit") {
      const last = vi.mocked(s.model.reviewComponent).mock.calls.at(-1)![0];
      expect(last.preservation!.original).toEqual(fixture.evidence);
      expect(last.preservation!.before).toEqual(nativeEvidence[0]);
      expect(last.evidence).toEqual(nativeEvidence[1]);
      expect(last.adaptation).toEqual({
        attempt: 2,
        maxAttempts: 2,
        remainingAttempts: 0,
      });
      expect(last.preservation!.earlierSteps).toHaveLength(1);
    }
    if (mode === "limit") expect(result.status).toBe("failed");
    expect(reviewed[1].reason).toBe(
      "Synthetic reviewer found a reset callback race",
    );
  },
);

// Full component-retention -> audio-audition path, with synthetic PCM only.
function setupEmbeddedAudio() {
  const s = setup([need("audio", true, "Audio"), need("prop")]);
  const fixture = componentReviewFixture();
  const component = {
    recordHash: "0".repeat(64),
    needId: "prop",
    candidateId: "101",
    inputHash: s.run.inputHash,
    packetHash: fixture.evidence.packetHash,
    archiveHash: fixture.evidence.derivativeHash,
    conversionHash: "1".repeat(64),
    destinationPath: "Workspace/Test/Assets/prop",
    rootName: "Model",
    runtimeVerification: "not_performed" as const,
    placement: "worker_integration_required" as const,
  };
  const embedded: AssetCandidate = {
    ...candidate("123", "Audio"),
    source: "creator_store_component",
    componentOrigin: {
      needId: component.needId,
      candidateId: component.candidateId,
      recordHash: component.recordHash,
      packetHash: component.packetHash,
      archiveHash: component.archiveHash,
      bindingIndices: [2, 3],
    },
  };
  let captureNumber = 0;
  const audio = (c: AssetCandidate): StudioAudioEvidence => {
    const rate = 16000,
      bytes = Buffer.alloc(44 + rate * 2);
    bytes.write("RIFF");
    bytes.writeUInt32LE(bytes.length - 8, 4);
    bytes.write("WAVEfmt ", 8);
    bytes.writeUInt32LE(16, 16);
    bytes.writeUInt16LE(1, 20);
    bytes.writeUInt16LE(1, 22);
    bytes.writeUInt32LE(rate, 24);
    bytes.writeUInt32LE(rate * 2, 28);
    bytes.writeUInt16LE(2, 32);
    bytes.writeUInt16LE(16, 34);
    bytes.write("data", 36);
    bytes.writeUInt32LE(rate * 2, 40);
    for (let i = 4800; i < rate; i++)
      bytes.writeInt16LE(Math.round(Math.sin(i * 0.14) * 8000), 44 + i * 2);
    const wav = inspectPcmWav(bytes);
    return {
      dataUrl: "data:audio/wav;base64," + bytes.toString("base64"),
      sha256: wav.sha256,
      durationMs: wav.durationMs,
      sampleRate: wav.sampleRate,
      channels: wav.channels,
      rms: wav.rms,
      peak: wav.peak,
      source: {
        kind: "studio_process_loopback",
        mode: "include_process_tree",
        studioId: "offline-studio",
        candidateId: c.id,
        token: "owned-" + c.id,
        processId: 1234,
        processStartedAt: "2026-09-15T12:00:00Z",
        capturedAt: new Date(
          Date.UTC(2026, 8, 15, 13, 0, ++captureNumber),
        ).toISOString(),
        file: "offline.wav",
      },
    };
  };
  s.adapter.prepareComponentReview = vi.fn(async () => ({
    evidence: fixture.evidence,
    receipts: [receipt("prepared")],
  }));
  s.model.reviewComponent = vi.fn(async () => fixture.decision);
  s.adapter.prepareComponentIntegration = vi.fn(async (n) => ({
    component,
    receipts: [receipt("integration")],
    bundle: {
      files: [],
      scene: [],
      coverage: [],
      assets: [
        {
          id: n.id,
          requirementId: n.requirementId,
          kind: "model" as const,
          status: "retrieved" as const,
          assetId: "101",
          sourceUrl: "https://example.test/asset/101",
          description: n.role,
        },
      ],
    },
  }));
  s.adapter.discoverComponentAudio = vi.fn(async () => ({
    candidates: [structuredClone(embedded)],
    receipts: [receipt("component_audio_discovered")],
  }));
  vi.mocked(s.adapter.inspect).mockImplementation(async (n, c) =>
    n.kind === "Model"
      ? {
          ...s.inspect(c),
          safe: false,
          capabilityBlock: {
            kind: "interactive_asset_requires_review",
            reason: "Retain native component",
          },
        }
      : { ...s.inspect(c), image: undefined, audio: audio(c) },
  );
  vi.mocked(s.adapter.place).mockImplementation(async (_n, inspection) => ({
    ...structuredClone(s.verification),
    image: undefined,
    audio: audio(inspection.candidate),
  }));
  vi.mocked(s.model.evaluate).mockResolvedValue({
    accepted: true,
    visualFit: false,
    audioFit: true,
    functionalFit: true,
    reason: "Offline listening fixture accepted",
  });
  return { ...s, component, embedded };
}

describe("bounded asset selection and native verification pipeline (offline mocks)", () => {
  it("offers chronological search snapshots and verifies a third-search selection normally", async () => {
    const s = setup();
    s.run.policy.maxSearches = 3;
    const queries = [s.run.needs[0].query, "broader fixture", "fixture"];
    let calls = 0;
    s.adapter.search = vi.fn(async () => ({
      candidates:
        ++calls < 3
          ? []
          : [candidate("101"), candidate("101"), candidate("102", "Audio")],
      receipts: [receipt("search")],
    }));
    const contexts: any[] = [];
    s.model.decide = vi.fn(async (raw) => {
      const context = raw as any;
      contexts.push(context);
      return context.searches < 3
        ? {
            action: "retry" as const,
            candidateId: null,
            query: queries[context.searches],
            reason: "Worker-authored broader query",
          }
        : {
            action: "select" as const,
            candidateId: "101",
            query: null,
            reason: "Inspect returned candidate",
          };
    });
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("passed");
    expect(
      vi.mocked(s.adapter.search).mock.calls.map(([, query]) => query),
    ).toEqual(queries);
    expect(contexts.map((context) => context.searchHistory.length)).toEqual([
      1, 2, 3,
    ]);
    expect(contexts[2].searchHistory).toEqual(
      queries.map((query, index) => ({
        searchNumber: index + 1,
        query,
        candidatesReturnedByAdapter: index === 2 ? 3 : 0,
        candidatesOffered: index === 2 ? 1 : 0,
      })),
    );
    expect(contexts[2]).toMatchObject({
      searchesRemaining: 0,
      inspectionAttemptsRemaining: 3,
      need: { required: true },
    });
    expect(contexts[2].allowedActions).not.toContain("retry");
    expect(contexts[0].instruction).toContain("shorter common-name query");
    expect(s.adapter.inspect).toHaveBeenCalledTimes(1);
    expect(s.model.evaluate).toHaveBeenCalledTimes(2);
    expect(s.adapter.place).toHaveBeenCalledTimes(1);
    expect(s.adapter.discard).toHaveBeenCalledTimes(1);
    expect(result.needs).toEqual(s.run.needs);
  });

  it.each(["Model", "Audio"] as const)(
    "fails required %s after three empty worker-directed searches without fallback or flag changes",
    async (kind) => {
      const s = setup([need("requiredNeed", true, kind)]);
      s.run.policy.maxSearches = 3;
      vi.mocked(s.adapter.search).mockResolvedValue({
        candidates: [],
        receipts: [receipt("search")],
      });
      s.model.decide = vi.fn(async (raw) => {
        const context = raw as any;
        return context.searchesRemaining
          ? {
              action: "retry" as const,
              candidateId: null,
              query: "worker query " + context.searches,
              reason: "Search another relevant term",
            }
          : {
              action: "reject" as const,
              candidateId: null,
              query: null,
              reason: "No offered candidate after bounded search",
            };
      });
      const result = await runAssetPipeline(s.input);
      expect(result.status).toBe("failed");
      expect(result.needs).toEqual(s.run.needs);
      expect(result.entries[0]).toMatchObject({
        status: "failed",
        attempts: 0,
      });
      expect(s.adapter.search).toHaveBeenCalledTimes(3);
      expect(s.model.decide).toHaveBeenCalledTimes(3);
      expect(
        (vi.mocked(s.model.decide).mock.calls[2][0] as any).searchHistory,
      ).toHaveLength(3);
      expect(s.adapter.inspect).not.toHaveBeenCalled();
      expect(s.adapter.place).not.toHaveBeenCalled();
      expect(s.model.evaluate).not.toHaveBeenCalled();
      expect(
        result.events.some(
          (event) => event.step === "visual_fallback_eligible",
        ),
      ).toBe(false);
    },
  );

  it("isolates history snapshots from model-side mutation and bounds repeated queries", async () => {
    const s = setup();
    s.run.policy.maxSearches = 3;
    vi.mocked(s.adapter.search).mockResolvedValue({
      candidates: [],
      receipts: [receipt("search")],
    });
    const observed: any[] = [];
    s.model.decide = vi.fn(async (raw) => {
      const context = raw as any;
      observed.push(structuredClone(context.searchHistory));
      context.searchHistory[0].query = "model mutation";
      context.searchHistory.push({ query: "invented history" });
      return {
        action: "retry" as const,
        candidateId: null,
        query: s.run.needs[0].query,
        reason: "Repeated worker query",
      };
    });
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("failed");
    expect(result.error).toContain("Search budget exhausted");
    expect(s.adapter.search).toHaveBeenCalledTimes(3);
    expect(observed.map((rows) => rows.length)).toEqual([1, 2, 3]);
    expect(
      observed.flat().every((row) => row.query === s.run.needs[0].query),
    ).toBe(true);
    expect(
      result.events
        .filter((event) => event.step === "search_candidates")
        .map((event) => (event.data as any).query),
    ).toEqual(Array(3).fill(s.run.needs[0].query));
  });

  it("offers retained component audio before search but still requires both native captures, evaluations, placement and release", async () => {
    const s = setupEmbeddedAudio();
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("passed");
    expect(vi.mocked(s.adapter.search).mock.calls.map(([n]) => n.kind)).toEqual(
      ["Model"],
    );
    expect(s.adapter.discoverComponentAudio).toHaveBeenCalledTimes(1);
    expect(
      vi.mocked(s.adapter.discoverComponentAudio!).mock.calls[0][1],
    ).toEqual(s.component);
    const context = vi.mocked(s.model.decide).mock.calls[1][0] as any;
    expect(context).toMatchObject({
      sourcePhase: "component_audio",
      searches: 0,
      searchesRemaining: 2,
      candidates: [s.embedded],
    });
    expect(context.instruction).toContain(
      "their references are not listening or playback evidence",
    );
    expect(s.model.evaluate).toHaveBeenCalledTimes(2);
    expect(
      vi
        .mocked(s.model.evaluate)
        .mock.calls.every(
          (call) => call[3]?.source.candidateId === s.embedded.id,
        ),
    ).toBe(true);
    expect(s.adapter.place).toHaveBeenCalledTimes(1);
    expect(s.adapter.discard).toHaveBeenCalledTimes(2);
    expect(
      result.entries.find((entry) => entry.needId === "audio")?.selected,
    ).toEqual(s.embedded);
    const steps = result.events.map((event) => event.step);
    expect(steps.indexOf("discard_result")).toBeLessThan(
      steps.indexOf("component_prepared"),
    );
    expect(steps.indexOf("component_prepared")).toBeLessThan(
      steps.indexOf("component_audio_discovery_call"),
    );
    expect(steps.indexOf("component_audio_discovery_result")).toBeLessThan(
      steps.indexOf("component_audio_candidates"),
    );
    expect(steps.indexOf("component_audio_candidates")).toBeLessThan(
      steps.lastIndexOf("decision_call"),
    );
  });

  it.each(["empty", "unsupported"])(
    "uses the existing Marketplace search when embedded discovery is %s",
    async (mode) => {
      const s = setupEmbeddedAudio();
      if (mode === "empty")
        vi.mocked(s.adapter.discoverComponentAudio!).mockResolvedValue({
          candidates: [],
          receipts: [receipt("no_component_audio")],
        });
      else delete s.adapter.discoverComponentAudio;
      const result = await runAssetPipeline(s.input);
      expect(result.status).toBe("passed");
      expect(
        vi.mocked(s.adapter.search).mock.calls.map(([n]) => n.kind),
      ).toEqual(["Model", "Audio"]);
      expect(
        (vi.mocked(s.model.decide).mock.calls[1][0] as any).sourcePhase,
      ).toBe("marketplace");
      expect(s.model.evaluate).toHaveBeenCalledTimes(2);
    },
  );

  it("lets the worker retry from embedded audio into a Marketplace query without automatically choosing a sound", async () => {
    const s = setupEmbeddedAudio(),
      original = s.model.decide;
    s.model.decide = vi.fn(async (context, signal) =>
      (context as any).sourcePhase === "component_audio"
        ? {
            action: "retry" as const,
            candidateId: null,
            query: "worker authored sound query",
            reason: "Find a closer fit for the requested interaction",
          }
        : original(context, signal),
    );
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("passed");
    expect(vi.mocked(s.adapter.search).mock.calls[1][1]).toBe(
      "worker authored sound query",
    );
    expect(
      vi
        .mocked(s.adapter.inspect)
        .mock.calls.filter(([n]) => n.kind === "Audio")[0][1].source,
    ).toBe("creator_store");
    expect(s.model.decide).toHaveBeenCalledTimes(3);
    expect(s.model.evaluate).toHaveBeenCalledTimes(2);
  });

  it.each([
    "needId",
    "candidateId",
    "recordHash",
    "packetHash",
    "archiveHash",
    "zero-index",
    "duplicate-index",
    "too-large-index",
    "empty-indices",
    "nonnumeric-audio",
    "wrong-kind",
  ])(
    "rejects invalid or stale embedded origin before Audio selection: %s",
    async (field) => {
      const s = setupEmbeddedAudio(),
        forged = structuredClone(s.embedded) as any;
      if (["needId", "candidateId"].includes(field))
        forged.componentOrigin[field] = "other";
      else if (["recordHash", "packetHash", "archiveHash"].includes(field))
        forged.componentOrigin[field] = "f".repeat(64);
      else if (field === "zero-index")
        forged.componentOrigin.bindingIndices = [0];
      else if (field === "duplicate-index")
        forged.componentOrigin.bindingIndices = [2, 2];
      else if (field === "too-large-index")
        forged.componentOrigin.bindingIndices = [3001];
      else if (field === "empty-indices")
        forged.componentOrigin.bindingIndices = [];
      else if (field === "nonnumeric-audio") forged.id = "invented";
      else forged.kind = "Model";
      vi.mocked(s.adapter.discoverComponentAudio!).mockResolvedValue({
        candidates: [forged],
        receipts: [receipt("discovery")],
      });
      const result = await runAssetPipeline(s.input);
      expect(result.status).toBe("failed");
      expect(result.requiresReconciliation).not.toBe(true);
      expect(s.model.decide).toHaveBeenCalledTimes(1);
      expect(
        vi.mocked(s.adapter.inspect).mock.calls.map(([n]) => n.kind),
      ).toEqual(["Model"]);
      expect(s.adapter.discard).toHaveBeenCalledTimes(1);
    },
  );

  it("does not accept embedded audio merely because its reference was found in a retained component", async () => {
    const s = setupEmbeddedAudio();
    s.run.policy.maxCandidates = 1;
    vi.mocked(s.model.evaluate).mockResolvedValue({
      accepted: false,
      audioFit: false,
      visualFit: false,
      functionalFit: true,
      reason: "Actual clip does not match the need",
    });
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("failed");
    expect(
      result.entries.find((entry) => entry.needId === "audio")?.status,
    ).toBe("failed");
    expect(s.adapter.place).not.toHaveBeenCalled();
    expect(s.adapter.discard).toHaveBeenCalledTimes(2);
    expect(s.model.evaluate).toHaveBeenCalledTimes(1);
  });

  it.each(["cleanup", "persistence"])(
    "does not discover from a component before confirmed retention: %s fails",
    async (step) => {
      const s = setupEmbeddedAudio();
      if (step === "cleanup")
        vi.mocked(s.adapter.discard).mockRejectedValueOnce(
          Error("Cleanup unknown"),
        );
      else
        s.input.persist = async (run) => {
          if (run.events.at(-1)?.step === "component_prepared")
            throw Error("Disk full");
        };
      if (step === "cleanup")
        expect((await runAssetPipeline(s.input)).requiresReconciliation).toBe(
          true,
        );
      else
        await expect(runAssetPipeline(s.input)).rejects.toThrow(
          "Cannot persist",
        );
      expect(s.adapter.discoverComponentAudio).not.toHaveBeenCalled();
      expect(
        vi.mocked(s.adapter.search).mock.calls.map(([n]) => n.kind),
      ).toEqual(["Model"]);
    },
  );

  it("stops when cancelled during readonly discovery, after prior component cleanup", async () => {
    const s = setupEmbeddedAudio();
    vi.mocked(s.adapter.discoverComponentAudio!).mockImplementation(
      async () => {
        s.controller.abort();
        return { candidates: [s.embedded], receipts: [receipt("discovery")] };
      },
    );
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("interrupted");
    expect(result.requiresReconciliation).not.toBe(true);
    expect(s.model.decide).toHaveBeenCalledTimes(1);
    expect(s.adapter.discard).toHaveBeenCalledTimes(1);
  });

  it.each(["none", "unknown"] as const)(
    "preserves discovery failure classification and never silently searches after effects=%s",
    async (effects) => {
      const s = setupEmbeddedAudio();
      vi.mocked(s.adapter.discoverComponentAudio!).mockRejectedValue(
        new AssetOperationError(
          "Evidence discovery failed",
          [receipt("failure")],
          effects,
        ),
      );
      const result = await runAssetPipeline(s.input);
      expect(result.status).toBe("failed");
      expect(result.requiresReconciliation === true).toBe(
        effects === "unknown",
      );
      expect(s.model.decide).toHaveBeenCalledTimes(1);
      expect(
        vi.mocked(s.adapter.search).mock.calls.map(([n]) => n.kind),
      ).toEqual(["Model"]);
    },
  );

  it("keeps normal Marketplace search strict and rejects injected embedded provenance", async () => {
    const s = setupEmbeddedAudio();
    delete s.adapter.discoverComponentAudio;
    const original = s.adapter.search;
    s.adapter.search = vi.fn(async (n, query, signal) =>
      n.kind === "Audio"
        ? { candidates: [s.embedded], receipts: [receipt("search")] }
        : original(n, query, signal),
    );
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("failed");
    expect(s.model.decide).toHaveBeenCalledTimes(1);
  });

  it("deduplicates embedded IDs, retains origin, and does not increase the inspection budget", async () => {
    const s = setupEmbeddedAudio();
    const alternatives = Array.from({ length: 19 }, (_, index) => ({
      ...structuredClone(s.embedded),
      id: String(201 + index),
    }));
    vi.mocked(s.adapter.discoverComponentAudio!).mockResolvedValue({
      candidates: [s.embedded, ...alternatives.slice(0, 18), s.embedded],
      receipts: [receipt("discovery")],
    });
    vi.mocked(s.model.evaluate).mockResolvedValue({
      accepted: false,
      audioFit: false,
      visualFit: false,
      functionalFit: true,
      reason: "Not suitable",
    });
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("failed");
    expect(
      (vi.mocked(s.model.decide).mock.calls[1][0] as any).candidates,
    ).toHaveLength(19);
    expect(
      vi
        .mocked(s.adapter.inspect)
        .mock.calls.filter(([n]) => n.kind === "Audio"),
    ).toHaveLength(3);
    expect(vi.mocked(s.adapter.search).mock.calls.map(([n]) => n.kind)).toEqual(
      ["Model"],
    );
  });
  it("preserves the first origin when retained components expose the same audio ID", async () => {
    const s = setupEmbeddedAudio();
    s.run.needs.push(need("secondProp"));
    const original = s.adapter.prepareComponentIntegration!;
    s.adapter.prepareComponentIntegration = vi.fn<
      NonNullable<AssetAdapter["prepareComponentIntegration"]>
    >(async (...args) => {
      const value = await original(...args);
      return {
        ...value,
        component: {
          ...value.component,
          needId: args[0].id,
          recordHash:
            args[0].id === "secondProp"
              ? "2".repeat(64)
              : value.component.recordHash,
          destinationPath: `Workspace/Test/Assets/${args[0].id}`,
        },
      };
    });
    s.adapter.discoverComponentAudio = vi.fn(async (_need, component) => ({
      candidates: [
        {
          ...structuredClone(s.embedded),
          componentOrigin: {
            needId: component.needId,
            candidateId: component.candidateId,
            recordHash: component.recordHash,
            packetHash: component.packetHash,
            archiveHash: component.archiveHash,
            bindingIndices: [2, 3],
          },
        },
      ],
      receipts: [receipt("discovery")],
    }));
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("passed");
    expect(s.adapter.discoverComponentAudio).toHaveBeenCalledTimes(2);
    expect(
      (vi.mocked(s.model.decide).mock.calls[2][0] as any).candidates,
    ).toEqual([s.embedded]);
    expect(
      result.entries.find((entry) => entry.needId === "audio")?.selected
        ?.componentOrigin?.needId,
    ).toBe("prop");
  });

  it("keeps spent inspections and excludes attempted embedded IDs when the worker retries Marketplace", async () => {
    const s = setupEmbeddedAudio();
    const originalDecision = s.model.decide;
    const originalSearch = s.adapter.search;
    s.model.decide = vi.fn<AssetModel["decide"]>(async (context, signal) => {
      const state = context as any;
      if (state.sourcePhase === "component_audio" && !state.candidates.length) {
        return {
          action: "retry",
          candidateId: null,
          query: "worker alternative query",
          reason: "Actual embedded audition did not fit",
        };
      }
      return originalDecision(context, signal);
    });
    s.adapter.search = vi.fn(async (n, query, signal) =>
      n.kind === "Audio"
        ? {
            candidates: [candidate("123", "Audio"), candidate("456", "Audio")],
            receipts: [receipt("search")],
          }
        : originalSearch(n, query, signal),
    );
    vi.mocked(s.model.evaluate).mockResolvedValueOnce({
      accepted: false,
      audioFit: false,
      visualFit: false,
      functionalFit: true,
      reason: "Embedded audio unsuitable",
    });
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("passed");
    expect(vi.mocked(s.model.decide).mock.calls.at(-1)?.[0]).toMatchObject({
      sourcePhase: "marketplace",
      searches: 1,
      attempts: 1,
      inspectionAttemptsRemaining: 2,
      candidates: [{ id: "456" }],
    });
    expect(
      vi
        .mocked(s.adapter.inspect)
        .mock.calls.filter(([n]) => n.kind === "Audio")
        .map(([, item]) => item.id),
    ).toEqual(["123", "456"]);
    expect(
      result.entries.find((entry) => entry.needId === "audio"),
    ).toMatchObject({ attempts: 2, selected: { id: "456" } });
  });

  it("persists each call/result before the next effect and separately evaluates inspection and actual placement images", async () => {
    const s = setup();
    const previousSearch = s.adapter.search;
    s.adapter.search = vi.fn(async (need, query, signal) => {
      expect(s.saved.at(-1)?.events.at(-1)?.step).toBe("search_call");
      return previousSearch(need, query, signal);
    });
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("passed");
    expect(result.entries[0]).toMatchObject({
      status: "passed",
      attempts: 1,
      selected: { id: "101" },
    });
    expect(s.model.evaluate).toHaveBeenCalledTimes(2);
    expect(
      vi
        .mocked(s.model.evaluate)
        .mock.calls.map((c) => [(c[0] as { phase: string }).phase, c[1]]),
    ).toEqual([
      ["inspection", image],
      ["placed", placedImage],
    ]);
    expect(s.adapter.discard).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(result.events)).not.toContain("iVBORw0KGgo");
    expect(JSON.stringify(result.events)).toContain("sha256");
    expect(s.saved.map((r) => r.events.length)).toEqual(
      Array.from({ length: result.events.length }, (_, i) => i + 1),
    );
    expect(s.run.events).toEqual([]); // Input history is never rewritten by the runner.
  });

  it("discards rejected staged assets before selecting the next candidate and never reselects an attempted ID", async () => {
    const s = setup();
    vi.mocked(s.model.evaluate).mockResolvedValueOnce({
      accepted: false,
      reason: "Wrong visual style",
      visualFit: false,
      functionalFit: true,
    });
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("passed");
    expect(result.entries[0].selected?.id).toBe("102");
    expect(s.adapter.discard).toHaveBeenCalledTimes(2);
    expect(
      result.events.findIndex((e) => e.step === "discard_result"),
    ).toBeLessThan(
      result.events.findIndex(
        (e) =>
          e.step === "candidate_selected" &&
          (e.data as { candidate: AssetCandidate }).candidate.id === "102",
      ),
    );
    const again = setup();
    vi.mocked(again.model.evaluate).mockResolvedValue({
      accepted: false,
      reason: "Wrong style",
      visualFit: false,
      functionalFit: true,
    });
    vi.mocked(again.model.decide).mockResolvedValue({
      action: "select",
      candidateId: "101",
      query: null,
      reason: "Reuse the rejected ID",
    });
    const stopped = await runAssetPipeline(again.input);
    expect(stopped.status).toBe("failed");
    expect(again.adapter.inspect).toHaveBeenCalledTimes(1);
  });

  it("does not inspect model-invented candidate IDs", async () => {
    const s = setup();
    vi.mocked(s.model.decide).mockResolvedValue({
      action: "select",
      candidateId: "999999999",
      query: null,
      reason: "Invented result",
    });
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("failed");
    expect(result.error).toContain("unoffered");
    expect(s.adapter.inspect).not.toHaveBeenCalled();
  });

  it.each(["unsafe", "scripts", "unloaded", "missing_image"])(
    "rejects %s inspection before placement",
    async (mode) => {
      const s = setup();
      s.run.policy.maxCandidates = 1;
      vi.mocked(s.adapter.inspect).mockImplementation(async (_n, c) => ({
        ...s.inspect(c),
        safe: mode !== "unsafe",
        image: mode === "missing_image" ? undefined : image,
        functional: {
          ...functional,
          contentLoaded: mode !== "unloaded",
          scriptCount: mode === "scripts" ? 1 : 0,
        },
      }));
      const result = await runAssetPipeline(s.input);
      expect(result.status).toBe("failed");
      expect(s.model.evaluate).not.toHaveBeenCalled();
      expect(s.adapter.place).not.toHaveBeenCalled();
      expect(s.adapter.discard).toHaveBeenCalledTimes(1);
    },
  );

  it.each(["native", "image", "evaluator"])(
    "requires %s placement verification and cleans up rejected placement",
    async (mode) => {
      const s = setup();
      s.run.policy.maxCandidates = 1;
      vi.mocked(s.adapter.place).mockResolvedValue({
        ...s.verification,
        passed: mode !== "native",
        image: mode === "image" ? undefined : placedImage,
      });
      if (mode === "evaluator")
        vi.mocked(s.model.evaluate)
          .mockResolvedValueOnce({
            accepted: true,
            reason: "Inspection accepted",
            visualFit: true,
            functionalFit: true,
          })
          .mockResolvedValueOnce({
            accepted: true,
            reason: "Wrong final placement function",
            visualFit: true,
            functionalFit: false,
          });
      const result = await runAssetPipeline(s.input);
      expect(result.status).toBe("failed");
      expect(result.entries[0].bundle).toBeUndefined();
      expect(s.adapter.discard).toHaveBeenCalledTimes(1);
    },
  );

  it("caps search retries and candidate inspections using the declared positive policy", async () => {
    const s = setup();
    vi.mocked(s.model.decide).mockResolvedValue({
      action: "retry",
      candidateId: null,
      query: "another relevant bakery query",
      reason: "Try another search",
    });
    expect((await runAssetPipeline(s.input)).status).toBe("failed");
    expect(s.adapter.search).toHaveBeenCalledTimes(2);
    const candidates = setup();
    vi.mocked(candidates.model.evaluate).mockResolvedValue({
      accepted: false,
      reason: "Style mismatch",
      visualFit: false,
      functionalFit: true,
    });
    expect((await runAssetPipeline(candidates.input)).status).toBe("failed");
    expect(candidates.adapter.inspect).toHaveBeenCalledTimes(3);
    expect(candidates.adapter.discard).toHaveBeenCalledTimes(3);
  });

  it.each([true, false])(
    "offers the fifth result for inspection after search exhaustion, retaining evaluator acceptance=%s",
    async (accepted) => {
      const s = setup();
      s.run.policy.maxSearches = 1;
      s.run.policy.maxCandidates = 1;
      vi.mocked(s.adapter.search).mockResolvedValue({
        candidates: [101, 102, 103, 104, 105].map((id) =>
          candidate(String(id)),
        ),
        receipts: [receipt("search")],
      });
      vi.mocked(s.model.decide).mockResolvedValue({
        action: "select",
        candidateId: "105",
        query: null,
        reason: "Inspect the fifth plausible search result",
      });
      vi.mocked(s.model.evaluate).mockResolvedValue({
        accepted,
        visualFit: accepted,
        functionalFit: true,
        reason: accepted ? "Observed fit" : "Observed mismatch",
      });
      const result = await runAssetPipeline(s.input);
      const context = vi.mocked(s.model.decide).mock.calls[0][0] as any;
      expect(context).toMatchObject({
        searchesRemaining: 0,
        inspectionAttemptsRemaining: 1,
        offeredCandidateCount: 5,
        allowedActions: ["select", "reject", "escalate"],
      });
      expect(context.candidates.map((c: AssetCandidate) => c.id)).toEqual([
        "101",
        "102",
        "103",
        "104",
        "105",
      ]);
      expect(context.instruction).toContain(
        "Selection authorizes native import and inspection/audition; it is not asset acceptance",
      );
      expect(context.instruction).toContain(
        "normally unavailable before selection",
      );
      expect(context.instruction).toContain(
        "Searches and inspection attempts have separate budgets",
      );
      expect(
        context.candidates.every(
          (c: Record<string, unknown>) => !("image" in c) && !("audio" in c),
        ),
      ).toBe(true);
      expect(s.adapter.inspect).toHaveBeenCalledTimes(1);
      expect(vi.mocked(s.adapter.inspect).mock.calls[0][1].id).toBe("105");
      expect(s.model.evaluate).toHaveBeenCalledTimes(accepted ? 2 : 1);
      expect(s.adapter.place).toHaveBeenCalledTimes(accepted ? 1 : 0);
      expect(result.status).toBe(accepted ? "passed" : "failed");
      expect(result.entries[0].selected?.id).toBe(accepted ? "105" : undefined);
    },
  );

  it("offers five alternatives while limiting native inspections to three rejected candidates", async () => {
    const s = setup();
    vi.mocked(s.adapter.search).mockResolvedValue({
      candidates: [101, 102, 103, 104, 105].map((id) => candidate(String(id))),
      receipts: [receipt("search")],
    });
    vi.mocked(s.model.evaluate).mockResolvedValue({
      accepted: false,
      visualFit: false,
      functionalFit: true,
      reason: "Observed mismatch",
    });
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("failed");
    expect(s.adapter.inspect).toHaveBeenCalledTimes(3);
    expect(s.adapter.discard).toHaveBeenCalledTimes(3);
    expect(
      vi
        .mocked(s.model.decide)
        .mock.calls.map(([context]) => (context as any).offeredCandidateCount),
    ).toEqual([5, 4, 3]);
    expect(
      vi
        .mocked(s.model.decide)
        .mock.calls.map(
          ([context]) => (context as any).inspectionAttemptsRemaining,
        ),
    ).toEqual([3, 2, 1]);
    expect(result.entries[0].attempts).toBe(3);
  });

  it("a retry offers new filtered candidates independently of two remaining inspections", async () => {
    const s = setup();
    vi.mocked(s.adapter.search)
      .mockResolvedValueOnce({
        candidates: [candidate("101")],
        receipts: [receipt("search")],
      })
      .mockResolvedValueOnce({
        candidates: [
          candidate("101"),
          candidate("201"),
          candidate("201"),
          candidate("999", "Audio"),
          ...[202, 203, 204, 205, 206].map((id) => candidate(String(id))),
        ],
        receipts: [receipt("search")],
      });
    vi.mocked(s.model.evaluate).mockResolvedValueOnce({
      accepted: false,
      visualFit: false,
      functionalFit: true,
      reason: "Observed mismatch",
    });
    vi.mocked(s.model.decide)
      .mockResolvedValueOnce({
        action: "select",
        candidateId: "101",
        query: null,
        reason: "Inspect first plausible candidate",
      })
      .mockResolvedValueOnce({
        action: "retry",
        candidateId: null,
        query: "another relevant query",
        reason: "Find more candidates",
      })
      .mockResolvedValueOnce({
        action: "select",
        candidateId: "205",
        query: null,
        reason: "Inspect fifth new candidate",
      });
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("passed");
    expect(s.adapter.search).toHaveBeenCalledTimes(2);
    expect(s.adapter.inspect).toHaveBeenCalledTimes(2);
    const context = vi.mocked(s.model.decide).mock.calls[2][0] as any;
    expect(context).toMatchObject({
      searchesRemaining: 0,
      inspectionAttemptsRemaining: 2,
      offeredCandidateCount: 6,
    });
    expect(context.candidates.map((c: AssetCandidate) => c.id)).toEqual([
      "201",
      "202",
      "203",
      "204",
      "205",
      "206",
    ]);
    expect(result.entries[0]).toMatchObject({
      attempts: 2,
      selected: { id: "205" },
    });
  });

  it("keeps offered context capped at twenty and refuses an unoffered twenty-first candidate", async () => {
    const s = setup();
    vi.mocked(s.adapter.search).mockResolvedValue({
      candidates: Array.from({ length: 22 }, (_, i) =>
        candidate(String(101 + i)),
      ),
      receipts: [receipt("search")],
    });
    vi.mocked(s.model.decide).mockResolvedValue({
      action: "select",
      candidateId: "121",
      query: null,
      reason: "Unoffered ID",
    });
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("failed");
    expect(result.error).toContain("unoffered");
    expect(
      result.events.find((event) => event.step === "search_candidates")?.data,
    ).toMatchObject({ candidatesReturned: 22, candidatesOffered: 20 });
    expect(s.adapter.inspect).not.toHaveBeenCalled();
  });

  it("halts on uncertain placement/disconnection without retrying or issuing another mutation", async () => {
    const s = setup();
    vi.mocked(s.adapter.place).mockRejectedValue(
      Object.assign(Error("Studio disconnected after write"), {
        outcome: "unknown",
      }),
    );
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("failed");
    expect(s.adapter.inspect).toHaveBeenCalledTimes(1);
    expect(s.adapter.place).toHaveBeenCalledTimes(1);
    expect(s.adapter.discard).not.toHaveBeenCalled();
    expect(result.events.some((e) => e.step === "cleanup_deferred")).toBe(true);
    expect(result.events.some((e) => e.step === "place_error")).toBe(true);
  });

  it("cleans up a known staged token on cancellation with an independent signal, then stops", async () => {
    const s = setup();
    vi.mocked(s.model.evaluate).mockImplementation(async () => {
      s.controller.abort();
      return {
        accepted: true,
        reason: "Cancelled concurrently",
        visualFit: true,
        functionalFit: true,
      };
    });
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("interrupted");
    expect(s.adapter.discard).toHaveBeenCalledTimes(1);
    expect(vi.mocked(s.adapter.discard).mock.calls[0][1].aborted).toBe(false);
    expect(s.adapter.place).not.toHaveBeenCalled();
  });

  it("halts when cleanup fails and does not continue selecting candidates", async () => {
    const s = setup();
    vi.mocked(s.model.evaluate).mockResolvedValue({
      accepted: false,
      reason: "Reject",
      visualFit: false,
      functionalFit: true,
    });
    vi.mocked(s.adapter.discard).mockRejectedValue(
      Error("Could not confirm deletion"),
    );
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("failed");
    expect(result.error).toContain("cleanup failed");
    expect(result.requiresReconciliation).toBe(true);
    expect(s.adapter.inspect).toHaveBeenCalledTimes(1);
    expect(s.adapter.discard).toHaveBeenCalledTimes(1);
    expect(result.events.some((e) => e.step === "discard_error")).toBe(true);
  });

  it.each([false, true])(
    "logs terminal escalation with allowEscalation=%s without making an escalation call",
    async (allow) => {
      const s = setup();
      s.run.policy.allowEscalation = allow;
      vi.mocked(s.model.decide).mockResolvedValue({
        action: "escalate",
        candidateId: null,
        query: null,
        reason: "Need an authorized stronger review",
      });
      const result = await runAssetPipeline(s.input);
      expect(result.status).toBe(allow ? "escalation_required" : "failed");
      expect(result.events.at(-1)).toMatchObject({
        step: "escalation_request",
        data: { allowed: allow, executed: false },
      });
      expect(s.model.decide).toHaveBeenCalledTimes(1);
      expect(s.model.evaluate).not.toHaveBeenCalled();
    },
  );

  it("never treats loaded audio as semantically verified audio quality", async () => {
    const s = setup([need("sound", true, "Audio")]);
    vi.mocked(s.adapter.inspect).mockImplementation(async (_n, c) => ({
      ...s.inspect(c),
      functional: { ...functional },
    }));
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("failed");
    expect(result.error).toContain("listening capability");
    expect(s.adapter.discard).toHaveBeenCalledTimes(1);
    expect(s.adapter.place).not.toHaveBeenCalled();
    expect(s.model.evaluate).not.toHaveBeenCalled();
    expect(s.adapter.inspect).toHaveBeenCalledTimes(1);
  });

  it("records failed optional needs without claiming their asset evidence passed", async () => {
    const s = setup([need("optional", false)]);
    vi.mocked(s.adapter.search).mockResolvedValue({
      candidates: [],
      receipts: [receipt("search")],
    });
    vi.mocked(s.model.decide)
      .mockResolvedValueOnce({
        action: "retry",
        candidateId: null,
        query: "different query",
        reason: "Try a second distinct search",
      })
      .mockResolvedValue({
        action: "reject",
        candidateId: null,
        query: null,
        reason: "No suitable match",
      });
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("passed");
    expect(result.entries[0]).toMatchObject({
      status: "failed",
      reason: "No suitable match",
    });
    expect(result.entries[0].bundle).toBeUndefined();
    expect(result.events.at(-1)).toMatchObject({
      data: { optionalFailedNeedIds: ["optional"] },
    });
  });

  it.each([
    "interactive_asset_requires_review",
    "unsupported_structure",
  ] as const)(
    "cleans a %s capability block then halts even an optional visual without procedural fallback",
    async (kind) => {
      const s = setup([need("optional", false)]);
      vi.mocked(s.adapter.inspect).mockImplementationOnce(async (_n, c) => ({
        ...s.inspect(c),
        safe: false,
        capabilityBlock: {
          kind,
          reason:
            "Inspected reusable content exceeds current supported capabilities",
        },
      }));
      const result = await runAssetPipeline(s.input);
      expect(result.status).toBe("failed");
      expect(result.requiresReconciliation).not.toBe(true);
      expect(s.adapter.discard).toHaveBeenCalledTimes(1);
      expect(s.model.evaluate).not.toHaveBeenCalled();
      expect(s.adapter.place).not.toHaveBeenCalled();
      expect(
        result.events.some(
          (e) =>
            e.step === "candidate_rejected" ||
            e.step === "visual_fallback_eligible",
        ),
      ).toBe(false);
      expect(
        result.events.find((e) => e.step === "capability_blocked")?.data,
      ).toMatchObject({ kind, proceduralFallbackAllowed: false });
      expect(
        result.events.findIndex((e) => e.step === "discard_result"),
      ).toBeLessThan(
        result.events.findIndex((e) => e.step === "escalation_request"),
      );
    },
  );

  it.each([
    "valid",
    "missing-source",
    "wrong-context",
    "uncertain-preparation",
    "cancelled-review",
  ])(
    "reviews complete component evidence and preserves execution/cleanup boundaries (%s)",
    async (mode) => {
      const s = setup();
      const fixture = componentReviewFixture();
      vi.mocked(s.adapter.inspect).mockImplementationOnce(async (_n, c) => ({
        ...s.inspect(c),
        safe: false,
        functional: { ...functional, scriptCount: 2 },
        capabilityBlock: {
          kind: "interactive_asset_requires_review",
          reason: "Complete scripted component",
        },
      }));
      s.adapter.prepareComponentReview = vi.fn(
        async (inspection, inputHash) => {
          expect(inspection.token).toBe(fixture.evidence.token);
          expect(inputHash).toBe(s.run.inputHash);
          if (mode === "uncertain-preparation")
            throw new AssetOperationError(
              "Lost mutation response",
              [receipt("restriction")],
              "unknown",
            );
          return {
            evidence: fixture.evidence,
            receipts: [receipt("component_prepared")],
          };
        },
      );
      s.model.reviewComponent = vi.fn(async (context) => {
        expect(context.evidence.sourceBodies[0].bindings).toHaveLength(2);
        expect(context.requirementIds).toEqual(["style"]);
        if (mode === "missing-source") fixture.decision.sources = [];
        if (mode === "wrong-context")
          fixture.decision.inputHash = "0".repeat(64);
        if (mode === "cancelled-review") {
          s.controller.abort();
          throw Error("Cancelled");
        }
        return fixture.decision;
      });
      const result = await runAssetPipeline(s.input);
      expect(result.status).toBe(
        mode === "cancelled-review" ? "interrupted" : "failed",
      );
      expect(s.adapter.place).not.toHaveBeenCalled();
      expect(s.model.evaluate).not.toHaveBeenCalled();
      if (mode === "uncertain-preparation") {
        expect(result.requiresReconciliation).toBe(true);
        expect(s.adapter.discard).not.toHaveBeenCalled();
        expect(s.model.reviewComponent).not.toHaveBeenCalled();
      } else {
        expect(result.requiresReconciliation).not.toBe(true);
        expect(s.adapter.discard).toHaveBeenCalledTimes(1);
        if (mode === "valid") {
          expect(result.error).toContain("source review recorded");
          expect(result.error).toContain("integration");
          expect(
            result.events.find((e) => e.step === "component_review_result")
              ?.data,
          ).toMatchObject({ packetHash: fixture.evidence.packetHash });
        } else
          expect(
            result.events.some((e) => e.step === "component_review_result"),
          ).toBe(false);
      }
    },
  );

  it.each([
    "adapted",
    "salvage-rejected-original",
    "worker-reject",
    "review-reject",
    "invalid-plan",
    "wrong-packet",
    "stale-review",
    "unknown-effects",
    "cancelled",
  ])(
    "runs one bounded worker adaptation and reviews actual recaptured evidence (%s)",
    async (mode) => {
      const s = setup(),
        fixture = componentReviewFixture();
      fixture.decision.disposition = "needs_more_evidence";
      if (mode === "salvage-rejected-original")
        fixture.decision.disposition = "unsuitable";
      fixture.evidence.nodes.push({
        index: 4,
        parentIndex: 1,
        name: "RetainedPart",
        className: "Part",
      });
      vi.mocked(s.adapter.inspect).mockImplementationOnce(async (_n, c) => ({
        ...s.inspect(c),
        safe: false,
        capabilityBlock: {
          kind: "interactive_asset_requires_review",
          reason: "Existing behavior needs adaptation",
        },
      }));
      s.adapter.prepareComponentReview = vi.fn(async () => ({
        evidence: fixture.evidence,
        receipts: [receipt("prepared")],
      }));
      const newSource =
        fixture.evidence.sourceBodies[0].source +
        "\n-- worker-authored adaptation";
      const newHash = createHash("sha256").update(newSource).digest("hex");
      const adapted = structuredClone(fixture.evidence);
      adapted.packetHash = "d".repeat(64);
      adapted.derivativeHash = "e".repeat(64);
      adapted.sourceBodies[0].source = newSource;
      adapted.sourceBodies[0].sha256 = newHash;
      const plan = {
        packetHash: fixture.evidence.packetHash,
        inputHash: s.run.inputHash,
        reason: "Adapt retained behavior",
        removeSubtrees: [],
        replaceSources: [
          {
            indices: [2, 3],
            beforeSha256: fixture.evidence.sourceBodies[0].sha256,
            source: newSource,
            reason: "Adapt both bindings",
          },
        ],
        preservedBehavior: ["Retained sound reference"],
        remainingIntegration: [],
        nativeTestPlan: ["Test in Studio"],
        runtimeVerification: "not_performed" as const,
      };
      s.model.adaptComponent = vi.fn(async (context) => {
        expect(context.review.disposition).toBe(fixture.decision.disposition);
        expect(context.need).toEqual(s.run.needs[0]);
        expect(context.evidence).toEqual(fixture.evidence);
        expect(context.stage?.needs[0].need.required).toBe(true);
        expect(context.stage?.namespace).toBeNull();
        if (mode === "worker-reject")
          return {
            action: "reject" as const,
            reason: "Wrong component for the requested game",
          };
        if (mode === "invalid-plan") plan.packetHash = "0".repeat(64);
        return { action: "adapt" as const, plan };
      });
      s.adapter.adaptComponent = vi.fn(
        async (_inspection, evidence, manifest) => {
          expect(evidence).toEqual(fixture.evidence);
          expect(manifest).toEqual(plan);
          if (mode === "unknown-effects")
            throw new AssetOperationError(
              "Lost adaptation response",
              [receipt("lost")],
              "unknown",
            );
          if (mode === "cancelled") {
            s.controller.abort();
            throw Error("Cancelled");
          }
          return {
            evidence:
              mode === "wrong-packet"
                ? { ...adapted, inputHash: "0".repeat(64) }
                : adapted,
            receipts: [receipt("adapted")],
          };
        },
      );
      s.model.reviewComponent = vi
        .fn()
        .mockImplementationOnce(async (context) => {
          expect(context).not.toHaveProperty("preservation");
          // Model callbacks receive detached snapshots, never live run/need state.
          if (mode === "adapted") {
            context.stage.needs[0].need.required = false;
            context.stage.namespace = "ForgedScope";
            context.need.role = "Mutated callback role";
          }
          return fixture.decision;
        })
        .mockImplementation(async (context) => {
          expect(context.evidence).toEqual(adapted);
          expect(context.stage.needs[0].need.required).toBe(true);
          expect(context.stage.namespace).toBeNull();
          expect(context.preservation.before).toEqual(fixture.evidence);
          expect(context.preservation.appliedPlan).toEqual(plan);
          expect(context.preservation.mapping.sourceBindings).toEqual(
            [2, 3].map((index) => ({
              beforeIndex: index,
              currentIndex: index,
              beforeSha256: fixture.evidence.sourceBodies[0].sha256,
              currentSha256: newHash,
              change: "replaced",
            })),
          );
          expect(context.evidence.sourceBodies[0].source).toBe(newSource);
          const review = structuredClone(fixture.decision);
          review.packetHash =
            mode === "stale-review"
              ? fixture.evidence.packetHash
              : adapted.packetHash;
          review.disposition =
            mode === "review-reject" ? "unsuitable" : "integration_candidate";
          review.sources[0].sha256 = newHash;
          review.requirements[0].sourceHashes = [newHash];
          review.permissionImpacts[0].sourceHashes = [newHash];
          return review;
        });
      const result = await runAssetPipeline(s.input);
      expect(s.model.adaptComponent).toHaveBeenCalledTimes(1);
      if (mode === "worker-reject" || mode === "review-reject") {
        expect(result.status).toBe("passed");
        expect(s.adapter.inspect).toHaveBeenCalledTimes(2);
        expect(s.adapter.place).toHaveBeenCalledTimes(1);
        expect(
          result.events.findIndex((e) => e.step === "discard_result"),
        ).toBeLessThan(
          result.events.findIndex((e) => e.step === "candidate_rejected"),
        );
      } else {
        expect(result.status).toBe(
          mode === "cancelled" ? "interrupted" : "failed",
        );
        expect(s.adapter.place).not.toHaveBeenCalled();
      }
      if (mode === "unknown-effects") {
        expect(result.requiresReconciliation).toBe(true);
        expect(s.adapter.discard).not.toHaveBeenCalled();
      }
      if (mode === "invalid-plan" || mode === "worker-reject")
        expect(s.adapter.adaptComponent).not.toHaveBeenCalled();
      if (mode === "adapted" || mode === "salvage-rejected-original") {
        expect(s.model.reviewComponent).toHaveBeenCalledTimes(2);
        expect(result.error).toContain("integration");
        expect(
          result.events.find(
            (e) => e.step === "component_adapted_review_result",
          )?.data,
        ).toMatchObject({ packetHash: adapted.packetHash });
        expect(s.adapter.discard).toHaveBeenCalledTimes(1);
      }
    },
  );

  it.each([
    "prepared",
    "wrong-identity",
    "unknown-effects",
    "cleanup-uncertain",
    "bad-bundle",
    "cancelled",
  ])(
    "prepares a reviewed native component without claiming placement/gameplay (%s)",
    async (mode) => {
      const s = setup(),
        fixture = componentReviewFixture();
      vi.mocked(s.adapter.inspect).mockImplementationOnce(async (_n, c) => ({
        ...s.inspect(c),
        safe: false,
        capabilityBlock: {
          kind: "interactive_asset_requires_review",
          reason: "Retain interactive component",
        },
      }));
      s.adapter.prepareComponentReview = vi.fn(async () => ({
        evidence: fixture.evidence,
        receipts: [receipt("prepared")],
      }));
      s.model.reviewComponent = vi.fn(async () => fixture.decision);
      s.adapter.prepareComponentIntegration = vi.fn<
        NonNullable<AssetAdapter["prepareComponentIntegration"]>
      >(async (n) => {
        if (mode === "unknown-effects")
          throw new AssetOperationError(
            "Lost export comparison",
            [receipt("lost")],
            "unknown",
          );
        if (mode === "cancelled") {
          s.controller.abort();
          throw Error("Cancelled");
        }
        return {
          component: {
            recordHash: "0".repeat(64),
            needId: n.id,
            candidateId: mode === "wrong-identity" ? "999" : "101",
            inputHash: s.run.inputHash,
            packetHash: fixture.evidence.packetHash,
            archiveHash: fixture.evidence.derivativeHash,
            conversionHash: "1".repeat(64),
            destinationPath: "Workspace/Forge_Test/Assets/prop",
            rootName: "Model",
            runtimeVerification: "not_performed",
            placement: "worker_integration_required",
          },
          receipts: [receipt("integration")],
          bundle: {
            files: [],
            scene:
              mode === "bad-bundle"
                ? [
                    {
                      path: "Workspace/Forge_Test/Injected",
                      className: "Part",
                      properties: {},
                    },
                  ]
                : [],
            coverage: [],
            assets: [
              {
                id: n.id,
                requirementId: n.requirementId,
                kind: "model",
                status: "retrieved",
                assetId: "101",
                sourceUrl: "https://example.test/asset/101",
                description: n.role,
              },
            ],
          },
        };
      });
      if (mode === "cleanup-uncertain")
        vi.mocked(s.adapter.discard).mockRejectedValueOnce(
          new AssetOperationError("Lost cleanup", [receipt("lost")], "unknown"),
        );
      const result = await runAssetPipeline(s.input);
      expect(s.adapter.place).not.toHaveBeenCalled();
      expect(s.model.evaluate).not.toHaveBeenCalled();
      if (mode === "prepared") {
        expect(result.status).toBe("passed");
        expect(result.entries[0].component?.runtimeVerification).toBe(
          "not_performed",
        );
        expect(result.entries[0].reason).toContain("unverified");
        expect(
          result.events.findIndex((e) => e.step === "discard_result"),
        ).toBeLessThan(
          result.events.findIndex((e) => e.step === "component_prepared"),
        );
      } else {
        expect(result.status).toBe(
          mode === "cancelled" ? "interrupted" : "failed",
        );
        expect(result.entries[0].component).toBeUndefined();
      }
      if (mode === "unknown-effects") {
        expect(result.requiresReconciliation).toBe(true);
        expect(s.adapter.discard).not.toHaveBeenCalled();
      }
    },
  );

  it.each(["next-candidate", "cleanup-uncertain", "attempts-exhausted"])(
    "continues after an unsuitable component only within confirmed cleanup and attempt bounds (%s)",
    async (mode) => {
      const s = setup(),
        fixture = componentReviewFixture();
      fixture.decision.disposition = "unsuitable";
      fixture.decision.reason =
        "Unresolved external loader is unrelated to the requested prop";
      vi.mocked(s.adapter.inspect).mockImplementationOnce(async (_n, c) => ({
        ...s.inspect(c),
        safe: false,
        functional: { ...functional, scriptCount: 2 },
        capabilityBlock: {
          kind: "interactive_asset_requires_review",
          reason: "Scripted component",
        },
      }));
      s.adapter.prepareComponentReview = vi.fn(async () => ({
        evidence: fixture.evidence,
        receipts: [receipt("prepared")],
      }));
      s.model.reviewComponent = vi.fn(async () => fixture.decision);
      if (mode === "cleanup-uncertain")
        vi.mocked(s.adapter.discard).mockRejectedValueOnce(
          new AssetOperationError(
            "Lost cleanup response",
            [receipt("discard_unknown")],
            "unknown",
          ),
        );
      if (mode === "attempts-exhausted") s.run.policy.maxCandidates = 1;
      const result = await runAssetPipeline(s.input);
      if (mode === "next-candidate") {
        expect(result.status).toBe("passed");
        expect(s.adapter.inspect).toHaveBeenCalledTimes(2);
        expect(vi.mocked(s.adapter.inspect).mock.calls[1][1].id).toBe("102");
        expect(s.adapter.place).toHaveBeenCalledTimes(1);
        const secondContext = vi.mocked(s.model.decide).mock.calls[1][0] as any;
        expect(secondContext.rejected).toEqual([
          {
            candidateId: "101",
            reason: expect.stringContaining(fixture.decision.reason),
          },
        ]);
        expect(secondContext.candidates.some((c: any) => c.id === "101")).toBe(
          false,
        );
        expect(
          result.events.findIndex((e) => e.step === "discard_result"),
        ).toBeLessThan(
          result.events.findIndex((e) => e.step === "candidate_rejected"),
        );
        expect(result.events.some((e) => e.step === "escalation_request")).toBe(
          false,
        );
      } else {
        expect(result.status).toBe("failed");
        expect(s.adapter.inspect).toHaveBeenCalledTimes(1);
        expect(s.model.decide).toHaveBeenCalledTimes(1);
        expect(s.adapter.place).not.toHaveBeenCalled();
        expect(result.requiresReconciliation === true).toBe(
          mode === "cleanup-uncertain",
        );
      }
    },
  );

  it("records permitted capability escalation only after successful cleanup", async () => {
    const s = setup([need("optional", false)]);
    s.run.policy.allowEscalation = true;
    vi.mocked(s.adapter.inspect).mockImplementationOnce(async (_n, c) => ({
      ...s.inspect(c),
      capabilityBlock: {
        kind: "interactive_asset_requires_review",
        reason: "Embedded interaction requires review",
      },
    }));
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("escalation_required");
    expect(result.requiresReconciliation).not.toBe(true);
    expect(s.adapter.discard).toHaveBeenCalledTimes(1);
  });

  it("preserves unknown cleanup effects instead of treating a capability block as safe fallback", async () => {
    const s = setup([need("optional", false)]);
    vi.mocked(s.adapter.inspect).mockImplementationOnce(async (_n, c) => ({
      ...s.inspect(c),
      capabilityBlock: {
        kind: "unsupported_structure",
        reason: "Unsupported inspected rig",
      },
    }));
    vi.mocked(s.adapter.discard).mockRejectedValue(
      Error("Legacy cleanup outcome unknown"),
    );
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("failed");
    expect(result.requiresReconciliation).toBe(true);
    expect(
      result.events.some(
        (e) =>
          e.step === "visual_fallback_eligible" ||
          e.step === "escalation_request",
      ),
    ).toBe(false);
  });

  it.each(["one-query", "two-queries-zero-inspections", "duplicate-query"])(
    "blocks optional visual fallback without completed sourcing: %s",
    async (kind) => {
      const s = setup([need("optional", false)]);
      if (kind !== "one-query")
        vi.mocked(s.model.decide).mockResolvedValueOnce({
          action: "retry",
          candidateId: null,
          query:
            kind === "duplicate-query"
              ? "  STYLIZED   BAKERY "
              : "different query",
          reason: "Search again",
        });
      vi.mocked(s.model.decide).mockResolvedValue({
        action: "reject",
        candidateId: null,
        query: null,
        reason: "Prefer procedural content without inspection",
      });
      const result = await runAssetPipeline(s.input);
      expect(result.status).toBe("failed");
      expect(result.requiresReconciliation).not.toBe(true);
      expect(result.error).toContain(
        kind === "two-queries-zero-inspections"
          ? "completed native inspection"
          : "two distinct",
      );
      expect(s.adapter.inspect).not.toHaveBeenCalled();
      expect(
        result.events.some((e) => e.step === "visual_fallback_eligible"),
      ).toBe(false);
    },
  );

  it("permits ordinary unsuitable rejection only after two searches and actual inspection", async () => {
    const s = setup([need("optional", false)]);
    vi.mocked(s.model.decide)
      .mockResolvedValueOnce({
        action: "retry",
        candidateId: null,
        query: "another query",
        reason: "Expand search before import",
      })
      .mockResolvedValueOnce({
        action: "select",
        candidateId: "101",
        query: null,
        reason: "Inspect returned candidate",
      })
      .mockResolvedValueOnce({
        action: "reject",
        candidateId: null,
        query: null,
        reason: "Observed visual mismatch",
      });
    vi.mocked(s.model.evaluate).mockResolvedValue({
      accepted: false,
      visualFit: false,
      functionalFit: true,
      reason: "Observed visual mismatch",
    });
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("passed");
    expect(result.entries[0].status).toBe("failed");
    expect(s.adapter.inspect).toHaveBeenCalledTimes(1);
    expect(s.adapter.discard).toHaveBeenCalledTimes(1);
    expect(
      result.events.find((e) => e.step === "visual_fallback_eligible")?.data,
    ).toMatchObject({ completedInspections: 1, blockingReason: null });
  });

  it("does not bypass distinct-query fallback requirements when native inspection budget is exhausted", async () => {
    const s = setup([need("optional", false)]);
    vi.mocked(s.model.evaluate).mockResolvedValue({
      accepted: false,
      visualFit: false,
      functionalFit: true,
      reason: "Observed mismatch",
    });
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("failed");
    expect(s.adapter.inspect).toHaveBeenCalledTimes(3);
    expect(s.adapter.discard).toHaveBeenCalledTimes(3);
    expect(
      result.events.some((e) => e.step === "visual_fallback_blocked"),
    ).toBe(true);
  });

  it("executes Model needs first without changing frozen need order or input identity", async () => {
    const s = setup([
      need("audio", true, "Audio"),
      need("firstModel"),
      need("image", true, "Image"),
      need("secondModel"),
    ]);
    vi.mocked(s.adapter.inspect).mockImplementationOnce(async (_n, c) => ({
      ...s.inspect(c),
      capabilityBlock: {
        kind: "interactive_asset_requires_review",
        reason: "Complete interaction needs review",
      },
    }));
    const originalNeeds = structuredClone(s.run.needs),
      originalHash = s.run.inputHash;
    const result = await runAssetPipeline(s.input);
    expect(vi.mocked(s.adapter.search).mock.calls.map(([n]) => n.id)).toEqual([
      "firstModel",
    ]);
    expect(result.needs).toEqual(originalNeeds);
    expect(result.inputHash).toBe(originalHash);
    expect(result.events[0].data).toMatchObject({
      needIds: ["audio", "firstModel", "image", "secondModel"],
      needExecutionOrder: ["firstModel", "secondModel", "audio", "image"],
    });
  });

  it("offers bounded descriptions and twenty alternatives without increasing native attempt budget", async () => {
    const s = setup();
    vi.mocked(s.adapter.search).mockResolvedValue({
      candidates: Array.from({ length: 20 }, (_, i) => ({
        ...candidate(String(101 + i)),
        description: "Returned Marketplace description",
      })),
      receipts: [receipt("search")],
    });
    vi.mocked(s.model.evaluate).mockResolvedValue({
      accepted: false,
      visualFit: false,
      functionalFit: true,
      reason: "Observed mismatch",
    });
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("failed");
    expect(
      (vi.mocked(s.model.decide).mock.calls[0][0] as any).candidates,
    ).toHaveLength(20);
    expect(
      (vi.mocked(s.model.decide).mock.calls[0][0] as any).candidates[0]
        .description,
    ).toBe("Returned Marketplace description");
    expect(s.adapter.inspect).toHaveBeenCalledTimes(3);
  });

  it("allows no needs but rejects bad caps, duplicate needs and historical receipt reuse before tool calls", async () => {
    const empty = setup([]);
    expect((await runAssetPipeline(empty.input)).status).toBe("passed");
    expect(empty.adapter.search).not.toHaveBeenCalled();
    for (const change of [
      (r: AssetPipelineRun) => {
        r.policy.maxSearches = 0;
      },
      (r: AssetPipelineRun) => {
        r.policy.maxSearches = 4;
      },
      (r: AssetPipelineRun) => {
        r.policy.maxCandidates = 6;
      },
      (r: AssetPipelineRun) => {
        r.needs = Array.from({ length: 17 }, (_, i) => need("n" + i));
      },
      (r: AssetPipelineRun) => {
        r.needs = [need(), need()];
      },
      (r: AssetPipelineRun) => {
        r.status = "interrupted";
      },
      (r: AssetPipelineRun) => {
        r.requiresReconciliation = true;
      },
      (r: AssetPipelineRun) => {
        r.entries = [{ needId: "prop", status: "passed", attempts: 1 }];
      },
    ]) {
      const s = setup();
      change(s.run);
      await expect(runAssetPipeline(s.input)).rejects.toThrow();
      expect(s.adapter.search).not.toHaveBeenCalled();
      expect(s.persist).not.toHaveBeenCalled();
    }
  });

  it("does not issue an external effect when the preceding durable event cannot be saved", async () => {
    const s = setup();
    s.input.persist = async (run) => {
      if (run.events.at(-1)?.step === "inspect_call") throw Error("Disk full");
    };
    await expect(runAssetPipeline(s.input)).rejects.toThrow("Cannot persist");
    expect(s.adapter.inspect).not.toHaveBeenCalled();
    expect(s.adapter.discard).not.toHaveBeenCalled();
  });

  it.each([
    "not an image",
    "https://example.test/preview.png",
    "data:image/png;base64,AAAA",
    "data:image/jpeg;base64,iVBORw0KGgo=",
  ])(
    "rejects placeholder, URL or mismatched-signature visual evidence: %s",
    async (invalidImage) => {
      const s = setup();
      s.run.policy.maxCandidates = 1;
      vi.mocked(s.adapter.inspect).mockImplementation(async (_n, c) => ({
        ...s.inspect(c),
        image: invalidImage,
      }));
      expect((await runAssetPipeline(s.input)).status).toBe("failed");
      expect(s.model.evaluate).not.toHaveBeenCalled();
      expect(s.adapter.place).not.toHaveBeenCalled();
      expect(s.adapter.discard).toHaveBeenCalledTimes(1);
    },
  );

  it("requires a confirmed final release before persisting any passed asset entry", async () => {
    const s = setup();
    vi.mocked(s.adapter.discard).mockRejectedValue(
      Error("Release was not confirmed"),
    );
    const result = await runAssetPipeline(s.input);
    expect(s.model.evaluate).toHaveBeenCalledTimes(2);
    expect(result.status).toBe("failed");
    expect(result.entries[0].bundle).toBeUndefined();
    expect(result.requiresReconciliation).toBe(true);
    expect(result.events.some((e) => e.step === "need_passed")).toBe(false);
    expect(
      s.saved.every((r) => r.entries.every((e) => e.status !== "passed")),
    ).toBe(true);
    expect(s.adapter.inspect).toHaveBeenCalledTimes(1);
  });

  it("requires reconciliation when inspection throws before returning an owned token", async () => {
    const s = setup();
    vi.mocked(s.adapter.inspect).mockRejectedValue(
      Error("Disconnected after import was sent"),
    );
    const result = await runAssetPipeline(s.input);
    expect(result).toMatchObject({
      status: "failed",
      requiresReconciliation: true,
    });
    expect(s.adapter.inspect).toHaveBeenCalledTimes(1);
    expect(s.adapter.discard).not.toHaveBeenCalled();
    expect(s.saved.at(-1)?.requiresReconciliation).toBe(true);
  });

  it("requires reconciliation when an inspection returns no cleanup token", async () => {
    const s = setup();
    vi.mocked(s.adapter.inspect).mockImplementation(async (_n, c) => ({
      ...s.inspect(c),
      token: "",
    }));
    const result = await runAssetPipeline(s.input);
    expect(result).toMatchObject({
      status: "failed",
      requiresReconciliation: true,
    });
    expect(s.adapter.inspect).toHaveBeenCalledTimes(1);
    expect(s.adapter.place).not.toHaveBeenCalled();
  });

  it("does not claim unresolved native effects for a read-only search failure", async () => {
    const s = setup();
    vi.mocked(s.adapter.search).mockRejectedValue(Error("Search unavailable"));
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("failed");
    expect(result.requiresReconciliation).not.toBe(true);
    expect(s.adapter.inspect).not.toHaveBeenCalled();
  });

  it.each(["inspect", "place"] as const)(
    "retries a receipted candidate rejection after %s self-cleanup without discarding its expired token",
    async (operation) => {
      const s = setup();
      vi.mocked(s.adapter[operation]).mockRejectedValueOnce(
        new AssetOperationError(
          "Completed negative playback; owned cleanup confirmed",
          [receipt("negative"), receipt("cleanup")],
          "none",
          "candidate_rejected",
        ),
      );
      const result = await runAssetPipeline(s.input);
      expect(result.status).toBe("passed");
      expect(result.entries[0]).toMatchObject({
        attempts: 2,
        selected: { id: "102" },
      });
      expect(result.requiresReconciliation).not.toBe(true);
      expect(s.adapter.discard).toHaveBeenCalledTimes(1);
      expect(vi.mocked(s.adapter.discard).mock.calls[0][0].candidate.id).toBe(
        "102",
      );
      expect(
        result.events.find((e) => e.step === operation + "_error")?.data,
      ).toMatchObject({
        classification: "candidate_rejected",
        effects: "none",
        retry: true,
      });
      expect(vi.mocked(s.model.decide).mock.calls[1][0]).toMatchObject({
        rejected: [{ candidateId: "101" }],
        candidates: [{ id: "102" }, { id: "103" }],
      });
    },
  );

  it.each(["inspect", "place", "discard"] as const)(
    "halts a cleaned infrastructure failure in %s without claiming unknown effects or retrying",
    async (operation) => {
      const s = setup();
      vi.mocked(s.adapter[operation]).mockRejectedValueOnce(
        new AssetOperationError(
          "Capture service unavailable; cleanup confirmed",
          [receipt("cleanup")],
          "none",
        ),
      );
      const result = await runAssetPipeline(s.input);
      expect(result.status).toBe("failed");
      expect(result.requiresReconciliation).not.toBe(true);
      expect(s.adapter.inspect).toHaveBeenCalledTimes(1);
      expect(s.model.decide).toHaveBeenCalledTimes(1);
      expect(
        result.events.find((e) => e.step === operation + "_error")?.data,
      ).toMatchObject({
        classification: "infrastructure_failure",
        retry: false,
      });
      expect(s.adapter.discard).toHaveBeenCalledTimes(
        operation === "discard" ? 1 : 0,
      );
    },
  );

  it.each(["untyped", "empty-receipts", "unknown"])(
    "does not trust a %s rejection as known cleanup",
    async (kind) => {
      const s = setup();
      const error =
        kind === "untyped"
          ? Object.assign(Error("Claims cleanup"), {
              effects: "none",
              classification: "candidate_rejected",
              haltRequired: false,
              receipts: [receipt("cleanup")],
            })
          : new AssetOperationError(
              "Claims cleanup",
              kind === "empty-receipts" ? [] : [receipt("cleanup")],
              kind === "unknown" ? "unknown" : "none",
              "candidate_rejected",
            );
      vi.mocked(s.adapter.inspect).mockRejectedValueOnce(error);
      const result = await runAssetPipeline(s.input);
      expect(result.status).toBe("failed");
      expect(result.requiresReconciliation).toBe(true);
      expect(s.model.decide).toHaveBeenCalledTimes(1);
      expect(s.adapter.discard).not.toHaveBeenCalled();
    },
  );

  it("cleans a known owned placement failure but does not retry infrastructure", async () => {
    const s = setup();
    vi.mocked(s.adapter.place).mockRejectedValueOnce(
      new AssetOperationError(
        "Runtime precondition failed",
        [receipt("guard")],
        "owned",
      ),
    );
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("failed");
    expect(result.requiresReconciliation).not.toBe(true);
    expect(s.adapter.discard).toHaveBeenCalledTimes(1);
    expect(s.model.decide).toHaveBeenCalledTimes(1);
  });

  it("keeps repeated known rejections bounded by the candidate budget", async () => {
    const s = setup();
    vi.mocked(s.adapter.inspect).mockRejectedValue(
      new AssetOperationError(
        "Candidate does not play",
        [receipt("cleanup")],
        "none",
        "candidate_rejected",
      ),
    );
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("failed");
    expect(result.requiresReconciliation).not.toBe(true);
    expect(s.adapter.inspect).toHaveBeenCalledTimes(3);
    expect(s.model.decide).toHaveBeenCalledTimes(3);
    expect(s.adapter.discard).not.toHaveBeenCalled();
  });

  it("preserves cancellation after confirmed cleanup without another candidate", async () => {
    const s = setup();
    vi.mocked(s.adapter.inspect).mockImplementationOnce(async () => {
      s.controller.abort();
      throw new AssetOperationError(
        "Completed rejection",
        [receipt("cleanup")],
        "none",
        "candidate_rejected",
      );
    });
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("interrupted");
    expect(result.requiresReconciliation).not.toBe(true);
    expect(s.model.decide).toHaveBeenCalledTimes(1);
  });

  it("sends each exact image once and compact native observations without raw receipts or scene/source payloads", async () => {
    const s = setup();
    const rawReceipt = {
      ...receipt("capture"),
      data: { image, marker: "RAW-RECEIPT" },
    };
    vi.mocked(s.adapter.inspect).mockImplementation(async (_n, c) => ({
      ...s.inspect(c),
      receipts: [rawReceipt],
      snapshot: {
        ok: true,
        center: [0, 2, 0],
        size: 6,
        scene: [{ source: "HUGE-SCENE" }],
        receipts: [rawReceipt],
      },
    }));
    vi.mocked(s.adapter.place).mockResolvedValue({
      ...s.verification,
      receipts: [rawReceipt],
      snapshot: {
        ok: true,
        center: [1, 2, 3],
        size: 5,
        scene: [{ source: "HUGE-SCENE" }],
        image: placedImage,
      },
    });
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("passed");
    const calls = vi.mocked(s.model.evaluate).mock.calls;
    expect(calls.map((call) => call[1])).toEqual([image, placedImage]);
    const context = JSON.stringify(calls.map((call) => call[0]));
    for (const omitted of [
      image,
      placedImage,
      "RAW-RECEIPT",
      "HUGE-SCENE",
      '"bundle"',
      '"receipts"',
      '"scene"',
    ])
      expect(context).not.toContain(omitted);
    expect(calls[1][0]).toMatchObject({
      verification: {
        geometry: { sceneEntries: 1, classes: { Part: 1 } },
        snapshot: { center: [1, 2, 3], size: 5 },
      },
    });
    expect(
      result.events.find((e) => e.step === "inspect_result")?.data,
    ).toMatchObject({
      receipts: [
        {
          data: {
            marker: "RAW-RECEIPT",
            image: { sha256: expect.any(String) },
          },
        },
      ],
    });
  });

  it.each(["inspect", "place", "discard"] as const)(
    "retains bounded native failure receipts for %s without treating them as successful evidence",
    async (operation) => {
      const s = setup();
      const failure = Object.assign(Error("Native failure"), {
        outcome: "unknown",
        effects: "uncertain",
        haltRequired: true,
        receipts: [
          {
            ...receipt(operation),
            data: {
              ownedPath: "Workspace/Test/Owned",
              image,
              cleanup: "unconfirmed",
            },
          },
        ],
      });
      vi.mocked(s.adapter[operation]).mockRejectedValue(failure);
      const result = await runAssetPipeline(s.input);
      const event = result.events.find((e) => e.step === operation + "_error");
      expect(event?.data).toMatchObject({
        outcome: "unknown",
        effects: "uncertain",
        haltRequired: true,
        receipts: [
          {
            operation,
            data: {
              ownedPath: "Workspace/Test/Owned",
              cleanup: "unconfirmed",
              image: { sha256: expect.any(String), bytes: expect.any(Number) },
            },
          },
        ],
      });
      expect(JSON.stringify(event)).not.toContain(image);
      expect(result.requiresReconciliation).toBe(true);
      expect(result.entries[0].status).toBe("failed");
      expect(result.events.some((e) => e.step === "need_passed")).toBe(false);
      expect(
        s.saved.some((r) =>
          r.events.some((e) => e.step === operation + "_error"),
        ),
      ).toBe(true);
    },
  );

  it.each(["inspect_result", "inspect_error"])(
    "carries reconciliation on persistence failure after native mutation: %s",
    async (step) => {
      const s = setup();
      if (step === "inspect_error")
        vi.mocked(s.adapter.inspect).mockRejectedValue(
          Error("Unknown import outcome"),
        );
      s.input.persist = async (run) => {
        if (run.events.at(-1)?.step === step) throw Error("Disk full");
      };
      await expect(runAssetPipeline(s.input)).rejects.toMatchObject({
        requiresReconciliation: true,
      });
      expect(s.adapter.inspect).toHaveBeenCalledTimes(1);
      expect(s.adapter.discard).not.toHaveBeenCalled();
    },
  );
});
