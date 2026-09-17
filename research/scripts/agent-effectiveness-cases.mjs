// Authored, frozen logic-slice evaluations. These are not whole-game or Studio tests.
export const scope = "Forge_AgentComparison";
export const modulePath = `ReplicatedStorage/${scope}/Logic.module.luau`;
export const cases = [
  {
    id: "crunch",
    brief:
      "Implement only the reusable state controller for a click/tap crunch interaction. No visuals, audio, instances or services in this slice. Return a module with new(duration), producing independent controllers. Methods use colon syntax: request(now) returns a fresh positive integer token on acceptance, otherwise nil while busy; complete(token,now) returns true and increments count exactly once only for the current token at or after its start time plus duration; early, duplicate or stale completion returns false. getCount() returns count starting at 0. reset() clears count and cancels any in-flight crunch, but old tokens must never become valid again. Rejected requests must not restart the completion deadline. Ten completed crunches produce 10; overlapping requests and repeated completion do not double-count. Time is supplied by caller; do not wait or use clocks. Implement the module at the specified path.",
    tests: `local M=require('./Logic')
local a=M.new(1)
assert(a:getCount()==0,'initial count')
local token=a:request(0)
assert(type(token)=='number' and token>0 and token%1==0,'token')
assert(a:request(0.5)==nil,'overlap')
assert(a:getCount()==0,'request cannot count')
assert(a:complete(token,0.9)==false,'early completion')
assert(a:complete(token,1)==true,'deadline unchanged')
assert(a:complete(token,2)==false and a:getCount()==1,'duplicate')
for i=2,10 do local t=i*3; local id=a:request(t); assert(id and a:complete(id,t+1)); end
assert(a:getCount()==10,'ten complete')
local old=a:request(40); a:reset(); local fresh=a:request(41)
assert(fresh~=old and a:complete(old,50)==false,'stale cancellation')
assert(a:getCount()==0 and a:complete(fresh,50)==true and a:getCount()==1,'reset count')
assert(M.new(1):getCount()==0,'independent state')
print('PASS crunch')`,
  },
  {
    id: "combat",
    brief:
      "Implement only a pure Luau combat-state module, without instances, effects, assets or services. Return new(cooldown, resetAfter), producing independent controllers. attack(now) uses colon syntax and returns the accepted combo step cycling 1,2,3,1; reject with nil if elapsed since last accepted attack is less than cooldown. After a gap strictly greater than resetAfter, restart at 1. Rejected input must not update timing or combo. hit(targetId) returns true once per nonempty string target for the current accepted attack, otherwise false; reject hits before any attack. A new accepted attack permits hitting targets again. getHits() counts all accepted hits. reset() returns combo/timing/hits to initial state. All time is supplied by caller. Implement the module at the specified path.",
    tests: `local M=require('./Logic')
local a=M.new(0.25,1)
assert(a:getHits()==0 and a:hit('dummy')==false,'initial')
assert(a:attack(0)==1,'first')
assert(a:hit('dummy')==true and a:hit('dummy')==false,'dedup')
assert(a:hit('')==false and a:hit('other')==true,'target identities')
assert(a:attack(0.2)==nil and a:attack(0.25)==2,'cooldown and rejected timing')
assert(a:hit('dummy')==true and a:getHits()==3,'new swing')
assert(a:attack(0.5)==3 and a:attack(0.75)==1,'cycle')
assert(a:attack(1.75)==2,'exact reset boundary')
assert(a:attack(3)==1,'expired combo')
assert(M.new(0.25,1):getHits()==0,'independent')
a:reset()
assert(a:getHits()==0 and a:hit('dummy')==false and a:attack(0)==1,'reset')
print('PASS combat')`,
  },
  {
    id: "checkpoint",
    brief:
      "Implement only a pure Luau sequential parkour checkpoint-state module, without instances, effects, assets or services. Return new(total), producing independent controllers initially at checkpoint 0 with zero wins. reach(index) returns true only when index is an integer in 1..total and equals current+1; duplicates, backwards visits, skips and invalid indices return false without changes. Completing the final checkpoint awards exactly one win. getCheckpoint(), getWins(), isFinished() expose state. respawn() returns the current checkpoint and retains progress. restart() returns progress to 0 while retaining wins; a new completed course can award one more win. Use colon syntax. Implement the module at the specified path.",
    tests: `local M=require('./Logic')
local a=M.new(3)
assert(a:getCheckpoint()==0 and a:getWins()==0 and a:isFinished()==false,'initial')
for _,i in {0,-1,2,4,1.5} do assert(a:reach(i)==false,'invalid/skip') end
assert(a:reach(1) and a:reach(1)==false,'first and duplicate')
assert(a:respawn()==1 and a:getCheckpoint()==1,'respawn retention')
assert(a:reach(3)==false and a:reach(2) and a:reach(3),'sequential')
assert(a:isFinished() and a:getWins()==1,'finish')
assert(a:reach(3)==false and a:getWins()==1,'no duplicate win')
a:restart()
assert(a:getCheckpoint()==0 and a:getWins()==1 and a:isFinished()==false,'restart')
assert(a:reach(1) and a:reach(2) and a:reach(3) and a:getWins()==2,'second course')
local b=M.new(1); assert(b:getWins()==0 and b:reach(1) and b:isFinished() and b:getWins()==1,'independent one-stage')
print('PASS checkpoint')`,
  },
];
export function promptFor(item) {
  return `${item.brief}\nOutput path: ${modulePath}\nPublic acceptance test (executed against a copy named Logic.luau):\n\`\`\`luau\n${item.tests}\n\`\`\`\nThis is one isolated logic component, not a whole game. Do not add other gameplay or presentation. Do not modify tests. A native Studio/gameplay pass is not claimed.`;
}
