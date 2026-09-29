import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { afterEach, expect, it } from "vitest";
import { studioTestIsolation } from "../scripts/studio-test-isolation";

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0))
    fs.rmSync(directory, { recursive: true, force: true });
});
const nonce = "508b999e-de2c-4a83-9397-72e004b22b01";
const fixture = String.raw`
local writes,created,destroyed=0,0,0
local running=false
local methods={};local node={}
node.__index=function(self,key)return methods[key] or self.p[key] end
node.__newindex=function(self,key,value)
 if key=="Parent" then
  if self.p.Parent then local index=table.find(self.p.Parent.children,self);if index then table.remove(self.p.Parent.children,index) end end
  if value then table.insert(value.children,self) end
 elseif key=="Disabled" then writes+=1 end
 self.p[key]=value
end
local function item(className,name,parent,disabled,source)
 local self=setmetatable({p={ClassName=className,Name=name,Disabled=disabled,Source=source},children={},attrs={}},node)
 self.Parent=parent;return self
end
function methods:GetChildren()return table.clone(self.children)end
function methods:GetDescendants()local all={};local function walk(p)for _,v in p.children do table.insert(all,v);walk(v) end end;walk(self);return all end
function methods:IsA(class)return self.ClassName==class or class=="BaseScript" and (self.ClassName=="Script" or self.ClassName=="LocalScript") end
function methods:IsDescendantOf(parent)local p=self.Parent;while p do if p==parent then return true end;p=p.Parent end;return false end
function methods:SetAttribute(key,value)self.attrs[key]=value end
function methods:GetAttribute(key)return self.attrs[key]end
function methods:Destroy()destroyed+=1;for _,v in self:GetChildren()do v:Destroy()end;self.Parent=nil end
local root=item("DataModel","Game")
local workspace=item("Service","Workspace",root)
local storage=item("Service","ServerStorage",root)
local enabled=item("Script","Enabled",workspace,false,"source_enabled")
local disabled=item("LocalScript","Disabled",workspace,true,"source_disabled")
local module=item("ModuleScript","Dependency",workspace,nil,"module_source")
local stored=item("Script","Stored",storage,false,"storage_source")
Instance={new=function(className)created+=1;return item(className,className)end}
Enum={HashAlgorithm={Sha256="sha256"}}
local services={ServerStorage=storage,RunService={IsRunning=function()return running end},
 ScriptEditorService={GetEditorSource=function(_,script)assert(not script.DenySource,"Source access denied");return script.Source end},
 -- Controlled deterministic digest double: these tests execute the emitted
 -- identity checks, not Roblox's implementation of SHA256.
 EncodingService={ComputeStringHash=function(_,source,algorithm)assert(algorithm=="sha256");return string.char(#source%255)..string.rep(source,32):sub(1,31) end},
 HttpService={JSONEncode=function(_,value)return value.operation end}}
game={GetService=function(_,name)return assert(services[name],name)end,GetDescendants=function()return root:GetDescendants()end}
local function record(name)for _,v in storage:GetChildren()do if v.Name==name then return v end end end
`;
function run(body: string) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "takko-isolation-"));
  directories.push(directory);
  const file = path.join(directory, "fixture.luau");
  fs.writeFileSync(
    file,
    fixture + "\n" + body + '\nprint("ISOLATION_VERIFIED")',
  );
  const suffix = process.platform === "win32" ? ".exe" : "";
  execFileSync(
    path.resolve(
      process.env.LUAU_BIN_DIR ?? ".forge/tools/luau",
      "luau-compile" + suffix,
    ),
    [file],
    { windowsHide: true, timeout: 10000, stdio: "pipe" },
  );
  expect(
    execFileSync(
      path.resolve(
        process.env.LUAU_BIN_DIR ?? ".forge/tools/luau",
        "luau" + suffix,
      ),
      [file],
      {
        windowsHide: true,
        timeout: 10000,
        encoding: "utf8",
      },
    ),
  ).toContain("ISOLATION_VERIFIED");
}
const invoke = (code: string) => `(function()\n${code}\nend)()`;

it("validates a caller nonce and bounded count before emitting any code", () => {
  for (const value of ["", 'nonce";error()', "../../foreign"])
    expect(() => studioTestIsolation({ nonce: value })).toThrow("nonce");
  for (const countLimit of [0, 101, 1.5, NaN])
    expect(() => studioTestIsolation({ nonce, countLimit })).toThrow(
      "count limit",
    );
  expect(studioTestIsolation({ nonce }).recordScope).not.toBe(
    studioTestIsolation({ nonce: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" })
      .recordScope,
  );
});
it("roundtrips original enabled/disabled flags and preserves unrelated new scripts and storage code", () => {
  const code = studioTestIsolation({ nonce });
  run(`assert(${invoke(code.pause)}=="pause")
local saved=assert(record(${JSON.stringify(code.recordScope)}));assert(saved:GetAttribute("Phase")=="paused")
assert(#saved:GetChildren()==2 and enabled.Disabled and disabled.Disabled and not stored.Disabled)
local added=item("Script","UnrelatedNew",workspace,false,"new_source")
assert(${invoke(code.restore)}=="restore")
assert(not enabled.Disabled and disabled.Disabled and not added.Disabled and not stored.Disabled)
assert(enabled.Source=="source_enabled" and disabled.Source=="source_disabled" and module.Source=="module_source")
assert(record(${JSON.stringify(code.recordScope)})==nil and added.Parent==workspace and stored.Parent==storage)`);
});
it.each([
  "source",
  "parent",
  "name",
  "class",
  "missing",
  "enablement",
  "ownership",
  "uncertain",
  "play",
])(
  "refuses %s changes before any restoration writes, retaining its recovery record",
  (kind) => {
    const code = studioTestIsolation({ nonce });
    const changes: Record<string, string> = {
      source: 'disabled.Source="changed_original_source"',
      parent: "disabled.Parent=storage",
      name: 'disabled.Name="Changed"',
      class: 'disabled.ClassName="Script"',
      missing: "disabled.Parent=nil",
      enablement: "disabled.Disabled=false",
      ownership: 'saved:SetAttribute("Token","foreign")',
      uncertain: 'saved:SetAttribute("Phase","pausing")',
      play: "running=true",
    };
    run(`${invoke(code.pause)}
local saved=assert(record(${JSON.stringify(code.recordScope)}))
${changes[kind]}
local before=writes;local beforeDestroyed=destroyed
local ok=pcall(function()${code.restore}\nend)
assert(not ok and writes==before and destroyed==beforeDestroyed)
assert(record(${JSON.stringify(code.recordScope)})==saved and enabled.Disabled)`);
  },
);
it.each(["source-read", "count", "play", "existing-record"])(
  "preflight %s failure leaves all original flags unchanged without creating a record",
  (kind) => {
    const code = studioTestIsolation({
      nonce,
      countLimit: kind === "count" ? 1 : 100,
    });
    const change =
      kind === "source-read"
        ? "disabled.DenySource=true"
        : kind === "play"
          ? "running=true"
          : kind === "existing-record"
            ? `item("Folder",${JSON.stringify(code.recordScope)},storage)`
            : "";
    run(`${change}
local before=record(${JSON.stringify(code.recordScope)});local beforeCreates=created;local beforeDestroyed=destroyed
local ok=pcall(function()${code.pause}\nend)
assert(not ok and writes==0 and created==beforeCreates and destroyed==beforeDestroyed)
assert(not enabled.Disabled and disabled.Disabled and not stored.Disabled)
assert(record(${JSON.stringify(code.recordScope)})==before)`);
  },
);
