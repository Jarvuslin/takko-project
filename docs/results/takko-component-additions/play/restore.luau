assert(not game:GetService("RunService"):IsRunning(),"Stop play before restoration")
local storage=game:GetService("ServerStorage");local saved=assert(storage:FindFirstChild("TakkoComponentTest_b3ced11b403f_Restore"),"Missing restoration record")
assert(saved:GetAttribute("Token")=="b3ced11b-403f-4efa-b39b-76f019bac83f","Restoration ownership mismatch")
local encoding=game:GetService("EncodingService")
local function hash(source)return encoding:ComputeStringHash(source,Enum.HashAlgorithm.Sha256):gsub(".",function(c)return string.format("%02x",string.byte(c))end)end
for _,ref in saved:GetChildren() do assert(ref:IsA("ObjectValue") and ref.Value and ref.Value:IsA("BaseScript"),"Original script missing");assert(hash(ref.Value.Source)==ref:GetAttribute("SourceHash"),"Original script changed during test") end
for _,ref in saved:GetChildren() do ref.Value.Disabled=ref:GetAttribute("Disabled");assert(ref.Value.Disabled==ref:GetAttribute("Disabled"),"Enablement restoration failed") end
local fixture=workspace:FindFirstChild("TakkoComponentTest_b3ced11b403f");if fixture then assert(fixture:GetAttribute("Token")=="b3ced11b-403f-4efa-b39b-76f019bac83f","Fixture ownership mismatch");fixture:Destroy() end
local count=#saved:GetChildren();saved:Destroy()
return game:GetService("HttpService"):JSONEncode({restoredScripts=count,fixtureRemoved=workspace:FindFirstChild("TakkoComponentTest_b3ced11b403f")==nil,restorationRecordRemoved=storage:FindFirstChild("TakkoComponentTest_b3ced11b403f_Restore")==nil})