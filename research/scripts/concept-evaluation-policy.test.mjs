import {test} from 'node:test';
import assert from 'node:assert/strict';
import {authorizeEvaluation, authorizeAvailableReservation} from './concept-evaluation-policy.mjs';
const prior = [{stage:'initial',status:'reconciled',reservedMicros:14403},{stage:'clarify',status:'reconciled',reservedMicros:15600},{stage:'clarify',status:'reconciled',reservedMicros:16310}];
test('retains every previous paid reservation even across failed trials',()=>{
  assert.equal(authorizeEvaluation('initial',18439,[],prior,150000),18439);
  assert.throws(()=>authorizeEvaluation('plan',103688,[],prior,150000),/ceiling/);
});
test('uses only the explicit authorized ceiling',()=>{
  assert.throws(()=>authorizeEvaluation('plan',110000,[],prior,150000),/ceiling/);
  assert.equal(authorizeEvaluation('plan',110000,[],prior,200000),110000);
});
test('blocks repeat attempts and unknown charges',()=>{
  assert.throws(()=>authorizeEvaluation('initial',1000,[{stage:'initial',status:'reconciled',reservedMicros:1000}],prior,150000),/repeat/);
  assert.throws(()=>authorizeEvaluation('plan',1000,[{stage:'initial',status:'dispatched',reservedMicros:1000}],prior,150000),/Unreconciled/);
});
test('rejects unbounded stages and invalid amounts',()=>{
  for (const amount of [0,-1,NaN,Infinity,1.5]) assert.throws(()=>authorizeEvaluation('initial',amount,[],prior,150000));
  assert.throws(()=>authorizeEvaluation('build',1000,[],prior,150000));
});
test('a spending ceiling is not a required prepaid balance',()=>{
  const reserved = authorizeEvaluation('initial',18439,[],prior,5000000);
  assert.equal(authorizeAvailableReservation(reserved,1.5),18439);
  assert.throws(()=>authorizeAvailableReservation(reserved,.018),/allowance/);
  for (const remaining of [NaN,Infinity,-1]) assert.throws(()=>authorizeAvailableReservation(reserved,remaining));
});
