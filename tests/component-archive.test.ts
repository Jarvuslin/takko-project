import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";
import {
  persistComponentArchive,
  decodeComponentTransfer,
  componentArchiveLuau,
} from "../src/generation/component-archive";

const directories: string[] = [];
afterEach(() => {
  for (const d of directories.splice(0))
    fs.rmSync(d, { recursive: true, force: true });
});
function sample() {
  // Transport-envelope fixture only; these bytes are not a claimed executable Roblox model.
  const bytes = Buffer.from("<roblox!\x89\xff\r\n\x1a\nfixture", "latin1");
  const source = "-- original bytes \nreturn '☀'";
  return {
    status: "captured",
    format: "roblox-native-rbxm-v1",
    engineVersion: "offline-fixture",
    base64: bytes.toString("base64"),
    bytes: bytes.length,
    nodes: [
      { index: 1, parentIndex: 0, name: "Original", className: "Model" },
      {
        index: 2,
        parentIndex: 1,
        name: "Original Script",
        className: "Script",
      },
    ],
    sources: [
      {
        index: 2,
        className: "Script",
        source,
        sourceBytes: Buffer.byteLength(source),
        disabled: false,
        runContext: "Enum.RunContext.Legacy",
      },
    ],
    sourceBytes: Buffer.byteLength(source),
    roundTrip: {
      passed: true,
      checkedProperties: 14,
      checkedAttributes: 2,
      checkedReferences: 1,
      unobservableProperties: ["Model.WorldPivotData"],
      ignoredIdentityProperties: ["UniqueId", "HistoryId"],
    },
    executed: false,
  };
}
describe("native component archive envelope (offline)", () => {
  it.each(["preserved", "sandbox-lost", "capabilities-expanded"])(
    "checks security controls independently of reflection serialization flags (%s)",
    (mode) => {
      const directory = fs.mkdtempSync(
        path.join(os.tmpdir(), "takko-component-security-"),
      );
      directories.push(directory);
      const file = path.join(directory, "security.luau");
      fs.writeFileSync(
        file,
        `
local mode=${JSON.stringify(mode)}
local destroyed=0
local function item()
  local x={Name="Original",ClassName="Script",Archivable=true,Source="error('never execute')",Disabled=false,RunContext="Legacy",Sandboxed=true,Capabilities="Basic"}
  function x:IsA(name) return name=="LuaSourceContainer" or name=="BaseScript" end
  function x:GetChildren() return {} end
  function x:GetDescendants() return {} end
  function x:GetAttributes() return {} end
  function x:GetTags() return {} end
  function x:Destroy() destroyed+=1 end
  return x
end
local original=item()
local services={
 RunService={IsRunning=function() return false end},
 ScriptEditorService={GetEditorSource=function(_,x) return x.Source end},
 ReflectionService={GetPropertiesOfClass=function() return {} end},
 EncodingService={Base64Encode=function(_,x) return x end},
 SerializationService={SerializeInstancesAsync=function() return buffer.fromstring("fixture") end,
 DeserializeInstancesAsync=function() local copy=item();if mode=="sandbox-lost" then copy.Sandboxed=false end;if mode=="capabilities-expanded" then copy.Capabilities="Basic,Network" end;return {copy} end},
}
game={GetService=function(_,name) return assert(services[name],name) end}
version=function() return "offline-mock" end
${componentArchiveLuau}
local result=captureComponentArchive(original)
assert(result.status=="captured" and destroyed==1)
assert(original.Sandboxed and original.Capabilities=="Basic" and not original.Disabled)
if mode=="preserved" then assert(result.roundTrip.passed)
else
 assert(not result.roundTrip.passed and result.roundTrip.stage=="compare")
 assert(string.find(result.roundTrip.reason,mode=="sandbox-lost" and "sandboxing" or "capabilities"))
end
print("PASS security preservation")
`,
      );
      const executable = path.resolve(
        process.env.LUAU_BIN_DIR ?? ".forge/tools/luau",
        process.platform === "win32" ? "luau.exe" : "luau",
      );
      expect(execFileSync(executable, [file], { encoding: "utf8" })).toContain(
        "PASS security preservation",
      );
    },
  );
  it("reassembles bounded Unicode evidence and detects reordered, truncated or changed chunks", () => {
    const value = { source: "☀ code\n".repeat(40000) };
    const bytes = Buffer.from(JSON.stringify(value));
    const encoded = bytes.toString("base64");
    const transfer = {
      encodedBytes: encoded.length,
      jsonBytes: bytes.length,
      sha256: createHash("sha256").update(encoded).digest("hex"),
      chunkSize: 32768,
    };
    const chunks = encoded.match(/.{1,32768}/g)!;
    expect(chunks.length).toBeGreaterThan(6);
    expect(decodeComponentTransfer(transfer, chunks)).toEqual(value);
    expect(() => decodeComponentTransfer(transfer, chunks.slice(1))).toThrow(
      "chunks",
    );
    const changed = [...chunks];
    changed[0] = "A" + changed[0].slice(1);
    expect(() => decodeComponentTransfer(transfer, changed)).toThrow("digest");
    expect(() =>
      decodeComponentTransfer({ ...transfer, jsonBytes: 1 }, chunks),
    ).toThrow("length");
  });
  it("retains a captured archive with failed native restoration without turning it into a pass", () => {
    const value = {
      ...sample(),
      roundTrip: {
        passed: false,
        stage: "deserialize",
        reason: "Capability unavailable",
      },
    };
    expect(persistComponentArchive(value)).toMatchObject({
      status: "captured",
      roundTrip: value.roundTrip,
      runtimeVerification: "not_performed",
      securityReview: "not_performed",
    });
  });
  it("preserves exact binary/source bytes in immutable sidecars without asserting safety or runtime success", () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "takko-component-"),
    );
    directories.push(directory);
    const value = sample();
    const result = persistComponentArchive(value, directory);
    expect(result).toMatchObject({
      status: "captured",
      persisted: true,
      instanceCount: 2,
      scriptCount: 1,
      securityReview: "not_performed",
      runtimeVerification: "not_performed",
      exportConversion: "not_performed",
    });
    if (result.status !== "captured") throw Error("Expected fixture capture");
    expect(fs.readFileSync(result.archiveFile!).toString("base64")).toBe(
      value.base64,
    );
    const manifest = JSON.parse(fs.readFileSync(result.manifestFile!, "utf8"));
    expect(manifest.sources[0].source).toBe(value.sources[0].source);
    expect(manifest.sources[0].sha256).toBe(
      createHash("sha256").update(value.sources[0].source).digest("hex"),
    );
    expect(manifest).not.toHaveProperty("base64");
    expect(persistComponentArchive(value, directory)).toEqual(result);
    fs.writeFileSync(result.archiveFile!, "damaged");
    expect(() => persistComponentArchive(value, directory)).toThrow(
      "collision",
    );
  });
  it.each([
    (v: ReturnType<typeof sample>) => {
      v.base64 += "\n";
    },
    (v: ReturnType<typeof sample>) => {
      v.bytes++;
    },
    (v: ReturnType<typeof sample>) => {
      v.base64 = Buffer.alloc(v.bytes).toString("base64");
    },
    (v: ReturnType<typeof sample>) => {
      v.nodes[1].parentIndex = 2;
    },
    (v: ReturnType<typeof sample>) => {
      v.nodes[1].index = 1;
    },
    (v: ReturnType<typeof sample>) => {
      v.sources = [];
    },
    (v: ReturnType<typeof sample>) => {
      v.sources[0].index = 1;
    },
    (v: ReturnType<typeof sample>) => {
      v.sources[0].sourceBytes--;
    },
    (v: ReturnType<typeof sample>) => {
      v.sourceBytes--;
    },
    (v: ReturnType<typeof sample>) => {
      v.executed = true;
    },
    (v: ReturnType<typeof sample>) => {
      v.roundTrip.passed = false;
    },
  ])(
    "rejects corrupted, incomplete or executed capture envelopes",
    (mutate) => {
      const value = sample();
      mutate(value);
      expect(() => persistComponentArchive(value)).toThrow();
    },
  );
  it("retains capture failures and never presents a nonpersisted archive as retained", () => {
    expect(
      persistComponentArchive({
        status: "unavailable",
        reason: "External reference",
      }),
    ).toEqual({ status: "unavailable", reason: "External reference" });
    expect(persistComponentArchive(sample())).toMatchObject({
      status: "captured",
      persisted: false,
      archiveFile: undefined,
    });
  });
});
