# Live motion selection passed confidence, build stopped before coding

2026-09-26 UTC. The single authorized $8 trial stopped at a new asset-picker gate. **Generated files: 0. Generated-Luau compiles: 0. OpenCode sessions: 0.** The rounded ledger cost was **$0.032012 across 32 calls**. No implementation plan or build was dispatched. No fix or retry followed.

Live animation selection cleared the unchanged 0.8 gate. The selected R6 `TWLeftPunch` scored **0.96**. The previously selected R15 punch scored **0.98**. The threshold was not the reason for the previous low-confidence outcome. This run also exposes questionable high-confidence passes, so confidence improvement is not proof of accurate classification across the pool.

Evidence is in [the run directory](results/opencode-motion-live-20260926/RESULTS.md), including [per-call costs](results/opencode-motion-live-20260926/COSTS.md), [every relevance answer](results/opencode-motion-live-20260926/SELECTION.md), [the gate](results/opencode-motion-live-20260926/gate.json), [terminal project](results/opencode-motion-live-20260926/terminal-project.json) and [browser recording](results/opencode-motion-live-20260926/workflow-raw.webm).

## Actual flow

Fresh project `c37e6413-1f3c-4c32-96a0-bb3edd07953b` used `.forge/opencode-motion-live-profile-20260926`. The exact positive-only user brief was retained. Saved execution mode was verified as `opencode` before inference. Sonnet 5 remained planner, builder and reviewer. Jev remained the bounded decision model. Project and generation caps were $8, fallback and paid repair were disabled. No policy or product code was changed.

Opening the project searched the Marketplace and assessed 30 dummy options, 46 animation clips and 30 sound listings. Thirty Jev requests returned all 106 assessments. One further Jev request interpreted the brief. One Sonnet request produced the proposal.

Discovery finished before the proposal existed. The recommendation-saving branch in `src/marketplace/discovery-routes.ts:276` only executes when a proposal already exists. The UI retained the earlier discovery and displayed all asset slots as unresolved. Reusing that discovery returns early at line 113. No additional search or paid reassessment was attempted.

I manually selected exactly the model's three recommendations through the existing UI, including its chosen animation clip. This is an assisted confirmation attempt, not a substituted asset choice. Saving those choices failed during inspection. No selections were committed to the project. The local browser choices and failure are retained in the recording, screenshots and browser-control results.

The proposal also left two mechanics questions open and introduced optional embellishments. A minimal-default edit was prepared, but its precondition failed after asset saving failed. It was **never submitted** and cost $0. The original proposal remains intact. There were **zero Approve & build actions**.

## Before and after relevance

| Group | Historical batch confidences | New selected candidate / clip | New confidence | Passed / assessed |
|---|---|---|---:|---:|
| Dummy | 0.21, 0.33 | Training Dummy #1245720733 | 0.84 | 3 / 30 |
| Punch animation | 0.24, 0.44 | #14056318312, `1/15/2`, TWLeftPunch | 0.96 | 33 / 46 |
| Hit sound | 0.35, 0.59 | Punch impact #101355487033225 | 0.89 | 13 / 30 |

The historical scores came from choosing among batches. The new scores are individual yes/no relevance gates. They are not a controlled calibration comparison. The new animation scores ranged from 0.05 to 0.98. None of the 106 assessments was skipped for oversized evidence. All returned answers, probabilities, confidence values, gate outcomes, vote priors and picks are preserved in `per-candidate-relevance.json`. Jev's response schema does not return prose reasoning, and none is invented here.

The chosen animation came from the highest-voted passing pack, with Wilson prior 0.798503. Confidence broke a tie among clips from the same pack. It is a 0.4167-second R6 raw clip with no Tool in the captured hierarchy. Its left-arm rotation range reaches 1.8272 radians on one axis, with smaller leg motion and substantial torso rotation. The motion data and browser preview support a punch interpretation, but native character integration and gameplay were not tested. The same pack's `TW idle` passed at 0.89 and `TWRightKick` at 0.96. Those are suspect classifications requiring review, not evidence that every passing clip is a punch.

All sound candidates had a zero vote prior. Confidence therefore selected the sound among ties. Sound relevance used listing metadata, not waveform or listening evidence.

## Capture candidates and evidence limits

The ten vote-ranked dummy candidates were 1245720733, 8767186735, 12765857120, 429667421, 10191860833, 92960550414449, 8437874389, 13523053019, 79115138 and 391957147. All ten retained geometry captures.

The ten animation candidates were 14056318312, 2801965424, 10445897943, 6125989440, 12061946559, 9280156718, 6180231127, 80460719695191, 2857718572 and 8606219519. Nine retained usable packs, containing 46 assessed clips. #9280156718 was absent from the retained discovery. The live route does not preserve the discarded pack or its exact rejection reason, so this report does not claim to know that reason from this run.

The sound group's first ten listings were 96359585058783, 132504023010884, 82235785832022, 101232234433592, 126895218143022, 121339611256342, 106216110417159, 98954842300721, 79476956608476 and 117196306739226. No audio content was captured by discovery. Thirty listings were assessed.

`search-ranking-snapshot.json` contains a read-only repeat of the same public searches immediately after capture. It is not an intercepted original search response. `automatic-before-proposal.json` retains the actual production options, captured evidence and assessments. Together these expose the ranking and retention limits without silently reconstructing missing evidence as an observation.

## Exact stopping gate

The UI error was:

> The World m1, heavy punch, barrage, animations needs a source review. Choose another option or Find later.

The retained native inspection explains why:

> Inspection is incomplete: AssistantCommand:15: Asset exceeds 3000 inspected instances

The chain is:

1. `src/marketplace/studio.ts:548` stops inspection at 3,000 instances. The snapshot is explicitly incomplete.
2. `src/marketplace/inspection.ts:52` turns incomplete coverage into a review finding. The resulting inspection is `review_required`.
3. `src/marketplace/discovery-routes.ts:609` rejects the selection before saving attachments or choices.

The partial snapshot contains 1,207 Poses, 1,307 IntValues and 174 Keyframes. It reports zero scripts in the inspected portion. That does not establish there are no scripts in the uninspected remainder. The “source review” message hides that this was a coverage limit rather than a detected source-code finding.

Animation preview allows a 10,000-instance walk at `src/marketplace/animations.ts:96`. The complete-pack inspector has the lower 3,000-instance bound. Thus the product can preview and recommend a pack that the approval path cannot accept. This gate runs **outside any model correction callback**. It checks actual structured inspection completeness, not a syntactic proxy, and does not involve a model judging withheld evidence. Self-correction calls and cost were zero.

This is before the acquisition pipeline. Its safe-failure continuation could not run because the reference could not be approved. The publishing limitation itself was not the rejection reason. The raw animation's Studio-only publishing limitation was visibly displayed in `03-automatic-animation-preview.png` and `animation-preview-ui.txt`. No alternate published pack, fallback candidate or Find later substitution was made. The user required stopping at a new gate, so the run ended here.

## Cost and unmeasured stages

| Phase | Calls | Rounded USD |
|---|---:|---:|
| Asset relevance | 30 | 0.009908 |
| Jev brief interpretation | 1 | 0.000048 |
| Initial proposal | 1 | 0.022056 |
| Proposal edit | 0 | 0 |
| Implementation planning | 0 | 0 |
| Asset acquisition and adaptation | 0 | 0 |
| OpenCode coding | 0 | 0 |
| Independent code review | 0 | 0 |
| **Total** | **32** | **0.032012** |

Actual provider account usage increased **$0.031999248**, which differs from the conservatively rounded per-call ledger by **$0.000012752**. Before dispatch, funds were **$15.695328280**, key allowance **$14.187806806**, at **2026-09-26T19:51:19.852Z**. After reconciliation, funds were **$15.663329032**, key allowance **$14.155807558**, at **2026-09-26T19:57:53.111Z**. There are no active reservations or new unknown billing holds. Historical accounted spending is **$6.098676**, preserving earlier holds. Every call and conservative reservation is listed in COSTS.md. Balance polls completed in batches, not one independent provider read per fast Jev call.

OpenCode used **0 of 48 exchanges** and did not start its **900-second deadline**. Neither ceiling bound the run. Coding cost, real generated-Luau compilation, the hit counter implementation and final blocked-requirement artifact/UI remain unmeasured. The real compiler was configured, but no generated files reached it. No claim of a working game is supported.

## Verification and cleanup

Per the user's instruction, every baseline `npm run check` stage and all three offline CLI replays were skipped. The user's independently reported baseline remains 1,583 tests in 107 files and 171 browser passes with one intentional skip. Those are not results produced by this trial. No product implementation or regression-test change was made.

The browser harness recorded a 60-second wait failure after the UI retained the rejected selection dialog. The queued edit then failed its local precondition. Both failures are preserved. No browser page errors were recorded. They are distinct from the actual application inspection gate.

All **5,484 pre-existing result files** in the preservation manifest remained hash-identical. Original failure evidence was not overwritten. The selected asset's complete retained inspection record, raw model responses, project, reservation log, balances, UI screenshots and recording are saved separately.

Owned service **PID 46452 on port 4335** exited through its stop-file mechanism. Its browser exited. No listeners remained on 4318, 4319, 4320, 4324, 4335 or 4336. Studio **PID 6604**, instance `ca13ff86-472b-4f75-82a8-b2300a2d1b76`, remained in Edit mode. Before and after inventories contained zero scripts and zero Forge/Takko scopes. Detached imports were destroyed. There were no original scripts to restore. No gameplay, apply, user-app restart or paused-goal resumption occurred.

The unspent cap is not authorization for another paid run. Any future change should first reproduce this preserved picker-to-inspection failure offline, including the pre-proposal discovery ordering. This report makes no change to those paths.
