import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cases, promptFor } from "./agent-effectiveness-cases.mjs";
const directory = path.resolve(process.argv[2]);
const result = JSON.parse(
  fs.readFileSync(path.join(directory, "results.json"), "utf8"),
);
const sha = (x) => createHash("sha256").update(x).digest("hex");
assert.equal(result.rows.length, result.layoutAB ? 12 : 6);
if (result.layoutAB) assert.equal(result.rounds, 2);
assert.equal(result.rootRepairs, 0);
const aggregate = {};
for (const row of result.rows) {
  const fixture = cases.find((c) => c.id === row.case);
  const frozen = result.publicFixtures.find((c) => c.id === row.case);
  assert.equal(sha(promptFor(fixture)), frozen.promptHash);
  assert.equal(sha(fixture.tests), frozen.testHash);
  const trial = row.trial ?? `${row.case}-${row.harness.toLowerCase()}`;
  assert.equal(row.evaluation.passed, true);
  const source = fs.readFileSync(
    path.join(directory, trial, "evaluation", "Logic.luau"),
  );
  assert.equal(sha(source), row.evaluation.sourceHash);
  const testPath = path.join(directory, trial, "evaluation", "test.luau");
  assert.equal(sha(fs.readFileSync(testPath)), frozen.testHash);
  const observed = execFileSync(
    path.resolve(".forge/tools/luau/luau.exe"),
    [testPath],
    { encoding: "utf8", windowsHide: true, stdio: "pipe", timeout: 10000 },
  );
  assert(observed.includes(`PASS ${row.case}`));
  const tally = (aggregate[row.harness] ??= {
    cases: 0,
    passed: 0,
    calls: 0,
    costUSD: 0,
    durationMs: 0,
    inputTokens: 0,
    cachedInputTokens: 0,
    outputTokens: 0,
    tools: {},
  });
  tally.cases++;
  tally.passed++;
  tally.durationMs += row.durationMs;
  const calls = result.calls.filter((c) => c.trial === trial);
  assert.equal(calls.length, row.calls);
  let cost = 0;
  for (const call of calls) {
    const request = JSON.parse(
      fs.readFileSync(
        path.join(directory, "calls", `${call.id}-request.json`),
        "utf8",
      ),
    );
    assert.equal(request.body.model, result.model);
    assert.equal(request.trial, trial);
    if (result.layoutAB) {
      const context = JSON.parse(request.body.messages[1].content);
      const isReordered = row.harness === "Takko reordered";
      assert.equal(Object.keys(context)[0] === "runtimeReference", isReordered);
      assert(
        request.body.messages[0].content.includes(
          `-${isReordered ? "reordered" : "baseline"}.`,
        ),
      );
    }
    const response = fs.readFileSync(
      path.join(directory, "calls", `${call.id}-response.txt`),
      "utf8",
    );
    let usage;
    if (request.body.stream) {
      for (const line of response.split("\n")) {
        if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
        const chunk = JSON.parse(line.slice(6));
        if (chunk.usage) usage = chunk.usage;
      }
    } else usage = JSON.parse(response).usage;
    assert.equal(usage.cost, call.charged);
    assert(Number.isFinite(call.charged) && call.charged >= 0);
    cost += call.charged;
    tally.inputTokens += usage.prompt_tokens;
    tally.outputTokens += usage.completion_tokens;
    tally.cachedInputTokens += usage.prompt_tokens_details?.cached_tokens ?? 0;
  }
  assert(Math.abs(cost - row.accountedUSD) < 1e-9);
  assert(cost <= 0.15);
  tally.costUSD += cost;
  tally.calls += calls.length;
  if (row.harness === "OpenCode") {
    assert(row.testsUnchanged);
    for (const line of fs
      .readFileSync(path.join(directory, trial, "events.jsonl"), "utf8")
      .split("\n")
      .filter(Boolean)) {
      const event = JSON.parse(line);
      if (event.type === "tool_use") {
        const tool = event.part.tool;
        const status = event.part.state.status;
        const label = `${tool}:${status}`;
        tally.tools[label] = (tally.tools[label] ?? 0) + 1;
      }
    }
  }
}
let inspectedFiles = 0;
function inspect(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) inspect(file);
    else {
      assert(
        !/sk-or-v1-[a-f0-9]{64}/.test(fs.readFileSync(file, "utf8")),
        "Credential must not appear in results",
      );
      inspectedFiles++;
    }
  }
}
inspect(directory);
const cost = Object.values(aggregate).reduce((n, v) => n + v.costUSD, 0);
assert(Math.abs(cost - result.chargedUSD) < 1e-9);
assert(cost <= 1);
const verified = {
  passed: true,
  scope:
    "Paid harness calls plus offline pure-Luau evaluations; no Studio/Marketplace test",
  aggregate,
  totalCostUSD: cost,
  inspectedFiles,
  noPlaintextProviderKey: true,
};
fs.writeFileSync(
  path.join(directory, "verification.json"),
  JSON.stringify(verified, null, 2),
);
console.log(JSON.stringify(verified, null, 2));
