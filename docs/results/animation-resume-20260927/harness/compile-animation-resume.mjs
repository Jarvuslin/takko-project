import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import {createHash} from 'node:crypto';
const out='docs/results/animation-resume-20260927',p=JSON.parse(fs.readFileSync('.forge/runtime-diagnostics-profile-20260927/8a81efe9-b8ed-44bc-a21a-5aad132813ac.json'));
if(fs.existsSync(out+'/generated-compile.json'))throw Error('Compile evidence already exists');
const compiles=[];
for(const file of p.artifact.files){const dest=path.resolve(out,'generated-luau',file.path);if(!dest.startsWith(path.resolve(out,'generated-luau')+path.sep))throw Error('Unsafe artifact path');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,file.source);const r=spawnSync(path.resolve('.forge/tools/luau/luau-compile.exe'),[dest],{encoding:'utf8',windowsHide:true,timeout:30000});compiles.push({path:file.path,sha256:createHash('sha256').update(file.source).digest('hex'),code:r.status,signal:r.signal,error:r.error?.message,stderr:r.stderr,compiled:r.status===0});}
fs.writeFileSync(out+'/generated-compile.json',JSON.stringify({at:new Date().toISOString(),compiles},null,2));console.log(compiles);if(!compiles.length||compiles.some(c=>!c.compiled))process.exitCode=1;


