# Improvement plan

Fix generation first using the two saved failures. Validate chat and asset continuity next, then own StudioMCP child lifetimes. Inventory and migrate workspaces last, preserving projects, settings and encrypted keys. Commit and report after each phase.

## Scope

- In: direct generation, recoverable format errors, no-code spending stop, chat/asset regression tests, StudioMCP ownership, stable delivery/workspace migration and a current-rate acceptance estimate.
- Out: paid calls without specific approval, ending existing orphan processes without approval, restarting the user's running app without approval, mobile layouts and unrelated redesign.

## Ordered phases

- [x] Reproduce both saved planning failures and validate a compact contract derived from the actual approved proposal and selected assets.
- [x] Start one direct coding session, recover tool-envelope mistakes through validation feedback and pause further requests after the no-code spending threshold. Commit phase 1.
- [x] Exercise actual proposal/asset API results through chat tests covering replace/remove/skip, contained audio, retained picks, visible activity and Stop. Commit phase 2.
- [x] Close only StudioMCP processes owned by the exiting Takko service. Inventory existing processes and list confirmed/possible orphans for explicit termination approval. Commit phase 3.
- [x] Inventory workspace project IDs, collisions, settings and vault locations without exposing credentials. Implement and test staged migration and stable package output. Commit phase 4. Cutover remains gated on restart approval.
- [x] Run the full offline check and record exact results and remaining native limitations. A failed legacy-fixture run required a full rerun.
- [x] Read the actual active preset and refresh its model's public rates. Show input, output, cache assumptions, review allowance and conservative request reservations before proposing a run. Replace the old $2/$3 estimate rather than reusing it.
- [ ] Request approval for one capped dummy/punch/counter run, then a separately authorized Studio test. No automatic paid retry or resumption of paused projects.

## Verification record

Phase 1 is committed after 58 focused tests across six files and TypeScript checking passed. The full check is reserved for the end. Build, Luau, plugin, guards, CSS, desktop, production, browser and Electron stages have not yet run for these changes. Work continues on later phases. No paid inference or existing-process termination has occurred. The running delivery remains unchanged until an approved update.

Phase 1 uses preserved project snapshots `6e6ffc7f` and `07a88f8e`, plus the original final worker response for the requirement overflow. The earlier duplicate-asset failure already has a production-response replay test. New tests consume the actual store migration, approved-asset linking, proposal API and billing gateway producers.

Initial focused checks caught a legacy mock that returned no files for a task with dynamically assigned paths, and a spending-stop fixture whose synthetic price exceeded its configured reservation. Both failures are preserved in the task transcript. The fixture now authors a namespaced file for that producer contract and uses conservative rates that cover its synthetic receipt. Legacy multi-task replay remains explicitly tested.

The no-code threshold is the smaller of $0.50 and one quarter of the generation allowance. It is checked before the next request after settled spend reaches the threshold. A single in-flight call can cross it, but still requires the existing conservative project/generation reservation. Explicit continuation starts a new observation window without erasing charges or expanding caps.

Offline checks do not establish live Sonnet behavior, animation playback, physical assembly or a playable exported place. The rate-based estimate and paid acceptance remain pending.

Final replay strengthening added two tests that drive the saved inputs through the current approval API and direct engine boundary. `6e6ffc7f` approves and writes code. `07a88f8e` correctly returns 409: its historical dummy and sound picks lack current source-review records, and the sound model has no selected contained sound. Its pick identities were not lost. A separate isolated replay at the already-approved engine boundary writes code with those same picks and retains historical charges. That lower-level replay does not establish current UI eligibility. Resolve the real asset checks before retrying that project, never fabricate review records. Six direct-build tests passed. The initially failing API assumption remains recorded in `test-artifacts/improvement-saved-engine.log`.

Phase 2: 64 focused tests in seven files passed, plus two new Electron journeys against the direct backend. The journeys preserve replacement and contained-sound choices through approval, and Stop/Continue preserves the same picks. Desktop build/typecheck passed. Native providers and Studio are doubled. The initial anchored test filter selected no tests, then the corrected filter ran both journeys. The full suite remains pending.

Phase 3: 28 focused Studio client/connection tests passed, including a real owned Node child whose owner exits without explicitly closing the client. Takko now tracks child process objects and closes them on normal process exit, desktop shutdown/lease expiry and server SIGINT/SIGTERM. It never enumerates processes by executable name for termination. Forced OS termination of the service cannot run JavaScript exit hooks and remains outside this guarantee. Early test attempts used the wrong client method and an invalid executable override, corrected before the passing run.

## Existing StudioMCP inventory

Read-only process ancestry inspection on 2026-09-30 UTC found no confirmed Takko orphan. Ancestor creation times were checked to exclude reused parent PIDs. All six had live application owners through cmd.exe:

| StudioMCP PID | Parent cmd PID | Live owner |
| --- | --- | --- |
| 36712 | 1372 | Codex, codex.exe PID 14540 |
| 32628 | 27276 | Codex, codex.exe PID 14540 |
| 43536 | 17996 | Codex, codex.exe PID 14540 |
| 34804 | 44688 | Codex, codex.exe PID 14540 |
| 42064 | 29572 | Claude, claude.exe PID 44624 |
| 22076 | 20780 | Claude, claude.exe PID 44624 |

None was ended. These are live-owned integrations, not proven orphans. Ending any of them needs explicit approval and a fresh PID/start-time check. The initial attribution of these six processes to old Takko builds is not supported by this inventory.

## Workspace migration

Phase 4: 11 focused migration/provider-connection tests and TypeScript checking passed. Tests cover conflicting projects, preset/profile ID remapping, source overlap, source edits invalidating a stage, real Windows DPAPI encryption and key restoration through a fresh Configuration. The synthetic conflicting-key case retains the active connection without changing either source.

`npx tsx scripts/stage-workspace.ts` staged seven distinct projects from active chat-clean (one), original AppData (five) and fresh-desktop (one). No source was changed. The staged vault reopened successfully with one encrypted connection and zero key conflicts. Active settings remain selected, other profiles/presets are retained. 191 cached-asset, preference or bridge conflicts retain the earlier source, with file paths recorded in the local migration receipt. Project/history/trace conflicts would stop staging. All original versions remain in their source workspaces.

`npm run desktop:package` now stages in `.forge/update-stage/app` by default and refuses overwriting an existing bundle. The intended one installed app is `release/Takko-win32-x64/Takko.exe`, with default `%APPDATA%/Forge Desktop` data and no workspace-switch shortcut argument.

Cutover procedure, pending approval: close the current Takko normally, verify both source and stage fingerprints with `npx tsx scripts/stage-workspace.ts --verify`, and restage if anything changed. Preserve original AppData as an explicit rollback sibling before installing the staged workspace. Install the staged app at the stable release path and retarget the Desktop shortcut. Launch once and verify all seven projects, active preset and encrypted connection restoration, then close and relaunch to verify persistence. Keep the previous working delivery and source workspaces until that passes. Never resume a project or call a paid provider during migration verification. Studio stays open. No cutover has happened yet.

Two fresh Configuration instances opened the actual staged vault successfully. Both restored the active `son` preset, `anthropic/claude-sonnet-5.5`, five profiles, three presets and an available key. No credential was printed. A final fingerprint check found the stage and source inputs unchanged. This verifies storage reopening, not provider authentication or the not-yet-approved app relaunch.

The unsigned Windows x64 candidate was packaged successfully at `.forge/update-stage/app/Takko-win32-x64`. Packaging did not launch it or replace the running delivery.

The first full check passed build, then stopped with 1,785 unit passes and nine failures across two historical replay files. Their shared fixture unintentionally selected the new direct default while asserting legacy planning behavior. Explicit `directBuild: false` restored that intended coverage. All 17 tests in those two files passed afterward. The original failure log is retained at `test-artifacts/improvement-full-check.log`.

Final full `npm run check` rerun passed: build/typecheck, **1,794 unit tests in 138 files**, **six Luau scenarios**, **16 plugin groups**, **six guard cases**, CSS lint (**274 warnings, zero errors**), **14 desktop tests**, production smoke, **106 browser tests** and **10 Electron journeys**. No stages were skipped. Log: `test-artifacts/improvement-full-check-rerun.log`. The two stronger saved-input engine replays were added after this run's unit stage and passed in a separate six-test direct-build run, followed by another successful TypeScript check. They are not included in the 1,794 count. No application source changed after the full rerun began. Packaging succeeded. Paid inference cost: **$0**.

Live Takko, Studio and the six externally owned StudioMCP processes remained untouched. The full check used isolated test services and doubles. No native Studio verification was performed, so no probe/import cleanup or Studio mode change was needed. The staged candidate is ready for approved cutover, not a claim of successful real-model generation or gameplay.

## Paid acceptance estimate, not authorization

Checked 2026-09-30T04:16Z. The actual active `son` preset routes planner, builder, reviewer and repair to `anthropic/claude-sonnet-5.5` on OpenRouter, with 8,192 maximum output tokens per request. Stored rates agree with the [current OpenRouter catalog](https://openrouter.ai/api/v1/models): $2/M input, $10/M output, $0.20/M cache reads, $2.50/M five-minute cache writes and $4/M one-hour writes. No new provider-balance query or inference was made.

Rather than reuse a dollar quote, reprice the last 30-call coding segment in saved project `8a81efe9`, from 2026-09-27T23:37:52Z to 23:49:24Z. It used 1,454,721 input tokens, of which 1,202,979 were cached, and 68,426 output tokens. The following review used 77,832 input and 14,854 output tokens. That was Sonnet 5 on the older pipeline and produced a broken game. Its token volume is an estimation reference, not proof of Sonnet 5.5 cost or quality. Some old requests exceeded today's 8,192 output limit, so exact replay is not assumed.

| Scenario | Calculation | Estimated USD |
| --- | --- | ---: |
| Build, same cache hits | (251,742 × 2 + 1,202,979 × 0.20 + 68,426 × 10) / 1,000,000 | 1.428340 |
| Build, charge every uncached input as a five-minute cache write | (251,742 × 2.50 + 1,202,979 × 0.20 + 68,426 × 10) / 1,000,000 | 1.554211 |
| Review allowance, no cache discount | (77,832 × 2 + 14,854 × 10) / 1,000,000 | 0.304204 |
| Combined with comparable caching | 1.428340–1.554211 + 0.304204 | **1.732544–1.858415** |
| Combined, no caching | (1,454,721 × 2 + 68,426 × 10) / 1,000,000 + 0.304204 | **3.897906** |

These scenarios assume no one-hour cache writes, web-search charges, automatic paid retries or extra repair loop. Reasoning tokens are included in billed output rather than treated as free. Cache behavior and call count are not guaranteed. Reusing a saved approved proposal avoids another proposal fee. New direct planning itself makes zero paid planning-worker calls.

Proposed first acceptance: one new isolated project seeded from the saved approved dummy/punch/counter inputs and exact saved picks, Sonnet 5.5, **$2.50 additional-spend cap**, repairLimit 0, no automatic retry or continuation. Expect roughly **$1.75–$1.90 only with comparable caching**. Without it, the historical workload would need about $3.90 and this trial must stop at its cap instead. Preserve the original failed project. Reconcile every call and record exported hierarchy, assembly/path checks and failures. A real Studio gameplay test is separately authorized.

Request admission also requires conservative reservations, not just estimated cost. At current rates the OpenCode gateway reserves `((request UTF-8 bytes + 1,024) × 2 + 8,192 × 10) / 1,000,000` dollars. For a 400,000-byte request this is **$0.883968**. If settled spend plus that reservation exceeds the cap, dispatch stops even if expected cached cost is lower. The no-code guard pauses before the next request after $0.50 settled spend without saved code. An already admitted call can cross that threshold, bounded by its reservation and the overall cap. No promise that $2.50 completes the game.
