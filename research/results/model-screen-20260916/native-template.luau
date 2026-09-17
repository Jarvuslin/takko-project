-- Isolated Studio Edit test. SOURCE_PLACEHOLDER is replaced with the unchanged model source string.
local source = SOURCE_PLACEHOLDER
local HttpService = game:GetService("HttpService")
local root = Instance.new("Folder")
root.Name = "TakkoModelScreen_" .. HttpService:GenerateGUID(false)
root.Parent = workspace
local controller
local results = {}
local function check(name, condition, detail)
 table.insert(results, {name=name, passed=condition == true, detail=tostring(detail)})
end
local ok, err = xpcall(function()
 local sheet = Instance.new("Model") sheet.Name="Sheet" sheet.Parent=root
 local parts, originals = {}, {}
 for i=1,12 do
  local p=Instance.new("Part") p.Name="Bubble"..i p.Anchored=true
  p.Size=Vector3.new(2,1+i*0.01,2) p.CFrame=CFrame.new(i*3,1000,0) p.Transparency=0.1 p.Parent=sheet
  local m=Instance.new("SpecialMesh") m.Name="Mesh" m.MeshType=Enum.MeshType.Sphere m.Scale=Vector3.new(1,0.8,1) m.Parent=p
  local s=Instance.new("Sound") s.Name="Click" s.SoundId="rbxassetid://421058925" s.Parent=p
  local d=Instance.new("ClickDetector") d.MaxActivationDistance=20+i d.Parent=p
  parts[i]=p originals[i]={size=p.Size,cf=p.CFrame,transparency=p.Transparency,scale=m.Scale,range=d.MaxActivationDistance,sound=s.SoundId}
 end
 -- Execute the unchanged module body in a function because the Studio assistant
 -- capability boundary prevents reparenting a new ModuleScript under this folder.
 local candidate=(function()
 SOURCE_EXECUTABLE
 end)()
 controller=candidate.new(sheet)
 check("initial",controller:GetCount()==0 and controller:IsComplete()==false)
 local outsider=Instance.new("Part") outsider.Parent=root
 check("outside_rejected",controller:Press(outsider)==false)
 local start=os.clock()
 local accepted=controller:Press(parts[1])
 check("accepted_nonblocking",accepted==true and os.clock()-start<0.1)
 check("duplicate_rejected",controller:Press(parts[1])==false)
 check("count_waits_for_pop",controller:GetCount()==0)
 task.wait(0.04)
 local p=parts[1] local orig=originals[1]
 check("native_depression",p.Size~=orig.size or p.CFrame~=orig.cf or p.Mesh.Scale~=orig.scale)
 task.wait(0.2)
 check("one_pop",controller:GetCount()==1 and p.Transparency==1)
 check("popped_rejected",controller:Press(p)==false)
 for i=2,12 do controller:Press(parts[i]) end
 task.wait(0.25)
 check("sheet_completion",controller:GetCount()==12 and controller:IsComplete()==true)
 controller:Reset()
 local restored=true
 for i,p2 in ipairs(parts) do local o=originals[i]
  restored=restored and p2.Size==o.size and p2.CFrame==o.cf and p2.Transparency==o.transparency and p2.Mesh.Scale==o.scale and p2.ClickDetector.MaxActivationDistance==o.range and p2.Click.SoundId==o.sound
 end
 check("reset_restores_originals",restored and controller:GetCount()==0 and controller:IsComplete()==false)
 controller:Press(parts[1]) task.wait(0.04) controller:Reset() task.wait(0.22)
 check("reset_cancels_pending",controller:GetCount()==0 and parts[1].Transparency==originals[1].transparency)
 check("replay_accepted",controller:Press(parts[1])==true) task.wait(0.25)
 check("replay_counts_once",controller:GetCount()==1)
 controller:Reset() controller:Press(parts[1]) controller:Destroy() task.wait(0.25)
 check("destroy_cancels_pending",controller:GetCount()==0 and parts[1].Transparency~=1)
 check("destroy_rejects_input",controller:Press(parts[2])==false)
end,debug.traceback)
if controller then pcall(function() controller:Destroy() end) end
local ownedName=root.Name
root:Destroy()
return {checks=results,executionSucceeded=ok,error=not ok and tostring(err) or nil,ownedName=ownedName,cleaned=workspace:FindFirstChild(ownedName)==nil,mode="Edit",physicalInputTested=false,audioAudibilityTested=false,fullGamePass=false}
