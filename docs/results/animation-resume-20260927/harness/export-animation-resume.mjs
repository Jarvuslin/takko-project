import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const out='docs/results/animation-resume-20260927';
const id='8a81efe9-b8ed-44bc-a21a-5aad132813ac';
const destination=path.resolve('Takko-Fighting-Review-20260927.rbxlx');
if(fs.existsSync(destination)||fs.existsSync(`${out}/export-result.json`))throw Error('Do not overwrite a prior export');
const response=await fetch(`http://127.0.0.1:4335/api/projects/${id}/export`);
const body=Buffer.from(await response.arrayBuffer());
const result={at:new Date().toISOString(),endpoint:`GET /api/projects/${id}/export`,status:response.status,bytes:body.length};
if(response.ok){
  fs.writeFileSync(destination,body);fs.writeFileSync(`${out}/game.rbxlx`,body);
  Object.assign(result,{path:destination,sha256:createHash('sha256').update(body).digest('hex')});
}else{
  fs.writeFileSync(`${out}/export-blocked.txt`,body);
  Object.assign(result,{error:body.toString('utf8')});
  const p=JSON.parse(fs.readFileSync(`.forge/runtime-diagnostics-profile-20260927/${id}.json`,'utf8'));
  const folder=path.resolve('Takko-Fighting-Review-20260927-Sources');
  if(fs.existsSync(folder))throw Error('Do not overwrite fallback sources');
  const files=[];
  for(const file of p.artifact.files){const destination=path.resolve(folder,file.path);if(!destination.startsWith(folder+path.sep))throw Error('Invalid source path');fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,file.source);files.push(destination);}
  fs.writeFileSync(`${out}/fallback-paths.json`,JSON.stringify(files,null,2));Object.assign(result,{fallbackFiles:files});
}
fs.writeFileSync(`${out}/export-result.json`,JSON.stringify(result,null,2));console.log(result);
