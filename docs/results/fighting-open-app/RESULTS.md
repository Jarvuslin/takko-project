# Open Takko fighting-game run

Final result: **FAILED before game generation**. Planning recovered after an explicitly approved timeout retry. Optional asset discovery blocked the first build assignment. No game scripts or scene were generated, applied or functionally playtested.

Detailed diagnosis: [fighting-open-app-evaluation.md](../../fighting-open-app-evaluation.md).

## Runtime and scope

- Date: 2026-09-23 UTC, live actions approximately 04:14–04:47.
- Existing user Takko main PID 21316, service PID 20144, port 64808. Executable `release/takko-fighting-recovery-20260923-ready/Takko-win32-x64/Takko.exe`.
- Actual profile project `c7540d7b-8984-49fc-af34-fc36876784f1`, revision 6. Scope `Forge_c7540d7b8984`.
- Studio `ca13ff86-472b-4f75-82a8-b2300a2d1b76`, Untitled Experience placeId 122588481889475, process 6604.
- Native desktop UI for initial brief and previews. Later Playwright UI attached to the same actual service, without a second Takko instance.
- No source implementation changes in this run. Existing model profile timeout changed to 600000ms through the supported API, with 32768 output tokens and provider-default reasoning retained.

## Acceptance outcome

| Stage | Outcome |
| --- | --- |
| Brief understood | Core requirements recognized, but four concept calls kept approval blocked |
| Autonomous brief approval flow | Failed. Disclosed direct-brief API workaround used |
| Real Marketplace discovery | Passed for dummy, punch animation, SFX and VFX candidates |
| Asset approval buttons | Worked after alternative dummy selection |
| Web animation preview | Visible selected embedded clip motion and scrubbing |
| Native VFX candidate preview | Visible emitter burst, isolated probe only |
| Native audio candidate preview | Loaded and playback metrics advanced, captured audio effectively silent |
| Planner | Completed after 120s timeout and user-authorized retry at 600s deadline |
| Architecture | Seven nodes/seven edges, 27 requirements, 11 tasks. Missing explicit input-client implementation task |
| Build | Failed on optional backdrop discovery. No generated files or scene |
| Native game apply/playtest | Not reached |
| Hit counter, misses, respawn, attack timing | Not reached |
| Native R15 Animator playback | Not reached |
| Small-window conversation | Failed with four asset attachments, 16px scroll area |
| Connection status | Marketplace connection worked. Separate apply/test plugin not connected, wording confusing |

## Checks

`npm run check` completed with exit code 0. Log: `full-check.log`.

- 1442 Vitest unit/API tests across 93 files.
- 6 offline Luau combat scenarios and 4 source compiles.
- 14 plugin mock groups, plugin plus 8 injected-source compiles.
- 6 guard cases.
- TypeScript and Vite production build.
- 14 desktop tests.
- Production HTTP smoke check.
- 153 browser passes and 1 intentional mobile horizontal-resizer skip, 9.1 minutes.

Separate targeted deadline verification: `npx vitest run tests/generation-request-deadline.test.ts`, 13 passed in one file. These tests cover the existing configurable deadline, cancellation and unknown-charge reservation behavior. They do not measure native gameplay or guarantee successful paid inference.

## Cost reconciliation

Original authorized evaluation cap: **$4.40**, including the prior failed truncation trial of **$0.024778**.

Current project has 16 recorded model attempts. Fifteen have confirmed provider-reported charges totaling **$1.134977**. One 120-second timeout has unknown usage and retains its full **$0.429472** conservative reservation as an estimated charge. Current-project accounted amount: **$1.564449**. Including the prior trial: **$1.589227**. Remaining conservative authorization: **$2.810773**. No live reservations remain. No paid retry was dispatched after the build failure.

The planning/build generation allowance remained **$4.275818**, excluding the first four concept calls and the prior trial, so it did not expand the original total cap. The retry authorization and before/after model configuration snapshots are retained.

Provider key balance was **$4.414362 at 2026-09-23T04:14:44.734Z** and **$3.196806 at 2026-09-23T04:47:01.678Z**, a decrease of **$1.217556**. This exceeds successful current-run receipts by **$0.082579**. That difference may include delayed timeout billing, but no per-call receipt proves the attribution. It remains unresolved and is covered by the larger conservative timeout amount. Do not relabel the full timeout reservation as an actual invoice or silently release it.

`ledger.json` contains every per-call reservation, charge, billing source, token count and UTC time. `ledger-events.jsonl` preserves accounting as it changed. `balance-*.json` preserves provider balance observations. `COSTS.md` gives the per-call table.

## Evidence and harness limitations

- `all-responses.jsonl`: original project trace, including model and asset pipeline responses.
- `concept-deadlock-project.json`, `concept-responses.jsonl`, `direct-brief-workaround.json`: preserved concept failure and disclosed bypass.
- `completed-spec.json`, `project.json`, `partial-artifact.json`: completed plan and empty build artifact.
- `47-minimum-window-loaded.png`, `minimum-layout-metrics.json`: composer overflow reproduction.
- `42-native-vfx.png`: actual native candidate effect, not a generated game screenshot.
- `50-build-failure.png`: live failure UI.
- Native audio WAV files and capture JSONL preserve effectively silent outcomes. No audible playback pass is claimed.
- Native harness had transient window-handle/capture errors. An accidental capture of an unrelated foreground browser was deleted immediately and is not part of this evidence. Subsequent UI work avoided global desktop input.
- Browser harness had a stale button-label locator and a 15s connection-wait timeout. Later observation confirmed the connection completed. Neither is silently counted as a product pass or as a proven permanent connection failure.

## Cleanup and retained state

Studio is in Edit mode. Temporary `TakkoEvaluation_c754_Assets` and `TakkoEvaluation_c754_Audio` scopes were removed. Final read-only check showed Workspace Terrain/Baseplate/SpawnLocation/Camera, empty ServerScriptService/ReplicatedStorage/StarterGui/ServerStorage and no probe audio. Original scripts were never changed. No generated game exists in the place.

Owned audio capture helpers finished. Owned Playwright browser and accounting monitor were stopped. Full-check production/browser test service exited. User Takko PIDs 21316/20144 on 64808 remained alive and untouched. The user's failed project, full plan, failed worker receipts and timeout setting remain for review. Paused v3 trial and old generation goal remain untouched. No keys were printed or stored in plaintext. No commit or push.
