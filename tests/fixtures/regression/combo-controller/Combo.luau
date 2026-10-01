-- Pure combo logic. No Roblox globals are used at load time.
local Combo = {}

local DEFAULTS = {
	grace = 0.35,
	fade = 0.08,
	early = 0.10,
	range = 6,
	minFacingDot = 0.25,
	lateSlack = 0,
}

local function merge(options)
	local o = {}
	for k, v in pairs(DEFAULTS) do
		o[k] = v
	end
	if options then
		for k, v in pairs(options) do
			o[k] = v
		end
	end
	return o
end

---------------------------------------------------------------- client

function Combo.client(segments, options)
	return {
		segments = segments,
		options = merge(options),
		index = 0,
		active = false,
		position = 0,
		holdAt = nil,
		holdUntil = 0,
		buffered = false,
		hits = {},
		fadeUntil = 0,
		lastTick = nil,
		seek = false,
		held = false,
		stopFade = nil,
		nonce = 1,
	}
end

local function startSegment(c, i, now, seek)
	c.index = i
	c.active = true
	c.position = c.segments[i].start
	c.holdAt = nil
	c.buffered = false
	c.lastTick = now
	if seek then
		c.seek = true
	end
	c.stopFade = nil
end

local function resetClient(c, now, immediate)
	local wasRunning = c.index > 0
	c.index = 0
	c.active = false
	c.position = 0
	c.holdAt = nil
	c.holdUntil = 0
	c.buffered = false
	c.seek = false
	c.held = false
	if immediate then
		c.fadeUntil = 0
		c.hits = {}
		c.stopFade = 0
	else
		c.fadeUntil = now + c.options.fade
		if wasRunning then
			c.stopFade = c.options.fade
		end
	end
end

Combo.resetClient = resetClient

-- Returns the index of a segment that started (a request should be sent), or nil.
function Combo.click(c, now)
	local n = #c.segments
	if c.active then
		if not c.buffered and c.index < n then
			c.buffered = true
		end
		return nil
	end
	if c.index > 0 then
		if now <= c.holdUntil and c.index < n then
			startSegment(c, c.index + 1, now, true)
			return c.index
		end
		resetClient(c, now, false)
	end
	c.hits = {}
	startSegment(c, 1, now, true)
	return 1
end

-- Advances local time. Position is clamped at the segment end before crossed hits are
-- tested. Returns the index of a buffered segment that started, or nil.
function Combo.tick(c, now)
	local last = c.lastTick or now
	c.lastTick = now
	local n = #c.segments
	if c.active then
		local dt = math.max(0, now - last)
		local seg = c.segments[c.index]
		local prev = c.position
		local nextPos = prev + dt
		if nextPos > seg.finish then
			nextPos = seg.finish
		end
		if seg.hit > prev and seg.hit <= nextPos then
			table.insert(c.hits, c.index)
		end
		c.position = nextPos
		if nextPos >= seg.finish then
			if c.index >= n then
				resetClient(c, now, false)
			elseif c.buffered then
				startSegment(c, c.index + 1, now, true)
				return c.index
			else
				c.active = false
				c.holdAt = seg.finish
				c.holdUntil = now + c.options.grace
			end
		end
	elseif c.index > 0 and now >= c.holdUntil then
		resetClient(c, now, false)
	end
	return nil
end

-- Drives an AnimationTrack (or compatible fake) from client state.
function Combo.playback(c, track)
	if c.active then
		if c.seek then
			c.seek = false
			c.held = false
			if not track.IsPlaying then
				track:Play(0, 1, 1)
			end
			track.TimePosition = c.position
			track:AdjustSpeed(1)
		end
	elseif c.index > 0 and c.holdAt then
		if not c.held then
			c.held = true
			track.TimePosition = c.holdAt
			track:AdjustSpeed(0)
		end
	elseif c.stopFade ~= nil then
		local f = c.stopFade
		c.stopFade = nil
		c.held = false
		if track.IsPlaying then
			track:Stop(f)
		end
	end
end

---------------------------------------------------------------- server

function Combo.server(segments, options)
	return {
		segments = segments,
		options = merge(options),
		nonce = 1,
		alive = true,
		index = 0,
		endAt = 0,
		pending = nil,
		pendingBySegment = {},
		counter = 0,
		comboCounter = 0,
		hitTargets = {},
	}
end

local function rotate(s)
	s.comboCounter = 0
	s.nonce = s.nonce + 1
	s.index = 0
	s.endAt = 0
	s.pending = nil
	s.pendingBySegment = {}
	s.hitTargets = {}
end

local function refreshPending(s)
	local best
	for i, p in pairs(s.pendingBySegment) do
		if not best or i > best then
			best = i
		end
	end
	s.pending = best and s.pendingBySegment[best] or nil
end

-- Expires the combo window. Returns true when the nonce was rotated.
function Combo.finish(s, now)
	if s.index == 0 then
		return false
	end
	if s.index >= #s.segments then
		if now >= s.endAt then
			rotate(s)
			return true
		end
		return false
	end
	if now > s.endAt + s.options.grace + s.options.lateSlack then
		rotate(s)
		return true
	end
	return false
end

-- Returns ok, reason, hitAt.
function Combo.accept(s, nonce, index, now)
	if not s.alive then
		return false, "dead"
	end
	if nonce ~= s.nonce then
		return false, "stale"
	end
	if type(index) ~= "number" or index % 1 ~= 0 or index < 1 or index > #s.segments then
		return false, "index"
	end
	Combo.finish(s, now)
	if nonce ~= s.nonce then
		-- window expired; the request belonged to the previous combo
		return false, "stale"
	end
	if index ~= s.index + 1 then
		return false, "order"
	end
	local start = now
	if index > 1 then
		if now < s.endAt - s.options.early then
			return false, "early"
		end
		start = math.max(now, s.endAt)
	end
	local seg = s.segments[index]
	local hitAt = start + (seg.hit - seg.start)
	s.index = index
	s.endAt = start + (seg.finish - seg.start)
	s.pendingBySegment[index] = {index = index, hitAt = hitAt, nonce = s.nonce}
	refreshPending(s)
	return true, nil, hitAt
end

-- Sorted indices whose scheduled time has been reached.
function Combo.due(s, now)
	local list = {}
	for i, p in pairs(s.pendingBySegment) do
		if p.hitAt <= now then
			table.insert(list, i)
		end
	end
	table.sort(list)
	return list
end

local function targetValid(s, t)
	if type(t) ~= "table" then return false end
	if not t.alive or not t.inScope or not t.lineOfSight then return false end
	if type(t.distance) ~= "number" or t.distance > s.options.range then return false end
	if type(t.facing) ~= "number" or t.facing < s.options.minFacingDot then return false end
	return true
end

-- Resolves due pending hits (all, or only `index`). The target must be computed by
-- the server. Returns the number of counted hits.
function Combo.hit(s, nonce, now, target, index)
	if nonce ~= s.nonce or not s.alive then
		return 0
	end
	local indices
	if index then
		indices = {index}
	else
		indices = Combo.due(s, now)
	end
	local count = 0
	for _, i in ipairs(indices) do
		local p = s.pendingBySegment[i]
		if p and p.hitAt <= now then
			s.pendingBySegment[i] = nil
			if targetValid(s, target) then
				local key = i .. ":" .. tostring(target.id)
				if not s.hitTargets[key] then
					s.hitTargets[key] = true
					s.counter = s.counter + 1
					s.comboCounter = s.comboCounter + 1
					count = count + 1
				end
			end
		end
	end
	refreshPending(s)
	return count
end

function Combo.cancel(s)
	rotate(s)
end

function Combo.respawn(s)
	s.alive = true
	rotate(s)
end

function Combo.death(c, s, now)
	if c then
		resetClient(c, now or 0, true)
	end
	if s then
		s.alive = false
		rotate(s)
	end
end

return Combo
