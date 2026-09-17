local Logic = {}
Logic.__index = Logic

function Logic.new(duration)
	assert(type(duration) == "number" and duration > 0, "duration must be positive number")
	local self = setmetatable({
		duration = duration,
		count = 0,
		nextToken = 1,
		current = nil, -- current active crunch { token, startTime, completed }
	}, Logic)
	return self
end

function Logic:request(now)
	assert(type(now) == "number", "now must be a number")
	if self.current then
		-- busy if current in progress and not completed
		-- busy also if now < previous start + duration (because the next can start only after completing previous)
		if now < (self.current.startTime + self.duration) then
			return nil
		end
		-- Also if current not completed means busy
		if self.current.completed == false then
			return nil
		end
	end
	-- Accept new request
	local token = self.nextToken
	self.nextToken = self.nextToken + 1
	self.current = {
		token = token,
		startTime = now,
		completed = false,
	}
	return token
end

function Logic:complete(token, now)
	assert(type(token) == "number" and token > 0, "token must be positive number")
	assert(type(now) == "number", "now must be a number")
	local c = self.current
	if not c then
		-- no active crunch, stale
		return false
	end
	if c.token ~= token then
		-- different token, ignore stale
		return false
	end
	if c.completed then
		-- already completed this token, duplicate
		return false
	end
	-- must be at or after start + duration
	if now < c.startTime + self.duration then
		-- early
		return false
	end
	-- complete now
	c.completed = true
	self.count = self.count + 1
	return true
end

function Logic:getCount()
	return self.count
end

function Logic:reset()
	self.count = 0
	-- cancel current crunch
	self.current = nil
end

return Logic
