local Logic = {}
Logic.__index = Logic

function Logic.new(total)
	assert(type(total) == "number" and total >= 1 and math.floor(total) == total, "total must be a positive integer")
	local self = setmetatable({}, Logic)
	self._total = total
	self._checkpoint = 0
	self._wins = 0
	return self
end

function Logic:reach(index)
	-- index must be integer and in 1..total
	if type(index) ~= "number" then return false end
	if math.floor(index) ~= index then return false end
	if index < 1 or index > self._total then return false end
	-- index must be exactly current+1
	if index ~= self._checkpoint + 1 then return false end
	self._checkpoint = index
	-- if finished, award win once
	if self._checkpoint == self._total then
		self._wins = self._wins + 1
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
	return self._checkpoint == self._total
end

function Logic:respawn()
	return self._checkpoint
end

function Logic:restart()
	self._checkpoint = 0
	return
end

return Logic
