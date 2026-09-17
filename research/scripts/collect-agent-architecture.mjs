// Public, read-only source collection. Downloaded repository code is never executed.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve('research/evidence/agent-architecture-20260916');
const repos=['anomalyco/opencode','spacebot-com/spacebot','cline/cline','block/goose','Aider-AI/aider','SWE-agent/SWE-agent','SWE-agent/mini-swe-agent','SWE-agent/SWE-ReX','All-Hands-AI/OpenHands','continuedev/continue','RooCodeInc/Roo-Code','OpenHands/software-agent-sdk'];
fs.mkdirSync(root,{recursive:true});
async function request(url,json=true){
 const response=await fetch(url,{headers:{'User-Agent':'Takko-Architecture-Research',Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error(`${response.status} ${url}`);
 return json?response.json():Buffer.from(await response.arrayBuffer());
}
const directory=repo=>path.join(root,repo.replace('/','--'));
const write=(file,value)=>fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
if(process.argv[2]==='files'){
 const selections=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
 const indexFile=path.join(root,'files-manifest.json');
 const records=fs.existsSync(indexFile)?JSON.parse(fs.readFileSync(indexFile,'utf8')).files:[];
 const jobs=selections.flatMap(s=>s.files.map(file=>({requestedRepo:s.repo,file})));
 for(let i=0;i<jobs.length;i+=4){
  const settled=await Promise.allSettled(jobs.slice(i,i+4).map(async j=>{
   const folder=directory(j.requestedRepo),meta=JSON.parse(fs.readFileSync(path.join(folder,'metadata.json'),'utf8'));
   const tree=JSON.parse(fs.readFileSync(path.join(folder,'tree.json'),'utf8'));
   if(!tree.tree.some(n=>n.path===j.file&&n.type==='blob'))throw Error(`Missing pinned path ${j.requestedRepo}:${j.file}`);
   const destination=path.resolve(folder,'files',j.file);
   if(!destination.startsWith(path.resolve(folder,'files')+path.sep))throw Error('Invalid destination');
   const url=`https://raw.githubusercontent.com/${meta.repo}/${meta.commit}/${j.file}`;
   let bytes;
   if(fs.existsSync(destination))bytes=fs.readFileSync(destination);
   else{bytes=await request(url,false);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,bytes,{flag:'wx'});}
   return {...j,repo:meta.repo,commit:meta.commit,url,localPath:path.relative(root,destination).replaceAll('\\','/'),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
  }));
  for(const r of settled){if(r.status==='rejected'){console.error(String(r.reason));process.exitCode=1;}else{const k=records.findIndex(x=>x.requestedRepo===r.value.requestedRepo&&x.file===r.value.file);if(k<0)records.push(r.value);else if(records[k].sha256!==r.value.sha256)throw Error('Existing snapshot changed');}}
 }
 fs.writeFileSync(indexFile,JSON.stringify({collectedAt:new Date().toISOString(),files:records},null,2)+'\n');
 console.log(JSON.stringify({files:records.length,bytes:records.reduce((n,r)=>n+r.bytes,0)}));
}else{
 const results=[];
 for(let i=0;i<repos.length;i+=3){
  const settled=await Promise.allSettled(repos.slice(i,i+3).map(async repo=>{
   const folder=directory(repo);fs.mkdirSync(folder,{recursive:true});
   if(fs.existsSync(path.join(folder,'metadata.json'))&&fs.existsSync(path.join(folder,'tree.json')))return JSON.parse(fs.readFileSync(path.join(folder,'metadata.json'),'utf8'));
   const meta=await request(`https://api.github.com/repos/${repo}`);
   const commit=await request(`https://api.github.com/repos/${meta.full_name}/commits/${encodeURIComponent(meta.default_branch)}`);
   const tree=await request(`https://api.github.com/repos/${meta.full_name}/git/trees/${commit.sha}?recursive=1`);
   const record={requestedRepo:repo,repo:meta.full_name,defaultBranch:meta.default_branch,archived:meta.archived,disabled:meta.disabled,pushedAt:meta.pushed_at,commit:commit.sha,commitDate:commit.commit.committer.date,licenseMetadata:meta.license,collectedAt:new Date().toISOString(),treeTruncated:tree.truncated};
   write(path.join(folder,'metadata.json'),record);write(path.join(folder,'tree.json'),tree);return record;
  }));
  settled.forEach((r,j)=>{const record=r.status==='fulfilled'?r.value:{requestedRepo:repos[i+j],error:String(r.reason)};results.push(record);console.log(JSON.stringify(record));if(r.status==='rejected')process.exitCode=1;});
 }
 fs.writeFileSync(path.join(root,'repositories.json'),JSON.stringify(results,null,2)+'\n');
}
