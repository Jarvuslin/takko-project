import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  componentAudioCandidates,
  componentAudioId,
} from "../src/generation/component-media";
import {
  StudioAssetAdapter,
  type StudioAssetClient,
} from "../src/generation/studio-asset-adapter";
import {
  assetNeedSchema,
  type AssetCandidate,
  type AssetInspection,
  type AssetNeed,
} from "../src/generation/asset-contract";
import * as conversion from "../src/generation/component-xml-conversion";
import { integrationFixture } from "./component-integration.fixture";

const signal = () => new AbortController().signal;
const directories: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const directory of directories.splice(0)) {
    if (
      path.dirname(directory) !== os.tmpdir() ||
      !path.basename(directory).startsWith("takko-component-media-")
    )
      throw Error("Unexpected fixture directory");
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
function fixture(
  media = [
    { className: "Sound", property: "SoundId", value: "rbxassetid://321" },
    {
      className: "Sound",
      property: "SoundId",
      value: "https://www.roblox.com/asset/?id=321",
    },
  ],
  id = "component",
  existingDirectory?: string,
) {
  const directory =
    existingDirectory ??
    fs.mkdtempSync(path.join(os.tmpdir(), "takko-component-media-"));
  if (!existingDirectory) directories.push(directory);
  const base = integrationFixture(directory, "MediaScope", {
    media,
    need: {
      id,
      requirementId: "style",
      role: "Retained component",
      kind: "Model",
      query: "component",
      constraints: "Match interaction",
      required: true,
      position: [0, 0, 0],
      maxSize: 12,
    },
  });
  const parent: AssetCandidate = {
    id: base.component.candidateId,
    kind: "Model",
    name: "Fixture",
    creator: "Fixture creator",
    sourceUrl: "https://create.roblox.com/store/asset/101",
    price: 0,
    source: "creator_store",
  };
  return { ...base, parent, componentNeed: base.need };
}
const audioNeed: AssetNeed = {
  id: "sound",
  requirementId: "style",
  role: "Interaction feedback",
  kind: "Audio",
  query: "feedback",
  constraints: "Short feedback",
  required: true,
  position: [0, 0, 0],
  maxSize: 12,
};
const envelope = (value: unknown) => ({
  content: [{ type: "text", text: JSON.stringify(value) }],
});
class Client implements StudioAssetClient {
  calls: { name: string; args: Record<string, any> }[] = [];
  state = "Edit";
  async callTool(name: string, args: Record<string, any>) {
    this.calls.push({ name, args });
    if (name === "list_roblox_studios")
      return envelope({ studios: [{ id: "fixture-studio" }] });
    if (name === "get_studio_state")
      return envelope({
        playState: this.state,
        availableDatamodelTypes: [this.state],
      });
    if (name === "search_asset")
      return envelope({
        scope: "creator_store",
        results: [321, 654].map((id) => ({
          assetId: String(id),
          assetType: "Audio",
          source: "creator_store",
          isFree: true,
          priceCents: 0,
          creatorName: "Fixture creator",
          name: "Sound",
          creatorStoreUrl: `https://create.roblox.com/store/asset/${id}`,
        })),
      });
    if (name === "insert_asset") return envelope({ inserted: true });
    if (name === "execute_luau") {
      const operation =
        /return reply\("(prepare|inspect|component_export|discard)"/.exec(
          args.code,
        )?.[1];
      if (!operation) throw Error("Unexpected fixture operation");
      return envelope({
        marker: "takko_asset_v1",
        operation,
        ok: true,
        reasons: [],
        ...(operation === "component_export"
          ? {
              comparison: {
                passed: true,
                checkedProperties: 1,
                checkedAttributes: 0,
                checkedReferences: 0,
                unobservableProperties: [],
                ignoredIdentityProperties: [],
              },
            }
          : {}),
        ...(operation === "inspect"
          ? {
              functional: {
                contentLoaded: true,
                instanceCount: 1,
                scriptCount: 0,
              },
            }
          : {}),
      });
    }
    throw Error("Unexpected fixture tool " + name);
  }
}
async function prepared(
  f = fixture(),
  existing?: { client: Client; adapter: StudioAssetAdapter },
) {
  const client = existing?.client ?? new Client();
  const adapter =
    existing?.adapter ??
    new StudioAssetAdapter(client, {
      studioId: "fixture-studio",
      scope: "MediaScope",
      evidenceDirectory: f.directory,
    });
  // Seed only the earlier inert inspection/review boundary. Public integration,
  // immutable loading, discovery, inspection and cleanup remain under test.
  const inspection: AssetInspection = {
    candidate: f.parent,
    token: f.evidence.token,
    path: "quarantine",
    safe: false,
    reasons: ["Component review required"],
    snapshot: {},
    receipts: [],
    functional: {
      contentLoaded: false,
      instanceCount: f.evidence.nodes.length,
      scriptCount: 2,
    },
  };
  (adapter as any).entries.set(inspection.token, {
    token: inspection.token,
    attempt: "fixture",
    need: assetNeedSchema.parse(f.need),
    candidate: structuredClone(f.parent),
    placed: false,
    inspection: structuredClone(inspection),
    preparedPacketHash: f.evidence.packetHash,
  });
  const record = JSON.parse(
    fs.readFileSync(
      path.join(f.directory, f.conversionHash + ".conversion.json"),
      "utf8",
    ),
  );
  vi.spyOn(conversion, "convertComponentXml").mockReturnValue({
    ...record,
    recordHash: f.conversionHash,
  });
  const integration = await adapter.prepareComponentIntegration(
    f.need,
    inspection,
    f.evidence,
    f.review,
    signal(),
  );
  return {
    ...f,
    legacyComponent: f.component,
    component: integration.component,
    adapter,
    client,
    inspection,
    integration,
  };
}

describe("captured component media candidates (offline evidence)", () => {
  it.each([
    "rbxassetid://123",
    "https://www.roblox.com/asset/?id=123",
    "http://www.roblox.com/asset/?id=123",
  ])("accepts canonical %s", (value) => {
    expect(componentAudioId(value)).toBe("123");
  });
  it.each([
    "rbxassetid://0",
    "rbxassetid://001",
    "123",
    "rbxassetid://" + "1".repeat(21),
    "https://evil.test/asset/?id=123",
    "https://www.roblox.com/asset/?id=123&other=1",
    "rbxassetid://123\n",
    'rbxassetid://" .. id',
    "rbxasset://sounds/click.wav",
  ])("rejects noncanonical %s", (value) => {
    expect(componentAudioId(value)).toBeUndefined();
  });
  it("groups exact captured Sound bindings and preserves parent provenance without promoting review to playback", () => {
    const f = fixture();
    const candidates = componentAudioCandidates(f);
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({
      id: "321",
      source: "creator_store_component",
      sourceUrl: f.parent.sourceUrl,
      componentOrigin: {
        needId: f.need.id,
        candidateId: "101",
        bindingIndices: [5, 6],
        recordHash: f.component.recordHash,
      },
    });
    expect(candidates[0].description).toContain("Unverified embedded audio");
    expect(candidates[0].description).toContain(
      "not independently searched or listened to",
    );
    expect(candidates[0].price).toBeNull();
    expect(candidates[0].creator).toContain("Audio creator unverified");
    candidates[0].componentOrigin!.bindingIndices.push(77);
    expect(
      componentAudioCandidates(f)[0].componentOrigin!.bindingIndices,
    ).toEqual([5, 6]);
  });
  it("never extracts source literals, non-audio media, dynamic IDs, or external URLs", () => {
    const f = fixture([
      {
        className: "Animation",
        property: "AnimationId",
        value: "rbxassetid://444",
      },
      { className: "Decal", property: "Texture", value: "rbxassetid://555" },
      {
        className: "Sound",
        property: "SoundId",
        value: "https://evil.test/666",
      },
      {
        className: "Sound",
        property: "SoundId",
        value: 'rbxassetid://"..variable',
      },
    ]);
    expect(componentAudioCandidates(f)).toEqual([]);
  });
  it("requires complete validated media explanations and exact reference identities", () => {
    const f = fixture();
    expect(() =>
      componentAudioCandidates({
        ...f,
        review: { ...f.review, serializedMedia: [] },
      }),
    ).toThrow();
    expect(() =>
      componentAudioCandidates({
        ...f,
        component: { ...f.component, archiveHash: "d".repeat(64) },
      }),
    ).toThrow(/provenance/);
    expect(() =>
      componentAudioCandidates({
        ...f,
        parent: { ...f.parent, sourceUrl: "https://evil.test" },
      }),
    ).toThrow(/provenance/);
  });
  it("bounds candidates at 20 while retaining later bindings for included IDs", () => {
    const media = Array.from({ length: 25 }, (_, i) => ({
      className: "Sound",
      property: "SoundId",
      value: `rbxassetid://${i + 100}`,
    }));
    media.push(media[0]);
    const result = componentAudioCandidates(fixture(media));
    expect(result).toHaveLength(20);
    expect(result[0].componentOrigin!.bindingIndices).toEqual([5, 30]);
  });
});

describe("adapter-owned embedded audio discovery (mock native transport)", () => {
  it("requires own successful preparation and cleanup, then retains provenance after discard", async () => {
    const f = await prepared();
    await expect(
      f.adapter.discoverComponentAudio(
        audioNeed,
        f.integration.component,
        signal(),
      ),
    ).rejects.toThrow(/prepared and cleaned/);
    await f.adapter.discard(f.inspection, signal());
    const before = f.client.calls.length;
    // Follow the reference actually produced by the public integration API.
    // A separately constructed legacy record is not this adapter's output.
    expect(f.component).toEqual(f.integration.component);
    await expect(
      f.adapter.discoverComponentAudio(audioNeed, f.legacyComponent, signal()),
    ).rejects.toThrow(/prepared and cleaned/);
    const discovered = await f.adapter.discoverComponentAudio(
      audioNeed,
      f.integration.component,
      signal(),
    );
    expect(f.client.calls).toHaveLength(before);
    expect(discovered.candidates[0].componentOrigin!.bindingIndices).toEqual([
      5, 6,
    ]);
    expect(discovered.receipts.at(-1)!.operation).toBe(
      "component_audio_discovery",
    );
    const foreign = new StudioAssetAdapter(f.client, {
      studioId: "fixture-studio",
      scope: "MediaScope",
      evidenceDirectory: f.directory,
    });
    await expect(
      foreign.discoverComponentAudio(audioNeed, f.component, signal()),
    ).rejects.toThrow(/prepared and cleaned/);
  });
  it("rejects forged refs, non-Audio needs, stale files and canceled calls without native work", async () => {
    const f = await prepared();
    await f.adapter.discard(f.inspection, signal());
    const before = f.client.calls.length;
    await expect(
      f.adapter.discoverComponentAudio(
        audioNeed,
        { ...f.component, inputHash: "1".repeat(64) },
        signal(),
      ),
    ).rejects.toThrow();
    await expect(
      f.adapter.discoverComponentAudio(f.need, f.component, signal()),
    ).rejects.toThrow();
    await expect(
      f.adapter.discoverComponentAudio(
        audioNeed,
        f.component,
        AbortSignal.abort(),
      ),
    ).rejects.toThrow();
    fs.appendFileSync(
      path.join(f.directory, f.component.recordHash + ".integration.json"),
      " ",
    );
    await expect(
      f.adapter.discoverComponentAudio(audioNeed, f.component, signal()),
    ).rejects.toMatchObject({
      message: expect.stringMatching(/identity mismatch/),
      effects: "none",
      receipts: [
        expect.objectContaining({
          operation: "component_audio_discovery_intent",
        }),
      ],
    });
    expect(f.client.calls).toHaveLength(before);
  });
  it("registers exact candidates through normal inspect without bypassing audio capture or Edit guards", async () => {
    const f = await prepared();
    await f.adapter.discard(f.inspection, signal());
    const { candidates } = await f.adapter.discoverComponentAudio(
      audioNeed,
      f.component,
      signal(),
    );
    const candidate = candidates[0];
    await expect(
      f.adapter.inspect(
        audioNeed,
        {
          ...candidate,
          componentOrigin: {
            ...candidate.componentOrigin!,
            bindingIndices: [99],
          },
        },
        "forged",
        signal(),
      ),
    ).rejects.toThrow(/not returned/);
    const inspected = await f.adapter.inspect(
      audioNeed,
      candidate,
      "real",
      signal(),
    );
    expect(
      f.client.calls.find((c) => c.name === "insert_asset")?.args.assetId,
    ).toBe("321");
    expect(inspected.functional.playbackObserved).toBeUndefined();
    expect(inspected.audio).toBeUndefined();
    await f.adapter.discard(inspected, signal());
    f.client.state = "Play";
    await expect(
      f.adapter.inspect(audioNeed, candidate, "active", signal()),
    ).rejects.toThrow(/Edit mode/);
  });
  it("keeps immutable registration, need-scoped IDs and original provenance across repeated discovery and search", async () => {
    const f = await prepared();
    await f.adapter.discard(f.inspection, signal());
    const found = await f.adapter.discoverComponentAudio(
      audioNeed,
      f.component,
      signal(),
    );
    const saved = structuredClone(found.candidates[0]);
    found.candidates[0].componentOrigin!.bindingIndices.push(99);
    expect(
      (await f.adapter.discoverComponentAudio(audioNeed, f.component, signal()))
        .candidates,
    ).toEqual([]);
    const anotherNeed = { ...audioNeed, id: "anotherSound" };
    expect(
      (
        await f.adapter.discoverComponentAudio(
          anotherNeed,
          f.component,
          signal(),
        )
      ).candidates[0].id,
    ).toBe("321");
    const searched = await f.adapter.search(audioNeed, "sound", signal());
    expect(searched.candidates.map((c) => c.id)).toEqual(["654"]);
    expect(
      (await f.adapter.inspect(audioNeed, saved, "preserved", signal()))
        .candidate,
    ).toEqual(saved);
  });
  it("preserves first exact provenance when a second prepared component contains the same audio", async () => {
    const first = await prepared();
    await first.adapter.discard(first.inspection, signal());
    const original = (
      await first.adapter.discoverComponentAudio(
        audioNeed,
        first.component,
        signal(),
      )
    ).candidates[0];
    const second = await prepared(
      fixture(undefined, "second", first.directory),
      first,
    );
    expect(second.component.recordHash).not.toBe(first.component.recordHash);
    await second.adapter.discard(second.inspection, signal());
    expect(
      (
        await first.adapter.discoverComponentAudio(
          audioNeed,
          second.component,
          signal(),
        )
      ).candidates,
    ).toEqual([]);
    expect(
      (
        await first.adapter.inspect(
          audioNeed,
          original,
          "first-provenance",
          signal(),
        )
      ).candidate,
    ).toEqual(original);
  });
});
