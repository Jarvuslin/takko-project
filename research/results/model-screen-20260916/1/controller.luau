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