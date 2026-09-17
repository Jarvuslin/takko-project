# Component reviewer tests and rejection recovery

September 16, 2026. The preceding goal turn was progress: native captures exposed 72 previously omitted sound bindings. This turn tests whether models can use those complete inputs, and fixes generic review/recovery problems found along the way. The larger goal remains active: autonomous, diverse Marketplace reuse followed by verified gameplay.

## Paid observations

Three frozen worker-selected components and their original game briefs: combat dummy, bubble-wrap sheet, checkpoint pad. Each diagnostic reconstructs hash-bound native review inputs and invokes the actual Engine review call, instructions, schema, billing and automatic correction. Root supplied no review answer, replacement game code or new asset selection. These are **review replays**, not fresh Marketplace discovery or full-game runs.

| Run | Model | First-attempt contract passes | Final contract passes | Calls | Cost |
|---|---|---:|---:|---:|---:|
| Original diagnostic | GPT-4.1 mini | 0/3 | 0/3 | 6 | $0.06776040 |
| Revised guidance/grouped media | GPT-4.1 mini | 0/3 | 0/3 | 6 | $0.04580960 |
| Same revised review input | Gemini 3.7 Flash | 0/3 | 1/3 | 6 | $0.14785875 |
| Explicit unchanged-component verdict | Gemini 3.7 Flash | 2/3 | 3/3 | 4 | $0.11842050 |

Total **$0.37984925**, independently matched by the settled key usage delta. Remaining shared allowance: **$7.357603864** at 07:25 UTC. All runs and failed responses are preserved under `research/results/component-review-models`. The final bubble review needed one automatic correction for an ungrounded asset-ID quotation; no human correction was supplied.

This is an exploratory sequential diagnostic, not a randomized model ranking. The original harness duplicated gameContext inside the nested review context; revised runs remove that duplication to match production placement. The mini-versus-Gemini revised runs use the same review contract and context, but admission caps differ ($0.15 versus $0.25 per case) for their token rates. No run stopped at a budget gate. Provider caching and sampled output vary. Do not attribute every price difference to prompt changes or extrapolate this to average game-generation cost.

GPT-4.1 mini repeatedly exceeded explanation bounds, invented verdict/status enum values and failed exact source quotations despite automatic feedback. The instructions changes alone did **not** fix its suitability for this step. The earlier success on tiny logic modules did not predict reliable component review.

## What the final reviews understood—and still missed

- **Combat:** recognized the reusable R6 rig while flagging the bundled script's unresolved `require(...Module.Value)`. It did not treat the asset's descriptive utility code as sufficient evidence of safe complete combat behavior. Final verdict: `needs_more_evidence`.
- **Bubble wrap:** identified 72 bubble/sound bindings, existing click-to-hide/pop behavior, and an obfuscated external-loading chain among unrelated utility scripts. It proposed retaining useful geometry/audio while addressing the problematic subtree and missing counting/animation/touch behavior. All 72 media bindings were covered in **one** grouped review entry. Final verdict: `needs_more_evidence`.
- **Checkpoint:** identified existing touch/respawn behavior, missing sequential progression, absent activation presentation/audio and the old R6 Torso dependency. Final verdict: `integration_candidate`, which remains only a static recommendation for subsequent work.

These are useful observations, not complete semantic passes. The bubble review incorrectly attributes MarketplaceService product-info access to the Network capability. Roblox documents that product-info access uses **AssetRead**, while **Network** controls HTTP APIs. That capability error remains in the raw result and must be resolved before execution. [MarketplaceService reference](https://create.roblox.com/docs/reference/engine/classes/MarketplaceService), [capability definitions](https://create.roblox.com/docs/scripting/capabilities).

The checkpoint source also writes outside the intended owned component namespace; its proposed future adaptation is not implemented. No imported code, sound or animation was run during these diagnostics. No observed model recommendation is an execution approval. Complete gameplay understanding and native suitability remain unproved.

## Implemented fixes and tests

1. **Candidate-level review rejection returns to search.** After an `unsuitable` review, confirmed cleanup precedes a durable rejection record. The worker sees the reason and remaining candidates/budget, while the rejected ID stays excluded. Unknown cleanup effects still halt, and exhausted attempts do not produce another import. Three behavioral tests cover successful continuation, uncertain cleanup and exhaustion.
2. **Grouped media review preserves every binding.** Responses may group identical media references under an `indices` list. Validation expands the groups and demands exact complete coverage and unchanged values. Historical single-index responses remain supported. Tests reject missing, duplicated and changed bindings and accept mixed representations. The live final bubble review demonstrates 72 bindings in one entry; no token-saving percentage is inferred from unmatched outputs.
3. **Review current evidence separately from proposed changes.** Instructions and correction feedback explicitly explain that future removal/adaptation has not cleared current unresolved code or permission impacts. The validator remains strict. An added test requires the unresolved entries to remain when the verdict becomes `needs_more_evidence`. Gemini's final three contracts passed; mini's earlier failures remain failures.
4. **Name failed review operations accurately.** The engine now reports `component-reviewer` rather than an undefined task. A full Engine regression verifies two failed attempts, named diagnostics and no placement.

The revised guidance also emphasizes contribution to the asset's stated role, executable behavior over comments/names, exact dependency quotations and concise explanations. This is general product guidance; no candidate-specific answer or game patch was injected.

Full final `npm run check`: 786 unit/API tests, 10 desktop tests, 36 browser tests and all Luau/plugin/guard/build/production stages. Diagnostic verifier checks every input hash, all 22 provider receipts, budgets, final raw-response contract outcomes and absence of plaintext provider keys. Source and test evidence are separate from native gameplay.

Activated the checked changes on localhost:4324, PID36672. Verified all 18 projects and the complete model/routing/budget configuration unchanged, restored all nine test keys from the encrypted vault, and confirmed HTTP200. No model-route change or new Studio operation occurred this turn.

## Next step

The v3 fresh diversity protocol is registered under `benchmarks/runs/marketplace-diversity-v3-20260916/PROTOCOL.md`, but **not dispatched** this turn. The replays show that the next needed work is dependency resolution and a reviewed integration/adaptation path, including resolving instance-stored values and capability claims. Repeating full-game calls against that unchanged integration stop would not establish improvement. Preserve useful behavior and media, let workers author only the missing adaptation, retain original and adapted artifacts separately, then verify the resulting native game across the original diverse cases. Do not root-author a rescue game or mark the goal complete.
