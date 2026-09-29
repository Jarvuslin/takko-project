import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Configuration } from "../src/generation/settings";
import { GenerationStore } from "../src/generation/store";
import { Engine } from "../src/generation/engine";
import { providerSchema } from "../src/generation/schema";
import { fakeTransport, profile } from "./generation-fixtures";

const directories: string[] = [];
afterEach(() => {
  vi.clearAllTimers();
  vi.restoreAllMocks();
  vi.useRealTimers();
  for (const directory of directories.splice(0))
    fs.rmSync(directory, { recursive: true, force: true });
});

function setup(
  transport: typeof fetch,
  requestTimeoutMs?: number,
  fallback = false,
) {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "takko-request-deadline-"),
  );
  directories.push(directory);
  const config = new Configuration(path.join(directory, "config"));
  const model = {
    ...profile(),
    ...(requestTimeoutMs === undefined ? {} : { requestTimeoutMs }),
  };
  const other = { ...profile(), name: "Unused fallback" };
  config.save({
    profiles: fallback ? [model, other] : [model],
    routes: {
      planner: fallback ? [model.id, other.id] : [model.id],
      builder: [model.id],
      reviewer: [model.id],
      repair: [model.id],
    },
    budgetMicros: 2_000_000,
    repairLimit: 0,
  });
  const store = new GenerationStore(directory);
  return { engine: new Engine(store, config, transport), store, config, model };
}

// Node's native AbortSignal.timeout uses internal timers which Vitest cannot
// advance. Replace only its clock; the real Engine -> provider -> transport
// signal composition and reservation accounting remain exercised.
function deadlineClock() {
  vi.useFakeTimers();
  return vi.spyOn(AbortSignal, "timeout").mockImplementation((milliseconds) => {
    const controller = new AbortController();
    setTimeout(
      () =>
        controller.abort(
          new DOMException(
            "Configured request deadline elapsed",
            "TimeoutError",
          ),
        ),
      milliseconds,
    );
    return controller.signal;
  });
}

function pendingTransport(responseAfterMs?: number) {
  const fixture = fakeTransport();
  const signals: AbortSignal[] = [];
  let notify!: () => void;
  const dispatched = new Promise<void>((resolve) => {
    notify = resolve;
  });
  const transport = vi.fn(
    (...args: Parameters<typeof fetch>): Promise<Response> => {
      const signal = args[1]?.signal;
      if (!signal)
        throw Error("Provider did not forward the Engine abort signal");
      signals.push(signal);
      return new Promise((resolve, reject) => {
        let responseTimer: ReturnType<typeof setTimeout> | undefined;
        const abort = () => {
          clearTimeout(responseTimer);
          reject(signal.reason);
        };
        signal.addEventListener("abort", abort, { once: true });
        if (responseAfterMs !== undefined)
          responseTimer = setTimeout(() => {
            signal.removeEventListener("abort", abort);
            fixture(...args).then(resolve, reject);
          }, responseAfterMs);
        notify();
        if (signal.aborted) abort();
      });
    },
  ) as typeof fetch & ReturnType<typeof vi.fn>;
  return { transport, dispatched, signals };
}

describe("per-profile generation request deadline (offline mocked provider)", () => {
  it("settles unknown billing before a timeout diagnostic write can fail", async () => {
    deadlineClock();
    const provider = pendingTransport();
    const { engine, store } = setup(provider.transport, 1000);
    vi.spyOn(store, "trace").mockImplementation(() => {
      throw Error("diagnostic disk failure");
    });
    const project = engine.create("Build a repeatable interaction game");
    engine.start(project.id, project.revision, "plan");
    await provider.dispatched;
    const reserved = store.get(project.id).reservedMicros;
    await vi.advanceTimersByTimeAsync(1000);
    const result = await engine.wait(project.id);
    expect(result.reservedMicros).toBe(0);
    expect(result.charges).toHaveLength(1);
    expect(result.charges[0].chargedMicros).toBe(reserved);
  });
  it.each([0, 999, 600001, 1000.5, NaN, Infinity, "120000", null])(
    "rejects invalid requestTimeoutMs %j",
    (value) => {
      expect(
        providerSchema.safeParse({ ...profile(), requestTimeoutMs: value })
          .success,
      ).toBe(false);
    },
  );

  it("accepts both deadline bounds and leaves legacy profiles without a default field", () => {
    expect(
      providerSchema.parse({ ...profile(), requestTimeoutMs: 1000 })
        .requestTimeoutMs,
    ).toBe(1000);
    expect(
      providerSchema.parse({ ...profile(), requestTimeoutMs: 600000 })
        .requestTimeoutMs,
    ).toBe(600000);
    expect(providerSchema.parse(profile())).not.toHaveProperty(
      "requestTimeoutMs",
    );
  });

  it.each([undefined, 1000])(
    "aborts at the selected deadline %s, releases the live reservation, and retains conservative unknown-call cost",
    async (deadline) => {
      const clock = deadlineClock(),
        provider = pendingTransport();
      const { engine, store, config, model } = setup(
        provider.transport,
        deadline,
      );
      expect(config.read().profiles[0].requestTimeoutMs).toBe(deadline);
      const project = engine.create("Build a repeatable interaction game");
      engine.start(project.id, project.revision, "plan");
      await provider.dispatched;
      const activeReservation = store.get(project.id).reservedMicros;
      expect(activeReservation).toBeGreaterThan(0);
      expect(clock).toHaveBeenCalledExactlyOnceWith(deadline ?? 600000);
      await vi.advanceTimersByTimeAsync((deadline ?? 600000) - 1);
      expect(provider.signals[0].aborted).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      const result = await engine.wait(project.id);
      expect(provider.signals[0].reason.name).toBe("TimeoutError");
      expect(provider.transport).toHaveBeenCalledTimes(1);
      expect(result.stage).toBe("failed");
      expect(result.error).toContain("reply deadline");
      expect(result.reservedMicros).toBe(0);
      expect(result.charges).toHaveLength(1);
      expect(result.charges[0]).toMatchObject({
        profileId: model.id,
        reservedMicros: activeReservation,
        chargedMicros: activeReservation,
        estimated: true,
        billingSource: "reservation",
        inputTokens: null,
        outputTokens: null,
        status: "error",
      });
      expect(store.get(project.id).charges).toEqual(result.charges);
    },
  );

  it("cancels immediately during a longer request deadline without dispatching the configured fallback", async () => {
    const clock = deadlineClock(),
      provider = pendingTransport();
    const { engine } = setup(provider.transport, 300000, true);
    const project = engine.create("Build a repeatable interaction game");
    engine.start(project.id, project.revision, "plan");
    await provider.dispatched;
    expect(clock).toHaveBeenCalledExactlyOnceWith(300000);
    engine.cancel(project.id);
    expect(provider.signals[0].aborted).toBe(true);
    const result = await engine.wait(project.id);
    expect(result.stage).toBe("interrupted");
    expect(result.reservedMicros).toBe(0);
    expect(provider.transport).toHaveBeenCalledTimes(1);
    expect(result.charges).toHaveLength(1);
    expect(result.charges[0].chargedMicros).toBe(
      result.charges[0].reservedMicros,
    );
    expect(result.charges[0].billingSource).toBe("reservation");
  });

  it("accepts a long reasoning response under the default deadline without fallback or an extra call", async () => {
    const clock = deadlineClock(),
      provider = pendingTransport(125000);
    const { engine, store, model } = setup(provider.transport, undefined, true);
    const project = engine.create("Build a repeatable interaction game");
    engine.start(project.id, project.revision, "plan");
    await provider.dispatched;
    expect(clock).toHaveBeenCalledExactlyOnceWith(600000);
    await vi.advanceTimersByTimeAsync(120000);
    expect(provider.signals[0].aborted).toBe(false);
    expect(store.get(project.id).reservedMicros).toBeGreaterThan(0);
    await vi.advanceTimersByTimeAsync(5000);
    const result = await engine.wait(project.id);
    expect(result.stage, result.error ?? "").toBe("review");
    expect(result.reservedMicros).toBe(0);
    expect(provider.transport).toHaveBeenCalledTimes(1);
    expect(result.charges).toHaveLength(1);
    expect(result.charges[0]).toMatchObject({
      profileId: model.id,
      status: "ok",
      billingSource: "configured-rate",
      estimated: false,
    });
    expect(result.charges[0].chargedMicros).toBeLessThan(
      result.charges[0].reservedMicros,
    );
  });
});
