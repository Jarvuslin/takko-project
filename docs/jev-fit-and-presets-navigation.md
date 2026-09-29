# Jev fit and Presets navigation

2026-09-20. Presets is now its own sidebar button directly below Models. For Jev, the recommendation is a limited evaluation as an optional decision helper. It is not a replacement for Takko's builders, planners or acceptance tests. This assessment assumes the user means TypeSafe AI's Jev.

## What Jev offers

Jev consumes text or structured text and answers predefined questions. Choice selects among supplied options, Score rates a rubric, and Noul estimates whether a statement is true. It does not generate prose or Luau. Several independent questions can share one input. These are documented capabilities, not Takko measurements. [Official introduction](https://docs.typesafe.ai/introduction).

The published Jev 1.13 price is $0.042 per million input tokens, with output free. At that rate, 1,000 calls with 2,000 total input tokens each would cost about $0.084. This is arithmetic based on published pricing, not a run or a promise of total game-generation savings. Most of Takko's current expensive work generates code and detailed reviews, which Jev cannot replace. [Official model reference](https://docs.typesafe.ai/models).

The same reference lists text-only input, a 64k total request limit and a 32k limit for the state plus longest question. It cannot directly judge Studio screenshots or inspect an RBXM binary. Versioned model IDs are available, while aliases can change. Account model discovery uses authenticated GET /v1/models. [Official model reference](https://docs.typesafe.ai/models).

## Fit for Takko

These are proposed applications inferred from the documented API and current Takko code, not demonstrated results.

| Use | Assessment |
| --- | --- |
| Rank a short list of Marketplace candidates against an explicit asset need | Best first trial. It could suggest an order for inspection from names, descriptions and retained summaries. It must not approve an asset or treat a description as proof of behavior. |
| Classify a request as UI, gameplay, networking or debugging | Plausible convenience feature. Use the category to suggest an existing preset or specialist route. Keep an uncertain or mixed option and preserve the user's explicit selection. |
| Triage a long test log | Useful only for semantic grouping or finding relevant excerpts. Exit status, actual assertions and test counts already belong in ordinary code. |
| Pick a cheaper model automatically | Possible later, after measuring each candidate model on Takko tasks. A task category alone does not establish that a cheap model can complete it. |
| Write game code, repair scripts or generate acceptance tests | Poor fit. These require new text and code. |
| Decide whether a game works, approve imports or enforce budgets | Do not delegate these controls to Jev. Keep executable evidence, ownership checks, user authorization and arithmetic in the existing code. |

Takko already selects configured routes by phase in src/generation/research.ts and iterates those routes in engine.ts. That selection is deterministic and costs no model call. Jev would add value only if a new semantic decision improves a measured outcome. Replacing that lookup alone would add latency, an external dependency and cost.

The provider completion contract in src/generation/providers.ts returns text. The engine's planner, builder and reviewer schemas consume generated content. src/generation/reviews.ts also requires executable acceptance scenarios with known requirement identities. Jev cannot simply occupy one of these existing model roles.

## Limits that matter here

TypeSafe explicitly documents weaknesses with numeric precision, indirect reasoning, irrelevant long inputs and adversarial content. Constrained output does not make the selected answer correct. That matters for Marketplace descriptions and third-party scripts, which may contain misleading claims or instructions. Jev should not become a sole security gate. [Published model limitations](https://docs.typesafe.ai/model-jaggedness/jev-1.13).

Confidence is derived from the output distribution. It is a useful signal to evaluate, not proof that a particular Roblox judgment is correct. Thresholds must be calibrated on our own labeled examples, with uncertain cases retaining the existing path. [Confidence documentation](https://docs.typesafe.ai/confidence).

## Concrete integration and evaluation proposal

Keep the first experiment outside the main generation path. Define a small held-out set of asset needs and candidate lists, including ambiguous needs, irrelevant assets, misleading descriptions and cases where no candidate fits. Have a person label acceptable rankings before looking at Jev's results.

Compare the existing ordering with Jev's suggestions. Record ranking accuracy, missed useful candidates, confidence versus correctness, median and tail latency, errors and actual cost. Initially record suggestions without changing which assets Takko uses. Do not claim savings until any avoided inspections outweigh the added calls and quality remains acceptable.

If justified, add a separate server-side decision adapter for POST /v1/systemone. Validate exact answer IDs, allowed choices and finite probability values. Keep a deadline, cancellation, usage accounting and the existing fallback on failure. Pin the evaluated model version and record it with each result. Node can call the HTTP API directly, so no Python installation is needed. The request/response shape is distinct from chat completions. [Official API](https://docs.typesafe.ai/api).

In the UI, this belongs under an optional preset setting such as Suggest useful assets, with a decision-service connection, rather than as a builder model. No adapter, plugin, dependency or paid trial was added during this assessment.

## Navigation implementation

Models and Presets are sibling sidebar buttons with distinct selected states, page headings and breadcrumbs. On mobile they remain visible in a row below the compact header. The internal Models tab bar is removed. Search resets when switching between the two pages. Existing saved models, preset roles, budgets and editor dialogs are unchanged. Old Routing and Budget hashes still resolve to Presets. The running preview updates on reload without restarting its backend or losing keys.

Regression coverage checks sidebar order, independent navigation, active state, absence of the old tab bar, search reset, browser Back and legacy Routing links. Existing persistence, accessibility and desktop/mobile flows remain in the full check.

Final npm run check passed with exit0, no skipped stages and no retries within the final run: 1,301 unit/API tests in78files,6offline combat scenarios,14plugin mock groups plus plugin/8injected-source compilation,6guard fixtures with expected outcomes,TypeScript/Vite build,10desktop tests,production smoke and74browser tests. This was a fresh full rerun after the responsive fix. [Full log](results/presets-sidebar-check-final.txt). Live desktop and generated mobile screenshots were inspected. The final artifacts are in results/presets-sidebar-final-artifacts, with27changed prior evidence files archived and restored. Offline mocks do not establish native Studio or paid-provider behavior.

The first full check passed all stages before browser tests. Its browser result was 71 passed and 3 failed, all on mobile. An existing responsive rule hid the sidebar navigation, which became a functional problem after removing the internal tab bar. This broke navigation from a draft, the project-specific selected-state check and the new separate-navigation regression. The responsive rules now explicitly retain Models and Presets. The failed log and error contexts are preserved in results/presets-sidebar-check.txt and results/presets-sidebar-first-artifacts. Twenty-seven changed prior result files were archived and restored before the full rerun.

No Jev API calls, paid inference, software installation or Studio operations were performed. Cost $0. Historical balance $1.529256456 at 2026-09-16T22:44:44Z was not refreshed. Generation remains paused. No existing server was restarted or stopped. No commit or push.

At16:44UTC, listeners are4345/PID30804 for the current app preview,4343/PID31044 for the earlier app preview and4342/PID28132 for the static mock. No listeners on4318/4319/4320/4324/4335/4336/4340/4341/4344. Test-owned services exited. Do not restart live Takko processes without asking because keys are held in server memory.
