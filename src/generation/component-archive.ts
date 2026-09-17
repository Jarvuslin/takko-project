import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

export const componentArchiveLimits = Object.freeze({
  instances: 3000,
  scripts: 1000,
  sourceBytes: 524288,
  binaryBytes: 4194304,
});
const digest = (data: string | Buffer) =>
  createHash("sha256").update(data).digest("hex");
export const componentTransferSchema = z
  .object({
    encodedBytes: z
      .number()
      .int()
      .positive()
      .max(12 * 1024 * 1024),
    jsonBytes: z
      .number()
      .int()
      .positive()
      .max(8 * 1024 * 1024),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    chunkSize: z.literal(32768),
  })
  .strict();
export function decodeComponentTransfer(raw: unknown, chunks: string[]) {
  const transfer = componentTransferSchema.parse(raw);
  if (
    chunks.length !== Math.ceil(transfer.encodedBytes / transfer.chunkSize) ||
    chunks.some(
      (c, i) =>
        c.length !==
        Math.min(
          transfer.chunkSize,
          transfer.encodedBytes - i * transfer.chunkSize,
        ),
    )
  )
    throw Error("Component transfer has missing or malformed chunks");
  const encoded = chunks.join("");
  if (digest(encoded) !== transfer.sha256)
    throw Error("Component transfer digest mismatch");
  const bytes = Buffer.from(encoded, "base64");
  if (
    bytes.toString("base64") !== encoded ||
    bytes.length !== transfer.jsonBytes
  )
    throw Error("Component transfer encoding/length mismatch");
  return JSON.parse(
    new TextDecoder("utf-8", { fatal: true }).decode(bytes),
  ) as unknown;
}
const node = z
  .object({
    index: z.number().int().positive(),
    parentIndex: z.number().int().nonnegative(),
    name: z.string().max(1024),
    className: z.string().min(1).max(100),
  })
  .strict();
const source = z
  .object({
    index: z.number().int().positive(),
    className: z.enum(["Script", "LocalScript", "ModuleScript"]),
    source: z.string().max(componentArchiveLimits.sourceBytes),
    sourceBytes: z
      .number()
      .int()
      .min(0)
      .max(componentArchiveLimits.sourceBytes),
    disabled: z.boolean().optional(),
    runContext: z.string().max(100).optional(),
  })
  .strict();
// Bounded, versioned coverage; this is not a claim to discover dynamically built IDs.
export const componentContentProperties: Record<string, readonly string[]> = {
  Sound: ["SoundId"],
  Animation: ["AnimationId"],
  MeshPart: ["MeshId", "TextureID"],
  SpecialMesh: ["MeshId", "TextureId"],
  Decal: ["Texture"],
  Texture: ["Texture"],
  SurfaceAppearance: ["ColorMap", "MetalnessMap", "NormalMap", "RoughnessMap"],
  ParticleEmitter: ["Texture"],
  Beam: ["Texture"],
  Trail: ["Texture"],
  ImageLabel: ["Image"],
  ImageButton: ["Image", "HoverImage", "PressedImage"],
  VideoFrame: ["Video"],
};
// Values can supply module IDs or behavior settings without appearing in source.
// Coverage is explicit; absence on old archives means unknown, never empty.
export const componentConfigurationClasses: Record<
  string,
  "number" | "string" | "boolean"
> = {
  NumberPose: "number",
  NumberValue: "number",
  IntValue: "number",
  DoubleConstrainedValue: "number",
  IntConstrainedValue: "number",
  StringValue: "string",
  BoolValue: "boolean",
};
const configurationValue = z
  .object({
    index: z.number().int().positive(),
    property: z.literal("Value"),
    value: z.union([z.number(), z.string().max(4096), z.boolean()]),
  })
  .strict();
export type ComponentConfigurationValue = z.infer<typeof configurationValue>;
const contentReference = z
  .object({
    index: z.number().int().positive(),
    property: z.string().min(1).max(100),
    value: z.string().max(4096),
  })
  .strict();
export const runtimeOnlyInstanceSchema = z
  .object({
    parentIndex: z.number().int().positive(),
    name: z.literal("TouchInterest"),
    className: z.literal("TouchTransmitter"),
    reconstruction: z.literal("touch_listener_required_unverified"),
  })
  .strict();
export type RuntimeOnlyInstance = z.infer<typeof runtimeOnlyInstanceSchema>;
export const componentArchiveSnapshotSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("unavailable"),
      reason: z.string().min(1).max(2000),
    })
    .strict(),
  z
    .object({
      status: z.literal("captured"),
      format: z.literal("roblox-native-rbxm-v1"),
      engineVersion: z.string().min(1).max(200),
      base64: z
        .string()
        .min(1)
        .max(Math.ceil(componentArchiveLimits.binaryBytes / 3) * 4),
      bytes: z
        .number()
        .int()
        .positive()
        .max(componentArchiveLimits.binaryBytes),
      nodes: z.array(node).min(1).max(componentArchiveLimits.instances),
      sources: z.array(source).max(componentArchiveLimits.scripts),
      // Absent on historical archives means unknown, not an empty inventory.
      contentReferences: z.array(contentReference).max(12000).optional(),
      configurationValues: z.array(configurationValue).max(3000).optional(),
      runtimeOnlyInstances: z
        .array(runtimeOnlyInstanceSchema)
        .min(1)
        .max(3000)
        .optional(),
      sourceBytes: z
        .number()
        .int()
        .min(0)
        .max(componentArchiveLimits.sourceBytes),
      roundTrip: z.union([
        z
          .object({
            passed: z.literal(true),
            checkedProperties: z.number().int().nonnegative(),
            checkedAttributes: z.number().int().nonnegative(),
            checkedReferences: z.number().int().nonnegative(),
            unobservableProperties: z.array(z.string().max(300)).max(3000),
            ignoredIdentityProperties: z.array(z.string()).max(10),
          })
          .strict(),
        z
          .object({
            passed: z.literal(false),
            stage: z.string().min(1).max(100),
            reason: z.string().min(1).max(2000),
          })
          .strict(),
      ]),
      executed: z.literal(false),
    })
    .strict(),
]);
export type ComponentArchiveSnapshot = z.infer<
  typeof componentArchiveSnapshotSchema
>;

/** Native serialization does not establish code safety, content rights, or gameplay suitability. */
export function persistComponentArchive(raw: unknown, directory?: string) {
  const snapshot = componentArchiveSnapshotSchema.parse(raw);
  if (snapshot.status === "unavailable") return snapshot;
  const { base64, ...manifest } = snapshot;
  const bytes = Buffer.from(base64, "base64");
  if (
    bytes.toString("base64") !== base64 ||
    bytes.length !== snapshot.bytes ||
    bytes.subarray(0, 14).toString("hex") !== "3c726f626c6f782189ff0d0a1a0a"
  )
    throw Error(
      "Component archive is not a bounded canonical native RBXM payload",
    );
  const nodes = new Map(snapshot.nodes.map((n) => [n.index, n]));
  if (
    nodes.size !== snapshot.nodes.length ||
    snapshot.nodes[0].parentIndex !== 0 ||
    snapshot.nodes.some(
      (n, i) =>
        n.index !== i + 1 ||
        (i > 0 && (!nodes.has(n.parentIndex) || n.parentIndex >= n.index)),
    )
  )
    throw Error("Component hierarchy is incomplete, cyclic or ambiguous");
  const sourceIndices = new Set(snapshot.sources.map((s) => s.index));
  if (
    snapshot.runtimeOnlyInstances &&
    (snapshot.nodes.some((n) => n.className === "TouchTransmitter") ||
      new Set(snapshot.runtimeOnlyInstances.map((n) => n.parentIndex)).size !==
        snapshot.runtimeOnlyInstances.length ||
      snapshot.runtimeOnlyInstances.some((n) => !nodes.has(n.parentIndex)) ||
      snapshot.nodes.length + snapshot.runtimeOnlyInstances.length >
        componentArchiveLimits.instances)
  )
    throw Error("Invalid runtime-only component inventory");
  if (snapshot.configurationValues !== undefined) {
    const expected = snapshot.nodes
      .filter((n) => Object.hasOwn(componentConfigurationClasses, n.className))
      .map((n) => n.index);
    const values = snapshot.configurationValues;
    if (
      values.length !== expected.length ||
      new Set(values.map((v) => v.index)).size !== values.length ||
      values.some(
        (v) =>
          !expected.includes(v.index) ||
          typeof v.value !==
            componentConfigurationClasses[nodes.get(v.index)!.className],
      )
    )
      throw Error(
        "Component configuration value inventory is incomplete or ambiguous",
      );
  }
  if (snapshot.contentReferences !== undefined) {
    const expected = snapshot.nodes.flatMap((n) =>
      (componentContentProperties[n.className] ?? []).map(
        (p) => `${n.index}:${p}`,
      ),
    );
    const keys = snapshot.contentReferences.map(
      (r) => `${r.index}:${r.property}`,
    );
    if (
      keys.length !== expected.length ||
      new Set(keys).size !== keys.length ||
      keys.some((k) => !expected.includes(k))
    )
      throw Error(
        "Component content reference inventory is incomplete or ambiguous",
      );
  }
  const actualSourceBytes = snapshot.sources.reduce(
    (total, s) => total + Buffer.byteLength(s.source, "utf8"),
    0,
  );
  if (
    sourceIndices.size !== snapshot.sources.length ||
    actualSourceBytes !== snapshot.sourceBytes ||
    snapshot.sources.some(
      (s) =>
        nodes.get(s.index)?.className !== s.className ||
        Buffer.byteLength(s.source, "utf8") !== s.sourceBytes,
    ) ||
    snapshot.nodes.some(
      (n) =>
        ["Script", "LocalScript", "ModuleScript"].includes(n.className) &&
        !sourceIndices.has(n.index),
    )
  )
    throw Error(
      "Component source inventory is incomplete or has mismatched identities/bytes",
    );
  const sha256 = digest(bytes);
  const evidence = {
    ...manifest,
    sha256,
    sources: manifest.sources.map((s) => ({ ...s, sha256: digest(s.source) })),
    securityReview: "not_performed" as const,
    runtimeVerification: "not_performed" as const,
    exportConversion: "not_performed" as const,
    identityBoundary:
      "exact imported hierarchy before static normalization; import tool controls the outer root name",
  };
  let archiveFile: string | undefined, manifestFile: string | undefined;
  if (directory) {
    fs.mkdirSync(directory, { recursive: true });
    archiveFile = path.join(directory, sha256 + ".rbxm");
    const manifestBytes = Buffer.from(JSON.stringify(evidence, null, 2) + "\n");
    manifestFile = path.join(
      directory,
      digest(manifestBytes) + ".component.json",
    );
    for (const [file, content] of [
      [archiveFile, bytes],
      [manifestFile, manifestBytes],
    ] as const) {
      if (fs.existsSync(file)) {
        if (!fs.readFileSync(file).equals(content))
          throw Error("Component evidence filename collision");
      } else fs.writeFileSync(file, content, { flag: "wx" });
    }
  }
  return {
    status: "captured" as const,
    sha256,
    bytes: bytes.length,
    archiveFile,
    manifestFile,
    instanceCount: snapshot.nodes.length,
    scriptCount: snapshot.sources.length,
    sourceBytes: actualSourceBytes,
    roundTrip: snapshot.roundTrip,
    persisted: !!directory,
    securityReview: evidence.securityReview,
    runtimeVerification: evidence.runtimeVerification,
    exportConversion: evidence.exportConversion,
  };
}

// Only the empty engine-created touch listener marker is outside durable inventory.
// This never removes it; nondefault/custom instances remain unsupported.
export const componentRuntimeInventoryLuau = String.raw`
local function isRuntimeTouchInstance(item)
  if item.ClassName~="TouchTransmitter" then return false end
  assert(item.Parent and item.Parent:IsA("BasePart") and item.Name=="TouchInterest" and item.Archivable
    and not item.Sandboxed and item.Capabilities==SecurityCapabilities.new()
    and #item:GetChildren()==0 and next(item:GetAttributes())==nil and #item:GetTags()==0,
    "Nonstandard TouchTransmitter cannot be omitted from durable inventory")
  return true
end
local function componentPersistentChildren(item)
  local children={}
  for _,child in item:GetChildren() do
    if not isRuntimeTouchInstance(child) then table.insert(children,child) end
  end
  return children
end
`;
/** Called only on an owned quarantined instance. Copies stay unparented; no imported code runs. */
export const componentArchiveLuau = String.raw`
${componentRuntimeInventoryLuau}
local function captureComponentArchive(root, roundTripBytes)
  local clones={}
  local captured=nil
  local stage="inventory"
  local ok,result=pcall(function()
    assert(not game:GetService("RunService"):IsRunning(),"Component capture requires Edit")
    local LIMIT_NODES=${componentArchiveLimits.instances}
    local LIMIT_SCRIPTS=${componentArchiveLimits.scripts}
    local LIMIT_SOURCE=${componentArchiveLimits.sourceBytes}
    local LIMIT_BINARY=${componentArchiveLimits.binaryBytes}
    local originalParent=root.Parent
    local items,indices,nodes,sources,contentReferences,configurationValues={},{},{},{},{},{}
    local runtimeOnlyInstances,runtimeItems={},{}
    local configurationClasses={${Object.entries(componentConfigurationClasses)
      .map(
        ([name, kind]) => `[${JSON.stringify(name)}]=${JSON.stringify(kind)}`,
      )
      .join(",")}}
    local contentProperties={${Object.entries(componentContentProperties)
      .map(
        ([name, props]) =>
          `[${JSON.stringify(name)}]={${props.map((p) => JSON.stringify(p)).join(",")}}`,
      )
      .join(",")}}
    local sourceBytes=0
    local function walk(item,parentIndex,depth)
      assert(item.ClassName~="TouchTransmitter","Runtime-only component root is unsupported")
      assert(depth<=64,"Component hierarchy exceeds depth bound")
      assert(#items+#runtimeOnlyInstances<LIMIT_NODES,"Component exceeds instance bound")
      assert(item.Archivable,"Nonarchivable instance cannot be preserved")
      assert(#item.Name<=1024,"Component instance name exceeds bound")
      local index=#items+1;items[index]=item;indices[item]=index
      table.insert(nodes,{index=index,parentIndex=parentIndex,name=item.Name,className=item.ClassName})
      local valueType=configurationClasses[item.ClassName]
      if valueType then
        local value=item.Value
        assert(type(value)==valueType,"Configuration value type mismatch")
        if valueType=="string" then assert(#value<=4096,"Configuration string exceeds bound") end
        if valueType=="number" then assert(value==value and math.abs(value)<math.huge,"Configuration number must be finite") end
        table.insert(configurationValues,{index=index,property="Value",value=value})
      end
      for _,property in contentProperties[item.ClassName] or {} do
        local value=item[property]
        assert(type(value)=="string" and #value<=4096,"Content reference unreadable or exceeds bound")
        table.insert(contentReferences,{index=index,property=property,value=value})
      end
      if item:IsA("LuaSourceContainer") then
        assert(#sources<LIMIT_SCRIPTS,"Component exceeds script bound")
        local source=game:GetService("ScriptEditorService"):GetEditorSource(item)
        assert(source==item.Source,"Unsaved editor source differs from serialized source")
        sourceBytes+=#source;assert(sourceBytes<=LIMIT_SOURCE,"Component exceeds source byte bound")
        local row={index=index,className=item.ClassName,source=source,sourceBytes=#source}
        if item:IsA("BaseScript") then row.disabled=item.Disabled;row.runContext=tostring(item.RunContext) end
        table.insert(sources,row)
      end
      for _,child in item:GetChildren() do
        if isRuntimeTouchInstance(child) then
          assert(not runtimeItems[child] and #items+#runtimeOnlyInstances<LIMIT_NODES,"Runtime-only inventory exceeds bound")
          runtimeItems[child]={parent=item,index=index}
          table.insert(runtimeOnlyInstances,{parentIndex=index,name="TouchInterest",className="TouchTransmitter",reconstruction="touch_listener_required_unverified"})
        else walk(child,index,depth+1) end
      end
    end
    walk(root,0,0)
    assert(#items+#runtimeOnlyInstances<=LIMIT_NODES,"Component exceeds combined instance bound")
    stage="serialize"
    local bytes=game:GetService("SerializationService"):SerializeInstancesAsync({root})
    assert(buffer.len(bytes)>0 and buffer.len(bytes)<=LIMIT_BINARY,"Component archive exceeds binary bound")
    captured={status="captured",format="roblox-native-rbxm-v1",engineVersion=version(),bytes=buffer.len(bytes),
      base64=buffer.tostring(game:GetService("EncodingService"):Base64Encode(bytes)),nodes=nodes,sources=sources,contentReferences=contentReferences,configurationValues=configurationValues,sourceBytes=sourceBytes,executed=false}
    if #runtimeOnlyInstances>0 then captured.runtimeOnlyInstances=runtimeOnlyInstances end
    stage="deserialize"
    if roundTripBytes then assert(buffer.len(roundTripBytes)<=16*1024*1024,"Comparison input exceeds bound") end
    clones=game:GetService("SerializationService"):DeserializeInstancesAsync(roundTripBytes or bytes)
    stage="compare"
    assert(#clones==1 and clones[1].Parent==nil,"Component round trip changed its root count")
    local copies,copyIndices={},{}
    local function collect(item)
      copies[#copies+1]=item;copyIndices[item]=#copies
      assert(#copies<=LIMIT_NODES,"Round-trip instance count exceeds bound")
      for _,child in componentPersistentChildren(item) do collect(child) end
    end
    collect(clones[1])
    if #copies~=#items then
      local expected,actual,classes={},{},{}
      for _,item in items do expected[item.ClassName]=(expected[item.ClassName] or 0)+1;classes[item.ClassName]=true end
      for _,item in copies do actual[item.ClassName]=(actual[item.ClassName] or 0)+1;classes[item.ClassName]=true end
      local differences={}
      for name in classes do
        if expected[name]~=actual[name] then table.insert(differences,name..":"..tostring(expected[name] or 0).."->"..tostring(actual[name] or 0)) end
      end
      table.sort(differences)
      error("Component round trip changed instance count "..#items.."->"..#copies.." ("..table.concat(differences,", ")..")")
    end
    for _,ref in configurationValues do
      assert(items[ref.index].Value==ref.value,"Component configuration value changed during capture")
      assert(copies[ref.index].Value==ref.value,"Component round trip changed configuration value")
    end
    for _,ref in contentReferences do
      assert(items[ref.index][ref.property]==ref.value,"Component content reference changed during capture")
      assert(copies[ref.index][ref.property]==ref.value,"Component round trip changed content reference")
    end
    local checkedProperties,checkedAttributes,checkedReferences=0,0,0
    local unobservable,missingSet={},{}
    local ignored={UniqueId=true,HistoryId=true}
    local propertyCache={}
    local function equal(a,b)
      if typeof(a)=="Instance" then assert(indices[a]~=nil,"Component has an external or runtime-only instance reference") end
      local kind=typeof(a);if kind~=typeof(b) then return false end
      if kind=="Instance" then
        checkedReferences+=1
        assert(indices[a]~=nil,"Component has an external instance reference")
        return indices[a]==copyIndices[b]
      elseif kind=="NumberSequence" or kind=="ColorSequence" then
        return equal(a.Keypoints,b.Keypoints)
      elseif kind=="NumberSequenceKeypoint" then
        return a.Time==b.Time and a.Value==b.Value and a.Envelope==b.Envelope
      elseif kind=="ColorSequenceKeypoint" then
        return a.Time==b.Time and a.Value==b.Value
      elseif kind=="table" then
        for k,v in a do if not equal(v,b[k]) then return false end end
        for k in b do if a[k]==nil then return false end end
        return true
      end
      return a==b
    end
    for index,item in items do
      local copy=copies[index]
      assert(item.Name==nodes[index].name and item.ClassName==nodes[index].className and (indices[item.Parent] or 0)==nodes[index].parentIndex,"Component inventory changed during capture")
      assert(item.Name==copy.Name and item.ClassName==copy.ClassName,"Component round trip changed child identity/order")
      assert((indices[item.Parent] or 0)==(copyIndices[copy.Parent] or 0),"Component round trip changed parentage")
      -- Security controls must survive even if reflection does not label them
      -- Serialized. A faithfully restored source with a lost sandbox is unsafe.
      assert(item.Sandboxed==copy.Sandboxed,"Component round trip changed sandboxing")
      assert(item.Capabilities==copy.Capabilities,"Component round trip changed capabilities")
      local attributes=item:GetAttributes()
      assert(equal(attributes,copy:GetAttributes()),"Component round trip changed attributes")
      for _ in attributes do checkedAttributes+=1 end
      local tags=item:GetTags();local copyTags=copy:GetTags();table.sort(tags);table.sort(copyTags)
      assert(equal(tags,copyTags),"Component round trip changed tags")
      if item:IsA("LuaSourceContainer") then assert(item.Source==copy.Source,"Component round trip changed script bytes") end
      if not propertyCache[item.ClassName] then
        propertyCache[item.ClassName]=game:GetService("ReflectionService"):GetPropertiesOfClass(item.ClassName)
      end
      for _,property in propertyCache[item.ClassName] do
        local name=property.Name
        if property.Serialized and name~="Parent" and not ignored[name] then
          local read,a=pcall(function() return item[name] end)
          local readCopy,b=pcall(function() return copy[name] end)
          if read and readCopy then
            assert(equal(a,b),"Component round trip changed property "..item.ClassName.."."..name)
            checkedProperties+=1
          else
            local key=item.ClassName.."."..name
            if not missingSet[key] then
              assert(#unobservable<3000,"Unobservable property inventory exceeds bound")
              missingSet[key]=true;table.insert(unobservable,key)
            end
          end
        end
      end
    end
    -- Serialization APIs yield. A concurrent edit must not produce evidence for stale bytes.
    assert(not game:GetService("RunService"):IsRunning(),"Studio entered Play during component capture")
    assert(root.Parent==originalParent,"Component moved during capture")
    for _,source in sources do assert(items[source.index].Source==source.source,"Component source changed during capture") end
    for _,ref in contentReferences do assert(items[ref.index][ref.property]==ref.value,"Component content reference changed during capture") end
    for _,ref in configurationValues do assert(items[ref.index].Value==ref.value,"Component configuration value changed during capture") end
    local finalItems={root};for _,x in root:GetDescendants() do table.insert(finalItems,x) end
    assert(#finalItems==#items+#runtimeOnlyInstances,"Component changed during capture")
    for _,x in finalItems do
      if runtimeItems[x] then
        assert(x.Parent==runtimeItems[x].parent and isRuntimeTouchInstance(x),"Runtime-only instance changed during capture")
      else assert(indices[x],"Component identity changed during capture") end
    end
    table.sort(unobservable)
    captured.roundTrip={passed=true,checkedProperties=checkedProperties,checkedAttributes=checkedAttributes,checkedReferences=checkedReferences,
        unobservableProperties=unobservable,ignoredIdentityProperties={"UniqueId","HistoryId"}}
    return captured
  end)
  for _,copy in clones do copy:Destroy() end
  if not ok then
    if captured then captured.roundTrip={passed=false,stage=stage,reason=tostring(result):sub(1,1900)};return captured end
    return {status="unavailable",reason=stage..": "..tostring(result):sub(1,1800)}
  end
  return result
end
`;
