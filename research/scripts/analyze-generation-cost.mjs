// Offline analysis of immutable run receipts and a separately fetched public catalog.
// No provider calls, credentials, game edits or budget changes.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const output = 'research/notes/generation-cost-20260916';
const read = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const roots = [
 ['v4-minimax', 'benchmarks/runs/butter-crunch-marketplace-v4-20260916/minimax'],
 ['v4-mimo', 'benchmarks/runs/butter-crunch-marketplace-v4-20260916/mimo'],
 ['v4-grok', 'benchmarks/runs/butter-crunch-marketplace-v4-20260916/grok'],
 ['v5-grok', 'benchmarks/runs/butter-crunch-marketplace-v5-20260916/grok'],
 ['v6-grok', 'benchmarks/runs/butter-crunch-marketplace-v6-20260916/grok'],
];
const runs = roots.map(([id, dir]) => {
 const file = dir + '/results.json';
 const run = read(file);
 assert.equal(run.charges.reduce((n, c) => n + c.chargedMicros, 0), run.chargedMicros);
 assert.equal(run.charges.reduce((n, c) => n + c.reservedMicros, 0), run.reservedMicros);
 return { id, file, sha256: createHash('sha256').update(fs.readFileSync(file)).digest('hex'), chargedUSD: run.chargedMicros / 1e6, cumulativeReservationsUSD: run.reservedMicros / 1e6, calls: run.charges.length, stage: run.stage, error: run.error, cancellationReason: run.cancellationReason };
});
const v6 = read(roots.at(-1)[1] + '/results.json');
const events = fs.readFileSync(roots.at(-1)[1] + '/model-events.jsonl', 'utf8').trim().split('\n').map(JSON.parse).filter(e => e.response);
assert.equal(events.length, v6.charges.length);
const byRole = {};
let cumulativeReserve = 0;
let cumulativeActual = 0;
let firstBlocked;
const replay = v6.charges.map((charge, i) => {
 const response = JSON.parse(events[i].response);
 assert.equal(charge.model, events[i].model);
 const role = response.action ? 'asset_selection' : typeof response.accepted === 'boolean' ? 'asset_evaluation' : charge.phase;
 const tally = byRole[role] ??= { calls: 0, chargedMicros: 0, inputTokens: 0, outputTokens: 0, responseBytes: 0 };
 tally.calls++; tally.chargedMicros += charge.chargedMicros;
 tally.inputTokens += charge.inputTokens; tally.outputTokens += charge.outputTokens;
 tally.responseBytes += Buffer.byteLength(events[i].response);
 const row = { call: i + 1, role, spentBeforeUSD: cumulativeActual / 1e6, reserveForCallUSD: charge.reservedMicros / 1e6, cumulativeReservationAfterUSD: (cumulativeReserve + charge.reservedMicros) / 1e6, monetaryCapWouldAdmit: cumulativeActual + charge.reservedMicros <= 1e6, cumulativeCapWouldAdmit: cumulativeReserve + charge.reservedMicros <= 1e6 };
 if (!row.cumulativeCapWouldAdmit && !firstBlocked) firstBlocked = row;
 cumulativeReserve += charge.reservedMicros; cumulativeActual += charge.chargedMicros;
 return row;
});
assert.equal(cumulativeActual, 185297);
assert.equal(cumulativeReserve, 1231075);
assert.equal(firstBlocked.call, 10);
assert(replay.every(r => r.monetaryCapWouldAdmit));
assert.equal(runs.reduce((n, r) => n + Math.round(r.chargedUSD * 1e6), 0), 349810);
// GameCraft README token totals, 140 tasks. Repricing assumes input includes
// cache reads. These are scenarios, not the authors' bills or success costs.
const workloads = [
 { model: 'moonshotai/kimi-k2.6', input: 2.24e9, cache: 2.22e9, output: 10.9e6 },
 { model: 'anthropic/claude-opus-4.7', input: 1.58e9, cache: 1.50e9, output: 9.4e6 },
 { model: 'deepseek/deepseek-v4-pro', input: 232.6e6, cache: 58e6, output: 7.8e6 },
 { model: 'openai/gpt-5.5', input: 148.5e6, cache: 130.3e6, output: 2.8e6 },
];
const catalog = read(output + '/catalog.json');
const repriced = workloads.map(w => {
 const pricing = catalog.models.find(m => m.id === w.model)?.pricing;
 assert(pricing);
 const base = Number(pricing.prompt), cache = Number(pricing.input_cache_read), out = Number(pricing.completion);
 assert(w.cache <= w.input && [base, cache, out].every(Number.isFinite));
 return { ...w, tasks: 140, ratesPerMillion: { input: base * 1e6, cache: cache * 1e6, output: out * 1e6 }, baseRateScenarioUSD: ((w.input - w.cache) * base + w.cache * cache + w.output * out) / 140, noCacheScenarioUSD: (w.input * base + w.output * out) / 140 };
});
assert(Math.abs(repriced.at(-1).baseRateScenarioUSD - 1.7153571428571428) < 1e-9);
const result = { analyzedAt: new Date().toISOString(), runs, v6: { byRole, firstBlockedUnderHypotheticalOneDollarCumulativeCap: firstBlocked, monetaryOnlyOneDollarCapAdmitsAllRecordedCalls: true, reservationToChargeRatio: cumulativeReserve / cumulativeActual, replay }, gameCraftRepricing: { tokenSource: 'https://github.com/FreedomIntelligence/gamecraft-bench/blob/main/README.md', priceSnapshot: catalog.checkedAt, assumptions: ['Input counts include cached reads; publisher token aggregates are rounded.', 'Uses current catalog base rates, not historical billed prices.', 'Excludes cache-write charges, long-context tiers, tools, evaluation, sandbox, assets, tax and human work.', 'No-cache case holds the recorded workload fixed; no claim the model would behave identically.', 'Not an average for successful or production-ready Roblox games.'], rows: repriced } };
fs.writeFileSync(output + '/analysis.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify({ runs, byRole, firstBlocked, repriced }, null, 2));
