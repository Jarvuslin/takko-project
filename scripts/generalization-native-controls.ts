import fs from "node:fs";
import assert from "node:assert/strict";
import {StdioStudioClient} from "../src/generation/studio-mcp-client";
import {unpackMarketplace} from "../src/marketplace/studio";
import {roleCaptureLuau} from "../src/marketplace/role-capture";
const c=new StdioStudioClient({timeoutMs:30000});
try{
const result=unpackMarketplace(await c.callTool("execute_luau",{studio_id:"360d3ed1-0d29-4942-96ed-1bb8e5faea62",datamodel_type:"Edit",code:`
assert(not game:GetService("RunService"):IsRunning())
${roleCaptureLuau}
local roots=game:GetObjects("rbxassetid://13350321573")
local ok,result=pcall(function()
 local original=captureNativeRoles(roots)
 local tool=roots[1]:IsA("Tool") and roots[1] or roots[1]:FindFirstChildWhichIsA("Tool",true)
 assert(tool and tool:FindFirstChild("Handle"))
 tool.Handle:Destroy()
 local missing=captureNativeRoles(roots)
 tool.RequiresHandle=false
 return {original=original,missing=missing,handleless=captureNativeRoles(roots)}
end)
for _,r in roots do r:Destroy() end
assert(ok,result)
return game:GetService("HttpService"):JSONEncode(result)
`}));
assert.ok(result.original && result.missing && result.handleless);
fs.writeFileSync("tests/fixtures/generalization/development/tool-native-controls.json",JSON.stringify({authority:"Native fault-injected derivatives of captured sword. Not unmodified Marketplace assets or sweep results.",assetId:"13350321573",...result},null,2));
}finally{await c.close()}
