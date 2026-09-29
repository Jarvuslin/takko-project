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

-- Retained component (punchAnim need, assetId 12061946559, approved clipKey 1/1/18/1): the raw
-- KeyframeSequence named "punching animation" nested inside AnimSaves under the "punching
-- animation 1" model. This is the EXACT retained path supplied by
-- retainedComponents.studioAnimation.sequencePath/code for this need, not a search/heuristic. The
-- same retained pack also contains an unrelated sibling model, "punching animation 2", with its
-- own differently-named KeyframeSequences ("Automatic Save", "Punching animation") that do NOT
-- match the approved clip and must never be picked. Traversing by exact child name at every step
-- (instead of searching all descendants for the first KeyframeSequence found, whose traversal
-- order is not guaranteed to put the approved clip first) guarantees this always resolves to the
-- approved sequence and never one of the two unrelated duplicates.
local PUNCH_ANIM_SEQUENCE_PATH = {
	"Forge_8a81efe9b8ed",
	"Assets",
	"punchAnim",
	"punchAnim",
	"punching animation 1",
	"AnimSaves",
	"punching animation",
}

local resolvedAnimationId: string? = nil

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
-- permitted published AnimationId is supplied (see coverage for this requirement). This is a
-- pre-existing, declared limitation and is out of scope for this fix.
task.spawn(function()
	local current: Instance = Workspace
	for _, name in PUNCH_ANIM_SEQUENCE_PATH do
		current = current:WaitForChild(name)
	end

	if not current:IsA("KeyframeSequence") then
		warn("[PunchController] Resolved retained animation path did not resolve to a KeyframeSequence; punch input will still fire but no animation will play.")
		return
	end

	local keyframeSequence = current :: KeyframeSequence

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
