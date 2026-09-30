-- Offline reference for the approved D1 timing/authority contract.
-- Not generated game code or evidence of native Animator/network behavior.
local Combo = {}
function Combo.client(segments)
	return { segments = segments, index = 0, active = false, buffered = false, hit = false, position = 0, hits = {} }
end
local function begin(c, index, now)
	c.index = index
	c.started = now
	c.position = c.segments[index].start
	c.active = true
	c.buffered = false
	c.hit = false
	c.holdAt = nil
end
local function reset(c, now)
	c.active = false
	c.index = 0
	c.position = 0
	c.buffered = false
	c.holdAt = nil
	c.fadeUntil = now + 0.08
end
function Combo.click(c, now)
	if c.active then c.buffered = true return end
	if c.holdAt and now - c.holdAt <= 0.35 then begin(c, c.index + 1, now)
	else begin(c, 1, now) end
end
function Combo.tick(c, now)
	if not c.active then
		if c.holdAt and now - c.holdAt > 0.35 then reset(c, now) end
		return
	end
	local segment = c.segments[c.index]
	-- Clamp before inspecting hits. A skipped frame never authorizes later hits.
	c.position = math.min(segment.finish, segment.start + now - c.started)
	if not c.hit and c.position >= segment.hit then
		c.hit = true
		table.insert(c.hits, c.index)
	end
	if c.position >= segment.finish then
		if c.index == #c.segments then reset(c, now)
		elseif c.buffered then begin(c, c.index + 1, now)
		else c.active = false c.holdAt = now end
	end
end
function Combo.server(segments)
	return { segments = segments, nonce = 1, last = 0, alive = true, counter = 0, pendingBySegment = {} }
end
function Combo.cancel(s)
	s.nonce += 1
	s.last = 0
	s.pending = nil
	s.pendingBySegment = {}
	s.endAt = nil
end
function Combo.accept(s, nonce, index, now)
	if not s.alive or nonce ~= s.nonce then return false end
	if s.endAt and now > s.endAt + 0.35 then Combo.cancel(s) return false end
	if index ~= s.last + 1 or index > #s.segments then return false end
	-- Explicit 100ms early-arrival tolerance. The authoritative start/hit is
	-- still never earlier than the preceding segment's server recovery end.
	if s.endAt and now < s.endAt - 0.10 then return false end
	local segment = s.segments[index]
	local startAt = math.max(now, s.endAt or now)
	s.endAt = startAt + segment.finish - segment.start
	s.pending = { index = index, hitAt = startAt + segment.hit - segment.start, endAt = s.endAt, seen = {} }
	s.pendingBySegment[index] = s.pending
	s.last = index
	return true
end
function Combo.finish(s, now)
	if s.last == #s.segments and s.endAt and now >= s.endAt then Combo.cancel(s) return true end
	return false
end
function Combo.hit(s, nonce, now, target, index)
	-- target is produced by a server spatial query, never supplied by the client.
	if nonce ~= s.nonce then return false end
	local pending = index and s.pendingBySegment[index] or s.pending
	if not s.alive or not pending or now < pending.hitAt or now > pending.endAt then return false end
	if pending.seen[target.id] then return false end
	pending.seen[target.id] = true
	if not target.alive or not target.inScope or target.distance > 6 or target.facing < 0.25 or not target.lineOfSight then return false end
	s.counter += 1
	return true
end
return Combo
