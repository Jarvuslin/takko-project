local SCOPE="ChainRegression_294e0c2cd706"
local SESSION="b4528cea-0c0b-454e-80ca-c39014f760ba"
local TOKEN="78f504ff-8371-4ed2-a5d4-901f9b3c9c5d"
local ATTEMPT="attempt_da2a6e2cd57626b3fdd21073"
local NEED="bubbleWrapInteraction"
local KIND="Model"
local AUDIO_CAPTURE=false
local EXPECTPLACED=false
local MAXSIZE=12
local DEST=Vector3.new(0,3,0)

local Http = game:GetService("HttpService")
local Run = game:GetService("RunService")
assert(not Run:IsRunning(), "Edit mode required; never stop Play automatically")
local MARK = "TakkoAssetToken"
local function reply(operation, ok, extra)
  local value = extra or {}
  value.marker = "takko_asset_v1"; value.operation = operation; value.ok = ok; value.reasons = value.reasons or {}
  return Http:JSONEncode(value)
end
local function child(parent, name)
  local found = nil
  for _, item in parent:GetChildren() do
    if item.Name == name then assert(found == nil, "Ambiguous owned path: " .. name); found = item end
  end
  return found
end
local function container(serviceName, middle, create)
  local service = game:GetService(serviceName)
  local root = child(service, SCOPE)
  if not root and create then root = Instance.new("Folder"); root.Name = SCOPE; root:SetAttribute("TakkoAssetCreatedBy",SESSION); root.Parent = service end
  if not root and not create then return nil end
  assert(root and root:IsA("Folder"), "Missing or incompatible project scope")
  local folder = child(root, middle)
  if not folder and create then
    folder = Instance.new("Folder"); folder.Name = middle; folder:SetAttribute("TakkoAssetScope", SCOPE); folder:SetAttribute("TakkoAssetCreatedBy",SESSION); folder.Parent = root
  end
  if folder then assert(folder:IsA("Folder") and folder:GetAttribute("TakkoAssetScope") == SCOPE, "Unowned asset container") end
  return folder
end
local function owned(serviceName, middle, name)
  local folder = container(serviceName, middle, false)
  local item = folder and child(folder, name)
  if item then assert(item:GetAttribute(MARK) == TOKEN, "Owned asset identity changed") end
  return item
end
local function enumerate(root)
  local items = {root}
  for _, item in root:GetDescendants() do table.insert(items, item) end
  return items
end
local function vec(v) return {type="Vector3", value={v.X,v.Y,v.Z}} end
local function cf(v) return {type="CFrame", value={v:GetComponents()}} end
local function enum(v) return {type="Enum", enum=tostring(v.EnumType):gsub("Enum%.",""), value=v.Value} end
local function finite(n) return n == n and math.abs(n) < 1e7 end
local function bounds(parts)
  local lo = Vector3.new(math.huge, math.huge, math.huge)
  local hi = Vector3.new(-math.huge, -math.huge, -math.huge)
  for _, p in parts do
    for _, n in {p.CFrame:GetComponents()} do assert(finite(n), "Nonfinite geometry transform") end
    assert(p.Size.X > 0 and p.Size.Y > 0 and p.Size.Z > 0 and p.Size.Magnitude < 3500, "Invalid or excessive geometry size")
    for x=-1,1,2 do for y=-1,1,2 do for z=-1,1,2 do
      local corner = p.CFrame:PointToWorldSpace(p.Size * Vector3.new(x,y,z) / 2)
      lo = lo:Min(corner); hi = hi:Max(corner)
    end end end
  end
  local span = hi-lo
  assert(finite(span.X) and finite(span.Y) and finite(span.Z), "No finite geometry bounds")
  local extent = math.max(span.X,span.Y,span.Z)
  assert(extent > 0.001 and extent <= 2000, "Excessive or degenerate asset bounds")
  return (lo+hi)/2, extent
end
local function scan(root, kind)
  local items, parts, sounds, reasons, decals = enumerate(root), {}, {}, {}, {}
  local scripts, unsupported = 0, 0
  local preservationLimited=false
  local function preservation(reason) preservationLimited=true;table.insert(reasons,reason) end
  if #items > 300 then table.insert(reasons, "Asset exceeds 300 instances") end
  local allowed = {Folder=true,Model=true,Part=true,MeshPart=true,Sound=true,Decal=true}
  for _, item in items do
    if item:IsA("LuaSourceContainer") then scripts += 1 end
    if not allowed[item.ClassName] then unsupported += 1; table.insert(reasons, "Unsupported or executable class: " .. item.ClassName) end
    if not item.Archivable then preservation("Nonarchivable content cannot be preserved") end
    if item:IsA("BasePart") then
      table.insert(parts,item)
      if item.MaterialVariant ~= "" then preservation("External MaterialVariant cannot be preserved") end
      if item.CustomPhysicalProperties ~= nil then preservation("CustomPhysicalProperties cannot be serialized") end
      if item.CollisionGroup ~= "Default" then preservation("External collision group cannot be preserved") end
      if item:IsA("MeshPart") and item.MeshId == "" then table.insert(reasons,"MeshPart lacks mesh identity") end
    elseif item.ClassName=="Decal" then
      table.insert(decals,item)
      if not item.Texture:match("^rbxassetid://%d+$") and not item.Texture:match("^https?://www%.roblox%.com/asset/%?id=%d+$") then table.insert(reasons,"Decal lacks supported image content identity") end
      if item~=root and not item.Parent:IsA("BasePart") then table.insert(reasons,"Decal has no renderable BasePart parent") end
      -- Ordinary decals only: compare public advanced features against a native
      -- default with the same Texture, so aliases are not mistaken for new maps.
      local baseline=Instance.new("Decal"); baseline.Texture=item.Texture
      for _,key in {"ColorMap","Rotation","UVOffset","UVScale","EmissiveStrength","EmissiveTint","LocalTransparencyModifier","Shiny","Specular"} do
        local readable, value=pcall(function() return item[key] end)
        if readable then
          local defaultReadable, default=pcall(function() return baseline[key] end)
          if not defaultReadable or value~=default then preservation("Unsupported nondefault Decal property: "..key) end
        end
      end
      baseline:Destroy()
    elseif item:IsA("Sound") then
      table.insert(sounds,item)
      if item.SoundId == "" then table.insert(reasons,"Sound lacks content identity") end
      if item.SoundGroup ~= nil or item.PlaybackRegionsEnabled then preservation("Unsupported Sound routing or playback region") end
    end
  end
  if scripts > 0 then table.insert(reasons, "Embedded executable behavior requires a reviewed complete-asset import path") end
  local embeddedMedia=kind~="Audio" and #sounds>0
  if embeddedMedia then table.insert(reasons,"Embedded media requires per-dependency playback and listening verification before complete-asset reuse") end
  if kind == "Audio" then
    if #sounds ~= 1 or #parts ~= 0 then table.insert(reasons,"Audio import must contain exactly one Sound and no geometry") end
  elseif kind=="Image" then
    if #decals~=1 or #sounds~=0 or not ((root.ClassName=="Decal" and #items==1) or (root.ClassName=="Part" and #items==2 and #parts==1)) then table.insert(reasons,"Image import must contain one Decal and only its owned backing Part") end
    if #decals==1 and decals[1].Transparency>=1 then table.insert(reasons,"Image decal has no visible content") end
  elseif #parts == 0 then table.insert(reasons,"Model import has no geometry") end
  if kind == "MeshPart" then
    local meshes = 0; for _, p in parts do if p:IsA("MeshPart") then meshes += 1 end end
    if meshes == 0 then table.insert(reasons,"MeshPart search result contains no MeshPart") end
  end
  local center, extent = Vector3.zero, 1
  if #reasons == 0 and #parts > 0 then
    local ok, a, b = pcall(bounds, parts)
    if not ok then table.insert(reasons,tostring(a)) else center=a; extent=b end
  end
  local capabilityBlock=nil
  if scripts>0 then capabilityBlock={kind="interactive_asset_requires_review",reason="Imported asset contains embedded code; complete asset reuse requires script and dependency review, not procedural replacement"}
  elseif embeddedMedia then capabilityBlock={kind="interactive_asset_requires_review",reason="Embedded media requires per-dependency playback and listening verification before complete-asset reuse"}
  elseif preservationLimited or unsupported>0 or #items>300 then capabilityBlock={kind="unsupported_structure",reason="Imported asset exceeds the supported property, class or instance structure; complete asset reuse requires a supported structure contract"} end
  local distinct,seen={},{}
  for _,reason in reasons do if not seen[reason] then seen[reason]=true;table.insert(distinct,reason) end end
  return items, parts, sounds, distinct, scripts, center, extent, capabilityBlock
end
local function boundedText(value, count)
  local text=tostring(value)
  local ok, offset=pcall(utf8.offset,text,count+1)
  if not ok then return "[unreadable UTF-8 text]" end
  return offset and text:sub(1,offset-1) or text
end
local function inertAudit(items, scriptCount)
  local result={mode="inert_quarantine_static_inspection",sourceOrigin="ScriptEditorService:GetEditorSource",dependencyAnalysis="lexical_literals_only_not_execution_proof",executed=false,instanceLimit=300,sourceLimit=8,sourceByteLimit=65536,
    instanceListTruncated=#items>300,sourceListTruncated=scriptCount>8,sourceBytesReturned=0,nodes={},sources={}}
  local indices={};for index,item in items do indices[item]=index end
  for index,item in items do
    if index<=300 then local name=boundedText(item.Name,120);table.insert(result.nodes,{index=index,parentIndex=indices[item.Parent] or 0,name=name,nameTruncated=name~=item.Name,className=item.ClassName}) end
    if item:IsA("LuaSourceContainer") and #result.sources<8 then
      local row={index=index,className=item.ClassName,readable=false,sourceOmittedForLimit=false,literalDependencies={},dependencyListTruncated=false}
      if item:IsA("BaseScript") then local ok,value=pcall(function() return item.Disabled end);if ok then row.disabled=value end end
      local contextOK,context=pcall(function() return item.RunContext end);if contextOK and context~=nil then row.runContext=boundedText(context,100) end
      local ok,source=pcall(function() return game:GetService("ScriptEditorService"):GetEditorSource(item) end)
      if ok and type(source)=="string" then
        row.readable=true;row.sourceBytes=#source
        if result.sourceBytesReturned+#source<=65536 then
          row.source=source;result.sourceBytesReturned+=#source
          local function literals(pattern,kind)
            for value in source:gmatch(pattern) do
              if #row.literalDependencies>=64 then row.dependencyListTruncated=true;break end
              local bounded=boundedText(value,120);if bounded~=value then row.dependencyListTruncated=true end
              table.insert(row.literalDependencies,{kind=kind,value=bounded})
            end
          end
          -- Lexical observations only: comments/dead code can match and dynamic dependencies may be absent.
          literals([[require%s*%(%s*(%d+)]],"require_asset_id")
          literals([[rbxassetid://(%d+)]],"content_asset_id")
          literals([[GetService%s*%(%s*["']([^"']+)]],"service")
          literals([[Instance%.new%s*%(%s*["']([^"']+)]],"constructed_class")
        else row.sourceOmittedForLimit=true end
      else row.readError=boundedText(source or "Source could not be read",250) end
      table.insert(result.sources,row)
    end
  end
  return result
end
local function preload(items)
  local finished, failed = false, false
  task.spawn(function()
    local ok = pcall(function()
      game:GetService("ContentProvider"):PreloadAsync(items, function(_, status)
        if status ~= Enum.AssetFetchStatus.Success then failed = true end
      end)
    end)
    failed = failed or not ok; finished = true
  end)
  local deadline = os.clock()+8
  while not finished and os.clock()<deadline do task.wait(0.05) end
  return finished and not failed
end
local function normalizeNames(root)
  local function walk(parent)
    for index, item in parent:GetChildren() do
      item.Name = item.ClassName .. "_" .. tostring(index)
      walk(item)
    end
  end
  walk(root)
end
local function mountImage(root)
  assert(root.ClassName=="Decal", "Image insertion did not produce a Decal")
  local surface=Instance.new("Part"); surface.Name="Imported"; surface.Size=Vector3.new(MAXSIZE,MAXSIZE,math.min(0.05,MAXSIZE/10))
  surface.Anchored=true; surface.CanCollide=false; surface.CanTouch=false; surface.CastShadow=false
  surface.Color=Color3.new(1,1,1); surface.Material=Enum.Material.SmoothPlastic
  surface.CFrame=CFrame.new(0,0,0); surface:SetAttribute(MARK,TOKEN); surface.Parent=root.Parent
  root.Name="Image"; root.Face=Enum.NormalId.Back; root.Parent=surface
  return surface
end
local function moveGeometry(parts, center, destination, scale)
  for _, p in parts do
    local rotation = p.CFrame - p.Position
    p.Size *= scale
    p.CFrame = CFrame.new(destination+(p.Position-center)*scale) * rotation
    p.Anchored = true
    p.AssemblyLinearVelocity = Vector3.zero; p.AssemblyAngularVelocity = Vector3.zero
  end
end
local function serialize(root, rootPath)
  local paths, items, scene = {}, enumerate(root), {}
  paths[root] = rootPath
  local function assign(parent)
    for _,item in parent:GetChildren() do paths[item]=paths[parent].."/"..item.Name; assign(item) end
  end
  assign(root)
  for _, item in items do
    local props = {Archivable=true}
    if item:IsA("BasePart") then
      props.CFrame=cf(item.CFrame); props.Size=vec(item.Size)
      props.Color={type="Color3",value={item.Color.R,item.Color.G,item.Color.B}}
      props.Material=enum(item.Material); props.Anchored=true
      for _, key in {"Transparency","Reflectance","CanCollide","CanQuery","CanTouch","CastShadow","Massless"} do props[key]=item[key] end
      props.PivotOffset=cf(item.PivotOffset)
      for _,key in {"TopSurface","BottomSurface","LeftSurface","RightSurface","FrontSurface","BackSurface"} do props[key]=enum(item[key]) end
      if item:IsA("Part") then props.Shape=enum(item.Shape) end
      if item:IsA("MeshPart") then props.MeshId=item.MeshId; props.TextureID=item.TextureID; props.DoubleSided=item.DoubleSided end
    elseif item:IsA("Model") then
      props.WorldPivot=cf(item.WorldPivot)
      if item.PrimaryPart then assert(paths[item.PrimaryPart],"External PrimaryPart reference"); props.PrimaryPart={type="Ref",path=paths[item.PrimaryPart]} end
    elseif item.ClassName=="Decal" then
      props.Texture=item.Texture; props.Face=enum(item.Face)
      props.Color3={type="Color3",value={item.Color3.R,item.Color3.G,item.Color3.B}}
      props.Transparency=item.Transparency; props.ZIndex=item.ZIndex; props.AutoLocalize=item.AutoLocalize
    elseif item:IsA("Sound") then
      for _, key in {"SoundId","Volume","PlaybackSpeed","Looped","RollOffMinDistance","RollOffMaxDistance"} do props[key]=item[key] end
      props.RollOffMode=enum(item.RollOffMode); props.Playing=false; props.PlayOnRemove=false
    elseif not item:IsA("Folder") then error("Unserializable class: " .. item.ClassName) end
    table.insert(scene,{path=paths[item],className=item.ClassName,properties=props})
  end
  return scene
end


local stage=assert(owned("ServerStorage","AssetStaging",ATTEMPT),"Missing quarantine")
assert(#stage:GetChildren()==1,"Import did not produce exactly one quarantined root")
local root=stage:GetChildren()[1]


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

local items,parts,sounds,reasons,scripts,center,extent,capabilityBlock=scan(root,KIND)
local audit=capabilityBlock and inertAudit(items,scripts) or nil
local componentArchive=capabilityBlock and KIND=="Model" and captureComponentArchive(root) or nil
local componentTransfer=nil
if capabilityBlock then
  local json=Http:JSONEncode({componentArchive=componentArchive,inertAudit=audit})
  assert(#json<=8*1024*1024,"Component evidence exceeds transfer bound")
  local encoding=game:GetService("EncodingService")
  local encoded=buffer.tostring(encoding:Base64Encode(buffer.fromstring(json)))
  local digest=encoding:ComputeStringHash(encoded,Enum.HashAlgorithm.Sha256):gsub(".",function(c) return string.format("%02x",string.byte(c)) end)
  assert(not child(stage,"_TakkoComponentCapture"),"Component capture slot already occupied")
  local cache=Instance.new("Folder");cache.Name="_TakkoComponentCapture"
  cache:SetAttribute(MARK,TOKEN);cache:SetAttribute("Sha256",digest);cache:SetAttribute("EncodedBytes",#encoded);cache.Parent=stage
  for offset=0,#encoded-1,32768 do
    local chunk=Instance.new("StringValue");chunk.Name="Chunk_"..tostring(offset/32768+1)
    chunk.Value=string.sub(encoded,offset+1,math.min(offset+32768,#encoded));chunk.Parent=cache
  end
  componentTransfer={encodedBytes=#encoded,jsonBytes=#json,sha256=digest,chunkSize=32768}
  audit=nil;componentArchive=nil
end
local loaded=false
if #reasons==0 then
  if KIND=="Image" and root.ClassName=="Decal" then
    root=mountImage(root)
    items,parts,sounds,reasons,scripts,center,extent=scan(root,KIND)
  end
  normalizeNames(root); root.Name="Imported"; root:SetAttribute(MARK,TOKEN)
  for _, p in parts do p.Anchored=true end
  for _, sound in sounds do sound.PlayOnRemove=false; sound:Stop() end
  loaded=preload(items)
  assert(not Run:IsRunning(),"Edit mode changed while loading content")
  if not loaded then table.insert(reasons,"Native content preload failed or timed out") end
  for _, sound in sounds do if not sound.IsLoaded or sound.TimeLength<=0 then table.insert(reasons,"Sound content unavailable"); loaded=false end end
end
return reply("inspect",#reasons==0,{reasons=reasons,functional={contentLoaded=loaded,instanceCount=#items,scriptCount=scripts},center={center.X,center.Y,center.Z},size=extent,capabilityBlock=capabilityBlock,inertAudit=audit,componentArchive=componentArchive,componentTransfer=componentTransfer})
