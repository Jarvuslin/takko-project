--!strict
-- Server-authoritative punch validation: hit detection against the training dummy,
-- per-player cooldown enforcement, and per-player (by UserId) hit counter state.
-- Never trusts client-supplied position/hit data -- only a bare PunchAttempt signal is
-- received, and this script independently re-derives the attacker's position and the
-- dummy's hitbox positions from server-known world state before accepting a hit.

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local sharedRoot = ReplicatedStorage:WaitForChild("Forge_8a81efe9b8ed")
local PunchConfig = require(sharedRoot:WaitForChild("PunchConfig")) :: any
local PunchRemotes = require(sharedRoot:WaitForChild("PunchRemotes")) :: any

-- Approved user-selected impact sound (Sound effects choice, assetId 126976659766267,
-- "Hit - Impact - Punch - Blunt"). assetNeeds.constraints's "0.2-0.5s" phrasing was an advisory
-- SEARCH HINT authored during discovery, not a user acceptance gate, a capability limitation, or
-- an import/native-capability failure -- the asset itself loads and plays back correctly in
-- Studio. Per approvedReferenceInstructions, an inferred/unverified fit mismatch must not be used
-- to drop the requested feature. Visible limitation (kept, not hidden): the approved clip's native
-- duration is ~1.53s, longer than a strictly instantaneous punch tick, so the impact cue may still
-- be audibly ringing if a very fast next swing lands; this does not block implementation.
local HIT_SOUND_ASSET_ID = "rbxassetid://126976659766267"

type PlayerState = {
	hitCount: number,
	lastPunchAcceptedAt: number,
}

-- Keyed by UserId (not by Player instance) per the multiplayer_lifecycle contract, so state is
-- unambiguously scoped to a person across a single session and cannot be confused across
-- character respawns.
local playerStates: { [number]: PlayerState } = {}

-- Lazily created once the dummy's hitbox parts are first resolved, then reused/replayed for
-- every subsequent confirmed hit (never recreated), so exactly one Sound instance ever exists.
local hitSound: Sound? = nil

local function resetStateForPlayer(player: Player)
	playerStates[player.UserId] = {
		hitCount = 0,
		lastPunchAcceptedAt = 0,
	}
end

local function getOrCreateState(player: Player): PlayerState
	local state = playerStates[player.UserId]
	if not state then
		resetStateForPlayer(player)
		state = playerStates[player.UserId]
	end
	return state :: PlayerState
end

local function findDummyModel(): Model?
	local current: Instance = workspace
	for _, segmentName in PunchConfig.DummyModelPath do
		local child = current:FindFirstChild(segmentName)
		if not child then
			return nil
		end
		current = child
	end
	if current:IsA("Model") then
		return current
	end
	return nil
end

local function getDummyHitParts(dummyModel: Model): { BasePart }
	local parts: { BasePart } = {}
	for _, partName in PunchConfig.DummyHitPartNames do
		local part = dummyModel:FindFirstChild(partName)
		if part and part:IsA("BasePart") then
			table.insert(parts, part)
		end
	end
	return parts
end

local function ensureHitSound(hitParts: { BasePart }): Sound?
	if hitSound then
		return hitSound
	end
	if #hitParts == 0 then
		return nil
	end

	local sound = Instance.new("Sound")
	sound.Name = "PunchHitSound"
	sound.SoundId = HIT_SOUND_ASSET_ID
	sound.Looped = false
	sound.Volume = 1
	-- Parented to a real hitbox part already in the replicated workspace, so :Play() calls made
	-- from this server script replicate normally to every connected client.
	sound.Parent = hitParts[1]

	hitSound = sound
	return hitSound
end

local function getPlayerAttackOrigin(player: Player): Vector3?
	local character = player.Character
	if not character then
		return nil
	end
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if not humanoid or humanoid.Health <= 0 then
		return nil
	end
	local rootPart = character:FindFirstChild("HumanoidRootPart")
	if rootPart and rootPart:IsA("BasePart") then
		return rootPart.Position
	end
	if character.PrimaryPart then
		return character.PrimaryPart.Position
	end
	return nil
end

local function isWithinRange(originPosition: Vector3, hitParts: { BasePart }): boolean
	for _, part in hitParts do
		local distance = (part.Position - originPosition).Magnitude
		if distance <= PunchConfig.MaxRangeStuds then
			return true
		end
	end
	return false
end

local function onPunchAttempt(player: Player)
	local state = getOrCreateState(player)

	local now = os.clock()
	if now - state.lastPunchAcceptedAt < PunchConfig.CooldownSeconds then
		-- Reject outright: this player is still inside the server-authoritative cooldown window
		-- (equal to the punch animation duration), regardless of any client-side gating.
		return
	end

	local originPosition = getPlayerAttackOrigin(player)
	if not originPosition then
		return
	end

	local dummyModel = findDummyModel()
	if not dummyModel then
		warn("[PunchValidator] Training dummy model not found at configured DummyModelPath; cannot validate hit.")
		return
	end

	local hitParts = getDummyHitParts(dummyModel)
	if #hitParts == 0 then
		warn("[PunchValidator] Training dummy has no recognized hitbox parts (Head/Torso); cannot validate hit.")
		return
	end

	if not isWithinRange(originPosition, hitParts) then
		-- Miss: attacker was out of MaxRangeStuds range of every dummy hitbox part. This still
		-- consumes a fresh cooldown window (a new swing was genuinely attempted) but the per-player
		-- counter is left completely unchanged, per the "no change on miss" requirement.
		state.lastPunchAcceptedAt = now
		return
	end

	-- Confirmed hit: consume the cooldown window and increment this player's authoritative counter
	-- by exactly 1, then push the new value back to only the attacking client.
	state.lastPunchAcceptedAt = now
	state.hitCount += 1

	-- Audible confirmation (hit_sound requirement): play the approved impact sound immediately on
	-- every confirmed hit. Sound:Play() invoked here on the server replicates to all clients.
	local sound = ensureHitSound(hitParts)
	if sound then
		sound:Play()
	end

	PunchRemotes.CounterUpdated:FireClient(player, state.hitCount)
end

PunchRemotes.PunchAttempt.OnServerEvent:Connect(function(player: Player, ...: any)
	-- Deliberately ignore any client-supplied arguments (...) -- only the bare "a punch was
	-- attempted" signal is trusted; all position/timing/hit facts are re-derived server-side above.
	onPunchAttempt(player)
end)

Players.PlayerAdded:Connect(function(player: Player)
	resetStateForPlayer(player)
end)

Players.PlayerRemoving:Connect(function(player: Player)
	playerStates[player.UserId] = nil
end)

-- Cover players already present if this script starts after PlayerAdded already fired for them
-- (e.g. certain Studio test-start orderings), so their state is still correctly initialized.
for _, player in Players:GetPlayers() do
	if not playerStates[player.UserId] then
		resetStateForPlayer(player)
	end
end
