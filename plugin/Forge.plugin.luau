-- Original Takko Studio bridge. Model API keys never enter Studio.
local Http = game:GetService("HttpService")
local Editor = game:GetService("ScriptEditorService")
local History = game:GetService("ChangeHistoryService")
local Run = game:GetService("RunService")
local Test = game:GetService("StudioTestService")
local Assets = game:GetService("AssetService")
local toolbar = plugin:CreateToolbar("Takko")
local toggle = toolbar:CreateButton("Takko", "Connect to local Takko", "")
local widget = plugin:CreateDockWidgetPluginGui("ForgeV2", DockWidgetPluginGuiInfo.new(Enum.InitialDockState.Right, true, false, 360, 390, 280, 300))
widget.Title = "Takko · Local generation"
local frame = Instance.new("Frame")
frame.Size = UDim2.fromScale(1, 1)
frame.BackgroundColor3 = Color3.fromRGB(24, 26, 31)
frame.Parent = widget
local function field(class, y, height, text)
 local x = Instance.new(class)
 x.Position = UDim2.new(0, 14, 0, y)
 x.Size = UDim2.new(1, -28, 0, height)
 x.BackgroundColor3 = Color3.fromRGB(40, 44, 53)
 x.TextColor3 = Color3.fromRGB(235, 237, 242)
 x.Font = Enum.Font.SourceSans
 x.TextSize = 17
 x.Text = text
 x.TextWrapped = true
 x.Parent = frame
 return x
end
local endpoint = field("TextBox", 14, 38, "http://127.0.0.1:4318")
endpoint.ClearTextOnFocus = false
local key = field("TextBox", 62, 38, "")
key.PlaceholderText = "Pairing token (optional for local Takko)"
key.ClearTextOnFocus = false
local connect = field("TextButton", 110, 38, "Connect to Takko")
local status = field("TextLabel", 158, 110, "Open Takko on this computer, then press Connect to Takko. The local pairing token is fetched automatically. This session: "..game.Name)
local execute = field("TextButton", 280, 42, "No queued operation")
execute.Active = false
toggle.Click:Connect(function() widget.Enabled = not widget.Enabled end)
local session, token, url, pending, outbox
local alive, busy = true, false
local connecting, polling = false, false
local completed = {}
local baselines = {}
local applied = {}
local dirty, watchers = {}, {}
local function watch(prefix, root)
 local id=prefix.."/"..root.Name
 for _,connection in watchers[id] or {} do connection:Disconnect() end
 watchers[id]={};dirty[id]=false
 local function changed() dirty[id]=true end
 for _,obj in {root,table.unpack(root:GetDescendants())} do
  table.insert(watchers[id],obj.Changed:Connect(changed))
  table.insert(watchers[id],obj.AttributeChanged:Connect(changed))
 end
 table.insert(watchers[id],root.DescendantAdded:Connect(changed))
 table.insert(watchers[id],root.DescendantRemoving:Connect(changed))
end
local function request(route, body, targetUrl, targetToken)
 local r = Http:RequestAsync({Url=(targetUrl or url).."/api/bridge"..route, Method=body and "POST" or "GET", Headers={Authorization="Bearer "..(targetToken or token),["Content-Type"]="application/json"}, Body=body and Http:JSONEncode(body) or nil})
 assert(r.Success, "Takko HTTP "..r.StatusCode..": "..string.sub(tostring(r.Body or ""),1,200))
 return Http:JSONDecode(r.Body)
end
local function canonical(p) return (p:gsub("%.server%.luau$", ""):gsub("%.client%.luau$", ""):gsub("%.module%.luau$", ""):gsub("%.luau$", "")) end
local function signature(root)
 local entries = {}
 for _, obj in {root, table.unpack(root:GetDescendants())} do
  local parts = {obj:GetFullName(), obj.ClassName}
  if obj:IsA("LuaSourceContainer") then table.insert(parts, Editor:GetEditorSource(obj)) end
  if obj:IsA("BasePart") then table.insert(parts, tostring(obj.CFrame));table.insert(parts,tostring(obj.Size));table.insert(parts,tostring(obj.Color)) end
  for _, name in {"Text", "Image", "SoundId", "AnimationId", "MeshId", "TextureID", "Enabled", "Visible", "Transparency", "Anchored", "CanCollide"} do
   local ok, value = pcall(function() return obj[name] end)
   if ok then table.insert(parts, name..":"..tostring(value)) end
  end
  table.insert(entries, table.concat(parts, "\0"))
 end
 table.sort(entries)
 return table.concat(entries, "\1")
end
local function value(v, nodes)
 if type(v) ~= "table" then return v end
 if v.type == "Ref" then
  if v.path == nil then return nil end
  assert(nodes[v.path], "Missing reference target "..v.path)
  return nodes[v.path]
 end
 if v.type == "Enum" then
  for _, item in Enum[v.enum]:GetEnumItems() do if item.Value == v.value then return item end end
  error("Unknown enum value")
 end
 local constructors = {Vector3=Vector3.new, Vector2=Vector2.new, Color3=Color3.new, CFrame=CFrame.new, UDim2=UDim2.new, UDim=UDim.new}
 assert(constructors[v.type], "Unknown property type")
 return constructors[v.type](table.unpack(v.value))
end
local function apply(op)
 assert(not Run:IsRunning(), "Stop play mode before applying")
 local importedMeshIds = {}
 local function normalizedMeshId(id) return type(id)=="string" and id:match("^rbxassetid://[1-9]%d*$") ~= nil end
 assert(op.importedMeshIds==nil or type(op.importedMeshIds)=="table", "Invalid imported mesh authorization")
 for _,id in op.importedMeshIds or {} do
  assert(normalizedMeshId(id), "Imported mesh authorization requires normalized asset IDs")
  importedMeshIds[id]=true
 end
 local roots = {Workspace=workspace, ReplicatedStorage=game:GetService("ReplicatedStorage"), ServerScriptService=game:GetService("ServerScriptService"), ServerStorage=game:GetService("ServerStorage"), StarterGui=game:GetService("StarterGui"), ["StarterPlayer/StarterPlayerScripts"]=game:GetService("StarterPlayer").StarterPlayerScripts}
 local staged, old, nodes = {}, {}, {}
 local foundation = {}
 local lightingBefore = {}
 local lighting = game:GetService("Lighting")
 local starterPlayer = game:GetService("StarterPlayer")
 local oldCharacter = starterPlayer:FindFirstChild("StarterCharacter")
 local stagedCharacter
 if op.rig then
  assert(op.rig=="R6" or op.rig=="R15", "Invalid project rig")
  assert(not oldCharacter or oldCharacter:GetAttribute("ForgeRigScope")==op.scope and baselines.StarterCharacter==signature(oldCharacter), "An existing StarterCharacter is not owned or was edited. Preserve it before applying this project's rig.")
 end
 -- Existing places retain their own baseplate and lighting. Bootstrap only a missing foundation.
 local createFoundation = op.baseWorld and not workspace:FindFirstChild("Baseplate") and not applied[op.scope] and not workspace:FindFirstChild(op.scope)
 for prefix, parent in roots do
  local existing = parent:FindFirstChild(op.scope)
  if existing then assert(not dirty[prefix.."/"..op.scope] and baselines[prefix.."/"..op.scope] == signature(existing), "Owned objects changed or plugin restarted. Preserve your edits and use a new Takko project.") end
  old[prefix] = existing
  local root = Instance.new("Folder");root.Name=op.scope;staged[prefix]=root;nodes[prefix.."/"..op.scope]=root
 end
 local meshIdsByPath = {}
 local function ensure(p, class, properties)
  local meshId = properties and properties.MeshId
  if class=="MeshPart" then
   assert(normalizedMeshId(meshId), "MeshPart requires a normalized declared MeshId")
   assert(importedMeshIds[meshId], "MeshPart MeshId is not authorized by imported asset receipts")
  end
  if nodes[p] then
   assert(not class or nodes[p].ClassName == class, "Conflicting instance classes")
   if class=="MeshPart" then assert(meshIdsByPath[p]==meshId, "Conflicting imported mesh IDs") end
   return nodes[p]
  end
  local parentPath, name = p:match("^(.*)/([^/]+)$")
  assert(parentPath and name ~= ".." and name ~= ".", "Invalid instance path")
  local parent = nodes[parentPath] or ensure(parentPath, "Folder")
  local obj
  if class=="MeshPart" then
   -- MeshId is read-only. This API yields and creates the authorized mesh off-tree.
   obj=Assets:CreateMeshPartAsync(Content.fromUri(meshId), {})
   if not obj or obj.ClassName~="MeshPart" or obj.Parent~=nil then
    if obj then obj:Destroy() end
    error("AssetService did not return an unparented MeshPart")
   end
   meshIdsByPath[p]=meshId
  else obj=Instance.new(class or "Folder") end
  obj.Name=name;obj.Parent=parent;nodes[p]=obj;return obj
 end
 local ok, err = pcall(function()
  if op.rig then
   -- Creator Docs: StarterPlayer/StarterCharacter is used for all spawning players.
   -- https://create.roblox.com/docs/reference/engine/classes/StarterPlayer
   -- https://create.roblox.com/docs/reference/engine/classes/Players#CreateHumanoidModelFromDescriptionAsync
   -- GameSettingsAvatar is RobloxScriptSecurity, so plugins cannot write it.
   local description=Instance.new("HumanoidDescription")
   local created, result=pcall(function() return game:GetService("Players"):CreateHumanoidModelFromDescriptionAsync(description,Enum.HumanoidRigType[op.rig]) end)
   description:Destroy()
   assert(created,result)
   stagedCharacter=result
   stagedCharacter.Name="StarterCharacter"
   stagedCharacter:SetAttribute("ForgeRigScope",op.scope)
  end
  if createFoundation then
   assert(op.baseWorld.version==1, "Unsupported base world contract")
   for _,item in op.baseWorld.nodes do
    if item.path=="Lighting" then
     for name,v in item.properties do lightingBefore[name]=lighting[name] end
    else
     local parentPath,name=item.path:match("^(.*)/([^/]+)$")
     assert(parentPath=="Workspace" or parentPath=="Lighting", "Invalid base world path")
     local parent=parentPath=="Workspace" and workspace or lighting
     if not parent:FindFirstChild(name) then
      local obj=Instance.new(item.className);obj.Name=name
      table.insert(foundation,{object=obj,parent=parent})
      for key,v in item.properties do obj[key]=value(v,{}) end
     end
    end
   end
  end
  local scene = table.clone(op.bundle.scene)
  table.sort(scene, function(a,b) return #a.path:split("/") < #b.path:split("/") end)
  for _, item in scene do ensure(item.path,item.className,item.properties) end
  for _, f in op.bundle.files do local obj=ensure(canonical(f.path),f.kind);Editor:UpdateSourceAsync(obj,function() return f.source end) end
  for _, item in scene do
   local obj=nodes[item.path]
   for name,v in item.properties do
    assert(name~="Parent" and name~="Source" and name~="Name", "Reserved property")
    if item.className~="MeshPart" or name~="MeshId" then obj[name]=value(v,nodes) end
   end
  end
 end)
 if not ok then if stagedCharacter then stagedCharacter:Destroy() end;for _,root in staged do root:Destroy() end;for _,f in foundation do f.object:Destroy() end;error(err) end
 -- Source and mesh staging can yield. Recheck ownership immediately before replacing roots.
 for prefix,parent in roots do
  local existing=parent:FindFirstChild(op.scope)
  if existing~=old[prefix] or existing and (dirty[prefix.."/"..op.scope] or baselines[prefix.."/"..op.scope]~=signature(existing)) then
   for _,root in staged do root:Destroy() end
   for _,f in foundation do f.object:Destroy() end
   if stagedCharacter then stagedCharacter:Destroy() end
   error("Owned objects changed during staging. Preserve your edits and retry with a new Takko project.")
  end
 end
 local recording=History:TryBeginRecording("ForgeApply", "Apply Takko generation")
 if not recording then if stagedCharacter then stagedCharacter:Destroy() end;for _,root in staged do root:Destroy() end;for _,f in foundation do f.object:Destroy() end;error("Could not begin Studio undo recording") end
 local swapped, swapError=pcall(function()
  if stagedCharacter then
   assert(starterPlayer:FindFirstChild("StarterCharacter")==oldCharacter, "StarterCharacter changed during staging")
   if oldCharacter then assert(baselines.StarterCharacter==signature(oldCharacter), "StarterCharacter was edited during staging");oldCharacter.Parent=nil end
   stagedCharacter.Parent=starterPlayer
  end
  for prefix,parent in roots do if old[prefix] then old[prefix].Parent=nil end;staged[prefix].Parent=parent end
  for _,f in foundation do assert(not f.parent:FindFirstChild(f.object.Name), "Base world changed during staging");f.object.Parent=f.parent end
  if createFoundation then
   for _,item in op.baseWorld.nodes do if item.path=="Lighting" then for name,v in item.properties do lighting[name]=value(v,{}) end end end
  end
 end)
 if not swapped then
  if stagedCharacter then stagedCharacter:Destroy();if oldCharacter then oldCharacter.Parent=starterPlayer end end
  for _,f in foundation do f.object:Destroy() end
  for name,v in lightingBefore do lighting[name]=v end
  for prefix,parent in roots do staged[prefix]:Destroy();if old[prefix] then old[prefix].Parent=parent end end
  History:FinishRecording(recording,Enum.FinishRecordingOperation.Cancel)
  error(swapError)
 end
 for _,root in old do root:Destroy() end
 if stagedCharacter then if oldCharacter then oldCharacter:Destroy() end;baselines.StarterCharacter=signature(stagedCharacter) end
 History:FinishRecording(recording,Enum.FinishRecordingOperation.Commit)
 for prefix,root in staged do baselines[prefix.."/"..op.scope]=signature(root);watch(prefix,root) end
 applied[op.scope]=op.artifactHash
 return {checks={{id="apply",status="passed",detail="Applied generated instances and sources."}},logs={"Applied revision "..op.revision}}
end
local function runTests(op)
 assert(not Run:IsRunning(), "Stop play mode before running acceptance tests")
 assert(type(op.tests)=="table" and #op.tests>0, "No acceptance tests are configured. This artifact has not been tested.")
 assert(applied[op.scope] == op.artifactHash, "Apply this exact artifact in this plugin session before testing")
 for _,parent in {workspace,game:GetService("ReplicatedStorage"),game:GetService("ServerScriptService"),game:GetService("ServerStorage"),game:GetService("StarterGui"),game:GetService("StarterPlayer").StarterPlayerScripts} do
  local root=parent:FindFirstChild(op.scope)
  local prefix=parent==game:GetService("StarterPlayer").StarterPlayerScripts and "StarterPlayer/StarterPlayerScripts" or parent.ClassName
  assert(root and not dirty[prefix.."/"..op.scope] and baselines[prefix.."/"..op.scope]==signature(root), "Generated artifact changed after apply")
 end
 local rs=game:GetService("ReplicatedStorage")
 local name="ForgeTest_"..op.id:gsub("-", "")
 local inserted={}
 local setupOk,setupResult=pcall(function()
 local folder=Instance.new("Folder");table.insert(inserted,folder);folder.Name=name;folder.Parent=rs
 local remote=Instance.new("RemoteEvent");remote.Name="Results";remote.Parent=folder
 local serverTests,clientTests={},{}
 for _,t in op.tests do
  local m=Instance.new("ModuleScript");m.Name=t.id;m.Parent=folder;Editor:UpdateSourceAsync(m,function() return t.source end)
  table.insert(t.mode=="client" and clientTests or serverTests,t.id)
 end
 local function quoted(t) local s={} for _,v in t do table.insert(s,string.format("%q",v)) end return "{"..table.concat(s,",").."}" end
 local runner=[[
local function runTests(ids)
 local results={}
 for _,id in ids do
  local done,ok,err=false,false,"Acceptance test timed out"
  local thread=task.spawn(function() ok,err=pcall(function() local fn=require(folder:WaitForChild(id));assert(type(fn)=="function","Test must return a function");fn({scope=SCOPE}) end);done=true end)
  local deadline=os.clock()+12
  repeat task.wait() until done or os.clock()>deadline
  if not done then task.cancel(thread) end
  table.insert(results,{id=id,status=done and ok and "passed" or "failed",detail=done and ok and "Assertion scenario completed in Studio" or tostring(err)})
 end
 return results
end
]]
 local prefix=string.format("local folder=game:GetService('ReplicatedStorage'):WaitForChild(%q)\nlocal SCOPE=%q\n",name,op.scope)
 local serverSource=prefix..runner.."\nlocal clientResults=nil\nfolder.Results.OnServerEvent:Connect(function(_,r) if type(r)=='table' then clientResults=r end end)\nlocal logs={}\ngame:GetService('LogService').MessageOut:Connect(function(message) if #logs<80 then table.insert(logs,string.sub(message,1,2000)) end end)\ntask.wait(3)\nlocal checks=runTests("..quoted(serverTests)..")\nlocal deadline=os.clock()+"..tostring(20+#clientTests*13).."\nwhile "..tostring(#clientTests>0).." and not clientResults and os.clock()<deadline do task.wait(.2) end\nfor _,r in clientResults or {} do table.insert(checks,r) end\ngame:GetService('StudioTestService'):EndTest({checks=checks,logs=logs})"
 local clientSource=prefix..runner.."\ntask.wait(3)\nfolder.Results:FireServer(runTests("..quoted(clientTests).."))"
 local function insert(class,parent,source)
  local obj=Instance.new(class);obj.Name=name;obj.Parent=parent;table.insert(inserted,obj);Editor:UpdateSourceAsync(obj,function() return source end)
 end
 local ok,result=pcall(function()
  insert("Script",game:GetService("ServerScriptService"),serverSource)
  insert("LocalScript",game:GetService("StarterPlayer").StarterPlayerScripts,clientSource)
  return Test:ExecutePlayModeAsync({forgeOperation=op.id})
 end)
 assert(ok,tostring(result));assert(type(result)=="table","Studio returned no test report")
 return result
 end)
 for _,obj in inserted do obj:Destroy() end
 assert(setupOk,tostring(setupResult))
 return setupResult
end
local function connectToForge()
 if busy or connecting or polling then return end
 if pending or outbox then status.Text="Finish the delivered operation or let its receipt reach Takko before reconnecting.";return end
 local candidate=endpoint.Text:gsub("/$", "")
 if not candidate:match("^http://127%.0%.0%.1:%d+$") and not candidate:match("^http://localhost:%d+$") then status.Text="Use a local Takko address.";return end
 local supplied=key.Text:match("^%s*(.-)%s*$")
 connecting=true
 local pairing=supplied
 local ok,result=pcall(function()
  if pairing=="" then
   local response=Http:RequestAsync({Url=candidate.."/api/studio/pairing",Method="GET"})
   assert(response.Success,"Could not pair with local Takko (HTTP "..response.StatusCode.."). Open Takko and retry.")
   pairing=Http:JSONDecode(response.Body).token
  end
  assert(type(pairing)=="string" and pairing~="","Takko returned no pairing token")
  local response=request("/connect",{name=game.Name,protocolVersion=2,capabilities={"apply","test"}},candidate,pairing)
  assert(type(response.id)=="string" and response.id~="", "Takko returned no Studio session")
  return response
 end)
 if ok then url=candidate;token=pairing;session=result.id;key.Text="";connect.Text="Reconnect to Takko";status.Text="Connected: "..game.Name..". Select this session in Takko's Studio panel, then apply your completed build."
 else status.Text="Could not connect. Confirm Takko is running at "..candidate..". "..tostring(result) end
 connecting=false
end
connect.MouseButton1Click:Connect(connectToForge)
local function executePending()
 if busy or connecting or polling or not pending then return end
 busy=true;execute.Active=false
 local op=pending
 local freshOk,fresh=pcall(function() return request("/"..session.."/operations/"..op.id) end)
 if not freshOk then busy=false;execute.Active=true;status.Text="Could not confirm the operation. No changes were made. "..tostring(fresh);return end
 if fresh.state~="dispatched" or fresh.dispatchId~=op.dispatchId or fresh.artifactHash~=op.artifactHash or fresh.revision~=op.revision or DateTime.now().UnixTimestampMillis>=fresh.expiresAt then
  local report={operationId=op.id,dispatchId=op.dispatchId,revision=op.revision,artifactHash=op.artifactHash,executionStatus="not_started",ok=false,checks={},logs={"Plugin confirmed this command was never executed: authorization or deadline changed before execution."}}
  completed[op.id]=report;outbox=report
  pending=nil;busy=false;execute.Text="No queued operation";status.Text="This operation was not executed. Sending that confirmation to Takko.";return
 end
 pending=nil;execute.Text="Running…";status.Text="Running "..op.kind..". Studio may enter play mode."
 local ok,result=pcall(function() return op.kind=="apply" and apply(op) or runTests(op) end)
 local passed=ok
 if ok then for _,check in result.checks or {} do if check.status~="passed" then passed=false end end end
 if op.kind=="test" and ok and #(result.checks or {})==0 then passed=false end
 local report={operationId=op.id,dispatchId=op.dispatchId,revision=op.revision,artifactHash=op.artifactHash,ok=passed,checks=ok and result.checks or {},logs=ok and result.logs or {tostring(result)}}
 completed[op.id]=report;outbox=report;busy=false;status.Text=ok and "Operation completed. Sending observations to Takko." or tostring(result);execute.Text="No queued operation"
end
execute.MouseButton1Click:Connect(executePending)
plugin.Unloading:Connect(function() alive=false;for _,connections in watchers do for _,connection in connections do connection:Disconnect() end end end)
local function pollOnce()
  if connecting or polling or not session then return end
  polling=true
  if session and busy then
   -- Keep the session visible while ExecutePlayModeAsync yields for tests.
   pcall(function() request("/"..session.."/poll") end)
  elseif session then
   local ok,err=pcall(function()
    if outbox then request("/"..session.."/result",outbox);outbox=nil end
    local reply=request("/"..session.."/poll")
    if reply.operation then
     if completed[reply.operation.id] then outbox=completed[reply.operation.id]
     else
      assert(reply.operation.protocolVersion==2 and type(reply.operation.dispatchId)=="string", "Update Takko before executing this operation")
      pending=reply.operation;execute.Text=pending.kind=="apply" and "Apply queued generation" or "Run queued acceptance tests";execute.Active=true
     end
    elseif not pending then execute.Text="No queued operation";execute.Active=false
    end
   end)
   if not ok then status.Text="Connection interrupted; results will retry. "..tostring(err) end
  end
  polling=false
end
task.spawn(function()
 while alive do
  pollOnce();task.wait(2)
 end
end)
