# Game context through discovery and implementation

September 16, 2026. The user identified that a worker seeking a generic yellow food prop was losing the intended ASMR experience. The previous short-query rule addresses search breadth; it does not establish that a worker understands the game.

## Diagnosed losses

Asset selection and evaluation received the raw request and full specification, but omitted direct clarification answers and reference research. Asset input hashes covered the request, needs, revision, Studio and routes, but not the interpreted experience or clarifications. Separately, revising a project saved answer strings and cleared the specification, discarding the questions that gave those answers meaning.

## Changes

- A shared `gameContext` now reaches planning, building, review, repair, asset selection and both asset evaluations. Research also receives the question/answer context. It contains exact user sources, clarification pairs, the planned experience and requirements, and input-matched reference mechanics/citations/unknowns. It separates user statements, inferred requirements and retrieved evidence. Replanning does not present the previous specification as the current accepted interpretation.
- New plans must give each asset an explicit purpose: its role in the player experience, player action/response/completion timing (or an explicit decorative role), reusable features to inspect, and linked requirement IDs. Missing intent triggers bounded correction by the planner. Links must exist and include the primary asset requirement. This is structurally validated context, not a semantic-quality score.
- Short queries remain broad discovery tools. Candidate selection instructions now require connecting the decision to the requested interaction/media and identifying remaining inspection or adaptation. Evaluators assess the same purpose against actual evidence. No Butter asset ID, winning query or game implementation is supplied by this change.
- Clarification questions survive revision alongside the exact answers, marked as planner context rather than user instructions. Removed answers remove their question context. Research binding includes retained question meaning. Legacy records with no question history are not given invented questions.
- Accepted asset evidence is bound to the full game-context snapshot. A changed answer, experience, acceptance criterion or research snapshot cannot silently reuse old accepted assets. Old records remain readable; accepted assets without this new binding require a new revision before reuse. Benchmark readers accept the optional context and include it in the existing hash verification.

For the same common-name query, a butter ASMR interaction needs tactile animation, suitable sound and the requested input/count timing, while a cooking ingredient can require drag-to-bowl interaction with no sound. Offline regressions assert that these distinct inputs survive the handoff; they do not claim that a live model chose correctly.

## Boundaries

Old plans and builder-discovered asset needs without explicit intent are labeled as such and receive their linked requirements and full game context. They are not retroactively assigned a fabricated interpretation. Textual accuracy still requires model judgment and subsequent review; field presence alone cannot prove understanding. Unavailable or mismatched research is explicit. No new web research, paid worker benchmark or Studio test ran for this change.

The separate capability gap for preserving and executing embedded Marketplace scripts remains: [complete asset discovery](takko-complete-asset-discovery.md). The user's original Butter and all historical failed benchmark outputs remain unchanged.

## Validation

Targeted regressions cover real Engine handoffs with offline provider/Studio doubles, planner correction, clarification retention/removal, reference input binding, distinct experiences for the same object, and stale accepted-asset prevention.

`npm run check` passed: **670 unit/API tests, 10 desktop tests, 36 browser tests**, plus Luau/plugin/guards/build/production stages. Log: `.forge/game-context-check.log`. Loaded the changes into idle Takko PID 22236 on port 4324 at `2026-09-16T04:07:42.502Z`, retaining all four configured keys. HTTP responded and the temporary inspector was confirmed closed. [Verification and source hashes](results/takko-game-context/verification.json). No paid calls or Studio operations occurred; improved autonomous selection still requires a fresh worker benchmark.
