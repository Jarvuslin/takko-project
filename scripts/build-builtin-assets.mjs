import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.argv[2]??'');
if(!process.argv[2]||!fs.existsSync(path.join(root,'sounds/action_jump.mp3')))throw Error('Pass the installed Studio content directory');
const assets={};
function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 const file=path.join(dir,entry.name);if(entry.isDirectory()){visit(file);continue;}
 const ext=path.extname(file).toLowerCase();
 const relative=path.relative(root,file).split(path.sep).join('/');
 const kind=['.mp3','.ogg','.wav'].includes(ext)?'audio':['.png','.jpg','.jpeg','.dds'].includes(ext)?'image':ext==='.mesh'?'mesh':relative.startsWith('fonts/')&&['.json','.ttf','.otf'].includes(ext)?'font':null;
 if(kind)assets['rbxasset://'+path.relative(root,file).split(path.sep).join('/')]=kind;
}}
visit(root);
fs.writeFileSync('src/generation/roblox-builtin-assets.json',JSON.stringify({studioVersion:'0.738.0.7381393',source:'Installed Roblox Studio content directory, filenames only',assets},null,2)+'\n');
console.log(JSON.stringify({assets:Object.keys(assets).length}));
