import { afterEach, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Server } from "node:http";
import { createApp } from "../src/server/app";
import { Engine } from "../src/generation/engine";
import { Configuration } from "../src/generation/settings";
import { GenerationStore } from "../src/generation/store";
import { fakeTransport, profile } from "./generation-fixtures";
import { modelCatalog } from "../src/generation/providers";
const dirs: string[] = [],
  servers: Server[] = [];
it("legacy configuration edits keep the active preset synchronized", () => {
  const config = new Configuration(directory());
  const p = profile();
  config.save({
    ...config.read(),
    profiles: [p],
    routes: {
      planner: [p.id],
      builder: [p.id],
      reviewer: [p.id],
      repair: [p.id],
    },
    generationBudgetMicros: 600000,
  });
  const current = config.read();
  expect(
    current.presets?.find((p) => p.id === current.activePresetId),
  ).toMatchObject({ routes: current.routes, generationBudgetMicros: 600000 });
});
it("migrates current roles into a persisted preset and activates saved budgets without losing models or keys", async () => {
  const { api, dir, a, b } = await setup();
  await api("/models/" + a.id + "/key", "PUT", { key: "session-key-only" });
  const before = await (await api("/models")).json();
  expect(before.presets).toHaveLength(1);
  const preset = {
    ...before.presets[0],
    id: crypto.randomUUID(),
    name: "Fast team",
    icon: "rocket",
    generationBudgetMicros: 300000,
    budgetMicros: 900000,
    routes: { ...before.routes, builder: [b.id, a.id] },
  };
  delete preset.reservationBudgetMicros;
  const save = await api("/model-presets/" + preset.id, "PUT", preset);
  expect(save.status).toBe(200);
  expect((await save.json()).routes).toEqual(before.routes);
  const activate = await api(
    "/model-presets/" + preset.id + "/activate",
    "POST",
    {},
  );
  const after = await activate.json();
  expect(after.activePresetId).toBe(preset.id);
  expect(after.generationBudgetMicros).toBe(300000);
  expect(after.reservationBudgetMicros).toBeUndefined();
  expect(after.profiles.find((p: any) => p.id === a.id).hasKey).toBe(true);
  const reloaded = new Configuration(path.join(dir, "configuration")).read();
  expect(reloaded.presets).toHaveLength(2);
  expect(reloaded.activePresetId).toBe(preset.id);
  expect(JSON.stringify(reloaded)).not.toContain("session-key-only");
  expect((await api("/model-presets/" + preset.id, "DELETE")).status).toBe(400);
});
it("model removal cleans every saved preset and stale references are rejected", async () => {
  const { api, a, b } = await setup();
  const before = await (await api("/models")).json();
  const extra = {
    ...before.presets[0],
    id: crypto.randomUUID(),
    name: "Alternate",
    routes: { ...before.routes, builder: [b.id, a.id] },
  };
  expect((await api("/model-presets/" + extra.id, "PUT", extra)).status).toBe(
    200,
  );
  const after = await (await api("/model-profiles/" + a.id, "DELETE")).json();
  for (const preset of after.presets)
    expect(Object.values(preset.routes).flat()).not.toContain(a.id);
  expect((await api("/model-presets/" + extra.id, "PUT", extra)).status).toBe(
    400,
  );
  expect((await api("/model-presets/" + extra.id, "DELETE")).status).toBe(200);
});
it("catalog follows provider pagination and keeps missing prices unknown", async () => {
  const calls: string[] = [];
  const transport = (async (url: string) => {
    calls.push(url);
    return new Response(
      JSON.stringify(
        calls.length === 1
          ? {
              data: [{ id: "a", display_name: "Alpha" }],
              has_more: true,
              last_id: "a",
            }
          : {
              data: [
                {
                  id: "b",
                  display_name: "Beta",
                  pricing: { prompt: "bad", completion: "-1" },
                },
              ],
              has_more: false,
            },
      ),
    );
  }) as typeof fetch;
  const rows = await modelCatalog(
    {
      ...profile(),
      provider: "anthropic",
      baseUrl: "https://api.anthropic.com/v1",
    },
    "fixture",
    transport,
  );
  expect(rows).toEqual([
    { id: "a", name: "Alpha", inputRate: null, outputRate: null },
    { id: "b", name: "Beta", inputRate: null, outputRate: null },
  ]);
  expect(calls[1]).toContain("after_id=a");
});
it("Gemini catalogs paginate, use display names and omit embedding-only models", async () => {
  let calls = 0;
  const transport = (async () =>
    new Response(
      JSON.stringify(
        ++calls === 1
          ? {
              models: [
                {
                  name: "models/text",
                  displayName: "Text model",
                  supportedGenerationMethods: ["generateContent"],
                },
                {
                  name: "models/embed",
                  supportedGenerationMethods: ["embedContent"],
                },
              ],
              nextPageToken: "next",
            }
          : { models: [{ name: "models/next", displayName: "Next model" }] },
      ),
    )) as typeof fetch;
  expect(
    (
      await modelCatalog(
        {
          ...profile(),
          provider: "gemini",
          baseUrl: "https://generativelanguage.googleapis.com/v1beta",
        },
        "fixture",
        transport,
      )
    ).map((m) => m.name),
  ).toEqual(["Text model", "Next model"]);
  expect(calls).toBe(2);
});
it("catalog rejects repeated pages instead of looping or presenting an incomplete list", async () => {
  const transport = (async () =>
    new Response(
      JSON.stringify({ data: [{ id: "a" }], has_more: true, last_id: "a" }),
    )) as typeof fetch;
  await expect(
    modelCatalog({ ...profile(), provider: "anthropic" }, "fixture", transport),
  ).rejects.toThrow("repeated a page");
});
afterEach(async () => {
  for (const server of servers.splice(0))
    await new Promise<void>((resolve) => server.close(() => resolve()));
  for (const dir of dirs.splice(0))
    fs.rmSync(dir, { recursive: true, force: true });
});
function directory() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-settings-"));
  dirs.push(dir);
  return dir;
}
async function setup(transport: typeof fetch = fakeTransport()) {
  const dir = directory(),
    app = createApp(dir, { env: {}, transport });
  const server = app.listen(0, "127.0.0.1");
  servers.push(server);
  await new Promise<void>((r) => server.once("listening", r));
  const root = `http://127.0.0.1:${(server.address() as { port: number }).port}/api`;
  const api = (url: string, method = "GET", body?: unknown) =>
    fetch(root + url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  const a = profile(),
    b = profile();
  const settings = {
    profiles: [a, b],
    routes: {
      planner: [a.id],
      builder: [a.id],
      reviewer: [a.id],
      repair: [b.id],
      componentReviewer: [b.id],
    },
    budgetMicros: 2e6,
    repairLimit: 1,
    reservationBudgetMicros: 5e6,
  };
  await api("/models", "PUT", settings);
  return { dir, app, api, a, b, settings };
}
it("section saves preserve concurrent model changes, advanced routes and reservation settings", async () => {
  const { api, a, b } = await setup();
  expect(
    (
      await api("/model-profiles/" + a.id, "PUT", {
        profile: { ...a, name: "Renamed" },
      })
    ).status,
  ).toBe(200);
  expect(
    (await api("/models", "PATCH", { routes: { builder: [b.id, a.id] } }))
      .status,
  ).toBe(200);
  const s = await (
    await api("/models", "PATCH", {
      generationBudgetMicros: 100000,
      budgetMicros: 3e6,
    })
  ).json();
  expect(s.profiles[0].name).toBe("Renamed");
  expect(s.routes.builder).toEqual([b.id, a.id]);
  expect(s.routes.componentReviewer).toEqual([b.id]);
  expect(s.reservationBudgetMicros).toBe(5e6);
  expect((await api("/models", "PATCH", { profiles: [] })).status).toBe(400);
});
it("profile saves validate reused legacy keys and never return or persist a secret", async () => {
  const { api, a, dir } = await setup((async () => Response.json({ data: [] })) as typeof fetch);
  const next = profile();
  await api("/models/" + a.id + "/key", "PUT", { key: "settings-test-secret" });
  const response = await api("/model-profiles/" + next.id, "PUT", {
    profile: next,
    copyKeyFrom: a.id,
  });
  const text = await response.text();
  expect(response.status).toBe(200);
  expect(text).not.toContain("settings-test-secret");
  expect(
    JSON.parse(text).profiles.find((p: any) => p.id === next.id).hasKey,
  ).toBe(true);
  expect(
    fs.readFileSync(path.join(dir, "configuration/models.json"), "utf8"),
  ).not.toContain("settings-test-secret");
  const other = { ...profile(), baseUrl: "https://elsewhere.example/v1" };
  expect(
    (
      await api("/model-profiles/" + other.id, "PUT", {
        profile: other,
        copyKeyFrom: a.id,
      })
    ).status,
  ).toBe(400);
  expect((await (await api("/models")).json()).profiles).toHaveLength(3);
});
it("deleting a profile cleans every route and retains other session keys", async () => {
  const { api, a, b } = await setup();
  await api("/models/" + b.id + "/key", "PUT", { key: "retained-fixture-key" });
  const s = await (await api("/model-profiles/" + a.id, "DELETE")).json();
  expect(s.profiles).toHaveLength(1);
  expect(s.profiles[0].hasKey).toBe(true);
  expect(s.routes.builder).toEqual([]);
  expect(s.routes.componentReviewer).toEqual([b.id]);
});
it("catalog previews do not save profiles and reject credential reuse across endpoints", async () => {
  let calls = 0;
  const { api, a, dir } = await setup((async () => {
    calls++;
    return Response.json({
      data: [
        {
          id: "sample",
          pricing: { prompt: "0.000001", completion: "0.000002" },
        },
      ],
    });
  }) as typeof fetch);
  const before = fs.readFileSync(
    path.join(dir, "configuration/models.json"),
    "utf8",
  );
  const candidate = profile();
  expect(
    (await api("/model-catalog", "POST", { profile: candidate, key: "fixture-only" })).status,
  ).toBe(200);
  expect(
    fs.readFileSync(path.join(dir, "configuration/models.json"), "utf8"),
  ).toBe(before);
  expect(
    (
      await api("/model-catalog", "POST", {
        profile: { ...candidate, baseUrl: "https://other.example" },
        sourceId: a.id,
      })
    ).status,
  ).toBe(400);
  expect(
    (
      await api("/model-catalog", "POST", {
        profile: { ...candidate, baseUrl: "http://remote.example" },
        key: "never-send",
      })
    ).status,
  ).toBe(400);
  expect(calls).toBe(2);
});
function engineSetup(transport: typeof fetch = fakeTransport()) {
  const dir = directory(),
    config = new Configuration(path.join(dir, "config")),
    p = profile();
  config.save({
    profiles: [p],
    routes: {
      planner: [p.id],
      builder: [p.id],
      reviewer: [p.id],
      repair: [p.id],
    },
    budgetMicros: 2e6,
    generationBudgetMicros: 1e6,
    repairLimit: 1,
  });
  const store = new GenerationStore(dir);
  return { engine: new Engine(store, config, transport), config, store };
}
it("generation cap prevents dispatch and failed plan retries retain their cycle", async () => {
  let calls = 0;
  const { engine, config } = engineSetup((async () => {
    calls++;
    throw Error("must not dispatch");
  }) as typeof fetch);
  config.save({ ...config.read(), generationBudgetMicros: 1000 });
  const p = engine.create("Build a farming game");
  engine.start(p.id, p.revision, "plan");
  const first = await engine.wait(p.id),
    cycle = first.generation!.id;
  expect(first.error).toContain("Generation budget");
  expect(calls).toBe(0);
  config.save({ ...config.read(), generationBudgetMicros: 1e6 });
  engine.start(p.id, p.revision, "plan");
  const retry = await engine.wait(p.id);
  expect(retry.generation!.id).toBe(cycle);
  expect(retry.generation!.budgetMicros).toBe(1000);
  expect(calls).toBe(0);
});
it("planning, build and revised briefs retain the same bounded allowance", async () => {
  let calls = 0;
  const fake = fakeTransport();
  const { engine, store } = engineSetup((async (...args) => {
    calls++;
    return fake(...args);
  }) as typeof fetch);
  const p = engine.create("Build a farming game");
  engine.start(p.id, p.revision, "plan");
  let done = await engine.wait(p.id);
  const cycle = done.generation!.id;
  expect(done.charges.length).toBe(1);
  engine.approve(p.id, p.revision);
  engine.start(p.id, p.revision, "build", 1000);
  done = await engine.wait(p.id);
  expect(done.error).toContain("Generation budget");
  expect(calls).toBe(1);
  expect(done.generation!.id).toBe(cycle);
  expect(done.generation!.chargeStart).toBe(0);
  engine.revise(p.id, p.revision, "Build a farming game with a shop", {});
  const revised = store.get(p.id);
  expect(() => engine.start(p.id, revised.revision, "plan")).toThrow("dependency map");
  expect(revised.generation!.id).toBe(cycle);
  expect(revised.generation!.chargeStart).toBe(0);
  expect(revised.generation!.budgetMicros).toBe(1000);
  expect(calls).toBe(1);
});
it("unknown usage consumes the cycle and blocks further fallback calls", async () => {
  let calls = 0;
  const { engine, config, store } = engineSetup((async () => {
    calls++;
    throw Error("lost response");
  }) as typeof fetch);
  const fallback = profile();
  const current = config.read();
  config.save({
    ...current,
    profiles: [...current.profiles, fallback],
    routes: {
      ...current.routes,
      planner: [current.profiles[0].id, fallback.id],
    },
  });
  const p = engine.create("Build a farming game");
  engine.start(p.id, p.revision, "plan");
  const done = await engine.wait(p.id);
  const reserved = done.charges.reduce((sum, c) => sum + c.chargedMicros, 0);
  expect(reserved).toBeGreaterThan(0);
  done.generation!.budgetMicros = reserved;
  store.save(done);
  const before = calls;
  engine.start(p.id, p.revision, "plan");
  await engine.wait(p.id);
  expect(calls).toBe(before);
});
it("a larger generation allowance cannot bypass the project limit", async () => {
  let calls = 0;
  const { engine, config } = engineSetup((async () => {
    calls++;
    throw Error("must not dispatch");
  }) as typeof fetch);
  config.save({ ...config.read(), budgetMicros: 1000 });
  const p = engine.create("Build a farming game");
  engine.start(p.id, p.revision, "plan", 1e6);
  const done = await engine.wait(p.id);
  expect(done.error).toContain("Project budget");
  expect(calls).toBe(0);
});
it("a no-op brief revision cannot reset a failed generation allowance", async () => {
  const { engine, config } = engineSetup();
  config.save({ ...config.read(), generationBudgetMicros: 1000 });
  const p = engine.create("Build a farming game");
  engine.start(p.id, p.revision, "plan");
  let done = await engine.wait(p.id);
  const cycle = done.generation!.id;
  const revised = engine.revise(p.id, p.revision, p.request, {});
  config.save({ ...config.read(), generationBudgetMicros: 1e6 });
  engine.start(p.id, revised.revision, "plan");
  done = await engine.wait(p.id);
  expect(done.generation!.id).toBe(cycle);
  expect(done.generation!.budgetMicros).toBe(1000);
  expect(done.charges).toHaveLength(0);
});
it("failed cycle spend remains bounded after reloading the project store", async () => {
  const { engine, config, store } = engineSetup();
  const p = engine.create("Build a farming game");
  engine.start(p.id, p.revision, "plan");
  const done = await engine.wait(p.id);
  done.generation!.budgetMicros = 1000;
  store.save(done);
  engine.approve(p.id, p.revision);
  let calls = 0;
  const resumed = new Engine(
    new GenerationStore(store.directory),
    config,
    (async () => {
      calls++;
      throw Error("must not dispatch");
    }) as typeof fetch,
  );
  resumed.start(p.id, p.revision, "build");
  const result = await resumed.wait(p.id);
  expect(result.error).toContain("Generation budget");
  expect(result.charges).toHaveLength(1);
  expect(calls).toBe(0);
});
