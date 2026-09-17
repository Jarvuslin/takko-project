local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")

local sheet = script.Parent
local PRESS_TIME = 0.12
local SETTLE_TIME = 0.16
local RESET_TIME = 0.24
local CLICK_RATE = 0.04
local RESET_RATE = 0.75
local MAX_RESET_DISTANCE = 40

local function getOrCreate(className, name)
	local existing = sheet:FindFirstChild(name)
	if existing then
		if existing.ClassName ~= className then
			warn(("Bubble sheet contract %s has unexpected class %s"):format(name, existing.ClassName))
			return nil
		end
		return existing
	end

	local object = Instance.new(className)
	object.Name = name
	object.Parent = sheet
	return object
end

local resetRequest = getOrCreate("RemoteEvent", "ForgeResetRequest")
local popCompleted = getOrCreate("BindableEvent", "ForgePopCompleted")
local sheetCompleted = getOrCreate("BindableEvent", "ForgeSheetCompleted")
local resetCompleted = getOrCreate("BindableEvent", "ForgeResetCompleted")

local candidates = {}
for _, child in ipairs(sheet:GetChildren()) do
	if child:IsA("BasePart") then
		local detector = child:FindFirstChildOfClass("ClickDetector")
		local sound = child:FindFirstChild("Click")
		if detector and sound and sound:IsA("Sound") then
			table.insert(candidates, child)
		end
	end
end

table.sort(candidates, function(a, b)
	if a.Position.X ~= b.Position.X then
		return a.Position.X < b.Position.X
	end
	if a.Position.Z ~= b.Position.Z then
		return a.Position.Z < b.Position.Z
	end
	return a.Position.Y < b.Position.Y
end)

local bubbles = {}
local poppedCount = 0
local resetting = false
local sheetGeneration = 0
local lastClickByPlayer = {}
local lastResetByPlayer = {}
local connections = {}

local function setSheetState()
	sheet:SetAttribute("TotalBubbles", #candidates)
	sheet:SetAttribute("PoppedCount", poppedCount)
	sheet:SetAttribute("Complete", #candidates > 0 and poppedCount == #candidates)
	sheet:SetAttribute("Resetting", resetting)
	sheet:SetAttribute("BubbleSheetReady", #candidates >= 12)
end

local function validPlayerDistance(player, part, maximum)
	if not player or player.Parent ~= Players then
		return false
	end
	local character = player.Character
	local root = character and character:FindFirstChild("HumanoidRootPart")
	if not root then
		return false
	end
	return (root.Position - part.Position).Magnitude <= maximum
end

local function tweenVisual(data, pressed, duration)
	local info = TweenInfo.new(duration, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
	if data.mesh then
		local scale
		local offset
		if pressed then
			scale = Vector3.new(data.meshScale.X, data.meshScale.Y * 0.28, data.meshScale.Z)
			offset = data.meshOffset - Vector3.new(0, math.abs(data.meshScale.Y) * 0.08, 0)
		else
			scale = data.meshScale
			offset = data.meshOffset
		end
		TweenService:Create(data.mesh, info, {Scale = scale, Offset = offset}):Play()
	else
		local size = pressed and Vector3.new(data.size.X, math.max(0.05, data.size.Y * 0.28), data.size.Z) or data.size
		local frame = pressed and (data.cframe * CFrame.new(0, -(data.size.Y - size.Y) * 0.5, 0)) or data.cframe
		TweenService:Create(data.part, info, {Size = size, CFrame = frame}):Play()
	end
end

local function finishPop(data, player, generation)
	if resetting or generation ~= sheetGeneration or data.state ~= "Popping" then
		return
	end

	data.state = "Popped"
	data.part:SetAttribute("BubbleState", "Popped")
	data.part.Transparency = math.max(data.transparency, 0.62)
	poppedCount += 1
	setSheetState()

	if popCompleted then
		popCompleted:Fire(player, data.id, poppedCount, #candidates)
	end
	if poppedCount == #candidates and sheetCompleted then
		sheetCompleted:Fire(player, poppedCount)
	end
end

local function beginPop(data, player)
	if resetting or data.state ~= "Fresh" then
		return
	end
	if not validPlayerDistance(player, data.part, data.activeDistance + 3) then
		return
	end

	local now = os.clock()
	local previous = lastClickByPlayer[player] or 0
	if now - previous < CLICK_RATE then
		return
	end
	lastClickByPlayer[player] = now

	data.state = "Popping"
	data.part:SetAttribute("BubbleState", "Popping")
	data.detector.MaxActivationDistance = 0
	local generation = sheetGeneration
	tweenVisual(data, true, PRESS_TIME)

	task.delay(PRESS_TIME, function()
		if resetting or generation ~= sheetGeneration or data.state ~= "Popping" then
			return
		end
		data.sound:Stop()
		data.sound.TimePosition = 0
		data.sound:Play()
		tweenVisual(data, true, SETTLE_TIME)
		task.delay(SETTLE_TIME, function()
			finishPop(data, player, generation)
		end)
	end)
end

for index, part in ipairs(candidates) do
	local detector = part:FindFirstChildOfClass("ClickDetector")
	local sound = part:FindFirstChild("Click")
	local mesh = part:FindFirstChildOfClass("SpecialMesh")
	local activeDistance = detector.MaxActivationDistance
	if activeDistance <= 0 then
		activeDistance = 18
	else
		activeDistance = math.min(activeDistance, 18)
	end

	local data = {
		id = ("B%03d"):format(index),
		part = part,
		detector = detector,
		sound = sound,
		mesh = mesh,
		meshScale = mesh and mesh.Scale or nil,
		meshOffset = mesh and mesh.Offset or nil,
		size = part.Size,
		cframe = part.CFrame,
		transparency = part.Transparency,
		activeDistance = activeDistance,
		state = "Fresh",
	}
	bubbles[part] = data
	part:SetAttribute("BubbleId", data.id)
	part:SetAttribute("BubbleState", "Fresh")
	detector.MaxActivationDistance = activeDistance
	table.insert(connections, detector.MouseClick:Connect(function(player)
		beginPop(data, player)
	end))
end

local function beginReset(player)
	if resetting or poppedCount == 0 then
		return
	end
	if not player or player.Parent ~= Players then
		return
	end

	local center = sheet:GetBoundingBox()
	local character = player.Character
	local root = character and character:FindFirstChild("HumanoidRootPart")
	if not root or (root.Position - center.Position).Magnitude > MAX_RESET_DISTANCE then
		return
	end

	local now = os.clock()
	local previous = lastResetByPlayer[player] or 0
	if now - previous < RESET_RATE then
		return
	end
	lastResetByPlayer[player] = now

	resetting = true
	sheetGeneration += 1
	setSheetState()

	for _, data in pairs(bubbles) do
		data.state = "Resetting"
		data.part:SetAttribute("BubbleState", "Resetting")
		data.detector.MaxActivationDistance = 0
		data.sound:Stop()
		data.part.Transparency = data.transparency
		tweenVisual(data, false, RESET_TIME)
	end

	local generation = sheetGeneration
	task.delay(RESET_TIME, function()
		if generation ~= sheetGeneration then
			return
		end
		for _, data in pairs(bubbles) do
			data.state = "Fresh"
			data.part:SetAttribute("BubbleState", "Fresh")
			data.part.Transparency = data.transparency
			data.part.Size = data.size
			data.part.CFrame = data.cframe
			if data.mesh then
				data.mesh.Scale = data.meshScale
				data.mesh.Offset = data.meshOffset
			end
			data.detector.MaxActivationDistance = data.activeDistance
		end
		poppedCount = 0
		resetting = false
		setSheetState()
		if resetCompleted then
			resetCompleted:Fire(player, #candidates)
		end
	end)
end

if resetRequest then
	table.insert(connections, resetRequest.OnServerEvent:Connect(beginReset))
end

table.insert(connections, Players.PlayerRemoving:Connect(function(player)
	lastClickByPlayer[player] = nil
	lastResetByPlayer[player] = nil
end))

setSheetState()
if #candidates < 12 then
	warn(("Bubble sheet exposes only %d valid interactive bubbles; at least 12 are required"):format(#candidates))
end

script.Destroying:Connect(function()
	sheetGeneration += 1
	for _, connection in ipairs(connections) do
		connection:Disconnect()
	end
	table.clear(connections)
	table.clear(lastClickByPlayer)
	table.clear(lastResetByPlayer)
end)
