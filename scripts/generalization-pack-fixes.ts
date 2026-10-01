// Diagnostic recapture of exposed packs, never holdout evidence.
import fs from "node:fs";
import assert from "node:assert/strict";
import { StudioMarketplace, unpackMarketplace } from "../src/marketplace/studio";
import { StdioStudioClient } from "../src/generation/studio-mcp-client";
import { isVerifiedEditState } from "../src/generation/studio-state";
const studioId = "216e6aaa-19c8-44d9-94f2-7341c2e69973";
const root = "tests/fixtures/generalization/pack-fixes";
fs.mkdirSync(root, { recursive: true });
const client = new StdioStudioClient({ timeoutMs: 90000 });
const native = new StudioMarketplace();
const call = async (tool: string, args: object) => unpackMarketplace(await client.callTool(tool, { studio_id: studioId, ...args }));
try {
  assert.ok(isVerifiedEditState(await call("get_studio_state", {})));
  for (const [id, slot] of [["85284763604545", "21"], ["16840174248", "25"], ["13734483218", "29"]]) {
    assert.ok(!fs.existsSync(`${root}/${id}.json`), "Preserve original diagnostic attempt");
    const row: any = { at: new Date().toISOString(), assetId: id, diagnosticOnly: true, calls: [] };
    try {
      row.metadata = await native.metadata(studioId, id);
      row.manifest = await native.animations(studioId, row.metadata, 0);
      fs.writeFileSync(`${root}/${id}-manifest.json`, JSON.stringify(row, null, 2));
      const old = JSON.parse(fs.readFileSync(`docs/results/generalization/holdout/${slot}.json`, "utf8"));
      row.selectedKey = old.pack?.entries.find((entry: any) => entry.clip)?.key ?? row.manifest.entries[0]?.key;
      assert.ok(row.selectedKey);
      row.selected = await native.animations(studioId, row.metadata, 100, row.selectedKey);
      const selected = row.selected.entries.find((entry: any) => entry.key === row.selectedKey);
      row.oracle = await call("execute_luau", { datamodel_type: "Edit", code: `
local roots=game:GetObjects("rbxassetid://${id}") local owned
local ok,result=pcall(function()
 for _,r in roots do for _,n in r:GetDescendants() do if n:IsA("BaseScript") then n.Enabled=false end if n:IsA("Sound") then n.PlayOnRemove=false end end end
 local indices=game:GetService("HttpService"):JSONDecode(${JSON.stringify(JSON.stringify(row.selectedKey.split("/").map(Number)))})
 local sequence=roots[indices[1]] for i=2,#indices do sequence=sequence:GetChildren()[indices[i]] end
 if sequence:IsA("Animation") then owned=game:GetService("KeyframeSequenceProvider"):GetKeyframeSequenceAsync(sequence.AnimationId):Clone() sequence=owned end
 local frames=sequence:GetKeyframes() table.sort(frames,function(a,b) return a.Time<b.Time end)
 local out={loop=sequence.Loop,priority=sequence.Priority.Name,frames={},poses=0}
 for _,f in frames do local row={time=f.Time,name=f.Name,markers={}} for _,m in f:GetMarkers() do table.insert(row.markers,{name=m.Name,value=m.Value}) end table.insert(out.frames,row) for _,p in f:GetDescendants() do if p:IsA("Pose") then out.poses+=1 end end end
 return out
end)
if owned then owned:Destroy() end for _,r in roots do r:Destroy() end
assert(ok,result) return game:GetService("HttpService"):JSONEncode(result)
` });
      row.summary = { total: row.manifest.entries.length, selectedKey: row.selectedKey, captured: !!selected?.clip, error: selected?.error, unchecked: row.selected.coverage?.uncheckedKeys.length };
    } catch (error) { row.error = String(error); }
    fs.writeFileSync(`${root}/${id}.json`, JSON.stringify(row, null, 2));
    console.log(JSON.stringify({ id, ...row.summary, error: row.error ?? row.summary?.error }));
  }
} finally {
  const state = await call("get_studio_state", {});
  assert.ok(isVerifiedEditState(state));
  const census = await call("execute_luau", { datamodel_type: "Edit", code: `local r={scripts=0,scopes={},workspaceChildren=#workspace:GetChildren()} for _,n in game:GetDescendants() do if n:IsA("LuaSourceContainer") then r.scripts+=1 end if string.match(n.Name,"^Takko_") or string.match(n.Name,"^Forge_") then table.insert(r.scopes,n:GetFullName()) end end return game:GetService("HttpService"):JSONEncode(r)` });
  fs.writeFileSync(root + "/cleanup.json", JSON.stringify({ at: new Date().toISOString(), state, census }, null, 2));
  await client.close();
}
