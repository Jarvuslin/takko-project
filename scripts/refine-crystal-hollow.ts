import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { bundleHash, compileSources, validateBundle } from "../src/generation/validation";
import type { Project } from "../src/generation/schema";

// Explicit expert escalation of one frozen evaluation, never a model-quality claim.
const input = resolve(process.argv[2]);
const output = resolve(process.argv[3]);
const raw = readFileSync(input);
const original = JSON.parse(raw.toString()) as Project;
if (original.jobId) throw Error("Wait for the original model run to finish");
const refined = structuredClone(original);
const bundle = refined.artifact!;
const source = (p: Project, suffix: string) => {
  const file = p.artifact!.files.find(f => f.path.endsWith(suffix));
  if (!file) throw Error("Missing " + suffix);
  return file;
};
function replace(suffix: string, before: string, after: string) {
  const f = source(refined, suffix);
  if (f.source.split(before).length !== 2) throw Error("Expected one exact anchor in " + suffix + ": " + before);
  f.source = f.source.replace(before, after);
}
replace("Economy.module.luau", "state.Coins += coins\n\t\tupdateGoal(state)", "state.Coins += coins\n\t\tstate.TotalSold += sold\n\t\tupdateGoal(state)");
for (const name of ["Pick power upgraded:", "Bag upgraded:"])
  replace("Economy.module.luau", `return result(true, cost, string.format("${name}`, `return result(true, 0, string.format("${name}`);
replace("HUD.module.luau", "local destroyed = false", "local toastMessage = nil\n\tlocal toastUntil = 0\n\tlocal destroyed = false");
replace("HUD.module.luau", "local nearNode = context.nodeId ~= nil and remaining ~= 0", "local nearNode = context.nodeId ~= nil");
replace("HUD.module.luau", "if goalComplete then hint.Text", "if toastMessage and os.clock() < toastUntil then hint.Text = toastMessage\n\t\telseif goalComplete then hint.Text");
replace("HUD.module.luau", 'hint.Text = tostring(message or ""); hint.TextColor3 = TEXT', 'toastMessage = tostring(message or "")\n\t\ttoastUntil = os.clock() + 3\n\t\thint.Text = toastMessage; hint.TextColor3 = TEXT');
replace("HUD.module.luau", "IgnoreGuiInset = true", "IgnoreGuiInset = false");
replace("Controller.client.luau", 'if type(payload) == "table" and payload.kind == "goal" then\n\t\tgoalCelebrated = true\n\tend', 'if type(payload) == "table" and payload.kind == "goal" then\n\t\tif goalCelebrated then\n\t\t\tpayload = {kind = "goal", steady = true}\n\t\telse\n\t\t\tgoalCelebrated = true\n\t\tend\n\tend');
replace("Game.server.luau", ', authored.beacon.Position)\n\tend', ')\n\tend');
replace("World.module.luau", 'assert(count >= 3, nodeId .. " must contain a three-piece crystal cluster")', 'assert(count >= 2, nodeId .. " must contain two shards alongside its main crystal")');
const scope = original.scope;
const root = `Workspace/${scope}/World`;
for (const name of ["SellSign", "UpgradeSign"]) {
  const sign = bundle.scene.find(n => n.path === `${root}/${name}`)!;
  const pose = sign.properties.CFrame as { value: number[] };
  if (JSON.stringify(pose.value.slice(3)) !== JSON.stringify([1,0,0,0,1,0,0,0,1])) throw Error("Sign transform is not identity");
  bundle.scene.find(n => n.path === `${root}/${name}/SurfaceGui`)!.properties.Face = { type: "Enum", enum: "NormalId", value: 2 };
}
const removed: string[] = [];
for (let index = 1; index <= 6; index++) {
  const path = `${root}/Nodes/Node${String(index).padStart(2,"0")}`;
  const shard = bundle.scene.find(n => n.path === path + "/CrystalC");
  if (!shard || bundle.scene.some(n => n.path.startsWith(shard.path + "/"))) throw Error("Unexpected cluster structure");
  removed.push(shard.path);
  const node = bundle.scene.find(n => n.path === path)!;
  node.className = "WedgePart";
  node.properties.Size = {type:"Vector3",value:[1.6,4.2,1.6]};
  const pose = node.properties.CFrame as { value: number[] };
  pose.value[1] = 2.2;
  node.properties.Material = {type:"Enum",enum:"Material",value:288};
  node.properties.Color = {type:"Color3",value:[0.16,0.8,0.95]};
}
bundle.scene = bundle.scene.filter(n => !removed.includes(n.path));
for (const coverage of bundle.coverage)
  coverage.files = [...new Set(coverage.files.map(path => removed.includes(path) ? path.slice(0,path.lastIndexOf("/")) : path))];
const worldCoverage=bundle.coverage.find(c=>c.requirementId==="world")!;
worldCoverage.status="implemented";
worldCoverage.detail="Expert refinement retains authored paths, stations, terraces, beacon, arch and strict resolver; six main upright crystal bodies plus two shards each reduce the manifest to 42 world entries. Native composition, legibility and walkability remain pending.";

if (existsSync(join(output,"original-project.json")) && !readFileSync(join(output,"original-project.json")).equals(raw)) throw Error("Refinement directory belongs to a different original snapshot");
mkdirSync(output, { recursive: true });
writeFileSync(join(output,"original-project.json"),raw);
const cli = resolve(".forge/tools/luau/luau" + (process.platform === "win32" ? ".exe" : ""));
const mock = readFileSync(resolve("tests/crystal-hollow-ui-mocks.luau"),"utf8");
const observations: unknown[] = [];
const wrap = (code: string) => `(function()\n${code}\nend)()`;
function run(p: Project, label: string, test: string, body: string) {
  const path = join(output,`${label}-${test}.luau`);
  writeFileSync(path, body);
  const result = spawnSync(cli,[path],{encoding:"utf8",timeout:10000});
  const observation = {label,test,passed:result.status===0,stdout:result.stdout,stderr:result.stderr};
  observations.push(observation);
  return observation.passed;
}
function economyPrelude(p: Project) {
  return `local Contract=${wrap(source(p,"Contract.module.luau").source)}\nlocal stub={}\nfunction stub:WaitForChild() return self end\nlocal game={GetService=function() return stub end}\nlocal require=function() return Contract end\nlocal Economy=${wrap(source(p,"Economy.module.luau").source)}\n`;
}
for (const [label,p] of [["original",original],["refined",refined]] as const) {
  run(p,label,"sale-goal",economyPrelude(p)+`
local s=Economy.newState()
for trip=1,5 do
 while s.Carry < s.Capacity do assert(Economy.apply(s,"harvest",6).ok) end
 local carried=s.Carry
 local beforeSold=s.TotalSold
 local beforeCoins=s.Coins
 local sold=Economy.apply(s,"sell")
 assert(sold.ok and sold.amount==carried*5 and s.Carry==0 and s.Coins==beforeCoins+carried*5)
 assert(s.TotalSold==beforeSold+carried,"Sales must increment TotalSold")
 if trip==1 then assert(s.Coins==40); assert(Economy.apply(s,"upgradePower").ok) end
 if trip==2 then assert(Economy.apply(s,"upgradeCapacity").ok) end
end
assert(s.GoalComplete and s.TotalSold>=40,"Legitimate sales and both upgrades must complete goal")
local before=s.Coins
assert(not Economy.apply(s,"sell").ok and s.Coins==before)
print("PASS sale/progression through real Economy transitions")
`);
  run(p,label,"upgrade-amount",economyPrelude(p)+`
local s=Economy.newState(); s.Coins=200
assert(Economy.apply(s,"upgradePower").amount==0,"Upgrade amount must be zero")
assert(Economy.apply(s,"upgradeCapacity").amount==0,"Upgrade amount must be zero")
assert(s.Coins==130 and s.Capacity==14 and s.PowerLevel==1)
assert(Economy.apply(s,"upgradePower").ok and s.Coins==30)
assert(not Economy.apply(s,"upgradeCapacity").ok and s.Coins==30 and s.Capacity==14)
assert(not Economy.apply(s,"upgradePower").ok and s.Coins==30)
print("PASS upgrade values, insufficient funds and max level")
`);
  const hudPrelude=mock+`\nlocal HUD=${wrap(source(p,"HUD.module.luau").source)}\nlocal playerGui=Instance.new("PlayerGui")\nlocal hud=HUD.mount(playerGui)\nlocal stats={Carry=0,Coins=0,PowerLevel=0,CapacityLevel=0,Capacity=8,TotalSold=0,GoalComplete=false}\nlocal context={nodeId="Node01",nodeRemaining=6,nearSell=false,nearUpgrades=false}\nlocal hint=hud.gui:FindFirstChild("Hint",true)\n`;
  run(p,label,"toast",hudPrelude+`
hud.render(stats,context)
hud.toast("You need 30 more coins.")
hud.render(stats,context)
assert(hint.Text=="You need 30 more coins.","Immediate render must preserve toast")
clockNow+=1/60; hud.render(stats,context)
assert(hint.Text=="You need 30 more coins.","Next frame must preserve toast")
clockNow+=4; hud.render(stats,context)
assert(string.find(hint.Text,"Crystal nearby",1,true),"Context must resume after toast expires")
local second=HUD.mount(playerGui)
assert(hud.gui.Parent==nil and second.gui.Parent==playerGui,"Remount must replace only old GUI")
assert(second.gui.IgnoreGuiInset==false,"HUD must respect Roblox controls inset")
print("PASS toast lifetime and HUD remount")
`);
  run(p,label,"empty-node-hint",hudPrelude+`
context.nodeRemaining=0; hud.render(stats,context)
assert(string.find(hint.Text,"dim",1,true),"Empty nearby node needs depletion hint")
assert(hud.harvestButton.AutoButtonColor==false)
print("PASS depleted node hint")
`);
  const controllerMock=readFileSync(resolve("tests/crystal-hollow-controller-mocks.luau"),"utf8");
  for(const order of ["attribute-first","event-first"]){
    const attribute='attrs.GoalComplete=true; signals.GoalComplete:Fire()';
    const event='feedbackRemote.OnClientEvent:Fire({kind="goal",message="Restored"})';
    run(p,label,"goal-"+order,controllerMock+"\n"+wrap(source(p,"Controller.client.luau").source)+"\n"+(order==="attribute-first"?attribute+"\n"+event:event+"\n"+attribute)+`
local count=0
for _,payload in ipairs(observed) do if payload.kind=="goal" and not payload.steady then count+=1 end end
assert(count==1,"Goal celebration must happen once regardless of event order")
player.CharacterAdded:Fire()
local after=0
for _,payload in ipairs(observed) do if payload.kind=="goal" and not payload.steady then after+=1 end end
assert(after==1,"Respawn must restore steady glow without celebrating again")
print("PASS goal event ordering and respawn restoration")
`);
  }
}
const compilation = await compileSources(bundle);
const staticChecks=validateBundle(bundle,refined);
const worldEntries=bundle.scene.filter(n=>n.path.startsWith(`Workspace/${scope}/`)).length;
const report = {
  provenance:"Explicit stronger-agent refinement; original model output preserved. No new provider calls.",
  originalProjectSha256:createHash("sha256").update(raw).digest("hex"),
  originalArtifactHash:bundleHash(original.artifact!), refinedArtifactHash:bundleHash(bundle),
  worldEntries, removedScenePaths:removed, observations, compilation, staticChecks,
  changes:["Economy increments TotalSold on successful sales; upgrades return amount zero.","HUD retains toasts for three seconds across render calls; depleted-node hint is reachable; Roblox GUI inset respected.","Controller deduplicates goal celebration for either attribute/event order; Game goal message omits the harvest-only position field.","Upright primary crystal WedgeParts replace flat dark bases; each keeps two decorative shards. World resolver counts two children plus main crystal. Coverage describes the refined manifest.","Identity-transformed upright station signs use Back faces toward spawn, instead of thin Top faces."],
  limitations:["Offline Luau with mocked Roblox UI values/Instances is not Studio execution or visual verification.","Original model review and protected tests are retained unchanged as evidence. Their child-shard >=3 assertion counts three children plus a main crystal, whereas the refined scene has three visible pieces total; it must not be presented as passing unchanged.","Source review and mocked UI do not prove native first-minute timing, geometry walkability, network replication, or screenshot quality."],
};
refined.studioEvidence=null;
refined.visualEvidence=null;
refined.stage="ready_to_test";
refined.error="Expert refinement requires fresh native verification; original generated review is retained as historical evidence.";
refined.checks=[...staticChecks,...compilation,{id:"expert-native",status:"pending",detail:"Run independent native gameplay and visual checks on this refined artifact."}];
writeFileSync(join(output,"project.json"),JSON.stringify(refined,null,2));
writeFileSync(join(output,"verification.json"),JSON.stringify(report,null,2));
writeFileSync(join(output,`verification-${report.refinedArtifactHash}.json`),JSON.stringify(report,null,2));
if(observations.some((o:any)=>o.label==="refined"&&!o.passed)||compilation.some(c=>c.status==="failed")||staticChecks.some(c=>c.status==="failed")||worldEntries>45) throw Error("Refinement verification failed; inspect verification.json");
console.log(JSON.stringify({output,worldEntries,hash:report.refinedArtifactHash,observations},null,2));
