import { z } from "zod";
import { animationClipSchema } from "../generation/animation";
import { assetIdSchema } from "./types";

export const animationEntrySchema = z
  .object({
    key: z.string().min(1).max(1024),
    name: z.string().min(1).max(200),
    animationId: assetIdSchema.optional(),
    clip: animationClipSchema.optional(),
    error: z.string().min(1).max(400).optional(),
  })
  .strict()
  .refine(
    (e) => Boolean(e.clip) !== Boolean(e.error),
    "A clip needs data or an error.",
  );
export const animationPackSchema = z
  .object({
    assetId: assetIdSchema,
    name: z.string().min(1).max(200),
    revisionKey: z.string().max(150),
    entries: z.array(animationEntrySchema).max(100),
    context: z
      .object({
        toolCount: z.number().int().nonnegative(),
        meshPartCount: z.number().int().nonnegative(),
        siblings: z
          .array(
            z
              .object({
                name: z.string().max(200),
                className: z.string().max(100),
                path: z.string().max(1024),
              })
              .strict(),
          )
          .max(200),
        omitted: z.number().int().nonnegative(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .refine(
    (p) => new Set(p.entries.map((e) => e.key)).size === p.entries.length,
    "Duplicate animation entries.",
  );
export type AnimationPack = z.infer<typeof animationPackSchema>;
export const studioPublishingLimitation =
  "Studio testing is available for this mapped raw animation. Publishing remains blocked until a permitted published animation ID is supplied. Takko does not publish animations. Temporary registration IDs are Studio-only.";
export function animationTier(entry: AnimationPack["entries"][number]) {
  if (!entry.clip) return "unusable";
  if (entry.animationId) return "published";
  // Native capture produces an ordinal path for every embedded sequence. An arbitrary label is not an identity.
  return /^[1-9]\d*(?:\/[1-9]\d*)*$/.test(entry.key)
    ? "studio_only"
    : "unusable";
}
export function studioAnimationPack(pack: AnimationPack): AnimationPack {
  return {
    ...pack,
    entries: pack.entries.filter((e) => animationTier(e) !== "unusable"),
  };
}
/** Legacy callers use the same Studio-ready policy. */
export const publishableAnimationPack = studioAnimationPack;
export type SavedAnimationPack = AnimationPack & {
  id: string;
  at: string;
  revision: number;
};

/** Only detached instances are read. Asset scripts are never executed or parented into the place. */
export function animationCaptureLuau(
  assetId: string,
  kind: string,
  index = -1,
) {
  assetIdSchema.parse(assetId);
  if (!Number.isInteger(index) || index < -1 || index > 99)
    throw Error("Invalid animation index");
  return `
assert(not game:GetService("RunService"):IsRunning(),"Stop Play before reading animations")
local roots,owned,entries={},{},{}
local context={toolCount=0,meshPartCount=0,siblings={},omitted=0}
local function own(item) table.insert(owned,item);return item end
local function add(item,path,id) assert(#entries<100,"Pack exceeds 100 animations");table.insert(entries,{item=item,key=path,name=string.sub(item and item.Name or "Animation",1,200),animationId=id}) end
local ok,result=pcall(function()
  if ${kind === "Animation" ? "true" : "false"} then
    add(nil,"asset","${assetId}")
  else
    roots=game:GetObjects("rbxassetid://${assetId}")
    local count=0
    local function visit(item,path)
      count+=1;assert(count<=10000,"Pack exceeds 10000 instances")
      if item:IsA("BaseScript") then item.Enabled=false end
      if item:IsA("Sound") then item.PlayOnRemove=false end
      if item:IsA("Tool") then context.toolCount+=1 end
      if item:IsA("MeshPart") then context.meshPartCount+=1 end
      if item:IsA("Tool") or item:IsA("BasePart") or item:IsA("Model") then
        if #context.siblings<200 then table.insert(context.siblings,{name=string.sub(item.Name,1,200),className=item.ClassName,path=string.sub(path,1,1024)}) else context.omitted+=1 end
      end
      if item:IsA("KeyframeSequence") or item:IsA("CurveAnimation") then add(item,path);return
      elseif item:IsA("Animation") then add(item,path,item.AnimationId:match("%d+"));return end
      for i,child in item:GetChildren() do visit(child,path.."/"..i) end
    end
    for i,root in roots do assert(root.Parent==nil,"Expected detached asset");visit(root,tostring(i)) end
  end
  if ${index} < 0 then
    local out={}
    for _,entry in entries do table.insert(out,{key=entry.key,name=entry.name,animationId=entry.animationId}) end
    return {entries=out,context=context}
  end
  local entry=assert(entries[${index + 1}],"Animation no longer exists in this pack")
  local sequence=entry.item
  -- Providers can return cached instances. Only destroy our private clone.
  if entry.animationId then sequence=own(game:GetService("KeyframeSequenceProvider"):GetKeyframeSequenceAsync("rbxassetid://"..entry.animationId):Clone()) end
  assert(sequence and sequence:IsA("KeyframeSequence"),"This clip is not a supported keyframe animation")
  local frames=sequence:GetKeyframes()
  table.sort(frames,function(a,b) return a.Time<b.Time end)
  assert(#frames>0 and #frames<=300,"Clip exceeds 300 keyframes or is empty")
  local duration=frames[#frames].Time
  assert(duration>=0 and duration<=30,"Preview supports clips up to 30 seconds")
  local tracks,byName={},{}
  local rig="R6"
  for _,key in frames do
    for _,pose in key:GetDescendants() do
      if pose:IsA("Pose") and pose.Name~="HumanoidRootPart" then
        if pose.Name:match("Upper") or pose.Name:match("Lower") or pose.Name:match("Hand$") or pose.Name:match("Foot$") then rig="R15" end
        local track=byName[pose.Name]
        if not track then track={joint=pose.Name,keys={}};byName[pose.Name]=track;table.insert(tracks,track) end
        local x,y,z=pose.CFrame:ToEulerAnglesXYZ()
        local p=pose.CFrame.Position
        table.insert(track.keys,{time=key.Time,rotation={x,y,z},position={p.X,p.Y,p.Z},easing=pose.EasingStyle.Name,direction=pose.EasingDirection.Name,weight=pose.Weight})
      end
    end
  end
  assert(#tracks>0 and #tracks<=15,"Only standard R6/R15 body animations are supported")
  table.sort(tracks,function(a,b) return a.joint<b.joint end)
  local description=own(Instance.new("HumanoidDescription"))
  local model=own(game:GetService("Players"):CreateHumanoidModelFromDescriptionAsync(description,Enum.HumanoidRigType[rig]))
  assert(model.Parent==nil,"Preview rig must stay detached")
  local nativeRig={}
  local function walk(part)
    local motors={}
    for _,v in model:GetDescendants() do
      if v:IsA("Motor6D") and v.Part0==part and v.Part1 then table.insert(motors,{part=v.Part1,c0=v.C0,c1=v.C1})
      elseif v:IsA("AnimationConstraint") and v.Attachment0 and v.Attachment1 and v.Attachment0.Parent==part then
        table.insert(motors,{part=v.Attachment1.Parent,c0=v.Attachment0.CFrame,c1=v.Attachment1.CFrame})
      end
    end
    table.sort(motors,function(a,b) return a.part.Name<b.part.Name end)
    for _,motor in motors do
      local p=motor.part
      table.insert(nativeRig,{name=p.Name,parent=part.Name,size={p.Size.X,p.Size.Y,p.Size.Z},c0={motor.c0:GetComponents()},c1={motor.c1:GetComponents()}})
      walk(p)
    end
  end
  walk(assert(model:FindFirstChild("HumanoidRootPart"),"Missing rig root"))
  local supported={}
  for _,part in nativeRig do supported[part.name]=true end
  for _,track in tracks do assert(supported[track.joint],"Custom joint '"..track.joint.."' is not supported by the R6/R15 body preview") end
  return {version=1,name=string.sub(entry.name,1,80),rig=rig,duration=duration,tracks=tracks,nativeRig=nativeRig}
end)
for _,root in roots do root:Destroy() end
for _,item in owned do item:Destroy() end
assert(not game:GetService("RunService"):IsRunning(),"Studio mode changed during animation read")
if not ok then return {captureError=string.sub(tostring(result),1,350)} end
return result
`;
}
