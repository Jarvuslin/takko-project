# Worker models and game specialization

Checked 2026-09-15 against primary model pages and paper abstracts. This is a bounded research follow-up to the user's proposed model shortlist, not a paid model evaluation, full paper reproduction or codebase audit.

## Decision

Continue with a capable planner, bounded coding workers, Roblox-specific context and tools, executable observations, protected scenarios and escalation. Select workers by cost per successfully verified task, not token price alone. Treat the influence of the surrounding system as a hypothesis to measure against the same model with a simpler baseline.

Lemonade's visible model labels support investigating this design, but do not establish its actual backend routing, internal models, task mix, prices, quality or frequency of frontier-model escalation. The lineup in this user message is user-supplied; no new authenticated Lemonade session was inspected for this note.

## What the game research supports

| Reference | Supported observation | Adaptation for Forge and limit |
| --- | --- | --- |
| [OpenGame / GameCoder-27B](https://arxiv.org/abs/2604.18394) | Paper describes end-to-end web-game generation, reusable scaffold/debug skills, game-specialized training and execution-grounded RL. Its evaluation combines build health, visual usability and intent alignment across 150 prompts. | Use engine-specific scaffolds and verified debugging procedures. This is web-game evidence, not a Luau/Roblox result. Do not assume model weights, full evaluation tooling or deployment support are available without a separate artifact check. |
| [GameGPT](https://arxiv.org/abs/2310.08067) | Describes layered multi-agent collaboration and methods to reduce hallucination and redundant development work. | Explicit responsibilities and shared contracts are useful. Multiple role prompts alone do not demonstrate lower cost or better games. |
| [GameCWM distillation](https://arxiv.org/abs/2605.24375) | Studies Python implementations of game rules, actions, transitions, observations and rewards, using 30 games and Qwen2.5-3B-Instruct with SFT and RLVR. | Supports later training on verifiable state-transition tasks. It does not establish generation of complete 3D Roblox games, assets, multiplayer or Studio operations. |
| [Microsoft Muse / WHAM](https://www.microsoft.com/en-us/research/blog/introducing-muse-our-first-generative-ai-model-designed-for-gameplay-ideation/) | Generates gameplay visuals and actions for ideation. | Potential future visual exploration reference. Generated frames are not an editable DataModel or Luau implementation. |
| [GameGen-X](https://arxiv.org/abs/2411.00769) | Interactive open-world game-video generation. | Keep separate from engine project authoring. Direct guessed Tencent repository URLs for GameGen-X/O did not load; GameGen-O artifact availability was not independently established in this pass. |
| [GenerationService](https://create.roblox.com/docs/reference/engine/classes/GenerationService/GenerateModelAsync) and [Studio MCP](https://create.roblox.com/docs/studio/mcp) | Roblox documents native object generation and an interface through which external AI clients can interact with Studio. | Separate asset generation from script/scene authoring and execution. Check capabilities, permissions, installed version and actual behavior before relying on a particular operation. Neither interface guarantees that a generated game works. |

These are claims and capabilities described by their authors. They have not been reproduced in Forge.

## Candidate verification

This table confirms source-backed identities and relevant caveats. It does not rank their Roblox quality, establish comparable throughput, or guarantee access through a particular account/provider.

| Candidate | Primary source and caveat |
| --- | --- |
| MiMo-V2.5 / Pro | [Xiaomi's model family](https://mimo.mi.com/) and [release notice](https://mimo.mi.com/docs/en-US/news/latest/v2.5-open-sourced) identify both. Low API prices do not imply a small local model: Xiaomi describes Pro as 1T total / 42B active parameters. |
| DeepSeek V4 Flash | [Official V4 release](https://deepseek.com/en/news/v4-preview/) documents it; [V4.1-Flash release](https://api-docs.deepseek.com/news/news260910/) is dated September 10, 2026. Pin the actual candidate/version at evaluation time instead of assuming V4 is the newest Flash option. |
| GLM-5.3-Flash | [Publisher model card](https://huggingface.co/zai-org/GLM-5.3-Flash). A concrete candidate; determine provider, reasoning mode and current rates before comparison. |
| Qwen3 Coder variants | [Qwen3-Coder-Next announcement](https://qwen.ai/blog?id=qwen3-coder-next). Choose an exact checkpoint/provider, not the family name alone. |
| MiniMax M2.5 / M3 | [M3 release](https://www.minimax.io/blog/minimax-m3) and [model page](https://www.minimax.io/models/text/m3) establish API availability. The model page describes future source release despite open-weight positioning; inspect actual released artifacts before assuming local deployment. M2.5 was not separately re-audited here. |
| Nemotron 3 Ultra | [NVIDIA research page](https://research.nvidia.com/labs/nemotron/Nemotron-3-Ultra/) identifies 550B total / 55B active parameters. Throughput claims are tied to hardware/workload; this is not a small desktop worker. |
| Tencent Hy4 | [Tencent announcement](https://www.tencent.com/tencent-releases-and-open-sources-tencent-hy4-preview/) identifies Hy4 **preview**, 770B total / 49B active, with API routes. Preserve preview status and pin actual service identity. |
| Gemini Flash | [Gemini 3.7 Flash documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3.7-flash) identifies a concrete model. Compare supported image/tool behavior, latency and reasoning settings on our tasks. |
| GPT Luna | [GPT-5.6 Luna documentation](https://developers.openai.com/api/docs/models/gpt-5.6-luna) positions it for cost-sensitive workloads. No Forge worker-quality result exists for it yet. |
| Composer 2.5 | [Cursor's Composer page](https://cursor.com/composer) documents the model and Cursor/SDK availability. Do not assume it is an interchangeable unrestricted API endpoint for our backend. Its appearance in another product's UI does not reveal that product's actual integration. |

No price matrix is committed as routing truth. Provider markups, cache behavior, reasoning/output consumption, retries, context tiers and concurrency can change effective task cost. Large mixture-of-experts models may activate relatively few parameters per token while still requiring substantial memory for all weights.

## Immediate generation experiment

Use a small, reproducible evaluation before widening the model list:

1. Keep the planner, approved brief, assets, tool permissions and acceptance scenarios fixed. Compare three available cheap workers plus one stronger baseline on the same tasks. This isolates worker quality; a separate comparison can vary planners.
2. Include several game genres and both fresh generation and repair tasks: a collectible loop, an obby checkpoint/respawn, shop purchase validation, multiplayer ownership and a HUD update. Use small playable slices with specific observable outcomes rather than broad requests for an entire polished game.
3. Run format/scene/compiler checks first. Then apply to an identified disposable Studio place, exercise independent server/client scenarios, capture actual state/logs/screenshots, and verify required transitions. A pretty screenshot is not proof of the core loop.
4. Preserve an untouched baseline and hidden regression scenarios. Evaluate no feedback versus the same worker with bounded observation/repair. Include failures, retries, timeouts and escalations in the denominator and total cost.
5. Report success count and confidence limits, requirement fidelity, native scenario pass rate, regression rate, tool-error rate, model/tool latency, total tokens, and total cost divided by verified successes. If none pass, this last metric is undefined rather than zero.
6. Escalate after a bounded failed correction/repair or an identified cross-system design failure. Static tools should handle deterministic formatting/compilation rather than consuming a specialist-agent call. Parallelize independent preparation; serialize writes to a Studio session.

Start with the providers already supported by Forge and exact catalog IDs available to the user's account. The proposed three-worker budget and model selection are not an authorization to buy subscriptions, provision GPUs or run paid comparisons in this research turn.

## Training later

First collect reproducible trajectories: approved requirements, versioned context, proposed patch, tool calls/results, compiler/runtime failures, corrected patch, artifact hashes, independent scenario outcomes and human acceptance. Remove secrets and separate reusable training records from held-out evaluation projects. Retain failed attempts as well as successes so diagnosis can be learned without mislabeling rejected patches as targets.

Fine-tuning should follow a reliable evaluator and sufficient examples. Reward game-state correctness, lifecycle/multiplayer behavior, preserved user intent and absence of regressions. Compilation alone is an easily exploited reward; model-written tests alone can reward weak or self-confirming behavior. Evaluate a trained model against the same base model using the same tools and budget, with an untouched held-out task set.

## Current Forge distinction

Forge already has per-phase model routing, dependency context, task compilation, scene ownership guards, protected test catalogs, durable plugin dispatch and bounded repair. It is still largely a structured bundle-generation pipeline; it does not yet implement the entire autonomous inspect/play/observe/repair architecture proposed here. Native scenario evaluation and observation-driven model escalation remain priorities. Prior native Studio evidence applies to its recorded fixtures, not every current generated project.

No application code, model configuration, credentials or installed plugin were changed by this note. No paid model calls, training, GPU provisioning or native Studio mutations occurred. Automated application tests were not rerun for this documentation-only change.
