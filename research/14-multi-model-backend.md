# Lemonade.gg: multi-model evidence and Forge implementation

Research date: 2026-09-13. This refers to the Roblox product, not the unrelated lemonade-sdk inference server.

## What the public evidence establishes

[Lemonade's official homepage](https://lemonade.gg/) presents creation across multiple game types. [OpenRouter's Lemonade app page](https://openrouter.ai/apps/lemonade) attributes usage across multiple models to the Roblox product. Its rolling counts changed between search snippets and the fetched page; exact counts should not be treated as architecture. This establishes multi-model usage, not a particular routing algorithm.

Neither source exposes private routing criteria, which models plan versus write code, internal prompts, per-task spend, or user-supplied API-key storage. We have not obtained Lemonade's backend repository or authenticated generation history. Forge's phase router and key handling are our implementation choices, not a recovered copy of Lemonade's backend.

The previously inspected plugin snapshot (manifest 2.2.4) already includes execution, playtesting and screenshot-related handlers. Those are shipped-code observations; they do not establish frequency or production quality. We did not modify or incorporate that third-party plugin into Forge.

## Applicable API contracts

- [OpenRouter unified API](https://openrouter.ai/docs/api_reference/overview): use a shared chat-completion interface for provider models. The models catalog exposes pricing metadata; Forge lets users select models and keeps fallback routes explicit.
- [OpenAI text generation](https://developers.openai.com/api/docs/guides/text): Forge uses Responses with model, instructions, input and an output limit, with storage disabled. JSON mode can be disabled for incompatible models.
- [Anthropic Messages](https://platform.claude.com/docs/en/api/messages/create): a distinct adapter handles top-level system text, message blocks, authentication and usage.
- [Gemini generateContent](https://ai.google.dev/api/generate-content): a distinct adapter handles contents, system instruction, generation configuration and usage metadata.
- Screenshots use native image content formats documented by [OpenAI](https://developers.openai.com/api/docs/guides/images-vision), [Anthropic](https://platform.claude.com/docs/en/build-with-claude/vision), and [Google](https://ai.google.dev/gemini-api/docs/image-understanding). The selected model must support image input. Forge does not silently omit an image when a text-only model rejects it.
- [ScriptEditorService](https://create.roblox.com/docs/reference/engine/classes/ScriptEditorService) documents source updates from plugins; [StudioTestService](https://create.roblox.com/docs/reference/engine/classes/StudioTestService) documents programmatic play-mode execution and returned test values. These support the original Forge plugin design, pending live verification.

## Cost and quality implications

Routing is only one part of the improvement. Forge now preserves the original request, compiles clarification into requirements, decomposes owned tasks, limits builder source context to declared dependencies, validates source and asset provenance, protects reviewer tests during repair, and accepts actual runtime/screenshot observations. These changes remove known v0.1 bottlenecks. Their effect on model success rate and cost per accepted game remains unmeasured.

Evaluate a cheap-only route, a mixed route, and a stronger-model route with the same prompts, tool access, acceptance tests and human visual review. Record all retries, failed runs and configured-rate costs. A successful request pipeline test cannot establish artistic quality or cheap-model parity.
