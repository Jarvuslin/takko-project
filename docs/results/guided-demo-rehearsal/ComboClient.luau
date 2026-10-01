local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local KeyframeSequenceProvider = game:GetService("KeyframeSequenceProvider")

local SCOPE = "Forge_GuidedDemo"
local player = Players.LocalPlayer
local shared = ReplicatedStorage:WaitForChild(SCOPE)
local Combo = require(shared:WaitForChild("Combo"))
local Config = require(shared:WaitForChild("ComboConfig"))
local remote = shared:WaitForChild("ComboRemote")

local client = Combo.client(Config.segments, Config.options)
local track = nil
local humanoid = nil
local animationId = nil

local function getAnimationId()
	if animationId then return animationId end
	local source = shared:WaitForChild("PunchSequence", 10) or ReplicatedStorage:FindFirstChild("PunchSequence", true)
	if not source then return nil end
	if not source:IsA("KeyframeSequence") then
		source = source:FindFirstChildWhichIsA("KeyframeSequence", true)
	end
	if not source then return nil end
	local ok, result = pcall(function()
		return KeyframeSequenceProvider:RegisterKeyframeSequence(source)
	end)
	if ok then
		animationId = result -- assigned unchanged
	else
		warn("Punch sequence registration failed: " .. tostring(result))
	end
	return animationId
end

local function onCharacter(character)
	Combo.resetClient(client, os.clock(), true)
	track = nil
	humanoid = character:WaitForChild("Humanoid", 10)
	if not humanoid then return end
	local animator = humanoid:FindFirstChildOfClass("Animator") or humanoid:WaitForChild("Animator", 5)
	if not animator then
		animator = Instance.new("Animator")
		animator.Parent = humanoid
	end
	local id = getAnimationId()
	if id then
		local animation = Instance.new("Animation")
		animation.Name = "PunchCombo"
		animation.AnimationId = id
		local ok, loaded = pcall(function()
			return animator:LoadAnimation(animation)
		end)
		if ok then
			track = loaded
			track.Priority = Enum.AnimationPriority.Action
			track.Looped = false
		else
			warn("Punch animation load failed: " .. tostring(loaded))
		end
	end
	humanoid.Died:Connect(function()
		Combo.death(client, nil, os.clock())
		if track and track.IsPlaying then
			Combo.playback(client, track)
		end
	end)
end

player.CharacterRemoving:Connect(function()
	Combo.death(client, nil, os.clock())
	if track and track.IsPlaying then
		track:Stop(0)
	end
	track = nil
	humanoid = nil
end)

player.CharacterAdded:Connect(onCharacter)
if player.Character then
	task.spawn(onCharacter, player.Character)
end

-- The server publishes the combo nonce as a replicated attribute.
local function syncNonce()
	local n = player:GetAttribute("ComboNonce")
	if type(n) == "number" and n ~= client.nonce then
		client.nonce = n
		Combo.resetClient(client, os.clock(), false)
	end
end
player:GetAttributeChangedSignal("ComboNonce"):Connect(syncNonce)
syncNonce()

local function send(index)
	if index then
		remote:FireServer(client.nonce, index)
	end
end

local function attack()
	if not track or not humanoid or humanoid.Health <= 0 then
		return
	end
	send(Combo.click(client, os.clock()))
end

UserInputService.InputBegan:Connect(function(input, processed)
	if not processed and (input.UserInputType == Enum.UserInputType.MouseButton1 or input.KeyCode == Enum.KeyCode.F) then
		attack()
	end
end)

local gui = Instance.new("ScreenGui")
gui.Name = "GuidedDemoHUD"
gui.ResetOnSpawn = false
gui.Parent = player:WaitForChild("PlayerGui")
local panel = Instance.new("TextButton")
panel.Name = "Punch"
panel.Size = UDim2.fromOffset(420, 115)
panel.Position = UDim2.new(0.5, -210, 1, -140)
panel.BackgroundColor3 = Color3.fromRGB(18, 24, 36)
panel.TextColor3 = Color3.fromRGB(255, 220, 100)
panel.TextSize = 24
panel.Font = Enum.Font.GothamBold
panel.Parent = gui
panel.Activated:Connect(attack)
local hitSound = shared:FindFirstChild("PunchSound")
if hitSound then
	hitSound = hitSound:Clone()
	hitSound.Parent = game:GetService("SoundService")
end
local lastHits = player:GetAttribute("Hits") or 0
player:GetAttributeChangedSignal("Hits"):Connect(function()
	local hits = player:GetAttribute("Hits") or 0
	if hits > lastHits and hitSound then hitSound:Play() end
	lastHits = hits
end)

RunService.Heartbeat:Connect(function()
	local started = Combo.tick(client, os.clock())
	send(started)
	if track then
		Combo.playback(client, track)
	end
	panel.Text = string.format("COMBO  %d     |     TOTAL  %d\nClick or press F to punch\nSTEP %d / 13. Pause to reset.", player:GetAttribute("ComboHits") or 0, player:GetAttribute("Hits") or 0, client.index)
end)
