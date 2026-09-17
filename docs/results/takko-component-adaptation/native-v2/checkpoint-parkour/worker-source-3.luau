local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")

local pad = script.Parent
local order = pad:GetAttribute("CheckpointOrder") or 1

local light = pad:FindFirstChildWhichIsA("PointLight")
if not light then
	light = Instance.new("PointLight")
	light.Color = Color3.fromRGB(0, 220, 255)
	light.Range = 12
	light.Brightness = 0
	light.Parent = pad
end

local function activateVisuals()
	pad.Material = Enum.Material.Neon
	pad.Color = Color3.fromRGB(0, 220, 255)
	
	local tweenInfo = TweenInfo.new(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
	local tween = TweenService:Create(light, tweenInfo, { Brightness = 2.5, Range = 16 })
	tween:Play()
end

local function onTouched(hit)
	if not hit or not hit.Parent then return end
	local character = hit.Parent
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if not humanoid or humanoid.Health <= 0 then return end
	
	local player = Players:GetPlayerFromCharacter(character)
	if not player then return end
	
	local currentCP = player:GetAttribute("CurrentCheckpoint") or 0
	if currentCP == order - 1 then
		player:SetAttribute("CurrentCheckpoint", order)
		player:SetAttribute("LastCheckpointPosition", pad.Position + Vector3.new(0, 3.5, 0))
		activateVisuals()
		
		local sound = pad:FindFirstChildWhichIsA("Sound")
		if sound then
			sound:Play()
		end
	end
end

pad.Touched:Connect(onTouched)
