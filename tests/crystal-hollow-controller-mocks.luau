-- Offline callback ordering only; does not simulate Roblox networking or input delivery.
local function signal()
 local callbacks={}
 return {
  Connect=function(_,fn) table.insert(callbacks,fn); return {Disconnect=function() end} end,
  Fire=function(_,...) for _,fn in ipairs(callbacks) do fn(...) end end,
 }
end
local attrs={GoalComplete=false}
local signals={}
for _,name in ipairs({"Carry","Coins","PowerLevel","CapacityLevel","Capacity","TotalSold","GoalComplete"}) do signals[name]=signal() end
local observed={}
local player={Character=nil,CharacterAdded=signal()}
function player:GetAttribute(name) return attrs[name] end
function player:GetAttributeChangedSignal(name) return signals[name] end
function player:WaitForChild() return {} end
local hud={render=function() end,toast=function() end,destroy=function() end}
for _,name in ipairs({"harvestButton","sellButton","powerButton","capacityButton"}) do hud[name]={Activated=signal()} end
local HUD={mount=function() return hud end}
local Feedback={play=function(payload) table.insert(observed,table.clone(payload)) end,destroy=function() end}
local Contract={INTERACT_DISTANCE=10,NODE_CAPACITY=6}
local feedbackRemote={OnClientEvent=signal()}
local actionRemote={FireServer=function() end}
local shared={WaitForChild=function(_,name) if name=="Action" then return actionRemote elseif name=="Feedback" then return feedbackRemote else return "Contract" end end}
local folder={WaitForChild=function(_,name) return name end}
local script={Parent=folder,Destroying=signal()}
local world={WaitForChild=function() return {} end}
local workspace={WaitForChild=function() return {WaitForChild=function() return world end} end}
local services={
 Players={LocalPlayer=player},
 ReplicatedStorage={WaitForChild=function() return shared end},
 UserInputService={InputBegan=signal(),GetFocusedTextBox=function() return nil end},
 RunService={Heartbeat=signal()},
}
local game={GetService=function(_,name) return assert(services[name]) end}
local require=function(name) return assert(({HUD=HUD,Feedback=Feedback,Contract=Contract})[name]) end
local task={defer=function(fn) fn() end}
