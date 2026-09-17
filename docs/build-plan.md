# Forge: first implementation milestone

**Superseded direction:** the user rejected this narrow template milestone on 2026-09-13. Prioritize [generation diagnosis and the corrected architecture](generation-failure-diagnosis.md): varied user requests must drive mechanics, scene and presentation; a Studio plugin is required, with generation work first. Do not expand the old whole-game template approach or treat its passing infrastructure tests as generation success. The original milestone below is historical context.

The user authorized building on 2026-09-13 and requires a test for every implementation. Research remains historical evidence; it no longer blocks implementation.

This milestone delivers a local creator app, persistent versioned briefs, guided combat choices, an interactive browser HUD study, deterministic Roblox combat generation, downloadable Studio place, optional metered model advice and protected workflow tests. It is the first working slice of the larger Lemonade alternative, not feature parity.

Acceptance: restart-safe projects; stale edits rejected; edits invalidate approval; build requires explicit current approval; no invented asset IDs; server-controlled damage/cooldowns; generated Luau compiles; core combat rules execute in Luau tests; browser creation-to-export flow passes; unrun Studio tests remain pending. Real model comparisons require configured provider access. No Studio instance was connected when implementation began.

Tests cover domain transitions, budget accounting, provider protocol, API persistence/conflicts/export, generated files and combat behavior, plus desktop/mobile browser workflows. CI runs the same checks. Test results must distinguish offline rules, browser behavior and live Roblox behavior.

## Superseding implementation

Forge 0.2 now implements dynamic specifications, model-driven code generation, phase routing, validation/repair and an original Studio bridge. The original combat-only milestone above is historical; see [the replacement report](forge-v2.md).
