local TweenService = game:GetService("TweenService")
local Debris = game:GetService("Debris")

local Feedback = {}
local effectFolder
local goalHighlight
local activeTweens = {}

local function getFolder()
	if effectFolder and effectFolder.Parent then return effectFolder end
	local root = workspace:FindFirstChild("Forge_GenerationPilot")
	if not root then return nil end
	effectFolder = Instance.new("Folder")
	effectFolder.Name = "LocalFeedbackEffects"
	effectFolder.Parent = root
	return effectFolder
end

local function pulseButton(hud, buttonName, color)
	if not hud or not hud[buttonName] then return end
	local button = hud[buttonName]
	if not button.Parent then return end
	local original = button.BackgroundColor3
	local existing = activeTweens[button]
	if existing then existing:Cancel() end
	button.BackgroundColor3 = color
	local tween = TweenService:Create(button, TweenInfo.new(0.35, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {BackgroundColor3 = original})
	activeTweens[button] = tween
	tween:Play()
	tween.Completed:Connect(function()
		if activeTweens[button] == tween then activeTweens[button] = nil end
	end)
end

local function pulseCoins(hud)
	if not hud or not hud.coinsLabel or not hud.coinsLabel.Parent then return end
	local label = hud.coinsLabel
	local originalColor = label.TextColor3
	local originalSize = label.TextSize
	local existing = activeTweens[label]
	if existing then existing:Cancel() end
	label.TextColor3 = Color3.fromRGB(255, 236, 130)
	label.TextSize = originalSize + 4
	local tween = TweenService:Create(label, TweenInfo.new(0.45, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {TextColor3 = originalColor, TextSize = originalSize})
	activeTweens[label] = tween
	tween:Play()
	tween.Completed:Connect(function()
		if activeTweens[label] == tween then activeTweens[label] = nil end
	end)
end

local function harvestSparkle(position)
	local folder = getFolder()
	if not folder or typeof(position) ~= "Vector3" then return end
	local orb = Instance.new("Part")
	orb.Name = "HarvestSparkle"
	orb.Shape = Enum.PartType.Ball
	orb.Size = Vector3.new(0.35, 0.35, 0.35)
	orb.CFrame = CFrame.new(position + Vector3.new(0, 2.2, 0))
	orb.Anchored = true; orb.CanCollide = false; orb.CanQuery = false
	orb.Material = Enum.Material.Neon; orb.Color = Color3.fromRGB(100, 235, 255); orb.Transparency = 0.1
	orb.Parent = folder
	local emitter = Instance.new("ParticleEmitter")
	emitter.Name = "CrystalBurst"
	emitter.Color = ColorSequence.new(Color3.fromRGB(85, 235, 255), Color3.fromRGB(174, 115, 255))
	emitter.LightEmission = 0.8; emitter.Lifetime = NumberRange.new(0.25, 0.55); emitter.Speed = NumberRange.new(2, 5)
	emitter.SpreadAngle = Vector2.new(360, 360); emitter.Rate = 0
	emitter.Size = NumberSequence.new({NumberSequenceKeypoint.new(0, 0.18), NumberSequenceKeypoint.new(0.7, 0.1), NumberSequenceKeypoint.new(1, 0)})
	emitter.Parent = orb; emitter:Emit(18)
	TweenService:Create(orb, TweenInfo.new(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {Size = Vector3.new(1.1, 1.1, 1.1), Transparency = 1, CFrame = orb.CFrame + Vector3.new(0, 1.1, 0)}):Play()
	Debris:AddItem(orb, 0.75)
end

local function ensureGoalGlow()
	if goalHighlight and goalHighlight.Parent then return end
	local root = workspace:FindFirstChild("Forge_GenerationPilot")
	local world = root and root:FindFirstChild("World")
	local beacon = world and world:FindFirstChild("Beacon")
	if not beacon then return end
	goalHighlight = Instance.new("Highlight")
	goalHighlight.Name = "LocalBeaconGlow"
	goalHighlight.Adornee = beacon
	goalHighlight.FillColor = Color3.fromRGB(80, 225, 255)
	goalHighlight.OutlineColor = Color3.fromRGB(190, 125, 255)
	goalHighlight.FillTransparency = 0.28; goalHighlight.OutlineTransparency = 0
	goalHighlight.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop
	goalHighlight.Parent = beacon
end

function Feedback.play(payload, hud)
	if type(payload) ~= "table" then return end
	local kind = payload.kind
	if kind == "harvest" then
		harvestSparkle(payload.position); pulseButton(hud, "harvestButton", Color3.fromRGB(75, 190, 205))
	elseif kind == "sell" then
		pulseButton(hud, "sellButton", Color3.fromRGB(255, 172, 58)); pulseCoins(hud)
	elseif kind == "upgrade" then
		local target = string.find(tostring(payload.message), "Pick") and "powerButton" or "capacityButton"
		pulseButton(hud, target, Color3.fromRGB(151, 112, 245))
	elseif kind == "goal" then
		ensureGoalGlow()
		if not payload.steady and hud then hud.toast(payload.message) end
		return
	end
	if hud and payload.message then hud.toast(payload.message) end
end

function Feedback.destroy()
	for object, tween in pairs(activeTweens) do
		tween:Cancel(); activeTweens[object] = nil
	end
	if effectFolder then effectFolder:Destroy(); effectFolder = nil end
	if goalHighlight then goalHighlight:Destroy(); goalHighlight = nil end
end

return Feedback