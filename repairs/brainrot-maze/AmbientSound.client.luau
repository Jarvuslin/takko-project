local Players=game:GetService("Players")
local Run=game:GetService("RunService")
local scope=script.Parent.Name
local sound=require(game:GetService("ReplicatedStorage"):WaitForChild(scope):WaitForChild("SoundUtils")).createAmbientSound()
sound.Parent=game:GetService("SoundService");sound:Play()
local connection=Run.Heartbeat:Connect(function()
 local c=Players.LocalPlayer.Character
 local root=c and c:FindFirstChild("HumanoidRootPart")
 local active=c and c:GetAttribute("BuffActive")
 sound.Volume=active and .22 or .08
 sound.PlaybackSpeed=active and .9 or (root and (.6+math.clamp((36-root.Position.Z)/96,0,1)*.15) or .65)
end)
script.Destroying:Connect(function() connection:Disconnect();sound:Destroy() end)
