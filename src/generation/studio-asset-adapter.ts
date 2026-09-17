import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import {
  assetNeedSchema,
  AssetOperationError,
  type AssetFailureClassification,
  type AssetAdapter,
  type AssetCandidate,
  type AssetInspection,
  type AssetNeed,
  type AssetReceipt,
  type AssetVerification,
} from "./asset-contract";
import { bundleSchema, type Bundle } from "./schema";
import { scenePropertyError } from "./capabilities";
import { isVerifiedEditState } from "./studio-state";
import { auditionStudioAudio, AudioRuntimeError } from "./studio-audio-runtime";
import {
  componentArchiveLuau,
  componentArchiveSnapshotSchema,
  persistComponentArchive,
  componentTransferSchema,
  decodeComponentTransfer,
} from "./component-archive";
import {
  validateStudioAudio,
  type StudioAudioEvidence,
  type StudioAudioCapture,
} from "./audio-evidence";
import {
  componentRestrictionLuau,
  readComponentOriginal,
  persistComponentDerivative,
} from "./component-derivative";
import {
  loadComponentReviewEvidence,
  type ComponentReviewEvidence,
  type ComponentReviewDecision,
} from "./component-review";
import {
  convertComponentXml,
  loadComponentXml,
} from "./component-xml-conversion";
import {
  assertIntegrationReview,
  componentReferenceSchema,
  loadComponentIntegration,
  persistComponentIntegration,
  type ComponentReference,
} from "./component-integration";
import { componentAudioCandidates } from "./component-media";
import {
  componentAdaptationLuau,
  expandedSourceEdits,
  validateComponentAdaptation,
  persistComponentAdaptation,
  loadComponentAdaptationChain,
  maxComponentAdaptations,
  type ComponentAdaptation,
} from "./component-adaptation";

export interface StudioAssetClient {
  callTool(
    name: string,
    args: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<unknown>;
}
export const studioAssetCapabilities = Object.freeze({
  search: ["Model", "MeshPart", "Audio", "Image"] as const,
  serializedClasses: [
    "Folder",
    "Model",
    "Part",
    "MeshPart",
    "Sound",
    "Decal",
  ] as const,
  animationSearch: false,
  imageImport: true,
  audioSemanticVerification: false,
  maxInstances: 300,
  maxOriginalExtent: 2000,
});
type Entry = {
  token: string;
  attempt: string;
  need: AssetNeed;
  candidate: AssetCandidate;
  placed: boolean;
  inspection?: AssetInspection;
  restrictionAttempted?: boolean;
  preparedPacketHash?: string;
  adaptationAttempts?: number;
  adaptedPacketHash?: string;
  integrationAttempted?: boolean;
};
export class StudioAssetError extends AssetOperationError {
  constructor(
    message: string,
    readonly receipts: AssetReceipt[],
    readonly effects: "none" | "owned" | "unknown",
    classification: AssetFailureClassification = "infrastructure_failure",
  ) {
    super(message, receipts, effects, classification);
    this.name = "StudioAssetError";
  }
}
const identifier = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
// JSON string literals are also valid Luau for this restricted identifier/numeric surface.
const quote = (value: string) => JSON.stringify(value);
function unpack(raw: unknown): any {
  let value: any = raw;
  for (let i = 0; i < 6; i++) {
    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
        continue;
      } catch {
        return value;
      }
    }
    if (value?.structuredContent) {
      value = value.structuredContent;
      continue;
    }
    if (Array.isArray(value?.content)) {
      const blocks = value.content.filter((v: any) => v.type === "text");
      if (blocks.length === 1) {
        value = blocks[0].text;
        continue;
      }
    }
    if (
      value &&
      typeof value === "object" &&
      Object.keys(value).length === 1 &&
      "result" in value
    ) {
      value = value.result;
      continue;
    }
    break;
  }
  return value;
}
function imageFrom(raw: any): string | undefined {
  const image = raw?.content?.find(
    (b: any) => b.type === "image" && typeof b.data === "string",
  );
  if (
    image &&
    /^image\/(png|jpeg|webp)$/.test(image.mimeType) &&
    /^[A-Za-z0-9+/=\r\n]+$/.test(image.data)
  )
    return `data:${image.mimeType};base64,${image.data}`;
  return undefined;
}
const functionalSchema = z.object({
  contentLoaded: z.boolean(),
  instanceCount: z.number().int().min(0),
  scriptCount: z.number().int().nonnegative(),
  playbackObserved: z.boolean().optional(),
});
const capabilityBlockSchema = z
  .object({
    kind: z.enum([
      "interactive_asset_requires_review",
      "unsupported_structure",
    ]),
    reason: z.string().min(1).max(1000),
  })
  .strict();
const inertAuditSchema = z
  .object({
    mode: z.literal("inert_quarantine_static_inspection"),
    sourceOrigin: z.literal("ScriptEditorService:GetEditorSource"),
    dependencyAnalysis: z.literal("lexical_literals_only_not_execution_proof"),
    executed: z.literal(false),
    instanceLimit: z.literal(300),
    sourceLimit: z.literal(8),
    sourceByteLimit: z.literal(65536),
    instanceListTruncated: z.boolean(),
    sourceListTruncated: z.boolean(),
    sourceBytesReturned: z.number().int().min(0).max(65536),
    nodes: z
      .array(
        z
          .object({
            index: z.number().int().positive(),
            parentIndex: z.number().int().nonnegative(),
            name: z.string().max(480),
            nameTruncated: z.boolean(),
            className: z.string().max(100),
          })
          .strict(),
      )
      .max(300),
    sources: z
      .array(
        z
          .object({
            index: z.number().int().positive(),
            className: z.string().max(100),
            readable: z.boolean(),
            source: z.string().max(65536).optional(),
            sourceBytes: z.number().int().nonnegative().optional(),
            sourceOmittedForLimit: z.boolean(),
            readError: z.string().max(1000).optional(),
            disabled: z.boolean().optional(),
            runContext: z.string().max(100).optional(),
            literalDependencies: z
              .array(
                z
                  .object({
                    kind: z.enum([
                      "require_asset_id",
                      "content_asset_id",
                      "service",
                      "constructed_class",
                    ]),
                    value: z.string().max(480),
                  })
                  .strict(),
              )
              .max(64),
            dependencyListTruncated: z.boolean(),
          })
          .strict(),
      )
      .max(8),
  })
  .strict();
const snapshotSchema = z
  .object({
    marker: z.literal("takko_asset_v1"),
    operation: z.enum([
      "prepare",
      "inspect",
      "preview",
      "place",
      "discard",
      "audio_playback",
      "component_chunk",
      "component_restrict",
      "component_adapt",
      "component_export",
    ]),
    ok: z.boolean(),
    reasons: z.array(z.string()),
    functional: functionalSchema.optional(),
    capabilityBlock: capabilityBlockSchema.optional(),
    inertAudit: inertAuditSchema.optional(),
    componentArchive: componentArchiveSnapshotSchema.optional(),
    componentTransfer: componentTransferSchema.optional(),
    scene: bundleSchema.shape.scene.optional(),
    center: z
      .tuple([z.number().finite(), z.number().finite(), z.number().finite()])
      .optional(),
    size: z.number().finite().positive().optional(),
  })
  .passthrough();

/** All executed code is generated from these fixed templates. Model text, asset
 * names, returned paths and returned code are never interpolated into Luau. */
const LUA_COMMON = String.raw`
local Http = game:GetService("HttpService")
local Run = game:GetService("RunService")
assert(not Run:IsRunning(), "Edit mode required; never stop Play automatically")
local MARK = "TakkoAssetToken"
local function reply(operation, ok, extra)
  local value = extra or {}
  value.marker = "takko_asset_v1"; value.operation = operation; value.ok = ok; value.reasons = value.reasons or {}
  return Http:JSONEncode(value)
end
local function child(parent, name)
  local found = nil
  for _, item in parent:GetChildren() do
    if item.Name == name then assert(found == nil, "Ambiguous owned path: " .. name); found = item end
  end
  return found
end
local function container(serviceName, middle, create)
  local service = game:GetService(serviceName)
  local root = child(service, SCOPE)
  if not root and create then root = Instance.new("Folder"); root.Name = SCOPE; root:SetAttribute("TakkoAssetCreatedBy",SESSION); root.Parent = service end
  if not root and not create then return nil end
  assert(root and root:IsA("Folder"), "Missing or incompatible project scope")
  local folder = child(root, middle)
  if not folder and create then
    folder = Instance.new("Folder"); folder.Name = middle; folder:SetAttribute("TakkoAssetScope", SCOPE); folder:SetAttribute("TakkoAssetCreatedBy",SESSION); folder.Parent = root
  end
  if folder then assert(folder:IsA("Folder") and folder:GetAttribute("TakkoAssetScope") == SCOPE, "Unowned asset container") end
  return folder
end
local function owned(serviceName, middle, name)
  local folder = container(serviceName, middle, false)
  local item = folder and child(folder, name)
  if item then assert(item:GetAttribute(MARK) == TOKEN, "Owned asset identity changed") end
  return item
end
local function enumerate(root)
  local items = {root}
  for _, item in root:GetDescendants() do table.insert(items, item) end
  return items
end
local function vec(v) return {type="Vector3", value={v.X,v.Y,v.Z}} end
local function cf(v) return {type="CFrame", value={v:GetComponents()}} end
local function enum(v) return {type="Enum", enum=tostring(v.EnumType):gsub("Enum%.",""), value=v.Value} end
local function finite(n) return n == n and math.abs(n) < 1e7 end
local function bounds(parts)
  local lo = Vector3.new(math.huge, math.huge, math.huge)
  local hi = Vector3.new(-math.huge, -math.huge, -math.huge)
  for _, p in parts do
    for _, n in {p.CFrame:GetComponents()} do assert(finite(n), "Nonfinite geometry transform") end
    assert(p.Size.X > 0 and p.Size.Y > 0 and p.Size.Z > 0 and p.Size.Magnitude < 3500, "Invalid or excessive geometry size")
    for x=-1,1,2 do for y=-1,1,2 do for z=-1,1,2 do
      local corner = p.CFrame:PointToWorldSpace(p.Size * Vector3.new(x,y,z) / 2)
      lo = lo:Min(corner); hi = hi:Max(corner)
    end end end
  end
  local span = hi-lo
  assert(finite(span.X) and finite(span.Y) and finite(span.Z), "No finite geometry bounds")
  local extent = math.max(span.X,span.Y,span.Z)
  assert(extent > 0.001 and extent <= 2000, "Excessive or degenerate asset bounds")
  return (lo+hi)/2, extent
end
local function scan(root, kind)
  local items, parts, sounds, reasons, decals = enumerate(root), {}, {}, {}, {}
  local scripts, unsupported = 0, 0
  local preservationLimited=false
  local function preservation(reason) preservationLimited=true;table.insert(reasons,reason) end
  if #items > 300 then table.insert(reasons, "Asset exceeds 300 instances") end
  local allowed = {Folder=true,Model=true,Part=true,MeshPart=true,Sound=true,Decal=true}
  for _, item in items do
    if item:IsA("LuaSourceContainer") then scripts += 1 end
    if not allowed[item.ClassName] then unsupported += 1; table.insert(reasons, "Unsupported or executable class: " .. item.ClassName) end
    if not item.Archivable then preservation("Nonarchivable content cannot be preserved") end
    if item:IsA("BasePart") then
      table.insert(parts,item)
      if item.MaterialVariant ~= "" then preservation("External MaterialVariant cannot be preserved") end
      if item.CustomPhysicalProperties ~= nil then preservation("CustomPhysicalProperties cannot be serialized") end
      if item.CollisionGroup ~= "Default" then preservation("External collision group cannot be preserved") end
      if item:IsA("MeshPart") and item.MeshId == "" then table.insert(reasons,"MeshPart lacks mesh identity") end
    elseif item.ClassName=="Decal" then
      table.insert(decals,item)
      if not item.Texture:match("^rbxassetid://%d+$") and not item.Texture:match("^https?://www%.roblox%.com/asset/%?id=%d+$") then table.insert(reasons,"Decal lacks supported image content identity") end
      if item~=root and not item.Parent:IsA("BasePart") then table.insert(reasons,"Decal has no renderable BasePart parent") end
      -- Ordinary decals only: compare public advanced features against a native
      -- default with the same Texture, so aliases are not mistaken for new maps.
      local baseline=Instance.new("Decal"); baseline.Texture=item.Texture
      for _,key in {"ColorMap","Rotation","UVOffset","UVScale","EmissiveStrength","EmissiveTint","LocalTransparencyModifier","Shiny","Specular"} do
        local readable, value=pcall(function() return item[key] end)
        if readable then
          local defaultReadable, default=pcall(function() return baseline[key] end)
          if not defaultReadable or value~=default then preservation("Unsupported nondefault Decal property: "..key) end
        end
      end
      baseline:Destroy()
    elseif item:IsA("Sound") then
      table.insert(sounds,item)
      if item.SoundId == "" then table.insert(reasons,"Sound lacks content identity") end
      if item.SoundGroup ~= nil or item.PlaybackRegionsEnabled then preservation("Unsupported Sound routing or playback region") end
    end
  end
  if scripts > 0 then table.insert(reasons, "Embedded executable behavior requires a reviewed complete-asset import path") end
  local embeddedMedia=kind~="Audio" and #sounds>0
  if embeddedMedia then table.insert(reasons,"Embedded media requires per-dependency playback and listening verification before complete-asset reuse") end
  if kind == "Audio" then
    if #sounds ~= 1 or #parts ~= 0 then table.insert(reasons,"Audio import must contain exactly one Sound and no geometry") end
  elseif kind=="Image" then
    if #decals~=1 or #sounds~=0 or not ((root.ClassName=="Decal" and #items==1) or (root.ClassName=="Part" and #items==2 and #parts==1)) then table.insert(reasons,"Image import must contain one Decal and only its owned backing Part") end
    if #decals==1 and decals[1].Transparency>=1 then table.insert(reasons,"Image decal has no visible content") end
  elseif #parts == 0 then table.insert(reasons,"Model import has no geometry") end
  if kind == "MeshPart" then
    local meshes = 0; for _, p in parts do if p:IsA("MeshPart") then meshes += 1 end end
    if meshes == 0 then table.insert(reasons,"MeshPart search result contains no MeshPart") end
  end
  local center, extent = Vector3.zero, 1
  if #reasons == 0 and #parts > 0 then
    local ok, a, b = pcall(bounds, parts)
    if not ok then table.insert(reasons,tostring(a)) else center=a; extent=b end
  end
  local capabilityBlock=nil
  if scripts>0 then capabilityBlock={kind="interactive_asset_requires_review",reason="Imported asset contains embedded code; complete asset reuse requires script and dependency review, not procedural replacement"}
  elseif embeddedMedia then capabilityBlock={kind="interactive_asset_requires_review",reason="Embedded media requires per-dependency playback and listening verification before complete-asset reuse"}
  elseif preservationLimited or unsupported>0 or #items>300 then capabilityBlock={kind="unsupported_structure",reason="Imported asset exceeds the supported property, class or instance structure; complete asset reuse requires a supported structure contract"} end
  local distinct,seen={},{}
  for _,reason in reasons do if not seen[reason] then seen[reason]=true;table.insert(distinct,reason) end end
  return items, parts, sounds, distinct, scripts, center, extent, capabilityBlock
end
local function boundedText(value, count)
  local text=tostring(value)
  local ok, offset=pcall(utf8.offset,text,count+1)
  if not ok then return "[unreadable UTF-8 text]" end
  return offset and text:sub(1,offset-1) or text
end
local function inertAudit(items, scriptCount)
  local result={mode="inert_quarantine_static_inspection",sourceOrigin="ScriptEditorService:GetEditorSource",dependencyAnalysis="lexical_literals_only_not_execution_proof",executed=false,instanceLimit=300,sourceLimit=8,sourceByteLimit=65536,
    instanceListTruncated=#items>300,sourceListTruncated=scriptCount>8,sourceBytesReturned=0,nodes={},sources={}}
  local indices={};for index,item in items do indices[item]=index end
  for index,item in items do
    if index<=300 then local name=boundedText(item.Name,120);table.insert(result.nodes,{index=index,parentIndex=indices[item.Parent] or 0,name=name,nameTruncated=name~=item.Name,className=item.ClassName}) end
    if item:IsA("LuaSourceContainer") and #result.sources<8 then
      local row={index=index,className=item.ClassName,readable=false,sourceOmittedForLimit=false,literalDependencies={},dependencyListTruncated=false}
      if item:IsA("BaseScript") then local ok,value=pcall(function() return item.Disabled end);if ok then row.disabled=value end end
      local contextOK,context=pcall(function() return item.RunContext end);if contextOK and context~=nil then row.runContext=boundedText(context,100) end
      local ok,source=pcall(function() return game:GetService("ScriptEditorService"):GetEditorSource(item) end)
      if ok and type(source)=="string" then
        row.readable=true;row.sourceBytes=#source
        if result.sourceBytesReturned+#source<=65536 then
          row.source=source;result.sourceBytesReturned+=#source
          local function literals(pattern,kind)
            for value in source:gmatch(pattern) do
              if #row.literalDependencies>=64 then row.dependencyListTruncated=true;break end
              local bounded=boundedText(value,120);if bounded~=value then row.dependencyListTruncated=true end
              table.insert(row.literalDependencies,{kind=kind,value=bounded})
            end
          end
          -- Lexical observations only: comments/dead code can match and dynamic dependencies may be absent.
          literals([[require%s*%(%s*(%d+)]],"require_asset_id")
          literals([[rbxassetid://(%d+)]],"content_asset_id")
          literals([[GetService%s*%(%s*["']([^"']+)]],"service")
          literals([[Instance%.new%s*%(%s*["']([^"']+)]],"constructed_class")
        else row.sourceOmittedForLimit=true end
      else row.readError=boundedText(source or "Source could not be read",250) end
      table.insert(result.sources,row)
    end
  end
  return result
end
local function preload(items)
  local finished, failed = false, false
  task.spawn(function()
    local ok = pcall(function()
      game:GetService("ContentProvider"):PreloadAsync(items, function(_, status)
        if status ~= Enum.AssetFetchStatus.Success then failed = true end
      end)
    end)
    failed = failed or not ok; finished = true
  end)
  local deadline = os.clock()+8
  while not finished and os.clock()<deadline do task.wait(0.05) end
  return finished and not failed
end
local function normalizeNames(root)
  local function walk(parent)
    for index, item in parent:GetChildren() do
      item.Name = item.ClassName .. "_" .. tostring(index)
      walk(item)
    end
  end
  walk(root)
end
local function mountImage(root)
  assert(root.ClassName=="Decal", "Image insertion did not produce a Decal")
  local surface=Instance.new("Part"); surface.Name="Imported"; surface.Size=Vector3.new(MAXSIZE,MAXSIZE,math.min(0.05,MAXSIZE/10))
  surface.Anchored=true; surface.CanCollide=false; surface.CanTouch=false; surface.CastShadow=false
  surface.Color=Color3.new(1,1,1); surface.Material=Enum.Material.SmoothPlastic
  surface.CFrame=CFrame.new(0,0,0); surface:SetAttribute(MARK,TOKEN); surface.Parent=root.Parent
  root.Name="Image"; root.Face=Enum.NormalId.Back; root.Parent=surface
  return surface
end
local function moveGeometry(parts, center, destination, scale)
  for _, p in parts do
    local rotation = p.CFrame - p.Position
    p.Size *= scale
    p.CFrame = CFrame.new(destination+(p.Position-center)*scale) * rotation
    p.Anchored = true
    p.AssemblyLinearVelocity = Vector3.zero; p.AssemblyAngularVelocity = Vector3.zero
  end
end
local function serialize(root, rootPath)
  local paths, items, scene = {}, enumerate(root), {}
  paths[root] = rootPath
  local function assign(parent)
    for _,item in parent:GetChildren() do paths[item]=paths[parent].."/"..item.Name; assign(item) end
  end
  assign(root)
  for _, item in items do
    local props = {Archivable=true}
    if item:IsA("BasePart") then
      props.CFrame=cf(item.CFrame); props.Size=vec(item.Size)
      props.Color={type="Color3",value={item.Color.R,item.Color.G,item.Color.B}}
      props.Material=enum(item.Material); props.Anchored=true
      for _, key in {"Transparency","Reflectance","CanCollide","CanQuery","CanTouch","CastShadow","Massless"} do props[key]=item[key] end
      props.PivotOffset=cf(item.PivotOffset)
      for _,key in {"TopSurface","BottomSurface","LeftSurface","RightSurface","FrontSurface","BackSurface"} do props[key]=enum(item[key]) end
      if item:IsA("Part") then props.Shape=enum(item.Shape) end
      if item:IsA("MeshPart") then props.MeshId=item.MeshId; props.TextureID=item.TextureID; props.DoubleSided=item.DoubleSided end
    elseif item:IsA("Model") then
      props.WorldPivot=cf(item.WorldPivot)
      if item.PrimaryPart then assert(paths[item.PrimaryPart],"External PrimaryPart reference"); props.PrimaryPart={type="Ref",path=paths[item.PrimaryPart]} end
    elseif item.ClassName=="Decal" then
      props.Texture=item.Texture; props.Face=enum(item.Face)
      props.Color3={type="Color3",value={item.Color3.R,item.Color3.G,item.Color3.B}}
      props.Transparency=item.Transparency; props.ZIndex=item.ZIndex; props.AutoLocalize=item.AutoLocalize
    elseif item:IsA("Sound") then
      for _, key in {"SoundId","Volume","PlaybackSpeed","Looped","RollOffMinDistance","RollOffMaxDistance"} do props[key]=item[key] end
      props.RollOffMode=enum(item.RollOffMode); props.Playing=false; props.PlayOnRemove=false
    elseif not item:IsA("Folder") then error("Unserializable class: " .. item.ClassName) end
    table.insert(scene,{path=paths[item],className=item.ClassName,properties=props})
  end
  return scene
end
`;

export class StudioAssetAdapter implements AssetAdapter {
  readonly identity = "roblox-studio-mcp-scoped-assets-v1";
  private readonly entries = new Map<string, Entry>();
  private readonly discovered = new Map<string, AssetCandidate>();
  private readonly preparedIntegrations = new Map<
    string,
    {
      component: ComponentReference;
      need: AssetNeed;
      parent: AssetCandidate;
      token: string;
      preparedHash: string;
    }
  >();
  private componentInputHash?: string;
  private readonly attempts = new Set<string>();
  private busy = false;
  private poisoned = false;
  private readonly session = randomUUID();
  private readonly evidenceDirectory?: string;
  private readonly audioCapture?: StudioAudioCapture;
  readonly studioId: string;
  readonly scope: string;
  constructor(
    private readonly client: StudioAssetClient,
    options: {
      studioId: string;
      scope: string;
      evidenceDirectory?: string;
      audioCapture?: StudioAudioCapture;
    },
  ) {
    if (!options.studioId?.trim() || !identifier.test(options.scope))
      throw Error(
        "Explicit Studio identity and safe project scope are required",
      );
    this.studioId = options.studioId;
    this.scope = options.scope;
    this.audioCapture = options.audioCapture;
    this.evidenceDirectory = options.evidenceDirectory
      ? path.resolve(options.evidenceDirectory)
      : undefined;
  }
  private async exclusive<T>(
    work: () => Promise<T>,
    cleanup = false,
  ): Promise<T> {
    if (this.busy)
      throw new StudioAssetError(
        "Concurrent asset operations are not allowed",
        [],
        "none",
      );
    if (this.poisoned && !cleanup)
      throw new StudioAssetError(
        "Adapter halted after uncertain effects; reconcile before another run",
        [],
        "unknown",
      );
    this.busy = true;
    try {
      return await work();
    } finally {
      this.busy = false;
    }
  }
  private async call(
    name: string,
    args: Record<string, unknown>,
    signal: AbortSignal,
    receipts: AssetReceipt[],
    mutation = false,
  ) {
    signal.throwIfAborted();
    let raw: any;
    try {
      raw = await this.client.callTool(name, args, signal);
    } catch (error) {
      receipts.push({
        operation: name,
        at: new Date().toISOString(),
        studioId: this.studioId,
        data: {
          error: error instanceof Error ? error.message : String(error),
          outcome: (error as any)?.outcome ?? "unknown",
        },
      });
      if (mutation) this.poisoned = true;
      throw new StudioAssetError(
        name + " failed; no automatic retry",
        [...receipts],
        mutation ? "unknown" : "none",
      );
    }
    receipts.push({
      operation: name,
      at: new Date().toISOString(),
      studioId: this.studioId,
      data: raw,
    });
    if (raw?.isError) {
      if (mutation) this.poisoned = true;
      throw new StudioAssetError(
        name + " returned an error",
        [...receipts],
        mutation ? "unknown" : "none",
      );
    }
    return raw;
  }
  private async edit(signal: AbortSignal, receipts: AssetReceipt[]) {
    const studios = unpack(
      await this.call("list_roblox_studios", {}, signal, receipts),
    );
    if (
      !Array.isArray(studios?.studios) ||
      !studios.studios.some((s: any) => s.id === this.studioId)
    )
      throw new StudioAssetError(
        "Selected Studio is not connected",
        [...receipts],
        "none",
      );
    const state = unpack(
      await this.call(
        "get_studio_state",
        { studio_id: this.studioId },
        signal,
        receipts,
      ),
    );
    if (!isVerifiedEditState(state))
      throw new StudioAssetError(
        "Verified Edit mode required; Studio state was not changed",
        [...receipts],
        "none",
      );
  }
  private code(entry: Entry, body: string) {
    return `local SCOPE=${quote(this.scope)}\nlocal SESSION=${quote(this.session)}\nlocal TOKEN=${quote(entry.token)}\nlocal ATTEMPT=${quote(entry.attempt)}\nlocal NEED=${quote(entry.need.id)}\nlocal KIND=${quote(entry.need.kind)}\nlocal AUDIO_CAPTURE=${!!this.audioCapture}\nlocal EXPECTPLACED=${entry.placed}\nlocal MAXSIZE=${entry.need.maxSize}\nlocal DEST=Vector3.new(${entry.need.position.join(",")})\n${LUA_COMMON}\n${body}`;
  }
  private async execute(
    entry: Entry,
    operation: string,
    body: string,
    signal: AbortSignal,
    receipts: AssetReceipt[],
  ) {
    receipts.push({
      operation: "ownership_intent",
      at: new Date().toISOString(),
      studioId: this.studioId,
      data: {
        operation,
        sessionId: this.session,
        token: entry.token,
        scope: this.scope,
        stagingPath: `ServerStorage/${this.scope}/AssetStaging/${entry.attempt}`,
        previewPath: `Workspace/${this.scope}/AssetPreviews/${entry.attempt}`,
        finalPath: `${entry.need.kind === "Audio" && !this.audioCapture ? "ReplicatedStorage" : "Workspace"}/${this.scope}/Assets/${entry.need.id}`,
      },
    });
    await this.edit(signal, receipts);
    const raw = await this.call(
      "execute_luau",
      {
        studio_id: this.studioId,
        datamodel_type: "Edit",
        code: this.code(entry, body),
      },
      signal,
      receipts,
      true,
    );
    const parsed = snapshotSchema.safeParse(unpack(raw));
    if (!parsed.success || parsed.data.operation !== operation) {
      this.poisoned = true;
      throw new StudioAssetError(
        "Unrecognized native asset receipt; effects require reconciliation",
        [...receipts],
        "unknown",
      );
    }
    return parsed.data;
  }
  private async capture(
    entry: Entry,
    center: number[],
    size: number,
    signal: AbortSignal,
    receipts: AssetReceipt[],
  ) {
    await this.edit(signal, receipts);
    const distance = Math.max(5, size * 1.8);
    const raw = await this.call(
      "screen_capture",
      {
        studio_id: this.studioId,
        capture_id: "asset_" + entry.token.replaceAll("-", ""),
        camera_position: [
          center[0] + distance,
          center[1] + distance * 0.65,
          center[2] + distance,
        ],
        look_at_position: center,
      },
      signal,
      receipts,
      true,
    );
    const image = imageFrom(raw);
    if (!image) {
      this.poisoned = true;
      throw new StudioAssetError(
        "Native screenshot image missing",
        [...receipts],
        "owned",
      );
    }
    if (this.evidenceDirectory) {
      const [header, data] = image.split(","),
        mime = header.slice(5, header.indexOf(";"));
      const bytes = Buffer.from(data, "base64"),
        sha256 = createHash("sha256").update(bytes).digest("hex");
      const extension =
        mime === "image/jpeg" ? "jpg" : mime === "image/webp" ? "webp" : "png";
      fs.mkdirSync(this.evidenceDirectory, { recursive: true });
      const captureFile = path.join(
        this.evidenceDirectory,
        sha256 + "." + extension,
      );
      if (fs.existsSync(captureFile)) {
        if (!fs.readFileSync(captureFile).equals(bytes))
          throw new StudioAssetError(
            "Capture evidence filename collision",
            receipts,
            "owned",
          );
      } else fs.writeFileSync(captureFile, bytes, { flag: "wx" });
      receipts.push({
        operation: "capture_file",
        at: new Date().toISOString(),
        studioId: this.studioId,
        data: { captureFile, sha256, mime, bytes: bytes.length },
      });
    }
    return image;
  }
  private async captureAudio(
    entry: Entry,
    placed: boolean,
    signal: AbortSignal,
    receipts: AssetReceipt[],
  ): Promise<{ audio: StudioAudioEvidence; playbackObserved: true }> {
    if (!this.audioCapture)
      throw new StudioAssetError(
        "Native Studio audio capture unavailable",
        receipts,
        "owned",
      );
    try {
      const audio = await auditionStudioAudio({
        client: this.client,
        capture: this.audioCapture,
        studioId: this.studioId,
        candidateId: entry.candidate.id,
        token: entry.token,
        scope: this.scope,
        target: [
          this.scope,
          placed ? "Assets" : "AssetPreviews",
          placed ? entry.need.id : entry.attempt,
        ],
        receipts,
        signal,
      });
      const wav = validateStudioAudio(audio, {
        studioId: this.studioId,
        candidateId: entry.candidate.id,
        token: entry.token,
      });
      receipts.push({
        operation: "audio_capture",
        at: new Date().toISOString(),
        studioId: this.studioId,
        data: {
          source: audio.source,
          sha256: wav.sha256,
          durationMs: wav.durationMs,
          playbackObserved: true,
        },
      });
      return { audio, playbackObserved: true };
    } catch (error) {
      if (error instanceof AudioRuntimeError)
        throw new StudioAssetError(
          error.message,
          receipts,
          error.effects,
          error.classification,
        );
      throw error;
    }
  }
  async search(needInput: AssetNeed, query: string, signal: AbortSignal) {
    return this.exclusive(async () => {
      const need = assetNeedSchema.parse(needInput),
        receipts: AssetReceipt[] = [];
      if (
        !(studioAssetCapabilities.search as readonly string[]).includes(
          need.kind,
        )
      )
        throw new StudioAssetError(
          need.kind === "Animation"
            ? "Official Creator Store search does not support Animation; Model titles are not Animation IDs"
            : "This asset type has no supported scoped import contract",
          [],
          "none",
        );
      if (!query.trim() || query.length > 200)
        throw Error("Bounded nonempty query required");
      const studios = unpack(
        await this.call("list_roblox_studios", {}, signal, receipts),
      );
      if (!studios?.studios?.some((s: any) => s.id === this.studioId))
        throw new StudioAssetError(
          "Selected Studio is not connected",
          receipts,
          "none",
        );
      const raw = await this.call(
        "search_asset",
        {
          studio_id: this.studioId,
          scope: "creator_store",
          priceFilter: "free",
          maxResults: 20,
          query,
          assetType: need.kind,
        },
        signal,
        receipts,
      );
      const result = unpack(raw);
      if (result?.scope !== "creator_store" || !Array.isArray(result.results))
        throw new StudioAssetError(
          "Unsupported Creator Store search response",
          receipts,
          "none",
        );
      const candidates: AssetCandidate[] = [],
        seen = new Set<string>();
      for (const row of result.results) {
        if (
          typeof row.assetId !== "string" ||
          !/^[1-9]\d*$/.test(row.assetId) ||
          row.assetType !== need.kind ||
          row.source !== "creator_store" ||
          row.isFree !== true ||
          row.priceCents !== 0 ||
          this.discovered.get(need.id + ":" + row.assetId)?.source ===
            "creator_store_component" ||
          typeof row.creatorName !== "string" ||
          !row.creatorName.trim() ||
          typeof row.name !== "string" ||
          !row.name.trim() ||
          seen.has(row.assetId)
        )
          continue;
        const sourceUrl =
          "https://create.roblox.com/store/asset/" + row.assetId;
        if (
          row.creatorStoreUrl !== sourceUrl &&
          !String(row.creatorStoreUrl ?? "").startsWith(sourceUrl + "/")
        )
          continue;
        const candidate: AssetCandidate = {
          id: row.assetId,
          name: row.name.slice(0, 200),
          kind: need.kind,
          creator: row.creatorName,
          sourceUrl,
          price: 0,
          source: "creator_store",
          ...(typeof row.description === "string" && row.description.trim()
            ? { description: row.description.slice(0, 1000) }
            : {}),
        };
        candidates.push(candidate);
        seen.add(row.assetId);
        this.discovered.set(
          need.id + ":" + row.assetId,
          structuredClone(candidate),
        );
        if (candidates.length === 20) break;
      }
      return { candidates, receipts };
    });
  }
  async inspect(
    needInput: AssetNeed,
    candidate: AssetCandidate,
    attemptId: string,
    signal: AbortSignal,
  ): Promise<AssetInspection> {
    return this.exclusive(async () => {
      const need = assetNeedSchema.parse(needInput),
        receipts: AssetReceipt[] = [];
      if (
        !attemptId.trim() ||
        attemptId.length > 240 ||
        this.attempts.has(attemptId)
      )
        throw new StudioAssetError(
          "Fresh safe attempt ID required",
          [],
          "none",
        );
      if (
        !isDeepStrictEqual(
          candidate,
          this.discovered.get(need.id + ":" + candidate.id),
        ) ||
        candidate.kind !== need.kind
      )
        throw new StudioAssetError(
          "Candidate was not returned by this adapter's scoped search or component discovery",
          [],
          "none",
        );
      const entry: Entry = {
        token: randomUUID(),
        attempt:
          "attempt_" +
          createHash("sha256").update(attemptId).digest("hex").slice(0, 24),
        need: structuredClone(need),
        candidate: structuredClone(candidate),
        placed: false,
      };
      this.attempts.add(attemptId);
      this.entries.set(entry.token, entry);
      try {
        const prepared = await this.execute(
          entry,
          "prepare",
          `
local folder = container("ServerStorage","AssetStaging",true)
assert(not child(folder, ATTEMPT),"Staging target already exists")
local stage = Instance.new("Folder"); stage.Name=ATTEMPT; stage:SetAttribute(MARK,TOKEN); stage.Parent=folder
return reply("prepare",true)
`,
          signal,
          receipts,
        );
        if (!prepared.ok)
          throw new StudioAssetError(
            "Staging preparation rejected",
            receipts,
            "owned",
          );
        await this.edit(signal, receipts);
        await this.call(
          "insert_asset",
          {
            studio_id: this.studioId,
            assetId: candidate.id,
            assetType: candidate.kind,
            assetName: "Imported",
            parentPath: `ServerStorage.${this.scope}.AssetStaging.${entry.attempt}`,
          },
          signal,
          receipts,
          true,
        );
        const snapshot = await this.execute(
          entry,
          "inspect",
          `
local stage=assert(owned("ServerStorage","AssetStaging",ATTEMPT),"Missing quarantine")
assert(#stage:GetChildren()==1,"Import did not produce exactly one quarantined root")
local root=stage:GetChildren()[1]
${componentArchiveLuau}
local items,parts,sounds,reasons,scripts,center,extent,capabilityBlock=scan(root,KIND)
local audit=capabilityBlock and inertAudit(items,scripts) or nil
local componentArchive=capabilityBlock and KIND=="Model" and captureComponentArchive(root) or nil
local componentTransfer=nil
if capabilityBlock then
  local json=Http:JSONEncode({componentArchive=componentArchive,inertAudit=audit})
  assert(#json<=8*1024*1024,"Component evidence exceeds transfer bound")
  local encoding=game:GetService("EncodingService")
  local encoded=buffer.tostring(encoding:Base64Encode(buffer.fromstring(json)))
  local digest=encoding:ComputeStringHash(encoded,Enum.HashAlgorithm.Sha256):gsub(".",function(c) return string.format("%02x",string.byte(c)) end)
  assert(not child(stage,"_TakkoComponentCapture"),"Component capture slot already occupied")
  local cache=Instance.new("Folder");cache.Name="_TakkoComponentCapture"
  cache:SetAttribute(MARK,TOKEN);cache:SetAttribute("Sha256",digest);cache:SetAttribute("EncodedBytes",#encoded);cache.Parent=stage
  for offset=0,#encoded-1,32768 do
    local chunk=Instance.new("StringValue");chunk.Name="Chunk_"..tostring(offset/32768+1)
    chunk.Value=string.sub(encoded,offset+1,math.min(offset+32768,#encoded));chunk.Parent=cache
  end
  componentTransfer={encodedBytes=#encoded,jsonBytes=#json,sha256=digest,chunkSize=32768}
  audit=nil;componentArchive=nil
end
local loaded=false
if #reasons==0 then
  if KIND=="Image" and root.ClassName=="Decal" then
    root=mountImage(root)
    items,parts,sounds,reasons,scripts,center,extent=scan(root,KIND)
  end
  normalizeNames(root); root.Name="Imported"; root:SetAttribute(MARK,TOKEN)
  for _, p in parts do p.Anchored=true end
  for _, sound in sounds do sound.PlayOnRemove=false; sound:Stop() end
  loaded=preload(items)
  assert(not Run:IsRunning(),"Edit mode changed while loading content")
  if not loaded then table.insert(reasons,"Native content preload failed or timed out") end
  for _, sound in sounds do if not sound.IsLoaded or sound.TimeLength<=0 then table.insert(reasons,"Sound content unavailable"); loaded=false end end
end
return reply("inspect",#reasons==0,{reasons=reasons,functional={contentLoaded=loaded,instanceCount=#items,scriptCount=scripts},center={center.X,center.Y,center.Z},size=extent,capabilityBlock=capabilityBlock,inertAudit=audit,componentArchive=componentArchive,componentTransfer=componentTransfer})
`,
          signal,
          receipts,
        );
        const functional = functionalSchema.parse(snapshot.functional);
        if (snapshot.componentTransfer) {
          const transfer = snapshot.componentTransfer,
            chunks: string[] = [];
          let transferComplete = false;
          try {
            for (
              let offset = 0;
              offset < transfer.encodedBytes;
              offset += transfer.chunkSize
            ) {
              const length = Math.min(
                transfer.chunkSize,
                transfer.encodedBytes - offset,
              );
              // Read only: a failed/late read cannot create a second mutation.
              // One aggregate receipt avoids overflowing the pipeline receipt bound
              // and repeating source payloads for every transferred chunk.
              const raw = await this.call(
                "execute_luau",
                {
                  studio_id: this.studioId,
                  datamodel_type: "Edit",
                  code: this.code(
                    entry,
                    `
local stage=assert(owned("ServerStorage","AssetStaging",ATTEMPT),"Missing quarantine")
local cache=assert(child(stage,"_TakkoComponentCapture"),"Missing component capture")
assert(cache:IsA("Folder") and cache:GetAttribute(MARK)==TOKEN,"Component capture ownership changed")
assert(cache:GetAttribute("Sha256")==${quote(transfer.sha256)} and cache:GetAttribute("EncodedBytes")==${transfer.encodedBytes},"Component capture identity changed")
local chunk=assert(child(cache,"Chunk_${offset / transfer.chunkSize + 1}"),"Missing component chunk")
assert(chunk:IsA("StringValue") and #chunk.Value==${length},"Invalid component chunk")
return reply("component_chunk",true,{offset=${offset},chunk=chunk.Value})`,
                  ),
                },
                signal,
                [],
                false,
              );
              const part = snapshotSchema.parse(unpack(raw));
              if (
                part.operation !== "component_chunk" ||
                !part.ok ||
                part.offset !== offset ||
                typeof part.chunk !== "string" ||
                part.chunk.length !== length
              )
                throw new StudioAssetError(
                  "Component chunk did not match requested range",
                  receipts,
                  "owned",
                );
              chunks.push(part.chunk);
            }
            const payload = z
              .object({
                componentArchive: componentArchiveSnapshotSchema.optional(),
                inertAudit: inertAuditSchema,
              })
              .strict()
              .parse(decodeComponentTransfer(transfer, chunks));
            snapshot.inertAudit = payload.inertAudit;
            snapshot.componentArchive = payload.componentArchive;
            transferComplete = true;
          } finally {
            receipts.push({
              operation: "component_transfer",
              at: new Date().toISOString(),
              studioId: this.studioId,
              data: {
                token: entry.token,
                candidateId: entry.candidate.id,
                ...transfer,
                chunksRead: chunks.length,
                verified: transferComplete,
                readOnly: true,
              },
            });
          }
        }
        if (snapshot.componentArchive) {
          const component = persistComponentArchive(
            snapshot.componentArchive,
            this.evidenceDirectory,
          );
          // Keep binary/source payloads in immutable sidecars, not repeated in model/event context.
          delete snapshot.componentArchive;
          snapshot.component = component;
          receipts.push({
            operation: "component_archive",
            at: new Date().toISOString(),
            studioId: this.studioId,
            data: {
              token: entry.token,
              candidateId: entry.candidate.id,
              ...component,
            },
          });
        }
        if (snapshot.capabilityBlock && !snapshot.inertAudit)
          throw new StudioAssetError(
            "Capability-blocked import lacks its bounded inert inspection",
            receipts,
            "owned",
          );
        if (snapshot.inertAudit) {
          const sources = snapshot.inertAudit.sources;
          const sourceBytes = sources.reduce(
            (total, source) =>
              total +
              (source.source === undefined
                ? 0
                : Buffer.byteLength(source.source, "utf8")),
            0,
          );
          if (
            sourceBytes !== snapshot.inertAudit.sourceBytesReturned ||
            sourceBytes > 65536 ||
            sources.some(
              (source) =>
                source.source !== undefined &&
                (!source.readable ||
                  source.sourceOmittedForLimit ||
                  Buffer.byteLength(source.source, "utf8") !==
                    source.sourceBytes),
            )
          )
            throw new StudioAssetError(
              "Inert source inspection byte bounds do not match native receipt",
              receipts,
              "owned",
            );
          // Preserve native source exactly and add a local digest for audit comparison.
          snapshot.inertAudit = {
            ...snapshot.inertAudit,
            sources: sources.map((source) => ({
              ...source,
              ...(source.source === undefined
                ? {}
                : {
                    sha256: createHash("sha256")
                      .update(source.source, "utf8")
                      .digest("hex"),
                  }),
            })),
          };
          const auditBytes = Buffer.from(
            JSON.stringify(
              {
                kind: "takko-inert-asset-audit-v1",
                studioId: this.studioId,
                scope: this.scope,
                token: entry.token,
                candidate: entry.candidate,
                capabilityBlock: snapshot.capabilityBlock,
                audit: snapshot.inertAudit,
              },
              null,
              2,
            ),
            "utf8",
          );
          const sha256 = createHash("sha256").update(auditBytes).digest("hex");
          let auditFile: string | undefined;
          if (this.evidenceDirectory) {
            fs.mkdirSync(this.evidenceDirectory, { recursive: true });
            auditFile = path.join(
              this.evidenceDirectory,
              sha256 + ".audit.json",
            );
            if (fs.existsSync(auditFile)) {
              if (!fs.readFileSync(auditFile).equals(auditBytes))
                throw new StudioAssetError(
                  "Inert audit evidence filename collision",
                  receipts,
                  "owned",
                );
            } else fs.writeFileSync(auditFile, auditBytes, { flag: "wx" });
          }
          receipts.push({
            operation: "inert_asset_audit",
            at: new Date().toISOString(),
            studioId: this.studioId,
            data: {
              token: entry.token,
              candidateId: entry.candidate.id,
              sha256,
              bytes: auditBytes.length,
              auditFile,
              persistence: auditFile
                ? "full_original_sources_in_sidecar"
                : "not_configured",
              sourceBytesReturned: sourceBytes,
            },
          });
        }
        let image: string | undefined;
        let audio: StudioAudioEvidence | undefined;
        const nativeSafe =
          !snapshot.capabilityBlock &&
          snapshot.ok &&
          functional.scriptCount === 0 &&
          functional.contentLoaded &&
          functional.instanceCount > 0 &&
          functional.instanceCount <= 300;
        if (nativeSafe && need.kind === "Audio" && this.audioCapture) {
          const preview = await this.execute(
            entry,
            "preview",
            `
local stage=assert(owned("ServerStorage","AssetStaging",ATTEMPT),"Missing quarantine")
local root=assert(child(stage,"Imported"),"Missing inspected audio")
assert(root:GetAttribute(MARK)==TOKEN,"Imported audio identity changed")
local _,_,sounds,reasons=scan(root,"Audio");assert(#reasons==0,table.concat(reasons,"; "))
local previews=container("Workspace","AssetPreviews",true)
assert(not child(previews,ATTEMPT),"Audio preview target exists")
local holder=Instance.new("Folder");holder.Name=ATTEMPT;holder:SetAttribute(MARK,TOKEN);holder.Parent=previews
local sound=sounds[1]:Clone();sound.PlayOnRemove=false;sound:Stop();sound.TimePosition=0
sound.Volume=0.65;sound.PlaybackSpeed=1;sound.Looped=false;sound.Parent=holder
local loaded=preload({sound});assert(not Run:IsRunning(),"Edit mode changed while loading audio")
return reply("preview",loaded and sound.IsLoaded and sound.TimeLength>0)
`,
            signal,
            receipts,
          );
          if (!preview.ok)
            throw new StudioAssetError(
              "Audio preview failed native loading",
              receipts,
              "owned",
            );
          const captured = await this.captureAudio(
            entry,
            false,
            signal,
            receipts,
          );
          audio = captured.audio;
          functional.playbackObserved = captured.playbackObserved;
        }
        if (nativeSafe && need.kind !== "Audio") {
          const preview = await this.execute(
            entry,
            "preview",
            `
local stage=assert(owned("ServerStorage","AssetStaging",ATTEMPT),"Missing quarantine")
local root=assert(child(stage,"Imported"),"Missing inspected root")
assert(root:GetAttribute(MARK)==TOKEN,"Imported identity changed")
local _,_,_,reasons=scan(root,KIND); assert(#reasons==0,table.concat(reasons,"; "))
local previews=container("Workspace","AssetPreviews",true)
assert(not child(previews,ATTEMPT),"Preview target exists")
local holder=Instance.new("Folder"); holder.Name=ATTEMPT; holder:SetAttribute(MARK,TOKEN); holder.Parent=previews
local copy=root:Clone(); copy.Name="Preview"; copy.Parent=holder
local _,parts,sounds,copyReasons,_,center,extent=scan(copy,KIND); assert(#copyReasons==0,table.concat(copyReasons,"; "))
local destination=Vector3.new(0,1000,0)
moveGeometry(parts,center,destination,math.min(1,MAXSIZE/extent))
for _, p in parts do p.CanCollide=false; p.CanTouch=false end
for _, sound in sounds do sound.PlayOnRemove=false; sound:Stop() end
return reply("preview",true,{center={0,1000,0},size=math.min(extent,MAXSIZE)})
`,
            signal,
            receipts,
          );
          if (!preview.ok || !preview.center || !preview.size)
            throw new StudioAssetError(
              "Preview not verified",
              receipts,
              "owned",
            );
          image = await this.capture(
            entry,
            preview.center,
            preview.size,
            signal,
            receipts,
          );
        }
        const inspection: AssetInspection = {
          candidate: structuredClone(candidate),
          token: entry.token,
          path: `ServerStorage/${this.scope}/AssetStaging/${entry.attempt}/Imported`,
          safe: nativeSafe,
          ...(snapshot.capabilityBlock
            ? { capabilityBlock: snapshot.capabilityBlock }
            : {}),
          reasons: snapshot.reasons,
          snapshot,
          functional,
          image,
          audio,
          receipts,
        };
        entry.inspection = structuredClone(inspection);
        return inspection;
      } catch (error) {
        let cleaned = false;
        this.poisoned = true;
        if (error instanceof StudioAssetError && error.effects === "unknown") {
          receipts.push({
            operation: "cleanup_deferred",
            at: new Date().toISOString(),
            studioId: this.studioId,
            data: {
              token: entry.token,
              reason:
                "Mutation outcome unknown; no cleanup sent while the original operation may still complete",
            },
          });
        } else {
          try {
            await this.cleanup(entry, AbortSignal.timeout(12000), receipts);
            cleaned = true;
          } catch (cleanupError) {
            receipts.push({
              operation: "cleanup_failed",
              at: new Date().toISOString(),
              studioId: this.studioId,
              data: String(cleanupError),
            });
          }
        }
        if (
          cleaned &&
          error instanceof StudioAssetError &&
          error.classification === "candidate_rejected"
        )
          this.poisoned = false;
        throw new StudioAssetError(
          error instanceof Error ? error.message : String(error),
          receipts,
          cleaned ? "none" : "unknown",
          error instanceof StudioAssetError
            ? error.classification
            : "infrastructure_failure",
        );
      }
    });
  }
  private authenticated(
    need: AssetNeed | undefined,
    inspection: AssetInspection,
  ) {
    const entry = this.entries.get(inspection.token);
    if (
      !entry ||
      !entry.inspection ||
      JSON.stringify(entry.inspection) !== JSON.stringify(inspection) ||
      (need &&
        JSON.stringify(assetNeedSchema.parse(need)) !==
          JSON.stringify(entry.need))
    )
      throw new StudioAssetError(
        "Unknown, changed or expired inspection token",
        [],
        entry ? "owned" : "none",
      );
    return entry;
  }
  /** Explicit inert derivative capture. This does not clear the inspection's
   * capability block, approve source, or make the component executable. */
  async captureRestrictedComponent(
    inspection: AssetInspection,
    inputHash: string,
    signal: AbortSignal,
  ) {
    return this.exclusive(async () => {
      const entry = this.authenticated(undefined, inspection);
      const receipts: AssetReceipt[] = [];
      if (
        !this.evidenceDirectory ||
        entry.placed ||
        entry.restrictionAttempted ||
        !/^[a-f0-9]{64}$/.test(inputHash)
      )
        throw new StudioAssetError(
          "Persisted original, fresh quarantine and context identity required",
          [],
          "owned",
        );
      const original = inspection.receipts.find(
        (r) => r.operation === "component_archive",
      )?.data as any;
      const transferReceipt = inspection.receipts.find(
        (r) => r.operation === "component_transfer",
      )?.data as any;
      const transfer = componentTransferSchema.parse({
        encodedBytes: transferReceipt?.encodedBytes,
        jsonBytes: transferReceipt?.jsonBytes,
        sha256: transferReceipt?.sha256,
        chunkSize: transferReceipt?.chunkSize,
      });
      if (
        original?.status !== "captured" ||
        !original.persisted ||
        typeof original.manifestFile !== "string" ||
        path.dirname(original.manifestFile) !== this.evidenceDirectory
      )
        throw new StudioAssetError(
          "Original archive must be retained before restriction",
          [],
          "owned",
        );
      const originalHashes = {
        archiveHash: original.sha256 as string,
        manifestHash: path.basename(original.manifestFile, ".component.json"),
      };
      readComponentOriginal(
        this.evidenceDirectory,
        originalHashes.archiveHash,
        originalHashes.manifestHash,
      );
      entry.restrictionAttempted = true;
      try {
        const snapshot = await this.execute(
          entry,
          "component_restrict",
          `
local stage=assert(owned("ServerStorage","AssetStaging",ATTEMPT),"Missing quarantine")
local root=assert(child(stage,"Imported"),"Missing original import")
local cache=assert(child(stage,"_TakkoComponentCapture"),"Missing original capture")
assert(cache:IsA("Folder") and cache:GetAttribute(MARK)==TOKEN,"Original capture ownership changed")
assert(cache:GetAttribute("Sha256")==${quote(transfer.sha256)} and cache:GetAttribute("EncodedBytes")==${transfer.encodedBytes},"Original capture identity changed")
local chunks={}
for index=1,${Math.ceil(transfer.encodedBytes / transfer.chunkSize)} do
  local chunk=assert(child(cache,"Chunk_"..index),"Missing original chunk")
  assert(chunk:IsA("StringValue"),"Invalid original chunk");table.insert(chunks,chunk.Value)
end
local encoded=table.concat(chunks)
local encoding=game:GetService("EncodingService")
local function hash(value) return encoding:ComputeStringHash(value,Enum.HashAlgorithm.Sha256):gsub(".",function(c) return string.format("%02x",string.byte(c)) end) end
assert(#encoded==${transfer.encodedBytes} and hash(encoded)==${quote(transfer.sha256)},"Original capture bytes changed")
local original=Http:JSONDecode(buffer.tostring(encoding:Base64Decode(buffer.fromstring(encoded)))).componentArchive
assert(not child(stage,"_TakkoRestrictedCapture"),"Restriction already attempted")
${componentArchiveLuau}
${componentRestrictionLuau}
local ok,payload=pcall(function() return restrictComponentArchive(root,original) end)
if not ok then return reply("component_restrict",false,{reasons={tostring(payload)}}) end
local json=Http:JSONEncode(payload)
assert(#json<=8*1024*1024,"Restricted evidence exceeds transfer bound")
local output=buffer.tostring(encoding:Base64Encode(buffer.fromstring(json)))
local digest=hash(output)
local retained=Instance.new("Folder");retained.Name="_TakkoRestrictedCapture";retained:SetAttribute(MARK,TOKEN)
retained:SetAttribute("Sha256",digest);retained:SetAttribute("EncodedBytes",#output);retained.Parent=stage
for offset=0,#output-1,32768 do
  local chunk=Instance.new("StringValue");chunk.Name="Chunk_"..tostring(offset/32768+1)
  chunk.Value=string.sub(output,offset+1,math.min(offset+32768,#output));chunk.Parent=retained
end
return reply("component_restrict",true,{componentTransfer={encodedBytes=#output,jsonBytes=#json,sha256=digest,chunkSize=32768}})
`,
          signal,
          receipts,
        );
        if (!snapshot.ok || !snapshot.componentTransfer)
          throw Error(
            "Restricted capture failed: " + snapshot.reasons.join("; "),
          );
        const output = snapshot.componentTransfer;
        const chunks: string[] = [];
        let verified = false;
        let payload: unknown;
        try {
          for (
            let offset = 0;
            offset < output.encodedBytes;
            offset += output.chunkSize
          ) {
            const length = Math.min(
              output.chunkSize,
              output.encodedBytes - offset,
            );
            const raw = await this.call(
              "execute_luau",
              {
                studio_id: this.studioId,
                datamodel_type: "Edit",
                code: this.code(
                  entry,
                  `
local stage=assert(owned("ServerStorage","AssetStaging",ATTEMPT),"Missing quarantine")
local cache=assert(child(stage,"_TakkoRestrictedCapture"),"Missing derivative capture")
assert(cache:IsA("Folder") and cache:GetAttribute(MARK)==TOKEN,"Derivative ownership changed")
assert(cache:GetAttribute("Sha256")==${quote(output.sha256)} and cache:GetAttribute("EncodedBytes")==${output.encodedBytes},"Derivative identity changed")
local chunk=assert(child(cache,"Chunk_${offset / output.chunkSize + 1}"),"Missing derivative chunk")
assert(chunk:IsA("StringValue") and #chunk.Value==${length},"Invalid derivative chunk")
return reply("component_chunk",true,{offset=${offset},chunk=chunk.Value})`,
                ),
              },
              signal,
              [],
              false,
            );
            const part = snapshotSchema.parse(unpack(raw));
            if (
              !part.ok ||
              part.operation !== "component_chunk" ||
              part.offset !== offset ||
              typeof part.chunk !== "string" ||
              part.chunk.length !== length
            )
              throw Error("Restricted chunk did not match requested range");
            chunks.push(part.chunk);
          }
          payload = decodeComponentTransfer(output, chunks);
          verified = true;
        } finally {
          receipts.push({
            operation: "restricted_component_transfer",
            at: new Date().toISOString(),
            studioId: this.studioId,
            data: {
              ...output,
              chunksRead: chunks.length,
              verified,
              readOnly: true,
            },
          });
        }
        const captured = componentArchiveSnapshotSchema.parse(
          (payload as { snapshot?: unknown })?.snapshot,
        );
        receipts.push({
          operation: "restricted_component_validation",
          at: new Date().toISOString(),
          studioId: this.studioId,
          data:
            captured.status === "captured"
              ? { status: captured.status, roundTrip: captured.roundTrip }
              : { status: captured.status, reason: captured.reason },
        });
        const result = persistComponentDerivative(
          this.evidenceDirectory,
          originalHashes,
          payload,
          {
            studioId: this.studioId,
            scope: this.scope,
            token: entry.token,
            candidateId: entry.candidate.id,
            inputHash,
          },
        );
        receipts.push({
          operation: "restricted_component_archive",
          at: new Date().toISOString(),
          studioId: this.studioId,
          data: { original: originalHashes, ...result },
        });
        return { ...result, receipts };
      } catch (error) {
        throw new StudioAssetError(
          error instanceof Error ? error.message : String(error),
          receipts,
          this.poisoned ? "unknown" : "owned",
        );
      }
    });
  }
  async prepareComponentReview(
    inspection: AssetInspection,
    inputHash: string,
    signal: AbortSignal,
  ) {
    this.authenticated(undefined, inspection);
    let receipts = inspection.receipts;
    try {
      const result = await this.captureRestrictedComponent(
        inspection,
        inputHash,
        signal,
      );
      receipts = result.receipts;
      const evidence = loadComponentReviewEvidence(
        this.evidenceDirectory!,
        result.sha256,
        inputHash,
      );
      if (
        evidence.token !== inspection.token ||
        evidence.candidateId !== inspection.candidate.id
      )
        throw Error("Component review ownership identity changed");
      this.authenticated(undefined, inspection).preparedPacketHash =
        evidence.packetHash;
      return { evidence, receipts: result.receipts };
    } catch (error) {
      if (error instanceof StudioAssetError) throw error;
      throw new StudioAssetError(String(error), receipts, "owned");
    }
  }
  /** Applies a bounded worker manifest to an unparented copy; never promotes it to executable content. */
  async adaptComponent(
    inspection: AssetInspection,
    evidence: ComponentReviewEvidence,
    rawPlan: ComponentAdaptation,
    signal: AbortSignal,
  ) {
    return this.exclusive(async () => {
      const entry = this.authenticated(undefined, inspection);
      const receipts: AssetReceipt[] = [];
      try {
        if (
          !this.evidenceDirectory ||
          !entry.preparedPacketHash ||
          entry.integrationAttempted ||
          entry.placed
        )
          throw Error("Fresh prepared component required for adaptation");
        const chain = loadComponentAdaptationChain(
          this.evidenceDirectory,
          entry.preparedPacketHash,
          entry.adaptedPacketHash ?? entry.preparedPacketHash,
          evidence.inputHash,
        );
        const verified = chain.evidence;
        if (
          (entry.adaptationAttempts ?? 0) !== chain.steps.length ||
          chain.steps.length >= maxComponentAdaptations
        )
          throw Error(
            "Fresh prepared component required for adaptation; attempt budget or unresolved attempt",
          );
        if (
          !isDeepStrictEqual(verified, evidence) ||
          evidence.token !== entry.token ||
          evidence.candidateId !== entry.candidate.id
        )
          throw Error(
            "Adaptation evidence differs from owned prepared component",
          );
        const plan = validateComponentAdaptation(rawPlan, verified);
        const original = readComponentOriginal(
          this.evidenceDirectory,
          chain.archive.archiveHash,
          chain.archive.manifestHash,
        );
        const input = Buffer.from(
          JSON.stringify({
            before: original.snapshot,
            plan: { ...plan, replaceSources: expandedSourceEdits(plan) },
            securityProfiles: verified.securityProfiles,
          }),
        ).toString("base64");
        signal.throwIfAborted();
        const hop = chain.steps.length + 1;
        const cacheName = `_TakkoAdaptedCapture_${hop}`;
        entry.adaptationAttempts = hop;
        const snapshot = await this.execute(
          entry,
          "component_adapt",
          `
local stage=assert(owned("ServerStorage","AssetStaging",ATTEMPT),"Missing quarantine")
assert(not child(stage,${quote(cacheName)}),"Adaptation hop already attempted")
local encoding=game:GetService("EncodingService")
local data=Http:JSONDecode(buffer.tostring(encoding:Base64Decode(buffer.fromstring(${quote(input)}))))
${componentArchiveLuau}
${componentAdaptationLuau}
local roots={}
local ok,result=pcall(function()
  roots=game:GetService("SerializationService"):DeserializeInstancesAsync(encoding:Base64Decode(buffer.fromstring(data.before.base64)))
  assert(#roots==1 and roots[1].Parent==nil,"Unparented component required")
  return adaptComponent(roots[1],data.before,data.plan,data.securityProfiles)
end)
for _,root in roots do root:Destroy() end
if not ok then return reply("component_adapt",false,{reasons={tostring(result)}}) end
local json=Http:JSONEncode(result);assert(#json<=8*1024*1024,"Adapted evidence exceeds transfer bound")
local output=buffer.tostring(encoding:Base64Encode(buffer.fromstring(json)))
local digest=encoding:ComputeStringHash(output,Enum.HashAlgorithm.Sha256):gsub(".",function(c)return string.format("%02x",string.byte(c))end)
local retained=Instance.new("Folder");retained.Name=${quote(cacheName)};retained:SetAttribute(MARK,TOKEN)
retained:SetAttribute("AdaptationHop",${hop});retained:SetAttribute("ParentPacketHash",${quote(verified.packetHash)})
retained:SetAttribute("Sha256",digest);retained:SetAttribute("EncodedBytes",#output)
for offset=0,#output-1,32768 do local chunk=Instance.new("StringValue");chunk.Name="Chunk_"..tostring(offset/32768+1);chunk.Value=string.sub(output,offset+1,math.min(offset+32768,#output));chunk.Parent=retained end
retained.Parent=stage
return reply("component_adapt",true,{componentTransfer={encodedBytes=#output,jsonBytes=#json,sha256=digest,chunkSize=32768}})
`,
          signal,
          receipts,
        );
        if (!snapshot.ok || !snapshot.componentTransfer)
          throw Error(
            "Adaptation capture failed: " + snapshot.reasons.join("; "),
          );
        const output = snapshot.componentTransfer,
          chunks: string[] = [];
        let transferred = false;
        let payload: unknown;
        try {
          for (
            let offset = 0;
            offset < output.encodedBytes;
            offset += output.chunkSize
          ) {
            const length = Math.min(
              output.chunkSize,
              output.encodedBytes - offset,
            );
            const raw = await this.call(
              "execute_luau",
              {
                studio_id: this.studioId,
                datamodel_type: "Edit",
                code: this.code(
                  entry,
                  `
local stage=assert(owned("ServerStorage","AssetStaging",ATTEMPT),"Missing quarantine")
local cache=assert(child(stage,${quote(cacheName)}),"Missing adapted capture")
assert(cache:IsA("Folder") and cache:GetAttribute(MARK)==TOKEN,"Adaptation ownership changed")
assert(cache:GetAttribute("AdaptationHop")==${hop} and cache:GetAttribute("ParentPacketHash")==${quote(verified.packetHash)},"Adaptation hop identity changed")
assert(cache:GetAttribute("Sha256")==${quote(output.sha256)} and cache:GetAttribute("EncodedBytes")==${output.encodedBytes},"Adaptation identity changed")
local chunk=assert(child(cache,"Chunk_${offset / output.chunkSize + 1}"),"Missing adapted chunk")
assert(chunk:IsA("StringValue") and #chunk.Value==${length},"Invalid adapted chunk")
return reply("component_chunk",true,{offset=${offset},chunk=chunk.Value})`,
                ),
              },
              signal,
              [],
              false,
            );
            const part = snapshotSchema.parse(unpack(raw));
            if (
              !part.ok ||
              part.operation !== "component_chunk" ||
              part.offset !== offset ||
              typeof part.chunk !== "string" ||
              part.chunk.length !== length
            )
              throw Error("Adapted chunk did not match requested range");
            chunks.push(part.chunk);
          }
          payload = decodeComponentTransfer(output, chunks);
          transferred = true;
        } finally {
          receipts.push({
            operation: "adapted_component_transfer",
            at: new Date().toISOString(),
            studioId: this.studioId,
            data: {
              ...output,
              chunksRead: chunks.length,
              verified: transferred,
              readOnly: true,
              hop,
              parentPacketHash: verified.packetHash,
            },
          });
        }
        const result = persistComponentAdaptation(
          this.evidenceDirectory,
          chain.archive,
          verified,
          plan,
          payload,
        );
        const advanced = loadComponentAdaptationChain(
          this.evidenceDirectory,
          entry.preparedPacketHash,
          result.sha256,
          verified.inputHash,
        );
        if (advanced.steps.length !== hop)
          throw Error("Adaptation chain depth differs from consumed attempt");
        const adapted = advanced.evidence;
        receipts.push({
          operation: "adapted_component_archive",
          at: new Date().toISOString(),
          studioId: this.studioId,
          data: result,
        });
        entry.adaptedPacketHash = adapted.packetHash;
        return { evidence: adapted, receipts };
      } catch (error) {
        throw new StudioAssetError(
          error instanceof Error ? error.message : String(error),
          receipts,
          this.poisoned ? "unknown" : "owned",
        );
      }
    });
  }
  async prepareComponentIntegration(
    need: AssetNeed,
    inspection: AssetInspection,
    evidence: ComponentReviewEvidence,
    review: ComponentReviewDecision,
    signal: AbortSignal,
  ) {
    return this.exclusive(async () => {
      const entry = this.authenticated(need, inspection),
        receipts: AssetReceipt[] = [];
      try {
        if (
          !this.evidenceDirectory ||
          !entry.preparedPacketHash ||
          entry.integrationAttempted ||
          entry.placed ||
          (this.componentInputHash !== undefined &&
            this.componentInputHash !== evidence.inputHash) ||
          evidence.packetHash !==
            (entry.adaptedPacketHash ?? entry.preparedPacketHash)
        )
          throw Error("Current prepared component required for integration");
        const chain = loadComponentAdaptationChain(
          this.evidenceDirectory,
          entry.preparedPacketHash,
          evidence.packetHash,
          evidence.inputHash,
        );
        const verified = chain.evidence;
        if (
          (entry.adaptationAttempts ?? 0) !== chain.steps.length ||
          !isDeepStrictEqual(verified, evidence) ||
          verified.token !== entry.token
        )
          throw Error("Integration component identity changed");
        assertIntegrationReview(verified, review, need);
        signal.throwIfAborted();
        const source = chain.archive;
        const original = readComponentOriginal(
          this.evidenceDirectory,
          source.archiveHash,
          source.manifestHash,
        );
        const conversion = convertComponentXml(this.evidenceDirectory, source);
        const converted = loadComponentXml(
          this.evidenceDirectory,
          conversion.recordHash,
          `Workspace/${this.scope}/Assets/${need.id}`,
        );
        entry.integrationAttempted = true;
        const snapshot = await this.execute(
          entry,
          "component_export",
          `
${componentArchiveLuau}
local roots={}
local ok,captured=pcall(function()
 local encoding=game:GetService("EncodingService")
 roots=game:GetService("SerializationService"):DeserializeInstancesAsync(encoding:Base64Decode(buffer.fromstring(${quote(original.snapshot.base64)})))
 assert(#roots==1 and roots[1].Parent==nil,"Unparented source required")
 return captureComponentArchive(roots[1],encoding:Base64Decode(buffer.fromstring(${quote(Buffer.from(converted.xml).toString("base64"))})))
end)
for _,root in roots do root:Destroy() end
if not ok then return reply("component_export",false,{reasons={tostring(captured)}})end
return reply("component_export",captured.status=="captured" and captured.roundTrip.passed,{comparison=captured.roundTrip,reasons=if captured.status=="captured" and captured.roundTrip.passed then {} else {"Native XML conversion comparison failed"}})
`,
          signal,
          receipts,
        );
        if (!snapshot.ok) throw Error(snapshot.reasons.join("; "));
        const component = persistComponentIntegration(this.evidenceDirectory, {
          preparedHash: entry.preparedPacketHash,
          evidence: verified,
          review,
          need,
          scope: this.scope,
          conversionHash: conversion.recordHash,
          comparison: snapshot.comparison,
        });
        receipts.push({
          operation: "component_integration_prepared",
          at: new Date().toISOString(),
          studioId: this.studioId,
          data: {
            component,
            comparison: snapshot.comparison,
            runtimeVerification: "not_performed",
            placement: "worker_integration_required",
          },
        });
        const result = {
          component,
          receipts,
          bundle: bundleSchema.parse({
            files: [],
            scene: [],
            coverage: [],
            assets: [
              {
                id: need.id,
                requirementId: need.requirementId,
                kind: "model",
                status: "retrieved",
                assetId: entry.candidate.id,
                sourceUrl: entry.candidate.sourceUrl,
                description: need.role,
              },
            ],
          }),
        };
        this.componentInputHash = verified.inputHash;
        this.preparedIntegrations.set(
          component.recordHash,
          structuredClone({
            component,
            need,
            parent: entry.candidate,
            token: entry.token,
            preparedHash: entry.preparedPacketHash,
          }),
        );
        return result;
      } catch (error) {
        throw new StudioAssetError(
          error instanceof Error ? error.message : String(error),
          receipts,
          this.poisoned ? "unknown" : "owned",
        );
      }
    });
  }
  async discoverComponentAudio(
    needInput: AssetNeed,
    reference: ComponentReference,
    signal: AbortSignal,
  ): Promise<{ candidates: AssetCandidate[]; receipts: AssetReceipt[] }> {
    return this.exclusive(async () => {
      const receipts: AssetReceipt[] = [
        {
          operation: "component_audio_discovery_intent",
          at: new Date().toISOString(),
          studioId: this.studioId,
          data: { readOnly: true, nativeOperations: false },
        },
      ];
      try {
        signal.throwIfAborted();
        const need = assetNeedSchema.parse(needInput);
        const component = componentReferenceSchema.parse(reference);
        const owned = this.preparedIntegrations.get(component.recordHash);
        if (
          need.kind !== "Audio" ||
          !this.evidenceDirectory ||
          !owned ||
          !isDeepStrictEqual(component, owned.component) ||
          this.entries.has(owned.token) ||
          component.inputHash !== this.componentInputHash ||
          component.destinationPath !==
            `Workspace/${this.scope}/Assets/${owned.need.id}`
        )
          throw Error(
            "Current adapter prepared and cleaned component required for audio discovery",
          );
        const loaded = loadComponentIntegration(
          this.evidenceDirectory,
          component,
        );
        if (
          loaded.record.scope !== this.scope ||
          loaded.record.preparedHash !== owned.preparedHash ||
          !isDeepStrictEqual(loaded.record.need, owned.need) ||
          loaded.evidence.token !== owned.token
        )
          throw Error("Retained component ownership changed");
        const candidates = componentAudioCandidates({
          component,
          evidence: loaded.evidence,
          review: loaded.record.review,
          componentNeed: owned.need,
          parent: owned.parent,
        }).filter(
          (candidate) => !this.discovered.has(need.id + ":" + candidate.id),
        );
        signal.throwIfAborted();
        for (const candidate of candidates)
          this.discovered.set(
            need.id + ":" + candidate.id,
            structuredClone(candidate),
          );
        receipts.push({
          operation: "component_audio_discovery",
          at: new Date().toISOString(),
          studioId: this.studioId,
          data: {
            component: structuredClone(component),
            candidates: structuredClone(candidates),
            runtimeVerification: "not_performed",
            playbackVerification: "required",
          },
        });
        return { candidates, receipts };
      } catch (error) {
        throw new StudioAssetError(
          error instanceof Error ? error.message : String(error),
          receipts,
          "none",
        );
      }
    });
  }
  async place(
    need: AssetNeed,
    inspection: AssetInspection,
    signal: AbortSignal,
  ): Promise<AssetVerification> {
    return this.exclusive(async () => {
      const entry = this.authenticated(need, inspection),
        receipts: AssetReceipt[] = [];
      if (!entry.inspection?.safe || entry.placed)
        throw new StudioAssetError(
          "Only a safe unplaced inspection can be placed",
          [],
          "owned",
        );
      try {
        const snapshot = await this.execute(
          entry,
          "place",
          `
local stage=assert(owned("ServerStorage","AssetStaging",ATTEMPT),"Missing quarantine")
local root=assert(child(stage,"Imported"),"Missing imported root")
assert(root:GetAttribute(MARK)==TOKEN,"Imported identity changed")
local items,parts,sounds,reasons,scripts,center,extent=scan(root,KIND)
assert(#reasons==0,table.concat(reasons,"; "))
local destinationService=KIND=="Audio" and not AUDIO_CAPTURE and "ReplicatedStorage" or "Workspace"
local target=container(destinationService,"Assets",true)
assert(not child(target,NEED),"Placement target already exists")
if #parts>0 then moveGeometry(parts,center,DEST,math.min(1,MAXSIZE/extent)) end
root.Name=NEED; root.Parent=target
local loaded=preload(items)
assert(not Run:IsRunning(),"Edit mode changed while loading content")
local playback=false
if KIND=="Audio" then
  local sound=sounds[1]
  loaded=loaded and sound.IsLoaded and sound.TimeLength>0
  if AUDIO_CAPTURE then
    sound.PlayOnRemove=false;sound:Stop();sound.TimePosition=0;sound.Volume=0.65;sound.PlaybackSpeed=1;sound.Looped=false
  elseif loaded then
    sound.PlayOnRemove=false; sound.Volume=math.min(sound.Volume,0.2); sound.TimePosition=0; sound:Play()
    local before=sound.TimePosition; task.wait(math.min(0.15,sound.TimeLength/3)); playback=sound.TimePosition>before; sound:Stop(); sound.TimePosition=0
  end
  if not AUDIO_CAPTURE then table.insert(reasons,"Audio audibility and semantic fit are not verified by playback metadata; no audio-analysis capability") end
end
if not loaded then table.insert(reasons,"Placed content failed native loading") end
local scene=serialize(root,destinationService.."/"..SCOPE.."/Assets/"..NEED)
local preview=owned("Workspace","AssetPreviews",ATTEMPT)
if preview then preview:Destroy(); assert(not owned("Workspace","AssetPreviews",ATTEMPT),"Preview cleanup failed") end
return reply("place",#reasons==0,{reasons=reasons,functional={contentLoaded=loaded,instanceCount=#items,scriptCount=scripts,playbackObserved=playback},scene=scene,center={DEST.X,DEST.Y,DEST.Z},size=math.min(extent,MAXSIZE),functionalVerified=loaded and (KIND~="Audio" or playback),audibilityVerified=false})
`,
          signal,
          receipts,
        );
        entry.placed = true;
        const functional = functionalSchema.parse(snapshot.functional);
        let audio: StudioAudioEvidence | undefined;
        if (need.kind === "Audio" && this.audioCapture) {
          if (!snapshot.ok || !functional.contentLoaded)
            throw new StudioAssetError(
              "Placed audio failed native loading",
              receipts,
              "owned",
            );
          const captured = await this.captureAudio(
            entry,
            true,
            signal,
            receipts,
          );
          audio = captured.audio;
          functional.playbackObserved = captured.playbackObserved;
        }
        const scene = snapshot.scene;
        if (
          !scene?.length ||
          functional.scriptCount !== 0 ||
          scene.length !== functional.instanceCount ||
          functional.instanceCount > 300
        )
          throw new StudioAssetError(
            "Placed content snapshot is incomplete",
            receipts,
            "owned",
          );
        const service =
          need.kind === "Audio" && !this.audioCapture
            ? "ReplicatedStorage"
            : "Workspace";
        const target = `${service}/${this.scope}/Assets/${need.id}`;
        if (
          scene.some(
            (n) =>
              (n.path !== target && !n.path.startsWith(target + "/")) ||
              !n.path
                .split("/")
                .every((segment) => /^[A-Za-z][A-Za-z0-9_-]*$/.test(segment)) ||
              !(
                studioAssetCapabilities.serializedClasses as readonly string[]
              ).includes(n.className),
          )
        )
          throw new StudioAssetError(
            "Native snapshot escaped owned target or contains unsupported classes",
            receipts,
            "owned",
          );
        const paths = new Set(scene.map((n) => n.path));
        if (
          audio?.source.audition &&
          (scene.some(
            (n) =>
              n.className === "Sound" &&
              n.properties.SoundId !== audio!.source.audition!.soundId,
          ) ||
            (entry.inspection?.audio?.source.audition &&
              entry.inspection.audio.source.audition.soundId !==
                audio.source.audition.soundId))
        )
          throw new StudioAssetError(
            "Exported or placed Sound identity does not match the inspected and captured audio",
            receipts,
            "owned",
          );
        if (
          audio &&
          (scene.filter((n) => n.className === "Sound").length !== 1 ||
            scene.some(
              (n) =>
                n.className === "Sound" &&
                (typeof n.properties.Volume !== "number" ||
                  Math.abs(n.properties.Volume - 0.65) > 1e-6 ||
                  n.properties.PlaybackSpeed !== 1 ||
                  n.properties.Looped !== false ||
                  n.properties.Playing !== false ||
                  n.properties.PlayOnRemove !== false),
            ))
        )
          throw new StudioAssetError(
            "Exported Sound settings do not match the captured playback",
            receipts,
            "owned",
          );
        if (
          paths.size !== scene.length ||
          !paths.has(target) ||
          scene.some(
            (n) =>
              n.path !== target &&
              !paths.has(n.path.slice(0, n.path.lastIndexOf("/"))),
          )
        )
          throw new StudioAssetError(
            "Native snapshot hierarchy is incomplete or ambiguous",
            receipts,
            "owned",
          );
        for (const node of scene) {
          if (
            node.className === "Decal" &&
            (typeof node.properties.Texture !== "string" ||
              !/^(?:rbxassetid:\/\/\d+|https?:\/\/www\.roblox\.com\/asset\/\?id=\d+)$/.test(
                node.properties.Texture,
              ) ||
              !scene.some(
                (parent) =>
                  parent.path ===
                    node.path.slice(0, node.path.lastIndexOf("/")) &&
                  ["Part", "MeshPart"].includes(parent.className),
              ) ||
              ["Face", "Color3", "Transparency", "ZIndex", "AutoLocalize"].some(
                (key) => !(key in node.properties),
              ))
          )
            throw new StudioAssetError(
              "Decal image identity, renderable parent or appearance was not preserved",
              receipts,
              "owned",
            );
          if (
            node.className === "MeshPart" &&
            (typeof node.properties.MeshId !== "string" ||
              !node.properties.MeshId)
          )
            throw new StudioAssetError(
              "Native mesh identity was not preserved",
              receipts,
              "owned",
            );
          for (const [key, value] of Object.entries(node.properties)) {
            if (key !== "MeshId" || node.className !== "MeshPart") {
              const problem = scenePropertyError(node.className, key, value);
              if (problem)
                throw new StudioAssetError(problem, receipts, "owned");
            }
            if (
              typeof value === "object" &&
              value.type === "Ref" &&
              value.path &&
              !paths.has(value.path)
            )
              throw new StudioAssetError(
                "Native snapshot has an external instance reference",
                receipts,
                "owned",
              );
          }
        }
        if (
          need.kind === "Image" &&
          (scene.length !== 2 ||
            scene.filter((n) => n.className === "Decal").length !== 1 ||
            !scene.some((n) => n.path === target && n.className === "Part") ||
            scene.some(
              (n) =>
                n.className === "Decal" &&
                (n.properties.Transparency as number) >= 1,
            ))
        )
          throw new StudioAssetError(
            "Placed image has no verified renderable Decal surface",
            receipts,
            "owned",
          );
        if (
          need.kind !== "Audio" &&
          !scene.some(
            (n) => n.className === "Part" || n.className === "MeshPart",
          )
        )
          throw new StudioAssetError(
            "Placed model has no preserved geometry",
            receipts,
            "owned",
          );
        const bundle = bundleSchema.parse({
          files: [],
          scene: [
            {
              path: `${service}/${this.scope}`,
              className: "Folder",
              properties: {},
            },
            {
              path: `${service}/${this.scope}/Assets`,
              className: "Folder",
              properties: {},
            },
            ...scene,
          ],
          coverage: [],
          assets: [
            {
              id: need.id,
              requirementId: need.requirementId,
              kind:
                need.kind === "Model"
                  ? "model"
                  : need.kind === "Audio"
                    ? "audio"
                    : need.kind === "Image"
                      ? "image"
                      : "mesh",
              assetId: entry.candidate.id,
              status: "retrieved",
              sourceUrl: entry.candidate.sourceUrl,
              description: need.role,
            },
          ],
        });
        let image: string | undefined;
        if (need.kind !== "Audio")
          image = await this.capture(
            entry,
            snapshot.center ?? need.position,
            snapshot.size ?? need.maxSize,
            signal,
            receipts,
          );
        return {
          passed:
            snapshot.ok &&
            functional.contentLoaded &&
            functional.scriptCount === 0 &&
            (need.kind !== "Audio" || !!audio),
          reasons: snapshot.reasons,
          snapshot,
          functional,
          image,
          audio,
          receipts,
          bundle,
        };
      } catch (error) {
        let cleaned = false;
        this.poisoned = true;
        if (error instanceof StudioAssetError && error.effects === "unknown") {
          receipts.push({
            operation: "cleanup_deferred",
            at: new Date().toISOString(),
            studioId: this.studioId,
            data: {
              token: entry.token,
              reason:
                "Mutation outcome unknown; no cleanup sent while the original operation may still complete",
            },
          });
        } else {
          try {
            await this.cleanup(entry, AbortSignal.timeout(12000), receipts);
            cleaned = true;
          } catch (cleanupError) {
            receipts.push({
              operation: "cleanup_failed",
              at: new Date().toISOString(),
              studioId: this.studioId,
              data: String(cleanupError),
            });
          }
        }
        if (
          cleaned &&
          error instanceof StudioAssetError &&
          error.classification === "candidate_rejected"
        )
          this.poisoned = false;
        throw new StudioAssetError(
          error instanceof Error ? error.message : String(error),
          receipts,
          cleaned ? "none" : "unknown",
          error instanceof StudioAssetError
            ? error.classification
            : "infrastructure_failure",
        );
      }
    });
  }
  private async cleanup(
    entry: Entry,
    signal: AbortSignal,
    receipts: AssetReceipt[],
  ) {
    const result = await this.execute(
      entry,
      "discard",
      `
local targets={
  {"ServerStorage","AssetStaging",ATTEMPT},
  {"Workspace","AssetPreviews",ATTEMPT},
  {KIND=="Audio" and not AUDIO_CAPTURE and "ReplicatedStorage" or "Workspace","Assets",NEED}
}
local found={}
for index,t in targets do
  local service=game:GetService(t[1]); local project=child(service,SCOPE)
  if project then
    assert(project:IsA("Folder"),"Scope was replaced")
    local folder=child(project,t[2])
    if folder then
      assert(folder:IsA("Folder") and folder:GetAttribute("TakkoAssetScope")==SCOPE,"Container was replaced")
      local item=child(folder,t[3])
      if index==3 and EXPECTPLACED then assert(item and item:GetAttribute(MARK)==TOKEN,"Cleanup placement identity changed") end
      if item then
        if index==3 and item:GetAttribute(MARK)~=TOKEN then
          -- An existing placement target was never ours. Preserve it.
        else assert(item:GetAttribute(MARK)==TOKEN,"Cleanup identity changed"); table.insert(found,item) end
      end
    end
    if index==3 and EXPECTPLACED then assert(folder,"Cleanup placement folder disappeared") end
  end
  if index==3 and EXPECTPLACED then assert(project,"Cleanup placement scope disappeared") end
end
for _,item in found do
  for _,desc in enumerate(item) do if desc:IsA("Sound") then desc.PlayOnRemove=false; desc:Stop() end end
  item:Destroy(); assert(item.Parent==nil,"Owned asset cleanup failed")
end
-- Remove only empty containers created by this adapter session. Existing
-- project folders, other runs' content and user-added children are preserved.
for _,serviceName in {"ServerStorage","Workspace","ReplicatedStorage"} do
  local service=game:GetService(serviceName); local project=child(service,SCOPE)
  if project and project:IsA("Folder") then
    for _,name in {"AssetStaging","AssetPreviews","Assets"} do
      local folder=child(project,name)
      if folder and folder:IsA("Folder") and folder:GetAttribute("TakkoAssetCreatedBy")==SESSION and #folder:GetChildren()==0 then folder:Destroy() end
    end
    if project:GetAttribute("TakkoAssetCreatedBy")==SESSION and #project:GetChildren()==0 then project:Destroy() end
  end
end
return reply("discard",true,{removed=#found})
`,
      signal,
      receipts,
    );
    if (!result.ok) {
      this.poisoned = true;
      throw new StudioAssetError(
        "Owned asset cleanup was not verified",
        receipts,
        "unknown",
      );
    }
    this.entries.delete(entry.token);
  }
  async discard(inspection: AssetInspection, signal: AbortSignal) {
    return this.exclusive(async () => {
      const entry = this.authenticated(undefined, inspection),
        receipts: AssetReceipt[] = [];
      try {
        await this.cleanup(entry, signal, receipts);
        return receipts;
      } catch (error) {
        let cleaned = false;
        this.poisoned = true;
        throw error;
      }
    }, true);
  }
}
