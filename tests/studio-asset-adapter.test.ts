import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  StudioAssetAdapter,
  StudioAssetError,
  type StudioAssetClient,
} from "../src/generation/studio-asset-adapter";
import type { AssetNeed } from "../src/generation/asset-contract";
import type { Bundle } from "../src/generation/schema";
import {
  expectedAdaptedInventory,
  loadComponentAdaptationChain,
  type ComponentAdaptation,
} from "../src/generation/component-adaptation";
import {
  inspectPcmWav,
  AudioCandidateEvidenceError,
  type StudioAudioCapture,
  type StudioAudioEvidence,
} from "../src/generation/audio-evidence";

const signal = () => new AbortController().signal;
const png =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jfusAAAAASUVORK5CYII=";
const need: AssetNeed = {
  id: "board",
  requirementId: "assets",
  role: "Cutting board",
  kind: "Model",
  query: "wood board",
  constraints: "Coherent kitchen scale",
  required: true,
  position: [2, 3, 4],
  maxSize: 12,
};
const row = {
  assetId: "123",
  assetType: "Model",
  source: "creator_store",
  isFree: true,
  priceCents: 0,
  creatorName: "FixtureCreator",
  name: "Board",
  creatorStoreUrl: "https://create.roblox.com/store/asset/123",
};
const imageNeed: AssetNeed = {
  ...need,
  kind: "Image",
  role: "Butter label",
  query: "butter label",
};
function imageScene(): Bundle["scene"] {
  return [
    {
      path: "Workspace/TestScope/Assets/board",
      className: "Part",
      properties: {
        Anchored: true,
        Size: { type: "Vector3", value: [12, 12, 0.05] },
        CFrame: { type: "CFrame", value: [2, 3, 4, 1, 0, 0, 0, 1, 0, 0, 0, 1] },
      },
    },
    {
      path: "Workspace/TestScope/Assets/board/Decal_1",
      className: "Decal",
      properties: {
        Texture: "rbxassetid://456",
        Face: { type: "Enum", enum: "NormalId", value: 2 },
        Color3: { type: "Color3", value: [0.9, 0.8, 0.7] },
        Transparency: 0.1,
        ZIndex: 2,
        AutoLocalize: true,
      },
    },
  ];
}
function imageSetup() {
  const f = setup();
  f.client.rows = [{ ...row, assetType: "Image", name: "Butter label" }];
  f.client.overrides.place = { scene: imageScene() };
  return f;
}
const envelope = (value: unknown) => ({
  content: [{ type: "text", text: JSON.stringify(value) }],
  isError: false,
});
const directories: string[] = [];
function temporary() {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "takko-asset-adapter-"),
  );
  directories.push(directory);
  return directory;
}
afterEach(() => {
  for (const directory of directories.splice(0)) {
    if (
      path.dirname(path.resolve(directory)) !== path.resolve(os.tmpdir()) ||
      !path.basename(directory).startsWith("takko-asset-adapter-")
    )
      throw Error("Unexpected cleanup target");
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

class FakeClient implements StudioAssetClient {
  calls: { name: string; args: Record<string, any> }[] = [];
  state: unknown = { playState: "Edit", availableDatamodelTypes: ["Edit"] };
  connected = true;
  rows: unknown[] = [row];
  screenshot = true;
  insertError = false;
  overrides: Record<string, any> = {};
  componentData = "";
  async callTool(name: string, args: Record<string, any>) {
    this.calls.push({ name, args });
    if (name === "list_roblox_studios")
      return envelope({
        studios: this.connected
          ? [{ id: "studio-one", name: "Isolated test fixture" }]
          : [],
      });
    if (name === "get_studio_state")
      return typeof this.state === "string"
        ? { content: [{ type: "text", text: this.state }], isError: false }
        : envelope(this.state);
    if (name === "start_stop_play") {
      if (this.overrides[args.is_start ? "runtime_start" : "runtime_stop"])
        throw Error("uncertain runtime transition");
      this.state = args.is_start
        ? { playState: "Play", availableDatamodelTypes: ["Client", "Server"] }
        : { playState: "Edit", availableDatamodelTypes: ["Edit"] };
      return envelope({ ok: true });
    }
    if (name === "search_asset")
      return envelope({ scope: "creator_store", results: this.rows });
    if (name === "insert_asset") {
      if (this.insertError)
        throw Object.assign(Error("timed out after dispatch"), {
          outcome: "unknown",
        });
      return envelope({
        path: "Workspace.Unauthorized",
        code: "return 'untrusted returned code'",
        inserted: true,
      });
    }
    if (name === "screen_capture")
      return this.screenshot
        ? { content: [{ type: "image", mimeType: "image/png", data: png }] }
        : envelope({ screenshotPath: "missing.png" });
    if (name === "execute_luau") {
      if (args.code.includes('"takko_audio_runtime_v1"')) {
        const operation = /return reply\("([a-z]+)"/.exec(args.code)?.[1];
        const nonce = /local NONCE="([^"]+)"/.exec(args.code)?.[1];
        const override =
          this.overrides["runtime_" + operation] ??
          (operation === "playback"
            ? this.overrides.audio_playback
            : undefined);
        if (override?.isError) return override;
        return envelope({
          marker: "takko_audio_runtime_v1",
          operation,
          nonce,
          ok: true,
          playbackObserved: true,
          soundId: "rbxassetid://123",
          nativeTimeLengthSeconds: 0.65,
          playbackSpeed: 1,
          playbackLimitSeconds: 5,
          playbackElapsedSeconds: 0.66,
          maxTimePositionSeconds: 0.63,
          endedNaturally: true,
          playbackWindowTruncated: false,
          ...override,
        });
      }
      const operation =
        /return reply\("(prepare|inspect|preview|place|discard|audio_playback|component_chunk|component_restrict|component_adapt)"/.exec(
          args.code,
        )?.[1];
      if (!operation) throw Error("Unknown fixed template");
      if (this.overrides[operation]?.isError) return this.overrides[operation];
      const common = {
        marker: "takko_asset_v1",
        operation,
        ok: true,
        reasons: [],
      };
      let value: Record<string, unknown> = common;
      if (operation === "component_chunk") {
        const offset = Number(/offset=(\d+),chunk/.exec(args.code)?.[1]);
        value = {
          ...common,
          offset,
          chunk: this.componentData.slice(offset, offset + 32768),
        };
      }
      if (operation === "audio_playback")
        value = {
          ...common,
          functional: {
            contentLoaded: true,
            instanceCount: 1,
            scriptCount: 0,
            playbackObserved: true,
          },
        };
      if (operation === "inspect")
        value = {
          ...common,
          functional: { contentLoaded: true, instanceCount: 2, scriptCount: 0 },
          center: [0, 0, 0],
          size: 4,
        };
      if (operation === "preview")
        value = { ...common, center: [0, 1000, 0], size: 4 };
      if (operation === "place")
        value = {
          ...common,
          functional: { contentLoaded: true, instanceCount: 2, scriptCount: 0 },
          center: [2, 3, 4],
          size: 4,
          scene: [
            {
              path: "Workspace/TestScope/Assets/board",
              className: "Model",
              properties: {},
            },
            {
              path: "Workspace/TestScope/Assets/board/Part_1",
              className: "Part",
              properties: {
                Anchored: true,
                Size: { type: "Vector3", value: [4, 1, 3] },
                CFrame: {
                  type: "CFrame",
                  value: [2, 3, 4, 1, 0, 0, 0, 1, 0, 0, 0, 1],
                },
              },
            },
          ],
        };
      return envelope({ ...value, ...this.overrides[operation] });
    }
    throw Error("Unexpected tool " + name);
  }
}
function setup(evidenceDirectory?: string, audioCapture?: StudioAudioCapture) {
  const client = new FakeClient();
  return {
    client,
    adapter: new StudioAssetAdapter(client, {
      studioId: "studio-one",
      scope: "TestScope",
      evidenceDirectory,
      audioCapture,
    }),
  };
}
async function inspect(f = setup(), input = need) {
  const result = await f.adapter.search(input, input.query, signal());
  const inspection = await f.adapter.inspect(
    input,
    result.candidates[0],
    "run:board:1",
    signal(),
  );
  return { ...f, inspection };
}
function audioEvidence(binding: {
  studioId: string;
  candidateId: string;
  token: string;
}): StudioAudioEvidence {
  const rate = 8000,
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
  for (let i = 2400; i < rate; i++)
    bytes.writeInt16LE(Math.round(Math.sin(i * 0.1) * 6000), 44 + i * 2);
  const wav = inspectPcmWav(bytes);
  return {
    dataUrl: "data:audio/wav;base64," + bytes.toString("base64"),
    sha256: wav.sha256,
    durationMs: wav.durationMs,
    sampleRate: rate,
    channels: 1,
    rms: wav.rms,
    peak: wav.peak,
    source: {
      ...binding,
      kind: "studio_process_loopback",
      mode: "include_process_tree",
      processId: 42,
      processStartedAt: "2026-09-15T12:00:00Z",
      capturedAt: new Date().toISOString(),
      file: "offline-capture.wav",
    },
  };
}
function audioSetup(capture?: StudioAudioCapture) {
  if (capture)
    capture.bindStudio = async () => ({
      pid: 42,
      startedAt: "2026-09-15T12:00:00Z",
      executable: "fixture",
    });
  const f = setup(undefined, capture);
  f.client.rows = [{ ...row, assetType: "Audio" }];
  f.client.overrides.inspect = {
    functional: { contentLoaded: true, instanceCount: 1, scriptCount: 0 },
  };
  f.client.overrides.place = {
    functional: { contentLoaded: true, instanceCount: 1, scriptCount: 0 },
    scene: [
      {
        path: "Workspace/TestScope/Assets/board",
        className: "Sound",
        properties: {
          SoundId: "rbxassetid://123",
          Volume: 0.65,
          PlaybackSpeed: 1,
          Looped: false,
          Playing: false,
          PlayOnRemove: false,
        },
      },
    ],
  };
  return f;
}

describe("official Studio asset adapter (isolated mocked transport)", () => {
  it("accepts schema-reordered candidate fields but rejects changes to sourced metadata before import", async () => {
    const f = setup();
    f.client.rows = [{ ...row, description: "Existing reusable component" }];
    const { candidates } = await f.adapter.search(need, need.query, signal());
    const original = candidates[0];
    // Zod reconstructs candidates in schema order; description moves ahead of kind.
    const reordered = {
      id: original.id,
      name: original.name,
      description: original.description,
      kind: original.kind,
      creator: original.creator,
      sourceUrl: original.sourceUrl,
      price: original.price,
      source: original.source,
    };
    expect(JSON.stringify(reordered)).not.toBe(JSON.stringify(original));
    const inspection = await f.adapter.inspect(
      need,
      reordered,
      "reordered",
      signal(),
    );
    expect(inspection.safe).toBe(true);
    await f.adapter.discard(inspection, signal());
    for (const delta of [
      { id: "456" },
      { name: "Forged name" },
      { description: "Forged behavior" },
      { creator: "Forged creator" },
      { sourceUrl: "https://example.invalid" },
      { price: 1 },
      { extra: "untrusted" },
    ]) {
      const count = f.client.calls.length;
      await expect(
        f.adapter.inspect(
          need,
          { ...reordered, ...delta },
          "tampered",
          signal(),
        ),
      ).rejects.toThrow("scoped search");
      expect(f.client.calls).toHaveLength(count);
    }
  });
  it("retains twenty public candidates and bounded descriptions without inventing metadata", async () => {
    const f = setup();
    f.client.rows = Array.from({ length: 25 }, (_, index) => ({
      ...row,
      assetId: String(1000 + index),
      creatorStoreUrl:
        "https://create.roblox.com/store/asset/" + (1000 + index),
      description: "x".repeat(1200),
    }));
    const result = await f.adapter.search(need, need.query, signal());
    expect(result.candidates).toHaveLength(20);
    expect(result.candidates[0].description).toBe("x".repeat(1000));
    expect(
      f.client.calls.find((c) => c.name === "search_asset")!.args.maxResults,
    ).toBe(20);
  });
  it.each([
    "short",
    "large",
    "corrupt",
    "read-failure",
    "restrict",
    "restrict-original-corrupt",
    "restrict-uncertain",
    "restrict-read-failure",
    "restrict-round-trip-failure",
    "restrict-adapt",
    "restrict-adapt-forged",
    "restrict-adapt-uncertain",
    "restrict-adapt-read-failure",
    "restrict-adapt-changed-source",
    "restrict-adapt-two-hop",
    "restrict-adapt-second-negative",
    "restrict-adapt-second-uncertain",
    "restrict-adapt-second-read-failure",
  ])(
    "transfers capability evidence (%s) without preview or runtime, and cleans failed reads",
    async (mode) => {
      const f = setup(temporary()),
        source =
          "local sound = Instance.new('Sound')\nerror('must never execute')";
      f.client.overrides.inspect = {
        ok: false,
        reasons: ["Embedded code requires review"],
        functional: { contentLoaded: false, instanceCount: 2, scriptCount: 1 },
        capabilityBlock: {
          kind: "interactive_asset_requires_review",
          reason: "Embedded code requires bounded review",
        },
        inertAudit: {
          mode: "inert_quarantine_static_inspection",
          sourceOrigin: "ScriptEditorService:GetEditorSource",
          dependencyAnalysis: "lexical_literals_only_not_execution_proof",
          executed: false,
          instanceLimit: 300,
          sourceLimit: 8,
          sourceByteLimit: 65536,
          instanceListTruncated: false,
          sourceListTruncated: false,
          sourceBytesReturned: Buffer.byteLength(source),
          nodes: [
            {
              index: 1,
              parentIndex: 0,
              name: "OriginalModel",
              nameTruncated: false,
              className: "Model",
            },
            {
              index: 2,
              parentIndex: 1,
              name: "OriginalScript",
              nameTruncated: false,
              className: "Script",
            },
          ],
          sources: [
            {
              index: 2,
              className: "Script",
              readable: true,
              source,
              sourceBytes: Buffer.byteLength(source),
              sourceOmittedForLimit: false,
              disabled: false,
              runContext: "Enum.RunContext.Legacy",
              literalDependencies: [
                { kind: "constructed_class", value: "Sound" },
              ],
              dependencyListTruncated: false,
            },
          ],
        },
      };
      // Envelope-only fixture. It exercises transfer/receipt bounds, not RBXM parsing.
      const binary = Buffer.concat([
        Buffer.from("<roblox!\x89\xff\r\n\x1a\n", "latin1"),
        Buffer.alloc(1_048_576),
      ]);
      const archive =
        mode === "large" || mode.startsWith("restrict")
          ? {
              status: "captured",
              format: "roblox-native-rbxm-v1",
              engineVersion: "offline-fixture",
              base64: binary.toString("base64"),
              bytes: binary.length,
              nodes: [
                {
                  index: 1,
                  parentIndex: 0,
                  name: "OriginalModel",
                  className: "Model",
                },
                {
                  index: 2,
                  parentIndex: 1,
                  name: "OriginalScript",
                  className: "Script",
                },
              ],
              sources: [
                {
                  index: 2,
                  className: "Script",
                  source,
                  sourceBytes: Buffer.byteLength(source),
                  disabled: false,
                },
              ],
              sourceBytes: Buffer.byteLength(source),
              executed: false,
              roundTrip: {
                passed: false,
                stage: "deserialize",
                reason: "Offline capability failure",
              },
            }
          : {
              status: "unavailable",
              reason: "Offline restoration capability fixture",
            };
      if (mode.startsWith("restrict-adapt") && archive.status === "captured") {
        archive.nodes!.push({
          index: 3,
          parentIndex: 1,
          name: "RetainedPart",
          className: "Part",
        });
      }
      const payload = JSON.stringify({
        inertAudit: f.client.overrides.inspect.inertAudit,
        componentArchive: archive,
      });
      f.client.componentData = Buffer.from(payload).toString("base64");
      f.client.overrides.inspect.componentTransfer = {
        encodedBytes: f.client.componentData.length,
        jsonBytes: Buffer.byteLength(payload),
        chunkSize: 32768,
        sha256: createHash("sha256")
          .update(f.client.componentData)
          .digest("hex"),
      };
      delete f.client.overrides.inspect.inertAudit;
      if (mode === "corrupt")
        f.client.componentData = "A" + f.client.componentData.slice(1);
      if (mode === "read-failure")
        f.client.overrides.component_chunk = { isError: true };
      if (mode === "corrupt" || mode === "read-failure") {
        const error = await inspect(f).then(
          () => null,
          (e) => e,
        );
        expect(error).toBeInstanceOf(StudioAssetError);
        expect(error.effects).toBe("none");
        expect(
          error.receipts.find((r: any) => r.operation === "component_transfer")
            .data,
        ).toMatchObject({ verified: false, readOnly: true });
        expect(
          error.receipts.some((r: any) => r.operation === "cleanup_deferred"),
        ).toBe(false);
        expect(
          f.client.calls.some(
            (c) =>
              c.name === "execute_luau" &&
              c.args.code.includes('return reply("discard"'),
          ),
        ).toBe(true);
        return;
      }
      const result = await inspect(f);
      expect(result.inspection.receipts.length).toBeLessThan(100);
      const transfers = result.inspection.receipts.filter(
        (r) => r.operation === "component_transfer",
      );
      expect(transfers).toHaveLength(1);
      expect(transfers[0].data).toMatchObject({
        verified: true,
        readOnly: true,
      });
      expect(
        f.client.calls.filter((c) => c.name === "get_studio_state").length,
      ).toBeLessThan(6);
      if (mode === "large")
        expect((transfers[0].data as any).chunksRead).toBeGreaterThan(40);
      const receipt = result.inspection.receipts.find(
        (r) => r.operation === "inert_asset_audit",
      )!.data as any;
      const bytes = fs.readFileSync(receipt.auditFile);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(
        receipt.sha256,
      );
      expect(JSON.parse(bytes.toString("utf8")).audit.sources[0].source).toBe(
        source,
      );
      expect(result.inspection.safe).toBe(false);
      expect(
        result.inspection.receipts.find(
          (r) => r.operation === "component_archive",
        )!.data,
      ).toMatchObject({
        status:
          mode === "large" || mode.startsWith("restrict")
            ? "captured"
            : "unavailable",
      });
      expect(
        f.client.calls.some(
          (c) =>
            c.name === "execute_luau" &&
            c.args.code.includes('return reply("component_chunk"'),
        ),
      ).toBe(true);
      expect(result.inspection.capabilityBlock?.kind).toBe(
        "interactive_asset_requires_review",
      );
      expect(
        (result.inspection.snapshot as any).inertAudit.sources[0],
      ).toMatchObject({
        source,
        sha256: createHash("sha256").update(source).digest("hex"),
      });
      expect(
        f.client.calls.some(
          (c) => c.name === "screen_capture" || c.name === "start_stop_play",
        ),
      ).toBe(false);
      if (mode.startsWith("restrict")) {
        if (archive.status !== "captured")
          throw Error("Expected captured fixture");
        const derivative = {
          snapshot: {
            ...archive,
            roundTrip: {
              passed: true,
              checkedProperties: 1,
              checkedAttributes: 0,
              checkedReferences: 0,
              unobservableProperties: [],
              ignoredIdentityProperties: [],
            },
          },
          security: {
            currentCapabilities: ["Basic"],
            instances: archive.nodes!.map((node) => ({
              index: node.index,
              sandboxedBefore: true,
              sandboxedAfter: true,
              before: ["Basic", "Network"],
              after: ["Basic"],
              removed: ["Network"],
            })),
          },
        };
        if (mode === "restrict-round-trip-failure")
          (derivative.snapshot as any).roundTrip = {
            passed: false,
            stage: "compare",
            reason: "Component round trip changed property Model.PrimaryPart",
          };
        const json = JSON.stringify(derivative);
        f.client.componentData = Buffer.from(json).toString("base64");
        f.client.overrides.component_restrict = {
          componentTransfer: {
            encodedBytes: f.client.componentData.length,
            jsonBytes: Buffer.byteLength(json),
            sha256: createHash("sha256")
              .update(f.client.componentData)
              .digest("hex"),
            chunkSize: 32768,
          },
        };
        const beforeCalls = f.client.calls.length;
        if (mode === "restrict-original-corrupt") {
          const original = result.inspection.receipts.find(
            (r) => r.operation === "component_archive",
          )!.data as any;
          fs.writeFileSync(original.archiveFile, "damaged");
          await expect(
            f.adapter.captureRestrictedComponent(
              result.inspection,
              "a".repeat(64),
              signal(),
            ),
          ).rejects.toThrow("identity");
          expect(f.client.calls).toHaveLength(beforeCalls);
        } else if (mode === "restrict-uncertain") {
          f.client.overrides.component_restrict = { isError: true };
          await expect(
            f.adapter.captureRestrictedComponent(
              result.inspection,
              "a".repeat(64),
              signal(),
            ),
          ).rejects.toMatchObject({ effects: "unknown" });
          await expect(
            f.adapter.captureRestrictedComponent(
              result.inspection,
              "a".repeat(64),
              signal(),
            ),
          ).rejects.toThrow("reconcile");
          return; // Unknown mutation is never retried or automatically discarded.
        } else if (mode === "restrict-read-failure") {
          f.client.overrides.component_chunk = { isError: true };
          await expect(
            f.adapter.captureRestrictedComponent(
              result.inspection,
              "a".repeat(64),
              signal(),
            ),
          ).rejects.toMatchObject({ effects: "owned" });
        } else if (mode === "restrict-round-trip-failure") {
          const error = await f.adapter
            .captureRestrictedComponent(
              result.inspection,
              "a".repeat(64),
              signal(),
            )
            .catch((e) => e);
          expect(error).toBeInstanceOf(StudioAssetError);
          expect(error.effects).toBe("owned");
          expect(
            error.receipts.find(
              (r: any) => r.operation === "restricted_component_validation",
            )?.data,
          ).toEqual({
            status: "captured",
            roundTrip: derivative.snapshot.roundTrip,
          });
          expect(
            fs
              .readdirSync(path.dirname(receipt.auditFile))
              .some((file) => file.endsWith(".review.json")),
          ).toBe(false);
        } else if (mode.startsWith("restrict-adapt")) {
          const prepared = await f.adapter.prepareComponentReview(
            result.inspection,
            "a".repeat(64),
            signal(),
          );
          const evidence = prepared.evidence;
          const plan: ComponentAdaptation = {
            packetHash: evidence.packetHash,
            inputHash: evidence.inputHash,
            reason: "Adapt retained script",
            removeSubtrees: [],
            replaceSources: [
              {
                index: 2,
                beforeSha256: evidence.sourceBodies[0].sha256,
                source: "local retained = script.Parent",
                reason: "Remove fixture error",
              },
            ],
            preservedBehavior: ["Retained part"],
            remainingIntegration: [],
            nativeTestPlan: ["Native test still required"],
            runtimeVerification: "not_performed",
          };
          const {
            indexMap: _map,
            additionMap: _added,
            ...inventory
          } = expectedAdaptedInventory(derivative.snapshot as any, plan);
          const adapted = { ...derivative.snapshot, ...inventory };
          // Distinct synthetic serialized bytes let the second-hop transport
          // assertion detect accidentally deserializing the prepared archive.
          if (
            mode === "restrict-adapt-two-hop" ||
            mode.startsWith("restrict-adapt-second")
          ) {
            const bytes = Buffer.from(adapted.base64!, "base64");
            bytes[bytes.length - 1] = 1;
            adapted.base64 = bytes.toString("base64");
          }
          if (mode === "restrict-adapt-changed-source")
            adapted.sources[0].source = "error('undeclared')";
          const json = JSON.stringify(adapted);
          f.client.componentData = Buffer.from(json).toString("base64");
          f.client.overrides.component_adapt = {
            componentTransfer: {
              encodedBytes: f.client.componentData.length,
              jsonBytes: Buffer.byteLength(json),
              sha256: createHash("sha256")
                .update(f.client.componentData)
                .digest("hex"),
              chunkSize: 32768,
            },
          };
          const calls = f.client.calls.length;
          if (mode === "restrict-adapt-forged") {
            await expect(
              f.adapter.adaptComponent(
                result.inspection,
                { ...evidence, token: "forged" },
                plan,
                signal(),
              ),
            ).rejects.toThrow("owned prepared");
            expect(f.client.calls).toHaveLength(calls);
          } else if (mode === "restrict-adapt-uncertain") {
            f.client.overrides.component_adapt = { isError: true };
            await expect(
              f.adapter.adaptComponent(
                result.inspection,
                evidence,
                plan,
                signal(),
              ),
            ).rejects.toMatchObject({ effects: "unknown" });
            await expect(
              f.adapter.adaptComponent(
                result.inspection,
                evidence,
                plan,
                signal(),
              ),
            ).rejects.toThrow("reconcile");
            return;
          } else if (mode === "restrict-adapt-read-failure") {
            f.client.overrides.component_chunk = { isError: true };
            await expect(
              f.adapter.adaptComponent(
                result.inspection,
                evidence,
                plan,
                signal(),
              ),
            ).rejects.toMatchObject({ effects: "owned" });
            const failedCalls = f.client.calls.length;
            delete f.client.overrides.component_chunk;
            await expect(
              f.adapter.adaptComponent(
                result.inspection,
                evidence,
                plan,
                signal(),
              ),
            ).rejects.toThrow(/unresolved attempt/);
            expect(f.client.calls).toHaveLength(failedCalls);
          } else if (mode === "restrict-adapt-changed-source") {
            await expect(
              f.adapter.adaptComponent(
                result.inspection,
                evidence,
                plan,
                signal(),
              ),
            ).rejects.toThrow("undeclared sources");
          } else {
            const output = await f.adapter.adaptComponent(
              result.inspection,
              evidence,
              plan,
              signal(),
            );
            expect(output.evidence.packetHash).not.toBe(evidence.packetHash);
            expect(output.evidence.sourceBodies[0].source).toBe(
              plan.replaceSources[0].source,
            );
            expect(
              output.receipts.some(
                (r) => r.operation === "adapted_component_archive",
              ),
            ).toBe(true);
            expect(
              output.receipts.find(
                (r) => r.operation === "adapted_component_transfer",
              )?.data,
            ).toMatchObject({ verified: true });
            await expect(
              f.adapter.adaptComponent(
                result.inspection,
                evidence,
                plan,
                signal(),
              ),
            ).rejects.toThrow("owned prepared");
            if (
              mode === "restrict-adapt-two-hop" ||
              mode.startsWith("restrict-adapt-second")
            ) {
              const secondPlan: ComponentAdaptation = {
                ...plan,
                packetHash: output.evidence.packetHash,
                replaceSources: [
                  {
                    index: 2,
                    beforeSha256: output.evidence.sourceBodies[0].sha256,
                    source:
                      "local retained = script.Parent\nlocal repaired = true",
                    reason: "Second worker correction",
                  },
                ],
              };
              const {
                indexMap: _secondMap,
                additionMap: _secondAdded,
                ...secondInventory
              } = expectedAdaptedInventory(adapted as any, secondPlan);
              const secondSnapshot = { ...adapted, ...secondInventory };
              const bytes = Buffer.from(secondSnapshot.base64!, "base64");
              bytes[bytes.length - 1] = 2;
              secondSnapshot.base64 = bytes.toString("base64");
              const json = JSON.stringify(secondSnapshot);
              f.client.componentData = Buffer.from(json).toString("base64");
              f.client.overrides.component_adapt = {
                componentTransfer: {
                  encodedBytes: f.client.componentData.length,
                  jsonBytes: Buffer.byteLength(json),
                  sha256: createHash("sha256")
                    .update(f.client.componentData)
                    .digest("hex"),
                  chunkSize: 32768,
                },
              };
              const beforeFiles = fs
                .readdirSync(path.dirname(receipt.auditFile))
                .filter((file) => file.endsWith(".adaptation.json"))
                .map(
                  (file) =>
                    [
                      file,
                      fs.readFileSync(
                        path.join(path.dirname(receipt.auditFile), file),
                        "utf8",
                      ),
                    ] as const,
                );
              expect(beforeFiles).toHaveLength(1);
              if (mode === "restrict-adapt-second-negative")
                f.client.overrides.component_adapt = {
                  ok: false,
                  reasons: ["Native comparison failed"],
                };
              if (mode === "restrict-adapt-second-uncertain")
                f.client.overrides.component_adapt = { isError: true };
              if (mode === "restrict-adapt-second-read-failure")
                f.client.overrides.component_chunk = { isError: true };
              if (mode !== "restrict-adapt-two-hop") {
                await expect(
                  f.adapter.adaptComponent(
                    result.inspection,
                    output.evidence,
                    secondPlan,
                    signal(),
                  ),
                ).rejects.toMatchObject({
                  effects:
                    mode === "restrict-adapt-second-uncertain"
                      ? "unknown"
                      : "owned",
                });
                const failedCalls = f.client.calls.length;
                delete f.client.overrides.component_chunk;
                await expect(
                  f.adapter.adaptComponent(
                    result.inspection,
                    output.evidence,
                    secondPlan,
                    signal(),
                  ),
                ).rejects.toThrow(
                  mode === "restrict-adapt-second-uncertain"
                    ? /reconcile/
                    : /unresolved attempt/,
                );
                expect(f.client.calls).toHaveLength(failedCalls);
                if (mode === "restrict-adapt-second-uncertain") return; // Never auto-clean an unknown native mutation.
                await expect(
                  f.adapter.prepareComponentIntegration(
                    need,
                    result.inspection,
                    output.evidence,
                    {} as any,
                    signal(),
                  ),
                ).rejects.toThrow("Integration component identity changed");
                expect(f.client.calls).toHaveLength(failedCalls);
              } else {
                const second = await f.adapter.adaptComponent(
                  result.inspection,
                  output.evidence,
                  secondPlan,
                  signal(),
                );
                expect(second.evidence.sourceBodies[0].source).toBe(
                  secondPlan.replaceSources[0].source,
                );
                const nativeCalls = f.client.calls.filter(
                  (call) =>
                    call.name === "execute_luau" &&
                    call.args.code.includes('return reply("component_adapt"'),
                );
                expect(nativeCalls).toHaveLength(2);
                const secondCode = nativeCalls[1].args.code as string;
                const encoded =
                  /local data=Http:JSONDecode\(buffer.tostring\(encoding:Base64Decode\(buffer.fromstring\("([A-Za-z0-9+/=]+)"\)\)\)\)/.exec(
                    secondCode,
                  )![1];
                const nativeInput = JSON.parse(
                  Buffer.from(encoded, "base64").toString("utf8"),
                );
                expect(nativeInput.before.base64).toBe(adapted.base64);
                expect(nativeInput.before.base64).not.toBe(
                  derivative.snapshot.base64,
                );
                expect(nativeInput.before.sources[0].source).toBe(
                  plan.replaceSources[0].source,
                );
                expect(nativeCalls[0].args.code).toContain(
                  'retained.Name="_TakkoAdaptedCapture_1"',
                );
                expect(secondCode).toContain(
                  'retained.Name="_TakkoAdaptedCapture_2"',
                );
                for (const [hop, parentHash] of [
                  [1, evidence.packetHash],
                  [2, output.evidence.packetHash],
                ] as const) {
                  expect(
                    f.client.calls.some(
                      (call) =>
                        call.name === "execute_luau" &&
                        call.args.code.includes(
                          `child(stage,"_TakkoAdaptedCapture_${hop}")`,
                        ) &&
                        call.args.code.includes(
                          `cache:GetAttribute("ParentPacketHash")=="${parentHash}"`,
                        ),
                    ),
                  ).toBe(true);
                }
                const chain = loadComponentAdaptationChain(
                  path.dirname(receipt.auditFile),
                  evidence.packetHash,
                  second.evidence.packetHash,
                  evidence.inputHash,
                );
                expect(
                  chain.steps.map((step) => step.parentPacketHash),
                ).toEqual([evidence.packetHash, output.evidence.packetHash]);
                expect(chain.archive.archiveHash).toBe(
                  second.evidence.derivativeHash,
                );
                for (const [file, contents] of beforeFiles)
                  expect(
                    fs.readFileSync(
                      path.join(path.dirname(receipt.auditFile), file),
                      "utf8",
                    ),
                  ).toBe(contents);
                const secondCalls = f.client.calls.length;
                await expect(
                  f.adapter.adaptComponent(
                    result.inspection,
                    second.evidence,
                    { ...secondPlan, packetHash: second.evidence.packetHash },
                    signal(),
                  ),
                ).rejects.toThrow(/attempt budget/);
                expect(f.client.calls).toHaveLength(secondCalls);
              }
            }
            await expect(
              f.adapter.place(need, result.inspection, signal()),
            ).rejects.toThrow();
          }
        } else {
          const restricted = await f.adapter.captureRestrictedComponent(
            result.inspection,
            "a".repeat(64),
            signal(),
          );
          expect(restricted).toMatchObject({
            sourceCount: 1,
            uniqueSourceBodies: 1,
            securityReview: "not_performed",
          });
          expect(restricted.receipts.length).toBeLessThan(15);
          expect(result.inspection.safe).toBe(false);
          await expect(
            f.adapter.place(need, result.inspection, signal()),
          ).rejects.toThrow();
          await expect(
            f.adapter.captureRestrictedComponent(
              result.inspection,
              "a".repeat(64),
              signal(),
            ),
          ).rejects.toThrow("fresh quarantine");
        }
      }
      await f.adapter.discard(result.inspection, signal());
      if (
        mode === "restrict-adapt-two-hop" ||
        mode.startsWith("restrict-adapt-second")
      ) {
        expect(
          f.client.calls.filter(
            (call) =>
              call.name === "execute_luau" &&
              call.args.code.includes('return reply("discard"'),
          ),
        ).toHaveLength(1);
        await expect(
          f.adapter.discard(result.inspection, signal()),
        ).rejects.toThrow(/expired/);
      }
    },
  );
  it("requires separate native playback and bound WAV captures for Audio inspection and placement", async () => {
    const captures: string[] = [];
    const f = await inspect(
      audioSetup(async (binding, playback) => {
        captures.push(binding.token);
        await playback();
        return audioEvidence(binding);
      }),
      { ...need, kind: "Audio" },
    );
    expect(f.inspection.audio?.source.candidateId).toBe("123");
    expect(f.inspection.functional.playbackObserved).toBe(true);
    expect(f.inspection.audio?.durationMs).toBe(1000);
    expect(f.inspection.audio?.source.audition).toMatchObject({
      nativeTimeLengthSeconds: 0.65,
      playbackElapsedSeconds: 0.66,
      endedNaturally: true,
      playbackWindowTruncated: false,
    });
    // Roblox stores Volume as float32; preserve that native value in the bundle.
    f.client.overrides.place.scene[0].properties.Volume = Math.fround(0.65);
    const placed = await f.adapter.place(
      { ...need, kind: "Audio" },
      f.inspection,
      signal(),
    );
    expect(placed.passed).toBe(true);
    expect(placed.audio).toBeDefined();
    expect(captures).toEqual([f.inspection.token, f.inspection.token]);
    expect(
      f.client.calls.filter(
        (c) =>
          c.name === "execute_luau" &&
          c.args.code.includes('return reply("playback"'),
      ),
    ).toHaveLength(2);
    expect(f.client.calls.some((c) => c.name === "screen_capture")).toBe(false);
    expect(placed.bundle.assets[0].kind).toBe("audio");
    await f.adapter.discard(f.inspection, signal());
  });
  it.each(["no callback", "no progress", "wrong token", "mismatched export"])(
    "rejects Audio with %s despite supplied recording",
    async (failure) => {
      const f = audioSetup(async (binding, playback) => {
        if (failure !== "no callback") await playback();
        return audioEvidence({
          ...binding,
          token: failure === "wrong token" ? "foreign" : binding.token,
        });
      });
      if (failure === "no progress")
        f.client.overrides.audio_playback = {
          ok: false,
          functional: {
            contentLoaded: true,
            instanceCount: 1,
            scriptCount: 0,
            playbackObserved: false,
          },
        };
      if (failure === "mismatched export") {
        const found = await inspect(f, { ...need, kind: "Audio" });
        f.client.overrides.place.scene[0].properties.Volume = 1;
        await expect(
          f.adapter.place(
            { ...need, kind: "Audio" },
            found.inspection,
            signal(),
          ),
        ).rejects.toThrow("settings");
      } else
        await expect(inspect(f, { ...need, kind: "Audio" })).rejects.toThrow();
    },
  );
  it.each(["export", "inspection"])(
    "rejects captured sound identity mismatched with %s",
    async (phase) => {
      const f = audioSetup(async (binding, playback) => {
        await playback();
        return audioEvidence(binding);
      });
      const found = await inspect(f, { ...need, kind: "Audio" });
      f.client.overrides.place.scene[0].properties.SoundId = "rbxassetid://456";
      if (phase === "inspection") {
        f.client.overrides.runtime_load = { soundId: "rbxassetid://456" };
        f.client.overrides.runtime_playback = { soundId: "rbxassetid://456" };
      }
      const error = await f.adapter
        .place({ ...need, kind: "Audio" }, found.inspection, signal())
        .catch((e) => e);
      expect(error.message).toContain("Sound identity");
      expect(error).toMatchObject({
        effects: "none",
        classification: "infrastructure_failure",
      });
    },
  );
  it.each(["missing", "changed", "nonfinite", "inconsistent truncation"])(
    "rejects %s native duration observations with verified cleanup",
    async (failure) => {
      const f = audioSetup(async (binding, playback) => {
        await playback();
        return audioEvidence(binding);
      });
      if (failure === "missing")
        f.client.overrides.runtime_load = {
          nativeTimeLengthSeconds: undefined,
        };
      if (failure === "changed")
        f.client.overrides.runtime_playback = { nativeTimeLengthSeconds: 9 };
      if (failure === "nonfinite")
        f.client.overrides.runtime_playback = { playbackElapsedSeconds: NaN };
      if (failure === "inconsistent truncation")
        f.client.overrides.runtime_playback = {
          endedNaturally: false,
          playbackWindowTruncated: false,
        };
      const error = await inspect(f, { ...need, kind: "Audio" }).catch(
        (e) => e,
      );
      expect(error).toMatchObject({
        effects: "none",
        classification: "infrastructure_failure",
      });
      expect(
        error.receipts.some(
          (r: any) => r.operation === "audio_runtime_restored",
        ),
      ).toBe(true);
    },
  );
  it("does not race cleanup after unknown native audio playback outcomes", async () => {
    const f = audioSetup(async (binding, playback) => {
      await playback();
      return audioEvidence(binding);
    });
    f.client.overrides.audio_playback = {
      isError: true,
      content: [{ type: "text", text: "Native playback outcome unknown" }],
    };
    const error = await inspect(f, { ...need, kind: "Audio" }).catch((e) => e);
    expect(error.effects).toBe("unknown");
    expect(
      error.receipts.some((r: any) => r.operation === "cleanup_deferred"),
    ).toBe(true);
    expect(
      f.client.calls.some(
        (c) =>
          c.name === "execute_luau" &&
          c.args.code.includes('return reply("discard"'),
      ),
    ).toBe(false);
  });
  it("restores the owned runtime before cleanup and permits retry after completed negative playback", async () => {
    const f = audioSetup(async (binding, playback) => {
      await playback();
      return audioEvidence(binding);
    });
    f.client.overrides.runtime_playback = {
      ok: false,
      playbackObserved: false,
    };
    const error = await inspect(f, { ...need, kind: "Audio" }).catch((e) => e);
    expect(error).toMatchObject({
      effects: "none",
      classification: "candidate_rejected",
      haltRequired: false,
    });
    expect(
      f.client.calls
        .filter((c) => c.name === "start_stop_play")
        .map((c) => c.args.is_start),
    ).toEqual([true, false]);
    expect(
      error.receipts.some((r: any) => r.operation === "audio_runtime_restored"),
    ).toBe(true);
    const stop = f.client.calls.findIndex(
      (c) => c.name === "start_stop_play" && !c.args.is_start,
    );
    const discard = f.client.calls.findIndex((c) =>
      c.args.code?.includes('return reply("discard"'),
    );
    expect(discard).toBeGreaterThan(stop);
    await expect(
      f.adapter.search({ ...need, kind: "Audio" }, "crunch retry", signal()),
    ).resolves.toBeDefined();
  });
  it.each([true, false])(
    "classifies completed faint candidate audio separately from baseline infrastructure failure: %s",
    async (candidate) => {
      const f = audioSetup(async (_binding, playback) => {
        await playback();
        throw candidate
          ? new AudioCandidateEvidenceError(
              "Audio capture is silent or too faint to evaluate",
            )
          : Error("Studio audio baseline was not quiet");
      });
      const error = await inspect(f, { ...need, kind: "Audio" }).catch(
        (e) => e,
      );
      expect(error).toMatchObject({
        effects: "none",
        classification: candidate
          ? "candidate_rejected"
          : "infrastructure_failure",
        haltRequired: !candidate,
      });
      expect(
        f.client.calls
          .filter((c) => c.name === "start_stop_play")
          .map((c) => c.args.is_start),
      ).toEqual([true, false]);
      expect(
        error.receipts.some(
          (r: any) => r.operation === "audio_runtime_restored",
        ),
      ).toBe(true);
      if (candidate)
        await expect(
          f.adapter.search({ ...need, kind: "Audio" }, "retry", signal()),
        ).resolves.toBeDefined();
    },
  );
  it.each(["start", "stop", "claim", "ownership", "restore"])(
    "unknown runtime %s never triggers unsafe follow-up mutations",
    async (stage) => {
      const f = audioSetup(async (binding, playback) => {
        await playback();
        return audioEvidence(binding);
      });
      f.client.overrides["runtime_" + stage] = { isError: true };
      const error = await inspect(f, { ...need, kind: "Audio" }).catch(
        (e) => e,
      );
      expect(error).toMatchObject({
        effects: "unknown",
        classification: "unknown_effects",
        haltRequired: true,
      });
      const transitions = f.client.calls
        .filter((c) => c.name === "start_stop_play")
        .map((c) => c.args.is_start);
      expect(transitions).toEqual(
        stage === "stop" || stage === "restore" ? [true, false] : [true],
      );
      expect(
        f.client.calls.some((c) =>
          c.args.code?.includes('return reply("discard"'),
        ),
      ).toBe(false);
    },
  );
  it("fails before Play on a completed active-script preflight rejection and cleans its candidate", async () => {
    const f = audioSetup(async (binding, playback) => {
      await playback();
      return audioEvidence(binding);
    });
    f.client.overrides.runtime_prepare = {
      ok: false,
      reason: "Active place scripts prevent isolated audition",
    };
    const error = await inspect(f, { ...need, kind: "Audio" }).catch((e) => e);
    expect(error).toMatchObject({
      effects: "none",
      classification: "infrastructure_failure",
    });
    expect(f.client.calls.some((c) => c.name === "start_stop_play")).toBe(
      false,
    );
  });
  it("waits through acknowledged transition readiness without retrying start or stop", async () => {
    const f = audioSetup(async (binding, playback) => {
      await playback();
      return audioEvidence(binding);
    });
    const original = f.client.callTool.bind(f.client);
    let transitioning = false;
    f.client.callTool = async (name, args) => {
      if (name === "get_studio_state" && transitioning) {
        transitioning = false;
        return envelope({ mode: "Transitioning" });
      }
      const result = await original(name, args);
      if (name === "start_stop_play") transitioning = true;
      return result;
    };
    const found = await inspect(f, { ...need, kind: "Audio" });
    expect(found.inspection.audio).toBeDefined();
    expect(
      f.client.calls
        .filter((c) => c.name === "start_stop_play")
        .map((c) => c.args.is_start),
    ).toEqual([true, false]);
  });
  it("does not stop when the runtime ownership receipt rejects its nonce", async () => {
    const f = audioSetup(async (binding, playback) => {
      await playback();
      return audioEvidence(binding);
    });
    f.client.overrides.runtime_ownership = { ok: false };
    const error = await inspect(f, { ...need, kind: "Audio" }).catch((e) => e);
    expect(error.effects).toBe("unknown");
    expect(
      f.client.calls
        .filter((c) => c.name === "start_stop_play")
        .map((c) => c.args.is_start),
    ).toEqual([true]);
  });
  it("does not stop a replaced process even with unchanged mocked runtime receipts", async () => {
    const f = audioSetup(async (binding, playback) => {
      await playback();
      return audioEvidence(binding);
    });
    let calls = 0;
    // The first pre-start and claim bindings agree; playback detects replacement.
    const capture = (f.adapter as any).audioCapture as StudioAudioCapture;
    capture.bindStudio = async () => ({
      pid: ++calls < 6 ? 42 : 99,
      startedAt: "2026-09-15T12:00:00Z",
      executable: "fixture",
    });
    const error = await inspect(f, { ...need, kind: "Audio" }).catch((e) => e);
    expect(error.effects).toBe("unknown");
    expect(
      f.client.calls
        .filter((c) => c.name === "start_stop_play")
        .map((c) => c.args.is_start),
    ).toEqual([true]);
  });
  it("does not restore while a noncompliant capture leaves native callback pending", async () => {
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const f = audioSetup(async (binding, playback) => {
      void playback().catch(() => {});
      return audioEvidence(binding);
    });
    const original = f.client.callTool.bind(f.client);
    f.client.callTool = async (name, args) => {
      if (args.code?.includes('return reply("playback"')) await pending;
      return original(name, args);
    };
    const error = await inspect(f, { ...need, kind: "Audio" }).catch((e) => e);
    expect(error.effects).toBe("unknown");
    expect(
      f.client.calls
        .filter((c) => c.name === "start_stop_play")
        .map((c) => c.args.is_start),
    ).toEqual([true]);
    finish();
  });
  it("imports Images as owned rendered Decals and preserves resolved texture distinct from Store asset ID", async () => {
    const f = await inspect(imageSetup(), imageNeed);
    expect(f.inspection.safe).toBe(true);
    expect(f.inspection.image).toBe("data:image/png;base64," + png);
    expect(
      f.client.calls.find((c) => c.name === "insert_asset")!.args.assetType,
    ).toBe("Image");
    const placed = await f.adapter.place(imageNeed, f.inspection, signal());
    expect(placed.passed).toBe(true);
    expect(placed.bundle?.assets[0]).toMatchObject({
      kind: "image",
      assetId: "123",
      status: "retrieved",
    });
    expect(
      placed.bundle?.scene.find((n) => n.className === "Decal")?.properties,
    ).toEqual(imageScene()[1].properties);
    const captures = f.client.calls.filter((c) => c.name === "screen_capture");
    expect(captures).toHaveLength(2);
    expect(
      captures.every(
        (c) => c.args.camera_position[2] > c.args.look_at_position[2],
      ),
    ).toBe(true);
    await f.adapter.discard(f.inspection, signal());
    expect(f.client.calls.at(-1)!.args.code).toContain(
      'return reply("discard"',
    );
  });
  it.each([
    "missing texture",
    "foreign path",
    "missing surface",
    "fully transparent",
    "unsupported Texture",
  ])("rejects image export with %s", async (failure) => {
    const f = await inspect(imageSetup(), imageNeed);
    const scene = imageScene();
    if (failure === "missing texture") scene[1].properties.Texture = "";
    if (failure === "foreign path") scene[1].path = "Workspace/Outside/Decal";
    if (failure === "missing surface") scene[0].className = "Folder";
    if (failure === "fully transparent") scene[1].properties.Transparency = 1;
    if (failure === "unsupported Texture") scene[1].className = "Texture";
    f.client.overrides.place = { scene };
    await expect(
      f.adapter.place(imageNeed, f.inspection, signal()),
    ).rejects.toThrow();
    expect(
      f.client.calls.filter((c) => c.name === "screen_capture"),
    ).toHaveLength(1);
  });
  it("preserves an ordinary Model Decal's original face and appearance", async () => {
    const f = await inspect();
    const scene = imageScene();
    scene[1].properties.Face = { type: "Enum", enum: "NormalId", value: 1 };
    f.client.overrides.place = { scene };
    const result = await f.adapter.place(need, f.inspection, signal());
    expect(
      result.bundle?.scene.find((n) => n.className === "Decal")?.properties
        .Face,
    ).toEqual(scene[1].properties.Face);
  });
  it("uses public free search and rejects wrong types, prices, owners, sources and unverified IDs", async () => {
    const f = setup();
    f.client.rows = [
      row,
      {
        ...row,
        assetId: "999",
        assetType: "Animation",
        name: "Mining Animation",
      },
      { ...row, assetId: "124", isFree: false },
      { ...row, creatorName: "" },
      { ...row, priceCents: null },
      { ...row, source: "inventory" },
      { ...row, assetId: 123 },
      { ...row, creatorStoreUrl: "https://evil.test/123" },
      row,
    ];
    const result = await f.adapter.search(need, "wood board", signal());
    expect(result.candidates).toEqual([
      {
        id: "123",
        name: "Board",
        kind: "Model",
        creator: "FixtureCreator",
        sourceUrl: row.creatorStoreUrl,
        price: 0,
        source: "creator_store",
      },
    ]);
    expect(f.client.calls.find((c) => c.name === "search_asset")!.args).toEqual(
      {
        studio_id: "studio-one",
        scope: "creator_store",
        priceFilter: "free",
        maxResults: 20,
        query: "wood board",
        assetType: "Model",
      },
    );
    await expect(
      f.adapter.inspect(
        need,
        { ...result.candidates[0], id: "555" },
        "next",
        signal(),
      ),
    ).rejects.toThrow("not returned");
  });
  it("fails Animation search explicitly without guessing Model titles or calling a tool", async () => {
    const f = setup();
    await expect(
      f.adapter.search(
        { ...need, kind: "Animation" },
        "butter animation",
        signal(),
      ),
    ).rejects.toThrow("does not support Animation");
    expect(f.client.calls).toEqual([]);
  });
  it("stages, previews, places, exports and releases only token-owned content, ignoring returned paths/code", async () => {
    const f = await inspect();
    expect(f.inspection.safe).toBe(true);
    expect(f.inspection.image).toBe("data:image/png;base64," + png);
    expect(f.inspection.path).toMatch(
      /^ServerStorage\/TestScope\/AssetStaging\/attempt_[a-f0-9]{24}\/Imported$/,
    );
    const placed = await f.adapter.place(need, f.inspection, signal());
    expect(placed.passed).toBe(true);
    expect(placed.bundle.scene).toHaveLength(4);
    expect(placed.bundle.assets[0]).toMatchObject({
      id: "board",
      kind: "model",
      assetId: "123",
      status: "retrieved",
      sourceUrl: row.creatorStoreUrl,
    });
    expect(
      f.client.calls.find((c) => c.name === "insert_asset")!.args.parentPath,
    ).toMatch(/^ServerStorage\.TestScope\.AssetStaging\.attempt_/);
    const code = f.client.calls
      .filter((c) => c.name === "execute_luau")
      .map((c) => c.args.code)
      .join("\n");
    expect(code).not.toContain("Workspace.Unauthorized");
    expect(code).not.toContain("untrusted returned code");
    const receipt = await f.adapter.discard(f.inspection, signal());
    expect(receipt.some((r) => r.operation === "execute_luau")).toBe(true);
    await expect(f.adapter.discard(f.inspection, signal())).rejects.toThrow(
      "expired",
    );
    for (let i = 0; i < f.client.calls.length; i++)
      if (
        ["execute_luau", "insert_asset", "screen_capture"].includes(
          f.client.calls[i].name,
        )
      ) {
        expect(f.client.calls[i - 2].name).toBe("list_roblox_studios");
        expect(f.client.calls[i - 1].name).toBe("get_studio_state");
      }
  });
  it("persists real capture bytes and hashes instead of only a descriptive receipt", async () => {
    const directory = temporary(),
      f = await inspect(setup(directory));
    const receipt = f.inspection.receipts.find(
      (r) => r.operation === "capture_file",
    )!.data as any;
    const bytes = Buffer.from(png, "base64");
    expect(fs.readFileSync(receipt.captureFile)).toEqual(bytes);
    expect(receipt.sha256).toBe(
      createHash("sha256").update(bytes).digest("hex"),
    );
    expect(receipt.mime).toBe("image/png");
    await f.adapter.place(need, f.inspection, signal());
    expect(fs.readdirSync(directory)).toEqual([receipt.sha256 + ".png"]);
  });
  it("accepts the native textual Edit response through the actual MCP envelope", async () => {
    const f = setup();
    f.client.state =
      "- Current Studio Mode: Edit\n- Available DataModels: Edit\n- Focused DataModel in the viewport: Edit";
    const result = await f.adapter.search(need, need.query, signal());
    const inspected = await f.adapter.inspect(
      need,
      result.candidates[0],
      "attempt",
      signal(),
    );
    expect(inspected.safe).toBe(true);
    expect(f.client.calls.some((call) => call.name === "insert_asset")).toBe(
      true,
    );
    expect(f.client.calls.some((call) => call.name === "start_stop_play")).toBe(
      false,
    );
  });
  it("refuses Play, unknown mode and disconnected studios without stopping play or executing mutations", async () => {
    for (const state of [
      { playState: "Play", availableDatamodelTypes: ["Client", "Server"] },
      { arbitrary: "unknown" },
      "- Current Studio Mode: Play\n- Available DataModels: Client, Server\n- Focused DataModel in the viewport: Client",
      { playState: "Play", availableDatamodelTypes: ["Edit"] },
    ]) {
      const f = setup();
      const result = await f.adapter.search(need, need.query, signal());
      f.client.state = state;
      await expect(
        f.adapter.inspect(need, result.candidates[0], "attempt", signal()),
      ).rejects.toThrow("Edit mode");
      expect(
        f.client.calls.some((c) =>
          ["execute_luau", "insert_asset", "start_stop_play"].includes(c.name),
        ),
      ).toBe(false);
    }
    const f = setup();
    f.client.connected = false;
    await expect(f.adapter.search(need, need.query, signal())).rejects.toThrow(
      "not connected",
    );
  });
  it.each([
    {
      label: "script",
      functional: { contentLoaded: false, instanceCount: 2, scriptCount: 1 },
      reasons: [
        "Embedded executable behavior requires a reviewed complete-asset import path",
      ],
    },
    {
      label: "package",
      functional: { contentLoaded: false, instanceCount: 2, scriptCount: 0 },
      reasons: ["Unsupported or executable class: PackageLink"],
    },
    {
      label: "too many instances",
      functional: { contentLoaded: false, instanceCount: 400, scriptCount: 0 },
      reasons: ["Asset exceeds 300 instances"],
    },
    {
      label: "missing mesh",
      functional: { contentLoaded: false, instanceCount: 2, scriptCount: 0 },
      reasons: ["MeshPart lacks mesh identity"],
    },
  ])("rejects $label before making a world preview", async (unsafe) => {
    const f = setup();
    f.client.overrides.inspect = { ok: false, ...unsafe };
    const result = await inspect(f);
    expect(result.inspection.safe).toBe(false);
    expect(f.client.calls.some((c) => c.name === "screen_capture")).toBe(false);
    await f.adapter.discard(result.inspection, signal());
  });
  it("cleans known screenshot failures but defers cleanup after unknown import outcomes", async () => {
    for (const failure of ["screenshot", "timeout"]) {
      const f = setup();
      if (failure === "screenshot") f.client.screenshot = false;
      else f.client.insertError = true;
      await expect(inspect(f)).rejects.toThrow(
        failure === "screenshot"
          ? "screenshot image missing"
          : "no automatic retry",
      );
      expect(
        f.client.calls.filter((c) => c.name === "insert_asset"),
      ).toHaveLength(1);
      expect(
        f.client.calls.some(
          (c) =>
            c.name === "execute_luau" &&
            c.args.code.includes('return reply("discard"'),
        ),
      ).toBe(failure === "screenshot");
      const calls = f.client.calls.length;
      await expect(
        f.adapter.search(need, need.query, signal()),
      ).rejects.toThrow("halted");
      expect(f.client.calls).toHaveLength(calls);
    }
  });
  it("rejects forged tokens, changed need positions, and changed native inspection paths before mutation", async () => {
    const f = await inspect();
    const calls = f.client.calls.length;
    await expect(
      f.adapter.place(need, { ...f.inspection, token: "invented" }, signal()),
    ).rejects.toThrow("token");
    await expect(
      f.adapter.place(
        need,
        { ...f.inspection, path: "Workspace.Other" },
        signal(),
      ),
    ).rejects.toThrow("token");
    await expect(
      f.adapter.place({ ...need, position: [0, 0, 0] }, f.inspection, signal()),
    ).rejects.toThrow("token");
    expect(f.client.calls).toHaveLength(calls);
  });
  it("keeps mesh identity and texture data in exported nodes", async () => {
    const f = await inspect();
    f.client.overrides.place = {
      functional: { contentLoaded: true, instanceCount: 1, scriptCount: 0 },
      scene: [
        {
          path: "Workspace/TestScope/Assets/board",
          className: "MeshPart",
          properties: {
            MeshId: "rbxassetid://789",
            TextureID: "rbxassetid://790",
            Anchored: true,
          },
        },
      ],
    };
    const placed = await f.adapter.place(need, f.inspection, signal());
    expect(
      placed.bundle.scene.find((n) => n.className === "MeshPart")!.properties,
    ).toMatchObject({
      MeshId: "rbxassetid://789",
      TextureID: "rbxassetid://790",
    });
  });
  it.each([
    { path: "Workspace/Other/Part", className: "Part", properties: {} },
    {
      path: "Workspace/TestScope/Assets/board/../Outside",
      className: "Part",
      properties: {},
    },
    {
      path: "Workspace/TestScope/Assets/board",
      className: "MeshPart",
      properties: { TextureID: "rbxassetid://790" },
    },
    {
      path: "Workspace/TestScope/Assets/board",
      className: "Part",
      properties: { Source: "print('bad')" },
    },
  ])(
    "halts incomplete/unserializable native exports: $className $path",
    async (node) => {
      const f = await inspect();
      f.client.overrides.place = {
        functional: { contentLoaded: true, instanceCount: 1, scriptCount: 0 },
        scene: [node],
      };
      await expect(
        f.adapter.place(need, f.inspection, signal()),
      ).rejects.toThrow();
      expect(f.client.calls.at(-1)!.args.code).toContain(
        'return reply("discard"',
      );
    },
  );
  it("does not claim audio satisfaction from native playback progress", async () => {
    const audioNeed = { ...need, kind: "Audio" as const },
      f = setup();
    f.client.rows = [{ ...row, assetType: "Audio" }];
    f.client.overrides.inspect = {
      functional: { contentLoaded: true, instanceCount: 1, scriptCount: 0 },
    };
    const found = await inspect(f, audioNeed);
    f.client.overrides.place = {
      ok: false,
      reasons: ["No audio-analysis capability"],
      functional: {
        contentLoaded: true,
        instanceCount: 1,
        scriptCount: 0,
        playbackObserved: true,
      },
      functionalVerified: true,
      audibilityVerified: false,
      scene: [
        {
          path: "ReplicatedStorage/TestScope/Assets/board",
          className: "Sound",
          properties: {
            SoundId: "rbxassetid://123",
            Volume: 0.2,
            Playing: false,
          },
        },
      ],
    };
    const placed = await f.adapter.place(audioNeed, found.inspection, signal());
    expect(placed.functional.playbackObserved).toBe(true);
    expect(placed.passed).toBe(false);
    expect(placed.reasons).toContain("No audio-analysis capability");
    expect(f.client.calls.some((c) => c.name === "screen_capture")).toBe(false);
  });
  it("reports failed cleanup and permanently halts further work", async () => {
    const f = await inspect();
    f.client.overrides.discard = {
      isError: true,
      content: [{ type: "text", text: "identity mismatch" }],
    };
    await expect(f.adapter.discard(f.inspection, signal())).rejects.toThrow(
      "returned an error",
    );
    await expect(f.adapter.search(need, need.query, signal())).rejects.toThrow(
      "halted",
    );
  });
  it("retains ownership intent and defers all follow-up mutations after an uncertain placement", async () => {
    const f = await inspect();
    f.client.overrides.place = {
      isError: true,
      content: [{ type: "text", text: "placement outcome unknown" }],
    };
    const start = f.client.calls.length;
    const error = await f.adapter
      .place(need, f.inspection, signal())
      .catch((e) => e);
    expect(error.effects).toBe("unknown");
    expect(error.receipts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operation: "ownership_intent",
          data: expect.objectContaining({
            token: f.inspection.token,
            finalPath: "Workspace/TestScope/Assets/board",
            stagingPath: expect.stringMatching(
              /^ServerStorage\/TestScope\/AssetStaging\/attempt_/,
            ),
          }),
        }),
        expect.objectContaining({ operation: "cleanup_deferred" }),
      ]),
    );
    expect(
      f.client.calls.slice(start).filter((c) => c.name === "execute_luau"),
    ).toHaveLength(1);
    await expect(f.adapter.search(need, need.query, signal())).rejects.toThrow(
      "halted",
    );
  });
});

describe("fixed emitted Luau (actual compiler/interpreter, mocked Roblox objects)", () => {
  it("executes bounded audio playback and refuses competing Sound or AudioPlayer without stopping them", async () => {
    const f = await inspect(
      audioSetup(async (binding, playback) => {
        await playback();
        return audioEvidence(binding);
      }),
      { ...need, kind: "Audio" },
    );
    await f.adapter.place({ ...need, kind: "Audio" }, f.inspection, signal());
    await f.adapter.discard(f.inspection, signal());
    const scripts = f.client.calls
      .filter((c) => c.name === "execute_luau")
      .map((c) => c.args.code as string);
    const directory = temporary(),
      suffix = process.platform === "win32" ? ".exe" : "";
    const compiler = path.resolve("research/tools/luau/luau-compile" + suffix),
      interpreter = path.resolve("research/tools/luau/luau" + suffix);
    for (const [index, code] of scripts.entries()) {
      const file = path.join(directory, `audio-template-${index}.luau`);
      fs.writeFileSync(file, code);
      execFileSync(compiler, [file], {
        windowsHide: true,
        timeout: 10000,
        stdio: "pipe",
      });
    }
    const playback = scripts.find((code) =>
      code.includes('return reply("playback"'),
    )!;
    for (const mode of [
      "progress",
      "short",
      "stalled",
      "Sound",
      "AudioPlayer",
    ]) {
      const file = path.join(directory, `audio-runtime-${mode}.luau`);
      fs.writeFileSync(
        file,
        audioWorld(playback, mode) +
          `\nlocal ok,err=pcall(function()\n${playback}\nend)\n` +
          (mode === "Sound" || mode === "AudioPlayer"
            ? 'assert(not ok and tostring(err):find("Other Studio audio"));assert(plays==0 and stops==0 and foreign.IsPlaying and foreignStops==0)'
            : "assert(ok,tostring(err));assert(plays==1 and stops==1 and not sound.IsPlaying and sound.TimePosition==0);assert(mode=='short' and clock>=0.65 and clock<=0.75 or mode~='short' and clock<=5.1 and clock>=5)") +
          '\nprint("AUDIO_RUNTIME_VERIFIED")',
      );
      expect(
        execFileSync(interpreter, [file], {
          windowsHide: true,
          timeout: 10000,
          encoding: "utf8",
        }),
      ).toContain("AUDIO_RUNTIME_VERIFIED");
    }
  });
  it("executes Image load, mounted preview, exact Decal export and scoped cleanup in real Luau", async () => {
    const f = await inspect(imageSetup(), imageNeed);
    await f.adapter.place(imageNeed, f.inspection, signal());
    await f.adapter.discard(f.inspection, signal());
    const scripts = f.client.calls
      .filter((c) => c.name === "execute_luau")
      .map((c) => c.args.code as string);
    const directory = temporary();
    const suffix = process.platform === "win32" ? ".exe" : "";
    const compiler = path.resolve("research/tools/luau/luau-compile" + suffix);
    const interpreter = path.resolve("research/tools/luau/luau" + suffix);
    for (const [index, code] of scripts.entries()) {
      const file = path.join(directory, `image-${index}.luau`);
      fs.writeFileSync(file, code);
      execFileSync(compiler, [file], {
        windowsHide: true,
        timeout: 10000,
        stdio: "pipe",
      });
    }
    const inspection = scripts.find((c) =>
      c.includes('return reply("inspect"'),
    )!;
    for (const defect of [
      "none",
      "missing texture",
      "Texture",
      "advanced UV",
      "preload denied",
      "nonarchivable",
      "MaterialVariant",
      "CustomPhysicalProperties",
      "CollisionGroup",
      "SoundGroup",
      "PlaybackRegionsEnabled",
      "embedded media",
    ]) {
      const file = path.join(
        directory,
        "runtime-" + defect.replaceAll(" ", "-") + ".luau",
      );
      const testedInspection = inspection.replace(
        'local KIND="Image"',
        `local KIND="${["SoundGroup", "PlaybackRegionsEnabled"].includes(defect) ? "Audio" : defect === "embedded media" ? "Model" : "Image"}"`,
      );
      const stages =
        defect === "none"
          ? scripts.filter((c) => !c.includes('return reply("prepare"'))
          : [testedInspection];
      const body = stages
        .map((code) => `do local result=(function()\n${code}\nend)() end`)
        .join("\n");
      fs.writeFileSync(
        file,
        imageWorld(inspection, defect) +
          "\n" +
          body +
          '\nassert(checks>0);print("IMAGE_RUNTIME_VERIFIED")',
      );
      expect(
        execFileSync(interpreter, [file], {
          windowsHide: true,
          timeout: 10000,
          encoding: "utf8",
        }),
      ).toContain("IMAGE_RUNTIME_VERIFIED");
    }
  });
  it("compiles every template and actually rejects script/package contents and preserves foreign cleanup targets", async () => {
    const f = await inspect();
    await f.adapter.place(need, f.inspection, signal());
    await f.adapter.discard(f.inspection, signal());
    const directory = temporary();
    const compiler = path.resolve(
      "research/tools/luau/luau-compile" +
        (process.platform === "win32" ? ".exe" : ""),
    );
    const interpreter = path.resolve(
      "research/tools/luau/luau" + (process.platform === "win32" ? ".exe" : ""),
    );
    expect(fs.existsSync(compiler)).toBe(true);
    expect(fs.existsSync(interpreter)).toBe(true);
    const scripts = f.client.calls
      .filter((c) => c.name === "execute_luau")
      .map((c) => c.args.code as string);
    for (let i = 0; i < scripts.length; i++) {
      const file = path.join(directory, "template-" + i + ".luau");
      fs.writeFileSync(file, scripts[i]);
      expect(() =>
        execFileSync(compiler, [file], {
          windowsHide: true,
          timeout: 10000,
          stdio: "pipe",
        }),
      ).not.toThrow();
    }
    const inspectCode = scripts.find((code) =>
      code.includes('return reply("inspect"'),
    )!;
    const placedDiscardCode = scripts.find((code) =>
      code.includes('return reply("discard"'),
    )!;
    const unplaced = await inspect();
    await unplaced.adapter.discard(unplaced.inspection, signal());
    const discardCode = unplaced.client.calls.find(
      (call) =>
        call.name === "execute_luau" &&
        call.args.code.includes('return reply("discard"'),
    )!.args.code as string;
    for (const [className, variant] of [
      ["Script", "readable"],
      ["Script", "large"],
      ["Script", "many"],
      ["Script", "unreadable"],
      ["Script", "dependencyLimit"],
      ["PackageLink", "readable"],
      ["Bone", "readable"],
    ]) {
      const file = path.join(directory, className + "-" + variant + ".luau");
      fs.writeFileSync(
        file,
        mockWorld(inspectCode, className, false, variant) + "\n" + inspectCode,
      );
      expect(
        execFileSync(interpreter, [file], {
          encoding: "utf8",
          windowsHide: true,
          timeout: 10000,
        }),
      ).toContain("SCANNER_REJECTED");
    }
    const file = path.join(directory, "cleanup.luau");
    fs.writeFileSync(
      file,
      mockWorld(discardCode, "Part", true) + "\n" + discardCode,
    );
    expect(
      execFileSync(interpreter, [file], {
        encoding: "utf8",
        windowsHide: true,
        timeout: 10000,
      }),
    ).toContain("OWNED_REMOVED_FOREIGN_PRESERVED");
    const changed = path.join(directory, "changed-placement.luau");
    fs.writeFileSync(
      changed,
      mockWorld(placedDiscardCode, "Part", true) + "\n" + placedDiscardCode,
    );
    expect(() =>
      execFileSync(interpreter, [changed], {
        encoding: "utf8",
        windowsHide: true,
        timeout: 10000,
        stdio: "pipe",
      }),
    ).toThrow("Cleanup placement identity changed");
  });
});

function audioWorld(code: string, mode: string) {
  const token = /local TOKEN="([^"]+)"/.exec(code)![1],
    marker = /local NAME="([^"]+)"/.exec(code)![1],
    nonce = /local NONCE="([^"]+)"/.exec(code)![1];
  return `
local mode=${JSON.stringify(mode)}
local function item(className,name,parent)
 local self={ClassName=className,Name=name,Parent=parent,children={},attributes={},Archivable=true}
 if parent then table.insert(parent.children,self) end
 function self:IsA(kind) return kind==self.ClassName end
 function self:GetChildren() return self.children end
 function self:GetDescendants() local all={} local function walk(p) for _,c in p.children do table.insert(all,c);walk(c) end end walk(self);return all end
 function self:GetAttribute(key) return self.attributes[key] end
 return self
end
Vector3={new=function(x,y,z) return {X=x,Y=y,Z=z} end};Vector3.zero=Vector3.new(0,0,0)
local world=item("Service","Workspace")
local project=item("Folder","TestScope",world)
local previews=item("Folder","AssetPreviews",project);previews.attributes.TakkoAssetScope="TestScope"
local holder=item("Folder","${marker}",world);holder.attributes.TakkoAssetToken="${token}";holder.attributes.RuntimeNonce="${nonce}"
local sound=item("Sound","Sound",holder);sound.SoundId="rbxassetid://123";sound.SoundGroup=nil;sound.PlaybackRegionsEnabled=false;sound.IsLoaded=true;sound.TimeLength=12;sound.TimePosition=0;sound.IsPlaying=false
if mode=="short" then sound.TimeLength=0.65 end
sound.Volume=0.65;sound.PlaybackSpeed=1;sound.Looped=false;sound.PlayOnRemove=false
local plays,stops,foreignStops,clock=0,0,0,0
function sound:Play() plays+=1;self.IsPlaying=true;assert(self.Volume==0.65 and self.PlaybackSpeed==1 and not self.Looped and not self.PlayOnRemove) end
function sound:Stop() stops+=1;self.IsPlaying=false end
local endedCallback=nil
sound.Ended={Connect=function(_,callback) endedCallback=callback;return {Disconnect=function() endedCallback=nil end} end}
local foreign=item(mode=="AudioPlayer" and "AudioPlayer" or "Sound","Foreign",world);foreign.IsPlaying=mode=="Sound" or mode=="AudioPlayer"
function foreign:Stop() foreignStops+=1;self.IsPlaying=false end
os={clock=function() return clock end}
task={wait=function(seconds) clock+=seconds;if sound.IsPlaying and mode~="stalled" then sound.TimePosition+=seconds;if mode=="short" and sound.TimePosition>=sound.TimeLength then sound.TimePosition=0;sound.IsPlaying=false;if endedCallback then endedCallback() end end end end}
local services={Workspace=world,RunService={IsRunning=function() return true end,IsClient=function() return true end},HttpService={JSONEncode=function(_,value)
 assert(value.operation=="playback" and value.nonce=="${nonce}")
 assert(value.nativeTimeLengthSeconds==sound.TimeLength and value.playbackSpeed==1)
 assert(mode=="short" and value.playbackElapsedSeconds>=0.65 and value.playbackElapsedSeconds<=0.75 or mode~="short" and value.playbackElapsedSeconds>=5 and value.playbackElapsedSeconds<=5.1)
 assert(value.playbackLimitSeconds==5 and value.endedNaturally==(mode=="short") and value.playbackWindowTruncated==(mode~="short"))
 assert(value.ok==(mode~="stalled") and value.playbackObserved==(mode~="stalled"));return "{}"
end}}
workspace=world
game={GetService=function(_,name) return assert(services[name],name) end,GetDescendants=function() return world:GetDescendants() end}
`;
}

// A small native-object double executes the actual templates, including parent
// changes and cleanup. It does not render pixels or establish Roblox integration.
function imageWorld(code: string, defect: string) {
  const token = /local TOKEN="([^"]+)"/.exec(code)![1];
  const session = /local SESSION="([^"]+)"/.exec(code)![1];
  const attempt = /local ATTEMPT="([^"]+)"/.exec(code)![1];
  return `
local defect=${JSON.stringify(defect)}
local vector={}
Vector3={new=function(x,y,z) return setmetatable({X=x,Y=y,Z=z},vector) end}
vector.__index=function(v,k)
 if k=="Magnitude" then return math.sqrt(v.X*v.X+v.Y*v.Y+v.Z*v.Z) end
 if k=="Min" then return function(a,b) return Vector3.new(math.min(a.X,b.X),math.min(a.Y,b.Y),math.min(a.Z,b.Z)) end end
 if k=="Max" then return function(a,b) return Vector3.new(math.max(a.X,b.X),math.max(a.Y,b.Y),math.max(a.Z,b.Z)) end end
end
vector.__add=function(a,b) return Vector3.new(a.X+b.X,a.Y+b.Y,a.Z+b.Z) end
vector.__sub=function(a,b) return Vector3.new(a.X-b.X,a.Y-b.Y,a.Z-b.Z) end
vector.__mul=function(a,b) if type(b)=="number" then return Vector3.new(a.X*b,a.Y*b,a.Z*b) end return Vector3.new(a.X*b.X,a.Y*b.Y,a.Z*b.Z) end
vector.__div=function(a,b) return a*(1/b) end
Vector3.zero=Vector3.new(0,0,0)
local cframe={};CFrame={new=function(x,y,z) return setmetatable({p=type(x)=="table" and x or Vector3.new(x or 0,y or 0,z or 0)},cframe) end}
cframe.__index={GetComponents=function(a) return a.p.X,a.p.Y,a.p.Z,1,0,0,0,1,0,0,0,1 end,PointToWorldSpace=function(a,v) return a.p+v end}
cframe.__sub=function(a,b) return CFrame.new(a.p-b) end
cframe.__mul=function(a,b) return CFrame.new(a.p+b.p) end
Color3={new=function(r,g,b) return {R=r,G=g,B=b} end}
local function en(t,v) return {EnumType="Enum."..t,Value=v} end
Enum={NormalId={Back=en("NormalId",2),Top=en("NormalId",1)},Material={SmoothPlastic=en("Material",256)},AssetFetchStatus={Success="Success"}}
local methods={}; local node={}
node.__index=function(self,key)
 if key=="Position" then return self.p.CFrame.p end
 return methods[key] or self.p[key]
end
node.__newindex=function(self,key,value)
 if key=="Parent" then
   if self.p.Parent then local i=table.find(self.p.Parent.children,self);if i then table.remove(self.p.Parent.children,i) end end
   if value then table.insert(value.children,self) end
 end
 self.p[key]=value
end
local function item(className,name,parent)
 local p={ClassName=className,Name=name or className,Archivable=true,Texture="",Transparency=0.1,Color3=Color3.new(0.9,0.8,0.7),Face=Enum.NormalId.Top,ZIndex=2,AutoLocalize=true,
 Size=Vector3.new(1,1,1),CFrame=CFrame.new(),PivotOffset=CFrame.new(),Color=Color3.new(1,1,1),Material=Enum.Material.SmoothPlastic,MaterialVariant="",CollisionGroup="Default",
 Reflectance=0,CanCollide=true,CanQuery=true,CanTouch=true,CastShadow=true,Massless=false,Shape=en("PartType",1),Rotation=0,UVOffset="zero",UVScale="one"}
 for _,key in {"TopSurface","BottomSurface","LeftSurface","RightSurface","FrontSurface","BackSurface"} do p[key]=en("SurfaceType",0) end
 local value=setmetatable({p=p,children={},attrs={}},node);value.Parent=parent;return value
end
function methods:IsA(kind) return self.ClassName==kind or (kind=="BasePart" and self.ClassName=="Part") or (kind=="Decal" and self.ClassName=="Texture") end
function methods:GetChildren() return table.clone(self.children) end
function methods:GetDescendants() local list={} local function walk(p) for _,v in p.children do table.insert(list,v);walk(v) end end walk(self);return list end
function methods:GetAttribute(key) return self.attrs[key] end
function methods:SetAttribute(key,value) self.attrs[key]=value end
function methods:Destroy() for _,v in self:GetChildren() do v:Destroy() end self.Parent=nil end
function methods:Clone()
 local copy=item(self.ClassName,self.Name)
 for k,v in self.p do if k~="Parent" then copy[k]=v end end
 copy.attrs=table.clone(self.attrs)
 for _,v in self.children do local child=v:Clone();child.Parent=copy end
 return copy
end
Instance={new=function(className) return item(className) end}
local services={ServerStorage=item("Service","ServerStorage"),Workspace=item("Service","Workspace"),ReplicatedStorage=item("Service","ReplicatedStorage")}
local project=item("Folder","TestScope",services.ServerStorage);project:SetAttribute("TakkoAssetCreatedBy","${session}")
local staging=item("Folder","AssetStaging",project);staging:SetAttribute("TakkoAssetCreatedBy","${session}");staging:SetAttribute("TakkoAssetScope","TestScope")
local stage=item("Folder","${attempt}",staging);stage:SetAttribute("TakkoAssetToken","${token}")
local propertyPart=defect=="MaterialVariant" or defect=="CustomPhysicalProperties" or defect=="CollisionGroup"
local routing=defect=="SoundGroup" or defect=="PlaybackRegionsEnabled"
local original=item(defect=="embedded media" and "Model" or routing and "Sound" or propertyPart and "Part" or defect=="Texture" and "Texture" or "Decal","Imported",stage)
original.Texture=defect=="missing texture" and "" or "rbxassetid://456"
if defect=="advanced UV" then original.UVScale="custom" end
if defect=="nonarchivable" then original.Archivable=false end
if defect=="MaterialVariant" then original.MaterialVariant="OwnedOriginalMaterial" end
if defect=="CustomPhysicalProperties" then original.CustomPhysicalProperties={Density=1} end
if defect=="CollisionGroup" then original.CollisionGroup="OwnedOriginalGroup" end
if routing then original.SoundId="rbxassetid://123";original.PlaybackRegionsEnabled=defect=="PlaybackRegionsEnabled";if defect=="SoundGroup" then original.SoundGroup={} end end
if defect=="embedded media" then
 item("Part","OriginalPart",original)
 local embedded=item("Sound","OriginalSound",original);embedded.SoundId="rbxassetid://123";embedded.PlaybackRegionsEnabled=false
 function embedded:Stop() error("Embedded sound must not be modified during blocked inspection") end
end
local outside=item("Folder","Outside",services.Workspace)
local loads=0
task={spawn=function(f) f() end,wait=function() end}
services.ContentProvider={PreloadAsync=function(_,items,callback)
 loads+=1;local saw=false;for _,v in items do if v.ClassName=="Decal" then assert(v.Texture=="rbxassetid://456");saw=true;callback(v.Texture,defect=="preload denied" and "Failure" or "Success") end end;assert(saw)
end}
services.RunService={IsRunning=function() return false end}
local checks=0
local transferPayload=nil
Enum.HashAlgorithm={Sha256=4}
services.EncodingService={Base64Encode=function(_,bytes) return bytes end,ComputeStringHash=function() return string.rep("a",32) end}
services.HttpService={JSONEncode=function(_,value)
 if value.operation==nil and value.inertAudit then transferPayload=value;return "{}" end
 if value.componentTransfer then assert(transferPayload);value.inertAudit=transferPayload.inertAudit end
 checks+=1
 if defect~="none" then
  assert(value.operation=="inspect" and not value.ok and not value.functional.contentLoaded);assert(#value.reasons>0)
  if defect=="advanced UV" or defect=="nonarchivable" or propertyPart or routing or defect=="embedded media" then
   assert(value.capabilityBlock and value.capabilityBlock.kind==(defect=="embedded media" and "interactive_asset_requires_review" or "unsupported_structure"))
   assert(loads==0 and original.Parent==stage and original.Name=="Imported" and original.Anchored==nil)
   assert(value.inertAudit.executed==false and #value.inertAudit.sources==0)
   if defect=="embedded media" then assert(#original:GetChildren()==2 and original:GetChildren()[1].Name=="OriginalPart" and original:GetChildren()[2].Name=="OriginalSound") end
  elseif defect=="missing texture" or defect=="preload denied" then assert(value.capabilityBlock==nil) end
  return "{}"
 end
 if value.operation=="inspect" then
  assert(value.ok and value.functional.contentLoaded and value.functional.instanceCount==2 and loads==1)
  assert(original.Parent.ClassName=="Part" and original.Parent.Anchored and original.Face==Enum.NormalId.Back)
 elseif value.operation=="preview" then assert(value.ok and value.center[2]==1000)
 elseif value.operation=="place" then
  assert(value.ok and value.functional.contentLoaded and #value.scene==2 and loads==2)
  local decal=value.scene[2];assert(decal.className=="Decal" and decal.properties.Texture=="rbxassetid://456")
  assert(decal.properties.Face.value==2 and decal.properties.ZIndex==2 and decal.properties.Color3.value[1]==0.9)
  assert(value.scene[1].properties.CFrame.value[1]==2 and value.scene[1].properties.CFrame.value[2]==3)
 elseif value.operation=="discard" then
  assert(value.ok and project.Parent==nil and original.Parent==nil)
  assert(#services.Workspace:GetChildren()==1 and outside.Parent==services.Workspace)
 else error("Unexpected operation") end
 return "{}"
end}
game={GetService=function(_,name) return assert(services[name],name) end}
`;
}

function mockWorld(
  code: string,
  className: string,
  cleanup: boolean,
  variant = "readable",
) {
  const token = /local TOKEN="([^"]+)"/.exec(code)![1],
    session = /local SESSION="([^"]+)"/.exec(code)![1],
    attempt = /local ATTEMPT="([^"]+)"/.exec(code)![1];
  return `
local function item(name,className,parent,attributes)
 local self={Name=name,ClassName=className,Parent=parent,Archivable=true,children={},attributes=attributes or {}}
 if parent then table.insert(parent.children,self) end
 function self:GetChildren() return table.clone(self.children) end
 function self:GetDescendants() local list={} local function walk(p) for _,c in p.children do table.insert(list,c);walk(c) end end walk(self);return list end
 function self:GetAttribute(key) return self.attributes[key] end
 function self:SetAttribute(key,value) self.attributes[key]=value end
 function self:IsA(kind) return kind==self.ClassName or ((kind=="LuaSourceContainer" or kind=="BaseScript") and self.ClassName=="Script") end
 function self:Destroy() if self.Parent then local i=table.find(self.Parent.children,self); if i then table.remove(self.Parent.children,i) end end self.Parent=nil end
 return self
end
Vector3={new=function(x,y,z) return {X=x,Y=y,Z=z} end};Vector3.zero=Vector3.new(0,0,0)
local services={ServerStorage=item("ServerStorage","Service"),Workspace=item("Workspace","Service"),ReplicatedStorage=item("ReplicatedStorage","Service")}
local project=item("TestScope","Folder",services.ServerStorage,{TakkoAssetCreatedBy="${session}"})
local staging=item("AssetStaging","Folder",project,{TakkoAssetScope="TestScope",TakkoAssetCreatedBy="${session}"})
local stage=item("${attempt}","Folder",staging,{TakkoAssetToken="${token}"})
local model=item("Imported","Model",stage,{TakkoAssetToken="${token}"})
local untrusted=item("Untrusted","${className}",model)
local source="local sound=Instance.new('Sound')\\nlocal tween=game:GetService('TweenService')\\nlocal dependency=require(123)\\nlocal id='rbxassetid://456'\\nerror('must not execute')"
untrusted.Source=source;untrusted.Disabled=false;untrusted.RunContext="Enum.RunContext.Legacy"
${variant === "large" ? 'untrusted.Source=string.rep("x",65537)' : ""}
${variant === "many" ? 'for i=2,10 do local script=item("Script"..i,"Script",model);script.Source=source end' : ""}
${variant === "unreadable" ? 'untrusted.Source=nil;setmetatable(untrusted,{__index=function(_,key) if key=="Source" then error("Source access denied") end end})' : ""}
${variant === "dependencyLimit" ? 'untrusted.Source=string.rep("require(123)\\n",70)' : ""}
local worldScope=item("TestScope","Folder",services.Workspace)
local assets=item("Assets","Folder",worldScope,{TakkoAssetScope="TestScope"})
local foreign=item("board","Model",assets,{TakkoAssetToken="another-token"})
local outside=item("Outside","Folder",services.Workspace)
services.RunService={IsRunning=function() return false end}
services.ScriptEditorService={GetEditorSource=function(_,script) return script.Source end}
local transferPayload=nil
Enum={HashAlgorithm={Sha256=4}}
Instance={new=function(className)
 local value=item(className,className)
 return setmetatable(value,{__newindex=function(v,k,x) rawset(v,k,x);if k=="Parent" and x then table.insert(x.children,v) end end})
end}
services.EncodingService={Base64Encode=function(_,bytes) return bytes end,ComputeStringHash=function() return string.rep("a",32) end}
services.HttpService={JSONEncode=function(_,value)
 if value.operation==nil and value.inertAudit then transferPayload=value;return "{}" end
 if value.componentTransfer then assert(transferPayload);value.inertAudit=transferPayload.inertAudit end
 ${
   cleanup
     ? 'assert(value.operation=="discard" and value.ok);assert(stage.Parent==nil);assert(project.Parent==nil);assert(foreign.Parent==assets);assert(worldScope.Parent==services.Workspace);assert(outside.Parent==services.Workspace);print("OWNED_REMOVED_FOREIGN_PRESERVED")'
     : `assert(value.operation=="inspect" and not value.ok);assert(value.functional.scriptCount==${className === "Script" ? (variant === "many" ? 10 : 1) : 0});assert(not value.functional.contentLoaded);assert(#value.reasons>0);
 assert(value.capabilityBlock.kind=="${className === "Script" ? "interactive_asset_requires_review" : "unsupported_structure"}")
 assert(value.inertAudit.executed==false and untrusted.Parent==model and untrusted.Name=="Untrusted" and not untrusted.Disabled)
 ${className === "Script" ? (variant === "large" ? "assert(value.inertAudit.sources[1].source==nil and value.inertAudit.sources[1].sourceOmittedForLimit and value.inertAudit.sources[1].sourceBytes==65537 and value.inertAudit.sourceBytesReturned==0)" : variant === "many" ? "assert(#value.inertAudit.sources==8 and value.inertAudit.sourceListTruncated)" : variant === "unreadable" ? 'assert(not value.inertAudit.sources[1].readable and value.inertAudit.sources[1].readError:find("Source access denied"))' : variant === "dependencyLimit" ? "assert(#value.inertAudit.sources[1].literalDependencies==64 and value.inertAudit.sources[1].dependencyListTruncated)" : "assert(value.inertAudit.sources[1].source==source and value.inertAudit.sourceBytesReturned==#source and #value.inertAudit.sources[1].literalDependencies==4)") : "assert(#value.inertAudit.sources==0)"}
 print("SCANNER_REJECTED")`
 }
 return "{}"
end}
game={GetService=function(_,name) return assert(services[name],name) end}
`;
}
