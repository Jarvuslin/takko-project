local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local SCOPE = "Forge_GuidedDemo"
local shared = ReplicatedStorage:FindFirstChild(SCOPE)
if not shared then
	shared = Instance.new("Folder")
	shared.Name = SCOPE
	shared.Parent = ReplicatedStorage
end

local Combo = require(shared:WaitForChild("Combo"))
local Config = require(shared:WaitForChild("ComboConfig"))

local remote = shared:FindFirstChild("ComboRemote")
if not remote then
	remote = Instance.new("RemoteEvent")
	remote.Name = "ComboRemote"
	remote.Parent = shared
end

local states = {}

local function getScopeFolder()
	return workspace:FindFirstChild(SCOPE)
end

local function getTarget()
	local folder = getScopeFolder()
	return folder and folder:FindFirstChild("StrawTarget") or nil
end

local function publish(player, state)
	player:SetAttribute("ComboNonce", state.server.nonce)
	player:SetAttribute("Hits", state.server.counter)
	player:SetAttribute("ComboHits", state.server.comboCounter)
end

local function getRoot(player)
	local character = player.Character
	if not character then return nil, nil end
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	local root = character:FindFirstChild("HumanoidRootPart")
	if not humanoid or not root or humanoid.Health <= 0 then return nil, nil end
	return root, character
end

local function nearestPoint(part, p)
	local localPos = part.CFrame:PointToObjectSpace(p)
	local h = part.Size / 2
	local c = Vector3.new(
		math.clamp(localPos.X, -h.X, h.X),
		math.clamp(localPos.Y, -h.Y, h.Y),
		math.clamp(localPos.Z, -h.Z, h.Z)
	)
	return part.CFrame:PointToWorldSpace(c)
end

-- Every field is computed here on the server; nothing comes from the client.
local function computeTarget(player)
	local root, character = getRoot(player)
	local target = getTarget()
	local record = {id = "StrawTarget", alive = false, inScope = false, distance = math.huge, facing = -1, lineOfSight = false}
	if not root or not target then
		return record
	end
	local folder = getScopeFolder()
	record.alive = target.Parent ~= nil
	record.inScope = folder ~= nil and target:IsDescendantOf(folder)

	local params = RaycastParams.new()
	params.FilterType = Enum.RaycastFilterType.Exclude
	params.FilterDescendantsInstances = {character}

	local origin = root.Position
	local best
	for _, part in ipairs(target:GetDescendants()) do
		if part:IsA("BasePart") then
			local point = nearestPoint(part, origin)
			local offset = point - origin
			local dist = offset.Magnitude
			local flat = Vector3.new(offset.X, 0, offset.Z)
			local facing = 1
			if flat.Magnitude > 0.001 then
				local look = root.CFrame.LookVector
				look = Vector3.new(look.X, 0, look.Z)
				if look.Magnitude > 0.001 then
					facing = look.Unit:Dot(flat.Unit)
				end
			end
			local los = false
			if dist <= Config.options.range + 1 then
				local dir = offset
				if dist > 0.001 then
					local result = workspace:Raycast(origin, dir + dir.Unit * 0.1, params)
					los = result == nil or result.Instance:IsDescendantOf(target)
				else
					los = true
				end
			end
			local passes = los and dist <= Config.options.range and facing >= Config.options.minFacingDot
			if not best or (passes and not best.passes) or (passes == best.passes and dist < best.dist) then
				best = {dist = dist, facing = facing, los = los, passes = passes}
			end
		end
	end
	if best then
		record.distance = best.dist
		record.facing = best.facing
		record.lineOfSight = best.los
	end
	return record
end

local function rotateNotify(player, state)
	publish(player, state)
end

local function setupPlayer(player)
	local state = {server = Combo.server(Config.segments, Config.options), connections = {}}
	states[player] = state
	publish(player, state)

	local function onCharacter(character)
		Combo.respawn(state.server)
		publish(player, state)
		local humanoid = character:WaitForChild("Humanoid", 10)
		if humanoid then
			humanoid.Died:Connect(function()
				Combo.death(nil, state.server, os.clock())
				publish(player, state)
			end)
		end
	end

	state.connections[1] = player.CharacterAdded:Connect(onCharacter)
	state.connections[2] = player.CharacterRemoving:Connect(function()
		Combo.cancel(state.server)
		state.server.alive = false
		publish(player, state)
	end)
	if player.Character then
		task.spawn(onCharacter, player.Character)
	end
end

Players.PlayerAdded:Connect(setupPlayer)
for _, p in ipairs(Players:GetPlayers()) do
	setupPlayer(p)
end

Players.PlayerRemoving:Connect(function(player)
	local state = states[player]
	if state then
		for _, c in ipairs(state.connections) do
			c:Disconnect()
		end
		Combo.cancel(state.server)
		states[player] = nil
	end
end)

remote.OnServerEvent:Connect(function(player, nonce, index)
	local state = states[player]
	if not state or type(nonce) ~= "number" or type(index) ~= "number" then
		return
	end
	local root = getRoot(player)
	if not root then
		return
	end
	local ok = Combo.accept(state.server, nonce, index, os.clock())
	if not ok then
		-- resync; the client resets when ComboNonce differs or via the re-published value
		publish(player, state)
	end
end)

RunService.Heartbeat:Connect(function()
	local now = os.clock()
	for player, state in pairs(states) do
		local s = state.server
		for _, i in ipairs(Combo.due(s, now)) do
			local target = computeTarget(player)
			Combo.hit(s, s.nonce, now, target, i)
		end
		Combo.finish(s, now)
		publish(player, state)
	end
end)
