# Evaluation plan

This is a runnable research specification, not a claim that Lemonade generation has already been benchmarked. The offline probes cover selected client semantics only.

## Baseline data to obtain

Collect 20 representative runs: successes, failures, partial successes, and expensive/slow sessions. For each, preserve the initial place and source hashes, user request, model/provider parameters, effective prompt/context, tool requests/results, plugin version, project machine lifecycle, token/cost accounting, final place, screenshots, and test evidence. Keep user/project identifiers separated from the analysis dataset.

Tag failures by cause: ambiguous requirement, missing context, wrong API, client/server wiring, race/state conflict, transport/result loss, asset/layout issue, visual mismatch, persistence, multiplayer behavior, missing verification, and premature completion. Permit multiple labels; do not automatically assign every failure to the model.

## Benchmark tasks

Every row needs a fixed starting fixture, automatic assertions where possible, and an independent human or visual rubric. These are proposed cases, not existing Lemonade features.

| ID | Task | Required evidence |
|---|---|---|
| G01 | Add double jump to an existing controller | Two jumps allowed, third blocked, reset on landing; existing movement preserved |
| G02 | Build a checkpoint obby | Ordered progression, death respawn, final completion; no unreachable jumps |
| G03 | Add a server-authoritative coin shop | Correct debit/ownership; insufficient funds; duplicate/replayed request blocked |
| G04 | Build a lobby/round/results loop | Two players, join/leave mid-round, cleanup and next-round transition |
| G05 | Add inventory persistence | Save/load, retries/failure behavior, schema migration; tests use a controlled store |
| G06 | Build a compact tycoon | Claim ownership, purchase dependency order, income rate, UI consistency |
| G07 | Add NPC patrol/chase | Reachable waypoints, target changes, obstacle behavior, clean destruction |
| G08 | Implement an existing design's mobile HUD | Phone and desktop layouts; no overlaps; readable buttons; touch interactions |
| G09 | Fix a silent RemoteEvent mismatch | Root cause corrected with minimal changes; both execution contexts tested |
| G10 | Add a weapon to an existing game | Server hit validation, reload/ammo state, respawn, unrelated systems preserved |
| G11 | Build a coherent small arena | Spawn separation, traversability, consistent scale/art, collision budget |
| G12 | Add audio/settings menu | Changes persist per intended scope; controls accessible; audio does not duplicate |
| G13 | Modify a large existing project | Correct dependency retrieval; bounded scans; no duplicate managers/remotes |
| G14 | Repair a game after interrupted application | No duplicated instances; replayed actions are idempotent; state reconciled |
| G15 | Undo a multi-step generated feature | Exact previous functional state, or truthful recoverable partial failure |
| G16 | Update a script while its editor draft changes | Conflict detected; no silent loss of user edits |
| G17 | Generate with a missing/invalid asset | Explicit substitution or unresolved item; no false success |
| G18 | Verify portrait and landscape UI | Evidence captures correct dimensions; all controls function |
| G19 | Continue after a long conversation | Constraints preserved; current source revision used; minimal irrelevant context |
| G20 | Change one mechanic without regression | All previously accepted behaviors remain correct |

## Scoring

Proposed initial rubric: 40% functional acceptance, 20% preserved existing behavior, 15% visual usability/coherence, 10% maintainability, 10% runtime performance, 5% clarity of completion evidence. Report the components separately, not only a weighted average.

Hard gates override the score: destructive unintended change, unauthorized server behavior in the fixture, unrecoverable corruption, or false claims that unexecuted tests passed. Transport tests should not mutate production or live player data.

Primary metrics: accepted features/request; first-attempt acceptance; acceptance within a fixed total budget; regression rate; cost per accepted task; median/p95 time to accepted result; user interventions; tool error/replay rate; false-completion rate. Also record visual-capture completeness and evidence gaps.

## Comparisons that identify causes

| Experiment | Change one factor | Question answered |
|---|---|---|
| M | Stronger model, same context/tools | Is core model capability limiting results? |
| C | Same model, better context selection | Is missing/stale project context the cause? |
| V | Same generator, enforced acceptance loop | Does verification and repair explain improvement? |
| T | Same model, tested gameplay modules | Is repeated infrastructure invention the cause? |
| R | Same generation, reliable transport/session layer | Are lost/duplicated actions causing apparent model failures? |
| A | Same functional plan, scene/art constraints | Is weak visual specification causing incoherent worlds? |

Run a small pilot, then at least three independent samples per task/policy if budget permits. Pair fixtures and requirements; randomize evaluation order; blind reviewers to model/policy. Preserve all outputs, not just the best example. Use confidence intervals or bootstrap uncertainty for aggregate comparisons. Set final improvement thresholds after observing baseline variance and product economics.

## Instrumentation contract

For each run/action record `runId`, `sessionEpoch`, `requestId`, parent step, feature ID, tool/version, start state revision, result state revision, byte counts, requested/observed capabilities, model/provider, tokens, retries and timestamps. Suggested spans: request received, context built, model started/finished, queued, polled, handler started/finished, result uploaded/acknowledged, tests finished, capture/render/upload finished, acceptance decided.

Track monotonic durations within each process and wall-clock timestamps for correlation; do not subtract unsynchronized client/server clocks blindly. Separate machine cold starts, queue residence, model generation, local execution, media transfer, and repair turns.

## Existing offline probes

`build-offline-probes.cjs` embeds the actual extracted module bodies and replaces external dependencies with local mocks. Luau CLI 0.738 runs them without contacting Roblox or Lemonade. Nine expected behaviors were reproduced; the test output is saved. These are diagnostic probes of current behavior, so a successful probe means the described behavior occurred, **not that the product passed a quality test**.

The probes do not emulate Studio scheduling, rendering, editor drafts, network services, or backend deduplication faithfully enough to replace integration tests. The same-object reconnect probe is intentionally labeled lower reachability because the app normally recreates Core. No end-to-end generation was submitted or charged during this research.
