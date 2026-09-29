import fs from 'node:fs';
const out='docs/results/fresh-generation-fixes-20260928';
const lines=fs.readFileSync('.forge/runtime-diagnostics-profile-20260927/traces/8a81efe9-b8ed-44bc-a21a-5aad132813ac.events.jsonl','utf8').trim().split(/\r?\n/).map(l=>JSON.parse(l));
const relevance=lines.filter(r=>r.model==='typesafe/jev-1.13' && r.response?.includes('relevant_')).map(r=>({at:r.at,...JSON.parse(r.response)}));
fs.writeFileSync(out+'/preserved-relevance-responses.json',JSON.stringify(relevance,null,2));
console.log({responses:relevance.length,first:relevance[0]});
