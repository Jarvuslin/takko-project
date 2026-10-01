# Current state

Updated 2026-10-01T02:28Z. Steps 1b–6 complete, final full rerun passed. Full trial no-go. Reports: docs/desktop.md, docs/results/trial-probes/RESULTS.md, docs/results/generalization/RESULTS.md.

## Live now

- Installed Takko main PID 28600, service PID 14992 on 127.0.0.1:51256. Both alive and /api/status returned 200 during final reporting. No running app stopped/restarted/replaced and no installation. Canonical data: %APPDATA%/Forge Desktop.
- Authorized Studio only: TrialReviewInspection.rbxlx, PID 33952, SDK id 216e6aaa-19c8-44d9-94f2-7341c2e69973. File .forge/exports/trial-review-inspection/TrialReviewInspection.rbxlx is a bare Workspace without baseplate/spawn, not a generated game. Final native census 02:15:49Z: Edit, zero scripts/scopes, two Workspace children. Detached imports destroyed, original scripts unchanged, SDK clients closed. No Play, save-over, publication or asset script execution. No test service started.
- Service-only candidate staged .forge/update-stage/app/Takko-win32-x64, not installed. Pack fixes are source changes, not in that bundle. Older stage retained .forge/update-stage/previous-staged-app after automatic approval review blocked deletion. Existing installed rollback and canonical data untouched. Disposable native parent-loss folder C:/Users/7474g/AppData/Local/Temp/takko-parent-loss-Gz4i9s remains because automatic approval review blocked its checked deletion.

## Results and verification

- Same-day 02:40–09:08 local sleep survived, /api/models read at 09:36 and alive at 12:19. Later service loss is an inferred wake-ordering race, not deterministic sleep expiry. Dedicated transferred IPC close is primary orphan signal. Late lease check allows a fresh heartbeat grace interval. Small redacted exit record added. Forced OS termination can bypass recording. Forced-ordering tests and real Electron port loss passed, not actual Windows sleep reproduction.
- Step 2 clean full check before paid: 1876 unit/148 files, 6 Luau, 16 plugin plus plugin/8 source compiles, 6 guards, CSS 0 errors/274 warnings, 21 desktop, production smoke, 107 browser, 10 Electron.
- Step 5 bound published events to pose digest and added selected-clip large-pack capture with explicit unchecked coverage and retained failures. Diagnostic manifests 27/48/262 entries. No positive marker fixture. Incomplete pack inspection still prevents readiness.
- Step 5 clean full check: build, 1885 unit/149 files, same Luau/plugin/guards/CSS/desktop/smoke stages, 108 browser, 10 Electron. No worker crash or rerun. Final check hit one Windows worker crash (1870 tests/148 files completed). One full rerun passed all the same counts, log test-artifacts/stratified-final-check-rerun.log. Original failure retained.
- Step 6 preregistration 4246139, seed 202610011, production frozen d9e7d90. 46 draws, 43 distinct selections, 22 paired comparisons, 0 false-ready flags. Raw false-block flag 1 is a single time-zero pose correctly blocked for no duration. Three paired wrong-role draws blocked. Twenty missing first-attempt censuses completed separately, all lacked animation content. Original failures retained, no replacements/retries/source changes. Eleven of 16 strata unfilled. No eligible attack clips, all four playback checks unrun. Asset generality remains unproven.

## Money and authorization

P-Review: one HTTP 429 admission rejection, no completion/tokens/retry. Observed billed delta $0, no receipt, conservative liability $0.749202 retained separately. P-Build: one session/two calls, receipts $0.1081545 (host rounds $0.108155), no submitted code. Second call exhausted 8192 output tokens on reasoning. No model code to compile/test/play. Live reservations $0.

Reconciled balance 2026-10-01T01:49:39.779Z: remaining $12.50254223, usage $17.49745777, limit $30. Decrease exactly matches both build receipts, earlier delayed balance preserved in report. Keys only in memory through DPAPI, no vault copy. Steps 5/6 cost $0.

Caps were review $1.25 and build $1.75, nontransferable. Both attempts consumed. No retries or further paid work authorized. Model quality and asset generality both no-go. $7.50 not validated. No qualifying new full-trial asset set. Original pair remains diagnostic only, never substitute it for fresh generality evidence.

## Next and paused

Stop after report commit. No full trial, install, publication or live shutdown. All older generation goals remain paused. Preserve deny-dispatch flags, vaults and uncertain outputs.

Next up only with appropriate authorization: builder output/reasoning policy and a new paid probe, acquisition/sampling that actually fills content strata, positive marker evidence and four native attack playback categories. Improve presence-only oracle metric to require playable duration before counting a false block. Timing-count editing remains outside this task.
