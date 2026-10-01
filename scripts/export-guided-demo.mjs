// Rebuild the local rehearsal artifact from native serialized roots.
// Requires the .b64 captures in .forge/exports/guided-demo. No network or inference.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve('.forge/exports/guided-demo');
for(const name of ['world','shared','server','client','rig']) {
  const capture=name==='shared'?'shared-final':name;
  const data=Buffer.from(fs.readFileSync(path.join(root,capture+'.b64'),'utf8').trim(),'base64');
  if(data.subarray(0,7).toString()!=='<roblox')throw Error('Invalid native model '+name);
  fs.writeFileSync(path.join(root,name+'.rbxm'),data);
}
const item=name=>({'$path':name+'.rbxm'});
const project={name:'GuidedCombatDemo',tree:{'$className':'DataModel',
  Workspace:{'$className':'Workspace',Forge_GuidedDemo:item('world')},
  ReplicatedStorage:{'$className':'ReplicatedStorage',Forge_GuidedDemo:item('shared')},
  ServerScriptService:{'$className':'ServerScriptService',Forge_GuidedDemo:item('server')},
  StarterPlayer:{'$className':'StarterPlayer',StarterCharacter:item('rig'),StarterPlayerScripts:{'$className':'StarterPlayerScripts',Forge_GuidedDemo:item('client')}}
}};
fs.writeFileSync(path.join(root,'default.project.json'),JSON.stringify(project,null,2));
const rojo=path.resolve('.forge/tools/rojo-7.7.0/rojo.exe');
console.log(execFileSync(rojo,['build',path.join(root,'default.project.json'),'-o',path.join(root,'GuidedCombatDemo.rbxlx')],{encoding:'utf8',windowsHide:true}));
console.log(path.join(root,'GuidedCombatDemo.rbxlx'));
