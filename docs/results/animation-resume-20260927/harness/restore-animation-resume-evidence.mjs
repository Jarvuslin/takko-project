import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
const out='docs/results/animation-resume-20260927';
const manifest=JSON.parse(fs.readFileSync(out+'/protected-before.json','utf8'));
const changed=[]; const stamp=Date.now();
for(const entry of manifest){
 const current=fs.existsSync(entry.path)?createHash('sha256').update(fs.readFileSync(entry.path)).digest('hex'):null;
 if(current===entry.sha256)continue;
 if(current){const dest=path.join(out,'check-artifacts-'+stamp,path.relative('docs/results',entry.path));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(entry.path,dest);}
 if(createHash('sha256').update(fs.readFileSync(entry.backup)).digest('hex')!==entry.sha256)throw Error('Backup mismatch '+entry.path);
 fs.copyFileSync(entry.backup,entry.path);changed.push({path:entry.path,newHash:current,restoredHash:entry.sha256});
}
fs.writeFileSync(out+'/evidence-restoration-'+stamp+'.json',JSON.stringify({at:new Date().toISOString(),checked:manifest.length,restored:changed},null,2));console.log({checked:manifest.length,restored:changed.length});

