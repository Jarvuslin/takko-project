# Retained components in generation and HTTP export

2026-09-16. Normal Engine generation can now continue after a component passes source review and native XML comparison. The builder receives the exact retained root path, node inventory, source bindings, media references and integration notes. The HTTP place export includes the native component automatically. This removes the previous unconditional stop after component review. Fresh whole-game trials and Studio bridge delivery remain outstanding.

## What changed

`component-integration.ts` persists a content-addressed integration record bound to the asset need, game-context hash, source-review packet, source archive, conversion record and native comparison. Reads reconstruct the original/adapted evidence and revalidate those bindings rather than trusting copied model claims. The record explicitly marks runtime verification as not performed and placement as requiring worker integration. Every retained source body passes the protected runtime Source-write check, even when no adaptation was requested.

`StudioAssetAdapter.prepareComponentIntegration` operates on the current owned packet, checks the reviewer decision, converts the retained archive, and compares the original unparented component against the converted XML using the existing full native round-trip comparator. It never executes the imported scripts. The asset pipeline retains the resulting component reference only after confirmed quarantine cleanup. Unknown native outcomes still halt for reconciliation.

The builder's `retainedComponents` context includes the component root path, actual grouped sources and bindings, nodes, media, requested position/maxSize and remaining integration notes. The worker is responsible for integrating placement, scaling and behavior. Native source content stays outside the generated Bundle's file/scene limits. Static validation rejects generated scene/file declarations inside a retained component. The HTTP export revalidates saved records and appends the verified XML through the component-preserving exporter.

When the worker discovers another asset need, Engine checks that the original game context and accepted need remain unchanged, then updates the retained entry's current context binding. The original component evidence record stays immutable. A regression covers that additional-asset flow.

The current Studio bridge does not carry native component payloads. It now rejects such apply/test requests and cancels already queued commands if a component is added before dispatch. It must not silently deliver a partial game. Complete HTTP place export is available; bridge implementation and isolated native whole-game testing are still required.

## Verification

New offline tests cover bound component loading, exact builder context, HTTP export, stale/tampered records and XML, changed needs/scope/revision, native comparison failure, retained runtime Source writes, generated-content collisions, normal Engine continuation, additional-asset reuse, cancellation/unknown effects and cleanup-before-retention. API tests also cover component-unaware bridge rejection and queued-delivery cancellation. Provider, archive-envelope and Studio comparison fixtures in these tests are explicitly simulated.

The first full check found a TypeScript widening error in a test mock; its type was corrected. The next reached 35/36 browser tests before a Windows worker crash (code3221226505) prevented one typography test from starting. Both failure logs are preserved. The complete rerun passed **910 unit/API, 10 desktop and 36 browser tests**, plus Luau, plugin, guards, build and production checks (`research/results/component-integration-v1/check.log`).

After the fresh trial, the controller's isolated-service routing, native comparison diagnostics and their regression tests were added. Another native worker crash in the API suite is preserved in `check-isolated-worker-crash.log`. Vitest concurrency was capped at two workers. The final **`npm run check` passed 919 unit/API, 10 desktop and 36 browser tests, plus all other stages**, exit0 (`check-with-fresh-trial-diagnostics.log`). This is a mitigation for test-process resource use, not proof of the Windows crash's cause.

Separately, three fresh raw Gemini 3.7 Flash reviews assessed the recorded adapted components. No root-authored source review, replacement game code or new asset choice was supplied to the model.

| Component | Raw verdict | Call cost |
|---|---|---:|
| Combat training rig | Integration candidate | $0.01156050 |
| Bubble wrap | Integration candidate | $0.02835525 |
| Parkour checkpoint | Integration candidate | $0.01496400 |
| Total | 3/3 first-attempt contract passes | **$0.05487975** |

The model's positive descriptions remain model judgments, not behavioral evidence. Receipt verification recorded 38,193 input and 6,996 output tokens, checked request/response identities and found no plaintext provider key. The settled key delta exactly matched these calls: usage $3.088298136, **$6.911701864 remaining** at 09:10:03 UTC. The saved encrypted credential was reused.

Actual native preparation then passed through the production adapter for all three components. This controlled replay required fresh captured inventories to match their frozen inputs, reused the unchanged worker edits, and rebound only review/manifest identity fields to the fresh packets. It is not a new raw search or complete generation trial. The real method converted and compared each component, persisted its integration reference, and cleaned the owned quarantine. Final read-only inspection found no `AdapterRegression_` scopes; original Butter remained present and enabled, and Studio remained in Edit.

Raw reviews: `research/results/component-integration-v1/review`. Native receipts and integration records: `docs/results/takko-component-integration/native-v1`. No imported gameplay code ran during this turn.

## Next required work

Fresh diverse generation is now being measured separately under `benchmarks/runs/marketplace-diversity-v3-20260916/PROTOCOL.md`, preserving every raw plan, search, selected asset, adaptation, generated file and failure. The existing live app is still PID36672 on port4324; these changes have not been activated there. The isolated source-version test service runs on4335 with separate data and the saved key restored. The prewritten protocol was updated before dispatch; its earlier unexecuted version remains preserved. See that campaign's results for the eventual fresh-trial outcome.

The [fresh combat trial](../benchmarks/runs/marketplace-diversity-v3-20260916/RESULTS.md) has now finished as a failure: an independently chosen dummy exposed a144->143native instance-count mismatch, traced to one TouchTransmitter. Diagnostics were fixed and tested; the preservation policy remains unresolved. Two calls cost$0.03271185, leaving$6.878990014. The remaining two briefs were not dispatched into this newly discovered importer issue. The isolated service was stopped after verifying no jobs or reservations; original4324 remains unchanged. No full-game code or plan was repaired manually.

Native bridge delivery or a verified isolated place-import path, worker placement/scaling, actual combat animation/hits/SFX, parkour progression/fall recovery, audio acceptance and full-game presentation remain unverified. The earlier bubble component Play pass is separate evidence. No completed-game or general quality claim follows from this integration work.
