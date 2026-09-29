# Persistent proposal implementation

2026-09-24 UTC. The source now supports a saved game proposal, targeted chat edits, inspected Marketplace recommendations and one Approve & build action. The running user app has not been replaced. Native gameplay has not been verified.

## Behavior

New prompts prepare a proposal with stable mechanics, theme and environment/layout sections. Each section carries assumptions and unresolved dependencies. Marketplace slots retain actual returned asset IDs and embedded clip identities. Inspected recommendations are selected by default. Jev remains an optional bounded interpretation and relevance worker. It is excluded from coding routes. Host code performs searches, inspection, preview and import.

Chat edits use a strict patch against the saved revision and content hash. Only permitted section IDs can change. Unknown fields, stale bases, unrelated section replacements and no-op patches are rejected. No whole proposal is generated to process a localized edit. Unchanged sections and selections survive. A failed or cancelled edit retains the previous proposal and the requested change. Financial receipts commit independently and are never rolled back with content.

Approve & build binds the shown proposal, inspected references, asset revision identity and exact clip selection. It rechecks selected content before implementation. Required unresolved choices, unavailable inspection, exhausted allowance, uncertain billing and unresolved native operations remain explicit blockers. Internal planning and code generation follow the same approval. They do not require separate brief, asset and specification approvals in the proposal flow. Older saved projects retain their compatibility UI and can prepare a persistent proposal.

Manual asset replacements preserve other choices and pin the override. Subsequent searches retain pinned references. Preview and replacement remain optional controls. Static inspection does not certify safety, playback permission or game behavior. A version change cannot inherit an old content or animation result.

## Preservation and incremental execution

The correction covers `submitChange`, `revise`, planning start, coordinator initialization and build initialization. The previous code deleted the concept, specification, asset discovery, artifact and completed task list. These are retained. The coordinator archives previous planning state and retains worker receipts under their original revision and input identity.

Implementation tasks declare proposal dependencies. A changed section invalidates its owners, tasks sharing affected requirements and transitive consumers. Scoped replanning preserves stable task IDs, file ownership, requirement ownership and dependency contracts. Undeclared contract or ownership changes stop with an explanation. Unaffected files and scene content are checked for exact preservation before a revised artifact is accepted.

During an incremental build the last completed artifact remains visible. Validated replacement work is saved separately. If a later worker fails or work is cancelled, the previous artifact returns and successful replacement workers remain available for an explicit retry. Recovery after interruption keeps the previous artifact and conservatively accounts for unresolved reservations.

Asset evidence uses a separate content/dependency binding. It includes upstream task contracts, proposal dependencies, linked requirements, selected reference content and clip identity. Unchanged evidence can be reused without native effects. Changed dependencies require acquisition again. Original pipeline runs remain in history and reused entries identify their original run, revision and input hash. Component source-review receipts are not relabelled as new verification.

Legacy artifacts without a complete dependency map remain intact. The app reports the missing coverage instead of silently regenerating them. This is exercised with the saved fixture at `tests/fixtures/conversation-legacy-project.json`. Dependency declarations and offline checks cannot establish that a model understood every semantic dependency in a real game.

Builds, imports, queued or dispatched native operations and native operations with unknown outcomes block edits and approval. The client retains unsent requests. There is no delayed automatic replay after cancellation.

The generation allowance keeps its original ID, charge start and accumulated spending through edits. Changing the brief does not open a fresh allowance. Explicit budget changes retain the original charge boundary.

## Verification

Final `npm run check` exited 0. Evidence: `docs/results/conversation-planning/full-check5.log`. No check stage was skipped.

| Stage | Result |
| --- | --- |
| Unit/API | 1,513 passed across 95 files |
| Luau | 6 offline scenarios passed and 4 sources compiled |
| Plugin | 14 mock groups passed, plugin and 8 injected sources compiled |
| Guards | All 6 cases returned their expected acceptance or rejection |
| CSS lint | 0 errors, 556 existing warnings |
| Build | TypeScript and Vite passed |
| Desktop | 14 passed |
| Production smoke | HTML, bundle, API and unknown-route checks passed |
| Browser | 165 passed, 1 intentional mobile resizer skip, 7.2 minutes |

All 346 source-file hashes match the manifest captured before this run. The final verification was recorded at 2026-09-24T02:52:17Z in `final-source-verification.json`. The complete run includes the final code, regression tests and corrected animation synchronization.

Focused coverage includes message/API transactions, revision and hash conflicts, failed and cancelled edits, no-op edits, saved legacy migration, exact approval, native apply races, repeated spending limits, default inspected assets, pinned replacements, changed asset content, transitive HUD and rig dependencies, coordinator receipt preservation and incremental worker resume. Providers and native adapters in these regressions are offline doubles. The new complete-path coordinator fixture also uses a compiler double. Separate existing check stages exercise the actual Luau compiler.

New browser checks exercise the persistent proposal and retained failed-request draft on desktop and mobile. They use mocked API responses. They establish renderer behavior, not successful model interpretation or Studio integration.

## Failure record

Evidence is retained under `docs/results/conversation-planning/`.

- `red-reset.log` reproduces the original deletion of a saved artifact after a theme-only chat edit.
- The initial unit run recorded 15 failures and 1,486 passes. Several old assertions expected destructive clearing or a reopened allowance. Those were changed to assert retained content and invalidated approval. It also exposed missing initialization of the empty completed-task list, which was fixed.
- Early focused runs preserve fixture contract mistakes and implementation failures. None are presented as successful verification.
- The first browser preflight failed when a server-only proposal import reached Node's JSON loader. A recovery import introduced the same issue into the first full check. Recovery now lives with storage and does not import runtime generation schemas into browser fixture helpers.
- `full-check1.log` passed 1,508 unit/API tests and all stages through production smoke, then failed browser test discovery. It is not a full pass.
- `preservation-review-red.log` reproduces three further defects found during review: clearing an old approval before successful migration, accepting a no-op patch as a new revision, and omitting upstream rig contracts from asset reuse. The corrected focused run passed 59 tests.
- `full-check2.log` passed 1,509 unit/API tests and the remaining non-browser stages. Browser results were 162 passed, one failed and one intentional mobile resizer skip. Final source changes after its unit stage required another complete check.
- That browser run also exposed a startup race. A prompt submitted before the first delayed status poll could skip proposal generation and remain behind the connection gate while a slow project-list read kept the UI busy. Creation now requests service capabilities directly and does not wait for the list refresh. A desktop/mobile regression exercises submission before that first poll. Browser checks use a fresh isolated data directory per run and preserve prior directories.
- `full-check3.log` stopped at unit tests with 1,511 passes and one failure. The exact status-response assertion lacked the new `proposals` capability. The assertion was updated and its focused test passed. Later stages were not run in that attempt.
- `stale-repair-red.log` records acceptance of repair against a retained stale artifact. The corrected endpoint rejects it and requires the approved incremental build path. Both that test and the incremental failure/resume test pass in `stale-repair-green.log`.
- `startup-regression.log` passes four desktop/mobile cases covering submission before the first status poll and the previously failing welcome path.
- `full-check4.log` passed 1,513 unit/API tests and every non-browser stage. Browser results were 164 passed, one failed and one intentional skip. The accessibility test sampled the existing Add model entrance animation at partial opacity. `dialog-animation-diagnosis.log` reproduces contrast failures with the fade paused at 60 ms and zero violations at its 140 ms endpoint. The test now waits for the dialog animations to finish before scanning. Both desktop and mobile cases pass in `dialog-accessibility-green.log`. No UI colors were changed.

Previous generated screenshots and guard/production results were copied into `pre-check-artifacts` before the full check overwrote shared output paths. Original research failure records and recordings were not edited.

## Cost and runtime

New paid inference calls: 0. Actual new cost: $0. New reservations: $0. Mock usage exists only in temporary test projects.

Existing live-run accounting remains $3.192232 against the original $4.40 cap, leaving $1.207768. Previous unknown-cost holds remain preserved. The last recorded provider balance is $2.062219352 at 2026-09-23T21:05:50.252Z and was not refreshed.

User Takko main PID 21316 and service PID 33316 were initially running from `release/takko-fighting-recovery-20260923-ready/Takko-win32-x64/Takko.exe`, with port 57226 still listening at 02:40Z. At 02:43Z neither recorded PID, any `Takko.exe` process nor port 57226 was present. This task did not stop, restart or replace them. The cause of their exit was not established. No shortcut, preset, credential, paused generation goal or paused v3 evaluation was changed. No paid retry, commit or push was performed. Check servers use owned isolated workspaces and close after testing.

Final runtime check at 02:52:17Z found no Takko processes or listeners on 4318, 4319, 4324, 4335, 4336 or 57226. The owned browser test service has exited. `final-runtime.json` records that observation. Existing packaged binaries were not updated with this workflow.

No Studio session was entered. No scripts, imports, probes or play mode were changed. The previous recorded Edit-mode baseline remains the last known native state. These checks do not establish successful Studio gameplay, animation permissions, sound playback, multiplayer behavior or model-generated game quality.
