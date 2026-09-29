# OpenCode diagnostics and audio capability correction

The live run failed at final review, after successful coding. OpenCode completed all six tasks and exited 0. Five generated Luau files compile. The reviewer exhausted its 32,768-token reply allowance, leaving the project failed, and the authorized export endpoint returned HTTP 409. No `.rbxlx` was produced. No paid retry or bypass followed.

## Reproduction

The preserved project and runtime were copied into an isolated diagnostic directory. The binary, configuration producer, tool schemas and isolated environment came from the actual runtime. The only model transport was a local mock with a fake credential. Original evidence was not modified.

With the original ledger, OpenCode exited 1 after 4,369 ms. Its stdout reported APIError, HTTP 403, “Unknown provider billing must be reconciled before another OpenCode request.” DEBUG output reached the model stream and contained the same error and stack. No mock inference was dispatched. This reproduces a gateway refusal caused by the previous audio HTTP 404 reservation hold, rather than establishing the user's example ProviderModelNotFoundError as this run's cause.

A counterfactual copy changed only that refusal hold to zero. With an SSE mock, OpenCode exited 0 after 4,104 ms and one mock request. Changing PATH to system PowerShell also exited 0 after 3,683 ms and one mock request. Both used the copied workspace with its original empty heartbeat. Neither PATH choice nor the empty heartbeat prevented startup in these tests. This is isolated evidence, not a paid-provider or gameplay result.

The first counterfactual mock mistakenly returned JSON to a streaming client. That produced 48 zero-cost requests and the existing exchange-limit refusal. It is retained separately as a diagnostic harness failure. The corrected mock speaks SSE. Production streaming and protocol were not changed.

## Changes

- Runtime launches with `--print-logs --log-level DEBUG`. Saved runs carry exit code, signal, bounded stdout and stderr tails, and extracted error refs. Reported errors include those diagnostics. Each stream retains at most 40 lines and 16,384 characters in the failure record. Local gateway tokens are redacted after chunk assembly.
- Audio support requires a verified model identity and a supported transport. The conservative initial allowlist is Gemini 2.5 Flash, directly or through OpenRouter. Unknown models use metadata-only asset evaluation. No paid model route was changed. The capability basis is [Google's model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash).
- Sonnet receives captured metadata without WAV bytes. Instructions explicitly forbid listening claims. The host forces `accepted=false` and `audioFit=false` for metadata-only evaluation, so a model cannot fabricate audible approval. Audio remains an honest acquisition gap.
- The model guard runs before audio budget reservation and again at provider dispatch. Metadata-only requests reserve only their actual text/image envelope.
- Definite HTTP 404 refusals produce zero-cost failure receipts in the normal provider and OpenCode gateway. Their reservations release. Gateway retries remain stopped. Ambiguous connection failures retain their conservative liability. Historical ledgers remain unchanged.

The 48-exchange and 900-second limits, session protocol, planner rules, asset thresholds, model selections and delivery path were not changed.

## Verification

Focused diagnostics, providers, asset pipeline, gateway and runtime tests: 70 passed in five files. Updated continuation test: four passed. Three final pinned-CLI replays passed with 28, 22 and 20 mock exchanges, completing 13, 10 and 9 tasks and retaining 7, 4 and 5 synthetic files, respectively. Cost was $0.

The final `npm run check` exited 0. It passed 1,622 unit tests in 111 files, six offline Luau combat scenarios and four sample compiles, 14 plugin groups with the plugin and eight injected sources compiled, six guard expectations, CSS lint with zero errors and 556 warnings, TypeScript/Vite build, 14 desktop tests, production smoke and 171 browser tests with one skip. These are offline checks, not live generated-game compiles.

Earlier replay failures and full-check failures are preserved. The replay mock had assumed Sonnet could approve audio and did not handle the resulting selection rejection. It now returns an explicit rejection and verifies coding continues with that gap. One intermediate full check also hit a Windows Vitest worker crash, exit 3221226505 in provider-connections.test.ts. The final complete rerun was clean.

All 6,288 protected prior result files were restored hash-identically after checks. The 28 changed test-generated artifacts were archived under this run's evidence before restoration.

Evidence: `docs/results/runtime-diagnostics-20260927/`. These offline tests do not establish successful Studio gameplay.

## Single authorized live run

Project `8a81efe9-b8ed-44bc-a21a-5aad132813ac`, revision 1, OpenCode mode. The benchmark requested a stationary punching dummy, punch animation, hit sound and on-screen hit counter. Sonnet 5 remained the coding/review model. Jev remained limited to bounded non-coding decisions. The cap was $8.

The proposal and implementation plan each passed their first response. The plan has 10 requirements and six tasks. Dummy and sound were automatic selections. No animation passed relevance, so the authorized manual fallback selected asset `12061946559`, embedded R15 clip `1/1/18/1`, approximately 0.6 seconds, confidence 0.76. One Approve & build action followed. The known repeated relevance behavior produced 165 calls across five 33-call passes. It was recorded and deliberately not changed.

Dummy `1245720733` was retained after removal of its conflicting Respawn script and one adapted-review correction for missing content references. The animation pack was retained, but publishing remains blocked without a permitted published animation ID. Audio `126976659766267` loaded and played during native acquisition. Its measured source duration was about 1.53 seconds, outside the proposal's 0.2–0.5 second range. Sonnet evaluated metadata only, without receiving WAV bytes or approving audible fit. The sound remained a gap. The gap also propagates to `target_dummy` coverage through the saved related requirements, despite the dummy itself being retained.

OpenCode run `cf8280cc-c891-4d79-9085-9231d721a618` ran from 18:56:26.357Z to 19:09:30.541Z, 784.184 seconds. It completed all six submissions in 42 model exchanges and exited code 0, signal null. Tools included one manifest read, 43 output-page reads, eight task-context reads and six task submissions. One context compaction occurred. The ceilings and protocol were unchanged. This is observed live coding success, not gameplay success.

Five files, 495 newline-counted lines, were saved and independently compiled with the installed Luau compiler. Each compile exited 0 with empty stderr. `generated-compile.json` records hashes that match the terminal artifact. Sources are under `generated-luau/`. The files are PunchConfig, PunchRemotes, PunchController, PunchValidator and HitCounterHUD.

The final review call ran about 331 seconds and returned an incomplete response at 32,768 output tokens, including 28,793 reasoning tokens. Its 10,015-character partial response is preserved as `review-truncated.txt`, with receipt details in `review-failure.json`. No final review was accepted. The project's final whole-game checks array is empty because that phase was not reached. Do not confuse the five successful independent compiles with a completed review or gameplay acceptance.

The read-only request to `GET /api/projects/8a81efe9-b8ed-44bc-a21a-5aad132813ac/export` returned 409, “Build and resolve checks before export”. Exact `.rbxlx` path: **none**. The project stage was not rewritten, the exporter was not bypassed, and no bridge apply occurred.

## Costs

| Phase | Model calls | Provider-reported USD |
|---|---:|---:|
| Jev interpretation | 2 | 0.000096 |
| Proposal | 1 | 0.054044 |
| Asset relevance | 165 | 0.051915 |
| Implementation plan | 1 | 0.211614 |
| Asset acquisition | 7 | 0.680934 |
| OpenCode coding | 42 | 2.002795 |
| Final review | 1 | 0.477460 |
| Export | 0 | 0.000000 |
| Total | 219 | 3.478858 |

Export made one HTTP request and zero model calls. All 219 inference calls have receipts. Active reservations and unknown holds are both zero. The final account usage delta is $3.478767346. The $0.000090654 difference from summed receipts is per-call rounding. The initial balance reconciliation lagged the last review charge and is preserved separately.

Account credit is $10.224550608 and key allowance is $8.717029134 at 2026-09-27T19:17:48.400Z. Historical conservative accounting is $12.139426, including previous holds that were not rewritten. The unspent $4.521142 of this cap is not retry authorization. Per-call reservations, receipts and ledger-derived remaining funds are in `COSTS.md` and `ledger.json`. Timestamped account snapshots are retained separately.

## Cleanup and remaining work

Owned service PID 44112 on port 4335 and both owned browser sessions exited. There are no listeners on 4318, 4319, 4320, 4324, 4335 or 4336. Studio PID 6604 remains in Edit mode on instance `ca13ff86-472b-4f75-82a8-b2300a2d1b76`, place `122588481889475`. Before and after inventories both show zero scripts and zero Forge scopes. Temporary imports and audio probes were removed. There were no original scripts to restore. No user app was restarted.

Preserve the failed review, completed artifact, native evidence, runtime database/logs, original failed runtime, encrypted profile and evidence backups. The new blocker is final-review truncation followed by the existing export-stage restriction. Any next investigation should use this saved artifact and response offline. No further paid run is authorized.
