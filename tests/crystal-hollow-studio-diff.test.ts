import { expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createCrystalHollowSceneDiff } from "../scripts/crystal-hollow-studio-diff";
import type { Bundle } from "../src/generation/schema";
const root = "Workspace/Forge_GenerationPilot/World";
function fixture(): Bundle {
  return {
    files: [],
    coverage: [],
    assets: [],
    scene: [
      { path: root, className: "Folder", properties: {} },
      {
        path: root + "/Floor",
        className: "Part",
        properties: { Anchored: true, Transparency: 0 },
      },
    ],
  };
}
it("plans parent-first scoped additions and preserves same-class identity while identifying leaf replacements", () => {
  const old = fixture(),
    next = structuredClone(old);
  next.scene[1].properties.Transparency = 0.25;
  next.scene.push(
    {
      path: root + "/Art/Shard",
      className: "WedgePart",
      properties: { Anchored: true },
    },
    { path: root + "/Art", className: "Folder", properties: {} },
  );
  const plan = createCrystalHollowSceneDiff(old, next);
  expect(plan.changes.map((change) => change.path)).toEqual([
    root + "/Art",
    root + "/Floor",
    root + "/Art/Shard",
  ]);
  expect(
    plan.changes.find((change) => change.path.endsWith("/Floor"))?.kind,
  ).toBe("update");
  next.scene[1].className = "WedgePart";
  expect(
    createCrystalHollowSceneDiff(old, next).changes.find((change) =>
      change.path.endsWith("/Floor"),
    )?.kind,
  ).toBe("replace");
  expect(plan.lua.indexOf("Original property changed:")).toBeLessThan(
    plan.lua.indexOf("history:TryBeginRecording"),
  );
  expect(plan.lua.indexOf("history:TryBeginRecording")).toBeLessThan(
    plan.lua.indexOf("old.Parent = nil"),
  );
  expect(plan.lua).not.toContain("Source =");
});
it("ignores script changes and outside-world scene changes rather than inserting their code", () => {
  const old = fixture(),
    next = fixture();
  next.files.push({
    path: "ServerScriptService/Forge_GenerationPilot/Game.server.luau",
    kind: "Script",
    source: 'error("NOT_FOR_INSERTION")',
  });
  next.scene.push({
    path: "Workspace/Other/Part",
    className: "Part",
    properties: { Transparency: 0.9 },
  });
  const plan = createCrystalHollowSceneDiff(old, next);
  expect(plan.changes).toEqual([]);
  expect(plan.lua).not.toContain("NOT_FOR_INSERTION");
  expect(plan.lua).not.toContain("Workspace/Other");
});
it.each(["Sound", "RemoteEvent", "Humanoid", "Explosion", "MeshPart"] as const)(
  "rejects non-decoration class %s",
  (className) => {
    const old = fixture(),
      next = fixture();
    next.scene.push({ path: root + "/Unsafe", className, properties: {} });
    expect(() => createCrystalHollowSceneDiff(old, next)).toThrow(
      "not allowed",
    );
  },
);
it("rejects escaping references, traversal, missing parents, implicit deletions and property removals", () => {
  const old = fixture();
  let next = fixture();
  next.scene.push({
    path: root + "/Label",
    className: "BillboardGui",
    properties: { Adornee: { type: "Ref", path: "Workspace/Other/Part" } },
  });
  expect(() => createCrystalHollowSceneDiff(old, next)).toThrow("escapes");
  next = fixture();
  next.scene.push({
    path: root + "/../Other",
    className: "Folder",
    properties: {},
  });
  expect(() => createCrystalHollowSceneDiff(old, next)).toThrow("world path");
  next = fixture();
  next.scene.push({
    path: root + "/Absent/Child",
    className: "Part",
    properties: {},
  });
  expect(() => createCrystalHollowSceneDiff(old, next)).toThrow(
    "every world parent",
  );
  next = fixture();
  next.scene.pop();
  expect(() => createCrystalHollowSceneDiff(old, next)).toThrow("deletion");
  next = fixture();
  delete next.scene[1].properties.Anchored;
  expect(() => createCrystalHollowSceneDiff(old, next)).toThrow(
    "property removal",
  );
});
it("rejects replacement of geometry with child objects or manifest references", () => {
  const old = fixture(),
    next = fixture();
  next.scene[1].className = "WedgePart";
  old.scene.push({
    path: root + "/Floor/Child",
    className: "Folder",
    properties: {},
  });
  next.scene.push(old.scene[2]);
  expect(() => createCrystalHollowSceneDiff(old, next)).toThrow(
    "with children",
  );
  old.scene.pop();
  next.scene.pop();
  old.scene.push({
    path: root + "/Label",
    className: "BillboardGui",
    properties: { Adornee: { type: "Ref", path: root + "/Floor" } },
  });
  next.scene.push(old.scene[2]);
  expect(() => createCrystalHollowSceneDiff(old, next)).toThrow(
    "referenced geometry",
  );
});
it("rejects invalid native properties, typed vector dimensions and unrecognized enums", () => {
  const old = fixture();
  let next = fixture();
  next.scene[1].properties.Source = "print(1)";
  expect(() => createCrystalHollowSceneDiff(old, next)).toThrow("Forbidden");
  next = fixture();
  next.scene[1].properties.Size = { type: "Vector3", value: [1, 2] };
  expect(() => createCrystalHollowSceneDiff(old, next)).toThrow(
    "component count",
  );
  next = fixture();
  next.scene[1].properties.Material = { type: "Enum", enum: "Font", value: 19 };
  expect(() => createCrystalHollowSceneDiff(old, next)).toThrow(
    "Enum.Material",
  );
  next = fixture();
  next.scene[1].properties.Scale = 2;
  expect(() => createCrystalHollowSceneDiff(old, next)).toThrow(
    "not a writable",
  );
});
it("encodes text as Lua string data even when it contains quotes, control characters or code-like content", () => {
  const old = fixture(),
    next = fixture();
  next.scene.push({
    path: root + "/Label",
    className: "TextLabel",
    properties: { Text: '"}; error("injection"); --\n\u0000💎' },
  });
  const plan = createCrystalHollowSceneDiff(old, next);
  expect(plan.lua).not.toContain('"}; error("injection")');
  expect(plan.lua).toContain("\\034");
  expect(plan.lua).toContain("\\000");
});
it.each(["restore-fails", "cleanup-fails", "restores-all"])(
  "executes generated rollback and reports its actual restoration outcome (%s)",
  (mode) => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "takko-diff-test-"),
    );
    try {
      const full = createCrystalHollowSceneDiff(fixture(), fixture()).lua;
      const rollback = full.slice(
        full.indexOf("if not ok then\n  local rollbackErrors"),
        full.indexOf("-- Keep detached originals"),
      );
      const testSource = `
local mode = "${mode}"
local Instance = {new=function() return {Destroy=function() end} end}
${full.slice(full.indexOf("local function canonicalExpected"), full.indexOf("local function decode"))}
local restoredValue = 0.25
local propertyAttempts, cleanupAttempts, parentAttempts, historyAttempts = 0, 0, 0, 0
local old = setmetatable({}, {
  __index = function(_, name) if name == "Transparency" then return restoredValue end end,
  __newindex = function(_, name, value)
    propertyAttempts += 1
    if mode == "restore-fails" then error("injected property restore failure") end
    restoredValue = value
  end,
})
local preparedObject = { Parent = {} }
function preparedObject:Destroy()
  cleanupAttempts += 1
  if mode == "cleanup-fails" then error("injected cleanup failure") end
  self.Parent = nil
end
local originalParent = {}
local detachedParent = nil
local detachedObject = setmetatable({}, {
  __index = function(_, name) if name == "Parent" then return detachedParent end end,
  __newindex = function(_, name, value) parentAttempts += 1; detachedParent = value end,
})
local undoProperties = {[old] = {{name="Transparency", value=0}}}
local prepared = {["Workspace/Forge_GenerationPilot/World/Art/New"] = preparedObject}
local detached = {[detachedObject] = originalParent}
local objectPaths = {[old]="Workspace/Forge_GenerationPilot/World/Floor",[detachedObject]="Workspace/Forge_GenerationPilot/World/Shard"}
local history = {}
function history:FinishRecording(recording, action) historyAttempts += 1 end
local Enum = {FinishRecordingOperation={Cancel="cancel"}}
local recording = "recording"
local ok, failure = false, "injected later mutation failure"
local caught, message = pcall(function()
${rollback}
end)
assert(not caught)
assert(propertyAttempts == 1 and cleanupAttempts == 1 and parentAttempts == 1 and historyAttempts == 1, "every restoration must be attempted")
assert(detachedParent == originalParent)
if mode == "restores-all" then
  assert(restoredValue == 0 and preparedObject.Parent == nil)
  assert(string.find(message, "Scene diff rolled back", 1, true))
  assert(not string.find(message, "incomplete", 1, true))
else
  assert(string.find(message, "rollback incomplete", 1, true))
  assert(not string.find(message, "Scene diff rolled back:", 1, true))
  assert(string.find(message, "Workspace/Forge_GenerationPilot/World/", 1, true))
end
print("PASS generated rollback " .. mode)
`;
      const file = path.join(directory, "rollback.luau");
      fs.writeFileSync(file, testSource);
      const output = execFileSync(
        path.resolve("research/tools/luau/luau.exe"),
        [file],
        { encoding: "utf8", windowsHide: true, timeout: 10000 },
      );
      expect(output).toContain("PASS generated rollback " + mode);
      const generated = path.join(directory, "diff.luau");
      fs.writeFileSync(generated, full);
      execFileSync(
        path.resolve("research/tools/luau/luau-compile.exe"),
        ["--null", generated],
        { windowsHide: true, timeout: 10000 },
      );
    } finally {
      const target = path.resolve(directory);
      if (
        !target.startsWith(path.resolve(os.tmpdir()) + path.sep) ||
        !path.basename(target).startsWith("takko-diff-test-")
      )
        throw Error("Unexpected cleanup path");
      fs.rmSync(target, { recursive: true, force: true });
    }
  },
);

it.each(["setter-equivalent", "changed-color", "changed-unspecified"])(
  "executes preflight with exact setter canonicalization and pristine defaults (%s)",
  (mode) => {
    const before = fixture();
    before.scene[1].properties = { Color: { type: "Color3", value: [0.2, 0.23, 0.29] } };
    const after = structuredClone(before);
    after.scene[1].properties.Color = { type: "Color3", value: [0.5, 0.6, 0.7] };
    after.scene[1].properties.Transparency = 0.25;
    const full = createCrystalHollowSceneDiff(before, after).lua;
    const helpers = full.slice(full.indexOf("local function defaultFor"), full.indexOf("local preflightOk"));
    const preflight = full.slice(full.indexOf("  for _, change in ipairs(changes) do"), full.indexOf("  if next(replacements) then"));
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "takko-diff-test-"));
    try {
      const source = `
local mode = "${mode}"
local colors = {}
local Color3 = {new=function(r,g,b)
  local key = tostring(r) .. ":" .. tostring(g) .. ":" .. tostring(b)
  if not colors[key] then colors[key] = {r=r,g=g,b=b} end
  return colors[key]
end}
local function quantize(color)
  return Color3.new(math.floor(color.r*255)/255, math.floor(color.g*255)/255, math.floor(color.b*255)/255)
end
local liveWrites, shadows, destroyed = 0, 0, 0
local Instance = {new=function(className)
  assert(className == "Part", "must use exact class")
  shadows += 1
  local values = {Transparency=0, Color=Color3.new(0,0,0), ClassName=className}
  return setmetatable({}, {
    __index=function(_, name)
      if name == "Destroy" then return function() destroyed += 1 end end
      return values[name]
    end,
    __newindex=function(_, name, value) values[name] = name == "Color" and quantize(value) or value end,
  })
end}
local world = {}
local original = Color3.new(.2,.23,.29)
local actual = quantize(original)
assert(actual ~= original, "fixture must reproduce setter normalization")
if mode == "changed-color" then actual = quantize(Color3.new(.3,.23,.29)) end
local live = setmetatable({}, {
  __index=function(_, name)
    if name == "ClassName" then return "Part" end
    if name == "Color" then return actual end
    if name == "Transparency" then return mode == "changed-unspecified" and .3 or 0 end
    if name == "IsDescendantOf" then return function(_, parent) return parent == world end end
  end,
  __newindex=function() liveWrites += 1; error("preflight must not write live instance") end,
})
local function resolveExact() return live end
local originals, prepared, defaults, undoProperties, replacements, objectPaths = {}, {}, {}, {}, {}, {}
local changes = {{kind="update",path="${root}/Floor",before={className="Part",properties={Color={type="Color3",value={.2,.23,.29}}}},after={properties={Color={type="Color3",value={.5,.6,.7}},Transparency=.25}}}}
local Vector3, CFrame, UDim2, UDim, Vector2 = {}, {}, {}, {}, {}
${helpers}
local ok, failure = pcall(function()
${preflight}
end)
cleanupDefaults()
assert(liveWrites == 0 and destroyed == shadows, "preflight shadows cleaned without live mutation")
if mode == "setter-equivalent" then assert(ok, tostring(failure))
elseif mode == "changed-color" then assert(not ok and string.find(failure, "Original property changed", 1, true))
else assert(not ok and string.find(failure, "Previously unspecified property changed", 1, true)) end
print("PASS canonical preflight " .. mode)
`;
      const file = path.join(directory, "canonical.luau");
      fs.writeFileSync(file, source);
      const output = execFileSync(path.resolve("research/tools/luau/luau.exe"), [file], {encoding:"utf8",windowsHide:true,timeout:10000});
      expect(output).toContain("PASS canonical preflight " + mode);
    } finally {
      const target = path.resolve(directory);
      if (!target.startsWith(path.resolve(os.tmpdir()) + path.sep) || !path.basename(target).startsWith("takko-diff-test-")) throw Error("Unexpected cleanup path");
      fs.rmSync(target, {recursive:true,force:true});
    }
  },
);

it.each(["strict-abort", "optin-applies", "optin-rollback", "recording-api-fails"])(
  "executes the explicit recording policy without claiming independent undo (%s)",
  (mode) => {
    const before = fixture(), after = fixture();
    after.scene[1].properties.Transparency = 0.5;
    const full = createCrystalHollowSceneDiff(before, after, mode === "strict-abort" ? {} : {requireOwnUndoRecording:false}).lua;
    expect(full).toContain("local requireOwnUndoRecording = " + (mode === "strict-abort" ? "true" : "false"));
    const execution = full.slice(full.indexOf('local history = game:GetService("ChangeHistoryService")'));
    const helper = full.slice(full.indexOf("local function canonicalExpected"),full.indexOf("local function decode"));
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "takko-diff-test-"));
    try {
      const source = `
local mode = "${mode}"
local requireOwnUndoRecording = mode == "strict-abort"
local Instance = {new=function() return {Destroy=function() end} end}
${helper}
local current, writes, finishes = 0, 0, 0
local object = setmetatable({}, {
  __index=function(_, name) if name == "ClassName" then return "Part" end; return current end,
  __newindex=function(_, name, value)
    writes += 1
    current = value
    if mode == "optin-rollback" and value == .5 then error("injected apply failure after mutation") end
  end,
})
local history = {}
function history:TryBeginRecording()
  if mode == "recording-api-fails" then error("injected recording API failure") end
  return nil
end
function history:FinishRecording() finishes += 1; error("must not finish missing recording") end
local game = {GetService=function() return history end}
local changes = {{kind="update",path="${root}/Floor",after={properties={Transparency=.5}}}}
local prepared = {}
local originals = {["${root}/Floor"]=object}
local undoProperties = {[object]={{name="Transparency",value=0}}}
local objectPaths = {[object]="${root}/Floor"}
local function decode(value) return value end
local ok, result = pcall(function()
${execution}
end)
assert(finishes == 0, "must not commit or cancel a recording that does not exist")
if mode == "strict-abort" or mode == "recording-api-fails" then
  assert(not ok and writes == 0 and current == 0)
  assert(string.find(result, "Undo recording unavailable; live scene unchanged", 1, true))
elseif mode == "optin-applies" then
  assert(ok and current == .5 and writes == 1, tostring(result))
  assert(result.applied == 1 and result.ownUndoRecorded == false and result.undoRecorded == false)
else
  assert(not ok and current == 0 and writes == 2)
  assert(string.find(result, "Scene diff rolled back:", 1, true))
end
print("PASS undo policy " .. mode)
`;
      const file = path.join(directory,"recording.luau");
      fs.writeFileSync(file,source);
      const output = execFileSync(path.resolve("research/tools/luau/luau.exe"),[file],{encoding:"utf8",windowsHide:true,timeout:10000});
      expect(output).toContain("PASS undo policy " + mode);
    } finally {
      const target = path.resolve(directory);
      if (!target.startsWith(path.resolve(os.tmpdir()) + path.sep) || !path.basename(target).startsWith("takko-diff-test-")) throw Error("Unexpected cleanup path");
      fs.rmSync(target,{recursive:true,force:true});
    }
  },
);
