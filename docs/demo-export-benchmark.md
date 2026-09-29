# Demo export benchmark, 2026-09-27

The authorized run failed during implementation planning. No Luau files were generated, no generated files compiled, and no .rbxlx exists. The three requested fixes passed offline checks, but the end-to-end success bar was not met. No retry or gate fix was attempted.

## Scope and reproduction

The corrected delivery route is GET /api/projects/:id/export. No bridge apply, place binding or edits to place 122588481889475 are authorized. The previous delivery precheck was not repeated.

The original run-11 inspection is preserved unchanged. It stopped at 3,000 nodes with zero observed scripts. A detached native capture of the same asset found 5,334 instances, zero scripts, 427,439 packed transfer bytes and 528,823 expanded JSON bytes. That full capture and the original partial producer output drive the regressions. The initial red run had five failures and 31 passes across two files.

## Changes

Inspection now reserves serialized bytes against the existing 4 MB transfer budget. The schema admits full captures beyond 3,000 nodes. Source and script limits remain enforced. Scanner version 2 separates incomplete coverage from detected findings. Script/source mismatch and actual suspicious source still require review or block. Attachment admission recomputes the verdict from the stored snapshot.

Coverage-only limitations require a preview and explicit acknowledgment in asset choices. The acknowledgment persists with the selection. The attachment, proposal and existing visible requirement-limitation path retain the limitation. Automatic selection cannot silently acknowledge it.

The proposal contract now carries planner-authored asset needs before implementation planning. Early free discovery defers paid relevance until these needs exist. Finishing discovery after the proposal reuses captured options, binds the needs and saves recommendations. The implementation planner receives the saved identities and constraints. No threshold or ranking redesign.

## Verification evidence

Evidence directory: docs/results/demo-export-20260927/.

The first full check failed at unit tests with 13 failures and 1,577 passes. All failures were in decision-route tests that lacked the newly required authored needs, plus a guard-order regression that bypassed stale-revision rejection. Guard order was corrected, the fixtures now use the proposal producer contract, and a no-spend-before-needs regression was added. That failure is retained in check-1.log.

Focused regressions: 105 passes across four files. Decision-route verification before the additional no-spend test: 40 passes. Native production inspection captured all 5,334 instances with no findings. A separate mocked browser check fed the actual preserved partial snapshot through the scanner and verified visible limitations, disabled selection before acknowledgment, enabled selection after acknowledgment, and persisted acknowledgment. No browser errors.

All three preserved planner cases passed through the pinned OpenCode CLI using an offline provider and synthetic compiler/artifact fixtures. Exchanges were 28, 22 and 20. Task counts were 13, 10 and 9. Synthetic file counts were 7, 4 and 5. Actual cost was $0. These checks do not establish generated gameplay, asset behavior in Play mode or successful live generation.

Final full check (check-2.log) exited 0: 1,591 unit tests in 108 files, six Luau scenarios and four compiles, 14 plugin groups plus plugin/eight source compiles, six guards, CSS zero errors/556 warnings, TypeScript/Vite, 14 desktop tests, production smoke, 171 browser passes and one existing skip. Browser duration 7.7 minutes. Native gameplay is not part of this check.

Before paid dispatch, all 5,794 pre-existing result files were checked. New versions of 27 overwritten test artifacts were archived under check-artifacts, and the original files restored from the retained backup.

## Live run

One fresh project 1c246bdd-70a8-4f78-8440-2e36a5a3f4df, OpenCode mode verified, $8 cap. Service PID9784, port4335, isolated profile .forge/demo-export-profile-20260927. Starting account balance $15.663329032, key remaining $14.155807558 at 2026-09-27T05:10:37.317Z. Historical accounted spending $6.098676 remains recorded separately.

The unchanged positive-only brief is saved in prompt.txt. Free discovery captured candidates without paid relevance before the proposal. Planner produced three authored needs and all groups linked to them. Two automatic relevance passes occurred after the proposal. Saving recommendation choices changed the proposal hash and triggered the second pass, a remaining duplicate-work defect. This cost is retained, not excluded from accounting.

Automatic final picks were Training Dummy #1245720733 at 0.85 and Punch impact #101355487033225 at 0.84. No animation passed. Under the explicit manual-fallback authorization, the browser previewed and selected R15 Punching Animations #12061946559 / 1/1/18/1, a captured 0.600-second R15 clip. Its last Jev confidence was 0.70. The threshold was not changed. The UI displayed the Studio-only publishing limitation. All three attachments passed static inspection. Exactly one Approve & build action followed.

## Terminal failure and exact evidence

First implementation response used invalid proposalSections values: t_client_input included "animation", and t_hud included "ui". Its architecture was valid. The existing correction loop sent validation feedback and allowed one correction. The corrected response fixed those enums but introduced edge e8 from hit_counter_state to hit_counter_state for PlayerAddedOrRespawn. Its effect was to reset the counter on join and CharacterAdded.

src/generation/architecture.ts:50-58 rejects an edge whose endpoints are equal. Terminal message: "Could not complete planner. architectureProposal: Connect two different systems that exist in this architecture. Allowed model attempts exhausted."

This check was INSIDE the bounded correction path. It was not the old outside-correction proposal-binding defect. The correction introduced a different invalid graph and exhausted the two-attempt allowance. Both real responses are preserved as planner-output-1.json and planner-output-2.json, with untouched raw responses in traces. Read-only offline schema validation reproduces the exact errors in planner-gate-analysis.json. No changes to this gate were made.

The implementation plan was never committed. Asset acquisition never started. The raw animation's publishing limitation was visible in the picker and remains linked to the proposed punch_animation requirement, but no artifact or blocked-requirement coverage was produced. There was no incomplete-coverage limitation on the three selected assets because their current inspections completed.

OpenCode sessions 0, exchanges 0 of 48. The 900-second coding deadline was never entered. Generated Luau files 0, generated compiles 0, export calls 0. The export endpoint was not reached because ready_to_test was never reached. Exact .rbxlx path: none. No assessment of game quality or gameplay is possible.

## Costs

| Phase | Calls | USD |
|---|---:|---:|
| Jev brief interpretation | 2 | 0.000096 |
| Initial proposal | 1 | 0.057390 |
| Asset relevance | 66 | 0.020848 |
| Implementation planning, including correction | 2 | 0.377584 |
| Acquisition, coding, review, export | 0 | 0.000000 |
| Total | 71 | 0.455918 |

Every call and conservative reservation is retained in COSTS.md, ledger.json and dispatch-reservations.jsonl. Active reservations 0, new unresolved billing holds 0. Provider account usage increased $0.455879164. The $0.000038836 difference is conservative per-call rounding. Actual provider balance polls lagged receipts, then settled at account $15.207449868 and key remaining $13.699928394 at 2026-09-27T05:20:34.205Z. Historical accounted total is $6.554594, including prior holds. Unspent authorization is not permission for another run.

The second automatic relevance pass repeated 33 paid calls for another $0.010424. Recommendations changed the proposal hash used by the browser discovery trigger. This is a remaining duplicate-work defect, recorded without expanding this run into a further fix or trial. The original ordering failure was addressed: relevance received all three authored need identities and saved recommendations.

## Cleanup and limits

Owned test service PID9784 on port4335 stopped, and the recording browser closed. No listener remains on 4318,4319,4320,4324,4335,4336. Studio PID6604 remains in Edit on instance ca13ff86-472b-4f75-82a8-b2300a2d1b76, place122588481889475. Read-only final inventory found zero scripts and zero Forge scopes. Imports for inspection/preview remained detached and were destroyed by the production capture path. No probe scope or original script was changed, so none required restoration. No bridge apply, gameplay, app restart or Studio restart occurred.

All 5,794 protected prior result files match their original hashes. Preserve the current failed run, the source changes, and .forge/evidence-backup-demo-export-20260927. Another paid run needs new authorization. Other paused generation and business-demand work remains untouched.
