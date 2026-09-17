# Game-generation cost and Takko's optimization priorities

Research date: September 16, 2026. USD throughout. This is research and offline receipt analysis, not a paid generation run or a change to budgets, model routes, Studio, or the live app.

## Follow-up verification — September 16, 05:22 UTC

The historical analysis below predates the diversity trials. Those new $1 trials now use settled charges plus active/next reservations, retaining full liability for unresolved calls. Combat, bubble-wrap and checkpoint trials cost $0.049812, $0.045859 and $0.029390 respectively; none stopped for budget exhaustion. All stopped at complete scripted-component import, and none produced a verified game. See the [raw results](../benchmarks/runs/marketplace-diversity-v2-20260916/RESULTS.md). The earlier statement that the next $1 test had not happened applies to the original research snapshot only; budget reconciliation is now implemented in the new trial controller.

A fresh read-only provider check returned account credits $30, usage $2.162672636, leaving **$27.837327364 account-wide**. This test key still has a $10 limit with **$7.846457114 remaining**, so the key is the tighter restriction. It expires September 20 at 22:29 UTC. Four configured model profiles share this one key; their allowances must not be added together. No jobs were active. This is enough balance for another $1-capped test, but known import failures should be resolved before spending on another equivalent attempt. No limits were changed and no paid generation was started for this check.

Reopened the primary GameDevBench, GameCraft-Bench, Cursor training/context/pricing, and OpenRouter pricing/caching sources. The practical recommendation remains: aim for less than $1 actual model cost for a narrow verified interaction, measure success cost including failures, and build larger games in separately verified milestones. This is an engineering target, not an established average. Preserve a concise player-experience contract while retrieving technical detail on demand; reducing irrelevant context must not remove the game intent that the user identified as missing.

**Assessment:** a monetary cap can prevent useful iteration, but the latest failures do not establish that insufficient dollars caused poor quality. Takko also has a separate cumulative-reservation cap that can stop an inexpensive run prematurely. Fixing that distinction, asset reuse and observation-driven repair should precede spending more on broad model comparisons.

## What our receipts establish

The proposed next $1 test has not happened. V6 actually ran with a $2 monetary/cumulative-reservation limit, charged $0.185297 and accumulated $1.231075 in conservative reservations. It had no budget cancellation. Independent native evaluation failed the requested count-after-completion behavior; the shared reviewer had approved it. The missing Marketplace counterpart and unsupported scripted-asset importer are additional product problems. More tokens do not create a missing importer capability.

| Recorded run | Model charges | Cumulative reservations | Stopping/result evidence |
| --- | ---: | ---: | --- |
| V4 MiniMax | $0.029194 | $0.329422 | Required assets unresolved |
| V4 MiMo | $0.040133 | $0.480623 | Required assets unresolved |
| V4 Grok | $0.066877 | $0.757720 | Required assets unresolved |
| V5 shared planner | $0.028309 | $0.225690 | Invalid requirements; worker never called |
| V6 Grok | $0.185297 | $1.231075 | Build produced; native completion timing failed |

All five have null cancellation reasons. Their mean recorded attempt cost is $0.069962, but early failures dominate that figure. **It is not an average cost to produce a working game.** No verified finished game in this cohort means cost per verified success is undefined. These charges exclude Codex research/engineering work, local machine time and evaluator labor.

V6 spend by actual response role: planning $0.026705; asset decisions $0.023026; asset evaluations $0.012312; implementation $0.102917; final review $0.020337. The three implementation calls account for about 56% of this bill. They report 33,889 output tokens versus 17,465 UTF-8 bytes of visible JSON. Those are different measures: current receipts do not retain the reasoning-token breakdown, so the difference cannot be confidently attributed to hidden reasoning or waste.

An offline replay of the recorded charge sequence shows that a hypothetical $1 cumulative-reservation cap would refuse call 10, the client implementation, after only **$0.127354 of actual charges**. A $1 monetary cap using settled actual charges plus the next conservative reservation would admit all 11 recorded calls. This is a counterfactual over a fixed historical sequence, not a rerun; the new context and model variability can change future costs.

Why: `Engine.call` reserves input by UTF-8 bytes with modality allowances and the full configured maximum output. Benchmark profiles allow 24,000 output tokens even for tiny asset decisions. The cumulative guard adds old reservations after their calls have settled. That is a conservative experiment-admission policy, not the remaining provider balance. Previously reported $1.08 admission headroom described that guard, not an account with only $1.08 left.

Reproducible analysis with assertions and original receipt hashes: [analysis.json](notes/generation-cost-20260916/analysis.json), generated by `node research/scripts/analyze-generation-cost.mjs`. Primary local evidence: [v6 receipts](../benchmarks/runs/butter-crunch-marketplace-v6-20260916/grok/results.json), [frozen experiment](../benchmarks/runs/butter-crunch-marketplace-v6-20260916/grok/experiment.json), [native failure](../benchmarks/runs/butter-crunch-marketplace-v6-20260916/grok/native-evaluation/RESULTS.md), and the v4/v5 files indexed in the analysis.

## What published game-development costs mean

I did not find a defensible industry-wide average for a finished, tested Roblox game. Published work differs in scope, reuse, pricing, cache accounting, evaluation and success definition. Product subscription prices, generated game videos, game-playing bots and one-response browser demos are not interchangeable cost evidence.

[GameDevBench v2, Table 4](https://arxiv.org/html/2602.11103v2#A8.T4) reports per-task **medians**, including failed attempts, for modifications to Godot projects. Examples: Gemini 3 Flash with video $0.082 / 46.9% full pass@1; Gemini 3 Pro with screenshot+video $0.265 / 53.8%; GPT-5.4 with both $0.522 / 52.0%. Listed configurations range $0.056–$0.716. These are individual development tasks, not entire finished games. The paper also shows that changing tools/harness can substantially change a model's outcome; more expensive configurations are not uniformly better.

[GameCraft-Bench's publisher repository](https://github.com/FreedomIntelligence/gamecraft-bench/blob/main/README.md) is closer to complete game creation: 140 Godot tasks with runnable projects and replayable gameplay evidence. It publishes aggregate input/cache/output tokens instead of a universal dollar figure. I repriced four published workloads using the [September 16 OpenRouter catalog snapshot](notes/generation-cost-20260916/catalog.json):

| Recorded workload | Illustrative mean model cost per attempt | Same token workload with no cache discount |
| --- | ---: | ---: |
| GPT-5.5 | $1.72 | $5.90 |
| Kimi K2.6 | $2.98 | $15.51 |
| Claude Opus 4.7 | $9.89 | $58.11 |
| DeepSeek V4 Pro | $2.23 | $2.84 |

These are **our base-rate calculations**, not observed invoices or success costs. Formula: `((input - cached) × inputRate + cached × cacheRate + output × outputRate) / 140`. Assumes the reported input includes cached tokens. Aggregates are rounded. Cache writes, per-request long-context tiers, tool charges, evaluation, compute, assets, tax and human work are excluded; the missing details prevent an exact all-in estimate. Current rate sources: [GPT-5.5](https://openrouter.ai/openai/gpt-5.5), [Kimi K2.6](https://openrouter.ai/moonshotai/kimi-k2.6), [Opus 4.7](https://openrouter.ai/anthropic/claude-opus-4.7), [DeepSeek V4 Pro](https://openrouter.ai/deepseek/deepseek-v4-pro). These calculations do not rank models on Takko or predict that a cheaper model can reproduce another model's trajectory.

The [original GameCraft paper](https://arxiv.org/html/2606.17861v1) reports low rubric scores even for its strongest configurations. A score such as 41.46/100 is not a 41.46% finished-game success rate. Later repository results differ from the original paper; neither is a Roblox evaluation.

## What Cursor actually optimized

[Composer 2's technical overview](https://cursor.com/blog/composer-2-technical-report) describes continued code-focused pretraining of Kimi K2.5 followed by large-scale reinforcement learning in environments resembling Cursor. It also describes substantial training infrastructure. This is learned specialization and system design, not a clever system prompt alone.

[Composer 2.5](https://cursor.com/blog/composer-2-5) retains that base and expands synthetic RL tasks, including missing-feature reconstruction. Its targeted textual-feedback method trains the model at specific bad decisions instead of relying only on a final success reward. Our current context fixes do not reproduce weight training or establish equivalent ability.

[Current Composer pricing](https://cursor.com/docs/models/cursor-composer-2-5): standard $0.50 input / $0.20 cached input / $2.50 output per million tokens; Fast $3 / $0.50 / $15. Fast is the default. Retail token rates do not disclose Cursor's training cost, margins or total task cost. Our selected MiniMax and MiMo catalog rates are already below Composer standard on ordinary input/output, so cheap tokens alone do not explain Composer's usefulness.

Two application-level results are especially relevant:

- [Dynamic context discovery](https://cursor.com/blog/dynamic-context-discovery): Cursor reports 46.9% fewer total agent tokens in its MCP-using A/B cohort after loading tool details on demand. This is a cohort-specific result with high variance, not a promised Takko saving.
- [Trained self-summarization](https://cursor.com/blog/self-summarization): Cursor reports about one-fifth of the summary tokens and 50% lower compaction error in its tested settings. We can adopt structured state and selective retrieval now, but cannot assume prompt-only summaries inherit those gains.

[Warp decode](https://cursor.com/blog/warp-decode) optimizes low-batch MoE inference with fused kernels and less memory movement. Such work belongs to model-serving infrastructure; calling an API does not give Takko control of those kernels.

[Cursor's model-mix experiment](https://cursor.com/blog/agent-swarm-model-economics) supports testing strong planning with cheaper execution, but its task was reconstructing SQLite and its costs were large. It also shows that planner cost and downstream worker effort can erase apparent savings. It does not justify multiplying agents for one interactive object.

## Prioritized changes for Takko

| Priority | Change | Benefit and measurable acceptance |
| --- | --- | --- |
| 1 | Complete audited Marketplace component reuse and native-feedback repair | Avoid rewriting working assets; preserve original behavior, hierarchy, media and ownership. Demonstrate actual reusable-component integration and independently test its final interaction. Current unsupported-script stop must stay until this works. |
| 2 | Reconcile the budget ledger | Use settled actual charges + active reservations + unresolved-call liabilities. Keep a hard global cap and conservative treatment of unknown charges. Record cumulative reservation exposure separately rather than treating it as spent cash. Prove concurrent dispatch and timeout/restart cannot overspend. Do not retroactively alter benchmark records or silently enlarge authorized limits. |
| 3 | Make context precise and selective | Preserve the game-intent contract and exact user constraints once, then provide task requirements, interface contracts and needed files. The recent context fix currently duplicates some information across `spec`, `gameContext` and guidance; remove duplication without losing meaning. Asset selectors do not need the entire scene/compiler reference. Measure tokens and requirement retention together. |
| 4 | Stable cacheable prefixes and cache telemetry | Keep reusable tool/schema/API guidance stable and task deltas later. Add a stable project/revision/phase session identity and provider-appropriate caching. Record actual cache reads/writes, reasoning/output tokens, provider and monetary cost. Verify real hits; do not claim the current implementation has none merely because it does not log them. |
| 5 | Spend capability where errors are costly | Use a capable lead for ambiguous intent, architecture and difficult diagnosis; inexpensive workers for bounded, testable changes. Escalate with a compact failure packet after evidence shows the cheaper route stuck. Compare against one capable model throughout—the hybrid must earn its complexity. |
| 6 | Smaller decisions, adequate code budgets | Calibrate output limits separately for selection/evaluation/planning/code. Tiny decisions should not all reserve 24k output tokens. Preserve enough output/reasoning allowance for real code; blindly lowering all limits risks truncation and extra retries. Report output-limited and budget-limited failures separately. |
| 7 | Test and patch the failed behavior | Compile first, then run real input/state/timing scenarios and targeted image/audio checks. Repair the affected code and retest regressions. Keep unchanged artifact/asset evidence when identities still match; do not pay to rebuild the whole project. Verify the compiled result of every patch. |
| 8 | Build reusable domain knowledge before training | Store tested interaction components and successful tool trajectories, with provenance, integration contracts and failure examples. Retrieve only relevant examples. Later evaluate distillation/fine-tuning on held-out games; include data preparation, training, serving and maintenance in break-even cost. |

[OpenRouter documents](https://openrouter.ai/docs/guides/best-practices/prompt-caching) automatic caching for some providers, explicit cache configuration for others, sticky routing and `session_id`, and cache metrics in usage responses. A changing first user message can affect default conversation identity; that makes explicit stable identity relevant to our independent JSON calls. Cache-write charges, TTL and provider behavior must be measured. Prompt caching saves repeated input processing; it does not eliminate generated-output cost.

A recent [Harness-of-Harness preprint](https://arxiv.org/html/2609.01481v1) gives supporting evidence for targeted feedback and continuing existing work: on 45 GameCraft tasks, its two-pass variant scored 64.84 using 5.67M tokens, versus 58.24 at 6.33M for three vanilla passes. Its no-warm-start ablation used more tokens and scored worse. These are author-reported Godot results, not reproduced Takko savings or a budget-equated Roblox comparison.

## Cost objective and next experiment

Optimize **total paid cost / independently verified successes**, together with p50/p95 cost, latency, user-request fidelity, appearance/audio quality and required native scenarios. Count retries and failed runs. An inexpensive rejected attempt is useful diagnosis but cannot be called a cheap completed game.

For a narrow Butter-sized slice, propose a target of staying below $1 in actual model charges, with reserved room for feedback and repair. This is a product target to validate, not a promise and not a universal whole-game budget. Larger games should be priced and built in verified milestones; the literature does not support selling arbitrary finished games for a fixed $1.

Before another paid test, remove the known scripted-component capability block and finish the native-feedback handoff. Exercise budget reconciliation and context/caching changes offline first. Then use fresh, versioned matched runs: identical brief, asset access, Studio state and acceptance scenarios; compare current vs optimized orchestration, then separately compare actual monetary ceilings and model mixes. Start with a small paired diagnostic, expand only when outcomes are informative. A single run cannot establish an average or savings percentage.

Keep planning, sourcing, construction, repair, review and native evaluation costs distinct. Use an independent verifier; preserve all failures and forbid root-written asset IDs or game rescue. Existing account/test caps stay unchanged until a separate implementation/testing instruction. Training a proprietary model is a later decision governed by measured volume and savings, not a prerequisite for making this workflow better.

## Research validation

The offline analysis script checks receipt sums, role-to-model alignment, counterfactual budget admission and repricing arithmetic. It passed. No new paid calls or Studio operations occurred, and no application source/configuration was changed. `npm run check` was not rerun for this research-only addition; the preceding application change retains its own test report.
