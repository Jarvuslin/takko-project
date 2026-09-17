# Complete Marketplace capture — restoration still blocked

Follow-up: [restricted component restoration](takko-restricted-component-restoration.md) now passes native restoration for these three selections after reducing permissions without disabling sandboxing. The exact-original denial and all evidence below remain historical facts; production reuse and gameplay are still pending.

September 16, 2026. This is product importer work supporting the active raw Marketplace-diversity goal. It is not a new model benchmark, a passed security review, or a completed game.

The previous static importer rejected embedded scripts and retained only eight script sources. Complete component reuse needs the original hierarchy and behavior available for review. The adapter now captures a native Roblox RBXM plus a complete indexed hierarchy/source manifest before static normalization. Limits are explicit: 3,000 instances, 1,000 scripts, 512 KiB of source and 4 MiB of binary data. Exceeding a limit returns an unavailable capture; it does not become an asset rejection authorizing a procedural replacement.

The manifest binds exact source bytes to node indices and hashes. Native round-trip validation checks readable serialized properties, internal instance references, names, hierarchy, tags, attributes and scripts. Unreadable properties and ignored ephemeral identity properties are listed. A failed round trip remains a failed restoration, even when the original binary was successfully captured. In that case the source inventory is separate observed evidence; it is not proof that the engine can restore the binary or that every serialized property has been independently verified.

Large evidence travels in 32,768-character owned chunks, with length, SHA-256, canonical Base64 and UTF-8 validation after assembly. The Studio cache is part of the owned staging attempt and is removed with that attempt. Chunk reads are read-only and use one aggregate transfer receipt, preventing large imports from overflowing the pipeline's receipt limit or repeating binary payloads in model context. Corrupt or failed reads trigger owned cleanup; uncertain mutating operations still require reconciliation. Repeated inspection reasons are deduplicated without changing the gate.

Native serialization follows the [official SerializationService contract](https://create.roblox.com/docs/reference/engine/classes/SerializationService). No third-party RBXM parser is used. The official insertion tool changes the outer root name and applies its script sandbox/capabilities; this evidence starts at that imported hierarchy. It does not claim fidelity to an earlier, untouched publisher download. Sandbox/capability safeguards were not removed.

## Native results

Frozen selections from the original raw diversity runs were replayed as explicit importer regressions. The regression requires the same candidate to still be returned by the original query and never substitutes a root-selected alternative.

| Original worker case | Captured instances | Captured scripts | Exact source bytes | Restoration |
| --- | ---: | ---: | ---: | --- |
| Combat training dummy | 20 | 2 | 22,505 | Blocked by ScriptGlobals capability |
| Bubble-wrap ASMR | 375 | 76 | 33,947 | Blocked by ScriptGlobals capability |
| Checkpoint parkour | 4 | 1 | 885 | Blocked by ScriptGlobals capability |

All three native binary captures and full source inventories were saved and hash-verified, all owned staging imports were cleaned, and no imported script ran. The bubble-wrap case now preserves all 76 sources rather than an eight-source sample. No asset was accepted for game placement, and the execution/reuse gate remains intact.

A separate nine-instance unparented fixture passed restoration with two scripts, 138 readable properties, two attributes and three internal references checked. Nonarchivable content was rejected, and an external reference failed round-trip comparison. These are narrow native preservation tests, not gameplay or Marketplace script execution tests.

Earlier diagnostic failures remain failures: one exceeded the tool response size and another exceeded StringValue's 200,000-character limit. Both owned staging attempts were reconciled after terminal errors. Chunking fixes those transport constraints; the ScriptGlobals restoration denial remains unresolved. The final native scan found no ArchiveRegression scopes, Studio in Edit, and the user's original Butter script still enabled.

## Evidence and activation

- [Verification, exact source hashes and archive paths](results/takko-component-archive/verification.json).
- [Native Marketplace replay with transfer/import/cleanup receipts](results/takko-component-archive/native-marketplace/result.json).
- [Native synthetic fixture](results/takko-component-archive/native-fixture/result.json).
- [Earlier owned cleanup receipts](results/takko-component-archive/reconciliations.json) and [final native state](results/takko-component-archive/native-cleanup.json).
- [Full check log](results/takko-component-archive/check.log): 693 unit/API tests, 10 desktop tests, 36 browser tests and all other stages passed. The 76 targeted archive/adapter tests include large evidence, malformed transfers, interrupted reads and unchanged capability rejection.
- [Live activation](results/takko-component-archive/activation.json): idle app PID22236/port4324, four key objects preserved, local inspector closed.

Evidence was copied without rewriting immutable originals: absolute paths inside native receipts still point to the original `.forge` captures; the verification index lists the retained copies and verifies their hashes. No paid generation calls, model-route changes, budget increases or worker-game edits occurred.

## Remaining work toward the actual goal

Complete behavior reuse still needs a supported faithful restoration/integration path, full source/dependency review tied to the requested player experience, native isolated execution, and export persistence. Restoration permission failures must not be bypassed by removing sandboxes or silently replacing original code. The captured evidence can support review, but cannot authorize execution by itself.

The planner also still needs to defer replacement logic until inspection establishes what the asset already supplies. Combat coverage must include the requested animations, dummy, hit counter and sound; a relevant dummy selection alone does not fulfill that brief. Continue with fresh versioned raw trials across combat, ASMR and parkour after the importer and feedback path support them. Preserve every failed trial and use independent native acceptance without root-authored game rescue.
