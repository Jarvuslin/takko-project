import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
const out='docs/results/fresh-generation-fixes-20260928',backup='.forge/evidence-backup-fresh-generation-fixes-20260928';if(fs.existsSync(out)||fs.existsSync(backup))throw Error('Preserve evidence');const paths=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else paths.push(p);}}walk('docs/results');fs.mkdirSync(out+'/harness',{recursive:true});const manifest=[];for(const file of paths){const relative=path.relative('docs/results',file);const dest=path.join(backup,relative);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(file,dest);manifest.push({path:file,sha256:createHash('sha256').update(fs.readFileSync(file)).digest('hex'),backup:dest});}fs.writeFileSync(out+'/protected-before.json',JSON.stringify(manifest,null,2));fs.copyFileSync('C:/Users/7474g/AppData/Local/Temp/claude/D--RobloxProjects-Roblox-Gen/18c665cc-aa8c-45e1-b54a-4124bed08a1b/scratchpad/fresh-generation-prompt.md',out+'/authorization.txt');console.log({files:paths.length,out});





