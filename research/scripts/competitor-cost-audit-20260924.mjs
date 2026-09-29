// Read-only accounting analysis. Never dispatches inference or changes project state.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const resultDir = path.join(root, 'research/results/competitor-cost-20260924');
await fs.mkdir(resultDir, { recursive: true });
const read = async (name) => JSON.parse(await fs.readFile(path.join(root, name), 'utf8'));
const ledger = await read('docs/results/conversation-fighting-benchmark-20260924/ledger.json');
const project = await read('docs/results/conversation-fighting-benchmark-20260924/final-project.json');
const sum = (items, field) => items.reduce((total, item) => total + (item[field] ?? 0), 0);
const sonnet = ledger.charges.filter((c) => c.model === 'anthropic/claude-sonnet-5');
const jev = ledger.charges.filter((c) => c.model === 'typesafe/jev-1.13');
const planning = sonnet.slice(-5);
const price = (input, output, inputRate, outputRate) => (input * inputRate + output * outputRate) / 1e6;
const group = (rows) => ({ calls: rows.length, inputTokens: sum(rows, 'inputTokens'), outputTokens: sum(rows, 'outputTokens'), chargedUSD: sum(rows, 'chargedMicros') / 1e6 });
let assertions = 0;
const check = (fn) => { fn(); assertions++; };
check(() => assert.equal(sum(ledger.charges, 'chargedMicros'), ledger.newAccountedMicros));
check(() => assert.equal(ledger.priorAccountedMicros + ledger.newAccountedMicros, ledger.totalAccountedMicros));
check(() => assert.equal(ledger.totalAccountedMicros + ledger.remainingCapMicros, 4400000));
check(() => assert.equal(sonnet.length + jev.length, ledger.charges.length));
check(() => assert.equal(sonnet.length, 8));
check(() => assert.equal(planning.length, 5));
check(() => assert.equal(project.spec, null));
check(() => assert.equal(project.artifact, null));
const areas = Object.values(project.coordination.areas);
check(() => assert.equal(areas.length, 4));
check(() => assert.equal(areas.flatMap((a) => a.requirements).length, 26));
check(() => assert.equal(areas.flatMap((a) => a.tasks).length, 8));
check(() => assert.equal(sonnet.filter((c) => c.cachedInputTokens === 0).length, 8));
const planningInputUSD = price(sum(planning, 'inputTokens'), 0, 2, 10);
const planningOutputUSD = price(0, sum(planning, 'outputTokens'), 2, 10);
check(() => assert.ok(Math.abs(planningInputUSD + planningOutputUSD - sum(planning, 'chargedMicros') / 1e6) < 0.00001));
// This is rate-only arithmetic with IDENTICAL token counts. It predicts no model behavior.
const repricing = {
  originalSonnetUSD: group(sonnet).chargedUSD,
  allEightSonnetCallsAtLunaRatesUSD: price(sum(sonnet, 'inputTokens'), sum(sonnet, 'outputTokens'), .2, 1.2),
  jevUnchangedUSD: group(jev).chargedUSD,
  caveat: 'Hypothetical repricing of already observed proposal/planning tokens only. Not a completed game, benchmark, route recommendation or promise of equal quality.'
};
// Design-envelope example, not a forecast. Every assumption is explicit.
const envelope = [
  { stage: 'proposal and bounded decisions', calls: 1, input: 6000, output: 1500, inputRate: .2, outputRate: 1.2 },
  { stage: 'compact system contracts', calls: 2, input: 12000, output: 2500, inputRate: 2, outputRate: 10 },
  { stage: 'bounded coding / component integration', calls: 6, input: 12000, output: 2500, inputRate: .2, outputRate: 1.2 },
  { stage: 'system-group independent review', calls: 6, input: 18000, output: 2000, inputRate: 2, outputRate: 10 },
  { stage: 'cross-system review', calls: 1, input: 24000, output: 2500, inputRate: 2, outputRate: 10 },
  { stage: 'difficult repair escalations', calls: 2, input: 20000, output: 4000, inputRate: 2, outputRate: 10 },
  { stage: 'affected-system rereviews', calls: 3, input: 18000, output: 2000, inputRate: 2, outputRate: 10 },
].map((row) => ({ ...row, usd: row.calls * price(row.input, row.output, row.inputRate, row.outputRate) }));
check(() => assert.equal(price(30000, 10000, 2, 10), .16));
check(() => assert.ok(Math.abs(price(30000, 10000, .2, 1.2) - .018) < 1e-10));
check(() => assert.equal(36 - 7, 29));
const sourceFiles = ['src/generation/coordinator.ts', 'src/generation/engine.ts', 'src/generation/providers.ts', 'src/generation/game-context.ts'];
const sourceHashes = await Promise.all(sourceFiles.map(async (file) => ({ file, sha256: createHash('sha256').update(await fs.readFile(path.join(root, file))).digest('hex') })));
const result = {
  at: new Date().toISOString(), assertions,
  kind: 'offline receipt audit and hypothetical arithmetic only',
  newInferenceCalls: 0, newInferenceUSD: 0,
  observed: { all: group(ledger.charges), sonnet: group(sonnet), jev: group(jev), implementationPlanning: { ...group(planning), inputUSD: planningInputUSD, outputUSD: planningOutputUSD, outputFraction: planningOutputUSD / (planningInputUSD + planningOutputUSD) }, completedAreaPlans: areas.length, requirements: 26, buildTasks: 8, sonnetExplicitZeroCacheReceipts: 8 },
  repricing,
  illustrativeEnvelope: { stages: envelope, totalUSD: sum(envelope, 'usd'), targetAllowanceUSD: [1, 3], caveat: 'Engineering target only. Unmeasured task sizes and model quality. Excludes additional asset/media-model calls, additional repairs, purchased assets, hosting, tax, component-library engineering and human work. All billed output including reasoning must fit assumed output. No caching discount assumed. Reserve admission headroom separately. This does not replace the previous current-pipeline estimate.' },
  reviewCallExample: { requirements: 36, systemGroups: 6, integrationReview: 1, currentCalls: 36, proposedCalls: 7, fewerCalls: 29, caveat: 'Call reduction, not total-cost savings. Combined reviews may need more tokens. All requirements still need meaningful coverage.' },
  sourceHashes,
};
await fs.writeFile(path.join(resultDir, 'analysis.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
