# Live concept trial

Model: anthropic/claude-haiku-4.5. Authorized continuation with clarify, plan and clear stages. Original hard ceiling $0.15 includes v1. Prior actual $0.008137 and reservations $0.030003. One dispatch per new stage, stop on failure.

Calls dispatched: 1. Provider-reported total: $0.003830000. Unreconciled reservation: $0.000000.

Before: $1.5204812239999992 at 2026-09-20T20:43:23.736Z. Latest after: $1.5166512240000003 at 2026-09-20T20:46:57.154Z.

- clarify: reservation $0.016310, actual $0.003830000, reconciled, 2026-09-20T20:43:32.010Z.

See stage project snapshots for contract outcomes and the final report for semantic review. This is not a Studio/gameplay test.

Final outcome: failed at clarification because firstPlaytest.steps had five entries against the advertised maximum of four. Plan and clear stages were not attempted. The provider returned HTTP 200. A correction was blocked locally before dispatch, so the application ledger's additional $0.018604 reservation is not an external charge.

Both trials together dispatched three calls, actual $0.011967, cumulative conservative outbound reservations $0.046313 under the original $0.15 ceiling. The original trial evidence is hash-verified unchanged. Settled allowance $1.516651224 at 2026-09-20T20:46:57.154Z matches the latest receipt deduction. Earlier unchanged balance readings remain preserved.

The saved response passes offline after the step hard bound was raised to eight with a two-to-four-step target. It still has unresolved camera alternatives and manual object placement in its playtest guidance. A later prompt clarification is not live-validated. See docs/game-concept-live-retry.md for tests and limits. Keep stopped.json and attempted.lock. No further paid retry is authorized by this completed attempt.

Post-fix full npm run check exit 0: 1,313 unit/API tests in 79 files, six offline combat scenarios, 14 plugin mock groups and source compilation, six guard fixtures, TypeScript/Vite, 10 desktop tests, production smoke and 82 browser tests. No skipped stage or suite retry. Also nine guard tests, 12 focused concept tests and independent receipt/hash/balance audit passed. These are offline checks, not a live concept-to-plan or Studio pass.
