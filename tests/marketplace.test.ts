import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Server } from "node:http";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  AssetLibrary,
  type MarketplaceProvider,
} from "../src/marketplace/library";
import { inspectSnapshot } from "../src/marketplace/inspection";
import {
  parseAssetReference,
  type AssetMetadata,
  type AssetSnapshot,
} from "../src/marketplace/types";
import { StudioMarketplace, inspectionLuau } from "../src/marketplace/studio";
import { createApp } from "../src/server/app";
import { gameContext } from "../src/generation/game-context";
import capturedTarget from "./fixtures/asset-roles/10161087974.json";
import { nativeRolesSchema } from "../src/marketplace/role-capture";

const studioId = "392fce6b-fea7-4de3-bb2e-49a95231c3f5";
const metadata: AssetMetadata = {
  assetId: "123",
  name: "Working butter",
  kind: "Model",
  creatorName: "Creator",
  updated: "2026-09-16",
  versionId: "456",
};
const snapshot: AssetSnapshot = {
  nativeRoles: nativeRolesSchema.parse(capturedTarget.snapshot.nativeRoles),
  nodes: [
    { name: "Butter", className: "Model" },
    { name: "Butter.Click", className: "Script" },
  ],
  scripts: [
    {
      name: "Butter.Click",
      source:
        "local pressed = false\nscript.Parent.ClickDetector.MouseClick:Connect(function() pressed = true end)",
    },
  ],
  complete: true,
  issues: [],
};
const dirs: string[] = [],
  servers: Server[] = [];
function fixture() {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "takko-marketplace-"),
  );
  dirs.push(directory);
  const provider = {
    studios: vi.fn(async () => [{ id: studioId, name: "Test" }]),
    search: vi.fn(async () => [structuredClone(metadata)]),
    metadata: vi.fn(async () => structuredClone(metadata)),
    snapshot: vi.fn(async () => structuredClone(snapshot)),
  } satisfies MarketplaceProvider;
  return {
    directory,
    provider,
    library: new AssetLibrary(path.join(directory, "asset-library"), provider),
  };
}
afterEach(async () => {
  for (const server of servers.splice(0))
    await new Promise<void>((r) => server.close(() => r()));
  for (const dir of dirs.splice(0))
    fs.rmSync(dir, { recursive: true, force: true });
});

describe("asset reference parsing", () => {
  it.each([
    "123",
    "rbxassetid://123",
    "https://create.roblox.com/store/asset/123/Butter",
    "https://www.roblox.com/library/123/Butter?x=1",
  ])("resolves %s without fetching the supplied URL", (url) =>
    expect(parseAssetReference(url)).toBe("123"),
  );
  it.each([
    "0",
    "-1",
    "9007199254740992",
    "https://roblox.com.evil.test/library/123",
    "https://user@roblox.com/library/123",
    "http://roblox.com/library/123",
    "https://roblox.com/games/123",
    "https://127.0.0.1/library/123",
  ])("rejects %s", (url) => expect(() => parseAssetReference(url)).toThrow());
});
describe("static inspection", () => {
  it("produces the same findings on repeated scans with shared rules", () => {
    const input = {
      ...snapshot,
      scripts: [
        {
          name: "Code",
          source: "loadstring('bad')()\nHttpService:GetAsync('test')",
        },
      ],
    };
    const first = inspectSnapshot(input);
    expect(first.status).toBe("blocked");
    for (let i = 0; i < 3; i++)
      expect(inspectSnapshot(input).findings).toEqual(first.findings);
  });
  it("accepts a complete simple script without executing it", () =>
    expect(inspectSnapshot(snapshot).status).toBe("no_issues_found"));
  it.each([
    "require(12345)",
    "loadstring('bad')()",
    "script.Source = 'replacement'",
    "local f = getfenv()",
  ])("blocks %s", (source) =>
    expect(
      inspectSnapshot({ ...snapshot, scripts: [{ name: "Hidden", source }] })
        .status,
    ).toBe("blocked"),
  );
  it.each([
    "local module=require(script.Parent.Helper)",
    "local r = require\nr(123)",
    "require(\n123\n)",
    "string.char(65,66)",
  ])("holds unresolved behavior for review: %s", (source) =>
    expect(
      inspectSnapshot({ ...snapshot, scripts: [{ name: "Code", source }] })
        .status,
    ).toBe("review_required"),
  );
  it("never clears incomplete, unreadable or linked-package inspections", () => {
    expect(inspectSnapshot({ ...snapshot, complete: false }).status).toBe(
      "limited",
    );
    expect(inspectSnapshot({ ...snapshot, scripts: [] }).status).toBe(
      "review_required",
    );
    expect(
      inspectSnapshot({
        ...snapshot,
        nodes: [...snapshot.nodes, { name: "Link", className: "PackageLink" }],
      }).status,
    ).toBe("review_required");
  });
});
describe("persistent asset library", () => {
  it.each(["{broken", "null", JSON.stringify({ asset: { assetId: "124" } })])(
    "skips a malformed cache record without changing it: %s",
    (bad) => {
      const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        const f = fixture();
        f.library.remember(metadata);
        const file = path.join(f.library.directory, "124.json");
        fs.writeFileSync(file, bad);
        expect(f.library.list().map((a) => a.assetId)).toEqual(["123"]);
        expect(f.library.list("liked")).toEqual([]);
        expect(fs.readFileSync(file, "utf8")).toBe(bad);
        expect(warning).toHaveBeenCalledTimes(1);
      } finally {
        warning.mockRestore();
      }
    },
  );
  it("inspects once, reuses it across restart, and persists independent likes/saves", async () => {
    const f = fixture(),
      first = await f.library.inspect(studioId, "123");
    expect(first.cacheHit).toBe(false);
    expect(first.asset.inspection?.status).toBe("no_issues_found");
    f.library.preferences("123", { liked: true, saved: true });
    const restarted = new AssetLibrary(f.library.directory, f.provider),
      second = await restarted.inspect(studioId, "123");
    expect(second.cacheHit).toBe(true);
    expect(f.provider.snapshot).toHaveBeenCalledTimes(1);
    expect(restarted.list("liked")).toHaveLength(1);
    expect(restarted.list("saved")).toHaveLength(1);
    restarted.preferences("123", { liked: false });
    expect(restarted.list("liked")).toHaveLength(0);
    expect(restarted.list("saved")).toHaveLength(1);
  });
  it("coalesces simultaneous first drops", async () => {
    const f = fixture();
    await Promise.all([
      f.library.inspect(studioId, "123"),
      f.library.inspect(studioId, "123"),
    ]);
    expect(f.provider.snapshot).toHaveBeenCalledTimes(1);
  });
  it("re-inspects changed versions, unknown revisions and scanner upgrades", async () => {
    const f = fixture();
    await f.library.inspect(studioId, "123");
    f.provider.metadata.mockResolvedValue({ ...metadata, versionId: "457" });
    await f.library.inspect(studioId, "123");
    expect(f.provider.snapshot).toHaveBeenCalledTimes(2);
    const filename = path.join(f.library.directory, "123.json"),
      record = JSON.parse(fs.readFileSync(filename, "utf8"));
    record.asset.inspection.scannerVersion = 0;
    fs.writeFileSync(filename, JSON.stringify(record));
    await f.library.inspect(studioId, "123");
    expect(f.provider.snapshot).toHaveBeenCalledTimes(2);
    f.provider.metadata.mockResolvedValue({
      ...metadata,
      versionId: undefined,
      updated: "",
    });
    await f.library.inspect(studioId, "123");
    await f.library.inspect(studioId, "123");
    expect(f.provider.snapshot).toHaveBeenCalledTimes(4);
  });
  it("does not save an inspection if the asset changed during capture", async () => {
    const f = fixture();
    f.provider.metadata
      .mockResolvedValueOnce(metadata)
      .mockResolvedValueOnce({ ...metadata, versionId: "999" });
    await expect(f.library.inspect(studioId, "123")).rejects.toThrow("changed");
    expect(f.library.get("123")).toBeUndefined();
  });
  it("rejects fabricated attachments, modified source, duplicate IDs and forged verdicts", async () => {
    const f = fixture(),
      result = await f.library.inspect(studioId, "123"),
      ref = {
        assetId: "123",
        contentHash: result.asset.inspection!.contentHash,
        usage: "Keep the existing squash animation",
      };
    expect(f.library.attachments([ref])[0].usage).toContain("squash");
    expect(() =>
      f.library.attachments([{ ...ref, contentHash: "a".repeat(64) }]),
    ).toThrow();
    expect(() => f.library.attachments([ref, ref])).toThrow();
    const filename = path.join(f.library.directory, "123.json"),
      record = JSON.parse(fs.readFileSync(filename, "utf8"));
    record.snapshot.scripts[0].source = "require(123)";
    fs.writeFileSync(filename, JSON.stringify(record));
    expect(() => f.library.attachments([ref])).toThrow();
    record.asset.inspection = inspectSnapshot(record.snapshot);
    record.asset.inspection.status = "no_issues_found";
    fs.writeFileSync(filename, JSON.stringify(record));
    expect(() =>
      f.library.attachments([
        { ...ref, contentHash: record.asset.inspection.contentHash },
      ]),
    ).toThrow("review");
  });
  it("keeps blocked assets in the library but refuses to attach them", async () => {
    const f = fixture();
    f.provider.snapshot.mockResolvedValue({
      ...snapshot,
      scripts: [{ name: "Malware", source: "loadstring('payload')()" }],
    });
    const { asset } = await f.library.inspect(studioId, "123");
    expect(asset.inspection?.status).toBe("blocked");
    f.library.preferences("123", { saved: true });
    expect(f.library.list("saved")).toHaveLength(1);
    expect(() =>
      f.library.attachments([
        { assetId: "123", contentHash: asset.inspection!.contentHash },
      ]),
    ).toThrow();
  });
});
describe("Studio adapter", () => {
  function transferFixture(change?: (frame: any, page: number) => any) {
    const source = "-- animation 🧈\n".repeat(8000) + "\nrequire(987654321)";
    const large = { ...snapshot, scripts: [{ name: "Butter.Click", source }] };
    const bytes = Buffer.from(
      JSON.stringify([
        true,
        [],
        large.nodes.map((n) => [n.name, n.className]),
        large.scripts.map((s) => [s.name, s.source]),
        large.nativeRoles,
      ]),
    );
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    let page = 0;
    const replies: string[] = [];
    const client = {
      close: vi.fn(async () => {}),
      callTool: vi.fn(async (name: string) => {
        if (name === "get_studio_state") return { mode: "Edit" };
        const offset = page * 32768;
        const frame = {
          offset,
          bytes: bytes.length,
          sha256,
          hex: bytes.subarray(offset, offset + 32768).toString("hex"),
        };
        const result = change ? change(frame, page) : frame;
        page++;
        const text =
          typeof result === "string" ? result : JSON.stringify(result);
        replies.push(text);
        return { content: [{ type: "text", text }] };
      }),
    };
    return {
      provider: new StudioMarketplace(() => client),
      large,
      replies,
      client,
    };
  }
  it("reassembles captures beyond Studio's 100K output cap and scans source beyond the first page", async () => {
    const f = transferFixture();
    expect(JSON.stringify(f.large).length).toBeGreaterThan(100000);
    const result = await f.provider.snapshot(studioId, metadata);
    expect(result).toEqual(f.large);
    expect(inspectSnapshot(result).status).toBe("blocked");
    expect(f.replies.length).toBeGreaterThan(3);
    expect(f.replies.every((r) => r.length < 66000)).toBe(true);
    expect(f.client.close).toHaveBeenCalledTimes(f.replies.length);
  });
  it.each([
    [
      "changed capture",
      (f: any, page: number) => ({
        ...f,
        sha256: page ? "0".repeat(64) : f.sha256,
      }),
      "changed during transfer",
    ],
    [
      "incomplete chunk",
      (f: any) => ({ ...f, hex: f.hex.slice(2) }),
      "incomplete",
    ],
    [
      "wrong digest",
      (f: any) => ({ ...f, sha256: "0".repeat(64) }),
      "integrity check",
    ],
    ["truncated response", () => "{... (truncated)", "Studio cut off"],
    [
      "invalid frame",
      (f: any) => ({ ...f, bytes: -1 }),
      "invalid inspection transfer",
    ],
  ] as const)(
    "fails closed with a useful message for %s",
    async (_name, alter, message) => {
      const f = transferFixture(alter);
      await expect(f.provider.snapshot(studioId, metadata)).rejects.toThrow(
        message,
      );
      expect(f.client.close).toHaveBeenCalled();
    },
  );
  it("identifies malformed upstream metadata instead of blaming the user's input", async () => {
    const provider = new StudioMarketplace(() => ({
      close: async () => {},
      callTool: async (name) =>
        name === "get_studio_state"
          ? { mode: "Edit" }
          : { ...metadata, name: null },
    }));
    await expect(provider.metadata(studioId, "123")).rejects.toThrow(
      "Studio returned invalid asset metadata data (name)",
    );
  });
  it.each([false, true])(
    "executes the capture program in offline Luau with unreadable source=%s",
    (unreadable) => {
      const directory = fs.mkdtempSync(
        path.join(os.tmpdir(), "takko-marketplace-luau-"),
      );
      dirs.push(directory);
      const filename = path.join(directory, "capture.luau");
      fs.writeFileSync(
        filename,
        `
local child={ClassName="Script",Name="Controller",Enabled=true}
function child:GetChildren() return {} end
function child:IsA(kind) return kind=="BaseScript" or kind=="LuaSourceContainer" end
function child:GetFullName() return "Butter.Controller" end
if ${unreadable} then
  setmetatable(child,{__index=function(_,key) if key=="Source" then error("Source denied") end end})
else child.Source="error('Imported source must never execute')" end
local root={ClassName="Model",Name="Butter",destroyed=false}
function root:GetChildren() return {child} end
function root:IsA() return false end
function root:GetFullName() return "Butter" end
function root:GetDescendants() return {child} end
function root:Destroy() self.destroyed=true end
local game={}
function game:GetObjects(url) assert(url=="rbxassetid://123");return {root} end
function game:GetService(name)
  if name=="RunService" then return {IsRunning=function() return false end} end
  assert(name=="HttpService");return {JSONEncode=function(_,value) return value end}
end
local function capture()
${inspectionLuau("123")}
end
local result=capture()
assert(root.destroyed and root.Parent==nil and child.Enabled==false)
assert(#result.nodes==2)
assert(result.complete==${!unreadable})
assert(#result.scripts==${unreadable ? 0 : 1})
assert(#result.issues==${unreadable ? 1 : 0})
print("OFFLINE_CAPTURE_PASS")
`,
      );
      const binary = path.resolve(
        process.env.LUAU_BIN_DIR ?? "research/tools/luau",
        process.platform === "win32" ? "luau.exe" : "luau",
      );
      const run = spawnSync(binary, [filename], {
        encoding: "utf8",
        timeout: 10000,
      });
      expect(run.error).toBeUndefined();
      expect(run.status, run.stderr).toBe(0);
      expect(run.stdout).toContain("OFFLINE_CAPTURE_PASS");
    },
  );
  it("allows read-only version checks during verified Play, but never loads model objects", async () => {
    const state = {
      mode: "Play",
      availableDatamodelTypes: ["Client", "Server"],
    };
    const client = {
      callTool: vi.fn(async (name: string) =>
        name === "get_studio_state" ? state : metadata,
      ),
      close: vi.fn(async () => {}),
    };
    const provider = new StudioMarketplace(() => client);
    expect(await provider.metadata(studioId, "123")).toEqual(metadata);
    expect(client.callTool).toHaveBeenLastCalledWith(
      "execute_luau",
      expect.objectContaining({ datamodel_type: "Server" }),
    );
    client.callTool.mockClear();
    await expect(provider.snapshot(studioId, metadata)).rejects.toThrow(
      "Stop Play",
    );
    expect(client.callTool).toHaveBeenCalledTimes(1);
    expect(client.close).toHaveBeenCalledTimes(2);
  });
  it("refuses inspection in Play mode and closes the client", async () => {
    const client = {
        callTool: vi.fn(async () => ({ mode: "Play" })),
        close: vi.fn(async () => {}),
      },
      provider = new StudioMarketplace(() => client);
    await expect(provider.metadata(studioId, "123")).rejects.toThrow(
      "Stop Play",
    );
    expect(client.callTool).toHaveBeenCalledTimes(1);
    expect(client.close).toHaveBeenCalledOnce();
  });
  it("uses detached loads, destroys inspected objects, and never inserts into the game", () => {
    const code = inspectionLuau("123");
    expect(code).toContain("root.Parent==nil");
    expect(code).toContain("root:Destroy()");
    expect(code).not.toMatch(/\.Parent\s*=(?!=)/);
    expect(code).not.toContain("require(");
    expect(() => inspectionLuau("1;bad()")).toThrow();
  });
});
it("HTTP inspection, preference persistence, and trusted chat context work together", async () => {
  const f = fixture(),
    app = createApp(f.directory, { marketplaceProvider: f.provider, env: {} }),
    server = app.listen(0, "127.0.0.1");
  servers.push(server);
  await new Promise<void>((r) => server.once("listening", r));
  const api = async (url: string, method = "GET", body?: unknown) =>
    fetch(`http://127.0.0.1:${(server.address() as any).port}/api${url}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  expect(
    (
      await api("/marketplace/search", "POST", {
        studioId,
        query: "butter",
        kind: "Model",
      })
    ).ok,
  ).toBe(true);
  const first = await (
    await api("/marketplace/inspect", "POST", {
      studioId,
      reference: "https://create.roblox.com/store/asset/123",
    })
  ).json();
  await api("/marketplace/library/123", "PATCH", { saved: true, liked: true });
  const second = await (
    await api("/marketplace/inspect", "POST", { studioId, reference: "123" })
  ).json();
  expect(second.cacheHit).toBe(true);
  const refs = [
    {
      assetId: "123",
      contentHash: first.asset.inspection.contentHash,
      usage: "Keep the sound and animation",
    },
  ];
  const response = await api("/projects", "POST", {
    request: "Make a satisfying butter game",
    assetAttachments: refs,
  });
  expect(response.status).toBe(201);
  const project = await response.json();
  expect(project.assetAttachments[0].name).toBe(metadata.name);
  expect(gameContext(project).selectedAssets?.assets[0].usage).toContain(
    "sound",
  );
  const changed = await (
    await api("/projects/" + project.id, "PATCH", {
      revision: project.revision,
      request: project.request,
      answers: {},
      assetAttachments: [],
    })
  ).json();
  expect(changed.assetAttachments).toEqual([]);
  expect(
    (
      await api("/projects", "POST", {
        request: "Make a new game",
        assetAttachments: [{ ...refs[0], contentHash: "0".repeat(64) }],
      })
    ).status,
  ).toBe(400);
  const saved = await (await api("/marketplace/library?filter=saved")).json();
  expect(saved.assets[0].liked).toBe(true);
});

it("requires explicit coverage acknowledgement and preserves the limitation on attachments", async () => {
  const f = fixture();
  const real = JSON.parse(
    fs.readFileSync(
      "docs/results/opencode-motion-live-20260926/inspection-evidence/14056318312.json",
      "utf8",
    ),
  );
  f.provider.snapshot.mockResolvedValue(real.snapshot);
  const result = await f.library.inspect(studioId, metadata.assetId);
  expect(result.asset.inspection!.status).toBe("limited");
  const ref = {
    assetId: metadata.assetId,
    contentHash: result.asset.inspection!.contentHash,
    usage: "Previewed and explicitly selected",
  };
  expect(() => f.library.attachments([ref])).toThrow();
  const attached = f.library.attachments([
    { ...ref, acknowledgeInspectionLimitations: true },
  ]);
  expect(attached[0].inspectionLimitations).toEqual(
    result.asset.inspection!.limitations,
  );
  const recordPath = path.join(f.library.directory, metadata.assetId + ".json");
  const record = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  record.snapshot.nodes.push({ name: "ActualFinding", className: "Script" });
  record.snapshot.scripts.push({
    name: "ActualFinding",
    source: "loadstring('unsafe')()",
  });
  const { snapshotHash } = await import("../src/marketplace/inspection");
  record.asset.inspection.contentHash = snapshotHash(record.snapshot);
  // Even a tampered cached 'limited' verdict cannot acknowledge an actual finding.
  fs.writeFileSync(recordPath, JSON.stringify(record));
  expect(() =>
    f.library.attachments([
      {
        ...ref,
        contentHash: record.asset.inspection.contentHash,
        acknowledgeInspectionLimitations: true,
      },
    ]),
  ).toThrow(/review/);
});
