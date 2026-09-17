-- Character animation uses the current player list, with no retained departed-player state.
local Players=game:GetService("Players")
local Run=game:GetService("RunService")
local elapsed=0
Run.Heartbeat:Connect(function(dt)
 elapsed+=dt;if elapsed<.05 then return end;elapsed=0
 for _,player in Players:GetPlayers() do
  local c=player.Character;local torso=c and c:FindFirstChild("Torso")
  local root=c and c:FindFirstChild("HumanoidRootPart")
  local h=c and c:FindFirstChildOfClass("Humanoid")
  if torso and root and h and h.Health>0 then
   local v=root.AssemblyLinearVelocity
   local swing=math.sin(os.clock()*9)*math.min(Vector3.new(v.X,0,v.Z).Magnitude/16,1)*.6
   for _,j in torso:GetChildren() do
    if j:IsA("Motor6D") then
     if j.Name=="Left Hip" then j.C0=CFrame.new(-.5,-1,0)*CFrame.Angles(swing,0,0)
     elseif j.Name=="Right Hip" then j.C0=CFrame.new(.5,-1,0)*CFrame.Angles(-swing,0,0)
     elseif j.Name=="Left Shoulder" then j.C0=CFrame.new(-1,.5,0)*CFrame.Angles(-swing,0,0)
     elseif j.Name=="Right Shoulder" then j.C0=CFrame.new(1,.5,0)*CFrame.Angles(swing,0,0) end
    end
   end
  end
 end
end)
