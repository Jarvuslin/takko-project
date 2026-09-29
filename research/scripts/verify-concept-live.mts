import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { conceptSchema } from '../../src/generation/concept';
import { reservation, ceilingMicros } from './concept-live-guard.mjs';
const dir = path.resolve('research/results/concept-live-v1');
const read = (name: string) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
const ledger = read('ledger.json');
assert.equal(ledger.length, 2);
assert.deepEqual(ledger.map((row: any) => row.stage), ['initial', 'clarify']);
let total = 0, reserved = 0;
for (const row of ledger) {
  assert.equal(row.status, 'reconciled');
  const request = read(row.stage + '-request.json');
  const response = read(row.stage + '-response.json');
  assert.equal(createHash('sha256').update(JSON.stringify(request)).digest('hex'), row.requestHash);
  assert.equal(reservation(request), row.reservedMicros);
  assert.equal(response.id, row.receipt.id);
  assert.equal(response.usage.cost, row.receipt.costUsd);
  assert.equal(response.usage.prompt_tokens, row.receipt.inputTokens);
  assert.equal(response.usage.completion_tokens, row.receipt.outputTokens);
  assert.equal(response.provider, 'Anthropic');
  assert.ok(Math.abs(response.usage.cost - (row.receipt.inputTokens + row.receipt.outputTokens * 5) / 1e6) < 1e-9);
  total += row.receipt.costUsd; reserved += row.reservedMicros;
}
assert.ok(reserved <= ceilingMicros);
const initial = read('initial-project.json'), failed = read('clarify-project.json');
assert.equal(initial.spec, null); assert.equal(initial.stage, 'clarification');
assert.equal(failed.stage, 'failed'); assert.equal(failed.spec, null);
assert.equal(failed.generation.id, initial.generation.id);
assert.equal(failed.generation.chargeStart, 0);
assert.equal(failed.charges.length, 3);
assert.equal(failed.charges[2].billingSource, 'reservation');
assert.equal(failed.charges[2].chargedMicros, 18534);
assert.equal(read('clarify-validation.json').valid, false);
const response = read('clarify-response.json').choices[0].message.content;
const proposal = JSON.parse(response.slice(response.indexOf('{'), response.lastIndexOf('}') + 1));
assert.equal(conceptSchema.safeParse(proposal).success, true);
assert.deepEqual(proposal, JSON.parse(fs.readFileSync('tests/fixtures/concept-live-overlong.json', 'utf8')));
const before = read('key-before.json'), after = read('key-after.json');
const difference = before.remaining - after.remaining;
assert.ok(Math.abs(difference - total) < 1e-9);
assert.equal(fs.existsSync(path.join(dir, 'plan.attempted.lock')), false);
assert.equal(fs.existsSync(path.join(dir, 'clear.attempted.lock')), false);
const scan = (folder: string): string[] => fs.readdirSync(folder, {withFileTypes:true}).flatMap(entry => entry.isDirectory() ? scan(path.join(folder,entry.name)) : [path.join(folder,entry.name)]);
assert.equal(scan(dir).filter(file => /sk-or-v1-[a-z0-9]{30,}/i.test(fs.readFileSync(file,'utf8'))).length, 0);
const audit = {
  at: new Date().toISOString(), paidCalls: ledger.length, actualCostUsd: total,
  conservativeReservationsUsd: reserved / 1e6, keyBefore: before, keyAfter: after,
  settledDeductionUsd: difference, deductionMatchesReceipts: true,
  blockedRetryReservationUsd: .018534,
  applicationLedgerTotalUsd: failed.charges.reduce((sum: number, row: any) => sum + row.chargedMicros, 0) / 1e6,
  caveat: 'The application conservatively recorded an unknown-usage reservation for a correction blocked by the test guard before network dispatch. It is not a third provider charge.',
  unchangedTrialOutcome: 'Failed at clarify. Plan and clear case not attempted.',
  offlineReplay: 'Exact paid clarification accepted by the revised schema, full text retained. No inference.',
  rawRequestHashesVerified: true, receiptsVerified: true, secretPatternScanMatches: 0,
};
fs.writeFileSync(path.join(dir, 'audit.json'), JSON.stringify(audit,null,2));
console.log(JSON.stringify(audit));

