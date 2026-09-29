# Proposal-plan binding failure, and the pattern behind eight runs

2026-09-25. Diagnosis of the minimal fighting benchmark failure, written for handover. No product source was changed. No paid calls were made. Nothing in any evidence directory was touched.

**The reported cause is the last link in the chain, not the cause. The more important finding is that this is the same defect as the previous run's, and the strategy of discovering these one paid run at a time will not converge.**

## 1. The actual root cause

Reported: *"none of the planner's tasks declared theme coverage."* True, and it is the symptom.

Requirements in the preserved `terminal-project.json`, grouped by proposal provenance:

```
proposal:mechanics    8   coreLoop, punchInputBinding, punchAnimationPlayback, animationLockRate,
                          serverHitValidation, hitSoundFeedback, counterPersistNoReset, dummyStaticPassive
proposal:environment  3   practiceEnvironmentLayout, cameraDefault, lightingDefault
request               2   hitCounterUI, exclusionScopeLimits
(none)                2   perPlayerStateLifecycle, characterAnimatorSetup
proposal:theme        0
```

**The theme section produced zero requirements.** The chain is:

```
theme section -> 0 requirements -> no task owns theme work -> no task tags "theme" -> gate throws
```

Tagging was never the problem. A task cannot honestly declare coverage of work that no requirement describes.

Note for anyone re-reading the evidence: task titles are misleading here. `dummyAssetDiscovery` and `dummyPlacement` look like theme work, but they trace to mechanics and environment requirements. Reading titles instead of the requirement chain produces the wrong conclusion. Verified: mechanics 8/8 owned by tasks, environment 3/3 owned, zero orphan requirements.

## 2. Why it was terminal instead of corrected

This is the part that matters most.

`src/generation/engine.ts:2685`

```js
await this.run(p, "plan", settings, keys, signal);
bindProposalPlan(p);              // one statement too late
```

`run()` contains a correction loop. `src/generation/engine.ts:2050`

```js
await validate?.(value, result);          // inside try, inside the attempt loop
...
this.event(p, "Validation feedback: " + last.message.slice(0, 1000));
```

Anything `validate` throws becomes feedback and the model retries. That is exactly how run 1's "five null sourceIds" defect was corrected for $0.168120 and then passed specification validation.

`bindProposalPlan` runs immediately after `run()` returns, outside that loop. A defect the existing machinery could have repaired for roughly $0.17 became terminal instead. The plan is billed as a successful provider call while the overall build fails.

The correction mechanism is one line away and unused.

## 3. The check is also measuring the wrong property

`bindProposalPlan` in `src/generation/proposal.ts:230` verifies that the literal string `"theme"` appears in some task's `proposalSections` array. That is a proxy, and it is wrong in both directions.

- A plan can stamp `theme` on an arbitrary task and pass while deriving zero theme requirements.
- Genuine theme coverage recorded under different labels fails.

It correlated with the truth in this run by accident.

The honest signal already exists in the saved data. `requirement.sourceId` carries values like `"proposal:mechanics"`. Coverage is computable as: every proposal section produces at least one requirement, and every requirement is owned by a task. That chain works today and nothing consults it.

## 4. The check may also be demanding scope the user forbade

Worth resolving before implementing anything.

The approved theme section's concrete claims are: the dummy is depicted as a classic practice dummy, the player is a generic humanoid fighter, and the styling is a generic training gym. But the dummy's appearance **is** the approved Marketplace asset. The gym **is** `practiceEnvironmentLayout` under environment. The player model is the default avatar.

For a deliberately minimal game there may be nothing to implement from theme beyond what assets and environment already cover. A mandatory per-section requirement pushes the planner toward inventing scope or applying a cosmetic label. Both were explicitly warned against in the benchmark report itself.

Suggested rule: a section must produce at least one requirement, where an explicit "no separate implementation needed, satisfied by X" requirement is valid. The planner already expresses exclusions this way in `exclusionScopeLimits`.

## 5. This is the same defect as last run

| Run | Failure | Check runs | Structured source that already existed | Outcome |
|---|---|---|---|---|
| 1a | five null `sourceId`s | **inside** `validate` | n/a, schema | corrected $0.168, recovered |
| 1b | asset to requirement inferred from numeric ID in requirement prose | outside | `spec.assetNeeds[].requirementId` | terminal |
| 2 | theme coverage inferred from task label | outside | `requirement.sourceId` | terminal |

Both terminal failures share one shape:

> A structural invariant is checked outside the correction loop, using a syntactic proxy, for a semantic property whose structured source already exists in the saved data.

The one failure that recovered is the one whose check ran inside `validate`.

This is not two unrelated bugs. It is one architectural defect that has now fired twice, and the fix for it is the same both times.

## 6. Why the current strategy will not converge

Throw sites between plan-accepted and OpenCode launch:

```
src/generation/proposal.ts          9
src/marketplace/asset-binding.ts    9
src/marketplace/approved-adapter.ts 2
src/generation/asset-pipeline.ts   16
src/generation/opencode-runtime.ts  9
src/generation/engine.ts build branch (2600-3150)  9
                                   --
                                   54
```

Not all 54 are brittle contract checks, and many are legitimate error paths. But this is the failure surface, and it is currently being explored **one paid run at a time**. Each run buys exactly one gate. Eight runs in, no run has ever reached code generation.

The compounding problem: everything downstream of these gates is still completely unexercised. OpenCode jobs 0, generated files 0, Studio applies 0, gameplay sessions 0. Every gate fixed so far only moves the failure closer to the starting line of the half that has never run.

## 7. Recommended plan, in order

**Step 1, free. Stop paying to discover gates.**

Build an offline replay harness that takes the two preserved real planner outputs (`opencode-fighting-live-20260924/terminal-project.json` and `opencode-minimal-fighting-20260925/terminal-project.json`) and drives them through the entire post-plan path: `bindProposalPlan`, `buildAssetNeeds`, `approvedAssetAdapter`, `resolveAssets`, and OpenCode dispatch, with doubles only for genuinely external things such as the network, the compiler and Studio.

Every gate that rejects real planner output is a bug found for $0. This is the single highest-value action available and it needs no authorization.

**Step 2, free. Fix what it finds as a class, not individually.**

Apply one rule to every gate the harness trips:

- Structural invariants belong inside the `validate` callback so they feed the existing correction path.
- They must read structured provenance fields such as `sourceId` and `requirementId`, not incidental markers such as prose contents or label arrays.
- A gate that cannot be expressed that way should be reconsidered rather than reimplemented.

Write the failing test first, from preserved real output, per the fixture rule now in `AGENTS.md`.

**Step 3, paid, one small authorized run.**

Only after steps 1 and 2 are green. Purpose is not to produce a good game. It is to prove that gate to OpenCode to files to apply works at all, once. Keep the request trivial.

**Step 4, the strategic question, after step 3 succeeds.**

Takko currently front-loads a full specification, task graph and contract set that must be mutually consistent before any code exists, then validates that structure at many independent checkpoints. That is inherently brittle against probabilistic output. Whether that is the right shape is worth asking, but it should be asked with evidence from a pipeline that has completed at least once. Rewriting before ever seeing it work end to end would be premature.

## 8. Three separate defects found, not in the reported cause

**Automatic asset selection is structurally dead, not marginal.** `src/generation/decisions.ts:409` requires `confidence >= 0.8`. Observed confidences across the eight assessed batches were 0.32, 0.44, 0.24, 0.60, 0.29, 0.62, 0.50 and 0.62. The best observation is 0.18 below the bar, and the model is judging from name and creator metadata only. At this threshold with this evidence it cannot fire. Changing the threshold without improving the evidence given to the selector only trades a false negative for a false positive.

**The VFX negation defect is in the pre-spec regex path.** `assetSearches()` in `src/marketplace/discovery.ts` matches raw brief text, so "Do not add VFX" matches `VFX` and a search group is created anyway. Same naive keyword path that produced the earlier group and namespace problems.

**Model output quality signal.** The approved theme text contains `"победа/loss conditions"`, a Russian token mid-sentence. Worth recording in any model quality assessment.

## 9. What this does not establish

No code was changed and no fix is claimed. `npm run check` was not run in this turn, and it was not run in the benchmark turn either, so the last full result remains 1,553 tests across 100 files with 165 browser passes. Those offline results did not prevent either live failure, which is itself the point of section 6.

The asset binding fix from the previous run was independently verified against preserved real output and holds, but it has still never succeeded in a live run because both subsequent runs stopped before reaching it.
