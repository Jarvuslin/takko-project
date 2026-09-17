local Logic = {}
Logic.__index = Logic

function Logic.new(cooldown, resetAfter)
	local self = setmetatable({}, Logic)
	self.cooldown = cooldown
	self.resetAfter = resetAfter
	self:reset()
	return self
end

function Logic:attack(now)
	if self.lastAttack == nil then
		-- First attack
		self.comboStep = 1
		self.lastAttack = now
		self.hitTargets = {}
		return self.comboStep
	end

	local dt = now - self.lastAttack

	-- Reject input if less than cooldown elapsed
	if dt < self.cooldown then
		return nil
	end

	-- Reset combo if gap is strictly greater than resetAfter
	if dt > self.resetAfter then
		self.comboStep = 1
	else
		-- Advance combo step cycling 1,2,3,1
		self.comboStep = (self.comboStep % 3) + 1
	end
	self.lastAttack = now
	self.hitTargets = {}
	return self.comboStep
end

function Logic:hit(targetId)
	-- Reject hits before any attack
	if self.comboStep == nil then
		return false
	end

	-- reject empty targetId
	if targetId == nil or targetId == '' then
		return false
	end

	if self.hitTargets[targetId] then
		return false
	end

	self.hitTargets[targetId] = true
	self.hits = self.hits + 1
	return true
end

function Logic:getHits()
	return self.hits
end

function Logic:reset()
	self.comboStep = nil
	self.lastAttack = nil
	self.hits = 0
	self.hitTargets = {}
end

return Logic
