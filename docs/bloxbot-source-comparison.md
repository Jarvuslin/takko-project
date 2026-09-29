# BloxBot source comparison with Takko

2026-09-24 UTC. Static source inspection only, using the existing systematic-debugging skill for call-path and evidence discipline. No application or competitor code executed, dependencies installed, paid inference, Studio session or process restart.

## Result

BloxBot is an OpenCode-based assistant for editing the currently open Roblox Studio experience. Takko is a custom generation pipeline with a persistent approved proposal, asset records, owned tasks, independent review and spending enforcement. They overlap substantially in the outcome they promise, but the application code takes different approaches.

BloxBot already has an Explorer, model/agent selection, explicit Studio targeting, permissions UI, context compaction, cost display and editable playtest plans. Calling it just a chat wrapper would understate its implemented integration work. Takko's extra structure is real, but it has not yet demonstrated a better completed-game outcome. Our latest fighting benchmark failed before code generation.

## What was inspected

Cloned the public repository read-only into `research/evidence/bloxbot-source-20260924`. Snapshot commit: `8a0c1b9d53916171e116c3d79cd943f858c9bdce`, commit date `2026-09-24T01:36:03+02:00`, subject `Prepare v0.11.1 (#90)`. Package version is 0.11.1. The checkout remained clean and is ignored by Takko's Git configuration. No downloaded code was run.

Inspected the OpenCode configuration and startup, MCP broker, normal message dispatch, Studio target and Explorer paths, generated-program runtime, playtest generation and execution entry points, cost UI and representative test source. Compared against Takko's proposal, generation, coordinator, Marketplace library and Studio plugin implementation. OpenCode's separately downloaded engine and Roblox's native MCP implementation were not audited. Absence claims below concern BloxBot's application source at this commit, not every capability of its dependencies.

## Actual differences

| Area | BloxBot source | Takko source | Practical consequence |
|---|---|---|---|
| Main execution | Sends the selected model/agent a session prompt through OpenCode. The agent calls Studio MCP through a forwarding broker. | Custom proposal, planner, coordinator, builder, reviewer and repair lifecycle with saved receipts. | BloxBot delegates the agent loop. Takko owns more control logic and pays for more orchestration. One prompt can still cause many BloxBot model/tool turns. |
| Existing games | Explorer collects the connected place tree. Object references ask the agent to rediscover and inspect current state before editing. | Generated artifacts are applied inside Takko-owned namespaces. | BloxBot has a broader existing-place workflow. Takko is not yet an arbitrary existing-game editor. |
| Approval and edits | Compact prompt tells the agent to inspect and make the smallest coherent change. OpenCode permissions are exposed. No equivalent application-level game-proposal hash gate was found. | Mechanics, theme and environment are schema-backed sections. Patches must match the base revision/hash and permitted sections. Approval includes selected asset identity. | Takko enforces parts of preservation and approval in code instead of relying only on agent instructions. This is stronger structure, not proof of perfect edits. |
| Assets | No dedicated Marketplace selection, inspection-cache and clip-preview workflow was found in the app. The agent can use capabilities exposed by Studio MCP. | Explicit Creator Store search, saved choices, inspected asset snapshots, version/content hashes and animation-clip selection. | Takko offers a more explicit asset-review workflow. This does not mean BloxBot cannot insert assets or that Takko's automatic ranking is reliable. |
| Cost | Shows reported step cost, input/output tokens and cached tokens. Uses automatic context compaction and reusable deterministic inspection programs. No custom project/generation monetary reservation ledger was found. | Reserves before dispatch, enforces generation/project/cumulative reservation limits, retains uncertain charges and records calls. | BloxBot keeps application orchestration lighter. Takko offers explicit caps but currently burns too much on planning. Actual comparative cost is unmeasured. |
| Testing | Optional editable goal/steps/watch-for/success-criteria plan. Running it submits a normal agent prompt to observe Studio and report results. | Independent requirement review, compilation and acceptance-test artifacts, with Studio results tied to an applied artifact identity. | Takko has more explicit evidence bookkeeping. Neither a model's report nor an offline test establishes a working game. |
| Model roles | User selects a model and exposed OpenCode agent. Hidden helper sessions handle playtest planning and integration recovery. | Configurable role routes plus bounded non-coding decisions such as Jev advice. | There is no evidence BloxBot needs Takko's fixed sequence of separate planning/review calls. It can still use expensive models and retries. |

### BloxBot's main path

`ChatInput` adds the selected Studio reference and calls `useSendMessage`. That hook forwards the user text, optional images, model, agent and variant to `client.session.promptAsync`. `createOpenCodeConfig` enables automatic compaction and a compact Studio-specific agent instruction. The MCP broker forwards tool discovery and calls to Roblox's native connector. This is a direct agent-to-Studio path, not a custom multi-stage game generation schema.

Sources: [message dispatch](https://github.com/paralov/app-bloxbot-ai/blob/8a0c1b9d53916171e116c3d79cd943f858c9bdce/src/hooks/mutations/useSendMessage.ts#L33), [agent configuration](https://github.com/paralov/app-bloxbot-ai/blob/8a0c1b9d53916171e116c3d79cd943f858c9bdce/electron/opencodeConfig.ts#L30), [MCP forwarding](https://github.com/paralov/app-bloxbot-ai/blob/8a0c1b9d53916171e116c3d79cd943f858c9bdce/electron/services/StudioMcpBroker.ts#L144).

OpenCode is launched as a separate local server with app-specific directories and a generated local credential. BloxBot obtains a compatible binary through its downloader. This audit does not establish the internals or precise runtime behavior of that external engine. [Startup implementation](https://github.com/paralov/app-bloxbot-ai/blob/8a0c1b9d53916171e116c3d79cd943f858c9bdce/electron/services/OpenCode.ts#L197).

### A concrete cost optimization worth learning from

Explorer refresh uses a built-in TypeScript collector initially. Successful refreshes reuse the compiled artifact and invoke MCP directly, without a model interpreting every tree refresh. Polling backs off when unchanged and pauses while the page is hidden or unfocused. A failed collector can request a model-generated replacement. Studio discovery/selection similarly begins with built-in programs and can regenerate on failure.

This is a demonstrated architectural mechanism for avoiding routine inference, not a measured dollar saving. Automatic recovery can itself incur calls. The lesson for Takko is to keep predictable routing, inspection and scheduling in ordinary code, and reserve models for uncertain decisions and actual generation.

Sources: [Explorer execution](https://github.com/paralov/app-bloxbot-ai/blob/8a0c1b9d53916171e116c3d79cd943f858c9bdce/src/components/Explorer.tsx#L208), [built-in collectors](https://github.com/paralov/app-bloxbot-ai/blob/8a0c1b9d53916171e116c3d79cd943f858c9bdce/src/lib/builtinStudioPrograms.ts#L117), [compiled-artifact cache](https://github.com/paralov/app-bloxbot-ai/blob/8a0c1b9d53916171e116c3d79cd943f858c9bdce/electron/services/GeneratedProgramRuntime.ts#L80), [target selection](https://github.com/paralov/app-bloxbot-ai/blob/8a0c1b9d53916171e116c3d79cd943f858c9bdce/src/providers/StudioTargetProvider.tsx#L112).

### Their playtesting is real application functionality, with limits

The playtest planner creates a temporary session with all tool permissions denied, supplies up to the last 30,000 characters of text chat history, requests structured output and deletes the temporary session afterward. The user can edit the fields or enter a plan manually. Run playtest sends that plan to the normal agent rather than producing a deterministic verdict in the UI.

One source-level limitation: ordinary `ChatInput` passes `studioTargetReference`, while `PlaytestPanel` passes only the formatted text. The existing session may still contain enough target context, so this is not a reproduced wrong-place failure. It shows why explicit target selection alone should not be treated as proof every execution path carries that target.

Sources: [planner call](https://github.com/paralov/app-bloxbot-ai/blob/8a0c1b9d53916171e116c3d79cd943f858c9bdce/src/hooks/mutations/useGeneratePlaytestPlan.ts#L33), [history and execution prompt](https://github.com/paralov/app-bloxbot-ai/blob/8a0c1b9d53916171e116c3d79cd943f858c9bdce/src/lib/playtestPlan.ts#L49), [run button path](https://github.com/paralov/app-bloxbot-ai/blob/8a0c1b9d53916171e116c3d79cd943f858c9bdce/src/components/PlaytestPanel.tsx#L133), [ordinary chat target forwarding](https://github.com/paralov/app-bloxbot-ai/blob/8a0c1b9d53916171e116c3d79cd943f858c9bdce/src/components/ChatInput.tsx#L507).

### Takko's controls are observable, but carry costs

[Proposal code](<D:/RobloxProjects/Roblox Gen/src/generation/proposal.ts:92>) checks base identity before committing section changes and computes affected tasks from dependencies. [Generation engine](<D:/RobloxProjects/Roblox Gen/src/generation/engine.ts:1663>) preserves the cumulative charge start, checks reservations before calls and rejects uncertain billing before a new proposal run. The coordinator retains worker history and only finishes after completion and a current independent review. The plugin checks namespace baselines before replacement and requires the exact applied artifact before acceptance tests.

Precise local references: `src/generation/proposal.ts:92`, `src/generation/engine.ts:1166`, `src/generation/engine.ts:1441`, `src/generation/engine.ts:1663`, `src/generation/engine.ts:2121`, `src/generation/coordinator.ts:119`, `src/marketplace/library.ts:168`, `plugin/Forge.plugin.luau:94`, `plugin/Forge.plugin.luau:176`.

These checks are not free. The engine currently reviews requirements separately, and coordinator choices add model calls. In the preserved benchmark, five implementation-planning calls cost $0.733648 and emitted 48,541 output tokens before code. The run's total was $0.798722. BloxBot's simpler application path suggests less mandatory orchestration, but there is no equivalent BloxBot run or invoice to quantify the difference. [Existing cost evidence](competitor-cost-optimization.md).

## Business implication

Takko has meaningful engineering differences. They become a paid advantage only if a customer gets a correct result more reliably, spends less time repairing it, or can trust a budget and approval boundary that matters to their workflow.

The strongest candidate is the combination of explicit asset choices, preserved revisions, bounded cost and reproducible behavior checks. It is not yet a demonstrated advantage. Our failed fighting run and unsuccessful automatic asset selection remain contrary evidence that must be addressed.

BloxBot is a serious free application baseline, especially for an existing-place assistant. Building more generic chat, model selection and Studio connectivity would not by itself justify a paid business. Before claiming superiority, compare the same tasks, selected models and acceptance criteria, recording total cost, elapsed time, user intervention and native behavior. No such comparison was run here, and no paid benchmark is authorized by this report.

The gstack business review remains pending actual customer-demand evidence. This source audit informs that review without replacing the user's answers or approving a pivot.

## Verification and operational state

Verified the cloned Git commit, package version, clean checkout and ignored evidence location. Read representative tests for prompt compactness, compaction settings, mock playtest dispatch, program reuse and target discovery. Tests were inspected, not executed. No new test pass is claimed. `npm run check`, BloxBot's test suite and native gameplay were not run because this was a source research task.

At 2026-09-24T16:32Z there were no listeners on 4318, 4319, 4324, 4335 or 4336. Studio PIDs 3088 and 6604 remained present. Mode was not inspected or changed, and no Studio session was performed. No process touched.

New paid cost: $0. Historical accounted spend remains $3.990954 of $4.40, including unknown holds, with $0.409046 remaining authorization. Last provider balance remains $1.263503974 at 2026-09-24T03:32:45.775Z, not refreshed. Existing failed project e4689e81-9de2-4d7d-b958-c904194f6a44, source changes and evidence were preserved.
