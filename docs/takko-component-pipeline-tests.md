# Component adaptation in the generation pipeline

2026-09-16. The actual asset pipeline can now ask its configured worker to adapt a captured Marketplace component or reject it and continue searching. The Studio adapter applies the manifest to an unparented copy, captures the result, and returns verified evidence for a second source review. This connects the previously isolated adaptation diagnostic to normal Engine orchestration. Executable placement/export and complete game acceptance remain unfinished.

## Implemented behavior

`Engine` routes adaptation to the builder model with the original request, complete game context, exact asset target, captured sources and previous review. Calls use the existing usage accounting, budget admission and bounded contract retries. No stronger rescue model, manually selected replacement asset or root-authored gameplay is introduced.

After a review that needs evidence, rejects the original, or marks source adaptation necessary, the worker chooses `adapt` with a validated manifest or `reject` with a reason. An original rejection is not an irrevocable ban on preserving useful content while removing unrelated code. There is at most one applied adaptation per candidate. Rejecting the proposal or the recaptured result returns to the existing candidate/search limits only after confirmed cleanup. A fully preserved integration candidate avoids an unnecessary adaptation call.

`StudioAssetAdapter.adaptComponent` reloads the owned preparation packet from disk, rejects caller-modified evidence, validates the manifest, and verifies the retained source archive before sending native work. It creates an unparented copy, applies the declared removals/source edits/additions, destroys that copy, and transfers a bounded capture through an ownership- and hash-bound temporary cache. The host checks complete expected inventory and rebuilds review context from retained bytes. Originals and their existing inspection verdict are unchanged. A lost mutation result halts for reconciliation; a failed read after a known capture remains cleanable. Adapted code never becomes executable merely because a reviewer approves it.

The second review receives the actual new packet, sources, bindings, permissions, media and configuration. A stale review cannot approve the derivative. Audit events retain the adaptation decision, manifest, native receipts and post-edit review. Candidate rejection cites the current packet rather than the original one.

## Verification

Fifteen new tests cover Engine routing/context/accounting, the pipeline's adaptation/rejection and post-review flow, salvaging a rejected original, stale/invalid data, cancellation, unknown native outcomes, host evidence tampering, altered captured source, failed transfer, repeat application, and continued prohibition on ordinary placement. Providers and Studio are mocks in those tests.

Full `npm run check` passed **863 unit/API +10 desktop +36 browser tests**, plus Luau, plugin, guards, build and production smoke (exit0). No application code changed after that run.

Native verification separately used the real Studio adapter on three frozen, previously worker-selected Marketplace assets and recorded worker manifests:

| Component | Resulting instances | Source bindings | Native result |
|---|---:|---:|---|
| Combat training dummy | 17 | 0 | Declared loader removal and retained rig verified |
| Bubble wrap | 367 | 74 | All 72 edits and added Server/Client scripts verified |
| Parkour checkpoint | 4 | 1 | Declared checkpoint source replacement verified |

All three actual native transfers, archive checks and cleanup operations passed. Imported code was not executed during this replay. The earlier bubble Play test remains separate evidence; it is not extended to the combat or parkour cases. A final read-only check found no `AdapterRegression_` scopes; original Butter remained present with its script enabled, and Place1 remained in Edit.

This is a controlled infrastructure replay: the tool rebound only packet/context identifiers after requiring fresh nodes, source bodies, media, configuration and security profiles to exactly match the frozen input. It did not change the recorded gameplay sources or asset selection. It is **not a new raw-model performance result or fresh Marketplace-discovery benchmark**. No paid calls occurred.

Native records: `docs/results/takko-component-pipeline/native-v1`. Reproduction: `npx tsx scripts/verify-component-adapter.ts STUDIO_UUID FRESH_OUTPUT_DIRECTORY`. The script preserves failed attempts and refuses a different or changed asset. Full regression log: `research/results/component-pipeline-v1/check.log`.

## Remaining integration

The pipeline now reaches applied adaptation plus re-review, but still stops before executable component placement and game export. Next work must retain native component hierarchy/properties/references in the exported game, bind it to the generated surrounding code, and require actual native behavior evidence. Then run fresh combat, parkour and ASMR trials without manual rescue. This change alone does not prove better search, complete game understanding or a completed game.

The running app on port4324 remains the prior version; no restart or activation was attempted. Existing saved credentials are unchanged. The last settled allowance remains $6.966581614, checked in the preceding turn; this turn incurred no provider usage.
