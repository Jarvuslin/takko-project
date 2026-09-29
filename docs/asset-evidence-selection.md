# Asset evidence, Studio animation tiers and model previews

Implemented the requested selection and preview changes without paid inference. Live Jev confidence and generated gameplay remain unverified. The implementation does not change the 0.8 confidence threshold, spending limits or model routes. No vision fallback or EditableMesh work was added.

## Selection

Search results retain their complete page. A Wilson vote prior determines which ten candidates per group receive native capture first. Animation captures request up to 100 clips. Captured motion goes to the decision model as rig, duration, joint rotation and translation ranges, original pose samples, native joint frames, clip count and hierarchy context. Repeated hierarchy labels are grouped without dropping their paths. Tools and MeshParts are reported. Missing context is explicitly unknown.

Each playable clip receives its own relevance gate. Independent gates share requests within the existing 16 KB and 16-question bounds. Only positive answers with confidence at least 0.8 enter vote ranking. Ratings cannot admit rejected candidates. The selected clip key follows the decision into automatic selection instead of choosing the first clip in a pack. Confidence and per-candidate outcomes are retained. Oversized evidence is recorded as unassessed rather than silently billed or truncated. Listing names remain tiebreakers. No thumbnail filtering was added.

Native capture is a manifest read followed by individual clip reads, with chunked transfers when needed. It was not a single native round trip. The existing 90-second client timeout remains. The assembled pack now also observes the 4 MB bound, including context and room for error entries. Model previews use the same hash-checked chunked transport.

The free rehearsal reused the same 29 preserved animation candidates and captured the ten highest vote priors. Its first run discovered that an invalid embedded Animation identity discarded entire packs. Native identities `030` and `0` are preserved in the failure evidence. The regression replays the actual manifest and its actual raw sibling clips through `StudioMarketplace.animations`. Unsupported identities now become per-entry errors. Other clips survive with their original keys.

After that correction, the ten captures contained 64 entries, of which 46 were usable, totaling 921,235 serialized bytes. That rehearsal produced 27 bounded decision requests. The final rehearsal also supplies the linked structured asset need and requirement, and prepares 33 bounded requests for the same 46 clips with no oversized-evidence omissions. Identity rest-frame rotations and default zero translations are represented compactly with explicit defaults. These requests were prepared but never sent to a model. The first rehearsal and its failures remain separate from the corrected rehearsal.

Historical automatic batch confidences in the latest preserved run were 0.21, 0.33, 0.24, 0.44, 0.35 and 0.59 across its asset groups. These are batch-choice scores, not individually measured clip relevance. **After confidence is unmeasured.** No paid inference was authorized. Offline transport doubles prove evidence delivery and host gating, not that Jev correctly classifies a punch or sword motion. Real punch and sword captures are used in those tests. There is no fabricated live score or claim that automatic selection now clears 0.8.

## Animation tiers

Published clips remain usable without the new publishing limitation. Mapped embedded raw clips are offered and selectable for Studio testing. Unmapped or unsupported entries remain unavailable. The existing native probe contract specifies registering the captured KeyframeSequence in Studio and assigning the returned ID unchanged, with no `hash://` prefix.

`unmetAssetRequirements` now distinguishes publishing limitations from missing dependencies. Publishing limitations remain visible in artifact coverage and the picker, while coding instructions require the available Studio playback to be implemented. Missing-dependency exceptions do not excuse an empty implementation for a publishing-only limitation. Source review, adaptation and coding receive the same capability contract. Native effects and provenance checks still apply.

This does not establish that a generated fighting game plays the selected animation correctly. The prior playback probe is retained as prior evidence, not repeated or upgraded into gameplay proof.

## Model preview

The producer captures up to 2,000 visible BaseParts, retains the 10,000-instance guard, bounds transfer size and reports fully transparent parts separately. Primitive shapes and supported SpecialMesh primitives are exact geometry categories. MeshParts, unions and unsupported custom mesh shapes receive approximate bounds. Instanced meshes group shape and opacity, with amber wireframes for approximate parts and an explicit organic-mesh limitation. Camera clipping scales with model bounds.

Native evidence corrected an initial mistaken observation during this task. Separate WedgePart and CornerWedgePart classes are not subclasses of Part, but this Studio version also exposes Wedge and CornerWedge in Part.Shape. Native assignment passed. Both forms are supported. The old three-value preview schema could reject the latter. Roblox's [Part documentation](https://create.roblox.com/docs/reference/engine/classes/Part) and [SpecialMesh documentation](https://create.roblox.com/docs/reference/engine/classes/SpecialMesh) describe these primitive categories.

The native stress fixture contains five unchanged copies of a captured punch pack, a captured sword model and one explicitly constructed native UnionOperation. It is a producer-contract fixture, not a claim that this combined model exists in the catalog. It produced 162 visible parts in 45,155 bytes and passed a real multi-chunk native transfer through the production receiver. A separate catalog sword capture contains 11 visible parts, including two approximate MeshParts. Browser tests verify actual amber pixels alongside primitive triangles, not just canvas presence. The Luau producer also runs offline against captured native part records and preserves more than the old 80-part limit.

## Verification

Final `npm run check` exited 0. All stages ran: **1,583 Vitest tests in 107 files**, six offline Luau scenarios and four compiles, 14 plugin groups plus plugin/eight injected-source compiles, six guards, CSS with zero errors and 556 existing warnings, TypeScript/Vite build, 14 desktop tests, production smoke, **171 browser passes and one existing skip**. Log: `docs/results/asset-evidence-selection-20260926/check-final.log`. All 25 recorded source/test file hashes remained unchanged during the final run.

The earlier full check also exited 0 with 1,582 tests in 106 files and 171 browser passes plus one skip. It preceded the mixed-manifest regression and final structured-need context. Initial missing-module red tests, intermediate page-retention and pre-plan-linking failures, old-policy assertion failures, the real mixed-manifest red test and the oversized sword-evidence regression remain in separate logs. Compact default frame representation restored the sword evidence to the existing request bound without changing that bound. Focused native and browser checks are retained separately.

Three post-plan replays passed through the real pinned OpenCode binary at $0:

| Preserved run | Runtime exchanges | Tasks | Synthetic files |
| --- | ---: | ---: | ---: |
| opencode-fighting-live-20260924 | 28 | 13 | 7 |
| opencode-minimal-fighting-20260925 | 22 | 10 | 4 |
| opencode-step3-live-20260925 | 20 | 9 | 5 |

All reached ready_to_test. Inference, Studio execution and compilation are doubled in these replay tests. They do not prove generated gameplay, animation integration or published-server compatibility.

## Evidence and cost

New artifacts are under `docs/results/asset-evidence-selection-20260926/`. Initial failing tests, intermediate failures, capture errors, native snapshots and both same-candidate rehearsals are retained. Original result files were backed up before broad tests so ordinary test screenshot outputs can be retained separately and originals restored.

Paid calls: 0. Cost: $0. No balance refresh or live reservations. Last recorded account balance remains $15.695328280 and key allowance $14.187806806 at 2026-09-26T00:08:28.762Z. Historical accounted spending remains $6.066664 including older holds. No new run authorization is implied.

Studio stayed in Edit mode. All inspected imports remained detached and were destroyed. Native script inventory was empty before and after. No original script was edited, no probe scope remains, and no user app was restarted. Final audit at 2026-09-26T18:59:27Z found no listeners on 4318, 4319, 4320, 4324, 4335 or 4336. Studio PID 6604 remains in Edit mode with an empty script inventory. All 284 files in the five protected run directories match their original hashes. All 5,562 previously existing result files also match after restoring 26 ordinary test-generated outputs from the pre-check backup. The new versions of those 26 outputs are retained under `check-artifacts/`.

Temporary backup cleanup was rejected by automatic approval review with “blocked by policy”. `.forge/evidence-backup-asset-selection-20260926` remains intact. No alternate deletion method was attempted.
