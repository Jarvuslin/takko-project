# Decisions for all 55 supplied resources

Date: September 14, 2026 (America/Toronto). Read with the [architecture report](18-resource-survey-and-architecture.md) and [evidence index](notes/resource-survey-source-index.md).

**Decision meanings:** Integrate = a candidate for implementation in the near-term architecture, still requiring tests; Adapt = borrow a pattern without importing the system; Evaluate = run a bounded comparison before selection; Defer = no current need. These are research recommendations, not records of completed integrations.

**Review depth:** S = selected pinned source inspection; D = upstream documentation/README screening; P = paper; Prior = earlier recorded review. D is not a source audit, dependency review, build verification or confirmation of every advertised feature. Where a row has multiple depths, the source index shows which paths were actually inspected.

## Engines and editor bridges

| # | Resource | Depth | Decision | Useful contribution and boundary |
| --- | --- | --- | --- | --- |
| 1 | [Lemonate desktop/subnodes/lifecycle](https://lemonate.io/blog/desktop-subnodes-lifecycle) | Prior | Adapt | Desktop/editor ideas; subnodes are scene descendants and lifecycle hooks are frame hooks. It does not describe a subprocess or agent supervisor. |
| 2 | [Luminocity source](https://codeberg.org/Luminocity) | Prior/S | Adapt | Project backend adapters, asset previews, state generations. Avoid broad filesystem IPC, weak sync conflict handling and copying its own Lua/3D runtime. Distinct from Lemonade.gg. |
| 3 | [Roblox Studio MCP](https://github.com/Roblox/creator-docs/blob/main/content/en-us/studio/mcp.md) | D | Integrate | Primary engine adapter: explicit Studio target, Edit/Client/Server contexts, scripts/assets/input/play/observation. Discover installed capabilities; do not recreate an archived bridge by default. |
| 4 | [Nixera Roblox AI Studio](https://github.com/Nixera-Studio/roblox-ai-studio) | S/D | Adapt | Fresh specialist contexts, model routing, blackboard and role-tagged events. Inspected design requests serial delegation, shares tools, and lacks durable command receipts/hard budget reservation. |
| 5 | [Summer](https://github.com/SummerEngine/summer) | S/D | Adapt | Versioned knowledge descriptors, routing conditions, project memory and evidence metadata. Open toolkit; desktop engine/runtime currently closed. Metadata/lint is not proof of game behavior. |
| 6 | [Vitric](https://github.com/BlackBearCC/vitric) | S/D | Adapt | Scenario/strategy/seed reports, independent simulation workers, replay assertions. Its engine controls determinism; Roblox does not inherit it. Empty gate configuration can return pass. |
| 7 | [GameDevBench](https://arxiv.org/abs/2602.11103) | P | Adapt | Use task-based evaluation and compare visual feedback. v2 has 333 Godot tasks; results are not Roblox success rates or proof of automatic token savings. |
| 8 | [MCP Game Deck](https://github.com/RamonBedin/mcp-game-deck) | D | Adapt | Tool organization, persistent plans/rules and specialist workflows. README's hundreds of tools and Claude Code integration are not a reason to expose the entire catalog or adopt its product stack. |
| 9 | [Coplay Unity MCP](https://github.com/CoplayDev/unity-mcp) | S/D | Adapt | Grouped tool discovery, explicit plugin sessions, bounded sequential batches and per-command outcomes. Batching does not imply rollback; Unity editor APIs do not transfer directly. |
| 10 | [Ivan Murzak Unity MCP](https://github.com/IvanMurzak/Unity-MCP) / [tool wiki](https://github.com/IvanMurzak/Unity-MCP/wiki/AI-Tools-Reference) | D | Adapt | Category-based scenes/assets/scripts/logs/screenshots/tests/profiling coverage. Wiki is a dated v0.76.1 snapshot; advertised breadth is not current Roblox API availability. |
| 11 | [Julian Kerignard MCP-Unity](https://github.com/JulianKerignard/MCP-Unity) | D | Adapt | External bridge/editor split, cache invalidation and optional tool groups. Add revision/epoch-aware freshness; do not copy TTL-only assumptions or query-string secret transport. |
| 12 | [Vollkorn Godot MCP](https://github.com/Vollkorn-Games/godot-mcp) | S/D | Adapt | Batch input, state checkpoints, signal collection and screenshots in one round trip. Bound sequence duration/output; implement Roblox equivalents through supported APIs. |
| 13 | [Beckett Godot MCP](https://github.com/beckettlab/beckett-godot-mcp) | D | Adapt | Tight editor observation, reflection-based operations and on-demand help. Public Lite excludes paid input/assertion playtesting. Embedded Godot TCP server is not a Roblox plugin pattern to assume. |
| 14 | [AI Game Studio](https://github.com/Codigo-Free/ai-game-studio) | D | Adapt | Structured game changes and explicit authoring roles. Custom Rust 2D engine; whole-game generation/quality claims were not executed or independently evaluated. |
| 15 | [GameFactory-3A](https://github.com/OpenDCAI/GameFactory-3A) | D | Adapt | Separate asset modalities, model backends and engine contexts/adapters. A Roblox adapter still needs its own import, permissions, rigging and behavior checks. |
| 16 | [MyMeshy](https://github.com/felippeomgt/mymeshy) | D | Evaluate | End-to-end asset-stage organization and viewer/export workflow. README documents mock fallback without supported GPU/models; mock output must never be reported as real model generation. |
| 17 | [OpenX Clay](https://github.com/OpenX-Inc/clay) | S/D | Adapt | One tool registry for MCP/model callers, structured failures, GPU generation separated from processing. Useful design; perform our own real-output and model-term evaluation before backend adoption. |
| 18 | [nAIVE](https://github.com/poro/nAIVE) | D | Adapt | Human-readable scene/logic representation and independent engine/platform concerns. Do not force Roblox into YAML/Lua engine semantics; README identifies different engine and platform licenses. |
| 19 | [WraithEngine](https://github.com/Tamely/WraithEngine) | S/D | Adapt | Authoritative command/event editing, target identity and module status. In-process modules are not isolated services; WebRTC/native engine hosting is not proof of hosted Roblox Studio feasibility. |
| 20 | [renew](https://github.com/renew-engine/renew) | S/D | Adapt | Common CLI/JSON operations, recording and explicit determinism test scope. Early unstable engine, not a dependency for Forge; avoid importing custom parsing/rendering/runtime infrastructure. |

## Roblox ground truth and agent infrastructure

| # | Resource | Depth | Decision | Useful contribution and boundary |
| --- | --- | --- | --- | --- |
| 21 | [Roblox Creator docs](https://create.roblox.com/docs) | D | Integrate | Ground truth for classes, security contexts, networking, import and testing. Current StudioTestService documents multiplayer automation; verify the installed build before using it. |
| 22 | [Model Context Protocol](https://modelcontextprotocol.io/) | D | Integrate | Standard external tool/resource boundary. Current latest spec is 2026-07-28; compatibility with Studio/clients must be checked. MCP is not a sandbox, database or workflow engine. |
| 23 | [MCP specification/source organization](https://github.com/modelcontextprotocol) | D | Integrate | Use the official SDK/spec/conformance ecosystem instead of inventing an incompatible protocol. An organization URL is not a single component; choose and pin the actual SDK. |
| 24 | [SWE-agent](https://github.com/SWE-agent/SWE-agent) | D/Prior | Adapt | Constrained agent interfaces and repository navigation. Current README recommends mini-SWE-agent, already covered by earlier Forge research. Do not select the older framework as a fresh default. |
| 25 | [SWE-bench](https://www.swebench.com/) / [source](https://github.com/SWE-bench/SWE-bench) | D | Adapt | Fixed tasks, executable grading and preserved evaluation inputs. Build a Roblox-specific suite; repository issue scores do not establish playability, visual quality or multiplayer correctness. |
| 26 | [OpenHands](https://github.com/All-Hands-AI/OpenHands) | D/Prior | Adapt | Runtime isolation and backend boundaries; linked repository now presents Agent Canvas. Earlier pinned software-agent-sdk findings are more directly relevant than adopting the complete control-center UI. |
| 27 | [Aider](https://github.com/Aider-AI/aider) | D/Prior/S | Adapt | Ranked repository context and relevant code selection. Extend retrieval with Roblox hierarchy, assets and tests; a text repository map alone cannot describe live game state. |
| 28 | [Continue](https://github.com/continuedev/continue) | D | Defer | Historical model/IDE integration reference. README says read-only and no longer actively maintained; unsuitable as the preferred new foundation. |
| 29 | [LangGraph](https://github.com/langchain-ai/langgraph) | D + Context7 | Evaluate | Explicit state graphs, checkpoints and resumable steps. JS version fits current stack if needed; unfinished external side effects still require idempotency/reconciliation. Avoid a rewrite without demonstrated value. |
| 30 | [AutoGen](https://github.com/microsoft/autogen) | D | Defer | Role communication patterns remain instructive. Current maintenance notice points to Microsoft Agent Framework; no need to add this framework to Forge. |
| 31 | [CrewAI](https://github.com/crewAIInc/crewAI) | D | Adapt | Role/task abstractions and separation of autonomous crews from controlled flows. Python and additional orchestration state add complexity; role names alone do not produce independent authority or savings. |
| 32 | [OpenAI Agents SDK](https://github.com/openai/openai-agents-python) | D | Evaluate | Small agent/tool/handoff/tracing abstractions; README links a JS/TS implementation. Candidate if richer role execution is needed, not a substitute for Studio recovery or an automatic model choice. |
| 33 | [MCP reference servers](https://github.com/modelcontextprotocol/servers) | D | Adapt | Learn tool/resource contracts and SDK usage. Repository explicitly labels its servers educational reference implementations, not production-ready components to expose unchanged. |
| 34 | [Playwright](https://github.com/microsoft/playwright) | D + local use | Integrate | Already used for Forge browser tests. Transfer isolation, condition-based waits and failure traces into game scenarios. Browser tests cannot verify native Roblox gameplay. |
| 35 | [BehaviorTree.CPP](https://github.com/BehaviorTree/BehaviorTree.CPP) | D | Adapt | Observable running/success/failure states and interruptible actions. Use these control ideas in the scheduler or test bots; importing C++ behavior trees is unnecessary for the current TypeScript coordinator. |
| 36 | [Semantic Kernel](https://github.com/microsoft/semantic-kernel) | D | Defer | Model/tool abstraction reference. Current README directs users toward Microsoft Agent Framework. Evaluate that separately only if a future requirement justifies the ecosystem. |
| 37 | [OpenTelemetry](https://opentelemetry.io/) | D | Integrate | Correlated model/tool/asset/test spans, metrics and logs. Define Forge-specific outcomes and cost attributes; avoid using trace history as the authoritative task database. |
| 38 | [Temporal](https://temporal.io/) / [source](https://github.com/temporalio/temporal) | D | Defer | Strong candidate for later distributed, long-running asset/build workflows. Local durable jobs first; retries do not confer exactly-once external mutations. |
| 39 | [Ray](https://github.com/ray-project/ray) | D | Defer | Potential GPU/evaluation workload scheduling after measured demand. Not needed for a few local workers, and not an automatic way to run headless Roblox test fleets. |

## Roblox toolchain and assets

| # | Resource | Depth | Decision | Useful contribution and boundary |
| --- | --- | --- | --- | --- |
| 40 | [Rojo](https://github.com/rojo-rbx/rojo) | D/Prior/S | Integrate selectively | Repositories, sourcemaps and Studio synchronization. Current README includes syncback/two-way options. Declare ownership per script/subtree and preserve unsupported Studio-authored data. |
| 41 | [Rokit](https://github.com/rojo-rbx/rokit) | D | Integrate | Pin reproducible project toolchains and expose diagnostics. Install needed, trusted versions deliberately; do not let models change global tooling arbitrarily. |
| 42 | [Wally](https://github.com/UpliftGames/wally) | D | Integrate selectively | Curated reusable Luau packages and lockfiles. Package existence is not quality/security proof; test selected versions and their transitive dependencies. |
| 43 | [Selene](https://github.com/Kampfkarren/selene) | D | Integrate | Cheap deterministic lint with Roblox-aware configuration. Complement type analysis; a clean lint result cannot prove gameplay or runtime API permissions. |
| 44 | [StyLua](https://github.com/JohnnyMorganz/StyLua) | D | Integrate | Consistent deterministic Luau formatting; reduces unnecessary model formatting work. Configure Luau syntax explicitly and keep formatting separate from semantic repair. |
| 45 | [Luau](https://github.com/luau-lang/luau) | D + local use | Integrate | Parsing/type/lint infrastructure and pure module execution. Supply current Roblox types/sourcemaps where needed; standalone Luau lacks the full Roblox runtime. |
| 46 | [Roblox Open Cloud](https://create.roblox.com/docs/cloud) | D | Integrate selectively | Supported cloud-side asset/project/publishing operations. Prefer scoped API keys/OAuth and explicit release targets; Open Cloud does not replace editor manipulation or native testing. |
| 47 | [Creator Store](https://create.roblox.com/docs/production/creator-store) | D | Integrate | Search/reuse before costly generation when suitable. Track source/version/permissions, inspect embedded scripts, and verify runtime loading. Avatar Marketplace and development assets are not interchangeable catalogs. |
| 48 | [Blender MCP](https://github.com/ahujasid/blender-mcp) | D | Evaluate | Interactive DCC inspection and repair through a tool bridge. Use a dedicated worker/project; prefer deterministic Blender jobs for routine processing rather than unrestricted agent Python for everything. |
| 49 | [Blender](https://github.com/blender/blender) | D | Integrate as optional worker | Geometry, UVs, rigs, animation, materials and conversion. Pin executable/scripts and test Roblox import outcomes; avoid bundling a large DCC install into every user's required setup. |
| 50 | [Hunyuan3D-2](https://github.com/Tencent-Hunyuan/Hunyuan3D-2) | D | Evaluate | Candidate shape/texture backend. This repository also points to newer models; compare exact versions, GPU needs, outputs and authoritative weight terms before selection. |
| 51 | [TRELLIS](https://github.com/microsoft/TRELLIS) | D | Evaluate | Alternative generative 3D backend; upstream recommends image-conditioned generation for stronger results. Mesh export is relevant; radiance fields/Gaussians are not ready Roblox meshes. |
| 52 | [ComfyUI](https://github.com/comfyanonymous/ComfyUI) | D | Evaluate | Versioned asset workflow graphs, queued execution and replaceable model stages. Keep behind the asset adapter; pin approved nodes/models and distinguish local from paid API nodes. |
| 53 | [MeshLab](https://github.com/cnr-isti-vclab/meshlab) | D | Evaluate | Mesh repair/simplification algorithms where Blender/Trimesh fall short. Compare headless processing interfaces and output fidelity; no need for a second mesh stack by default. |
| 54 | [Trimesh](https://github.com/mikedh/trimesh) | D | Integrate as optional worker | Automated dimensions/topology/geometry checks and conversions. Pin dependencies; it cannot judge animation quality, visual style or all Roblox constraints. Not all valid game props must be watertight. |
| 55 | [OpenUSD](https://github.com/PixarAnimationStudios/OpenUSD) | D | Adapt / defer dependency | Composition, references and separation of scene description from runtime. Use a smaller Roblox-specific manifest now; no inspected source establishes native USD-to-Roblox scene parity. |

## Selection rules

- Choose a component because it closes a measured capability gap, not because its README mentions agents or advertises a large tool count.
- Preserve independent test outcomes and versioned evidence when borrowing knowledge, assets or gameplay components.
- Distinguish code reuse from design inspiration. Source copied into Forge would require exact dependency/license review and appropriate tests; none was copied into the application in this pass.
- Framework selection is subordinate to the acceptance loop: a generated feature must match the request, run in Roblox, and produce the intended observable behavior.
