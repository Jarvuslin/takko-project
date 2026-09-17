local Logic={}
Logic.__index=Logic

function Logic.new(total)
	assert(type(total)=='number' and total>=1 and math.floor(total)==total,'total must be positive integer')
	local self=setmetatable({
		total=total,
		checkpoint=0,
		wins=0,
		finished=false
	},Logic)
	return self
end

function Logic:reach(index)
	-- Validate index: integer and in 1..total
	if type(index)~='number' or math.floor(index)~=index then
		return false
	end
	if index<1 or index>self.total then
		return false
	end
	-- Must be exactly current+1
	if index~=self.checkpoint+1 then
		return false
	end
	-- Advance checkpoint
	self.checkpoint=index
	-- If completed final checkpoint and first time finishing, increment wins and mark finished
	if self.checkpoint==self.total and not self.finished then
		self.wins=self.wins+1
		self.finished=true
	end
	return true
end

function Logic:getCheckpoint()
	return self.checkpoint
end

function Logic:getWins()
	return self.wins
end

function Logic:isFinished()
	return self.finished
end

function Logic:respawn()
	-- returns current checkpoint but makes no state change
	return self.checkpoint
end

function Logic:restart()
	-- reset checkpoint progress to 0, retain wins, reset finished
	self.checkpoint=0
	self.finished=false
	return true
end

return Logic
