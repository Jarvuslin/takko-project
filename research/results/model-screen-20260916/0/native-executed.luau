-- Isolated Studio Edit test. SOURCE_PLACEHOLDER is replaced with the unchanged model source string.
local source = "local Controller = {}\nController.__index = Controller\n\nfunction Controller.new(sheet)\n\tlocal self = setmetatable({}, Controller)\n\tself.sheet = sheet\n\tself.count = 0\n\tself.complete = false\n\tself.destroyed = false\n\tself.parts = {}\n\tself.connections = {}\n\tself.pending = {}\n\n\tfor _, part in ipairs(sheet:GetChildren()) do\n\t\tif part:IsA(\"BasePart\") then\n\t\t\tlocal detector = part:FindFirstChild(\"ClickDetector\")\n\t\t\tlocal mesh = part:FindFirstChild(\"Mesh\")\n\t\t\tlocal sound = part:FindFirstChild(\"Click\")\n\t\t\tif detector and mesh and sound then\n\t\t\t\tlocal data = {\n\t\t\t\t\tpart = part,\n\t\t\t\t\tdetector = detector,\n\t\t\t\t\tmesh = mesh,\n\t\t\t\t\tsound = sound,\n\t\t\t\t\torigTransparency = part.Transparency,\n\t\t\t\t\torigMaxDist = detector.MaxActivationDistance,\n\t\t\t\t\torigMeshScale = mesh.Scale,\n\t\t\t\t\torigCFrame = part.CFrame,\n\t\t\t\t\tpopped = false,\n\t\t\t\t\tbusy = false,\n\t\t\t\t}\n\t\t\t\tself.parts[part] = data\n\t\t\t\ttable.insert(self.connections, detector.MouseClick:Connect(function()\n\t\t\t\t\tself:Press(part)\n\t\t\t\tend))\n\t\t\tend\n\t\tend\n\tend\n\n\treturn self\nend\n\nfunction Controller:Press(part)\n\tif self.destroyed then return false end\n\tlocal data = self.parts[part]\n\tif not data then return false end\n\tif data.popped or data.busy then return false end\n\n\tdata.busy = true\n\tdata.detector.MaxActivationDistance = 0\n\n\tlocal startCFrame = data.origCFrame\n\tlocal depressedCFrame = startCFrame - Vector3.new(0, 0.05, 0)\n\tlocal duration = 0.12\n\tlocal startTime = os.clock()\n\n\tlocal token = {}\n\tself.pending[part] = token\n\n\tlocal conn\n\tconn = game:GetService(\"RunService\").Heartbeat:Connect(function()\n\t\tif self.destroyed or self.pending[part] ~= token then\n\t\t\tconn:Disconnect()\n\t\t\treturn\n\t\tend\n\t\tlocal t = math.clamp((os.clock() - startTime) / duration, 0, 1)\n\t\tdata.part.CFrame = startCFrame:Lerp(depressedCFrame, t)\n\t\tif t >= 1 then\n\t\t\tconn:Disconnect()\n\t\t\tif self.destroyed or self.pending[part] ~= token then\n\t\t\t\treturn\n\t\t\tend\n\t\t\tself.pending[part] = nil\n\t\t\tdata.sound:Play()\n\t\t\tdata.part.Transparency = 1\n\t\t\tdata.popped = true\n\t\t\tdata.busy = false\n\t\t\tself.count += 1\n\t\t\tif self.count >= self:_totalParts() then\n\t\t\t\tself.complete = true\n\t\t\tend\n\t\tend\n\tend)\n\n\ttable.insert(self.connections, conn)\n\treturn true\nend\n\nfunction Controller:_totalParts()\n\tlocal n = 0\n\tfor _ in pairs(self.parts) do n += 1 end\n\treturn n\nend\n\nfunction Controller:GetCount()\n\treturn self.count\nend\n\nfunction Controller:IsComplete()\n\treturn self.complete\nend\n\nfunction Controller:Reset()\n\tif self.destroyed then return end\n\tself.pending = {}\n\tfor part, data in pairs(self.parts) do\n\t\tdata.part.Transparency = data.origTransparency\n\t\tdata.part.CFrame = data.origCFrame\n\t\tdata.mesh.Scale = data.origMeshScale\n\t\tdata.detector.MaxActivationDistance = data.origMaxDist\n\t\tdata.popped = false\n\t\tdata.busy = false\n\tend\n\tself.count = 0\n\tself.complete = false\nend\n\nfunction Controller:Destroy()\n\tif self.destroyed then return end\n\tself.destroyed = true\n\tself.pending = {}\n\tfor _, conn in ipairs(self.connections) do\n\t\tconn:Disconnect()\n\tend\n\tself.connections = {}\nend\n\nreturn Controller\n"
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
	local self = setmetatable({}, Controller)
	self.sheet = sheet
	self.count = 0
	self.complete = false
	self.destroyed = false
	self.parts = {}
	self.connections = {}
	self.pending = {}

	for _, part in ipairs(sheet:GetChildren()) do
		if part:IsA("BasePart") then
			local detector = part:FindFirstChild("ClickDetector")
			local mesh = part:FindFirstChild("Mesh")
			local sound = part:FindFirstChild("Click")
			if detector and mesh and sound then
				local data = {
					part = part,
					detector = detector,
					mesh = mesh,
					sound = sound,
					origTransparency = part.Transparency,
					origMaxDist = detector.MaxActivationDistance,
					origMeshScale = mesh.Scale,
					origCFrame = part.CFrame,
					popped = false,
					busy = false,
				}
				self.parts[part] = data
				table.insert(self.connections, detector.MouseClick:Connect(function()
					self:Press(part)
				end))
			end
		end
	end

	return self
end

function Controller:Press(part)
	if self.destroyed then return false end
	local data = self.parts[part]
	if not data then return false end
	if data.popped or data.busy then return false end

	data.busy = true
	data.detector.MaxActivationDistance = 0

	local startCFrame = data.origCFrame
	local depressedCFrame = startCFrame - Vector3.new(0, 0.05, 0)
	local duration = 0.12
	local startTime = os.clock()

	local token = {}
	self.pending[part] = token

	local conn
	conn = game:GetService("RunService").Heartbeat:Connect(function()
		if self.destroyed or self.pending[part] ~= token then
			conn:Disconnect()
			return
		end
		local t = math.clamp((os.clock() - startTime) / duration, 0, 1)
		data.part.CFrame = startCFrame:Lerp(depressedCFrame, t)
		if t >= 1 then
			conn:Disconnect()
			if self.destroyed or self.pending[part] ~= token then
				return
			end
			self.pending[part] = nil
			data.sound:Play()
			data.part.Transparency = 1
			data.popped = true
			data.busy = false
			self.count += 1
			if self.count >= self:_totalParts() then
				self.complete = true
			end
		end
	end)

	table.insert(self.connections, conn)
	return true
end

function Controller:_totalParts()
	local n = 0
	for _ in pairs(self.parts) do n += 1 end
	return n
end

function Controller:GetCount()
	return self.count
end

function Controller:IsComplete()
	return self.complete
end

function Controller:Reset()
	if self.destroyed then return end
	self.pending = {}
	for part, data in pairs(self.parts) do
		data.part.Transparency = data.origTransparency
		data.part.CFrame = data.origCFrame
		data.mesh.Scale = data.origMeshScale
		data.detector.MaxActivationDistance = data.origMaxDist
		data.popped = false
		data.busy = false
	end
	self.count = 0
	self.complete = false
end

function Controller:Destroy()
	if self.destroyed then return end
	self.destroyed = true
	self.pending = {}
	for _, conn in ipairs(self.connections) do
		conn:Disconnect()
	end
	self.connections = {}
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
