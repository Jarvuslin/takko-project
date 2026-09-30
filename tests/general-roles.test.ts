import fs from "node:fs";
import { expect, it } from "vitest";
import { inspectSnapshot } from "../src/marketplace/inspection";
import { revisionKey } from "../src/marketplace/library";
import { assetRole, assetRoleEvidence } from "../src/marketplace/role-evidence";
import { newProject } from "../src/generation/store";
import { assetNeedSchema } from "../src/generation/asset-contract";
import type { SupportedAssetRole } from "../src/marketplace/asset-roles";
import { nativeRolesSchema } from "../src/marketplace/role-capture";

function captured(file:string, role:SupportedAssetRole) {
  const fixture=JSON.parse(fs.readFileSync("tests/fixtures/generalization/development/"+file+".json","utf8"));
  const inspection=inspectSnapshot(fixture.snapshot);
  inspection.nativeRevisionKey=revisionKey(fixture.metadata);
  const p=newProject("Use the selected asset for the requested interaction",7500000);
  const need=assetNeedSchema.parse({id:"selected",requirementId:"selected",role:"User-selected component",assetRole:role,kind:fixture.metadata.kind,query:fixture.query,constraints:"Use captured structure",position:[0,0,0]});
  p.proposal={title:"Captured role",revision:1,hash:"",changed:[],assetNeeds:[need],mechanics:{text:"Use it",assumptions:[],unresolved:[]},theme:{text:"Plain",assumptions:[],unresolved:[]},environment:{text:"Baseplate",assumptions:[],unresolved:[]}};
  p.assetDiscovery={id:p.id,revision:p.revision,studioId:"recorded",choices:{selected:{assetId:fixture.metadata.assetId}},groups:[{id:"selected",label:need.role,query:need.query,kind:need.kind,preview:"model",options:[{...fixture.metadata,inspection}]}]};
  return {p,group:p.assetDiscovery.groups[0],inspection};
}
it.each([
  ["tool-sword-tool","tool","ready"],
  ["prop-wooden-door","prop","ready"],
  ["vfx-fire-particles","vfx","ready"],
  ["mesh-rock","mesh","ready"],
  ["image-arrow-production","image","ready"],
  ["animation-R15-punch-animation","character","ready"],
  ["character-robot-npc","character","blocked"],
] as const)("evaluates actual native %s structure independently of marketing names",(file,role,status)=>{
  const {p,group}=captured(file,role);
  expect(assetRoleEvidence(p,group).status).toBe(status);
});
it("rejects a real sword's Tool role when applied to captured door geometry",()=>{
  const {p,group}=captured("prop-wooden-door","tool");
  expect(assetRoleEvidence(p,group)).toMatchObject({status:"blocked",reason:expect.stringContaining("No Tool")});
});
it("user correction changes evidence identity and does not erase security findings",()=>{
  const {p,group,inspection}=captured("tool-sword-tool","prop");
  const first=assetRoleEvidence(p,group);
  p.assetDiscovery!.choices!.selected.roleOverride="tool";
  const next=assetRoleEvidence(p,group);
  expect(next.role).toBe("tool");expect(next.key).not.toBe(first.key);
  expect(inspection.scriptCount).toBeGreaterThan(0);
  expect(group.options[0].inspection).toEqual(inspection);
});
it("structured intent overrides keyword suggestions and ambiguous intent stays unknown",()=>{
  expect(assetRole({kind:"Model",query:"sword",role:"Display",assetRole:"prop"})).toBe("prop");
  expect(assetRole({kind:"Model",query:"punching bag",role:"Practice"})).toBe("static_target");
  expect(assetRole({kind:"Model",query:"unidentified object",role:"Unspecified"})).toBe("unsupported");
});
it("enforces Handle and accepts the actual native RequiresHandle=false control",()=>{
  const controls=JSON.parse(fs.readFileSync("tests/fixtures/generalization/development/tool-native-controls.json","utf8"));
  const {p,group}=captured("tool-sword-tool","tool");
  group.options[0].inspection!.nativeRoles=nativeRolesSchema.parse(controls.missing);
  expect(assetRoleEvidence(p,group).status).toBe("blocked");
  group.options[0].inspection!.nativeRoles=nativeRolesSchema.parse(controls.handleless);
  expect(assetRoleEvidence(p,group).status).toBe("ready");
});
