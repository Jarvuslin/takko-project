local Debris = game:GetService("Debris")
local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")

local combatFolder = script.Parent:FindFirstChild("CombatSystem")
if not combatFolder then return end

local punchingRemote = combatFolder:FindFirstChild("Punching")
local punched1Sound = combatFolder:FindFirstChild("Punched1")
local punched2Sound = combatFolder:FindFirstChild("Punched2")
local swingSound = combatFolder:FindFirstChild("Swing")
local hitEffectTemplate = combatFolder:FindFirstChild("HitEffect")
local settingsFolder = combatFolder:FindFirstChild("Settings")

local baseDamage = 10
if settingsFolder and settingsFolder:FindFirstChild("Damage") then
	baseDamage = settingsFolder.Damage.Value
end

local ATTACK_COOLDOWN = 0.5
local MAX_ATTACK_RANGE = 7.5
local playerState = {}

local function getPlayerCombatData(player)
	if not playerState[player] then
		playerState[player] = {
			lastAttackTime = 0,
			comboStep = 1,
		}
	end
	return playerState[player]
end

Players.PlayerRemoving:Connect(function(player)
	playerState[player] = nil
end)

if punchingRemote and punchingRemote:IsA("RemoteEvent") then
	punchingRemote.OnServerEvent:Connect(function(player, requestedStep)
		local char = player.Character
		if not char then return end
		local hrp = char:FindFirstChild("HumanoidRootPart")
		local humanoid = char:FindFirstChild("Humanoid")
		if not hrp or not humanoid or humanoid.Health <= 0 then return end

		local now = os.clock()
		local combat = getPlayerCombatData(player)
		if now - combat.lastAttackTime < ATTACK_COOLDOWN then
			return
		end
		combat.lastAttackTime = now

		local step = requestedStep or combat.comboStep or 1
		combat.comboStep = (step % 2) + 1

		if swingSound and swingSound:IsA("Sound") then
			local swingClone = swingSound:Clone()
			swingClone.Parent = hrp
			swingClone:Play()
			Debris:AddItem(swingClone, 1.5)
		end

		task.delay(0.15, function()
			if not char.Parent or humanoid.Health <= 0 then return end

			local targetDummy = nil
			local minDistance = MAX_ATTACK_RANGE

			for _, descendant in ipairs(Workspace:GetDescendants()) do
				if descendant:IsA("Humanoid") and descendant.Parent ~= char and descendant.Health > 0 then
					local targetHrp = descendant.Parent:FindFirstChild("HumanoidRootPart")
					if targetHrp then
						local dist = (targetHrp.Position - hrp.Position).Magnitude
						if dist < minDistance then
							minDistance = dist
							targetDummy = descendant.Parent
						end
					end
				end
			end

			if targetDummy then
				local targetHumanoid = targetDummy:FindFirstChild("Humanoid")
				local targetTorso = targetDummy:FindFirstChild("UpperTorso") or targetDummy:FindFirstChild("Torso") or targetDummy:FindFirstChild("HumanoidRootPart")
				if targetHumanoid and targetHumanoid.Health > 0 then
					local damageToApply = baseDamage
					if step == 2 then
						damageToApply = baseDamage + 2
					end
					targetHumanoid:TakeDamage(damageToApply)

					local soundSource = if step == 1 then punched1Sound else punched2Sound
					if soundSource and soundSource:IsA("Sound") and targetTorso then
						local punchClone = soundSource:Clone()
						punchClone.Parent = targetTorso
						punchClone:Play()
						Debris:AddItem(punchClone, 1.5)
					end

					if hitEffectTemplate and hitEffectTemplate:IsA("ParticleEmitter") and targetTorso then
						local effectClone = hitEffectTemplate:Clone()
						effectClone.Parent = targetTorso
						effectClone:Emit(10)
						Debris:AddItem(effectClone, 1)
					end
				end
			end
		end)
	end)
end
