# Qwen and Kimi failure attribution — 2026-09-16

Read-only follow-up to the [four-model screen](results/model-screen-20260916/RESULTS.md). No paid calls, code changes or Studio operations. Compared official documentation with retained catalog metadata, raw requests/responses and current Takko transport code.

## Attribution

**Qwen: an observed model-generated API error, not a demonstrated Takko transport bug.** The Alibaba-hosted `qwen/qwen3.8-max-0902` response completed normally with `finish_reason=stop`: 5,836 output tokens, including 4,684 reasoning tokens, below the 8,000 cap. The unchanged returned code calls `Clone()` on a Vector3. Roblox's datatype reference provides no such method, and native execution confirmed the failure. [Roblox Vector3 reference](https://create.roblox.com/docs/reference/engine/datatypes/Vector3).

Qwen's official descriptions emphasize coding and environment feedback; they do not establish a specific Roblox/Luau deficiency. General coding claims are not evidence of reliable use of every niche API. The official open-series repository discusses adjustable effort, but that repository is not necessarily identical to the hosted 0902 snapshot. Our saved snapshot metadata explicitly lists low effort as supported. There is no evidence the response was truncated. [Official Qwen model listing](https://chat.qwen.ai/legal-agreement/models), [Qwen repository](https://github.com/QwenLM/Qwen3.8).

The test was deliberately one-shot, with no documentation tool calls or repair turn. That excludes the model's ability to recover after seeing the runtime error. Do not generalize one coding mistake into a model-wide weakness or claim that the complete Takko agent failed this task; the screen used its own direct API controller.

**Kimi: a documented thinking-only model met an inadequately verified test configuration.** Its raw response came from Novita, contained no final content and ended with `finish_reason=length`; 7,999 of its 8,000 output tokens were reasoning. This is output exhaustion, not a JSON parser failure, timeout or lost final answer.

Kimi's official documentation states that K2.7 Code always thinks and does not support instant/non-thinking mode. The model card recommends temperature 1.0 and top-p 0.95 and requires reasoning preservation in multi-turn usage. It does not prescribe an 8,000-token minimum or guarantee that any larger allowance completes a task. Its examples use varying limits for simpler requests. [Official model card](https://huggingface.co/moonshotai/Kimi-K2.7-Code), [Kimi explanation](https://www.kimi.com/resources/kimi-k2-7-code).

The retained OpenRouter catalog already contained `reasoning: {mandatory: true, default_enabled: true}` for Kimi, with **no advertised supported_efforts field**. Nevertheless, the screen sent `reasoning: {effort: "low"}` to every model. OpenRouter says omitted effort metadata means effort selection is not exposed. Its default provider routing can also accept providers that ignore unsupported parameters. Our request did not require parameter support or pin a provider. [Reasoning controls](https://openrouter.ai/docs/guides/best-practices/reasoning-tokens), [Provider routing](https://openrouter.ai/docs/guides/routing/provider-selection).

I should have inspected that metadata before dispatch. We cannot prove the exact gateway/Novita treatment of `low` from the response alone, but we had no basis for treating it as an effective reasoning cap. This makes the result unsuitable for judging Kimi's coding quality. It remains valid evidence that this particular fixed-budget configuration yielded no usable answer. Never disable thinking and assume the same model will run: Kimi Code documents fallback to another model for such requests.

## What this means for Takko

Current `src/generation/providers.ts` sends the OpenRouter output limit and optional JSON mode, but exposes no model-specific reasoning configuration in that request path. `src/generation/schema.ts` provides a generic output limit (default 8,192, maximum 32,768). The transport already recognizes `finish_reason=length` as truncation; it does not silently accept an empty answer as success. These are implementation observations, not a fresh live-app integration test.

The test-specific `low` setting was in `.forge/model-screen-20260916.mjs`, not the production transport. Therefore distinguish a **benchmark configuration error** from the app's **missing model-specific capability/budget controls**. The latter should be addressed before interpreting broad model comparisons.

Recommended changes, not implemented here:

1. Discover and validate reasoning controls per model and selected provider; avoid universal settings. Parameter-support routing helps, but does not itself guarantee a hard reasoning-token cap.
2. Budget reasoning and final output together, using provider-specific pricing and bounded task size. A higher output ceiling is a maximum allowance, not a promise to spend it or finish successfully.
3. Classify truncation, transport, parse, API/runtime and behavioral failures separately.
4. Give candidates a bounded documentation/runtime-feedback repair stage when evaluating an agent, while keeping first-attempt scores separate.
5. For Kimi multi-turn tool workflows, preserve reasoning fields as documented; this was not the cause of the single-turn failure.

No evidence found in the reviewed official sources establishes a specific Roblox deficit for either model. Qwen's local error is concrete; Kimi's local coding capability remains unmeasured. Previous inference receipts, raw answers and native results are preserved unchanged.
