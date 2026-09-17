local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Debris = game:GetService("Debris")
local Core = require(script.Parent.CombatCore)
local Shared = ReplicatedStorage:WaitForChild("Forge")
local Config = require(Shared.Config)
local Remote = Shared.Combat
local states = {}
local connections = {}
local lastRequest = {}

local function makeTarget()
 local model = Instance.new("Model")
 model.Name = "PracticeTarget"
 local root = Instance.new("Part")
 root.Name = "HumanoidRootPart"
 root.Size = Vector3.new(3, 5, 2)
 root.Position = Vector3.new(0, 3.5, -10)
 root.Anchored = true
 root.Color = Color3.fromRGB(222, 145, 75)
 root.Parent = model
 local head = Instance.new("Part")
 head.Name = "Head"
 head.Size = Vector3.new(2, 2, 2)
 head.Position = root.Position + Vector3.new(0, 3.5, 0)
 head.Anchored = true
 head.Parent = model
 local humanoid = Instance.new("Humanoid")
 humanoid.RequiresNeck = false
 humanoid.MaxHealth = 100
 humanoid.Health = 100
 humanoid.Parent = model
 model.PrimaryPart = root
 model.Parent = workspace
 humanoid.Died:Once(function()
  task.delay(3, function() model:Destroy(); makeTarget() end)
 end)
 return model
end
makeTarget()

local function register(player)
 states[player] = Core.newState()
 connections[player] = player.CharacterAdded:Connect(function()
  states[player] = Core.newState()
  lastRequest[player] = nil
 end)
end
Players.PlayerAdded:Connect(register)
for _, player in Players:GetPlayers() do register(player) end
Players.PlayerRemoving:Connect(function(player)
 if connections[player] then connections[player]:Disconnect() end
 connections[player] = nil; states[player] = nil; lastRequest[player] = nil
end)

Remote.OnServerEvent:Connect(function(player, action, sequence)
 local now = os.clock()
 -- Limit even malformed requests before doing target searches or replication.
 if now - (lastRequest[player] or -math.huge) < 0.05 then return end
 lastRequest[player] = now
 local character = player.Character
 local humanoid = character and character:FindFirstChildOfClass("Humanoid")
 local root = character and character:FindFirstChild("HumanoidRootPart")
 local state = states[player]
 if not state or not root or not humanoid then return end
 local ok = Core.accept(state, action, sequence, now, humanoid.Health > 0, Config.abilities)
 if not ok then return end
 local ability = Config.abilities[action]
 local candidates = {}
 for _, other in Players:GetPlayers() do
  if other ~= player and other.Character then table.insert(candidates, other.Character) end
 end
 local dummy = workspace:FindFirstChild("PracticeTarget")
 if dummy then table.insert(candidates, dummy) end
 local nearest, nearestDistance = nil, ability.range + 1
 for _, target in candidates do
  local targetRoot = target:FindFirstChild("HumanoidRootPart")
  local targetHumanoid = target:FindFirstChildOfClass("Humanoid")
  if targetRoot and targetHumanoid then
   local delta = targetRoot.Position - root.Position
   local distance = delta.Magnitude
   local params = RaycastParams.new()
   params.FilterType = Enum.RaycastFilterType.Exclude
   params.FilterDescendantsInstances = { character }
   local obstruction = workspace:Raycast(root.Position, delta, params)
   local visible = obstruction == nil or obstruction.Instance:IsDescendantOf(target)
   local facing = distance < 0.1 or root.CFrame.LookVector:Dot(delta.Unit) >= 0
   if facing and distance < nearestDistance and Core.canHit(distance, ability.range, targetHumanoid.Health, visible) then
    nearest = targetHumanoid; nearestDistance = distance
   end
  end
 end
 local hit = nearest ~= nil
 if nearest then
  nearest:TakeDamage(ability.damage)
  local flash = Instance.new("Highlight")
  flash.FillColor = Color3.fromRGB(Config.accent[1], Config.accent[2], Config.accent[3])
  flash.OutlineTransparency = 1
  flash.Parent = nearest.Parent
  Debris:AddItem(flash, 0.18)
 end
 Remote:FireClient(player, action, ability.cooldown, hit)
end)
