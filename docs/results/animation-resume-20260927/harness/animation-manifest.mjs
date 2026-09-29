import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');const files=[];
for(const root of ['src','tests']) {const visit=dir=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())visit(file);else{const before=path.join('.forge/marketplace-animation-before',file);if(!fs.existsSync(before)||hash(before)!==hash(file))files.push({file:file.replaceAll('\\','/'),before:fs.existsSync(before)?hash(before):null,after:hash(file)});}}};visit(root);}
fs.writeFileSync('docs/results/marketplace-animation/source-manifest.json',JSON.stringify({at:new Date().toISOString(),files},null,2));console.log(files.map(f=>f.file).join('\n'));
