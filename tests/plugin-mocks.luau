-- Deliberately isolated Studio API doubles. These tests are not Studio verification.
local function event() return {Connect=function() return {Disconnect=function() end} end} end
local methods={}
local function detach(obj)
 local parent=obj._props.Parent
 if parent then local i=table.find(parent._children,obj);if i then table.remove(parent._children,i) end end
end
function methods:GetDescendants() local out={} for _,child in self._children do table.insert(out,child);for _,desc in child:GetDescendants() do table.insert(out,desc) end end return out end
function methods:FindFirstChild(name) for _,child in self._children do if child.Name==name then return child end end return nil end
function methods:GetFullName() return self.Parent and self.Parent:GetFullName()..'.'..self.Name or self.Name end
function methods:SetAttribute(name,value) self._attributes=self._attributes or {};self._attributes[name]=value end
function methods:GetAttribute(name) return self._attributes and self._attributes[name] end
function methods:IsA(class) return self.ClassName==class or class=='LuaSourceContainer' and (self.ClassName=='Script' or self.ClassName=='LocalScript' or self.ClassName=='ModuleScript') or class=='BasePart' and (self.ClassName=='Part' or self.ClassName=='MeshPart') end
function methods:Destroy() for _,child in table.clone(self._children) do child:Destroy() end;detach(self);self._props.Parent=nil;self._destroyed=true end
local meshIdSetterAttempts=0
local Instance={new=function(class)
 local obj={_props={ClassName=class,Name=class,Click=event(),MouseButton1Click=event(),Changed=event(),AttributeChanged=event(),DescendantAdded=event(),DescendantRemoving=event()},_children={}}
 return setmetatable(obj,{__index=function(t,k) return methods[k] or t._props[k] end,__newindex=function(t,k,v) if k:sub(1,1)=='_' then rawset(t,k,v);return end;if class=='MeshPart' and k=='MeshId' then meshIdSetterAttempts+=1;error('MeshId is read-only') end;if k=='Parent' then detach(t);if v then table.insert(v._children,t) end end;t._props[k]=v end})
end}
local captured={}
local services={}
local httpRequests={}
local httpBodies={}
local httpHandler=nil
local HttpMock={RequestAsync=function(_,options) table.insert(httpRequests,options);if httpHandler then return httpHandler(options) end;return {Success=true,StatusCode=200,Body=options.Url:find("/api/studio/pairing",1,true) and "pairing" or "session"} end,JSONDecode=function(_,body) if type(body)=='table' then return body end;return body=="pairing" and {token="local-test-token"} or {id="local-test-session",protocolVersion=2} end,JSONEncode=function(_,body) table.insert(httpBodies,body);return "{}" end}
local failSource=false
local duringSource=nil
local Editor={GetEditorSource=function(_,obj) return obj.Source or '' end,UpdateSourceAsync=function(_,obj,fn) if failSource then failSource=false;error('Source permission denied') end;if duringSource then duringSource();duringSource=nil end;obj.Source=fn(obj.Source or '');table.insert(captured,obj.Source) end}
local applyRecordings=0
local History={TryBeginRecording=function() applyRecordings+=1;return 'recording' end,FinishRecording=function() end}
local Run={IsRunning=function() return false end}
local Test={ExecutePlayModeAsync=function() return {checks={},logs={}} end}
local meshCalls, createdMeshes = {}, {}
local failMesh, duringMesh = false, nil
local Content={fromUri=function(uri) return {Uri=uri} end}
local AssetMock={CreateMeshPartAsync=function(_,content,options)
 table.insert(meshCalls,{content=content,options=options})
 if failMesh then failMesh=false;error('Mesh asset access denied') end
 if duringMesh then duringMesh();duringMesh=nil end
 local obj=Instance.new('MeshPart');obj._props.MeshId=content.Uri;table.insert(createdMeshes,obj);return obj
end}
local game={Name='Fixture',GetService=function(_,name) if name=='HttpService' then return HttpMock elseif name=='ScriptEditorService' then return Editor elseif name=='ChangeHistoryService' then return History elseif name=='RunService' then return Run elseif name=='StudioTestService' then return Test elseif name=='AssetService' then return AssetMock end;if not services[name] then services[name]=Instance.new(name) end;return services[name] end}
local workspace=game:GetService('Workspace')
local playerScripts=Instance.new('StarterPlayerScripts');playerScripts.Parent=game:GetService('StarterPlayer');services.StarterPlayer._props.StarterPlayerScripts=playerScripts
local function constructor(...) return table.concat({...},',') end
local Vector3={new=constructor};local Vector2={new=constructor};local Color3={new=constructor,fromRGB=constructor};local CFrame={new=constructor};local UDim={new=constructor};local UDim2={new=constructor,fromScale=constructor}
local Enum={InitialDockState={Right=1},Font={SourceSans=1},FinishRecordingOperation={Cancel=0,Commit=1}}
Enum.HumanoidRigType={R6="R6",R15="R15"}
local rigCalls={}
game:GetService('Players').CreateHumanoidModelFromDescriptionAsync=function(_,description,rig)
 table.insert(rigCalls,rig)
 local character=Instance.new('Model')
 local humanoid=Instance.new('Humanoid');humanoid.RigType=rig;humanoid.Parent=character
 return character
end
Enum.Material={GetEnumItems=function() return {{Value=256,Name="Plastic"}} end}
local DockWidgetPluginGuiInfo={new=function() return {} end}
local plugin={CreateToolbar=function() return {CreateButton=function() return Instance.new('Button') end} end,CreateDockWidgetPluginGui=function() return Instance.new('Widget') end,Unloading=event()}
local task={spawn=function() end,wait=function() end}
local DateTime={now=function() return {UnixTimestampMillis=1000} end}
