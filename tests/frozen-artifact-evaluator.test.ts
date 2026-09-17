import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { expect, it } from "vitest";
import { createFrozenArtifactEvaluation } from "../scripts/frozen-artifact-evaluator";
import type { Bundle } from "../src/generation/schema";

const scope = "Forge_FrozenFixture",
  studio = "11111111-1111-4111-8111-111111111111";
function fixture(): Bundle {
  return {
    assets: [],
    coverage: [],
    scene: [
      {
        path: `Workspace/${scope}/Model`,
        className: "Model",
        properties: {
          PrimaryPart: { type: "Ref", path: `Workspace/${scope}/Model/Part` },
        },
      },
      {
        path: `Workspace/${scope}/Model/Part`,
        className: "Part",
        properties: {
          Anchored: true,
          Transparency: 0.5,
          Position: { type: "Vector3", value: [1, 2, 3] },
          Color: { type: "Color3", value: [0.98, 0.9, 0.25] },
        },
      },
    ],
    files: [
      {
        path: `ServerScriptService/${scope}/Nested/Game.server.luau`,
        kind: "Script",
        source: 'print("héllo")\n',
      },
    ],
  };
}
it("freezes exact inputs and emits original official script requests without embedding sources in scene apply", () => {
  const artifact = fixture(),
    before = structuredClone(artifact);
  const result = createFrozenArtifactEvaluation(artifact, scope, studio);
  expect(result.frozenArtifactJson).toBe(JSON.stringify(before));
  expect(artifact).toEqual(before);
  expect(result.scriptRequests).toEqual([
    {
      studio_id: studio,
      datamodel_type: "Edit",
      file_path: `game.ServerScriptService.${scope}.Nested.Game`,
      className: "Script",
      edits: [{ old_string: "", new_string: before.files[0].source }],
    },
  ]);
  expect(result.applyLuau).not.toContain(before.files[0].source);
  expect(result.verifyLuau).toContain("GetEditorSource");
  expect(result.verifyLuau).toContain("nativeGameplayVerified=false");
});
it.each([
  "outside",
  "scene-script",
  "mesh",
  "source",
  "ref-outside",
  "ref-script",
  "dot-file",
  "script-collision",
])(
  "rejects unsupported or out-of-scope transport before producing operations: %s",
  (kind) => {
    const artifact = fixture();
    if (kind === "outside") artifact.scene[0].path = "Workspace/Other/Model";
    if (kind === "scene-script") artifact.scene[1].className = "Script";
    if (kind === "mesh") artifact.scene[1].className = "MeshPart";
    if (kind === "source") artifact.scene[1].properties.Source = "injected";
    if (kind === "ref-outside")
      artifact.scene[0].properties.PrimaryPart = {
        type: "Ref",
        path: "Workspace/Other/Part",
      };
    if (kind === "ref-script")
      artifact.scene[0].properties.PrimaryPart = {
        type: "Ref",
        path: `ServerScriptService/${scope}/Nested/Game`,
      };
    if (kind === "dot-file")
      artifact.files[0].path = `ServerScriptService/${scope}/Dot.Parent/Game.server.luau`;
    if (kind === "script-collision")
      artifact.files.push({ ...artifact.files[0] });
    expect(() =>
      createFrozenArtifactEvaluation(artifact, scope, studio),
    ).toThrow();
  },
);

const mock = `local services={}
local methods={}
function methods:GetChildren() return table.clone(self._children) end
function methods:FindFirstChild(name) for _,child in self._children do if child.Name==name then return child end end;return nil end
function methods:Destroy() for _,child in self:GetChildren() do child:Destroy() end;self.Parent=nil end
local mt={__index=function(self,key) if key=="Parent" then return rawget(self,"_parent") end;return methods[key] or self._props[key] end,
__newindex=function(self,key,v) if key=="Parent" then local old=rawget(self,"_parent");if old then for i,c in old._children do if c==self then table.remove(old._children,i);break end end end;rawset(self,"_parent",v);if v then table.insert(v._children,self) end else self._props[key]=v end end}
local Instance={new=function(class) return setmetatable({_props={ClassName=class},_children={},_type="Instance"},mt) end}
for _,name in {"Workspace","ReplicatedStorage","ServerScriptService","ServerStorage","StarterGui","StarterPlayer"} do local object=Instance.new("Folder");object.Name=name;services[name]=object end
local starter=Instance.new("Folder");starter.Name="StarterPlayerScripts";starter.Parent=services.StarterPlayer;services.StarterPlayer.StarterPlayerScripts=starter
services.RunService={IsRunning=function() return false end}
services.ScriptEditorService={GetEditorSource=function(_,object) return object.Source end}
local game={GetService=function(_,name) return assert(services[name],name) end};local workspace=services.Workspace
local oldTypeof=typeof
local function typeof(v) if type(v)=="table" and v._type then return v._type end;return oldTypeof(v) end
local Vector3={new=function(x,y,z) return {_type="Vector3",X=x,Y=y,Z=z} end}
local Color3={new=function(r,g,b) return {_type="Color3",R=r,G=g,B=b} end}
local Vector2={new=function(x,y) return {_type="Vector2",X=x,Y=y} end}
local UDim={new=function(scale,offset) return {_type="UDim",Scale=scale,Offset=offset} end}
local UDim2={new=function(a,b,c,d) return {_type="UDim2",X=UDim.new(a,b),Y=UDim.new(c,d)} end}
local CFrame={new=function(...) local values={...};return {_type="CFrame",GetComponents=function() return table.unpack(values) end} end}
local Enum={}
`;
it("runs apply/verify offline with all roots, references, exact scripts, tolerance, tamper detection and nonempty refusal", () => {
  const result = createFrozenArtifactEvaluation(fixture(), scope, studio);
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "takko-frozen-evaluator-"),
  );
  try {
    const file = path.join(directory, "mock.luau");
    fs.writeFileSync(
      file,
      mock +
        `
local function apply() ${result.applyLuau} end
local function verify() ${result.verifyLuau} end
local applied=apply();assert(applied.ok and not applied.scriptsApplied)
for _,root in {workspace,services.ReplicatedStorage,services.ServerScriptService,services.ServerStorage,services.StarterGui,starter} do assert(root:FindFirstChild("${scope}")) end
local nested=services.ServerScriptService:FindFirstChild("${scope}"):FindFirstChild("Nested");assert(#nested:GetChildren()==0)
assert(not verify().ok,"Missing exact scripts must fail")
local script=Instance.new("Script");script.Name="Game";script.Source="print(\\\"h\\195\\169llo\\\")\\n";script.Parent=nested
local checked=verify();assert(checked.ok and checked.propertiesChecked==5 and checked.filesChecked==1)
local part=workspace:FindFirstChild("${scope}"):FindFirstChild("Model"):FindFirstChild("Part")
part.Color=Color3.new(math.floor(0.98*255)/255,math.floor(0.9*255)/255,math.floor(0.25*255)/255);assert(verify().ok,"Floor-to-byte Color3 quantization must match declared color")
part.Color=Color3.new(0.98-1.1/255,0.9,0.25);assert(not verify().ok,"Color changes exceeding one byte must fail")
part.Color=Color3.new(0.98,0.9,0.25)
part.Transparency=0.50001;assert(verify().ok)
part.Transparency=0.7;assert(not verify().ok);part.Transparency=0.5
script.Source="changed";assert(not verify().ok)
local count=#workspace:GetChildren();local ok=pcall(apply);assert(not ok and #workspace:GetChildren()==count,"Nonempty scope must refuse unchanged")
print("offline frozen evaluator passed")
`,
    );
    execFileSync(path.resolve(".forge/tools/luau/luau-compile.exe"), [file], {
      windowsHide: true,
      stdio: "pipe",
      timeout: 10000,
    });
    const output = execFileSync(
      path.resolve(".forge/tools/luau/luau.exe"),
      [file],
      { windowsHide: true, encoding: "utf8", timeout: 10000 },
    );
    expect(output).toContain("offline frozen evaluator passed");
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
