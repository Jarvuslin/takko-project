# Next model tests and competitor architecture — 2026-09-16

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
