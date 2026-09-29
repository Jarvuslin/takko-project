import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd();
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const backup=path.join(root,'.forge/marketplace-animation-before/results');
const current=path.join(root,'docs/results');
const archive=path.join(current,'marketplace-animation/full1-artifacts/prior-artifact-new-versions');
const restored=[];
function visit(dir='') {
 for(const e of fs.readdirSync(path.join(backup,dir),{withFileTypes:true})){
  const rel=path.join(dir,e.name), old=path.join(backup,rel), now=path.join(current,rel);
  if(e.isDirectory())visit(rel);
  else if(fs.existsSync(now)&&hash(old)!==hash(now)){
   const copy=path.join(archive,rel);
   fs.mkdirSync(path.dirname(copy),{recursive:true});
   fs.copyFileSync(now,copy);
   fs.copyFileSync(old,now);
   restored.push(rel.replaceAll('\\','/'));
  }
 }
}
visit();
fs.mkdirSync(path.join(current,'marketplace-animation/full1-artifacts'),{recursive:true});
fs.writeFileSync(path.join(current,'marketplace-animation/full1-artifacts/restored-historical-results.json'),JSON.stringify({at:new Date().toISOString(),restored},null,2));
console.log(`Preserved new versions and restored ${restored.length} historical result files.`);
