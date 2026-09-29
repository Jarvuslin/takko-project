# Export produced, but the exported dummy lookup is broken

2026-09-27T23:57:28.925Z. Project 8a81efe9-b8ed-44bc-a21a-5aad132813ac. Authorized attachment 9b3d53fa-9398-42ce-b57d-71178a94d52f, one existing-project resume with additional $4 cap.

Normal export returned HTTP 200 and wrote **D:/RobloxProjects/Roblox Gen/Takko-Fighting-Review-20260927.rbxlx**. The model review cleared all three original blocking checks. A subsequent free structural check of the actual exported XML failed. **This is not a successfully verified playable game.** Work stopped without another repair or paid dispatch.

## Export failure, verbatim

> Error: Retained content missing from export

The assertion expected the dummy at the path used by DummySetup and PunchConfig:

`Workspace/Forge_8a81efe9b8ed/Assets/dummy/dummy/Imported/Training Dummy`

The actual exported Model is:

`Workspace/Forge_8a81efe9b8ed/Assets/dummy/dummy/Training Dummy`

There is no Imported child. DummySetup waits for that missing child. PunchValidator follows the saved PunchConfig path and returns no dummy. Consequently the exported code cannot reach the intended placement or confirmed-hit feedback through those lookups as written. This is a static source/XML finding, not an observed Studio session.

The first rejected dummy submission used the actual exported path but cited a descendant not accepted as a coverage reference. Its accepted correction added Imported, matching the pre-existing PunchConfig path. Both submissions remain in the trace. The task validator, compiler and model reviewer did not catch the disagreement with the exported hierarchy. Do not fix this by another paid trial or by editing the saved review result.

## Four requested changes

1. Search-hint policy implemented across evaluator handling, continuation context, provenance and bundle validation. Worker constraints alone cannot reject an approved reference. Blocking evaluator grounds need a supplied user source/quote or native capability evidence. Native safety/import gates remain. Unverified fit stays visible. Historical failed acquisition records are unchanged. Safely inspected approved media remain provided references, never falsely relabelled retrieved. Models and meshes still require retained hierarchy evidence. Primary asset failures no longer pollute every related requirement.
2. PunchValidator now creates Sound 126976659766267 and plays it on server-confirmed hits alongside the counter update. The dummy lookup defect prevents that branch from being reached in the exported hierarchy as written.
3. New DummySetup anchors BaseParts and calls PivotTo at (0,3,15). Its extra Imported lookup prevents this setup from running against the exported hierarchy. Target-dummy coverage no longer contains the sound rejection rationale.
4. PunchController traverses the exact approved clip path. The path from actual retained-component context exactly matches the generated lookup and the exported KeyframeSequence. No descendant search remains. Registration uses the returned ID unchanged. Playback was not observed.

Only dummy_placement, punch_validator_server and punch_input_client reopened. Two original files changed and one setup script was added. PunchConfig, PunchRemotes and HitCounterHUD remain byte-identical. Proposal, selections, acquisition evidence, scene, generation budget and all prior 245 charges are unchanged. The only spec change is host registration of DummySetup under its owning task. No replanning, reselection, reacquisition, route changes or saved-profile edits occurred.

## Verification and limits

- Preserved-output regressions first reproduced hint rejection, copied dummy coverage and forced reacquisition. A second red reproduction found the separate bundle-validation gate. Intermediate compatibility-test failures and a missing fixture sourceUrl type error were corrected and retained in logs.
- Focused final tests: 139 passed in four files.
- Final full npm run check: 1,633 unit tests in 114 files, six offline Luau scenarios and four sample compiles, 14 plugin test groups plus plugin/eight injected-source compiles, six guard cases, CSS zero errors/556 warnings, TypeScript/Vite, 14 desktop tests, production smoke, 171 browser tests passed/one skipped.
- An earlier full check also passed. The final full check was necessary because bundle validation changed after the earlier unit stage. No source changed during or after the final check.
- Three pinned-CLI mock replays passed at $0: 28/22/20 exchanges, 13/10/9 tasks, 7/4/5 synthetic files.
- All six actual generated Luau files compile independently and match the final artifact hashes.
- Export XML is well formed, 939,679 bytes, and the root/evidence copies are identical. Three KeyframeSequences are present, including the exact approved one. Six generated scripts plus one retained animation-pack Note script are present. The dummy-path assertion FAILED as detailed above.
- All 13,906 protected prior evidence files remain hash-identical. Twenty-four overwritten test artifacts were separately archived before restoration. Failed submissions and the export failure remain preserved.

OpenCode 57c4993b-1165-4740-a7a0-b797074b19f7 completed with exit 0, signal null, from 2026-09-27T23:37:45.456Z to 2026-09-27T23:49:24.330Z. It saved all six task checkpoints. Reviewer medium finished normally with 77,832 input tokens, 14,854 output tokens including 7,481 reasoning tokens, finish reason stop. Application checks: 40 passed, three pending, zero failed. Pending items concern publishing, audible fit and Studio testing. Four reviewer warnings remain: HUD controller placement, audible-fit verification, spawn placement, and distance-only hit detection. Full warnings are in verification-summary.json. The subsequent export check contradicts readiness of the dummy integration, and the saved stage/review were not rewritten to hide that discrepancy.

No native Studio gameplay, animation playback, audible fit, multiplayer behavior or quality pass is established by these offline results.

## Cost and process state

30 coding calls: $1.533030. One reviewer call: $0.304204. No paid planning, selection or acquisition. Rounded receipt total $1.837234. Provider account delta $1.837219800, rounding difference $0.000014200. Full per-call reservations and charges are in COSTS.md and ledger.json.

At 2026-09-27T23:52:52.242Z, account remaining $7.133167908 and key remaining $5.625646434. Active reservations zero, unknown new calls zero. The original cumulative $8 generation allowance remains intact. Unspent additional authorization is not permission for another run.

Owned service PID 6340 on port 4335 was stopped normally. Ports 4318,4319,4320,4324,4335,4336 have no listeners. Studio PID 6604 stayed running. No Studio session was opened or modified, so its mode was not re-inspected. No bridge apply, probes, imports, script edits or modifications to place 122588481889475. No user-app restart. Runtime directory C:/Users/7474g/AppData/Local/Temp/takko-opencode-kAqWPI is retained.

## Opening the artifact

Open D:/RobloxProjects/Roblox Gen/Takko-Fighting-Review-20260927.rbxlx directly in Studio and press Play to inspect it. The exported scene contains ground, ceiling, four walls, a spawn, four point-light fixtures and the retained dummy. Intended controls are approach the dummy, then left click, F or controller R2. The dummy-path failure described above must be resolved before those controls can complete the intended hit loop. I did not run this file in Studio.

Evidence copy: docs/results/approved-reference-finish-20260927/game.rbxlx. SHA-256 8a701b7a46dbb2c15b3b0b49559544ec05be26bd9b521edbd38599c65307d17d. Preserve all evidence in docs/results/approved-reference-finish-20260927/, especially export-structure.json, export-dummy-path-failure.json, export-verification-failure.txt, traces/, failed-checks.json and terminal-project.json. No second repair was dispatched. Audio selection duration signals and repeated relevance passes remain deferred.
