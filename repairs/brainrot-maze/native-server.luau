return function(ctx)
 local players=game:GetService("Players")
 local player=players:GetPlayers()[1];assert(player,"Player joined")
 local character=player.Character;assert(character,"Player spawned")
 local h=character:FindFirstChildOfClass("Humanoid");assert(h and h.Health==100,"Healthy humanoid")
 local root=character:FindFirstChild("HumanoidRootPart");assert(root and not root.Anchored,"Unanchored root")
 root:SetNetworkOwner(nil)
 task.wait(1)
 local initial=root.Position
 h:MoveTo(initial+Vector3.new(0,0,-10))
 task.wait(1)
 assert((root.Position-initial).Magnitude>6,"Player walks through maze corridor")
 character:PivotTo(CFrame.new(-36,4,0));h:MoveTo(root.Position)
 task.wait(1)
 assert(character:GetAttribute("BuffActive")==true and h.WalkSpeed==24,"Entering zone boosts speed")
 assert(character:FindFirstChild("BuffGlow"),"Buff glow appears")
 character:PivotTo(CFrame.new(-36,4,24));h:MoveTo(root.Position)
 task.wait(.7)
 assert(character:GetAttribute("BuffActive")==false and h.WalkSpeed==16,"Exiting zone restores speed")
 assert(not character:FindFirstChild("BuffGlow"),"Buff glow cleans up")
 h:TakeDamage(25);task.wait(.7);assert(h.Health==75,"Damage applies")
 h.Health=0
 local deadline=os.clock()+4
 repeat task.wait(.1) until player.Character~=character or os.clock()>deadline
 local respawned=player.Character
 assert(respawned and respawned~=character,"New character after death")
 local spawn=workspace[ctx.scope].World.SpawnLocation
 assert((respawned:GetPivot().Position-spawn.Position).Magnitude<7,"Respawn at maze start")
 assert(respawned.Humanoid.Health==100,"Respawn restores health")
 assert(not character.Parent,"Old character removed")
end
