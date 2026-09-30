import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, expect, it } from "vitest";
import { assertReviewBudget, prepareReviewBudget, refreshReviewBudget, trialFinalReviewPolicy } from "../src/generation/review-budget";
import { GenerationStore } from "../src/generation/store";
import { directBuildSpec } from "../src/generation/direct-build";
import { OpenCodeGateway } from "../src/generation/opencode-gateway";
import type { Charge, Project } from "../src/generation/schema";
import { profile } from "./generation-fixtures";

const folders: string[] = [];
afterEach(() => folders.splice(0).forEach(dir => fs.rmSync(dir, { recursive: true, force: true })));
function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-review-budget-")); folders.push(dir);
  const store = new GenerationStore(dir);
  const p: Project = JSON.parse(fs.readFileSync("tests/fixtures/direct-build/6e6ffc7f.json", "utf8"));
  store.save(p);
  const project = store.get(p.id);
  project.proposal!.approval = { hash: project.proposal!.hash, revision: project.revision, at: new Date().toISOString() };
  project.spec = directBuildSpec(project);
  // Isolated replay cycle. Original historical files and charges remain unchanged.
  project.charges = [];
  project.generation = { id: project.id, chargeStart: 0, budgetMicros: 7500000 };
  project.budgetMicros = 7500000;
  project.reservedMicros = 0;
  project.jobId = "offline-budget-replay";
  const model = { ...profile(), inputRate: 2, outputRate: 10, maxOutputTokens: 8192 };
  prepareReviewBudget(project, model, trialFinalReviewPolicy);
  store.save(project);
  return { project, store, model };
}

it("admits exact fit, denies one microdollar over, and accounts concurrent holds", () => {
  const { project: p } = setup();
  const hold = refreshReviewBudget(p);
  const available = p.generation!.budgetMicros - hold;
  expect(() => assertReviewBudget(p, available)).not.toThrow();
  expect(() => assertReviewBudget(p, available + 1)).toThrow(/funds set aside/);
  p.reservedMicros = 1;
  expect(() => assertReviewBudget(p, available)).toThrow(/funds set aside/);
  expect(() => assertReviewBudget(p, available - 1)).not.toThrow();
});

it("persists a growing review envelope across reload and explicit continuation", () => {
  const { project: p, store, model } = setup();
  const before = refreshReviewBudget(p);
  refreshReviewBudget(p, 800000);
  expect(p.protectedReview!.allowanceMicros).toBeGreaterThan(before);
  store.save(p);
  const resumed = new GenerationStore(store.directory).get(p.id);
  prepareReviewBudget(resumed, model, trialFinalReviewPolicy);
  expect(resumed.protectedReview!.policy.inputEnvelopeBytes).toBe(800000);
  expect(resumed.protectedReview!.allowanceMicros).toBe(p.protectedReview!.allowanceMicros);
  expect(() => assertReviewBudget(resumed, 7000000)).toThrow(/Protected final-review/);
});

it("protects the allowance during concurrent gateway requests before asynchronous authorization", async () => {
  const { project: p, store, model } = setup();
  const request = { messages: [{ role: "user", content: JSON.stringify(p.spec) }] };
  const encoded = JSON.stringify({ messages: request.messages, model: model.model, max_tokens: model.maxOutputTokens, stream: false });
  const reserve = Math.ceil((Buffer.byteLength(encoded) + 1024) * model.inputRate + model.maxOutputTokens * model.outputRate);
  p.budgetMicros = p.generation!.budgetMicros = refreshReviewBudget(p) + reserve;
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  let calls = 0;
  const gateway = new OpenCodeGateway({ project: p, store, profile: model, key: "offline", phase: "builder", signal: new AbortController().signal,
    beforeDispatch: () => pending, transport: async () => {
      calls++;
      return Response.json({ choices: [], usage: { prompt_tokens: 0, completion_tokens: 0, cost: 0 } });
    } });
  const first = gateway.dispatch(request, async () => {});
  expect(p.reservedMicros).toBe(reserve);
  await expect(gateway.dispatch(request, async () => {})).rejects.toThrow(/funds set aside/);
  release();
  // A denial latches the gateway shut, so even its not-yet-dispatched first call stops.
  await expect(first).rejects.toThrow(/funds set aside/);
  expect(calls).toBe(0);
  expect(p.reservedMicros).toBe(0);
  expect(p.protectedReview!.status).toBe("protected");
});

it("replays recorded no-cache charges through the gateway and stops coding before it consumes review funds", async () => {
  const { project: p, store, model } = setup();
  const ledger = JSON.parse(fs.readFileSync("docs/results/approved-reference-finish-20260927/ledger.json", "utf8"));
  const charges: Charge[] = ledger.charges.filter((c: any) => c.opencodeRunId === "57c4993b-1165-4740-a7a0-b797074b19f7");
  expect(charges).toHaveLength(30);
  expect(charges.reduce((sum, c) => sum + c.inputTokens! * 2 + c.outputTokens! * 10, 0)).toBe(3593702);
  // Request consumes the real direct-spec producer, not a fabricated asset contract.
  const historical: Project = JSON.parse(fs.readFileSync("docs/results/approved-reference-finish-20260927/terminal-project.json", "utf8"));
  const request = { messages: [{ role: "user", content: JSON.stringify({ spec: p.spec, existingArtifact: historical.artifact }) }] };
  let calls = 0;
  const gateway = new OpenCodeGateway({ project: p, store, profile: model, key: "offline", phase: "builder", signal: new AbortController().signal, maxRequests: 100,
    transport: async () => {
      calls++;
      return Response.json({ choices: [], usage: { prompt_tokens: 0, completion_tokens: 0, cost: 0 } });
    } });
  let denied = false;
  for (let i = 0; i < 100; i++) {
    // Advance the recorded workload's ledger, repriced without cache savings.
    // Repeating it is a stress scenario, not a claim that these extra calls ran.
    const c = charges[i % charges.length];
    p.charges.push({ ...c, chargedMicros: c.inputTokens! * 2 + c.outputTokens! * 10 });
    const priorCalls = calls;
    try { await gateway.dispatch(request, async () => {}); }
    catch (error) {
      expect((error as Error).message).toMatch(/funds set aside for review/);
      expect(calls).toBe(priorCalls);
      denied = true;
      break;
    }
  }
  expect(denied).toBe(true);
  const spent = p.charges.reduce((sum, c) => sum + c.chargedMicros, 0);
  expect(spent).toBeLessThan(7500000);
  expect(p.reservedMicros).toBe(0);
  expect(p.protectedReview!.status).toBe("protected");
  expect(store.get(p.id).spec).toEqual(p.spec);
  expect(() => assertReviewBudget(p, p.protectedReview!.allowanceMicros, true)).not.toThrow();
  // A retained unknown provider outcome must block even the protected review.
  p.charges.push({ ...p.charges[0], estimated: true, inputTokens: null, outputTokens: null });
  expect(() => assertReviewBudget(p, 1, true)).toThrow(/unknown provider billing/);
});
