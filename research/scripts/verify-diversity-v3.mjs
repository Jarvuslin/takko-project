import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
const directory = path.resolve("benchmarks/runs/marketplace-diversity-v3-20260916");
const read = (file) => JSON.parse(fs.readFileSync(path.join(directory, file), "utf8"));
const project = read("combat-training/final-project.json");
const result = read("combat-training/results.json");
const experiment = read("combat-training/experiment.json");
const before = read("key-before.json"), after = read("key-after-combat.json");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
assert.equal(hash(fs.readFileSync(path.join(directory, "combat-training/prompt.txt"))), experiment.promptFileSha256);
assert.equal(hash(project.request), experiment.submittedRequestSha256);
assert.equal(experiment.baseUrl, "http://127.0.0.1:4335");
assert.equal(project.jobId, null);
assert.equal(project.reservedMicros, 0);
assert.equal(result.noFurtherCallsPending, true);
assert.equal(result.routesRestored, true);
assert.equal(result.requiresReconciliation, false);
assert.equal(result.finishedGame, false);
assert.equal(result.manualRescue, false);
assert.equal(project.charges.length, 2);
assert(project.charges.every((c) => c.status === "ok" && c.billingSource === "provider"));
const rounded = project.charges.reduce((sum, c) => sum + c.chargedMicros, 0);
assert.equal(rounded, result.chargedMicros);
const officialDelta = after.usage - before.usage;
assert(Math.abs(rounded / 1e6 - officialDelta) <= project.charges.length / 1e6);
assert(project.assetPipeline.events.some((e) => e.step === "discard_result"));
const selected = project.assetPipeline.events.find((e) => e.step === "candidate_selected").data.candidate;
const found = project.assetPipeline.events.find((e) => e.step === "search_result").data.candidates;
assert.deepEqual(selected, found.find((c) => c.id === selected.id));
for (const name of ["import-diagnostic-v1", "import-diagnostic-v2"]) {
  assert.equal(read(`${name}/protocol.json`).candidate.id, selected.id);
  const failure = read(`${name}/failure.json`);
  assert.equal(failure.effects, "owned");
  const receipt = failure.receipts.find((r) => r.operation === "restricted_component_validation");
  assert.equal(receipt.data.roundTrip.passed, false);
  assert.equal(receipt.data.roundTrip.stage, "compare");
  read(`${name}/cleanup.json`);
}
const mismatched = read("import-diagnostic-v2/failure.json").receipts.find((r) => r.operation === "restricted_component_validation");
assert(mismatched.data.roundTrip.reason.includes("144->143 (TouchTransmitter:1->0)"));
let files = 0;
const walk = (folder) => {
  for (const item of fs.readdirSync(folder, { withFileTypes: true })) {
    const file = path.join(folder, item.name);
    if (item.isDirectory()) walk(file);
    else {
      files++;
      const bytes = fs.readFileSync(file);
      assert(!/sk-or-v1-[a-f0-9]{64}/i.test(bytes.toString("utf8")), "Plaintext testing key found (value suppressed)");
      if (/^[a-f0-9]{64}\.(rbxm|component\.json|audit\.json)$/.test(item.name))
        assert.equal(hash(bytes), item.name.slice(0, 64));
    }
  }
};
walk(directory);
const verification = {
  verifiedAt: new Date().toISOString(), files,
  paidCalls: project.charges.length, rawGamePass: false,
  promptAndReturnedSelectionVerified: true, archivesAndReceiptsVerified: true,
  roundedChargeMicros: rounded, officialChargeUsd: Number(officialDelta.toFixed(11)),
  remainingUsd: after.remaining, noPlaintextKey: true,
};
fs.writeFileSync(path.join(directory, "verification.json"), JSON.stringify(verification, null, 2) + "\n");
console.log(JSON.stringify(verification, null, 2));
