import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {buildAssetNeeds} from '../src/marketplace/approved-adapter';
const output=path.resolve('docs/results/opencode-fighting-live-20260924');
const saved=fs.readFileSync(path.join(output,'terminal-project.json'),'utf8');
const p=JSON.parse(saved);
const before=JSON.stringify(p);
assert.throws(()=>buildAssetNeeds(p),/Approved asset needs a linked requirement before building: Practice dummy #1245720733/);
assert.equal(JSON.stringify(p),before,'Failed adapter must not mutate the saved project');
const links=p.assetDiscovery.groups.map((g:any)=>{
 const assetId=p.assetDiscovery.choices[g.id].assetId;
 const needs=p.spec.assetNeeds.filter((n:any)=>[n.role,n.query,n.constraints].join(' ').match(/\b\d+\b/g)?.includes(assetId));
 assert.equal(needs.length,1,'Each selected asset is already explicitly identified in one planned asset need');
 const requirement=p.spec.requirements.find((r:any)=>r.id===needs[0].requirementId);
 assert.ok(requirement,'The planned need references a real requirement');
 return {group:g.id,assetId,needId:needs[0].id,requirementId:requirement.id,kind:needs[0].kind};
});
// Diagnostic counterfactual only. Never write this clone into the live project.
const clone=structuredClone(p);
for(const link of links)clone.spec.requirements.find((r:any)=>r.id===link.requirementId).description+=' Diagnostic exact reference #'+link.assetId;
const needs=buildAssetNeeds(clone);
assert.ok(needs.length>=p.spec.assetNeeds.length);
assert.equal(JSON.stringify(p),before);
const result={at:new Date().toISOString(),assertions:12,expectedFailureReproduced:true,savedProjectUnchanged:true,links,diagnosticOnly:'Adding the already-linked IDs to requirement prose in an in-memory clone clears this one adapter guard. This is not a product fix or a gameplay result.',counterfactualNeedCount:needs.length};
fs.writeFileSync(path.join(output,'offline-reproduction.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
