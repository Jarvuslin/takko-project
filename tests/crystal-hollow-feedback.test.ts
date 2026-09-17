import { expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { refineCrystalHollowFeedback } from "../scripts/refine-crystal-hollow-feedback";
import { newProject } from "../src/generation/store";
import { fixtureBundle } from "./generation-fixtures";
import type { Project } from "../src/generation/schema";

function projectFixture() {
  const project = newProject("Build a crystal quarry", 1e6);
  project.artifact = fixtureBundle(project.request, project.scope);
  project.artifact.files = ["HUD", "Feedback"].map((name) => ({
    path: `StarterPlayer/StarterPlayerScripts/${project.scope}/${name}.module.luau`,
    kind: "ModuleScript",
    source: fs.readFileSync(`tests/fixtures/crystal-hollow-${name.toLowerCase()}.luau`, "utf8"),
  }));
  return project;
}

function execute(project: Project, assertions: string) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "forge-feedback-"));
  try {
    const source = (name: string) => project.artifact!.files.find(f => f.path.endsWith(name + ".module.luau"))!.source;
    const ui = fs.readFileSync("tests/crystal-hollow-ui-mocks.luau", "utf8");
    const body = ui + `
local createdTweens={}
local TweenInfo={new=function(...) return {...} end}
local TweenService={Create=function(_,object,info,goals)
 local listeners={}
 local tween={object=object,goals=goals,Play=function() end}
 tween.Completed={Connect=function(_,fn) table.insert(listeners,fn) end}
 tween.Cancel=function() for _,fn in ipairs(listeners) do fn() end end
 tween.Finish=function() for key,value in pairs(goals) do object[key]=value end; for _,fn in ipairs(listeners) do fn() end end
 table.insert(createdTweens,tween)
 return tween
end}
local game={GetService=function(_,name) if name=="TweenService" then return TweenService else return {} end end}
local beacon=Instance.new("Part")
local world={FindFirstChild=function(_,name) return name=="Beacon" and beacon or nil end}
local root={FindFirstChild=function(_,name) return name=="World" and world or nil end}
local workspace={FindFirstChild=function() return root end}
local HUD=(function()\n${source("HUD")}\nend)()
local Feedback=(function()\n${source("Feedback")}\nend)()
local hud=HUD.mount(Instance.new("PlayerGui"))
local hint=hud.gui:FindFirstChild("Hint",true)
local stats={Carry=0,Coins=130,PowerLevel=1,CapacityLevel=1,Capacity=14,TotalSold=40,GoalComplete=true}
local context={nearSell=true,nearUpgrades=false}
${assertions}
`;
    const file = path.join(directory, "feedback.luau");
    fs.writeFileSync(file, body);
    const binary = path.resolve(process.env.LUAU_BIN_DIR ?? "research/tools/luau", "luau" + (process.platform === "win32" ? ".exe" : ""));
    const result = spawnSync(binary, [file], {encoding:"utf8",windowsHide:true,timeout:10000});
    expect(result.error).toBeUndefined();
    return {status:result.status, output:result.stdout+result.stderr};
  } finally {
    if (path.dirname(path.resolve(directory)) !== path.resolve(os.tmpdir()) || !path.basename(directory).startsWith("forge-feedback-")) throw Error("Unexpected test cleanup path");
    fs.rmSync(directory,{recursive:true,force:true});
  }
}

it("preserves the completion toast across the actual goal → sale → steady-goal feedback sequence", () => {
  const original = projectFixture();
  const code = `
Feedback.play({kind="goal",message="Crystal Hollow restored!"},hud)
Feedback.play({kind="sell",message="Sold 12 crystals for 60 coins."},hud)
Feedback.play({kind="goal",steady=true},hud)
hud.render(stats,context)
assert(hint.Text=="Crystal Hollow restored!","Completion toast was replaced by sale")
clockNow+=1/60; hud.render(stats,context)
assert(hint.Text=="Crystal Hollow restored!","Next-frame render replaced completion")
clockNow+=4
Feedback.play({kind="error",message="Move closer."},hud)
hud.render(stats,context)
assert(hint.Text=="Move closer.","Ordinary feedback must resume after completion timeout")
print("PASS completion priority and expiry")
`;
  const before = execute(original, code);
  expect(before.status).not.toBe(0);
  expect(before.output).toContain("Completion toast was replaced by sale");
  const after = execute(refineCrystalHollowFeedback(original), code);
  expect(after.status,after.output).toBe(0);
});

it("restores the original button color after overlapping upgrade pulses", () => {
  const original = projectFixture();
  const code = `
local baseline=hud.powerButton.BackgroundColor3
Feedback.play({kind="upgrade",message="Pick power upgraded"},hud)
hud.powerButton.BackgroundColor3=Color3.fromRGB(130,100,200) -- an intermediate tween frame
Feedback.play({kind="upgrade",message="Pick power upgraded again"},hud)
createdTweens[#createdTweens].Finish()
assert(hud.powerButton.BackgroundColor3==baseline,"Overlapping pulse restored an animated color")
Feedback.destroy()
print("PASS overlapping pulse baseline")
`;
  const before = execute(original, code);
  expect(before.status).not.toBe(0);
  expect(before.output).toContain("Overlapping pulse restored an animated color");
  const after = execute(refineCrystalHollowFeedback(original), code);
  expect(after.status,after.output).toBe(0);
});

it("keeps the original candidate immutable and rejects changed source anchors", () => {
  const original = projectFixture();
  const snapshot = structuredClone(original);
  const fixed = refineCrystalHollowFeedback(original);
  expect(original).toEqual(snapshot);
  expect(fixed.artifact).not.toEqual(original.artifact);
  expect(() => refineCrystalHollowFeedback(fixed)).toThrow("source changed");
});
