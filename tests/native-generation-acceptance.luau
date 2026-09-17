-- Independent oracle for scripts/evaluate-generation.ts. Inline fresh source per call.
-- Carry serverStep's JSON-safe cursor; run server/client phases in one fresh solo session.
local Players = game:GetService("Players")
local Run = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Http = game:GetService("HttpService")
local SCOPE = "Forge_GenerationPilot"
local WITNESS = "ForgeAcceptanceCharacterWitness"
local phases = {
 {id="malformed",target="Pickup",before={0,0},after={0,0}},
 {id="far_collect",target="Pickup",far=true,before={0,0},after={0,0}},
 {id="cooldown",target="Pickup",before={0,0},after={1,0}},
 {id="capacity",target="Pickup",before={1,0},after={5,0}},
 {id="far_sell",target="SellPad",far=true,before={5,0},after={5,0}},
 {id="sell",target="SellPad",before={5,0},after={0,50}},
 {id="empty_sell",target="SellPad",before={0,50},after={0,50}},
 {id="respawn_seed",target="Pickup",before={0,50},after={2,50}},
 {id="repeat_sell",target="SellPad",before={2,50},after={0,70}},
}
local sessions = {}
local acceptance = {}

local function phaseById(id)
 for _,phase in phases do if phase.id==id then return phase end end
 error("Unknown acceptance phase: "..tostring(id))
end
local function playerNamed(name)
 if name then
  local player=Players:FindFirstChild(name)
  assert(player and player:IsA("Player"), "Acceptance player not found")
  return player
 end
 local list=Players:GetPlayers()
 assert(#list==1, "Use one fresh solo test player or pass its exact name")
 return list[1]
end
local function stateIs(player,expected,context)
 local carry,coins=player:GetAttribute("Carry"),player:GetAttribute("Coins")
 assert(carry==expected[1] and coins==expected[2],string.format(
  "%s: expected Carry=%d Coins=%d; observed Carry=%s Coins=%s",
  context,expected[1],expected[2],tostring(carry),tostring(coins)))
 return {Carry=carry,Coins=coins}
end
local function actionRemote()
 local scope=ReplicatedStorage:WaitForChild(SCOPE,5)
 assert(scope,"Generated replicated scope missing")
 local remote=scope:WaitForChild("Action",5)
 assert(remote and remote:IsA("RemoteEvent"),"Production Action RemoteEvent missing")
 return remote
end
local function report(id,detail,values)
 return {id=id,status="passed",detail=detail,observed=values}
end

function acceptance.begin(name)
 assert(Run:IsServer(),"begin must run on Server")
 local player=playerNamed(name)
 assert(not sessions[player.UserId],"Begin once in a fresh play session")
 local deadline=os.clock()+8
 repeat task.wait(.1) until (player:GetAttribute("Carry")~=nil and player:GetAttribute("Coins")~=nil) or os.clock()>deadline
 actionRemote()
 local values=stateIs(player,{0,0},"fresh session")
 sessions[player.UserId]={index=1,prepared=nil,respawnVerified=false}
 return report("fresh_state","Fresh player starts empty with zero coins",values)
end

function acceptance.prepare(id,name)
 assert(Run:IsServer(),"prepare must run on Server")
 local player=playerNamed(name)
 local session=sessions[player.UserId]
 assert(session and not session.prepared,"Begin first and verify the preceding action")
 local phase=phases[session.index]
 assert(phase and phase.id==id,"Run the documented acceptance phases in order")
 assert(id~="repeat_sell" or session.respawnVerified,"Verify respawn before the second sale")
 stateIs(player,phase.before,id.." before action")
 local scope=workspace:FindFirstChild(SCOPE)
 local target=scope and scope:FindFirstChild(phase.target)
 assert(target and target:IsA("BasePart"),"Production interaction part missing: "..phase.target)
 local character=player.Character
 local root=character and character:FindFirstChild("HumanoidRootPart")
 assert(root and root:IsA("BasePart"),"Test player character root missing")
 local humanoid=character:FindFirstChildOfClass("Humanoid")
 assert(humanoid and humanoid.Health>0,"Proximity scenarios require a living player")
 local destination=target
 if phase.far then
  destination=scope:FindFirstChild(phase.target=="Pickup" and "SellPad" or "Pickup")
  assert(destination and destination:IsA("BasePart"),"Opposite interaction part missing")
 end
 -- Arrangement only: never change Carry/Coins, capacity, cooldown or handlers.
 -- The opposite interaction is safely on the authored floor and over 10 studs away.
 character:PivotTo(CFrame.new(destination.Position+Vector3.new(0,4,0)))
 root.AssemblyLinearVelocity=Vector3.zero
 root.AssemblyAngularVelocity=Vector3.zero
 task.wait(.3) -- Replication and the preceding valid action's 0.2 s cooldown.
 local distance=(root.Position-target.Position).Magnitude
 assert(phase.far and distance>10 or not phase.far and distance<10,"Could not arrange required interaction distance")
 session.prepared=id
 session.characterWitness=Http:GenerateGUID(false)
 character:SetAttribute(WITNESS,session.characterWitness)
 return {phase=id,player=player.Name,distance=distance,expected=phase.after}
end

function acceptance.act(id)
 assert(Run:IsClient(),"act must run on Client")
 phaseById(id)
 local remote=actionRemote()
 if id=="malformed" then
  remote:FireServer(nil)
  remote:FireServer(123)
  remote:FireServer({action="collect",amount=999})
  remote:FireServer("not_an_action")
 elseif id=="cooldown" then
  for _=1,5 do remote:FireServer("collect") end
 elseif id=="capacity" then
  -- Four remaining slots plus one overflow attempt, each outside cooldown.
  for _=1,5 do remote:FireServer("collect");task.wait(.3) end
 elseif id=="respawn_seed" then
  remote:FireServer("collect");task.wait(.3);remote:FireServer("collect")
 elseif id=="far_collect" then remote:FireServer("collect")
 else remote:FireServer("sell") end
 return {phase=id,detail="Requests sent through the production client Action RemoteEvent; await independent Server verification"}
end

function acceptance.verify(id,name)
 assert(Run:IsServer(),"verify must run on Server")
 local player=playerNamed(name)
 local session=sessions[player.UserId]
 assert(session and session.prepared==id,"Prepare and execute this phase first")
 local phase=phaseById(id)
 task.wait(.5) -- Bounded observation window after the Client call completes.
 local character=player.Character
 local humanoid=character and character:FindFirstChildOfClass("Humanoid")
 assert(character and character:GetAttribute(WITNESS)==session.characterWitness and humanoid and humanoid.Health>0,"Player died or respawned during the interaction scenario")
 if phase.far then
  local root=character:FindFirstChild("HumanoidRootPart")
  local scope=workspace:FindFirstChild(SCOPE)
  local target=scope and scope:FindFirstChild(phase.target)
  assert(root and target and target:IsA("BasePart") and (root.Position-target.Position).Magnitude>10,"Player moved into interaction range during the distant request")
 end
 local values=stateIs(player,phase.after,id.." after production remote")
 session.prepared=nil
 session.characterWitness=nil
 session.index+=1
 return report(id,"Authoritative server state matches the independent expected result",values)
end

function acceptance.respawn(name)
 assert(Run:IsServer(),"respawn must run on Server")
 local player=playerNamed(name)
 local session=sessions[player.UserId]
 assert(session and not session.prepared and phases[session.index].id=="repeat_sell","Seed carried items before respawning")
 stateIs(player,{2,50},"before respawn")
 local original=player.Character
 player:LoadCharacterAsync()
 local deadline=os.clock()+8
 repeat task.wait(.1) until (player.Character and player.Character~=original and player.Character:FindFirstChild("HumanoidRootPart")) or os.clock()>deadline
 assert(player.Character and player.Character~=original and player.Character:FindFirstChild("HumanoidRootPart"),"Player did not respawn")
 task.wait(.5)
 local values=stateIs(player,{2,50},"after respawn")
 session.respawnVerified=true
 return report("respawn_state","Actual character replacement preserves session Carry and Coins",values)
end

local function visible(gui,screen)
 assert(gui:IsA("GuiObject") and gui.AbsoluteSize.X>0 and gui.AbsoluteSize.Y>0,"HUD control has no visible size: "..gui.Name)
 local cursor=gui
 while cursor and cursor~=screen do
  assert(not cursor:IsA("GuiObject") or cursor.Visible,"HUD control hidden: "..gui.Name)
  cursor=cursor.Parent
 end
 assert(cursor==screen and screen.Enabled,"HUD is not enabled in PlayerGui")
 local camera=workspace.CurrentCamera
 if camera then
  local p,s=gui.AbsolutePosition,gui.AbsoluteSize
  local viewport=camera.ViewportSize
  assert(p.X<viewport.X and p.Y<viewport.Y and p.X+s.X>0 and p.Y+s.Y>0,"HUD control is offscreen: "..gui.Name)
 end
end
function acceptance.hud(id)
 assert(Run:IsClient(),"hud must run on Client")
 local expected=id=="initial" and {0,0} or id=="respawn" and {2,50} or phaseById(id).after
 local player=Players.LocalPlayer
 local playerGui=player:WaitForChild("PlayerGui",5)
 local screen=playerGui and playerGui:WaitForChild("CollectSellHUD",5)
 assert(screen and screen:IsA("ScreenGui"),"CollectSellHUD ScreenGui missing")
 local hudCount=0
 for _,child in playerGui:GetChildren() do if child.Name=="CollectSellHUD" then hudCount+=1 end end
 assert(hudCount==1,"Expected exactly one CollectSellHUD after join/respawn")
 for _,name in {"CarryLabel","CoinsLabel","CollectButton","SellButton"} do
  local count=0
  for _,child in screen:GetDescendants() do if child.Name==name then count+=1 end end
  assert(count==1,"Expected exactly one HUD control: "..name)
 end
 local deadline=os.clock()+5
 local carry,coins
 repeat
  carry=screen:FindFirstChild("CarryLabel",true);coins=screen:FindFirstChild("CoinsLabel",true)
  if carry and coins and carry.Text=="Carry: "..expected[1].."/5" and coins.Text=="Coins: "..expected[2] then break end
  task.wait(.1)
 until os.clock()>deadline
 assert(carry and coins,"Named HUD labels missing")
 assert(carry.Text=="Carry: "..expected[1].."/5" and coins.Text=="Coins: "..expected[2],"HUD does not reflect independent expected Carry/Coins")
 visible(carry,screen);visible(coins,screen)
 for _,name in {"CollectButton","SellButton"} do
  local button=screen:FindFirstChild(name,true)
  assert(button and button:IsA("GuiButton"),"Touch control missing: "..name)
  visible(button,screen)
  assert(button.Active,"Touch control is inactive: "..name)
 end
 return report("hud_"..id,"HUD values, enabled controls and viewport intersection verified; occlusion and actual input still need visual/input inspection",{Carry=carry.Text,Coins=coins.Text})
end

-- Each Server invocation may inline a fresh copy of this source. The caller
-- carries only this JSON-safe cursor; actual gameplay values are always reread.
function acceptance.serverStep(method,id,state,name)
 assert(Run:IsServer(),"serverStep must run on Server")
 assert(method=="begin" or method=="prepare" or method=="verify" or method=="respawn","Unknown Server step")
 local player
 if method=="begin" then
  assert(state==nil,"Begin a fresh oracle cursor without prior state")
  player=playerNamed(name)
 else
  assert(type(state)=="table" and state.version==1 and state.scope==SCOPE,"Invalid oracle cursor version/scope")
  local fields={version=true,scope=true,playerId=true,index=true,prepared=true,respawnVerified=true,characterWitness=true}
  for key in state do assert(fields[key],"Unknown oracle cursor field") end
  assert(type(state.playerId)=="number" and state.playerId%1==0,"Invalid oracle playerId")
  assert(type(state.index)=="number" and state.index%1==0 and state.index>=1 and state.index<=#phases+1,"Invalid oracle phase index")
  assert(type(state.respawnVerified)=="boolean","Invalid oracle respawn flag")
  assert(state.prepared==nil or type(state.prepared)=="string","Invalid prepared phase")
  assert(state.characterWitness==nil or type(state.characterWitness)=="string","Invalid character witness")
  if state.prepared then
   assert(phases[state.index] and phases[state.index].id==state.prepared and state.characterWitness and state.characterWitness~="","Inconsistent prepared oracle cursor")
  else assert(state.characterWitness==nil,"Unexpected character witness") end
  player=Players:GetPlayerByUserId(state.playerId)
  assert(player and (not name or player.Name==name),"Oracle player is no longer connected")
  sessions[player.UserId]={index=state.index,prepared=state.prepared,respawnVerified=state.respawnVerified,characterWitness=state.characterWitness}
 end
 local result
 if method=="begin" then result=acceptance.begin(player.Name)
 elseif method=="prepare" then result=acceptance.prepare(id,player.Name)
 elseif method=="verify" then result=acceptance.verify(id,player.Name)
 else result=acceptance.respawn(player.Name) end
 local nextState=sessions[player.UserId]
 return {result=result,state={version=1,scope=SCOPE,playerId=player.UserId,index=nextState.index,prepared=nextState.prepared,respawnVerified=nextState.respawnVerified,characterWitness=nextState.characterWitness}}
end

acceptance.phases=phases
return acceptance
