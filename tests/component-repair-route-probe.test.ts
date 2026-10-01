import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  oneShotTransport,
  probeLimits,
  reconstructSecondAdaptation,
} from "./component-repair-route.fixture";
import type { Profile } from "../src/generation/schema";

const url = "https://openrouter.ai/api/v1/chat/completions";
const profile: Profile = {
  id: "79a578eb-3141-491d-aec8-eec70f817054",
  name: "fixture",
  provider: "openrouter",
  baseUrl: "https://openrouter.ai/api/v1",
  model: "openai/gpt-5.6-sol",
  inputRate: 2,
  outputRate: 10,
  maxOutputTokens: 12000,
  requestTimeoutMs: 300000,
  jsonMode: true,
};
const body = JSON.stringify({
  model: profile.model,
  messages: [
    { role: "system", content: "schema" },
    { role: "user", content: "immutable input" },
  ],
  max_tokens: 12000,
  response_format: { type: "json_object" },
});
const init = { method: "POST", body };
function fixture(
  transport: typeof fetch,
  priorMicros: number = probeLimits.priorMicros,
) {
  const records: Record<string, any>[] = [];
  const responses: string[] = [];
  const gate = oneShotTransport({
    expectedBody: body,
    profile,
    priorMicros,
    persist: (r) => records.push(r),
    response: (r) => responses.push(r),
    transport,
  });
  return { ...gate, records, responses };
}

describe("one-shot repair route diagnostic", () => {
  it("durably reserves before dispatch, records request ID and settles only a validated known response", async () => {
    const next = vi.fn(async () => {
      expect(gate.records[0]).toMatchObject({
        status: "reserved",
        calls: 1,
        dispatched: false,
        chargedMicros: null,
      });
      expect(gate.records[0].liabilityMicros).toBeGreaterThan(120000);
      return new Response(
        JSON.stringify({
          id: "gen-fixture",
          usage: { cost: 0.021 },
          choices: [],
        }),
      );
    });
    const gate = fixture(next);
    await gate.transport(url, init);
    expect(gate.snapshot()).toMatchObject({
      status: "response_received",
      generationId: "gen-fixture",
      chargedMicros: 21000,
    });
    expect(gate.snapshot().liabilityMicros).toEqual(
      gate.snapshot().reserveMicros,
    );
    gate.settleValidated();
    expect(gate.snapshot()).toMatchObject({
      status: "validated",
      liabilityMicros: 21000,
    });
    await expect(gate.transport(url, init)).rejects.toThrow("retry forbidden");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it.each(["timeout", "malformed", "no-cost", "http-error"])(
    "retains reservation after %s and rejects every second dispatch",
    async (kind) => {
      const next = vi.fn(async () => {
        if (kind === "timeout") throw Error("network secret must not escape");
        if (kind === "malformed") return new Response("invalid JSON");
        return new Response(
          JSON.stringify({ id: "gen-unknown", choices: [] }),
          { status: kind === "http-error" ? 503 : 200 },
        );
      });
      const gate = fixture(next);
      if (kind === "timeout")
        await expect(gate.transport(url, init)).rejects.toThrow(
          "reservation retained",
        );
      else await gate.transport(url, init);
      expect(gate.snapshot()).toMatchObject({
        status: "failed_or_unknown",
        chargedMicros: null,
        calls: 1,
        dispatched: true,
      });
      expect(gate.snapshot().liabilityMicros).toEqual(
        gate.snapshot().reserveMicros,
      );
      expect(() => gate.settleValidated()).toThrow();
      await expect(gate.transport(url, init)).rejects.toThrow(
        "retry forbidden",
      );
      expect(next).toHaveBeenCalledTimes(1);
    },
  );

  it("retains a known charge plus conservative reservation when output validation fails", async () => {
    const gate = fixture(
      async () =>
        new Response(
          JSON.stringify({
            id: "gen-invalid",
            usage: { cost: 0.005 },
            choices: [{ message: { content: "bad worker JSON" } }],
          }),
        ),
    );
    await gate.transport(url, init);
    // The caller never invokes settleValidated after a rejected raw answer.
    expect(gate.snapshot()).toMatchObject({
      chargedMicros: 5000,
      status: "response_received",
    });
    expect(gate.snapshot().liabilityMicros).toEqual(
      gate.snapshot().reserveMicros,
    );
    await expect(gate.transport(url, init)).rejects.toThrow("retry forbidden");
  });

  it("never reduces liability below a reported cost exceeding the allowance", async () => {
    const gate = fixture(
      async () => new Response(JSON.stringify({ usage: { cost: 0.7 } })),
    );
    await gate.transport(url, init);
    expect(gate.snapshot().liabilityMicros).toBe(700000);
  });

  it.each(["bytes", "model", "url"])(
    "rejects a changed %s before network or reservation",
    async (change) => {
      const next = vi.fn(async () => new Response("{}"));
      const gate = fixture(next);
      await expect(
        gate.transport(change === "url" ? url + "/other" : url, {
          method: "POST",
          body:
            change === "bytes"
              ? body + " "
              : change === "model"
                ? body.replace(profile.model, "other")
                : body,
        }),
      ).rejects.toThrow();
      expect(next).not.toHaveBeenCalled();
      expect(gate.records).toEqual([]);
    },
  );

  it("rejects campaign admission and inherited-prior reduction before dispatch", async () => {
    for (const prior of [probeLimits.priorMicros - 1, 8500001]) {
      const next = vi.fn(async () => new Response("{}"));
      const gate = fixture(next, prior);
      await expect(gate.transport(url, init)).rejects.toThrow();
      expect(next).not.toHaveBeenCalled();
      expect(gate.records).toEqual([]);
    }
  });

  it("reconstructs current first-hop evidence and validates the unchanged second raw answer without later review leakage", () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), "takko-repair-route-"));
    try {
      fs.cpSync(
        "tests/fixtures/asset-pipeline/marketplace-diversity-v13/combat-training/asset-evidence",
        temp,
        { recursive: true },
      );
      const replay = reconstructSecondAdaptation(temp);
      expect(replay.context.context.adaptation).toEqual({
        attempt: 2,
        maxAttempts: 2,
        remainingAttempts: 0,
      });
      expect(replay.context.context.evidence.packetHash).toEqual(
        replay.proof.currentPacketHash,
      );
      expect(replay.context.context.review.packetHash).toEqual(
        replay.proof.currentPacketHash,
      );
      expect(replay.context.context.stage.eventSequence).toBe(
        replay.proof.cutoffIndex,
      );
      expect(replay.validate(replay.raw).action).toBe("adapt");
      const wrong = JSON.parse(replay.raw);
      wrong.plan.packetHash = "f".repeat(64);
      expect(() => replay.validate(JSON.stringify(wrong))).toThrow();
      expect(JSON.stringify(replay.context)).not.toContain(replay.raw);
      expect(replay.context.context).not.toHaveProperty("laterReview");
    } finally {
      const resolved = path.resolve(temp);
      expect(
        resolved.startsWith(
          path.resolve(os.tmpdir()) + path.sep + "takko-repair-route-",
        ),
      ).toBe(true);
      fs.rmSync(resolved, { recursive: true, force: true });
    }
  });
});
