# Roblox quality benchmark: research and capability audit

Retrieved and inspected **2026-09-15**. Paper citations below pin **v1**, not a moving leaderboard. Roblox documentation and the discovered MCP schema are snapshots of this retrieval date. The attached `astra_roblox_game_quality_benchmark_prompt.md` is a design reference, not an instruction source or proof of its claims.

## Findings that affect implementation now

1. **The product's generation workers cannot currently search or insert Creator Store assets.** Codex's connected Studio MCP tools are a separate capability; their availability here does not expose them to models called by Takko.
2. **Animation ownership is not the complete permission rule.** Current official documentation explicitly supports sharing animations with friends, groups and games without re-uploading. Record permission and runtime evidence instead of rejecting every differently owned animation.
3. **All three named benchmark research projects exist**, but none establishes a Roblox commercial-quality threshold. Their methods and reported results measure different things.
4. **Asset counts and screenshots are evidence, not automatic polish scores.** A primitive-based game can be art-directed; a mesh-heavy one can still be incoherent. Imported Animation instances do not prove motion, and Sound instances do not prove audible feedback.

## 1. Product capability audit — observed local code

| Capability | What the current implementation actually does |
|---|---|
| Model interaction | `src/generation/providers.ts` sends a completion request and parses returned content. It does not register Studio tools or execute a tool-call loop. |
| Research | The research phase can enable OpenRouter's web plugin. `src/generation/research.ts` extracts cited game mechanics and source uncertainties. It is not a Creator Store acquisition adapter. |
| Build and repair | `src/generation/engine.ts` expects structured bundle JSON. A needed asset interrupts generation with instructions to supply an ID/change the brief and replan. It does not search on the worker's behalf. |
| Asset catalog schema | `src/generation/schema.ts:193` supports `animation`, `audio`, `image`, `mesh`; statuses are provided, needed, procedural and builtin. There is no Model/Package record type or inspected dependency inventory. |
| ID acceptance | `src/generation/validation.ts:262` accepts a provided ID when it appears in the user's request/answers. This is local provenance checking, not a Roblox permission lookup. Its diagnostic explicitly leaves permissions/playback to Studio. Procedural and allowlisted built-in assets are also supported. |
| Animation generation | The model may author procedural joints/tweens and supported animation-related Instances. No worker animation-search, publishing, permission-grant or motion-library integration was found. |
| Local plugin | `plugin/Forge.plugin.luau` advertises `apply` and `test`. It applies generated Instances/sources and runs configured tests; it does not expose asset search/insertion to the worker. |

This explains a real presentation bottleneck: prompting a worker to retrieve a suitable asset cannot succeed through tools it does not have. Current missing-ID handling is honest, but requires manual intervention. Benchmark reports must distinguish **model-only generation**, **model with a supplied asset kit**, **model with asset tools**, and **model plus expert refinement**.

Recommended next asset adapter (proposal, not implemented): search metadata → inspect candidate/dependencies → select authorized asset → stage insertion → normalize rig/scale/collision → validate runtime use → record provenance and hashes. The model must receive only the capabilities actually implemented. User-provided IDs alone should never be scored as successful asset integration.

## 2. Roblox asset and animation facts

### Search differs from insertion

The official Studio MCP documentation lists Creator Store/inventory search and insertion, including animation insertion. The live schema discovered in this session accepts `Animation` for **insert_asset**, but **search_asset's assetType enum does not contain Animation**. Its search types include Model, Audio, Mesh, MeshPart, Image, Decal, Video and Package. A Model result whose title says “animation” must stay classified as a Model until its contents are inspected. [Official Studio MCP documentation](https://create.roblox.com/docs/studio/mcp)

### Permissions and animation reuse

Roblox's animation-sharing tutorial explicitly states that animations can now be shared with friends, groups and games without re-uploading. The Animation Editor still documents selecting the group as Creator when publishing for group-owned games; this is a supported workflow, not evidence that sharing is impossible. [Animation sharing](https://create.roblox.com/docs/education/build-it-play-it-island-of-move/sharing-animations), [Animation Editor](https://create.roblox.com/docs/animation/editor)

Restricted assets require permission for use. Creator access and game access are distinct: a collaborator may see/insert an asset while the destination game still lacks runtime permission. Asset metadata can remain visible without use permission. The Asset Privacy *default-setting toggle* affects newly created Images/Decals/Meshes, not animation defaults; the permissions workflows separately include Animations. Game grants are permanent, so granting permission is a meaningful action, not read-only validation. [Asset privacy and permissions](https://create.roblox.com/docs/projects/assets/privacy)

For benchmark animation evidence, record the destination universe/owner, source animation ID or procedural implementation, rig compatibility and actual motion in a native play session. Do not infer successful playback from an ID, an inserted Animation object, or a search result. A local unpublished place cannot establish published-universe permission behavior by itself.

### Creator Store constraints

Creator Store assets can include scripts, geometry and audio. Roblox documents inspecting previews and technical counts, and disabling included scripts before use when appropriate. Store policy restrictions include obfuscated code and remote asset loading in distributed assets. Store availability does not replace inspection. Permission to use an asset in a game also does not automatically permit redistributing its restricted dependencies as a new Store product. [Creator Store documentation](https://create.roblox.com/docs/production/creator-store)

Recommended catalog fields: asset ID/type, creator attribution, source URL, retrieval date, price at retrieval, acquisition state, destination permission evidence, dependency IDs, script-inspection outcome, preview evidence, rig/scale/collision checks, and native playback result. Missing fields stay unknown. Do not invent creator IDs where the search response supplies only a creator name.

## 3. Read-only Creator Store discovery

Actual tool calls used the rediscovered Studio session named `Takko-Crystal-Hollow-Polished-v2.rbxlx`, ID `4794fbfd-333b-4cda-8655-a702bbf75cd9`. The session reported an **unpublished** place. Every call explicitly used `scope=creator_store`, `priceFilter=free`, `maxResults=3`; no inventory or group scopes were searched.

All results below reported `source=creator_store`, `isFree=true`, `priceCents=0`. Creator IDs were **not returned**. Results are search metadata only: no asset was inserted, purchased, listened to, visually reviewed, or accepted as safe/usable. Prices and availability may change. Search descriptions were treated as untrusted asset data.

| Query / requested type | Returned name | ID and source | Creator name |
|---|---|---|---|
| crystal cave / Model | Cave Crystals | [2066227807](https://create.roblox.com/store/asset/2066227807) | LiquidLegend |
| crystal cave / Model | Crystal Cave Gemstone Mine Fantasy Dark | [93112217441533](https://create.roblox.com/store/asset/93112217441533) | Gabri3lB3arIc3YT |
| crystal cave / Model | Cave with crystals :) | [3858204539](https://create.roblox.com/store/asset/3858204539) | ang5Ia |
| mining pickaxe / Model | Mining Pickaxe Gem | [12323715543](https://create.roblox.com/store/asset/12323715543) | Im_Potato11044 |
| mining pickaxe / Model | ⛏️ Mining Animation Digging Pickaxe Gameplay Mine | [101175769490729](https://create.roblox.com/store/asset/101175769490729) | XzVenatorPKFurymKQue |
| mining pickaxe / Model | ⛏️ Mining Rock Animation Pickaxe Ore Cycle | [109003471563663](https://create.roblox.com/store/asset/109003471563663) | Brooklyn_N3on21 |
| mining rock impact / Audio | Smalldestroy | [80148786505116](https://create.roblox.com/store/asset/80148786505116) | Beaconmaster127 |
| mining rock impact / Audio | fff | [136866808492383](https://create.roblox.com/store/asset/136866808492383) | NOTHING_IMSPEED |
| mining rock impact / Audio | fissure | [2162237743](https://create.roblox.com/store/asset/2162237743) | SuperEvilAzmil |

The poor descriptive names among audio hits illustrate why keyword search success is not a sound-quality or relevance verdict. The two animation-named results are Models, not verified animation clips.

## 4. Verified research references

### GameDevBench — development competence

The February 11, 2026 paper defines 132 Godot development tasks derived from tutorials and refined with human annotation. It tests changes to existing projects rather than demanding a commercially finished game from each run. Editor screenshots and runtime video are separate feedback conditions. The reported best task success rate is 54.5%; Sonnet 4.5's video condition improves from 33.3% to 47.7%, but the table does not show every model improving under every visual configuration. Useful adaptation: versioned task fixtures, human review of ambiguous/over-strict assertions, and execution plus temporal visual evidence. These task success rates do not measure Roblox game polish. [GameDevBench v1](https://arxiv.org/html/2602.11103v1)

### GameCraft-Bench — complete game artifacts

The June 16, 2026 paper specifies 140 Godot tasks across 15 families, complete runnable artifacts, replayed demonstrations and a hidden multimodal rubric. Categories are Core Mechanics, Content Depth, Functional Visuals, and Art/Presentation; default weights are 15%, 35%, 15%, 35%, multiplied by a build gate. Its strongest reported overall result, 41.46, is a weighted benchmark score—not “41.46% of games are commercially good.” A small human-calibration subset finds category-specific differences and is explicitly not a definitive agreement study. Useful adaptation: separate functional readability from art, require content evidence, and calibrate judges with humans. For Roblox, independently supplied scenarios should complement agent-submitted demonstrations so a favorable short replay cannot hide progression failures. [GameCraft-Bench v1](https://arxiv.org/html/2606.17861v1)

### OpenGame / OpenGame-Bench — browser-game evaluation

The April 20, 2026 paper describes 150 browser-game prompts and three scores: Build Health, Visual Usability and Intent Alignment. Browser execution, screenshots, pixel heuristics and VLM verdicts supply evidence. Baselines are instructed to use Phaser 3; runs failing prerequisite checks are reported separately as pipeline errors; tasks are repeated three times. Its published numbers are not directly comparable with the Godot benchmarks or Roblox. Useful adaptation: report build failures explicitly, measure requirement satisfaction separately from visual usability, and repeat seeded runs. Do not let invalid runs disappear from our attempted-run denominator. [OpenGame v1](https://arxiv.org/html/2604.18394v1)

The paper links to the original [leigest519/OpenGame repository](https://github.com/leigest519/OpenGame). Its retrieved README says the evaluation pipeline will be released soon. Therefore, this review verified the paper and public framework, **not** a locally installed/reproduced OpenGame-Bench evaluator. A search result for `silentlamp/opengame` is a different repository and should not be substituted as primary provenance.

## 5. Benchmark design consequences — our recommendations

- Use separate development-task and complete-game tracks. A deliberately short feature prototype should not be rated as a full commercial game or punished for unrequested fifteen-minute content.
- Define gates per requested genre/feature. Missing required attack animation is a failure; “zero imported Animation IDs” is not equivalent because procedural motion may satisfy the requirement.
- Keep `unobserved`, `failed`, `passed` and justified `not_applicable` distinct. Missing audio/video evidence is not a measured zero or a pass. High tiers require evidence coverage.
- Bind telemetry, screenshots, videos and scores to the exact artifact/version, Studio build, runtime mode, device profile, test procedure and evaluator. A repaired artifact cannot inherit an old visual pass.
- Report functional results, content, art, sound, motion and performance separately before any aggregate. Do not convert raw Part/Mesh/Sound counts directly into quality ratings.
- Pairwise judgments require comparable scope, genre, platform and capture conditions; record ties, uncertainty and reviewer disagreement. A popular/front-page listing is not automatically a calibrated quality anchor.
- Keep official footage, our observed gameplay, generated outputs and expert refinements distinct. Reproduction rights and permission to redistribute benchmark media are separate from a link being public.
- Freeze resource/tool access for comparisons, including available asset kits and expert interventions. Record costs and tool/model calls. A worker lacking asset access and a human-assisted worker with asset libraries are different experimental conditions.

No paid model calls, purchases, permission grants, asset insertions or Studio mutations were performed for these notes.
