import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { loadAdaptedComponentEvidence, expandedSourceEdits } from "../../src/generation/component-adaptation";
import { loadComponentReviewEvidence } from "../../src/generation/component-review";

const [nativeInput, adaptedDirectory, workerDirectory] = process.argv.slice(2);
if(!nativeInput||!adaptedDirectory||!workerDirectory)throw Error("Usage: ORIGINAL_NATIVE ADAPTED_NATIVE RAW_WORKER");
const read=(file:string)=>JSON.parse(fs.readFileSync(file,"utf8"));
const original=read(path.join(nativeInput,"result.json"));
const adapted=read(path.join(adaptedDirectory,"result.json"));
const worker=read(path.join(workerDirectory,"protocol.json"));
assert.deepEqual(adapted.results.map((r:any)=>r.case),worker.inputs.map((i:any)=>i.case));
const checks=[];
for(const row of adapted.results){
 const input=original.results.find((r:any)=>r.case===row.case);
 const evidence=loadComponentReviewEvidence(path.join(nativeInput,row.case),input.result.sha256,input.inputHash);
 const output=loadAdaptedComponentEvidence(path.join(adaptedDirectory,row.case),row.result.sha256,evidence);
 const plan=read(path.join(workerDirectory,row.case+"-decision.json"));
 assert.deepEqual(plan,row.result.plan);
 assert.equal(read(path.join(adaptedDirectory,row.case+"-cleanup.json")).removed,true);
 assert.equal(row.nativeReceipt.ok,true);assert.equal(row.nativeReceipt.rootsDestroyed,true);
 assert.equal(row.importedCodeExecuted,false);assert.equal(row.rawGameBenchmark,false);
 assert.equal(row.result.archive.roundTrip.passed,true);assert.equal(row.result.sourceReview,"required");
 checks.push({case:row.case,instances:output.nodes.length,sourceBindings:output.sourceBodies.reduce((n,s)=>n+s.bindings.length,0),uniqueSources:output.sourceBodies.length,mediaBindings:output.contentReferences?.length,editedBindings:expandedSourceEdits(plan).length});
}
console.log(JSON.stringify({verified:true,checks,boundary:"Retained native edit/cleanup receipts and worker/source identities verified; code was not executed and gameplay remains unverified."},null,2));
