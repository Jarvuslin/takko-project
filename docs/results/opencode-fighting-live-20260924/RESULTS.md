# OpenCode fighting-game live benchmark

Run started 2026-09-24T18:56Z and failed at19:05:07Z before OpenCode or code generation. Final cost$0.548426, provider balance$0.715080368, reservations0. Full npm run check exited0. No gameplay pass. The initial progress record below is retained, followed by the settled final report and per-call ledger.

User authorized a fresh full paid run without the previous budget cap. Historical accounted spending $3.990954, including unresolved older holds, remains separate and preserved. New profile uses the existing settings ceiling of $100, with no reservation-budget override. The provider key started with $1.263503974 remaining at 18:55:47Z. No credit purchase or key-limit change.

Fresh project dadf61b9-fd8a-4a90-a66b-5e1a2251aca1 uses executionMode opencode. User prompt submitted through the normal UI: want a fighting game with punching animation, vfx, sfx, target dummy, hit counter for everytime you hit the dummy.

Proposal saved with mechanics, theme and environment and no unresolved user decisions. Automatic Marketplace recommendations selected zero of four groups. All four were marked uncertain. This fails the automatic selection criterion. To exercise the downstream build, the operator selected current returned Marketplace options using the ordinary UI, with no product special casing: Training Dummy1245720733, R15 Punching Animations12061946559 with inspected embedded clip1/1/18/1, Punch Impact1 audio132504023010884, Hit vfx m1 boxing86089736228455. This is an assisted benchmark.

One Approve & build action at18:58:43Z started implementation planning. Proposal and selected references persisted.

Initial Studio observation: connected instance ca13ff86-472b-4f75-82a8-b2300a2d1b76, place122588481889475, Edit mode, no LuaSourceContainers. Same previously authorized benchmark place. No generated game applied yet.

Native acceptance, if generation produces an applicable artifact: visible training area and dummy, player punch animation on actual input, hit VFX, audible SFX, HUD increments once per successful strike, no hit count for misses/out-of-range inputs, repeated punches and cooldown, reset and respawn behavior. Source inspection, generated test claims, offline tests and compiling do not establish these outcomes.

Owned test service PID34532 on4335. Owned browser harness PID36032 records the workflow. No existing app restarted. Full npm run check running with output in full-check.log. Final counts, per-call costs, provider balance and cleanup will be appended when settled.


# Settled final result

# OpenCode fighting-game benchmark

2026-09-24. The full-run attempt failed before code generation. No game was built or applied, and OpenCode never started. Lifting the previous spending cap did not remove the failure.

The user authorized a fresh paid benchmark with the original request for punching animation, VFX, SFX, a target dummy and a counter for each hit. The new project dadf61b9-fd8a-4a90-a66b-5e1a2251aca1 used the OpenCode execution mode and an isolated service. The prior failed project and all previous work were preserved. No product code or running user app was changed.

## Actual workflow

The normal UI created a complete persistent proposal with no unresolved user decisions. Creator Store returned four relevant groups, but Jev selected none. All groups were marked uncertain. This again fails the automatic recommendation requirement.

To exercise the build, the operator used the normal picker to select four current search results. Training Dummy1245720733, R15 Punching Animations12061946559 with embedded clip1/1/18/1, Punch Impact1 audio132504023010884 and Hit vfx m1 boxing86089736228455 were inspected and saved. This was an assisted benchmark, with no product hardcoding or manually authored game code.

One Approve & build action started implementation planning at18:58:44Z. The first plan call took289.577 seconds and cost$0.352534. It returned five null sourceId values rejected by the schema. The existing bounded correction attempt cost$0.168120. The corrected specification passed at19:05:07Z, with23 requirements and13 tasks, but the subsequent approved-asset handoff failed:

> Approved asset needs a linked requirement before building: Practice dummy #1245720733

There was no fresh trial retry after this terminal failure. Proposal, selections, specification, charges and failed replies remain saved. OpenCode runs0, completed coding tasks0, generated files0, Studio apply0 and gameplay tests0.

## Root cause and isolated reproduction

src/marketplace/approved-adapter.ts buildAssetNeeds identifies an approved asset's requirement by looking for the numeric asset ID inside requirement description or acceptance prose. The accepted plan instead identifies each exact asset in an assetNeed's constraints, with a valid requirementId. The guard ignores those explicit links and throws before the OpenCode builder can start.

For example, trainingDummyAsset references dummyInvulnerable and explicitly constrains acquisition to asset1245720733. The dummyInvulnerable requirement describes the behavior without repeating the number. All four selected assets have corresponding valid links. This is a host handoff defect, not evidence that the coding model cannot implement the game.

A saved-state offline reproduction passed12 assertions. It reproduces the exact failure without mutation, confirms all four asset-need links point to real requirements, and shows that repeating the same IDs in requirement prose in an in-memory clone clears this one guard. The clone was never saved into the live project. This is diagnostic evidence, not a product fix. The animation asset also exposes a representation difference between its approved Model pack and the planned Animation need. Later integration behavior remains untested.

The earlier adapter implementation report described compact planning as a design intent. This live attempt instead billed42,850 output tokens across two implementation-plan calls before generating any code. Those calls cost$0.520654. The intended cost improvement has not been established.

## Checks and cost

Fresh npm run check exited0. All stages ran:1,543 unit/API tests in99 files,6 offline Luau scenarios and4 compiles,14 plugin mock groups plus plugin and8 injected-source compiles,6 guard cases, CSS0 errors/556 existing warnings, TypeScript/Vite,14 desktop tests, production smoke and165 browser tests with1 intentional mobile resize skip in7.3 minutes. These checks passed despite the live handoff defect. They are not Studio gameplay evidence.

New actual cost$0.548426 over13 provider-reported calls:3 Sonnet calls$0.547418 and10 bounded non-coding Jev calls$0.001008. Active reservations0, no new unknown-cost holds. No OpenCode inference cost. Prior accounted spending$3.990954 remains preserved, including historical unknown holds. Combined historical accounted spending$4.539380. The old$4.40 authorization cap was explicitly lifted for this new run. The fresh profile used the existing settings maximum$100, and no provider credit was purchased or key limit changed.

Provider remaining balance$0.715080368 at2026-09-24T19:05:38.819Z, down from$1.263503974. The$0.548423606 provider delta matches the individually rounded ledger charges to within$0.000002394. Every call's charge and conservative reservation is in the evidence COSTS.md and ledger.json.

## Evidence and cleanup

Evidence: docs/results/opencode-fighting-live-20260924 contains the uncut35MB workflow video, screenshots, terminal project, original response events, per-call ledger, balance snapshots,12-assertion reproduction, full-check log and exit0. No original failure evidence was removed.

Final native observation in place122588481889475: Edit mode, no scripts, no Forge/probe/preview scopes and only the existing Terrain, Baseplate, SpawnLocation and Camera in Workspace. No original script needed restoration and no temporary import remained. No play session occurred. The installed cached plugin directory68657693815716 remains present, SHA256AD009C907A7E7764B225EBDB23EACD070716473D6BC1E58121ACB11244A3B1C5, and was not modified or loaded for apply. Its embedded version was not revalidated.

Owned service PID34532 on4335 and browser harness PID36032 were stopped. At19:08Z no listeners remained on4318,4319,4324,4335 or4336. Studio processes3088 and6604 remained. No user application was restarted or replaced.

Next engineering work is the general approved-reference-to-requirement binding and its planner/build regression, plus automatic recommendation selection. Preserve this failed benchmark when making that correction. A later paid continuation requires its own explicit authorization. This attempt cannot assess OpenCode coding quality or cost per working game.


# Live benchmark costs

2026-09-24T19:05:39.050Z. The user lifted the old budget cap for this fresh trial. Prior accounted $3.990954 remains preserved, including previous unknown holds.

| UTC | Phase | Model | Status | Reservation USD | Charge USD | Input | Cached input | Output | Billing |
|---|---|---|---|---:|---:|---:|---:|---:|---|
| 2026-09-24T18:56:45.518Z | planner | typesafe/jev-1.13 | ok | 0.002688 | 0.000034 | 805 |  | 184 | provider |
| 2026-09-24T18:57:17.461Z | planner | anthropic/claude-sonnet-5 | ok | 0.335878 | 0.026764 | 1227 | 0 | 2431 | provider |
| 2026-09-24T18:57:19.996Z | planner | typesafe/jev-1.13 | ok | 0.002688 | 0.000117 | 2784 |  | 216 | provider |
| 2026-09-24T18:57:20.174Z | planner | typesafe/jev-1.13 | ok | 0.002688 | 0.000114 | 2714 |  | 265 | provider |
| 2026-09-24T18:57:20.349Z | planner | typesafe/jev-1.13 | ok | 0.002688 | 0.000123 | 2926 |  | 216 | provider |
| 2026-09-24T18:57:20.526Z | planner | typesafe/jev-1.13 | ok | 0.002688 | 0.000109 | 2588 |  | 243 | provider |
| 2026-09-24T18:57:20.761Z | planner | typesafe/jev-1.13 | ok | 0.002688 | 0.000129 | 3065 |  | 216 | provider |
| 2026-09-24T18:57:20.939Z | planner | typesafe/jev-1.13 | ok | 0.002688 | 0.000121 | 2866 |  | 267 | provider |
| 2026-09-24T18:57:21.136Z | planner | typesafe/jev-1.13 | ok | 0.002688 | 0.000121 | 2870 |  | 216 | provider |
| 2026-09-24T18:57:21.343Z | planner | typesafe/jev-1.13 | ok | 0.002688 | 0.000106 | 2520 |  | 241 | provider |
| 2026-09-24T18:58:44.543Z | planner | typesafe/jev-1.13 | ok | 0.002688 | 0.000034 | 805 |  | 184 | provider |
| 2026-09-24T19:03:34.155Z | planner | anthropic/claude-sonnet-5 | ok | 0.436426 | 0.352534 | 19417 | 0 | 31370 | provider |
| 2026-09-24T19:05:07.767Z | planner | anthropic/claude-sonnet-5 | ok | 0.477432 | 0.168120 | 26660 | 0 | 11480 | provider |

New accounted $0.548426. Active reservations $0.000000. Provider remaining $0.7150803679999997 at 2026-09-24T19:05:38.819Z. Accounted charges are rounded up per call and unknown outcomes remain conservatively held. Charges and request/session IDs are retained in ledger.json and raw traces.
