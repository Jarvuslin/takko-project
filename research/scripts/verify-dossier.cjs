const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=walk('research');
const broken=[];
for(const file of files.filter(f=>f.endsWith('.md')&&!f.includes(path.join('research','evidence')))){
 const text=fs.readFileSync(file,'utf8');
 for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
  const href=match[1];if(/^(https?:|#)/.test(href))continue;
  if(!fs.existsSync(path.resolve(path.dirname(file),href.split('#')[0])))broken.push({file,href});
 }
}
const manifest=JSON.parse(fs.readFileSync('research/evidence/plugin/source/manifest.json','utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
if(hash(fs.readFileSync('research/evidence/plugin/installed-68657693815716.rbxm'))!==manifest.sha256)throw Error('Plugin snapshot hash mismatch');
for(const script of manifest.scripts){if(hash(fs.readFileSync(path.join('research/evidence/plugin/source',script.file)))!==script.sha256)throw Error('Source hash mismatch: '+script.file);}
if(broken.length)throw Error(JSON.stringify(broken));
const records=files.filter(f=>!f.endsWith('evidence-inventory.json')).map(file=>{const b=fs.readFileSync(file);return {file:file.replaceAll('\\','/'),bytes:b.length,sha256:hash(b)};});
fs.writeFileSync('research/evidence-inventory.json',JSON.stringify({verifiedAt:new Date().toISOString(),pluginSourceHashesVerified:manifest.scripts.length,brokenLocalDocumentationLinks:0,files:records},null,2));
console.log(JSON.stringify({pluginSourceHashesVerified:manifest.scripts.length,brokenLocalDocumentationLinks:0,researchFiles:records.length,documentationFiles:records.filter(r=>r.file.endsWith('.md')&&!r.file.includes('/evidence/')).length},null,2));
