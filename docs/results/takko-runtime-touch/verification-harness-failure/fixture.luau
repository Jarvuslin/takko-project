
assert(not game:GetService("RunService"):IsRunning(),"Requires Edit")


local function isRuntimeTouchInstance(item)
  if item.ClassName~="TouchTransmitter" then return false end
  assert(item.Parent and item.Parent:IsA("BasePart") and item.Name=="TouchInterest" and item.Archivable
    and not item.Sandboxed and item.Capabilities==SecurityCapabilities.new()
    and #item:GetChildren()==0 and next(item:GetAttributes())==nil and #item:GetTags()==0,
    "Nonstandard TouchTransmitter cannot be omitted from durable inventory")
  return true
end
local function componentPersistentChildren(item)
  local children={}
  for _,child in item:GetChildren() do
    if not isRuntimeTouchInstance(child) then table.insert(children,child) end
  end
  return children
end

local function captureComponentArchive(root, roundTripBytes)
  local clones={}
  local captured=nil
  local stage="inventory"
  local ok,result=pcall(function()
    assert(not game:GetService("RunService"):IsRunning(),"Component capture requires Edit")
    local LIMIT_NODES=3000
    local LIMIT_SCRIPTS=1000
    local LIMIT_SOURCE=524288
    local LIMIT_BINARY=4194304
    local originalParent=root.Parent
    local items,indices,nodes,sources,contentReferences,configurationValues={},{},{},{},{},{}
    local runtimeOnlyInstances,runtimeItems={},{}
    local configurationClasses={["NumberPose"]="number",["NumberValue"]="number",["IntValue"]="number",["DoubleConstrainedValue"]="number",["IntConstrainedValue"]="number",["StringValue"]="string",["BoolValue"]="boolean"}
    local contentProperties={["Sound"]={"SoundId"},["Animation"]={"AnimationId"},["MeshPart"]={"MeshId","TextureID"},["SpecialMesh"]={"MeshId","TextureId"},["Decal"]={"Texture"},["Texture"]={"Texture"},["SurfaceAppearance"]={"ColorMap","MetalnessMap","NormalMap","RoughnessMap"},["ParticleEmitter"]={"Texture"},["Beam"]={"Texture"},["Trail"]={"Texture"},["ImageLabel"]={"Image"},["ImageButton"]={"Image","HoverImage","PressedImage"},["VideoFrame"]={"Video"}}
    local sourceBytes=0
    local function walk(item,parentIndex,depth)
      assert(item.ClassName~="TouchTransmitter","Runtime-only component root is unsupported")
      assert(depth<=64,"Component hierarchy exceeds depth bound")
      assert(#items+#runtimeOnlyInstances<LIMIT_NODES,"Component exceeds instance bound")
      assert(item.Archivable,"Nonarchivable instance cannot be preserved")
      assert(#item.Name<=1024,"Component instance name exceeds bound")
      local index=#items+1;items[index]=item;indices[item]=index
      table.insert(nodes,{index=index,parentIndex=parentIndex,name=item.Name,className=item.ClassName})
      local valueType=configurationClasses[item.ClassName]
      if valueType then
        local value=item.Value
        assert(type(value)==valueType,"Configuration value type mismatch")
        if valueType=="string" then assert(#value<=4096,"Configuration string exceeds bound") end
        if valueType=="number" then assert(value==value and math.abs(value)<math.huge,"Configuration number must be finite") end
        table.insert(configurationValues,{index=index,property="Value",value=value})
      end
      for _,property in contentProperties[item.ClassName] or {} do
        local value=item[property]
        assert(type(value)=="string" and #value<=4096,"Content reference unreadable or exceeds bound")
        table.insert(contentReferences,{index=index,property=property,value=value})
      end
      if item:IsA("LuaSourceContainer") then
        assert(#sources<LIMIT_SCRIPTS,"Component exceeds script bound")
        local source=game:GetService("ScriptEditorService"):GetEditorSource(item)
        assert(source==item.Source,"Unsaved editor source differs from serialized source")
        sourceBytes+=#source;assert(sourceBytes<=LIMIT_SOURCE,"Component exceeds source byte bound")
        local row={index=index,className=item.ClassName,source=source,sourceBytes=#source}
        if item:IsA("BaseScript") then row.disabled=item.Disabled;row.runContext=tostring(item.RunContext) end
        table.insert(sources,row)
      end
      for _,child in item:GetChildren() do
        if isRuntimeTouchInstance(child) then
          assert(not runtimeItems[child] and #items+#runtimeOnlyInstances<LIMIT_NODES,"Runtime-only inventory exceeds bound")
          runtimeItems[child]={parent=item,index=index}
          table.insert(runtimeOnlyInstances,{parentIndex=index,name="TouchInterest",className="TouchTransmitter",reconstruction="touch_listener_required_unverified"})
        else walk(child,index,depth+1) end
      end
    end
    walk(root,0,0)
    assert(#items+#runtimeOnlyInstances<=LIMIT_NODES,"Component exceeds combined instance bound")
    stage="serialize"
    local bytes=game:GetService("SerializationService"):SerializeInstancesAsync({root})
    assert(buffer.len(bytes)>0 and buffer.len(bytes)<=LIMIT_BINARY,"Component archive exceeds binary bound")
    captured={status="captured",format="roblox-native-rbxm-v1",engineVersion=version(),bytes=buffer.len(bytes),
      base64=buffer.tostring(game:GetService("EncodingService"):Base64Encode(bytes)),nodes=nodes,sources=sources,contentReferences=contentReferences,configurationValues=configurationValues,sourceBytes=sourceBytes,executed=false}
    if #runtimeOnlyInstances>0 then captured.runtimeOnlyInstances=runtimeOnlyInstances end
    stage="deserialize"
    if roundTripBytes then assert(buffer.len(roundTripBytes)<=16*1024*1024,"Comparison input exceeds bound") end
    clones=game:GetService("SerializationService"):DeserializeInstancesAsync(roundTripBytes or bytes)
    stage="compare"
    assert(#clones==1 and clones[1].Parent==nil,"Component round trip changed its root count")
    local copies,copyIndices={},{}
    local function collect(item)
      copies[#copies+1]=item;copyIndices[item]=#copies
      assert(#copies<=LIMIT_NODES,"Round-trip instance count exceeds bound")
      for _,child in componentPersistentChildren(item) do collect(child) end
    end
    collect(clones[1])
    if #copies~=#items then
      local expected,actual,classes={},{},{}
      for _,item in items do expected[item.ClassName]=(expected[item.ClassName] or 0)+1;classes[item.ClassName]=true end
      for _,item in copies do actual[item.ClassName]=(actual[item.ClassName] or 0)+1;classes[item.ClassName]=true end
      local differences={}
      for name in classes do
        if expected[name]~=actual[name] then table.insert(differences,name..":"..tostring(expected[name] or 0).."->"..tostring(actual[name] or 0)) end
      end
      table.sort(differences)
      error("Component round trip changed instance count "..#items.."->"..#copies.." ("..table.concat(differences,", ")..")")
    end
    for _,ref in configurationValues do
      assert(items[ref.index].Value==ref.value,"Component configuration value changed during capture")
      assert(copies[ref.index].Value==ref.value,"Component round trip changed configuration value")
    end
    for _,ref in contentReferences do
      assert(items[ref.index][ref.property]==ref.value,"Component content reference changed during capture")
      assert(copies[ref.index][ref.property]==ref.value,"Component round trip changed content reference")
    end
    local checkedProperties,checkedAttributes,checkedReferences=0,0,0
    local unobservable,missingSet={},{}
    local ignored={UniqueId=true,HistoryId=true}
    local propertyCache={}
    local function equal(a,b)
      if typeof(a)=="Instance" then assert(indices[a]~=nil,"Component has an external or runtime-only instance reference") end
      local kind=typeof(a);if kind~=typeof(b) then return false end
      if kind=="Instance" then
        checkedReferences+=1
        assert(indices[a]~=nil,"Component has an external instance reference")
        return indices[a]==copyIndices[b]
      elseif kind=="NumberSequence" or kind=="ColorSequence" then
        return equal(a.Keypoints,b.Keypoints)
      elseif kind=="NumberSequenceKeypoint" then
        return a.Time==b.Time and a.Value==b.Value and a.Envelope==b.Envelope
      elseif kind=="ColorSequenceKeypoint" then
        return a.Time==b.Time and a.Value==b.Value
      elseif kind=="table" then
        for k,v in a do if not equal(v,b[k]) then return false end end
        for k in b do if a[k]==nil then return false end end
        return true
      end
      return a==b
    end
    for index,item in items do
      local copy=copies[index]
      assert(item.Name==nodes[index].name and item.ClassName==nodes[index].className and (indices[item.Parent] or 0)==nodes[index].parentIndex,"Component inventory changed during capture")
      assert(item.Name==copy.Name and item.ClassName==copy.ClassName,"Component round trip changed child identity/order")
      assert((indices[item.Parent] or 0)==(copyIndices[copy.Parent] or 0),"Component round trip changed parentage")
      -- Security controls must survive even if reflection does not label them
      -- Serialized. A faithfully restored source with a lost sandbox is unsafe.
      assert(item.Sandboxed==copy.Sandboxed,"Component round trip changed sandboxing")
      assert(item.Capabilities==copy.Capabilities,"Component round trip changed capabilities")
      local attributes=item:GetAttributes()
      assert(equal(attributes,copy:GetAttributes()),"Component round trip changed attributes")
      for _ in attributes do checkedAttributes+=1 end
      local tags=item:GetTags();local copyTags=copy:GetTags();table.sort(tags);table.sort(copyTags)
      assert(equal(tags,copyTags),"Component round trip changed tags")
      if item:IsA("LuaSourceContainer") then assert(item.Source==copy.Source,"Component round trip changed script bytes") end
      if not propertyCache[item.ClassName] then
        propertyCache[item.ClassName]=game:GetService("ReflectionService"):GetPropertiesOfClass(item.ClassName)
      end
      for _,property in propertyCache[item.ClassName] do
        local name=property.Name
        if property.Serialized and name~="Parent" and not ignored[name] then
          local read,a=pcall(function() return item[name] end)
          local readCopy,b=pcall(function() return copy[name] end)
          if read and readCopy then
            assert(equal(a,b),"Component round trip changed property "..item.ClassName.."."..name)
            checkedProperties+=1
          else
            local key=item.ClassName.."."..name
            if not missingSet[key] then
              assert(#unobservable<3000,"Unobservable property inventory exceeds bound")
              missingSet[key]=true;table.insert(unobservable,key)
            end
          end
        end
      end
    end
    -- Serialization APIs yield. A concurrent edit must not produce evidence for stale bytes.
    assert(not game:GetService("RunService"):IsRunning(),"Studio entered Play during component capture")
    assert(root.Parent==originalParent,"Component moved during capture")
    for _,source in sources do assert(items[source.index].Source==source.source,"Component source changed during capture") end
    for _,ref in contentReferences do assert(items[ref.index][ref.property]==ref.value,"Component content reference changed during capture") end
    for _,ref in configurationValues do assert(items[ref.index].Value==ref.value,"Component configuration value changed during capture") end
    local finalItems={root};for _,x in root:GetDescendants() do table.insert(finalItems,x) end
    assert(#finalItems==#items+#runtimeOnlyInstances,"Component changed during capture")
    for _,x in finalItems do
      if runtimeItems[x] then
        assert(x.Parent==runtimeItems[x].parent and isRuntimeTouchInstance(x),"Runtime-only instance changed during capture")
      else assert(indices[x],"Component identity changed during capture") end
    end
    table.sort(unobservable)
    captured.roundTrip={passed=true,checkedProperties=checkedProperties,checkedAttributes=checkedAttributes,checkedReferences=checkedReferences,
        unobservableProperties=unobservable,ignoredIdentityProperties={"UniqueId","HistoryId"}}
    return captured
  end)
  for _,copy in clones do copy:Destroy() end
  if not ok then
    if captured then captured.roundTrip={passed=false,stage=stage,reason=tostring(result):sub(1,1900)};return captured end
    return {status="unavailable",reason=stage..": "..tostring(result):sub(1,1800)}
  end
  return result
end

local root=Instance.new("Model");root.Name="OwnedTouchFixture"
local part=Instance.new("Part");part.Name="Pad";part.Parent=root
local source=Instance.new("ModuleScript");source.Name="AfterPad";source.Source="return 'inert fixture'";source.Parent=root
local connection=part.Touched:Connect(function()end)
local copies={};local again=nil
local ok,result=pcall(function()
 local marker=assert(part:FindFirstChildOfClass("TouchTransmitter"),"Listener marker absent")
 local snapshot=captureComponentArchive(root)
 assert(snapshot.status=="captured" and snapshot.roundTrip.passed,"Durable capture failed")
 assert(#snapshot.nodes==3 and snapshot.sources[1].index==3 and snapshot.runtimeOnlyInstances[1].parentIndex==2,"Durable indices changed")
 marker:SetAttribute("Custom",true)
 local custom=captureComponentArchive(root);assert(custom.status=="unavailable" and string.find(custom.reason,"Nonstandard"),"Custom marker accepted")
 marker:SetAttribute("Custom",nil)
 local reference=Instance.new("ObjectValue");reference.Name="MarkerReference";reference.Value=marker;reference.Parent=root
 local linked=captureComponentArchive(root);reference:Destroy()
 assert(linked.status=="captured" and not linked.roundTrip.passed,"Marker reference silently lost")
 copies=game:GetService("SerializationService"):DeserializeInstancesAsync(game:GetService("EncodingService"):Base64Decode(buffer.fromstring(snapshot.base64)))
 assert(#copies==1 and copies[1].Parent==nil,"Wrong restored roots")
 local restored=copies[1]:FindFirstChild("Pad")
 assert(restored and not restored:FindFirstChildOfClass("TouchTransmitter"),"Expected native omission")
 again=restored.Touched:Connect(function()end)
 assert(restored:FindFirstChildOfClass("TouchTransmitter"),"Listener did not recreate marker")
 assert(copies[1].AfterPad.Source==source.Source,"Source changed")
 return {passed=true,comparison=snapshot.roundTrip,runtimeOnlyInstances=snapshot.runtimeOnlyInstances,nativeListenerRecreated=true,customStateRejected=true,persistentReferenceRejected=true,physicalTouchEvents="not_tested_in_Edit",importedCodeExecuted=false}
end)
if again then again:Disconnect() end;connection:Disconnect();for _,copy in copies do copy:Destroy()end;root:Destroy()
if not ok then error(result)end
return game:GetService("HttpService"):JSONEncode(result)