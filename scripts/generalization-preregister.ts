import fs from 'node:fs';
const file='docs/results/generalization/sampling-protocol.json';
const p=JSON.parse(fs.readFileSync(file,'utf8'));
p.search='StudioMarketplace.searchPage, CreatorStore production free filtering, first page';
p.kinds={character:'Model',static_target:'Model',tool:'Model',prop:'Model',vfx:'Model',sound:'Model',mesh:'MeshPart',image:'Image',animation:'Animation'};
p.soundScope='Contained Sound models, using the first captured Sound reference. Standalone audio runtime is not measured.';
const excluded=new Set<string>(p.knownDevelopmentIds);
function collect(x:any){if(!x||typeof x!=='object')return;if(typeof x.assetId==='string')excluded.add(x.assetId);if(x.asset?.id)excluded.add(String(x.asset.id));for(const v of Object.values(x))collect(v)}
for(const f of fs.readdirSync('tests/fixtures/generalization/development'))if(f.endsWith('.json'))collect(JSON.parse(fs.readFileSync('tests/fixtures/generalization/development/'+f,'utf8')));
p.knownDevelopmentIds=[...excluded].sort();
p.clipSelection='Record every clip. First playable clip is the role evaluation selection. Playback experiments take first R15 attack proposal, first other unlabeled attack proposal, then first remaining attack proposal in slot and pack order. No replacement after playback failure.';
let state=p.seed;function rand(){let t=state+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}
const slots:any[]=[];
for(const stratum of p.strata)for(let i=0;i<stratum.slots;i++){const query=stratum.queries[Math.floor(rand()*stratum.queries.length)],rankDraw=rand();slots.push({slot:slots.length+1,role:stratum.role,query,kind:p.kinds[stratum.role],rankDraw})}
fs.writeFileSync(file,JSON.stringify(p,null,2)+'\n');
fs.writeFileSync('docs/results/generalization/holdout-manifest.json',JSON.stringify({seed:p.seed,preparedAt:new Date().toISOString(),excludedIds:p.knownDevelopmentIds,slots,paidPairDraws:[rand(),rand()]},null,2)+'\n');
console.log(slots.length,'preregistered slots',excluded.size,'development exclusions');
