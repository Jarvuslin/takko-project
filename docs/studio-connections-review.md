# Does Takko need Rojo connections?

Reviewed 2026-09-20. Recommendation: do not add a Rojo live-sync connection to normal Takko setup. Retain the existing Studio MCP and Takko plugin paths until a tested replacement covers their distinct responsibilities. Rojo becomes useful for a deliberate filesystem/Git workflow.

## Evidence read

Superbullet 0.3.99 preserved HTML (`research/evidence/superbullet-0.3.99/source/obfuscated-src/index.html`, lines 287–378) defines a collapsible connection section with Studio application/server, MCP and Rojo plugin/server indicators. The earlier [installed architecture study](../research/27-superbullet-installed-architecture.md) identified customized Rojo and a separate execution bridge. This describes the inspected release, not a live connection or independent reliability test.

Current Takko source read:

- `src/server/app.ts`: creates the custom Bridge and a separate StdioStudioClient for assets. `/api/status` reports plugin sessions, while `/api/asset-studios` discovers MCP studios.
- `src/generation/bridge.ts`: pairs plugin sessions and dispatches approved artifact apply/test operations. It checks protocol, capabilities, revision, artifact and unresolved operations. It explicitly blocks builds with native components and directs the user to complete place export.
- `src/generation/studio-mcp-client.ts`: resolves the installed StudioMCP executable, owns its stdio subprocess and handles discovery, timeouts and uncertain actions. No new third-party MCP service is required for this transport.
- `src/generation/studio-asset-adapter.ts`: requires explicit Studio identity and project scope, checks Edit state, calls asset search and Luau execution and serializes its operations.
- `src/marketplace/studio.ts`: Marketplace uses the same client implementation for its own Studio operations.
- `src/generation/component-xml-conversion.ts`: contains a hash-pinned Rojo 7.7.0 utility that executes `rojo build` to convert captured RBXM into RBXMX. This utility is not a Rojo server or live-sync connection. It was read, not executed in this review.

## Responsibilities

| Connection/tool | Role | Decision |
| --- | --- | --- |
| AI provider | Inference using configured model profiles | Keep separate from Studio setup |
| Studio MCP | Discover target Studio, inspect/search assets and perform supported Studio actions | Keep for current asset workflow |
| Takko Studio plugin | Controlled application of eligible generated artifacts and acceptance-test dispatch | Keep while its ownership/delivery guarantees have no replacement |
| Rojo server + Studio plugin | Synchronize a filesystem project into Studio | Optional future developer workflow |
| Rojo build utility | Offline format conversion/build | Internal tool, no connection UI |

Official [Roblox MCP documentation](https://create.roblox.com/docs/studio/mcp) describes script inspection/editing, data-model access, Luau execution, playtesting and explicit per-call Studio targeting. Tool availability in the user's installed version must still be discovered. Those capabilities do not establish that Takko already exposes all of them or that a raw MCP operation reproduces the custom bridge's ownership, approval and uncertain-outcome handling.

[Rojo sync documentation](https://rojo.space/docs/v7/sync-details/) describes filesystem-to-Roblox mapping and limitations for live synchronization, including binary content and some properties. Adding Rojo is not evidence that native-component delivery, arbitrary existing-game editing or runtime testing would work automatically. Superbullet ships a customized executable, so its demonstrations cannot be treated as guarantees about standard Rojo.

Roblox also documents built-in [Script Sync](https://create.roblox.com/docs/scripting/sync), with edits flowing between disk and Studio. Roblox recommends it for external script editing while retaining Studio for the rest of the project, and points to Rojo when the filesystem should define the broader project. For future script-only external editing, evaluate Script Sync before imposing a Rojo project structure.

## Interface implication

Use one entry point labeled **Roblox Studio**, opening a small connection panel. Present the selected place and capability status separately: asset access, apply build, and run tests. Keep MCP/plugin terminology, versions and local process details in an expandable diagnostic area. Do not show a single green Connected status when only asset access is available. Do not mark Rojo missing as a setup failure.

The current plugin session IDs and MCP Studio IDs are separate identities. A unified place selector would need a reliable identity mapping and validation, not matching display names. The current bridge metadata does not establish that mapping. Preserve explicit target selection for each action until it exists.

Priorities: make existing connection state understandable, handle native-component delivery deliberately, then consider an optional filesystem mode. Before introducing live sync, define which system owns each script/object so two writers do not overwrite each other's edits. Preserve unknown outcomes rather than automatically resending mutations. A migration to an MCP-only bridge is a separate project requiring equivalent guarantees and native verification.

## Verification and cost

Read-only source review and official documentation comparison. No authenticated Studio calls, application launch, installation, plugin changes, live synchronization, provider calls or paid inference. Cost $0. No implementation or new tests. All `npm run check` stages were skipped: vitest, test:luau, test:plugin, test:guards, build, test:desktop, test:production and test:e2e. No native behavior is verified by this review.

Port check at 2026-09-20 02:05:21 UTC found only static preview4342/PID28132 among4318/4319/4320/4324/4335/4336/4340/4341/4342. No server was started, stopped or restarted. Historical key balance $1.529256456 at2026-09-16T22:44:44Z was not refreshed. Generation remains paused. Existing artifacts and unrelated edits preserved, no commit/push.
