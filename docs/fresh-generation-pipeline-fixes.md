# Fresh generation pipeline fixes

The pipeline fixes and final full check passed. Paid generation remains paused. This work changes Takko's pipeline, not the saved fighting game. The original missing-counter observation was not reproduced in the scratch session. The old environment still fails visual review.

Authorization: the user's `fresh-generation-prompt.md` and earlier `fix-prompt.md`. Skills used: systematic debugging and roblox-visual-capture. No paid inference, app restart, or hand-edited generated game is counted as a result.

## Changes

| Item | Implementation | Evidence and boundary |
| --- | --- | --- |
| Base world | A shared captured Baseplate contract supplies the exporter and bridge payload. The plugin bootstraps a missing foundation transactionally, preserving an existing baseplate and lighting. All planning and execution phases receive the ground-at-y=0 contract. | Actual Studio default-template capture, two preserved game outputs, plugin mocks. Installed plugin was not replaced and native push was not tested. |
| Layout and lighting | Builder submission and repair validation reject duplicate ground slabs, unsupported elevated spawns, roof/wall enclosures without requested spatial scope, and dense bright PointLight clusters. The same checks appear in review and final evidence. | Actual fighting-game scene fails. The real butter-stage request retains its requested stage. These are bounded declarative-scene heuristics, not proof about runtime-created geometry or rendered quality. |
| Retained physics | Captured BaseParts, anchors and joint references produce assembly evidence. The owning builder must choose an explicit integration decision for unsupported visible parts. `anchor_all` changes only the exported delivery copy. Deliberate dynamics remain pending native verification. | Real retained dummy and non-combat geometry. Original retained archives remain unchanged. Static joint evidence does not prove stable native gameplay. |
| Source packs | Fresh animation/audio needs preserve `deliveryRole: source_data` even when acquired as a Model. New integration records place these packs in ReplicatedStorage. Builder paths and exports derive from the same record. | Actual producing `buildAssetNeeds` output, retained animation evidence and exported path gate. Version 1 records and already accepted need hashes remain compatible. |
| Clip selection | Removed the first-clip fallback. Unresolved automatic choices are cleared while explicitly pinned user choices remain. Preview data remains available. Relevance receives per-variant identity and stores uncertain separately from rejected. | Real punching and non-punching packs through offline API tests. No new paid relevance judgement was made. |
| Core decisions | Unrequested consequential limits surface as unresolved proposal questions. Concept questions have stable identities and answered limits do not resolve unrelated ones. Explicit closed user scope is respected. Animated sequences require one selectable Animation need per declared step. Mechanics edits can change these slots while preserving other needs. | Real saved proposals, approval rejection, answer reuse, closed-scope regression, and explicit three-step choices against two preserved games. Language recognition is bounded and may ask conservatively. It is not a general semantic classifier. |
| HUD evidence | Builder guidance requires runtime PlayerGui, visible ancestry, safe insets, responsive bounds and validated incoming state. UI requirements retain a pending native-visibility check. | Actual scratch screenshots show a visible counter and an input-driven increment. No unsupported claim that the user's missing-counter defect was fixed. |

The scene and physics failures run inside task/repair correction validation. They are not new terminal gates after an accepted model response. Jev remains a bounded non-coding decision route. Budgets and retry policy were not expanded.

The retained relevance trace contradicts the shorthand that all clips were rejected as irrelevant. The first three recorded responses chose **yes**, with probabilities 0.86/0.88/0.87 but confidence 0.72/0.76/0.74. The existing 0.8 confidence admission threshold made them ineligible. Per-variant identity had been withheld while other motion evidence was supplied. The fix supplies that identity and records the uncertain state honestly. It does not lower the threshold, substitute votes for evidence, or prove that another paid judgement would now pass. All 165 preserved responses remain in `preserved-relevance-responses.json`.

## Baseplate provenance

The source is the installed Studio **0.740.0.7400927** default Baseplate opened through the documented [RunScript CLI](https://create.roblox.com/docs/studio/command-line-interface#run-a-script). Omitting a place opens the default template. The read-only probe captured its actual instances and properties into `docs/results/fresh-generation-fixes-20260928/baseplate-template.json`, used by `src/generation/baseplate-template.json`.

Observed Baseplate size is 2048×16×2048 at (0,-8,0), so its top is y=0. Lighting includes Brightness 3, ClockTime 14.5, GlobalShadows true, Ambient and OutdoorAmbient 70/255. Sky texture references, Atmosphere, Bloom and SunRays values also come from that capture, not invented defaults.

An initial template probe failed because its script directory was not ready. The retry succeeded. The blank probe place remains Edit. The installed third-party plugin binary still matches the recorded 2.2.4 snapshot. This does not establish that the updated Takko plugin source has been installed.

## Native visual observations

Scenarios and exact cameras are in `docs/VISUAL_TESTS.md`. Images are under `refs/captures/`, outside protected run evidence. All game inspection used scratch copies.

Lighting isolation used four eye-height angles for each individual treatment, restoring the original state between treatments. Enabling shadows alone and setting both ambient colors to zero did not remove the washout. Disabling the four PointLights did. The independent reviewer still failed every treatment as finished art. This establishes the lights as a contributor. It does not isolate overlap from individual intensity or prove the check's three-light threshold.

The four-angle verified-base-world comparison also failed. Adding the template alone left washout and worsened floor separation where the generated slab met the baseplate. The generated geometry must change through the builder. No patched screenshot is presented as new generation quality.

The untouched user-patched export was copied to `.forge/fresh-fixes-scratch/Counter-Scratch.rbxlx`. In Play, HitCounterHUD existed directly in PlayerGui, was Enabled, and its frame/label were Visible. An initial native input sequence showed Hits: 0 to Hits: 2. A separate resolution pass showed Hits: 0 to Hits: 1 after F input. Only character positioning was moved to bypass walking. Scripts were not edited.

Device simulation requested 1920×1080, 2560×1440, 3440×1440 and 960×540. Observed camera heights differed by 1–3 pixels. Saved captures are reduced Studio viewport images, 742 pixels wide, not full-resolution player-client images. The counter was visible in all seven reviewed matrix images, with weak ultrawide readability at the reduced size. Missing and malformed remote values left Hits: 1 intact. Only the malformed case has a separate image. One still was captured during a live resize sequence and cannot prove every transition frame.

Detailed native state and exact probes are in `counter-matrix-native-state.json`. The invalid `ScaleToFit` enum attempt is preserved there. The valid mode was `FitToWindow`. The original iPhone device, dimensions, orientation, density and scaling were restored after stopping Play. Scratch globals were cleared. Original lighting and cameras were restored after the earlier Edit captures, and all inserted template instances were removed.

Independent reports under `docs/results/fresh-generation-fixes-20260928/`:

- `lighting-independent-review.md`: FAIL for finished environment quality.
- `base-world-independent-review.md`: FAIL, template alone does not repair generated geometry or light use.
- `counter-independent-review.md` and `counter-matrix-independent-review.md`: limited PASS for visible counter screenshots, not the user's original session or a separate player client.

## Verification

Final `npm run check` exited 0 on 2026-09-28. Log: `docs/results/fresh-generation-fixes-20260928/check-final-rerun.log`. No stage was skipped. All 396 recorded source files remained unchanged during the final rerun.

| Stage | Actual result |
| --- | --- |
| TypeScript and Vite | Passed |
| Unit tests | 1,670 passed across 120 files |
| Offline Luau | 6 scenarios passed and 4 sample sources compiled |
| Plugin mocks | 15 groups passed, plugin and 8 injected sources compiled |
| Guards | 6 scenarios matched expected acceptance/rejection |
| CSS lint | 0 errors, 556 warnings |
| Desktop | 14 tests passed |
| Production smoke | HTML, bundle, API and unknown-route checks passed |
| Browser | 171 passed, 1 existing mobile pointer/keyboard resize skip |

These offline and browser checks do not establish Studio gameplay. Build warnings include chunk size and an externalized `node:crypto` import from a shared schema module. Inspection confirmed that the unused scope helper and crypto call are absent from the delivered browser bundle. Logs preserve failures instead of replacing them.

An intermediate full check passed 1,667 unit tests and all remaining stages, including 171 browser passes and one existing mobile skip. A later scope regression required three additional tests. The next full check stopped with one Windows Vitest worker crash in `asset-choices.test.ts`, exit code 3221226505, after 1,636 passes out of 1,670. Later stages did not run in that attempt. `check-final.log` preserves it. The complete check was rerun on unchanged source rather than counting the partial run as success.

The broad first unit run had **43 failures and 1,622 passes in 120 files**. Failures exposed old-approval compatibility, a mock builder that ignored the new actual physics obligation, and historical export fixtures incorrectly re-rendered with the current exporter. The correction preserved approved hashes, made the model double consume the producing context, and retained independent catalog pins for immutable old fixture bytes. The four-file rerun passed **97 tests**.

Meaningful failing regressions were recorded for base-world delivery, scene checks, first-clip selection, relevance context, proposal admission, answered scope questions and explicit closed scope. Not every new helper test was authored before its implementation. The physics helper tests in particular were added with the implementation, so this is not a claim of universal red-first development. Intermediate fixture mistakes and the failed plugin mock setup remain in their original logs.

Three pinned OpenCode 1.18.31 replays use the real CLI and host tools with offline external responses. They execute 13/10/9 tasks and produce 7/4/5 synthetic files in 28/22/20 exchanges. They inspect the actual task context for baseplate and lighting guidance and exercise the actual scene checker against preserved defective geometry. The explicitly narrow request must not receive new scope questions. Two additional fresh-proposal replays run preserved outputs through real proposal orchestration and save unresolved combo/attack questions before approval. The punching and sword-pack API regressions separately verify that unresolved clips stay unselected. These are mock replays, not real generations.

The first expanded replay set falsely expected a slab rejection even for the saved request that explicitly asked for a plain floor. That assertion failure is retained. A later fresh-proposal replay exposed overbroad questions about an explicitly closed scope. The production guard and regression were corrected, then replays were rerun. A synthetic compatible-provider profile initially recorded estimated mock charges despite zero external spending. Its zero-rate replacement makes the final replay ledger accurately zero.

## Prepared run, approval required

Exact request, unchanged:

> A fighting game where the player punches a stationary target dummy. Include a punching animation, a punch/hit sound when the player hits the dummy, and an on-screen counter that increments on each successful hit.

| Route | Saved profile ID | Model |
| --- | --- | --- |
| Proposal/planning, OpenCode builder, reviewer, repair if separately authorized | `72d540d6-c2ef-4d7d-b07b-9bc6311adff1` | `anthropic/claude-sonnet-5` |
| Bounded non-coding decisions | `c79f8a33-b1d8-4f69-bcc7-6a04a37206f2` | `typesafe/jev-1.13` |

Saved settings use no automatic repair resumes. The selected preset is `00000000-0000-4000-8000-000000000001`. No profile or budget was changed. Any future run must use current source in an isolated service without restarting a user's running app.

Ledger-derived expectation: **about $3.50 for one fresh run**, with **$8 proposed hard cap**. The actual first build's 42 OpenCode exchanges cost $2.002795. Historical planning, asset work, that build and its first review totaled $3.478858. The review failed, so this is a spending reference, not a completion guarantee. The later successful reviews cost $0.282600 and $0.304204. The full 276-charge project total was $6.570267 and includes two later build resumes. New context, different clip selection or choosing a combo can change token use. This estimate does not promise a successful export within the expected amount.

Fresh read-only OpenRouter balance at **2026-09-28T05:38:16.619Z**: key **$15.625646434**, account **$17.133167908**. The proposed $8 cap fits. The source receipt is `balance-final-readonly.json`. The earlier read remains separately preserved. Part 1 spent **$0 on paid inference**.

Before build approval the user must answer consequential questions, including single punch versus combo and the number of steps if a combo is chosen. Asset review must select the desired clip from **“punching animation 2”**, not model 1. Multiple steps require separate selections. The user also reviews dummy and sound choices, then uses one Approve & build action. No paid request may be dispatched until this run and cap are explicitly authorized. Costs, reservations and remaining balance must be reconciled per call. No automatic retry of a failed trial. The user tests the generated export. Nobody hand-edits it to satisfy this goal.

## Preservation and handoff

The active saved project and original export match the previous task's SHA256 records. All 99 protected reference-finish files matched before restoration. All **14,112 prior evidence files** match the pre-work manifest after archiving and restoring **23 test-written artifacts**. Scratch files remain byte-identical to their respective source exports. Receipts: `verification-final.json`, `protected-project-hashes.json`, `scratch-file-hashes.json` and `evidence-restoration-1790573914750.json`.

All four currently connected Studio instances were read-only checked as Edit after scratch cleanup. The original PIDs mentioned in older continuation entries are no longer present in the connected list. This task did not stop them or infer their prior mode. Paid generation, earlier goals and the saved project remain paused.

Final process snapshot at 2026-09-28T05:38:46.587Z: Studio PIDs 12924, 18552, 33276 and 46120. Scratch places are PIDs 18552 and 46120. No listeners on 4318, 4319, 4320, 4324, 4335 or 4336. Test-owned services exited. No Takko process was restarted. Preserve `.forge/runtime-diagnostics-profile-20260927`, the original exports, all protected run evidence and `.forge/evidence-backup-fresh-generation-fixes-20260928`.
