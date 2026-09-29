import fs from 'node:fs';
const output='docs/results/opencode-step3-live-20260925', dir='.forge/opencode-step3-live-profile-20260925';
const id=JSON.parse(fs.readFileSync(output+'/mode-verified.json')).projectId;
const p=JSON.parse(fs.readFileSync(dir+'/'+id+'.json'));
const events=fs.readFileSync(dir+'/traces/'+id+'.events.jsonl','utf8').trim().split(/\r?\n/).map(l=>JSON.parse(l));
if(!fs.existsSync(output+'/automatic-outcome.json')&&fs.existsSync(output+'/automatic-before-proposal.json')){
 const before=JSON.parse(fs.readFileSync(output+'/automatic-before-proposal.json'));let n=0;
 const raw=events.filter(e=>e.model==='typesafe/jev-1.13'&&e.response);
 const groups=before.assetDiscovery.groups.map(g=>({id:g.id,label:g.label,total:g.options.length,retained:g.relevance,batches:Array.from({length:Math.ceil(g.options.length/20)},(_,i)=>{const e=raw[n++],result=JSON.parse(e.response),a=result.answers.next,index=Number(/^candidate_(\d+)$/.exec(a.choice)?.[1]);return {at:e.at,choice:a.choice,confidence:a.confidence,assetId:Number.isFinite(index)?g.options[i*20+index]?.assetId:null,raw:result};})}));
 fs.writeFileSync(output+'/automatic-outcome.json',JSON.stringify({at:new Date().toISOString(),groups},null,2));
}
console.log(JSON.stringify({at:new Date().toISOString(),stage:p.stage,jobId:p.jobId,error:p.error,calls:p.charges.length,spentMicros:p.charges.reduce((n,c)=>n+c.chargedMicros,0),reservedMicros:p.reservedMicros,requirements:p.spec?.requirements.length,tasks:p.spec?.tasks.length,files:p.artifact?.files.length,openCodeRuns:p.opencodeRuns,events:p.events.slice(-3)}));
