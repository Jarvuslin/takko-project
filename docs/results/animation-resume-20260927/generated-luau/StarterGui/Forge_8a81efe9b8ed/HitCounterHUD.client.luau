--!strict
-- Persistent top-right hit counter HUD. Creates a ScreenGui (ResetOnSpawn = false) directly in
-- the local player's PlayerGui, with a Frame (not a bare TextLabel) parented inside it holding the
-- numeric label, per the presentation contract. ResetOnSpawn = false means Roblox's automatic
-- respawn reset will NOT tear down/recreate this ScreenGui on character respawn, so the counter
-- keeps its live value across deaths. As an extra guard against this LocalScript itself ever
-- running more than once for this player (e.g. if something outside our control re-executes it),
-- this script first checks PlayerGui for an already-existing HUD by name and reuses its label
-- instead of constructing a second overlapping ScreenGui/Frame/Label, so there can never be a
-- duplicate or stale HUD visible at once.

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local sharedRoot = ReplicatedStorage:WaitForChild("Forge_8a81efe9b8ed")
local PunchRemotes = require(sharedRoot:WaitForChild("PunchRemotes")) :: any

local HUD_NAME = "HitCounterHUD"
local FRAME_NAME = "CounterFrame"
local LABEL_NAME = "CounterLabel"

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui") :: PlayerGui

local function findExistingLabel(): TextLabel?
	local existingGui = playerGui:FindFirstChild(HUD_NAME)
	if not existingGui or not existingGui:IsA("ScreenGui") then
		return nil
	end
	local existingFrame = existingGui:FindFirstChild(FRAME_NAME)
	if not existingFrame or not existingFrame:IsA("Frame") then
		return nil
	end
	local existingLabel = existingFrame:FindFirstChild(LABEL_NAME)
	if existingLabel and existingLabel:IsA("TextLabel") then
		return existingLabel
	end
	return nil
end

local function buildHud(): TextLabel
	local screenGui = Instance.new("ScreenGui")
	screenGui.Name = HUD_NAME
	-- Critical for surviving respawns without being reset/recreated by the engine.
	screenGui.ResetOnSpawn = false
	screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling

	-- Frame lives inside the ScreenGui (not a bare label directly in PlayerGui), anchored to the
	-- top-right corner of the screen per the environment/theme contract.
	local frame = Instance.new("Frame")
	frame.Name = FRAME_NAME
	frame.AnchorPoint = Vector2.new(1, 0)
	frame.Position = UDim2.new(1, -16, 0, 16)
	frame.Size = UDim2.new(0, 150, 0, 50)
	frame.BackgroundColor3 = Color3.fromRGB(28, 28, 28)
	frame.BackgroundTransparency = 0.2
	frame.BorderSizePixel = 0
	frame.Parent = screenGui

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 8)
	corner.Parent = frame

	local stroke = Instance.new("UIStroke")
	stroke.Color = Color3.fromRGB(180, 40, 40)
	stroke.Thickness = 2
	stroke.Parent = frame

	local label = Instance.new("TextLabel")
	label.Name = LABEL_NAME
	label.BackgroundTransparency = 1
	label.Size = UDim2.new(1, 0, 1, 0)
	label.Font = Enum.Font.GothamBold
	label.TextScaled = true
	label.TextColor3 = Color3.fromRGB(255, 255, 255)
	label.Text = "Hits: 0"
	label.Parent = frame

	screenGui.Parent = playerGui

	return label
end

-- Reuse an existing HUD's label if one is already present; otherwise build exactly one.
local counterLabel: TextLabel = findExistingLabel() or buildHud()

local function setCount(count: number)
	counterLabel.Text = string.format("Hits: %d", count)
end

-- Start at 0 immediately on load; the server will push authoritative updates thereafter via
-- CounterUpdated (fired only to this attacking client), so this label always reflects the
-- server-held per-UserId hitCount rather than any locally-guessed value.
setCount(0)

PunchRemotes.CounterUpdated.OnClientEvent:Connect(function(newCount: number)
	setCount(newCount)
end)
