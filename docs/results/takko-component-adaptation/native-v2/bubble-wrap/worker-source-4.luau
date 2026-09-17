local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")

local regenPart = script.Parent
local bubbleWrapModel = regenPart.Parent
local bubblesFolder = bubbleWrapModel:FindFirstChild("bubble wrap")

local totalBubbles = 0
if bubblesFolder then
	for _, child in ipairs(bubblesFolder:GetChildren()) do
		if child:IsA("BasePart") and child:FindFirstChildOfClass("ClickDetector") then
			totalBubbles = totalBubbles + 1
		end
	end
end

bubbleWrapModel:SetAttribute("TotalBubbles", totalBubbles)
bubbleWrapModel:SetAttribute("PoppedCount", 0)
bubbleWrapModel:SetAttribute("ResetTrigger", 0)

local function triggerReset()
	bubbleWrapModel:SetAttribute("PoppedCount", 0)
	local currentTrigger = bubbleWrapModel:GetAttribute("ResetTrigger") or 0
	bubbleWrapModel:SetAttribute("ResetTrigger", currentTrigger + 1)
end

local resetRemote = bubbleWrapModel:FindFirstChild("ResetRequest")
if not resetRemote then
	resetRemote = Instance.new("RemoteEvent")
	resetRemote.Name = "ResetRequest"
	resetRemote.Parent = bubbleWrapModel
end

resetRemote.OnServerEvent:Connect(function(player)
	triggerReset()
end)

local function onTouched(hit)
	local character = hit and hit.Parent
	local player = character and Players:GetPlayerFromCharacter(character)
	if player then
		triggerReset()
	end
end
regenPart.Touched:Connect(onTouched)

local function createHUD(player)
	local playerGui = player:FindFirstChildOfClass("PlayerGui")
	if not playerGui or playerGui:FindFirstChild("BubbleHUD") then
		return
	end

	local screenGui = Instance.new("ScreenGui")
	screenGui.Name = "BubbleHUD"
	screenGui.ResetOnSpawn = false
	screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling

	local counterFrame = Instance.new("Frame")
	counterFrame.Name = "CounterFrame"
	counterFrame.Size = UDim2.new(0, 220, 0, 50)
	counterFrame.Position = UDim2.new(0.5, -110, 0.05, 0)
	counterFrame.BackgroundColor3 = Color3.fromRGB(30, 35, 45)
	counterFrame.BackgroundTransparency = 0.25
	counterFrame.BorderSizePixel = 0
	counterFrame.Parent = screenGui

	local counterCorner = Instance.new("UICorner")
	counterCorner.CornerRadius = UDim.new(0, 12)
	counterCorner.Parent = counterFrame

	local counterLabel = Instance.new("TextLabel")
	counterLabel.Name = "CounterLabel"
	counterLabel.Size = UDim2.new(1, 0, 1, 0)
	counterLabel.BackgroundTransparency = 1
	counterLabel.Font = Enum.Font.GothamBold
	counterLabel.TextSize = 20
	counterLabel.TextColor3 = Color3.fromRGB(240, 245, 255)
	counterLabel.Text = "Popped: 0 / " .. tostring(totalBubbles)
	counterLabel.Parent = counterFrame

	local resetButton = Instance.new("TextButton")
	resetButton.Name = "ResetButton"
	resetButton.Size = UDim2.new(0, 160, 0, 44)
	resetButton.Position = UDim2.new(0.5, -80, 0.9, -50)
	resetButton.BackgroundColor3 = Color3.fromRGB(65, 135, 220)
	resetButton.BorderSizePixel = 0
	resetButton.Font = Enum.Font.GothamBold
	resetButton.TextSize = 16
	resetButton.TextColor3 = Color3.fromRGB(255, 255, 255)
	resetButton.Text = "Reset Sheet"
	resetButton.Parent = screenGui

	local buttonCorner = Instance.new("UICorner")
	buttonCorner.CornerRadius = UDim.new(0, 10)
	buttonCorner.Parent = resetButton

	local completionBanner = Instance.new("TextLabel")
	completionBanner.Name = "CompletionBanner"
	completionBanner.Size = UDim2.new(0, 320, 0, 60)
	completionBanner.Position = UDim2.new(0.5, -160, 0.4, -30)
	completionBanner.BackgroundColor3 = Color3.fromRGB(40, 180, 110)
	completionBanner.BackgroundTransparency = 0.15
	completionBanner.BorderSizePixel = 0
	completionBanner.Font = Enum.Font.GothamBold
	completionBanner.TextSize = 22
	completionBanner.TextColor3 = Color3.fromRGB(255, 255, 255)
	completionBanner.Text = "✨ Sheet Complete! ✨"
	completionBanner.Visible = false
	completionBanner.Parent = screenGui

	local bannerCorner = Instance.new("UICorner")
	bannerCorner.CornerRadius = UDim.new(0, 14)
	bannerCorner.Parent = completionBanner

	local clientScript = Instance.new("LocalScript")
	clientScript.Name = "HUDController"
	clientScript.Source = [[
		local screenGui = script.Parent
		local counterLabel = screenGui:WaitForChild("CounterFrame"):WaitForChild("CounterLabel")
		local resetButton = screenGui:WaitForChild("ResetButton")
		local completionBanner = screenGui:WaitForChild("CompletionBanner")
		local bubbleWrapModel = workspace:FindFirstChild("working bubble wrap", true)

		if not bubbleWrapModel then return end
		local resetRemote = bubbleWrapModel:WaitForChild("ResetRequest")

		local function updateDisplay()
			local popped = bubbleWrapModel:GetAttribute("PoppedCount") or 0
			local total = bubbleWrapModel:GetAttribute("TotalBubbles") or 0
			counterLabel.Text = "Popped: " .. tostring(popped) .. " / " .. tostring(total)
			if total > 0 and popped >= total then
				completionBanner.Visible = true
			else
				completionBanner.Visible = false
			end
		end

		bubbleWrapModel:GetAttributeChangedSignal("PoppedCount"):Connect(updateDisplay)
		bubbleWrapModel:GetAttributeChangedSignal("TotalBubbles"):Connect(updateDisplay)
		resetButton.MouseButton1Click:Connect(function()
			resetRemote:FireServer()
		end)
		updateDisplay()
	]]
	clientScript.Parent = screenGui
	screenGui.Parent = playerGui
end

Players.PlayerAdded:Connect(createHUD)
for _, player in ipairs(Players:GetPlayers()) do
	createHUD(player)
end
