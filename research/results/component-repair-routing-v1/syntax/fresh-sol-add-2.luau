local Players = game:GetService("Players")
local ContextActionService = game:GetService("ContextActionService")

local player = Players.LocalPlayer
local combat = script.Parent:WaitForChild("CombatSystem")
local remote = combat:WaitForChild("Punching")
local animations = combat:WaitForChild("CombatAnimations")

local tracks = {}
local connections = {}
local lastPress = 0

local function disconnectCharacter()
	for _, track in pairs(tracks) do
		pcall(function() track:Stop(0.1) end)
	end
	table.clear(tracks)
end

local function loadTrack(animator, name)
	local animation = animations:FindFirstChild(name)
	if not animation or not animation:IsA("Animation") or animation.AnimationId == "" then
		return nil
	end
	local ok, track = pcall(function()
		return animator:LoadAnimation(animation)
	end)
	if ok then
		track.Priority = Enum.AnimationPriority.Action
		track.Looped = false
		return track
	end
	return nil
end

local function bindCharacter(character)
	disconnectCharacter()
	local humanoid = character:WaitForChild("Humanoid", 10)
	if not humanoid then return end
	local animator = humanoid:FindFirstChildWhichIsA("Animator") or humanoid:WaitForChild("Animator", 5)
	if not animator then return end
	tracks[1] = loadTrack(animator, "LeftPunch")
	tracks[2] = loadTrack(animator, "RightPunch")
end

if player.Character then task.spawn(bindCharacter, player.Character) end
table.insert(connections, player.CharacterAdded:Connect(bindCharacter))
table.insert(connections, player.CharacterRemoving:Connect(disconnectCharacter))

local function attackAction(_, inputState)
	if inputState ~= Enum.UserInputState.Begin then
		return Enum.ContextActionResult.Pass
	end
	local now = time()
	if now - lastPress < 0.05 then
		return Enum.ContextActionResult.Sink
	end
	lastPress = now
	remote:FireServer("Attack")
	return Enum.ContextActionResult.Sink
end

local function resetAction(_, inputState)
	if inputState == Enum.UserInputState.Begin then
		remote:FireServer("Reset")
	end
	return Enum.ContextActionResult.Sink
end

ContextActionService:BindAction("StrikeLabAttack", attackAction, true, Enum.KeyCode.E, Enum.UserInputType.MouseButton1)
ContextActionService:SetTitle("StrikeLabAttack", "ATTACK")
ContextActionService:SetPosition("StrikeLabAttack", UDim2.fromScale(0.84, 0.72))
ContextActionService:BindAction("StrikeLabReset", resetAction, true, Enum.KeyCode.R)
ContextActionService:SetTitle("StrikeLabReset", "RESET")
ContextActionService:SetPosition("StrikeLabReset", UDim2.fromScale(0.68, 0.82))

local serial = 0
table.insert(connections, remote.OnClientEvent:Connect(function(result)
	if typeof(result) ~= "table" or typeof(result.phase) ~= "string" then return end
	serial += 1
	combat:SetAttribute("ClientResultSerial", serial)
	combat:SetAttribute("ClientPhase", result.phase)
	combat:SetAttribute("ClientReason", result.reason or "")
	combat:SetAttribute("ClientComboStep", result.step or 0)
	if result.phase == "Windup" then
		local track = tracks[result.step]
		if track then
			track:Play(0.08, 1, 1)
		else
			combat:SetAttribute("MissingAnimationStep", result.step)
		end
	end
end))

script.Destroying:Connect(function()
	ContextActionService:UnbindAction("StrikeLabAttack")
	ContextActionService:UnbindAction("StrikeLabReset")
	disconnectCharacter()
	for _, connection in ipairs(connections) do
		connection:Disconnect()
	end
end)
