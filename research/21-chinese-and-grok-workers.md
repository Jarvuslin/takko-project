# Chinese models and Grok for Takko

Checked 2026-09-15. Research only: no model calls, app routing changes, credential access or Studio actions. Current public OpenRouter metadata is preserved in `notes/chinese-grok-catalog-20260915.json`. Listing is not proof of successful inference, individual endpoint capabilities, or Roblox quality.

## Recommendation

First compare MiniMax M3, MiMo V2.5 Pro and Grok Build 0.1 against the existing GPT-4.1 mini builder. Keep the planner, reviewer, brief, tools and repair allowance fixed. This is a test-priority recommendation based on documented coding focus, availability and price, not a measured quality ranking. Second wave: DeepSeek V4.1 Flash, GLM 5.3 Flash, Qwen3 Coder Next and Kimi K2.7 Code. MiMo V2.5 deserves a separate ASMR listening evaluation against a fixed audio-capable Gemini model.

## Candidate snapshot

USD per million uncached input/output tokens. OpenRouter advertised base rates at retrieval; actual provider, context tier, cache, reasoning, tools and retries can change cost. No subscription pricing is treated as an unrestricted production API license.

| Exact OpenRouter ID | Input / output | Proposed role and qualification |
| --- | --- | --- |
| `minimax/minimax-m3` | $0.30 / $1.20 | First general builder/repair candidate. Publisher emphasizes coding, tools and long tasks; catalog lists text/image/video inputs. No audio listed. |
| `xiaomi/mimo-v2.5-pro` | $0.435 / $0.87 | Complex coding/planning candidate; catalog lists text only. Prior base V2.5 timeout does not establish Pro quality. |
| `xiaomi/mimo-v2.5` | $0.14 / $0.28 | Cheap worker and potential audiovisual evaluator. Catalog lists text/image/audio/video; actual ASMR listening remains untested. |
| `deepseek/deepseek-v4.1-flash` | $0.15 / $0.60 | Cheap coding/repair challenger. Catalog lists text/image. Pin version; do not infer identity from a moving Pro/latest alias. |
| `z-ai/glm-5.3-flash` | $0.075 / $0.25 | Very cheap multimodal challenger; verify endpoint behavior before promotion. Catalog lists text/image/video. |
| `qwen/qwen3-coder-next` | $0.12 / $0.80 | Focused text-only Luau worker. Already saved in Takko but not routed. Endpoint differences matter. |
| `moonshotai/kimi-k2.7-code` | $0.71 / $3.50 | Longer coding/repair candidate; thinking-only behavior requires output-budget testing. |
| `x-ai/grok-build-0.1` | $1.00 / $2.00 | Coding-focused Grok challenger with image input, tools and structured outputs; listing describes early access. |
| `x-ai/grok-4.6` | $2.00 / $6.00 | Higher-cost planner/reviewer or difficult repair comparison; not the cheapest repetitive worker. |
| `moonshotai/kimi-k3` | approximately $2.65 / $13.28 | Premium comparison if cheaper workers plateau. Chinese origin does not imply low price. |

Primary references: [MiniMax pricing](https://platform.minimax.io/docs/guides/pricing-paygo), [M3 capabilities](https://www.minimax.io/models/text/m3), [MiMo pricing](https://mimo.mi.com/docs/en-US/price/pay-as-you-go), [MiMo capability distinction](https://mimo.mi.com/docs/en-US/news/latest/v2.5-news), [DeepSeek listing](https://openrouter.ai/deepseek/deepseek-v4.1-flash), [GLM listing](https://openrouter.ai/z-ai/glm-5.3-flash), [Kimi coding API](https://www.kimi.com/resources/kimi-k2-7-code), [Kimi listing](https://openrouter.ai/moonshotai/kimi-k2.7-code), [Grok Build listing](https://openrouter.ai/x-ai/grok-build-0.1), [Grok models](https://docs.x.ai/developers/models).

## Findings that affect integration

- [Alibaba's Qwen3-Coder-Next endpoint](https://www.alibabacloud.com/help/en/model-studio/qwen3-coder-next) lists function calling and structured outputs as unsupported, while OpenRouter's aggregate catalog lists tools and response formats. This is an endpoint discrepancy, not proof the model cannot use tools. Takko currently requests JSON objects and validates them itself; smoke-test its exact route.
- [Kimi K2.7 Code](https://www.kimi.com/resources/kimi-k2-7-code) requires thinking. Takko currently does not explicitly configure reasoning effort in its provider body. Large hidden reasoning/output consumption or truncation must be counted, not confused with model coding ability. Kimi Code subscription aliases can map to different models than the pay-as-you-go ID.
- [Grok retirement notice](https://docs.x.ai/developers/migration/may-15-retirement) retires Code Fast 1 and older Fast variants. Its general redirect text and coding-specific table differ on the destination. Avoid old slugs; select explicit Build/4.6 IDs and retain the actual response identity.
- DeepSeek's indexed [change log](https://api-docs.deepseek.com/updates/) says the direct Pro alias is temporarily routed to V4.1 Flash after September 14. Full change-log/release fetches timed out in this pass; this is indexed-source evidence, and must not be generalized to every reseller's pinned model.
- The accessible [GLM announcement](https://autoclaw.z.ai/blog/model/glm-5.3-flash/) carries September 16, later than this workspace's September 15 date. Preserve that discrepancy; rely on the observed current catalog only for listing/pricing, not a precise release-history conclusion.
- Native multimodal support does not prove audio support. MiMo Pro, M3, GLM Flash and Grok entries do not list audio input. Speech transcription or a separate voice API cannot judge crunch timbre automatically. MiMo V2.5's listed audio support still needs real WAV/semantic tests through Takko.

## Lemonade comparison

The user's observation that Lemonade Pro offers Composer 2.5 and Gemini 3.7 Flash remains user-supplied; no authenticated Lemonade routing was inspected. [Cursor](https://cursor.com/composer) lists Composer 2.5 at $0.50/$2.50 and targets agentic coding. It also states Composer 2 was developed from Kimi K2.5 with further training; this is not proof that stock Kimi equals Composer 2.5. [Google](https://ai.google.dev/gemini-api/docs/models/gemini-3.7-flash) documents image/video/audio input, function calling and structured outputs. These support the suitability of coding plus multimodal roles, without proving Lemonade's internal role assignments.

## Benchmark protocol

Run identical bounded Luau and asset tasks, with three repetitions per candidate before broader claims. Measure valid outputs, compile success, native gameplay assertions, asset rejection/retry correctness, audiovisual evidence, latency, actual billed cost and cost per verified success. Include invalid asset IDs, broken imports and missing audio so abstention/failure behavior is tested. No manual Astra rescue, self-granted quality pass or replacement of failed outputs. Keep evaluator fixed during builder comparisons. First test API compatibility; after that freeze settings and run the scored trials. The selected model's million-token context is not a reason to load the whole project.

Application code was not modified. No `npm run check` was necessary for this research-only note.
