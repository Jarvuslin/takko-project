local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local Debris = game:GetService("Debris")

local pad = script.Parent
pad.Anchored = true
pad.CanCollide = true

-- Determine checkpoint index from attribute or name
local checkpointIndex = pad:GetAttribute("CheckpointIndex")
if not checkpointIndex then
	local num = string.match(pad.Name, "%d+")
	checkpointIndex = num and tonumber(num) or 1
	pad:SetAttribute("CheckpointIndex", checkpointIndex)
end

-- Attach visual feedback components
local light = pad:FindFirstChildOfClass("PointLight")
if not light then
	light = Instance.new("PointLight")
	light.Name = "ActivationLight"
	light.Color = Color3.fromRGB(0, 220, 255)
	light.Range = 14
	light.Brightness = 0
	light.Enabled = true
	light.Parent = pad
end

local chimeSound = pad:FindFirstChildOfClass("Sound")
if not chimeSound then
	chimeSound = Instance.new("Sound")
	chimeSound.Name = "CheckpointChime"
	chimeSound.SoundId = "rbxasset://sounds/electronicpingshort.wav"
	chimeSound.Volume = 0.85
	chimeSound.RollOffMaxDistance = 60
	chimeSound.Parent = pad
end

local activated = false

local function activateVisuals()
	pad.Material = Enum.Material.Neon
	TweenService:Create(pad, TweenInfo.new(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
		Color = Color3.fromRGB(0, 255, 230)
	}):Play()
	TweenService:Create(light, TweenInfo.new(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
		Brightness = 3
	}):Play()
	chimeSound:Play()
end

pad.Touched:Connect(function(hit)
	if not hit or not hit.Parent then return end
	local character = hit.Parent
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if not humanoid or humanoid.Health <= 0 then return end

	local player = Players:GetPlayerFromCharacter(character)
	if not player then return end

	local currentCp = player:GetAttribute("CurrentCheckpoint") or 0
	if checkpointIndex == currentCp + 1 then
		player:SetAttribute("CurrentCheckpoint", checkpointIndex)
		player:SetAttribute("LastSafeCFrame", pad.CFrame + Vector3.new(0, 3.5, 0))
		
		if not activated then
			activated = true
			activateVisuals()
		end
	end
end)
