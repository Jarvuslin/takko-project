import fs from "node:fs";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { componentAdapterInstructions } from "../src/generation/engine";
import { gameContext } from "../src/generation/game-context";
import { componentStageContext } from "../src/generation/asset-pipeline";
import { parseJson } from "../src/generation/providers";
import { componentAdaptationDecisionSchema, expectedAdaptedInventory, loadComponentAdaptationChain, validateComponentAdaptation } from "../src/generation/component-adaptation";
import { componentPreservationChainContext, componentPreservationModelContext } from "../src/generation/component-preservation";
import { validateComponentReview } from "../src/generation/component-review";
import { readComponentOriginal } from "../src/generation/component-derivative";
import type { Profile, Project } from "../src/generation/schema";

export const probeLimits = Object.freeze({ capMicros: 600000, campaignCeilingMicros: 9500000, headroomMicros: 400000, priorMicros: 8110213, historicalReservationsMicros: 22244720, maxCalls: 1 });
const base = "tests/fixtures/asset-pipeline/marketplace-diversity-v13/combat-training";
const read = (file: string) => JSON.parse(fs.readFileSync(file, "utf8"));
const hash = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");

// Logs are bounded projections, not authoritative source bodies. Verify every
// retained field and truncation digest against the independently loaded value.
function assertEventProjection(actual: any, logged: any): void {
  if (logged?.omitted === "depth limit") return;
  if (logged && typeof logged.preview === "string" && logged.sha256) {
    assert.equal(typeof actual, "string"); assert.equal(hash(actual), logged.sha256);
    assert.equal(actual.length, logged.length); assert(actual.startsWith(logged.preview)); return;
  }
  if (actual === undefined && logged === null) return;
  if (Array.isArray(logged)) {
    assert(Array.isArray(actual));
    const omitted = logged.at(-1)?.omittedItems ?? 0;
    assert.equal(actual.length, logged.length - (omitted ? 1 : 0) + omitted);
    logged.slice(0, omitted ? -1 : undefined).forEach((v, i) => assertEventProjection(actual[i], v)); return;
  }
  if (logged && typeof logged === "object") {
    assert(actual && typeof actual === "object");
    for (const [key, value] of Object.entries(logged)) assertEventProjection(actual[key], value);
    return;
  }
  assert.deepEqual(actual, logged);
}

/** The reservation is durable before dispatch; consuming the one-shot latch is irreversible. */
export function oneShotTransport(options: {
  expectedBody: string; profile: Profile; priorMicros: number;
  persist: (record: Record<string, unknown>) => void;
  response: (raw: string) => void;
  transport: typeof fetch; redact?: (raw: string) => string;
}) {
  let consumed = false;
  const record: Record<string, any> = { dispatched: false, calls: 0, reserveMicros: 0, status: "not_dispatched" };
  const transport: typeof fetch = async (url, init) => {
    assert(!consumed, "One paid dispatch maximum; retry forbidden");
    assert.equal(url, "https://openrouter.ai/api/v1/chat/completions");
    assert.equal(init?.method, "POST");
    assert.equal(init?.body, options.expectedBody, "Request differs from frozen offline bytes");
    const reserve = Math.ceil((Buffer.byteLength(options.expectedBody) + 1024) * options.profile.inputRate + 12000 * options.profile.outputRate);
    assert(Number.isSafeInteger(options.priorMicros) && options.priorMicros >= probeLimits.priorMicros);
    assert(reserve <= probeLimits.capMicros, "Single request exceeds diagnostic cap");
    assert(options.priorMicros + probeLimits.capMicros + probeLimits.headroomMicros <= probeLimits.campaignCeilingMicros, "Campaign admission rejected");
    consumed = true;
    Object.assign(record, { calls: 1, reserveMicros: reserve, chargedMicros: null, liabilityMicros: reserve, status: "reserved", startedAt: new Date().toISOString() });
    options.persist(structuredClone(record));
    try {
      record.dispatched = true;
      options.persist(structuredClone(record));
      const res = await options.transport(url, { ...init, redirect: "error" });
      const raw = (options.redact ?? ((x) => x))(await res.text());
      options.response(raw);
      record.httpStatus = res.status;
      try {
        const data = JSON.parse(raw);
        record.usage = data.usage;
        record.generationId = typeof data.id === "string" ? data.id : null;
        if (Number.isFinite(data.usage?.cost) && data.usage.cost >= 0) record.chargedMicros = Math.ceil(data.usage.cost * 1e6);
        record.liabilityMicros = Math.max(reserve, record.chargedMicros ?? reserve);
      } catch { /* Unknown monetary outcome retains the entire reservation. */ }
      record.status = res.ok && record.chargedMicros !== null ? "response_received" : "failed_or_unknown";
      record.finishedAt = new Date().toISOString();
      options.persist(structuredClone(record));
      return new Response(raw, { status: res.status, headers: { "Content-Type": "application/json" } });
    } catch {
      record.status = "failed_or_unknown";
      record.error = "Request or evidence persistence failed; reservation retained; no retry";
      record.finishedAt = new Date().toISOString();
      options.persist(structuredClone(record));
      throw Error(record.error);
    }
  };
  return { transport, snapshot: () => structuredClone(record), settleValidated: () => {
    assert(record.status === "response_received" && record.chargedMicros !== null, "Cannot settle failed or unknown request");
    record.status = "validated";
    record.liabilityMicros = Math.max(record.chargedMicros, 0);
    options.persist(structuredClone(record));
  } };
}

export function reconstructSecondAdaptation(evidenceDirectory: string) {
  const project: Project = read(base + "/final-project.json");
  const planned: Project = read(base + "/plan-project.json");
  for (const key of ["request", "scope", "revision", "spec"] as const) assert.deepEqual(project[key], planned[key], `Historical ${key} changed`);
  const events = project.assetPipeline!.events;
  const rows = fs.readFileSync(base + "/model-events.jsonl", "utf8").trim().split(/\r?\n/).map(line => JSON.parse(line));
  const cutoff = events.findIndex(e => e.step === "component_adaptation_decision_call" && (e.data as any)?.adaptation?.attempt === 2);
  assert(cutoff > 0);
  const call = events[cutoff];
  const prefix = events.slice(0, cutoff);
  const priorEvent = (step: string) => prefix.filter(e => e.needId === call.needId && e.step === step).at(-1)!.data as any;
  const initial = priorEvent("component_review_call");
  const detail = call.data as any;
  const need = project.assetPipeline!.needs.find(n => n.id === call.needId)!;
  assert.deepEqual(need, planned.spec!.assetNeeds!.find(n => n.id === call.needId));
  const chain = loadComponentAdaptationChain(evidenceDirectory, initial.packetHash, detail.packetHash, detail.inputHash);
  assert.equal(chain.steps.length, 1, "Second adaptation must have exactly one applied parent");
  assertEventProjection(chain.evidence, priorEvent("component_adapt_result").evidence);
  assertEventProjection(chain.steps[0].plan, priorEvent("component_adapt_call").plan);
  const reviewRow = rows.filter(row => row.phase === "reviewer" && typeof row.response === "string" && row.at < call.at).at(-1);
  assert(reviewRow);
  const review = validateComponentReview(parseJson(reviewRow.response), chain.evidence, initial.requirementIds);
  assertEventProjection(review, priorEvent("component_adapted_review_result"));
  assert.equal(review.disposition, "needs_more_evidence");
  const preservation = componentPreservationChainContext(chain.preparedEvidence, [{ plan: chain.steps[0].plan, evidence: chain.evidence }]);
  assertEventProjection(preservation, priorEvent("component_adapted_review_call").preservation);
  assert.deepEqual(detail.adaptation, { attempt: 2, maxAttempts: 2, remainingAttempts: 0 });
  const chronologicalRun = rows.find(row => row.run?.events?.at(-1)?.step === call.step && row.run.events.at(-1).at === call.at)?.run;
  assert(chronologicalRun, "No chronological request snapshot");
  const candidate = (prefix.find(e => e.needId === call.needId && e.step === "candidate_selected")!.data as any).candidate;
  assert.equal(candidate.id, chain.evidence.candidateId);
  const stage = componentStageContext({ ...chronologicalRun, events: chronologicalRun.events.slice(0, -1) }, need, candidate);
  assertEventProjection(stage, detail.stage);
  // Preserve the insertion order used by the frozen pipeline then Engine spread.
  const context = { task: "component-adaptation", request: project.request, gameContext: gameContext(planned, need), context: {
    need, evidence: chain.evidence, requirementIds: initial.requirementIds, stage, adaptation: detail.adaptation,
    preservation: componentPreservationModelContext(preservation), review,
  }, instructions: componentAdapterInstructions };
  const next = events.slice(cutoff + 1).find(e => e.step === "component_adaptation_decision_result")!.data;
  const raw = rows.filter(row => row.phase === "builder" && typeof row.response === "string" && row.at > call.at).find(row => {
    try { assertEventProjection(parseJson(row.response), next); return true; } catch { return false; }
  });
  assert(raw, "Unchanged historical second answer not found");
  const snapshot = readComponentOriginal(evidenceDirectory, chain.archive.archiveHash, chain.archive.manifestHash).snapshot;
  const validate = (text: string) => {
    const decision = componentAdaptationDecisionSchema.parse(parseJson(text));
    if (decision.action === "adapt") {
      validateComponentAdaptation(decision.plan, chain.evidence);
      expectedAdaptedInventory(snapshot, decision.plan);
    }
    return decision;
  };
  validate(raw.response);
  return { project, context, raw: raw.response as string, validate, proof: {
    cutoffIndex: cutoff, cutoffAt: call.at, eventPrefixSha256: hash(JSON.stringify(prefix)),
    preparedPacketHash: initial.packetHash, currentPacketHash: chain.evidence.packetHash, inputHash: detail.inputHash,
    firstHopPlanSha256: hash(JSON.stringify(chain.steps[0].plan)), priorReviewSha256: hash(JSON.stringify(review)),
    rawFixtureSha256: hash(raw.response), rawFixtureAt: raw.at,
  } };
}
