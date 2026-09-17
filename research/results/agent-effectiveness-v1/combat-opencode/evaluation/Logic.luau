local Logic = {}
Logic.__index = Logic

function Logic.new(cooldown, resetAfter)
	local self = setmetatable({}, Logic)
	self.cooldown = cooldown
	self.resetAfter = resetAfter
	self.comboStep = 0
	self.lastAttackTime = nil
	self.hitTargets = {}
	self.totalHits = 0
	return self
end

function Logic:attack(now)
	-- if no last attack, start at 1
	if not self.lastAttackTime then
		self.comboStep = 1
		self.lastAttackTime = now
		self.hitTargets = {}
		return self.comboStep
	end

	local elapsed = now - self.lastAttackTime

	-- reject if elapsed is less than cooldown
	if elapsed < self.cooldown then
		return nil
	end

	-- if elapsed is greater than resetAfter, reset combo
	if elapsed > self.resetAfter then
		self.comboStep = 1
	else
		-- cycle combo 1,2,3,1
		self.comboStep = (self.comboStep % 3) + 1
	end

	self.lastAttackTime = now
	self.hitTargets = {}
	return self.comboStep
end

function Logic:hit(targetId)
	if not self.lastAttackTime or self.comboStep == 0 then
		return false
	end
	if type(targetId) ~= "string" or targetId == "" then
		return false
	end

	if self.hitTargets[targetId] then
		return false
	else
		self.hitTargets[targetId] = true
		self.totalHits = self.totalHits + 1
		return true
	end
end

function Logic:getHits()
	return self.totalHits
end

function Logic:reset()
	self.comboStep = 0
	self.lastAttackTime = nil
	self.hitTargets = {}
	self.totalHits = 0
end

return Logic
