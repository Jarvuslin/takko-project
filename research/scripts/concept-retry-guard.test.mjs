import { test } from 'node:test';
import assert from 'node:assert/strict';
import { model } from './concept-live-guard.mjs';
import { authorizeContinuation } from './concept-retry-guard.mjs';
const body = {model, max_tokens:2000, messages:[{content:'System'}, {content:'Idea'}]};
const prior = [{stage:'initial', reservedMicros:14403, status:'reconciled'}, {stage:'clarify', reservedMicros:15600, status:'reconciled'}];
test('explicit continuation permits one clarification retry while retaining prior reservations', () => {
  assert.equal(authorizeContinuation('clarify', body, [], prior), 11034);
  assert.throws(() => authorizeContinuation('initial', body, [], prior), /not authorized/);
});
test('a fresh directory does not reset the original ceiling', () => {
  assert.throws(() => authorizeContinuation('clear', body, [{stage:'plan',reservedMicros:110000,status:'reconciled'}], prior), /Original cumulative/);
});
test('blocks another attempt and unreconciled historical or current charges', () => {
  assert.throws(() => authorizeContinuation('clarify', body, [{stage:'clarify',reservedMicros:15000,status:'reconciled'}], prior), /retry/);
  assert.throws(() => authorizeContinuation('plan', body, [{stage:'clarify',reservedMicros:15000,status:'dispatched'}], prior), /unreconciled/);
  assert.throws(() => authorizeContinuation('clarify', body, [], [prior[0], {...prior[1],status:'dispatched'}]), /unreconciled/);
});
