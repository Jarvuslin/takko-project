import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { withRehearsalPackage } from "./rehearsal-package";
import { GenerationStore } from "../src/generation/store";
import { rehearsalKey } from "../desktop/rehearsal";

const directory = path.resolve(process.argv[2]);
const checkpoint = JSON.parse(
  fs.readFileSync(path.join(directory, "terminal-project.json"), "utf8"),
);
assert.equal(checkpoint.stage, "ready_to_test");
const ledger = JSON.parse(
  fs.readFileSync(
    "docs/results/approved-reference-finish-20260927/ledger.json",
    "utf8",
  ),
);
const recorded = ledger.charges.filter(
  (c: any) => c.opencodeRunId === "57c4993b-1165-4740-a7a0-b797074b19f7",
);
const p = structuredClone(checkpoint);
// Replay the actual pre-submission task declaration with the retained source
// checkpoint. This stress fixture intentionally requires a coding dispatch.
p.spec.tasks = structuredClone(p.assetPipeline.inputContext.integrationTasks);
p.completedBuildTasks = [];
p.stage = "failed";
p.review = null;
p.checks = [];
p.charges = [];
p.generation.chargeStart = 0;
p.generation.budgetMicros = p.budgetMicros = 7500000;
let stressSpend = 0;
for (let i = 0; i < 100; i++) {
  const c = recorded[i % recorded.length];
  const amount = c.inputTokens * 2 + c.outputTokens * 10;
  if (stressSpend + amount > 7500000 - p.protectedReview.allowanceMicros) break;
  p.charges.push({ ...c, chargedMicros: amount });
  stressSpend += amount;
}
// Repeat one additional recorded workload that fits without spending the hold.
const extra = recorded.map((c: any) => ({...c, chargedMicros:c.inputTokens*2+c.outputTokens*10}))
  .filter((c: any)=>c.chargedMicros+stressSpend <= 7500000-p.protectedReview.allowanceMicros)
  .sort((a: any,b: any)=>b.chargedMicros-a.chargedMicros)[0];
assert.ok(extra);
p.charges.push(extra);
stressSpend += extra.chargedMicros;
assert.ok(stressSpend < 7500000);
assert.ok(7500000 - stressSpend >= p.protectedReview.allowanceMicros);
let calls = 0;
const result = await withRehearsalPackage(
  "budget-stress-6",
  async () => {
    calls++;
    throw Error("Protected budget must stop before transport");
  },
  async ({ request }) => {
    const settings = await request("/api/models");
    for (const profile of settings.profiles)
      await request(
        `/api/models/${profile.id}/key`,
        { key: rehearsalKey },
        "PUT",
      );
    let current = await request(`/api/projects/${p.id}/repair`, {
      revision: p.revision,
      generationBudgetMicros: 7500000,
    });
    const deadline = Date.now() + 120000;
    while (current.jobId && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 500));
      current = await request(`/api/projects/${p.id}`);
    }
    assert.equal(current.jobId, null);
    assert.match(current.error, /funds set aside for review/);
    assert.equal(calls, 0);
    assert.deepEqual(current.artifact, checkpoint.artifact);
    assert.equal(current.protectedReview.status, "protected");
    fs.writeFileSync(
      path.join(directory, "budget-stress-terminal.json"),
      JSON.stringify(current, null, 2),
    );
    return {
      scenario:
        "Synthetic repetition of recorded no-cache workload, not new actual charges",
      stressSpend,
      remaining: 7500000 - stressSpend,
      protectedAllowance: current.protectedReview.allowanceMicros,
      calls,
      actualCost: 0,
      checkpointPreserved: true,
      error: current.error,
    };
  },
  () => new GenerationStore(path.join(directory, "projects")).save(p),
  directory,
);
console.log(JSON.stringify(result, null, 2));
