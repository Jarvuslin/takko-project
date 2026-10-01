// Completes only the preregistered census skipped by the empty-manifest early exit.
// Never searches, chooses another clip, retries an oracle, or rewrites original rows.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { StdioStudioClient } from '../src/generation/studio-mcp-client';
import { unpackMarketplace } from '../src/marketplace/studio';
import { isVerifiedEditState } from '../src/generation/studio-state';
function oracle(id: string, key?: string) { return `
assert(not game:GetService("RunService"):IsRunning())
local roots=game:GetObjects("rbxassetid://${id}") local owned
local ok,result=pcall(function()
 local r={instances=0,parts=0,characters=0,tools=0,invalidTools=0,effects=0,meshes=0,images=0,sounds=0,sequences=0,animations=0,oversizedSequences=0}
 for _,root in roots do local all=root:GetDescendants() table.insert(all,root)
 for _,n in all do
 r.instances+=1
 if n:IsA("BaseScript") then n.Enabled=false end if n:IsA("Sound") then n.PlayOnRemove=false end
 if n:IsA("BasePart") and n.Size.X>0 and n.Size.Y>0 and n.Size.Z>0 then r.parts+=1 end
 if n:IsA("Humanoid") then local root=n.Parent:FindFirstChild("HumanoidRootPart") if root and root:IsA("BasePart") then r.characters+=1 end end
 if n:IsA("Tool") then r.tools+=1 local h=n:FindFirstChild("Handle") if n.RequiresHandle and not(h and h:IsA("BasePart")) then r.invalidTools+=1 end end
 if n:IsA("ParticleEmitter") or n:IsA("Beam") or n:IsA("Trail") or n:IsA("Fire") or n:IsA("Smoke") or n:IsA("Sparkles") then r.effects+=1 end
 if (n:IsA("MeshPart") or n:IsA("SpecialMesh")) and #n.MeshId>0 then r.meshes+=1 end
 if (n:IsA("Decal") or n:IsA("Texture")) and #n.Texture>0 then r.images+=1 end
 if (n:IsA("ImageLabel") or n:IsA("ImageButton")) and #n.Image>0 then r.images+=1 end
 if n:IsA("Sound") and #n.SoundId>0 then r.sounds+=1 end
 if n:IsA("KeyframeSequence") then r.sequences+=1 if #n:GetKeyframes()>300 then r.oversizedSequences+=1 end end
 if n:IsA("Animation") then r.animations+=1 end
 end end
 ${key ? `
 local indices=game:GetService("HttpService"):JSONDecode(${JSON.stringify(JSON.stringify(key.split("/").map(Number)))})
 local sequence=roots[indices[1]] for i=2,#indices do sequence=sequence:GetChildren()[indices[i]] end
 if sequence:IsA("Animation") then owned=game:GetService("KeyframeSequenceProvider"):GetKeyframeSequenceAsync(sequence.AnimationId):Clone() sequence=owned end
 if sequence:IsA("KeyframeSequence") then
 local frames=sequence:GetKeyframes() table.sort(frames,function(a,b)return a.Time<b.Time end)
 local c={name=sequence.Name,loop=sequence.Loop,frameCount=#frames,frames={},rig="R6",truncated=#frames>300}
 for i,f in frames do if i<=300 then local row={time=f.Time,name=f.Name,markers={}} for _,m in f:GetMarkers() do if #row.markers<100 then table.insert(row.markers,{name=m.Name,value=m.Value}) else c.truncated=true end end table.insert(c.frames,row) end end
 for _,pose in sequence:GetDescendants() do if pose:IsA("Pose") and (pose.Name:find("Upper") or pose.Name:find("Lower") or pose.Name:find("Hand$") or pose.Name:find("Foot$")) then c.rig="R15" end end
 r.clip=c
 end` : ""}
 return r
end)
if owned then owned:Destroy() end for _,r in roots do r:Destroy() end
assert(ok,result) return game:GetService("HttpService"):JSONEncode(result)
`; }

const root = 'docs/results/generalization/stratified';
const output = root + '/oracle-supplement.json';
assert.ok(!fs.existsSync(output), 'No supplementary retries');
const manifest = JSON.parse(fs.readFileSync('docs/results/generalization/stratified-manifest.json','utf8'));
assert.equal(execFileSync('git',['diff',manifest.productionCommit,'--','src'],{encoding:'utf8'}).trim(),'');
const rows = fs.readdirSync(root).filter(f => /^\d+\.json$/.test(f)).map(f => JSON.parse(fs.readFileSync(root+'/'+f,'utf8')));
const pending = rows.filter(r => r.selected && r.metadata && !r.duplicate && !r.oracle && !r.oracleError);
assert.ok(pending.every(r => r.error?.includes('No clips in drawn asset') && r.manifest?.entries.length === 0));
const studioId='216e6aaa-19c8-44d9-94f2-7341c2e69973';
const client=new StdioStudioClient({timeoutMs:90000});
const call=async(name:string,args:object)=>unpackMarketplace(await client.callTool(name,{studio_id:studioId,...args}));
const result:any={at:new Date().toISOString(),purpose:'First attempt of census skipped by empty-manifest branch. Original failures unchanged. No search, new selection, retry or readiness verdict.',rows:[],cost:0};
const save=()=>fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
save();
try {
 const listing=unpackMarketplace(await client.callTool('list_roblox_studios',{}));
 assert.ok(listing.studios.some((s:any)=>s.id===studioId&&s.name==='TrialReviewInspection.rbxlx'));
 assert.ok(isVerifiedEditState(await call('get_studio_state',{})));
 for(const row of pending){
  const item:any={slot:row.slot,assetId:row.selected.assetId,at:new Date().toISOString()};
  try {item.oracle=await call('execute_luau',{datamodel_type:'Edit',code:oracle(item.assetId)});item.hasAnimationContent=item.oracle.sequences+item.oracle.animations>0;}
  catch(error){item.oracleError=String(error);}
  result.rows.push(item);save();console.log(JSON.stringify({slot:item.slot,hasAnimationContent:item.hasAnimationContent,error:item.oracleError}));
 }
} finally {
 try {result.state=await call('get_studio_state',{});assert.ok(isVerifiedEditState(result.state));result.census=await call('execute_luau',{datamodel_type:'Edit',code:`local r={scripts=0,scopes={},workspaceChildren=#workspace:GetChildren()} for _,n in game:GetDescendants() do if n:IsA('LuaSourceContainer') then r.scripts+=1 end if string.match(n.Name,'^Takko_') or string.match(n.Name,'^Forge_') then table.insert(r.scopes,n:GetFullName()) end end return game:GetService('HttpService'):JSONEncode(r)`});result.finishedAt=new Date().toISOString();save();}
 finally {await client.close();}
}
