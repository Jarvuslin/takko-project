local Logic = {}
Logic.__index = Logic

function Logic.new(total)
	assert(type(total) == "number" and total >= 1 and total == math.floor(total), "total must be a positive integer")
	local self = setmetatable({
		total = total,
		currentCheckpoint = 0,
		wins = 0
	}, Logic)
	return self
end

function Logic:reach(index)
	if type(index) ~= "number" or index ~= math.floor(index) then
		return false
	end

	if index < 1 or index > self.total then
		return false
	end

	if index ~= self.currentCheckpoint + 1 then
		return false
	end

	-- Valid sequential reach
	self.currentCheckpoint = index

	-- Check for course completion
	if self.currentCheckpoint == self.total then
		-- Award exactly one win per completion
		self.wins = self.wins + 1
	end

	return true
end

function Logic:getCheckpoint()
	return self.currentCheckpoint
end

function Logic:getWins()
	return self.wins
end

function Logic:isFinished()
	return self.currentCheckpoint == self.total
end

function Logic:respawn()
	-- Return current checkpoint without changing state
	return self.currentCheckpoint
end

function Logic:restart()
	-- Reset progress but keep wins
	self.currentCheckpoint = 0
end

return Logic
