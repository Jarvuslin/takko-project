-- Isolated Studio Edit test. SOURCE_PLACEHOLDER is replaced with the unchanged model source string.
local source = "local BubbleSheet = {}\nBubbleSheet.__index = BubbleSheet\n\nfunction BubbleSheet.new(sheet)\n\tassert(sheet and sheet:IsA(\"Model\"), \"sheet must be a Model\")\n\n\tlocal self = setmetatable({}, BubbleSheet)\n\tself._sheet = sheet\n\tself._count = 0\n\tself._total = 0\n\tself._destroyed = false\n\tself._generation = 0\n\tself._pending = {}\n\tself._popped = {}\n\tself._originals = {}\n\tself._connections = {}\n\n\tfor _, part in sheet:GetChildren() do\n\t\tif part:IsA(\"BasePart\") then\n\t\t\tself._total += 1\n\t\t\tlocal cd = part:FindFirstChildOfClass(\"ClickDetector\")\n\t\t\tlocal mesh = part:FindFirstChildOfClass(\"SpecialMesh\")\n\n\t\t\tself._originals[part] = {\n\t\t\t\tTransparency = part.Transparency,\n\t\t\t\tMaxActivationDistance = cd and cd.MaxActivationDistance or 0,\n\t\t\t\tMeshScale = mesh and mesh.Scale:Clone() or Vector3.new(1, 1, 1),\n\t\t\t}\n\n\t\t\tif cd then\n\t\t\t\tlocal conn = cd.MouseClick:Connect(function()\n\t\t\t\t\tself:Press(part)\n\t\t\t\tend)\n\t\t\t\ttable.insert(self._connections, conn)\n\t\t\tend\n\t\tend\n\tend\n\n\treturn self\nend\n\nfunction BubbleSheet:Press(part)\n\tif self._destroyed then return false end\n\tif not part or not self._originals[part] then return false end\n\tif self._pending[part] or self._popped[part] then return false end\n\n\tself._pending[part] = true\n\tlocal gen = self._generation\n\tlocal orig = self._originals[part]\n\n\ttask.spawn(function()\n\t\tlocal mesh = part:FindFirstChildOfClass(\"SpecialMesh\")\n\t\tlocal duration = 0.12\n\t\tlocal elapsed = 0\n\n\t\twhile elapsed < duration do\n\t\t\tif self._generation ~= gen then return end\n\t\t\tlocal dt = task.wait()\n\t\t\telapsed += dt\n\t\t\tlocal t = math.min(elapsed / duration, 1)\n\t\t\tif mesh then\n\t\t\t\tmesh.Scale = orig.MeshScale * (1 - 0.3 * t)\n\t\t\tend\n\t\tend\n\n\t\tif self._generation ~= gen then return end\n\n\t\tlocal sound = part:FindFirstChildOfClass(\"Sound\")\n\t\tif sound then sound:Play() end\n\t\tpart.Transparency = 1\n\n\t\tlocal cd = part:FindFirstChildOfClass(\"ClickDetector\")\n\t\tif cd then cd.MaxActivationDistance = 0 end\n\n\t\tif mesh then mesh.Scale = orig.MeshScale end\n\n\t\tself._count += 1\n\t\tself._pending[part] = nil\n\t\tself._popped[part] = true\n\tend)\n\n\treturn true\nend\n\nfunction BubbleSheet:Reset()\n\tself._generation += 1\n\tself._count = 0\n\ttable.clear(self._pending)\n\ttable.clear(self._popped)\n\n\tfor part, orig in self._originals do\n\t\tpart.Transparency = orig.Transparency\n\t\tlocal cd = part:FindFirstChildOfClass(\"ClickDetector\")\n\t\tif cd then cd.MaxActivationDistance = orig.MaxActivationDistance end\n\t\tlocal mesh = part:FindFirstChildOfClass(\"SpecialMesh\")\n\t\tif mesh then mesh.Scale = orig.MeshScale end\n\tend\nend\n\nfunction BubbleSheet:Destroy()\n\tself._generation += 1\n\tself._destroyed = true\n\ttable.clear(self._pending)\n\n\tfor _, conn in self._connections do\n\t\tconn:Disconnect()\n\tend\n\ttable.clear(self._connections)\nend\n\nfunction BubbleSheet:GetCount()\n\treturn self._count\nend\n\nfunction BubbleSheet:IsComplete()\n\treturn self._count >= self._total\nend\n\nreturn BubbleSheet"
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
local BubbleSheet = {}
BubbleSheet.__index = BubbleSheet

function BubbleSheet.new(sheet)
	assert(sheet and sheet:IsA("Model"), "sheet must be a Model")

	local self = setmetatable({}, BubbleSheet)
	self._sheet = sheet
	self._count = 0
	self._total = 0
	self._destroyed = false
	self._generation = 0
	self._pending = {}
	self._popped = {}
	self._originals = {}
	self._connections = {}

	for _, part in sheet:GetChildren() do
		if part:IsA("BasePart") then
			self._total += 1
			local cd = part:FindFirstChildOfClass("ClickDetector")
			local mesh = part:FindFirstChildOfClass("SpecialMesh")

			self._originals[part] = {
				Transparency = part.Transparency,
				MaxActivationDistance = cd and cd.MaxActivationDistance or 0,
				MeshScale = mesh and mesh.Scale:Clone() or Vector3.new(1, 1, 1),
			}

			if cd then
				local conn = cd.MouseClick:Connect(function()
					self:Press(part)
				end)
				table.insert(self._connections, conn)
			end
		end
	end

	return self
end

function BubbleSheet:Press(part)
	if self._destroyed then return false end
	if not part or not self._originals[part] then return false end
	if self._pending[part] or self._popped[part] then return false end

	self._pending[part] = true
	local gen = self._generation
	local orig = self._originals[part]

	task.spawn(function()
		local mesh = part:FindFirstChildOfClass("SpecialMesh")
		local duration = 0.12
		local elapsed = 0

		while elapsed < duration do
			if self._generation ~= gen then return end
			local dt = task.wait()
			elapsed += dt
			local t = math.min(elapsed / duration, 1)
			if mesh then
				mesh.Scale = orig.MeshScale * (1 - 0.3 * t)
			end
		end

		if self._generation ~= gen then return end

		local sound = part:FindFirstChildOfClass("Sound")
		if sound then sound:Play() end
		part.Transparency = 1

		local cd = part:FindFirstChildOfClass("ClickDetector")
		if cd then cd.MaxActivationDistance = 0 end

		if mesh then mesh.Scale = orig.MeshScale end

		self._count += 1
		self._pending[part] = nil
		self._popped[part] = true
	end)

	return true
end

function BubbleSheet:Reset()
	self._generation += 1
	self._count = 0
	table.clear(self._pending)
	table.clear(self._popped)

	for part, orig in self._originals do
		part.Transparency = orig.Transparency
		local cd = part:FindFirstChildOfClass("ClickDetector")
		if cd then cd.MaxActivationDistance = orig.MaxActivationDistance end
		local mesh = part:FindFirstChildOfClass("SpecialMesh")
		if mesh then mesh.Scale = orig.MeshScale end
	end
end

function BubbleSheet:Destroy()
	self._generation += 1
	self._destroyed = true
	table.clear(self._pending)

	for _, conn in self._connections do
		conn:Disconnect()
	end
	table.clear(self._connections)
end

function BubbleSheet:GetCount()
	return self._count
end

function BubbleSheet:IsComplete()
	return self._count >= self._total
end

return BubbleSheet
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
