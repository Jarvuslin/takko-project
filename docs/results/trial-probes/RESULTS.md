# Model probes

Current result: no-go for the full trial. The newly authorized P-Review was rejected by provider admission. P-Build exhausted its 8192-token response on reasoning and submitted no code. Actual P-Build receipts total $0.1081545. P-Review has no billing receipt and retains $0.749202 conservative liability. Details and the original withheld run are preserved below. Asset generality is reported separately.

## Historical G4 gate

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

## Step 3: authorized independent P-Review, 2026-10-01

The renewed instruction removed the old G4 prerequisite. Step 2 passed one full check before this request. One real attempt was sent through Engine's final-review boundary with the exact Release A captured direct-path projection, checked for byte-for-byte JSON equality before dispatch. Model anthropic/claude-sonnet-5.5, 32768 output tokens, medium effort, no fallback or retry. Isolated workspace: .forge/trial-probes/p-review. The existing DPAPI code read the canonical key into memory only. No vault copy, plaintext key file or live-service dependency.

Result: provider admission failure, HTTP 429. OpenRouter reported it could not verify available credits in time, with limit_source openrouter_admission_control and provider_name null. No completion, finish reason or token usage exists. Parsing and host validation did not run. This does not measure review completion, judgement or token cost. The suggested retry was not taken.

At 2026-10-01T01:21:42.888Z, request size was 227223 bytes, reservation $0.749202 and unreserved probe cap $0.500798. Before balance at 01:21:42.676Z and after at 01:21:44.815Z both showed remaining $12.61069673, usage $17.38930327, limit $30. Observed billed delta is $0. No authoritative per-call billing receipt was returned. The host conservatively retains $0.749202 as estimated liability, not measured actual spend, with no live reservation. It is not transferred to P-Build. Records: p-review/result.json and p-review/response.json. Harness: scripts/trial-probe-review.ts.

The separate offline projection preflight sent no network requests and had no key. Its deliberately stopped transport produced a mock reservation liability only in .forge/trial-probes/p-review-offline. That is not a paid call or a retry of the real attempt.

## Step 4: model code-quality probe on known assets, not asset generality

One real OpenCode 1.18.31/host session used the configured Claude Sonnet 5.5 builder, production 8192 output-token setting, the exact trial-proposal evidence for R6 15008746676 infinity punches and straw target 10161087974, its accepted 13-segment table and G3 guidance. The prompt was scoped to input/playback, server authority and remotes, with a testable pure-module interface. No reference implementation was supplied or injected. The known pair was structurally validated, not claimed to have passed all 13 native segments.

The session failed without submitting any source. Call 1 read task_context successfully. Call 2 finished with length, all 8192 completion tokens reported as reasoning, zero content and no tool submission. OpenCode exited 0, but the host correctly rejected the incomplete session. No tool-envelope error or recovery occurred. No retry, fallback, cap transfer or hand-fixed code.

| Call UTC | Request bytes | Reservation | Input | Output | Reasoning | Provider cost |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 2026-10-01T01:22:44.360Z | 10987 | $0.105942 | 5411 | 29 | 0 | $0.013752 |
| 2026-10-01T01:22:46.614Z | 23189 | $0.130346 | 9851 | 8192 | 8192 | $0.0944025 |

Actual provider receipts total $0.1081545. Conservative integer-micro host accounting totals $0.108155. P-Build has $1.6418455 of its cap unspent, not permission to retry. No outstanding live reservation. The read-only key balance at 2026-10-01T01:24:38.057Z was $12.59694473 remaining, $17.40305527 usage, $30 limit. It reflects call 1 only so far, leaving $0.0944025 in provider-receipted spend not yet reflected by that balance endpoint. Do not call the delayed balance the true remaining spendable amount. P-Review additionally retains $0.749202 conservative liability despite an observed $0 billed delta.

Compile/AST: not run, no model source. Parameterized tests: zero executed, no interface submitted. This includes all 13 skipped-frame boundaries, click/silence/grace, bounded buffering, nonce/order, server hit authority/deduplication, death/respawn, early next-segment hit retention and final nonce rotation. Native holds/resumes, segment 5 gap, continuous clicks and one hit per segment: not run because there is no model code. Spending remains, but a reference implementation would not test this model output.

Native preflight only: freshly connected TrialReviewInspection.rbxlx, Studio id 216e6aaa-19c8-44d9-94f2-7341c2e69973, PID 33952, Edit with zero scripts/scopes and two Workspace children. No Play or insertion occurred, so there were no scripts/imports to restore or remove. SDK clients closed and no native test service was started.

Model-quality verdict: no-go. P-Review supplied no review measurement, and P-Build supplied no code-quality measurement. A useful full-build cost projection cannot be fitted from a context read followed by reasoning-only truncation. $7.50 does not solve the demonstrated per-call output bottleneck. Raising output limits or changing reasoning policy would need a separately authorized future probe and new conservative reservation calculations. No full trial was started.

Cost projection limit: this run measures a context read ($0.013752) and a reasoning-only truncation ($0.0944025), not a completed build task. With the observed second-call 9851 input tokens, an uncached 8192-output call at configured $2/M input and $10/M output is $0.101622. Increasing that output allowance to 32768 would make its full-output cost $0.347382. An illustrative 20 such larger calls would cost $6.94764. A review using the historical 77832-input envelope and full 32768 output would add $0.483344, totaling $7.430984 before acquisition, planning, repairs or other overhead. These call counts and full-output assumptions are scenarios, not measured workload estimates, and conservative byte reservations can refuse earlier. There is no defensible successful full-build projection from this failure. $7.50 is not validated and the full-trial verdict remains no-go.
