# Conditional paid probes

Status: not run. G4 did not meet its preregistered coverage and playback gates. The approved stop condition applies. No provider request, balance request or credential-vault access occurred. No retry or replacement asset was used to bypass the gate.

Recorded 2026-09-30T22:54:57.838Z. Actual spend for this task is $0.00.

| Probe | Authorized cap | Calls | Spend | Result |
| --- | --- | --- | --- | --- |
| P-Review | $1.25 | 0 | $0.00 | Withheld by G4 gate |
| P-Build | $1.75 | 0 | $0.00 | Withheld by G4 gate |

No request was constructed for dispatch, so request bytes, reservations, token usage, finish reason, parsed review, generated-code tests and actual per-call cost are not applicable. There are no outstanding reservations or unreconciled calls, and no money moved between caps.

Last known actual key balance remains the historical 2026-09-30T04:51:05.474Z observation: $12.61069673 remaining, $17.38930327 usage, $30 limit. This is not a current balance measurement. The required read-only refresh would occur only if a paid probe became eligible.

G4 used 32 fixed draws and retained 28 distinct selections. There were 27 completed structural comparisons, with zero structural false passes, zero false blocks and four assigned-role/content mismatches, all withheld. Only five assets supplied readable clip data, all R15, with no usable attack timing proposal. Required labeled, R6, single/multi-action and three native playback coverage was absent. Details and fixes are in ../generalization/RESULTS.md.

Recommendation: no-go for the full trial. No real P-Review or P-Build token measurements exist, so no measured whole-build projection is possible and $7.50 is not validated. A future trial should use a seeded passing pair from a fresh preregistered holdout after the documented producer gaps are fixed. Do not substitute the old dummy/punch pair to manufacture a pass. No full trial, installation, app restart, publication or paid retry was performed.
