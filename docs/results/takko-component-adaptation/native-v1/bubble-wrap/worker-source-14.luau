--!strict
local TweenService = game:GetService("TweenService")

local bubblePart = script.Parent :: BasePart
local clickDetector = bubblePart:FindFirstChildOfClass("ClickDetector")
local sound = bubblePart:FindFirstChildOfClass("Sound")

local isPopped = false
bubblePart:SetAttribute("Popped", false)

local originalSize = bubblePart.Size
local originalTransparency = bubblePart.Transparency

local function pop()
	if isPopped then return end
	isPopped = true
	bubblePart:SetAttribute("Popped", true)

	if clickDetector then
		clickDetector.MaxActivationDistance = 0
	end

	if sound then
		sound:Play()
	end

	local squashInfo = TweenInfo.new(0.08, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
	local squashGoal = {
		Size = Vector3.new(originalSize.X * 1.15, math.max(0.05, originalSize.Y * 0.25), originalSize.Z * 1.15),
		Transparency = 0.65,
	}
	local tween = TweenService:Create(bubblePart, squashInfo, squashGoal)
	tween:Play()
end

local function reset()
	isPopped = false
	bubblePart:SetAttribute("Popped", false)
	bubblePart.Size = originalSize
	bubblePart.Transparency = originalTransparency
	if clickDetector then
		clickDetector.MaxActivationDistance = 32
	end
end

if clickDetector then
	clickDetector.MouseClick:Connect(function()
		pop()
	end)
end

bubblePart:GetAttributeChangedSignal("Reset"):Connect(function()
	if bubblePart:GetAttribute("Reset") == true then
		reset()
		bubblePart:SetAttribute("Reset", false)
	end
end)
