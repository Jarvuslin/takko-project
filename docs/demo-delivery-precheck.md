# Demo delivery precheck stopped before paid generation

2026-09-27 UTC. **The primitive/script bridge round trip passed, but the native-component delivery path is explicitly unsupported. No paid run was dispatched and no game was built.** Work is paused under section 4 of the user's request: “If the demo path cannot work, stop and report before spending anything.”

The three requested inspection and discovery fixes remain unimplemented. This precheck ran first so their completion would not be followed by purchasing a build the current bridge cannot deliver. No product source was changed. Native-component delivery is outside the three named fixes, and the existing refusal was not bypassed.

Evidence: [precheck directory](results/demo-precheck-20260927/RESULTS.md), [successful native receipt](results/demo-precheck-20260927/native-roundtrip-success.json), [fresh-session rejection](results/demo-precheck-20260927/native-component-fresh-session.json).

## What passed

Exactly one Studio was connected, PID 6604, instance `ca13ff86-472b-4f75-82a8-b2300a2d1b76`, place `122588481889475`, in Edit mode.

The installed `%LOCALAPPDATA%/Roblox/Plugins/Forge.rbxmx` was 16,266 bytes and differed from current source. Its original and existing backup were preserved separately. The installed file was replaced with an XML wrapper of current `plugin/Forge.plugin.luau`. Decoding that installed file with whitespace preservation produces the exact source SHA256 `2ac6bedc6f848e6efa42715496a43d637e9208dcd96971f689732f240f77e60d`. The initial audit accidentally trimmed XML text whitespace and reported a mismatch. That audit and the corrected verification are both retained. No existing backup was overwritten.

The Forge source contains no embedded semantic version. The historical 2.2.4 cached-plugin manifest is not evidence of this file's source. No matching `68657693815716` directory was returned under the inspected InstalledPlugins tree. No Studio restart was performed, and hot reload of the already-loaded old plugin is not claimed.

For the live check, the current source ran in a temporary native Plugin created through Studio MCP. Only the widget identifier differed to avoid colliding with the user's loaded widget. Its normal connect, poll, apply and receipt logic were exercised against an isolated production `createApp` service. No provider credentials were loaded into that service, and its dispatch policy denied inference.

One handwritten ModuleScript compiled with the real Luau compiler. The bridge then applied that ModuleScript plus an invisible Part within `Forge_924f2fd522cb`. Native readback confirmed both objects and the exact script source. The server acknowledged a successful apply receipt as operation `c7b30b3a-3200-4fa2-a020-e1aa5d407229`, state `done`, with the matching artifact hash. This proves primitive/script delivery in this probe. It is not generated-game evidence.

The first synchronous attempt returned a failed receipt because `TryBeginRecording` could not open an undo recording within the active MCP command. Running the identical receiver after that command returned succeeded. The original failure is preserved in `native-roundtrip-nested-recording-failure.json`. No product change was used to resolve the probe-context conflict.

## What blocked the demo

On a freshly connected native Studio session, the production apply endpoint returned HTTP 409:

> This Studio bridge does not yet deliver native components. Use the complete place export; component content must not be silently omitted.

`src/generation/bridge.ts:386` checks whether any asset-pipeline entry contains `component`. It throws at line 388 before build-readiness checks or queue dispatch. `currentProject` independently invalidates operations for component-bearing projects. This is an explicit missing delivery capability, outside a model correction callback. No model can self-correct it, and correction cost was $0.

The input was the unchanged preserved paid-run project from `opencode-step3-live-20260925`, containing one real native component. Its original stage remains `failed`. The component guard runs before the stage check, so this isolates that specific refusal without pretending the old project is a completed build.

The earlier offline ready-to-test replay contained **zero native components**, despite exercising other asset paths. Submitting it queued an operation, which was cancelled without dispatch. That observation is preserved in `native-component-precheck.json` and `unused-replay-operation-cancelled.json`. A subsequent attempt using the old session encountered session expiry. The final fresh native session reproduced the actual component refusal. None of these records was overwritten or presented as the successful native-component test.

A new game might happen to contain no accepted native components. That possibility is not a verified delivery path for the requested Marketplace-backed demo. The bridge cannot currently deliver a retained dummy or animation component. The complete-place export named in the error is a separate workflow, and this check did not substitute an unverified import path or discard components.

## Verification, cost and cleanup

- Real compiler: **1 handwritten fixture file passed**.
- Native apply: **1 failed nested-recording attempt, then 1 successful deferred apply and acknowledged receipt**.
- Native-component apply preflight: **HTTP 409 on a fresh Studio connection**.
- Paid inference, generated gameplay files, OpenCode sessions and coding exchanges: **0**. The 48-exchange and 900-second ceilings were not entered.
- `npm run check`: **not run**. All stages remain outstanding, as do the three required offline replays and regressions for the requested fixes. No full-suite result is claimed.

The read-only account refresh at **2026-09-27T04:38:12.619Z** reports funds **$15.663329032** and key allowance **$14.155807558**, unchanged. New cost and reservations are $0 in every phase. Historical accounted spending remains $6.098676, including prior holds. The conditional paid-run authorization was not consumed or dispatched.

Complete before/after instance inventories contain 3,500 entries each. The 23 recorded entries across Workspace, ReplicatedStorage, ReplicatedFirst, ServerStorage, ServerScriptService, StarterPlayer, StarterGui, Lighting, SoundService and Teams match on their recorded fields. This includes names, classes, BasePart size/CFrame/anchoring and source where applicable. It is not a hash of every possible Roblox property.

All temporary `Forge_924f2fd522cb` roots, the probe objects and temporary plugin widget were destroyed. Before and after inventories contain zero scripts and zero Forge scopes. Original Terrain, Baseplate, SpawnLocation, Camera and other content remain. Studio remains in Edit mode. There is no demo to remove or play. The current plugin file remains installed, and its original versions are preserved in the evidence directory.

Owned service PID 45848 on port 4335 exited. Final listeners on 4318, 4319, 4320, 4324, 4335 and 4336: none. No user app or Studio process was restarted or killed. All 5,484 files in the earlier preservation manifest remain hash-identical. The work used new output paths. Paused generation and business-demand work remain untouched.

The next scope decision is native-component delivery versus an explicitly verified export/import route. Inspection/discovery fixes and their full required validation still precede any paid generation. Place binding and the other deferred features were not implemented.
