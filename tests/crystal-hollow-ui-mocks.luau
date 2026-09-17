-- Offline property/ownership mock only: no layout, rendering, physics or network simulation.
local clockNow = 0
local os = {clock = function() return clockNow end}
local function value(...) return {...} end
local Color3 = {fromRGB=value}
local Vector2 = {new=value}
local UDim = {new=value}
local UDim2 = {new=value}
local Enum = setmetatable({}, {__index=function(_,category)
 return setmetatable({}, {__index=function(_,name) return category.."."..name end})
end})
local Instance = {}
function Instance.new(className)
 local props={ClassName=className,Name=className}
 local children={}
 local methods={}
 local self
 function methods:FindFirstChild(name,recursive)
  for _,child in ipairs(children) do
   if child.Name==name then return child end
   if recursive then local found=child:FindFirstChild(name,true); if found then return found end end
  end
  return nil
 end
 function methods:GetChildren() return table.clone(children) end
 function methods:IsA(name) return props.ClassName==name end
 function methods:Destroy()
  for _,child in ipairs(table.clone(children)) do child:Destroy() end
  self.Parent=nil
 end
 methods._add=function(_,child) table.insert(children,child) end
 methods._remove=function(_,child) local index=table.find(children,child); if index then table.remove(children,index) end end
 self=setmetatable({}, {
  __index=function(_,key) return methods[key] or props[key] end,
  __newindex=function(_,key,v)
   if key=="Parent" then
    if props.Parent then props.Parent:_remove(self) end
    if v then v:_add(self) end
   end
   props[key]=v
  end,
 })
 return self
end
