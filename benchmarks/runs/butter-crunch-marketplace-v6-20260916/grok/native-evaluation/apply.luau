local SCOPE="Forge_98c63e12b73c"
local HASH="26e76b3faf63d01504f32203044088aff205bfc389942b6e4eefa168b43d78f3"
local SCENE={{["path"]="Workspace/Forge_98c63e12b73c",["className"]="Folder",["properties"]={}},{["path"]="StarterGui/Forge_98c63e12b73c",["className"]="Folder",["properties"]={}},{["path"]="Workspace/Forge_98c63e12b73c/Assets",["className"]="Folder",["properties"]={}},{["path"]="Workspace/Forge_98c63e12b73c/World",["className"]="Folder",["properties"]={}},{["path"]="StarterGui/Forge_98c63e12b73c/CrunchScreenGui",["className"]="ScreenGui",["properties"]={["ResetOnSpawn"]=false,["Enabled"]=true}},{["path"]="Workspace/Forge_98c63e12b73c/Assets/crunchAudio",["className"]="Sound",["properties"]={["RollOffMode"]={["type"]="Enum",["enum"]="RollOffMode",["value"]=0},["Looped"]=false,["PlaybackSpeed"]=1,["PlayOnRemove"]=false,["RollOffMaxDistance"]=10000,["Volume"]=0.6499999761581421,["SoundId"]="rbxassetid://71300508404120",["Playing"]=false,["Archivable"]=true,["RollOffMinDistance"]=10}},{["path"]="Workspace/Forge_98c63e12b73c/World/Ground",["className"]="Part",["properties"]={["Size"]={["type"]="Vector3",["value"]={20,1,20}},["Position"]={["type"]="Vector3",["value"]={0,0,0}},["Color"]={["type"]="Color3",["value"]={0.55,0.35,0.2}},["Anchored"]=true,["CanCollide"]=true}},{["path"]="Workspace/Forge_98c63e12b73c/World/Pedestal",["className"]="Part",["properties"]={["Size"]={["type"]="Vector3",["value"]={1.5,3,1.5}},["Position"]={["type"]="Vector3",["value"]={0,2,0}},["Color"]={["type"]="Color3",["value"]={0.65,0.45,0.3}},["Anchored"]=true,["CanCollide"]=true}},{["path"]="Workspace/Forge_98c63e12b73c/World/Plate",["className"]="Part",["properties"]={["Size"]={["type"]="Vector3",["value"]={3.5,0.3,3.5}},["Position"]={["type"]="Vector3",["value"]={0,3.7,0}},["Color"]={["type"]="Color3",["value"]={0.98,0.98,0.95}},["Anchored"]=true,["CanCollide"]=true}},{["path"]="Workspace/Forge_98c63e12b73c/World/Butter",["className"]="Part",["properties"]={["Size"]={["type"]="Vector3",["value"]={1.4,0.6,2.2}},["Position"]={["type"]="Vector3",["value"]={0,4.2,0}},["Color"]={["type"]="Color3",["value"]={1,0.9,0.25}},["Anchored"]=true,["CanCollide"]=true}},{["path"]="Workspace/Forge_98c63e12b73c/World/SpawnLocation",["className"]="SpawnLocation",["properties"]={["CFrame"]={["type"]="CFrame",["value"]={0,0.5,-6,-1,0,0,0,1,0,0,0,-1}},["Size"]={["type"]="Vector3",["value"]={4,1,4}},["Anchored"]=true,["CanCollide"]=true,["Color"]={["type"]="Color3",["value"]={0.75,0.75,0.75}},["Enabled"]=true}},{["path"]="Workspace/Forge_98c63e12b73c/World/LightHolder",["className"]="Part",["properties"]={["Size"]={["type"]="Vector3",["value"]={0.2,0.2,0.2}},["Position"]={["type"]="Vector3",["value"]={0,7,0}},["Anchored"]=true,["CanCollide"]=false,["Transparency"]=1}},{["path"]="Workspace/Forge_98c63e12b73c/World/CrunchCount",["className"]="IntValue",["properties"]={["Value"]=0}},{["path"]="StarterGui/Forge_98c63e12b73c/CrunchScreenGui/CounterFrame",["className"]="Frame",["properties"]={["Size"]={["type"]="UDim2",["value"]={0.25,0,0.12,0}},["Position"]={["type"]="UDim2",["value"]={0.375,0,0.03,0}},["BackgroundColor3"]={["type"]="Color3",["value"]={0.16,0.16,0.16}},["BackgroundTransparency"]=0.3,["BorderSizePixel"]=0}},{["path"]="Workspace/Forge_98c63e12b73c/World/Butter/ClickDetector",["className"]="ClickDetector",["properties"]={["MaxActivationDistance"]=50}},{["path"]="Workspace/Forge_98c63e12b73c/World/LightHolder/PointLight",["className"]="PointLight",["properties"]={["Range"]=40,["Brightness"]=2,["Color"]={["type"]="Color3",["value"]={1,0.95,0.8}}}},{["path"]="StarterGui/Forge_98c63e12b73c/CrunchScreenGui/CounterFrame/CounterLabel",["className"]="TextLabel",["properties"]={["Size"]={["type"]="UDim2",["value"]={1,0,1,0}},["BackgroundTransparency"]=1,["Text"]="0",["TextColor3"]={["type"]="Color3",["value"]={1,1,1}},["TextScaled"]=false,["TextSize"]=48,["Font"]={["type"]="Enum",["enum"]="Font",["value"]=2},["TextStrokeTransparency"]=0.5,["TextStrokeColor3"]={["type"]="Color3",["value"]={0,0,0}}}}}
local ROOTS={Workspace=workspace,ReplicatedStorage=game:GetService("ReplicatedStorage"),ServerScriptService=game:GetService("ServerScriptService"),ServerStorage=game:GetService("ServerStorage"),StarterGui=game:GetService("StarterGui"),["StarterPlayer/StarterPlayerScripts"]=game:GetService("StarterPlayer").StarterPlayerScripts}
assert(not game:GetService("RunService"):IsRunning(),"Verified Edit state required")
local function value(v,nodes)
 if type(v)~="table" then return v end
 if v.type=="Ref" then if v.path==nil then return nil end;assert(nodes[v.path],"Missing reference target "..v.path);return nodes[v.path] end
 if v.type=="Enum" then for _,item in Enum[v.enum]:GetEnumItems() do if item.Value==v.value then return item end end;error("Unknown enum value") end
 local constructors={Vector3=Vector3.new,Vector2=Vector2.new,Color3=Color3.new,CFrame=CFrame.new,UDim2=UDim2.new,UDim=UDim.new}
 assert(constructors[v.type],"Unknown property type");return constructors[v.type](table.unpack(v.value))
end
local parents={"ServerScriptService/Forge_98c63e12b73c","StarterPlayer/StarterPlayerScripts/Forge_98c63e12b73c"}
local nodes,created={},{}
-- Inspect every target before making any change, including roots unused by this bundle.
for prefix,parent in ROOTS do
 local found=parent:FindFirstChild(SCOPE)
 assert(not found or (found.ClassName=="Folder" and #found:GetChildren()==0),"Target scope is nonempty or not a Folder: "..prefix.."/"..SCOPE)
 nodes[prefix.."/"..SCOPE]=found
end
local function make(class,name,parent)
 local object=Instance.new(class);table.insert(created,object);object.Name=name;object.Parent=parent;return object
end
local function ensure(p,class)
 if nodes[p] then assert(not class or nodes[p].ClassName==class,"Conflicting instance classes: "..p);return nodes[p] end
 local parentPath,name=p:match("^(.*)/([^/]+)$");assert(parentPath and name~="." and name~="..","Invalid path")
 local parent=nodes[parentPath] or ensure(parentPath,"Folder")
 local object=make(class or "Folder",name,parent);nodes[p]=object;return object
end
local ok,err=pcall(function()
 for prefix,parent in ROOTS do local key=prefix.."/"..SCOPE;if not nodes[key] then nodes[key]=make("Folder",SCOPE,parent) end end
 for _,item in SCENE do ensure(item.path,item.className) end
 for _,parent in parents do ensure(parent) end
 for _,item in SCENE do for name,v in item.properties do nodes[item.path][name]=value(v,nodes) end end
end)
if not ok then
 local cleanupErrors={}
 for index=#created,1,-1 do local cleaned,problem=pcall(function() created[index]:Destroy() end);if not cleaned then table.insert(cleanupErrors,tostring(problem)) end end
 return {ok=false,artifactSha256=HASH,error=tostring(err),cleanupConfirmed=#cleanupErrors==0,cleanupErrors=cleanupErrors,scriptsApplied=false}
end
return {ok=true,artifactSha256=HASH,sceneCount=#SCENE,createdCount=#created,scriptsApplied=false,verification="pending exact scripts and property verification"}
