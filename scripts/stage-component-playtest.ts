import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { StdioStudioClient } from "../src/generation/studio-mcp-client";
import { readComponentOriginal } from "../src/generation/component-derivative";

// Diagnostic staging only. Changes no worker code; restores non-test script enablement.
const [studioId, caseResultFile, outputDirectory] = process.argv.slice(2);
if (
  !/^[a-f0-9-]{36}$/.test(studioId ?? "") ||
  !caseResultFile ||
  !outputDirectory
)
  throw Error("Usage: STUDIO_UUID ADAPTED_CASE_RESULT FRESH_OUTPUT_DIRECTORY");
const output = path.resolve(outputDirectory);
fs.mkdirSync(output, { recursive: false });
const record = JSON.parse(fs.readFileSync(caseResultFile, "utf8"));
const folder = path.join(path.dirname(caseResultFile), record.case);
const archive = readComponentOriginal(
  folder,
  record.result.adapted.archiveHash,
  record.result.adapted.manifestHash,
);
const token = randomUUID(),
  scope = "TakkoComponentTest_" + token.replaceAll("-", "").slice(0, 12),
  restore = scope + "_Restore";
const client = new StdioStudioClient();
const restoreCode = `assert(not game:GetService("RunService"):IsRunning(),"Stop play before restoration")
local storage=game:GetService("ServerStorage");local saved=assert(storage:FindFirstChild(${JSON.stringify(restore)}),"Missing restoration record")
assert(saved:GetAttribute("Token")==${JSON.stringify(token)},"Restoration ownership mismatch")
local encoding=game:GetService("EncodingService")
local function hash(source)return encoding:ComputeStringHash(source,Enum.HashAlgorithm.Sha256):gsub(".",function(c)return string.format("%02x",string.byte(c))end)end
for _,ref in saved:GetChildren() do assert(ref:IsA("ObjectValue") and ref.Value and ref.Value:IsA("BaseScript"),"Original script missing");assert(hash(ref.Value.Source)==ref:GetAttribute("SourceHash"),"Original script changed during test") end
for _,ref in saved:GetChildren() do ref.Value.Disabled=ref:GetAttribute("Disabled");assert(ref.Value.Disabled==ref:GetAttribute("Disabled"),"Enablement restoration failed") end
local fixture=workspace:FindFirstChild(${JSON.stringify(scope)});if fixture then assert(fixture:GetAttribute("Token")==${JSON.stringify(token)},"Fixture ownership mismatch");fixture:Destroy() end
local count=#saved:GetChildren();saved:Destroy()
return game:GetService("HttpService"):JSONEncode({restoredScripts=count,fixtureRemoved=workspace:FindFirstChild(${JSON.stringify(scope)})==nil,restorationRecordRemoved=storage:FindFirstChild(${JSON.stringify(restore)})==nil})`;
fs.writeFileSync(path.join(output, "restore.luau"), restoreCode, {
  flag: "wx",
});
fs.writeFileSync(
  path.join(output, "context.json"),
  JSON.stringify(
    {
      studioId,
      scope,
      restore,
      token,
      archiveHash: archive.archiveHash,
      rawGameBenchmark: false,
      workerSourceChanged: false,
    },
    null,
    2,
  ),
  { flag: "wx" },
);
const stageCode = `assert(not game:GetService("RunService"):IsRunning(),"Requires Edit")
local storage=game:GetService("ServerStorage");local token=${JSON.stringify(token)}
assert(not storage:FindFirstChild(${JSON.stringify(restore)}) and not workspace:FindFirstChild(${JSON.stringify(scope)}),"Test scope exists")
local encoding=game:GetService("EncodingService")
local roots=game:GetService("SerializationService"):DeserializeInstancesAsync(encoding:Base64Decode(buffer.fromstring(${JSON.stringify(archive.snapshot.base64)})))
assert(#roots==1 and roots[1].Parent==nil,"Unparented component required")
local saved=Instance.new("Folder");saved.Name=${JSON.stringify(restore)};saved:SetAttribute("Token",token)
local fixture=Instance.new("Folder");fixture.Name=${JSON.stringify(scope)};fixture:SetAttribute("Token",token)
local rows={}
local ok,err=pcall(function()
 for _,service in {"Workspace","ServerScriptService","StarterGui","StarterPlayer","ReplicatedFirst","ReplicatedStorage"} do
  for _,item in game:GetService(service):GetDescendants() do if item:IsA("BaseScript") then
   assert(#rows<100,"Too many scripts to pause")
   local ref=Instance.new("ObjectValue");ref.Name="Script_"..tostring(#rows+1);ref.Value=item;ref:SetAttribute("Disabled",item.Disabled)
   ref:SetAttribute("SourceHash",encoding:ComputeStringHash(item.Source,Enum.HashAlgorithm.Sha256):gsub(".",function(c)return string.format("%02x",string.byte(c))end));ref.Parent=saved
   table.insert(rows,{path=item:GetFullName(),disabled=item.Disabled,sourceHash=ref:GetAttribute("SourceHash")})
  end end
 end
 saved.Parent=storage
 for _,ref in saved:GetChildren() do ref.Value.Disabled=true end
 roots[1].Parent=fixture;fixture.Parent=workspace
end)
if not ok then for _,ref in saved:GetChildren() do if ref.Value then ref.Value.Disabled=ref:GetAttribute("Disabled") end end;for _,root in roots do root:Destroy() end;fixture:Destroy();saved:Destroy();error(err) end
local cf,size=roots[1]:GetBoundingBox()
return game:GetService("HttpService"):JSONEncode({scope=fixture.Name,pausedScripts=rows,instances=#roots[1]:GetDescendants()+1,center={cf.Position.X,cf.Position.Y,cf.Position.Z},size={size.X,size.Y,size.Z},importedCodeExecuted=false})`;
fs.writeFileSync(path.join(output, "stage.luau"), stageCode, { flag: "wx" });
try {
  const result: any = await client.callTool(
    "execute_luau",
    { studio_id: studioId, datamodel_type: "Edit", code: stageCode },
    AbortSignal.timeout(90000),
  );
  fs.writeFileSync(
    path.join(output, "stage-response.json"),
    JSON.stringify(result, null, 2),
    { flag: "wx" },
  );
  if (result.isError) throw Error(JSON.stringify(result));
  console.log(result.content.find((x: any) => x.type === "text").text);
} finally {
  await client.close();
}
