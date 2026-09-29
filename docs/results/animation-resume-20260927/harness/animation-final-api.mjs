import fs from 'node:fs';
const base='http://127.0.0.1:4355/api/projects/a84134d4-fced-42c4-a6fe-dcf4a2a4dc15';
const before=await (await fetch(base)).json();
const r=await fetch(base+'/marketplace-animations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:before.revision,studioId:'9a2d384f-1a8f-4da1-890b-d06532c12ede',reference:'180426354'})});
const after=await r.json();
const receipt={at:new Date().toISOString(),status:r.status,error:after.error,revision:after.revision,packs:after.animationPacks?.map(p=>({assetId:p.assetId,name:p.name,entries:p.entries.map(e=>({name:e.name,rig:e.clip?.rig,tracks:e.clip?.tracks.length,error:e.error}))})),jobId:after.jobId,chargesUnchanged:JSON.stringify(before.charges)===JSON.stringify(after.charges)};
fs.writeFileSync('docs/results/marketplace-animation/native-api-receipt.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt));
