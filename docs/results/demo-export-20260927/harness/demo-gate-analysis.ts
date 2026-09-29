import fs from 'node:fs';import {architectureSchema} from '../src/generation/architecture';import {specSchema} from '../src/generation/schema';import {unmetAssetRequirements} from '../src/generation/asset-gaps';
const out='docs/results/demo-export-20260927';const p=JSON.parse(fs.readFileSync(out+'/terminal-project.json','utf8'));const trace=fs.readFileSync(out+'/traces/'+p.id+'.events.jsonl','utf8').trim().split('\n').map(JSON.parse);const outputs=trace.filter(e=>e.model==='anthropic/claude-sonnet-5');const result=[];
for(const [i,e]of outputs.entries()){
 const raw=JSON.parse(e.response.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));fs.writeFileSync(out+'/planner-output-'+i+'.json',JSON.stringify(raw,null,2));
 if(!raw.architectureProposal){result.push({index:i,at:e.at,type:'proposal',duration:e.requestTiming.elapsedMs});continue;}
 const graph=raw.architectureProposal,nodes=new Set(graph.nodes.map(n=>n.id));const validation=architectureSchema.safeParse(graph);const spec=specSchema.safeParse(raw);
 result.push({index:i,at:e.at,type:'plan',duration:e.requestTiming.elapsedMs,nodes:graph.nodes.map(n=>({id:n.id,name:n.name})),invalidEdges:graph.edges.filter(e=>!nodes.has(e.from)||!nodes.has(e.to)||e.from===e.to),architectureIssues:validation.success?[]:validation.error.issues,specIssues:spec.success?[]:spec.error.issues});
}
fs.writeFileSync(out+'/planner-gate-analysis.json',JSON.stringify({at:new Date().toISOString(),outputs:result,gate:'src/generation/architecture.ts:50-58',insideCorrection:true,attempts:2,terminal:p.error,limitations:unmetAssetRequirements(p),generatedFiles:p.artifact?.files.length??0,checks:p.checks,openCodeRuns:p.opencodeRuns??[]},null,2));console.log(JSON.stringify(result,null,2));
