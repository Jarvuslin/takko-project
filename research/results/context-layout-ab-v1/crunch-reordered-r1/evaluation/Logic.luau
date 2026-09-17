local Logic = {}
Logic.__index = Logic

function Logic.new(duration)
	assert(duration > 0, "duration must be positive")

	local self = setmetatable({}, Logic)
	self._duration = duration
	self._count = 0
	self._nextToken = 0
	self._active = nil
	-- _active = { token = number, startTime = number, completed = bool }
	return self
end

function Logic:request(now)
	-- Reject if busy (an active request not yet completed)
	if self._active then
		return nil
	end
	self._nextToken = self._nextToken + 1
	self._active = {
		token = self._nextToken,
		startTime = now,
		completed = false,
	}
	return self._nextToken
end

function Logic:complete(token, now)
	if not self._active then
		-- no active request
		return false
	end
	local active = self._active
	if token ~= active.token then
		-- stale or unrelated token
		return false
	end
	if active.completed then
		-- already completed
		return false
	end
	if now < active.startTime + self._duration then
		-- too early
		return false
	end
	-- complete valid
	active.completed = true
	self._count = self._count + 1
	-- clear active so next request can occur
	self._active = nil
	return true
end

function Logic:getCount()
	return self._count
end

function Logic:reset()
	-- cancel any active request and reset count
	self._active = nil
	self._count = 0
	-- NOTE: old tokens become stale as they will not match new tokens
end

return Logic
