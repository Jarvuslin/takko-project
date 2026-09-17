import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { StdioStudioClient } from "../src/generation/studio-mcp-client";
import { readComponentOriginal } from "../src/generation/component-derivative";

// Conversion diagnostic only: frozen worker choices, no game code or imported execution.
const [studioId, directory, format = "binary"] = process.argv.slice(2);
if (!/^[a-f0-9-]{36}$/.test(studioId ?? "") || !directory)
  throw Error("Usage: STUDIO_UUID FRESH_OUTPUT_DIRECTORY [binary|xml]");
if (!["binary", "xml"].includes(format)) throw Error("Unknown format");
const output = path.resolve(directory);
fs.mkdirSync(output, { recursive: false });
const rojo = path.resolve(".forge/tools/rojo-7.7.0/rojo.exe");
const hash = (bytes: Buffer | string) =>
  createHash("sha256").update(bytes).digest("hex");
const client = new StdioStudioClient();
const results: unknown[] = [];
try {
  for (const name of ["combat-training", "bubble-wrap", "checkpoint-parkour"]) {
    const folder = path.resolve(
      "docs/results/takko-context-media/native-v1",
      name,
    );
    const review = JSON.parse(
      fs.readFileSync(
        path.join(
          folder,
          fs.readdirSync(folder).find((f) => f.endsWith(".review.json"))!,
        ),
        "utf8",
      ),
    );
    const original = readComponentOriginal(
      folder,
      review.derivative.archiveHash,
      review.derivative.manifestHash,
    );
    const projectFile = path.join(output, name + ".project.json");
    fs.writeFileSync(
      projectFile,
      JSON.stringify(
        {
          name: original.snapshot.nodes[0].name,
          tree: {
            $path: path.join(folder, review.derivative.archiveHash + ".rbxm"),
          },
        },
        null,
        2,
      ),
      { flag: "wx" },
    );
    const binaryFile = path.join(output, name + ".rbxm");
    const xmlFile = path.join(output, name + ".rbxmx");
    const logs = [binaryFile, xmlFile].map((file) =>
      execFileSync(
        rojo,
        ["build", projectFile, "-o", file, "--color", "never"],
        { encoding: "utf8", windowsHide: true },
      ),
    );
    const converted = fs.readFileSync(format === "xml" ? xmlFile : binaryFile);
    const code = String.raw`
assert(not game:GetService("RunService"):IsRunning(), "Requires Edit")
local roots={}
local differences,unobservable={},{}
local checkedProperties,checkedReferences,checkedSources,checkedSecurity=0,0,0,0
local ok,err=pcall(function()
  local function load(data)
    local decoded=game:GetService("EncodingService"):Base64Decode(buffer.fromstring(data))
    local loaded=game:GetService("SerializationService"):DeserializeInstancesAsync(decoded)
    for _,root in loaded do table.insert(roots,root);assert(root.Parent==nil,"Restoration parented a root") end
    assert(#loaded==1,"Expected one root")
    return loaded[1]
  end
  local a=load(${JSON.stringify(original.snapshot.base64)})
  local b=load(${JSON.stringify(converted.toString("base64"))})
  local left,right,leftIndex,rightIndex={},{},{},{}
  local function walk(item,list,indices)
    list[#list+1]=item;indices[item]=#list
    for _,child in item:GetChildren() do walk(child,list,indices) end
  end
  walk(a,left,leftIndex);walk(b,right,rightIndex)
  assert(#left==#right,"Instance count differs")
  local function equal(x,y)
    local kind=typeof(x);if kind~=typeof(y) then return false end
    if kind=="Instance" then
      checkedReferences+=1
      return leftIndex[x]~=nil and leftIndex[x]==rightIndex[y]
    elseif kind=="NumberSequence" or kind=="ColorSequence" then return equal(x.Keypoints,y.Keypoints)
    elseif kind=="NumberSequenceKeypoint" then return x.Time==y.Time and x.Value==y.Value and x.Envelope==y.Envelope
    elseif kind=="ColorSequenceKeypoint" then return x.Time==y.Time and x.Value==y.Value
    elseif kind=="table" then
      for k,v in x do if not equal(v,y[k]) then return false end end
      for k in y do if x[k]==nil then return false end end
      return true
    end
    return x==y
  end
  local function compare(index,key,x,y)
    if not equal(x,y) then
      assert(#differences<1000,"Too many differences")
      table.insert(differences,{index=index,property=key,before=tostring(x),after=tostring(y)})
    end
  end
  local cache,missing={},{ }
  for index,item in left do
    local copy=right[index]
    compare(index,"Name",item.Name,copy.Name);compare(index,"ClassName",item.ClassName,copy.ClassName)
    compare(index,"Parent",leftIndex[item.Parent] or 0,rightIndex[copy.Parent] or 0)
    compare(index,"Sandboxed",item.Sandboxed,copy.Sandboxed)
    compare(index,"Capabilities",item.Capabilities,copy.Capabilities);checkedSecurity+=2
    compare(index,"Attributes",item:GetAttributes(),copy:GetAttributes())
    local t,u=item:GetTags(),copy:GetTags();table.sort(t);table.sort(u);compare(index,"Tags",t,u)
    if item:IsA("LuaSourceContainer") then compare(index,"Source",item.Source,copy.Source);checkedSources+=1 end
    cache[item.ClassName]=cache[item.ClassName] or game:GetService("ReflectionService"):GetPropertiesOfClass(item.ClassName)
    for _,property in cache[item.ClassName] do
      local key=property.Name
      if property.Serialized and key~="Parent" and key~="UniqueId" and key~="HistoryId" then
        local read,x=pcall(function() return item[key] end)
        local readCopy,y=pcall(function() return copy[key] end)
        if read and readCopy then compare(index,key,x,y);checkedProperties+=1
        else local label=item.ClassName.."."..key;if not missing[label] then missing[label]=true;table.insert(unobservable,label) end end
      end
    end
  end
end)
for _,root in roots do root:Destroy() end
table.sort(unobservable)
return game:GetService("HttpService"):JSONEncode({passed=ok and #differences==0,error=if ok then "" else tostring(err),differences=differences,
 checkedProperties=checkedProperties,checkedReferences=checkedReferences,checkedSources=checkedSources,checkedSecurity=checkedSecurity,
 unobservableProperties=unobservable,importedCodeExecuted=false,restoredRoots=#roots,cleanup=true,engineVersion=version()})
`;
    fs.writeFileSync(path.join(output, name + ".luau"), code, { flag: "wx" });
    const response = await client.callTool(
      "execute_luau",
      { studio_id: studioId, datamodel_type: "Edit", code },
      AbortSignal.timeout(90000),
    );
    const record = {
      case: name,
      sourceHash: review.derivative.archiveHash,
      convertedHash: hash(converted),
      xmlHash: hash(fs.readFileSync(xmlFile)),
      logs,
      response,
    };
    fs.writeFileSync(
      path.join(output, name + ".json"),
      JSON.stringify(record, null, 2) + "\n",
      { flag: "wx" },
    );
    results.push(record);
    console.log(JSON.stringify({ case: name, response }));
  }
} finally {
  fs.writeFileSync(
    path.join(output, "result.json"),
    JSON.stringify(
      {
        kind: "frozen-component-rojo-native-comparison",
        format,
        rojoVersion: "7.7.0",
        executableHash: hash(fs.readFileSync(rojo)),
        studioId,
        results,
        paidCalls: 0,
        rawGameBenchmark: false,
      },
      null,
      2,
    ) + "\n",
    { flag: "wx" },
  );
  await client.close();
}
