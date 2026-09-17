import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const [base, caseId, beforeFile, afterFile] = process.argv.slice(2);
assert(base && caseId && beforeFile && afterFile, "Expected run directory, case, before-key file and after-key file");
const directory = path.resolve(base);
const read = (file) => JSON.parse(fs.readFileSync(path.join(directory, file), "utf8"));
const project = read(`${caseId}/final-project.json`);
const result = read(`${caseId}/results.json`);
const experiment = read(`${caseId}/experiment.json`);
const before = read(beforeFile), after = read(afterFile);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
assert.equal(hash(fs.readFileSync(path.join(directory, caseId, "prompt.txt"))), experiment.promptFileSha256);
assert.equal(hash(project.request), experiment.submittedRequestSha256);
assert.equal(project.jobId, null);
assert.equal(project.reservedMicros, 0);
assert.equal(result.noFurtherCallsPending, true);
assert.equal(result.routesRestored, true);
assert.equal(result.requiresReconciliation, false);
assert.equal(result.manualRescue, false);
assert.equal(result.finishedGame, false, "This verifier does not validate native game acceptance");
const known = project.charges.filter((c) => c.billingSource === "provider");
const unknown = project.charges.filter((c) => c.billingSource === "reservation");
assert.equal(known.length + unknown.length, project.charges.length, "Unexpected billing basis needs explicit reconciliation");
assert(unknown.every((c) => c.status === "error" && c.chargedMicros >= c.reservedMicros));
const sum = (charges) => charges.reduce((total, c) => total + c.chargedMicros, 0);
const roundedKnown = sum(known), liability = sum(unknown), committed = roundedKnown + liability;
assert.equal(committed, result.chargedMicros);
assert.equal(result.combinedChargedMicros, result.priorChargedMicros + committed);
const officialDelta = after.usage - before.usage;
assert(officialDelta >= -1e-9, "Official usage moved backwards");
const rounding = known.length / 1e6 + 1e-9;
if (!unknown.length) assert(Math.abs(roundedKnown / 1e6 - officialDelta) <= rounding);
else {
  assert(officialDelta + rounding >= roundedKnown / 1e6);
  assert(officialDelta <= committed / 1e6 + rounding);
}
const events = project.assetPipeline?.events ?? [];
const selections = events.filter((e) => e.step === "candidate_selected");
for (const selection of selections) {
  const index = events.indexOf(selection);
  const selected = selection.data.candidate;
  const earlier = events.slice(0, index);
  if (selected.source === "creator_store_component") {
    const origin = selected.componentOrigin;
    assert(origin, "Embedded selection has no component provenance");
    assert(earlier.some((e) => e.step === "component_audio_candidates" && e.needId === selection.needId && e.data.candidates.some((c) => c.id === selected.id && c.componentOrigin.recordHash === origin.recordHash)), "Embedded selection was not offered");
    assert(earlier.some((e) => e.step === "component_prepared" && e.needId === origin.needId && e.data.component.candidateId === origin.candidateId && e.data.component.recordHash === origin.recordHash && e.data.component.packetHash === origin.packetHash && e.data.component.archiveHash === origin.archiveHash), "Embedded selection lacks prior component retention");
    const recordBytes = fs.readFileSync(path.join(directory, caseId, "asset-evidence", origin.recordHash + ".integration.json"));
    assert.equal(hash(recordBytes), origin.recordHash);
  } else {
    assert.equal(selected.source, "creator_store");
    assert(earlier.some((e) => e.step === "search_result" && e.needId === selection.needId && e.data.candidates.some((c) => c.id === selected.id)), "Selection was not offered by its search");
  }
}
let files = 0, archives = 0;
const walk = (folder) => {
  for (const item of fs.readdirSync(folder, { withFileTypes: true })) {
    const file = path.join(folder, item.name);
    if (item.isDirectory()) walk(file);
    else {
      files++;
      const bytes = fs.readFileSync(file);
      assert(!/sk-or-v1-[a-f0-9]{64}/i.test(bytes.toString("utf8")), "Plaintext testing key found (value suppressed)");
      if (/^[a-f0-9]{64}\.(rbxm|component\.json|audit\.json)$/.test(item.name)) {
        assert.equal(hash(bytes), item.name.slice(0, 64));
        archives++;
      }
    }
  }
};
walk(path.join(directory, caseId));
const verification = {
  verifiedAt: new Date().toISOString(), caseId, files, archives,
  calls: project.charges.length, knownChargeMicros: roundedKnown,
  unknownLiabilityMicros: liability, committedMicros: committed,
  officialAggregateDeltaUsd: Number(officialDelta.toFixed(11)),
  unknownCallBillIndependentlyAttributed: unknown.length ? false : null,
  returnedSelectionsVerified: selections.length, frozenRequestVerified: true,
  noPlaintextKey: true, rawGamePass: false,
};
fs.writeFileSync(path.join(directory, caseId, "verification.json"), JSON.stringify(verification, null, 2) + "\n");
console.log(JSON.stringify(verification, null, 2));
