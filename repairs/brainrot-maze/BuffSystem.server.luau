local Players=game:GetService("Players")
local Run=game:GetService("RunService")
local scope=script.Parent.Name
local shared=game:GetService("ReplicatedStorage"):WaitForChild(scope)
local config=require(shared:WaitForChild("BuffUtils"))
local effects=require(shared:WaitForChild("BrainrotBuffEffects"))
local elapsed=0
Run.Heartbeat:Connect(function(dt)
 elapsed+=dt;if elapsed<.1 then return end;elapsed=0
 for _,player in Players:GetPlayers() do
  local character=player.Character
  local h=character and character:FindFirstChildOfClass("Humanoid")
  local root=character and character:FindFirstChild("HumanoidRootPart")
  if h and root then
   local inside=false
   if h.Health>0 then
    for _,zone in config.BuffZones do
     local pos=zone.Bounds:PointToObjectSpace(root.Position)
     if math.abs(pos.X)<=zone.Size.X/2 and math.abs(pos.Y)<=zone.Size.Y/2 and math.abs(pos.Z)<=zone.Size.Z/2 then inside=true;break end
    end
   end
   if character:GetAttribute("BuffActive")~=inside then
    character:SetAttribute("BuffActive",inside)
    h.WalkSpeed=inside and 16*config.BuffTypes.Speed.Multiplier or 16
    if inside then effects.applyGlowOutline(character) else effects.removeGlowOutline(character) end
   end
  end
 end
end)
