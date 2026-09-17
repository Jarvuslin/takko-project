local Players=game:GetService("Players")
local scope=script.Parent.Name
local models=require(game:GetService("ReplicatedStorage"):WaitForChild(scope):WaitForChild("PlayerModels"))
local spawn=workspace:WaitForChild(scope):WaitForChild("World"):WaitForChild("SpawnLocation")
Players.CharacterAutoLoads=false
local function joined(player)
 if not player.Character or not player.Character:GetAttribute("ForgeCharacter") then models.spawnPlayer(player,spawn) end
end
Players.PlayerAdded:Connect(joined)
for _,player in Players:GetPlayers() do task.spawn(joined,player) end
