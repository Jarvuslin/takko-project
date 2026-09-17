-- Pure server rules. The same module is exercised by the offline Luau suite.
local CombatCore = {}
function CombatCore.newState()
 return { sequence = 0, ready = {} }
end
function CombatCore.accept(state, action, sequence, now, alive, abilities)
 if type(action) ~= "string" or abilities[action] == nil then return false, "unknown_action" end
 if type(sequence) ~= "number" or sequence ~= sequence or sequence == math.huge or sequence % 1 ~= 0 or sequence <= state.sequence or sequence > 9007199254740991 then
  return false, "invalid_sequence"
 end
 if not alive then return false, "not_alive" end
 if type(now) ~= "number" or now ~= now or now == math.huge or now == -math.huge then return false, "invalid_time" end
 if now < (state.ready[action] or 0) then return false, "cooldown" end
 state.sequence = sequence
 state.ready[action] = now + abilities[action].cooldown
 return true, "accepted"
end
function CombatCore.canHit(distance, range, targetHealth, visible)
 return type(distance) == "number" and distance == distance and distance >= 0 and distance <= range and targetHealth > 0 and visible == true
end
return CombatCore
