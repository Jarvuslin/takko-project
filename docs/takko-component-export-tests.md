# Preserving native Marketplace components in place exports

2026-09-16. `exportBundle` now has an explicit host-only input for native component XML. It retains the component's serialized properties, hierarchy, source text and internal references inside a generated place. A real Studio comparison found no observable differences for the recorded combat, bubble-wrap and checkpoint derivatives after conversion and merging. Production asset acceptance/delivery is not yet connected to this new export input.

## Implementation

`component-xml-conversion.ts` reads a content-addressed native archive and manifest, requires successful native restoration, and runs the pinned Rojo 7.7.0 executable only after checking its SHA-256. It copies the verified archive bytes into an owned temporary directory, converts to XML with the original root name, and persists content-addressed XML plus a conversion record. Subsequent loads recheck the record, archive, manifest and XML. Conversion is not source approval or runtime verification. Temporary cleanup verifies its resolved ownership boundary.

`component-xml.ts` combines XML structurally with ordered parsing. Every component receives new instance referents, and only actual Ref properties are rewritten; reference-looking text inside scripts stays unchanged. Shared-string pools are combined with conflict and missing-payload checks. Duplicate IDs, outside references, multiple component roots, service roots, invalid XML, unsupported declarations, destination overlap, collisions with generated content and paths outside the project namespace are rejected. Input, instance, depth and output bounds apply.

The original component root name and descendants survive under a separate destination folder, such as `Workspace/Forge_ComponentExport/Assets/bubble-wrap/Imported`. Destination folders do not rename internal models used by worker code. Native XML is not added to the model-authored Bundle schema. Ordinary exports without supplied components remain byte-identical.

## Tests and native evidence

Twenty-five new tests cover exact source text, typed numeric/security values beyond JavaScript integer precision, run-context/disabled settings, internal references, ID collisions across components, shared-string merging, malformed inputs, namespace boundaries and content-addressed record/archive/XML tampering. These are offline tests. Real Rojo conversion and real Studio deserialization were tested separately.

Full `npm run check` passed **888 unit/API +10 desktop +36 browser tests**, plus Luau, plugin, guards, build and production smoke (exit0). [Full log](../research/results/component-export-v1/check.log). No application code changed after the check.

The diagnostic `scripts/verify-component-export.ts` used the three unchanged recorded worker derivatives from the preceding native adapter replay. It converted them through the new production utility, exported a combined 816,148-byte place, extracted each actual exported component subtree with the combined shared-string pool, and compared it against its retained native archive in Studio. Both copies remained unparented and were destroyed afterward.

| Component | Serialized properties checked | Source bindings checked | Instance references checked | Security checks | Result |
|---|---:|---:|---:|---:|---|
| Combat training dummy | 435 | 0 | 13 | 34 | No observed differences |
| Bubble wrap | 5,911 | 74 | 0 | 734 | No observed differences |
| Parkour checkpoint | 70 | 1 | 0 | 8 | No observed differences |
| Total | **6,416** | **75** | **13** | **776** | All comparisons passed |

The comparator also checked hierarchy, names, classes, attributes and tags. It preserves a list of unreadable properties rather than claiming to have compared them. Engine version 0.739.0.7390687. Sources, execution settings and readable Sandboxed/Capabilities values matched. This comparison deliberately excludes generated identity properties UniqueId/HistoryId.

Evidence: `docs/results/takko-component-export/native-v1/result.json`; combined artifact: `docs/results/takko-component-export/native-v1/combined.rbxlx`. The file is a serialization fixture containing three components at their original locations, **not a designed or playable combined game**. The native comparison covered exported subtrees, not opening/playing the entire DataModel. No imported code ran, no new model response was generated and no paid call occurred. Studio remained in Edit.

## Remaining work

The HTTP export endpoint still calls `exportBundle` without components. Asset pipeline entries do not yet carry approved component export identities to that endpoint or to Studio delivery. The existing pipeline still stops after adaptation/re-review. Next: bind host-controlled component references to the accepted asset need, preserve them through surrounding-code generation and export/delivery, apply the requested placement without breaking the retained hierarchy, and run fresh varied end-to-end gameplay trials. Do not count this serialization pass as better Marketplace selection, new game understanding, source approval or gameplay success.

The live app remains the previous version and was not restarted. Saved test credentials are unchanged; no provider usage was incurred this turn.
