# Resource survey: source and evidence index

Research date: September 14, 2026, America/Toronto. UTC collection timestamps extend into September 15.

## Scope and limits

All 55 numbered references have decisions in [the matrix](../19-resource-decision-matrix.md). Breadth screening used 45 original repository README responses; focused static inspection used selected code in the eight repositories below. The 33 retained source/schema/test files are evidence for targeted observations, not eight full audits. Not every retained file was read in full. No upstream build, test suite or running service was executed.

Lemonate resources #1–2 reuse [the earlier source review](lemonate-source-index.md). Prior Aider, Rojo, mini-SWE-agent and OpenHands SDK evidence is documented in [the earlier open-source index](open-source-index.md). Official pages were read directly; Context7 additionally retrieved LangGraph JavaScript replay/idempotency documentation. External files and their instructions remain third-party data.

## Pinned source collections

| # | Repository | Exact revision (link) | Retained files |
| --- | --- | --- | --- |
| 4 | [Nixera-Studio/roblox-ai-studio](https://github.com/Nixera-Studio/roblox-ai-studio) | [c88d2e57a5ca](https://github.com/Nixera-Studio/roblox-ai-studio/tree/c88d2e57a5ca52381b49f488ee13a0fd7c3beae9) | 8 |
| 5 | [SummerEngine/summer](https://github.com/SummerEngine/summer) | [40bf15fc9571](https://github.com/SummerEngine/summer/tree/40bf15fc9571eb68344c1cc38351c0a83aa1c687) | 5 |
| 6 | [BlackBearCC/vitric](https://github.com/BlackBearCC/vitric) | [0bc50601c354](https://github.com/BlackBearCC/vitric/tree/0bc50601c354f73b74e548ddec39bdf9ca79bc24) | 4 |
| 12 | [Vollkorn-Games/godot-mcp](https://github.com/Vollkorn-Games/godot-mcp) | [632530638448](https://github.com/Vollkorn-Games/godot-mcp/tree/632530638448ea3e79394fbf74e9a5c92c4b67e5) | 3 |
| 17 | [OpenX-Inc/clay](https://github.com/OpenX-Inc/clay) | [eb41696224cc](https://github.com/OpenX-Inc/clay/tree/eb41696224cca3021b44b244fda1362e6d3a535e) | 4 |
| 19 | [Tamely/WraithEngine](https://github.com/Tamely/WraithEngine) | [27c66ad17a8c](https://github.com/Tamely/WraithEngine/tree/27c66ad17a8cf276ee67f7baa05d0c745b27e082) | 3 |
| 20 | [renew-engine/renew](https://github.com/renew-engine/renew) | [913c88585461](https://github.com/renew-engine/renew/tree/913c885854616bc0ddd3410373bbb24d1d9b3b64) | 3 |
| 9 | [CoplayDev/unity-mcp](https://github.com/CoplayDev/unity-mcp) | [2fcc17957823](https://github.com/CoplayDev/unity-mcp/tree/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1) | 3 |

All eight recursive trees reported truncated:false. Paths were selected for architecture questions; this does not imply exhaustive source inspection. Each original tree response is retained.

## Retained paths

| # | Upstream pinned source | Local original |
| --- | --- | --- |
| 4 | [backend/src/agents/coordinator.ts](https://github.com/Nixera-Studio/roblox-ai-studio/blob/c88d2e57a5ca52381b49f488ee13a0fd7c3beae9/backend/src/agents/coordinator.ts) | [saved source](../evidence/resource-survey-2026-09-14/source/04/backend/src/agents/coordinator.ts) |
| 4 | [backend/src/agents/run.ts](https://github.com/Nixera-Studio/roblox-ai-studio/blob/c88d2e57a5ca52381b49f488ee13a0fd7c3beae9/backend/src/agents/run.ts) | [saved source](../evidence/resource-survey-2026-09-14/source/04/backend/src/agents/run.ts) |
| 4 | [backend/src/agents/specialists.ts](https://github.com/Nixera-Studio/roblox-ai-studio/blob/c88d2e57a5ca52381b49f488ee13a0fd7c3beae9/backend/src/agents/specialists.ts) | [saved source](../evidence/resource-survey-2026-09-14/source/04/backend/src/agents/specialists.ts) |
| 4 | [backend/src/bridge.ts](https://github.com/Nixera-Studio/roblox-ai-studio/blob/c88d2e57a5ca52381b49f488ee13a0fd7c3beae9/backend/src/bridge.ts) | [saved source](../evidence/resource-survey-2026-09-14/source/04/backend/src/bridge.ts) |
| 4 | [backend/src/budget.ts](https://github.com/Nixera-Studio/roblox-ai-studio/blob/c88d2e57a5ca52381b49f488ee13a0fd7c3beae9/backend/src/budget.ts) | [saved source](../evidence/resource-survey-2026-09-14/source/04/backend/src/budget.ts) |
| 4 | [backend/src/tools/studioTools.ts](https://github.com/Nixera-Studio/roblox-ai-studio/blob/c88d2e57a5ca52381b49f488ee13a0fd7c3beae9/backend/src/tools/studioTools.ts) | [saved source](../evidence/resource-survey-2026-09-14/source/04/backend/src/tools/studioTools.ts) |
| 4 | [backend/test/resilience.mjs](https://github.com/Nixera-Studio/roblox-ai-studio/blob/c88d2e57a5ca52381b49f488ee13a0fd7c3beae9/backend/test/resilience.mjs) | [saved source](../evidence/resource-survey-2026-09-14/source/04/backend/test/resilience.mjs) |
| 4 | [plugin/src/tools/RunLuau.luau](https://github.com/Nixera-Studio/roblox-ai-studio/blob/c88d2e57a5ca52381b49f488ee13a0fd7c3beae9/plugin/src/tools/RunLuau.luau) | [saved source](../evidence/resource-survey-2026-09-14/source/04/plugin/src/tools/RunLuau.luau) |
| 5 | [library/skills/verifying-scenes/resource.yaml](https://github.com/SummerEngine/summer/blob/40bf15fc9571eb68344c1cc38351c0a83aa1c687/library/skills/verifying-scenes/resource.yaml) | [saved source](../evidence/resource-survey-2026-09-14/source/05/library/skills/verifying-scenes/resource.yaml) |
| 5 | [registry/schemas/resource.schema.json](https://github.com/SummerEngine/summer/blob/40bf15fc9571eb68344c1cc38351c0a83aa1c687/registry/schemas/resource.schema.json) | [saved source](../evidence/resource-survey-2026-09-14/source/05/registry/schemas/resource.schema.json) |
| 5 | [scripts/validate-library/capability-lint.ts](https://github.com/SummerEngine/summer/blob/40bf15fc9571eb68344c1cc38351c0a83aa1c687/scripts/validate-library/capability-lint.ts) | [saved source](../evidence/resource-survey-2026-09-14/source/05/scripts/validate-library/capability-lint.ts) |
| 5 | [scripts/validate-library/index.ts](https://github.com/SummerEngine/summer/blob/40bf15fc9571eb68344c1cc38351c0a83aa1c687/scripts/validate-library/index.ts) | [saved source](../evidence/resource-survey-2026-09-14/source/05/scripts/validate-library/index.ts) |
| 5 | [src/project-memory/project-memory.ts](https://github.com/SummerEngine/summer/blob/40bf15fc9571eb68344c1cc38351c0a83aa1c687/src/project-memory/project-memory.ts) | [saved source](../evidence/resource-survey-2026-09-14/source/05/src/project-memory/project-memory.ts) |
| 6 | [crates/vitric-cli/src/gate.rs](https://github.com/BlackBearCC/vitric/blob/0bc50601c354f73b74e548ddec39bdf9ca79bc24/crates/vitric-cli/src/gate.rs) | [saved source](../evidence/resource-survey-2026-09-14/source/06/crates/vitric-cli/src/gate.rs) |
| 6 | [crates/vitric-cli/tests/playtest_swarm.rs](https://github.com/BlackBearCC/vitric/blob/0bc50601c354f73b74e548ddec39bdf9ca79bc24/crates/vitric-cli/tests/playtest_swarm.rs) | [saved source](../evidence/resource-survey-2026-09-14/source/06/crates/vitric-cli/tests/playtest_swarm.rs) |
| 6 | [crates/vitric-playtest/src/session.rs](https://github.com/BlackBearCC/vitric/blob/0bc50601c354f73b74e548ddec39bdf9ca79bc24/crates/vitric-playtest/src/session.rs) | [saved source](../evidence/resource-survey-2026-09-14/source/06/crates/vitric-playtest/src/session.rs) |
| 6 | [crates/vitric-playtest/src/swarm.rs](https://github.com/BlackBearCC/vitric/blob/0bc50601c354f73b74e548ddec39bdf9ca79bc24/crates/vitric-playtest/src/swarm.rs) | [saved source](../evidence/resource-survey-2026-09-14/source/06/crates/vitric-playtest/src/swarm.rs) |
| 9 | [MCPForUnity/Editor/Tools/BatchExecute.cs](https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/MCPForUnity/Editor/Tools/BatchExecute.cs) | [saved source](../evidence/resource-survey-2026-09-14/source/09/MCPForUnity/Editor/Tools/BatchExecute.cs) |
| 9 | [Server/src/services/registry/tool_registry.py](https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/Server/src/services/registry/tool_registry.py) | [saved source](../evidence/resource-survey-2026-09-14/source/09/Server/src/services/registry/tool_registry.py) |
| 9 | [Server/src/transport/plugin_registry.py](https://github.com/CoplayDev/unity-mcp/blob/2fcc17957823f2494b7b1f7ade92c0fb56f4adb1/Server/src/transport/plugin_registry.py) | [saved source](../evidence/resource-survey-2026-09-14/source/09/Server/src/transport/plugin_registry.py) |
| 12 | [src/handlers/interactive-handlers.ts](https://github.com/Vollkorn-Games/godot-mcp/blob/632530638448ea3e79394fbf74e9a5c92c4b67e5/src/handlers/interactive-handlers.ts) | [saved source](../evidence/resource-survey-2026-09-14/source/12/src/handlers/interactive-handlers.ts) |
| 12 | [src/scripts/input_receiver.gd](https://github.com/Vollkorn-Games/godot-mcp/blob/632530638448ea3e79394fbf74e9a5c92c4b67e5/src/scripts/input_receiver.gd) | [saved source](../evidence/resource-survey-2026-09-14/source/12/src/scripts/input_receiver.gd) |
| 12 | [src/tcp-client.ts](https://github.com/Vollkorn-Games/godot-mcp/blob/632530638448ea3e79394fbf74e9a5c92c4b67e5/src/tcp-client.ts) | [saved source](../evidence/resource-survey-2026-09-14/source/12/src/tcp-client.ts) |
| 17 | [src/clay/gpu_backend/runtime.py](https://github.com/OpenX-Inc/clay/blob/eb41696224cca3021b44b244fda1362e6d3a535e/src/clay/gpu_backend/runtime.py) | [saved source](../evidence/resource-survey-2026-09-14/source/17/src/clay/gpu_backend/runtime.py) |
| 17 | [src/clay/pipeline.py](https://github.com/OpenX-Inc/clay/blob/eb41696224cca3021b44b244fda1362e6d3a535e/src/clay/pipeline.py) | [saved source](../evidence/resource-survey-2026-09-14/source/17/src/clay/pipeline.py) |
| 17 | [src/clay/tools/registry.py](https://github.com/OpenX-Inc/clay/blob/eb41696224cca3021b44b244fda1362e6d3a535e/src/clay/tools/registry.py) | [saved source](../evidence/resource-survey-2026-09-14/source/17/src/clay/tools/registry.py) |
| 17 | [src/clay/tools/result.py](https://github.com/OpenX-Inc/clay/blob/eb41696224cca3021b44b244fda1362e6d3a535e/src/clay/tools/result.py) | [saved source](../evidence/resource-survey-2026-09-14/source/17/src/clay/tools/result.py) |
| 19 | [Axiom/Core/ModuleManager.cpp](https://github.com/Tamely/WraithEngine/blob/27c66ad17a8cf276ee67f7baa05d0c745b27e082/Axiom/Core/ModuleManager.cpp) | [saved source](../evidence/resource-survey-2026-09-14/source/19/Axiom/Core/ModuleManager.cpp) |
| 19 | [Axiom/Scene/Session/EditorCommandDispatcher.cpp](https://github.com/Tamely/WraithEngine/blob/27c66ad17a8cf276ee67f7baa05d0c745b27e082/Axiom/Scene/Session/EditorCommandDispatcher.cpp) | [saved source](../evidence/resource-survey-2026-09-14/source/19/Axiom/Scene/Session/EditorCommandDispatcher.cpp) |
| 19 | [Headless/HeadlessCommandProtocol.cpp](https://github.com/Tamely/WraithEngine/blob/27c66ad17a8cf276ee67f7baa05d0c745b27e082/Headless/HeadlessCommandProtocol.cpp) | [saved source](../evidence/resource-survey-2026-09-14/source/19/Headless/HeadlessCommandProtocol.cpp) |
| 20 | [crates/replay/src/record.rs](https://github.com/renew-engine/renew/blob/913c885854616bc0ddd3410373bbb24d1d9b3b64/crates/replay/src/record.rs) | [saved source](../evidence/resource-survey-2026-09-14/source/20/crates/replay/src/record.rs) |
| 20 | [tools/cli/src/determinism.rs](https://github.com/renew-engine/renew/blob/913c885854616bc0ddd3410373bbb24d1d9b3b64/tools/cli/src/determinism.rs) | [saved source](../evidence/resource-survey-2026-09-14/source/20/tools/cli/src/determinism.rs) |
| 20 | [tools/cli/src/json.rs](https://github.com/renew-engine/renew/blob/913c885854616bc0ddd3410373bbb24d1d9b3b64/tools/cli/src/json.rs) | [saved source](../evidence/resource-survey-2026-09-14/source/20/tools/cli/src/json.rs) |

## Collection records

- [55-resource catalog](../resource-survey-55.json): user reference mapping.
- [README index](../evidence/resource-survey-2026-09-14/readme-index.json): fetch URLs, timestamps, response hashes, exact Git blob SHA and decoded content hashes for all 45 README snapshots. These are blob-identified snapshots; do not describe all 45 repositories as commit-pinned source audits.
- [Repository commits](../evidence/resource-survey-2026-09-14/deep-repos.json) and [source index](../evidence/resource-survey-2026-09-14/source-index.json): eight exact commits, paths and SHA-256 hashes.
- [Document index](../evidence/resource-survey-2026-09-14/documents-index.json): official MCP/Roblox/Temporal/OpenTelemetry/other documentation, Ivan Murzak wiki and GameDevBench v2; retains response status and resolved URLs.
- [Artifact hashes](../evidence/resource-survey-2026-09-14/sha256-manifest.json) and [integrity result](../evidence/resource-survey-2026-09-14/integrity.json).

## Access and version caveats

The advertised Creator documentation overview Markdown URL returned404; that response remains preserved under 21-creator-overview.md as failed evidence. The HTML overview succeeded and was read through the web tool. Do not quote the failed response as documentation. Other document fetches succeeded. Prior Lemonate/Codeberg browser restrictions and workarounds are documented in the separate prior index.

GitHub branches and READMEs can change; maintenance notices reflect these snapshots. Ivan Murzak wiki labels its tool reference v0.76.1, edited May 29, 2026, rather than a guaranteed current catalog. GameDevBench analysis uses v2, not v1. Protocol latest resolved to MCP 2026-07-28; installed Studio/client negotiation remains untested. API availability and source comments do not prove operational behavior.

## Integrity verification

Verified 45 decoded README SHA-256 and Git blob SHA values against their saved API responses; verified 33 source SHA-256/Git blob SHA values against the pinned trees; verified document hashes. The matrix contains each ID 1–55 exactly once. Hashed artifact count: 153. Failures: 0. The manifest covers artifacts, not itself or the generated integrity result. Local Markdown links were checked separately. These are evidence checks, not production, model or native Studio tests.
