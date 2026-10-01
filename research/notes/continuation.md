# Current state

Updated 2026-10-01T03:35Z. New P-Review 2 and P-Build 2 attempts consumed. Full trial no-go. Report: docs/results/trial-probes/RESULTS.md. Final full check passed, no model repair or paid retry.

## Live and data

- Installed Takko main PID 28600, service PID 14992 on 127.0.0.1:51256, canonical data C:/Users/7474g/AppData/Roaming/Forge Desktop. No restart, install or replacement.
- Reported models.json ENOENT was not reproducible. Service command line still uses canonical user-data-dir. Settings read successfully with five profiles, last written 2026-09-30T04:51:05.441681Z. Eight project JSON files parse. Vault exists (456 bytes), decrypts through existing DPAPI code, last written 2026-09-30T04:14:46.1449347Z. Earlier error cause unknown. No path fix, restore, move, copy or canonical write occurred. Keys stayed in memory.
- Only authorized Studio: TrialReviewInspection.rbxlx, PID 33952, SDK id 216e6aaa-19c8-44d9-94f2-7341c2e69973. File .forge/exports/trial-review-inspection/TrialReviewInspection.rbxlx is an empty inspection place, not a Baseplate template or generated game.
- One new Play session installed the unmodified four model files, known clip/target and temporary R6 floor/spawn setup. First mouse-input request failed through the bridge. Native holds, grace and hit counts remain unverified. Cleaned at 03:25:11.505Z: Edit, zero scripts/scopes, two Workspace children. Owned StarterCharacter, floor/spawn, assets and scripts removed. No asset scripts, save-over or publication. SDK closed, no native test service remained.
- Service-only candidate remains staged .forge/update-stage/app/Takko-win32-x64, not installed. Later pack and coding-policy fixes are source-only. Older stage .forge/update-stage/previous-staged-app and disposable C:/Users/7474g/AppData/Local/Temp/takko-parent-loss-Gz4i9s retained after earlier automatic approval deletion blocks. Installed rollback and canonical data untouched.

## Current findings

- Policy commit d2ac499 applies 32768 output/medium effort to OpenCode coding. P-Build 2 confirmed that policy on the real requests. No production changes in this probe task.
- P-Review 2: one HTTP 200, stop, parsed and host-valid. 91627 input, 4596 output, 0 reported reasoning. Ten returned test sources compiled, not executed against a game.
- P-Build 2: one session, three calls, one code submission. 35963 input, 19868 output including 8394 reasoning. Four files compiled and passed bounded AST checks. Original contracts 18/20 passed, including all 13 boundaries and segment 5. One failure assumes pending remains after a hit, separate cached-time diagnostic confirmed early rejection/dedup. Real failure: server accepts at end+0.351 because generated lateSlack extends the required 0.35 grace. No hand fixes. Native input failed, no second Play session.
- Canonical evidence: docs/results/trial-probes/p-review-2 and p-build-2. Earlier attempts remain unchanged.
- Asset generality remains no-go from frozen d9e7d90/manifest 4246139: 46 draws, 43 distinct assets, 22 comparisons, 0 false-ready flags, 11/16 strata unfilled and zero eligible attack playback. Pack fixes bound published events and selected-clip coverage, not arbitrary-asset readiness.
- Service diagnosis remains inferred wake-ordering race, not deterministic sleep failure. IPC close and wake grace fixes were tested/staged only.

## Money

New review cost $0.229214, build $0.2537187, total $0.4829327. Build host micro-rounding $0.253720. No live reservations. Read-only balance 2026-10-01T03:26:03.531Z: remaining $12.01960953, usage $17.98039047, limit $30. Delta exactly matches new receipts. Prior build spend $0.1081545 remains historical. Original rejected review retains separate $0.749202 conservative liability, observed billed delta $0.

Both new authorized attempts consumed. Caps $1.25/$1.75 nontransferable, no further paid work or full trial authorized. $7.50 plausible only under explicit bounded cost scenarios, not a validated full-game budget.

## Verification and next

New full check passed once without crash/rerun: build, 1889 unit/149 files, 6 Luau, 16 plugin plus plugin/8 compiles, 6 guards, CSS 0 errors/274 warnings, 21 desktop, production smoke, 108 browser, 10 Electron. Log test-artifacts/probes-2-full-check.log. Separate model contracts remain 18/20, native input failed. Live main/service/Studio PIDs confirmed alive at final reporting.

Stop after report commit. No install, live shutdown, full trial or old paused goal resumption. Follow-up requires appropriate authorization: server grace-policy correction and new model test, contract pending-state interface clarification, native input bridge diagnosis, then representative asset acquisition/coverage. No qualifying new full-trial asset set. Keep original pair diagnostic only. Preserve vaults, failures and deny-dispatch flags.
