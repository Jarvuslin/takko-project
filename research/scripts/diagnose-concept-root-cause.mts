import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { Engine } from '../../src/generation/engine';
import { GenerationStore } from '../../src/generation/store';
import { Configuration } from '../../src/generation/settings';
import { complete, parseJson } from '../../src/generation/providers';
import { conceptSchema } from '../../src/generation/concept';
import { authorizeDispatch } from './concept-live-guard.mjs';

// Diagnostic replay only. No credential access, listener, paid call or product edit.
globalThis.fetch = async () => { throw Error('Network disabled in root-cause replay'); };
const root = path.resolve('research/results/concept-root-cause');
fs.mkdirSync(root, {recursive:true});
const output = fs.mkdtempSync(path.join(root,'replay-'));
const read = (file: string) => JSON.parse(fs.readFileSync(file,'utf8'));
const hash = (file: string) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const inputFiles = ['v1','v2'].flatMap(v => ['clarify-request.json','clarify-response.json','model-metadata.json'].map(f => `research/results/concept-live-${v}/${f}`));
const sourceFiles = ['src/generation/engine.ts','src/generation/providers.ts','src/generation/concept.ts','src/generation/settings.ts'];
const before = Object.fromEntries([...inputFiles,...sourceFiles].map(f => [f,hash(f)]));
const v1 = read(inputFiles[1]), v2 = read(inputFiles[4]);
const req = read(inputFiles[3]);
const c1: any = parseJson(v1.choices[0].message.content), c2: any = parseJson(v2.choices[0].message.content);
const sentence = z.string().trim().min(1).max(500);
const fourSteps = conceptSchema.shape.firstPlaytest.extend({steps:z.array(sentence).min(1).max(4)});
const original = conceptSchema.safeExtend({playerExperience:sentence,visualDirection:sentence,firstPlaytest:fourSteps});
const retrySchema = conceptSchema.safeExtend({firstPlaytest:fourSteps});
const corrected = structuredClone(v2);
const correctedConcept = {...c2,firstPlaytest:{...c2.firstPlaytest,steps:c2.firstPlaytest.steps.slice(0,4)}};
corrected.choices[0].message.content = JSON.stringify(correctedConcept);
const directories: string[] = [];
const observations: any[] = [];
function setup(transport: typeof fetch) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(),'takko-root-cause-'));
  directories.push(dir);
  const config = new Configuration(path.join(dir,'config'));
  const profile = read('research/results/concept-live-v2/projects/configuration/models.json').profiles[0];
  config.save({profiles:[profile],routes:{planner:[profile.id],builder:[],reviewer:[],repair:[]},budgetMicros:150000,repairLimit:0,researchEnabled:false});
  config.setKey(profile.id,'offline-fixture-no-network');
  const store = new GenerationStore(dir), engine = new Engine(store,config,transport);
  return {config,profile,store,engine};
}
async function probe(name: string, fn: () => unknown | Promise<unknown>) {
  try { observations.push({name,passed:true,detail:await fn()}); console.log('PASS '+name); }
  catch (e) { observations.push({name,passed:false,error:String(e)}); console.log('FAIL '+name+': '+String(e)); }
}
async function callWithReplay(blockCorrection: boolean) {
  let calls = 0;
  const dispatchLedger: any[] = [];
  const transport: typeof fetch = async (_url,init) => {
    calls++;
    if (blockCorrection) {
      const reservedMicros = authorizeDispatch('clarify',JSON.parse(String(init?.body)),dispatchLedger);
      dispatchLedger.push({stage:'clarify',reservedMicros,status:'reconciled'});
    }
    return Response.json(calls === 1 ? v2 : corrected);
  };
  const {engine,config,store} = setup(transport);
  const p = engine.create(JSON.parse(req.messages[1].content).request);
  let value: unknown, error: any;
  try {
    // Invoke the real generic call path with the historical acceptance schema.
    value = await (engine as any).call(p,'planner',JSON.parse(req.messages[1].content),retrySchema,config.read(),new Map(),new AbortController().signal,undefined,undefined,{providedSchema:true,maxOutputTokens:2000,system:req.messages[0].content.split('\nReturn a JSON data instance')[0]});
  } catch (e) { error = e; }
  return {calls,value,error,p:store.get(p.id),guardAccepted:dispatchLedger.length};
}
try {
  await probe('original failure is the two exact length constraints, not JSON parsing', () => {
    const result = original.safeParse(c1);
    assert.equal(result.success,false);
    assert.deepEqual(result.error!.issues.map(i=>i.path.join('.')),['playerExperience','visualDirection']);
    assert.equal(v1.choices[0].finish_reason,'stop');
    assert.equal(original.safeExtend({playerExperience:conceptSchema.shape.playerExperience}).safeParse(c1).success,false);
    assert.equal(retrySchema.safeParse(c1).success,true);
    return {lengths:[c1.playerExperience.length,c1.visualDirection.length],issues:result.error!.issues};
  });
  await probe('description-only fix leaves independent five-step failure unchanged', () => {
    const result = retrySchema.safeParse(c2);
    assert.equal(result.success,false);
    assert.deepEqual(result.error!.issues.map(i=>i.path.join('.')),['firstPlaytest.steps']);
    assert.equal(conceptSchema.safeParse(c2).success,true);
    assert.equal(v2.choices[0].finish_reason,'stop');
    return {steps:c2.firstPlaytest.steps.length,issues:result.error!.issues};
  });
  await probe('recorded requests use JSON mode, with constraints only in prompt', () => {
    for (const v of ['v1','v2']) {
      const request = read(`research/results/concept-live-${v}/clarify-request.json`);
      assert.deepEqual(request.response_format,{type:'json_object'});
      assert.equal(request.provider.require_parameters,undefined);
      assert.equal(JSON.parse(request.messages[0].content.split('OUTPUT SCHEMA: ')[1]).properties.firstPlaytest.properties.steps.maxItems,4);
      const endpoint = read(`research/results/concept-live-${v}/model-metadata.json`).data.endpoints.find((e:any)=>e.tag==='anthropic');
      assert.ok(endpoint.supported_parameters.includes('structured_outputs'));
    }
    return {format:'json_object',schemaInPrompt:true,recordedEndpointAdvertisesStructuredOutputs:true};
  });
  await probe('one-dispatch guard produces connection error and extra unknown-usage reservation', async () => {
    const r = await callWithReplay(true);
    assert.equal(r.calls,2); assert.equal(r.guardAccepted,1);
    assert.match(r.error.message,/Provider connection failed/);
    assert.ok(r.p.events.some(e=>e.message.includes('firstPlaytest.steps')));
    assert.equal(r.p.charges.length,2);
    assert.equal(r.p.charges[1].billingSource,'reservation');
    return {transportAttempts:r.calls,guardAccepted:r.guardAccepted,error:r.error.message,offlineCharges:r.p.charges};
  });
  await probe('allowing a synthetic valid correction succeeds with repairLimit zero', async () => {
    const r = await callWithReplay(false);
    assert.equal(r.error,undefined); assert.equal(r.calls,2);
    assert.deepEqual(r.value,correctedConcept);
    assert.equal(r.p.charges[1].billingSource,'provider');
    return {transportAttempts:r.calls,repairLimit:0,caveat:'Second response is hand-corrected offline, not a live model outcome'};
  });
  await probe('local dispatch refusal and simulated network failure lose their distinction', async () => {
    const errors: string[] = [];
    for (const reason of ['No retry permitted','simulated ECONNRESET']) {
      const {profile} = setup(async()=>{throw Error(reason);});
      const error = await complete(profile,'','JSON','request',new AbortController().signal,async()=>{throw Error(reason);}).catch(e=>e);
      errors.push(error.message);
    }
    assert.deepEqual(errors,['Provider connection failed','Provider connection failed']);
    return {errors};
  });
  await probe('current concept flow accepts the saved unresolved choice and manual setup guidance', async () => {
    let calls = 0;
    const {engine} = setup(async()=>{calls++;return Response.json(v2);});
    const p = engine.create(JSON.parse(req.messages[1].content).request);
    engine.start(p.id,1,'concept');
    const saved = await engine.wait(p.id);
    assert.equal(calls,1); assert.equal(saved.stage,'draft');
    assert.equal(saved.concept?.questions.length,0);
    assert.match(saved.concept!.visualDirection,/top-down or side-scrolling/);
    assert.match(saved.concept!.firstPlaytest.steps[0],/Manually place/);
    assert.ok(saved.events.some(e=>e.message.includes('Game concept ready')));
    return {stage:saved.stage,visual:saved.concept!.visualDirection,firstStep:saved.concept!.firstPlaytest.steps[0]};
  });
  for (const renamed of [false,true]) await probe(renamed ? 'renaming an answered question ID bypasses the repetition check' : 'exact answered question ID is rejected by the existing semantic check', async () => {
    let calls = 0;
    const question = {id:renamed?'core_interaction_again':'core_interaction',prompt:JSON.parse(req.messages[1].content).answerQuestions.core_interaction,options:['Rescue pets','Battle pets']};
    const reply = structuredClone(v2);
    reply.choices[0].message.content = JSON.stringify({...c2,questions:[question]});
    const {engine} = setup(async()=>{calls++;return Response.json(reply);});
    let p = engine.create(JSON.parse(req.messages[1].content).request);
    p = engine.revise(p.id,1,p.request,{core_interaction:'Rescue pets'});
    engine.start(p.id,p.revision,'concept');
    const saved = await engine.wait(p.id);
    assert.equal(saved.stage,renamed?'clarification':'failed');
    assert.equal(calls,renamed?1:2);
    return {renamed,stage:saved.stage,calls};
  });
} finally {
  for (const dir of directories) {
    const resolved = path.resolve(dir);
    if (path.dirname(resolved)!==path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith('takko-root-cause-')) throw Error('Unsafe cleanup path');
    fs.rmSync(resolved,{recursive:true,force:true});
  }
  const after = Object.fromEntries([...inputFiles,...sourceFiles].map(f=>[f,hash(f)]));
  assert.deepEqual(after,before);
  fs.writeFileSync(path.join(output,'RESULTS.json'),JSON.stringify({at:new Date().toISOString(),paidCalls:0,networkDisabled:true,productAndEvidenceUnchanged:true,sourceHashes:before,observations},null,2));
  console.log(JSON.stringify({output,passed:observations.filter(r=>r.passed).length,failed:observations.filter(r=>!r.passed).length,paidCalls:0}));
  if (observations.some(r=>!r.passed)) process.exitCode=1;
}
