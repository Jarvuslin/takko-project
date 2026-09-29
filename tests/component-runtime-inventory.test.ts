import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";
import {
  componentArchiveLuau,
  componentRuntimeInventoryLuau,
} from "../src/generation/component-archive";

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0))
    fs.rmSync(directory, { recursive: true, force: true });
});

function runLuau(body: string) {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "takko-runtime-inventory-"),
  );
  directories.push(directory);
  const file = path.join(directory, "fixture.luau");
  fs.writeFileSync(file, world + "\n" + body);
  const executable = path.resolve(
    process.env.LUAU_BIN_DIR ?? ".forge/tools/luau",
    process.platform === "win32" ? "luau.exe" : "luau",
  );
  expect(
    execFileSync(executable, [file], {
      encoding: "utf8",
      timeout: 10000,
      windowsHide: true,
    }),
  ).toContain("PASS offline runtime inventory");
}

// Executes production Luau against explicit table-backed Studio service doubles.
// Serialization returns a separately constructed durable tree. This tests policy
// and comparison logic, not Roblox serialization or touch-listener reconstruction.
const world = String.raw`
local nativeTypeof=typeof
local function typeof(value)
  if type(value)=="table" and value.mockInstance then return "Instance" end
  return nativeTypeof(value)
end
SecurityCapabilities={new=function() return "empty" end}
local destroyed=0
local function item(className,name,parent)
  local x={mockInstance=true,ClassName=className,Name=name,Parent=parent,
    Archivable=true,Sandboxed=false,Capabilities="empty",children={},attrs={},tags={}}
  if parent then table.insert(parent.children,x) end
  function x:IsA(kind)
    return self.ClassName==kind or kind=="BasePart" and self.ClassName=="Part"
      or kind=="LuaSourceContainer" and self.ClassName=="Script"
      or kind=="BaseScript" and self.ClassName=="Script"
  end
  function x:GetChildren() return table.clone(self.children) end
  function x:GetDescendants()
    if self.finalHook then local hook=self.finalHook;self.finalHook=nil;hook() end
    local descendants={}
    local function walk(parent)
      for _,child in parent.children do table.insert(descendants,child);walk(child) end
    end
    walk(self);return descendants
  end
  function x:GetAttributes() return table.clone(self.attrs) end
  function x:GetTags() return table.clone(self.tags) end
  function x:Destroy() destroyed+=1 end
  return x
end
local function tree(includeMarker)
  local root=item("Model","Original")
  local part=item("Part","Contact",root)
  local marker=includeMarker and item("TouchTransmitter","TouchInterest",part) or nil
  local source=item("Script","LaterSource",part)
  source.Source="error('source must never execute')";source.Disabled=false;source.RunContext="Legacy"
  local folder=item("Folder","LaterFolder",root)
  local ref=item("ObjectValue","DurableReference",folder);ref.Value=source
  return root,part,marker,source,ref
end
local original,part,marker,source,ref=tree(true)
local copied,copiedPart,_,copiedSource,copiedRef=tree(false)
local serializeHook=nil
local services={
  RunService={IsRunning=function() return false end},
  ScriptEditorService={GetEditorSource=function(_,x) return x.Source end},
  ReflectionService={GetPropertiesOfClass=function(_,className)
    return className=="ObjectValue" and {{Name="Value",Serialized=true}} or {}
  end},
  EncodingService={Base64Encode=function(_,bytes) return bytes end},
  SerializationService={
    SerializeInstancesAsync=function(roots)
      if serializeHook then serializeHook() end
      return buffer.fromstring("offline serialization fixture")
    end,
    DeserializeInstancesAsync=function() return {copied} end,
  },
}
game={GetService=function(_,name) return assert(services[name],name) end}
version=function() return "offline-mock" end
`;

describe("runtime-only component inventory (offline Luau policy)", () => {
  it("omits only the standard marker and keeps later sources, parents and references aligned", () => {
    runLuau(`${componentArchiveLuau}
local result=captureComponentArchive(original)
assert(result.status=="captured" and result.roundTrip.passed)
assert(#result.nodes==5 and #result.sources==1)
assert(result.nodes[3].name=="LaterSource" and result.nodes[3].parentIndex==2)
assert(result.sources[1].index==3 and result.sources[1].source==source.Source)
assert(result.nodes[5].name=="DurableReference" and result.nodes[5].parentIndex==4)
assert(result.roundTrip.checkedReferences==1)
assert(#result.runtimeOnlyInstances==1)
local observed=result.runtimeOnlyInstances[1]
assert(observed.parentIndex==2 and observed.name=="TouchInterest" and observed.className=="TouchTransmitter")
assert(observed.reconstruction=="touch_listener_required_unverified")
assert(marker.Parent==part and part.children[1]==marker and #part.children==2)
assert(not result.executed and destroyed==1)
print("PASS offline runtime inventory")`);
  });

  it.each([
    ["attributes", 'marker.attrs.custom="keep"'],
    ["tags", 'marker.tags={"custom"}'],
    ["children", 'item("Folder","CustomChild",marker)'],
    ["name", 'marker.Name="CustomTouch"'],
    ["parent", "marker.Parent=original"],
    ["sandbox", "marker.Sandboxed=true"],
    ["capabilities", 'marker.Capabilities="Network"'],
    ["Archivable", "marker.Archivable=false"],
  ])("rejects custom %s instead of omitting it", (_name, mutation) => {
    runLuau(`${mutation}
${componentRuntimeInventoryLuau}
local ok,reason=pcall(function() return componentPersistentChildren(part) end)
assert(not ok and string.find(tostring(reason),"Nonstandard TouchTransmitter",1,true))
assert(part.children[1]==marker and destroyed==0)
print("PASS offline runtime inventory")`);
  });

  it("rejects a persistent reference to the omitted marker even when the restored reference is nil", () => {
    runLuau(`ref.Value=marker;copiedRef.Value=nil
${componentArchiveLuau}
local result=captureComponentArchive(original)
assert(result.status=="captured" and not result.roundTrip.passed)
assert(string.find(result.roundTrip.reason,"runtime-only instance reference",1,true))
assert(destroyed==1 and ref.Value==marker)
print("PASS offline runtime inventory")`);
  });

  it("still rejects unrelated durable instance loss", () => {
    runLuau(`copied.children[2].children={}
${componentArchiveLuau}
local result=captureComponentArchive(original)
assert(result.status=="captured" and not result.roundTrip.passed)
assert(string.find(result.roundTrip.reason,"instance count 5->4",1,true))
assert(string.find(result.roundTrip.reason,"ObjectValue:1->0",1,true))
assert(destroyed==1)
print("PASS offline runtime inventory")`);
  });

  it.each([
    [
      "runtime attributes",
      'marker.attrs.afterYield="changed"',
      "Nonstandard TouchTransmitter",
    ],
    [
      "runtime identity",
      'local replacement=item("TouchTransmitter","TouchInterest");replacement.Parent=part;part.children[1]=replacement',
      "identity changed",
    ],
    [
      "runtime parent",
      "marker.Parent=original",
      "Runtime-only instance changed",
    ],
    [
      "durable identity",
      'local replacement=item("Script","LaterSource");replacement.Parent=part;part.children[2]=replacement',
      "identity changed",
    ],
  ])(
    "rejects post-yield %s changes in the final inventory",
    (_name, mutation, reason) => {
      runLuau(`original.finalHook=function() ${mutation} end
${componentArchiveLuau}
local result=captureComponentArchive(original)
assert(result.status=="captured" and not result.roundTrip.passed)
assert(string.find(result.roundTrip.reason,${JSON.stringify(reason)},1,true),result.roundTrip.reason)
assert(destroyed==1)
print("PASS offline runtime inventory")`);
    },
  );

  it("rejects source changes across the serialization yield", () => {
    runLuau(`serializeHook=function() source.Source="changed after inventory" end
${componentArchiveLuau}
local result=captureComponentArchive(original)
assert(result.status=="captured" and not result.roundTrip.passed)
assert(string.find(result.roundTrip.reason,"script bytes",1,true))
assert(result.sources[1].source=="error('source must never execute')" and destroyed==1)
print("PASS offline runtime inventory")`);
  });
});
