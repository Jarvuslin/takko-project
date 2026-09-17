import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const base = path.resolve(process.argv[2] ?? "benchmarks/runs/marketplace-diversity-v7-20260916");
const read = (file) => JSON.parse(fs.readFileSync(path.join(base, file), "utf8"));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const hashes = {
  "combat-training": "f656b6db34b2a4832302a7251c6aa277275070ce3b44eefcbf96a4ca914d336e",
  "checkpoint-parkour": "a4aa6ccf3beaa5332b515754e31e053eb394cd62cc69a8b545f50ba1e177a6ed",
  "bubble-wrap": "59b69a324da1e8fe89738777319e8c34704f1c56ed8c5a0fdc4f2e86eb13c756",
};
const models = { gemini: "google/gemini-3.7-flash", sol: "openai/gpt-5.6-sol" };
const before = read("key-before.json"), after = read("key-after-plans.json");
const finalSettings = read("settings-after-public.json");
const liveProjects = read("service-final-projects.json");
assert.equal(liveProjects.length, 6);
let prior = 3804565, priorReservations = 8401451, calls = 0, charged = 0;
let sources, rows = [];
for (const [caseId, frozenHash] of Object.entries(hashes)) {
  for (const [label, model] of Object.entries(models)) {
    const prefix = `${caseId}/${label}/`;
    const exp = read(prefix + "experiment.json"), result = read(prefix + "results.json");
    const project = read(prefix + "final-project.json"), planned = read(prefix + "plan-project.json");
    const disk = read(prefix + "final-project-from-disk.json");
    const live = liveProjects.find((p) => p.id === project.id);
    assert.deepEqual(live, project, "Authoritative idle snapshot changed");
    assert.deepEqual(disk, project);
    assert.deepEqual(project.spec, planned.spec, "Raw plan changed after evaluation");
    assert.equal(hash(fs.readFileSync(path.join(base, prefix, "prompt.txt"))), frozenHash);
    assert.equal(exp.promptFileSha256, frozenHash);
    assert.equal(hash(project.request), exp.submittedRequestSha256);
    assert.deepEqual(read(prefix + "settings-before-public.json"), finalSettings, "Settings were not restored");
    if (sources) assert.deepEqual(exp.sourceHashes, sources, "Application changed between probes");
    else sources = exp.sourceHashes;
    for (const value of [exp, result]) {
      assert.equal(value.mode, "plan");
      assert.equal(value.plannerModel, model);
      assert.equal(value.reviewerModel, models.gemini);
      assert.equal(value.planner.maxOutputTokens, 12000);
      assert.equal(value.planner.requestTimeoutMs, 300000);
    }
    assert.equal(exp.worker.model, models.gemini);
    assert.equal(exp.settings.budgetMicros, 1000000);
    assert.equal(project.jobId, null);
    assert.equal(project.reservedMicros, 0);
    assert.equal(project.assetStudioId ?? null, null);
    assert.equal(project.approvedRevision, null);
    assert.equal(project.artifact, null);
    assert.equal((project.assetPipeline?.events ?? []).length, 0);
    assert.equal(result.noFurtherCallsPending, true);
    assert.equal(result.routesRestored, true);
    assert.equal(result.requiresReconciliation, false);
    assert.equal(result.manualRescue, false);
    assert.equal(result.artifactProduced, false);
    assert.equal(result.finishedGame, false);
    assert.equal(result.priorChargedMicros, prior);
    assert.equal(result.priorReservationsMicros, priorReservations);
    assert.deepEqual(project.charges, result.charges);
    for (const charge of project.charges) {
      assert.equal(charge.phase, "planner");
      assert.equal(charge.model, model);
      assert.equal(charge.profileId, exp.planner.id);
      assert.equal(charge.billingSource, "provider");
      assert.equal(charge.estimated, false);
      assert.equal(charge.status, "ok");
    }
    const cost = project.charges.reduce((n, c) => n + c.chargedMicros, 0);
    assert.equal(result.chargedMicros, cost);
    prior += cost;
    priorReservations += result.reservedMicros;
    assert.equal(result.combinedChargedMicros, prior);
    assert.equal(result.combinedReservationsMicros, priorReservations);
    assert.equal(result.planAccepted, !(caseId === "bubble-wrap" && label === "gemini"));
    const start = project.events.find((e) => e.message.startsWith("planner:"));
    const end = project.events.find((e) => e.message === "Specification ready for review.");
    assert(start && end);
    calls += project.charges.length;
    charged += cost;
    rows.push({ caseId, label, projectId: project.id, calls: project.charges.length,
      chargedMicros: cost, elapsedSeconds: (Date.parse(end.at) - Date.parse(start.at)) / 1000,
      structuralGateAccepted: result.planAccepted });
  }
}
const officialDelta = after.usage - before.usage;
assert(officialDelta >= 0);
assert(Math.abs(charged / 1e6 - officialDelta) <= calls / 1e6 + 1e-9);
let scannedFiles = 0;
function scan(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) scan(file);
    else {
      scannedFiles++;
      assert(!/sk-or-v1-[a-f0-9]{64}/i.test(fs.readFileSync(file, "utf8")), "Plaintext testing key found; value suppressed");
    }
  }
}
scan(base);
const verification = { verifiedAt: new Date().toISOString(), rows, calls, chargedMicros: charged,
  officialAggregateDeltaUsd: Number(officialDelta.toFixed(11)),
  officialRemainingUsd: after.remaining, conservativePriorMicros: prior,
  historicalReservationsMicros: priorReservations, noNewUnknownLiabilities: true,
  scannedFiles, noPlaintextKey: true, settingsRestored: true, noPendingJobs: true,
  frozenRequestsVerified: true, unchangedSourceHashes: Object.keys(sources).length,
  nativeGameplayTested: false, rawGamePass: false };
fs.writeFileSync(path.join(base, "verification.json"), JSON.stringify(verification, null, 2) + "\n");
console.log(JSON.stringify(verification, null, 2));
