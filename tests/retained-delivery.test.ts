import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect,it } from "vitest";
import { buildAssetNeeds } from "../src/marketplace/approved-adapter";
import { approvedAssetLinks } from "../src/marketplace/asset-binding";
import { componentBuilderContext, loadComponentIntegration,persistComponentIntegration,projectComponents,checkRetainedPhysics } from "../src/generation/component-integration";
import { exportedHierarchy,checkInstancePaths } from "../src/generation/instance-path-check";
import { exportBundle } from "../src/generation/export";
import { componentPhysics } from "../src/generation/component-physics";
import type { Project } from "../src/generation/schema";
for(const run of ["runtime-diagnostics-20260927","opencode-step3-live-20260925"]) {
 it(`preserves the actual animation role through Model acquisition: ${run}`,()=>{
  const p:Project=JSON.parse(fs.readFileSync(`docs/results/${run}/terminal-project.json`,"utf8"));
  p.assetPipeline=undefined; // Replay fresh acquisition from this real saved spec/selection.
  const needs=buildAssetNeeds(p);
  const animations=approvedAssetLinks(p).filter(link=>link.group.preview==="animation").map(link=>link.need);
  expect(animations.length).toBeGreaterThan(0);
  for(const n of animations) expect(needs.find(x=>x.id===n.id)).toMatchObject({deliveryRole:"source_data"});
 });
}
it("fresh source-data integration preserves old records and exports the exact new builder path",()=>{
 const p:Project=JSON.parse(fs.readFileSync("docs/results/runtime-diagnostics-20260927/terminal-project.json","utf8"));
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),"takko-delivery-"));
 try {
  fs.cpSync(`docs/results/runtime-diagnostics-20260927/asset-evidence/${p.id}`,temp,{recursive:true});
  const need=buildAssetNeeds({...p,assetPipeline:undefined}).find(n=>n.deliveryRole==="source_data")!;
  expect(need).toBeDefined();
  const entry=p.assetPipeline!.entries.find(e=>e.needId===need.id)!;
  const before=structuredClone(entry.component!);
  const loaded=loadComponentIntegration(temp,before);
  const ref=persistComponentIntegration(temp,{...loaded.record,version:2,need,evidence:loaded.evidence,conversionHash:before.conversionHash});
  expect(ref.destinationPath.startsWith("ReplicatedStorage/")).toBe(true);
  expect(loadComponentIntegration(temp,before).record.metadata).toEqual(loaded.record.metadata);
  entry.component=ref;
  p.assetPipeline!.needs=p.assetPipeline!.needs.map(n=>n.id===need.id?need:n);
  const context=componentBuilderContext(p,temp).find(c=>c.reference.needId===need.id)!;
  const bundle={files:[],scene:[],assets:[],coverage:[]};
  const xml=exportBundle(bundle,p.scope,projectComponents(p,temp).map(c=>c.xml));
  expect(exportedHierarchy(xml).get(context.rootPath)).toBeDefined();
  expect(exportedHierarchy(xml).has(before.destinationPath+"/"+before.rootName)).toBe(false);
  const source=context.studioAnimation!.code.split("local animation =")[0];
  expect(checkInstancePaths(xml,[{path:`StarterPlayer/StarterPlayerScripts/${p.scope}/Probe.client.luau`,kind:"LocalScript",source}],p.scope).some(c=>c.status==="failed")).toBe(false);
 } finally {fs.rmSync(temp,{recursive:true,force:true});}
});
it("rejects the real unhandled prop and anchors only its explicit delivery copy",()=>{
 const p:Project=JSON.parse(fs.readFileSync("docs/results/runtime-diagnostics-20260927/terminal-project.json","utf8"));
 const dir=`docs/results/runtime-diagnostics-20260927/asset-evidence/${p.id}`;
 const components=projectComponents(p,dir);
 const prop=components.find(c=>c.record.need.kind==="Model" && !c.evidence.nodes.some(n=>n.className==="KeyframeSequence"))!;
 expect(checkRetainedPhysics(p,dir,p.artifact!).some(c=>c.id==="physics:"+prop.reference.needId && c.status==="failed")).toBe(true);
 const bundle={...p.artifact!,retainedPhysics:[{needId:prop.reference.needId,mode:"anchor_all" as const,reason:"The requested prop must stay stationary."}]};
 const delivered=projectComponents(p,dir,bundle).find(c=>c.reference.needId===prop.reference.needId)!;
 expect(componentPhysics(delivered.xml.xml).unsupportedParts).toEqual([]);
 expect(projectComponents(p,dir).find(c=>c.reference.needId===prop.reference.needId)!.xml).toEqual(prop.xml);
 expect(checkRetainedPhysics(p,dir,bundle).find(c=>c.id==="physics:"+prop.reference.needId)?.status).toBe("passed");
});
