local Logic = {}
Logic.__index = Logic

function Logic.new(total)
	assert(type(total) == "number" and total >= 1 and math.floor(total) == total, "total must be a positive integer")
	local self = setmetatable({}, Logic)
	self.total = total
	self.currentCheckpoint = 0
	self.wins = 0
	self.finished = false
	return self
end

function Logic:reach(index)
	-- Validate index is integer within 1..total
	if type(index) ~= "number" or index % 1 ~= 0 or index < 1 or index > self.total then
		return false
	end
	-- Only allow reaching next checkpoint sequentially
	if index ~= self.currentCheckpoint + 1 then
		return false
	end
	-- Mark progress
	self.currentCheckpoint = index
	-- Check if finished
	if index == self.total then
		if not self.finished then
			self.wins = self.wins + 1
			self.finished = true
		end
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
	return self.finished
end

function Logic:respawn()
	-- Return current checkpoint, retain progress
	return self.currentCheckpoint
end

function Logic:restart()
	-- Reset progress but retain wins
	self.currentCheckpoint = 0
	self.finished = false
	return nil
end

return Logic
