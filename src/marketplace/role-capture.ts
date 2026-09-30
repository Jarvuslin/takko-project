import { z } from "zod";

export const ROLE_CAPTURE_VERSION = 2;
const vector = z.tuple([z.number().finite(), z.number().finite(), z.number().finite()]);
const identity = { path: z.string().max(1024), key: z.string().max(1024), name: z.string().max(200) };
export const nativeRolesSchema = z.object({
  version: z.union([z.literal(1), z.literal(ROLE_CAPTURE_VERSION)]),
  classes: z.record(z.string().max(100), z.number().int().nonnegative()),
  parts: z.array(z.object({
    ...identity, className: z.string().max(100), size: vector,
    cframe: z.array(z.number().finite()).length(12),
    anchored: z.boolean(), canCollide: z.boolean(), canQuery: z.boolean(),
  }).strict()).max(3000),
  humanoids: z.array(z.object({ ...identity, rig: z.enum(["R6", "R15"]) }).strict()).max(100),
  sequences: z.array(z.object({
    ...identity, loop: z.boolean(), priority: z.string().max(100),
    poseDigest: z.string().regex(/^[a-f0-9]{64}$/),
    frames: z.array(z.object({
      time: z.number().finite().nonnegative(), name: z.string().max(200),
      markers: z.array(z.object({ name: z.string().max(200), value: z.string().max(400) }).strict()).max(100),
    }).strict()).min(1).max(300),
  }).strict()).max(100),
  animations: z.array(z.object({ ...identity, animationId: z.string().max(2048) }).strict()).max(100),
  sounds: z.array(z.object({ ...identity, soundId: z.string().max(2048) }).strict()).max(1000),
  tools: z.array(z.object({ ...identity, requiresHandle: z.boolean(), handle: z.boolean() }).strict()).max(100).optional(),
  effects: z.array(z.object({ ...identity, className: z.string().max(100), enabled: z.boolean(), texture: z.string().max(2048) }).strict()).max(1000).optional(),
  meshes: z.array(z.object({ ...identity, meshId: z.string().max(2048) }).strict()).max(3000).optional(),
  images: z.array(z.object({ ...identity, content: z.string().max(2048) }).strict()).max(1000).optional(),
}).strict();
export type NativeRoles = z.infer<typeof nativeRolesSchema>;

/** Called on the same detached roots as security inspection. Never executes asset code. */
export const roleCaptureLuau = `
local function captureNativeRoles(roots)
  local http=game:GetService("HttpService")
  local result={version=2,classes={},parts={},humanoids={},sequences={},animations={},sounds={},tools={},effects={},meshes={},images={}}
  local count=0
  local function identity(item,key)
    return {path=string.sub(item:GetFullName(),1,1024),key=key,name=string.sub(item.Name,1,200)}
  end
  local function visit(item,key)
    count+=1;assert(count<=10000,"Role inspection exceeds 10000 instances")
    result.classes[item.ClassName]=(result.classes[item.ClassName] or 0)+1
    if item:IsA("BaseScript") then item.Enabled=false end
    if item:IsA("Sound") then item.PlayOnRemove=false end
    local row=identity(item,key)
    if item:IsA("Tool") then
      assert(#result.tools<100,"Role inspection exceeds 100 tools")
      local tool=identity(item,key);local handle=item:FindFirstChild("Handle")
      tool.requiresHandle=item.RequiresHandle;tool.handle=handle~=nil and handle:IsA("BasePart");table.insert(result.tools,tool)
    end
    if item:IsA("MeshPart") or item:IsA("SpecialMesh") then
      assert(#result.meshes<3000,"Role inspection exceeds 3000 meshes")
      local mesh=identity(item,key);mesh.meshId=string.sub(item.MeshId,1,2048);table.insert(result.meshes,mesh)
    end
    if item:IsA("Decal") or item:IsA("Texture") or item:IsA("ImageLabel") or item:IsA("ImageButton") then
      assert(#result.images<1000,"Role inspection exceeds 1000 images")
      local image=identity(item,key);image.content=string.sub((item:IsA("Decal") or item:IsA("Texture")) and item.Texture or item.Image,1,2048);table.insert(result.images,image)
    end
    if item:IsA("ParticleEmitter") or item:IsA("Beam") or item:IsA("Trail") or item:IsA("Fire") or item:IsA("Smoke") or item:IsA("Sparkles") then
      assert(#result.effects<1000,"Role inspection exceeds 1000 effects")
      local effect=identity(item,key);effect.className=item.ClassName;effect.enabled=item.Enabled
      effect.texture=(item:IsA("ParticleEmitter") or item:IsA("Beam") or item:IsA("Trail")) and string.sub(item.Texture,1,2048) or ""
      table.insert(result.effects,effect)
    end
    if item:IsA("BasePart") then
      assert(#result.parts<3000,"Role inspection exceeds 3000 parts")
      row.className=item.ClassName;row.size={item.Size.X,item.Size.Y,item.Size.Z}
      row.cframe={item.CFrame:GetComponents()};row.anchored=item.Anchored;row.canCollide=item.CanCollide;row.canQuery=item.CanQuery
      table.insert(result.parts,row)
    elseif item:IsA("Humanoid") then
      assert(#result.humanoids<100,"Role inspection exceeds 100 humanoids")
      row.rig=item.RigType.Name;table.insert(result.humanoids,row)
    elseif item:IsA("Sound") then
      assert(#result.sounds<1000,"Role inspection exceeds 1000 sounds")
      row.soundId=string.sub(item.SoundId,1,2048);table.insert(result.sounds,row)
    elseif item:IsA("Animation") then
      assert(#result.animations<100,"Role inspection exceeds 100 animations")
      row.animationId=string.sub(item.AnimationId,1,2048);table.insert(result.animations,row)
    elseif item:IsA("KeyframeSequence") then
      assert(#result.sequences<100,"Role inspection exceeds 100 sequences")
      local frames=item:GetKeyframes();table.sort(frames,function(a,b) return a.Time<b.Time end)
      assert(#frames>0 and #frames<=300,"Role inspection requires 1-300 frames per sequence")
      row.loop=item.Loop;row.priority=item.Priority.Name;row.frames={}
      local poses={}
      for _,frame in frames do
        local labels={time=frame.Time,name=string.sub(frame.Name,1,200),markers={}}
        for _,marker in frame:GetMarkers() do
          assert(#labels.markers<100,"Role inspection exceeds 100 markers per frame")
          table.insert(labels.markers,{name=string.sub(marker.Name,1,200),value=string.sub(marker.Value,1,400)})
        end
        table.insert(row.frames,labels)
        for _,pose in frame:GetDescendants() do
          if pose:IsA("Pose") then
            table.insert(poses,{frame.Time,pose:GetFullName(),{pose.CFrame:GetComponents()},pose.Weight,pose.EasingStyle.Name,pose.EasingDirection.Name})
          end
        end
      end
      row.poseDigest=game:GetService("EncodingService"):ComputeStringHash(http:JSONEncode(poses),Enum.HashAlgorithm.Sha256):gsub(".",function(c) return string.format("%02x",string.byte(c)) end)
      table.insert(result.sequences,row)
    end
    for index,child in item:GetChildren() do visit(child,key.."/"..index) end
  end
  for index,root in roots do assert(root.Parent==nil,"Role capture requires detached roots");visit(root,tostring(index)) end
  return result
end
`;
