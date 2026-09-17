local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ContextActionService = game:GetService("ContextActionService")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local player = Players.LocalPlayer
local Shared = ReplicatedStorage:WaitForChild("Forge")
local Config = require(Shared.Config)
local Remote = Shared.Combat
local gui = Instance.new("ScreenGui")
gui.Name = "ForgeHUD"
gui.ResetOnSpawn = false
gui.Parent = player:WaitForChild("PlayerGui")
local panel = Instance.new("Frame")
panel.Size = UDim2.new(0.42, 0, 0, 96)
panel.Position = UDim2.new(0.03, 0, 0, 24)
panel.BackgroundColor3 = Color3.fromRGB(28, 30, 29)
panel.Parent = gui
local limit = Instance.new("UISizeConstraint")
limit.MinSize = Vector2.new(200, 96)
limit.MaxSize = Vector2.new(400, 96)
limit.Parent = panel
local title = Instance.new("TextLabel")
title.Text = Config.title
title.Font = Enum.Font.GothamBold
title.TextSize = 18
title.TextColor3 = Color3.fromRGB(241, 239, 232)
title.BackgroundTransparency = 1
title.Size = UDim2.new(1, -24, 0, 28)
title.Position = UDim2.fromOffset(12, 6)
title.TextXAlignment = Enum.TextXAlignment.Left
title.Parent = panel
local health = Instance.new("TextLabel")
health.Size = UDim2.new(1, -24, 0, 30)
health.Position = UDim2.fromOffset(12, 40)
health.BackgroundColor3 = Color3.fromRGB(Config.accent[1], Config.accent[2], Config.accent[3])
health.TextColor3 = Color3.fromRGB(20, 24, 22)
health.Font = Enum.Font.GothamBold
health.TextSize = 14
health.Parent = panel
local status = Instance.new("TextLabel")
status.BackgroundTransparency = 1
status.Size = UDim2.new(1, 0, 0, 24)
status.Position = UDim2.new(0, 0, 1, 4)
status.Text = "Approach the orange practice target. Click: strike · Q: burst"
status.TextWrapped = true
status.TextColor3 = Color3.fromRGB(241, 239, 232)
status.TextSize = 12
status.Parent = panel
local sequence = 0
local ready = {}
local healthConnection
local function bindCharacter(character)
 if healthConnection then healthConnection:Disconnect() end
 table.clear(ready)
 local humanoid = character:WaitForChild("Humanoid")
 if player.Character ~= character then return end
 local function update()
  health.Text = string.format("HEALTH  %d / %d", humanoid.Health, humanoid.MaxHealth)
 end
 healthConnection = humanoid.HealthChanged:Connect(update)
 update()
end
player.CharacterAdded:Connect(bindCharacter)
if player.Character then task.spawn(bindCharacter, player.Character) end
local function send(action)
 if os.clock() < (ready[action] or 0) then return end
 sequence += 1
 Remote:FireServer(action, sequence)
end
local buttons = {}
for index, action in {"strike", "burst"} do
 local button = Instance.new("TextButton")
 button.Size = UDim2.fromOffset(92, 56)
 button.AnchorPoint = Vector2.new(1, 1)
 button.Position = UDim2.new(1, -24 - (index - 1) * 100, 1, -170)
 button.BackgroundColor3 = Color3.fromRGB(28, 30, 29)
 button.TextColor3 = Color3.fromRGB(241, 239, 232)
 button.Font = Enum.Font.GothamBold
 button.TextSize = 14
 button.Parent = gui
 button.Visible = Config.touch or not UserInputService.TouchEnabled
 button.Activated:Connect(function() send(action) end)
 buttons[action] = button
end
UserInputService.InputBegan:Connect(function(input, processed)
 if not processed and input.UserInputType == Enum.UserInputType.MouseButton1 then send("strike") end
end)
ContextActionService:BindAction("ForgeBurst", function(_, state)
 if state == Enum.UserInputState.Begin then send("burst") end
 return Enum.ContextActionResult.Sink
end, false, Enum.KeyCode.Q)
Remote.OnClientEvent:Connect(function(action, cooldown, hit)
 if Config.abilities[action] == nil then return end
 ready[action] = os.clock() + cooldown
 status.Text = hit and "HIT CONFIRMED" or "Miss — move closer and face your target"
end)
RunService.RenderStepped:Connect(function()
 for action, button in buttons do
  local remaining = math.max(0, (ready[action] or 0) - os.clock())
  button.Text = string.upper(action) .. (remaining > 0 and string.format(" %.1fs", remaining) or " · READY")
 end
end)
