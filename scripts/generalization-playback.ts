import fs from 'node:fs';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {StdioStudioClient} from '../src/generation/studio-mcp-client';import {unpackMarketplace} from '../src/marketplace/studio';import {isVerifiedEditState,isVerifiedClientPlayState} from '../src/generation/studio-state';
const stratified=process.argv.includes('--stratified');
const dir=stratified?'docs/results/generalization/stratified':'docs/results/generalization/holdout',studioId=stratified?'216e6aaa-19c8-44d9-94f2-7341c2e69973':'360d3ed1-0d29-4942-96ed-1bb8e5faea62';
assert.ok(fs.existsSync(dir+'/cleanup.json'),'Sweep must finish first');assert.ok(!fs.existsSync(dir+'/playback.json'),'No playback retry');
const rows=fs.readdirSync(dir).filter(f=>/^\d+.json$/.test(f)).map(f=>JSON.parse(fs.readFileSync(dir+'/'+f,'utf8')));
const target=rows.find(r=>r.role==='static_target'&&r.verdict?.status==='ready'&&r.nativeRolePresent);
const attackStrata=['r6_single','r6_multi','r15_single','r15_multi'];
const options=stratified?rows.filter(r=>r.matchesStratum&&attackStrata.includes(r.stratum)&&r.entry?.clip&&r.analysis?.segments.length).map(r=>({row:r,analysis:{key:r.selectedKey,analysis:r.analysis},entry:r.entry})):rows.flatMap(r=>(r.animations??[]).filter((a:any)=>a.analysis.segments.length).map((a:any)=>({row:r,analysis:a,entry:r.pack.entries.find((e:any)=>e.key===a.key)})));
const selected:any[]=[];
const add=(condition:(x:any)=>boolean)=>{const found=options.find(x=>!selected.includes(x)&&condition(x));if(found)selected.push(found)};
if(stratified)for(const stratum of attackStrata)add(x=>x.row.stratum===stratum);
else {add(x=>x.entry.clip.rig==='R15');add(x=>x.analysis.analysis.segments.every((s:any)=>s.source==='motion'));add(()=>true);}
const report:any={at:new Date().toISOString(),target:target?.selected.assetId,selection:selected.map(x=>({assetId:x.row.selected.assetId,key:x.entry.key,segments:x.analysis.analysis.segments})),results:[],cost:0};
if(stratified)report.unfilledPlaybackStrata=attackStrata.filter(s=>!selected.some(x=>x.row.stratum===s));
if(!target||selected.length<(stratified?1:3)){report.gate=stratified?'unmet: no independently classified attack clip or no sampled structural target':'unmet: fewer than three eligible attack clips or no sampled structural target';fs.writeFileSync(dir+'/playback.json',JSON.stringify(report,null,2));process.exit(0)}
const scope='Takko_Generalization_'+randomUUID().replaceAll('-','');const client=new StdioStudioClient({timeoutMs:90000});let started=false;
const q=(s:string)=>JSON.stringify(s);
const call=async(name:string,args:any)=>unpackMarketplace(await client.callTool(name,{studio_id:studioId,...args}));
const lua=(code:string,play=false)=>call('execute_luau',{datamodel_type:play?'Server':'Edit',code});
const reference=fs.readFileSync('tests/fixtures/asset-roles/combo-contract.luau','utf8');
try{
 assert.ok(isVerifiedEditState(await call('get_studio_state',{})));
 report.prepare=await lua(`
 assert(not game:GetService('RunService'):IsRunning())
 local scope=Instance.new('Folder') scope.Name=${q(scope)} scope.Parent=workspace
 local function safe(roots)
 for _,root in roots do local all=root:GetDescendants() table.insert(all,root) for _,n in all do if n:IsA('BaseScript') then n.Enabled=false end if n:IsA('Sound') then n.PlayOnRemove=false end end end
 end
 local function removeScripts(root) for _,n in root:GetDescendants() do if n:IsA('LuaSourceContainer') then n:Destroy() end end end
 local targetRoots=game:GetObjects('rbxassetid://${target.selected.assetId}') safe(targetRoots)
 local target=Instance.new('Model') target.Name='Target'
 for _,r in targetRoots do r.Parent=target end removeScripts(target)
 local part=assert(target:FindFirstChildWhichIsA('BasePart',true),'No target part')
 local shift=CFrame.new(0,3,-3)*part.CFrame:Inverse()
 for _,p in target:GetDescendants() do if p:IsA('BasePart') then p.Anchored=true p.CanQuery=true p.CFrame=shift*p.CFrame end end
 target.PrimaryPart=part target.Parent=scope
 ${selected.map((x,i)=>`
 do
 local roots=game:GetObjects('rbxassetid://${x.row.selected.assetId}') safe(roots)
 local indices=game:GetService('HttpService'):JSONDecode(${q(JSON.stringify(x.entry.key.split('/').map(Number)))})
 local node=roots[indices[1]] for j=2,#indices do node=node:GetChildren()[indices[j]] end
 assert(node:IsA('KeyframeSequence') or node:IsA('Animation'),'Unexpected clip class')
 local clip=node:Clone() removeScripts(clip) clip.Name='Clip${i+1}' clip.Parent=scope
 for _,r in roots do r:Destroy() end
 local description=Instance.new('HumanoidDescription')
 local rig=game:GetService('Players'):CreateHumanoidModelFromDescriptionAsync(description,Enum.HumanoidRigType.${x.entry.clip.rig}) description:Destroy()
 removeScripts(rig) rig.Name='Rig${i+1}'
 local root=assert(rig:FindFirstChild('HumanoidRootPart')) root.Anchored=true
 for _,p in rig:GetDescendants() do if p:IsA('BasePart') then p.CanCollide=false end end
 rig:PivotTo(CFrame.new(0,3,0)) rig.Parent=scope
 end`).join('\n')}
 return 'prepared'
 `);
 started=true;await call('start_stop_play',{is_start:true});
 for(let n=0;n<20;n++){if(isVerifiedClientPlayState(await call('get_studio_state',{})))break;await new Promise(r=>setTimeout(r,500))}
 assert.ok(isVerifiedClientPlayState(await call('get_studio_state',{})));
 for(let i=0;i<selected.length;i++){
 const x=selected[i],segments=x.analysis.analysis.segments;
 try{const result=await lua(`
 assert(game:GetService('RunService'):IsRunning() and game:GetService('RunService'):IsServer())
 local Combo=(function() ${reference} end)()
 local scope=assert(workspace:FindFirstChild(${q(scope)}))
 local rig=scope.Rig${i+1} local root=rig.HumanoidRootPart local humanoid=rig:FindFirstChildWhichIsA('Humanoid')
 local animator=humanoid:FindFirstChildWhichIsA('Animator') or Instance.new('Animator',humanoid)
 local clip=scope.Clip${i+1} local anim=Instance.new('Animation')
 anim.AnimationId=clip:IsA('Animation') and clip.AnimationId or game:GetService('KeyframeSequenceProvider'):RegisterKeyframeSequence(clip)
 local track=animator:LoadAnimation(anim)
 local deadline=os.clock()+10 while track.Length==0 and os.clock()<deadline do task.wait(0.05) end
 assert(track.Length>0,'Animation did not load')
 local segments={${segments.map((s:any)=>`{start=${s.start},hit=${s.hit},finish=${s.end}}`).join(',')}}
 local c=Combo.client(segments) Combo.playback(c,track) local s=Combo.server(segments)
 local result={hits=0,expected=#segments,holds={},length=track.Length,maxJointMotion=0,clockAdvances=0}
 local baselines={} for _,p in rig:GetDescendants() do if p:IsA('BasePart') and p~=root then baselines[p]=root.CFrame:ToObjectSpace(p.CFrame) end end
 local origin=os.clock() local target=scope.Target
 for index,segment in ipairs(segments) do
 local now=os.clock()-origin Combo.click(c,now) assert(Combo.accept(s,s.nonce,index,now),'Server order refused')
 local count=#c.hits local oldPosition=track.TimePosition
 while c.active do
  task.wait(0.016) now=os.clock()-origin
  if track.TimePosition>oldPosition+0.001 then result.clockAdvances+=1 end
  for part,baseline in baselines do local delta=baseline:ToObjectSpace(root.CFrame:ToObjectSpace(part.CFrame)) local _,angle=delta:ToAxisAngle() result.maxJointMotion=math.max(result.maxJointMotion,math.abs(angle),delta.Position.Magnitude) end
  Combo.tick(c,now) oldPosition=track.TimePosition
  if #c.hits>count then
   count=#c.hits
   local offset=target.PrimaryPart.Position-root.Position
   local params=RaycastParams.new() params.FilterType=Enum.RaycastFilterType.Include params.FilterDescendantsInstances={target}
   local ray=workspace:Raycast(root.Position,offset.Unit*(offset.Magnitude+1),params)
   local observed={id=target,alive=true,inScope=ray~=nil and ray.Instance:IsDescendantOf(target),distance=ray and (ray.Position-root.Position).Magnitude or math.huge,facing=root.CFrame.LookVector:Dot(offset.Unit),lineOfSight=ray~=nil}
   if Combo.hit(s,s.nonce,now,observed,index) then result.hits+=1 end
   assert(not Combo.hit(s,s.nonce,now,observed,index),'Duplicate hit')
  end
 end
 if index<#segments then
  local held=track.TimePosition task.wait(0.08)
  local drift=math.abs(track.TimePosition-held) table.insert(result.holds,{position=held,expected=segment.finish,drift=drift})
  assert(drift<0.03 and math.abs(held-segment.finish)<0.03,'Hold drift')
 end
 end
 result.passed=result.hits==result.expected and result.maxJointMotion>0.001 and result.clockAdvances>0
 Combo.death(c,s,os.clock()-origin) track:Destroy() anim:Destroy()
 return game:GetService('HttpService'):JSONEncode(result)
 `,true);report.results.push({assetId:x.row.selected.assetId,key:x.entry.key,...result});if(!result.passed)break;
 }catch(e){report.results.push({assetId:x.row.selected.assetId,key:x.entry.key,passed:false,error:String(e)});break;}
 }
}catch(e){report.error=String(e)}finally{
 try{if(started)await call('start_stop_play',{is_start:false});
 for(let n=0;n<20;n++){if(isVerifiedEditState(await call('get_studio_state',{})))break;await new Promise(r=>setTimeout(r,500))}
 assert.ok(isVerifiedEditState(await call('get_studio_state',{})));
 report.cleanup=await lua(`local scope=workspace:FindFirstChild(${q(scope)}) if scope then scope:Destroy() end local r={scripts=0,scopes={},workspaceChildren=#workspace:GetChildren()} for _,n in game:GetDescendants() do if n:IsA('LuaSourceContainer') then r.scripts+=1 end if string.match(n.Name,'^Takko_') or string.match(n.Name,'^Forge_') then table.insert(r.scopes,n:GetFullName()) end end return game:GetService('HttpService'):JSONEncode(r)`);
 report.finalState=await call('get_studio_state',{});
 }catch(e){report.cleanupError=String(e)}
 fs.writeFileSync(dir+'/playback.json',JSON.stringify(report,null,2));await client.close();
}
console.log(JSON.stringify(report));
