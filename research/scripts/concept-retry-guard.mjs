import { authorizeDispatch, ceilingMicros } from './concept-live-guard.mjs';

export const stages = ['clarify', 'plan', 'clear'];
export function authorizeContinuation(stage, body, ledger, prior) {
  if (!stages.includes(stage)) throw Error('Stage not authorized for continuation');
  if (prior.length !== 2 || prior.some(row => row.status !== 'reconciled'))
    throw Error('Prior trial is incomplete or unreconciled');
  if (ledger.length >= stages.length) throw Error('Continuation call ceiling reached');
  const reserved = authorizeDispatch(stage, body, ledger);
  const cumulative = [...prior, ...ledger].reduce((sum, row) => sum + row.reservedMicros, 0);
  if (cumulative + reserved > ceilingMicros) throw Error('Original cumulative ceiling exceeded');
  return reserved;
}
