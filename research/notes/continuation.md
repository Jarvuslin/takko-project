# Current state

Updated 2026-10-01T01:49Z. Steps 1b–5 complete. Next is the fresh preregistered stratified $0 sweep. Reports: docs/desktop.md, docs/results/trial-probes/RESULTS.md, docs/results/generalization/RESULTS.md. Prior G4 is preserved diagnostic history, no longer the gate for the explicitly reauthorized probes.

## Live now

- Installed Takko main PID 28600, service PID 14992 on 127.0.0.1:51256. /api/status returned 200 at 01:46:33Z. Canonical data: %APPDATA%/Forge Desktop. No live process stopped/restarted/replaced and no installation.
- Only authorized Studio is TrialReviewInspection.rbxlx, PID 33952, SDK id 216e6aaa-19c8-44d9-94f2-7341c2e69973. Path .forge/exports/trial-review-inspection/TrialReviewInspection.rbxlx. Final step 5 census at 01:39:00Z: Edit, zero scripts/scopes, two Workspace children. All detached imports/rigs destroyed. No Play, publication, save-over or asset script execution. SDK clients closed, no test service started.
- Step 1b service-only candidate staged at .forge/update-stage/app/Takko-win32-x64, not installed. Later pack fixes are source changes, not in that staged bundle. Old stage retained at .forge/update-stage/previous-staged-app after automatic approval review blocked deletion. Existing installed rollback and canonical data untouched.

## Results and verification

- Service diagnosis corrected: same-day 02:40–09:08 local sleep survived, /api/models read at 09:36 and alive at 12:19. Later loss remains an inferred wake-ordering race. Dedicated transferred IPC close is primary orphan signal, late lease callback grants fresh heartbeat grace. Fixed redacted exit record. Forced OS termination may bypass it. 21 focused desktop tests and separate real Electron port-loss test passed, not an actual Windows sleep reproduction.
- Step 2 full check passed before paid calls: 1876 unit/148 files, 6 Luau, 16 plugin plus plugin/8 source compiles, 6 guards, CSS 0 errors/274 warnings, 21 desktop, production smoke, 107 browser, 10 Electron.
- Step 5: published events/loop data bind to actual pose digest. Large packs list cheaply and capture selected clips with explicit unchecked coverage. Errors persist without identical repeat capture. Native diagnostic manifests: 27/48/262 entries. Last pack retained its 315-frame failure, then captured a different selected 253-frame clip. Incomplete pack inspection still blocks readiness. No marker-positive fixture found.
- Step 5 full check passed: build, 1885 unit/149 files, same Luau/plugin/guard/CSS/desktop/smoke stages, 108 browser, 10 Electron. No full rerun. Focused test setup failures preserved. Logs test-artifacts/pack-fixes-full-check.log and pack-* logs.

## Money and authorization

P-Review: one HTTP 429 admission rejection, no completion/tokens/retry. Observed billed delta $0, no receipt, conservative liability $0.749202 retained. P-Build: one session/two calls, actual receipts $0.1081545 (host rounds $0.108155), no submitted code. Second call exhausted 8192 output tokens on reasoning. No code to compile/test/play. Live reservations $0. Balance at 2026-10-01T01:24:38.057Z: remaining $12.59694473, usage $17.40305527, limit $30. Only call 1 reflected then, with $0.0944025 additional receipted cost pending balance reflection. Keys only in memory through DPAPI, no vault copy.

Caps were P-Review $1.25 and P-Build $1.75, nontransferable. Both attempts complete, no retries or further paid work authorized. Model-quality verdict no-go, $7.50 unvalidated. Cost scenarios and assumptions are in the probe report. Do not use asset playback as evidence that the model produced code.

## Next and paused

Commit new seed/stratified manifest before any search, exclude every exposed/development ID, freeze production, retain all failed/duplicate/unfilled draws. Independent native oracle. Four attack playback strata if eligible, no substitutions. After runs restore Edit and record census. No full trial, install, publication or live shutdown. All older generation goals remain paused. Preserve deny-dispatch flags, vaults and uncertain outputs. Separate next-up: builder output/reasoning policy needs a new authorized probe, and timing-count editing remains outside this task.
