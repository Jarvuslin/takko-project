import fs from 'node:fs';
import {CreatorStore} from '../src/marketplace/creator-store';
import {rankByVotes,votePrior} from '../src/marketplace/relevance';
const out='docs/results/opencode-motion-live-20260926';
const p=JSON.parse(fs.readFileSync('.forge/opencode-motion-live-profile-20260926/c37e6413-1f3c-4c32-96a0-bb3edd07953b.json','utf8'));
const store=new CreatorStore();const rows=[];
for(const g of p.assetDiscovery.groups){const page=await store.search(g.query,g.kind);rows.push({at:new Date().toISOString(),group:g.id,query:g.query,note:'Read-only search repeated immediately after live capture. Not an intercepted original response.',page,ranking:rankByVotes(page.assets).map((a,i)=>({rank:i+1,id:a.assetId,name:a.name,votes:a.votes,prior:votePrior(a),topTen:i<10,capturedInProject:!!g.options.find(o=>o.assetId===a.assetId)?.previewData}))});}
fs.writeFileSync(out+'/search-ranking-snapshot.json',JSON.stringify(rows,null,2));console.log(rows.map(r=>({group:r.group,results:r.page.assets.length})));
