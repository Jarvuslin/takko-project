import { describe, it, expect } from "vitest";
import {
  complete,
  ProviderError,
  modelCatalog,
} from "../src/generation/providers";
import { profile } from "./generation-fixtures";
describe("native provider protocols", () => {
  it.each([
    ["anthropic", "image/jpeg"],
    ["anthropic", "image/webp"],
    ["gemini", "image/jpeg"],
    ["gemini", "image/webp"],
  ] as const)(
    "preserves %s native capture MIME and bytes for %s instead of relabeling it PNG",
    async (kind, mime) => {
      // Provider serialization only: image decoding and native capture provenance are separate checks.
      const bytes =
        mime === "image/jpeg"
          ? Buffer.from([
              255, 216, 255, 224, 0, 16, 74, 70, 73, 70, 0, 255, 217,
            ])
          : Buffer.from(
              "RIFF\u0016\u0000\u0000\u0000WEBPVP8 fixture",
              "binary",
            );
      const encoded = bytes.toString("base64"),
        image = `data:${mime};base64,${encoded}`;
      let sent: any;
      const transport = (async (_url, init) => {
        sent = JSON.parse(String(init?.body));
        return Response.json(
          kind === "anthropic"
            ? {
                content: [{ type: "text", text: "{}" }],
                stop_reason: "end_turn",
                usage: { input_tokens: 2, output_tokens: 3 },
              }
            : {
                candidates: [
                  {
                    finishReason: "STOP",
                    content: { parts: [{ text: "{}" }] },
                  },
                ],
                usageMetadata: { promptTokenCount: 2, candidatesTokenCount: 3 },
              },
        );
      }) as typeof fetch;
      const result = await complete(
        profile(kind),
        "session-only-key",
        "Evaluate native asset capture",
        "Judge the actual captured placement",
        new AbortController().signal,
        transport,
        image,
      );
      expect(result.text).toBe("{}");
      if (kind === "anthropic") {
        expect(sent.messages[0].content[0]).toEqual({
          type: "image",
          source: { type: "base64", media_type: mime, data: encoded },
        });
        expect(sent.messages[0].content[1]).toEqual({
          type: "text",
          text: "Judge the actual captured placement",
        });
      } else {
        expect(sent.contents[0].parts[0]).toEqual({
          inlineData: { mimeType: mime, data: encoded },
        });
        expect(sent.contents[0].parts[1]).toEqual({
          text: "Judge the actual captured placement",
        });
      }
      expect(JSON.stringify(sent)).not.toContain("image/png");
      expect(JSON.stringify(sent)).not.toContain("session-only-key");
    },
  );
  it.each(["TimeoutError", "AbortError"])(
    "classifies an aborted request with reason %s",
    async (name) => {
      const signal = AbortSignal.abort(new DOMException("aborted", name));
      const transport = (async () => {
        throw signal.reason;
      }) as typeof fetch;
      const error = await complete(
        profile(),
        "",
        "JSON",
        "test",
        signal,
        transport,
      ).catch((e) => e);
      expect(error).toBeInstanceOf(ProviderError);
      expect(error.retryable).toBe(name === "TimeoutError");
    },
  );
  it("preserves the provider-reported cost of truncated OpenRouter output", async () => {
    const transport = (async () =>
      Response.json({
        choices: [
          { message: { content: '{"partial":' }, finish_reason: "length" },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, cost: 0.001234 },
      })) as typeof fetch;
    const error = await complete(
      profile("openrouter"),
      "",
      "JSON",
      "test",
      new AbortController().signal,
      transport,
    ).catch((e) => e);
    expect(error).toBeInstanceOf(ProviderError);
    expect(error.completion.costMicros).toBe(1234);
    expect(error.message).toContain("truncated");
  });
  it.each([64, 0, undefined, -1, 101, 1.5, "64"])(
    "retains valid reported cache usage without changing billing: %s",
    async (cached) => {
      const result = await complete(
        profile("openrouter"),
        "",
        "JSON",
        "test",
        new AbortController().signal,
        (async () =>
          Response.json({
            choices: [{ message: { content: "{}" }, finish_reason: "stop" }],
            usage: {
              prompt_tokens: 100,
              completion_tokens: 10,
              cost: 0.001234,
              prompt_tokens_details: { cached_tokens: cached },
            },
          })) as typeof fetch,
      );
      expect(result.costMicros).toBe(1234);
      expect(result.inputTokens).toBe(100);
      if (cached === 64 || cached === 0)
        expect(result.cachedInputTokens).toBe(cached);
      else expect(result).not.toHaveProperty("cachedInputTokens");
    },
  );
  it("retains cache evidence even when completion is truncated", async () => {
    const error = await complete(
      profile("openrouter"),
      "",
      "JSON",
      "test",
      new AbortController().signal,
      (async () =>
        Response.json({
          choices: [{ message: { content: "{" }, finish_reason: "length" }],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 10,
            prompt_tokens_details: { cached_tokens: 80 },
          },
        })) as typeof fetch,
    ).catch((e) => e);
    expect(error.completion.cachedInputTokens).toBe(80);
  });
  it("retains OpenRouter provider-reported billing rather than only catalog estimates", async () => {
    const result = await complete(
      profile("openrouter"),
      "",
      "JSON",
      "test",
      new AbortController().signal,
      (async () =>
        Response.json({
          choices: [{ message: { content: "{}" }, finish_reason: "stop" }],
          usage: { prompt_tokens: 100, completion_tokens: 100, cost: 0.001234 },
        })) as typeof fetch,
    );
    expect(result.costMicros).toBe(1234);
  });
  for (const kind of [
    "openrouter",
    "openai",
    "anthropic",
    "gemini",
    "compatible",
  ] as const)
    it("speaks the " + kind + " API and extracts usage", async () => {
      const p = profile(kind);
      let sent: any;
      let target = "";
      let headers: any;
      const transport = (async (url, init) => {
        target = String(url);
        sent = JSON.parse(String(init?.body));
        headers = init?.headers;
        return Response.json(
          kind === "anthropic"
            ? {
                content: [{ type: "text", text: "{}" }],
                stop_reason: "end_turn",
                usage: { input_tokens: 2, output_tokens: 3 },
              }
            : kind === "gemini"
              ? {
                  candidates: [
                    {
                      finishReason: "STOP",
                      content: { parts: [{ text: "{}" }] },
                    },
                  ],
                  usageMetadata: {
                    promptTokenCount: 2,
                    candidatesTokenCount: 2,
                    thoughtsTokenCount: 1,
                  },
                }
              : kind === "openai"
                ? {
                    status: "completed",
                    output: [
                      { content: [{ type: "output_text", text: "{}" }] },
                    ],
                    usage: { input_tokens: 2, output_tokens: 3 },
                  }
                : {
                    choices: [
                      { message: { content: "{}" }, finish_reason: "stop" },
                    ],
                    usage: { prompt_tokens: 2, completion_tokens: 3 },
                  },
        );
      }) as typeof fetch;
      const r = await complete(
        p,
        "secret",
        "system JSON",
        "user",
        new AbortController().signal,
        transport,
      );
      expect(r).toEqual({
        text: "{}",
        inputTokens: 2,
        outputTokens: 3,
        ...(kind === "gemini" ? { reasoningTokens: 1 } : {}),
      });
      expect(JSON.stringify(sent)).not.toContain("secret");
      if (kind === "openai") {
        expect(target).toMatch(/\/responses$/);
        expect(sent.store).toBe(false);
        expect(sent.instructions).toBe("system JSON");
      } else if (kind === "anthropic") {
        expect(headers["x-api-key"]).toBe("secret");
        expect(sent.max_tokens).toBe(2048);
      } else if (kind === "gemini") {
        expect(target).toContain(":generateContent");
        expect(headers["x-goog-api-key"]).toBe("secret");
      } else {
        expect(target).toMatch(/chat\/completions$/);
        expect(sent.messages[1].content).toBe("user");
      }
    });
  it("redacts provider error bodies and retries only transient HTTP failures", async () => {
    for (const status of [401, 429, 500])
      try {
        await complete(
          profile(),
          "key",
          "JSON",
          "x",
          new AbortController().signal,
          (async () => new Response("leaked-key", { status })) as typeof fetch,
        );
        throw Error("expected failure");
      } catch (e) {
        expect(e).toBeInstanceOf(ProviderError);
        expect((e as Error).message).not.toContain("leaked-key");
        expect((e as ProviderError).retryable).toBe(status !== 401);
      }
  });
  it("rejects truncation and accounts missing usage as unknown", async () => {
    const transport = (async () =>
      Response.json({
        choices: [{ message: { content: "{}" }, finish_reason: "length" }],
      })) as typeof fetch;
    await expect(
      complete(
        profile(),
        "",
        "JSON",
        "x",
        new AbortController().signal,
        transport,
      ),
    ).rejects.toThrow("truncated");
    const r = await complete(
      profile(),
      "",
      "JSON",
      "x",
      new AbortController().signal,
      (async () =>
        Response.json({
          choices: [{ message: { content: "{}" } }],
        })) as typeof fetch,
    );
    expect(r.inputTokens).toBeNull();
  });
  it("normalizes OpenRouter catalog prices into configured USD per million tokens", async () => {
    const result = await modelCatalog(profile(), "x", (async () =>
      Response.json({
        data: [
          {
            id: "vendor/model",
            name: "Model",
            pricing: { prompt: "0.000001", completion: "0.000002" },
          },
        ],
      })) as typeof fetch);
    expect(result[0]).toMatchObject({
      id: "vendor/model",
      inputRate: 1,
      outputRate: 2,
    });
  });
});
