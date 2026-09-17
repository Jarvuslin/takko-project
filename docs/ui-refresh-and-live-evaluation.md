# Forge UI refresh and live evaluation — 2026-09-13

## Design

Reference: [CTRLpotato](https://www.ctrlpotato.com/), inspected in a browser on 2026-09-13. Adopted the white canvas, bold dark headline, yellow marker emphasis, bright green outlined actions, rounded surfaces, and subtle yellow/green background tint. Forge retains its own branding, navigation, content, and workflow.

Applied the requested ui-ux-pro-max skill's design-system search and UX guidance. The reference took priority over the search's generic retro-futuristic recommendation. The implementation uses Manrope headings and DM Sans body text, SVG branding/icons, visible focus states, touch-sized actions, and reduced-motion support.

UX changes:

- Mobile project selector and URL-backed project restoration after refresh.
- Model dialog traps keyboard focus, closes with Escape, restores focus, and makes background controls inert.
- Arrow/Home/End navigation for project tabs.
- Searchable provider catalog with price-prefilled model selection.
- Explicit answer-and-replan action, stage indicator, live generation status, and provider-reported cost labels.

## Offline verification

`npm run check` passed: 73 unit tests, six retained legacy Luau scenarios, four plugin mock scenarios, guard checks, TypeScript/production build and smoke test, and 14 desktop/mobile browser scenarios. One full-suite attempt encountered a Windows worker process crash; a complete rerun passed. The browser tests include accessibility scans and viewport overflow checks, focus handling, project restoration, model catalog selection, clarification/replanning, and fixture-backed generation.

These tests do not establish live Roblox gameplay quality. The legacy combat fixtures are not this turn's generated farming game.

## Live experiment

User authorized OpenRouter economy-model tests with a $10 key limit. This session uses a $0.25 project cap and an initial total target below $1. Credentials stay in the tool session and local server memory; no credential is saved here or in source files. Published prices came from OpenRouter's model catalog.

| Model | Input/output USD per million tokens | Role tested |
| --- | --- | --- |
| Qwen3 Coder Next | 0.12 / 0.80 | Planning and building |
| Gemini 2.5 Flash Lite | 0.10 / 0.40 | Planning |
| GPT-4.1 mini | 0.40 / 1.60 | Planning and review |

The brief requests a small desktop/touch farming loop: three beds, planting, five-second visible growth, harvesting for coins, cream/green HUD, primitive farm scenery, server-authoritative per-player state and cleanup. It explicitly excludes persistence, monetization, external assets and audio. No questions are needed for this test brief.

Observed failures and fixes:

1. Cheap planners paraphrased or joined source quotations and violated task-path constraints. Semantic validation originally bypassed the correction loop. The loop now receives exact validation errors and previous output, with at most one correction per routed model and all attempts charged to the budget. Quotation validation still rejects invented evidence.
2. Forge incorrectly required scripts for scenery-only tasks. Scene-only tasks now accept an empty file list, must return actual scene objects, and can cite those objects in coverage.
3. Planner instructions now explicitly support choosing defaults, avoid redundant questions, and describe script placement and literal quotation examples.
4. OpenRouter's response cost is recorded directly when present, with conservative reservations retained for unknown usage. Bounded local response traces aid diagnosis without recording request headers or credentials.

GPT-4.1 mini returned a valid four-task plan on its first attempt after these changes. Qwen and Flash Lite did not complete valid plans in the earlier tested attempts. This is a small, evolving diagnostic experiment, not a controlled benchmark or proof of general model rankings.

The initial mixed-route build failed when Qwen omitted one of its owned test scripts. Its partial source also treated slash-separated manifest paths as individual child names, used `Part.Scale`, and kept shared bed state without player ownership. These are observed code defects, not estimated production incidence. The failed baseline is retained locally in `.forge/evaluation/qwen-baseline.json`.

The recovery loop now also handles missing/extra owned scripts, and plan validation reports all semantic errors together instead of stopping at the first missing requirement. A compact runtime reference supplies correct hierarchy access, part tweening, client UI initialization, per-player state and test-oracle guidance to all phases. Sources: [Instance lookup](https://create.roblox.com/docs/reference/engine/classes/Instance#FindFirstChild), [BasePart properties](https://create.roblox.com/docs/reference/engine/classes/BasePart), and [Roblox client/server security](https://create.roblox.com/docs/scripting/security/client-server-boundary). This is a curated reference, not a complete engine type checker.

A fresh GPT-4.1 mini plan attempt failed on unassigned global requirements before aggregate validation was added. The next build reused the previously accepted plan and switched all phases to GPT-4.1 mini with the runtime reference. Changing both context and model means this run cannot isolate the benefit of either change.

Additional corrections: missing empty patch collections default to empty arrays; a scene Name identical to its path-derived name is removed without changing conflicting names; coverage diagnostics identify missing object paths; reviewers receive every missing test requirement in their correction feedback; subsequent review can add tests for previously uncovered requirements while preserving existing tests and rejecting ID collisions.

## Final live outcome

**No human-accepted complete game was produced.** The last bounded repair still failed reviewer coverage for `testsIncluded`. Earlier review incorrectly returned no issues despite gameplay and test defects. The final artifact remains marked failed and normal export is gated. The accepted plan used four tasks, including game-test scripts; that architecture itself was poor because a normal Script cannot be imported as a ModuleScript. A future planner should separate runtime behavior, static constraints, and human visual criteria instead of asking a model for recursive tests of every meta requirement.

OpenRouter key usage delta: **$0.11567842**, remaining key allowance **$9.88432158**, from `/api/v1/key`. No more paid calls were issued after that reading. Failed calls and retries are included. The initial runs used token-rate estimates before provider-reported cost capture was added, so the key usage delta is the authoritative session total.

## Actual Roblox Studio inspection

Opened an isolated debug export, `.forge/evaluation/Forge-debug-farm.rbxlx`, of the failed candidate for diagnosis. This was a test copy, not a bypass of the product's normal export gate. Studio MCP connected after the place opened (`Forge-debug-farm.rbxlx`). The original Lemonade plugin displayed version 2.2.4; it was not connected or modified.

Observed using real Studio play mode, server/client inspection, and actual keyboard E input:

- Imported scene geometry and hierarchy successfully. Three beds and their soil parts had the expected dimensions and positions. This confirms this candidate's basic XML import, not every possible property type.
- HUD created and coins displayed initially as 0. Cream/green styling appeared, but instruction text was visibly clipped at the tested viewport.
- First planting created a crop. Server inspection measured intermediate size approximately `(1.397, 1.676, 1.397)` and a changing color; mature size reached `(2, 2.4, 2)` with the final green color.
- First harvest removed the crop and changed the server coin value from 0 to 5; the client HUD displayed 5.
- A second planting/growth/harvest cycle failed: the crop remained and coins stayed at 5. Source inspection explains why: harvesting connects only to the first dynamically created prompt, then stops watching. Subsequent prompts have no handler.
- Studio output reported `Attempted to call require with invalid argument(s)` in `FarmingTests` line 3. The generated test attempted to require a normal Script.
- Multiplayer isolation, leaving during growth, respawn, mobile Roblox interaction, and the original Forge plugin's apply/test flow remain unverified. No claim of Astra-equivalent quality is supported.

## Next engineering priorities from evidence

1. Model a gameplay interaction as a reusable lifecycle component with tested creation, repeated use, disposal and reconnect behavior. Evaluate two complete cycles, not one screenshot or first success.
2. Resolve Roblox APIs and instance references against actual Studio context and engine types; a small prompt reference helps but is insufficient.
3. Replace self-approved model review with independent Studio probes for each acceptance criterion. Keep static constraints and test-harness existence out of recursive runtime-test requirements.
4. Give repair the concrete Studio failure trace and affected component, then require the same failing scenario to pass. Do not spend on whole-game regeneration when a component can be patched.
5. Evaluate model routes on repeated, varied briefs with cost per accepted result. These exploratory runs changed multiple variables and cannot establish a causal quality gain or a universal best cheap model.
