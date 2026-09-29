import { z } from "zod";
import { assetIdSchema } from "./types";
const number = z.number().finite().min(-1e7).max(1e7);
export const modelPreviewSchema = z
  .object({
    parts: z
      .array(
        z
          .object({
            name: z.string().max(160),
            shape: z.enum([
              "Block",
              "Ball",
              "Cylinder",
              "Wedge",
              "CornerWedge",
              "approximate",
            ]),
            size: z.tuple([number, number, number]),
            frame: z.array(number).length(12),
            color: z.tuple([
              z.number().min(0).max(1),
              z.number().min(0).max(1),
              z.number().min(0).max(1),
            ]),
            transparency: z.number().min(0).max(1),
          })
          .strict(),
      )
      .max(2000),
    omitted: z.number().int().min(0),
    transparent: z.number().int().min(0).optional(),
    effects: z.number().int().min(0),
  })
  .strict();
export type ModelPreview = z.infer<typeof modelPreviewSchema>;

/** Read real primitive geometry without inserting or running third-party content. */
export function modelPreviewLuau(id: string) {
  assetIdSchema.parse(id);
  return `
assert(not game:GetService("RunService"):IsRunning(),"Stop Play before previewing assets")
local roots={}
local ok,result=pcall(function()
  roots=game:GetObjects("rbxassetid://${id}")
  local out={parts={},omitted=0,effects=0,transparent=0}
  local count=0
  for _,root in roots do
    assert(root.Parent==nil,"Preview asset must remain detached")
    local items={root}
    for _,item in root:GetDescendants() do table.insert(items,item) end
    for _,item in items do
      count+=1;assert(count<=10000,"Preview exceeds 10000 instances")
      if item:IsA("BaseScript") then item.Enabled=false end
      if item:IsA("Sound") then item.PlayOnRemove=false end
      if item:IsA("ParticleEmitter") or item:IsA("Beam") or item:IsA("Trail") then out.effects+=1 end
      if item:IsA("BasePart") and item.Transparency<1 then
        if #out.parts<2000 then
          local shape="approximate"
          local size,frame=item.Size,item.CFrame
          local mesh=item:FindFirstChildOfClass("SpecialMesh")
          if mesh then
            local shapes={Brick="Block",Sphere="Ball",Cylinder="Cylinder",Wedge="Wedge"}
            shape=shapes[mesh.MeshType.Name] or "approximate"
            if shape~="approximate" then size=size*mesh.Scale;frame=frame*CFrame.new(mesh.Offset) end
          elseif item:IsA("Part") then shape=item.Shape.Name
          elseif item:IsA("WedgePart") then shape="Wedge"
          elseif item:IsA("CornerWedgePart") then shape="CornerWedge" end
          table.insert(out.parts,{name=string.sub(item.Name,1,160),shape=shape,size={size.X,size.Y,size.Z},frame={frame:GetComponents()},color={item.Color.R,item.Color.G,item.Color.B},transparency=item.Transparency})
        else out.omitted+=1 end
      elseif item:IsA("BasePart") then out.transparent+=1
      end
    end
  end
  return out
end)
for _,root in roots do root:Destroy() end
assert(not game:GetService("RunService"):IsRunning(),"Studio mode changed during preview")
assert(ok,tostring(result))
local encoded=game:GetService("HttpService"):JSONEncode(result)
assert(#encoded<=4*1024*1024,"Model preview exceeds the 4 MB transfer limit")
return encoded
`;
}
