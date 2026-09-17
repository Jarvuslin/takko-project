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
		-- first attack ever
		self.comboStep = 1
		self.lastAttack = now
		self.hits = {}
		self.hitsCount = 0
		return self.comboStep
	end

	local elapsed = now - self.lastAttack

	if elapsed < self.cooldown then
		-- too soon, reject
		return nil
	end

	if elapsed > self.resetAfter then
		-- gap too large, reset combo step
		self.comboStep = 1
	else
		-- advance combo cycle 1->2->3->1 ...
		self.comboStep = self.comboStep + 1
		if self.comboStep > 3 then
			self.comboStep = 1
		end
	end
	
	self.lastAttack = now
	self.hits = {}
	return self.comboStep
end

function Logic:hit(targetId)
	if self.comboStep == nil then
		-- no attack yet
		return false
	end
	if type(targetId) ~= "string" or targetId == "" then
		return false
	end
	if self.hits[targetId] then
		return false
	end
	self.hits[targetId] = true
	self.hitsCount = self.hitsCount + 1
	return true
end

function Logic:getHits()
	return self.hitsCount
end

function Logic:reset()
	self.comboStep = nil
	self.lastAttack = nil
	self.hits = {}
	self.hitsCount = 0
end

return Logic
