# Marketplace and chat attachments

Implemented 2026-09-16 on `codex/marketplace-asset-library`.

Open **Marketplace** in the sidebar or use the diamond button in chat. Select a connected Studio, search the free Creator Store, then drag a card into the game idea or follow-up composer. **Add** provides the same flow on touch screens. Roblox asset links can also be dropped into chat. Model, MeshPart, Audio and Image are supported; Animation search is not supported by this adapter.

First drops resolve the asset ID and current revision, inspect it, then attach only when static checks find no issues. Each attachment has a **Use for…** field so the planner and workers receive the exact ID and the user's intent, such as preserving existing animation and sound. This is a reference/context attachment, not an automatic import or a completed gameplay integration. Up to eight assets can be attached per project. The existing generation pipeline's review and execution gates remain applicable.

**Like** and **Save** are independent local preferences. Search results, inspection metadata, script/structure snapshots and preferences persist in `<project-data-directory>/asset-library/<assetId>.json` using atomic file replacement. Desktop uses its existing application data directory; browser development uses `FORGE_DATA_DIR` or `.forge/projects`. This cache is not an offline copy of the full model, meshes or media binaries.

## Inspection and reuse

Large inspection results use chunked, SHA-256-verified transfer to avoid Studio's response truncation. See [the animation-asset drop fix](marketplace-transfer-fix.md) for the reproduced failure, transfer bounds and native verification.

Model inspection requires Studio Edit mode. The official Studio MCP adapter loads detached objects, disables captured scripts, reads their source and structure, and destroys the temporary objects without parenting them into the game or executing their code. Metadata-only version checks can also run in verified Play mode. Media types receive metadata/type screening, not a download or playback test.

The cache identity includes the asset ID, Roblox asset version (updated timestamp fallback), scanner version and snapshot SHA-256. Repeat drops still check Roblox metadata, but skip native object loading and source capture when that identity matches. Changed assets or scanner versions invalidate the cached inspection; an unknown revision cannot authorize reuse. Simultaneous identical requests share one inspection. Revision changes during capture reject the result. Chat submission validates the stored snapshot and its static verdict again locally; this does not reload the Marketplace asset.

Static rules flag dynamic execution, numeric/unresolved module loads, source modification, suspicious network/asset loading, obfuscation and computed API access. Incomplete source coverage and linked packages require review. All module loading currently requires review, including legitimate local module systems: dependency resolution is intentionally not inferred from a regular expression. Review/blocked assets remain in the library with findings but cannot be attached. There is no bypass button in this slice.

These checks are conservative screening, not antivirus certification or proof of safety. A no-issues result does not prove harmless behavior, media permissions, gameplay quality, or future imported content. The generation context explicitly requires checking the actual imported version before execution. Full recursive dependency analysis and pinned offline binary import remain future work.

## Verification

Final `npm run check` passed all stages: **1,260 unit/API tests, 10 desktop tests and 42 desktop/mobile browser tests**, plus Luau/plugin/guard/build/production checks. The first full run caught an empty-group accessibility error, corrected with an explicit group role; one reload timeout passed the focused rerun and final full suite. [Full check output](results/marketplace-check.txt) and [native observations](results/marketplace-native.json) are retained separately.

Offline coverage includes reference parsing, suspicious scripts, incomplete inspection, restart persistence, version/scanner invalidation, coalesced requests, capture races, forged attachment references/verdicts, HTTP persistence and planner context. The actual capture Luau program also runs against isolated mock objects, verifying source-read failure handling, script disabling and cleanup without running imported source.

Desktop/mobile browser fixtures cover drag/Add, saved collections, cached repeat attachment, blocked drops, accessibility, follow-up usage changes, reload persistence and isolation between chats. Fixture responses are not native Studio evidence.

Native verification used the existing `test` Studio in Edit mode after the user stopped Play, and a separate app preview at `http://127.0.0.1:4336` with data in `.forge/marketplace-preview`:

- Real Creator Store `butter` search and Roblox thumbnails worked.
- **ASMR Butter**, asset `75968939114112`, version `23933264492503`, yielded **57 instances and one readable script**. Static checks returned `no_issues_found`.
- First Add attached the inspected asset. Removing it and physically dragging the card back into chat displayed **Attached using the cached inspection**.
- Like and Save persisted across a full preview-server restart. Reattachment after restart reused the same inspection.
- Game instance/script counts matched before and after inspection across Workspace, ReplicatedStorage, ServerScriptService, ServerStorage, StarterPlayer, StarterGui and StarterPack. No imported behavior was executed and no game was generated.

The running original app on port 4324 was not restarted; its in-memory provider keys and projects were preserved. The preview uses separate data and has no configured model routes. No paid model inference was performed.
