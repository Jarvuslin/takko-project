// Real saved planner output. Only external inference, Studio and compilation are doubled.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Engine } from "../src/generation/engine";
import { Configuration } from "../src/generation/settings";
import { GenerationStore } from "../src/generation/store";
import {
  inspectPcmWav,
  type StudioAudioEvidence,
} from "../src/generation/audio-evidence";
import type {
  AssetAdapter,
  AssetReceipt,
  AssetVerification,
} from "../src/generation/asset-contract";
import { AssetOperationError } from "../src/generation/asset-contract";
import { loadComponentReviewEvidence } from "../src/generation/component-review";
import type { Project, Spec } from "../src/generation/schema";
import type { OpenCodeBackend } from "../src/generation/opencode-runtime";
import { profile, fixtureReview } from "./generation-fixtures";

export const replayRuns = [
  "opencode-fighting-live-20260924",
  "opencode-minimal-fighting-20260925",
] as const;
export type ReplayRun =
  (typeof replayRuns)[number] | "opencode-step3-live-20260925";
export function savedReplay(run: ReplayRun): Project {
  return JSON.parse(
    fs.readFileSync(`docs/results/${run}/terminal-project.json`, "utf8"),
  );
}
// A scripted model correction, not a rewrite of either saved artifact or production inference.
export function minimalReuseCorrection(spec: Spec): Spec {
  const next = structuredClone(spec);
  next.requirements.push({
    id: "approvedPresentationReuse",
    sourceId: "proposal:theme",
    origin: "user",
    sourceQuote: "",
    category: "presentation",
    priority: "required",
    description:
      "No separate theme system: use the already approved practice dummy appearance, default humanoid avatar and existing plain practice layout. Add no skins, props or gameplay.",
    acceptance:
      "The existing dummy and practice layout supply the approved presentation, with the default avatar and no additional feature.",
  });
  next.tasks
    .find((t) => t.id === "sceneEnvironment")!
    .requirements.push("approvedPresentationReuse");
  return next;
}

function audio(
  studioId: string,
  candidateId: string,
  token: string,
  second: number,
): StudioAudioEvidence {
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
    bytes.writeInt16LE(
      Math.round(Math.sin(i * (0.14 + second / 1000)) * 8000),
      44 + i * 2,
    );
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
      studioId,
      candidateId,
      token,
      processId: 1234,
      processStartedAt: "2026-09-15T12:00:00Z",
      capturedAt: `2026-09-15T13:00:0${second}Z`,
      file: `offline-replay-${second}.wav`,
    },
  };
}
export async function replayPostPlan(
  run: ReplayRun,
  options: {
    correction?: (spec: Spec) => Spec;
    plan?: Spec;
    maxAttempts?: number;
    backend?: OpenCodeBackend;
    transport?: typeof fetch;
    mutateProject?: (p: Project) => void;
    studioFailure?: boolean;
    rejectSavedAsset?: boolean;
    realComponentRejection?: boolean;
  } = {},
) {
  const original = savedReplay(run),
    directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "takko-post-plan-replay-"),
    );
  const store = new GenerationStore(directory),
    config = new Configuration(path.join(directory, "config"));
  const model = {
    ...profile("openrouter"),
    baseUrl: "https://openrouter.ai/api/v1",
    model: "anthropic/claude-sonnet-5",
    maxOutputTokens: 32768,
  };
  config.save({
    profiles: [model],
    routes: {
      planner: [model.id],
      builder: [model.id],
      reviewer: [model.id],
      repair: [model.id],
    },
    budgetMicros: 6000000,
    generationBudgetMicros: 6000000,
    repairLimit: 0,
  });
  config.connect(model, "offline-synthetic-never-sent-to-network");
  const p = structuredClone(original);
  // Rewind only the isolated clone to the approved proposal. Preserve the historical ledger.
  p.spec = null;
  p.artifact = null;
  p.proposalPlan = undefined;
  p.jobId = null;
  p.error = null;
  p.failure = null;
  p.stage = "draft";
  p.assetPipeline = undefined;
  p.completedBuildTasks = [];
  p.executionMode = "opencode";
  options.mutateProject?.(p);
  const effects: string[] = [],
    requests: { phase: string; input: string }[] = [];
  let plannerCalls = 0,
    dispatched = false;
  const png =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
  const receipt = (operation: string): AssetReceipt => ({
    operation,
    at: new Date().toISOString(),
    studioId: p.assetStudioId!,
    data: { offlineDouble: true },
  });
  const adapter: AssetAdapter = {
    identity: "offline-post-plan-studio",
    async search() {
      throw Error(
        "Approved adapter must resolve actual saved choices, not a fabricated search",
      );
    },
    async inspect(need, candidate, token) {
      effects.push("inspect:" + need.id);
      if (options.studioFailure) throw Error("Offline Studio unavailable");
      const rejected = original.assetPipeline?.events.find(
        (e) => e.needId === need.id && e.step === "candidate_rejected",
      );
      if (
        options.rejectSavedAsset &&
        rejected &&
        !options.realComponentRejection
      )
        throw new AssetOperationError(
          String((rejected.data as any).reason),
          [receipt("candidate_rejected")],
          "none",
          "candidate_rejected",
        );
      return {
        candidate,
        token,
        path: `Workspace/Offline/${need.id}`,
        safe: true,
        ...(options.realComponentRejection && rejected
          ? {
              capabilityBlock: {
                kind: "interactive_asset_requires_review" as const,
                reason: "Replay the preserved complete-component review",
              },
            }
          : {}),
        reasons: [],
        snapshot: { offline: true },
        image: png,
        receipts: [receipt("inspect")],
        functional: {
          contentLoaded: true,
          instanceCount: 1,
          scriptCount: 0,
          playbackObserved: true,
        },
        ...(need.kind === "Audio"
          ? { audio: audio(p.assetStudioId!, candidate.id, token, 1) }
          : {}),
      };
    },
    async place(need, inspection): Promise<AssetVerification> {
      effects.push("place:" + need.id);
      const root = `Workspace/${p.scope}/${need.id}`;
      return {
        passed: true,
        reasons: [],
        snapshot: { offline: true },
        image: png,
        receipts: [receipt("place")],
        functional: inspection.functional,
        ...(need.kind === "Audio"
          ? {
              audio: audio(
                p.assetStudioId!,
                inspection.candidate.id,
                inspection.token,
                2,
              ),
            }
          : {}),
        bundle: {
          files: [],
          coverage: [],
          scene: [
            {
              path: root,
              className: need.kind === "Audio" ? "Sound" : "Part",
              properties:
                need.kind === "Audio"
                  ? { SoundId: "rbxassetid://" + inspection.candidate.id }
                  : { Anchored: true },
            },
          ],
          assets: [
            {
              id: need.id,
              kind: need.kind === "Audio" ? "audio" : "mesh",
              requirementId: need.requirementId,
              status: "retrieved",
              assetId: inspection.candidate.id,
              sourceUrl: inspection.candidate.sourceUrl,
              description: "Offline Studio export contract double",
            },
          ],
        },
      };
    },
    async discard(inspection) {
      effects.push("discard:" + inspection.candidate.id);
      return [receipt("discard")];
    },
    async prepareComponentReview(inspection, inputHash) {
      const originalEvent = original.assetPipeline!.events.find(
        (e) =>
          e.needId ===
            original.assetPipeline!.entries.find((e) => e.status === "failed")!
              .needId && e.step === "component_review_call",
      )!;
      const hash = (originalEvent.data as any).packetHash;
      const source = `docs/results/${run}/asset-evidence/${original.id}`;
      const copied = path.join(directory, "evidence-copy");
      fs.cpSync(source, copied, { recursive: true });
      const packet = JSON.parse(
        fs.readFileSync(path.join(copied, hash + ".review.json"), "utf8"),
      );
      const evidence = loadComponentReviewEvidence(
        copied,
        hash,
        packet.binding.inputHash,
      );
      return {
        evidence: { ...evidence, inputHash, token: inspection.token },
        receipts: [receipt("prepare")],
      };
    },
    async adaptComponent() {
      throw Error("Preserved adaptation rejects without mutation");
    },
  };
  const transport: typeof fetch = async (url, init) => {
    const body = JSON.parse(String(init?.body));
    if (body.stream) {
      if (!options.transport)
        throw Error("Unexpected runtime inference in checkpoint replay");
      return options.transport(url, init);
    }
    const phase =
      /PHASE: (\w+)/.exec(body.messages[0].content)?.[1] ?? "unknown";
    const input =
      typeof body.messages[1].content === "string"
        ? body.messages[1].content
        : body.messages[1].content
            .filter((c: any) => c.type === "text")
            .map((c: any) => c.text)
            .join("\n");
    requests.push({ phase, input });
    let value: unknown;
    if (phase === "planner") {
      plannerCalls++;
      const spec = structuredClone(options.plan ?? original.spec!);
      value =
        plannerCalls > 1 && options.correction
          ? options.correction(spec)
          : spec;
    } else if (
      input.includes('"asset-selection"') &&
      options.rejectSavedAsset
    ) {
      value = [...original.assetPipeline!.events]
        .reverse()
        .find((e) => e.step === "decision_result")!.data;
    } else if (
      input.includes('"component-source-review"') &&
      options.realComponentRejection
    ) {
      const context = JSON.parse(input).context;
      const event = original.assetPipeline!.events.find(
        (e) =>
          e.step === "component_review_result" &&
          (e.data as any).packetHash === context.evidence.packetHash,
      )!;
      value = {
        ...(event.data as object),
        inputHash: context.evidence.inputHash,
      };
    } else if (
      input.includes('"component-adaptation"') &&
      options.realComponentRejection
    ) {
      value = [...original.assetPipeline!.events]
        .reverse()
        .find((e) => e.step === "component_adaptation_decision_result")!.data;
    } else if (input.includes('"asset-selection"')) {
      value = {
        action: "reject",
        candidateId: null,
        query: null,
        reason:
          "Offline fixture ends selection after metadata-only evaluation. Audible fit remains unverified.",
      };
    } else if (input.includes('"asset-evaluation"'))
      value = {
        accepted: !input.includes("METADATA ONLY"),
        reason: input.includes("METADATA ONLY")
          ? "Metadata only, audible fit unverified"
          : "Scripted external evaluator, not native evidence",
        visualFit: true,
        functionalFit: true,
        audioFit: !input.includes("METADATA ONLY"),
      };
    else if (phase === "reviewer" && options.backend) {
      const context = JSON.parse(input);
      value = {
        issues: [],
        tests: context.spec.requirements.map((r: any) => ({
          ...fixtureReview.tests[0],
          id: r.id + "Test",
          requirementId: r.id,
        })),
      };
    } else {
      effects.push("unexpected-call:" + phase + ":" + input.slice(0, 700));
      throw Error("Unexpected external call in replay: " + phase);
    }
    return Response.json({
      choices: [
        { finish_reason: "stop", message: { content: JSON.stringify(value) } },
      ],
      usage: { prompt_tokens: 100, completion_tokens: 100, cost: 0 },
    });
  };
  const backend: OpenCodeBackend = options.backend ?? {
    preflight() {},
    async run(job) {
      dispatched = true;
      effects.push("opencode:manifest");
      const tool = job.tools.find((t) => t.name === "manifest")!;
      await tool.execute(tool.schema.parse({}));
      throw Error("OFFLINE_DISPATCH_CHECKPOINT");
    },
  };
  const engine = new Engine(
    store,
    config,
    transport,
    async () => [],
    async () => ({
      adapter,
      close: async () => {
        effects.push("adapter:close");
      },
    }),
    {
      opencode: backend,
      // These saved runs exercise the retained multi-worker planning path.
      directBuild: false,
      maxAttempts: options.maxAttempts ?? 2,
      allowFallbacks: false,
    },
  );
  store.save(p);
  try {
    engine.approveProposal(p.id, p.revision, p.proposal!.hash);
    await engine.wait(p.id);
  } catch (error) {
    effects.push("admission:" + String(error));
  }
  const result = store.get(p.id);
  return {
    directory,
    original,
    project: result,
    effects,
    requests,
    plannerCalls,
    dispatched,
    dispose() {
      const absolute = path.resolve(directory);
      if (
        !absolute.startsWith(path.resolve(os.tmpdir()) + path.sep) ||
        !path.basename(absolute).startsWith("takko-post-plan-replay-")
      )
        throw Error("Unsafe replay cleanup");
      fs.rmSync(absolute, { recursive: true, force: true });
    },
  };
}
