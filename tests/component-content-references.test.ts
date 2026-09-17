import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
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
const temporary = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-media-"));
  directories.push(dir);
  return dir;
};
afterEach(() =>
  directories
    .splice(0)
    .forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })),
);
const refs = [
  { index: 2, property: "SoundId", value: "rbxassetid://123" },
  { index: 3, property: "AnimationId", value: "" },
];
function fixture() {
  // Envelope bytes only, never a native model claim.
  const bytes = Buffer.from("<roblox!\x89\xff\r\n\x1a\nfixture", "latin1");
  return {
    status: "captured",
    format: "roblox-native-rbxm-v1",
    engineVersion: "offline",
    base64: bytes.toString("base64"),
    bytes: bytes.length,
    nodes: [
      { index: 1, parentIndex: 0, name: "Root", className: "Model" },
      { index: 2, parentIndex: 1, name: "Crunch", className: "Sound" },
      { index: 3, parentIndex: 1, name: "Bite", className: "Animation" },
    ],
    sources: [],
    sourceBytes: 0,
    contentReferences: structuredClone(refs),
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
it("preserves populated and empty instance media properties through archive, derivative and worker evidence", () => {
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
      .snapshot.contentReferences,
  ).toEqual(refs);
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
  const evidence = loadComponentReviewEvidence(
    directory,
    result.sha256,
    binding.inputHash,
  );
  expect(evidence.contentReferences).toEqual([refs[0]]);
  expect(evidence.boundary).toContain("unverified");
  snapshot.contentReferences[0].value = "rbxassetid://456";
  expect(() =>
    persistComponentDerivative(
      directory,
      hashes,
      { snapshot, security },
      binding,
    ),
  ).toThrow("content references");
});
it.each(["missing", "duplicate", "wrong-instance", "wrong-property"])(
  "rejects %s inventory entries",
  (mode) => {
    const snapshot = fixture();
    if (mode === "missing") snapshot.contentReferences.pop();
    if (mode === "duplicate")
      snapshot.contentReferences[1] = snapshot.contentReferences[0];
    if (mode === "wrong-instance") snapshot.contentReferences[0].index = 1;
    if (mode === "wrong-property")
      snapshot.contentReferences[0].property = "Source";
    expect(() => persistComponentArchive(snapshot)).toThrow(
      "content reference inventory",
    );
  },
);
it.each(["valid", "missing", "duplicate", "invented", "verified", "legacy"])(
  "requires exact unverified review coverage (%s)",
  (mode) => {
    const { evidence, decision } = componentReviewFixture();
    evidence.contentReferences = [refs[0]];
    decision.serializedMedia = [
      {
        ...refs[0],
        purpose: "Possible crunch sound; playback unknown",
        verification: "unverified",
      },
    ];
    if (mode === "missing") delete decision.serializedMedia;
    if (mode === "duplicate")
      decision.serializedMedia!.push(decision.serializedMedia![0]);
    if (mode === "invented")
      decision.serializedMedia![0].value = "rbxassetid://456";
    if (mode === "verified")
      (decision.serializedMedia![0] as any).verification = "verified";
    if (mode === "legacy") delete evidence.contentReferences;
    if (mode === "valid")
      expect(validateComponentReview(decision, evidence, ["style"])).toEqual(
        decision,
      );
    else
      expect(() =>
        validateComponentReview(decision, evidence, ["style"]),
      ).toThrow();
  },
);
it.each(["valid", "missing", "duplicate", "wrong-value", "mixed"])(
  "groups repeated media without dropping or inventing any binding (%s)",
  (mode) => {
    const { evidence, decision } = componentReviewFixture();
    const indices = Array.from({ length: 72 }, (_, i) => i + 10);
    evidence.contentReferences = indices.map((index) => ({
      ...refs[0],
      index,
    }));
    decision.serializedMedia = [
      {
        indices: [...indices],
        property: "SoundId",
        value: refs[0].value,
        purpose: "Repeated bubble pop sound; audition pending",
        verification: "unverified",
      },
    ];
    const row = decision.serializedMedia[0];
    if (!("indices" in row)) throw Error("fixture");
    if (mode === "missing") row.indices.pop();
    if (mode === "duplicate") row.indices[71] = row.indices[0];
    if (mode === "wrong-value") row.value = "rbxassetid://456";
    if (mode === "mixed") {
      const index = row.indices.pop()!;
      decision.serializedMedia.push({
        index,
        property: row.property,
        value: row.value,
        purpose: row.purpose,
        verification: "unverified",
      });
    }
    if (mode === "valid" || mode === "mixed")
      expect(validateComponentReview(decision, evidence, ["style"])).toEqual(
        decision,
      );
    else
      expect(() =>
        validateComponentReview(decision, evidence, ["style"]),
      ).toThrow("content reference");
  },
);

it.each(["preserved", "copy-changed", "original-changed"])(
  "executes capture Luau with %s media (offline API mocks)",
  (mode) => {
    const file = path.join(temporary(), "capture.luau");
    fs.writeFileSync(
      file,
      `
local mode=${JSON.stringify(mode)}
local function item()
 local x={Name="Sound",ClassName="Sound",SoundId="rbxassetid://123",Archivable=true,Sandboxed=true,Capabilities="Basic"}
 function x:IsA() return false end
 function x:GetChildren() return {} end
 function x:GetDescendants() return {} end
 function x:GetAttributes() return {} end
 function x:GetTags() return {} end
 function x:Destroy() end
 return x
end
local original=item()
local services={
 RunService={IsRunning=function() return false end},
 ReflectionService={GetPropertiesOfClass=function() return {} end},
 EncodingService={Base64Encode=function(_,x) return x end},
 SerializationService={SerializeInstancesAsync=function() return buffer.fromstring("fixture") end,
 DeserializeInstancesAsync=function()
   local copy=item()
   if mode=="copy-changed" then copy.SoundId="rbxassetid://456" end
   if mode=="original-changed" then original.SoundId="rbxassetid://456" end
   return {copy}
 end},
}
game={GetService=function(_,name) return assert(services[name],name) end}
version=function() return "offline-mock" end
${componentArchiveLuau}
local result=captureComponentArchive(original)
assert(result.status=="captured")
assert(#result.contentReferences==1 and result.contentReferences[1].value=="rbxassetid://123")
assert(result.roundTrip.passed==(mode=="preserved"))
if mode~="preserved" then assert(string.find(result.roundTrip.reason,"content reference")) end
print("PASS media capture")
`,
    );
    expect(
      execFileSync(path.resolve(".forge/tools/luau/luau.exe"), [file], {
        encoding: "utf8",
        windowsHide: true,
      }),
    ).toContain("PASS media capture");
  },
);
it("rejects changed media before any native permission reduction (offline API mocks)", () => {
  const file = path.join(temporary(), "restriction.luau");
  fs.writeFileSync(
    file,
    `
game={GetService=function() return {IsRunning=function() return false end} end}
local root={Name="Sound",ClassName="Sound",SoundId="rbxassetid://456",Sandboxed=true,Capabilities="Basic"}
function root:IsA() return false end
function root:GetChildren() return {} end
local touched=false
SecurityCapabilities={fromCurrent=function() touched=true;error("must not reach reduction") end}
local original={status="captured",nodes={{index=1,parentIndex=0,name="Sound",className="Sound"}},sources={},contentReferences={{index=1,property="SoundId",value="rbxassetid://123"}}}
${componentRestrictionLuau}
local ok,err=pcall(function() return restrictComponentArchive(root,original) end)
assert(not ok and not touched and string.find(err,"Original content reference changed"))
assert(root.Capabilities=="Basic")
print("PASS preflight")
`,
  );
  expect(
    execFileSync(path.resolve(".forge/tools/luau/luau.exe"), [file], {
      encoding: "utf8",
      windowsHide: true,
    }),
  ).toContain("PASS preflight");
});
