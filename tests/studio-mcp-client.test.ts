import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { EventEmitter } from "node:events";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { PassThrough, Writable } from "node:stream";
import {
  resolveRobloxMcpExecutable,
  StdioStudioClient,
  closeOwnedStudioChildren,
  type StudioChild,
  type StdioStudioClientOptions,
} from "../src/generation/studio-mcp-client";
type Message = {
  jsonrpc: string;
  id?: number | string;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: unknown;
};
class MockChild extends EventEmitter implements StudioChild {
  stdout = new PassThrough();
  stderr = new PassThrough();
  stdin: Writable;
  messages: Message[] = [];
  killed = 0;
  handler?: (message: Message) => void;
  constructor() {
    super();
    let pending = "";
    this.stdin = new Writable({
      write: (chunk, _encoding, done) => {
        pending += chunk.toString();
        let newline: number;
        while ((newline = pending.indexOf("\n")) !== -1) {
          const line = pending.slice(0, newline);
          pending = pending.slice(newline + 1);
          const message = JSON.parse(line) as Message;
          this.messages.push(message);
          queueMicrotask(() => this.respond(message));
        }
        done();
      },
    });
  }
  reply(id: number | string | undefined, result: unknown) {
    this.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
  }
  respond(message: Message) {
    if (this.handler) {
      this.handler(message);
      return;
    }
    if (message.method === "initialize")
      this.reply(message.id, {
        protocolVersion: "2025-11-25",
        capabilities: { tools: {} },
      });
    if (message.method === "tools/list")
      this.reply(message.id, {
        tools: [
          { name: "list_roblox_studios", inputSchema: { type: "object" } },
          { name: "mutate", inputSchema: { type: "object" } },
        ],
      });
    if (message.method === "tools/call")
      this.reply(message.id, { content: [{ type: "text", text: "observed" }] });
  }
  kill() {
    this.killed++;
    queueMicrotask(() => this.emit("exit", 0, null));
    return true;
  }
}
const clients: StdioStudioClient[] = [],
  directories: string[] = [];
function setup(options: StdioStudioClientOptions = {}) {
  const child = new MockChild();
  const client = new StdioStudioClient({
    executable: path.resolve("StudioMCP.exe"),
    timeoutMs: 1000,
    childFactory: (_executable, spawnOptions) => {
      expect(spawnOptions).toEqual({
        windowsHide: true,
        shell: false,
        stdio: "pipe",
      });
      return child;
    },
    ...options,
  });
  clients.push(client);
  return { client, child };
}
it("service shutdown kills its owned children, forgets exited children and never touches an unrelated child", async () => {
  const a = setup(), b = setup(), unrelated = new MockChild();
  await a.client.listTools();
  await b.client.listTools();
  a.child.emit("exit", 0, null);
  closeOwnedStudioChildren();
  expect(a.child.killed).toBe(0);
  expect(b.child.killed).toBe(1);
  expect(unrelated.killed).toBe(0);
  await new Promise(resolve => setImmediate(resolve));
  closeOwnedStudioChildren();
  expect(b.child.killed).toBe(1);
});
it("normal owner-process exit closes a real owned child without requiring the client caller to close it", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "takko-mcp-test-")); directories.push(directory);
  const marker = path.join(directory, "child.pid");
  const moduleUrl = pathToFileURL(path.resolve("src/generation/studio-mcp-client.ts")).href;
  const script = `import fs from 'node:fs'; import {spawn} from 'node:child_process';
    import {StdioStudioClient} from ${JSON.stringify(moduleUrl)};
    const c=new StdioStudioClient({executable:${JSON.stringify(path.join(directory, "StudioMCP.exe"))},childFactory:(_binary,options)=>{
      const child=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],options);
      fs.writeFileSync(process.argv[1],String(child.pid));return child;
    }}); void c.listTools().catch(()=>{}); setTimeout(()=>process.exit(0),100);`;
  execFileSync(process.execPath, ["--import", "tsx", "--input-type=module", "-e", script, marker], { windowsHide: true, timeout: 5000, stdio: "pipe" });
  const pid = Number(fs.readFileSync(marker, "utf8"));
  const alive = () => { try { process.kill(pid, 0); return true; } catch { return false; } };
  for (let i = 0; i < 20 && alive(); i++) await new Promise(r => setTimeout(r, 50));
  expect(alive()).toBe(false);
});
afterEach(async () => {
  await Promise.all(clients.splice(0).map((client) => client.close()));
  for (const directory of directories.splice(0)) {
    const absolute = path.resolve(directory);
    if (
      !absolute.startsWith(path.resolve(os.tmpdir()) + path.sep) ||
      !path.basename(absolute).startsWith("takko-mcp-test-")
    )
      throw Error("Unexpected test cleanup target");
    fs.rmSync(absolute, { recursive: true, force: true });
  }
});
function installation() {
  const local = fs.mkdtempSync(path.join(os.tmpdir(), "takko-mcp-test-"));
  directories.push(local);
  const versions = path.join(local, "Roblox", "Versions");
  fs.mkdirSync(versions, { recursive: true });
  return { local, versions, launcher: path.join(local, "Roblox", "mcp.bat") };
}
function binary(versions: string, version = "version-aabb") {
  const executable = path.join(versions, version, "StudioMCP.exe");
  fs.mkdirSync(path.dirname(executable), { recursive: true });
  fs.writeFileSync(executable, "owned test fixture; never executed");
  return executable;
}

describe("installed Studio MCP executable discovery", () => {
  it("reads launcher as data and selects the first existing absolute installed binary", () => {
    const fixture = installation(),
      chosen = binary(fixture.versions),
      later = binary(fixture.versions, "version-ccdd");
    fs.writeFileSync(
      fixture.launcher,
      `@echo off\nif exist "${path.join(fixture.versions, "missing", "StudioMCP.exe")}" (...)\nif exist "${chosen}" ( "${chosen}" %* )\n"${later}"\nreg query NEVER_EXECUTED\n`,
    );
    expect(resolveRobloxMcpExecutable({ LOCALAPPDATA: fixture.local })).toBe(
      fs.realpathSync(chosen),
    );
  });
  it("rejects outside-root, relative, interpolated and wrong-name launcher commands", () => {
    const fixture = installation();
    const outside = path.join(fixture.local, "StudioMCP.exe");
    fs.writeFileSync(outside, "fixture");
    fs.writeFileSync(
      fixture.launcher,
      `"${outside}"\n"Versions/version-a/StudioMCP.exe"\n"%LOCALAPPDATA%/Roblox/Versions/version-a/StudioMCP.exe"\n"powershell.exe"`,
    );
    expect(() =>
      resolveRobloxMcpExecutable({ LOCALAPPDATA: fixture.local }),
    ).toThrow("No existing StudioMCP.exe");
    expect(() =>
      resolveRobloxMcpExecutable({ LOCALAPPDATA: "relative" }),
    ).toThrow("absolute");
  });
  it("rejects missing and oversized launchers without exposing their content", () => {
    const fixture = installation();
    expect(() =>
      resolveRobloxMcpExecutable({ LOCALAPPDATA: fixture.local }),
    ).toThrow("No existing StudioMCP.exe");
    fs.writeFileSync(fixture.launcher, "secret".repeat(30_000));
    expect(() =>
      resolveRobloxMcpExecutable({ LOCALAPPDATA: fixture.local }),
    ).toThrow("No existing StudioMCP.exe");
  });
});
describe("owned stdio MCP transport", () => {
  it("initializes and discovers before tool dispatch, preserves text/images and uses one owned process", async () => {
    const { client, child } = setup();
    const result = {
      content: [
        { type: "image", mimeType: "image/png", data: "aW1hZ2U=" },
        { type: "text", text: "data" },
      ],
      isError: false,
    };
    child.handler = (message) => {
      if (message.method === "initialize")
        child.reply(message.id, { protocolVersion: "2025-11-25" });
      if (message.method === "tools/list")
        child.reply(message.id, {
          tools: [{ name: "inspect", inputSchema: { type: "object" } }],
        });
      if (message.method === "tools/call") child.reply(message.id, result);
    };
    expect(await client.callTool("inspect", { studio_id: "one" })).toEqual(
      result,
    );
    expect(child.messages.map((item) => item.method)).toEqual([
      "initialize",
      "notifications/initialized",
      "tools/list",
      "tools/call",
    ]);
    expect(child.messages[0].params).toMatchObject({
      protocolVersion: "2025-11-25",
      capabilities: {},
    });
    await client.close();
    await client.close();
    expect(child.killed).toBe(1);
  });
  it.each(["2025-06-18", "2024-11-05"])(
    "accepts supported server negotiated version %s",
    async (version) => {
      const { client, child } = setup();
      child.handler = (message) => {
        if (message.method === "initialize")
          child.reply(message.id, { protocolVersion: version });
        if (message.method === "tools/list")
          child.reply(message.id, { tools: [] });
      };
      expect(await client.listTools()).toEqual({ tools: [] });
    },
  );
  it("fails unsupported negotiation and kills only its owned child", async () => {
    const { client, child } = setup();
    child.handler = (message) => {
      if (message.method === "initialize")
        child.reply(message.id, { protocolVersion: "2099-01-01" });
    };
    await expect(client.listTools()).rejects.toMatchObject({
      code: "unsupported_protocol",
      outcome: "not_sent",
    });
    expect(child.killed).toBe(1);
    expect(
      child.messages.some((message) => message.method === "tools/list"),
    ).toBe(false);
  });
  it("refuses unlisted names even if the caller modified a returned catalog", async () => {
    const { client, child } = setup();
    const catalog = await client.listTools();
    catalog.tools.push({ name: "unknown" });
    await expect(client.callTool("unknown", {})).rejects.toMatchObject({
      code: "unlisted_tool",
      outcome: "not_sent",
    });
    expect(
      child.messages.filter((message) => message.method === "tools/call"),
    ).toEqual([]);
  });
  it("discovers all catalog pages and rejects duplicate names and pagination cycles", async () => {
    const { client, child } = setup();
    child.handler = (message) => {
      if (message.method === "initialize")
        child.reply(message.id, { protocolVersion: "2025-11-25" });
      if (message.method === "tools/list")
        child.reply(
          message.id,
          message.params?.cursor
            ? { tools: [{ name: "second" }] }
            : { tools: [{ name: "first" }], nextCursor: "next" },
        );
    };
    expect((await client.listTools()).tools.map((item) => item.name)).toEqual([
      "first",
      "second",
    ]);
    child.handler = (message) => {
      if (message.method === "tools/list")
        child.reply(message.id, {
          tools: [{ name: "duplicate" }],
          nextCursor: "same",
        });
    };
    await expect(client.listTools()).rejects.toMatchObject({
      code: "invalid_catalog",
    });
  });
  it("refreshes capabilities after list_changed and does not dispatch a removed tool", async () => {
    const { client, child } = setup();
    await client.listTools();
    child.stdout.write(
      JSON.stringify({
        jsonrpc: "2.0",
        method: "notifications/tools/list_changed",
      }) + "\n",
    );
    child.handler = (message) => {
      if (message.method === "tools/list")
        child.reply(message.id, { tools: [] });
    };
    await expect(client.callTool("mutate", {})).rejects.toMatchObject({
      code: "unlisted_tool",
    });
    expect(
      child.messages.filter((message) => message.method === "tools/call"),
    ).toHaveLength(0);
  });
  it("handles fragmented lines and reversed concurrent response order by request ID", async () => {
    const { client, child } = setup();
    await client.listTools();
    const requests: Message[] = [];
    child.handler = (message) => {
      if (message.method === "tools/call") {
        requests.push(message);
        if (requests.length === 2) {
          for (const request of [...requests].reverse()) {
            const wire =
              JSON.stringify({
                jsonrpc: "2.0",
                id: request.id,
                result: request.params?.arguments,
              }) + "\r\n";
            child.stdout.write(wire.slice(0, 9));
            child.stdout.write(wire.slice(9));
          }
        }
      }
    };
    const result = await Promise.all([
      client.callTool("mutate", { value: 1 }),
      client.callTool("mutate", { value: 2 }),
    ]);
    expect(result).toEqual([{ value: 1 }, { value: 2 }]);
  });
  it("ignores unknown notifications and rejects server-initiated requests without executing them", async () => {
    const { client, child } = setup();
    await client.listTools();
    child.stdout.write(
      JSON.stringify({ jsonrpc: "2.0", method: "unknown/notification" }) +
        "\n" +
        JSON.stringify({
          jsonrpc: "2.0",
          id: "server-request",
          method: "sampling/createMessage",
          params: { secret: "not-run" },
        }) +
        "\n",
    );
    expect(
      child.messages.find((item) => item.id === "server-request"),
    ).toMatchObject({ error: { code: -32601 } });
    expect(await client.callTool("list_roblox_studios", {})).toMatchObject({
      content: expect.any(Array),
    });
  });
  it("rejects a pre-aborted call without spawning", async () => {
    const { client, child } = setup();
    const controller = new AbortController();
    controller.abort();
    await expect(
      client.callTool("mutate", {}, controller.signal),
    ).rejects.toMatchObject({ outcome: "not_sent", code: "aborted" });
    expect(child.messages).toEqual([]);
    expect(child.killed).toBe(0);
  });
  it.each(["abort", "timeout"])(
    "surfaces unknown outcomes after dispatch on %s, ignores late receipt and never retries",
    async (mode) => {
      const { client, child } = setup({ timeoutMs: 30 });
      await client.listTools();
      const controller = new AbortController();
      let dispatched: Message | undefined;
      child.handler = (message) => {
        if (message.method === "tools/call") {
          dispatched = message;
          if (mode === "abort") controller.abort();
        }
      };
      await expect(
        client.callTool("mutate", {}, controller.signal),
      ).rejects.toMatchObject({
        outcome: "unknown",
        code: mode === "abort" ? "aborted" : "timeout",
      });
      child.reply(dispatched!.id, { done: true });
      await expect(client.callTool("mutate", {})).rejects.toMatchObject({
        code: "uncertain_outcome",
        outcome: "unknown",
      });
      expect(
        child.messages.filter((message) => message.method === "tools/call"),
      ).toHaveLength(1);
      expect(client.diagnostics.uncertainOutcome).toBe(true);
    },
  );
  it.each(["exit", "error"])(
    "rejects pending commands when the owned child emits %s",
    async (event) => {
      const { client, child } = setup();
      await client.listTools();
      child.handler = (message) => {
        if (message.method === "tools/call") {
          if (event === "exit") child.emit("exit", 1, null);
          else child.emit("error", Error("secret raw exception"));
        }
      };
      await expect(client.callTool("mutate", {})).rejects.toMatchObject({
        outcome: "unknown",
        code: event === "exit" ? "process_exit" : "process_error",
      });
    },
  );
  it("rejects pending commands on close and does not expose stderr or server error secrets", async () => {
    const { client, child } = setup();
    await client.listTools();
    child.stderr.write("OPENROUTER_API_KEY=secret-token\npassword=hidden");
    child.handler = (message) => {
      if (message.method === "tools/call") void client.close();
    };
    await expect(client.callTool("mutate", {})).rejects.toMatchObject({
      code: "closed",
      outcome: "unknown",
    });
    expect(JSON.stringify(client.diagnostics)).not.toContain("secret");
    expect(client.diagnostics.stderrBytesDiscarded).toBeGreaterThan(0);
    expect(child.killed).toBe(1);
  });
  it("returns explicit RPC rejection without leaking its payload, and preserves tool isError results", async () => {
    const { client, child } = setup();
    await client.listTools();
    child.handler = (message) => {
      if (message.method === "tools/call")
        child.stdout.write(
          JSON.stringify({
            jsonrpc: "2.0",
            id: message.id,
            error: {
              code: -32602,
              message: "secret-token",
              data: { password: "secret" },
            },
          }) + "\n",
        );
    };
    await expect(client.callTool("mutate", {})).rejects.toMatchObject({
      code: "rpc_error",
      outcome: "rejected",
      message: "Studio MCP returned a request error",
    });
    child.handler = (message) => {
      if (message.method === "tools/call")
        child.reply(message.id, {
          isError: true,
          content: [{ type: "text", text: "tool failed" }],
        });
    };
    expect(await client.callTool("mutate", {})).toMatchObject({
      isError: true,
    });
  });
  it.each(["malformed", "oversized"])(
    "fails bounded protocol parsing on %s output",
    async (mode) => {
      const { client, child } = setup();
      await client.listTools();
      child.handler = (message) => {
        if (message.method === "tools/call")
          child.stdout.write(
            mode === "malformed"
              ? "not-json-secret\n"
              : "x".repeat(12 * 1024 * 1024 + 1),
          );
      };
      await expect(client.callTool("mutate", {})).rejects.toMatchObject({
        code: "protocol_error",
        outcome: "unknown",
      });
      expect(child.killed).toBe(1);
    },
  );
  it("rejects oversized local arguments before dispatch without latching uncertainty", async () => {
    const { client, child } = setup();
    await client.listTools();
    await expect(
      client.callTool("mutate", { huge: "x".repeat(12 * 1024 * 1024) }),
    ).rejects.toMatchObject({ code: "request_too_large", outcome: "not_sent" });
    expect(
      child.messages.filter((item) => item.method === "tools/call"),
    ).toHaveLength(0);
    expect(client.diagnostics.uncertainOutcome).toBe(false);
  });
  it("rejects unsafe executable overrides and invalid timeout bounds", () => {
    expect(() => new StdioStudioClient({ executable: "cmd.exe" })).toThrow(
      "exact-named",
    );
    expect(
      () =>
        new StdioStudioClient({ executable: path.resolve("powershell.exe") }),
    ).toThrow("exact-named");
    expect(() => new StdioStudioClient({ timeoutMs: 120001 })).toThrow(
      "120000",
    );
  });
});
