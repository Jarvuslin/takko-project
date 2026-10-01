import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, expect, it } from "vitest";
import { z } from "zod";
import { Engine, validateReview } from "../src/generation/engine";
import { Configuration } from "../src/generation/settings";
import { GenerationStore } from "../src/generation/store";
import { reviewSchema, type Project, type Review } from "../src/generation/schema";
import { prepareReviewBudget, trialFinalReviewPolicy } from "../src/generation/review-budget";
import { profile } from "./generation-fixtures";

const folders: string[] = [];
afterEach(() => folders.splice(0).forEach(dir => fs.rmSync(dir, { recursive: true, force: true })));
for (const truncated of [false, true]) it(`replays the preserved ${truncated ? "truncated" : "completed"} final review through Engine admission with one attempt`, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-final-review-")); folders.push(dir);
  const root = "tests/fixtures/regression/completed-combat/";
  const p: Project = JSON.parse(fs.readFileSync(root + "terminal-project.json", "utf8"));
  const trace = JSON.parse(fs.readFileSync(root + "traces/" + p.id + ".json", "utf8"));
  const failure = JSON.parse(fs.readFileSync("tests/fixtures/regression/retained-animation/review-failure.json", "utf8"));
  const ledger = JSON.parse(fs.readFileSync(root + "ledger.json", "utf8"));
  p.charges = ledger.charges.filter((c: any) => c.opencodeRunId === "57c4993b-1165-4740-a7a0-b797074b19f7").map((c: any) => ({ ...c, chargedMicros: c.inputTokens * 2 + c.outputTokens * 10 }));
  p.budgetMicros = 7500000;
  p.generation = { id: p.id, budgetMicros: 7500000, chargeStart: 0 };
  p.jobId = null; p.reservedMicros = 0;
  const model = { ...profile("openrouter"), baseUrl: "https://openrouter.ai/api/v1", inputRate: 2, outputRate: 10, maxOutputTokens: 8192 };
  const config = new Configuration(path.join(dir, "config"));
  config.save({ profiles: [model], routes: { planner: [model.id], builder: [model.id], reviewer: [model.id], repair: [model.id] }, budgetMicros: 7500000, repairLimit: 0 });
  const store = new GenerationStore(dir);
  prepareReviewBudget(p, model, trialFinalReviewPolicy);
  store.save(p);
  let calls = 0;
  let sourceReview = false;
  const engine = new Engine(store, config, async (_url, init) => {
    calls++;
    if (sourceReview) {
      expect(JSON.parse(String(init?.body)).max_tokens).toBe(8192);
      expect(JSON.parse(String(init?.body)).reasoning).toBeUndefined();
      expect(p.protectedReview!.status).toBe("protected");
      return Response.json({ choices: [{ finish_reason: "stop", message: { content: "{}" } }], usage: { prompt_tokens: 0, completion_tokens: 0 } });
    }
    expect(JSON.parse(String(init?.body))).toMatchObject({ max_tokens: 32768, reasoning: { effort: "medium" } });
    expect(p.protectedReview!.status).toBe("reserved");
    expect(p.reservedMicros).toBeGreaterThan(327680);
    return Response.json({ choices: [{ finish_reason: truncated ? "length" : "stop", message: { content: truncated ? fs.readFileSync("tests/fixtures/regression/retained-animation/review-truncated.txt", "utf8") : trace.response } }], usage: { prompt_tokens: 77832, completion_tokens: truncated ? failure.outputTokens : 14854, completion_tokens_details: { reasoning_tokens: truncated ? failure.reasoningTokens : 7481 } } });
  }, async () => [], undefined, { finalReview: trialFinalReviewPolicy });
  // Large attached-script reviews use this same helper without assetCall.
  // They must retain the ordinary profile and the final-review allowance.
  delete p.protectedReview;
  store.save(p);
  sourceReview = true;
  await (engine as any).call(p, "reviewer", { kind: "attached-source-review", sources: p.artifact!.files }, z.object({}).strict(), config.read(), new Map(), new AbortController().signal);
  expect(p.protectedReview!.status).toBe("protected");
  sourceReview = false;
  calls = 0;
  // Exercise the actual shared call boundary against a preserved completed
  // artifact. Full native acquisition/export is deliberately the A3 rehearsal.
  const request = (engine as any).call(p, "reviewer", { request: p.request, namespace: p.scope, spec: p.spec, artifact: p.artifact }, reviewSchema, config.read(), new Map(), new AbortController().signal,
    (review: Review) => validateReview(review, p.spec!), undefined, { finalReview: true });
  if (truncated) await expect(request).rejects.toThrow(/truncated/i);
  else {
    const review = await request;
    expect(review.tests.length).toBeGreaterThan(0);
    expect(review.issues).toEqual(p.review!.issues);
  }
  expect(calls).toBe(1);
  expect(p.reservedMicros).toBe(0);
  expect(p.protectedReview!.status).toBe("consumed");
  expect(config.read().profiles[0].maxOutputTokens).toBe(8192);
  expect(p.charges.reduce((sum, c) => sum + c.chargedMicros, 0)).toBeLessThan(7500000);
});
