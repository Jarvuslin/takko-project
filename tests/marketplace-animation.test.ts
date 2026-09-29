import { afterEach, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import type { Server } from "node:http";
import * as THREE from "three";
import { createApp } from "../src/server/app";
import { GenerationStore, newProject } from "../src/generation/store";
import { StudioMarketplace } from "../src/marketplace/studio";
import { animationClipSchema } from "../src/generation/animation";
import {
  animationPackSchema,
  animationCaptureLuau,
} from "../src/marketplace/animations";
import { createRigScene, disposeScene } from "../src/web/preview/scenes";
import { samplePose } from "../src/web/preview/native-animation";
const studioId = "392fce6b-fea7-4de3-bb2e-49a95231c3f5";
const clip = {
  version: 1 as const,
  name: "Punch",
  rig: "R6" as const,
  duration: 1,
  tracks: [
    {
      joint: "Right Arm",
      keys: [
        { time: 0, rotation: [0, 0, 0] as [number, number, number] },
        { time: 1, rotation: [1, 0, 0] as [number, number, number] },
      ],
    },
  ],
};
const metadata = {
  assetId: "123",
  name: "Combat pack",
  kind: "Model" as const,
  creatorName: "Fixture",
  updated: "today",
  versionId: "456",
};
const pack = {
  assetId: "123",
  name: "Combat pack",
  revisionKey: "version:456",
  entries: [
    { key: "1/1", name: "Punch", clip },
    { key: "1/2", name: "Kick", clip: { ...clip, name: "Kick" } },
    {
      key: "1/3",
      name: "Private move",
      animationId: "789",
      error: "Roblox denied access to this clip.",
    },
  ],
};
const dirs: string[] = [],
  servers: Server[] = [];
afterEach(async () => {
  for (const s of servers.splice(0))
    await new Promise<void>((r) => s.close(() => r()));
  for (const d of dirs.splice(0))
    fs.rmSync(d, { recursive: true, force: true });
});
async function setup(animations = async () => structuredClone(pack)) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-animation-"));
  dirs.push(dir);
  const store = new GenerationStore(dir),
    p = store.save(newProject("Build a combat game", 5000000));
  const provider = {
    studios: async () => [],
    search: async () => [],
    metadata: async () => metadata,
    snapshot: async () => ({
      nodes: [],
      scripts: [],
      complete: true,
      issues: [],
    }),
    animations,
  };
  const server = createApp(dir, {
    env: {},
    marketplaceProvider: provider,
  }).listen(0, "127.0.0.1");
  servers.push(server);
  await new Promise<void>((r) => server.once("listening", r));
  return {
    store,
    p,
    provider,
    post: () =>
      fetch(
        `http://127.0.0.1:${(server.address() as any).port}/api/projects/${p.id}/marketplace-animations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            revision: p.revision,
            studioId,
            reference: "123",
          }),
        },
      ),
  };
}
it("saves every pack entry and permission error, survives reload and deduplicates repeated drops without dispatching inference", async () => {
  const { post, store, p } = await setup();
  const r = await post();
  expect(r.status).toBe(200);
  const saved = await r.json();
  expect(saved.animationPacks[0].entries).toEqual(pack.entries);
  expect(saved.conversation.at(-1).animationPackId).toBe(
    saved.animationPacks[0].id,
  );
  expect(saved.jobId).toBeNull();
  expect(saved.charges).toEqual([]);
  expect((await post()).status).toBe(200);
  expect(
    new GenerationStore(store.directory).get(p.id).animationPacks,
  ).toHaveLength(1);
});
it("rejects a stale project after slow native extraction instead of overwriting new work", async () => {
  let finish!: () => void;
  const gate = new Promise<void>((r) => (finish = r));
  const { post, store, p } = await setup(async () => {
    await gate;
    return pack;
  });
  const pending = post();
  await new Promise((r) => setTimeout(r, 50));
  const changed = store.get(p.id);
  changed.revision++;
  store.save(changed);
  finish();
  expect((await pending).status).toBe(409);
  expect(store.get(p.id).animationPacks).toBeUndefined();
});
it("refuses busy projects before contacting Studio", async () => {
  const fn = vi.fn(async () => pack);
  const { post, store, p } = await setup(fn);
  store.save({ ...p, jobId: "busy" });
  expect((await post()).status).toBe(409);
  expect(fn).not.toHaveBeenCalled();
});
it("requires clip data or a visible error and rejects duplicate manifest keys", () => {
  expect(
    animationPackSchema.safeParse({
      ...pack,
      entries: [{ key: "a", name: "fake" }],
    }).success,
  ).toBe(false);
  expect(
    animationPackSchema.safeParse({
      ...pack,
      entries: [pack.entries[0], pack.entries[0]],
    }).success,
  ).toBe(false);
});
it("reads chunked native clips and keeps unavailable pack entries", async () => {
  const values: any[] = [
    {
      entries: pack.entries.map(({ key, name, animationId }) => ({
        key,
        name,
        animationId,
      })),
    },
    clip,
    { ...clip, name: "Kick" },
    { captureError: "Private animation" },
  ];
  let index = 0;
  const client = {
    close: vi.fn(async () => {}),
    callTool: vi.fn(async (name: string, args: any) => {
      if (name === "get_studio_state")
        return { mode: "Edit", availableDatamodelTypes: ["Edit"] };
      if (args.code.includes("GetProductInfo")) return metadata;
      const bytes = Buffer.from(JSON.stringify(values[index++]));
      return {
        offset: 0,
        bytes: bytes.length,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        hex: bytes.toString("hex"),
      };
    }),
  };
  const result = await new StudioMarketplace(() => client).animations(
    studioId,
    metadata,
  );
  expect(result.entries).toHaveLength(3);
  expect(result.entries[2].error).toBe("Private animation");
  expect(result.entries[0].clip).toEqual(clip);
  expect(client.close).toHaveBeenCalled();
});
it("refuses animation extraction during Play", async () => {
  const client = {
    close: vi.fn(async () => {}),
    callTool: vi.fn(async () => ({
      mode: "Play",
      availableDatamodelTypes: ["Client", "Server"],
    })),
  };
  await expect(
    new StudioMarketplace(() => client).animations(studioId, metadata),
  ).rejects.toThrow("Stop Play");
  expect(client.callTool).toHaveBeenCalledTimes(1);
});
it("uses quaternion shortest-path interpolation, translations and constant holds", () => {
  const k = [
    {
      time: 0,
      rotation: [0, 3, 0] as [number, number, number],
      position: [0, 0, 0] as [number, number, number],
    },
    {
      time: 1,
      rotation: [0, -3, 0] as [number, number, number],
      position: [2, 0, 0] as [number, number, number],
    },
  ];
  const m = samplePose(k, 0.5),
    p = new THREE.Vector3(),
    q = new THREE.Quaternion(),
    s = new THREE.Vector3();
  m.decompose(p, q, s);
  expect(p.x).toBeCloseTo(1);
  expect(Math.abs(q.y)).toBeCloseTo(1);
  expect(
    new THREE.Vector3().setFromMatrixPosition(
      samplePose([{ ...k[0], easing: "Constant" }, k[1]], 0.5),
    ).x,
  ).toBe(0);
});
it("previews zero-duration pose assets without inventing motion", () => {
  const still = animationClipSchema.parse({
    ...clip,
    duration: 0,
    tracks: [{ joint: "Right Arm", keys: [{ time: 0, rotation: [1, 0, 0] }] }],
  });
  const scene = createRigScene(still);
  scene.update!(0);
  const pose = scene.root.getObjectByName("Right Arm")!.matrixWorld.clone();
  scene.update!(10);
  expect(
    scene.root.getObjectByName("Right Arm")!.matrixWorld.equals(pose),
  ).toBe(true);
  disposeScene(scene.root);
});
it("renders captured native rig data with moving geometry and rejects cyclic parents", () => {
  const native = JSON.parse(
    fs.readFileSync("tests/fixtures/roblox-r15-dance.json", "utf8"),
  );
  const parsed = animationClipSchema.parse(native),
    scene = createRigScene(parsed);
  scene.update!(0);
  const before = scene.root.getObjectByName("RightHand")!.matrixWorld.clone();
  scene.update!(0.5);
  expect(
    scene.root.getObjectByName("RightHand")!.matrixWorld.equals(before),
  ).toBe(false);
  expect(scene.bounds!.isEmpty()).toBe(false);
  disposeScene(scene.root);
  expect(
    animationClipSchema.safeParse({
      ...parsed,
      nativeRig: parsed.nativeRig!.map((p, i) =>
        i === 0 ? { ...p, parent: p.name } : p,
      ),
    }).success,
  ).toBe(false);
});
it.each([false, true])(
  "native discovery enumerates nested clips and cleans detached roots even on limit failure (%s)",
  (overflow) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-native-pack-"));
    dirs.push(dir);
    const file = path.join(dir, "discovery.luau");
    fs.writeFileSync(
      file,
      `
local function item(name,class,children)
 local v={Name=name,ClassName=class,children=children or {},Enabled=true,PlayOnRemove=true,AnimationId="rbxassetid://789"}
 function v:IsA(c) return self.ClassName==c end
 function v:GetChildren() return self.children end
 function v:Destroy() self.destroyed=true end
 return v
end
local script=item("Never execute","BaseScript")
local sound=item("Silent","Sound")
local list={item("Punch","KeyframeSequence"),item("Kick","Animation"),script,sound}
list[1].GetChildren=function() error("Discovery must not traverse the contents of a clip") end
if ${overflow} then for i=1,101 do table.insert(list,item("Extra"..i,"Animation")) end end
local root=item("Pack","Model",{item("Nested","Folder",list)})
local game={}
function game:GetObjects() return {root} end
function game:GetService(name) assert(name=="RunService");return {IsRunning=function() return false end} end
local function capture()
${animationCaptureLuau("123", "Model")}
end
local result=capture()
assert(root.destroyed and root.Parent==nil)
assert(script.Enabled==false and sound.PlayOnRemove==false)
if ${overflow} then assert(result.captureError:find("100 animations"))
else assert(#result.entries==2 and result.entries[2].animationId=="789") end
print("DETACHED_PACK_PASS")
`,
    );
    const binary = path.resolve(
      process.env.LUAU_BIN_DIR ?? ".forge/tools/luau",
      process.platform === "win32" ? "luau.exe" : "luau",
    );
    const result = spawnSync(binary, [file], {
      encoding: "utf8",
      timeout: 10000,
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("DETACHED_PACK_PASS");
  },
);
