import fs from 'node:fs';
import path from 'node:path';
const output=path.resolve('docs/results/opencode-minimal-fighting-20260925');
const p=JSON.parse(fs.readFileSync(path.join(output,'automatic-before-proposal.json'),'utf8'));
let cursor=0;
const advice=p.decisionAdvice.filter((d:any)=>d.task==='asset-relevance');
const groups=p.assetDiscovery.groups.map((g:any)=>{
 const batches=[];
 for(let start=0;start<g.options.length;start+=20){const d=advice[cursor++];const next=d.result.answers.next;const index=Number(/^candidate_(\d+)$/.exec(next.choice)?.[1]);const chosen=Number.isInteger(index)?g.options[start+index]:undefined;batches.push({at:d.at,count:Math.min(20,g.options.length-start),choice:next.choice,confidence:next.confidence,rawNominee:chosen?{assetId:chosen.assetId,name:chosen.name}:null,probabilities:next.probabilities});}
 return {id:g.id,label:g.label,query:g.query,options:g.options.length,relevance:g.relevance,choice:p.assetDiscovery.choices?.[g.id]??null,batches};
});
const result={at:new Date().toISOString(),outcome:'failed',requiredGroupsSelected:0,requiredGroups:3,extraUnrequestedGroup:'effects',explanation:'Raw brief regex treats the explicitly negated VFX term as a positive search hint. Each real group was assessed in two batches. Candidate nominations with confidence below 0.8 were rejected by the existing selectedCandidate gate. No recommendation or selection was retained.',groups};
fs.writeFileSync(path.join(output,'automatic-outcome.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
