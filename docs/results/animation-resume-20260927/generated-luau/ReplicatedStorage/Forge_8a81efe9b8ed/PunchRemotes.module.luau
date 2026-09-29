--!strict
-- Shared RemoteEvent accessor module for the punch loop.
-- Creates (server) or waits for (client) a single set of RemoteEvents under this namespace's
-- ReplicatedStorage folder so punch_input_client and punch_validator_server share identical instances
-- without either task needing to declare scene nodes that the other also declares.

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

export type PunchRemotes = {
	-- Client -> Server: "I attempted a punch". No payload is trusted for hit validation;
	-- the server independently re-checks distance/aim/cooldown against the dummy.
	PunchAttempt: RemoteEvent,
	-- Server -> Client: "Your confirmed hit count is now N" (sent only to the attacking player).
	CounterUpdated: RemoteEvent,
}

local FOLDER_NAME = "PunchRemoteEvents"
local PUNCH_ATTEMPT_NAME = "PunchAttempt"
local COUNTER_UPDATED_NAME = "CounterUpdated"

local function getOrCreateFolder(): Instance
	local namespaceRoot = ReplicatedStorage:FindFirstChild("Forge_8a81efe9b8ed")
	if not namespaceRoot then
		if RunService:IsServer() then
			namespaceRoot = Instance.new("Folder")
			namespaceRoot.Name = "Forge_8a81efe9b8ed"
			namespaceRoot.Parent = ReplicatedStorage
		else
			namespaceRoot = ReplicatedStorage:WaitForChild("Forge_8a81efe9b8ed")
		end
	end

	local folder = namespaceRoot:FindFirstChild(FOLDER_NAME)
	if not folder then
		if RunService:IsServer() then
			folder = Instance.new("Folder")
			folder.Name = FOLDER_NAME
			folder.Parent = namespaceRoot
		else
			folder = namespaceRoot:WaitForChild(FOLDER_NAME)
		end
	end

	return folder
end

local function getOrCreateRemote(folder: Instance, name: string): RemoteEvent
	local existing = folder:FindFirstChild(name)
	if existing and existing:IsA("RemoteEvent") then
		return existing
	end

	if RunService:IsServer() then
		local remote = Instance.new("RemoteEvent")
		remote.Name = name
		remote.Parent = folder
		return remote
	end

	return folder:WaitForChild(name) :: RemoteEvent
end

local folder = getOrCreateFolder()

local PunchRemotes: PunchRemotes = {
	PunchAttempt = getOrCreateRemote(folder, PUNCH_ATTEMPT_NAME),
	CounterUpdated = getOrCreateRemote(folder, COUNTER_UPDATED_NAME),
}

return PunchRemotes
