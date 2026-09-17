local Logic = {}

-- Create a new controller instance
function Logic.new(duration)
	assert(type(duration) == "number" and duration > 0, "duration must be positive number")
	local self = {}

	-- State variables
	self.duration = duration
	self.count = 0
	self.nextTokenId = 1
	self.currentRequest = nil -- { token, startTime, completed }

	-- Request a new crunch at time `now`
	function self:request(now)
		if type(now) ~= "number" then error("now must be a number") end

		-- Reject if there is an active pending crunch
		if self.currentRequest then
			local cr = self.currentRequest
			-- Only reject if the previous request is still in progress (not completed)
			if not cr.completed then
				return nil
			end
		end

		local token = self.nextTokenId
		self.nextTokenId = self.nextTokenId + 1

		-- Store new pending crunch
		self.currentRequest = {
			token = token,
			startTime = now,
			completed = false,
		}

		return token
	end

	-- Complete the crunch for token at time `now`
	-- Returns true only exactly once per valid token at or after startTime+duration
	function self:complete(token, now)
		if type(token) ~= "number" or type(now) ~= "number" then
			error("token and now must be numbers")
		end

		local cr = self.currentRequest
		if not cr then
			return false -- no current request
		end

		if cr.token ~= token then
			-- Stale or invalid token
			return false
		end

		if cr.completed then
			-- Already completed once for this token
			return false
		end

		-- Check if now is early
		if now < cr.startTime + self.duration then
			return false
		end

		-- Mark completed and increment count
		cr.completed = true
		self.count = self.count + 1
		return true
	end

	function self:getCount()
		return self.count
	end

	function self:reset()
		-- Cancel current request
		self.currentRequest = nil
		-- Reset count
		self.count = 0
		-- Advance token id to invalidate old tokens
		-- This ensures old tokens never become valid again, even IF reused by error
		self.nextTokenId = self.nextTokenId + 1000000
	end

	return self
end

return Logic
