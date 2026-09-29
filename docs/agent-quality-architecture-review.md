# Takko agent architecture and quality review

Research date: 2026-09-22. Status: research and proposed direction, not an approved implementation specification.

## Finding

Preserve capable reasoning models and the full approved game scope. Address truncation through capability-aware response allowances and smaller, durable work units. Extend Takko's existing role pipeline instead of replacing it with an unrestricted agent swarm. This is a quality-preserving design objective, not a measured guarantee of equal or better game quality.

The user explicitly requested the Superpowers brainstorming skill. This is an architectural review. No product implementation, model configuration change, paid inference, process restart or Studio action was performed. The question about quality-first spending versus a firm budget remains unanswered at the time of writing. Existing budget limits remain the proposed default until the user specifies otherwise.

## What the failure establishes

The retained investigation in [connection and reply recovery](connection-and-reply-recovery.md) records four full-plan failures at exactly 8,192 reported completion tokens with zero answer characters. Those traces did not retain reasoning-token counts. Exhausting the allowance during reasoning is consistent with this evidence, but the exact token breakdown cannot be reconstructed. The separate 2,000-token concept limit did not cause those full-plan failures.

[OpenRouter documents](https://openrouter.ai/docs/guides/best-practices/reasoning-tokens) that reasoning and visible output share the completion allowance on most providers. Exhausting it can produce an empty answer with a length finish reason, and those tokens remain billable. Hiding reasoning does not free that allowance. The quality-oriented remedy is enough total allowance plus smaller response units. A larger input context window does not remove an output limit. Streaming improves visibility, not the limit itself.

The preceding fix defaults OpenRouter Sonnet 5 to low effort when no explicit effort is configured. It did not establish equivalent gameplay quality. This review recommends replacing that silent model-specific reduction with an explicit, capability-checked policy after design approval. Simply turning high effort back on at the same constrained allowance would leave the observed failure mode unresolved.

## Current structure, observed in source

| Area | What exists | Consequence |
| --- | --- | --- |
| Role routing | `src/generation/engine.ts`, `call()` around line 1242, routes planner, builder, reviewer and repair through configured profiles and fallbacks | Takko already has distinct model roles. It is a host-controlled workflow, not a general autonomous tool loop |
| Intent preservation | `src/generation/game-context.ts` preserves source-backed intent, clarifications, approved assets and unresolved needs | Retain this source of truth. Do not replace original requirements with a lossy rolling summary |
| Full planning | `engine.ts` around lines 1642 and 1689 builds common context and requests the complete specification in one response | This is the immediate all-or-nothing failure boundary |
| Specification bounds | `schema.ts` allows up to 40 requirements, 12 tasks and 8 owned scripts per task | Task count and file count are not reliable output-size limits. A task can still require a large answer |
| Builder ownership | `taskOutputContract()` around line 249 establishes required and reserved paths | A strong existing foundation for focused work and preventing competing file edits |
| Builder context | `dependencyContext()` around line 277 filters code to dependencies and shared requirement evidence | Already scoped for source files, but returns the rest of the bundle, and common context still contains the full spec, runtime reference and asset information |
| Build checkpoints | The loop around line 1787 validates and compiles task output, merges it, records `completedBuildTasks`, then saves | Completed tasks survive a later failure. Planning and within-task work do not have this same granularity |
| Review | Around line 1966, one reviewer receives the full artifact and supplies issues and acceptance tests | Review can become another large response boundary as the game grows |
| Repair | Around line 2093, repair receives the full artifact, failures and protected tests, then returns changed items | Output is a patch, but investigation still spans the whole game. A global review follows it |
| Verification | Static validation and compilation stop at `ready_to_test`. Studio observations and visual feedback can feed repair | Honest status already exists. The generation loop does not automatically establish that the game works or feels good in Studio |
| Provider controls | `schema.ts` lines 40–41 defaults output to 8,192, caps it at 32,768, and allows low/medium/high. `providers.ts` around line 208 applies the Sonnet override only to OpenRouter | Reasoning controls are not yet a consistent capability-aware policy across adapters |

Context layout currently provides deterministic JSON ordering. It does not itself retrieve relevant evidence or reduce a task's scope. Large input context and output exhaustion are separate issues, even when broad context makes a call harder.

## Comparable systems and evidence limits

| Source | Publicly documented behavior | Application to Takko |
| --- | --- | --- |
| [Roblox Assistant guide](https://create.roblox.com/docs/assistant/guide) | Persistent editable plans, explicit Build approval, asset search with choices before insertion, and a viewport screenshot subagent | Use durable plans, concrete asset choices and direct scene observations. The guide does not reveal its complete private agent graph |
| [Replit App Testing](https://docs.replit.com/features/agent/app-testing) | The agent periodically uses a real browser, inspects results and fixes discovered issues. Recordings support review | Use actual Studio interactions as feedback, rather than judging generated code alone. This source documents product behavior, not every backend role |
| [Cursor scaling research](https://cursor.com/blog/scaling-agents), January 14, 2026 | Planners and focused workers followed by a judge. Flat coordination failed, and an extra integrator became a bottleneck | Separate responsibility and retain an overall owner. This was a research experiment, not proof of the architecture of every shipped Cursor session or of Roblox quality |
| [Anthropic long-running harness research](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents), November 26, 2025 | Initial setup, a durable feature list, incremental implementation, progress artifacts and end-to-end testing | Extend existing task checkpoints to planning and bounded subtasks. This web-app experiment does not settle whether multiple agents outperform one capable agent for Takko |
| [Existing Lemonade evidence review](../research/14-multi-model-backend.md) | Public model usage and inspected plugin features, with private routing and prompts unavailable | Do not invent Lemonade's backend structure. Multiple models being used does not reveal which role each performs |

These sources describe established products and published experiments. This review does not independently measure their commercial success, quality, cost or internal implementation. The Roblox forum announcement was blocked by a JavaScript challenge during this review, so the accessible official guide is the supporting source.

## Options

1. **Extend the existing workflow with staged planning and durable work units. Recommended.** Preserve current ownership, provenance, spending and review controls. Add planning checkpoints, bounded task output, focused repair and evidence-driven Studio milestones. This addresses recurring structural risks, but requires schema and recovery work and may add calls.
2. **Increase output headroom while preserving high reasoning.** Fastest narrow remedy. Validate provider limits, timeout and spend reservation before dispatch. It does not guarantee completion, add planning checkpoints or improve runtime feedback. Useful as a first increment of option 1.
3. **Replace generation with an open-ended tool-using agent or multi-agent swarm.** More flexible investigation and editing, but much larger changes to permissions, recovery, concurrency, cost and evaluation. No Takko evidence currently justifies making this the first move.

## Proposed first design section: roles and durable state

Keep one approved intent and requirements record with stable IDs. Every requested feature stays represented until implemented and verified or explicitly changed by the user. A scheduling decision cannot silently turn a required feature into an optional one.

The host application owns budgets, task states, file ownership, revision checks and validation. These do not require another model agent. A reasoning planner owns the complete game direction and shared contracts. It first establishes a compact system outline, then expands bounded areas into tasks, followed by a cross-system consistency check. Each complete, validated planning artifact is saved before the next call. The user reviews the coherent assembled plan, not a queue of internal planning fragments.

Builders receive the approved global direction, their requirements, shared interface contracts and relevant source and asset evidence. Additional evidence should remain retrievable rather than permanently omitted. They return complete bounded changes, which are staged and checked before becoming dependencies. Decompose oversized tasks before dispatch. Preserve a versioned project state so fresh model calls can recover from durable artifacts rather than attempt to reconstruct hidden reasoning.

Use subsystem reviews for detailed checks and a final cross-system review for integration. Repair targets a diagnosed failure and its dependency closure, followed by the affected tests and necessary integration checks. Keep independent protected acceptance criteria. A builder must not certify its own success by weakening those criteria.

Begin sequentially. Allow parallel work later only where file ownership and dependency boundaries make it safe. More concurrent agents are a throughput choice, not evidence of better results.

For the combat brief, the full required scope includes walking, sprinting, combat, dummy reactions, fighting and movement animations, SFX and VFX. Shared contracts should define server authority, action states, hit events, animation markers and asset references. Internal milestones can implement and test these separately while the final acceptance gate still requires their combined behavior.

## Output policy and recovery for a later design section

- Preserve the chosen reasoning effort. Check the selected model and endpoint's supported controls, context limit and completion limit. Do not assume every adapter shares OpenRouter semantics.
- Estimate response needs and reserve enough total completion allowance for reasoning and the artifact. Estimates are uncertain. Do not treat effort percentages as an exact universal allocation or blindly set every request to the provider maximum.
- Account for output allowance, input context, request timeout, cancellation and the remaining authorized monetary budget together. If allowance will not fit the budget, surface that constraint before spending. Never silently lower quality or expand the budget.
- Show honest stage progress and elapsed activity. Do not fabricate a completion percentage from thinking activity. Stream supported responses for responsiveness while validating only complete artifacts.
- When a request truncates, retain its finish reason, usage and recoverable evidence. Discard incomplete output as an executable artifact. Resume from the most recent validated unit, with an explicit changed allowance or task decomposition and a bounded authorized retry policy.
- Do not append arbitrary continuation text to incomplete JSON and assume it is correct. A response containing no answer has no useful code or plan fragment to salvage.
- Retain revision and content hashes so stale workers cannot merge into a changed brief. Tool actions need idempotency and recovery rules, especially Studio writes. These details require the next design section before implementation.

## How to establish quality rather than assume it

No benchmark in this review establishes that high reasoning always produces better Roblox games. Keep it for the initial quality-oriented design and measure outcomes. Model capability, task boundaries, available assets, useful tools and runtime feedback all contribute.

Compare the current full-plan architecture with sufficient output headroom against staged planning using the same capable reasoning model and effort. Hold briefs, asset choices and independent acceptance criteria constant. Include the user's combat brief and other genres. Repeat trials because one successful response is weak evidence. Do not compare a cramped baseline with an adequately funded new design and attribute every gain to architecture.

Measure completed requirement coverage, truncation frequency, recoverable progress, native runtime failures, asset playback, client/server behavior, visual consistency and human gameplay assessment. Record total cost including failures and retries, time to an acceptable result, and intervention count. Animation timing, combat responsiveness, sound and visual feedback require actual Studio observation. Static tests and screenshots alone cannot establish those qualities.

Proposed implementation tests would cover planning checkpoint recovery, unchanged requirement coverage, stale revision rejection, ownership conflicts, capability negotiation, empty and partial truncation, conservative cost accounting, cancellation and integration across split tasks. The full repository check remains required for implementation, with native Studio validation reported separately.

## Verification and cost of this review

Inspected current source and retained failure reports, read primary public documentation, and checked local process/listener state. No application source or model settings changed. No tests ran, including no `npm run check`, because this is a documentation-only research pass. All implementation test stages and native Studio testing were skipped. No game quality, savings or truncation elimination was measured.

Paid model calls: 0. Inference cost and reservations: $0. Key balance was not queried. The last recorded $4.994992 balance at 2026-09-20T23:34:36.757Z is stale and predates later user charges.

At 2026-09-22T17:53Z, the old surgical-UX desktop main PID 33760 remained, with helpers 26252, 26448 and 22032. Prior service PID 22024 was absent. No listeners were found on 4318, 4319, 4324, 4335, 4336, 4359 or 58479. These observations do not establish why the service stopped. Nothing was restarted. No Studio session was opened or modified. Existing paused evaluations remain paused. No commit or push.
