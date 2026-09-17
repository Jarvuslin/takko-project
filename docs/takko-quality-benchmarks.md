# Takko quality benchmarks

Date: 2026-09-15. Implementation: [suite and commands](../benchmarks/README.md), [case definitions](../src/benchmark/cases.ts), [research audit](benchmark-research-notes.md).

## What is ready

Takko now has an offline benchmark catalog, pinned starting projects, evidence validation, quality scoring, and controlled comparison tooling. It measures development tasks separately from complete games. It does not yet launch an autonomous generation → Studio → capture → score loop.

The user's three primary cases are below. These are original test briefs inspired by game categories, not claims that named Roblox games have been reviewed or that their assets can be reused.

| Tier | Primary case | What distinguishes it |
|---|---|---|
| Easy / presentation | ASMR interaction game | Relevant assets, visible interaction motion, satisfying physics/VFX, sound, UI and progression |
| Medium / complete systems | Collect-and-steal game inspired by the genre | Multiplayer, bases, collecting and stealing, authoritative economy, real saving, upgrades, rebirth and a coherent environment |
| Hard / game feel | Small fighting game | Combos, hitboxes, abilities, animation timing, VFX/SFX, cooldown UI, replication, camera response and polished combat |

The earlier six cases remain supplementary: an animated ability, Marketplace integration, replication repair, Crystal Hollow, round combat and a lantern adventure. The asset task and game cases use pinned starting fixtures. The animated-ability and replication-repair cases still need starter fixtures and native test harnesses.

The medium tier requires native multiplayer and service-backed saving/rejoin evidence. Mock storage tests can find logic defects but do not prove Roblox persistence works. If a private test experience and the necessary service access are unavailable, those observations remain pending. The hard tier must show both attacker and observer behavior; a visually convincing solo attack cannot establish correct hit detection or replication. The easy tier can animate the interacted objects; it does not need an unrelated avatar combat clip.

The full-game rubric weights mechanics, content depth, art, animation, UI, VFX, audio, feel, reliability, performance and intent. Mandatory gates prevent a high average from concealing broken progression, absent required features or unverified animation. Missing observations stay pending. Source inventories and primitive counts are diagnostic only.

Animation acceptance requires observing the relevant action, including anticipation, execution and recovery. A default walking animation or an unused asset ID is insufficient. Asset sourcing requires the actual query and considered candidates, selection or rejection reasons, permissions, import and native fit. A relevant, justified procedural fallback can satisfy the full-game sourcing process; it cannot pass the focused external-asset integration task.

## Current Crystal Hollow baseline

[Machine-generated baseline report](../benchmarks/runs/crystal-hollow-v2-retrospective-r2/evaluation/report.md) · [inventory](../benchmarks/runs/crystal-hollow-v2-retrospective-r2/inventory.json) · [historical native evidence](crystal-hollow-polished-native-verification.md)

| Observation | Evidence and limit |
|---|---|
| Harvest → sell → upgrade → goal, respawn and HUD | Passed in the earlier solo native session for the exact V2 artifact |
| Custom animation and audio | Authored inventory has no animation or sound assets, and source audit finds no corresponding action-animation/audio API references; this is not a new playback test |
| Environment | 183 primitive geometry entries, no mesh parts or declared external assets; primitive count does not determine art quality |
| Marketplace workflow | No attributable generation-time search/import record; exploratory searches made during this audit do not belong to that generation run |
| Two-tier progression, fifteen active minutes, touch, multiplayer, performance and calibrated polish | Not verified under the new protocol |
| Overall benchmark score | **Not issued**; required evidence is incomplete |

This artifact includes expert-authored visual and feedback revisions. Its cost and protocol were not controlled for this benchmark. It is a retrospective anchor, not an untouched worker result or a fair model ranking. The old generation brief explicitly excluded uploaded meshes, animation IDs and audio; it would be misleading to call compliance with that restriction a model failure.

## Main implementation limitation

Takko's generation providers currently request JSON bundles without an engine/Marketplace tool execution loop. The schema supports individual animation/audio/image/mesh records but not a general Model/Package import contract. The official Studio MCP search/insert tools available to this research session are not wired into the app's workers. This is an environment/tooling gap that the benchmark records explicitly.

The next production step is a bounded asset-discovery/import adapter with captured query results, exact identities, permission handling and native verification, followed by action-animation tools. Then run matched worker candidates from the same frozen fixture and prompt. Comparing models before equal tool access would confound model ability with missing infrastructure.

Run the primary cases in the user's order: ASMR first, collect-and-steal second, fighting third. Use the asset-integration micro-task to diagnose retrieval/import failures before spending a full-game run on them. Freeze each worker's first output, then measure its repair branch separately. Report per-case pass rate, observed quality, repair attempts, total measured model cost and elapsed generation/evaluation time across predeclared seeds; a single attractive result is not a reliable model ranking.

## How comparisons work

Keep untouched output, automated repairs and expert-assisted revisions in separate tracks. Freeze prompt, starting artifact, model/settings, pricing, seeds, tool and environment profiles before prospective runs. Preserve failures and all repairs. The proposed budget profiles are ceilings for future runs; creating this suite did not spend them.

Evidence manifests bind the submission and referenced local file bytes. They detect stale or changed evidence, not dishonest observations. Human review and trace inspection remain necessary. Matching metadata is necessary for comparison, but cannot establish randomized trials or statistically reliable rankings on its own.

Full-game observation uses one fresh session at 2, 5, 10 and 15 active minutes, with the case's declared player count: solo for ASMR and two real clients for collect-and-steal and fighting. Idle MCP waiting is excluded. A short game may use meaningful replay/mastery; timers and repeated grind do not prove depth. Additional device, reconnect, fault and service-backed persistence checks remain separate sessions and cannot be spliced into the longform clock.

The user selected these three benchmark archetypes rather than particular reference-game links. Other named reference games in the catalog remain proposed, unreviewed identities. No reference gameplay has been rated or copied and no commercial-quality threshold has been claimed. Captured, calibrated comparison segments are still needed before assigning aesthetic ratings.

## Validation boundary

`npm run check` passed: 311 unit/API tests, 10 desktop tests, 34 browser tests, plus Luau, mocked plugin, guards, build and production smoke. The final player-count protocol correction also passed 23 targeted benchmark tests and TypeScript. [Verification record](results/takko-benchmark-verification.json).

Automated checks cover the evaluator, evidence integrity, source inventory, asset provenance, fixtures and comparison tooling. They are offline software tests, not newly passed Studio benchmark runs. No paid model calls, asset purchases/imports, or changes to the user's active Studio play session were performed for this suite. Historical native observations remain labeled historical.

