import { expect, it } from "vitest";
import { complete, ProviderError } from "../src/generation/providers";
import { profile } from "./generation-fixtures";

it.each([
  ["openrouter", "anthropic/claude-sonnet-5", undefined, undefined],
  ["openrouter", "anthropic/claude-sonnet-5", "medium", "medium"],
  ["openrouter", "other/model", undefined, undefined],
  ["compatible", "anthropic/claude-sonnet-5", "high", undefined],
] as const)(
  "preserves provider reasoning defaults and explicit OpenRouter effort: %s %s %s",
  async (provider, model, reasoningEffort, expected) => {
    let sent: any;
    await complete(
      { ...profile(provider), model, maxOutputTokens: 8192, reasoningEffort },
      "",
      "system",
      "user",
      new AbortController().signal,
      (async (_url, init) => {
        sent = JSON.parse(String(init?.body));
        return Response.json({
          choices: [{ finish_reason: "stop", message: { content: "{}" } }],
          usage: { prompt_tokens: 1, completion_tokens: 2 },
        });
      }) as typeof fetch,
    );
    expect(sent.max_tokens).toBe(8192);
    expect(sent.reasoning?.effort).toBe(expected);
    if (expected === undefined) expect(sent).not.toHaveProperty("reasoning");
  },
);

it.each(["openrouter", "openai", "gemini", "anthropic"] as const)(
  "preserves billing and actionable truncation details for %s",
  async (provider) => {
    let calls = 0;
    const response = {
      choices: [{ finish_reason: "length", message: { content: "" } }],
      status: "incomplete",
      incomplete_details: { reason: "max_output_tokens" },
      output: [],
      stop_reason: "max_tokens",
      content: [],
      candidates: [{ finishReason: "MAX_TOKENS", content: { parts: [] } }],
      usageMetadata: {
        promptTokenCount: 12,
        candidatesTokenCount: 0,
        thoughtsTokenCount: 8192,
      },
      usage: {
        input_tokens: 12,
        prompt_tokens: 12,
        output_tokens: 8192,
        completion_tokens: 8192,
        cost: 0.02,
        completion_tokens_details: { reasoning_tokens: 8192 },
      },
    };
    const error = await complete(
      { ...profile(provider), maxOutputTokens: 8192 },
      "",
      "system",
      "user",
      new AbortController().signal,
      (async () => {
        calls++;
        return Response.json(response);
      }) as typeof fetch,
    ).catch((e) => e);
    expect(error).toBeInstanceOf(ProviderError);
    expect(error.message).toContain("8,192-token reply limit");
    expect(error.message).toContain("No answer text was returned");
    expect(error.completion.outputTokens).toBe(8192);
    expect(error.completion.reasoningTokens).toBe(8192);
    if (provider === "openrouter")
      expect(error.completion.costMicros).toBe(20000);
    expect(calls).toBe(1);
  },
);
