import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { expect, it } from "vitest";
import {
  modelPreviewLuau,
  modelPreviewSchema,
} from "../src/marketplace/preview";

function literal(v: any): string {
  if (v === undefined || v === null) return "nil";
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) return "{" + v.map(literal).join(",") + "}";
  if (typeof v === "object")
    return (
      "{" +
      Object.entries(v)
        .map(([k, x]) => `[${literal(k)}]=${literal(x)}`)
        .join(",") +
      "}"
    );
  return String(v);
}
it("runs the real Luau producer over captured native MeshParts, preserving visibility and passing the old 80-part limit", () => {
  const source = JSON.parse(
    fs.readFileSync(
      "tests/fixtures/regression/asset-evidence-selection/native-model-source.json",
      "utf8",
    ),
  );
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "takko-model-producer-"),
  );
  try {
    const program = `
local records=${literal(source.parts)}
local items={}
local function vector(v) return {X=v[1],Y=v[2],Z=v[3]} end
for copy=1,4 do for _,p in records do
 local x={Name=p.name,ClassName=p.className,Size=vector(p.size),Transparency=p.transparency,Shape={Name=p.shape},Color={R=p.color[1],G=p.color[2],B=p.color[3]},CFrame={GetComponents=function() return table.unpack(p.frame) end}}
 function x:IsA(c) return c==self.ClassName or c=="BasePart" end
 function x:FindFirstChildOfClass(c) if c=="SpecialMesh" and p.meshType then return {MeshType={Name=p.meshType}} end end
 table.insert(items,x)
end end
local root={Parent=nil,Name="Native fixture",ClassName="Model"}
function root:IsA(c) return c=="Model" end
function root:GetDescendants() return items end
local destroyed=false
function root:Destroy() destroyed=true end
local function encode(v)
 if type(v)=="string" then return string.format("%q",v) end
 if type(v)~="table" then return tostring(v) end
 local out={} local array=#v>0
 for k,x in v do table.insert(out,(array and "" or string.format("%q",k)..":")..encode(x)) end
 return (array and "[" or "{")..table.concat(out,",")..(array and "]" or "}")
end
game={GetObjects=function() return {root} end,GetService=function(_,service)
 if service=="RunService" then return {IsRunning=function() return false end} end
 return {JSONEncode=function(_,v) return encode(v) end}
end}
local function capture()
${modelPreviewLuau(source.assetId)}
end
print(capture())
assert(destroyed,"capture failed to destroy detached roots")
`;
    const file = path.join(directory, "producer.luau");
    fs.writeFileSync(file, program);
    const luau = path.resolve(
      process.env.LUAU_BIN_DIR ?? ".forge/tools/luau",
      process.platform === "win32" ? "luau.exe" : "luau",
    );
    const result = spawnSync(luau, [file], { encoding: "utf8" });
    expect(result.status, result.stdout + result.stderr).toBe(0);
    const output = modelPreviewSchema.parse(JSON.parse(result.stdout.trim()));
    const visible = source.parts.filter((p: any) => p.transparency < 1);
    expect(output.parts).toHaveLength(visible.length * 4);
    expect(output.transparent).toBe(8);
    expect(output.omitted).toBe(0);
    expect(output.parts.every((p) => p.shape === "approximate")).toBe(true);
    expect(Buffer.byteLength(result.stdout)).toBeLessThan(4 * 1024 * 1024);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
