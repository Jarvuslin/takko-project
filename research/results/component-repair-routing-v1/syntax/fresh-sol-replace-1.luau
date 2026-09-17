local Players = game:GetService("Players")
local Debris = game:GetService("Debris")

local root = script.Parent
local combat = root:WaitForChild("CombatSystem")
local remote = combat:WaitForChild("Punching")

if combat:GetAttribute("ServerBound") then
	return
end
combat:SetAttribute("ServerBound", true)

local function value(className, name, initial)
	local object = combat:FindFirstChild(name)
	if not object or not object:IsA(className) then
		if object then object:Destroy() end
		object = Instance.new(className)
		object.Name = name
		object.Parent = combat
	end
	object.Value = initial
	return object
end

local targetValue = value("ObjectValue", "TrainingDummy", nil)
local healthValue = value("IntValue", "DummyHealth", 100)
local maxHealthValue = value("IntValue", "DummyMaxHealth", 100)
local hitsValue = value("IntValue", "AcceptedHits", 0)
local statusValue = value("StringValue", "DummyStatus", "Unbound")

local DAMAGE = {10, 12, 18}
local WINDUP = {0.18, 0.20, 0.24}
local RECOVERY = {0.32, 0.34, 0.44}
local RANGE = 5.5
local COMBO_WINDOW = 0.75
local RESET_DELAY = 2

local states = {}
local target
local targetHumanoid
local targetPivot
local targetGeneration = 0
local defeated = false

local function send(player, phase, step, reason)
	remote:FireClient(player, {
		phase = phase,
		step = step or 0,
		reason = reason or "",
		health = healthValue.Value,
		maxHealth = maxHealthValue.Value,
		hits = hitsValue.Value,
	})
end

local function getRoot(model)
	if not model then return nil end
	return model:FindFirstChild("HumanoidRootPart", true) or model.PrimaryPart
end

local function resetAttackStates()
	for _, state in pairs(states) do
		state.token += 1
		state.activeUntil = 0
		state.nextStep = 1
		state.comboUntil = 0
	end
end

local function restoreDummy(clearCount)
	defeated = false
	healthValue.Value = maxHealthValue.Value
	if clearCount then
		hitsValue.Value = 0
	end
	resetAttackStates()
	if target and target.Parent then
		target:SetAttribute("StrikeLabDefeated", false)
		if targetPivot then
			target:PivotTo(targetPivot)
		end
		if targetHumanoid and targetHumanoid.Parent then
			targetHumanoid.PlatformStand = false
			targetHumanoid.Health = targetHumanoid.MaxHealth
		end
		statusValue.Value = "Ready"
	else
		statusValue.Value = "Unbound"
	end
end

local function bindTarget(candidate)
	targetGeneration += 1
	target = nil
	targetHumanoid = nil
	targetPivot = nil
	defeated = false
	if not candidate or not candidate:IsA("Model") or not candidate:IsDescendantOf(workspace) then
		statusValue.Value = "Unbound"
		return
	end
	if candidate:GetAttribute("StrikeLabTrainingDummy") ~= true then
		statusValue.Value = "InvalidTarget"
		return
	end
	local humanoid = candidate:FindFirstChildWhichIsA("Humanoid", true)
	if not humanoid or not getRoot(candidate) then
		statusValue.Value = "InvalidTarget"
		return
	end
	target = candidate
	targetHumanoid = humanoid
	targetPivot = candidate:GetPivot()
	humanoid.BreakJointsOnDeath = false
	humanoid.MaxHealth = maxHealthValue.Value
	restoreDummy(false)
end

targetValue.Changed:Connect(function()
	bindTarget(targetValue.Value)
end)
bindTarget(targetValue.Value)

local function playSound(name, parent)
	local source = combat:FindFirstChild(name)
	if not source or not source:IsA("Sound") or source.SoundId == "" or not parent then
		return
	end
	local sound = source:Clone()
	sound.Parent = parent
	sound:Play()
	Debris:AddItem(sound, math.max(sound.TimeLength + 0.5, 2))
end

local function emitHit(model)
	local source = combat:FindFirstChild("HitEffect")
	local attachmentPart = model and (model:FindFirstChild("UpperTorso", true) or getRoot(model))
	if source and source:IsA("ParticleEmitter") and attachmentPart then
		local effect = source:Clone()
		effect.Enabled = false
		effect.Parent = attachmentPart
		effect:Emit(12)
		Debris:AddItem(effect, 2)
	end
end

local function getState(player)
	local state = states[player]
	if not state then
		state = {token = 0, activeUntil = 0, nextStep = 1, comboUntil = 0, lastRequest = 0, lastReset = 0}
		states[player] = state
	end
	return state
end

local function liveCharacter(player)
	local character = player.Character
	local humanoid = character and character:FindFirstChildWhichIsA("Humanoid")
	local rootPart = character and character:FindFirstChild("HumanoidRootPart")
	if not character or not humanoid or humanoid.Health <= 0 or not rootPart then
		return nil, nil
	end
	return character, rootPart
end

local function requestAttack(player)
	local now = time()
	local state = getState(player)
	if now - state.lastRequest < 0.05 then
		send(player, "Rejected", state.nextStep, "Rate")
		return
	end
	state.lastRequest = now
	if now < state.activeUntil then
		send(player, "Rejected", state.nextStep, "Recovery")
		return
	end
	local character, playerRoot = liveCharacter(player)
	if not character then
		send(player, "Rejected", state.nextStep, "Character")
		return
	end
	if now > state.comboUntil then
		state.nextStep = 1
	end
	local step = state.nextStep
	local duration = WINDUP[step] + RECOVERY[step]
	state.token += 1
	local token = state.token
	state.activeUntil = now + duration
	local generation = targetGeneration
	playSound("Swing", playerRoot)
	send(player, "Windup", step, "")

	task.delay(WINDUP[step], function()
		if not states[player] or state.token ~= token then return end
		local _, currentPlayerRoot = liveCharacter(player)
		local currentTargetRoot = getRoot(target)
		if generation ~= targetGeneration or defeated or not currentPlayerRoot or not currentTargetRoot or not targetHumanoid or not targetHumanoid.Parent then
			send(player, "Miss", step, "NoTarget")
		else
			local distance = (currentPlayerRoot.Position - currentTargetRoot.Position).Magnitude
			if distance > RANGE then
				send(player, "Miss", step, "Range")
			else
				local damage = DAMAGE[step]
				healthValue.Value = math.max(0, healthValue.Value - damage)
				hitsValue.Value += 1
				targetHumanoid.Health = math.max(1, math.min(targetHumanoid.MaxHealth, healthValue.Value))
				emitHit(target)
				playSound(step == 3 and "Punched2" or "Punched1", currentTargetRoot)
				send(player, "Hit", step, "")
				if healthValue.Value <= 0 then
					defeated = true
					statusValue.Value = "Defeated"
					target:SetAttribute("StrikeLabDefeated", true)
					resetAttackStates()
					local defeatGeneration = targetGeneration
					task.delay(RESET_DELAY, function()
						if defeatGeneration == targetGeneration and defeated then
							restoreDummy(false)
						end
					end)
				end
			end
		end
		if state.token == token then
			send(player, "Recovery", step, "")
		end
	end)

	task.delay(duration, function()
		if not states[player] or state.token ~= token then return end
		state.activeUntil = 0
		state.nextStep = step % 3 + 1
		state.comboUntil = time() + COMBO_WINDOW
		send(player, "Ready", state.nextStep, "")
	end)
end

remote.OnServerEvent:Connect(function(player, action)
	if action == "Attack" then
		requestAttack(player)
	elseif action == "Reset" then
		local state = getState(player)
		local now = time()
		if now - state.lastReset >= 1 then
			state.lastReset = now
			restoreDummy(true)
			send(player, "Reset", 1, "")
		else
			send(player, "Rejected", 1, "ResetRate")
		end
	end
end)

local function bindPlayer(player)
	player.CharacterAdded:Connect(function()
		local state = getState(player)
		state.token += 1
		state.activeUntil = 0
		state.nextStep = 1
		state.comboUntil = 0
	end)
end

for _, player in ipairs(Players:GetPlayers()) do bindPlayer(player) end
Players.PlayerAdded:Connect(bindPlayer)
Players.PlayerRemoving:Connect(function(player)
	states[player] = nil
end)
