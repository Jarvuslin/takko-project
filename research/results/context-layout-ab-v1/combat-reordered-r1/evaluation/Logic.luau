local Logic = {}
Logic.__index = Logic

function Logic.new(cooldown, resetAfter)
	local self = setmetatable({}, Logic)
	self._cooldown = cooldown
	self._resetAfter = resetAfter
	self:reset()
	return self
end

function Logic:reset()
	self._lastAttackTime = nil
	self._comboStep = 0
	self._hits = 0
	self._hitTargets = {}
	self._hasAttack = false
end

function Logic:attack(now)
	if self._lastAttackTime then
		local elapsed = now - self._lastAttackTime
		-- Reject if less than cooldown
		if elapsed < self._cooldown then
			return nil
		end
		-- Reset combo if gap strictly greater than resetAfter
		if elapsed > self._resetAfter then
			self._comboStep = 1
		else
			self._comboStep = self._comboStep + 1
			if self._comboStep > 3 then
				self._comboStep = 1
			end
		end
	else
		-- First attack
		self._comboStep = 1
	end
	
	self._lastAttackTime = now
	self._hitTargets = {}
	self._hasAttack = true
	return self._comboStep
end

function Logic:hit(targetId)
	if not self._hasAttack then
		return false
	end
	if type(targetId) ~= "string" or targetId == "" then
		return false
	end
	if self._hitTargets[targetId] then
		return false
	else
		self._hitTargets[targetId] = true
		self._hits = self._hits + 1
		return true
	end
end

function Logic:getHits()
	return self._hits
end

return Logic
