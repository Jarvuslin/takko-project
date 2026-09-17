# Game research, lead planning and model comparison — 2026-09-14

Forge had a real local Express backend, but its planner had no retrieval step. The live planner and builder routes used GPT-4.1 mini. The dashboard model chooser also replaced all four routes when selecting a builder. Structurally valid briefs could therefore describe the wrong game.

## Architecture and changes

```mermaid
flowchart LR
  Request[Request and saved answers] --> Research[Web-backed research call]
  Research --> Evidence[Saved sources, mechanics and unknowns]
  Evidence --> Lead[Lead planner: brief and task graph]
  Lead --> Approval[User reviews the brief]
  Approval --> Builders[Dependency-ordered builder calls]
  Builders --> Review[Review and bounded repair]
  Review --> Studio[Forge plugin: apply and native tests]
```

The TypeScript Engine remains the orchestrator. Model roles are bounded calls under that coordinator, not independently running agents with unrestricted tools. The lead model creates requirements and the task DAG. Code enforces budgets, schema/scene contracts, dependencies, file ownership, approval and Studio evidence. This is not an autonomous manager that can create arbitrary new roles or rewrite its own rules.

New implementation:

- An optional research route runs **before planning**, using the OpenRouter web plugin with Exa auto and five results. This is a real paid retrieval call, not a model asked to recall a game. It currently makes one search per attempt, not an iterative browsing/video-playing agent. The existing OpenRouter key is sufficient.
- Provider `url_citation` annotations supply the saved URLs, titles and excerpts. Every mechanic must cite a URL present in those retrieved annotations. Unsafe links, empty citations and invented URLs are rejected; failure does not silently become an ungrounded brief.
- The dossier separates core/supporting mechanics and unknowns. It is visible in the Brief panel with source links and adaptation decisions. Request/answer changes invalidate it, and replanning refreshes evidence older than 24 hours.
- The planner must map every researched core mechanic to required requirements or record a user-requested omission with an exact user quotation. This catches dropped coverage. It is **not** a semantic proof that the requirement actually implements the cited mechanic, or that every source is correct. User review and independent gameplay tests still matter.
- The engine preserves the research as context for builders/review/repair, treats retrieved text as untrusted evidence, and does not turn third-party claims into user instructions.
- Research reserves model output, extra retrieved-input allowance and the documented $0.007 search fee before a request. Provider-reported total cost takes precedence; missing totals use marked estimates. Reservations are conservative estimates, not a provider-enforced hard spending limit.
- The compact picker now changes only the builder route. Research and lead/reviewer/repair routes survive builder changes. Research has an explicit Models checkbox and route; an empty research route uses the planner route, which must then be OpenRouter. Existing saved configurations remain compatible.
- Session keys can be copied internally only between profiles with the same provider and exact endpoint. Keys are not serialized or returned to the UI.
- Failed replanning cannot be approved using a stale saved brief.

OpenRouter documentation: [web search and annotations](https://openrouter.ai/docs/guides/features/plugins/web-search), [total usage cost](https://openrouter.ai/docs/cookbook/administration/usage-accounting). Candidate IDs and prices were verified from the live [model catalog](https://openrouter.ai/api/v1/models), not inferred from Codex's available models.

## Controlled planning pilot

Reproducer: `scripts/evaluate-planners.ts`. It can use configured environment credentials through the CLI, or an existing Configuration instance in process. The live pilot used an existing in-memory OpenRouter key without restarting the app, exporting credentials or changing active routes during the comparison. Records live under `.forge/evaluations/research-model-pilot/`; the public result is copied to `docs/results/research-model-pilot.json` after completion.

One fixed prompt asks for a Steal a Brainrot-style multiplayer first playable slice, procedural assets, no monetization, sensible defaults and explicitly deferred work. Three models receive that prompt with/without the **same saved research dossier**: GPT-4.1 mini, GPT-5.6 Sol and Claude Sonnet 5. Each uses a 6,000-token completion cap, the same schema, namespace and up to two format attempts, with no fallback model. A shared $1 aggregate budget includes the initial research and all failed attempts. Settings and project data are isolated from the user's existing games.

The research retrieval returned a firsthand gameplay article plus secondary guides/wiki material and a tutorial page. It did not retrieve the original listing, and the dossier states that limitation. The coding agent independently checked the [original Roblox game description](https://www.roblox.com/games/109983668079237/Steal-a-Brainrot): acquisition, stealing, income, rebirth and gear are explicitly advertised. This independent check was **not injected into only one comparison cell**. Timers, balance, visuals and detailed theft rules remain less certain; original tuning is identified as an adaptation.

The baseline GPT-4.1 mini brief reproduced the user's complaint: players have brains attached to their heads, steal them in an arena for score, then respawn. It omitted the producer-acquisition/passive-economy/base-raiding/rebirth loop despite eventually passing structural validation. GPT-5.6 Sol with the shared research produced a first-attempt valid brief with conveyor purchasing, producers, contested transit, carry-and-return theft, counterplay, timed protection and rebirth. These observations show why structural validation alone is insufficient.

This is one sample per cell on one prompt. Keyword indicators are diagnostic only; inspect the actual saved briefs and failures. A truncation is an output-budget failure, not proof a model misunderstands the game. The pilot does not rank general coding ability or establish native gameplay, animation, visual or production quality. A larger corpus and implementation-level native tests are still release gates.

## Original pilot results

| Model | Research | Outcome at 6,000 output tokens | Planning cost |
|---|---|---|---|
| GPT-4.1 mini | Off | Structurally accepted after 2 attempts; wrong score-arena game | $0.009079 |
| GPT-4.1 mini | On | Rejected after 2 attempts: required items have no implementing task | $0.017452 |
| GPT-5.6 Sol | Off | Truncated | $0.066330 |
| GPT-5.6 Sol | On | Accepted first attempt; researched core mechanics retained | $0.078419 |
| Claude Sonnet 5 | Off | Truncated | $0.073282 |
| Claude Sonnet 5 | On | Truncated | $0.088244 |

Initial search/research cost: $0.038226. Original pilot total: **$0.371032**. Three truncated cells were then rerun separately with 12,000 output tokens under the same aggregate $1 cap. Their evidence is retained separately, so the initial failed attempts are not hidden. The 120-second provider deadline remains unchanged. A timeout has only conservatively reserved billing available and is inconclusive about final output quality.

The expanded Sol/no-research sample passed structurally and described acquisition, passive earnings, bases and carrying theft, but deferred rebirth and owner counterplay. Its keyword indicators mark rebirth present because the word appears in a deferred list: this is a concrete reason not to treat those indicators as a fidelity score.

## Expanded-output results

| Model | Research | Outcome at 12,000 output tokens | Recorded cost |
|---|---|---|---|
| GPT-5.6 Sol | Off | Accepted first attempt; core genre correct, rebirth/counterplay deferred | $0.057218 |
| Claude Sonnet 5 | Off | Hit the unchanged 120-second deadline | $0.154284 estimated |
| Claude Sonnet 5 | On | Hit the unchanged 120-second deadline | $0.196662 estimated |

Final comparison accounting: **$0.779196 of the $1 cap**, including **$0.350946 in conservative timeout estimates**; completed responses reported **$0.428250**. This is not an invoice reconciliation. The original six cells plus three paired reruns are complete. Claude's output quality remains inconclusive: the current adapter deadline prevented completed briefs even after raising the token cap. Supporting slower reasoning models requires an evaluated timeout/reasoning policy; no general model ranking is established.

The selected starting configuration is Sol with research because it produced the most faithful accepted brief in this pilot. That choice is provisional until implementation-level multi-genre comparisons and native tests. See [original results](results/research-model-pilot.json) and [expanded-output results](results/research-model-expanded-output.json). Raw attempts and full retrieved excerpts remain in the local evaluation directory.

## Live configuration and verification

Research is now enabled for new planning runs. GPT-5.6 Sol is the primary research, lead planner, reviewer and repair profile, with a 12,000-token profile output cap (research is separately capped at 6,000). Builder selection is independent and remains GPT-4.1 mini until implementation-level comparisons justify changing it. Existing profiles and session keys were retained. Reviewer/repair fallback remains the prior Gemini profile; the planner fallback remains the previous mini profile.

The successful researched Sol sample is available as **Research pilot · Snatchling Showdown — First Playable Slice**, project `544ded04-06c1-4198-8cc4-f765adfcccb2`, at the review stage. It contains model-produced research and a brief, no gameplay artifact and no approval. Its sample cost is $0.116645, including $0.038226 for research. It was displayed and verified in the in-app browser. The other benchmark cases remain isolated.

Final `npm run check` passes: 128 unit tests, six offline Luau scenarios, six plugin mock scenarios, guard checks, build, production HTTP smoke and 28 desktop/mobile browser cases. These tests establish local contracts and UI behavior, not native gameplay quality. New checks exercise real retrieval request shape, missing/invented citations, lost mechanic coverage, source provenance, cache invalidation, budget reservation, isolated comparison accounting, safe session-key reuse, routing persistence and source display.

## Native verification handoff

Forge's HTTP bridge reported a connected `Place1`; the separate Studio MCP connector returned no sessions. These are different connections. No new credentials are needed for the Forge bridge or this research pilot. The user was asked to identify whether `Place1` is disposable before applying the independent capability fixture. No new native pass is claimed by this work.

The previous attempt to install a temporary fixture driver and launch another Studio process was rejected by automatic approval review with “blocked by policy.” That command was not retried. The existing plugin's ordinary Apply/Test workflow can be used in a user-identified test place. The unresolved cookie project's requested texture still requires a real asset or an explicitly accepted appearance change; research does not manufacture missing assets.

The full local application is still **not production ready**. See [the release gates](production-readiness.md).
