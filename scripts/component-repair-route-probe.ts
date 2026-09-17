import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { Engine, componentAdapterInstructions } from "../src/generation/engine";
import { Configuration } from "../src/generation/settings";
import { GenerationStore } from "../src/generation/store";
import { gameContext } from "../src/generation/game-context";
import { componentStageContext } from "../src/generation/asset-pipeline";
import { complete, parseJson } from "../src/generation/providers";
import { componentAdaptationDecisionSchema, expectedAdaptedInventory, loadComponentAdaptationChain, validateComponentAdaptation } from "../src/generation/component-adaptation";
import { componentPreservationChainContext, componentPreservationModelContext } from "../src/generation/component-preservation";
import { validateComponentReview } from "../src/generation/component-review";
import { readComponentOriginal } from "../src/generation/component-derivative";
import type { Profile, Project } from "../src/generation/schema";

export const probeLimits = Object.freeze({ capMicros: 600000, campaignCeilingMicros: 9500000, headroomMicros: 400000, priorMicros: 8110213, historicalReservationsMicros: 22244720, maxCalls: 1 });
const base = "benchmarks/runs/marketplace-diversity-v13-20260916/combat-training";
const root = "research/results/component-repair-routing-v1";
const read = (file: string) => JSON.parse(fs.readFileSync(file, "utf8"));
const hash = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";

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
    immutableSources: Object.fromEntries(["final-project.json", "plan-project.json", "model-events.jsonl", "model-trace.json", "experiment.json"].map(f => [f, hash(fs.readFileSync(base + "/" + f))])),
  } };
}

async function captureWire(reconstruction: ReturnType<typeof reconstructSecondAdaptation>, profile: Profile, directory: string) {
  const config = new Configuration(directory + "/config");
  config.save({ profiles: [profile], routes: { planner: [], builder: [profile.id], reviewer: [], repair: [] }, budgetMicros: probeLimits.capMicros, repairLimit: 0, researchEnabled: false });
  let wire = "", calls = 0;
  const transport: typeof fetch = async (_url, init) => {
    assert.equal(++calls, 1, "Offline fixture must validate on first output");
    wire = init!.body as string;
    return new Response(JSON.stringify({ choices: [{ message: { content: reconstruction.raw }, finish_reason: "stop" }], usage: { prompt_tokens: 1, completion_tokens: 1, cost: 0 } }));
  };
  const engine = new Engine(new GenerationStore(directory + "/projects"), config, transport);
  const project: Project = { ...structuredClone(reconstruction.project), id: randomUUID(), charges: [], reservedMicros: 0, budgetMicros: probeLimits.capMicros, events: [], jobId: null, error: null, failure: null };
  await (engine as any).call(project, "builder", reconstruction.context, componentAdaptationDecisionSchema, config.read(), new Map([[profile.id, "offline-fixture"]]), new AbortController().signal, (v: unknown) => reconstruction.validate(JSON.stringify(v)), { label: "component-adapter" });
  assert.equal(calls, 1);
  return { wire, charge: project.charges[0] };
}

export async function runProbe(mode: "offline" | "live", outputDirectory: string) {
  assert(mode === "offline" || mode === "live");
  const out = path.resolve(outputDirectory);
  assert(!fs.existsSync(out), "Fresh output required; previous evidence is immutable");
  fs.mkdirSync(out, { recursive: true });
  const save = (name: string, value: unknown) => fs.writeFileSync(path.join(out, name), json(value));
  let secret = "", prior: number = probeLimits.priorMicros, gate: ReturnType<typeof oneShotTransport> | undefined;
  let success = false, error: string | undefined, lockOwned = false;
  const lock = ".forge/component-repair-route-probe.lock";
  try {
    const pins = read("research/results/component-repair-v1/check-sources.json");
    for (const [file, digest] of Object.entries(pins)) assert.equal(hash(fs.readFileSync(file)), digest, `Frozen production changed: ${file}`);
    const checked = read("research/results/component-repair-v1/check-completed.json");
    assert(checked.allStagesPassed && checked.unitTests === 1164 && checked.desktopTests === 10 && checked.browserTests === 36);
    const predecessor = read(base + "/results.json");
    assert(predecessor.noFurtherCallsPending && !predecessor.requiresReconciliation && predecessor.inFlightReservationsMicros === 0);
    assert.equal(predecessor.combinedChargedMicros, prior);
    assert.equal(predecessor.combinedReservationsMicros, probeLimits.historicalReservationsMicros);
    fs.cpSync(base + "/asset-evidence", out + "/asset-evidence", { recursive: true });
    const reconstruction = reconstructSecondAdaptation(out + "/asset-evidence");
    const experiment = read(base + "/experiment.json");
    const clean = ({ hasKey: _key, ...p }: any): Profile => p;
    const gemini = clean(experiment.worker), sol = clean(experiment.componentReviewer);
    assert.equal(sol.model, "openai/gpt-5.6-sol");
    assert.equal(gemini.model, "google/gemini-3.7-flash");
    for (const profile of [gemini, sol]) { assert.equal(profile.maxOutputTokens, 12000); assert.equal(profile.requestTimeoutMs, 300000); assert.equal(profile.baseUrl, "https://openrouter.ai/api/v1"); }
    const old = await captureWire(reconstruction, gemini, out + "/offline-engine-gemini");
    const selected = await captureWire(reconstruction, sol, out + "/offline-engine-sol");
    const replaced = JSON.parse(old.wire); replaced.model = sol.model;
    assert.equal(selected.wire, JSON.stringify(replaced), "Only the model may differ");
    const historicalCharge = reconstruction.project.charges.filter(c => c.phase === "builder").at(-1)!;
    assert.equal(old.charge.reservedMicros, historicalCharge.reservedMicros, "Reconstructed message byte allowance differs from V13");
    const request = JSON.parse(selected.wire);
    assert.equal(request.messages.length, 2);
    assert.deepEqual(JSON.parse(request.messages[1].content), JSON.parse(JSON.stringify(reconstruction.context)));
    save("input.json", reconstruction.context); save("reconstruction-proof.json", { ...reconstruction.proof, historicalEngineReserveMicros: historicalCharge.reservedMicros, reconstructedEngineReserveMicros: old.charge.reservedMicros });
    fs.writeFileSync(out + "/request-body.json", selected.wire);
    fs.writeFileSync(out + "/historical-gemini-request-body.json", old.wire);
    fs.writeFileSync(out + "/historical-second-answer.txt", reconstruction.raw);
    const protocol = { version: 1, mode, limits: probeLimits, profile: sol, sources: pins, check: checked, controllerSha256: hash(fs.readFileSync("scripts/component-repair-route-probe.ts")), requestSha256: hash(selected.wire), contextSha256: hash(JSON.stringify(reconstruction.context)), sourceProject: reconstruction.project.id,
      boundary: "Deterministic reconstruction from frozen V13 Engine and chronological event prefix plus validated first-hop archive. Historical outbound wire was not captured: byte equality to the historical request cannot be independently proved. Offline/live reconstructed messages/schema/body match exactly except Gemini-to-Sol model. Historical Gemini is observational, not a randomized comparison. Its answer is an offline fixture only; later reviews/root findings never enter requests. Contract validation is not semantic, native, or game acceptance. No adaptation is applied." };
    save("protocol.json", protocol);
    if (mode === "offline") {
      // Exercise the actual one-shot dispatch path with a local fixture only.
      gate = oneShotTransport({ expectedBody: selected.wire, profile: sol, priorMicros: prior, persist: r => save("reservation.json", r), response: raw => fs.writeFileSync(out + "/response.txt", raw), transport: async () => new Response(JSON.stringify({ choices: [{ message: { content: reconstruction.raw }, finish_reason: "stop" }], usage: { prompt_tokens: 1, completion_tokens: 1, cost: 0 } })) });
    } else {
      const offline = read(root + "/offline/result.json");
      assert(offline.contractPassed && offline.actualPaidCalls === 0 && offline.calls === 1);
      const frozen = read(root + "/offline/protocol.json");
      assert.deepEqual(protocol.sources, frozen.sources); assert.equal(protocol.controllerSha256, frozen.controllerSha256);
      assert.equal(selected.wire, fs.readFileSync(root + "/offline/request-body.json", "utf8"));
      assert.deepEqual(read(out + "/reconstruction-proof.json"), read(root + "/offline/reconstruction-proof.json"));
      assert(!fs.existsSync(".forge/marketplace-diversity.lock"), "Other benchmark owns the provider");
      const fd = fs.openSync(lock, "wx"); lockOwned = true; fs.writeFileSync(fd, json({ pid: process.pid, out, mode })); fs.closeSync(fd);
      const summariesResponse = await fetch("http://127.0.0.1:4324/api/projects", { signal: AbortSignal.timeout(10000) }); assert(summariesResponse.ok);
      const summaries = await summariesResponse.json() as any[];
      const projects = await Promise.all(summaries.map(async p => { const res = await fetch("http://127.0.0.1:4324/api/projects/" + p.id, { signal: AbortSignal.timeout(10000) }); assert(res.ok); return res.json() as Promise<any>; }));
      assert(projects.every(p => p.jobId === null && p.reservedMicros === 0), "Original app busy");
      save("app-idle.json", projects.map(p => ({ id: p.id, jobId: p.jobId, reservedMicros: p.reservedMicros })));
      try { secret = execFileSync("pwsh.exe", ["-NoProfile", "-NonInteractive", "-Command", "$s=ConvertTo-SecureString ([IO.File]::ReadAllText((Join-Path $env:LOCALAPPDATA 'Takko\\secrets\\openrouter-testing.dpapi'))); $p=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($s); try {[Console]::Write([Runtime.InteropServices.Marshal]::PtrToStringBSTR($p))} finally {[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($p)}"], { windowsHide: true, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim(); } catch { throw Error("Credential restoration failed; suppressed"); }
      assert(secret.length > 0);
      const keyResponse = await fetch("https://openrouter.ai/api/v1/key", { headers: { Authorization: "Bearer " + secret }, redirect: "error", signal: AbortSignal.timeout(15000) }); assert(keyResponse.ok);
      const { data } = await keyResponse.json() as any;
      assert(Number.isFinite(data.usage) && data.usage >= 0 && Number.isFinite(data.limit_remaining));
      save("key-before.json", { checkedAt: new Date().toISOString(), limit: data.limit, usage: data.usage, remaining: data.limit_remaining, expiresAt: data.expires_at });
      prior = Math.max(prior, Math.ceil(data.usage * 1e6));
      assert(prior + probeLimits.capMicros + probeLimits.headroomMicros <= probeLimits.campaignCeilingMicros && data.limit_remaining * 1e6 >= probeLimits.capMicros + probeLimits.headroomMicros, "Campaign/key admission rejected");
      const catalogResponse = await fetch("https://openrouter.ai/api/v1/models", { redirect: "error", signal: AbortSignal.timeout(15000) }); assert(catalogResponse.ok);
      const catalog = await catalogResponse.json() as any;
      const model = catalog.data.find((m: any) => m.id === sol.model);
      assert(model && Number(model.pricing.prompt) * 1e6 === sol.inputRate && Number(model.pricing.completion) * 1e6 === sol.outputRate, "Official current model rates differ");
      save("catalog-model.json", model);
      gate = oneShotTransport({ expectedBody: selected.wire, profile: sol, priorMicros: prior, persist: r => save("reservation.json", r), response: raw => fs.writeFileSync(out + "/response.txt", raw), redact: raw => raw.replaceAll(secret, "[REDACTED]"), transport: fetch });
    }
    const completion = await complete(sol, secret || "offline-fixture", request.messages[0].content, request.messages[1].content, AbortSignal.timeout(300000), gate.transport);
    fs.writeFileSync(out + "/raw-answer.txt", completion.text);
    const decision = reconstruction.validate(completion.text);
    save("decision.json", decision);
    gate.settleValidated(); success = true;
  } catch (e) {
    error = secret ? String(e).replaceAll(secret, "[REDACTED]") : String(e);
  } finally {
    const record = gate?.snapshot();
    const liability = record?.liabilityMicros ?? 0;
    const unknown = mode === "live" && !!record?.dispatched && record.chargedMicros === null;
    const result = { mode, contractPassed: success, error, calls: record?.calls ?? 0, actualPaidCalls: mode === "live" && record?.dispatched ? 1 : 0, chargedMicros: mode === "live" ? record?.chargedMicros ?? null : 0, generationId: record?.generationId ?? null, transportReservationMicros: record?.reserveMicros ?? 0, liabilityMicros: mode === "live" ? liability : 0, priorMicros: prior, conservativePriorMicros: prior + (mode === "live" ? liability : 0), inheritedUnknownLiabilitiesRetained: true, historicalEngineReservationsMicros: probeLimits.historicalReservationsMicros, combinedHistoricalEngineAndProbeTransportReservationsMicros: probeLimits.historicalReservationsMicros + (mode === "live" ? record?.reserveMicros ?? 0 : 0), providerOutcomeUnknown: unknown, knownChargeWithConservativeReservationRetention: mode === "live" && !success && record?.chargedMicros != null, localRequestSettled: true, noFurtherRequests: true, stopDoesNotProveRemoteSettlement: unknown, nativeOperations: 0, rawGamePass: false };
    save("result.json", result); secret = "";
    if (lockOwned) fs.unlinkSync(lock);
    console.log(JSON.stringify(result));
  }
  if (!success) throw Error("Diagnostic ended without a validated first output; see preserved result.json; no retries");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [mode, output] = process.argv.slice(2);
  assert((mode === "offline" || mode === "live") && output, "Expected offline|live and fresh output directory");
  await runProbe(mode, output);
}
