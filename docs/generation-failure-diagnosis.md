# Why Forge v0.1 produced an inadequate game

Date: 2026-09-13. Trigger: the user rejected the app's appearance, genre restriction and unanimated premade game, and requested generation diagnosis before Studio-plugin work. This diagnoses our implementation, not Lemonade's unavailable backend.

## Conclusion

The primary failure is architectural and product scope: the build does not generate a game from the user's requirements. It exports a small fixed combat template with three configuration choices. The missing animation, sound and mechanic variety were omitted by the implementation, not lost by a cheap model. Increasing model size or refining its current prompt cannot fix a build path the model cannot influence.

The earlier work substituted infrastructure correctness for the requested product outcome. The template may pass its narrow rule tests while remaining visually poor, mechanically incomplete and unresponsive to the request. It is not an acceptable baseline for claiming good generation.

## Reproduced evidence

Run `node --import tsx scripts/diagnose-generation.ts`. It executes the real create/revise/approve/build/export functions in memory and saves [the full results](results/generation-diagnosis.json). It makes no model calls and does not touch an existing Studio place.

| Probe                                                           | Observed result                                 |
| --------------------------------------------------------------- | ----------------------------------------------- |
| Boxing with stamina and a three-punch combo                     | Same exported place as the three requests below |
| Ranged fireballs, mana and an ice shield, explicitly no punches | Same place                                      |
| Sword animations, parries and round scoring                     | Same place                                      |
| Cooperative boss, dodge rolls, telegraphs and phases            | Same place                                      |
| Obby, racing and farming requests                               | All three rejected                              |
| Firefighting rescue about saving cats                           | Accepted by the combat keyword gate             |

The four contrasting combat requests produced **one distinct SHA-256 of the complete exported place**, with identical fixed palette/device/pace choices. This is stronger evidence than merely observing similarly styled outputs: the requested mechanic differences made no change to the output at all.

All accepted probe builds have zero selected assets, no `LoadAnimation` calls and no `Sound` instance creation in the generated sources. These scans support the direct source review; they are not a universal detector for animation or proof that Roblox's default character locomotion never runs. The specific omission is authored attack/ability animation and associated sound.

Three new tests in `tests/generation-characterization.test.ts` preserve these counterexamples. Their passing result means the v0.1 defects are reproduced. They are explicitly historical characterization tests and must change when the generator is replaced; identical outputs must not become a future quality requirement.

## Root causes and effects

### 1. User intent ends before code generation — critical

`src/core/project.ts` stores the request, checks `/fight|combat|brawl|duel/i`, and later invokes `generateArtifact(p.choices)`. The generation function receives no request, mechanics, entities, rules, asset plan or acceptance criteria. `src/core/recipe.ts` copies three fixed Luau files and writes one configuration module. Only title/palette, touch setting and strike cooldown vary.

Consequences: adding mana, racing laps, harvesting, ranged attacks or an enemy AI cannot affect generation. Removing the keyword restriction alone would make this worse: unsupported requests would silently receive the same fighter. Adding a handful of whole-game templates would still leave the central request-to-behavior problem unresolved.

### 2. The model is only a settings adviser — critical

`src/core/provider.ts` accepts only style/device/pace suggestions and an explanation. Its 500-token output limit and instructions match that narrow role. The build route does not call this provider. There is no code-writing model, dependency-aware planner, tool loop, retrieval stage, runtime feedback or targeted repair loop.

Even successful real advice would not implement a sword, spell or new game loop. Zero online model cost here is achieved by doing much less work than requested; it is not evidence of efficient AI generation or Astra-like quality.

### 3. The exported combat has almost no presentation or game feel — critical

The server selects a nearby visible target and immediately applies damage. Strike and burst run through the same routine with different numbers. There are no authored windup/active/recovery phases, animation markers, weapon motion, projectile travel, hit reactions, directional knockback, combat sound or camera feedback. The only hit presentation is a brief Highlight. The practice target is anchored geometry with a Humanoid, not a combat opponent with movement or decision-making. There is no round/win loop.

The client sends an action and waits for a server response to update cooldown text. There is no immediate local attack presentation. That introduces a latency-sensitive feedback gap by design; its actual severity needs a Studio measurement. Health changes update text, but the exported health element does not shrink like the bar drawn in the browser study.

These source omissions explain why a successful damage calculation still looks and feels like almost nothing happened. They do not establish specific engine bugs or measured frame rates.

### 4. Presentation choices are largely disconnected from the exported world — high

The place exporter creates an arena floor and spawn, while the server creates the practice target. It supplies no arena wall design, lighting setup, themed material system, environmental dressing or generated spatial composition. The palette mostly changes the HUD accent and hit flash, not the world shown in the browser illustration.

`src/web/App.tsx` contains an independent SVG arena illustration and browser-only HUD state. Its preview button deducts local preview health and uses a fixed 1.8-second cooldown, unrelated to the exported strike cooldown (0.45/0.85 seconds) or burst cooldown (4 seconds). It is labeled a study, but its visual prominence still creates expectations that the exported place does not satisfy. This was a product-design mistake, not just missing polish.

### 5. Discovery asks low-impact questions and ignores most of the request — critical

The UI asks palette, pace and devices. It never resolves the core loop, interaction style, viewpoint, player roles, win/fail conditions, ability identity or required assets. Approval validates the three settings rather than request coverage. Displaying the original request in a blockquote does not preserve it as executable requirements.

Missing animation/audio are listed as pending, yet the workflow reaches `built`. Honest labels are useful, but they do not fulfill a request where those features are essential. The new system must distinguish a delivered playable experience from a partial diagnostic artifact.

### 6. Tests protected the wrong success definition — critical

Existing tests check API behavior, persistence, XML/source integrity, cooldown/replay/range rules and browser interactions. Those checks are valuable but cannot establish a complete game, attractive UI or request fulfillment. Accessibility assertions test selected accessibility properties, not visual appeal. The five mutant-rule failures demonstrate validator sensitivity only for those five rules.

There was no test requiring different requested mechanics to produce different implemented behavior; no requirement-to-evidence coverage check; no animation-load/playback scenario; no native screenshot comparison; and no playability or visual review of the delivered scene. The new probes show that the existing suite can remain green while generation fails fundamentally.

## Corrected generation design

Keep revision protection, persistence, budget accounting and the export serializer as utilities. Replace the fixed genre gate, three-setting contract, whole-game recipe selection and browser illustration as a generation preview. Do not simply add more predetermined genres.

The core pipeline should be:

1. **Request and project context → structured specification.** Preserve explicit requirements with provenance. Represent entities, interactions, rules, goals, presentation, assets and constraints. Genre is a useful descriptive tag, not a finite permission list. Ask only questions that resolve consequential uncertainty; record delegated defaults separately.
2. **Specification → dependency and implementation plan.** Compose reusable capabilities such as input, cooldowns, inventories, checkpoints, vehicles and UI states where compatible. Generate bespoke modules when no component fits. Require explicit interfaces, server/client ownership and behavior contracts. A free-form label or more templates is not dynamic generation.
3. **Plan → code, scene and presentation.** Let a configured model produce bounded implementation changes using current Roblox references and relevant existing code. Use deterministic validation and construction where appropriate. Asset requirements include provenance, rig compatibility, availability and observed playback; do not fabricate IDs. Required custom animation must be supplied, authored or explicitly unresolved, not silently replaced by a Highlight.
4. **Execute → observe → repair.** Compile/analyze source, apply changes in an isolated Studio scene, run scenarios, capture the actual render and inspect relevant errors. Feed small failure packets back to the responsible implementation step. Bound attempts and total cost; stop repeated non-progress with a visible partial result.
5. **Evidence → delivery.** Track each requirement as implemented, verified, blocked or intentionally deferred. Missing a required mechanic or presentation feature prevents a full completion claim. Quality review includes the actual scene and interaction, not an unrelated SVG.

For example, a fighter needs timed attacks and responsive presentation; a racer needs vehicle control and lap rules; a farming game needs growth and harvest behavior. These emerge from the request's dependency graph. They should not all be forced through one combat schema or require a prewritten complete game of that type.

## Acceptance standard for the replacement

| Dimension           | Required evidence                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Request coverage    | Every explicit requirement maps to implementation and a behavioral or presentation check; omissions remain visible                         |
| Adaptation          | Contrasting requests change the relevant implemented mechanics, not merely names, colors or file hashes                                    |
| Dynamic composition | At least one held-out combination and one mechanic without a complete-game template work through the same generation path                  |
| Presentation        | Required animations/audio load and play in Studio; actions have coherent timing and feedback; actual scene captures match agreed direction |
| Playability         | A user can perform the core loop and reach an appropriate success/failure outcome; repeated use and lifecycle scenarios work               |
| Regression control  | Protected independent tests survive model edits and catch missing requirements as well as broken existing logic                            |
| Economics           | Measure total cost per accepted result, including asset work, tests, retries and user correction; compare models using the same system     |

Different source hashes alone are insufficient: a weak generator can rename variables without implementing a fireball. Held-out tests must exercise the actual requested behavior. Likewise, passing tests cannot establish fun or visual taste; use actual gameplay and blind human review for those outcomes.

## Plugin direction and sequencing

The user wants a Roblox Studio plugin. Build it as the execution/observation adapter for the same generation engine: project inspection, revision-checked source/scene edits, asset handling, test execution, captures and reliable result delivery. Model credentials and orchestration remain outside generated game code.

For this turn the priority is diagnosis and a corrected generation contract; no plugin or cosmetic rewrite was started. Design the engine/adapter boundary now, implement the request-aware generation path next, then use the plugin to close the real Studio verification loop. Plugin connectivity is necessary for that loop but cannot repair an intent-blind generator by itself.

## Verification of this diagnosis

The request replay and three characterization tests run against the current implementation, not mocks of its build path. `npm run check` was run after adding them. Offline rules and browser checks remain separate from Studio behavior. No new paid model benchmark or live Studio gameplay test occurred. The product output is not fixed by this diagnostic work.
