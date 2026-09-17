local Players = game:GetService("Players")
local model = script.Parent
local bubbleWrapModel = model:WaitForChild("bubble wrap")

local popEvent = Instance.new("BindableEvent")
popEvent.Name = "BubblePoppedEvent"
popEvent.Parent = model

local netFolder = Instance.new("Folder")
netFolder.Name = "BubbleBreakNetwork"
netFolder.Parent = model

local stateRemote = Instance.new("RemoteEvent")
stateRemote.Name = "StateUpdate"
stateRemote.Parent = netFolder

local resetRemote = Instance.new("RemoteEvent")
resetRemote.Name = "ResetRequest"
resetRemote.Parent = netFolder

local bubbleParts = {}
for _, child in ipairs(bubbleWrapModel:GetChildren()) do
	if child:IsA("BasePart") and child:FindFirstChildOfClass("ClickDetector") then
		child.Anchored = true
		table.insert(bubbleParts, child)
	end
end

local totalBubbles = #bubbleParts
local poppedSet = {}
local poppedCount = 0

local function broadcastState()
	stateRemote:FireAllClients({
		poppedCount = poppedCount,
		totalCount = totalBubbles,
		isComplete = (poppedCount >= totalBubbles and totalBubbles > 0)
	})
end

popEvent.Event:Connect(function(part)
	if not poppedSet[part] then
		poppedSet[part] = true
		poppedCount = math.min(poppedCount + 1, totalBubbles)
		broadcastState()
	end
end)

local function resetSheet()
	poppedSet = {}
	poppedCount = 0
	for _, part in ipairs(bubbleParts) do
		part:SetAttribute("ResetBubble", true)
	end
	broadcastState()
end

resetRemote.OnServerEvent:Connect(function(player)
	resetSheet()
end)

Players.PlayerAdded:Connect(function(player)
	task.wait(0.5)
	stateRemote:FireClient(player, {
		poppedCount = poppedCount,
		totalCount = totalBubbles,
		isComplete = (poppedCount >= totalBubbles and totalBubbles > 0)
	})
end)
