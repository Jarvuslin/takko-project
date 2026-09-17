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
