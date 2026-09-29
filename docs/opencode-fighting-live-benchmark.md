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

Evidence: docs/results/opencode-fighting-live-20260924 contains the uncut35MB workflow video, screenshots, terminal project, original response events, per-call ledger, balance snapshots,12-assertion reproduction, full-check log and exit0. No original failure evidence was removed. An early latest-response capture was mislabeled as the first invalid plan but actually contains the correction. capture-audit.json records that error. The numbered implementation-plan extracts were corrected from the original timestamped events, which remain authoritative.

Final native observation in place122588481889475: Edit mode, no scripts, no Forge/probe/preview scopes and only the existing Terrain, Baseplate, SpawnLocation and Camera in Workspace. No original script needed restoration and no temporary import remained. No play session occurred. The installed cached plugin directory68657693815716 remains present, SHA256AD009C907A7E7764B225EBDB23EACD070716473D6BC1E58121ACB11244A3B1C5, and was not modified or loaded for apply. Its embedded version was not revalidated.

Owned service PID34532 on4335 and browser harness PID36032 were stopped. At19:08Z no listeners remained on4318,4319,4324,4335 or4336. Studio processes3088 and6604 remained. No user application was restarted or replaced.

Next engineering work is the general approved-reference-to-requirement binding and its planner/build regression, plus automatic recommendation selection. Preserve this failed benchmark when making that correction. A later paid continuation requires its own explicit authorization. This attempt cannot assess OpenCode coding quality or cost per working game.
