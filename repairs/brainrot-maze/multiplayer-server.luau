local Players=game:GetService("Players")
local Test=game:GetService("StudioTestService")
local scope=Test:GetTestArgs().scope
local checks,logs={},{}
game:GetService("LogService").MessageOut:Connect(function(message,kind)
 if kind==Enum.MessageType.MessageError and #logs<30 then table.insert(logs,message) end
end)
local folder=Instance.new("Folder");folder.Name="ForgeNativeMultiplayer";folder.Parent=game:GetService("ReplicatedStorage")
local probe=Instance.new("RemoteFunction");probe.Name="Probe";probe.Parent=folder
local function waitFor(test,seconds,message)
 local deadline=os.clock()+seconds
 repeat if test() then return end;task.wait(.1) until os.clock()>deadline
 error(message)
end
local ok,err=pcall(function()
 waitFor(function() return #Players:GetPlayers()==2 end,20,"Two players did not join")
 local a,b=table.unpack(Players:GetPlayers())
 waitFor(function() return a.Character and b.Character and a.Character:FindFirstChild("HumanoidRootPart") and b.Character:FindFirstChild("HumanoidRootPart") end,10,"Both characters did not spawn")
 task.wait(3)
 local first,second=a.Character,b.Character
 first.HumanoidRootPart:SetNetworkOwner(nil);second.HumanoidRootPart:SetNetworkOwner(nil)
 first:PivotTo(CFrame.new(-36,4,0));second:PivotTo(CFrame.new(36,4,24));task.wait(1)
 assert(first.Humanoid.WalkSpeed==24 and second.Humanoid.WalkSpeed==16,"Per-player speed isolation")
 assert(first:GetAttribute("BuffActive")==true and second:GetAttribute("BuffActive")==false,"Per-player zone state")
 local av,bv=probe:InvokeClient(a,"observe"),probe:InvokeClient(b,"observe")
 assert(av.fov==90 and bv.fov==70,"Client cameras isolated")
 assert(av.hud==1 and bv.hud==1,"Each player has exactly one HUD")
 assert(av.soundLoaded and bv.soundLoaded,"Both clients load ambient sound")
 table.insert(checks,{id="two-player-buffs",status="passed",detail="Two real Studio clients: independent server speed, replicated glow state, client FOV, HUD and loaded audio"})
 first.Humanoid.Health=0
 waitFor(function() return a.Character and a.Character~=first end,6,"First player failed to respawn")
 task.wait(.5)
 assert(a.Character.Humanoid.Health==100 and b.Character==second and second.Humanoid.Health==100,"Respawn isolation")
 assert((a.Character:GetPivot().Position-workspace[scope].World.SpawnLocation.Position).Magnitude<7,"Respawn at start")
 table.insert(checks,{id="two-player-respawn",status="passed",detail="Death and replacement of first character did not affect second player"})
 probe:InvokeClient(a,"leave")
 waitFor(function() return #Players:GetPlayers()==1 end,10,"Client failed to leave")
 task.wait(1)
 assert(b.Parent==Players and b.Character==second and second.Humanoid.Health==100,"Remaining player healthy after leave")
 Test:AddPlayers(1)
 waitFor(function() return #Players:GetPlayers()==2 end,20,"Replacement client did not join")
 local replacement
 for _,player in Players:GetPlayers() do if player~=b then replacement=player end end
 waitFor(function() return replacement and replacement.Character and replacement.Character:FindFirstChildOfClass("Humanoid") end,10,"Replacement player failed to spawn")
 task.wait(3)
 assert(replacement.Character.Humanoid.Health==100,"Replacement healthy")
 local rv=probe:InvokeClient(replacement,"observe")
 assert(rv.hud==1 and rv.fov==70,"Fresh client has clean HUD and unbuffed camera")
 table.insert(checks,{id="leave-rejoin",status="passed",detail="Real client left; a new simulated client joined with fresh character, HUD, and buff state"})
 assert(#logs==0,"Runtime errors occurred: "..table.concat(logs," | "))
end)
if not ok then table.insert(checks,{id="multiplayer-runtime",status="failed",detail=tostring(err)}) end
Test:EndTest({checks=checks,logs=logs})
