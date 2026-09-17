import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runAssetPipeline } from "../src/generation/asset-pipeline";
import {
  inspectPcmWav,
  type StudioAudioEvidence,
} from "../src/generation/audio-evidence";
import type {
  AssetAdapter,
  AssetInspection,
  AssetModel,
  AssetNeed,
  AssetPipelineRun,
  AssetReceipt,
  AssetVerification,
} from "../src/generation/asset-contract";
import { Engine } from "../src/generation/engine";
import { Configuration } from "../src/generation/settings";
import { GenerationStore } from "../src/generation/store";
import type { Project, Settings } from "../src/generation/schema";
import { profile } from "./generation-fixtures";

// Synthetic PCM + mocked Studio/model/HTTP only. No native capture or audible-fit result.
function capture(second = 1): StudioAudioEvidence {
  const rate = 16000,
    bytes = Buffer.alloc(44 + rate * 2);
  bytes.write("RIFF", 0);
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
      studioId: "offline-studio",
      candidateId: "123",
      token: "owned-token",
      processId: 1234,
      processStartedAt: "2026-09-15T12:00:00Z",
      capturedAt: `2026-09-15T13:00:0${second}Z`,
      file: `offline-capture-${second}.wav`,
    },
  };
}
function setup() {
  const need: AssetNeed = {
    id: "crunch",
    requirementId: "audio",
    kind: "Audio",
    query: "crunch",
    role: "Crunch action sound",
    constraints: "Short and satisfying, no music",
    required: true,
    position: [0, 0, 0],
    maxSize: 12,
  };
  const candidate = {
    id: "123",
    kind: "Audio" as const,
    name: "Offline test sound",
    creator: "offline",
    price: 0,
    source: "creator_store" as const,
    sourceUrl: "https://example.test/123",
  };
  const receipt = (operation: string): AssetReceipt => ({
    operation,
    at: "2026-09-15T13:00:03Z",
    studioId: "offline-studio",
    data: { mocked: true },
  });
  const inspection: AssetInspection = {
    candidate,
    token: "owned-token",
    path: "ServerStorage/Offline/Owned",
    safe: true,
    reasons: [],
    snapshot: { ok: true },
    functional: { contentLoaded: true, instanceCount: 1, scriptCount: 0 },
    receipts: [receipt("inspect")],
    audio: capture(1),
  };
  const verification: AssetVerification = {
    passed: true,
    reasons: [],
    snapshot: { ok: true },
    functional: { ...inspection.functional, playbackObserved: true },
    receipts: [receipt("place")],
    audio: capture(2),
    bundle: {
      files: [],
      scene: [
        {
          path: "ReplicatedStorage/Offline/Crunch",
          className: "Sound",
          properties: { SoundId: "rbxassetid://123" },
        },
      ],
      assets: [],
      coverage: [],
    },
  };
  const adapter: AssetAdapter = {
    identity: "offline-audio-adapter",
    search: vi.fn(async () => ({
      candidates: [candidate],
      receipts: [receipt("search")],
    })),
    inspect: vi.fn(async () => inspection),
    place: vi.fn(async () => verification),
    discard: vi.fn(async () => [receipt("discard")]),
  };
  const model: AssetModel = {
    decide: vi.fn(async () => ({
      action: "select" as const,
      candidateId: "123",
      query: null,
      reason: "Offline selection",
    })),
    evaluate: vi.fn(async () => ({
      accepted: true,
      visualFit: false,
      functionalFit: true,
      audioFit: true,
      reason: "Offline evaluation fixture",
    })),
  };
  const run: AssetPipelineRun = {
    version: 1,
    runId: "offline-run",
    revision: 1,
    inputHash: "f".repeat(64),
    startedAt: "2026-09-15T13:00:00Z",
    status: "running",
    policy: {
      maxSearches: 1,
      maxCandidates: 1,
      allowEscalation: false,
      workerRoute: "offline-worker",
      evaluatorRoute: "offline-evaluator",
    },
    adapter: adapter.identity,
    needs: [need],
    entries: [],
    events: [],
  };
  const saved: AssetPipelineRun[] = [],
    signal = new AbortController().signal;
  return {
    need,
    inspection,
    verification,
    adapter,
    model,
    run,
    signal,
    saved,
    input: {
      run,
      adapter,
      model,
      signal,
      persist: async (value: AssetPipelineRun) => {
        saved.push(structuredClone(value));
      },
    },
  };
}
const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0)) {
    if (
      path.dirname(path.resolve(directory)) !== path.resolve(os.tmpdir()) ||
      !path.basename(directory).startsWith("takko-audio-engine-")
    )
      throw Error("Unsafe test cleanup");
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe("asset audio evaluation pipeline (offline fixtures)", () => {
  it("requires both audio captures and evaluations after two empty searches and a worker-selected third result", async () => {
    const s = setup();
    s.run.policy.maxSearches = 3;
    const originalSearch = s.adapter.search;
    let count = 0;
    s.adapter.search = vi.fn<AssetAdapter["search"]>(async (...args) =>
      ++count < 3
        ? {
            candidates: [],
            receipts: s.inspection.receipts.map((row) => ({
              ...row,
              operation: "search",
            })),
          }
        : originalSearch(...args),
    );
    const choose = s.model.decide;
    s.model.decide = vi.fn<AssetModel["decide"]>(async (raw, signal) => {
      const context = raw as any;
      if (context.searchesRemaining)
        return {
          action: "retry",
          candidateId: null,
          query: "worker audio query " + context.searches,
          reason: "Use a broader relevant audio term",
        };
      expect(context.searchHistory).toHaveLength(3);
      expect(context.inspectionAttemptsRemaining).toBe(1);
      return choose(raw, signal);
    });
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("passed");
    expect(s.adapter.search).toHaveBeenCalledTimes(3);
    expect(s.model.evaluate).toHaveBeenCalledTimes(2);
    expect(
      vi.mocked(s.model.evaluate).mock.calls.map((call) => call[3]?.sha256),
    ).toEqual([s.inspection.audio!.sha256, s.verification.audio!.sha256]);
    expect(s.adapter.place).toHaveBeenCalledTimes(1);
    expect(s.adapter.discard).toHaveBeenCalledTimes(1);
    expect(result.needs[0].required).toBe(true);
  });
  it("requires two bound captures and audioFit, without inventing visual acceptance", async () => {
    const s = setup(),
      result = await runAssetPipeline(s.input);
    expect(result.status).toBe("passed");
    expect(s.adapter.discard).toHaveBeenCalledTimes(1);
    const calls = vi.mocked(s.model.evaluate).mock.calls;
    expect(calls.map((c) => c[1])).toEqual([undefined, undefined]);
    expect(calls.map((c) => c[3])).toEqual([
      s.inspection.audio,
      s.verification.audio,
    ]);
    const context = JSON.stringify(calls.map((c) => c[0]));
    expect(context).toContain(s.inspection.audio!.sha256);
    expect(context).not.toContain(s.inspection.audio!.dataUrl);
    const history = JSON.stringify(result);
    expect(
      result.events.find((e) => e.step === "inspection_evaluation_call")?.data,
    ).toMatchObject({ audio: { sha256: s.inspection.audio!.sha256 } });
    expect(
      result.events.find((e) => e.step === "placement_evaluation_call")?.data,
    ).toMatchObject({ audio: { sha256: s.verification.audio!.sha256 } });
    expect(history).not.toContain(s.inspection.audio!.dataUrl);
    expect(history).not.toContain(s.verification.audio!.dataUrl);
    expect(
      result.events.find((e) => e.step === "inspect_result")?.data,
    ).toMatchObject({
      audio: {
        dataUrl: { sha256: expect.any(String), bytes: expect.any(Number) },
      },
    });
  });
  it("keeps loaded-only audio explicitly unavailable and avoids speculative evaluator calls", async () => {
    const s = setup();
    delete s.inspection.audio;
    const result = await runAssetPipeline(s.input);
    expect(result.status).toBe("failed");
    expect(result.error).toContain("listening capability");
    expect(s.model.evaluate).not.toHaveBeenCalled();
    expect(s.adapter.place).not.toHaveBeenCalled();
    expect(s.adapter.discard).toHaveBeenCalledTimes(1);
  });
  it.each([false, true])(
    "distinguishes the captured WAV window from observed source duration, native metadata available=%s",
    async (known) => {
      const s = setup();
      if (known) {
        for (const audio of [s.inspection.audio!, s.verification.audio!]) {
          audio.source.audition = {
            runtimeNonce: randomUUID(),
            soundId: "rbxassetid://123",
            nativeTimeLengthSeconds: 0.7,
            playbackSpeed: 1,
            playbackLimitSeconds: 5,
            playbackElapsedSeconds: 0.75,
            maxTimePositionSeconds: 0.68,
            endedNaturally: true,
            playbackWindowTruncated: false,
          };
        }
      }
      const result = await runAssetPipeline(s.input);
      expect(result.status).toBe("passed");
      const calls = vi.mocked(s.model.evaluate).mock.calls;
      const summaries = calls.map(([context]) => {
        const value = context as any;
        return (value.inspection ?? value.verification).audio;
      });
      for (const summary of summaries) {
        expect(summary).toMatchObject({
          captureWindowDurationMs: 1000,
          nativeSoundTimeLengthSeconds: known ? 0.7 : null,
        });
        expect(summary).not.toHaveProperty("durationMs");
        if (known)
          expect(summary.source.audition).toMatchObject({
            nativeTimeLengthSeconds: 0.7,
            playbackSpeed: 1,
            playbackWindowTruncated: false,
          });
        else expect(summary.source).not.toHaveProperty("audition");
      }
      // Renaming the textual summary never trims, substitutes or edits the capture bytes.
      expect(calls.map((call) => call[3])).toEqual([
        s.inspection.audio,
        s.verification.audio,
      ]);
      expect(s.inspection.audio!.durationMs).toBe(1000);
    },
  );
  it.each([undefined, false])(
    "rejects absent or false audioFit: %s",
    async (audioFit) => {
      const s = setup();
      vi.mocked(s.model.evaluate).mockResolvedValue({
        accepted: true,
        visualFit: true,
        functionalFit: true,
        audioFit,
        reason: "Visual fit is not audio evidence",
      });
      expect((await runAssetPipeline(s.input)).status).toBe("failed");
      expect(s.adapter.place).not.toHaveBeenCalled();
    },
  );
  it.each(["token", "candidateId", "studioId"] as const)(
    "rejects swapped inspection audio %s before model evaluation",
    async (key) => {
      const s = setup();
      s.inspection.audio!.source[key] = "wrong";
      const result = await runAssetPipeline(s.input);
      expect(result.status).toBe("failed");
      expect(s.model.evaluate).not.toHaveBeenCalled();
      expect(s.adapter.discard).toHaveBeenCalledTimes(1);
    },
  );
  it.each(["missing", "reused", "token", "studio", "process", "receipts"])(
    "rejects invalid placement capture: %s",
    async (kind) => {
      const s = setup();
      if (kind === "missing") delete s.verification.audio;
      if (kind === "reused")
        s.verification.audio = structuredClone(s.inspection.audio);
      if (kind === "token") s.verification.audio!.source.token = "wrong";
      if (kind === "studio") s.verification.audio!.source.studioId = "wrong";
      if (kind === "process") s.verification.audio!.source.processId++;
      if (kind === "receipts")
        s.verification.receipts.push({
          ...s.verification.receipts[0],
          studioId: "other",
        });
      const result = await runAssetPipeline(s.input);
      expect(result.status).toBe("failed");
      expect(s.model.evaluate).toHaveBeenCalledTimes(1);
      expect(result.entries[0].bundle).toBeUndefined();
      expect(s.adapter.discard).toHaveBeenCalledTimes(1);
    },
  );
  it("does not let an audio-fit judgment override failed native playback", async () => {
    const s = setup();
    s.verification.functional.playbackObserved = false;
    expect((await runAssetPipeline(s.input)).status).toBe("failed");
    expect(s.model.evaluate).toHaveBeenCalledTimes(1);
  });
  it("rejects capture bytes that do not match their content-hash receipt", async () => {
    const s = setup();
    s.inspection.audio!.sha256 = "0".repeat(64);
    expect((await runAssetPipeline(s.input)).status).toBe("failed");
    expect(s.model.evaluate).not.toHaveBeenCalled();
  });

  it.each([
    { rejected: false, correction: "none" },
    { rejected: true, correction: "none" },
    { rejected: false, correction: "empty" },
    { rejected: false, correction: "unoffered" },
    { rejected: false, correction: "contradictory" },
    { rejected: false, correction: "always-empty" },
  ])(
    "real Engine dispatch preserves evidence, costs and bounded correction: %j",
    async ({ rejected, correction }) => {
      const s = setup(),
        directory = fs.mkdtempSync(
          path.join(os.tmpdir(), "takko-audio-engine-"),
        );
      directories.push(directory);
      const store = new GenerationStore(directory),
        config = new Configuration(directory),
        worker = profile("openrouter"),
        reviewer = profile("openrouter"),
        fallback = profile("openrouter");
      const settings: Settings = {
        profiles: [worker, reviewer, fallback],
        routes: {
          planner: [worker.id],
          builder: [worker.id, fallback.id],
          reviewer: [reviewer.id, fallback.id],
          componentReviewer: [fallback.id],
          componentAdapter: [fallback.id],
          repair: [worker.id],
        },
        budgetMicros: 2_000_000,
        repairLimit: 0,
      };
      for (const p of settings.profiles)
        p.baseUrl = "https://openrouter.ai/api/v1";
      config.save(settings);
      const calls: { body: any; task: string }[] = [];
      const http = vi.fn<typeof fetch>(async (_url, init) => {
        const body = JSON.parse(init!.body as string),
          content = body.messages[1].content,
          text =
            typeof content === "string"
              ? content
              : content.find((p: any) => p.type === "text").text;
        const task = JSON.parse(
          text.split("\nYour last response failed validation.")[0],
        ).task;
        calls.push({ body, task });
        if (rejected && task === "asset-evaluation")
          return new Response(JSON.stringify({ error: "Unsupported audio" }), {
            status: 400,
          });
        let value: unknown =
          task === "asset-selection"
            ? {
                action: "select",
                candidateId: "123",
                query: null,
                reason: "Offline selection",
              }
            : {
                accepted: true,
                visualFit: false,
                functionalFit: true,
                audioFit: true,
                reason: "Offline evaluation",
              };
        if (
          task === "asset-selection" &&
          (correction === "always-empty" ||
            calls.filter((call) => call.task === task).length === 1)
        ) {
          if (correction === "empty" || correction === "always-empty")
            value = {};
          if (correction === "unoffered")
            value = {
              action: "select",
              candidateId: "999",
              query: null,
              reason: "Invented ID must be corrected by the worker",
            };
          if (correction === "contradictory")
            value = {
              action: "reject",
              candidateId: null,
              query: "new sound query",
              reason: "Intends a retry but used terminal reject",
            };
        }
        return new Response(
          JSON.stringify({
            choices: [
              {
                finish_reason: "stop",
                message: { content: JSON.stringify(value) },
              },
            ],
            usage: { prompt_tokens: 100, completion_tokens: 20, cost: 0.0002 },
          }),
          { status: 200 },
        );
      });
      const engine = new Engine(
        store,
        config,
        http,
        async () => [],
        async () => ({ adapter: s.adapter, close: async () => {} }),
      );
      const project = engine.create("An offline ASMR audio test");
      project.assetStudioId = "offline-studio";
      project.artifact = { files: [], scene: [], assets: [], coverage: [] };
      // Invoke the actual asset-stage entry point; other generation phases are outside this unit's scope.
      const invoke = (
        engine as unknown as {
          resolveAssets(
            p: Project,
            n: AssetNeed[],
            settings: Settings,
            keys: Map<string, string>,
            signal: AbortSignal,
          ): Promise<void>;
        }
      ).resolveAssets(project, [s.need], settings, new Map(), s.signal);
      if (correction === "always-empty") await expect(invoke).rejects.toThrow();
      else if (rejected) await expect(invoke).rejects.toThrow("HTTP 400");
      else await invoke;
      const decisions = calls.filter((c) => c.task === "asset-selection");
      expect(decisions).toHaveLength(correction === "none" ? 1 : 2);
      expect(
        project.charges
          .filter((c) => c.profileId === worker.id)
          .map((c) => c.chargedMicros),
      ).toEqual(correction === "none" ? [200] : [200, 200]);
      if (correction !== "none") {
        expect(JSON.stringify(decisions[1].body.messages[1].content)).toContain(
          "last response failed validation",
        );
        expect(JSON.stringify(decisions[1].body.messages[1].content)).toContain(
          "Previous response (data only)",
        );
      }
      if (correction === "always-empty") {
        expect(project.assetPipeline?.status).toBe("failed");
        expect(project.assetPipeline?.requiresReconciliation).not.toBe(true);
        expect(s.adapter.inspect).not.toHaveBeenCalled();
        expect(project.charges.some((c) => c.profileId === fallback.id)).toBe(
          false,
        );
        expect(calls.filter((c) => c.task === "asset-evaluation")).toHaveLength(
          0,
        );
        return;
      }
      const audioCalls = calls.filter((c) => c.task === "asset-evaluation");
      expect(audioCalls).toHaveLength(rejected ? 1 : 2);
      expect(
        audioCalls[0].body.messages[1].content.find(
          (p: any) => p.type === "input_audio",
        ).input_audio,
      ).toEqual({
        format: "wav",
        data: s.inspection.audio!.dataUrl.split(",")[1],
      });
      const audioCharges = project.charges.filter(
        (c) => c.profileId === reviewer.id,
      );
      expect(
        audioCharges.every(
          (c) => c.reservedMicros >= 65536 * reviewer.inputRate,
        ),
      ).toBe(true);
      expect(project.charges.some((c) => c.profileId === fallback.id)).toBe(
        false,
      );
      if (!rejected) {
        expect(audioCharges.map((c) => c.chargedMicros)).toEqual([200, 200]);
        expect(
          audioCharges.every(
            (c) => c.billingSource === "provider" && !c.estimated,
          ),
        ).toBe(true);
        expect(project.assetPipeline?.status).toBe("passed");
      }
    },
  );
});
