# Marketplace sourcing rule

Updated by the user's Place1 correction: **search complete reusable components, including existing behavior/animation/audio, before building replacements.** See [complete-asset discovery](takko-complete-asset-discovery.md) for enforced Model-first search, bounded queries, inspection-before-fallback, and capability blocks. The historical trial contract below is preserved; permission to author missing integration does not justify skipping reusable assemblies. Embedded behavior reuse remains a separate unfinished capability, explicitly blocked rather than silently replaced.

User preference recorded 2026-09-15: audio must come from Marketplace, and other applicable assets should be Marketplace first whenever possible.

## Trial contract

- Required sound uses an Audio asset need with `required: true`, tied to a required audio requirement. No generated/synthesized audio, built-in fallback, invented ID or placeholder can satisfy it.
- Relevant visual props declare executable Model/MeshPart/Image searches. A procedural visual alternative is allowed only after the worker's unsuccessful search/inspection is recorded. A prose promise to search is insufficient.
- UI layout, ordinary stage geometry, gameplay logic and code-driven object animation may be authored directly. An imported animation is a separate capability and remains unsupported in the adapter.
- The worker searches, selects, imports, places, verifies and retries through Takko. An unresolved required sound fails the run. Astra evaluates; it does not supply assets or game code.

This rule is frozen in the new trial prompt. It is not yet a global automatically enforced semantic policy in every Takko project. The current planner gate still requires external plan review; do not claim that gap was fixed by this prompt revision.

## Fresh trial and observed adapter failure

Records: `benchmarks/runs/butter-crunch-marketplace-v2-20260915/`. The new Gemini plan correctly declared required Marketplace crunch audio and an optional-but-executable butter visual search. MiniMax M3 performed candidate selection after the application's real Creator Store search. It selected a returned sound candidate, but no native import completed, no sound was verified and no game code was generated.

The adapter rejected the real Studio response:

```
- Current Studio Mode: Edit
- Available DataModels: Edit
- Focused DataModel in the viewport: Edit
```

Its guard previously understood only structured state fields. The failed run remains failed and requires reconciliation according to its saved record. The pending MiMo/Grok trials were not dispatched against the known broken guard. Cost: $0.015541 for one Gemini planning call and one MiniMax selection call. This is evidence of real worker search/selection, not suitability of its selected sound or game-generation success. MiniMax's description speculated about candidate duration and other candidates; those claims are not verification.

## Source fix

`src/generation/studio-state.ts` recognizes the complete observed native text format and the supported structured equivalents. Incomplete text, extra conflicting lines, Play/Client/Server state, unknown fields and contradictory structured aliases are rejected. The adapter continues to leave Studio mode unchanged. Tests use the actual observed response shape and controlled adapter doubles.

The updated source does not alter any model-generated plan, candidate choice or game output. The running app retains the older loaded module and nine in-memory keys; it has not been restarted. A backend reload is required to activate this source fix, and keys would need re-entry because they are currently memory-only. No secret extraction or persistence workaround was used.

Final `npm run check` passed: 559 unit/API tests across 51 files, 10 desktop checks, 36 browser tests, Luau/plugin checks, guards, builds and HTTP smoke. These validate the fix against the observed native receipt and controlled doubles; no post-fix native import was performed. Verification and source hashes: `docs/results/takko-studio-state-guard-verification.json`.
