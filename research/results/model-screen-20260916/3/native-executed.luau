-- Isolated Studio Edit test. SOURCE_PLACEHOLDER is replaced with the unchanged model source string.
local source = "local Controller = {}\nController.__index = Controller\n\nfunction Controller.new(sheet)\n\tassert(typeof(sheet) == \"Instance\" and sheet:IsA(\"Model\"), \"Controller.new expects a Model\")\n\n\tlocal self = setmetatable({\n\t\tsheet = sheet,\n\t\tcount = 0,\n\t\tcomplete = false,\n\t\tdestroyed = false,\n\t\tgeneration = 0,\n\t\tstates = {},\n\t\tconnections = {},\n\t}, Controller)\n\n\tfor _, child in ipairs(sheet:GetChildren()) do\n\t\tif child:IsA(\"BasePart\") then\n\t\t\tlocal mesh = child:FindFirstChild(\"Mesh\")\n\t\t\tlocal click = child:FindFirstChild(\"Click\")\n\t\t\tlocal detector = child:FindFirstChildOfClass(\"ClickDetector\")\n\n\t\t\tif mesh and mesh:IsA(\"SpecialMesh\") and click and click:IsA(\"Sound\") and detector then\n\t\t\t\tself.states[child] = {\n\t\t\t\t\ttransparency = child.Transparency,\n\t\t\t\t\tmeshScale = mesh.Scale,\n\t\t\t\t\tmaxActivationDistance = detector.MaxActivationDistance,\n\t\t\t\t\tpressed = false,\n\t\t\t\t}\n\n\t\t\t\ttable.insert(self.connections, detector.MouseClick:Connect(function()\n\t\t\t\t\tself:Press(child)\n\t\t\t\tend))\n\t\t\tend\n\t\tend\n\tend\n\n\treturn self\nend\n\nfunction Controller:Press(part)\n\tif self.destroyed or self.complete then\n\t\treturn false\n\tend\n\n\tlocal state = self.states[part]\n\tif not state or state.pressed or not part:IsDescendantOf(self.sheet) then\n\t\treturn false\n\tend\n\n\tlocal mesh = part:FindFirstChild(\"Mesh\")\n\tlocal click = part:FindFirstChild(\"Click\")\n\tlocal detector = part:FindFirstChildOfClass(\"ClickDetector\")\n\tif not mesh or not mesh:IsA(\"SpecialMesh\") or not click or not click:IsA(\"Sound\") or not detector then\n\t\treturn false\n\tend\n\n\tstate.pressed = true\n\tdetector.MaxActivationDistance = 0\n\tself.generation += 1\n\tlocal generation = self.generation\n\tlocal steps = 6\n\tlocal originalScale = state.meshScale\n\tlocal depressedScale = Vector3.new(originalScale.X, originalScale.Y * 0.7, originalScale.Z)\n\n\ttask.spawn(function()\n\t\tfor step = 1, steps do\n\t\t\ttask.wait(0.12 / steps)\n\t\t\tif self.destroyed or generation ~= self.generation then\n\t\t\t\treturn\n\t\t\tend\n\t\t\tlocal alpha = step / steps\n\t\t\tmesh.Scale = originalScale:Lerp(depressedScale, alpha)\n\t\tend\n\n\t\tif self.destroyed or generation ~= self.generation then\n\t\t\treturn\n\t\tend\n\n\t\tpart.Transparency = 1\n\t\tclick:Play()\n\t\tself.count += 1\n\t\tif self.count >= 12 then\n\t\t\tself.complete = true\n\t\tend\n\tend)\n\n\treturn true\nend\n\nfunction Controller:Reset()\n\tif self.destroyed then\n\t\treturn\n\tend\n\n\tself.generation += 1\n\tself.count = 0\n\tself.complete = false\n\n\tfor part, state in pairs(self.states) do\n\t\tif part and part.Parent then\n\t\t\tlocal mesh = part:FindFirstChild(\"Mesh\")\n\t\t\tlocal detector = part:FindFirstChildOfClass(\"ClickDetector\")\n\t\t\tpart.Transparency = state.transparency\n\t\t\tif mesh and mesh:IsA(\"SpecialMesh\") then\n\t\t\t\tmesh.Scale = state.meshScale\n\t\t\tend\n\t\t\tif detector then\n\t\t\t\tdetector.MaxActivationDistance = state.maxActivationDistance\n\t\t\tend\n\t\tend\n\t\tstate.pressed = false\n\tend\nend\n\nfunction Controller:Destroy()\n\tif self.destroyed then\n\t\treturn\n\tend\n\n\tself.destroyed = true\n\tself.generation += 1\n\tfor _, connection in ipairs(self.connections) do\n\t\tconnection:Disconnect()\n\tend\n\ttable.clear(self.connections)\n\ttable.clear(self.states)\n\tself.sheet = nil\nend\n\nfunction Controller:GetCount()\n\treturn self.count\nend\n\nfunction Controller:IsComplete()\n\treturn self.complete\nend\n\nreturn Controller"
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
local Controller = {}
Controller.__index = Controller

function Controller.new(sheet)
	assert(typeof(sheet) == "Instance" and sheet:IsA("Model"), "Controller.new expects a Model")

	local self = setmetatable({
		sheet = sheet,
		count = 0,
		complete = false,
		destroyed = false,
		generation = 0,
		states = {},
		connections = {},
	}, Controller)

	for _, child in ipairs(sheet:GetChildren()) do
		if child:IsA("BasePart") then
			local mesh = child:FindFirstChild("Mesh")
			local click = child:FindFirstChild("Click")
			local detector = child:FindFirstChildOfClass("ClickDetector")

			if mesh and mesh:IsA("SpecialMesh") and click and click:IsA("Sound") and detector then
				self.states[child] = {
					transparency = child.Transparency,
					meshScale = mesh.Scale,
					maxActivationDistance = detector.MaxActivationDistance,
					pressed = false,
				}

				table.insert(self.connections, detector.MouseClick:Connect(function()
					self:Press(child)
				end))
			end
		end
	end

	return self
end

function Controller:Press(part)
	if self.destroyed or self.complete then
		return false
	end

	local state = self.states[part]
	if not state or state.pressed or not part:IsDescendantOf(self.sheet) then
		return false
	end

	local mesh = part:FindFirstChild("Mesh")
	local click = part:FindFirstChild("Click")
	local detector = part:FindFirstChildOfClass("ClickDetector")
	if not mesh or not mesh:IsA("SpecialMesh") or not click or not click:IsA("Sound") or not detector then
		return false
	end

	state.pressed = true
	detector.MaxActivationDistance = 0
	self.generation += 1
	local generation = self.generation
	local steps = 6
	local originalScale = state.meshScale
	local depressedScale = Vector3.new(originalScale.X, originalScale.Y * 0.7, originalScale.Z)

	task.spawn(function()
		for step = 1, steps do
			task.wait(0.12 / steps)
			if self.destroyed or generation ~= self.generation then
				return
			end
			local alpha = step / steps
			mesh.Scale = originalScale:Lerp(depressedScale, alpha)
		end

		if self.destroyed or generation ~= self.generation then
			return
		end

		part.Transparency = 1
		click:Play()
		self.count += 1
		if self.count >= 12 then
			self.complete = true
		end
	end)

	return true
end

function Controller:Reset()
	if self.destroyed then
		return
	end

	self.generation += 1
	self.count = 0
	self.complete = false

	for part, state in pairs(self.states) do
		if part and part.Parent then
			local mesh = part:FindFirstChild("Mesh")
			local detector = part:FindFirstChildOfClass("ClickDetector")
			part.Transparency = state.transparency
			if mesh and mesh:IsA("SpecialMesh") then
				mesh.Scale = state.meshScale
			end
			if detector then
				detector.MaxActivationDistance = state.maxActivationDistance
			end
		end
		state.pressed = false
	end
end

function Controller:Destroy()
	if self.destroyed then
		return
	end

	self.destroyed = true
	self.generation += 1
	for _, connection in ipairs(self.connections) do
		connection:Disconnect()
	end
	table.clear(self.connections)
	table.clear(self.states)
	self.sheet = nil
end

function Controller:GetCount()
	return self.count
end

function Controller:IsComplete()
	return self.complete
end

return Controller
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
