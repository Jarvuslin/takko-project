# Durable component inventory and runtime touch markers

2026-09-16. The native dummy import that stopped the raw v3 combat trial now passes preparation and XML comparison. It retains143durable instances and all9script sources; the separately recorded TouchInterest marker accounts for the original144thinstance. This is an importer fix, not a game-quality or physical-touch pass.

## Change

`component-archive.ts` recognizes only a standard engine TouchTransmitter: named TouchInterest, directly under a BasePart, Archivable, no children/attributes/tags, Sandboxed false and empty explicit capabilities. It does not delete the object. Capture inventories durable nodes separately and records `runtimeOnlyInstances` with its durable parent and an unverified touch-listener reconstruction requirement. Custom variants remain unsupported. Combined raw/durable bounds remain enforced.

Native comparison still checks all durable properties, sources, hierarchy, security, attributes, tags and internal references. References to omitted runtime objects fail explicitly, including when the restored reference becomes nil. Final post-serialization checks retain original identity and state checks for both durable objects and observed runtime markers. Arbitrary instance loss still fails with class/count diagnostics.

Restriction uses the same durable traversal. Archive loading and derivative validation preserve the exact observed marker inventory. Adaptation operates on an unparented deserialization where markers are absent: it cannot claim newly observed markers, and keeps original observations separately as `runtimeOnlyHistory`, with original archive identity and remapped surviving parents. Review and builder context explain that the original sources must reconnect required touch listeners and must not depend on preexisting marker instances. Runtime functionality remains unverified.

This policy follows native observations and Roblox's [official TouchTransmitter documentation](https://raw.githubusercontent.com/Roblox/creator-docs/main/content/en-us/reference/engine/classes/TouchTransmitter.yaml), which identifies it as an engine object created by touch-listener connections. The documentation also warns that deleting a marker can break touches; this implementation does not delete it.

## Evidence

Nineteen new offline tests cover standard omission and durable source/reference indices, all supported custom-state rejection cases, persistent references to an omitted marker, unrelated durable loss, mutation/identity checks, archive/review/builder reload, and adaptation history remapping with both retained and removed parents. The emitted-Luau fixtures are simulated services and do not establish native physics behavior. An independent reviewer found no blocking defect for fresh inert generation.

Final **npm run check passed938unit/API tests,10desktop tests and36browser tests**, plus Luau, plugin, guards, build and production checks, exit0. Log: `research/results/runtime-touch-v1/check.log`. All application changes preceded this pass.

The actual previous worker-selected dummy was reimported through `StudioAssetAdapter` without choosing a replacement or editing its sources. Preparation passed, including native archive comparison, and cleanup completed (`docs/results/takko-runtime-touch/native-preparation`). No paid model call or imported execution occurred in this replay.

`scripts/verify-runtime-touch.ts` exercises native serialization on an owned unparented fixture. The engine omits TouchInterest, reconnecting Touched recreates it, source/index preservation passes, and custom attributes plus persistent marker references reject. The test then compares the actual restricted dummy archive against pinned-Rojo XML:143durable instances,9sources,1,319readable serialized properties and15internal references passed. Unreadable property limits remain recorded. The fixture checks marker reconstruction in Edit; it does not fire physical touch events or prove gameplay.

The first verification harness invocation passed its fixture but used the converter's metadata return as though it contained XML; it failed before the dummy comparison. The harness was corrected to use `loadComponentXml` and rerun successfully. Both artifacts are preserved under `docs/results/takko-runtime-touch/verification-harness-failure` and `verification`. This was a harness error, not a failed native game.

Fresh raw v4 trials use unchanged frozen briefs and model routing, a separate source-version service, the saved encrypted credential and unchanged spending limits. See `benchmarks/runs/marketplace-diversity-v4-20260916/PROTOCOL.md` and its results. V3 remains failed; no raw plan, selected candidate or generated code is manually repaired. Full-game integration, physical interaction, media and presentation still require native acceptance.
