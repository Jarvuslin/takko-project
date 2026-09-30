import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
import { rehearsalTransport, rehearsalKey } from "../desktop/rehearsal";
import { completeDecision, JEV_MODEL } from "../src/generation/decisions";
import { profile } from "./generation-fixtures";
const directories: string[] = [];
afterEach(() => {
  for (const dir of directories.splice(0))
    fs.rmSync(dir, { recursive: true, force: true });
});
function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-rehearsal-"));
  directories.push(dir);
  const file = path.join(dir, "rehearsal.json"),
    endpoint = "http://127.0.0.1:12345/replay",
    token = randomUUID();
  const manifest = {
    version: 1,
    mode: "offline-model-transport",
    workspace: dir,
    endpoint,
    token,
  };
  fs.writeFileSync(file, JSON.stringify(manifest));
  return { dir, file, manifest, env: { FORGE_REHEARSAL_FILE: file } };
}
it("intercepts actual provider-shaped requests locally without forwarding authentication", async () => {
  const f = fixture(),
    receiver = vi.fn<typeof fetch>(
      async () =>
        new Response("data: [DONE]\n\n", {
          headers: { "Content-Type": "text/event-stream" },
        }),
    );
  const transport = rehearsalTransport(f.dir, f.env, receiver)!;
  const response = await transport(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: { Authorization: "Bearer " + rehearsalKey },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-5.5",
        messages: [],
        stream: true,
      }),
    },
  );
  expect(await response.text()).toBe("data: [DONE]\n\n");
  const [url, init] = receiver.mock.calls[0];
  expect(String(url)).toBe(f.manifest.endpoint);
  expect(init?.redirect).toBe("error");
  expect(JSON.stringify(init)).not.toContain(rehearsalKey);
  expect(JSON.parse(String(init?.body))).toMatchObject({
    url: "https://openrouter.ai/api/v1/chat/completions",
    method: "POST",
  });
});
it("denies other credentials and destinations without any dispatch", async () => {
  const f = fixture(),
    receiver = vi.fn<typeof fetch>();
  const transport = rehearsalTransport(f.dir, f.env, receiver)!;
  for (const [url, key] of [
    ["https://openrouter.ai/api/v1/chat/completions", "unapproved-credential"],
    ["https://example.com/api/v1/chat/completions", rehearsalKey],
    ["https://openrouter.ai/unexpected", rehearsalKey],
  ])
    await expect(
      transport(url, { headers: { Authorization: "Bearer " + key } }),
    ).rejects.toThrow("No external request");
  expect(receiver).not.toHaveBeenCalled();
});
it("requires a matching isolated workspace with no vault and an exact loopback responder", () => {
  const f = fixture();
  fs.writeFileSync(
    path.join(f.dir, "provider-keys.dpapi"),
    "test-owned sentinel, not a real vault",
  );
  expect(() => rehearsalTransport(f.dir, f.env)).toThrow("credential vault");
  fs.unlinkSync(path.join(f.dir, "provider-keys.dpapi"));
  for (const endpoint of [
    "https://example.com/replay",
    "http://localhost:12345/replay",
    "http://127.0.0.1:12345/replay?redirect=1",
  ]) {
    fs.writeFileSync(f.file, JSON.stringify({ ...f.manifest, endpoint }));
    expect(() => rehearsalTransport(f.dir, f.env)).toThrow("exact loopback");
  }
  expect(() => rehearsalTransport(path.join(f.dir, "other"), f.env)).toThrow(
    "explicit absolute workspace",
  );
  expect(rehearsalTransport(f.dir, {})).toBeUndefined();
});
it("rejects junction aliases of the canonical workspace", () => {
  const f = fixture(),
    canonical = path.join(f.dir, "Forge Desktop"),
    alias = path.join(f.dir, "alias");
  fs.mkdirSync(canonical);
  fs.symlinkSync(
    canonical,
    alias,
    process.platform === "win32" ? "junction" : "dir",
  );
  fs.writeFileSync(
    path.join(canonical, "rehearsal.json"),
    JSON.stringify({ ...f.manifest, workspace: alias }),
  );
  expect(() =>
    rehearsalTransport(alias, {
      APPDATA: f.dir,
      FORGE_REHEARSAL_FILE: path.join(alias, "rehearsal.json"),
    }),
  ).toThrow("canonical desktop");
});
it("accepts the real decision producer endpoint and reconciles an explicit zero-cost replay", async () => {
  const f = fixture();
  const receiver = vi.fn<typeof fetch>(async (_url, init) => {
    const envelope = JSON.parse(String(init?.body));
    expect(envelope.url).toBe("https://openrouter.ai/api/alpha/decisions");
    const body = JSON.parse(envelope.body);
    expect(body.questions.script_0.type).toBe("choice");
    return Response.json({
      model: JEV_MODEL,
      answers: { script_0: { type: "choice", choice: "disable" } },
      usage: { input_tokens: 0, output_tokens: 0, cost: 0 },
    });
  });
  const value = await completeDecision(
    {
      ...profile("openrouter"),
      model: JEV_MODEL,
      baseUrl: "https://openrouter.ai/api/v1",
      inputRate: 0.042,
      outputRate: 0,
    },
    rehearsalKey,
    {
      state: { sources: [{ name: "Note", source: "-- author note" }] },
      questions: {
        script_0: {
          type: "choice",
          instructions: "Classify source for this role",
          criteria: {
            disable: "No executable behavior",
            keep: "Useful behavior",
          },
        },
      },
    },
    new AbortController().signal,
    rehearsalTransport(f.dir, f.env, receiver),
  );
  expect(value.costMicros).toBe(0);
  expect(receiver).toHaveBeenCalledOnce();
});
