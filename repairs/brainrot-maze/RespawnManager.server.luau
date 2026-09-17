local Players=game:GetService("Players")
local scope=script.Parent.Name
local models=require(game:GetService("ReplicatedStorage"):WaitForChild(scope):WaitForChild("PlayerModels"))
local spawn=workspace:WaitForChild(scope):WaitForChild("World"):WaitForChild("SpawnLocation")
local connections={}
local function joined(player)
 if connections[player] then return end
 local entry={};connections[player]=entry
 local function characterAdded(character)
  if entry.died then entry.died:Disconnect();entry.died=nil end
  local humanoid=character:WaitForChild("Humanoid",5)
  if not humanoid or player.Character~=character then return end
  entry.died=humanoid.Died:Connect(function()
   task.delay(1.5,function()
    if player.Parent==Players and player.Character==character then models.spawnPlayer(player,spawn) end
   end)
  end)
 end
 entry.added=player.CharacterAdded:Connect(characterAdded)
 if player.Character then task.spawn(characterAdded,player.Character) end
end
Players.PlayerAdded:Connect(joined)
Players.PlayerRemoving:Connect(function(player)
 local entry=connections[player]
 if entry then for _,connection in entry do connection:Disconnect() end end
 connections[player]=nil
end)
for _,player in Players:GetPlayers() do joined(player) end
