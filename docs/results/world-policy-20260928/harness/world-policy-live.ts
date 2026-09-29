import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import {createApp} from '../src/server/app';
import {createOpenCodeBackend} from '../src/generation/opencode-runtime';
import {windowsCredentialVault} from '../src/generation/credential-vault';

const output=path.resolve('docs/results/world-policy-20260928/live');
const directory=path.resolve('.forge/world-policy-live-20260928');
if(!fs.existsSync(path.resolve('docs/results/world-policy-20260928/part1-green.json'))) throw Error('Part 1 must pass and be documented first');
if(fs.existsSync(output)) throw Error('One fresh run only. Preserve existing run.');
fs.mkdirSync(output,{recursive:true}); fs.mkdirSync(path.join(directory,'configuration'),{recursive:true});
const settings=JSON.parse(fs.readFileSync('.forge/runtime-diagnostics-profile-20260927/configuration/models.json','utf8'));
settings.budgetMicros=8000000;settings.generationBudgetMicros=8000000;settings.repairLimit=0;
fs.writeFileSync(path.join(directory,'configuration/models.json'),JSON.stringify(settings,null,2));
fs.copyFileSync('.forge/runtime-diagnostics-profile-20260927/provider-keys.dpapi',path.join(directory,'provider-keys.dpapi'));
const vault=windowsCredentialVault(path.join(directory,'provider-keys.dpapi'))!;
const key=vault.read()['openrouter|https://openrouter.ai/api/v1'];if(!key)throw Error('Encrypted connection unavailable');
let projectId='';
const append=(name:string,value:unknown)=>fs.appendFileSync(path.join(output,name),JSON.stringify(value)+'\n');
async function balance(label:string){
 const result:any={at:new Date().toISOString(),label};
 for(const endpoint of ['key','credits']){
  const r=await fetch('https://openrouter.ai/api/v1/'+endpoint,{headers:{Authorization:'Bearer '+key},signal:AbortSignal.timeout(15000),redirect:'error'});
  if(!r.ok)throw Error('Balance HTTP '+r.status);const {data}=await r.json();
  result[endpoint]=endpoint==='key'?{remaining:data.limit_remaining,usage:data.usage}:{remaining:data.total_credits-data.total_usage,usage:data.total_usage};
 }
 append('balances.jsonl',result);return result;
}
await balance('before-run');
const transport:typeof fetch=async(url,init)=>{
 const response=await fetch(url,init);
 if(response.headers.get('content-type')?.includes('application/json')){
  try{const body=await response.clone().json();append('provider-usage.jsonl',{at:new Date().toISOString(),httpStatus:response.status,id:body.id,model:body.model,usage:body.usage,finishReasons:body.choices?.map((c:any)=>c.finish_reason)});}catch{}
 }
 return response;
};
const service=createApp(directory,{credentialVault:vault,env:{},transport,executionPolicy:{
 opencode:createOpenCodeBackend(path.resolve('.forge/tools/opencode-1.18.31/opencode.exe')),
 excludedAssetIds:['12061946559'],maxAttempts:1,allowFallbacks:false,
 beforeDispatch:async({phase,profile,attempt,reservedMicros})=>{
  const p=service.locals.engine.store.get(projectId);
  const charged=p.charges.reduce((n:number,c:any)=>n+c.chargedMicros,0);
  if(fs.existsSync(path.join(output,'deny-dispatch')) || p.charges.some((c:any)=>c.status==='error')) throw Error('Run stopped. New authorization required.');
  if(charged+p.reservedMicros>8000000 || attempt!==1) throw Error('Hard $8 cap or retry policy violated');
  if(!['72d540d6-c2ef-4d7d-b07b-9bc6311adff1','c79f8a33-b1d8-4f69-bcc7-6a04a37206f2'].includes(profile.id)) throw Error('Unauthorized profile');
  append('reservations.jsonl',{at:new Date().toISOString(),phase,model:profile.model,attempt,reservedMicros,projectReservedMicros:p.reservedMicros,chargedMicros:charged});
 },
}});
const request='A fighting game where the player punches a stationary target dummy. Include a punching animation, a punch/hit sound when the player hits the dummy, and an on-screen counter that increments on each successful hit.';
const p=service.locals.engine.create(request);projectId=p.id;
fs.writeFileSync(path.join(output,'created-project.json'),JSON.stringify(p,null,2));
const app=express();
app.use((req,res,next)=>{if(req.method==='POST' && req.path==='/api/projects')return res.status(409).json({error:'This isolated service is reserved for the one authorized run.'});next();});
app.use(service);app.use(express.static(path.resolve('dist')));app.get('/{*path}',(_req,res)=>res.sendFile(path.resolve('dist/index.html')));
app.listen(4340,'127.0.0.1',()=>fs.writeFileSync(path.join(output,'runtime.json'),JSON.stringify({at:new Date().toISOString(),pid:process.pid,port:4340,projectId,directory,url:'http://127.0.0.1:4340/?project='+projectId},null,2)));
let signature='',count=0,busy=false,lastBalance:any=null;
setInterval(async()=>{
 const p=service.locals.engine.store.get(projectId);
 const state=JSON.stringify({stage:p.stage,jobId:p.jobId,charges:p.charges.length,reserved:p.reservedMicros,error:p.error});
 if(state!==signature){append('progress.jsonl',{at:new Date().toISOString(),...JSON.parse(state)});signature=state;}
 if(p.stage==='failed' && !fs.existsSync(path.join(output,'deny-dispatch')))fs.writeFileSync(path.join(output,'deny-dispatch'),'Failed trial. Do not retry without new authorization.');
 if(p.charges.length>count&&!busy){busy=true;try{lastBalance=await balance('after-charge-'+p.charges.length);count=p.charges.length;}catch(e){append('balance-errors.jsonl',{at:new Date().toISOString(),error:String(e)});}finally{busy=false;}}
 const total=p.charges.reduce((n:number,c:any)=>n+c.chargedMicros,0);
 fs.writeFileSync(path.join(output,'current-project.json'),JSON.stringify(p,null,2));
 const costs=['# Run costs','',`Updated ${new Date().toISOString()}. Hard cap $8.00 for the whole project.`, '', '| UTC | Model | Phase | Reservation USD | Charged USD | Status | Request |','|---|---|---|---:|---:|---|---|',...p.charges.map((c:any)=>`| ${c.at} | ${c.model} | ${c.phase} | ${(c.reservedMicros/1e6).toFixed(6)} | ${(c.chargedMicros/1e6).toFixed(6)} | ${c.status}${c.estimated?' (estimated)':''} | ${c.requestId??'see provider receipt'} |`),'',`Total $${(total/1e6).toFixed(6)}. Outstanding reservation $${(p.reservedMicros/1e6).toFixed(6)}.`,lastBalance?`Balance at ${lastBalance.at}: key $${lastBalance.key.remaining}, account $${lastBalance.credits.remaining}.`:'Balance refresh pending.','', 'No native gameplay verification. Provider usage and balance receipts are retained beside this file.'];
 fs.writeFileSync(path.join(output,'COSTS.md'),costs.join('\n')+'\n');
 fs.writeFileSync(path.join(output,'RESULTS.md'),`# Fresh authorized run\n\nUpdated ${new Date().toISOString()}. Project ${p.id}. Stage ${p.stage}.\n\n${p.error??'Stop at the saved proposal. User answers questions, selects assets, and presses Approve & build.'}\n\nTotal $${(total/1e6).toFixed(6)}, outstanding reservation $${(p.reservedMicros/1e6).toFixed(6)}, hard cap $8. See COSTS.md for every call and balances.\n\nNo automatic retry or repair resume. No export or gameplay claim before a completed build and user testing.\n`);
},1000);
