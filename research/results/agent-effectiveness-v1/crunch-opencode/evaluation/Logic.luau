-- Logic.module.luau

local Logic = {}
Logic.__index = Logic

function Logic.new(duration)
    local self = setmetatable({}, Logic)
    self.duration = duration
    self.count = 0
    self.currentToken = nil
    self.currentStartTime = nil
    self.nextTokenId = 1
    self.completedTokens = {}
    return self
end

function Logic:request(now)
    if self.currentToken then
        -- Already busy
        return nil
    end
    local token = self.nextTokenId
    self.nextTokenId = self.nextTokenId + 1
    self.currentToken = token
    self.currentStartTime = now
    return token
end

function Logic:complete(token, now)
    -- Validate token
    if token ~= self.currentToken then
        return false
    end
    local startTime = self.currentStartTime
    if not startTime then
        return false
    end
    if now < startTime + self.duration then
        return false -- early
    end
    if self.completedTokens[token] then
        return false -- duplicate
    end
    -- Complete the token
    self.completedTokens[token] = true
    self.count = self.count + 1
    self.currentToken = nil
    self.currentStartTime = nil
    return true
end

function Logic:getCount()
    return self.count
end

function Logic:reset()
    self.count = 0
    self.currentToken = nil
    self.currentStartTime = nil
    self.completedTokens = {}
end

return Logic
