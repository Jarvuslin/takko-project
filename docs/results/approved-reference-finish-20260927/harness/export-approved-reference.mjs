import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
const out='docs/results/approved-reference-finish-20260927',id='8a81efe9-b8ed-44bc-a21a-5aad132813ac';
const destination=path.resolve('Takko-Fighting-Review-20260927.rbxlx');
if(fs.existsSync(destination)||fs.existsSync(`${out}/export-result.json`))throw Error('Preserve existing export');
const r=await fetch(`http://127.0.0.1:4335/api/projects/${id}/export`);const body=Buffer.from(await r.arrayBuffer());
const result={at:new Date().toISOString(),endpoint:`GET /api/projects/${id}/export`,status:r.status,bytes:body.length};
if(r.ok){fs.writeFileSync(destination,body);fs.writeFileSync(`${out}/game.rbxlx`,body);Object.assign(result,{path:destination,sha256:createHash('sha256').update(body).digest('hex')});}
else{fs.writeFileSync(`${out}/export-blocked.txt`,body);Object.assign(result,{error:body.toString('utf8')});}
fs.writeFileSync(`${out}/export-result.json`,JSON.stringify(result,null,2));console.log(result);
