import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parseJson } from "../../src/generation/providers";
import { validateComponentReview } from "../../src/generation/component-review";
import { validateComponentAdaptation } from "../../src/generation/component-adaptation";

const directory = path.resolve(process.argv[2]);
const read = (name: string) =>
  JSON.parse(fs.readFileSync(path.join(directory, name), "utf8"));
const protocol = read("protocol.json"),
  calls = read("calls.json"),
  result = read("results.json");
assert.equal(result.results.length, protocol.inputs.length);
assert.deepEqual(
  [...result.results.map((r: any) => r.case)].sort(),
  [...protocol.inputs.map((i: any) => i.case)].sort(),
);
assert.equal(
  new Set(result.results.map((r: any) => r.case)).size,
  result.results.length,
);
let total = 0,
  firstAttemptPasses = 0,
  finalPasses = 0,
  inputTokens = 0,
  outputTokens = 0;
for (const call of calls) {
  assert(
    Number.isFinite(call.cost) && call.cost >= 0,
    "Unsettled provider charge",
  );
  assert(total + call.reserve <= protocol.batchUSD + 1e-9);
  const previous = calls
    .filter((c: any) => c.case === call.case && c.id < call.id)
    .reduce((n: number, c: any) => n + c.cost, 0);
  assert(previous + call.reserve <= protocol.perCaseUSD + 1e-9);
  const body = read(`call-${call.id}-request.json`),
    response = read(`call-${call.id}-response.txt`);
  assert.equal(body.model, protocol.model);
  assert.equal(response.usage.cost, call.cost);
  inputTokens += response.usage.prompt_tokens;
  outputTokens += response.usage.completion_tokens;
  total += call.cost;
}
for (const row of result.results) {
  const input = read(row.case + "-input.json");
  const frozen = protocol.inputs.find((i: any) => i.case === row.case);
  assert.equal(
    createHash("sha256").update(JSON.stringify(input)).digest("hex"),
    frozen.sha256,
  );
  const attempts = calls.filter((c: any) => c.case === row.case);
  assert(attempts.length >= 1 && attempts.length <= 2);
  assert(
    Math.abs(
      attempts.reduce((n: number, c: any) => n + c.cost, 0) - row.costUSD,
    ) < 1e-9,
  );
  const outcomes = attempts.map((call: any) => {
    const response = read(`call-${call.id}-response.txt`);
    try {
      return {
        valid: true,
        decision:
          protocol.type === "component-adaptation-diagnostic-replay"
            ? validateComponentAdaptation(
                parseJson(response.choices[0].message.content),
                input.context.evidence,
              )
            : validateComponentReview(
                parseJson(response.choices[0].message.content),
                input.context.evidence,
                input.context.requirementIds,
              ),
      };
    } catch {
      return { valid: false };
    }
  });
  if (outcomes[0].valid) firstAttemptPasses++;
  assert.equal(outcomes.at(-1)!.valid, row.contractPassed);
  if (row.contractPassed) {
    finalPasses++;
    const decision = read(row.case + "-decision.json");
    assert.deepEqual(decision, outcomes.at(-1)!.decision);
    assert.equal(decision.runtimeVerification, "not_performed");
  }
}
assert(Math.abs(total - result.costUSD) < 1e-9);
let files = 0;
function scan(folder: string) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) scan(file);
    else {
      assert(
        !/sk-or-v1-[a-f0-9]{64}/.test(fs.readFileSync(file, "utf8")),
        "Plaintext key found",
      );
      files++;
    }
  }
}
scan(directory);
const verified = {
  verified: true,
  model: protocol.model,
  cases: result.results.length,
  calls: calls.length,
  firstAttemptPasses,
  finalPasses,
  totalCostUSD: total,
  inputTokens,
  outputTokens,
  files,
  noPlaintextProviderKey: true,
  boundary:
    "Contract and receipt verification only. Semantic correctness and gameplay are not established.",
};
fs.writeFileSync(
  path.join(directory, "verification.json"),
  JSON.stringify(verified, null, 2),
);
console.log(JSON.stringify(verified, null, 2));
