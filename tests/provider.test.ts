import { it, expect, vi } from "vitest";
import { getAdvice } from "../src/core/provider";
import { Budget } from "../src/core/budget";
const config = {
  baseUrl: "https://provider.example/v1",
  key: "test-key",
  model: "test-model",
  inputRate: 1,
  outputRate: 2,
};
it("validates advice and accounts for actual tokens", async () => {
  const fetcher = vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          usage: { prompt_tokens: 100, completion_tokens: 20 },
          choices: [
            {
              message: {
                content: JSON.stringify({
                  choices: { style: "jade" },
                  summary: "Use a calm palette.",
                }),
              },
            },
          ],
        }),
      ),
  ) as unknown as typeof fetch;
  const budget = new Budget(10000);
  expect(
    (await getAdvice("arena combat", config, budget, fetcher)).choices.style,
  ).toBe("jade");
  expect(budget.spent).toBe(140);
});
it("rejects fabricated tool actions while charging consumed tokens", async () => {
  const fetcher = vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          usage: { prompt_tokens: 100, completion_tokens: 20 },
          choices: [
            {
              message: {
                content: '{"choices":{"assetId":123},"summary":"done"}',
              },
            },
          ],
        }),
      ),
  ) as unknown as typeof fetch;
  const b = new Budget(10000);
  await expect(getAdvice("fight", config, b, fetcher)).rejects.toThrow();
  expect(b.spent).toBe(140);
});
it("does not call the provider when the reservation exceeds the budget", async () => {
  const f = vi.fn() as unknown as typeof fetch;
  await expect(getAdvice("fight", config, new Budget(1), f)).rejects.toThrow(
    /budget/i,
  );
  expect(f).not.toHaveBeenCalled();
});
it("keeps a conservative charge after an ambiguous network failure", async () => {
  const f = vi.fn(async () => {
    throw Error("network");
  }) as unknown as typeof fetch;
  const b = new Budget(10000);
  await expect(getAdvice("fight", config, b, f)).rejects.toThrow("network");
  expect(b.spent).toBeGreaterThan(0);
});
