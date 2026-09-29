import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import express from 'express';
import {createApp} from '../src/server/app';
import {windowsCredentialVault} from '../src/generation/credential-vault';
import {Configuration} from '../src/generation/settings';
const output=path.resolve('docs/results/opencode-fighting-live-20260924');
const directory=path.resolve('.forge/opencode-fighting-live-profile-20260924');
if(fs.existsSync(directory))throw Error('Existing trial must be preserved');
fs.mkdirSync(directory,{recursive:true});
const vaultFile=path.join(directory,'provider-keys.dpapi');
fs.copyFileSync(path.join(process.env.APPDATA!,'Forge Desktop/provider-keys.dpapi'),vaultFile);
const vault=windowsCredentialVault(vaultFile)!;
const {hasKey,...profile}=JSON.parse(fs.readFileSync('docs/results/fighting-open-app/model-after-timeout-change.json','utf8')).profile;
const jev={...profile,id:randomUUID(),name:'Jev non-coding decisions',model:'typesafe/jev-1.13',inputRate:0.042,outputRate:0};
new Configuration(path.join(directory,'configuration'),vault).save({profiles:[profile,jev],routes:{planner:[profile.id],builder:[profile.id],reviewer:[profile.id],repair:[profile.id],decisions:[jev.id]},budgetMicros:100_000_000,generationBudgetMicros:100_000_000,repairLimit:2});
fs.writeFileSync(path.join(output,'authorization.json'),JSON.stringify({at:new Date().toISOString(),request:'do a full run again, ignore budget just see if it can make a end to end game(fighting game as bench mark still)',freshTrial:true,previousTrialUntouched:true,priorAccountedMicros:3990954,technicalSettingsMaximumMicros:100_000_000,providerCreditNotIncreased:true},null,2));
const app=createApp(directory,{credentialVault:vault,env:{FORGE_OPENCODE_BINARY:path.resolve('.forge/tools/opencode-1.18.31/opencode.exe')},executionPolicy:{beforeDispatch:({reservedMicros})=>{fs.appendFileSync(path.join(output,'dispatch-reservations.jsonl'),JSON.stringify({at:new Date().toISOString(),reservedMicros})+'\n');}}});
app.use(express.static(path.resolve('dist')));
app.get('/{*path}',(_req,res)=>res.sendFile(path.resolve('dist/index.html')));
const server=app.listen(4335,'127.0.0.1',()=>{const state={at:new Date().toISOString(),pid:process.pid,port:4335,directory};fs.writeFileSync(path.join(output,'runtime.json'),JSON.stringify(state,null,2));console.log(JSON.stringify(state));});
let last='';
const timer=setInterval(()=>{
 const projects=fs.readdirSync(directory).filter(f=>/^[0-9a-f-]{36}\.json$/.test(f)).map(f=>JSON.parse(fs.readFileSync(path.join(directory,f),'utf8')));
 for(const p of projects)fs.writeFileSync(path.join(output,p.id+'.json'),JSON.stringify(p,null,2));
 const status=projects.map(p=>({id:p.id,revision:p.revision,mode:p.executionMode,stage:p.stage,jobId:p.jobId,spentMicros:p.charges.reduce((n:number,c:any)=>n+c.chargedMicros,0),reservedMicros:p.reservedMicros,error:p.error,event:p.events.at(-1)}));
 const signature=JSON.stringify(status);if(signature!==last){const row={at:new Date().toISOString(),projects:status};fs.appendFileSync(path.join(output,'progress.jsonl'),JSON.stringify(row)+'\n');console.log(JSON.stringify(row));last=signature;}
 if(fs.existsSync(path.join(output,'stop-server'))&&!projects.some(p=>p.jobId)){clearInterval(timer);server.close(()=>process.exit(0));server.closeAllConnections();}
},1500);
