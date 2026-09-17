-- Temporary local driver. Runs only in the explicitly named disposable maze test place.
if game.Name=="Forge-maze-playtest.rbxlx" and not Run:IsRunning() then
 task.delay(4,function()
  local ok,err=pcall(function()
   for _,parent in {workspace,game:GetService("ReplicatedStorage"),game:GetService("ServerScriptService"),game:GetService("ServerStorage"),game:GetService("StarterGui"),game:GetService("StarterPlayer").StarterPlayerScripts} do
    local root=parent:FindFirstChild(verification.scope);if root then root:Destroy() end
   end
   endpoint.Text="http://127.0.0.1:4318"
   key.Text=Http:JSONDecode(Http:GetAsync(endpoint.Text.."/api/studio/pairing")).token
   connectToForge();assert(session,status.Text)
   for _,kind in {"apply","test"} do
    local response=Http:RequestAsync({Url=endpoint.Text.."/api/projects/"..verification.id.."/studio",Method="POST",Headers={["Content-Type"]="application/json"},Body=Http:JSONEncode({studioId=session,kind=kind})})
    assert(response.Success,response.Body)
    local deadline=os.clock()+12
    repeat task.wait(.2) until pending or os.clock()>deadline
    assert(pending,"Plugin failed to poll "..kind)
    executePending();assert(outbox and outbox.ok,status.Text)
    print("FORGE_MAZE_"..kind:upper().."_RESULT: "..Http:JSONEncode(outbox))
    deadline=os.clock()+12
    repeat task.wait(.2) until not outbox or os.clock()>deadline
    assert(not outbox,"Result was not acknowledged")
   end
   print("FORGE_MAZE_SOLO_FINISHED")
   local inserted={}
   local function source(class,parent,name,text)
    local obj=Instance.new(class);obj.Name=name;obj.Parent=parent;table.insert(inserted,obj)
    Editor:UpdateSourceAsync(obj,function() return text end)
   end
   source("Script",game:GetService("ServerScriptService"),"ForgeNativeMultiplayer",multiplayerServer)
   source("LocalScript",game:GetService("StarterPlayer").StarterPlayerScripts,"ForgeNativeMultiplayer",multiplayerClient)
   local multiOk,result=pcall(function() return Test:ExecuteMultiplayerTestAsync(2,{scope=verification.scope}) end)
   for _,obj in inserted do obj:Destroy() end
   assert(multiOk,tostring(result))
   print("FORGE_MAZE_MULTIPLAYER_RESULT: "..Http:JSONEncode(result))
   print("FORGE_MAZE_VERIFICATION_FINISHED")
  end)
  if not ok then warn("FORGE_MAZE_VERIFICATION_FAILED: "..tostring(err)) end
 end)
end
