import fs from "node:fs";
import { expect,it } from "vitest";
import { scopeQuestions, questionProposalScope,sequenceAssetIssues, scopeQuestionId } from "../src/generation/scope-questions";
const read=(p:string)=>JSON.parse(fs.readFileSync(p,"utf8"));
const real=read("docs/results/approved-reference-finish-20260927/terminal-project.json");
const other=read("benchmarks/runs/butter-crunch-marketplace-v6-20260916/grok/final-project.json");
it("does not reopen the real narrow request's explicit closed scope or implementation timing",()=>{
 const narrow=read("docs/results/opencode-minimal-fighting-20260925/terminal-project.json");
 expect(scopeQuestions(narrow.proposal.mechanics.assumptions,narrow)).toEqual([]);
});
it("does not treat an explicit no-combo answer as permission to remove upgrades",()=>{
 const chosen={...real,answers:{style:"No combos. Include upgrades."}};
 expect(scopeQuestions(["No combos","No upgrades"],chosen)).toEqual([expect.stringContaining("No upgrades")]);
});
it("closed scope never authorizes removing an explicitly requested mechanic",()=>{
 expect(scopeQuestions(["No upgrades"],{...real,request:"Include upgrades. Only the requested features.",answers:{},briefChanges:[]})).toEqual([expect.stringContaining("No upgrades")]);
});
it("does not repeat a specifically answered scope decision or use it to resolve a different one",()=>{
 const assumptions=real.proposal.mechanics.assumptions;
 const questions=scopeQuestions(assumptions,{...real,answers:{}});
 const answered={...real,answers:{[scopeQuestionId(questions[0])]:"Keep these limits"}};
 expect(scopeQuestions(assumptions,answered)).not.toContain(questions[0]);
 expect(scopeQuestions(assumptions,answered)).toContain(questions[1]);
});
it("does not mistake duplicate-hit protection or technical defaults for removed core mechanics",()=>{
 const incidental=real.proposal.mechanics.assumptions.filter((s:string)=>/default Roblox|cooldown|persistence/.test(s));
 expect(scopeQuestions(incidental,real)).toEqual([]);
});
it("asks about the real silently removed mechanic instead of approving its absence",()=>{
  const proposal=structuredClone(real.proposal);
  questionProposalScope(proposal,real);
  expect(proposal.mechanics.unresolved.some((q:string)=>q.includes("no combo"))).toBe(true);
  expect(real.proposal.mechanics.unresolved).toEqual([]);
});
it("checks the other real game's narrowing independently of genre",()=>{
  const sentence=other.spec.summary.split('. ')[0];
  expect(sentence).toContain("single");
  expect(scopeQuestions([sentence],{...other,request:"An interactive object that plays sound",answers:{},briefChanges:[]})).toHaveLength(1);
  expect(scopeQuestions([sentence],{...other,request:sentence,answers:{},briefChanges:[]})).toEqual([]);
});
for(const p of [real,other]) it(`requires distinct slots for an explicit three-step animation choice in ${p.id}`,()=>{
 const chosen={...p,answers:{sequence:"3-step animation sequence"}};
 expect(sequenceAssetIssues(p.spec.assetNeeds,chosen).length).toBeGreaterThan(0);
 const source=p.spec.assetNeeds.find((n:any)=>n.kind==="Animation")??p.spec.assetNeeds[0];
 const needs=Array.from({length:3},(_,i)=>({...source,id:source.id+"_"+(i+1),kind:"Animation" as const,sequence:{id:"chosen_sequence",step:i+1,total:3}}));
 expect(sequenceAssetIssues(needs,chosen)).toEqual([]);
 expect(sequenceAssetIssues(needs.slice(0,2),chosen).length).toBeGreaterThan(0);
});
