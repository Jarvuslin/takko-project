# Live concept test

2026-09-20. The live trial **failed at clarification**. The model answered the design questions, but Takko rejected useful descriptions for exceeding its 500-character presentation limit. Fixed that limit in code and replayed the exact saved response successfully offline. This is not yet a complete live pass.

## Test and result

Used the actual Takko HTTP API, engine and OpenRouter provider adapter with isolated data. The user's “ok now move on to real test” authorized this bounded run. Selected [Claude Haiku 4.5](https://openrouter.ai/anthropic/claude-haiku-4.5), pinned to Anthropic. Verified current endpoint pricing before dispatch, $1 per million input tokens and $5 per million output tokens. The transport guard capped cumulative conservative reservations at $0.15, permitted one paid request per stage and disabled provider fallback. No application prompt, schema or provider response was mocked during the two paid calls.

The protocol was frozen before spending. Planned four stages: ambiguous idea, clarified concept, full-plan handoff and a separate explicit request that should need no questions. The trial stopped after the second stage failed. No paid retry, full plan, build, Studio test or publication occurred. The paused game-generation goal was not resumed.

The assistant-authored scenario asked whether a pet game should center on rescue or battles. It is a small functional smoke test, not representative novice usability research or an independent quality benchmark.

| Stage | Observed result |
| --- | --- |
| Ambiguous idea | Passed the contract. Asked rescue versus battle. No full specification or artifact was created. |
| Clarification | Failed the contract. Returned no remaining questions and incorporated the rescue direction, but two descriptions exceeded the hard length limit. |
| Full-plan handoff | Not attempted after failure. |
| Explicit request with no questions | Not attempted after failure. |

The first answer preserved the offered rescue option and added a custom solo-game loop: find pets, carry them to shelter, earn coins and unlock paths, with no combat, trading or offline decay. The second answer used the exact **Choose a sensible default for me.** value. The model returned only two questions, so the suggested and custom answer paths were combined in the first field rather than assigned to separate questions. These were live HTTP submissions, not browser clicks. Prior browser tests cover the corresponding controls.

## What failed

`playerExperience` was **522 characters** and `visualDirection` was **531**. Both were valid JSON strings, but the concept schema allowed only 500. The code-fenced JSON was parsed successfully. The response was not rejected because of Markdown formatting.

The engine then attempted its existing format-correction path. The trial guard blocked the second dispatch before network access, as required by the no-retry protocol. The adapter presented that blocked transport as “Provider connection failed,” obscuring the original validation error in the final error message. The original validation event and paid response establish the real cause. This was not evidence of an OpenRouter outage.

## Narrow fix

Changed only the two descriptive fields to a hard 1,000-character bound, with a softer one-to-three-sentence target of roughly 350 characters. The 2,000-output-token cap, question limits, other field limits, budget enforcement and approval flow remain in place. No text is truncated and no user intent is discarded to fit the card.

Added a regression fixture containing the exact parsed paid response. The new test checks that it is accepted without a correction call, retains both full descriptions and reaches the existing planning handoff with a mocked planner. It also verifies that unbounded descriptions are still rejected. This offline handoff does not turn the failed live trial into a live success.

Prompt wording now explicitly discourages duplicate questions about the same decision, unrequested offline decay/progression, unresolved alternatives after delegation and treating a small playtest as a limit on the full game. These changes have **not** been evaluated with new live model output.

## Quality observations

The model asked about the central ambiguity using accessible choices. Its second question largely repeated the rescue-versus-competition distinction through motivation. It also proposed persistence and pets worsening between sessions without being asked. One assumption described a normal session as focusing on one representative interaction rather than the full loop, creating a scope-reduction risk.

After clarification, the model retained shelter care, coins, path unlocking and safety while offline. It stopped asking questions, but still wrote “top-down or side-scrolling” and “passively over real time or through a simple interaction.” Those unresolved alternatives weaken the claim that the concept is ready for planning. The resulting guide is a proposal, not proof of a playable experience.

## Cost and reconciliation

| Paid stage | Conservative reservation | Actual cost | Input / output tokens | Request duration |
| --- | ---: | ---: | ---: | ---: |
| Initial | $0.014403 | $0.003942 | 817 / 625 | 8.113 s |
| Clarify | $0.015600 | $0.004195 | 1,085 / 622 | 8.828 s |
| Total | **$0.030003** | **$0.008137** | **1,902 / 1,247** | |

Key balance before: **$1.528618224 at 2026-09-20T19:44:53.314Z**. Settled balance after: **$1.520481224 at 2026-09-20T19:49:57.644Z**. The deduction matches both provider receipts. Earlier immediate balance reads were stale and remain preserved.

The application also recorded a conservative **$0.018534** unknown-usage reservation for the correction blocked by the test guard. Its local charge ledger therefore totals $0.026671. That reservation was **not a third provider charge**. The outbound ledger contains exactly two requests, both reconciled. No external charge remains unreconciled.

Request hashes, token counts, costs and receipt IDs were independently checked against the saved request and provider-response artifacts. The new evidence directory was scanned for OpenRouter key patterns, with no matches. The encrypted testing credential was restored into process memory only and was not copied to a running UI server or written to these artifacts.

## Verification and activation

The six offline spending-guard tests passed. The focused concept regression suite passed **11/11**, including the saved live response. The independent receipt/hash/settled-balance audit passed.

Final post-fix **`npm run check` passed, exit 0**. No stages were skipped and no retries occurred within that run:

| Stage | Result |
| --- | --- |
| Unit/API | 1,312 tests in 79 files passed |
| Offline Luau | 6 combat scenarios passed, sample scripts compiled |
| Plugin | 14 mock groups passed, plugin and 8 injected sources compiled |
| Guards | All 6 fixtures produced their expected outcomes |
| Build | TypeScript and Vite passed |
| Desktop | 10 tests passed |
| Production | HTML, bundle, API and unknown-route checks passed |
| Browser | 82 tests passed on desktop and mobile |

An earlier full check passed against the pre-fix code, 1,311 unit/API and 82 browser tests with all other stages. It is retained separately and is not the verification of the fix. Preserved 132 existing root result files before these runs, then archived and restored 27 changed files after each run. Original evidence and live failures remain intact.

Existing apps were not restarted: 4346/PID 27260, 4345/PID 30804, 4343/PID 31044 and static mock 4342/PID 28132. The live HTTP test used a separate ephemeral server for each stage, closed after the stage. No native Studio session occurred. The schema/prompt fix is in the working tree and requires a backend restart to activate in the existing 4346 preview. That restart requires permission because running app keys are memory-only.

## Evidence

- Run protocol, per-call ledger, responses, failed project and settled balance: `research/results/concept-live-v1/`
- Per-call accounting report: `research/results/concept-live-v1/RESULTS.md`
- Independent reconciliation and replay audit: `research/results/concept-live-v1/audit.json`
- Original rejection details: `research/results/concept-live-v1/clarify-validation.json`
- Retained stop marker: `research/results/concept-live-v1/stopped.json`
- Reproducible guarded runner: `research/scripts/run-concept-live.mts`
- Read-only verifier: `research/scripts/verify-concept-live.mts`
- [Guard tests](results/concept-live-guard-tests.txt) and [saved-response regression](results/concept-live-replay.txt)
- [Post-fix full check](results/concept-live-full-check-final.txt) and [earlier baseline check](results/concept-live-full-check.txt)
- [Final artifacts](results/concept-live-check-artifacts/) and [post-trial source hashes](results/concept-live-fixed-source-hashes.json)

Do not delete the attempted-stage locks or stop marker to rerun the trial. A new paid attempt needs explicit authorization. No commit or push was made.
