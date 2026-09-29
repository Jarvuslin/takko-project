import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { conceptSchema } from '../../src/generation/concept';
import { reservation, ceilingMicros } from './concept-live-guard.mjs';
const dir = path.resolve('research/results/concept-live-v2');
const previous = path.resolve('research/results/concept-live-v1');
const read = (name: string) => JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
for (const [name, expected] of Object.entries(read('prior-evidence-hashes.json')))
  assert.equal(hash(fs.readFileSync(path.join(previous,name),'utf8')), expected);
const ledger = read('ledger.json'), prior = read('prior-ledger.json');
assert.equal(ledger.length, 1);
const row = ledger[0], request = read('clarify-request.json'), response = read('clarify-response.json');
assert.equal(row.stage, 'clarify');
assert.equal(row.status, 'reconciled');
assert.equal(hash(JSON.stringify(request)), row.requestHash);
assert.equal(reservation(request), row.reservedMicros);
assert.equal(response.provider, 'Anthropic');
assert.equal(response.id, row.receipt.id);
assert.equal(response.usage.cost, row.receipt.costUsd);
assert.equal(response.usage.prompt_tokens, row.receipt.inputTokens);
assert.equal(response.usage.completion_tokens, row.receipt.outputTokens);
assert.ok(Math.abs(row.receipt.costUsd - (row.receipt.inputTokens + row.receipt.outputTokens * 5) / 1e6) < 1e-9);
const cumulativeReserved = [...prior,...ledger].reduce((s: number,r: any) => s+r.reservedMicros,0);
assert.ok(cumulativeReserved <= ceilingMicros);
const total = [...prior,...ledger].reduce((s: number,r: any) => s+r.receipt.costUsd,0);
const text = response.choices[0].message.content;
const proposal = JSON.parse(text.slice(text.indexOf('{'),text.lastIndexOf('}')+1));
assert.deepEqual(proposal, JSON.parse(fs.readFileSync('tests/fixtures/concept-live-five-steps.json','utf8')));
assert.equal(proposal.firstPlaytest.steps.length, 5);
assert.equal(conceptSchema.safeParse(proposal).success, true);
const advertised = JSON.parse(request.messages[0].content.split('OUTPUT SCHEMA: ')[1]);
assert.equal(advertised.properties.firstPlaytest.properties.steps.maxItems, 4);
assert.equal(read('clarify-validation.json').valid, false);
assert.deepEqual(read('clarify-validation.json').issues.map((i: any) => i.path), [['firstPlaytest','steps']]);
const initial = read('initial-project.json'), failed = read('clarify-project.json');
assert.equal(failed.stage, 'failed');
assert.equal(failed.spec, null);
assert.equal(failed.artifact, null);
assert.equal(failed.generation.id, initial.generation.id);
assert.equal(failed.charges.length, 3);
assert.equal(failed.charges[2].billingSource, 'reservation');
assert.equal(failed.charges[2].chargedMicros, 18604);
assert.equal(fs.existsSync(path.join(dir,'stopped.json')), true);
for (const stage of ['plan','clear']) assert.equal(fs.existsSync(path.join(dir,stage+'.attempted.lock')), false);
const before = read('key-before.json'), after = read('key-after.json');
const deduction = before.remaining - after.remaining;
const settled = Math.abs(deduction-row.receipt.costUsd) < 1e-9;
const files = (folder: string): string[] => fs.readdirSync(folder,{withFileTypes:true}).flatMap(e => e.isDirectory() ? files(path.join(folder,e.name)) : [path.join(folder,e.name)]);
assert.equal(files(dir).filter(file => /sk-or-v1-[a-z0-9]{30,}/i.test(fs.readFileSync(file,'utf8'))).length, 0);
const audit = {
  at:new Date().toISOString(), outcome:'Failed at clarification. Plan and clear not attempted.',
  newPaidCalls:1, actualCostUsd:row.receipt.costUsd, reservationUsd:row.reservedMicros/1e6,
  cumulativePaidCalls:prior.length+ledger.length, cumulativeActualUsd:total,
  cumulativeReservationsUsd:cumulativeReserved/1e6, originalCeilingUsd:ceilingMicros/1e6,
  receiptVerified:true, requestHashVerified:true, originalEvidenceUnchanged:true,
  keyBefore:before,keyAfter:after,settledDeductionUsd:deduction,deductionMatchesReceipts:settled,
  localBlockedCorrectionReservationUsd:.018604,
  offlineReplay:'Exact five-step response accepted after bound change. This does not establish novice usability or a live pass.',
  secretPatternScanMatches:0,
};
fs.writeFileSync(path.join(dir,'audit.json'),JSON.stringify(audit,null,2));
console.log(JSON.stringify(audit));
