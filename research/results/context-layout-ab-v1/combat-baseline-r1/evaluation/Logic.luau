local Logic={}
Logic.__index=Logic

function Logic.new(cooldown, resetAfter)
	local self=setmetatable({
		_cooldown=cooldown,
		_resetAfter=resetAfter,
		_lastAttackTime=nil,
		_comboStep=0,
		_hitsCount=0,
		_hitTargets={},
	}, Logic)
	return self
end

function Logic:attack(now)
	-- reject if no last attack and now < 0 (should never happen negative time but protect)
	if self._lastAttackTime then
		local elapsed=now - self._lastAttackTime
		if elapsed < self._cooldown then
			-- cooldown
			return nil
		elseif elapsed > self._resetAfter then
			-- reset combo
			self._comboStep = 1
		else
			-- continue combo
			self._comboStep = (self._comboStep % 3) + 1
		end
	else
		-- first attack
		self._comboStep = 1
	end
	self._lastAttackTime = now
	self._hitTargets = {}
	return self._comboStep
end

function Logic:hit(targetId)
	if not self._lastAttackTime then
		-- no attack made yet
		return false
	end
	if type(targetId)~='string' then
		return false
	end
	if targetId=='' then
		return false
	end
	if self._hitTargets[targetId] then
		return false
	end
	self._hitTargets[targetId] = true
	self._hitsCount = self._hitsCount + 1
	return true
end

function Logic:getHits()
	return self._hitsCount
end

function Logic:reset()
	self._lastAttackTime = nil
	self._comboStep = 0
	self._hitsCount = 0
	self._hitTargets = {}
end

return Logic
