import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import express from 'express';
import {createApp} from '../src/server/app';
import {windowsCredentialVault} from '../src/generation/credential-vault';
import {Configuration} from '../src/generation/settings';
const output=path.resolve('docs/results/planner-recovery-run13-20260927');
const directory=path.resolve('.forge/planner-recovery-run13-profile-20260927');
if(fs.existsSync(directory))throw Error('Existing trial must be preserved');
const preflight=JSON.parse(fs.readFileSync(path.join(output,'preflight.json'),'utf8'));
if(!preflight.envOnlyAuthorizedPath||preflight.preflight!=='passed')throw Error('Preflight required');
process.loadEnvFile('.env');
fs.mkdirSync(directory,{recursive:true});
const vaultFile=path.join(directory,'provider-keys.dpapi');
fs.copyFileSync(path.join(process.env.APPDATA!,'Forge Desktop/provider-keys.dpapi'),vaultFile);
const vault=windowsCredentialVault(vaultFile)!;
const {hasKey,...profile}=JSON.parse(fs.readFileSync('docs/results/fighting-open-app/model-after-timeout-change.json','utf8')).profile;
const jev={...profile,id:randomUUID(),name:'Jev non-coding decisions',model:'typesafe/jev-1.13',inputRate:0.042,outputRate:0};
new Configuration(path.join(directory,'configuration'),vault).save({profiles:[profile,jev],routes:{planner:[profile.id],builder:[profile.id],reviewer:[profile.id],repair:[profile.id],decisions:[jev.id]},budgetMicros:8_000_000,generationBudgetMicros:8_000_000,repairLimit:0});
fs.writeFileSync(path.join(output,'authorization.json'),JSON.stringify({at:new Date().toISOString(),source:'d323e122-303d-4290-be83-929bc68cc75b/Pasted text.txt',freshTrial:true,capMicros:8_000_000,maxAttempts:4,allowFallbacks:false,repairLimit:0,automaticSelectionFirst:true,manualSelectionAfterFailureAuthorized:true,stopAt:'place_export',delivery:'GET /api/projects/:id/export',bridgeApplyAuthorized:false,gameplayAuthorized:false,priorAccountedMicros:6554594},null,2));
function projects(){return fs.readdirSync(directory).filter(f=>/^[0-9a-f-]{36}\.json$/.test(f)).map(f=>JSON.parse(fs.readFileSync(path.join(directory,f),'utf8')));}
const app=createApp(directory,{credentialVault:vault,env:process.env,executionPolicy:{maxAttempts:4,allowFallbacks:false,beforeDispatch:async({phase,profile,attempt,reservedMicros})=>{
 const p=projects()[0];
 if(!p||p.executionMode!=='opencode'||!fs.existsSync(path.join(output,'mode-verified.json')))throw Error('Saved OpenCode mode must be verified before paid dispatch');
 if(p.charges.reduce((n:number,c:any)=>n+c.chargedMicros,0)+p.reservedMicros>8_000_000)throw Error('Run cap exceeded');
 fs.appendFileSync(path.join(output,'dispatch-reservations.jsonl'),JSON.stringify({at:new Date().toISOString(),phase,model:profile.model,attempt,reservedMicros,projectReservedMicros:p.reservedMicros,chargeCount:p.charges.length})+'\n');
 if(fs.existsSync(path.join(output,'deny-dispatch')))throw Error('Paid dispatch stopped');
}}});
app.use(express.static(path.resolve('dist')));
app.get('/{*path}',(_req,res)=>res.sendFile(path.resolve('dist/index.html')));
const server=app.listen(4335,'127.0.0.1',()=>{const state={at:new Date().toISOString(),pid:process.pid,port:4335,directory,envLoaded:true,envMtime:fs.statSync('.env').mtime.toISOString(),binary:process.env.FORGE_OPENCODE_BINARY};fs.writeFileSync(path.join(output,'runtime.json'),JSON.stringify(state,null,2));console.log(JSON.stringify(state));});
const key=vault.read()['openrouter|https://openrouter.ai/api/v1'];
let last='',lastChargeCount=0,balanceBusy=false;
async function recordBalance(p:any){balanceBusy=true;try{
 const result:any={at:new Date().toISOString(),afterChargeCount:p.charges.length,charges:p.charges.map((c:any)=>({requestId:c.requestId,chargedMicros:c.chargedMicros,reservedMicros:c.reservedMicros})),reservedMicros:p.reservedMicros};
 for(const endpoint of ['key','credits']){const r=await fetch('https://openrouter.ai/api/v1/'+endpoint,{headers:{Authorization:'Bearer '+key},signal:AbortSignal.timeout(15000),redirect:'error'});if(!r.ok)throw Error(endpoint+' HTTP '+r.status);const{data}=await r.json();result[endpoint]=endpoint==='key'?{limit:data.limit,remaining:data.limit_remaining,usage:data.usage}:{totalCredits:data.total_credits,totalUsage:data.total_usage,remaining:data.total_credits-data.total_usage};}
 fs.appendFileSync(path.join(output,'balances-per-call.jsonl'),JSON.stringify(result)+'\n');lastChargeCount=p.charges.length;
}catch(e){fs.appendFileSync(path.join(output,'balance-errors.jsonl'),JSON.stringify({at:new Date().toISOString(),error:String(e)})+'\n');}finally{balanceBusy=false;}}
const timer=setInterval(()=>{
 const ps=projects();
 for(const p of ps){fs.writeFileSync(path.join(output,p.id+'.json'),JSON.stringify(p,null,2));if(p.charges.length>lastChargeCount&&!balanceBusy)void recordBalance(p);}
 const status=ps.map(p=>({id:p.id,revision:p.revision,mode:p.executionMode,stage:p.stage,jobId:p.jobId,spentMicros:p.charges.reduce((n:number,c:any)=>n+c.chargedMicros,0),reservedMicros:p.reservedMicros,error:p.error,event:p.events.at(-1),openCodeRuns:p.opencodeRuns?.length??0,requirements:p.spec?.requirements.length,tasks:p.spec?.tasks.length}));
 const signature=JSON.stringify(status);if(signature!==last){const row={at:new Date().toISOString(),projects:status};fs.appendFileSync(path.join(output,'progress.jsonl'),JSON.stringify(row)+'\n');console.log(JSON.stringify(row));last=signature;}
 if(fs.existsSync(path.join(output,'stop-server'))&&!ps.some(p=>p.jobId)&&!balanceBusy){clearInterval(timer);server.close(()=>process.exit(0));server.closeAllConnections();}
},1000);
