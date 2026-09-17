import { afterEach, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { request as httpRequest, type Server } from "node:http";
import { createApp } from "../src/server/app";
import { integrationFixture } from "./component-integration.fixture";
import {
  fakeTransport,
  profile,
  fixtureBundle,
  fixtureReview,
  specification,
} from "./generation-fixtures";
const dirs: string[] = [],
  servers: Server[] = [];
async function setup(options: { pluginPath?: string } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-api-"));
  dirs.push(dir);
  const app = createApp(dir, { transport: fakeTransport(), ...options });
  const server = app.listen(0, "127.0.0.1");
  servers.push(server);
  await new Promise<void>((r) => server.once("listening", r));
  const port = (server.address() as { port: number }).port;
  return {
    app,
    dir,
    api: (
      p: string,
      method = "GET",
      body?: unknown,
      headers: Record<string, string> = {},
    ) =>
      fetch("http://127.0.0.1:" + port + "/api" + p, {
        method,
        headers: { "Content-Type": "application/json", ...headers },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
  };
}
afterEach(async () => {
  for (const server of servers.splice(0)) {
    await new Promise<void>((r) => server.close(() => r()));
  }
  for (const dir of dirs.splice(0))
    fs.rmSync(dir, { recursive: true, force: true });
});
it("exports native components through HTTP and rejects stale or tampered component evidence", async () => {
  const { app, api, dir } = await setup();
  const p = await (
    await api("/projects", "POST", { request: "Export component fixture" })
  ).json();
  const directory = path.join(dir, "asset-evidence", p.id),
    f = integrationFixture(directory, p.scope);
  Object.assign(p, {
    artifact: fixtureBundle(p.request, p.scope),
    spec: specification(p.request, p.scope),
    review: fixtureReview,
    stage: "ready_to_test",
    approvedRevision: p.revision,
  });
  p.assetPipeline = {
    version: 1,
    runId: "fixture",
    revision: p.revision,
    inputHash: f.evidence.inputHash,
    status: "passed",
    startedAt: "fixture",
    policy: {
      maxSearches: 2,
      maxCandidates: 3,
      allowEscalation: false,
      workerRoute: "fixture",
      evaluatorRoute: "fixture",
    },
    adapter: "fixture",
    needs: [f.need],
    entries: [
      {
        needId: f.need.id,
        status: "passed",
        attempts: 1,
        selected: {
          id: "101",
          name: "fixture",
          kind: "Model",
          creator: "fixture",
          source: "creator_store",
          sourceUrl: f.bundle.assets[0].sourceUrl,
          price: 0,
        },
        bundle: f.bundle,
        component: f.component,
        componentContextHash: f.evidence.inputHash,
      },
    ],
    events: [],
  };
  app.locals.engine.store.save(p);
  const response = await api(`/projects/${p.id}/export`);
  expect(response.ok).toBe(true);
  expect(await response.text()).toContain("SoundScript2");
  const session = app.locals.bridge.connect("Component-unaware plugin", {
    protocolVersion: 2,
    capabilities: ["apply", "test"],
  });
  app.locals.engine.store.save({ ...p, assetPipeline: null });
  const queued = app.locals.bridge.enqueue(p.id, session.id, "apply");
  app.locals.engine.store.save(p);
  expect(app.locals.bridge.poll(session.id)).toBeNull();
  expect(app.locals.bridge.status(session.id, queued.id).state).toBe(
    "cancelled",
  );
  expect(() => app.locals.bridge.enqueue(p.id, session.id, "apply")).toThrow(
    "does not yet deliver native components",
  );
  p.assetPipeline.inputHash = "0".repeat(64);
  app.locals.engine.store.save(p);
  expect((await api(`/projects/${p.id}/export`)).ok).toBe(false);
  p.assetPipeline.inputHash = f.evidence.inputHash;
  app.locals.engine.store.save(p);
  fs.appendFileSync(path.join(directory, f.xmlHash + ".rbxmx"), " ");
  expect((await api(`/projects/${p.id}/export`)).ok).toBe(false);
});

it("serves only hashed captured WAV evidence within the selected project's evidence directory", async () => {
  const { api, dir } = await setup();
  const project = await (
    await api("/projects", "POST", { request: "Audio evidence API fixture" })
  ).json();
  const evidence = path.join(dir, "asset-evidence", project.id);
  fs.mkdirSync(evidence, { recursive: true });
  const name = "a".repeat(64) + ".wav";
  fs.writeFileSync(path.join(evidence, name), Buffer.from("RIFF-fixture-WAVE"));
  const response = await api(`/projects/${project.id}/asset-evidence/${name}`);
  expect(response.ok).toBe(true);
  expect(response.headers.get("content-type")).toMatch(
    /audio\/(wav|wave|x-wav)/,
  );
  expect(Buffer.from(await response.arrayBuffer()).toString()).toBe(
    "RIFF-fixture-WAVE",
  );
  expect(
    (await api(`/projects/${project.id}/asset-evidence/unhashed.wav`)).ok,
  ).toBe(false);
});
it("persists multi-genre projects and runs the actual async model pipeline through the API", async () => {
  const { app, api } = await setup();
  const p = profile();
  expect(
    (
      await api("/models", "PUT", {
        profiles: [p],
        routes: {
          planner: [p.id],
          builder: [p.id],
          reviewer: [p.id],
          repair: [p.id],
        },
        budgetMicros: 2e6,
        repairLimit: 1,
      })
    ).ok,
  ).toBe(true);
  let project = await (
    await api("/projects", "POST", { request: "Build a farming game" })
  ).json();
  expect(
    (await api("/projects/" + project.id + "/build", "POST", { revision: 1 }))
      .status,
  ).toBe(409);
  expect(
    (await api("/projects/" + project.id + "/plan", "POST", { revision: 1 }))
      .status,
  ).toBe(202);
  await app.locals.engine.wait(project.id);
  await api("/projects/" + project.id + "/approve", "POST", { revision: 1 });
  await api("/projects/" + project.id + "/build", "POST", { revision: 1 });
  await app.locals.engine.wait(project.id);
  project = await (await api("/projects/" + project.id)).json();
  expect(project.stage).toBe("ready_to_test");
  const exported = await api("/projects/" + project.id + "/export");
  expect(exported.ok).toBe(true);
  expect(await exported.text()).toContain("Harvest");
  project.stage = "failed";
  project.checks = [];
  app.locals.engine.store.save(project);
  expect((await api("/projects/" + project.id + "/export")).ok).toBe(false);
  expect(
    (await api("/studio/plugin")).headers.get("content-disposition"),
  ).toContain("Takko.rbxmx");
});
it("keeps keys out of responses and disk and clears them when the destination changes", async () => {
  const { api, dir } = await setup();
  const p = profile();
  const settings = {
    profiles: [p],
    routes: {
      planner: [p.id],
      builder: [p.id],
      reviewer: [p.id],
      repair: [p.id],
    },
    budgetMicros: 2e6,
    repairLimit: 0,
  };
  await api("/models", "PUT", settings);
  await api("/models/" + p.id + "/key", "PUT", { key: "secret-not-on-disk" });
  const response = await api("/models");
  const text = await response.text();
  expect(text).not.toContain("secret-not-on-disk");
  expect(JSON.parse(text).profiles[0].hasKey).toBe(true);
  expect(
    fs.readFileSync(path.join(dir, "configuration/models.json"), "utf8"),
  ).not.toContain("secret-not-on-disk");
  settings.profiles[0].baseUrl = "http://localhost:9999/v1";
  await api("/models", "PUT", settings);
  expect((await (await api("/models")).json()).profiles[0].hasKey).toBe(false);
});
it("rejects cross-site requests and non-local Host headers; requires bridge pairing", async () => {
  const { api } = await setup();
  expect(
    (await api("/status", "GET", undefined, { Origin: "https://evil.example" }))
      .status,
  ).toBe(403);
  const port = (servers.at(-1)!.address() as { port: number }).port;
  const status = await new Promise<number | undefined>((resolve, reject) => {
    const req = httpRequest(
      {
        hostname: "127.0.0.1",
        port,
        path: "/api/status",
        headers: { Host: "rebound.example" },
      },
      (res) => {
        res.resume();
        resolve(res.statusCode);
      },
    );
    req.on("error", reject);
    req.end();
  });
  expect(status).toBe(403);
  expect(
    (await api("/bridge/connect", "POST", { name: "Studio" })).status,
  ).toBe(401);
  const { token } = await (await api("/studio/pairing")).json();
  expect(
    (
      await api(
        "/bridge/connect",
        "POST",
        { name: "Studio" },
        { Authorization: "Bearer " + token },
      )
    ).ok,
  ).toBe(true);
});
it("negotiates bridge capabilities and exposes authenticated dispatch confirmation and safe cancellation", async () => {
  const { app, api } = await setup();
  const project = await (
    await api("/projects", "POST", { request: "A bridge test game" })
  ).json();
  Object.assign(project, {
    artifact: fixtureBundle(project.request, project.scope),
    spec: specification(project.request, project.scope),
    review: fixtureReview,
    stage: "ready_to_test",
    approvedRevision: 1,
  });
  app.locals.engine.store.save(project);
  const { token } = await (await api("/studio/pairing")).json();
  const auth = { Authorization: "Bearer " + token };
  const legacy = await (
    await api("/bridge/connect", "POST", { name: "Old plugin" }, auth)
  ).json();
  expect(
    (
      await api(`/projects/${project.id}/studio`, "POST", {
        studioId: legacy.id,
        kind: "apply",
      })
    ).ok,
  ).toBe(false);
  const session = await (
    await api(
      "/bridge/connect",
      "POST",
      {
        name: "Updated plugin",
        protocolVersion: 2,
        capabilities: ["apply", "test"],
      },
      auth,
    )
  ).json();
  const queued = await (
    await api(`/projects/${project.id}/studio`, "POST", {
      studioId: session.id,
      kind: "apply",
    })
  ).json();
  expect(
    (await api(`/bridge/${session.id}/operations/${queued.id}`)).status,
  ).toBe(401);
  expect(
    (
      await (
        await api(
          `/studio/${session.id}/operations/${queued.id}/cancel`,
          "POST",
          {},
        )
      ).json()
    ).state,
  ).toBe("cancelled");
  const next = await (
    await api(`/projects/${project.id}/studio`, "POST", {
      studioId: session.id,
      kind: "apply",
    })
  ).json();
  const { operation } = await (
    await api(`/bridge/${session.id}/poll`, "GET", undefined, auth)
  ).json();
  expect(operation).toMatchObject({
    id: next.id,
    protocolVersion: 2,
    state: "dispatched",
  });
  expect(
    (
      await (
        await api(`/bridge/${session.id}/poll`, "GET", undefined, auth)
      ).json()
    ).operation,
  ).toBeNull();
  const confirmed = await (
    await api(
      `/bridge/${session.id}/operations/${next.id}`,
      "GET",
      undefined,
      auth,
    )
  ).json();
  expect(confirmed.dispatchId).toBe(operation.dispatchId);
  expect(confirmed.bundle).toBeUndefined();
  for (const action of [
    "approve",
    "build",
    "repair",
    "cancel",
    "visual",
    "studio",
  ]) {
    expect(
      (await api(`/projects/${project.id}/${action}`, "POST", { revision: 1 }))
        .status,
    ).toBe(409);
  }
  expect(
    (
      await api(`/projects/${project.id}`, "PATCH", {
        revision: 1,
        request: project.request,
        answers: {},
      })
    ).status,
  ).toBe(409);
  expect((await api(`/projects/${project.id}`)).ok).toBe(true);
  expect(
    (
      await api(
        `/studio/${session.id}/operations/${next.id}/cancel`,
        "POST",
        {},
      )
    ).ok,
  ).toBe(false);
  const receipt = {
    operationId: next.id,
    dispatchId: operation.dispatchId,
    revision: 1,
    artifactHash: operation.artifactHash,
    ok: true,
    checks: [],
    logs: [],
  };
  expect(
    (await api(`/bridge/${legacy.id}/result`, "POST", receipt, auth)).ok,
  ).toBe(false);
  expect(
    await (
      await api(`/bridge/${session.id}/result`, "POST", receipt, auth)
    ).json(),
  ).toEqual({ duplicate: false });
  expect(
    await (
      await api(`/bridge/${session.id}/result`, "POST", receipt, auth)
    ).json(),
  ).toEqual({ duplicate: true });
  expect(
    (
      await api(`/projects/${project.id}`, "PATCH", {
        revision: 1,
        request: project.request + " with new scenery",
        answers: {},
      })
    ).ok,
  ).toBe(true);
});
it("serves the configured desktop plugin resource with the current local endpoint", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-plugin-resource-"));
  dirs.push(dir);
  const pluginPath = path.join(dir, "plugin.luau");
  fs.writeFileSync(
    pluginPath,
    '-- isolated resource\nlocal endpoint = "http://127.0.0.1:4318"',
  );
  const { api } = await setup({ pluginPath });
  const response = await api("/studio/plugin");
  const source = await response.text();
  expect(source).toContain("isolated resource");
  expect(source).toContain(new URL(response.url).origin);
  expect(source).not.toContain(":4318");
});
it("does not simulate a model or Studio connection when unconfigured", async () => {
  const { api } = await setup();
  expect(await (await api("/status")).json()).toEqual({
    mode: "multi-model",
    configured: false,
    studios: [],
  });
  const p = await (
    await api("/projects", "POST", { request: "A racing game" })
  ).json();
  expect(
    (await api("/projects/" + p.id + "/plan", "POST", { revision: 1 })).status,
  ).toBe(409);
  expect((await api("/projects/" + p.id + "/export")).status).toBe(409);
  expect((await api("/projects/not-an-id")).status).toBe(400);
});
it("binds an explicitly selected asset Studio UUID to the current project revision and rejects malformed or stale requests", async () => {
  const { app, api } = await setup();
  const project = await (
    await api("/projects", "POST", {
      request: "A project requiring retrieved props",
    })
  ).json();
  const studioId = randomUUID(),
    route = `/projects/${project.id}/asset-studio`;
  for (const body of [
    { revision: 1, studioId: "not-a-uuid" },
    { revision: 1 },
    { revision: "1", studioId },
    { revision: 1, studioId, automaticSelection: true },
  ]) {
    expect((await api(route, "POST", body)).status).toBe(400);
    expect(
      app.locals.engine.store.get(project.id).assetStudioId,
    ).toBeUndefined();
  }
  expect((await api(route, "POST", { revision: 2, studioId })).status).toBe(
    409,
  );
  const response = await api(route, "POST", { revision: 1, studioId });
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    id: project.id,
    revision: 1,
    assetStudioId: studioId,
    stage: "draft",
  });
  const retained = app.locals.engine.store.get(project.id);
  expect(retained.assetStudioId).toBe(studioId);
  expect(retained.events.at(-1).message).toContain(studioId);
  expect(retained.jobId).toBeNull();
});
it("refuses asset Studio rebinding while native effects require reconciliation and preserves the original evidence", async () => {
  const { app, api } = await setup();
  const project = await (
    await api("/projects", "POST", {
      request: "A project with an unresolved asset import",
    })
  ).json();
  const originalStudio = randomUUID();
  project.assetStudioId = originalStudio;
  project.assetPipeline = {
    version: 1,
    runId: randomUUID(),
    revision: 1,
    inputHash: "a".repeat(64),
    status: "failed",
    startedAt: "2026-09-15T00:00:00Z",
    finishedAt: "2026-09-15T00:00:01Z",
    policy: {
      maxSearches: 2,
      maxCandidates: 3,
      allowEscalation: false,
      workerRoute: "worker",
      evaluatorRoute: "reviewer",
    },
    adapter: "offline-fixture",
    needs: [],
    entries: [],
    events: [
      {
        at: "2026-09-15T00:00:01Z",
        needId: "tree",
        step: "place_error",
        data: { outcome: "unknown", retry: false },
      },
    ],
    requiresReconciliation: true,
  };
  app.locals.engine.store.save(project);
  const response = await api(`/projects/${project.id}/asset-studio`, "POST", {
    revision: 1,
    studioId: randomUUID(),
  });
  expect(response.ok).toBe(false);
  expect((await response.json()).error).toMatch(/reconcile/i);
  const retained = app.locals.engine.store.get(project.id);
  expect(retained.assetStudioId).toBe(originalStudio);
  expect(retained.assetPipeline).toEqual(project.assetPipeline);
  expect(retained.revision).toBe(1);
});
