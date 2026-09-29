local Http=game:GetService("HttpService")
local Encoding=game:GetService("EncodingService")
local Serialization=game:GetService("SerializationService")
assert(not game:GetService("RunService"):IsRunning(),"Edit mode required")
local root=Instance.new("Model")
root.Name="TakkoUnparentedDeliveryProbe"
local copies={}
local ok,result=pcall(function()
 local a=Instance.new("Part");a.Name="Root";a.Anchored=true;a.Parent=root
 local b=Instance.new("Part");b.Name="Limb";b.Parent=root
 local joint=Instance.new("Motor6D");joint.Name="Joint";joint.Part0=a;joint.Part1=b;joint.C0=CFrame.new(1,2,3);joint.Parent=a
 local ref=Instance.new("ObjectValue");ref.Name="Target";ref.Value=b;ref.Parent=root
 local module=Instance.new("ModuleScript");module.Name="Behavior";module.Parent=root
 game:GetService("ScriptEditorService"):UpdateSourceAsync(module,function() return "return {fixture = true}" end)
 root:SetAttribute("ProbeNumber",42);root:AddTag("TakkoDeliveryFixture")
 local encoded=buffer.tostring(Encoding:Base64Encode(Serialization:SerializeInstancesAsync({root})))
 local response=Http:RequestAsync({Url="http://127.0.0.1:4344/probe",Method="POST",Headers={["Content-Type"]="application/json"},Body=Http:JSONEncode({base64=encoded})})
 assert(response.Success,"HTTP transfer failed")
 local payload=Http:JSONDecode(response.Body)
 local received=table.concat(payload.chunks)
 local hash=Encoding:ComputeStringHash(received,Enum.HashAlgorithm.Sha256):gsub(".",function(c)return string.format("%02x",string.byte(c))end)
 assert(hash==payload.hash and received==encoded,"Transfer identity mismatch")
 copies=Serialization:DeserializeInstancesAsync(Encoding:Base64Decode(buffer.fromstring(received)))
 assert(#copies==1 and copies[1].Parent==nil,"Unexpected restored root")
 local copy=copies[1]
 assert(copy.Root.Joint.Part0==copy.Root and copy.Root.Joint.Part1==copy.Limb,"Joint references changed")
 assert(copy.Root.Joint.C0==CFrame.new(1,2,3),"Joint transform changed")
 assert(copy.Target.Value==copy.Limb,"Object reference changed")
 assert(copy.Behavior.Source==module.Source,"Source changed")
 assert(copy:GetAttribute("ProbeNumber")==42 and copy:HasTag("TakkoDeliveryFixture"),"Metadata changed")
 assert(copy.Sandboxed==root.Sandboxed and copy.Behavior.Sandboxed==module.Sandboxed and copy.Behavior.Capabilities==module.Capabilities,"Security state changed")
 return {passed=true,bytes=payload.bytes,chunks=#payload.chunks,instances=1+#copy:GetDescendants(),checks={"HTTP round trip","SHA256","Motor6D references","Motor6D transform","ObjectValue reference","ModuleScript source","attribute","tag","sandbox and capabilities"},placedInGame=false,sourceExecuted=false}
end)
for _,copy in copies do copy:Destroy() end
root:Destroy()
assert(not game:GetService("RunService"):IsRunning(),"Edit state changed")
if not ok then error(result) end
result.cleanup="All unparented fixture instances destroyed; existing game untouched; Studio remains Edit"
return Http:JSONEncode(result)
