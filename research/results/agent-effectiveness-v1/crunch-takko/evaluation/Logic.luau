local Logic={}
Logic.__index=Logic

function Logic.new(duration)
	assert(type(duration)=='number' and duration>0,'duration must be positive number')
	local self=setmetatable({
		duration=duration,
		count=0,
		nextToken=1,
		current=nil, -- {token:number,start:number,completed:boolean}
	},Logic)
	return self
end

function Logic:request(now)
	assert(type(now)=='number','now must be number')
	if self.current then
		-- busy with active request
		if now < self.current.start + self.duration then
			return nil
		else
			-- If enough time passed, request ended. But we do not auto-complete or increment count here.
			-- Clear current if expired.
			self.current=nil
		end
	end
	-- Accept new request
	local token=self.nextToken
	self.nextToken=token+1
	self.current={token=token, start=now, completed=false}
	return token
end

function Logic:complete(token, now)
	assert(type(token)=='number' and token > 0 and token%1==0,'token integer positive')
	assert(type(now)=='number','now must be number')
	if not self.current then
		return false -- no active request
	end
	if token ~= self.current.token then
		return false -- stale or wrong token
	end
	if self.current.completed then
		return false -- duplicate completion
	end
	-- Check timer
	if now < self.current.start + self.duration then
		return false -- too early
	end
	self.current.completed=true
	self.count=self.count+1
	return true
end

function Logic:getCount()
	return self.count
end

function Logic:reset()
	self.count=0
	self.current=nil
	-- Note: nextToken continues, old tokens never valid again
end

return Logic
