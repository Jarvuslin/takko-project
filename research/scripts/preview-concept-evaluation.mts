import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Engine } from '../../src/generation/engine';
import { Configuration } from '../../src/generation/settings';
import { GenerationStore } from '../../src/generation/store';
import { DispatchDenied } from '../../src/generation/providers';
import { assessConcept } from '../../src/generation/concept';
import { conceptProposalFixture } from '../../tests/concept.fixture';

const dir = fs.mkdtempSync(path.join(os.tmpdir(),'takko-concept-forecast-'));
const estimates: any[] = [];
try {
  const config = new Configuration(path.join(dir,'config'));
  const profile = {id:randomUUID(),name:'Forecast',provider:'openrouter',baseUrl:'https://openrouter.ai/api/v1',model:'anthropic/claude-haiku-4.5',inputRate:1,outputRate:5,maxOutputTokens:4000,jsonMode:true,structuredOutput:'anthropic'};
  config.save({profiles:[profile],routes:{planner:[profile.id],builder:[],reviewer:[],repair:[]},budgetMicros:150000,repairLimit:0,researchEnabled:false});
  config.setKey(profile.id,'offline-placeholder');
  const store = new GenerationStore(dir);
  const engine = new Engine(store,config,async()=>{throw Error('Network disabled');},undefined,undefined,{maxAttempts:1,allowFallbacks:false,beforeDispatch:r=>{estimates.push({stage,reservedMicros:r.reservedMicros});throw new DispatchDenied('Forecast only, no inference');}});
  let stage = '';
  for (stage of ['initial','clarify','plan','clear']) {
    let p = engine.create(stage==='clear'
      ? 'Create a solo pizza shop game. Customers order a pizza, I choose the toppings, bake and serve it, earn coins, and buy a faster oven. Cartoon style, no fighting or trading. Choose sensible defaults and ask no questions.'
      : 'I want to make a pet game, but I am not sure if players should rescue lost pets or battle with them. Help me choose what players actually do before building anything.');
    if (stage==='clarify'||stage==='plan') {
      p.answers = {play_style:'Rescue lost pets in a relaxed solo game. Carry pets to a shelter, earn coins, and unlock forest paths. No combat, trading or offline decay. Choose other details for me.'};
      p.answerQuestions = {play_style:'Should the game focus on rescue or battles?'};
    }
    if (stage==='plan') p.concept = assessConcept(conceptProposalFixture(false,p.answers),p);
    store.save(p);
    engine.start(p.id,p.revision,stage==='plan'?'plan':'concept');
    await engine.wait(p.id);
  }
  const prior = 46313;
  const total = estimates.reduce((s,r)=>s+r.reservedMicros,prior);
  const result={at:new Date().toISOString(),paidCalls:0,estimates,priorReservationsMicros:prior,estimatedCombinedReservationsMicros:total,ceilingMicros:150000,fitsEstimate:total<=150000,caveat:'Uses synthetic compact replies/answers for sizing only. Each actual request must pass the cumulative gate using its exact reservation.'};
  fs.writeFileSync('docs/results/concept-reliability-live-forecast.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
} finally {
  if (path.dirname(path.resolve(dir))!==path.resolve(os.tmpdir()) || !path.basename(dir).startsWith('takko-concept-forecast-')) throw Error('Unsafe cleanup');
  fs.rmSync(dir,{recursive:true,force:true});
}
