# Research findings: a better system around cheap models

Research date: 2026-09-13. These sources supplement the [earlier source registry](09-generation-research-sources.md) and [cost/parity protocol](08-cost-and-parity-experiments.md). Published results below belong to their original tasks and model configurations. None is a measurement of Lemonade or Astra on Roblox.

## What the evidence changes

### Curated skills can help smaller models, but invocation matters

[SkillsBench v4](https://arxiv.org/abs/2602.12670v4) reports paired evaluation across 87 tasks and 18 model/harness configurations. Curated skills raised aggregate pass rate from 33.9% to 50.5%; focused sets of at most three modules outperformed larger bundles. Some smaller models with skills matched larger models without skills. This supports a focused Roblox skill experiment, not parity against a stronger model given the same skills.

[Vercel's Next.js evaluation](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals) found that an available skill often went unused. A compressed always-present documentation index performed better in that particular evaluation. It is a vendor experiment on specific APIs, not a universal ranking of instruction formats.

**Our design inference:** automatically attach the required task contract, current API index and selected genre checklist. Load optional implementation guides on demand. The controller records what was attached and used. A fighting-game request must trigger a dependency checklist even if the cheap model forgets to ask for a combat skill. More files alone are not progress.

### Asking questions needs a reliable handoff to building

[LLMs Get Lost In Multi-Turn Conversation](https://arxiv.org/abs/2505.06120) studies simulated conversations and finds substantial degradation when requirements arrive over multiple turns; early assumptions and premature solutions contribute to unreliability. This does not show that discovery interviews are bad. It shows that conversation history is not automatically a reliable specification.

**Our design inference:** maintain a structured brief during discovery. Record user decisions separately from proposed defaults, keep unresolved choices visible, and supersede rejected options explicitly. Before generation, compile a clean current contract with acceptance scenarios and selected asset references. Keep the original conversation retrievable and link each consequential decision to its source. Do not silently treat a generated summary as the user's approval.

For the fighting-game example, the contract should name the combat loop, input/device support, character rig, damage authority, abilities, cooldown behavior, HUD states, animation/SFX/VFX choices and respawn behavior. Explicitly deferred systems remain deferred; genre inference should not automatically add ranked matchmaking, monetization or persistence.

### A useful interface can improve a fixed model

[SWE-agent](https://arxiv.org/abs/2405.15793) investigates agent-computer interfaces, including concise environment feedback and editing support. Its controlled comparisons support the idea that tools and interaction design affect coding outcomes. They do not identify a universally best tool surface for every model.

The [mini-swe-agent implementation](https://github.com/SWE-agent/mini-swe-agent) is a useful counterweight to unnecessary complexity: start with a simple measurable loop. **Our inference:** test a small set of semantic Roblox tools against generic execution, using the same model, tasks and budgets. Prefer tools that remove predictable mistakes—revision-checked edits, instance lookup, preview lifecycle and scenario execution. Wrapping every Roblox method in a separate MCP tool would increase selection burden without necessarily improving control.

### Games benefit from executable memory and constraints

[Voyager](https://arxiv.org/abs/2305.16291) and its [author project page](https://voyager.minedojo.org/) demonstrate reusable executable skills and environment feedback in Minecraft. The project's ablations also show a substantial GPT-4/GPT-3.5 gap. That is a useful warning: a capable system does not erase the underlying model difference.

[Holodeck](https://arxiv.org/abs/2312.09067) generates scenes using retrieved assets and spatial constraints. **Our inference:** translate a user's arena description into a validated layout specification, then let code enforce physical relationships. Reusable combat components reduce the amount of novel code a cheap model must invent. Both ideas transfer at the architecture level; neither paper demonstrates Roblox game generation. Software licenses also do not confer rights to every referenced asset.

### Spend on external feedback, not endless self-critique

[AlphaCodium](https://arxiv.org/abs/2401.08500) uses test-based, multi-stage code generation. Its reported GPT-4 validation improvement from 19% to 44% is pass@5 on CodeContests, not a one-attempt Roblox result or proof of lower cost. The relevant lesson is to supply concrete failing behavior and repair locally.

[SWE-smith](https://arxiv.org/abs/2504.21798) constructs executable repository tasks and training data. Its Python-focused machinery needs adaptation for Luau and Studio. **Our inference:** build failed-task fixtures from controlled mutations of known-good Roblox components, such as removed cooldown validation, duplicated connections or incorrect respawn cleanup. Such fixtures can evaluate repair before investing in training. Keep naturally occurring user failures too; synthetic bugs alone are not representative.

## Proposed experiments, in priority order

These are specifications, not completed generation benchmarks. Use the same cheap model snapshots and record total cost, latency, retries, tool failures and independently accepted outcomes. Give Astra the same tools, knowledge and components in any parity comparison.

| Experiment | Controlled comparison | Primary result | Reason to reject the added complexity |
|---|---|---|---|
| E1: Skill delivery | No added skill vs optional skill vs automatically attached focused guide | Protected scenario pass rate; attachment/invocation failures | Guidance consumes tokens without a meaningful acceptance gain |
| E2: Discovery handoff | Same user answers as raw chat vs compiled contract with decision provenance | Required-feature omissions, contradicted decisions, user corrections | Compilation loses details or introduces assumptions |
| E3: Context selection | Current context vs exact paths/dependencies vs ranked map | Correct edits and cost per accepted task | Ranking misses necessary dependencies or costs more than it saves |
| E4: Recipe coverage | Free-form code vs parameterized verified combat recipe | End-to-end combat and replication correctness | Gains disappear on held-out variants or recipes constrain requested behavior |
| E5: Feedback source | Equal-budget model critique vs static checks plus Studio failure traces | Repair success, regressions and total cost | Runtime overhead exceeds improvement or tests are too weak |
| E6: HUD preview | Direct full build vs a short actual-component preview and selection | Blind visual preference, touch usability, rework and time to accepted HUD | Preview adds delay without reducing user rework |
| E7: Layout generation | Raw model positions vs semantic plan plus solver | Collisions, reachability, sightlines and human visual ratings | Valid layouts are repetitive, ugly or fail gameplay constraints |
| E8: Offline prompt tuning | Frozen baseline vs GEPA candidate selected only on development tasks | Held-out acceptance and amortized total cost | Development gains vanish on untouched tasks |

Start with existing-game edits and one narrow fighting-game slice, then test novel mechanics and unfamiliar projects separately. Report recipe-covered and uncovered performance independently. Reserve project families and mechanic variants for the final evaluation so similar examples cannot leak across splits. Repeat stochastic runs; report uncertainty and all failures instead of a showcase selection.

Tests should assert gameplay outcomes: server rejects an attack during cooldown, one valid hit causes one damage event, another client sees the result, respawn clears obsolete state, and touch UI remains usable. A script that loads without errors does not establish these properties. Visual preference and combat feel also need user or calibrated human evaluation; a model judge is supporting evidence.

## Architecture resulting from the research

```text
User request
  -> infer required systems and ask consequential questions
  -> inspect compatible assets and preview actual HUD components
  -> store chosen brief, explicit defaults and acceptance scenarios
  -> retrieve current project dependencies and verified components
  -> cheap model proposes a typed plan and small patches
  -> controller validates, applies and journals operations
  -> static checks, Studio scenarios and visual review
  -> targeted repair within a measured budget
  -> accepted playable slice, then expansion
```

Low cost is a measured property of this whole process. Reduce unnecessary generation with component reuse, compact current context and early cheap checks. Run expensive Studio checks when relevant, and stop repair loops that repeat the same failure. Include offline expert authorship, optimization, test infrastructure and user rework in accounting. A low token price can still produce an expensive accepted game.

The strongest plausible target is inexpensive, reliable performance on a clearly defined range of Roblox tasks. General Astra equivalence remains unproven. The next step is a small instrumented prototype and controlled benchmark, rather than implementing the entire replacement before validating its central quality/cost claim.
