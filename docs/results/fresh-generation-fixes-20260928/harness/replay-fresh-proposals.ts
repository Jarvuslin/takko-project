import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Engine} from '../src/generation/engine';
import {GenerationStore} from '../src/generation/store';
import {Configuration} from '../src/generation/settings';
import {profile} from '../tests/generation-fixtures';
const out='docs/results/fresh-generation-fixes-20260928';
const results=[];
for(const run of ['opencode-fighting-live-20260924','opencode-step3-live-20260925']) {
 const saved=JSON.parse(fs.readFileSync(`docs/results/${run}/terminal-project.json`,'utf8'));
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'takko-fresh-proposal-'));
 const store=new GenerationStore(directory), config=new Configuration(path.join(directory,'config'));
 const model={...profile(),inputRate:0,outputRate:0};
 config.save({profiles:[model],routes:{planner:[model.id],builder:[model.id],reviewer:[model.id],repair:[]},budgetMicros:1000000,generationBudgetMicros:800000,repairLimit:0});
 const contexts:any[]=[];
 const transport:typeof fetch=async (_url,init)=>{
   const body=JSON.parse(String(init?.body));
   const context=JSON.parse(body.messages[1].content); contexts.push(context);
   assert.equal(context.kind,'proposal');
   assert.equal(context.designGuidance.baseWorld.groundTop,0);
   assert.ok(context.designGuidance.baseWorld.instructions.some((s:string)=>s.includes('PointLights')));
   const {title,mechanics,theme,environment,assetNeeds}=saved.proposal;
   return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({title,mechanics,theme,environment,...(assetNeeds?{assetNeeds}:{})})}}],usage:{prompt_tokens:100,completion_tokens:100,cost:0}});
 };
 const engine=new Engine(store,config,transport);
 const project=engine.create(saved.request);
 engine.start(project.id,project.revision,'proposal');
 const result=await engine.wait(project.id);
 assert.equal(result.error,null);
 assert.ok(result.proposal?.mechanics.unresolved.some(q=>/combo|additional attack/i.test(q)));
 assert.throws(()=>engine.approveProposal(result.id,result.revision,result.proposal!.hash),/gameplay|mechanic/i);
 assert.equal(contexts.length,1);
 assert.ok(result.charges.every(c=>c.chargedMicros===0));
 results.push({run,request:saved.request,contexts,project:result,actualCost:0,evidenceBoundary:'Real proposal orchestration with preserved model output and offline transport. No real generation.'});
}
fs.writeFileSync(out+'/fresh-proposal-replays-final.json',JSON.stringify(results,null,2));
console.log(results.map(r=>({run:r.run,request:r.request,questions:r.project.proposal!.mechanics.unresolved,baseplateContext:true,lightingGuidance:true,approvalBlockedUntilAnswered:true,actualCost:0})));
