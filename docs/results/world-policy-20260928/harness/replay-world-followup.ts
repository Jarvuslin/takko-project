import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import assert from 'node:assert/strict';
import {Engine} from '../src/generation/engine';import {Configuration} from '../src/generation/settings';import {GenerationStore,newProject} from '../src/generation/store';import {profile} from '../tests/generation-fixtures';import {checkWorldScene} from '../src/generation/world-scene-check';import {existingProjectContext} from '../src/generation/world-policy';import {refreshProposal} from '../src/generation/proposal';
const out='docs/results/world-policy-20260928';
const real=JSON.parse(fs.readFileSync('docs/results/approved-reference-finish-20260927/terminal-project.json','utf8'));
const other=JSON.parse(fs.readFileSync('benchmarks/runs/butter-crunch-marketplace-v6-20260916/grok/final-project.json','utf8'));
const records=[];
for(const original of [real,other]){
 const p=structuredClone(original);p.world=newProject(p.request,8000000).world;
 const freshChecks=checkWorldScene(p.artifact,p);assert.ok(freshChecks.some(c=>c.id.startsWith('world:lights:')&&c.status==='failed'));
 p.implementationBackup={artifact:structuredClone(p.artifact),spec:p.spec,review:p.review,checks:p.checks,changed:[],completedBuildTasks:p.completedBuildTasks??[]};
 const preservedChecks=checkWorldScene(p.artifact,p);assert.ok(!preservedChecks.some(c=>c.status==='failed'));
 records.push({sourceId:p.id,freshChecks,preservedChecks,context:existingProjectContext(p)});
}
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'takko-world-followup-'));const store=new GenerationStore(directory),config=new Configuration(path.join(directory,'config'));
const model={...profile(),inputRate:0,outputRate:0};const settings=config.save({profiles:[model],routes:{planner:[model.id],builder:[model.id],reviewer:[model.id],repair:[]},budgetMicros:100000000,generationBudgetMicros:100000000,repairLimit:0});
const p=structuredClone(real);p.world=newProject(p.request,8000000).world;p.reservedMicros=0;p.budgetMicros=100000000;p.generation=undefined;p.proposal.changed=['theme'];p.staleImplementation=true;refreshProposal(p);p.proposal.approval={hash:p.proposal.hash,revision:p.revision,at:new Date().toISOString()};store.save(p);
let context:any;
const transport:typeof fetch=async(_url,init)=>{const body=JSON.parse(String(init?.body));context=JSON.parse(body.messages[1].content);assert.equal(context.kind,'scoped-plan');assert.deepEqual(context.existingProject.existingScene,real.artifact.scene);assert.deepEqual(context.existingProject.existingFiles,real.artifact.files);throw Error('OFFLINE_CAPTURE_COMPLETE: intentionally stop before a model response');};
const engine=new Engine(store,config,transport,undefined,undefined,{maxAttempts:1,allowFallbacks:false});
try{await (engine as any).run(p,'proposal-build',config.read(),new Map(),new AbortController().signal);assert.fail('Expected intentional offline stop');}catch(e){assert.ok(context,'Scoped planner context must have been reached');}
assert.deepEqual(p.artifact,real.artifact);
fs.writeFileSync(out+'/world-followup-replay.json',JSON.stringify({at:new Date().toISOString(),paidCalls:0,evidenceBoundary:'Offline real artifact checks and scoped planner context capture. Transport intentionally stops before any model response. This is not a completed build or gameplay test.',records,scopedPlanContext:context,preservedArtifact:true},null,2));
console.log({sceneOutputs:records.length,unrequestedLightingRejected:true,unchangedScenePreserved:true,realScopedPlannerContextCaptured:true,paidCalls:0});
