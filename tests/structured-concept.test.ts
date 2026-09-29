import { expect, it } from "vitest";
import { z } from "zod";
import { complete, DispatchDenied } from "../src/generation/providers";
import { anthropicOutputSchema } from "../src/generation/output-contract";
import { conceptOutputSchema } from "../src/generation/concept";
import { profile } from "./generation-fixtures";

const model = {
  ...profile("openrouter"),
  baseUrl: "https://openrouter.ai/api/v1",
  model: "anthropic/claude-haiku-4.5",
  structuredOutput: "anthropic" as const,
};
const contract = {
  name: "takko_concept",
  schema: z.toJSONSchema(conceptOutputSchema) as Record<string, unknown>,
};
const reply = () =>
  Response.json({
    choices: [{ message: { content: "{}" }, finish_reason: "stop" }],
    usage: { prompt_tokens: 1, completion_tokens: 1 },
  });
const metadata = (supported = true) =>
  Response.json({
    data: {
      endpoints: [
        {
          tag: "anthropic",
          supported_parameters: supported
            ? ["structured_outputs", "response_format"]
            : ["response_format"],
        },
      ],
    },
  });
it("sends an opt-in schema to a verified pinned endpoint with no silent fallback", async () => {
  const calls: { url: string; init: RequestInit | undefined }[] = [];
  await complete(
    model,
    "fixture",
    "system",
    "user",
    new AbortController().signal,
    async (url, init) => {
      calls.push({ url: String(url), init });
      return init?.method === "POST" ? reply() : metadata();
    },
    undefined,
    false,
    undefined,
    contract,
  );
  expect(calls).toHaveLength(2);
  expect(calls[0].url).toBe(
    "https://openrouter.ai/api/v1/models/anthropic/claude-haiku-4.5/endpoints",
  );
  expect(calls[0].init?.headers).toBeUndefined();
  const sent = JSON.parse(String(calls[1].init?.body));
  expect(sent.response_format.type).toBe("json_schema");
  expect(sent.response_format.json_schema.strict).toBe(true);
  expect(sent.provider).toEqual({
    order: ["Anthropic"],
    allow_fallbacks: false,
    require_parameters: true,
  });
  expect(
    sent.response_format.json_schema.schema.properties.decisions,
  ).toBeDefined();
});
it.each(["missing", "failure", "offline"])(
  "does not dispatch inference when strict support is %s",
  async (kind) => {
    let posts = 0;
    await expect(
      complete(
        model,
        "",
        "system",
        "user",
        new AbortController().signal,
        async (_url, init) => {
          if (init?.method === "POST") posts++;
          if (kind === "offline") throw Error("offline");
          return kind === "failure"
            ? new Response("unavailable", { status: 503 })
            : metadata(false);
        },
        undefined,
        false,
        undefined,
        contract,
      ),
    ).rejects.toBeInstanceOf(DispatchDenied);
    expect(posts).toBe(0);
  },
);
it("keeps compatibility mode explicit and makes no capability request without opt-in", async () => {
  let calls = 0;
  await complete(
    { ...model, structuredOutput: undefined },
    "",
    "system",
    "user",
    new AbortController().signal,
    async (_url, init) => {
      calls++;
      expect(JSON.parse(String(init?.body)).response_format).toEqual({
        type: "json_object",
      });
      return reply();
    },
    undefined,
    false,
    undefined,
    contract,
  );
  expect(calls).toBe(1);
});
it("does not add strict output to unrelated calls without a contract", async () => {
  let calls = 0;
  await complete(
    model,
    "",
    "system",
    "user",
    new AbortController().signal,
    async (_url, init) => {
      calls++;
      expect(JSON.parse(String(init?.body)).response_format.type).toBe(
        "json_object",
      );
      return reply();
    },
  );
  expect(calls).toBe(1);
});
it("preserves an explicitly typed pre-dispatch refusal but scrubs unknown transport errors", async () => {
  await expect(
    complete(
      profile(),
      "",
      "s",
      "u",
      new AbortController().signal,
      async () => {
        throw new DispatchDenied("Call budget exhausted");
      },
    ),
  ).rejects.toThrow("Call budget exhausted");
  await expect(
    complete(
      profile(),
      "",
      "s",
      "u",
      new AbortController().signal,
      async () => {
        throw Error("secret header contents");
      },
    ),
  ).rejects.toThrow("Provider connection failed");
});
it("converts unsupported constraints without mutating local validation or property names", () => {
  const schema = {
    type: "object",
    properties: {
      maxLength: { type: "string", maxLength: 500 },
      choices: {
        type: "array",
        minItems: 2,
        maxItems: 3,
        items: {
          type: "object",
          properties: { x: { type: "integer", minimum: 1, maximum: 8 } },
        },
      },
    },
  };
  const clone = structuredClone(schema);
  const wire = anthropicOutputSchema(schema) as any;
  expect(schema).toEqual(clone);
  expect(wire.properties.maxLength.type).toBe("string");
  expect(wire.properties.maxLength.maxLength).toBeUndefined();
  expect(wire.properties.maxLength.description).toContain("500");
  expect(wire.properties.choices.minItems).toBe(1);
  expect(wire.properties.choices.maxItems).toBeUndefined();
  expect(wire.properties.choices.items.additionalProperties).toBe(false);
  expect(wire.properties.choices.items.properties.x.minimum).toBeUndefined();
});
