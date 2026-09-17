local TweenService = game:GetService("TweenService")
local part = script.Parent
local clickDetector = part:WaitForChild("ClickDetector")
local clickSound = part:WaitForChild("Click")
local mesh = part:FindFirstChildOfClass("SpecialMesh")

local originalPosition = part.Position
local originalTransparency = part.Transparency
local originalMeshScale = mesh and mesh.Scale or Vector3.new(1, 1, 1)

local isPopped = false

local function pop()
	if isPopped then return end
	isPopped = true
	part:SetAttribute("Popped", true)
	clickDetector.MaxActivationDistance = 0
	
	clickSound:Play()
	
	local tweenInfo = TweenInfo.new(0.08, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
	if mesh then
		local targetScale = Vector3.new(originalMeshScale.X * 1.15, originalMeshScale.Y * 0.25, originalMeshScale.Z * 1.15)
		TweenService:Create(mesh, tweenInfo, { Scale = targetScale }):Play()
	end
	
	local partTween = TweenService:Create(part, tweenInfo, {
		Transparency = math.clamp(originalTransparency + 0.35, 0, 0.85),
		Position = originalPosition - Vector3.new(0, 0.08, 0)
	})
	partTween:Play()
	partTween.Completed:Wait()
	
	local current = script.Parent
	while current and current.Name ~= "working bubble wrap" and current.Parent do
		current = current.Parent
	end
	if current then
		local popEvent = current:FindFirstChild("BubblePoppedEvent")
		if popEvent and popEvent:IsA("BindableEvent") then
			popEvent:Fire(part)
		end
	end
end

local function reset()
	isPopped = false
	part:SetAttribute("Popped", false)
	clickDetector.MaxActivationDistance = 32
	
	local tweenInfo = TweenInfo.new(0.2, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
	if mesh then
		TweenService:Create(mesh, tweenInfo, { Scale = originalMeshScale }):Play()
	end
	TweenService:Create(part, tweenInfo, {
		Transparency = originalTransparency,
		Position = originalPosition
	}):Play()
end

clickDetector.MouseClick:Connect(function()
	pop()
end)

part:GetAttributeChangedSignal("ResetBubble"):Connect(function()
	if part:GetAttribute("ResetBubble") == true then
		reset()
		part:SetAttribute("ResetBubble", false)
	end
end)
