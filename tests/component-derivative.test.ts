import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";
import { persistComponentArchive } from "../src/generation/component-archive";
import {
  persistComponentDerivative,
  readComponentOriginal,
  componentRestrictionLuau,
} from "../src/generation/component-derivative";

const directories: string[] = [];
afterEach(() =>
  directories
    .splice(0)
    .forEach((directory) =>
      fs.rmSync(directory, { recursive: true, force: true }),
    ),
);
function setup() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "takko-derivative-"));
  directories.push(directory);
  // Transport envelopes only. These bytes are not native-model proof.
  const bytes = Buffer.from("<roblox!\x89\xff\r\n\x1a\noriginal", "latin1");
  const snapshot = {
    status: "captured",
    format: "roblox-native-rbxm-v1",
    engineVersion: "offline-fixture",
    bytes: bytes.length,
    base64: bytes.toString("base64"),
    nodes: [
      { index: 1, parentIndex: 0, name: "Root", className: "Model" },
      ...Array.from({ length: 76 }, (_, i) => ({
        index: i + 2,
        parentIndex: 1,
        name: "Script",
        className: "Script",
      })),
    ],
    sources: Array.from({ length: 76 }, (_, i) => ({
      index: i + 2,
      className: "Script",
      source: "return 1",
      sourceBytes: 8,
      disabled: false,
      runContext: "Enum.RunContext.Legacy",
    })),
    sourceBytes: 76 * 8,
    executed: false,
    roundTrip: {
      passed: true,
      checkedProperties: 1,
      checkedAttributes: 0,
      checkedReferences: 0,
      unobservableProperties: [],
      ignoredIdentityProperties: [],
    },
  };
  const original = persistComponentArchive(
    {
      ...snapshot,
      roundTrip: {
        passed: false,
        stage: "deserialize",
        reason: "Capability unavailable",
      },
    },
    directory,
  );
  if (original.status !== "captured") throw Error("Fixture unavailable");
  const originalHashes = {
    archiveHash: original.sha256,
    manifestHash: path.basename(original.manifestFile!, ".component.json"),
  };
  const derivativeBytes = Buffer.from(
    "<roblox!\x89\xff\r\n\x1a\nderivative",
    "latin1",
  );
  const payload = {
    snapshot: {
      ...snapshot,
      bytes: derivativeBytes.length,
      base64: derivativeBytes.toString("base64"),
    },
    security: {
      currentCapabilities: ["Basic"],
      instances: snapshot.nodes.map((node) => ({
        index: node.index,
        sandboxedBefore: true,
        sandboxedAfter: true,
        before: ["Basic", "Network"],
        after: ["Basic"],
        removed: ["Network"],
      })),
    },
  };
  const binding = {
    studioId: "offline-studio",
    scope: "TestScope",
    token: randomUUID(),
    candidateId: "123",
    inputHash: "a".repeat(64),
  };
  const run = () =>
    persistComponentDerivative(directory, originalHashes, payload, binding);
  return { directory, original, originalHashes, payload, binding, run };
}
describe("restricted component persistence and complete review input (offline)", () => {
  it.each(["preserve", "source", "unsaved", "disabled", "hierarchy"])(
    "runs the fixed Luau restriction template with %s preflight evidence",
    (mode) => {
      const f = setup();
      const file = path.join(f.directory, "restriction.luau");
      fs.writeFileSync(
        file,
        `
local mode=${JSON.stringify(mode)}
local mt={};mt.__index=mt;mt.__eq=function(a,b) return a.bits==b.bits end
local function caps(bits) return setmetatable({bits=bits},mt) end
function mt:Remove(other) return caps(bit32.band(self.bits,bit32.bnot(other.bits))) end
function mt:Contains(other) return bit32.band(self.bits,other.bits)==other.bits end
SecurityCapabilities={fromCurrent=function() return caps(1) end}
Enum={SecurityCapability={GetEnumItems=function() return {{Name="Basic",bits=1},{Name="Network",bits=2}} end}}
local root={Name="Root",ClassName="Model",Sandboxed=false,Capabilities=caps(3)}
local script={Name="Script",ClassName="Script",Source="error('never execute')",Disabled=false,RunContext="Legacy",Sandboxed=true,Capabilities=caps(3)}
function root:IsA() return false end
function root:GetChildren() return {script} end
function script:IsA(name) return name=="LuaSourceContainer" or name=="BaseScript" end
function script:GetChildren() return {} end
local captures=0
local function captureComponentArchive(item) assert(item==root);captures+=1;return {status="captured"} end
game={GetService=function(_,name)
 if name=="RunService" then return {IsRunning=function() return false end} end
 if name=="ScriptEditorService" then return {GetEditorSource=function(_,item) return mode=="unsaved" and "changed" or item.Source end} end
 error(name)
end}
local original={status="captured",nodes={{index=1,parentIndex=0,name="Root",className="Model"},{index=2,parentIndex=1,name="Script",className="Script"}},sources={{index=2,source=script.Source,disabled=false,runContext="Legacy"}}}
if mode=="source" then script.Source="changed" end
if mode=="disabled" then script.Disabled=true end
if mode=="hierarchy" then script.Name="changed" end
${componentRestrictionLuau}
local ok,result=pcall(function() return restrictComponentArchive(root,original) end)
if mode=="preserve" then
 assert(ok and captures==1 and #result.security.instances==2)
 assert(root.Capabilities.bits==1 and script.Capabilities.bits==1)
 assert(not root.Sandboxed and script.Sandboxed and not script.Disabled and script.Source==original.sources[1].source)
 assert(result.security.instances[2].removed[1]=="Network")
else
 assert(not ok and captures==0)
 assert(root.Capabilities.bits==3 and script.Capabilities.bits==3,"preflight failure mutated permissions")
end
print("PASS fixed restriction template")
`,
      );
      const executable = path.resolve(
        "research/tools/luau",
        process.platform === "win32" ? "luau.exe" : "luau",
      );
      expect(execFileSync(executable, [file], { encoding: "utf8" })).toContain(
        "PASS fixed restriction template",
      );
    },
  );
  it("retains both archives and deduplicates bodies without dropping any of 76 script bindings", () => {
    const f = setup(),
      before = fs.readFileSync(f.original.archiveFile!);
    const result = f.run();
    expect(result).toMatchObject({
      sourceCount: 76,
      uniqueSourceBodies: 1,
      changedInstances: 77,
      securityReview: "not_performed",
      runtimeVerification: "not_performed",
    });
    expect(fs.readFileSync(f.original.archiveFile!)).toEqual(before);
    expect(result.derivative.sha256).not.toBe(f.original.sha256);
    const review = JSON.parse(fs.readFileSync(result.reviewFile, "utf8"));
    expect(review.binding).toEqual(f.binding);
    expect(
      review.sourceBodies[0].bindings.map((entry: any) => entry.index),
    ).toEqual(Array.from({ length: 76 }, (_, i) => i + 2));
    expect(review.sourceBodies[0].source).toBe("return 1");
    expect(review).toMatchObject({
      dependencyReview: "not_performed",
      exportConversion: "not_performed",
      executed: false,
    });
    expect(f.run()).toEqual(result);
  });
  it.each([
    [
      "permission expansion",
      (f: ReturnType<typeof setup>) =>
        f.payload.security.instances[0].after.push("Network"),
    ],
    [
      "invented permission",
      (f: ReturnType<typeof setup>) => {
        f.payload.security.currentCapabilities.push("NewRight");
        f.payload.security.instances[0].after.push("NewRight");
      },
    ],
    [
      "sandbox removal",
      (f: ReturnType<typeof setup>) => {
        f.payload.security.instances[0].sandboxedAfter = false;
      },
    ],
    [
      "missing binding",
      (f: ReturnType<typeof setup>) => {
        f.payload.snapshot.sources.pop();
      },
    ],
    [
      "source edit",
      (f: ReturnType<typeof setup>) => {
        f.payload.snapshot.sources[0].source = "return 2";
      },
    ],
    [
      "script enablement",
      (f: ReturnType<typeof setup>) => {
        f.payload.snapshot.sources[0].disabled = true;
      },
    ],
    [
      "hierarchy edit",
      (f: ReturnType<typeof setup>) => {
        f.payload.snapshot.nodes[0].name = "Changed";
      },
    ],
    [
      "missing security row",
      (f: ReturnType<typeof setup>) => {
        f.payload.security.instances.pop();
      },
    ],
    [
      "duplicate security row",
      (f: ReturnType<typeof setup>) => {
        f.payload.security.instances[1].index = 1;
      },
    ],
    [
      "false permission delta",
      (f: ReturnType<typeof setup>) => {
        f.payload.security.instances[0].removed = [];
      },
    ],
    [
      "removal of an available permission",
      (f: ReturnType<typeof setup>) => {
        f.payload.security.instances[0].after = [];
        f.payload.security.instances[0].removed = ["Basic", "Network"];
      },
    ],
    [
      "engine version mismatch",
      (f: ReturnType<typeof setup>) => {
        f.payload.snapshot.engineVersion = "different-runtime";
      },
    ],
    [
      "duplicate capability",
      (f: ReturnType<typeof setup>) => {
        f.payload.security.instances[0].before.push("Basic");
      },
    ],
    [
      "no restoration proof",
      (f: ReturnType<typeof setup>) => {
        (f.payload.snapshot as any).roundTrip = {
          passed: false,
          stage: "deserialize",
          reason: "No permission",
        };
      },
    ],
    [
      "damaged original",
      (f: ReturnType<typeof setup>) => {
        fs.writeFileSync(f.original.archiveFile!, "damaged");
      },
    ],
    [
      "damaged manifest",
      (f: ReturnType<typeof setup>) => {
        fs.appendFileSync(f.original.manifestFile!, " ");
      },
    ],
    [
      "missing context identity",
      (f: ReturnType<typeof setup>) => {
        f.binding.inputHash = "";
      },
    ],
  ] as const)("rejects %s before retaining a derivative", (_name, mutate) => {
    const f = setup();
    mutate(f);
    const files = fs.readdirSync(f.directory);
    expect(f.run).toThrow();
    expect(fs.readdirSync(f.directory)).toEqual(files);
  });
  it("uses only content-addressed files under the evidence directory", () => {
    const f = setup();
    expect(() =>
      readComponentOriginal(
        f.directory,
        "../original",
        f.originalHashes.manifestHash,
      ),
    ).toThrow();
    expect(
      readComponentOriginal(
        f.directory,
        f.originalHashes.archiveHash,
        f.originalHashes.manifestHash,
      ).snapshot.sources,
    ).toHaveLength(76);
  });
});
