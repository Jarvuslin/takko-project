import fs from 'node:fs';
const out='docs/results/opencode-motion-live-20260926';
const p=JSON.parse(fs.readFileSync(out+'/terminal-project.json','utf8'));const v=JSON.parse(fs.readFileSync(out+'/search-ranking-snapshot.json','utf8'));
for(const r of v){const g=p.assetDiscovery.groups.find(g=>g.id===r.group);console.log(JSON.stringify({group:r.group,topTen:r.ranking.filter(x=>x.topTen).map(x=>({id:x.id,captured:x.capturedInProject})),retained:g.options.length}));}
const reqs=JSON.parse(fs.readFileSync(out+'/selection-requests-reconstructed.json','utf8'));const selected=reqs.flatMap(r=>r.request.state.candidates).find(c=>c.id==='14056318312'&&c.clipKey==='1/15/2');
fs.writeFileSync(out+'/selected-motion.json',JSON.stringify(selected,null,2));
console.log(JSON.stringify({selectedJointRanges:selected.motion.tracks.map(t=>({joint:t.joint,rotationRange:t.rotationRange,translationRange:t.translationRange})),hierarchy:selected.hierarchy?.toolCount}));
for(const name of ['prepare-motion.mjs','motion-rankings.ts','motion-selection-report.ts','motion-analysis.ts'])fs.copyFileSync('.forge/'+name,out+'/harness/'+name);
fs.cpSync('.forge/opencode-motion-live-control',out+'/browser-control',{recursive:true});
