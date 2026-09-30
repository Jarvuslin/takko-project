import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { StudioMarketplace, unpackMarketplace } from "../src/marketplace/studio";
import { StdioStudioClient } from "../src/generation/studio-mcp-client";
import { isVerifiedEditState } from "../src/generation/studio-state";
import type { MarketplaceKind } from "../src/marketplace/types";

const studioId="360d3ed1-0d29-4942-96ed-1bb8e5faea62";
const root="tests/fixtures/generalization/development";
fs.mkdirSync(root,{recursive:true});
const provider=new StudioMarketplace();
const rows:[string,string,MarketplaceKind][]=[
  ["character","robot npc","Model"],["tool","sword tool","Model"],
  ["prop","wooden door","Model"],["vfx","fire particles","Model"],
  ["mesh","rock","MeshPart"],["image","arrow","Image"],
  ["animation","R15 punch animation","Animation"],
  ["animation","R6 idle animation","Animation"],
];
const records:any[]=[];
for(const [role,query,kind] of rows){
  const record:any={role,query,kind,at:new Date().toISOString(),partition:"development_not_holdout"};
  try {
    const results=await provider.search(studioId,query,kind);
    record.results=results;
    assert.ok(results.length,"No production search results");
    const selected=results[0];
    record.metadata=await provider.metadata(studioId,selected.assetId);
    record.snapshot=await provider.snapshot(studioId,record.metadata);
    if(role==="animation") record.animations=await provider.animations(studioId,record.metadata);
  }catch(e){record.error=String(e)}
  records.push(record);
  fs.writeFileSync(path.join(root,role+"-"+query.replaceAll(" ","-")+".json"),JSON.stringify(record,null,2));
  console.log(role,record.metadata?.assetId,record.error??"captured");
}
const client=new StdioStudioClient({timeoutMs:30000});
try{
  const state=unpackMarketplace(await client.callTool("get_studio_state",{studio_id:studioId}));
  assert.ok(isVerifiedEditState(state));
  const census=unpackMarketplace(await client.callTool("execute_luau",{studio_id:studioId,datamodel_type:"Edit",code:'local scripts=0 local scopes={} for _,n in game:GetDescendants() do if n:IsA("LuaSourceContainer") then scripts+=1 end if string.match(n.Name,"^Forge_") or string.match(n.Name,"^Takko_") then table.insert(scopes,n:GetFullName()) end end return {scripts=scripts,scopes=scopes,workspaceChildren=#workspace:GetChildren()}'}));
  fs.writeFileSync(path.join(root,"cleanup.json"),JSON.stringify({state,census},null,2));
}finally{await client.close()}
