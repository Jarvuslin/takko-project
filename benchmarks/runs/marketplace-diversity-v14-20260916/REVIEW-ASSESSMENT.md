# V14 independent source-review assessment

V14 failed the initial review contract before any component adaptation. The final project has an empty artifact, and its asset-event sequence ends with `component_review_error`, successful discard and `run_halted`; there is no adaptation call. This trial therefore measures acquisition and a review-interface failure, not the effect of the new Sol adapter route or working behavior reuse.

Evidence inspected: `bubble-wrap/final-project.json`, both unchanged reviewer responses in `bubble-wrap/model-events.jsonl`, and captured review packet `5f6354a9c76f5197144425165e12036b6415023db363b11d8314155ffc41f17b.review.json` under `bubble-wrap/asset-evidence`. No worker answer was rewritten or supplied to a running worker for this assessment.

## Exact contract failure

The captured configuration entry at index 17 exists: property `Value`, scalar `99292559910041`. In source `699c263e96b93eecebada761cf45f154301f4a76b5f54babfe2be78de8677677`, the first response attached `configurationIndex: 17` to three `dynamic_or_unresolved` dependencies. Dependency 3 used a descriptive sentence rather than the exact scalar. The old diagnostic combined missing index, mismatched value and disallowed kind into “configuration reference is missing or does not match its ID.”

The second response reacted to that feedback: dependency 3 became the exact string `99292559910041`, and the two later computed-target dependencies lost their configuration indices. It still attached index 17 to dependency 3 with kind `dynamic_or_unresolved`. That kind is disallowed for this field regardless of scalar equality. The terminal error therefore does not establish that the configuration was absent, the corrected number was wrong, or Sol ignored the correction. It establishes an invalid combination that the feedback failed to explain precisely.

## Semantic assessment

Both raw responses chose `unsuitable`. Both recognized useful individual bubble targets, repeated click behavior, sound bindings and the existing regeneration behavior; their two gameplay source rows say `reuse: adapt`. Each contains eleven source dependency citations. The relevant loader citations are grounded: source `699c…` lines 37–42 reads the initial Pose value through the helper's Marketplace metadata lookup, transforms the returned Description and overwrites Pose; line 86 requires the overwritten value. Helper `772345…` lines 130–139 supplies the byte conversion and Marketplace lookup. The initial scalar is not proof of the eventual module ID. The local `require(Type)` is correctly described as an instance reference rather than an external numeric module.

Rejecting execution/integration of that unchanged external-loading path is reasonable. The reviews also correctly describe the immediate click handler (`3ea385…`, lines 3–11): disable the detector, play sound, hide the part. It does not implement depression/rupture/settling phases or completion-timed counting. Counting, deliberate reset, pending audio qualification and final desktop/touch playtests remain integration obligations; their absence alone does not demonstrate that the useful component cannot be adapted.

The overall `unsuitable` choice is conservative relative to the reviews' own recognition of adaptable behavior. Their note “If separately authorized” is not evidence that authorization was missing; the pipeline already had a bounded adaptation stage. Nevertheless, these are invalid raw decisions, so neither a hypothetical corrected disposition nor a successful adaptation can be inferred. Clearer configuration feedback may prevent this formatting failure; it does not prove that the next raw review will choose adaptation.

## Outcome boundary

Acquisition was independently performed by the worker using returned Marketplace results. Captured media and source inspection are real evidence, but no accepted retained component, adaptation, audio audition, game code, export or native gameplay success resulted. Recorded provider cost is $0.36131495 across five known calls (361,317 rounded microdollars), below the project cap. Root's closure evidence reports restored originals and no remaining owned native state. This assessment performed no native or paid operation and makes no adapter-quality or model-ranking claim.
