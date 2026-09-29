# Build approval stall

Status: live generation is paused. User answers were saved, including the three-step combo. No build approval, OpenCode job or artifact exists for this project. Offline fixes are implemented and the final full check passed. Live recovery is awaiting permission. The service has not been restarted.

## Observed failure

The user reported submitting answers and pressing Approve & build with no visible result. Read-only inspection found revision3, draft, no saved approval, initially an active asset-relevance job. The progress journal records two full assessment runs, each adding42 model charges, then a third attempt. The question modal itself had saved all five answers and the paid proposal edit had committed mechanics describing a jab-jab-cross sequence.

The asset requirements still described a single punch, explicitly excluding a multi-hit combo. The animation choice was absent. The approve route rejects incomplete choices, and it rejects approval while asset work is running. We do not have the user's original browser request/response, so the exact response to their click is not observed. Both blockers exist in saved state. The prior UI displayed approval errors in a global banner away from the action and gave no local pending state.

On detecting the repeated paid work, the service's existing deny-dispatch flag was written. The running process was neither killed nor restarted. JobId returned to null and charge count stabilized at551. Further inference remains blocked. Answers, existing choices, completed work, spending and failure evidence were retained. No Studio session was touched.

## Root causes and offline changes

The asset-options route treated every unapproved proposal as a reason to finish recommendations again. The browser's automatic request key included the proposal hash, which asset selection itself can change. There was no persisted boundary between an automatic attempt and an explicit retry. Added recommendationRevision to saved discovery state before assessment. Repeat automatic requests on the same revision and Studio return the saved result. Explicit refresh or group search remains available. The browser uses project/revision/Studio identity instead of selection-dependent proposal hash. Assessment failure now returns retained results immediately rather than continuing recommendation mutation.

The sequence validator checked the request and answers but omitted the mechanics the planner had just written. The user's answer said combo without a numeric step count, while the planner output explicitly committed three steps. The existing validator therefore never checked that declared sequence. It now also receives the proposed mechanics text inside the model validation callback, before commit. The editor instructions require per-step Animation needs when introducing a sequence. The regression replays the preserved real resulting mechanics and user answers, without adding a number to the user's answer. This catches the observed explicit-count mismatch. It is not proof of arbitrary semantic understanding of every possible combo description.

The proposal now displays missing asset groups and assessment errors by the approval button. Approval has a visible pending label, rejects duplicate clicks, and displays API errors in that same section. App-level busy handling remains active during the request.

A downstream regression also reproduced stale picker groups after a valid per-step edit. Applying changed asset needs now rebuilds only affected discovery groups using their structured need identity, retains unchanged groups and selections, and makes the new slots searchable. The regression consumes the edit API result in the asset-options API, verifying both new searches and retained unrelated groups.

These source fixes do not repair the already-saved live combo proposal. A corrective planner edit is still required before that proposal can honestly be built. No corrective inference or build retry was dispatched during this investigation.

## Verification and limits

The two new offline regressions failed before implementation: repeated asset-options requests mutated discovery again, and the real combo edit was accepted without animation slots. The first focused rerun passed9 of10 tests but exposed an incorrect test reference to app.locals.store. Correcting it to app.locals.engine.store yielded10 of10 passes across the new suite and existing proposal question suite. All failure logs remain.

The first full check passed build but failed with a Windows native worker exit3221226505 in settings-workspace.test.ts. It reported1679 of1689 tests passed across122 of123 files, plus1 unhandled error. It is not a passing check. After the downstream picker regression and fix,31 focused tests across3 files pass. The second full attempt passed1689 unit tests and every pre-browser stage, then the connection-recovery browser test exposed a regression: removing the connection-check counter also prevented a user-requested retry after a search503 with no saved results. The counter was restored while the selection-dependent hash stays excluded and the server attempt marker prevents repeated paid assessment. The owned failing test tree was stopped and its traces archived. One focused invocation began before that tree had exited and failed because4319 was occupied. Another exited before emitting test output. The following focused browser run passed14 tests on desktop and mobile. Final npm run check passed with exit0: 1,689 unit tests in123 files,6 Luau scenarios and4 sample compiles,15 plugin groups plus plugin and8 injected-source compiles,6 guard cases with their expected outcomes, CSS0 errors/556 warnings, TypeScript/Vite,14 desktop tests, production smoke, and177 browser tests with1 existing mobile resize skip. No stage skipped in the final run. Browser duration9.8 minutes. Log results/approval-stall-20260928/check-complete.log. A browser regression covers visible pending/rejected approval at desktop and mobile sizes. These are mocked API tests, not successful live generation or Roblox gameplay.

Before full checks,14428 historical result files were backed up. Active live journals and this result directory were excluded. Archived and restored34 overwritten historical artifacts. All417 source hashes matched the frozen manifest. See restoration.json. Only the existing service PID2588 remains among the recorded app/test ports.

## Costs and running service

PID2588 remains on port4340, using .forge/world-policy-live-20260928. Project c8550a5b-5b9f-4b79-8a25-b7ee0827618c. Do not restart without approval. Leave docs/results/question-modal-20260928/live/deny-dispatch in place until explicitly authorized recovery.

Since the prior modal handoff, the user's interaction triggered1 Sonnet5 edit and85 Jev relevance calls, costing $0.088374610 actual. Total551 provider calls cost $0.332982004. Conservative ledger $0.333271, retained outstanding reservation $0.002688, remaining $8 allowance $7.664041.

Read-only balance at2026-09-28T23:00:40.829Z: key $15.292664430, account $16.800185904. Both deltas exactly match every provider receipt. The initial reconciliation failed because the transport journal also contained two successful non-inference responses without usage. Those rows are preserved and excluded from inference accounting, not counted as free model calls. See results/approval-stall-20260928/COSTS.md for each call and reservation.

## Prepared recovery, not dispatched

The compiled host is .forge/approval-stall-resume.mjs. It was rebuilt from the checked sources after verification, without executing it. It must run without --suggest-questions, using the existing store, profiles and cap. The original options attempt must never be repeated. Before restart, verify the actual listener and idle state again. Stop only the specifically authorized service after user approval.

The saved proposal needs a targeted mechanics/asset edit: keep the user's existing jab-jab-cross behavior and all five answers, replace only the incompatible single animation need with separate Animation needs carrying a shared sequence ID and steps1..3, and retain dummy/sound/theme/environment and spending. Validate inside the planner call, then use its actual output for asset discovery. No manually invented catalog IDs, no fresh project, no silent budget reset, no automatic retry. This recovery was not dispatched by this task.
