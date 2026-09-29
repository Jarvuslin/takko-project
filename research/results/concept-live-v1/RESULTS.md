# Live concept trial

Model: anthropic/claude-haiku-4.5. Hard ceiling $0.15 across four stages. No paid retries.

Calls dispatched: 2. Provider-reported total: $0.008137000. Unreconciled reservation: $0.000000.

Before: $1.5286182240000006 at 2026-09-20T19:44:53.314Z. Latest after: $1.5204812239999992 at 2026-09-20T19:49:57.644Z.

- initial: reservation $0.014403, actual $0.003942000, reconciled, 2026-09-20T19:45:24.463Z.
- clarify: reservation $0.015600, actual $0.004195000, reconciled, 2026-09-20T19:46:39.021Z.

See stage project snapshots for contract outcomes and the final report for semantic review. This is not a Studio/gameplay test.

## Final trial outcome

Failed at clarification. The live response contained descriptions of 522 and 531 characters, exceeding the then-current 500-character schema limit. The attempted correction was blocked before provider dispatch. Plan and clear-request stages were not attempted. Both original paid responses and the failed project remain preserved. No paid retry occurred.

The application ledger includes an additional $0.018534 conservative reservation for the blocked correction, totaling $0.026671. Actual external cost is only $0.008137. The settled allowance deduction matches both paid receipts. See audit.json for reconciliation, including the distinction between blocked local attempts and paid network requests.

The two description fields now have a 1,000-character hard bound and a softer brevity target. The exact saved response passes an offline replay without truncation or a correction call. Prompt quality changes remain untested live. This does not overwrite or upgrade the failed trial outcome.
