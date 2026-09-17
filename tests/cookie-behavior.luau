-- Independent integration audit for the saved Cookie Clicker, not generated gameplay.
return function(ctx)
 local player=game:GetService("Players").LocalPlayer
 local gui=player:WaitForChild("PlayerGui"):WaitForChild("CookieClickerGui",5)
 assert(gui,"Generated GUI must load")
 local frame=gui:WaitForChild("MainFrame",5)
 local label=frame:WaitForChild("CookieCountLabel",5)
 local cpc=frame:WaitForChild("CookiesPerClickLabel",5)
 local remotes=game:GetService("ReplicatedStorage"):WaitForChild(ctx.scope):WaitForChild("CookieClickerRemotes")
 local state
 local connection=remotes.UpdateState.OnClientEvent:Connect(function(nextState) state=nextState end)
 local function expectState(cookies,perClick)
  local deadline=os.clock()+2
  repeat task.wait() until state and state.cookies==cookies and state.cookiesPerClick==perClick or os.clock()>deadline
  assert(state and state.cookies==cookies and state.cookiesPerClick==perClick,"Server state mismatch: expected "..cookies.." cookies, "..perClick.." per click")
  assert(label.Text=="Cookies: "..cookies,"HUD must reflect the authoritative balance")
  assert(cpc.Text=="Cookies Per Click: "..perClick,"HUD must reflect the authoritative upgrade")
 end
 remotes.ClickCookie:FireServer()
 expectState(1,1)
 remotes.BuyUpgrade:FireServer("Major Clicker")
 remotes.ClickCookie:FireServer()
 expectState(2,1) -- Insufficient funds must not purchase the upgrade.
 for _=1,98 do remotes.ClickCookie:FireServer();task.wait(.02) end
 expectState(100,1)
 remotes.BuyUpgrade:FireServer("Major Clicker")
 expectState(0,2)
 assert(state.upgradesPurchased["Major Clicker"],"Purchase must be recorded")
 remotes.BuyUpgrade:FireServer("Major Clicker")
 remotes.ClickCookie:FireServer()
 expectState(2,2) -- A duplicate purchase must not deduct or grant again.
 remotes.BuyUpgrade:FireServer({invalid=true})
 remotes.ClickCookie:FireServer()
 expectState(4,2) -- Malformed input must leave valid gameplay operational.
 connection:Disconnect()
end
