import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {cases,manifestHash,requestFor,summarize,reservationNanoUsd,ceilingNanoUsd} from './jev-asset-pilot.mjs';
const directory=path.resolve('research/results/jev-asset-pilot-v1');
const read=name=>JSON.parse(fs.readFileSync(path.join(directory,name),'utf8'));
const protocol=read('protocol.json'),ledger=read('ledger.json'),fixtures=read('fixtures.json');
assert.equal(protocol.manifestHash,manifestHash);assert.deepEqual(fixtures,cases);
assert.equal(ledger.records.length,16);
let total=0;
for(const [index,r] of ledger.records.entries()){
  const fixture=cases[Math.floor(index/2)],reversed=!!(index%2);
  assert.equal(r.caseId,fixture.id);assert.equal(r.reversed,reversed);assert.equal(r.expected,fixture.expected);
  assert.equal(r.requestHash,createHash('sha256').update(JSON.stringify(requestFor(fixture,reversed))).digest('hex'));
  assert.equal(r.status,'ok');assert.equal(r.httpStatus,200);
  assert.ok(total+reservationNanoUsd<=ceilingNanoUsd);
  assert.equal(r.reservedNanoUsd,reservationNanoUsd);
  assert.ok(Number.isFinite(r.providerCostUsd)&&r.providerCostUsd>=0);
  assert.ok(Math.abs(r.providerCostUsd-r.inputTokens*.000000042)<1e-12);
  assert.ok(Number.isFinite(Date.parse(r.startedAt)));assert.ok(r.elapsedMs>=0);
  total+=r.providerCostNanoUsd;
}
assert.deepEqual(ledger.summary,summarize(ledger.records));
assert.equal(ledger.summary.unreconciledReservationNanoUsd,0);
console.log(JSON.stringify({passed:true,calls:16,requestHashesVerified:16,billingReceiptsVerified:16,manifestHash,providerReportedUsd:ledger.summary.providerReportedUsd}));
