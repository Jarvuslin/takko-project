import { expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

it("round-trips the independent oracle cursor across fresh inline executions without serializing Instances", () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "forge-native-oracle-"),
  );
  try {
    const source = fs.readFileSync(
      "tests/native-generation-acceptance.luau",
      "utf8",
    );
    const mocks = `
local function vector(x,y,z)
 local value={X=x,Y=y,Z=z,Magnitude=math.sqrt(x*x+y*y+z*z)}
 return setmetatable(value,{__add=function(a,b) return vector(a.X+b.X,a.Y+b.Y,a.Z+b.Z) end,__sub=function(a,b) return vector(a.X-b.X,a.Y-b.Y,a.Z-b.Z) end})
end
local Vector3={new=vector,zero=vector(0,0,0)}
local CFrame={new=function(position) return position end}
local root={Position=vector(0,4,0),IsA=function(_,kind) return kind=='BasePart' end}
local humanoid={Health=100}
local characterAttributes={}
local character={
 FindFirstChild=function(_,name) return name=='HumanoidRootPart' and root or nil end,
 FindFirstChildOfClass=function(_,name) return name=='Humanoid' and humanoid or nil end,
 PivotTo=function(_,position) root.Position=position end,
 SetAttribute=function(_,key,value) characterAttributes[key]=value end,
 GetAttribute=function(_,key) return characterAttributes[key] end,
}
local player={UserId=7,Name='TestPlayer',Character=character,IsA=function(_,kind) return kind=='Player' end,GetAttribute=function() return 0 end}
local players={GetPlayers=function() return {player} end,FindFirstChild=function(_,name) return name==player.Name and player or nil end,GetPlayerByUserId=function(_,id) return id==7 and player or nil end}
local pickup={Position=vector(0,3,0),IsA=root.IsA}
local sell={Position=vector(12,1,0),IsA=root.IsA}
local scope={FindFirstChild=function(_,name) return name=='Pickup' and pickup or name=='SellPad' and sell or nil end}
local workspace={FindFirstChild=function(_,name) return name=='Forge_GenerationPilot' and scope or nil end}
local replicated={WaitForChild=function() return {WaitForChild=function() return {IsA=function(_,kind) return kind=='RemoteEvent' end} end} end}
local run={IsServer=function() return true end,IsClient=function() return false end}
local game={GetService=function(_,name) return ({Players=players,RunService=run,ReplicatedStorage=replicated,HttpService={GenerateGUID=function() return 'independent-witness' end}})[name] end}
local task={wait=function() end}
`;
    const assertions = `
local function fails(fn,expected) local ok,message=pcall(fn);assert(not ok and tostring(message):find(expected,1,true),tostring(message)) end
local initial=fresh().serverStep('begin')
assert(initial.state.index==1 and initial.state.playerId==7)
local prepared=fresh().serverStep('prepare','malformed',initial.state)
assert(prepared.state.prepared=='malformed' and prepared.state.characterWitness=='independent-witness')
for _,value in prepared.state do assert(type(value)~='table' and type(value)~='function' and type(value)~='userdata','Cursor contains a runtime reference') end
local invalid=table.clone(prepared.state);invalid.version=2
fails(function() fresh().serverStep('verify','malformed',invalid) end,'version/scope')
invalid=table.clone(prepared.state);invalid.playerId=99
fails(function() fresh().serverStep('verify','malformed',invalid) end,'no longer connected')
characterAttributes.ForgeAcceptanceCharacterWitness='different-character'
fails(function() fresh().serverStep('verify','malformed',prepared.state) end,'died or respawned')
characterAttributes.ForgeAcceptanceCharacterWitness='independent-witness'
local verified=fresh().serverStep('verify','malformed',prepared.state)
assert(verified.result.status=='passed' and verified.state.index==2 and verified.state.prepared==nil and verified.state.characterWitness==nil)
assert(prepared.state.index==1 and prepared.state.prepared=='malformed','Input cursor was mutated')
print('PASS isolated oracle cursor roundtrip and invalid/stale cursor rejection; Studio and production remotes were mocked')
`;
    const file = path.join(directory, "oracle.luau");
    fs.writeFileSync(
      file,
      mocks + "\nlocal function fresh()\n" + source + "\nend\n" + assertions,
    );
    const compilerDirectory = path.resolve(
      process.env.LUAU_BIN_DIR ?? ".forge/tools/luau",
    );
    const result = spawnSync(
      path.join(
        compilerDirectory,
        "luau" + (process.platform === "win32" ? ".exe" : ""),
      ),
      [file],
      {
        encoding: "utf8",
        windowsHide: true,
        timeout: 10000,
      },
    );
    expect(result.error).toBeUndefined();
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(result.stdout).toContain("PASS isolated oracle cursor roundtrip");
  } finally {
    const resolved = path.resolve(directory);
    if (
      path.dirname(resolved) !== path.resolve(os.tmpdir()) ||
      !path.basename(resolved).startsWith("forge-native-oracle-")
    )
      throw Error("Unexpected oracle test cleanup path");
    fs.rmSync(resolved, { recursive: true, force: true });
  }
});
