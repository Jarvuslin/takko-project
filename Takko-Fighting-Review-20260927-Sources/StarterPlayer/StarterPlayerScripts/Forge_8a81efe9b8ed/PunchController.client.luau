--!strict
-- Single-attack punch input: binds one input action, plays the punch animation clip,
-- and fires the shared PunchAttempt remote. This script never computes or trusts a local
-- hit result -- all hit validation, cooldown enforcement and counting is server-authoritative
-- in PunchValidator.server.luau (punch_validator_server task).

local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")
local KeyframeSequenceProvider = game:GetService("KeyframeSequenceProvider")

local sharedRoot = ReplicatedStorage:WaitForChild("Forge_8a81efe9b8ed")
local PunchConfig = require(sharedRoot:WaitForChild("PunchConfig")) :: any
local PunchRemotes = require(sharedRoot:WaitForChild("PunchRemotes")) :: any

local player = Players.LocalPlayer

local humanoid: Humanoid? = nil
local punchAnimationTrack: AnimationTrack? = nil

local characterConnections: { RBXScriptConnection } = {}

local lastPunchTime = 0

-- Retained component (punchAnim need, assetId 12061946559): a raw KeyframeSequence embedded
-- in the retrieved R15 punching-animation pack, instantiated in the workspace at this stable
-- host-given path (NOT the uploader's original root name). Raw KeyframeSequences cannot be
-- assigned directly to Animation.AnimationId -- they must be registered via
-- KeyframeSequenceProvider:RegisterKeyframeSequence to obtain a valid (Studio-only temporary)
-- AnimationId string, which is then loaded normally through an Animator/AnimationTrack.
local PUNCH_ANIM_ROOT_PATH = { "Forge_8a81efe9b8ed", "Assets", "punchAnim" }

local resolvedAnimationId: string? = nil

local function findKeyframeSequence(root: Instance): KeyframeSequence?
	for _, descendant in root:GetDescendants() do
		if descendant:IsA("KeyframeSequence") then
			return descendant
		end
	end
	return nil
end

local function loadPunchAnimation(hum: Humanoid)
	if not resolvedAnimationId then
		punchAnimationTrack = nil
		return
	end

	local animator = hum:FindFirstChildOfClass("Animator")
	if not animator then
		animator = Instance.new("Animator")
		animator.Parent = hum
	end

	local animation = Instance.new("Animation")
	animation.AnimationId = resolvedAnimationId

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

-- Resolve the retained KeyframeSequence into a playable AnimationId on a background thread so
-- script startup (input binding) is never blocked waiting on this scene-owned asset to exist.
-- NOTE (punch_animation requirement): RegisterKeyframeSequence yields a Studio-only temporary
-- AnimationId; it plays correctly for in-Studio testing but is not valid for a published place.
-- Publishing a final experience with this clip therefore remains an unmet dependency until a
-- permitted published AnimationId is supplied (see coverage for this requirement).
task.spawn(function()
	local current: Instance = Workspace
	for _, name in PUNCH_ANIM_ROOT_PATH do
		current = current:WaitForChild(name)
	end

	local keyframeSequence = findKeyframeSequence(current)
	if not keyframeSequence then
		warn("[PunchController] No KeyframeSequence found under retained punch animation root; punch input will still fire but no animation will play.")
		return
	end

	local ok, animationId = pcall(function()
		return KeyframeSequenceProvider:RegisterKeyframeSequence(keyframeSequence)
	end)

	if ok and animationId then
		resolvedAnimationId = animationId :: string
		-- If the character already spawned before this resolved, load the animation now.
		if humanoid then
			loadPunchAnimation(humanoid)
		end
	else
		warn("[PunchController] Failed to register retained KeyframeSequence with KeyframeSequenceProvider; punch input will still fire but no animation will play.")
	end
end)

local function disconnectCharacterConnections()
	for _, connection in characterConnections do
		connection:Disconnect()
	end
	table.clear(characterConnections)
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
