import { expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import {
  runtimeConfig,
  runtimeEnvironment,
  startOpenCodeHost,
  createOpenCodeBackend,
  type OpenCodeJob,
} from "../src/generation/opencode-runtime";
import { GenerationStore, newProject } from "../src/generation/store";
import { profile } from "./generation-fixtures";
import { prepareReviewBudget, ReviewBudgetStop, trialFinalReviewPolicy } from "../src/generation/review-budget";

async function withHost(
  body: (
    host: Awaited<ReturnType<typeof startOpenCodeHost>>,
    call: (name: string, args?: unknown) => Promise<any>,
  ) => Promise<void>,
  prepare?: (job: OpenCodeJob) => void,
) {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "takko-runtime-test-"),
  );
  const store = new GenerationStore(directory);
  const project = newProject("Read-only runtime boundary test", 1000000);
  project.jobId = "test";
  store.save(project);
  const signal = new AbortController().signal;
  const job: OpenCodeJob = {
    project,
    store,
    signal,
    profile: profile(),
    phase: "builder",
    key: "never-pass-to-runtime",
    transport: async () => {
      throw Error("No inference in this test");
    },
    tools: [
      {
        name: "read",
        description: "Read a long immutable fixture",
        schema: z.object({}).strict(),
        execute: () => ({ value: "x".repeat(160000) }),
      },
    ],
    prompt: "Test only",
    finished: () => false,
    progress: () => "unchanged",
  };
  prepare?.(job);
  const host = await startOpenCodeHost(job);
  const call = async (name: string, args: unknown = {}) => {
    const response = await fetch(host.url + "/mcp", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + host.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name, arguments: args },
      }),
    });
    return response.json();
  };
  try {
    await body(host, call);
  } finally {
    await host.close();
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

it("returns malformed tool arguments as feedback and accepts a corrected fenced JSON envelope in the same session", async () => {
  await withHost(async (host, call) => {
    expect((await call("read", "{broken")).result.isError).toBe(true);
    host.assertHealthy();
    const result = await call("read", "```json\n{}\n```");
    expect(result.result.isError).toBeUndefined();
    expect(JSON.parse(result.result.content[0].text).totalCharacters).toBeGreaterThan(12000);
  });
});

it("isolates credentials and denies filesystem, shell, network and subagent tools", () => {
  const tools = [
    {
      name: "submit_task",
      description: "Save",
      schema: z.object({}),
      execute() {},
    },
  ];
  const config = runtimeConfig(
    "http://127.0.0.1:7777",
    "local-capability",
    profile(),
    tools,
  );
  const env = runtimeEnvironment(
    path.join(os.tmpdir(), "isolated-runtime"),
    config,
  );
  expect(config.permission).toEqual({
    "*": "deny",
    takko_submit_task: "allow",
  });
  expect(config.enabled_providers).toEqual(["takko"]);
  expect(config.small_model).toBe(config.model);
  expect(env.OPENCODE_DISABLE_DEFAULT_PLUGINS).toBe("true");
  expect(env.OPENCODE_DISABLE_EXTERNAL_SKILLS).toBe("true");
  expect(env.OPENROUTER_API_KEY).toBeUndefined();
  expect(env.FORGE_OPENROUTER_API_KEY).toBeUndefined();
  expect(env.USERPROFILE).not.toBe(process.env.USERPROFILE);
  expect(env.XDG_DATA_HOME).toContain("isolated-runtime");
});

it("rejects unauthenticated and browser-origin requests", async () =>
  withHost(async (host) => {
    expect((await fetch(host.url + "/mcp", { method: "POST" })).status).toBe(
      403,
    );
    expect(
      (
        await fetch(host.url + "/mcp", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + host.token,
            Origin: "https://untrusted.example",
          },
        })
      ).status,
    ).toBe(403);
  }));

it("pages complete immutable evidence beyond twelve pages without silently truncating it", async () =>
  withHost(async (host, call) => {
    const first = await call("read");
    let page = JSON.parse(first.result.content[0].text);
    let text = page.text;
    while (page.nextOffset !== null) {
      const result = await call("read_output", {
        reference: page.reference,
        offset: page.nextOffset,
      });
      expect(result.result.isError).not.toBe(true);
      page = JSON.parse(result.result.content[0].text);
      text += page.text;
    }
    expect(JSON.parse(text)).toEqual({ value: "x".repeat(160000) });
    host.assertHealthy();
  }));

it("stops repeated no-progress tools instead of spending indefinitely", async () =>
  withHost(async (host, call) => {
    for (let i = 0; i < 12; i++) await call("read");
    expect(() => host.assertHealthy()).toThrow(/12 tools/);
  }));

it("rejects an unpinned executable before launch", () => {
  expect(() => createOpenCodeBackend(process.execPath).preflight()).toThrow(
    /does not match/,
  );
});
it("retains the typed protected-budget refusal when the host aborts the coding session", async () => {
  await withHost(async host => {
    const response = await fetch(host.url+"/v1/chat/completions", {
      method:"POST", headers:{Authorization:"Bearer "+host.token,"Content-Type":"application/json"},
      body:JSON.stringify({messages:[{role:"user",content:"Continue the saved task"}]})
    });
    expect(response.status).toBe(403);
    expect(host.signal.aborted).toBe(true);
    expect(()=>host.assertHealthy()).toThrow(ReviewBudgetStop);
  }, job => {
    job.project.budgetMicros = 1;
    prepareReviewBudget(job.project,job.profile,trialFinalReviewPolicy);
    job.store.save(job.project);
  });
});

it("preserves the API model identity required by OpenCode's provider-specific cache transforms", () => {
  const model = { ...profile(), model: "anthropic/claude-sonnet-5" };
  const config = runtimeConfig(
    "http://127.0.0.1:7777",
    "local-capability",
    model,
    [],
  );
  expect(config.provider.takko.models.agent).toMatchObject({ id: model.model });
});
