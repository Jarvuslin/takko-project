import fs from 'node:fs';
import crypto from 'node:crypto';
const input=process.argv[2]??'.forge/roblox-reflection.json';
const raw=fs.readFileSync(input,'utf8');
const snapshot=JSON.parse(raw);
if(!snapshot.version||!snapshot.classes?.length||!snapshot.properties.Texture) throw Error('Incomplete native ReflectionService snapshot');
const excluded=new Set(['Script','LocalScript','ModuleScript']);
const reserved=new Set(['Source','Parent','Name','ClassName','Disabled','RunContext','Capabilities','Sandboxed']);
const classes={};const enumNames=new Set();
for(const cls of snapshot.classes){
 if(excluded.has(cls.Name)||!cls.Serialized||cls.Permits?.GetService!==undefined||cls.Permits?.New===undefined||cls.Display?.DeprecationMessage)continue;
 const properties={};
 for(const prop of snapshot.properties[cls.Name]??[]){
  if(prop.Permits?.Write===undefined||reserved.has(prop.Name)||prop.Display?.DeprecationMessage)continue;
  properties[prop.Name]={type:prop.Type.ScriptType,engineType:prop.Type.EngineType,...(prop.Type.EnumType?{enum:prop.Type.EnumType}:{})};
  if(prop.Type.EnumType)enumNames.add(prop.Type.EnumType);
 }
 classes[cls.Name]={superclass:cls.Superclass,properties};
}
const enums=Object.fromEntries([...enumNames].sort().map(name=>[name,snapshot.enums[name]]));
const data={studioVersion:snapshot.version,capturedAt:snapshot.capturedAt,source:'Roblox Studio ReflectionService (native, read-only metadata capture)',sourceSha256:crypto.createHash('sha256').update(raw).digest('hex'),classes,enums};
fs.writeFileSync('src/generation/roblox-capabilities.json',JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({classes:Object.keys(classes).length,enums:Object.keys(enums).length,studioVersion:snapshot.version}));
