import fs from 'node:fs';
import assert from 'node:assert/strict';
import {StdioStudioClient} from '../src/generation/studio-mcp-client';
import {unpackMarketplace} from '../src/marketplace/studio';
import {isVerifiedEditState,isVerifiedClientPlayState} from '../src/generation/studio-state';
const root='.forge/trial-probes/p-build-2',studioId='216e6aaa-19c8-44d9-94f2-7341c2e69973';
const bundle=JSON.parse(fs.readFileSync(root+'/model-bundle.json','utf8'));
const {scope}=JSON.parse(fs.readFileSync(root+'/context.json','utf8'));
assert.match(scope,/^Forge_[a-f0-9]+$/);
assert.ok(!fs.existsSync(root+'/native-once.json'),'No native rerun');
const report:any={at:new Date().toISOString(),scope,scenarios:[],cost:0};
const save=()=>fs.writeFileSync(root+'/native.json',JSON.stringify(report,null,2));
const client=new StdioStudioClient({timeoutMs:90000});
const call=async(name:string,args:object)=>unpackMarketplace(await client.callTool(name,{studio_id:studioId,...args}));
const lua=(code:string,mode='Edit')=>call('execute_luau',{code,datamodel_type:mode});
const q=JSON.stringify;
let owned=false,started=false;
try {
 const listing=unpackMarketplace(await client.callTool('list_roblox_studios',{}));
 assert.ok(listing.studios.some((s:any)=>s.id===studioId&&s.name==='TrialReviewInspection.rbxlx'));
 assert.ok(isVerifiedEditState(await call('get_studio_state',{})));
 report.baseline=await lua(`local n=0 for _,x in game:GetDescendants() do if x:IsA('LuaSourceContainer') then n+=1 end end assert(n==0,'Pre-existing scripts') assert(not game.StarterPlayer:FindFirstChild('StarterCharacter')) return {scripts=n,workspaceChildren=#workspace:GetChildren()}`);
 fs.writeFileSync(root+'/native-once.json',JSON.stringify({at:report.at}),{flag:'wx'});
 owned=true;
 report.prepare=await lua(`
local scope=${q(scope)}
for _,parent in {workspace,game.ReplicatedStorage,game.ServerScriptService,game.StarterPlayer.StarterPlayerScripts} do assert(not parent:FindFirstChild(scope)) local f=Instance.new('Folder') f.Name=scope f.Parent=parent end
local world=workspace[scope] local shared=game.ReplicatedStorage[scope]
local floor=Instance.new('Part') floor.Name='ProbeFloor' floor.Size=Vector3.new(40,1,40) floor.Anchored=true floor.Position=Vector3.new(0,-0.5,0) floor.Parent=world
local spawn=Instance.new('SpawnLocation') spawn.Name='ProbeSpawn' spawn.Anchored=true spawn.Size=Vector3.new(4,1,4) spawn.Transparency=1 spawn.CanCollide=false spawn.Position=Vector3.new(0,3,0) spawn.Parent=world
local function safe(roots) for _,root in roots do local all=root:GetDescendants() table.insert(all,root) for _,n in all do if n:IsA('BaseScript') then n.Enabled=false end if n:IsA('Sound') then n.PlayOnRemove=false end end for _,n in root:GetDescendants() do if n:IsA('LuaSourceContainer') then n:Destroy() end end end end
local roots=game:GetObjects('rbxassetid://15008746676') safe(roots)
local sequence
for _,r in roots do for _,n in r:GetDescendants() do if n:IsA('KeyframeSequence') and n.Name=='infinity punches' then assert(not sequence,'Ambiguous clip') sequence=n end end end
assert(sequence,'Known clip missing') local clip=sequence:Clone() clip.Name='PunchSequence' clip.Parent=shared for _,r in roots do r:Destroy() end
local targets=game:GetObjects('rbxassetid://10161087974') safe(targets)
local target=Instance.new('Model') target.Name='StrawTarget' target.Parent=world for _,r in targets do r.Parent=target end
local cf,size=target:GetBoundingBox() local shift=CFrame.new(0,size.Y/2,-3)*cf:Inverse()
for _,p in target:GetDescendants() do if p:IsA('BasePart') then p.Anchored=true p.CanQuery=true p.CFrame=shift*p.CFrame end end
local d=Instance.new('HumanoidDescription') local rig=game.Players:CreateHumanoidModelFromDescriptionAsync(d,Enum.HumanoidRigType.R6) d:Destroy()
for _,n in rig:GetDescendants() do if n:IsA('LuaSourceContainer') then n:Destroy() end end
rig.Name='StarterCharacter' rig:SetAttribute('ProbeOwner',scope) rig:PivotTo(CFrame.new(0,3,0)) rig.Parent=game.StarterPlayer
local files=game.HttpService:JSONDecode(${q(JSON.stringify(bundle.files))})
for _,f in files do local bits=string.split(f.path,'/') local parent=game:GetService(bits[1]) for i=2,#bits-1 do parent=assert(parent:FindFirstChild(bits[i]),f.path) end local s=Instance.new(f.kind) s.Name=bits[#bits] s.Source=f.source s.Parent=parent assert(s.Source==f.source) end
return {files=#files,frames=#clip:GetKeyframes(),rig=rig.Humanoid.RigType.Name,targetParts=#target:GetDescendants()}
`);save();
 started=true;await call('start_stop_play',{is_start:true});
 for(let i=0;i<30;i++){if(isVerifiedClientPlayState(await call('get_studio_state',{})))break;await new Promise(r=>setTimeout(r,300));}
 assert.ok(isVerifiedClientPlayState(await call('get_studio_state',{})));
 report.position=await lua(`local p=game.Players:GetPlayers()[1] assert(p) local c=p.Character or p.CharacterAdded:Wait() local r=c:WaitForChild('HumanoidRootPart',10) assert(r) r.Anchored=true r.CFrame=CFrame.new(0,3,0) c.Humanoid.AutoRotate=false return {rig=c.Humanoid.RigType.Name,health=c.Humanoid.Health,nonce=p:GetAttribute('ComboNonce')}`,'Server');
 assert.equal(report.position.rig,'R6');
 report.clientReady=await lua(`local p=game.Players.LocalPlayer local c=p.Character or p.CharacterAdded:Wait() local h=c:WaitForChild('Humanoid') local a=h:WaitForChild('Animator',10) assert(a) local shared=game.ReplicatedStorage:WaitForChild(${q(scope)}) assert(shared:WaitForChild('ComboRemote',10)) task.wait(2) workspace.CurrentCamera.CFrame=CFrame.lookAt(Vector3.new(8,7,8),Vector3.new(0,3,-1)) return {rig=h.RigType.Name,nonce=p:GetAttribute('ComboNonce'),tracks=#a:GetPlayingAnimationTracks()}`,'Client');save();
 const segments=await lua(`return require(game.ReplicatedStorage[${q(scope)}].ComboConfig).segments`,'Client');
 for(const name of ['one-click-silence','all-13-held-boundaries','continuous-clicks']){
  const scenario:any={name,at:new Date().toISOString()};report.scenarios.push(scenario);save();
  scenario.monitor=await lua(`
local shared=game.ReplicatedStorage[${q(scope)}] local p=game.Players.LocalPlayer local rig=p.Character local a=rig.Humanoid.Animator
local value=Instance.new('StringValue') value.Name='ProbeTimeline' value.Parent=shared
shared:SetAttribute('ProbeRecording',true)
local before=p:GetAttribute('Hits') or 0 local rows={} local start=os.clock() local base={} local root=rig.HumanoidRootPart
for _,part in rig:GetDescendants() do if part:IsA('BasePart') and part~=root then base[part]=root.CFrame:ToObjectSpace(part.CFrame) end end
local motion=0
 task.spawn(function()
 while shared:GetAttribute('ProbeRecording') and os.clock()-start<20 do
  local track for _,t in a:GetPlayingAnimationTracks() do if t.Priority==Enum.AnimationPriority.Action then track=t break end end
  for part,cf in base do local delta=cf:ToObjectSpace(root.CFrame:ToObjectSpace(part.CFrame)) local _,angle=delta:ToAxisAngle() motion=math.max(motion,math.abs(angle),delta.Position.Magnitude) end
  table.insert(rows,{t=os.clock()-start,position=track and track.TimePosition or -1,speed=track and track.Speed or -1,hits=p:GetAttribute('Hits') or 0,nonce=p:GetAttribute('ComboNonce') or 0})
  game.RunService.Heartbeat:Wait()
 end
 value.Value=game.HttpService:JSONEncode({before=before,after=p:GetAttribute('Hits') or 0,rows=rows,motion=motion})
 end)
return {before=before}
`,'Client');
  const actions:any[]=[];
  const click=()=>actions.push({action:'mouseButtonClick',mouse_button:'left',instance_path:`game.Workspace.${scope}.StrawTarget`});
  const wait=(ms:number)=>actions.push({action:'wait',wait_time_ms:ms});
  if(name==='one-click-silence'){click();wait(1300);}
  if(name==='all-13-held-boundaries'){for(const s of segments){click();wait(Math.ceil((s.finish-s.start)*1000)+90);}wait(650);}
  if(name==='continuous-clicks'){for(let i=0;i<25;i++){click();wait(100);}wait(1000);}
  scenario.input=await call('user_mouse_input',{datamodel_type:'Client',actions});
  scenario.observation=await lua(`local s=game.ReplicatedStorage[${q(scope)}] s:SetAttribute('ProbeRecording',false) local v=s.ProbeTimeline local untilAt=os.clock()+3 while v.Value=='' and os.clock()<untilAt do task.wait() end local result=game.HttpService:JSONDecode(v.Value) v:Destroy() return result`,'Client');
  scenario.server=await lua(`local p=game.Players:GetPlayers()[1] return {hits=p:GetAttribute('Hits'),nonce=p:GetAttribute('ComboNonce'),health=p.Character.Humanoid.Health}`,'Server');
  save();console.log(JSON.stringify({name,before:scenario.observation.before,after:scenario.observation.after,motion:scenario.observation.motion}));
 }
}catch(error){report.error=String(error);save();}
finally {
 try {
  if(started)await call('start_stop_play',{is_start:false});
  for(let i=0;i<30;i++){if(isVerifiedEditState(await call('get_studio_state',{})))break;await new Promise(r=>setTimeout(r,300));}
  report.finalState=await call('get_studio_state',{});assert.ok(isVerifiedEditState(report.finalState));
  if(owned)report.cleanup=await lua(`local name=${q(scope)} for _,parent in {workspace,game.ReplicatedStorage,game.ServerScriptService,game.StarterPlayer.StarterPlayerScripts} do local n=parent:FindFirstChild(name) if n then n:Destroy() end end local rig=game.StarterPlayer:FindFirstChild('StarterCharacter') if rig and rig:GetAttribute('ProbeOwner')==name then rig:Destroy() end local r={scripts=0,scopes={},workspaceChildren=#workspace:GetChildren()} for _,n in game:GetDescendants() do if n:IsA('LuaSourceContainer') then r.scripts+=1 end if n.Name:match('^Forge_') or n.Name:match('^Takko_') then table.insert(r.scopes,n:GetFullName()) end end return r`);
 }catch(error){report.cleanupError=String(error);}
 report.finishedAt=new Date().toISOString();save();await client.close();
}
console.log(JSON.stringify({error:report.error,cleanup:report.cleanup,cleanupError:report.cleanupError}));
