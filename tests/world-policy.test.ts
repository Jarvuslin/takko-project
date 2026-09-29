import fs from "node:fs";
import { expect, it } from "vitest";
import { newProject } from "../src/generation/store";
import { exportBundle } from "../src/generation/export";
import { checkWorldScene } from "../src/generation/world-scene-check";
import type { Project } from "../src/generation/schema";
import { proposedWorld, existingProjectContext } from "../src/generation/world-policy";
import { getBenchmarkCase } from "../src/benchmark/cases";

const corpus = [
  "docs/results/approved-reference-finish-20260927/terminal-project.json",
  "benchmarks/runs/butter-crunch-marketplace-v6-20260916/grok/final-project.json",
].map(file => JSON.parse(fs.readFileSync(file,"utf8")) as Project);
for (const old of corpus) {
  it(`records a fresh world, but never injects one into legacy ${old.name}`, () => {
    const fresh = newProject(old.request, 8000000);
    expect(fresh).toHaveProperty("world.kind", "baseplate_template");
    expect(exportBundle(old.artifact!,old.scope)).not.toContain('name="SkyboxUp"');
  });
  it(`preserves existing context and lighting for follow-ups of ${old.name}`, () => {
    const p={...old,world:newProject(old.request,8000000).world};
    p.implementationBackup={artifact:structuredClone(old.artifact!),spec:old.spec!,review:old.review,checks:old.checks,changed:[],completedBuildTasks:[]};
    expect(existingProjectContext(p).existingScene).toEqual(old.artifact!.scene);
    expect(existingProjectContext(p).existingFiles).toEqual(old.artifact!.files);
    expect(checkWorldScene(old.artifact!,p).filter(c=>c.id.startsWith("world:lights:"))).toEqual([]);
    expect(checkWorldScene(old.artifact!,p).filter(c=>c.status==="failed")).toEqual([]);
    const node=old.artifact!.scene.find(n=>n.className==="SpawnLocation")!;
    if(node) expect(checkWorldScene({...old.artifact!,scene:[...old.artifact!.scene,{...node,path:node.path+"Copy"}]},p).some(c=>c.id.startsWith("world:duplicate:"))).toBe(true);
  });
}
it("rejects every unrequested light in the preserved fighting scene", () => {
  const old = corpus[0];
  const p = {...newProject(old.request,8000000),spec:old.spec,artifact:old.artifact};
  const lights=old.artifact!.scene.filter(n=>n.className==="PointLight");
  expect(lights).toHaveLength(4);
  expect(checkWorldScene(old.artifact!,p).filter(c=>c.id.startsWith("world:lights:") && c.status==="failed")).toHaveLength(lights.length);
});
it("uses an explicit none decision and asks on ambiguous alternative worlds", () => {
  const p=newProject(corpus[0].request+" No baseplate.",8000000);
  p.world=proposedWorld(p,{kind:"none",sourceQuote:"No baseplate"});
  expect(exportBundle(corpus[0].artifact!,corpus[0].scope,[],p.world)).not.toContain('name="SkyboxUp"');
  const ambiguous=newProject("An adventure through floating islands",8000000);
  expect(proposedWorld(ambiguous)?.question).toBeTruthy();
  expect(()=>proposedWorld(newProject(corpus[1].request,8000000),{kind:"custom",sourceQuote:"custom terrain"})).toThrow(/exact explicit/);
});
it("allows lighting for the preserved Lantern Vale benchmark request on both real scene outputs",()=>{
  const request=getBenchmarkCase("game.lantern-adventure").prompt;
  for(const old of corpus) {
    const p={...old,request,answers:{},briefChanges:[],world:newProject(request,8000000).world};
    expect(checkWorldScene(old.artifact!,p).filter(c=>c.id.startsWith("world:lights:"))).toEqual([]);
  }
});
it("distinguishes Lighting reads from mutations in a builder source submission",()=>{
  const p={...corpus[0],world:newProject(corpus[0].request,8000000).world};
  const source=corpus[0].artifact!.files[0];
  const check=(body:string)=>checkWorldScene({files:[{...source,source:body}],scene:[],assets:[],coverage:[]},p).filter(c=>c.id.startsWith("world:lights:source:"));
  expect(check('local Lighting = game:GetService("Lighting")\nassert(Lighting.ClockTime == 14.5)')).toEqual([]);
  expect(check('local Lighting = game:GetService("Lighting")\nLighting.ClockTime = 2')).toHaveLength(1);
});
