local Players=game:GetService("Players")
local Test=game:GetService("StudioTestService")
local probe=game:GetService("ReplicatedStorage"):WaitForChild("ForgeNativeMultiplayer"):WaitForChild("Probe")
probe.OnClientInvoke=function(action)
 if action=="leave" then
  task.delay(.2,function() if Test:CanLeaveTest() then Test:LeaveTest() end end)
  return true
 end
 local count=0
 for _,gui in Players.LocalPlayer.PlayerGui:GetChildren() do if gui.Name=="BrainrotHealthHUD" then count+=1 end end
 local sound=game:GetService("SoundService"):FindFirstChild("AmbientAtmosphere")
 return {fov=workspace.CurrentCamera.FieldOfView,hud=count,soundLoaded=sound and sound.IsLoaded and sound.IsPlaying or false}
end
