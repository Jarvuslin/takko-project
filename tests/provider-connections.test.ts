import { afterEach, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Server } from "node:http";
import { createApp } from "../src/server/app";
import { Configuration } from "../src/generation/settings";
import { windowsCredentialVault } from "../src/generation/credential-vault";
import { validateProviderKey } from "../src/generation/provider-connection";
import { profile } from "./generation-fixtures";
const dirs: string[] = [],
  servers: Server[] = [];
const directory = () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "takko-provider-"));
  dirs.push(d);
  return d;
};
const candidate = () => ({
  ...profile(),
  provider: "openrouter" as const,
  baseUrl: "https://openrouter.ai/api/v1",
});
afterEach(async () => {
  for (const server of servers.splice(0))
    await new Promise<void>((r) => server.close(() => r()));
  for (const d of dirs.splice(0))
    fs.rmSync(d, { recursive: true, force: true });
});
async function setup() {
  const calls: string[] = [];
  const app = createApp(directory(), {
    transport: (async (url, init) => {
      calls.push(String(url));
      if (
        (init?.headers as Record<string, string>)?.Authorization !==
        "Bearer synthetic-valid"
      )
        return Response.json(
          { error: "secret must never echo" },
          { status: 401 },
        );
      return Response.json(
        String(url).endsWith("/key")
          ? { data: { limit_remaining: 1 } }
          : { data: [{ id: "one" }, { id: "two" }] },
      );
    }) as typeof fetch,
  });
  const server = app.listen(0, "127.0.0.1");
  servers.push(server);
  await new Promise<void>((r) => server.once("listening", r));
  const api = (route: string, method = "POST", body?: unknown) =>
    fetch(
      `http://127.0.0.1:${(server.address() as { port: number }).port}/api${route}`,
      {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      },
    );
  return { api, calls };
}
it("blocks catalog and new model saves before validation without contacting a provider", async () => {
  const { api, calls } = await setup();
  const p = candidate();
  expect((await api("/model-catalog", "POST", { profile: p })).ok).toBe(false);
  expect(
    (await api("/model-profiles/" + p.id, "PUT", { profile: p })).status,
  ).toBe(400);
  expect(calls).toEqual([]);
});
it("rejects invalid keys without echoing or saving them", async () => {
  const { api, calls } = await setup();
  const result = await api("/provider-connections", "POST", {
    profile: candidate(),
    key: "synthetic-invalid",
  });
  expect(result.status).toBe(400);
  expect(await result.text()).not.toContain("synthetic-invalid");
  expect((await (await api("/models", "GET")).json()).connections).toEqual([]);
  expect(calls).toEqual(["https://openrouter.ai/api/v1/key"]);
});
it("one validated provider serves two models and survives deleting the first model", async () => {
  const { api, calls } = await setup();
  const p = candidate();
  expect(
    (
      await api("/provider-connections", "POST", {
        profile: p,
        key: "synthetic-valid",
      })
    ).ok,
  ).toBe(true);
  const catalog = await api("/model-catalog", "POST", { profile: p });
  expect(catalog.ok).toBe(true);
  for (const model of [p, { ...p, id: crypto.randomUUID(), model: "two" }])
    expect(
      (await api("/model-profiles/" + model.id, "PUT", { profile: model })).ok,
    ).toBe(true);
  await api("/model-profiles/" + p.id, "DELETE");
  const result = await api("/models", "GET");
  const text = await result.text();
  expect(text).not.toContain("synthetic-valid");
  expect(JSON.parse(text).profiles[0].hasKey).toBe(true);
  expect(calls.every((c) => c.endsWith("/key") || c.endsWith("/models"))).toBe(
    true,
  );
});
it("failed replacement keeps the valid connection and disconnect removes it from all models", async () => {
  const { api } = await setup();
  const p = candidate();
  await api("/provider-connections", "POST", {
    profile: p,
    key: "synthetic-valid",
  });
  await api("/provider-connections", "POST", { profile: p, key: "bad" });
  expect((await api("/model-profiles/" + p.id, "PUT", { profile: p })).ok).toBe(
    true,
  );
  await api("/provider-connections", "DELETE", { profile: p });
  expect((await (await api("/models", "GET")).json()).profiles[0].hasKey).toBe(
    false,
  );
  expect((await api("/model-catalog", "POST", { profile: p })).ok).toBe(false);
});
it("keys never cross provider or endpoint boundaries, including edits", () => {
  const config = new Configuration(directory());
  const p = candidate();
  config.connect(p, "synthetic-valid");
  config.save({ ...config.read(), profiles: [p] });
  expect(config.key(p.id)).toBe("synthetic-valid");
  config.save({
    ...config.read(),
    profiles: [
      { ...p, provider: "compatible", baseUrl: "https://elsewhere.example/v1" },
    ],
  });
  expect(config.key(p.id)).toBe("");
});
it("uses provider-specific auth headers and never follows redirects", async () => {
  for (const [provider, baseUrl, header] of [
    ["openai", "https://api.openai.com/v1", "Authorization"],
    ["anthropic", "https://api.anthropic.com/v1", "x-api-key"],
    [
      "gemini",
      "https://generativelanguage.googleapis.com/v1beta",
      "x-goog-api-key",
    ],
  ] as const) {
    await validateProviderKey(
      { ...profile(), provider, baseUrl },
      "fixture",
      (async (_url, init) => {
        expect(init?.redirect).toBe("error");
        expect((init?.headers as Record<string, string>)[header]).toContain(
          "fixture",
        );
        return Response.json({ data: [] });
      }) as typeof fetch,
    );
  }
});
it("storage failure does not silently claim a saved connection", () => {
  const config = new Configuration(directory(), {
    read: () => ({}),
    write: () => {
      throw Error("Cannot encrypt");
    },
  });
  expect(() => config.connect(candidate(), "synthetic-valid")).toThrow(
    "Cannot encrypt",
  );
  expect(config.public().connections).toEqual([]);
});
it.skipIf(process.platform !== "win32")(
  "Windows vault contains no plaintext and restores keys after a fresh Configuration",
  () => {
    const dir = directory(),
      file = path.join(dir, "provider-keys.dpapi"),
      p = candidate();
    const first = new Configuration(dir, windowsCredentialVault(file));
    first.connect(p, "synthetic-vault-key");
    first.save({ ...first.read(), profiles: [p] });
    expect(fs.readFileSync(file, "utf8")).not.toContain("synthetic-vault-key");
    expect(
      fs.readFileSync(path.join(dir, "models.json"), "utf8"),
    ).not.toContain("synthetic-vault-key");
    const second = new Configuration(dir, windowsCredentialVault(file));
    expect(second.key(p.id)).toBe("synthetic-vault-key");
    expect(second.isValidated(p)).toBe(false);
    second.disconnect(p);
    expect(new Configuration(dir, windowsCredentialVault(file)).key(p.id)).toBe(
      "",
    );
  },
  20000,
);
