import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {StudioMarketplace,unpackMarketplace} from '../src/marketplace/studio';import {StdioStudioClient} from '../src/generation/studio-mcp-client';
import {isVerifiedEditState} from '../src/generation/studio-state';import {inspectSnapshot} from '../src/marketplace/inspection';import {revisionKey} from '../src/marketplace/library';import {newProject} from '../src/generation/store';import {assetNeedSchema} from '../src/generation/asset-contract';import {assetRoleEvidence,mediaAssetId} from '../src/marketplace/role-evidence';import {animationSegments} from '../src/marketplace/animation-segments';
const root='docs/results/generalization/holdout',studioId='360d3ed1-0d29-4942-96ed-1bb8e5faea62';
const manifest=JSON.parse(fs.readFileSync('docs/results/generalization/holdout-manifest.json','utf8'));
assert.ok(!fs.existsSync(root),'Never overwrite or retry a holdout run');fs.mkdirSync(root,{recursive:true});
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();fs.writeFileSync(root+'/run.json',JSON.stringify({commit,at:new Date().toISOString(),cost:0,manifest},null,2));
const native=new StudioMarketplace(),client=new StdioStudioClient({timeoutMs:90000});const rows:any[]=[];const seen=new Set<string>();
const oracle=`
local roots=game:GetObjects("rbxassetid://%ID%")
local ok,result=pcall(function()
 local r={parts=0,humanoids=0,characters=0,tools=0,invalidTools=0,effects=0,meshes=0,images=0,sounds=0,sequences=0,animations=0,classes={}}
 for _,root in roots do
 local all=root:GetDescendants() table.insert(all,root)
 for _,n in all do
 if n:IsA("BaseScript") then n.Enabled=false end
 if n:IsA("Sound") then n.PlayOnRemove=false end
 r.classes[n.ClassName]=(r.classes[n.ClassName] or 0)+1
 if n:IsA("BasePart") and n.Size.X>0 and n.Size.Y>0 and n.Size.Z>0 then r.parts+=1 end
 if n:IsA("Humanoid") then r.humanoids+=1 local p=n.Parent:FindFirstChild("HumanoidRootPart") if p and p:IsA("BasePart") then r.characters+=1 end end
 if n:IsA("Tool") then r.tools+=1 local h=n:FindFirstChild("Handle") if n.RequiresHandle and not(h and h:IsA("BasePart")) then r.invalidTools+=1 end end
 if n:IsA("ParticleEmitter") or n:IsA("Beam") or n:IsA("Trail") or n:IsA("Fire") or n:IsA("Smoke") or n:IsA("Sparkles") then r.effects+=1 end
 if (n:IsA("MeshPart") or n:IsA("SpecialMesh")) and #n.MeshId>0 then r.meshes+=1 end
 if (n:IsA("Decal") or n:IsA("Texture")) and #n.Texture>0 then r.images+=1 end
 if (n:IsA("ImageLabel") or n:IsA("ImageButton")) and #n.Image>0 then r.images+=1 end
 if n:IsA("Sound") and #n.SoundId>0 then r.sounds+=1 end
 if n:IsA("KeyframeSequence") then r.sequences+=1 end
 if n:IsA("Animation") then r.animations+=1 end
 end end
 return r
end)
for _,r in roots do r:Destroy() end
assert(ok,result)
return game:GetService("HttpService"):JSONEncode(result)
`;
try{
 assert.ok(isVerifiedEditState(unpackMarketplace(await client.callTool('get_studio_state',{studio_id:studioId}))));
 for(const slot of manifest.slots){const row:any={...slot,at:new Date().toISOString()};try{
 const page=await native.searchPage(studioId,slot.query,slot.kind);row.search=page;row.exclusions=page.assets.filter(a=>manifest.excludedIds.includes(a.assetId)).map(a=>a.assetId);
 const eligible=page.assets.filter(a=>!manifest.excludedIds.includes(a.assetId));assert.ok(eligible.length,'No unseen free results');const selected=eligible[Math.floor(slot.rankDraw*Math.min(5,eligible.length))];row.selected=selected;
 if(seen.has(selected.assetId)){row.duplicate=true;throw Error('Duplicate recorded without replacement')}seen.add(selected.assetId);
 row.metadata=await native.metadata(studioId,selected.assetId);
 try{row.oracle=unpackMarketplace(await client.callTool('execute_luau',{studio_id:studioId,datamodel_type:'Edit',code:oracle.replace('%ID%',selected.assetId)}))}catch(e){row.oracleError=String(e)}
 row.snapshot=await native.snapshot(studioId,row.metadata);
 if(slot.role==='animation')row.pack=await native.animations(studioId,row.metadata);
 const p=newProject('Preregistered native role evaluation',7500000);const need=assetNeedSchema.parse({id:'sample',requirementId:'sample',assetRole:slot.role,role:slot.role==='animation'?(/idle|run|dance/.test(slot.query)?'Noncombat animation':'Player punch attack'):slot.role,kind:row.metadata.kind,query:slot.query,constraints:'Use native evidence',position:[0,0,0]});
 const inspection=inspectSnapshot(row.snapshot);inspection.nativeRevisionKey=revisionKey(row.metadata);
 const entry=row.pack?.entries.find((e:any)=>e.clip);
 if(entry)p.rig={selected:entry.clip.rig,source:'user'} as any;
 const sound=inspection.nativeRoles?.sounds.find(s=>mediaAssetId(s.soundId));if(sound)need.pick={assetId:selected.assetId,sound:{path:sound.path,assetId:mediaAssetId(sound.soundId)!}};
 p.proposal={title:'Native sample',revision:1,hash:'',changed:[],assetNeeds:[need],mechanics:{text:'Requested use',assumptions:[],unresolved:[]},theme:{text:'Plain',assumptions:[],unresolved:[]},environment:{text:'Baseplate',assumptions:[],unresolved:[]}};
 const option={...row.metadata,inspection,...(row.pack?{previewData:{pack:row.pack,revisionKey:revisionKey(row.metadata)}}:{})};
 p.assetDiscovery={id:p.id,revision:p.revision,studioId,choices:{sample:{assetId:selected.assetId,...(entry?{clipKey:entry.key}:{})}},groups:[{id:'sample',kind:row.metadata.kind,label:need.role,query:slot.query,preview:'model',options:[option]}]};
 row.verdict=assetRoleEvidence(p,p.assetDiscovery.groups[0]);
 row.animations=row.pack?.entries.filter((e:any)=>e.clip).map((e:any)=>({key:e.key,name:e.name,rig:e.clip.rig,analysis:animationSegments(e.clip,inspection.nativeRoles?.sequences.find(s=>s.key===e.key),need.role)}));
 if(row.oracle){const o=row.oracle;row.nativeRolePresent=slot.role==='character'?o.humanoids>0&&o.humanoids===o.characters:slot.role==='tool'?o.tools>0&&o.invalidTools===0:slot.role==='vfx'?o.effects>0:slot.role==='mesh'?o.meshes>0:slot.role==='image'?o.images>0:slot.role==='sound'?o.sounds>0:slot.role==='animation'?o.sequences+o.animations>0:o.parts>0;row.falsePass=row.verdict.status==='ready'&&!row.nativeRolePresent;row.falseBlock=row.verdict.status==='blocked'&&row.nativeRolePresent;row.wrongRole=!row.nativeRolePresent;}
 }catch(e){row.error=String(e)}rows.push(row);fs.writeFileSync(root+'/'+String(slot.slot).padStart(2,'0')+'.json',JSON.stringify(row,null,2));console.log(slot.slot,slot.query,row.selected?.assetId,row.verdict?.status,row.error??'captured');}
}finally{
 const state=unpackMarketplace(await client.callTool('get_studio_state',{studio_id:studioId}));
 const census=unpackMarketplace(await client.callTool('execute_luau',{studio_id:studioId,datamodel_type:'Edit',code:'local r={scripts=0,scopes={},workspaceChildren=#workspace:GetChildren()} for _,n in game:GetDescendants() do if n:IsA("LuaSourceContainer") then r.scripts+=1 end if string.match(n.Name,"^Forge_") or string.match(n.Name,"^Takko_") then table.insert(r.scopes,n:GetFullName()) end end return game:GetService("HttpService"):JSONEncode(r)'}));
 fs.writeFileSync(root+'/cleanup.json',JSON.stringify({state,census},null,2));await client.close();
}
