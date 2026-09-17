import fs from "node:fs";
import path from "node:path";
import { StdioStudioClient } from "../src/generation/studio-mcp-client";
import { componentArchiveLuau } from "../src/generation/component-archive";
import {
  convertComponentXml,
  loadComponentXml,
} from "../src/generation/component-xml-conversion";
import { readComponentOriginal } from "../src/generation/component-derivative";
const [studioId, out, sourceDirectory] = process.argv.slice(2);
if (!studioId || !out || !sourceDirectory)
  throw Error("STUDIO FRESH_OUTPUT PREPARED_EVIDENCE_DIRECTORY required");
const output = path.resolve(out);
fs.mkdirSync(output);
const client = new StdioStudioClient();
const save = (name: string, value: unknown) =>
  fs.writeFileSync(path.join(output, name), JSON.stringify(value, null, 2));
const run = async (name: string, code: string) => {
  fs.writeFileSync(path.join(output, name + ".luau"), code);
  const response: any = await client.callTool(
    "execute_luau",
    { studio_id: studioId, datamodel_type: "Edit", code },
    AbortSignal.timeout(90000),
  );
  save(name + "-response.json", response);
  if (response.isError) throw Error("Native test failed: " + name);
  const data = JSON.parse(
    response.content.find((c: any) => c.type === "text").text,
  );
  save(name + "-result.json", data);
  if (!data.passed) throw Error("Native assertions failed: " + name);
  return data;
};
try {
  const fixture = await run(
    "fixture",
    `
assert(not game:GetService("RunService"):IsRunning(),"Requires Edit")
${componentArchiveLuau}
local root=Instance.new("Model");root.Name="OwnedTouchFixture"
local part=Instance.new("Part");part.Name="Pad";part.Parent=root
local source=Instance.new("ModuleScript");source.Name="AfterPad";source.Source="return 'inert fixture'";source.Parent=root
local connection=part.Touched:Connect(function()end)
local copies={};local again=nil
local ok,result=pcall(function()
 local marker=assert(part:FindFirstChildOfClass("TouchTransmitter"),"Listener marker absent")
 local snapshot=captureComponentArchive(root)
 assert(snapshot.status=="captured" and snapshot.roundTrip.passed,"Durable capture failed")
 assert(#snapshot.nodes==3 and snapshot.sources[1].index==3 and snapshot.runtimeOnlyInstances[1].parentIndex==2,"Durable indices changed")
 marker:SetAttribute("Custom",true)
 local custom=captureComponentArchive(root);assert(custom.status=="unavailable" and string.find(custom.reason,"Nonstandard"),"Custom marker accepted")
 marker:SetAttribute("Custom",nil)
 local reference=Instance.new("ObjectValue");reference.Name="MarkerReference";reference.Value=marker;reference.Parent=root
 local linked=captureComponentArchive(root);reference:Destroy()
 assert(linked.status=="captured" and not linked.roundTrip.passed,"Marker reference silently lost")
 copies=game:GetService("SerializationService"):DeserializeInstancesAsync(game:GetService("EncodingService"):Base64Decode(buffer.fromstring(snapshot.base64)))
 assert(#copies==1 and copies[1].Parent==nil,"Wrong restored roots")
 local restored=copies[1]:FindFirstChild("Pad")
 assert(restored and not restored:FindFirstChildOfClass("TouchTransmitter"),"Expected native omission")
 again=restored.Touched:Connect(function()end)
 assert(restored:FindFirstChildOfClass("TouchTransmitter"),"Listener did not recreate marker")
 assert(copies[1].AfterPad.Source==source.Source,"Source changed")
 return {passed=true,comparison=snapshot.roundTrip,runtimeOnlyInstances=snapshot.runtimeOnlyInstances,nativeListenerRecreated=true,customStateRejected=true,persistentReferenceRejected=true,physicalTouchEvents="not_tested_in_Edit",importedCodeExecuted=false}
end)
if again then again:Disconnect() end;connection:Disconnect();for _,copy in copies do copy:Destroy()end;root:Destroy()
if not ok then error(result)end
return game:GetService("HttpService"):JSONEncode(result)`,
  );
  const prepared = JSON.parse(
    fs.readFileSync(path.join(sourceDirectory, "prepared.json"), "utf8"),
  );
  const packet = JSON.parse(
    fs.readFileSync(
      path.join(sourceDirectory, prepared.evidence.packetHash + ".review.json"),
      "utf8",
    ),
  );
  const original = readComponentOriginal(
    sourceDirectory,
    packet.derivative.archiveHash,
    packet.derivative.manifestHash,
  );
  const converted = convertComponentXml(sourceDirectory, packet.derivative);
  const convertedXml = loadComponentXml(
    sourceDirectory,
    converted.recordHash,
    "Workspace/TouchFixture/Assets/Dummy",
  ).xml;
  save("conversion.json", converted);
  const native = await run(
    "frozen-dummy-xml",
    `
assert(not game:GetService("RunService"):IsRunning(),"Requires Edit")
${componentArchiveLuau}
local encoding=game:GetService("EncodingService")
local roots=game:GetService("SerializationService"):DeserializeInstancesAsync(encoding:Base64Decode(buffer.fromstring(${JSON.stringify(original.snapshot.base64)})))
local ok,result=pcall(function()
 assert(#roots==1 and roots[1].Parent==nil,"Expected unparented root")
 local captured=captureComponentArchive(roots[1],encoding:Base64Decode(buffer.fromstring(${JSON.stringify(Buffer.from(convertedXml).toString("base64"))})))
 assert(captured.status=="captured" and captured.roundTrip.passed,"XML comparison failed")
 return {passed=true,comparison=captured.roundTrip,nodes=#captured.nodes,sources=#captured.sources,importedCodeExecuted=false}
end)
for _,root in roots do root:Destroy()end
if not ok then error(result)end
return game:GetService("HttpService"):JSONEncode(result)`,
  );
  save("result.json", {
    fixture,
    native,
    rawGameBenchmark: false,
    paidCalls: 0,
  });
  console.log(
    JSON.stringify({
      fixturePassed: fixture.passed,
      dummyXmlPassed: native.passed,
      nodes: native.nodes,
      sources: native.sources,
    }),
  );
} finally {
  await client.close();
}
