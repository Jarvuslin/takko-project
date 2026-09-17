local Logic = {}
Logic.__index = Logic

function Logic.new(duration)
	assert(type(duration) == "number" and duration > 0, "duration must be positive number")
	local self = setmetatable({}, Logic)
	self._duration = duration
	self._count = 0
	self._nextToken = 0
	self._activeToken = nil -- Token number currently active
	self._startTime = nil -- Start time for active token
	self._completedTokens = {} -- Set of tokens completed
	
	return self
end

function Logic:request(now)
	assert(type(now) == "number", "now must be number")
	if self._activeToken ~= nil then
		-- There is a pending active token, disallow new request
		-- Overlap blocks new requests
		return nil
	end
	-- Accept new request
	self._nextToken = self._nextToken + 1
	self._activeToken = self._nextToken
	self._startTime = now
	return self._activeToken
end

function Logic:complete(token, now)
	assert(type(token) == "number", "token must be number")
	assert(type(now) == "number", "now must be number")

	if self._activeToken ~= token then
		-- stale or invalid token
		return false
	end

	-- Check if already completed
	if self._completedTokens[token] then
		-- duplicate completion
		return false
	end

	if now < self._startTime + self._duration then
		-- too early
		return false
	end

	-- Complete once
	self._completedTokens[token] = true
	self._count = self._count + 1
	-- Clear active state
	self._activeToken = nil
	self._startTime = nil
	
	return true
end

function Logic:getCount()
	return self._count
end

function Logic:reset()
	-- clear count and any pending tokens
	self._count = 0
	self._activeToken = nil
	self._startTime = nil
	self._completedTokens = {}
end

return Logic
