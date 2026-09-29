# Fighting build retry and diagnosis

Status: **No end-to-end gameplay pass.** Paid retry interrupted on a false asset-integration claim. Source fixes, offline regression and unpaid native inspection are separate evidence. Main report: [fighting-build-recovery.md](../../fighting-build-recovery.md).

## Live run

- Isolated copy of project c7540d7b-8984-49fc-af34-fc36876784f1, revision 6, scope Forge_c7540d7b8984. Original failed user project preserved.
- Started 2026-09-23T18:30:05Z. Cancelled at 18:40:13.986Z after detecting an empty dummy being accepted as imported.
- Sonnet 5, 32,768 output allowance, provider-default reasoning, 600-second request timeout. No model downgrade.
- Optional backdrop blocker cleared. Arena ground, boundary, pedestal and spawn were generated in the saved artifact.
- Dummy worker first returned malformed JSON after about 309 seconds. Correction took about 38 seconds and declared a placeholder Model to be imported content. Coordinator accepted three completed assignments. No native import receipt supported the dummy claim.
- No timeout or truncation observed during this retry. No generated game applied to Studio.
- Saved partial state: project.json. Request timings and outputs: live-responses.jsonl. The malformed output is extracted to dummy-invalid-response.json. The older file named dummy-first-output.json actually contains the corrected reply. It is preserved with this clarification.
- Later fixes reject the saved phantom import and derive required native acquisition for dummy 1245720733, animation pack 12061946559, sound 132504023010884 and VFX 86089736228455. See preflight-replay.json.
- No paid generation after these later acquisition fixes. Further retry approval was requested within the remaining cap.

## Root causes corrected

Approved candidates were matched only by kind, the fixed approval pool was treated as a searchable catalog, the default request deadline was too short, approved asset IDs could pass as integrated model content, approved selections were absent from acquisition preflight, and native inspection did not receive the approval binding. Composer attachments also consumed nearly all conversation space.

Tests reproduce these defects and the diagnostic-write reservation accounting failure. Fixes preserve explicit model deadlines, output/reasoning configuration, scope checks and native inspection requirements.

## Verification

Final full npm run check exited 0. All stages ran: 1,449 unit/API tests in 93 files, six offline Luau combat scenarios and four compiles, 14 plugin mock groups plus plugin/eight injected-source compiles, six guard scenarios, TypeScript/Vite build, 14 desktop tests, production smoke, and 155 browser passes with one intentional mobile horizontal-resizer skip (9.3 minutes). Native Studio gameplay is separate and remains unverified. See full-check5.log.

Earlier full runs are retained:
- full-check.log: 1,443 unit passes, two assertion failures caused by duplicated attempt trace records.
- full-check2.log: 1,444 unit passes, one assertion expecting the old trace fields.
- full-check3.log: full pipeline passed before later acquisition changes, 155 browser passes and one intentional skip.
- full-check4.log: full pipeline passed before final native handoff/preflight changes, 155 browser passes and one intentional skip.

Focused reproductions and fixes: red.log/targeted.log/targeted2.log, layout-red.log/layout-green.log, trace-green.log, accounting-red.log/accounting-green.log, import-red.log/import-green.log, native-binding-red.log/native-binding-green.log, preflight-red.log/preflight-green.log. Crashed or failed attempts are not removed.

Final Windows package passed actual native Electron utility-process startup, invisible sandboxed renderer, local API, CSP and graceful shutdown. See native-package-final-smoke.log. All 34 resource files match dist-desktop. Package metadata differs only by the packager removing the private field. See package-hashes.json.

## Native inspection

The initial attempt failed because the native adapter had no scoped discovery record. native-import/error.txt and native-import.log preserve that failure.

After explicit scoped approval binding, the real dummy imported into quarantine and yielded 18 instances and one script. Static conversion correctly required full component review. Complete source/hierarchy and an archive were captured in native-import2. The respawn script is not suitable unchanged for an indestructible practice target.

The animation pack yielded 636 nodes and one script. Its complete review archive is retained in native-animation-probe despite the static converter's 300-instance cap. The inspected inventory has no published AnimationId. Previewed keyframes are not evidence of native Animator playback.

No imported scripts were executed. Both temporary imports and probe scope Forge_4cbb9300a271 were removed. Final native-final-state.json confirms Edit mode and baseline Workspace Terrain, SpawnLocation, Baseplate, Camera, with empty ServerStorage, ServerScriptService, ReplicatedStorage and StarterGui. Original scripts were unchanged.

No fist-input, hit-detection, counter, audible-SFX or native-animation gameplay pass. The separate Takko apply/test plugin connection was not verified. Browser tests use fixtures and are not native integration tests.

## UI and process state

Live fixed browser at 844×575 retained a 174px conversation viewport with four attachments, up from 16px. See composer-fixed-live.png. Browser errors are recorded separately. The bounded attachment and composer layout is regression tested on desktop and mobile.

Owned retry service PID 23852, port 51196, and its browser were stopped. Final package smoke closed its own process. Final browser test service port 4319 also closed. The user's older app main PID 21316 and helpers 7536, 29868, 33336 remain untouched, but no listener was found for them. Earlier service PID 20144/port 64808 is not active. Do not infer that the main app exited from the missing service. Studio PIDs 6604 and 3088 were observed. Recheck before touching any process.

Final package: release/takko-build-recovery-20260923-final/Takko-win32-x64/Takko.exe. Earlier provisional recovery package lacks later fixes and should not be delivered as final. Current user Models configuration is unchanged.

## Cost

See COSTS.md and ledger.json. This retry: eight confirmed calls $1.049888 and one unknown cancellation held at $0.552888. Entire evaluation: $3.192003 conservatively accounted, $1.207997 remaining of $4.40, no active reservations. Provider balance $2.062448 at 2026-09-23T18:53:12.031Z. Balance delta is not sufficient to attribute cancellation cost, so holds remain.

No plaintext credentials written or exposed. No commit or push. Paused earlier generation goals and unrelated dirty work remain untouched.


