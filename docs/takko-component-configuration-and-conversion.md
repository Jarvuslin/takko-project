# Captured configuration values and component conversion

2026-09-16. The worker now receives stored scalar `Value` properties that can determine module loads and behavior. A paid replay demonstrates that it can cite the captured external module IDs in both the combat dummy and bubble-wrap component. This is useful review progress, not an accepted game or a cost improvement. The production service has **not** been restarted: automatic approval review rejected that command with “blocked by policy.” PID 36672 remains the prior version; no activation is claimed.

## Product change and tests

`component-archive.ts` captures bounded complete inventories for NumberPose, NumberValue, IntValue, DoubleConstrainedValue, IntConstrainedValue, StringValue and BoolValue. It preserves numeric, string and boolean types, including empty strings and false. It checks values before/after native restoration and again after yielding. Historical archives without this inventory remain unknown. This does not claim coverage of arbitrary properties, attributes, ObjectValue references or dynamically assigned values.

`component-derivative.ts` retains the inventory in content-addressed evidence, rejects changed values before reducing permissions, and rejects differences between original and restricted captures. `component-review.ts` reconstructs this evidence for the worker. An optional `configurationIndex` can ground a numeric media/module dependency in the captured instance's Value while still requiring an exact source quotation. It is the instance index, not the array position. This validates the cited value, not the semantic data flow or external module's behavior. Unresolved external source remains unresolved. Guidance also corrects the previous model's unsupported claim that MarketplaceService product info requires Network; its documented capability is AssetRead. [Roblox source documentation](https://github.com/Roblox/creator-docs/blob/main/content/en-us/reference/engine/classes/MarketplaceService.yaml).

Nineteen new tests cover persistence through the worker packet, altered derivatives, missing/duplicate/mistyped/oversized/nonfinite inventories, historical unknowns, exact dependency citations, automatic rejection of unsupported IDs, and executable Luau mocks for changed values and pre-mutation rejection. **`npm run check` passed: 805 unit/API, 10 desktop, 36 browser tests plus Luau, plugin, guards, build and production smoke.** Log: `research/results/component-configuration-v1/check.log`. Offline tests are distinct from the native results below.

## Actual Studio capture

Replayed the three frozen worker-selected candidates through the production adapter in Place1, Edit mode. No root-selected substitute, authored game code or imported source execution. Captured original and restricted native archives, verified round trips, then removed owned quarantine scopes. Evidence: `docs/results/takko-component-configuration/native-v1`.

| Component | Instances / source bindings | Newly visible configuration |
|---|---:|---|
| Combat dummy | 20 / 2 | NumberPose instance 20, Value 91638724979309 |
| Bubble wrap | 375 / 76 | Boolean settings, numeric setting, NumberPose instance 17, Value 99292559910041 |
| Checkpoint | 4 / 1 | Known empty covered inventory |

A final read-only check found no `DerivativeRegression_` scopes in ServerStorage, Studio still in Edit, and the original Workspace.Butter.Script still enabled. The new archive snapshots have fresh engine-assigned tags/identity, so they are not byte-identical to earlier captures; original failed and successful captures are preserved separately.

## Paid raw reviewer replay

Used unchanged frozen game contexts and selections, current production review instructions/schema/automatic validation, Gemini 3.7 Flash, no supplied answers. At most two calls per component; $0.25 per-case / $0.75 batch admission ceilings. Actual result: **five calls, $0.139767, 1/3 first-attempt and 3/3 final contract-valid responses**. The previous clarified batch was four calls/$0.1184205 with 2/3 first-attempt success. This small sequential comparison establishes neither a general model ranking nor an improvement in cost/reliability.

- **Combat:** now cites module ID 91638724979309 using the actual require expression. First response mistakenly used configurationIndex 1; the validator rejected it and the automatic second response corrected it to instance 20. Final verdict remains `needs_more_evidence`, because the external source is unavailable. It distinguishes the useful rig from unrelated loader/lighting code.
- **Bubble:** now cites captured ID 99292559910041 and all 72 pop-sound bindings. Final verdict `unsuitable`. First response added an unsupported `$schema` field; automatic correction removed it. The previous Network/GetProductInfo attribution error is absent. The model calls the component a “backdoor” and “hijacking”; those are its judgments, not verified descriptions of the unavailable external module. It still does not fully enumerate the cross-module product-description/byte-conversion flow, so semantic completeness remains unproven.
- **Checkpoint:** first-attempt `integration_candidate`; still recognizes missing ordered progress and activation feedback. No adaptation or runtime acceptance occurred.

All raw requests, failures, retries, decisions, source/input hashes and sanitized charge receipts are retained in `research/results/component-configuration-v1/review`. `research/scripts/verify-component-reviewers.ts` independently checks their contracts, inputs and charges. Key usage settled from $2.642396136 to $2.782163136, exactly matching this batch; remaining **$7.217836864** of the shared $10 limit at 07:42 UTC. No other paid calls this turn.

## Rojo conversion experiment

The limited Takko scene serializer cannot faithfully represent every imported hierarchy/property. Tested the existing [Rojo build command](https://github.com/rojo-rbx/rojo/blob/master/src/cli/build.rs) on three retained restricted native archives as a possible export component. Rojo is **not integrated into production** yet. The diagnostic supplies no game implementation.

Downloaded official [Rojo 7.7.0 Windows x86_64](https://github.com/rojo-rbx/rojo/releases/tag/v7.7.0). ZIP SHA256 `2179c44862a10ecbd725bdfeb4abc64e16dc4aad9b6c8f3e1a7c46a87280b949` matches the GitHub asset digest; executable SHA256 `d9154aa9b1d5997967565679d107bf719e273f5881c3c9e263fd6fd223d5e81e`. Local binary: `.forge/tools/rojo-7.7.0/rojo.exe`. Project name must equal the imported root name, otherwise Rojo renames it.

`scripts/verify-component-rojo.ts` builds both RBXM and RBXMX, restores the original restricted archive and converted output as **unparented** instances using native SerializationService, compares reflection-readable serialized properties, hierarchy/order, source, tags, attributes, instance references and explicit Sandboxed/Capabilities, then destroys both roots. UniqueId/HistoryId are intentionally excluded. Unreadable properties remain individually listed in the raw receipts.

| Output route | Combat | Bubble wrap | Checkpoint |
|---|---|---|---|
| Binary RBXM | Failed exact comparison: 8 tiny C0/C1 rotation differences | Passed readable comparison | Passed readable comparison |
| XML RBXMX | Passed readable comparison | Passed readable comparison | Passed readable comparison |

The binary comparison preserves its failure: no tolerance was added. XML comparison checked **6,498 serialized properties, 13 internal references, 79 source bindings and 798 explicit security properties**, plus hierarchy, tags and attributes. This is bounded native evidence for these three components, not a universal losslessness claim or gameplay check. Both attempts and files are retained under `research/results/component-configuration-v1/conversion-{binary,xml}`; run `node research/scripts/verify-component-conversion.mjs` to audit receipts/file identities without Studio.

## Remaining work

Activate the tested context fix when the local service can be restarted through an allowed path. Implement the generic worker-authored component adaptation/integration path using retained originals and separately verified derivatives; the XML experiment supports a concrete export approach. Complete components still stop after review unless rejected back into the bounded search loop. Fresh diverse discovery-to-gameplay benchmarks remain pending; these diagnostic replays do not count as new raw game successes.
