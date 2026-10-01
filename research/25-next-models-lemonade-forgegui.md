# Model test history, game-building research and next candidates

## Current assessment, 2026-10-01

**Test GPT-6 Luna, GLM-5.3 Flash and Gemini 3.8 Flash against Sonnet 5.5 first.** Composer 2.5 belongs in a separate whole-agent comparison. This is a proposed shortlist, not a measured ranking. We have already tried considerably more models than Sonnet and Haiku, but the tasks, harness versions and evidence vary too much to rank them as complete game builders.

This update audits retained local records and reads official documentation, research papers, public provider attribution, Reddit and engine forums. No paid inference, account-balance request, new model installation, Studio action or app restart occurred. Public catalog access did not use credentials. The September 16 sections below are retained as a dated snapshot, including recommendations and statements later superseded by actual tests.

## What we have actually tested

Counts below describe individual experiments, not a common leaderboard. A configured model, catalog entry or planned worker does not count as a completed inference test.

| Model | Actual local evidence and outcome | Evidence |
|---|---|---|
| GPT-4.1 mini | Numerous early pipeline/component tests. In the controlled OpenCode comparison, both harnesses passed 3/3 pure Luau tasks. Takko used 6 calls/$0.0243528, OpenCode 14 calls/$0.0156412. No assets or native game acceptance. | [Harness comparison](24-agent-effectiveness-comparison.md) |
| Qwen3 Coder Next and Gemini 2.5 Flash Lite | Early live generation/planner trials exposed schema, ownership and validation defects. Historical continuation explicitly records live use. Original call receipts were not reconstructed in this audit. No comparable native success score. | [Historical state](notes/archive/continuation-2026-09-13-to-2026-09-29.md), entry beginning “Live tests used Qwen3 Coder Next” |
| Gemini 3.7 Flash | Used in planning, asset decisions, source review and adaptation. Frozen source review initially failed JSON/quotation contracts. After the evidence interface changed to line-range citations, one fresh review passed first attempt for $0.050034. This is a contract improvement, not full-game success. | [Source-review result](results/source-review-lines-v1/RESULTS.md) |
| GPT-5.6 Sol | Collect-and-sell reached `ready_to_test`. A separate frozen source review failed twice for $0.253846. Different roles and tasks give different results. | [Generation report](../.forge/evaluations/takko-generation-20260915/report.json), [review diagnostic](results/source-review-sol-v1/RESULTS.md) |
| GPT-5.6 Luna | Initial collect-and-sell failed task ownership. Retry after a clearer output contract reached `ready_to_test`. Later bubble controller passed 14/15 native fixture checks for $0.0019958, failing overlapping presses. | [Retry](../.forge/evaluations/takko-generation-retry-20260915/), [screen](results/model-screen-20260916/RESULTS.md) |
| MiMo V2.5 | Collect-and-sell request hit the 120-second timeout. This does not establish coding quality. | [Generation report](../.forge/evaluations/takko-generation-20260915/report.json) |
| MiMo V2.5 Pro | V4 asset workflow dispatched nine Pro calls alongside two Gemini planner calls. Required asset needs remained unresolved. Distinct from base MiMo and from later runs where a planner failed before the worker. | [V4 receipts](../benchmarks/runs/butter-crunch-marketplace-v4-20260916/mimo/results.json) |
| DeepSeek V4.1 Flash | Collect-and-sell hit the 8,000-output-token limit. No usable completed build in that test. | [Generation report](../.forge/evaluations/takko-generation-20260915/report.json) |
| MiniMax M3 | V4 dispatched three MiniMax calls alongside two Gemini planner calls. Asset workflow failed before a verified game. | [V4 receipts](../benchmarks/runs/butter-crunch-marketplace-v4-20260916/minimax/results.json) |
| Grok Build 0.1 | V6 produced a build, but native count-after-completion behavior failed. Mixed Grok/Gemini run cost $0.185297, not a Grok-only invoice. | [Cost audit](22-game-generation-cost-and-optimization.md), [native result](../benchmarks/runs/butter-crunch-marketplace-v6-20260916/grok/native-evaluation/RESULTS.md) |
| Claude Sonnet 5 | Bubble controller passed 15/15 native fixture checks in one $0.023992 call. Later pipeline trials are separate. | [Four-model screen](results/model-screen-20260916/RESULTS.md) |
| Qwen3.8 Max 0902 | Same screen cost $0.036346. Compiled, but `Vector3:Clone()` caused native initialization failure. No repair call was allowed. | [Screen](results/model-screen-20260916/RESULTS.md), [failure attribution](26-model-failure-diagnosis.md) |
| Kimi K2.7 Code | Same screen cost $0.031298208. Used 7,999 of 8,000 output tokens on reasoning and returned no executable answer. Unsupported/unverified reasoning controls confound capability interpretation. | [Screen](results/model-screen-20260916/RESULTS.md), [failure attribution](26-model-failure-diagnosis.md) |
| Claude Haiku 4.5 | Concept/clarification tests, not the fighting demo. V1 made two paid calls for $0.008137 and failed the clarification schema. Offline replay after a schema change does not upgrade the failed live run. | [Concept trial](results/concept-live-v1/RESULTS.md) |
| Claude Sonnet 5.5 | Recent paid combat probes. P-Build 2 returned four compiling files passing 18/20 offline contracts. The later ten-scenario native pass belongs to a manually repaired derivative. | [Diagnostic](../docs/generation-diagnostic-brief.md), [rehearsal](../docs/guided-demo-rehearsal.md) |

These are **16 distinct named models recorded as live-tested**, with the two oldest supported here by the historical log rather than newly reconstructed receipts. This is not a claim of exhaustive account-wide usage. GPT-6 Luna is different from tested GPT-5.6 Luna. Gemini 3.8 Flash appears in saved configuration/catalog data, but this audit did not establish a paid test receipt. Composer, GLM-5.3 Flash and GameCoder-27B have no established local evaluation in these records. Our interactive Codex/Astra engineering session is not a controlled Takko model trial.

## What Roblox competitors demonstrably use

**Lemonade:** the freshly opened [OpenRouter app page](https://openrouter.ai/apps/lemonade) showed 42 models and these leading last-30-day figures: GPT-5.6 Luna 697B tokens, GLM-5.3 Flash 360B, Gemini 3.7 Flash 176B, GPT-6 Luna 65.1B and Hy3 44.8B. Earlier reads during this session showed slightly smaller totals, so these are a changing public snapshot. This establishes provider-attributed usage, not which model plans, codes or reviews, all of Lemonade's traffic, or its game success rate. September's observed Composer picker label remains weaker evidence than a generation receipt.

**Superbullet:** our inspected installed 0.3.99 client exposes Sonnet 5, Opus 5 and Haiku 4.5 selectors. Its “Bullet GPT 5.2” label maps to `gpt-5`, demonstrating why display labels alone are unreliable. BulletMind/BulletLearn identities remain opaque. BulletCode has an xAI description without an exact proven backend model. This is dated shipped-client evidence, not a new live backend observation. [Installed architecture and exact selectors](27-superbullet-installed-architecture.md).

**ForgeGUI:** the September public-client inspection supports context/reference retrieval, Studio pairing and Meshy-related contracts. Its coding/planning LLM remains unconfirmed. An image-model attribution cannot identify its coding model. Evidence and limitations remain in the dated section below.

**Roblox itself:** Roblox documents Assistant planning, asset generation and playtesting plus third-party Claude/Cursor/Codex access through Studio MCP. That supports an engine-tool architecture, not an identifiable universal game-building LLM. Cube/GenerationService generates assets and should not be confused with the coding agent. [Roblox announcement](https://about.roblox.com/newsroom/2026/04/roblox-studio-going-agentic), [GenerationService](https://create.roblox.com/docs/reference/engine/classes/GenerationService).

## Unity, Unreal, Godot and browser-game evidence

| Platform | Strongest relevant finding | Implication for Takko |
|---|---|---|
| Unity | Official AI combines an in-editor agent, project-aware MCP and a gateway for external agents. Current credit documentation names Default/Lite/Ultra tiers without identifying their underlying coding models. | Do not invent a “Unity model” to copy. The transferable part is access to scene objects, components, logs and editor actions. [Unity overview](https://unity.com/blog/unity-ai-how-to-get-started), [current tiers](https://docs.unity.com/en-us/ai/credits/credits-about) |
| Unreal/UEFN | Epic's UE6 roadmap explicitly names MCP integrations with Claude and Gemini. UEFN's assistant generates Verse and provides guidance. The reviewed official pages do not establish an exact underlying EDA model. | Integration and external-model choice matter. Roadmap items are not evidence of a shipped fully autonomous builder. [Epic roadmap](https://www.unrealengine.com/news/the-road-to-ue-6), [UEFN tools](https://www.fortnite.com/developer/tools?lang=en-US) |
| Unreal research | Code4Scene evaluates construction/editing in the engine. Fable 5.1 leads construction, Gemini 3.8 Flash leads editing, Astra narrowly leads overall. Best public repair F1 is only 0.527. | Gemini is a serious editing candidate, but scene quality does not establish combat logic, networking or Roblox asset integration. This September 29 preprint is fresh research, not our reproduction. [Paper](https://arxiv.org/html/2609.36777v1) |
| Godot research | GameDevBench compares edits to existing projects. Gemini 3 Flash with video reports 46.9% full pass@1 at $0.082 median task cost, including failed attempts. Tools and observation modes affect results. | Engine feedback and total attempt cost deserve controlled testing. These are project-edit tasks, not complete games for eight cents. [Paper, Table 4](https://arxiv.org/html/2602.11103v2) |
| Browser games | OpenGame combines GameCoder-27B with project templates, debugging tools and runtime evaluation. Its domain is web games. | Study its evaluation and reusable integration methods. Do not assume its model knows Roblox services or marketplace scripts. The opened repository establishes framework availability, not a verified deployable weights endpoint. [Authors' repository](https://github.com/leigest519/OpenGame) |

One particularly relevant result is [Unity Insight](https://arxiv.org/html/2609.27585v1): a persistent code-to-asset index reduced session tokens by 53% and elapsed time by 52% across 28 paired questions on two projects. This is a small project-question experiment, not a game-generation cost guarantee. It supports testing structural asset/dependency retrieval in Takko before adding more planning agents.

World/video generators and mesh generators solve different outputs. A generated gameplay video or 3D character does not supply editable, authoritative Roblox behavior. They are possible asset suppliers, not replacements for the coding and acceptance workflow.

## What Reddit and forums contribute

These are selected firsthand reports found through public searches, not a representative survey or independently reproduced builds. Dates are posting dates. No private communities were accessed and nobody was contacted.

- [Unity + Claude Code/MCP showcase, August 16](https://www.reddit.com/r/claude/comments/1vq06o8/game_dev_with_fable_5_is_actually_crazy/): the author reports 13 hours, system-by-system iteration, bought assets, image/Meshy generation and manual testing. They explicitly acknowledge substantial remaining refinement. Useful workflow evidence, not one-prompt automation.
- [Unreal developer discussion, July 22](https://www.reddit.com/r/unrealengine/comments/1v36yv8/for_those_using_ai_in_unreal_what_parts_of_your/): firsthand praise for Claude-generated C++ with thin Blueprint configuration, alongside complaints about Blueprint/MCP visibility and token use. Supports testing source and graph access separately. Model versions are often unspecified.
- [Unity forum, June 23](https://discussions.unity.com/t/advise-for-non-devs-using-ai-to-create-games/1723877): an author uses Sonnet for coding and Codex for audit, while replies dispute the value of excessive agent handoffs and emphasize project context. Evidence of competing practices, not proof either wins.
- [Qwen3.8-27B-Q5 game report, August 2026](https://www.reddit.com/r/LocalLLM/comments/1vvaxid/game_made_by_qwen3827bq5/): supplied asset packs and a custom harness produced a reported game. This nominates a local-model experiment. It does not demonstrate Roblox competence, repeatability or hardware cost.
- [Roblox scripting discussion, October 16, 2024](https://www.reddit.com/r/robloxgamedev/comments/1g5c628/i_use_ai_for_80_of_my_code_and_i_feel_great_about/): an experienced developer reports productive GPT-4o/Claude 3.5 use with review and polishing. Too old to rank current models, but useful evidence that successful reports include human understanding and debugging.

The practical inference is to automate the missing inspection and feedback steps, then compare models inside that workflow. Copying the model name from a showcase leaves out much of what made the showcase work.

## Prioritized candidates and fresh catalog prices

USD per million uncached input/output tokens, fetched 2026-10-01 from the unauthenticated [OpenRouter catalog](https://openrouter.ai/api/v1/models). [Saved selected entries](notes/model-platform-refresh-20260916/selected-models-20261001.json). These are listed rates, not a guaranteed routed quote or cost per accepted game. Reasoning, repeated context, tools and failures count toward cost. Validate the selected provider before reserving a paid call.

| Priority | Exact candidate | Input / output | Why test it |
|---|---|---:|---|
| First | `openai/gpt-6-luna` | $0.10 / $0.50 | Cheapest practical general baseline, fresh Lemonade usage, successor to our promising but imperfect Luna fixture result. |
| First | `z-ai/glm-5.3-flash` | $0.15 / $0.50 | Strong competitor-usage evidence, multimodal model, no local test yet. |
| First | `google/gemini-3.8-flash` | $0.75 / $3.75 | Strong relevant scene-editing evidence, compare against old Flash results and source/asset interpretation failures. |
| Control | `anthropic/claude-sonnet-5.5` | $2 / $10 | Current combat baseline. Fresh challengers need the same tasks and repaired harness, not comparison against unrelated historical failures. |
| Second | `minimax/minimax-m3` | $0.30 / $1.20 | Earlier acquisition failure did not fairly measure coding with complete asset evidence. |
| Second | `deepseek/deepseek-v4.1-flash` | $0.03 / $0.50 | Very cheap bounded repair retest with validated output settings. Its weak Code4Scene result lowers scene-building priority. |
| Second | `tencent/hy3` | $0.0825 / $0.33 | Actual Lemonade usage supports a cheap challenger, but no local behavioral evidence. |
| Separate local track | `qwen/qwen3.8-27b` or a pinned local weight/quantization | Hosted $0.42 / $3 | Community and engine-benchmark leads. Hosted and local configurations must not be treated as equivalent. Local hardware, latency and memory cost remain unmeasured. |

**Composer 2.5 standard** remains a useful separate Cursor SDK experiment at $0.50/$2.50, subject to access. Fast is $3/$15 and is the default, so pricing mode must be explicit. It changes the agent system as well as the model. [Cursor model docs](https://cursor.com/docs/models/cursor-composer-2-5), [SDK](https://cursor.com/docs/sdk/typescript).

GLM's [official model card](https://huggingface.co/zai-org/GLM-5.3-Flash) says omitted or invalid `reasoning_effort` defaults to `max`. Explicit supported settings and a bounded output allowance matter. The previous Kimi failure is why a universal “low effort” setting is insufficient. Haiku remains eligible for narrow intent/extraction tasks, but the three first candidates offer stronger reasons to spend the next comparison budget. No general role assignment is established until evaluated.

## Proposed comparison, not authorized or started

Use one host-controlled agent and the same tools for the first four models. Freeze an independent acceptance specification and eight cases: overlapping combo hits, nested audio extraction, NPC dependency/script rewiring with behavior preserved, checkpoint respawn, farming state, racing laps, a held-out custom mechanic, and rejection of an invalid remote action. Supply exact native asset facts. Require actual instance paths and complete relevant source where needed. Keep reference solutions and evaluator findings out of worker input.

First screen the four candidates on the same small cases. Promote at most two to repeated runs and newly held-out assets. Use model-supported reasoning settings, a fixed model-call/repair cap, wall-clock deadline and explicit dollar reservation per case. Preserve first-attempt and repaired scores separately. Do not let a failed importer, missing permission or dead bridge trigger paid speculative repair. Record those as harness/environment failures with all cost still included.

Measure **total billed cost across successes and failures divided by accepted artifacts**, plus latency, manual interventions and failure category. If there are no accepted artifacts, report no measurable cost per success. A pass requires behavior in the reopened exported place, asset identity preserved and independently specified acceptance checks. Mocks validate routing, budgets and recovery, not model quality or native gameplay. Record actual usage and remaining balance only during a separately authorized paid batch. None is activated by this research.

## Verification of this update

Public catalog fetched without credentials. Local historical results and source links inspected. Application source unchanged. Full `npm run check` passed once: build, 1,911 unit tests in 150 files, six Luau scenarios, 16 plugin checks plus plugin/eight source compiles, six guard fixtures, CSS zero errors/274 warnings, 21 desktop tests, production smoke, 108 browser tests and ten Electron tests. No crash, rerun or skipped stage. Log: `test-artifacts/game-model-research-full-check.log`. Native Studio verification was not run this turn. These checks do not reproduce external benchmarks or establish cheaper successful generation.

Automatic approval review rejected cleanup of `.forge/e2e-projects/run-36388` and ten `%TEMP%/takko-electron-journey-*` workspaces created 16:37:53–16:39:28Z, stating only “blocked by policy.” They remain. The check's port 4319 was released. Read-only process inspection found the existing Takko main PID 28600 alive but the previously recorded service PID 14992 and listener 51256 absent. No app process was stopped or restarted. Investigating that service state is separate follow-up work.

---

## Historical snapshot, September 16, before the four-model screen

This is a research result, not a new benchmark. No paid inference, generation, Studio operations, application changes or goal resumption occurred. Sources are current public documentation, a fresh unauthenticated OpenRouter catalog, downloaded public web assets, and explicitly dated prior local observations. Backend implementations remain unavailable.

## Direct answer about Composer

**We have not tested Composer.** Previous research about it and seeing it in Lemonade's interface were not inference tests. The earlier Sonnet 5 attempts were limited by truncation/timeouts; older Qwen3 Coder Next results came from a changing pipeline. Neither constitutes a fair comparison with the later Sol runs. Kimi and Opus also lack local measured results in the reviewed campaign.

Cursor documents `composer-2.5`, a 200k context window and standard pricing of $0.50 input/$2.50 output per million tokens. Fast costs $3/$15 and is the product default. Its agentic training and integrated tools are relevant to testing an entire coding system, beyond swapping a completion model. [Official model documentation](https://cursor.com/docs/models/cursor-composer-2-5).

The official TypeScript package is `@cursor/sdk`; its example selects `composer-2.5`. It supports a local workspace and custom tools through MCP, but uses Cursor-hosted inference and requires a Cursor API key. An OpenRouter key does not grant this access. This is a practical candidate for connecting a bounded Studio adapter. It is not evidence of a generic OpenAI-compatible Composer endpoint. No SDK installation or inference was attempted. [Official SDK](https://cursor.com/docs/sdk/typescript).

Compare Composer plus Cursor's agent separately from a same-agent model comparison: changing both model and orchestration otherwise obscures the cause of any improvement. Explicitly verify the selected billing tier before a trial; do not budget standard rates while accepting the default Fast tier.

## Models worth testing next

These are candidate assignments, not measured rankings. Rates are USD per million input/output tokens from the September 16 catalog snapshot, except Composer from Cursor. Provider routing, cache pricing, reasoning tokens and retries affect actual bills. Catalog availability does not establish successful access with our account.

| Model / exact identifier | Input / output | Proposed test role | Priority rationale |
|---|---:|---|---|
| Claude Sonnet 5 — `anthropic/claude-sonnet-5` | $2 / $10 | Planning, component adaptation, repair | Retest with adequate output and time limits; earlier failures did not isolate ability. |
| Claude Opus 5 — `anthropic/claude-opus-5` | $5 / $25 | Difficult repair and independent defect review | Premium quality baseline; use on bounded difficult tasks first. |
| Qwen3.8 Max — `qwen/qwen3.8-max-0902` | $2 / $6 | Planning, coding and screenshot-informed correction | Stronger/current Qwen candidate; different model from previously tested Coder Next. |
| Kimi K2.7 Code — `moonshotai/kimi-k2.7-code` | $0.7062 / $3.21 | Source adaptation and multi-step repair | Coding-focused candidate at much lower listed rates than Opus. |
| Kimi K3 — `moonshotai/kimi-k3` | $3 / $15 | Broad planning and visual/code iteration | Premium multimodal challenger; not the cheapest Kimi option. |
| GPT-5.6 Luna — `openai/gpt-5.6-luna` | $0.20 / $1.20 | General economical baseline | Largest model attribution on Lemonade's current public OpenRouter page. |
| Gemini 3.8 Flash — `google/gemini-3.8-flash` | $0.75 / $3.75 | Visual/audio assessment and routine tool work | Test against our existing 3.7 Flash results using identical inputs. |
| Composer 2.5 standard — `composer-2.5` | $0.50 / $2.50 | Full coding-agent comparison | Separate Cursor SDK track; access and integration prerequisite. |

Rates and capabilities are retained in [selected-models.json](notes/model-platform-refresh-20260916/selected-models.json), derived from the [official live catalog](https://openrouter.ai/api/v1/models). Individual sources: [Sonnet](https://openrouter.ai/anthropic/claude-sonnet-5), [Opus](https://openrouter.ai/anthropic/claude-opus-5), [Qwen](https://openrouter.ai/qwen/qwen3.8-max-0902), [Kimi Code](https://openrouter.ai/moonshotai/kimi-k2.7-code).

Secondary low-cost controls are Hy3 (`tencent/hy3`, $0.0825/$0.33) and GLM-5.3 Flash (`z-ai/glm-5.3-flash`, $0.09/$0.30). Both have Lemonade attribution. These are online model rates; the cheaper GLM batch SKU is a separate entry. Fable 5.1 is also cataloged at $10/$50, but its cost makes it a later challenger after establishing a useful baseline. This ordering is budget judgment, not evidence it performs worse.

Kimi's own K2.7 Code evaluation compares several coding/tool benchmarks and does not establish universal Opus parity. Its task distribution is not Roblox. [Vendor evaluation](https://www.kimi.com/resources/kimi-k2-7-code). Kimi K3's official publication emphasizes long coding sessions and visual iteration, while noting that its overall evaluation still trails its strongest proprietary comparators; its benchmark harnesses also vary. Those are reasons to test it, not independent proof that it wins here. [K3 publication](https://www.kimi.com/en/blog/kimi-k3).

## Lemonade: what the evidence actually identifies

### Models

The public OpenRouter app page currently attributes the largest token volume to **GPT-5.6 Luna**, followed by **Gemini 3.7 Flash** and **Hy3**. It also lists Ox Alpha, GLM-5.3 Flash and smaller contributions from other models. This supports real provider-attributed model use, but cannot identify planner/builder/reviewer assignments or all traffic outside OpenRouter. The rolling totals vary between captures, so they should not be treated as fixed lifetime spend. [Public attribution](https://openrouter.ai/apps/lemonade).

Our **September 14 authenticated UI observation** recorded GPT-5.6 Luna, Hy3, Gemini 3.7 Flash and **Composer 2.5** in the model picker. That is stronger evidence than a marketing rumor, but remains a UI label: we did not submit a Lemonade Composer generation or verify its backend route. [Preserved browser observation](15-authenticated-workspace-ui.md). Composer is absent from the fresh OpenRouter catalog; its UI presence could reflect another integration, but the mechanism is unknown.

### System

The public client and previously decoded installed plugin support the following architecture. This turn rechecked the installed `Plugin.rbxm` hash against the retained inventory: version **2.2.4**, asset-version directory **68657693815716**, SHA256 `AD009C907A7E7764B225EBDB23EACD070716473D6BC1E58121ACB11244A3B1C5`.

| Layer | Directly observed evidence | Limit |
|---|---|---|
| Web application | Next.js/React; Clerk authentication; model picker and project/chat UI | The shipped client is not the complete application backend. |
| Service connection | Convex references and a Studio action queue/poll-and-result protocol | Server prompts, model routing and scheduling are unavailable. |
| Studio tool surface | 23 action handlers, including source inspection/editing, instance operations and testing | Existence of handlers does not measure frequency or reliability. |
| World context | DataModel index and stable `_lemonadeUniqueId` identity | ID maintenance is not proof of complete continuous world synchronization. |
| Execution feedback | `StudioTestService:ExecutePlayModeAsync`, client/server logs, screenshots and render checks | A feedback mechanism is not a guarantee that generated games pass. |
| Media transport | Screenshot upload paths including R2/Convex/inline representations | Current branches and fallbacks matter; old comments are not runtime evidence. |

See [architecture analysis and source links](01-architecture.md) and [source inventory](06-sources.md). Fly-related machine routes suggest an execution infrastructure component, but its internal agent was not inspected. The supported picture is a web agent connected to a substantial Studio tool/feedback bridge. We cannot recover the complete reasoning loop, hidden prompts, compaction strategy or per-role model policy from that bridge.

**Implication:** Lemonade's observed usage does not support a claim that its advantage comes only from using a more expensive model. Context, tool reliability and execution feedback are credible contributors. Their causal contribution and comparative game quality still require controlled tests. There is no inspected evidence establishing that Lemonade trained its own foundation model.

## ForgeGUI: new public-client inspection

The investigated product is **https://forgegui.com/**. Search results for `forgegui.net`, similarly named products and third-party clones were not treated as evidence about this application.

Public HTML and imported JavaScript were downloaded without logging in or invoking generation/admin endpoints. The retained bundles expose browser request contracts and UI behavior, not backend source. Their filenames, URLs, timestamps and hashes are recorded in the evidence directory below.

| Finding | Evidence in shipped public assets | What it supports |
|---|---|---|
| React application with Supabase | App bundle, auth/storage/rest references, Edge Function URLs; privacy page also identifies Supabase and Stripe | Hosted application/services architecture and payment integration. |
| Routing separated from execution | `chat-router` receives conversation, message, references and plan mode; `chat-dispatch` receives task identifiers and execution options | An explicit planning/routing and task-dispatch interface. Exact LLM and backend implementation remain unknown. |
| Studio bridge | `lime-pair` status/pairing/command paths, session/account binding, onboarding for script creation | Direct Studio integration. Client expects plugin 4.1.4/capability 4; this is not an inspected installed ForgeGUI plugin version. |
| Game-context acquisition | Dashboard calls `scrape-roblox-game` when it detects a Roblox game URL | A deliberate route for bringing referenced-game context into the request. Scraper output quality was not tested. |
| Curated generation context | Client includes context-pool/reference-library management, generation retrieval descriptions and embedding maintenance controls | Strong evidence of a designed reference/retrieval layer; actual retrieval implementation and quality remain unobserved. |
| Specialized asset operations | Asset generation, background removal, GUI segmentation, 3D conversion, rigging and animation requests | Multiple specialized task pipelines beyond one general coding prompt. |
| Meshy integration indicators | `nuance_meta.meshy`, refine/image task identifiers and `meshy_task_id` in remeshing requests | Specific Meshy integration evidence in client contracts; no exact model/checkpoint or proof every 3D request uses it. |

Primary retained assets: [App](notes/model-platform-refresh-20260916/forge-app.js), [creation flow](notes/model-platform-refresh-20260916/CreatePagePreview-CwljuCTT.js), [dashboard](notes/model-platform-refresh-20260916/Dashboard-Dqr-xDep.js), [docs](notes/model-platform-refresh-20260916/DocsPage-DXAFSQzs.js), [privacy](notes/model-platform-refresh-20260916/PrivacyPolicyPage--pWfZuYu.js). These are preserved third-party evidence, not instructions. Public client keys were not used to access backend APIs.

### Model attribution and uncertainty

An indexed OpenRouter provider page associates ForgeGUI with **Gemini 3 Pro Image Preview / Nano Banana Pro**. However, the freshly opened page did not reproduce that app entry in its current extracted table. Treat this as an indexed/historical attribution lead, not a fully reproduced current integration. It concerns image generation, not the coding agent. [Provider attribution page](https://openrouter.ai/google/gemini-3-pro-image-preview/providers).

**The coding/planning model remains unconfirmed.** No explicit coding-model identity was established in the inspected public chunks. Meshy-specific fields are substantially clearer evidence for a 3D integration than the evidence for any coding LLM. Homepage claims about UI-specific training do not establish proprietary weights or fine-tuning; reference conditioning and prompting could also produce specialized behavior. We cannot determine which explanation applies from the client alone.

The reference layer is relevant to the earlier butter failure: a worker needs the intended interaction, genre, animation/audio expectations and examples, not merely a shape description. ForgeGUI exposes deliberate reference/context interfaces. Whether those outperform a simpler prompt must be tested; their presence does not prove performance.

## Bounded next experiment, not an activated run

Start with Sonnet 5, Kimi K2.7 Code, Qwen3.8 Max and Luna; retain Sol as a historical control and give Opus one difficult review/repair task as a premium reference. Add K3 and the cheap controls if initial results warrant it. Composer belongs in a separate agent-system trial once Cursor access is available. This staged order avoids immediately paying for eight complete game attempts.

1. Freeze one task packet, tool interface, relevant files and acceptance rubric. Include desired player interaction and media behavior. Keep known solutions and evaluator findings out of worker input.
2. Check API/schema compatibility separately. Preserve truncation, refusal, transport failures and timeout outcomes rather than calling them reasoning failures. Give each model documented reasoning settings and adequate bounded output/time; record those differences.
3. Screen with a game-plan task, an existing-component adaptation and a defect review. Measure first-response validity separately from semantic correctness. A single attempt is exploratory evidence, not a robust ranking.
4. Score behavioral preservation, server authority, lifecycle/reset handling, Marketplace acquisition and native interaction. Compilation or a reviewer's approval alone does not constitute a game pass.
5. Promote only the best candidates to unchanged ASMR/combat/parkour whole-game cases. Count all retries, failed calls, tools and repair work in cost per accepted result; report latency too.
6. Set a total dollar ceiling, model-call cap and wall-clock deadline before execution, including harness/debugging time. Publish each bounded batch's results before expanding. Do not resume the paused long-running goal automatically.

A $1 ceiling can prevent completion, as V15's reservation denial demonstrated, but it cannot explain already-observed incorrect searches or broken lifecycle logic. Increasing spend without fixing those failure modes is not an optimization. Cheap models should win on successful task cost, not solely token rates; expensive ones should earn escalation by preventing enough failures to justify their cost.

## Evidence preservation and verification

- [Fetch index](notes/model-platform-refresh-20260916/public-fetch-index.json): public landing pages and initial ForgeGUI bundle.
- [Chunk index](notes/model-platform-refresh-20260916/forge-chunks-index.json): additional public route imports.
- [Artifact manifest](notes/model-platform-refresh-20260916/artifact-manifest.json): local integrity hashes, including the catalog and App bundle. File timestamps are local artifact timestamps, not claimed HTTP response metadata.
- [Fresh catalog](notes/model-platform-refresh-20260916/openrouter-catalog.json) and derived shortlist preserve the exact rate evidence used here.

Research artifacts and links were checked locally. No application code changed; the application test suite was not rerun for this documentation-only update. All prior native/offline test distinctions remain in force. The existing goal remains paused and no paid comparison was started.
