import { describe, expect, it, vi } from "vitest";
import {
  complete,
  ProviderError,
  type AudioInput,
} from "../src/generation/providers";
import type { Profile } from "../src/generation/schema";

// Offline HTTP mocks and synthetic PCM fixtures only; no native capture or model-quality result.
function wav(bytes = 48): AudioInput {
  const buffer = Buffer.alloc(bytes);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(bytes - 8, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(48000, 24);
  buffer.writeUInt32LE(96000, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(bytes - 44, 40);
  return { data: buffer.toString("base64"), format: "wav" };
}
function profile(provider: Profile["provider"]): Profile {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Offline configured route",
    provider,
    model: "configured-model-not-assumed-audio-capable",
    baseUrl:
      provider === "gemini"
        ? "https://generativelanguage.googleapis.com/v1beta"
        : "https://openrouter.ai/api/v1",
    inputRate: 1,
    outputRate: 2,
    maxOutputTokens: 1024,
    jsonMode: true,
  };
}
const signal = new AbortController().signal;
function transport(response: unknown, status = 200) {
  return vi.fn<typeof fetch>(
    async () =>
      new Response(JSON.stringify(response), {
        status,
        headers: { "content-type": "application/json" },
      }),
  );
}
const routerResponse = {
  choices: [
    { finish_reason: "stop", message: { content: '{"accepted":true}' } },
  ],
  usage: {
    prompt_tokens: 100,
    prompt_tokens_details: { audio_tokens: 64 },
    completion_tokens: 12,
    cost: 0.000321,
  },
};
const geminiResponse = {
  candidates: [
    {
      finishReason: "STOP",
      content: { parts: [{ text: '{"accepted":true}' }] },
    },
  ],
  usageMetadata: {
    promptTokenCount: 100,
    promptTokensDetails: [
      { modality: "AUDIO", tokenCount: 64 },
      { modality: "TEXT", tokenCount: 36 },
    ],
    candidatesTokenCount: 12,
    thoughtsTokenCount: 3,
  },
};
const body = (mock: ReturnType<typeof transport>) =>
  JSON.parse(mock.mock.calls[0][1]!.body as string);

describe("provider audio transport (offline mocks)", () => {
  it("sends Gemini inline WAV bytes separately from text and preserves total usage without double counting audio", async () => {
    const mock = transport(geminiResponse),
      audio = wav();
    const result = await complete(
      profile("gemini"),
      "offline-key",
      "system",
      "Evaluate this crunch",
      signal,
      mock,
      undefined,
      false,
      audio,
    );
    expect(mock.mock.calls[0][0]).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/configured-model-not-assumed-audio-capable:generateContent",
    );
    expect(body(mock).contents[0].parts).toEqual([
      { inlineData: { mimeType: "audio/wav", data: audio.data } },
      { text: "Evaluate this crunch" },
    ]);
    expect(body(mock).generationConfig).toEqual({
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    });
    expect(result).toEqual({
      text: '{"accepted":true}',
      inputTokens: 100,
      outputTokens: 15,
    });
    expect(mock.mock.calls[0][1]).toMatchObject({
      signal,
      redirect: "error",
      headers: { "x-goog-api-key": "offline-key" },
    });
  });
  it("sends OpenRouter input_audio and retains actual reported audio-inclusive monetary cost", async () => {
    const mock = transport(routerResponse),
      audio = wav();
    const result = await complete(
      profile("openrouter"),
      "offline-key",
      "system",
      "Evaluate this crunch",
      signal,
      mock,
      undefined,
      false,
      audio,
    );
    expect(mock.mock.calls[0][0]).toBe(
      "https://openrouter.ai/api/v1/chat/completions",
    );
    expect(body(mock).messages[1].content).toEqual([
      { type: "input_audio", input_audio: audio },
      { type: "text", text: "Evaluate this crunch" },
    ]);
    expect(result).toMatchObject({
      inputTokens: 100,
      outputTokens: 12,
      costMicros: 321,
    });
    expect(body(mock)).toMatchObject({
      model: "configured-model-not-assumed-audio-capable",
      response_format: { type: "json_object" },
    });
  });
  it.each(["gemini", "openrouter"] as const)(
    "preserves simultaneous image and audio parts for %s without putting bytes into user text",
    async (provider) => {
      const mock = transport(
          provider === "gemini" ? geminiResponse : routerResponse,
        ),
        audio = wav(),
        image = "data:image/png;base64,aW1hZ2U=";
      await complete(
        profile(provider),
        "offline-key",
        "system",
        "Evaluate observations",
        signal,
        mock,
        image,
        false,
        audio,
      );
      const parts =
        provider === "gemini"
          ? body(mock).contents[0].parts
          : body(mock).messages[1].content;
      expect(parts).toHaveLength(3);
      expect(parts.at(-1).text).toBe("Evaluate observations");
      expect(
        JSON.stringify(parts.filter((p: { text?: string }) => p.text)),
      ).not.toContain(audio.data);
      expect(parts[0]).toEqual(
        provider === "gemini"
          ? { inlineData: { mimeType: "image/png", data: "aW1hZ2U=" } }
          : { type: "image_url", image_url: { url: image } },
      );
    },
  );
  it.each(["openai", "anthropic", "compatible"] as const)(
    "rejects unsupported %s transport before dispatch",
    async (provider) => {
      const mock = transport({});
      await expect(
        complete(
          profile(provider),
          "offline-key",
          "system",
          "user",
          signal,
          mock,
          undefined,
          false,
          wav(),
        ),
      ).rejects.toMatchObject({
        retryable: false,
        message: expect.stringContaining("does not support"),
      });
      expect(mock).not.toHaveBeenCalled();
    },
  );
  it.each([
    null,
    {},
    { format: "mp3", data: wav().data },
    { format: "wav", data: "" },
    { format: "wav", data: "data:audio/wav;base64," + wav().data },
    { format: "wav", data: "https://example.test/audio.wav" },
    { format: "wav", data: wav().data + "\n" },
    { format: "wav", data: "not base64" },
    { format: "wav", data: Buffer.alloc(48).toString("base64") },
    { format: "wav", data: wav().data, extra: "unexpected" },
  ])("rejects malformed audio %# before any request", async (input) => {
    const mock = transport({});
    await expect(
      complete(
        profile("openrouter"),
        "offline-key",
        "system",
        "user",
        signal,
        mock,
        undefined,
        false,
        input as AudioInput,
      ),
    ).rejects.toBeInstanceOf(ProviderError);
    expect(mock).not.toHaveBeenCalled();
  });
  it("rejects truncated or falsely declared RIFF lengths", async () => {
    const mock = transport({}),
      bytes = Buffer.from(wav().data, "base64");
    bytes.writeUInt32LE(1000, 4);
    await expect(
      complete(
        profile("gemini"),
        "key",
        "system",
        "user",
        signal,
        mock,
        undefined,
        false,
        { format: "wav", data: bytes.toString("base64") },
      ),
    ).rejects.toThrow("RIFF/WAVE");
    expect(mock).not.toHaveBeenCalled();
  });
  it("enforces the decoded 5 MiB limit and accepts its exact boundary", async () => {
    const mock = transport(routerResponse);
    await expect(
      complete(
        profile("openrouter"),
        "key",
        "system",
        "user",
        signal,
        mock,
        undefined,
        false,
        wav(5 * 1024 * 1024 + 1),
      ),
    ).rejects.toThrow();
    expect(mock).not.toHaveBeenCalled();
    expect(
      (
        await complete(
          profile("openrouter"),
          "key",
          "system",
          "user",
          signal,
          mock,
          undefined,
          false,
          wav(5 * 1024 * 1024),
        )
      ).costMicros,
    ).toBe(321);
    expect(mock).toHaveBeenCalledTimes(1);
  });
  it("surfaces model audio rejection without silently retrying or switching protocols", async () => {
    const mock = transport(
      { error: { message: "Audio unsupported by selected model" } },
      400,
    );
    await expect(
      complete(
        profile("openrouter"),
        "key",
        "system",
        "user",
        signal,
        mock,
        undefined,
        false,
        wav(),
      ),
    ).rejects.toMatchObject({
      message: "Provider returned HTTP 400",
      retryable: false,
    });
    expect(mock).toHaveBeenCalledTimes(1);
  });
  it("retains charged completion usage when an audio request returns unusable output", async () => {
    const mock = transport({
      ...routerResponse,
      choices: [{ finish_reason: "stop", message: { content: "" } }],
    });
    await expect(
      complete(
        profile("openrouter"),
        "key",
        "system",
        "user",
        signal,
        mock,
        undefined,
        false,
        wav(),
      ),
    ).rejects.toMatchObject({
      completion: {
        text: "",
        inputTokens: 100,
        outputTokens: 12,
        costMicros: 321,
      },
      retryable: false,
    });
  });
  it("keeps text-only and image-only calls compatible when audio is omitted", async () => {
    const mock = transport(routerResponse);
    await complete(
      profile("openrouter"),
      "key",
      "system",
      "text only",
      signal,
      mock,
    );
    expect(body(mock).messages[1].content).toBe("text only");
    mock.mockClear();
    await complete(
      profile("openrouter"),
      "key",
      "system",
      "image only",
      signal,
      mock,
      "data:image/png;base64,aW1hZ2U=",
    );
    expect(
      body(mock).messages[1].content.map((p: { type: string }) => p.type),
    ).toEqual(["image_url", "text"]);
  });
});
