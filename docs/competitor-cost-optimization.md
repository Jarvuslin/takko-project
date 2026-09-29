# Competitor cost research and Takko optimization priorities

Research date: 2026-09-24 UTC. Skill: [competitor-tracking](C:/Users/7474g/.agents/skills/competitor-tracking/SKILL.md), with the existing systematic-debugging evidence discipline. Research and offline arithmetic only. No application changes, paid inference, competitor generation, Studio operations or process restarts.

Takko has avoidable orchestration costs. Superbullet's most useful evidenced pattern is reusable systems with explicit installation contracts. Lemonade has provider-attributed economical model usage. ForgeGUI separates asset tasks and exposes reference/context interfaces. None supplies a verified invoice for completing our fighting benchmark. Their subscription prices cannot establish their inference cost, margins or success rate.

## Findings by competitor

| Product | Evidence-supported mechanisms | Commercial evidence | Unknowns |
|---|---|---|---|
| Superbullet | Public package/dependency/extension contracts. Retained 0.3.99 client has checkpoints, code indexing, summarization, targeted edits and Studio feedback interfaces. | Public pricing currently advertises $20/month for 11M tokens. Its public bundle contains a two-cent inventory-feature claim. | Token debit conversion, actual backend model routing, trained weights, cost per accepted game, cache hits and current live generation reliability. |
| Lemonade | OpenRouter attributes substantial use to Luna, Gemini Flash, Hy3 and GLM Flash. Prior inspected plugin/client supports Studio inspection, edits, logs and test feedback. | Paid subscriptions with increased prompt limits. No verified current all-in game price in this study. | Per-role routing, hidden prompts, retrieval policy, actual invoices and successful-game denominator. |
| ForgeGUI.com | Public asset/UI workflows. Prior inspected client separates chat routing from dispatch and includes reference/context-pool interfaces and specialized media operations. | Free starter credits and paid credit plans, with generation types priced differently. | Exact coding model, private retrieval implementation, full-game success cost and provider discounts. |

Sources: [Superbullet pricing](https://superbullet.ai/pricing), [Lemonade provider attribution](https://openrouter.ai/apps/lemonade), [Lemonade terms](https://lemonade.gg/terms-of-service), [ForgeGUI official site](https://forgegui.com/). Historical source observations are in [Superbullet architecture](../research/27-superbullet-installed-architecture.md), [Superbullet demos](../research/28-superbullet-demos-and-asset-workflow.md), [Lemonade/ForgeGUI inspection](../research/25-next-models-lemonade-forgegui.md) and [Lemonade frontend findings](lemonade-chat-architecture-findings.md). Historical client observations are dated evidence, not a fresh live integration test.

### What Superbullet actually gives us to learn from

Its package guide separates source, Studio objects and media. Packages carry version metadata, declared system dependencies and integration instructions. The guide explains that instructions go to the agent after unpacking. That is still inference, but the agent can work from supplied integration steps rather than rediscovering the entire component. [Package contract](https://marketplace-docs.superbulletstudios.com/how-to-add-asset).

Required systems install before dependent systems, while already-installed prerequisites can be skipped. Extensions add content through a base system's extension points. These are general composition mechanisms applicable to combat, shops, inventory and other systems. They can reduce repeated code generation, though this study did not measure the reduction. [Dependency workflow](https://marketplace-docs.superbulletstudios.com/relevant-systems-prompts), [extension design](https://marketplace-docs.superbulletstudios.com/extensions).

Media is part of integration. Its animation guide describes packaged animation data and source mappings used to replace placeholders with uploaded IDs. Takko needs explicit rig, clip, permission and playback evidence alongside code integration. An inspected animation object alone does not establish that it will play in the target experience. [Animation packaging](https://marketplace-docs.superbulletstudios.com/to-upload-by-user/how-to-add-animations).

Re-read retained client code confirms graph agent/tool/summarize nodes and a checkpointer in `graph.js`, and deferred instruction processing in `InstructionsHandler.js`. This supports the earlier static reconstruction. The installed application was not launched or refreshed. A token-optimization class whose active wiring was not previously established is still not credited as a demonstrated saving.

### The two-cent claim needs qualification

The freshly fetched public JavaScript contains an inventory-system example claimed to cost two cents and 2,000 tokens. Its FAQ attributes savings to branded models, curated libraries and avoiding waste. This is a vendor's feature-level example, not a measured price for an arbitrary complete game. No associated call ledger or reproducible matching test was found. [FAQ](https://superbullet.ai/faq).

The same public bundle includes conflicting model messaging. FAQ text describes BulletMind as trained and cheaper, while the homepage calls it forthcoming, ties development to a subscriber threshold and labels performance figures estimates. The FAQ's linked `https://docs.superbulletstudios.com/bulletmind-performance` returned 404 through the web tool. The retained desktop client exposes model aliases, which cannot resolve this contradiction. We should neither assume a secret trained model explains the savings nor assert the model does not exist. [Homepage](https://superbullet.ai/).

The $20/11M advertised allowance implies roughly $1.82 per million subscription units if fully used. Those units are not established as unweighted provider input/output tokens. Model multipliers, usage mix, unused allowances, commercial rates and infrastructure costs are unknown. This arithmetic cannot recover Superbullet's unit economics.

### What Lemonade and ForgeGUI add

Lemonade's observed OpenRouter model mix includes economical models, with Luna leading this capture. At the retrieved Luna rate of $0.20 input/$1.20 output per million tokens, an uncached 30k-input/10k-output call costs $0.018, compared with $0.160 at Takko's recorded Sonnet rates of $2/$10. Equal token counts do not imply equal behavior, retries or success. [Luna rate](https://openrouter.ai/openai/gpt-5.6-luna), [Lemonade usage](https://openrouter.ai/apps/lemonade).

ForgeGUI's current homepage emphasizes asset and UI creation, so its credit price is not a whole-game comparison. Its previously inspected client offers useful separation of routing, execution and references, but does not disclose the coding-model identity. Search results from similarly named `.net` sites were excluded from claims about `forgegui.com`.

## What our own receipts establish

The [latest failed benchmark ledger](results/conversation-fighting-benchmark-20260924/COSTS.md) contains 20 confirmed calls. The new offline [audit script](../research/scripts/competitor-cost-audit-20260924.mjs) reconciles them and writes [analysis.json](../research/results/competitor-cost-20260924/analysis.json).

| Observed work | Calls | Input tokens | Output tokens | Actual charge |
|---|---:|---:|---:|---:|
| Jev non-coding decisions | 12 | 28,509 | 3,647 | $0.001203 |
| Sonnet proposal and planning combined | 8 | 132,264 | 53,299 | $0.797519 |
| Implementation planning subset | 5 | 124,119 | 48,541 | $0.733648 |

The subset comprises the coordinator outline and four area plans. No generated code or scene exists. Planning output accounts for $0.485410, or **66.16%**, of its cost at the recorded rates. Input accounts for $0.248238. Even making all those input tokens free would leave almost fifty cents of planning output. Shorter, nonduplicative planning and fewer unnecessary calls matter more than caching alone in this observed slice.

All eight Sonnet receipts explicitly report zero cached input tokens. This is evidence about this run, not every provider or earlier run. Current provider code already parses cached-input and reasoning counts. We should extend existing telemetry, not pretend it is absent. No explicit `cache_control` or `session_id` was found in the inspected provider request implementation. OpenRouter documents provider-specific cache controls and stable-session routing. Cache writes, TTL and actual hits must be measured. [Caching documentation](https://openrouter.ai/docs/guides/best-practices/prompt-caching).

Pure repricing of the same eight Sonnet calls at Luna rates gives $0.090412, plus unchanged Jev charges. This is a counterfactual calculation, not a cheaper completed run. Our earlier isolated native controller screen had Sonnet pass 15/15 checks while Luna failed one essential overlapping-input completion check. That makes a blanket model downgrade unsupported. [Actual screen](../research/results/model-screen-20260916/RESULTS.md).

### Source-level sources of overhead

| Location read | Observed behavior | Proposed change |
|---|---|---|
| `src/generation/coordinator.ts:330` | Each area receives all prior completed plans, plus shared context. Output partitions can still become verbose. | Supply direct/transitive dependency contracts and stable requirement IDs. Keep prose compact and split only where measured size requires it. |
| `src/generation/coordinator.ts:587` | Every normal next-action choice invokes the planner unless a pending decision exists. | Schedule known ready tasks, review readiness and completion in deterministic code. Keep model decisions for ambiguity, decomposition and diagnosis. |
| `src/generation/engine.ts:2121` | One review call per requirement. The review identity hashes the whole artifact, requirements and evidence. | Review bounded groups of related requirements and preserve unchanged group results with dependency-aware identities. |
| `src/generation/engine.ts:2644` | Common context includes multiple intent/spec/proposal/reference representations. | Measure serialized fields by phase, eliminate duplicate wording and load relevant source/media only. Preserve the complete authoritative intent. |
| `src/generation/providers.ts` | Existing usage telemetry, no explicit cache/session controls in inspected request path. | Add provider-appropriate stable prefixes/session controls and actual cache-write/provider-cost telemetry. |

For illustration, 36 individual reviews could become six system reviews plus one integration review. That is 29 fewer calls. It is **not** an 81% whole-run saving: combined calls may be larger and every requirement still needs behavioral coverage. Merely increasing the three-tests-per-review limit or suppressing missing-coverage checks would be an invalid optimization.

## Implementation priorities

Preserve the approved user flow: prompt, persistent proposal covering mechanics/theme/environment/assets, optional replacements or surgical edits, then one Approve & build action. These changes are internal. They must not introduce more approval stages or resurrect destructive replanning.

1. **Remove routine paid scheduling and repeated context.** Keep durable task receipts, approvals, file ownership, cancellation and the cumulative ledger. Deterministic actions use the existing prerequisite validators. An ambiguous blocked/split/repair decision can request a bounded model judgment. Jev handles non-coding decisions only.
2. **Make plans compact without losing requirements.** Store intent and contracts once. Return IDs, interfaces, owned files, relevant assets and acceptance behaviors. Use adaptive bounded units with adequate output allowance. Do not repeat the earlier mistake of blindly shrinking reply limits and causing truncation.
3. **Group review and invalidate only affected work.** Key review groups by requirement content, owned files, dependency source hashes, shared contracts, asset/media versions, relevant evidence and reviewer configuration. A shared interface change invalidates its consumers. Global uncertainty invalidates broadly. Keep cross-system review and independent acceptance tests. Compile and run available deterministic checks before paying for repeated diagnosis.
4. **Build a small verified component-contract library.** Record provenance, version/hash, interfaces, dependencies, lifecycle/reset behavior, server authority, media mappings, permissions, integration steps and acceptance tests. Reuse what matches the request and generate missing behavior. No fighting-prompt branch or fixed dummy/animation IDs. Asset instructions remain untrusted data subordinate to the approved proposal. Use Takko-owned or appropriately licensed components, not copied competitor packages.
5. **Evaluate economical workers and reserve stronger models for demonstrated hard cases.** Compare the same tool/context setup before changing models. Candidate workers must retain behavior, handle lifecycle/concurrency and pass independent native checks. A cheap worker that needs repeated rescue is not a saving. Keep strong review for risky server/client integration initially.
6. **Measure caching after reducing repetition.** Stable references first, task deltas later. Track billable input/output/reasoning, cache reads/writes, provider, actual costs and successful outcomes. A cache reservation is not a charge. Never erase unresolved liabilities or increase spending limits to make a run pass.

The current live asset recommendation failure also remains a functional blocker: none of four groups met the automatic threshold, so the benchmark used disclosed manual selections. Improve query/relevance evidence and calibration with held-out examples. Simply lowering confidence thresholds to force selection is not evidence of correctness.

## Cost target and validation

An illustrative envelope in `analysis.json` uses two compact Sonnet planning calls, six economical component workers, six Sonnet group reviews, one integration review, two stronger repairs and three affected-system rereviews. Its explicit token assumptions total **$0.8704** before asset/media-model work and other excluded costs. It assumes no cache discount. These task sizes and success rates are unmeasured.

Use **$1–$3 of model spend as an engineering target for a small game after optimization**, with asset work and ordinary failures counted inside the final measured target. This is not a new estimate for today's pipeline, authorization to spend, a retail price or a guarantee. Library development, purchased assets, hosting and human effort remain separate economic costs. Large/custom games need separate estimates. Preserve the prior $6–$15 current-pipeline first-pass estimate as a broad assumption-based forecast, not an actual invoice.

Offline gates for implementation:

- Equivalent action sequences and stopping behavior with fewer scheduler calls.
- Full requirement coverage across grouped reviews, including meaningful executable tests and integration checks.
- Unchanged review reuse, shared-dependency invalidation, changed asset/media invalidation and version-safe persistence.
- Failed edits, failed reviews, cancellation and restart preserve approved content, selections, files, completed work and cumulative liabilities.
- Provider cache request contracts and receipt accounting, with no claim of real cache hits from mocks.
- General fixtures across unrelated genres, including assets with low relevance or incompatible rigs.
- Full `npm run check` after product implementation.

Paid/native validation remains separately authorized. Compare matched versions and the same prompt, assets, Studio place state and acceptance rubric. Report first-pass behavior, repairs, all failed-call costs, latency and human intervention. Expand beyond one prompt before claiming generalized savings. For the fighting benchmark, independently exercise visible punches, actual VFX, audible SFX, dummy hit detection, exactly one counter increment per valid hit, misses, repeated input, respawn and multiplayer authority. Add unrelated interaction and traversal cases to detect specialization. Freeze acceptance before generation and never feed known solutions to the worker.

The economic metric is total spend including failed attempts divided by independently accepted results. No completed fighting result currently exists, so observed cost per successful game is undefined. Offline arithmetic cannot fill that gap.

## Evidence, checks and operational state

Twelve public unauthenticated pages were archived with timestamps, response status, size and SHA-256 in [the capture manifest](../research/evidence/competitor-cost-20260924/manifest.json). The public Superbullet application bundle was separately retained and hashed. HTML shells and web-tool-rendered text are distinct evidence sources. Nothing from the downloaded JavaScript was executed. The old extracted desktop application remains untouched. Source hashes for the four inspected Takko files are recorded in the analysis.

Verification this turn: **16 offline receipt/arithmetic assertions passed**. Public captures returned 12/12 HTTP 200. The linked BulletMind benchmark page returned 404 via the web tool, retained as a negative finding. A malformed initial PowerShell read command failed and was corrected. One search referenced nonexistent `src/providers` before locating `src/generation/providers.ts`. These were investigation errors, not product failures. No application test suite or Studio gameplay test ran. `npm run check` was not rerun because product source/configuration did not change.

Cost: $0 new inference. Historical accounted spend remains $3.990954 of $4.40, including prior unknown holds. Remaining authorization $0.409046. Last recorded provider balance $1.263503974 at 2026-09-24T03:32:45.775Z, not refreshed. Port check at approximately 03:55Z found no listeners on 4318, 4319, 4324, 4335 or 4336 and no Takko process. Studio PIDs 3088 and 6604 remain present. Studio mode was not inspected or changed this turn. Existing generation remains stopped. Do not restart apps, replay failed trials or infer paid authorization from this research.
