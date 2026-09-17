local Logic = {}
Logic.__index = Logic

function Logic.new(total)
	assert(type(total) == "number" and total >= 1 and math.floor(total) == total, "total must be an integer >= 1")
	local self = setmetatable({}, Logic)
	self._total = total
	self._checkpoint = 0
	self._wins = 0
	self._finished = false
	return self
end

function Logic:reach(index)
	-- validate index is integer within 1..total
	if type(index) ~= "number" or math.floor(index) ~= index or index < 1 or index > self._total then
		return false
	end

	-- must be strictly current+1
	if index ~= self._checkpoint + 1 then
		return false
	end

	self._checkpoint = index
	if self._checkpoint == self._total and not self._finished then
		self._wins = self._wins + 1
		self._finished = true
	end
	return true
end

function Logic:getCheckpoint()
	return self._checkpoint
end

function Logic:getWins()
	return self._wins
end

function Logic:isFinished()
	return self._finished
end

function Logic:respawn()
	return self._checkpoint
end

function Logic:restart()
	self._checkpoint = 0
	self._finished = false
	return
end

return Logic
