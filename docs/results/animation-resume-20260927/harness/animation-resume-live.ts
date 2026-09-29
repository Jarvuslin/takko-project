import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { createApp } from '../src/server/app';
import { windowsCredentialVault } from '../src/generation/credential-vault';
import { GenerationStore } from '../src/generation/store';

const output = path.resolve('docs/results/animation-resume-20260927');
const directory = path.resolve('.forge/runtime-diagnostics-profile-20260927');
const id = '8a81efe9-b8ed-44bc-a21a-5aad132813ac';
if (!fs.existsSync(path.join(output, 'offline-green.json'))) throw Error('Offline check/replays must be green');
if (!fs.existsSync(path.join(output, 'preflight.json'))) throw Error('Fresh balance preflight required');
if (fs.existsSync(path.join(output, 'runtime.json'))) throw Error('Do not repeat the authorized resume');
process.loadEnvFile('.env');
const store = new GenerationStore(directory);
const original = store.get(id);
if (original.jobId || original.stage !== 'failed' || original.executionMode !== 'opencode') throw Error('Unexpected saved state');
const baseline = original.charges.reduce((n,c)=>n+c.chargedMicros,0);
fs.writeFileSync(path.join(output, 'before-resume-project.json'), JSON.stringify(original,null,2));
fs.copyFileSync(path.join(directory,'configuration/models.json'),path.join(output,'unchanged-models.json'));
const owner = original.spec!.tasks.find(t=>t.id==='punch_input_client')!;
if (!owner || owner.files.length !== 1 || !owner.files[0].endsWith('/PunchController.client.luau')) throw Error('Unexpected animation owner');
store.checkpoint(original);
original.completedBuildTasks=original.completedBuildTasks!.filter(t=>t!==owner.id);
original.events.push({at:new Date().toISOString(), message:'User authorized animation integration correction. Reopen only punch_input_client. Existing files retained until validated replacement. Additional cap $4. No planning or acquisition authorized.'});
store.save(original);
fs.writeFileSync(path.join(output,'resume-preparation.json'),JSON.stringify({at:new Date().toISOString(),id,baselineMicros:baseline,additionalCapMicros:4_000_000,owner:owner.id,retainedCompletedTasks:original.completedBuildTasks,reviewerReasoningEffort:'medium',repairLimit:0},null,2));
const vault=windowsCredentialVault(path.join(directory,'provider-keys.dpapi'))!;
const transport: typeof fetch = async (url, init) => {
  const response=await fetch(url,init);
  if (response.headers.get('content-type')?.includes('application/json')) {
    try {
      const payload=await response.clone().json();
      const request=typeof init?.body==='string'?JSON.parse(init.body):{};
      fs.appendFileSync(path.join(output,'provider-usage.jsonl'),JSON.stringify({at:new Date().toISOString(),status:response.status,id:payload.id,model:payload.model,reasoning:request.reasoning,usage:payload.usage,finishReasons:payload.choices?.map((c:any)=>c.finish_reason)})+'\n');
    } catch { /* Provider handling retains malformed responses and accounting. */ }
  }
  return response;
};
const app=createApp(directory,{credentialVault:vault,env:process.env,transport,assetAdapterFactory:async()=>{throw Error('Acquisition is not authorized during this resume');},executionPolicy:{
  maxAttempts:2,allowFallbacks:false,reviewerReasoningEffort:'medium',
  beforeDispatch:async({phase,profile,attempt,reservedMicros})=>{
    const p=JSON.parse(fs.readFileSync(path.join(directory,id+'.json'),'utf8'));
    const additional=p.charges.reduce((n:number,c:any)=>n+c.chargedMicros,0)-baseline;
    if (!['builder','reviewer','repair'].includes(phase)) throw Error('Only coding/review resume authorized');
    if (additional+p.reservedMicros>4_000_000) throw Error('Additional $4 cap exceeded');
    if (fs.existsSync(path.join(output,'deny-dispatch'))) throw Error('Paid dispatch stopped');
    if (phase==='reviewer' && fs.existsSync(path.join(output,'reviewer-low'))) profile.reasoningEffort='low';
    fs.appendFileSync(path.join(output,'dispatch-reservations.jsonl'),JSON.stringify({at:new Date().toISOString(),phase,model:profile.model,reasoningEffort:profile.reasoningEffort??null,maxOutputTokens:profile.maxOutputTokens,attempt,reservedMicros,projectReservedMicros:p.reservedMicros,additionalChargedMicros:additional,chargeCount:p.charges.length})+'\n');
  },
}});
app.use(express.static(path.resolve('dist')));
const server=app.listen(4335,'127.0.0.1',()=>{
  const state={at:new Date().toISOString(),pid:process.pid,port:4335,directory,id,baselineMicros:baseline};
  fs.writeFileSync(path.join(output,'runtime.json'),JSON.stringify(state,null,2)); console.log(JSON.stringify(state));
});
const key=vault.read()['openrouter|https://openrouter.ai/api/v1'];
let last='', count=original.charges.length, busy=false;
async function balance(p:any){busy=true;try{
  const result:any={at:new Date().toISOString(),chargeCount:p.charges.length,additionalCharges:p.charges.slice(original.charges.length),reservedMicros:p.reservedMicros};
  for(const endpoint of ['key','credits']){
    const r=await fetch('https://openrouter.ai/api/v1/'+endpoint,{headers:{Authorization:'Bearer '+key},signal:AbortSignal.timeout(15000),redirect:'error'});
    if(!r.ok)throw Error(endpoint+' HTTP '+r.status);
    const {data}=await r.json();
    result[endpoint]=endpoint==='key'?{limit:data.limit,remaining:data.limit_remaining,usage:data.usage}:{totalCredits:data.total_credits,totalUsage:data.total_usage,remaining:data.total_credits-data.total_usage};
  }
  fs.appendFileSync(path.join(output,'balances-per-call.jsonl'),JSON.stringify(result)+'\n'); count=p.charges.length;
}catch(e){fs.appendFileSync(path.join(output,'balance-errors.jsonl'),JSON.stringify({at:new Date().toISOString(),error:String(e)})+'\n');}finally{busy=false;}}
const timer=setInterval(()=>{
  const p=JSON.parse(fs.readFileSync(path.join(directory,id+'.json'),'utf8'));
  fs.writeFileSync(path.join(output,'current-project.json'),JSON.stringify(p,null,2));
  if(p.charges.length>count&&!busy)void balance(p);
  const state={stage:p.stage,jobId:p.jobId,charges:p.charges.length,additionalMicros:p.charges.reduce((n:number,c:any)=>n+c.chargedMicros,0)-baseline,reservedMicros:p.reservedMicros,error:p.error,event:p.events.at(-1),tasks:p.completedBuildTasks};
  const signature=JSON.stringify(state);if(signature!==last){const row={at:new Date().toISOString(),...state};fs.appendFileSync(path.join(output,'progress.jsonl'),JSON.stringify(row)+'\n');console.log(JSON.stringify(row));last=signature;}
  if(fs.existsSync(path.join(output,'stop-server'))&&!p.jobId&&!busy){clearInterval(timer);server.close(()=>process.exit(0));server.closeAllConnections();}
},1000);
