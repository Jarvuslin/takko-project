import fs from "node:fs";
import path from "node:path";
import {
  componentArchiveLuau,
  persistComponentArchive,
} from "../src/generation/component-archive";
import { StdioStudioClient } from "../src/generation/studio-mcp-client";
import { isVerifiedEditState } from "../src/generation/studio-state";

const [studioId, directory] = process.argv.slice(2);
if (!/^[a-f0-9-]{36}$/.test(studioId ?? "") || !directory)
  throw Error("Usage: STUDIO_UUID FRESH_OUTPUT_DIRECTORY");
const output = path.resolve(directory);
fs.mkdirSync(output, { recursive: false });
const client = new StdioStudioClient();
function unpack(value: any): any {
  if (value?.isError) throw Error("Native tool rejected archive diagnostic");
  if (value?.structuredContent) return unpack(value.structuredContent);
  if (value?.content?.length === 1 && value.content[0].type === "text")
    return unpack(value.content[0].text);
  if (typeof value === "string") {
    try {
      return unpack(JSON.parse(value));
    } catch {
      return value;
    }
  }
  if (value && Object.keys(value).length === 1 && "result" in value)
    return unpack(value.result);
  return value;
}
try {
  const studios = unpack(await client.callTool("list_roblox_studios", {}));
  if (!studios.studios?.some((s: any) => s.id === studioId))
    throw Error("Requested Studio not connected");
  const state = await client.callTool("get_studio_state", {
    studio_id: studioId,
  });
  if (!isVerifiedEditState(unpack(state))) throw Error("Edit mode required");
  const records = [];
  for (const mode of ["preserve", "nonarchivable", "external-reference"]) {
    const code = `${componentArchiveLuau}
assert(not game:GetService("RunService"):IsRunning(),"Edit required")
local root=Instance.new("Model");root.Name="Unmodified Component Name"
local part=Instance.new("Part");part.Name="Root Part";part.Anchored=false;part.Parent=root
part:SetAttribute("Counter",7);part:SetAttribute("Offset",Vector3.new(1,2,3));part:AddTag("ComponentFixture")
local limb=Instance.new("Part");limb.Name="Arm";limb.Parent=root
local joint=Instance.new("Motor6D");joint.Name="Shoulder";joint.Part0=part;joint.Part1=limb;joint.C0=CFrame.new(1,2,3);joint.Parent=part
local source=Instance.new("Script");source.Name="Original Behavior";source.Source="error('This fixture must never execute')\\n";source.Disabled=false;source.Parent=part
local module=Instance.new("ModuleScript");module.Name="Original Module";module.Source="return {answer=42}";module.Parent=source
local reference=Instance.new("ObjectValue");reference.Name="Target";reference.Value=limb;reference.Parent=source
local sound=Instance.new("Sound");sound.Name="Existing Sound";sound.SoundId="rbxasset://sounds/electronicpingshort.wav";sound.Volume=0.3;sound.Parent=part
local animation=Instance.new("Animation");animation.Name="Existing Animation";animation.Parent=part
if ${JSON.stringify(mode)}=="nonarchivable" then limb.Archivable=false end
if ${JSON.stringify(mode)}=="external-reference" then reference.Value=workspace end
local captured=captureComponentArchive(root)
local originalUnchanged=root.Parent==nil and source.Parent==part and not source.Disabled and source.Source=="error('This fixture must never execute')\\n" and joint.Part1==limb
root:Destroy()
return game:GetService("HttpService"):JSONEncode({archive=captured,originalUnchanged=originalUnchanged,running=game:GetService("RunService"):IsRunning()})`;
    const raw = unpack(
      await client.callTool("execute_luau", {
        studio_id: studioId,
        datamodel_type: "Edit",
        code,
      }),
    );
    if (!raw || raw.originalUnchanged !== true || raw.running !== false)
      throw Error("Native diagnostic state changed");
    const component = persistComponentArchive(raw.archive, output);
    records.push({
      mode,
      component,
      originalUnchanged: raw.originalUnchanged,
      running: raw.running,
    });
  }
  fs.writeFileSync(
    path.join(output, "result.json"),
    JSON.stringify(
      {
        kind: "native-component-preservation-regression",
        studioId,
        records,
        paidCalls: 0,
        benchmark: false,
      },
      null,
      2,
    ),
    { flag: "wx" },
  );
  console.log(JSON.stringify(records, null, 2));
  if (
    records[0].component.status !== "captured" ||
    records[0].component.roundTrip.passed !== true ||
    records[1].component.status !== "unavailable" ||
    records[2].component.status !== "captured" ||
    records[2].component.roundTrip.passed !== false
  )
    process.exitCode = 1;
} finally {
  client.close();
}
