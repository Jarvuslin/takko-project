# Model probes

Current result: full trial remains no-go. Newly authorized probes 2 completed review parsing and produced four compiling model files. Contract tests passed 18/20, with a confirmed server grace-policy mismatch and one pending-state interface mismatch. The native mouse-input request failed, so gameplay is unverified. New spend $0.4829327, reconciled remaining balance $12.01960953. Earlier failed attempts remain below. Asset generality is separate.

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

## Final paid-call reconciliation

Read-only balance at 2026-10-01T01:49:39.779Z: $12.50254223 remaining, $17.49745777 usage, $30 limit. The decrease from the pre-probe balance is exactly $0.1081545, matching both P-Build receipts. The earlier balance observation above was delayed and is preserved as history. There is no remaining mismatch for the two billed build calls. Record: reconciled-final-balance.json.

P-Review's observed billed delta remains $0, with no authoritative per-call receipt. Its conservative $0.749202 liability remains separately recorded, not added to measured spend or transferred to the other probe. Both authorized attempts are consumed. No retry, further inference or full trial was run. P-Build totals 15262 input tokens, 8221 output tokens including 8192 reasoning tokens, and no source submission. No completed review or functioning model-written combo was measured. The model-code verdict and full-trial decision remain no-go, independently of the asset sweep.

## Newly authorized probes 2, 2026-10-01

These are two explicitly authorized new attempts with separate p-review-2 and p-build-2 evidence, not retries of the original attempts. Caps remain $1.25 and $1.75, nontransferable. No full trial. Production policy commit d2ac499 uses 32768 output tokens at medium effort for OpenCode coding calls while preserving an explicit profile effort. The installed app was not updated or restarted.

### Canonical data check

The reported ENOENT is not reproducible in this session. The live service PID 14992 still uses --user-data-dir=C:/Users/7474g/AppData/Roaming/Forge Desktop. The main PID is 28600. The expected projects/configuration/models.json exists, reads successfully, contains five profiles and has last-write time 2026-09-30T04:51:05.441681Z. Eight project JSON files parse. The provider-keys.dpapi file exists, is 456 bytes and has last-write time 2026-09-30T04:14:46.1449347Z. It subsequently decrypted successfully through the existing in-memory DPAPI path. No evidence of relocation or current loss was found. The reason for the earlier ENOENT remains unknown, not attributed to a deletion or migration. No canonical file was moved, restored, copied or written, and neither script needed a path change. The empty p-review-2 folder had no dispatch marker and was reused as authorized.

### P-Review 2

One call at 2026-10-01T03:18:19.900Z, exact Release A direct projection, 227223 request bytes, $0.749202 reserved, $0.500798 unreserved cap. Model anthropic/claude-sonnet-5.5, 32768 output allowance, medium effort. HTTP 200, finish reason stop, parsed=true and hostValid=true. All 10 returned test sources compiled. Their assertions were not executed against a game. Usage: 91627 input, 4596 output, 0 reported reasoning tokens. Provider cost $0.229214, below reservation and cap. No retry or fallback. This establishes completion and host parsing of the historical golden review, not judgement of a new game.

### P-Build 2, model code quality on the original diagnostic pair

One OpenCode session used R6 pack 15008746676, infinity punches, its accepted 13-segment table and straw target 10161087974. result.json and the requests confirm 32768 output tokens and medium effort. Three calls: task_context, one submit_task, then a terminal response. No tool-envelope errors, repair, fallback, resubmission or model-code modification.

| Call UTC | Bytes | Reservation | Input | Output | Reasoning | Finish | Provider cost |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: |
| 03:19:39.084Z | 11020 | $0.351768 | 5412 | 29 | 0 | tool_calls | $0.0137545 |
| 03:19:41.468Z | 23222 | $0.376172 | 9852 | 19182 | 8394 | tool_calls | $0.2043027 |
| 03:21:43.882Z | 57019 | $0.443766 | 20699 | 657 | 0 | stop | $0.0356615 |

Build totals: 35963 input, 19868 output including 8394 reasoning tokens, actual $0.2537187. Host integer-micro accounting is $0.253720. No live reservation remains. Four files were submitted: ComboConfig and Combo modules, ComboServer and ComboClient. All four compile checks and all four AST protected-source-write checks passed. AST checks are bounded checks, not a full security or gameplay proof.

The existing native-table contract tests ran against the model's unchanged Combo body. The only interface shim converts Combo.hit's numeric count to a boolean. No timing or state behavior was patched. Original result: 18 passed, 2 failed out of 20:

| Contract | Result |
| --- | --- |
| Cross native segment 1–13 hit exactly once and clamp skipped frames, one test per segment | 13 passed, including segment 5 |
| One click then silence, no later hit, reset after hold grace | Passed |
| Rapid input buffers at most one segment, all 13 need fresh edges | Passed |
| Reject stale nonce, replay, wrong order and excessive early arrival | Passed |
| Server owns hit timing, range, facing, line of sight, scope and one hit per target | Failed: test reads pending.hitAt after the model has consumed and cleared pending |
| Timeout, death and respawn invalidate pending hits and old requests | Failed at the 0.351-second timeout assertion, later assertions in that test were not reached |
| Early next request cannot erase the preceding scheduled hit | Passed |
| Segment 13 completion rotates nonce before a fresh combo | Passed |

A separate diagnostic kept the model unchanged and saved hitAt before consumption. Early-hit rejection and duplicate-hit rejection passed, counter=1. This narrows the first failure to the test's pending-state interface assumption, rather than claiming a demonstrated duplicate-hit defect. It does not erase the original failure. The second diagnostic confirmed a real policy mismatch: the model accepts segment 2 at endAt+0.351 with the old nonce because it adds lateSlack=0.15 to the required grace=0.35. No fix or paid retry was attempted.

### Native attempt and cleanup

One Play session in TrialReviewInspection at 03:25:02Z. The harness installed all four sources unchanged, the actual 166-frame infinity punches sequence, the straw target, a temporary floor/spawn and an R6 StarterCharacter. The player was healthy, anchored in front of the target, and client/server nonce was 2. No asset scripts were run. These setup observations do not establish attack playback.

The first user_mouse_input request failed through the Studio bridge with “Studio could not complete this asset request. Check its connection and Edit mode.” The failure occurred while requesting one click and silence. No completed observation timeline was returned. Holds/resumes at all 13 boundaries, the segment 5 gap, continuous clicks, native grace reset and exactly one native hit per segment are unverified. This is an input/bridge failure, not evidence that those model behaviors passed or failed. No second Play session or replacement input path was used.

Cleanup completed at 2026-10-01T03:25:11.505Z: Edit mode, zero scripts, zero Forge/Takko scopes, two original Workspace children. All four model scripts, imported assets, temporary floor/spawn and the owned StarterCharacter were removed. Original scripts were unchanged, SDK client closed, no test service remained. No save-over, publication, installation or live-app restart.

### Reconciliation and model verdict

Before probes at 03:18:19.684Z: $12.50254223 remaining, $17.49745777 usage, $30 limit. Final read-only refresh at 2026-10-01T03:26:03.531Z: $12.01960953 remaining, $17.98039047 usage. Delta $0.4829327 exactly equals review $0.229214 plus build $0.2537187. Intermediate delayed balances are preserved. These new calls all have authoritative receipts. The original review's separate $0.749202 conservative liability is unchanged. Both new attempts are consumed, no budget transfer or additional paid work is authorized.

Model-code verdict: progress, but no-go for a full trial. Review completion/parsing succeeded. The builder now submits code, but a server grace-policy defect remains, one contract interface mismatch needs resolution, and native input/playback was not verified. A scoped combo is not a working full game. No asset-generality conclusion follows from this known pair.

Cost projection from measured tokens: one three-call scoped build cost $0.2537187 with caching. Assuming 10, 20 or 30 equally sized successful build sessions plus one review costing the measured $0.229214 gives $2.766401, $5.303588 or $7.840775. At configured uncached $2/M input and $10/M output, the observed 35963 input and 19868 output per session cost $0.270606. Twenty such sessions plus the measured review cost $5.641334, leaving $1.858666 of $7.50 for acquisition, planning, repairs and overhead. These are explicit scenarios, not measured full-game task counts. A larger final review/context or repairs can exceed them. $7.50 is plausible for a tightly bounded workload, not validated as a reliable full-build budget. Stop here, no full trial.

Final product regression check passed once, exit 0, with no worker crash or rerun: build/typecheck, 1889 unit tests in 149 files, 6 Luau scenarios, 16 plugin scenarios plus plugin/8 source compilations, 6 guard cases, CSS 0 errors/274 warnings, 21 desktop tests, production smoke, 108 browser tests and 10 Electron journeys. Log: test-artifacts/probes-2-full-check.log. The separate model contract result remains 18/20 and the native input failure remains unverified, not overwritten by this regression pass. Main/service/Studio PIDs 28600/14992/33952 remained alive at final reporting.
