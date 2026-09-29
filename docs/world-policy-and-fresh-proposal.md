# Recorded worlds and fresh proposal

Date: 2026-09-28. Authorization: `docs/results/world-policy-20260928/authorization.txt`.

## Root cause and changes

Before editing, inspection confirmed that the scoped planner received the proposal, spec and affected task IDs, but no existing scene or file hierarchy. Builder context was dependency-filtered. Export and bridge delivery injected the current base-world constant regardless of project age or intent.

New projects now record a `world` decision with the captured Baseplate template snapshot and Studio version. The proposal contract supports a source-backed `none` or `custom` selection, or a blocking world question. Unresolved world questions block approval. World and run exclusions participate in proposal approval hashing. Failed proposal edits validate the candidate world before committing it. Legacy projects without this field receive no implicit template during export or push.

Export uses the recorded template snapshot. The bridge supplies that same snapshot. The plugin only bootstraps a previously unapplied namespace, so removing the baseplate does not cause a follow-up to recreate it or reset lighting. The installed Studio plugin was not replaced or exercised in this session.

Scoped planners and shared builder/reviewer context now receive the existing scene, existing files, current hierarchy and editable paths. Existing implementation backup supplies the original scene throughout replacement tasks. The existing byte-preservation checks remain active. Scene checks exempt unchanged nodes and sources. New duplicate spawn, ground or matching prop declarations require additional user intent.

The dense-light cluster heuristic is replaced with a template-world lighting rule. New light instances, Lighting hierarchy changes and statically recognized source mutations fail builder validation without user-backed lighting intent. Existing lighting is retained during unrelated follow-ups. Instructions name Lighting, Sky, Atmosphere, post-effects and all three local-light classes explicitly. User wording and source scanning remain bounded static checks, not general semantic or runtime proofs.

Run exclusions are passed through execution policy into the project and retained with it. Marketplace discovery removes excluded candidates before inspection and recommendation, clears any stale excluded choice, and rejects approval of an excluded asset. The requested animation ID lives only in the isolated run configuration and evidence, not production code.

## Free verification

Evidence: `docs/results/world-policy-20260928/`.

- Initial red reproduction: 3 failed tests. Both actual game requests lacked a recorded world. The preserved fighting scene's four PointLights produced only one old cluster finding.
- Focused integration run: 66 passed tests in 4 files, covering real scenes, world decisions, actual asset candidates and scoped editing.
- Additional preservation check: 7 passed tests. Unchanged ceilings, lighting, files and scenes survive follow-up checks.
- Two fresh-proposal mock replays use preserved planner outputs and actual Engine orchestration. Both record the template snapshot and retain approval-blocking questions.
- The follow-up replay checks both preserved complete scene outputs, rejects their unrequested lights as fresh template-world output, and admits unchanged scenes during follow-up. A separate real scoped-plan context capture reaches the Engine's actual planning path and stops deliberately before a model response. It confirms the saved scene and files are present.
- Positive lighting cases use the preserved Lantern Vale benchmark request with both real scene outputs. This is a controlled offline intent variation, not a historical successful Lantern Vale generation.

The first broad check passed build, then stopped at 1677 passed / 1 failed unit tests. The added unchanged-ceiling assertion exposed the preservation gap. The next check passed 1678 unit tests and all stages through production smoke, then browser discovery rejected the template JSON import without a Node import attribute. That import was corrected, and discovery separately listed all 172 browser tests. A further source regression exposed an equality read being mistaken for an assignment, with 1678 passed / 1 failed in the running broad check. The corrected source regression passes all 8 world-policy tests. These edits overlapped the early broad runs, so those runs are diagnostic evidence only. Final acceptance uses a fresh full check against a frozen 398-file source manifest. All failure logs remain preserved.

No free test establishes Studio gameplay or a successful real generation. Studio was not opened, changed or put into Play. There is no new export at the proposal stage.

## Preservation and spending

The existing 14240 result files were backed up before tests. Protected project and original export hashes match the prior record. Test-written evidence is archived separately and prior evidence restored after verification.

Part 1 paid inference: $0. Read-only balance at 2026-09-28T17:17:59.969Z: key $15.625646434, account $17.133167908.

Part 2 is conditionally authorized only after the full check passes and the handoff is updated. It is one fresh exact request, Sonnet 5 for planning/build/review and Jev 1.13 for bounded decisions, with an $8 whole-project cap and no failed-call retries or automatic repair resumes. The service must stop at the proposal for the user to answer questions, choose another animation, review dummy/sound and press Approve & build.

## Final Part 1 acceptance at 2026-09-28T17:39:28.144Z

Full npm run check passed on frozen source: 1679 unit tests in 121 files, 6 offline Luau scenarios and 4 sample compiles, 15 plugin mock groups and plugin plus 8 injected-source compiles, 6 matched guard scenarios, TypeScript/Vite, CSS 0 errors and 556 warnings, 14 desktop tests, production smoke, and 171 browser tests. One existing mobile resize test was skipped. No stage was skipped. No Vitest worker crash occurred in these runs. Final log: check-release.log. All 397 application/test/other source hashes match the frozen manifest. The sole changed file is the standalone post-plan replay script, whose updated legacy-world assertions independently passed all three real CLI mock cases (28/22/20 exchanges, 13/10/9 tasks).

Preservation verified across 14240 prior evidence files, with 30 test-written artifacts archived before restoration. All 99 reference-run files, the active protected project and both original/patched root exports remain unchanged. No Studio session was touched.

The free requirements are now complete. Part 2 may start under the existing one-run authorization. Its ledger and runtime details will be recorded under docs/results/world-policy-20260928/live/.

## Live proposal saved - 2026-09-28T17:43:31.281Z

The authorized fresh request completed proposal generation. Project c8550a5b-5b9f-4b79-8a25-b7ee0827618c, title Dummy Strike: Punch Counter Trainer, revision1, stage draft, recorded Baseplate template, excluded animation pack retained. URL http://127.0.0.1:4340/?project=c8550a5b-5b9f-4b79-8a25-b7ee0827618c. Isolated service PID32684, port4340, directory D:\RobloxProjects\Roblox Gen\.forge\world-policy-live-20260928. Leave this service running. Do not restart it or another app without permission.

Two successful calls, no retries: Jev1.13 $0.000047628, Sonnet5 $0.058990000. Actual provider total $0.059037628, ledger $0.059038 from conservative whole-microdollar rounding, outstanding reservations$0. Key and account balance deltas exactly reconcile. At2026-09-28T17:42:13.205Z, key$15.566608806, account$17.07413028. Whole-project cap remains$8 including proposal, subsequent user edits and an approved build. Receipts, reservations and full costs: docs/results/world-policy-20260928/COSTS.md and RESULTS.md, with raw per-call journals under live/. Earlier immediate balance reads lagged billing, final cache-busted read reconciled both totals.

STOPPED AT PROPOSAL. User must answer blocking assumptions, including single punch versus combo, choose a different animation (one per step for a combo), review dummy/sound and press Approve & build. No asset recommendations were dispatched by this agent, no OpenCode coding job ran and no export exists for this new project. Export/path/native gameplay checks remain pending after an approved build. Do not spend on another trial, auto-retry or repair. Failed older projects remain paused. Studio was untouched, its mode not re-inspected. Protected project, both root exports and all previous failure evidence remain unchanged.

Part1 fullcheck remains green:1679 unit/121files,171browser/1existingmobile skip, all other required stages passed. Detailed report docs/world-policy-and-fresh-proposal.md. Offline passes are not gameplay evidence.

