# Marketplace-first component discovery

User correction, September 15 local / September 16 UTC: prefer a complete reusable Marketplace asset, including its existing animation, sound and behavior, before authoring replacements. Marketplace first must affect the execution pipeline, not just prompt wording.

## What Place1 showed

Read-only inspection found `Workspace.Butter`: a MeshPart with an embedded Script and Camera. The script creates press/release sounds and squash/recovery tweens triggered by character contact. It does not implement the requested click/tap counter, so integration remains necessary; rebuilding its appearance and animation is not justified by that difference.

A native Creator Store search for `butter` returned relevant ASMR butter assets immediately. The v6 worker had instead searched `butter stick food prop yellow block` and `yellow butter stick food prop model`, rejected their unrelated results without inspection, then authored a replacement. This was an inadequate search, not evidence that the desired asset did not exist.

The bounded native diagnostic imported the result by the author named in the user's object into an owned ServerStorage quarantine. Its embedded script SHA-256 exactly matches the user's object: `66b10d277bc21b0c7f8851725fe7bafcd18de29e61a100e6f71a4c7f008ee073`. [Final-source diagnostic receipts and code hashes](results/takko-marketplace-complete-assets/native-final/result.json), [earlier receipts](results/takko-marketplace-complete-assets/native/result.json) and [source comparison](results/takko-marketplace-complete-assets/native/source-comparison.json) are product evidence, not a new autonomous worker benchmark. No paid calls, Play session or original-object edit occurred. Cleanup removed the entire diagnostic scope; Studio remained in Edit.

## Implemented policy and enforcement

- Planner, builder, reviewer and repair contexts prioritize complete reusable components and missing integration. Initial Model discovery queries are limited to four terms; detailed descriptions stay in constraints. The same planner chooses a corrected query after validation failure.
- Mesh sourcing plans require a Model discovery need for the same requirement first; an unrelated component does not qualify. Newly discovered mesh needs also search Models, which can contain meshes and useful behavior. Stable execution order places Model needs before separate media without rewriting the frozen plan or its hash.
- Searches return up to20 candidates and their bounded descriptions, independently of the three-import inspection budget. Descriptions remain untrusted hints, including claims of safety.
- Optional visual fallback requires two distinct executed queries and at least one completed, receipted inspection if candidates were offered. Zero-inspection rejection, duplicate searches, exhausted budgets and pre-inspection failures do not authorize replacement.
- Scripted and unsupported assets produce a structured capability block. The pipeline cleans its owned import and halts even when the asset need is optional. This is distinct from finding an unsuitable asset, and is never a procedural-fallback permission.
- The same applies to unsupported preservation properties and embedded sounds in visual models. Loading an included Sound is not playback/listening verification; those models stop pending per-dependency audition.
- Inert inspection preserves existing hierarchy and source instead of renaming, stripping or executing code. It records up to300 nodes, eight source containers and64KiB of source with explicit omissions/read failures. Original source hashes and bounded literal dependency observations are retained in an audit sidecar. Literal matching is not a safety or runtime analysis.

The planner still has to identify applicable main objects correctly. A specification containing no asset needs is not proof that it contains no reusable assets; semantic compliance with the discovery policy still depends on planner/reviewer judgment. The structural gates above do not establish universal Marketplace coverage.

## Remaining capability

**Automatic reuse and runtime testing of embedded behavior are not implemented by this change.** The current static-prop exporter renames/normalizes geometry and cannot faithfully round-trip arbitrary script parentage, attributes, joints or rigs. Merely allowing scripts would corrupt working assemblies or misstate verification.

A complete-asset path must preserve names/hierarchy and script bytes, review sources and all dependencies, verify the exact audited assembly in an owned runtime, protect imported script paths from builder replacement, and re-audit explicit worker adaptations. The existing audio-only runtime guard remains unchanged. Until that path exists, a promising scripted component is an explicit product capability blocker rather than an excuse to build a homemade prop.

The historical v1–v6 benchmark outputs and failures remain unchanged. No discovered ID or source was injected into a benchmark worker. This correction does not turn v6 into an autonomous reuse success.

## Validation and activation

Final `npm run check` passed: **657 unit/API tests, 10 desktop tests, 36 browser tests**, plus Luau/plugin/guards/build/production stages. Independent review found no remaining blockers for this bounded discovery/inspection/stop change. Native scripted-asset inspection and cleanup passed separately on final source; unsupported-property and embedded-media cases have offline Luau regressions.

Loaded into the idle app on port4324 at2026-09-16T03:57:01.242Z without restarting PID22236. All four keys remained in memory; the temporary local inspector closed. No new paid calls: cumulative benchmark cost/reservations remain $0.510904/$4.515084. [Verification and activation record](results/takko-marketplace-complete-assets/verification.json).
