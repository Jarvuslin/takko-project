import fs from "node:fs";
import {expect,it} from "vitest";
import {componentPhysics} from "../src/generation/component-physics";
import {exportBundle} from "../src/generation/export";
it("finds disconnected retained parts in the actual exported model",()=>{
 const xml=fs.readFileSync("docs/results/approved-reference-finish-20260927/game.rbxlx","utf8");
 const evidence=componentPhysics(xml);
 expect(evidence.unsupportedParts.some(p=>p.includes("Training Dummy"))).toBe(true);
});
it("uses real non-combat geometry and detects removing its anchors",()=>{
 const p=JSON.parse(fs.readFileSync("benchmarks/runs/butter-crunch-marketplace-v6-20260916/grok/final-project.json","utf8"));
 const xml=exportBundle(p.artifact,p.scope);
 expect(componentPhysics(xml).unsupportedParts).toEqual([]);
 const loose=xml.replaceAll('<bool name="Anchored">true</bool>','<bool name="Anchored">false</bool>');
 expect(componentPhysics(loose).unsupportedParts.length).toBeGreaterThan(0);
});
