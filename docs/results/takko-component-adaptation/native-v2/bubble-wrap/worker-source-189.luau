local TweenService = game:GetService("TweenService")

local part = script.Parent
local clickDetector = part:FindFirstChildOfClass("ClickDetector")
local sound = part:FindFirstChildOfClass("Sound")
local mesh = part:FindFirstChildOfClass("SpecialMesh")
local bubbleWrapModel = part:FindFirstAncestor("working bubble wrap") or part.Parent.Parent

local initialCFrame = part.CFrame
local initialSize = part.Size
local initialTransparency = part.Transparency
local initialColor = part.Color
local initialMeshScale = mesh and mesh.Scale or Vector3.new(1, 1, 1)

local popped = false
local isPopping = false

local function popBubble(player)
	if popped or isPopping then
		return
	end
	isPopping = true

	if clickDetector then
		clickDetector.MaxActivationDistance = 0
	end

	if sound then
		sound.PlaybackSpeed = 0.95 + math.random() * 0.2
		sound:Play()
	end

	if mesh then
		local depressTween = TweenService:Create(mesh, TweenInfo.new(0.06, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
			Scale = Vector3.new(initialMeshScale.X * 1.15, initialMeshScale.Y * 0.2, initialMeshScale.Z * 1.15)
		})
		depressTween:Play()
	end

	local partTween = TweenService:Create(part, TweenInfo.new(0.06, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
		Transparency = math.clamp(initialTransparency + 0.35, 0, 0.85),
		Color = Color3.fromRGB(180, 210, 225)
	})
	partTween:Play()
	partTween.Completed:Wait()

	popped = true
	isPopping = false

	if bubbleWrapModel then
		local currentCount = bubbleWrapModel:GetAttribute("PoppedCount") or 0
		bubbleWrapModel:SetAttribute("PoppedCount", currentCount + 1)
	end
end

local function resetBubble()
	popped = false
	isPopping = false

	if mesh then
		mesh.Scale = initialMeshScale
	end
	part.CFrame = initialCFrame
	part.Size = initialSize
	part.Transparency = initialTransparency
	part.Color = initialColor

	if clickDetector then
		clickDetector.MaxActivationDistance = 32
	end
end

if clickDetector then
	clickDetector.MouseClick:Connect(popBubble)
end

if bubbleWrapModel then
	bubbleWrapModel:GetAttributeChangedSignal("ResetTrigger"):Connect(resetBubble)
end
