# Concept clarification retry

The authorized live retry failed. The model returned five playtest steps against the four-step bound. No full plan or clear-request test ran after that failure. The response also left a camera choice unresolved and asked a beginner to place a pet manually. This is not a usable end-to-end novice flow yet.

## Scope and protocol

On September 20, 2026, the user approved restarting preview 4346 and retrying clarification plus the remaining checks within the original $0.15 ceiling. Preview 4346 restarted from PID 27260 to PID 12300 after confirming it had zero model profiles and zero active profile keys. The home page returned HTTP 200 and the API advertised concepts support. Other app processes were untouched.

The live calls use the actual Takko HTTP routes, engine and provider adapter in an isolated temporary loopback server. They do not use browser automation or Studio. The original initial concept and exact answers were copied to a separate workspace. The failed original trial remains unchanged in `research/results/concept-live-v1`. The new frozen protocol, requests, receipts and snapshots are in `research/results/concept-live-v2`.

The model remains `anthropic/claude-haiku-4.5` through OpenRouter, pinned to Anthropic with provider fallback disabled. Live metadata was checked before spending. Each additional stage allows one network dispatch, with all original reservations included in the original $0.15 ceiling. The runner prevents another dispatch after failure. No initial-stage rerun was included, so revised initial question quality remains untested.

## Observed result

The clarification request went out at **2026-09-20T20:43:32.010Z** and completed in **7.061 seconds**. Its response was titled **Forest Rescuer**.

- The earlier description-length failure did not recur. Both descriptions fit the revised schema.
- It returned no questions and retained rescue, sanctuary care, coins, forest unlocks and no penalties while away.
- It returned five playtest steps. The supplied output schema explicitly specified `maxItems: 4`, so this was not a missing-schema issue.
- Takko rejected the response and attempted a format correction. The spending guard blocked that attempt before network dispatch.
- The saved project is failed, with no concept, specification or artifact. The displayed `Provider connection failed` came from the blocked correction, not an observed upstream outage.

The raw content has separate semantic problems. “A top-down or side-scrolling view” does not select a default. “Manually place one injured pet” makes the creator perform setup rather than test the generated game. The test description also omits checking the coin reward or a forest unlock. A structural pass would not resolve these quality issues.

## Narrow follow-up

Changed only `src/generation/concept.ts` in product code. The playtest guide now targets two to four player actions, with an eight-step hard bound. This avoids paying for correction merely because a usable list has one extra step. Existing per-step length, question, output-token and budget limits remain. The UI already renders the steps as a variable-length ordered list. No response is truncated.

The playtest instructions now explicitly assume generated objects already exist and ask for player actions, not object placement, scripting or Studio configuration. This prompt change has not been evaluated with another live call. No deterministic semantic guard was added, so unsuitable instructions could still be produced.

Added the exact paid response as `tests/fixtures/concept-live-five-steps.json`. Its offline engine regression verifies one response is accepted without a correction and all five steps are retained. It also rejects empty, nine-step and overlong-step guides. This verifies structural acceptance only. The fixture deliberately preserves the poor instructions as observed.

The restarted preview contains the preceding description/prompt fix used for the paid retry. It has not been restarted again to load this newer playtest-bound/instruction change.

## Cost

| Call | Conservative reservation | Actual provider cost | Input tokens | Output tokens |
| --- | ---: | ---: | ---: | ---: |
| Authorized clarification retry | $0.016310 | $0.003830 | 1,230 | 520 |
| Earlier initial + failed clarification | $0.030003 | $0.008137 | 1,902 | 1,247 |
| Combined | **$0.046313** | **$0.011967** | **3,132** | **1,767** |

Receipt `gen-1789937011-5z11iuWhZQPjYDtXNjM2` matches the saved request, reported tokens, price and provider. The app separately recorded an **$0.018604** unknown-usage reservation for the locally blocked correction. That was not a second paid call in this retry. The earlier trial's blocked reservation also remains preserved.

The original $0.15 ceiling was not expanded. Credential restoration used Windows DPAPI into process memory, with no key output, plaintext persistence or transfer to the running preview.

Settled remaining allowance is **$1.516651224 at 2026-09-20T20:46:57.154Z**, down from $1.520481224 at 20:43:23.736Z. The $0.003830 deduction matches the receipt. Earlier stale reads remain saved. The independent audit verified the request hash, receipt, token pricing, original-evidence hashes, lack of later stage attempts and zero key-pattern matches in the run evidence.

## Verification and limits

Full `npm run check` completed with exit 0. No stage skipped and no suite rerun:

- 1,313 unit/API tests in 79 files.
- Six offline combat scenarios.
- 14 plugin mock groups, plus compilation of the plugin and eight injected sources.
- All six guard fixtures produced their expected outcomes.
- TypeScript/Vite build, 10 desktop tests and production smoke passed.
- 82 browser tests passed on desktop/mobile.

Separately, nine spending-guard tests and 12 focused concept tests passed. These counts overlap the relevant full-suite coverage and should not be added as distinct product tests. The independent receipt/hash/balance audit passed. Main log: `docs/results/concept-retry-full-check.txt`. Changed root evidence was archived under `docs/results/concept-retry-check-artifacts` and all 27 overwritten historical files were restored from the 137-file backup.

At 20:51 UTC, 4346/PID 12300, 4345/PID 30804, 4343/PID 31044 and static 4342/PID 28132 remain live. The test-owned 4319 service exited. No other ports in the 4318 through 4346 range are listening. Offline browser and Studio mocks do not establish real model quality or native game behavior.

The first read-only preparation process exited 1 with no output before creating the new evidence directory. A second preparation completed successfully, before any inference attempt. A harmless source-read path error was corrected. Neither was a paid retry.

No game build, model-plan approval, Studio session or publication occurred. The existing generation goal remains paused. The paid trial stays failed even though its saved response passes offline after the change. Next live validation needs explicit authorization under the repository's no-auto-retry rule.
