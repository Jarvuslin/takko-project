import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  cases,
  model,
  requestFor,
  validateAnswers,
  runPilot,
  summarize,
  reservationNanoUsd,
  ceilingNanoUsd,
} from "./jev-asset-pilot.mjs";

function responseFor(item) {
  return {
    model,
    usage: { input_tokens: 1000, output_tokens: 100, cost: 0.000042 },
    answers: {
      best: {
        type: "choice",
        choice: item.expected,
        confidence: 0.9,
        probabilities: Object.fromEntries([
          ...item.candidates.map((c) => [c.id, c.id === item.expected ? 1 : 0]),
          ["none", item.expected === "none" ? 1 : 0],
        ]),
      },
      ...Object.fromEntries(
        item.candidates.map((c) => [
          "fit_" + c.id,
          {
            type: "score",
            score: c.id === item.expected ? 4 : 0,
            confidence: 1,
            probabilities: {
              0: c.id === item.expected ? 0 : 1,
              1: 0,
              2: 0,
              3: 0,
              4: c.id === item.expected ? 1 : 0,
            },
          },
        ]),
      ),
    },
  };
}
function temp(t) {
  const root = path.resolve(os.tmpdir()),
    dir = fs.mkdtempSync(path.join(root, "takko-jev-test-"));
  t.after(() => {
    const target = path.resolve(dir);
    assert.equal(path.dirname(target), root);
    assert.ok(path.basename(target).startsWith("takko-jev-test-"));
    fs.rmSync(target, { recursive: true, force: true });
  });
  return dir;
}
test("labels excluded and reversed order keeps candidate identities", () => {
  for (const c of cases) {
    const a = requestFor(c),
      b = requestFor(c, true);
    assert.equal("expected" in a.state, false);
    assert.deepEqual(
      b.state.candidates.map((x) => x.id),
      a.state.candidates.map((x) => x.id).reverse(),
    );
  }
});
test("worst-case reservations for all calls fit the ceiling", () =>
  assert.ok(cases.length * 2 * reservationNanoUsd <= ceilingNanoUsd));
test("valid answers accepted", () =>
  assert.equal(validateAnswers(responseFor(cases[0]), cases[0]).choice, "b"));
test("unknown choices and answer IDs rejected", () => {
  let d = responseFor(cases[0]);
  d.answers.best.choice = "invented";
  assert.throws(() => validateAnswers(d, cases[0]));
  d = responseFor(cases[0]);
  d.answers.extra = {};
  assert.throws(() => validateAnswers(d, cases[0]));
});
test("invalid confidence, distribution and scores rejected", () => {
  for (const mutation of [
    (d) => (d.answers.best.confidence = NaN),
    (d) => (d.answers.best.probabilities.a = -1),
    (d) => (d.answers.fit_a.score = 5),
  ]) {
    const d = responseFor(cases[0]);
    mutation(d);
    assert.throws(() => validateAnswers(d, cases[0]));
  }
});
test("version changes rejected", () => {
  const d = responseFor(cases[0]);
  d.model = "another-version";
  assert.throws(() => validateAnswers(d, cases[0]));
});
test("complete mock run accounts for every call without saving key", async (t) => {
  const directory = temp(t);
  let n = 0;
  const key = "fixture-only-secret";
  const report = await runPilot({
    key,
    directory,
    transport: async (url, options) => {
      assert.equal(url, "https://openrouter.ai/api/alpha/decisions");
      assert.equal(options.redirect, "error");
      assert.equal(options.headers.Authorization, "Bearer " + key);
      return new Response(
        JSON.stringify(responseFor(cases[Math.floor(n++ / 2)])),
      );
    },
  });
  assert.equal(n, 16);
  assert.equal(report.summary.correct, 16);
  assert.equal(report.summary.orderConsistent, 8);
  assert.equal(report.summary.usagePricedNanoUsd, 16 * 42000);
  assert.equal(report.summary.unreconciledReservationNanoUsd, 0);
  assert.ok(
    !fs.readFileSync(path.join(directory, "ledger.json"), "utf8").includes(key),
  );
});
test("HTTP failure stops after one call and retains unknown usage reservation", async (t) => {
  let n = 0;
  const r = await runPilot({
    key: "fixture",
    directory: temp(t),
    transport: async () => {
      n++;
      return new Response("fixture-error", { status: 429 });
    },
  });
  assert.equal(n, 1);
  assert.equal(r.summary.unreconciledReservationNanoUsd, reservationNanoUsd);
  assert.equal(r.records[0].status, "failed");
});
test("malformed answers preserve known billable usage and stop", async (t) => {
  const d = responseFor(cases[0]);
  d.answers.best.choice = "invalid";
  const r = await runPilot({
    key: "fixture",
    directory: temp(t),
    transport: async () => new Response(JSON.stringify(d)),
  });
  assert.equal(r.summary.attempted, 1);
  assert.equal(r.summary.usagePricedNanoUsd, 42000);
  assert.equal(r.records[0].status, "failed");
});
test("attempted run cannot be silently repeated", async (t) => {
  const directory = temp(t);
  await runPilot({
    key: "fixture",
    directory,
    transport: async () => new Response("", { status: 401 }),
  });
  await assert.rejects(
    runPilot({
      key: "fixture",
      directory,
      transport: async () => {
        throw Error("must not be called");
      },
    }),
  );
});
test("ties do not get an arbitrary perfect reciprocal rank", () => {
  const r = {
    status: "ok",
    caseId: "shop-ui",
    expected: "b",
    firstCandidate: "a",
    elapsedMs: 10,
    reservedNanoUsd: reservationNanoUsd,
    usagePricedNanoUsd: 42,
    answer: { choice: "b", confidence: 0.9, scores: { a: 2, b: 2, c: 2 } },
  };
  assert.equal(summarize([r]).meanReciprocalRank, 0.5);
});
test("missing credentials cause no network request", async (t) => {
  let called = false;
  await assert.rejects(
    runPilot({
      key: "",
      directory: temp(t),
      transport: async () => {
        called = true;
      },
    }),
  );
  assert.equal(called, false);
});
test("missing provider cost stops with reservation retained", async (t) => {
  const data = responseFor(cases[0]);
  delete data.usage.cost;
  const r = await runPilot({
    key: "fixture",
    directory: temp(t),
    transport: async () => new Response(JSON.stringify(data)),
  });
  assert.equal(r.records.length, 1);
  assert.equal(r.summary.unreconciledReservationNanoUsd, reservationNanoUsd);
});
test("provider cost is recorded independently from token-price estimate", async (t) => {
  let n = 0;
  const r = await runPilot({
    key: "fixture",
    directory: temp(t),
    transport: async () => {
      const data = responseFor(cases[Math.floor(n++ / 2)]);
      data.usage.cost = 0.00003;
      return new Response(JSON.stringify(data));
    },
  });
  assert.equal(r.summary.usagePricedNanoUsd, 16 * 42000);
  assert.ok(Math.abs(r.summary.providerReportedUsd - 16 * 0.00003) < 1e-12);
});
test("dated model identity accepted and arbitrary versions rejected", () => {
  const data = responseFor(cases[0]);
  data.model = "typesafe/jev-1.13-20260917";
  assert.equal(validateAnswers(data, cases[0]).choice, "b");
});
test("request is pinned to TypeSafe without provider fallback", () =>
  assert.deepEqual(requestFor(cases[0]).provider, {
    only: ["TypeSafe"],
    allow_fallbacks: false,
  }));
