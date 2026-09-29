import fs from 'node:fs';
import {parseJson} from '../src/generation/providers.ts';
const out='docs/results/opencode-step3-live-20260925';
const p=JSON.parse(fs.readFileSync(out+'/terminal-project.json'));
const rows=fs.readFileSync(out+'/dispatch-reservations.jsonl','utf8').trim().split(/\r?\n/).map(l=>JSON.parse(l));
const trace=fs.readFileSync(out+'/traces/'+p.id+'.events.jsonl','utf8').trim().split(/\r?\n/).map(l=>JSON.parse(l));
const before=JSON.parse(fs.readFileSync(out+'/before-single-approval.json'));
const responseEvents=trace.filter(t=>t.response);
const codingFinished=(p.opencodeRuns??[]).filter(r=>r.phase==='builder'&&r.finishedAt).at(-1)?.finishedAt;
let cursor=0;
const calls=p.charges.map((c,i)=>{
 const dispatch=rows[i];
 let response;
 if(!c.opencodeRunId){
  const j=responseEvents.findIndex((t,j)=>j>=cursor&&t.model===c.model&&Date.parse(t.at)>=Date.parse(dispatch.at));
  if(j>=0&&Date.parse(responseEvents[j].at)-Date.parse(c.at)<5000){response=responseEvents[j];cursor=j+1;}
 }
 let parsed;try{parsed=parseJson(response?.response);}catch{}
 let phase=c.opencodeRunId?'OpenCode coding':i<6?'Automatic asset selection':parsed?.mechanics&&parsed?.theme?'Proposal':parsed?.changes?'Proposal scope edit':parsed?.requirements&&parsed?.tasks?'Implementation plan':c.model.startsWith('typesafe/')?'Jev interpretation':i<before.charges.length?'Proposal scope edit':c.phase==='reviewer'&&codingFinished&&Date.parse(c.at)>=Date.parse(codingFinished)?'Independent review':'Asset acquisition/review';
 if(phase==='Implementation plan'&&dispatch?.attempt>1)phase='Implementation-plan correction';
 if(phase==='Asset acquisition/review'&&dispatch?.attempt>1)phase='Asset-review correction';
 return {index:i+1,phase,at:c.at,model:c.model,status:c.status,attempt:dispatch?.attempt,reservationMicros:c.reservedMicros,chargedMicros:c.chargedMicros,billingSource:c.billingSource,inputTokens:c.inputTokens,outputTokens:c.outputTokens,cachedInputTokens:c.cachedInputTokens,elapsedMs:response?.requestTiming?.elapsedMs,sourceThemeRequirements:parsed?.requirements?.filter(r=>r.sourceId==='proposal:theme'),opencodeRunId:c.opencodeRunId};
});
const phases=Object.fromEntries([...new Set(calls.map(c=>c.phase))].map(phase=>{const group=calls.filter(c=>c.phase===phase);return [phase,{calls:group.length,chargedMicros:group.reduce((n,c)=>n+c.chargedMicros,0),inputTokens:group.reduce((n,c)=>n+(c.inputTokens??0),0),outputTokens:group.reduce((n,c)=>n+(c.outputTokens??0),0)}];}));
for(const name of ['Implementation-plan correction','OpenCode coding','Independent review'])phases[name]??={calls:0,chargedMicros:0,inputTokens:0,outputTokens:0};
const sessions=(p.opencodeRuns??[]).map(r=>({...r,inferenceExchanges:calls.filter(c=>c.opencodeRunId===r.id).length,requestCeiling:48,wallMs:r.finishedAt?Date.parse(r.finishedAt)-Date.parse(r.startedAt):null,deadlineMs:900000}));
const result={at:new Date().toISOString(),calls,phases,sessions,validationFeedback:p.events.filter(e=>e.message.startsWith('Validation feedback:')),note:'Category classification uses actual response structure, dispatch attempts and runtime IDs. Per-call provider charges remain authoritative. Asset-specific reviewer calls must be distinguished from final review when present.'};
fs.writeFileSync(out+'/phase-costs.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({phases,sessions,validationFeedback:result.validationFeedback}));
