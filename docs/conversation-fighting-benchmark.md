# Fighting-game live benchmark

2026-09-24 UTC. The live benchmark failed to reach code generation or gameplay. The cumulative budget guard stopped internal planning before the VFX/SFX worker could dispatch.

The user's exact fighting-game prompt was submitted through the normal current-source UI, using real providers and the connected Studio test place. Evidence and per-call accounting are in `docs/results/conversation-fighting-benchmark-20260924/`.

## Observed so far

The proposal described punching, impact VFX/SFX, a stationary target dummy and a once-per-hit counter. A theme-only chat edit preserved the mechanics, environment/layout, all asset search groups, attachments and cumulative generation boundary exactly. Three ordinary mechanics decisions were initially left unresolved, then resolved through chat.

Automatic Marketplace recommendations failed to select any of the four groups. The current Jev relevance policy requires confidence of at least 0.8 for every candidate batch. The observed groups were all uncertain. This remains a failed part of the benchmark. Manual selection through the normal asset picker was used as an explicitly recorded fallback.

Saving those selections exposed a general identity bug. Creator Store searches returned an update timestamp, while inspection returned the same timestamp plus a version ID. Comparing their differently prefixed identity strings falsely reported changed content. Previewing again did not update the option's saved metadata, so the recovery instruction could repeat the failure.

## General correction

Asset comparison now uses the identity actually known at listing time. An existing version must still match exactly. Otherwise a nonempty unchanged timestamp can establish continuity while inspection adds a stronger version identity. Successful preview, recommendation and selection paths retain that version. Genuine later version changes remain rejected. Selection metadata changes commit only after the entire selection validates.

No fighting-specific condition, asset ID, generated script or scene was added to product code. Three regressions use a fishing-pond request and generic fixture assets. All three failed before the correction. All 28 asset-choice tests passed afterward.

Full `npm run check` exited 0 in `full-check1.log`. It passed 1,516 unit/API tests across 95 files, 6 offline Luau scenarios and 4 source compiles, 14 plugin mock groups and plugin/8 injected compiles, 6 guard cases, CSS with 0 errors and 556 existing warnings, TypeScript/Vite, 14 desktop tests, production smoke, and 165 browser tests with one intentional mobile resizer skip in 7.8 minutes. All 346 source hashes remained unchanged during the check. No stage was omitted. These are offline checks, not gameplay evidence.

The isolated benchmark service was reloaded to load this correction. The user app and packaged binaries were not changed. In the live UI, the same four manual selections then saved successfully with actual inspection identities and the exact embedded R15 clip. One Approve & build action accepted revision 4 and started internal planning at 03:24:10Z.

## Limits and accounting

The original total cap remains $4.40. Prior accounted spending including unknown-cost holds was $3.192232, leaving $1.207768 for this attempt. At03:16:37Z new charges were $0.064984, leaving $1.142784 of that cap, with no active reservation at that instant. Provider balance was $1.997241266. Twenty calls settled with provider receipts: 12 Jev decisions and 8 Sonnet proposal/planning calls. New accounted cost $0.798722. Prior accounted $3.192232, including existing unknown-cost holds, remains intact. Total accounted $3.990954 of $4.40. Remaining authorized cap $0.409046. Active reservations 0. No new unknown-cost hold. Provider balance $1.263503974 at 2026-09-24T03:32:45.775Z. The balance decrease was $0.798715378, consistent with upward whole-microdollar rounding of individual receipts. No paid call was dispatched for the budget-blocked VFX/SFX worker. No failed generation retry or cap increase occurred.

The initial Studio state was Edit mode in place122588481889475, with the original baseplate objects and no scripts in ServerScriptService, ServerStorage, ReplicatedStorage or StarterGui. No game has been applied. Final verification confirmed the same Edit-mode state, no scripts, no temporary imports and no Forge/probe scopes. All owned services and browsers stopped. Studio PIDs6604/3088 remain. The user app, installed plugins and packaged binaries were unchanged.

## Terminal result and preserved evidence

Five planning workers completed: the coordinator outline, environment, dummy integration, animation/input and server-authoritative hit/counter contracts. No complete plan, generated code, scene or native game resulted. The budget-blocked VFX/SFX worker was never dispatched, and HUD planning did not run. All proposal sections, selected references, original generation boundary and completed planning receipts survived the failure. No automatic retry occurred.

The uncut workflow-raw.webm, screenshots, all UI commands/results, native final observation, full-check log, failed/green regressions, per-call COSTS.md and RESULTS.md remain in the evidence folder. Browser page exceptions:0. Automation locator failures and the one isolated-service reload remain in the recording and timeline.
