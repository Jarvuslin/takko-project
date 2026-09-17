import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { StdioStudioClient } from "../src/generation/studio-mcp-client";
import {
  convertComponentXml,
  loadComponentXml,
} from "../src/generation/component-xml-conversion";
import { readComponentOriginal } from "../src/generation/component-derivative";
import { exportBundle } from "../src/generation/export";

// Native comparison of exported subtrees, not a Play test or model benchmark.
const [studioId, outputDirectory] = process.argv.slice(2);
if (!/^[a-f0-9-]{36}$/.test(studioId ?? "") || !outputDirectory)
  throw Error("Usage: STUDIO_UUID FRESH_OUTPUT_DIRECTORY");
const output = path.resolve(outputDirectory);
fs.mkdirSync(output, { recursive: false });
const input = "docs/results/takko-component-pipeline/native-v1";
const client = new StdioStudioClient();
const scope = "Forge_ComponentExport";
const hash = (b: Buffer | string) =>
  createHash("sha256").update(b).digest("hex");
const save = (name: string, value: unknown) =>
  fs.writeFileSync(
    path.join(output, name),
    JSON.stringify(value, null, 2) + "\n",
  );
const prepared: any[] = [];
const results: any[] = [];
try {
  for (const name of ["combat-training", "bubble-wrap", "checkpoint-parkour"]) {
    const row = JSON.parse(
      fs.readFileSync(path.join(input, name + "-result.json"), "utf8"),
    );
    const retained = row.result.receipts.find(
      (r: any) => r.operation === "adapted_component_archive",
    ).data;
    const folder = path.join(output, name);
    fs.mkdirSync(folder);
    for (const file of [
      retained.adapted.archiveHash + ".rbxm",
      retained.adapted.manifestHash + ".component.json",
    ])
      fs.copyFileSync(
        path.join(input, name, file),
        path.join(folder, file),
        fs.constants.COPYFILE_EXCL,
      );
    const conversion = convertComponentXml(folder, retained.adapted);
    const component = loadComponentXml(
      folder,
      conversion.recordHash,
      `Workspace/${scope}/Assets/${name}`,
    );
    const original = readComponentOriginal(
      folder,
      retained.adapted.archiveHash,
      retained.adapted.manifestHash,
    );
    prepared.push({ name, folder, conversion, component, original });
  }
  const document = exportBundle(
    { files: [], scene: [], assets: [], coverage: [] },
    scope,
    prepared.map((r) => r.component),
  );
  fs.writeFileSync(path.join(output, "combined.rbxlx"), document);
  save("export.json", {
    sha256: hash(document),
    bytes: Buffer.byteLength(document),
    components: prepared.map((r) => ({
      case: r.name,
      ...r.conversion,
      destinationPath: r.component.destinationPath,
    })),
    paidCalls: 0,
    rawGameBenchmark: false,
  });
  const options = {
    preserveOrder: true,
    ignoreAttributes: false,
    parseTagValue: false,
    trimValues: false,
    cdataPropName: "#cdata",
    commentPropName: "#comment",
  };
  const parsed = new XMLParser(options).parse(document)[0].roblox;
  for (const row of prepared) {
    // Extract the actual exported subtree, including the combined shared pool.
    let siblings = parsed;
    for (const segment of row.component.destinationPath.split("/")) {
      const matches = siblings.filter((e: any) =>
        e.Item?.some((p: any) =>
          p.Properties?.some(
            (v: any) =>
              v.string &&
              v[":@"]?.["@_name"] === "Name" &&
              v.string.map((t: any) => t["#text"] ?? "").join("") === segment,
          ),
        ),
      );
      if (matches.length !== 1)
        throw Error("Exported destination missing or ambiguous");
      siblings = matches[0].Item;
    }
    const roots = siblings.filter((e: any) => e.Item);
    if (roots.length !== 1)
      throw Error("Exported component root count differs");
    const extracted = new XMLBuilder(options).build([
      {
        roblox: [roots[0], ...parsed.filter((e: any) => e.SharedStrings)],
        ":@": { "@_version": "4" },
      },
    ]);
    fs.writeFileSync(
      path.join(output, row.name + "-exported.rbxmx"),
      extracted,
    );
    const code = `
assert(not game:GetService("RunService"):IsRunning(),"Requires Edit")
local roots={};local differences,unobservable={},{}
local checkedProperties,checkedReferences,checkedSources,checkedSecurity=0,0,0,0
local ok,err=pcall(function()
 local function load(data)
  local loaded=game:GetService("SerializationService"):DeserializeInstancesAsync(game:GetService("EncodingService"):Base64Decode(buffer.fromstring(data)))
  for _,r in loaded do table.insert(roots,r);assert(r.Parent==nil,"Restoration parented root") end
  assert(#loaded==1,"Expected one component root");return loaded[1]
 end
 local a=load(${JSON.stringify(row.original.snapshot.base64)});local b=load(${JSON.stringify(Buffer.from(extracted).toString("base64"))})
 local left,right,leftIndex,rightIndex={},{},{},{}
 local function walk(item,list,index) list[#list+1]=item;index[item]=#list;for _,child in item:GetChildren()do walk(child,list,index)end end
 walk(a,left,leftIndex);walk(b,right,rightIndex);assert(#left==#right,"Instance count differs")
 local function equal(x,y)
  local kind=typeof(x);if kind~=typeof(y)then return false end
  if kind=="Instance"then checkedReferences+=1;return leftIndex[x]~=nil and leftIndex[x]==rightIndex[y]
  elseif kind=="NumberSequence"or kind=="ColorSequence"then return equal(x.Keypoints,y.Keypoints)
  elseif kind=="NumberSequenceKeypoint"then return x.Time==y.Time and x.Value==y.Value and x.Envelope==y.Envelope
  elseif kind=="ColorSequenceKeypoint"then return x.Time==y.Time and x.Value==y.Value
  elseif kind=="table"then for k,v in x do if not equal(v,y[k])then return false end end;for k in y do if x[k]==nil then return false end end;return true end
  return x==y
 end
 local function compare(index,key,x,y)if not equal(x,y)then assert(#differences<1000,"Too many differences");table.insert(differences,{index=index,property=key,before=tostring(x),after=tostring(y)})end end
 local cache,missing={},{}
 for index,item in left do
  local copy=right[index]
  compare(index,"Name",item.Name,copy.Name);compare(index,"ClassName",item.ClassName,copy.ClassName);compare(index,"Parent",leftIndex[item.Parent]or 0,rightIndex[copy.Parent]or 0)
  compare(index,"Sandboxed",item.Sandboxed,copy.Sandboxed);compare(index,"Capabilities",item.Capabilities,copy.Capabilities);checkedSecurity+=2
  compare(index,"Attributes",item:GetAttributes(),copy:GetAttributes());local t,u=item:GetTags(),copy:GetTags();table.sort(t);table.sort(u);compare(index,"Tags",t,u)
  if item:IsA("LuaSourceContainer")then compare(index,"Source",item.Source,copy.Source);checkedSources+=1 end
  cache[item.ClassName]=cache[item.ClassName]or game:GetService("ReflectionService"):GetPropertiesOfClass(item.ClassName)
  for _,property in cache[item.ClassName]do
   local key=property.Name
   if property.Serialized and key~="Parent"and key~="UniqueId"and key~="HistoryId"then
    local read,x=pcall(function()return item[key]end);local readCopy,y=pcall(function()return copy[key]end)
    if read and readCopy then compare(index,key,x,y);checkedProperties+=1
    else local label=item.ClassName.."."..key;if not missing[label]then missing[label]=true;table.insert(unobservable,label)end end
   end
  end
 end
end)
for _,r in roots do r:Destroy()end;table.sort(unobservable)
return game:GetService("HttpService"):JSONEncode({passed=ok and #differences==0,error=if ok then ""else tostring(err),differences=differences,checkedProperties=checkedProperties,checkedReferences=checkedReferences,checkedSources=checkedSources,checkedSecurity=checkedSecurity,unobservableProperties=unobservable,importedCodeExecuted=false,restoredRoots=#roots,cleanup=true,engineVersion=version()})`;
    fs.writeFileSync(path.join(output, row.name + "-compare.luau"), code);
    const response: any = await client.callTool(
      "execute_luau",
      { studio_id: studioId, datamodel_type: "Edit", code },
      AbortSignal.timeout(90000),
    );
    const result = response.isError
      ? { passed: false, response }
      : JSON.parse(response.content.find((c: any) => c.type === "text").text);
    const record = {
      case: row.name,
      sourceHash: row.conversion.source.archiveHash,
      exportedSubtreeHash: hash(extracted),
      result,
    };
    save(row.name + "-comparison.json", record);
    results.push(record);
    console.log(JSON.stringify(record));
    if (!result.passed)
      throw Error("Native export comparison failed for " + row.name);
  }
} finally {
  save("result.json", {
    kind: "combined-component-export-native-comparison",
    studioId,
    results,
    paidCalls: 0,
    rawGameBenchmark: false,
    importedCodeExecuted: false,
  });
  await client.close();
}
