local Logic = {}

local function new(cooldown, resetAfter)
	local self = {}

	-- Internal state
	local lastAttackTime = nil
	local currentCombo = 0
	local hits = 0
	local hitsThisAttack = {}

	-- Accept an attack at given time 'now'
	-- Returns combo step 1,2,3 cycling, or nil if rejected
	function self:attack(now)
		-- Reject if cooldown not elapsed from last accepted attack
		if lastAttackTime then
			local elapsed = now - lastAttackTime
			if elapsed < cooldown then
				return nil
			end

			-- If gap strictly greater than resetAfter, reset combo
			if elapsed > resetAfter then
				currentCombo = 1
			else
				currentCombo = currentCombo % 3 + 1
			end
		else
			-- First attack ever
			currentCombo = 1
		end

		-- Accept attack
		lastAttackTime = now
		hitsThisAttack = {}	-- reset hits for this attack
		return currentCombo
	end

	-- Register hit on targetId for current attack
	-- Returns true if this targetId was not hit before on this swing and targetId is nonempty and combo started
	function self:hit(targetId)
		if currentCombo == 0 then
			-- No accepted attack yet
			return false
		end

		if type(targetId) ~= "string" or targetId == "" then
			return false
		end

		if not hitsThisAttack[targetId] then
			hitsThisAttack[targetId] = true
			hits = hits + 1
			return true
		else
			return false
		end
	end

	function self:getHits()
		return hits
	end

	function self:reset()
		lastAttackTime = nil
		currentCombo = 0
		hits = 0
		hitsThisAttack = {}
	end

	return self
end

Logic.new = new

return Logic
