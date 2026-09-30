import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import type { Readable, Writable } from "node:stream";

const MAX_LINE_BYTES = 12 * 1024 * 1024;
const SUPPORTED_VERSIONS = new Set(["2025-11-25", "2025-06-18", "2024-11-05"]);
export class StudioMcpError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly outcome: "not_sent" | "unknown" | "rejected",
  ) {
    super(message);
    this.name = "StudioMcpError";
  }
}
export interface StudioTool {
  name: string;
  [key: string]: unknown;
}
export interface StudioChild {
  stdin: Writable;
  stdout: Readable;
  stderr: Readable;
  on(event: "error", listener: (error: Error) => void): this;
  on(
    event: "exit",
    listener: (code: number | null, signal: string | null) => void,
  ): this;
  kill(): boolean;
}
// Track process objects, never enumerate/kill by executable name or a reused PID.
const ownedChildren = new Set<StudioChild>();
let exitHookInstalled = false;
export function closeOwnedStudioChildren() {
  for (const child of ownedChildren) {
    try { child.kill(); } catch { /* Best effort during synchronous process exit. */ }
  }
}
function ownChild(child: StudioChild) {
  ownedChildren.add(child);
  child.on("exit", () => ownedChildren.delete(child));
  if (!exitHookInstalled) {
    process.once("exit", closeOwnedStudioChildren);
    exitHookInstalled = true;
  }
}
export type StudioChildFactory = (
  executable: string,
  options: { windowsHide: true; shell: false; stdio: "pipe" },
) => StudioChild;
export interface StdioStudioClientOptions {
  executable?: string;
  env?: NodeJS.ProcessEnv;
  timeoutMs?: number;
  childFactory?: StudioChildFactory;
}
function isWithin(candidate: string, directory: string) {
  const relative = path.relative(directory, candidate);
  return (
    relative !== "" &&
    !path.isAbsolute(relative) &&
    relative !== ".." &&
    !relative.startsWith(".." + path.sep)
  );
}
/** Read the installed launcher as data; never execute BAT commands or registry queries. */
export function resolveRobloxMcpExecutable(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const local = env.LOCALAPPDATA;
  if (!local || !path.isAbsolute(local))
    throw new StudioMcpError(
      "not_installed",
      "LOCALAPPDATA must identify an absolute local Roblox installation directory",
      "not_sent",
    );
  const roblox = path.join(local, "Roblox"),
    versions = path.join(roblox, "Versions"),
    launcher = path.join(roblox, "mcp.bat");
  try {
    if (
      !fs.statSync(launcher).isFile() ||
      fs.statSync(launcher).size > 128 * 1024
    )
      throw Error("Invalid launcher");
    const content = fs.readFileSync(launcher, "utf8");
    for (const match of content.matchAll(
      /"([^"\r\n]*[\\/]StudioMCP\.exe)"/gi,
    )) {
      const candidate = match[1];
      if (
        !path.isAbsolute(candidate) ||
        !isWithin(path.resolve(candidate), path.resolve(versions))
      )
        continue;
      if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile())
        continue;
      const real = fs.realpathSync(candidate);
      if (
        !isWithin(real, fs.realpathSync(versions)) ||
        path.basename(real).toLowerCase() !== "studiomcp.exe"
      )
        continue;
      return real;
    }
  } catch {
    /* Fail closed without returning launcher contents or environment values. */
  }
  throw new StudioMcpError(
    "not_installed",
    "No existing StudioMCP.exe under the installed Roblox Versions directory was found in mcp.bat",
    "not_sent",
  );
}
type Pending = {
  method: string;
  sent: boolean;
  resolve: (value: unknown) => void;
  reject: (error: StudioMcpError) => void;
  timer: ReturnType<typeof setTimeout>;
  signal?: AbortSignal;
  onAbort?: () => void;
};
function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** One owned MCP process. An uncertain tool action is never retried or silently cleared. */
export class StdioStudioClient {
  private child?: StudioChild;
  private initialization?: Promise<void>;
  private discovery?: Promise<{ tools: StudioTool[] }>;
  private tools?: StudioTool[];
  private catalogVersion = 0;
  private nextId = 1;
  private pending = new Map<number, Pending>();
  private closed = false;
  private failed?: StudioMcpError;
  private uncertain = false;
  private fragments: Buffer[] = [];
  private lineBytes = 0;
  private stderrBytes = 0;
  private timeoutMs: number;
  constructor(private readonly options: StdioStudioClientOptions = {}) {
    this.timeoutMs = options.timeoutMs ?? 30_000;
    if (
      !Number.isInteger(this.timeoutMs) ||
      this.timeoutMs < 1 ||
      this.timeoutMs > 120_000
    )
      throw new StudioMcpError(
        "invalid_options",
        "Studio MCP timeout must be between 1 and 120000 milliseconds",
        "not_sent",
      );
    if (
      options.executable &&
      (!path.isAbsolute(options.executable) ||
        path.basename(options.executable).toLowerCase() !== "studiomcp.exe")
    )
      throw new StudioMcpError(
        "invalid_executable",
        "Executable override must be an absolute, exact-named StudioMCP.exe path",
        "not_sent",
      );
  }
  get diagnostics() {
    return {
      stderrBytesDiscarded: this.stderrBytes,
      uncertainOutcome: this.uncertain,
    };
  }
  async listTools(signal?: AbortSignal): Promise<{ tools: StudioTool[] }> {
    await this.initialize(signal);
    return this.discover(signal);
  }
  async callTool(
    name: string,
    args: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<unknown> {
    this.assertUsable(signal);
    if (typeof name !== "string" || !name || !object(args))
      throw new StudioMcpError(
        "invalid_arguments",
        "Tool name and argument object are required",
        "not_sent",
      );
    await this.initialize(signal);
    if (!this.tools) await this.discover(signal);
    this.assertUsable(signal);
    if (this.uncertain)
      throw new StudioMcpError(
        "uncertain_outcome",
        "A prior Studio tool outcome is unknown; do not replay it or dispatch further actions without reconciling Studio state",
        "unknown",
      );
    if (!this.tools?.some((tool) => tool.name === name))
      throw new StudioMcpError(
        "unlisted_tool",
        "Tool is not present in the discovered Studio MCP tool catalog",
        "not_sent",
      );
    return this.request("tools/call", { name, arguments: args }, signal);
  }
  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    this.failAll(
      "closed",
      "Studio MCP client closed; any dispatched tool without a receipt has an unknown outcome",
    );
    this.fragments = [];
    this.lineBytes = 0;
    if (this.child) {
      try {
        this.child.kill();
      } catch {
        /* Owned child may already have exited. */
      }
    }
  }
  private assertUsable(signal?: AbortSignal) {
    if (signal?.aborted)
      throw new StudioMcpError(
        "aborted",
        "Studio MCP request aborted before dispatch",
        "not_sent",
      );
    if (this.closed)
      throw new StudioMcpError(
        "closed",
        "Studio MCP client is closed",
        "not_sent",
      );
    if (this.failed) throw this.failed;
  }
  private initialize(signal?: AbortSignal): Promise<void> {
    this.assertUsable(signal);
    if (!this.initialization)
      this.initialization = this.start(signal).catch(async (error) => {
        await this.close();
        throw error;
      });
    return this.initialization;
  }
  private async start(signal?: AbortSignal) {
    const executable =
      this.options.executable ?? resolveRobloxMcpExecutable(this.options.env);
    try {
      const factory: StudioChildFactory =
        this.options.childFactory ??
        ((binary, options) => spawn(binary, [], options));
      this.child = factory(executable, {
        windowsHide: true,
        shell: false,
        stdio: "pipe",
      });
      ownChild(this.child);
    } catch {
      throw new StudioMcpError(
        "spawn_failed",
        "Failed to start the owned Studio MCP executable",
        "not_sent",
      );
    }
    this.child.stdout.on("data", (chunk: Buffer | string) =>
      this.receive(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)),
    );
    this.child.stderr.on("data", (chunk: Buffer | string) => {
      // Never retain/log server stderr: it may contain paths, tokens or user content.
      this.stderrBytes = Math.min(
        Number.MAX_SAFE_INTEGER,
        this.stderrBytes + Buffer.byteLength(chunk),
      );
    });
    this.child.stdin.on("error", () =>
      this.failAll(
        "write_failed",
        "Studio MCP input stream failed; dispatched tool outcomes may be unknown",
      ),
    );
    this.child.stdout.on("error", () =>
      this.failAll(
        "stream_failed",
        "Studio MCP output stream failed; dispatched tool outcomes may be unknown",
      ),
    );
    this.child.stderr.on("error", () => {
      /* No diagnostics content retained. */
    });
    this.child.on("error", () =>
      this.failAll(
        "process_error",
        "Owned Studio MCP process failed; dispatched tool outcomes may be unknown",
      ),
    );
    this.child.on("exit", () =>
      this.failAll(
        "process_exit",
        "Owned Studio MCP process exited; dispatched tool outcomes may be unknown",
      ),
    );
    const result = await this.request(
      "initialize",
      {
        protocolVersion: "2025-11-25",
        capabilities: {},
        clientInfo: { name: "takko-studio", version: "0.2.0" },
      },
      signal,
    );
    if (
      !object(result) ||
      typeof result.protocolVersion !== "string" ||
      !SUPPORTED_VERSIONS.has(result.protocolVersion)
    )
      throw new StudioMcpError(
        "unsupported_protocol",
        "Studio MCP negotiated an unsupported protocol version",
        "not_sent",
      );
    this.write({ jsonrpc: "2.0", method: "notifications/initialized" });
  }
  private async discover(
    signal?: AbortSignal,
  ): Promise<{ tools: StudioTool[] }> {
    this.assertUsable(signal);
    if (!this.discovery) {
      this.discovery = (async () => {
        const version = this.catalogVersion;
        const tools: StudioTool[] = [],
          cursors = new Set<string>();
        let cursor: string | undefined;
        do {
          const result = await this.request(
            "tools/list",
            cursor === undefined ? {} : { cursor },
            signal,
          );
          if (
            !object(result) ||
            !Array.isArray(result.tools) ||
            result.tools.some(
              (tool) =>
                !object(tool) || typeof tool.name !== "string" || !tool.name,
            )
          )
            throw new StudioMcpError(
              "invalid_catalog",
              "Studio MCP returned an invalid tool catalog",
              "not_sent",
            );
          tools.push(...(result.tools as StudioTool[]));
          if (
            tools.length > 2000 ||
            new Set(tools.map((tool) => tool.name)).size !== tools.length
          )
            throw new StudioMcpError(
              "invalid_catalog",
              "Studio MCP tool catalog exceeds bounds or contains duplicate names",
              "not_sent",
            );
          if (
            result.nextCursor !== undefined &&
            typeof result.nextCursor !== "string"
          )
            throw new StudioMcpError(
              "invalid_catalog",
              "Studio MCP returned an invalid catalog cursor",
              "not_sent",
            );
          cursor = result.nextCursor as string | undefined;
          if (cursor !== undefined) {
            if (cursors.has(cursor) || cursors.size >= 32)
              throw new StudioMcpError(
                "invalid_catalog",
                "Studio MCP tool catalog pagination did not terminate",
                "not_sent",
              );
            cursors.add(cursor);
          }
        } while (cursor !== undefined);
        if (version !== this.catalogVersion)
          throw new StudioMcpError(
            "catalog_changed",
            "Studio MCP catalog changed during discovery; refresh it before dispatch",
            "not_sent",
          );
        this.tools = tools;
        return { tools: structuredClone(tools) };
      })();
    }
    try {
      return await this.discovery;
    } finally {
      this.discovery = undefined;
    }
  }
  private write(value: unknown) {
    const serialized = JSON.stringify(value);
    if (Buffer.byteLength(serialized) > MAX_LINE_BYTES)
      throw new StudioMcpError(
        "request_too_large",
        "Studio MCP request exceeds the bounded line size",
        "not_sent",
      );
    this.child!.stdin.write(serialized + "\n");
  }
  private request(
    method: string,
    params: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<unknown> {
    this.assertUsable(signal);
    if (this.pending.size >= 128)
      throw new StudioMcpError(
        "too_many_requests",
        "Studio MCP pending request limit reached",
        "not_sent",
      );
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const expire = (code: string) => {
        const pending = this.pending.get(id);
        if (!pending) return;
        const unknown = method === "tools/call" && pending.sent;
        if (unknown) this.uncertain = true;
        this.settle(
          id,
          new StudioMcpError(
            code,
            unknown
              ? "Studio tool was dispatched but its outcome is unknown; no automatic retry is permitted"
              : "Studio MCP request ended before tool dispatch",
            unknown ? "unknown" : "not_sent",
          ),
        );
      };
      const pending: Pending = {
        method,
        sent: false,
        resolve,
        reject,
        timer: setTimeout(() => expire("timeout"), this.timeoutMs),
        signal,
      };
      this.pending.set(id, pending);
      if (signal) {
        pending.onAbort = () => expire("aborted");
        signal.addEventListener("abort", pending.onAbort, { once: true });
      }
      try {
        // Serialize before marking sent so invalid local arguments cannot be mistaken for a Studio mutation.
        const encoded = JSON.stringify({ jsonrpc: "2.0", id, method, params });
        if (Buffer.byteLength(encoded) > MAX_LINE_BYTES)
          throw new StudioMcpError(
            "request_too_large",
            "Studio MCP request exceeds the bounded line size",
            "not_sent",
          );
        if (!this.pending.has(id) || signal?.aborted) {
          expire("aborted");
          return;
        }
        pending.sent = true;
        this.child!.stdin.write(encoded + "\n");
      } catch (error) {
        const unknown = pending.sent && method === "tools/call";
        if (unknown) this.uncertain = true;
        this.settle(
          id,
          error instanceof StudioMcpError
            ? error
            : new StudioMcpError(
                "write_failed",
                "Studio MCP request could not be written",
                unknown ? "unknown" : "not_sent",
              ),
        );
      }
    });
  }
  private settle(id: number, error?: StudioMcpError, value?: unknown) {
    const pending = this.pending.get(id);
    if (!pending) return;
    this.pending.delete(id);
    clearTimeout(pending.timer);
    if (pending.onAbort)
      pending.signal?.removeEventListener("abort", pending.onAbort);
    if (error) pending.reject(error);
    else pending.resolve(value);
  }
  private failAll(code: string, message: string) {
    for (const [id, pending] of this.pending) {
      const unknown = pending.sent && pending.method === "tools/call";
      if (unknown) this.uncertain = true;
      this.settle(
        id,
        new StudioMcpError(code, message, unknown ? "unknown" : "not_sent"),
      );
    }
    this.failed = new StudioMcpError(
      code,
      message,
      this.uncertain ? "unknown" : "not_sent",
    );
  }
  private receive(chunk: Buffer) {
    if (this.closed || this.failed) return;
    let offset = 0;
    while (offset < chunk.length) {
      const newline = chunk.indexOf(10, offset),
        end = newline === -1 ? chunk.length : newline;
      const fragment = chunk.subarray(offset, end);
      this.lineBytes += fragment.length;
      if (this.lineBytes > MAX_LINE_BYTES) {
        this.protocolFailure(
          "Studio MCP output exceeded the bounded line size",
        );
        return;
      }
      this.fragments.push(fragment);
      if (this.fragments.length >= 1024)
        this.fragments = [Buffer.concat(this.fragments, this.lineBytes)];
      if (newline === -1) return;
      const line = Buffer.concat(this.fragments, this.lineBytes)
        .toString("utf8")
        .trim();
      this.fragments = [];
      this.lineBytes = 0;
      offset = newline + 1;
      if (!line) continue;
      let message: unknown;
      try {
        message = JSON.parse(line);
      } catch {
        this.protocolFailure("Studio MCP returned malformed JSON");
        return;
      }
      if (!object(message) || message.jsonrpc !== "2.0") {
        this.protocolFailure(
          "Studio MCP returned an invalid JSON-RPC envelope",
        );
        return;
      }
      if (typeof message.method === "string") {
        if (message.id !== undefined) {
          // Reject server-initiated sampling/elicitation/etc. No arbitrary local work is performed.
          if (
            typeof message.id === "string" ||
            typeof message.id === "number"
          ) {
            try {
              this.write({
                jsonrpc: "2.0",
                id: message.id,
                error: {
                  code: -32601,
                  message: "Server requests are not supported by this client",
                },
              });
            } catch {
              this.protocolFailure(
                "Studio MCP server request could not be rejected",
              );
              return;
            }
          }
        } else if (message.method === "notifications/tools/list_changed") {
          this.tools = undefined;
          this.catalogVersion++;
        }
        continue;
      }
      if (typeof message.id !== "number" || !this.pending.has(message.id))
        continue; // Late/cancelled/unknown receipt, never a new action.
      if (Object.hasOwn(message, "error")) {
        const pending = this.pending.get(message.id)!;
        const errorCode = object(message.error)
          ? message.error.code
          : undefined;
        const rejected = errorCode === -32601 || errorCode === -32602;
        const unknown = pending.method === "tools/call" && !rejected;
        if (unknown) this.uncertain = true;
        this.settle(
          message.id,
          new StudioMcpError(
            "rpc_error",
            "Studio MCP returned a request error" +
              (unknown ? "; tool outcome is unknown; do not retry" : ""),
            unknown ? "unknown" : "rejected",
          ),
        );
      } else if (Object.hasOwn(message, "result"))
        this.settle(message.id, undefined, message.result);
      else {
        this.protocolFailure(
          "Studio MCP response has neither result nor error",
        );
        return;
      }
    }
  }
  private protocolFailure(message: string) {
    this.failAll(
      "protocol_error",
      message + "; dispatched tool outcomes may be unknown",
    );
    void this.close();
  }
}
