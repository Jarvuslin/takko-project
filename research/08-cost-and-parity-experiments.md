# Cost optimization and a fair test of Astra-like quality

Research date: **2026-09-13**. Companion to [the proposed cheap-model system](07-cheap-model-quality.md). No live generations or paid model calls were made. All calculator values are explicitly hypothetical.

## Optimize the delivered outcome

Primary economic metric:

**Cost per accepted result = total cost of all requests, including failures / independently accepted results.**

Also report acceptance rate, regressions, false completion, human intervention, and p50/p95 latency. Lower cost achieved by leaving more requests unfinished is not an acceptable improvement. Keep functional and visual scores separate: a beautiful broken game must not outscore a working result through averaging alone.

Include input, cached reads, cache writes where applicable, all billed output/reasoning, model retries, critic calls, embeddings/retrieval, asset/media services, machines, storage and egress. Allocate shared infrastructure using real utilization. Track player-device test compute and engineering/teacher work separately and show both online and fully amortized economics. Hidden reasoning can be billed without being visible; do not add a reasoning subfield twice if it is already in total output.

Record exact model version, provider endpoint, settings, actual token usage and billed cost per stage. A marketing label or public token-share chart cannot establish this. “Same cheap models” should initially mean a frozen model/provider pool and versioned configurations; no unreported expert fallback.

## A repair budget has measurable economics

Let `p0` be true success on the initial attempt, `r1` success of repair 1 conditional on the initial failure, and `r2` success of repair 2 conditional on both earlier failures. Let `c0`, `c1`, `c2` be the corresponding full stage costs.

```text
P = p0 + (1-p0)*r1 + (1-p0)*(1-r1)*r2
C = c0 + (1-p0)*c1 + (1-p0)*(1-r1)*c2
cost_per_accepted = (C + offline_cost / expected_request_volume) / P
```

These are conditional probabilities, so they do not assume repairs are independent fresh samples. This simple calculation assumes the verifier identifies failures correctly and the controller only repairs those failures. False passes and false rejects change both execution paths and costs: use empirical trajectory accounting when these occur.

For an optional next stage, its incremental cost per incremental true success should be compared with the current cost per success, subject to minimum quality and latency constraints. A high-quality result can warrant spending more even when average cost increases; choose the product objective explicitly.

The [editable assumptions](cost-scenarios.json), [calculator](scripts/cost-model.cjs), and [generated tables](tests/cost-model-results.md) make these tradeoffs inspectable. They are arithmetic examples, **not a forecast, real provider prices, or an Astra benchmark**. The sensitivity table includes higher infrastructure costs so that testing overhead is visible.

Reproduce from the workspace root:

```powershell
node research/tests/cost-model.test.cjs
node research/scripts/cost-model.cjs
```

Use one row per actual deployment policy when replacing the example inputs. The simulator aggregates model calls into stages; mixed-model stages require summing each call's bill before recording aggregate cost, or extending the input schema. For production analysis, sum actual invoices/spans directly rather than fitting every request to three stages.

## Savings in priority order

| Lever | How it saves | What to measure or avoid |
|---|---|---|
| Reuse tested components | Less invented code and fewer integration repairs | Component coverage, integration regressions, output tokens, maintenance cost |
| Retrieve current dependencies | Fewer wrong edits and repeated broad searches | Relevant dependency recall, stale-source rate, retrieval latency |
| Narrow repair with actual evidence | Avoids full regeneration | Repair conversion rate by failure class, preserved behavior, repeated failures |
| Deterministic bulk operations | Fewer model turns for mechanical work | Action count, round trips, tool failure isolation |
| Prompt caching | Reuses eligible stable prefixes | Billed cached tokens, cache-write overhead, provider support and hit rate |
| Selective tests/captures | Avoids costly full suites and image floods on every change | Escaped failures versus execution/media/vision cost; full milestone checks retained |
| Reliable result delivery | Prevents redoing successful mutations after lost responses | Delivery retries versus mutation re-execution; outbox recovery |
| Right-size reasoning and output | Allocates extra effort to failures that benefit | Success versus total billed reasoning/output, truncation and partial patches |
| Offline optimization | Reuses verified lessons across many requests | Upfront cost, coverage, artifact reuse, holdout quality, break-even volume |

OpenRouter's current documentation describes provider/model-specific prompt caching and sticky routing, including a session identifier. Stable prefixes and compatible routing may improve cache reuse; verify actual billed usage rather than assuming a published maximum discount. Keep invalidation correct and include cold misses, write costs and expiry. See [provider documentation](https://openrouter.ai/docs/guides/best-practices/prompt-caching).

Response caching is different: reusing an old generated patch is unsafe when the project revision or requirements differ. Cache immutable recipe artifacts by version/content hash; revalidate configuration and dependencies on every application.

Do not solve idle-poll cost by casually increasing sleep and making the tool loop slower. Separate active generation responsiveness from idle coordination. Measure model time, queue/poll delay, cold start, Studio execution, media and repairs before changing transport. The inspected plugin already backs off idle polling.

## Experimental design: distinguish better engineering from better models

Use [the existing 20 task families](05-evaluation-plan.md) as a pilot, not as sufficient evidence of universal parity. Collect actual user failures as well as successes. Freeze initial projects and requirements; keep data for prompt/component development separate from held-out projects. Hold out entire projects and some component combinations, not only paraphrases of training prompts.

Run four comparisons where access permits:

| Arm | Model | Surrounding system | Purpose |
|---|---|---|---|
| A | Frozen current cheap model/policy | Current production behavior | Actual baseline; requires internal access |
| B | Same model/policy | Proposed context, components and verification | Measures engineering improvement |
| C | Available Astra endpoint/version | Same proposed system and fixtures as B | Tests remaining capability gap fairly |
| D | Same cheap model/policy | B with one component removed | Identifies which additions earn their cost |

If A cannot be replayed, name the substitute baseline explicitly. Do not call a homemade weak prompt “current Lemonade.” C must also receive reusable modules, relevant context and tests; comparing optimized cheap generation only against poorly configured Astra would overstate the result. Also include a task-tuned strong baseline where feasible so the harness itself does not artificially cap Astra.

Run both equal-dollar/equal-time comparisons and quality-matched comparisons. Record the minimum observed cost to reach an agreed quality level and the best quality within a fixed budget. Parameter optimization belongs on development/validation data; freeze policies for the final test.

Pilot: three runs per task/arm, prioritizing fewer arms if expense is excessive. Use this to identify failures and estimate variance. For launch claims, size a larger held-out set from the observed variance and the desired uncertainty. Repeated runs from one project are correlated; bootstrap at the project/task-family level instead of pretending every retry is an independent user request. A small pilot does not establish a narrow parity margin.

Blind human reviewers to model and policy. Evaluate code/functionality with protected assertions and actual player scenarios. Judge visual coherence and interaction quality with an explicit rubric and calibrated reviewers. Report ties and uncertainty, not only model-judge scores.

Separate common component-covered requests, uncommon compositions, novel mechanics, existing-project repairs, visual tasks, and long-context tasks. Report quality on all incoming requests and the percentage covered by the optimized path. A system matching Astra on its easiest 30% of requests has not matched Astra on the full workload.

## Proposed decision gates, to agree after the pilot

- Hard gates: no unintended destructive changes, critical multiplayer integrity failures or fabricated test evidence in the accepted set. Any occurrence is investigated; observing zero in a finite sample is not proof of zero risk.
- A candidate parity definition could be an acceptance-rate difference whose confidence interval remains above **-5 percentage points**, plus visual/interaction non-inferiority and bounded regression rate. This is a proposed margin, not an achieved result.
- A candidate economics target could be **at least 50% lower cost per independently accepted result than the strong comparison**, including offline amortization at realistic volume, with no worse agreed p95 latency. This is a target to test, not a promise.
- Cheap-system improvement over current Lemonade must also be measured independently; beating a strong model on cost alone says little about whether users receive better games.

## Minimum new evidence needed for a real diagnosis

Actual current model IDs/providers and billed prices; orchestration/prompts/context code; representative input and final places; tool/result traces; and the team's accepted feature criteria. Start with 3–5 reproducible poor generations to localize causes, then broaden the benchmark. The currently available plugin evidence cannot reveal which optimization produces the largest production gain.

This research has identified a concrete testable design and economic framework. It has not run Lemonade-versus-Astra generation comparisons, measured success rates or established API availability/pricing for Astra.
