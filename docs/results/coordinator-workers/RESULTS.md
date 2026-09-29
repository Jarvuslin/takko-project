# Coordinator workers verification

## Evidence boundaries

All inference in these checks uses local fixture responses. No paid model calls were authorized or made. Actual inference cost and new reservations are $0. Fixture accounting entries are synthetic, not provider charges. The last recorded key balance, $4.994992 at 2026-09-20T23:34:36.757Z, is stale and was not refreshed. No key values were read or output.

These checks establish orchestration, validation, persistence, compilation and user-interface behavior for the exercised cases. They do not establish live model judgment, game quality, measured truncation reduction, lower cost or Roblox Studio gameplay. The final artifact remains ready to test, with Studio acceptance pending.

## Automated checks

Final `npm run check` passed every stage in `logs/coordinator-full-check-3.log`: 1,434 unit/API tests across 92 files, six Luau scenarios plus four source compiles, 14 plugin mock groups plus plugin/eight injected source compiles, six guard cases, TypeScript/Vite, 14 desktop tests, production smoke and 153 browser tests. One intentional mobile horizontal-resizer test is skipped. Browser duration was 8.1 minutes. No check stage was skipped. The successful rerun used unchanged production and test source after the preceding Windows worker crash.

The 16 coordinator regression tests cover planning checkpoints, changed-brief rejection, architecture provenance, dynamic task ordering, dependency gates, task splitting without dropping requirements, interrupted and failed workers, budget preflight, durable decisions, failed-assembly recovery, successful repair accounting, atomic completion, review checkpoints and new Studio feedback. The separate capacity regression covers 39 required requirements plus an optional requirement without exceeding 40 protected acceptance tests.

The coordinator integration unit fixtures mock compilation. The API and packaged checks compile fixture Luau with the actual compiler. Browser tests exercise the application default through a local HTTP model fixture and verify saved/interrupted worker history on desktop and mobile.

Preserved earlier runs:

- `coordinator-unit-initial.log`: 1,412 passed and five failed across 90 files. Legacy fixture suites did not produce the new outline, area and decision protocol.
- `coordinator-api-first.log`, `coordinator-api-diagnosis.log` and `coordinator-api-second.log`: intermediate fixture diagnostics and failures, retained without rewriting history.
- `coordinator-targeted.log`: 51 passed across four files before later recovery and capacity cases were added.
- `coordinator-browser-first.log`: preflight failed while two nullable TypeScript expressions in new test code were still being corrected.
- `coordinator-browser-second.log`: two targeted browser tests passed.
- `coordinator-full-check-1.log`: 1,433 unit/API tests and every pre-browser stage passed. Browser results were 151 passed, two failed and one intentional skip. The two failures were the desktop/mobile HTTP-provider fixture attributing a clarification answer to the original request, which hid the expected clarification-source label. Failure artifacts remain in `.forge/coordinator-full1-evidence/`.
- `coordinator-full-check-2.log`: a Windows Vitest worker exited unexpectedly with code 3221226505 in `tests/api.test.ts`. There were 1,424 passed tests out of 1,434, 91 passed files out of 92 and one worker error. Later check stages did not run. The unchanged suite was rerun.
- `coordinator-capacity-first.log`: the completed capacity regression passed. During its authoring, an optional zero-test review exposed an inherited schema minimum. The production schema now uses a fresh bounded array rather than adding a second minimum check.

## Packaged executable

Final candidate: `release/takko-coordinator-workers-20260922-ready/Takko-win32-x64/Takko.exe`.

`native2/report.json` passed on that actual packaged executable with its own disposable profile and a localhost fixture model. It created a coordinated project, saved an outline and planning area, approved the specification, delegated the build, compiled generated fixture code and acceptance-test source, performed independent review, finished at ready to test and exported a place file containing the fixture's Harvest state. All four worker receipts completed. Coordinator decisions were delegate, review and finish. The UI displayed the saved assignments and reported zero uncaught renderer errors. Its isolated service used port 62324 and the harness closed the app and fixture server afterward.

`native1/report.json` also passed on the provisional package before the final review-capacity schema correction. It is retained as intermediate evidence, not the delivered build. `native2/coordinator-ready.png` captures the delivered candidate, with a UI-only connection fixture to inspect the offline run's activity. No Studio connection or gameplay is implied by that fixture.

`package-hashes.json` confirms all 34 packaged resources match `dist-desktop`, with equivalent package metadata after the packager removes the private flag. `source-sha256.json` records 350 production, test and build-input files, unchanged through packaging and native verification.

After the final full check passed, the desktop `C:/Users/7474g/OneDrive/Desktop/Takko.lnk` shortcut was updated to this executable. Its taco icon was retained and the prior shortcut was backed up to `.forge/coordinator-shortcut-before.lnk`. `shortcut.json` records the verified target. The user must close and reopen Takko to load it. The running application was not restarted.

## Studio and process boundaries

No Studio session was operated. No scripts were changed, no temporary imports or probe scopes were created and no play-mode changes were made. No Studio cleanup was required. The paused v3 evaluation and old generation goal remain untouched. Only owned disposable test apps and servers were launched and closed. At 2026-09-22T18:58:39Z the existing user app PID33760 and helpers 22032, 26252 and 26448 remained on the older surgical-UX executable. No listeners remained on 4318, 4319, 4324, 4335, 4336, 4359, 58479 or isolated native ports 56725 and 62324. All 350 source hashes still matched. No user process was killed or restarted. No commit or push was performed.
