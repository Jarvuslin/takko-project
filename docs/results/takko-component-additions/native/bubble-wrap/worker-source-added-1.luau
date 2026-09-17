local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")
local model = script.Parent

local netFolder = model:WaitForChild("BubbleBreakNetwork", 10)
if not netFolder then return end

local stateRemote = netFolder:WaitForChild("StateUpdate")
local resetRemote = netFolder:WaitForChild("ResetRequest")

local screenGui = Instance.new("ScreenGui")
screenGui.Name = "BubbleBreakGui"
screenGui.ResetOnSpawn = false
screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
screenGui.Parent = playerGui

local topCard = Instance.new("Frame")
topCard.Name = "TopCard"
topCard.Size = UDim2.new(0, 300, 0, 64)
topCard.Position = UDim2.new(0.5, -150, 0, 16)
topCard.BackgroundColor3 = Color3.fromRGB(20, 24, 32)
topCard.BackgroundTransparency = 0.2
topCard.BorderSizePixel = 0
topCard.Parent = screenGui

local topCorner = Instance.new("UICorner")
topCorner.CornerRadius = UDim.new(0, 12)
topCorner.Parent = topCard

local topStroke = Instance.new("UIStroke")
topStroke.Color = Color3.fromRGB(255, 255, 255)
topStroke.Transparency = 0.85
topStroke.Thickness = 1
topStroke.Parent = topCard

local titleLabel = Instance.new("TextLabel")
titleLabel.Name = "TitleLabel"
titleLabel.Size = UDim2.new(1, 0, 0, 22)
titleLabel.Position = UDim2.new(0, 0, 0, 6)
titleLabel.BackgroundTransparency = 1
titleLabel.Font = Enum.Font.GothamBold
titleLabel.Text = "BUBBLE BREAK ASMR"
titleLabel.TextColor3 = Color3.fromRGB(160, 210, 255)
titleLabel.TextSize = 13
titleLabel.Parent = topCard

local counterLabel = Instance.new("TextLabel")
counterLabel.Name = "CounterLabel"
counterLabel.Size = UDim2.new(1, 0, 0, 28)
counterLabel.Position = UDim2.new(0, 0, 0, 28)
counterLabel.BackgroundTransparency = 1
counterLabel.Font = Enum.Font.GothamBlack
counterLabel.Text = "Popped: 0 / ..."
counterLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
counterLabel.TextSize = 18
counterLabel.Parent = topCard

local resetBtn = Instance.new("TextButton")
resetBtn.Name = "ResetButton"
resetBtn.Size = UDim2.new(0, 160, 0, 44)
resetBtn.Position = UDim2.new(0.5, -80, 1, -64)
resetBtn.BackgroundColor3 = Color3.fromRGB(45, 120, 235)
resetBtn.Font = Enum.Font.GothamBold
resetBtn.Text = "Reset Sheet"
resetBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
resetBtn.TextSize = 15
resetBtn.AutoButtonColor = false
resetBtn.Parent = screenGui

local resetCorner = Instance.new("UICorner")
resetCorner.CornerRadius = UDim.new(0, 10)
resetCorner.Parent = resetBtn

local resetStroke = Instance.new("UIStroke")
resetStroke.Color = Color3.fromRGB(255, 255, 255)
resetStroke.Transparency = 0.75
resetStroke.Thickness = 1.2
resetStroke.Parent = resetBtn

local completionBanner = Instance.new("Frame")
completionBanner.Name = "CompletionBanner"
completionBanner.Size = UDim2.new(0, 340, 0, 52)
completionBanner.Position = UDim2.new(0.5, -170, 0.45, -26)
completionBanner.BackgroundColor3 = Color3.fromRGB(35, 160, 90)
completionBanner.BackgroundTransparency = 0.15
completionBanner.Visible = false
completionBanner.Parent = screenGui

local bannerCorner = Instance.new("UICorner")
bannerCorner.CornerRadius = UDim.new(0, 12)
bannerCorner.Parent = completionBanner

local bannerLabel = Instance.new("TextLabel")
bannerLabel.Size = UDim2.new(1, 0, 1, 0)
bannerLabel.BackgroundTransparency = 1
bannerLabel.Font = Enum.Font.GothamBlack
bannerLabel.Text = "✨ Sheet Complete! Pure ASMR Bliss ✨"
bannerLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
bannerLabel.TextSize = 15
bannerLabel.Parent = completionBanner

resetBtn.MouseEnter:Connect(function()
	TweenService:Create(resetBtn, TweenInfo.new(0.12), {BackgroundColor3 = Color3.fromRGB(65, 140, 255)}):Play()
end)

resetBtn.MouseLeave:Connect(function()
	TweenService:Create(resetBtn, TweenInfo.new(0.12), {BackgroundColor3 = Color3.fromRGB(45, 120, 235)}):Play()
end)

resetBtn.MouseButton1Down:Connect(function()
	TweenService:Create(resetBtn, TweenInfo.new(0.06), {Size = UDim2.new(0, 152, 0, 40), Position = UDim2.new(0.5, -76, 1, -62)}):Play()
end)

resetBtn.MouseButton1Up:Connect(function()
	TweenService:Create(resetBtn, TweenInfo.new(0.06), {Size = UDim2.new(0, 160, 0, 44), Position = UDim2.new(0.5, -80, 1, -64)}):Play()
	resetRemote:FireServer()
end)

stateRemote.OnClientEvent:Connect(function(data)
	if not data then return end
	counterLabel.Text = string.format("Popped: %d / %d", data.poppedCount, data.totalCount)
	
	if data.isComplete then
		completionBanner.Visible = true
		completionBanner.Position = UDim2.new(0.5, -170, 0.4, -26)
		TweenService:Create(completionBanner, TweenInfo.new(0.35, Enum.EasingStyle.Back, Enum.EasingDirection.Out), {
			Position = UDim2.new(0.5, -170, 0.45, -26)
		}):Play()
	else
		completionBanner.Visible = false
	end
end)
