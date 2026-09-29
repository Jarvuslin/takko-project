# Jev asset-ranking pilot

2026-09-20. Jev selected the expected candidate on all 16 OpenRouter calls in this synthetic smoke test. Reported cost was $0.000638232. The result supports trying a separately labeled real-catalog evaluation. It does not establish production Marketplace ranking quality or game correctness.

## What ran

The user authorized a Jev asset-ranking pilot and then explicitly requested the existing OpenRouter key. Used the existing Windows-encrypted testing credential without printing it, writing plaintext credentials or restarting any app. No TypeSafe account or additional key was needed.

OpenRouter's general model-list response did not contain Jev during discovery, but the model-specific endpoint returned typesafe/jev-1.13 with text-to-decisions capability, a TypeSafe provider and $0.042/million input pricing. The official SDK source confirms the separate Decisions endpoint. Requests used POST https://openrouter.ai/api/alpha/decisions, requested typesafe/jev-1.13 and disabled provider fallback. Each returned model is retained in the ledger. [Model](https://openrouter.ai/typesafe/jev-1.13), [official API implementation](https://github.com/OpenRouterTeam/typescript-sdk/blob/1a09de8a9749c72450bade8a373ed2120a2865c0/src/funcs/alphaDecisionsCreate.ts), [response schema](https://github.com/OpenRouterTeam/typescript-sdk/blob/1a09de8a9749c72450bade8a373ed2120a2865c0/src/models/decisionsresponse.ts).

Eight assistant-authored scenarios each had three candidate descriptions and an explicit none option. Labels were frozen before inference and excluded from requests. Each scenario ran once in original order and once reversed. Each call asked one Choice question and three independent Score questions. There were no retries, prompt revisions after results, paid comparison models or production asset changes.

These are synthetic descriptions, not downloaded real assets. The labels were not independently created by a person. Reversed pairs are related observations, not 16 independent tasks.

## Results

| Scenario | Expected selection | Original / reversed |
| --- | --- | --- |
| Inventory shop UI versus a shop building | Item Store Interface | Both correct |
| Parkour respawn behavior versus decorative flags | Respawn Checkpoints | Both correct |
| Server-validated combat versus animations/client damage | Melee Service | Both correct |
| Rain audio versus visual effects | Gentle Rain Loop | Both correct |
| Driving controller when only static assets exist | None | Both correct |
| Explicit touch support when no candidate supplies it | None | Both correct |
| Description containing instructions to force its selection | Checkpoint Tracker | Both correct |
| Title claims a working door but description says scripts removed | Hinged Entrance | Both correct |

Top-choice accuracy: 16/16. None-fit decisions: 4/4. Both misleading-content scenarios passed in both orders. Choices remained the same in all 8 reversed pairs, although numeric scores changed. Mean reciprocal rank for the 12 positive selections was 1.0. A trivial first-candidate baseline got 3/16, but that baseline cannot abstain and is not Takko's production asset-selection algorithm.

Measured client request latency was 205 ms median and 295 ms p95, including reading and validating the response. With 16 requests, the nearest-rank p95 is the slowest sample. All choices reported confidence between 0.98 and 1.00. This easy, small set cannot validate confidence calibration, adversarial robustness or general accuracy.

## Cost and evidence

The ceiling was $0.05. Each call reserved $0.002688 using a conservative 64,000-token upper bound, twice the listed OpenRouter context length. All 16 reservations together would fit within $0.043008. Actual usage totaled 15,196 input tokens. All 16 responses reported their cost, which matched the published input rate. Output was free. No call has an unreconciled cost reservation.

The initial key allowance was $1.529256456 at 2026-09-20T17:58:26.166Z. The immediate post-run allowance was unchanged at 17:58:29.599Z despite the response cost receipts. That discrepancy is preserved. At 18:01:25.793Z the provider reported $1.528618224 remaining. Its deduction matches the sum of all 16 reported costs to floating-point precision. The later receipt is in key-later.json. The generated scripts and result artifacts were also checked for the actual credential without displaying it, and none contained it.

Evidence lives under research/results/jev-asset-pilot-v1: protocol.json, fixtures.json, ledger.json, model-metadata.json, key-before.json, key-after.json, balance-reconciliation.json and RESULTS.md. Each call records a request hash, UTC start, reservation, model identity, usage, cost and normalized answers. The offline verifier rebuilds all 16 requests and checks the billing arithmetic. No raw credentials appear in these artifacts.

## Recommendation

The narrow decision format is fast and inexpensive enough to merit a real-data trial. Next, use retained or newly retrieved Marketplace candidate lists with independently labeled relevant assets, ambiguous needs, incomplete descriptions and genuinely unsuitable results. Measure whether suggested ordering reduces inspection work without missing useful candidates. Keep it advisory until that evidence exists.

This pilot does not add Jev to Takko's model library or presets, and does not implement automatic routing or install assets. Existing code generation, inspection, ownership checks, budgets and native acceptance remain unchanged. Generation remains paused. No Studio operations occurred.

## Harness verification

Sixteen offline harness tests passed, covering request construction without labels, order reversal, cost reservations, response validation, credential exclusion from results, stop-on-failure behavior, unknown billing and one-run protection. An earlier unused local key-entry approach had 12 passes/2 test failures caused by a test Host-header assumption, then 14 passes after correction. Those logs remain. The key-entry server was removed before launch when the user requested OpenRouter. Final testing uses the OpenRouter-only harness.

The full `npm run check` passed with exit 0: 1,301 unit/API tests in 78 files, 6 offline combat scenarios, 14 plugin mock groups plus compilation of the plugin and 8 injected sources, 6 guard fixtures with expected outcomes, TypeScript/Vite build, 10 desktop tests, production smoke and 74 browser tests. No stages skipped and no retries. See [check log](results/jev-pilot-full-check.txt). Archived 27 changed result files under `docs/results/jev-pilot-check-artifacts` and restored the prior evidence. The separate offline verifier confirmed all 16 request hashes and cost receipts.

Offline mocks do not establish live provider behavior or native Studio integration. The 16 paid API observations above are separate evidence. No Studio session occurred. At 18:05 UTC, current app 4345/PID 30804, older app 4343/PID 31044 and static mock 4342/PID 28132 remained live. Test service 4319 exited. No existing server was stopped or restarted. Generation remains paused. No commit or push.
