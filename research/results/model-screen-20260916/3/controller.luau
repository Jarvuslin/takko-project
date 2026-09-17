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