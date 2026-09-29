import { afterEach, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { GenerationStore, newProject } from "../src/generation/store";
import { profile } from "./generation-fixtures";
import { OpenCodeGateway } from "../src/generation/opencode-gateway";

const folders: string[] = [];
afterEach(() =>
  folders
    .splice(0)
    .forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })),
);
function setup(
  transport: typeof fetch,
  overrides: Record<string, unknown> = {},
) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-gateway-"));
  folders.push(dir);
  const store = new GenerationStore(dir);
  const project = newProject("Create a wind-powered racing course", 100000);
  project.jobId = "job";
  project.generation = { id: project.id, budgetMicros: 100000, chargeStart: 0 };
  store.save(project);
  const model = profile();
  const controller = new AbortController();
  const gateway = new OpenCodeGateway({
    project,
    store,
    profile: model,
    key: "host-secret",
    phase: "builder",
    signal: controller.signal,
    transport,
    ...overrides,
  });
  return { gateway, project, store, model, controller };
}
const request = {
  model: "agent",
  messages: [{ role: "user", content: "Implement the course" }],
  stream: false,
};
const receipt = () =>
  Response.json({
    choices: [],
    usage: { prompt_tokens: 50, completion_tokens: 10, cost: 0.00008 },
  });

it("releases a definite 404 refusal hold while still stopping runtime retries", async () => {
  const s = setup(async () =>
    Response.json(
      { error: { message: "No endpoints found" } },
      { status: 404 },
    ),
  );
  await s.gateway.dispatch(request, async () => {});
  expect(s.project.reservedMicros).toBe(0);
  expect(s.project.charges[0]).toMatchObject({
    chargedMicros: 0,
    estimated: false,
    status: "error",
    inputTokens: 0,
    outputTokens: 0,
  });
  await expect(s.gateway.dispatch(request, async () => {})).rejects.toThrow(
    /HTTP 404/,
  );
  expect(s.project.charges).toHaveLength(1);
});

it("accounts helper and retry requests in the original cumulative generation, without exposing its key", async () => {
  const bodies: any[] = [];
  const s = setup(async (_url, init) => {
    bodies.push(JSON.parse(String(init?.body)));
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer host-secret",
    });
    return receipt();
  });
  await s.gateway.dispatch(request, async () => {});
  await s.gateway.dispatch(
    { ...request, model: "compaction", max_tokens: 100000 },
    async () => {},
  );
  expect(s.project.charges).toHaveLength(2);
  expect(s.project.charges.every((c) => c.chargedMicros === 80)).toBe(true);
  expect(
    bodies.every(
      (b) =>
        b.model === s.model.model && b.max_tokens === s.model.maxOutputTokens,
    ),
  ).toBe(true);
  expect(s.store.get(s.project.id).reservedMicros).toBe(0);
  expect(JSON.stringify(s.store.get(s.project.id))).not.toContain(
    "host-secret",
  );
});

it("latches a cumulative reservation denial across subsequent runtime retries", async () => {
  let calls = 0;
  const s = setup(
    async () => {
      calls++;
      return receipt();
    },
    { reservationBudgetMicros: 7000 },
  );
  await s.gateway.dispatch(request, async () => {});
  await expect(s.gateway.dispatch(request, async () => {})).rejects.toThrow(
    /reservation budget/i,
  );
  s.project.budgetMicros = 999999;
  await expect(s.gateway.dispatch(request, async () => {})).rejects.toThrow(
    /reservation budget/i,
  );
  expect(calls).toBe(1);
});

it("reserves before asynchronous authorization so concurrent helper calls cannot overspend", async () => {
  let release!: () => void;
  let calls = 0;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const s = setup(
    async () => {
      calls++;
      return receipt();
    },
    { beforeDispatch: () => gate },
  );
  s.project.generation!.budgetMicros = 8000;
  const first = s.gateway.dispatch(request, async () => {});
  await expect(s.gateway.dispatch(request, async () => {})).rejects.toThrow(
    /budget/i,
  );
  release();
  await expect(first).rejects.toThrow(/budget/i);
  expect(calls).toBe(0);
  expect(s.project.reservedMicros).toBe(0);
});

it("keeps a dispatched cancellation as an unknown-cost hold and blocks further calls", async () => {
  let cancel!: () => void;
  const started = new Promise<void>((resolve) => {
    cancel = resolve;
  });
  const s = setup(async (_url, init) => {
    cancel();
    await new Promise((_, reject) =>
      init!.signal!.addEventListener("abort", () => reject(Error("aborted")), {
        once: true,
      }),
    );
    throw Error("unreachable");
  });
  const call = s.gateway.dispatch(request, async () => {});
  await started;
  const reserved = s.store.get(s.project.id).reservedMicros;
  expect(reserved).toBeGreaterThan(0);
  s.controller.abort();
  await expect(call).rejects.toThrow();
  expect(s.project.charges[0]).toMatchObject({
    chargedMicros: reserved,
    estimated: true,
    billingSource: "reservation",
  });
  expect(s.project.reservedMicros).toBe(0);
  await expect(s.gateway.dispatch(request, async () => {})).rejects.toThrow();
});

it("settles streamed usage split across chunks even when the consumer disconnects", async () => {
  const chunks = [
    'data: {"choices":[]}\n\ndata: {"usage":{"prompt_',
    'tokens":40,"completion_tokens":5,"cost":0.00007}}\n\ndata: [DONE]\n\n',
  ];
  const s = setup(
    async () =>
      new Response(
        new ReadableStream({
          start(c) {
            chunks.forEach((chunk) =>
              c.enqueue(new TextEncoder().encode(chunk)),
            );
            c.close();
          },
        }),
        { headers: { "Content-Type": "text/event-stream" } },
      ),
  );
  await s.gateway.dispatch({ ...request, stream: true }, async () => {
    throw Error("browser disconnected");
  });
  expect(s.project.charges[0]).toMatchObject({
    chargedMicros: 70,
    inputTokens: 40,
    outputTokens: 5,
    billingSource: "provider",
  });
});

it("recovers a persisted in-flight reservation conservatively after host restart", async () => {
  let release!: () => void;
  const s = setup(async () => receipt(), {
    beforeDispatch: () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  });
  const pending = s.gateway.dispatch(request, async () => {});
  const reserved = s.store.get(s.project.id).reservedMicros;
  s.store.recover();
  expect(s.store.get(s.project.id).charges[0].chargedMicros).toBe(reserved);
  release();
  await expect(pending).rejects.toThrow(/stale|interrupted/i);
  expect(s.store.get(s.project.id).charges).toHaveLength(1);
});

it.each(["anthropic", "gemini", "openai"] as const)(
  "rejects unsupported %s routes before dispatch",
  (provider) => {
    expect(() =>
      setup(async () => receipt(), { profile: profile(provider) }),
    ).toThrow(/OpenRouter|compatible/i);
  },
);

it("never releases liability based on a preliminary zero-usage stream frame", async () => {
  const s = setup(
    async () =>
      new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode(
                'data: {"usage":{"prompt_tokens":0,"completion_tokens":0}}\n\n',
              ),
            );
          },
          pull(controller) {
            controller.error(Error("Interrupted stream"));
          },
        }),
        { headers: { "Content-Type": "text/event-stream" } },
      ),
  );
  await expect(
    s.gateway.dispatch({ ...request, stream: true }, async () => {}),
  ).rejects.toThrow();
  expect(s.project.charges[0].chargedMicros).toBe(
    s.project.charges[0].reservedMicros,
  );
  expect(s.project.charges[0]).toMatchObject({
    estimated: true,
    status: "error",
    billingSource: "reservation",
  });
});

it("keeps Jev out of the coding agent", () => {
  expect(() =>
    setup(async () => receipt(), {
      profile: { ...profile(), model: "typesafe/jev-1.13" },
    }),
  ).toThrow(/Jev/);
});
