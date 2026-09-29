--!strict
-- Single-attack punch input: binds one input action, plays the punch animation clip,
-- and fires the shared PunchAttempt remote. This script never computes or trusts a local
-- hit result -- all hit validation, cooldown enforcement and counting is server-authoritative
-- in PunchValidator.server.luau (punch_validator_server task).

local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local sharedRoot = ReplicatedStorage:WaitForChild("Forge_8a81efe9b8ed")
local PunchConfig = require(sharedRoot:WaitForChild("PunchConfig")) :: any
local PunchRemotes = require(sharedRoot:WaitForChild("PunchRemotes")) :: any

-- NOTE (punch_animation requirement): this is the retrieved asset (assetId 12061946559).
-- Publishing a final experience with this clip is currently BLOCKED because no permitted
-- published animation id has been supplied for this game -- only a Studio-only temporary
-- registration id is available, which plays correctly for in-Studio testing but is not valid
-- for a published place. The wiring below is correct and will work unchanged once a
-- publishable AnimationId is provided; until then this is reported as an unmet dependency
-- rather than claimed as fully resolved (see coverage for this requirement).
local PUNCH_ANIMATION_ID = "rbxassetid://12061946559"

local player = Players.LocalPlayer

local humanoid: Humanoid? = nil
local punchAnimationTrack: AnimationTrack? = nil

local characterConnections: { RBXScriptConnection } = {}

local lastPunchTime = 0

local function disconnectCharacterConnections()
	for _, connection in characterConnections do
		connection:Disconnect()
	end
	table.clear(characterConnections)
end

local function loadPunchAnimation(hum: Humanoid)
	local animator = hum:FindFirstChildOfClass("Animator")
	if not animator then
		animator = Instance.new("Animator")
		animator.Parent = hum
	end

	local animation = Instance.new("Animation")
	animation.AnimationId = PUNCH_ANIMATION_ID

	local ok, track = pcall(function()
		return (animator :: Animator):LoadAnimation(animation)
	end)

	if ok and track then
		punchAnimationTrack = track :: AnimationTrack
	else
		punchAnimationTrack = nil
		warn("[PunchController] Failed to load punch animation track; punch input will still fire but no animation will play.")
	end
end

local function onCharacterAdded(character: Model)
	disconnectCharacterConnections()
	punchAnimationTrack = nil

	local hum = character:WaitForChild("Humanoid") :: Humanoid
	humanoid = hum

	loadPunchAnimation(hum)

	local diedConnection = hum.Died:Connect(function()
		punchAnimationTrack = nil
	end)
	table.insert(characterConnections, diedConnection)
end

local function onCharacterRemoving(_character: Model)
	disconnectCharacterConnections()
	humanoid = nil
	punchAnimationTrack = nil
end

local function tryPunch()
	local hum = humanoid
	if not hum or hum.Health <= 0 then
		return
	end

	local now = os.clock()
	if now - lastPunchTime < PunchConfig.CooldownSeconds then
		-- Local UX-only gate so the input feels responsive/throttled; the server independently
		-- enforces its own authoritative per-player cooldown regardless of what this client sends.
		return
	end
	lastPunchTime = now

	if punchAnimationTrack then
		punchAnimationTrack:Play()
	end

	PunchRemotes.PunchAttempt:FireServer()
end

local function onInputBegan(input: InputObject, gameProcessedEvent: boolean)
	if gameProcessedEvent then
		return
	end

	if
		input.UserInputType == Enum.UserInputType.MouseButton1
		or input.KeyCode == Enum.KeyCode.F
		or input.KeyCode == Enum.KeyCode.ButtonR2
	then
		tryPunch()
	end
end

player.CharacterAdded:Connect(onCharacterAdded)
player.CharacterRemoving:Connect(onCharacterRemoving)

if player.Character then
	onCharacterAdded(player.Character)
end

UserInputService.InputBegan:Connect(onInputBegan)
