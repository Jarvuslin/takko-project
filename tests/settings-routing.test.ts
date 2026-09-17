import { it, expect, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Configuration } from "../src/generation/settings";
import { Engine } from "../src/generation/engine";
import { GenerationStore } from "../src/generation/store";
import { profile, fakeTransport } from "./generation-fixtures";
const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0))
    fs.rmSync(d, { recursive: true, force: true });
});
function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-routing-"));
  dirs.push(dir);
  return { dir, config: new Configuration(path.join(dir, "config")) };
}
it("reuses a session key only at the same provider endpoint without persisting it", () => {
  const { config, dir } = setup();
  const a = profile(),
    b = profile(),
    other = { ...profile(), baseUrl: "https://other.example/v1" };
  config.save({
    profiles: [a, b, other],
    routes: { planner: [a.id], builder: [], reviewer: [], repair: [] },
    budgetMicros: 1e6,
    repairLimit: 0,
  });
  config.setKey(a.id, "secret-session-fixture");
  config.copyKey(a.id, b.id);
  expect(config.key(b.id)).toBe("secret-session-fixture");
  expect(() => config.copyKey(a.id, other.id)).toThrow("same provider");
  expect(JSON.stringify(config.public())).not.toContain(
    "secret-session-fixture",
  );
  expect(
    fs.readFileSync(path.join(dir, "config", "models.json"), "utf8"),
  ).not.toContain("secret-session-fixture");
});
it("rejects insecure endpoints, embedded credentials and invalid routing references", () => {
  const { config } = setup();
  const p = profile();
  const settings = {
    profiles: [p],
    routes: { planner: [p.id], builder: [], reviewer: [], repair: [] },
    budgetMicros: 1e6,
    repairLimit: 0,
  };
  for (const url of [
    "http://remote.example/v1",
    "https://user:secret@remote.example/v1",
    "https://example.com/v1?key=secret",
  ])
    expect(() =>
      config.save({ ...settings, profiles: [{ ...p, baseUrl: url }] }),
    ).toThrow();
  expect(() => config.save({ ...settings, profiles: [] })).toThrow("unknown");
  expect(() =>
    config.save({ ...settings, profiles: [{ ...p, provider: "openai" }] }),
  ).toThrow("official");
});
it("falls back only along configured routes and charges the uncertain failed attempt", async () => {
  const { dir, config } = setup();
  const first = profile(),
    second = { ...profile(), model: "fallback" };
  config.save({
    profiles: [first, second],
    routes: {
      planner: [first.id, second.id],
      builder: [],
      reviewer: [],
      repair: [],
    },
    budgetMicros: 1e6,
    repairLimit: 0,
  });
  let calls = 0;
  const fixture = fakeTransport();
  const transport = (async (url, init) => {
    calls++;
    return calls === 1
      ? new Response("rate limit", { status: 429 })
      : fixture(url, init);
  }) as typeof fetch;
  const engine = new Engine(new GenerationStore(dir), config, transport);
  const p = engine.create("Build a farming game");
  engine.start(p.id, 1, "plan");
  const result = await engine.wait(p.id);
  expect(result.stage).toBe("review");
  expect(result.charges.map((c) => c.model)).toEqual(["fixture", "fallback"]);
  expect(result.charges[0].estimated).toBe(true);
  expect(result.charges[0].chargedMicros).toBeGreaterThan(0);
});
it("does not leak the request to a fallback after an authentication failure", async () => {
  const { dir, config } = setup();
  const first = profile(),
    second = profile();
  config.save({
    profiles: [first, second],
    routes: {
      planner: [first.id, second.id],
      builder: [],
      reviewer: [],
      repair: [],
    },
    budgetMicros: 1e6,
    repairLimit: 0,
  });
  let calls = 0;
  const engine = new Engine(new GenerationStore(dir), config, (async () => {
    calls++;
    return new Response("secret", { status: 401 });
  }) as typeof fetch);
  const p = engine.create("Build a farming game");
  engine.start(p.id, 1, "plan");
  const result = await engine.wait(p.id);
  expect(result.stage).toBe("failed");
  expect(result.error).toBe("Provider returned HTTP 401");
  expect(calls).toBe(1);
});
