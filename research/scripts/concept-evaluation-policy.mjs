export const model = 'anthropic/claude-haiku-4.5';
export const stages = ['initial', 'clarify', 'plan', 'clear'];
export function authorizeAvailableReservation(reservedMicros, remainingUsd) {
  if (!Number.isSafeInteger(reservedMicros) || reservedMicros <= 0 ||
      !Number.isFinite(remainingUsd) || remainingUsd < 0 || reservedMicros > Math.floor(remainingUsd * 1e6))
    throw Error('Insufficient available key allowance for this request');
  return reservedMicros;
}
export function authorizeEvaluation(stage, reservedMicros, ledger, prior, ceilingMicros) {
  if (!stages.includes(stage)) throw Error('Unknown evaluation stage');
  if (!Number.isSafeInteger(reservedMicros) || reservedMicros <= 0) throw Error('Invalid reservation');
  if (!Number.isSafeInteger(ceilingMicros) || ceilingMicros <= 0) throw Error('Invalid ceiling');
  if (ledger.some(row => row.stage === stage) || ledger.length >= 4) throw Error('No repeat dispatch permitted');
  if ([...prior,...ledger].some(row => row.status !== 'reconciled')) throw Error('Unreconciled prior dispatch');
  if ([...prior,...ledger].reduce((sum,row)=>sum+row.reservedMicros,0)+reservedMicros > ceilingMicros)
    throw Error('Combined conservative reservation ceiling exceeded');
  return reservedMicros;
}
