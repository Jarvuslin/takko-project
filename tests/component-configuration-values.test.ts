import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { afterEach, expect, it } from "vitest";
import {
  componentArchiveLuau,
  persistComponentArchive,
} from "../src/generation/component-archive";
import {
  componentRestrictionLuau,
  persistComponentDerivative,
  readComponentOriginal,
} from "../src/generation/component-derivative";
import {
  loadComponentReviewEvidence,
  validateComponentReview,
} from "../src/generation/component-review";
import { componentReviewFixture } from "./component-review.fixture";

const directories: string[] = [];
function temporary() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-values-"));
  directories.push(dir);
  return dir;
}
afterEach(() =>
  directories
    .splice(0)
    .forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })),
);
function fixture() {
  const bytes = Buffer.from("<roblox!\x89\xff\r\n\x1a\nfixture", "latin1");
  return {
    status: "captured",
    format: "roblox-native-rbxm-v1",
    engineVersion: "offline",
    base64: bytes.toString("base64"),
    bytes: bytes.length,
    nodes: [
      { index: 1, parentIndex: 0, name: "Root", className: "Model" },
      { index: 2, parentIndex: 1, name: "Module", className: "NumberPose" },
      { index: 3, parentIndex: 1, name: "Label", className: "StringValue" },
      { index: 4, parentIndex: 1, name: "Enabled", className: "BoolValue" },
    ],
    configurationValues: [
      { index: 2, property: "Value", value: 91638724979309 },
      { index: 3, property: "Value", value: "" },
      { index: 4, property: "Value", value: false },
    ],
    sources: [],
    sourceBytes: 0,
    executed: false,
    roundTrip: {
      passed: true,
      checkedProperties: 0,
      checkedAttributes: 0,
      checkedReferences: 0,
      unobservableProperties: [],
      ignoredIdentityProperties: [],
    },
  };
}
it("preserves numeric loader IDs, empty strings and false through verified worker context and rejects derivative edits", () => {
  const directory = temporary(),
    snapshot = fixture();
  const original = persistComponentArchive(snapshot, directory);
  if (original.status !== "captured") throw Error("fixture");
  const hashes = {
    archiveHash: original.sha256,
    manifestHash: path.basename(original.manifestFile!, ".component.json"),
  };
  expect(
    readComponentOriginal(directory, hashes.archiveHash, hashes.manifestHash)
      .snapshot.configurationValues,
  ).toEqual(snapshot.configurationValues);
  const security = {
    currentCapabilities: ["Basic"],
    instances: snapshot.nodes.map((n) => ({
      index: n.index,
      sandboxedBefore: true,
      sandboxedAfter: true,
      before: ["Basic"],
      after: ["Basic"],
      removed: [],
    })),
  };
  const binding = {
    studioId: "offline",
    scope: "Fixture",
    token: randomUUID(),
    candidateId: "123",
    inputHash: "a".repeat(64),
  };
  const result = persistComponentDerivative(
    directory,
    hashes,
    { snapshot, security },
    binding,
  );
  expect(
    loadComponentReviewEvidence(directory, result.sha256, binding.inputHash)
      .configurationValues,
  ).toEqual(snapshot.configurationValues);
  snapshot.configurationValues[0].value = 123;
  expect(() =>
    persistComponentDerivative(
      directory,
      hashes,
      { snapshot, security },
      binding,
    ),
  ).toThrow("configuration values");
});
it.each([
  "missing",
  "duplicate",
  "wrong-instance",
  "wrong-property",
  "wrong-type",
  "infinite",
  "oversize",
])("rejects %s configuration evidence", (mode) => {
  const snapshot = fixture();
  if (mode === "missing") snapshot.configurationValues.pop();
  if (mode === "duplicate")
    snapshot.configurationValues[1] = snapshot.configurationValues[0];
  if (mode === "wrong-instance") snapshot.configurationValues[0].index = 1;
  if (mode === "wrong-property")
    snapshot.configurationValues[0].property = "Source";
  if (mode === "wrong-type")
    snapshot.configurationValues[0].value = "91638724979309";
  if (mode === "infinite") snapshot.configurationValues[0].value = Infinity;
  if (mode === "oversize")
    snapshot.configurationValues[1].value = "a".repeat(4097);
  expect(() => persistComponentArchive(snapshot)).toThrow();
});
it("keeps absent historical configuration evidence unknown", () => {
  const { configurationValues: _values, ...snapshot } = fixture();
  const directory = temporary(),
    result = persistComponentArchive(snapshot, directory);
  if (result.status !== "captured") throw Error("fixture");
  expect(
    readComponentOriginal(
      directory,
      result.sha256,
      path.basename(result.manifestFile!, ".component.json"),
    ).snapshot.configurationValues,
  ).toBeUndefined();
});
it.each([
  "valid",
  "missing-index",
  "wrong-id",
  "invented-quote",
  "nonasset",
  "invented-index",
])("validates instance-backed module dependency (%s)", (mode) => {
  const { evidence, decision } = componentReviewFixture();
  const source = "return require(script.Parent.Module.Value)";
  const sha = createHash("sha256").update(source).digest("hex");
  evidence.sourceBodies[0].source = source;
  evidence.sourceBodies[0].sha256 = sha;
  evidence.nodes.push({
    index: 4,
    parentIndex: 1,
    name: "Module",
    className: "NumberPose",
  });
  evidence.configurationValues = [
    { index: 4, property: "Value", value: 91638724979309 },
  ];
  const dependency = {
    kind: "module_asset" as const,
    value: "91638724979309",
    sourceQuote: source,
    configurationIndex: 4,
    verification: "unverified" as const,
  };
  decision.sources[0].sha256 = sha;
  decision.sources[0].dependencies = [dependency];
  decision.sources[0].unresolved = ["External module source unavailable"];
  decision.disposition = "needs_more_evidence";
  decision.requirements[0].sourceHashes = [sha];
  decision.permissionImpacts[0].sourceHashes = [sha];
  if (mode === "missing-index")
    delete decision.sources[0].dependencies[0].configurationIndex;
  if (mode === "wrong-id") dependency.value = "123";
  if (mode === "invented-quote")
    dependency.sourceQuote = "require(91638724979309)";
  if (mode === "nonasset") (dependency as any).kind = "service";
  if (mode === "invented-index") dependency.configurationIndex = 99;
  if (mode === "valid") {
    expect(validateComponentReview(decision, evidence, ["style"])).toEqual(
      decision,
    );
    decision.disposition = "integration_candidate";
    expect(() =>
      validateComponentReview(decision, evidence, ["style"]),
    ).toThrow("Unresolved");
  } else
    expect(() =>
      validateComponentReview(decision, evidence, ["style"]),
    ).toThrow();
});
it.each(["preserved", "copy-changed", "original-changed"])(
  "executes scalar capture with %s values (offline mocks)",
  (mode) => {
    const file = path.join(temporary(), "capture.luau");
    fs.writeFileSync(
      file,
      `
local mode=${JSON.stringify(mode)}
local function item()
 local x={Name="Module",ClassName="NumberPose",Value=91638724979309,Archivable=true,Sandboxed=true,Capabilities="Basic"}
 function x:IsA() return false end
 function x:GetChildren() return {} end
 function x:GetDescendants() return {} end
 function x:GetAttributes() return {} end
 function x:GetTags() return {} end
 function x:Destroy() end
 return x
end
local original=item()
local services={RunService={IsRunning=function() return false end},ReflectionService={GetPropertiesOfClass=function() return {} end},
 EncodingService={Base64Encode=function(_,x) return x end},
 SerializationService={SerializeInstancesAsync=function() return buffer.fromstring("fixture") end,DeserializeInstancesAsync=function()
 local copy=item();if mode=="copy-changed" then copy.Value=123 end;if mode=="original-changed" then original.Value=123 end;return {copy} end}}
game={GetService=function(_,name) return assert(services[name],name) end};version=function() return "offline-mock" end
${componentArchiveLuau}
local result=captureComponentArchive(original)
assert(result.status=="captured" and #result.configurationValues==1 and result.configurationValues[1].value==91638724979309)
assert(result.roundTrip.passed==(mode=="preserved"))
if mode~="preserved" then assert(string.find(result.roundTrip.reason,"configuration value")) end
print("PASS scalar capture")`,
    );
    expect(
      execFileSync(path.resolve(".forge/tools/luau/luau.exe"), [file], {
        encoding: "utf8",
        windowsHide: true,
      }),
    ).toContain("PASS scalar capture");
  },
);
it("rejects stale configuration before native permission reduction (offline mocks)", () => {
  const file = path.join(temporary(), "restriction.luau");
  fs.writeFileSync(
    file,
    `
game={GetService=function() return {IsRunning=function() return false end} end}
local root={Name="Module",ClassName="NumberPose",Value=456,Sandboxed=true,Capabilities="Basic"}
function root:IsA() return false end;function root:GetChildren() return {} end
local touched=false;SecurityCapabilities={fromCurrent=function() touched=true;error("must not mutate") end}
local original={status="captured",nodes={{index=1,parentIndex=0,name="Module",className="NumberPose"}},sources={},configurationValues={{index=1,property="Value",value=123}}}
${componentRestrictionLuau}
local ok,err=pcall(function() return restrictComponentArchive(root,original) end)
assert(not ok and not touched and string.find(err,"Original configuration value changed"))
print("PASS stale configuration")`,
  );
  expect(
    execFileSync(path.resolve(".forge/tools/luau/luau.exe"), [file], {
      encoding: "utf8",
      windowsHide: true,
    }),
  ).toContain("PASS stale configuration");
});
