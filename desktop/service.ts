import fs from "node:fs";
import path from "node:path";
import express from "express";
import { createApp } from "../src/server/app";
import { windowsCredentialVault } from "../src/generation/credential-vault";
import { closeOwnedStudioChildren } from "../src/generation/studio-mcp-client";
import { rehearsalTransport } from "./rehearsal";
import { serviceLease } from "./service-lease";

type OwnerPort = { on(event: "close", callback: () => void): void; start(): void };

// Electron utilityProcess supplies parentPort. Node IPC is used only by offline tests.
const parentPort = (
  process as unknown as {
    parentPort?: {
      postMessage: (message: unknown) => void;
      on: (event: string, cb: (event: { data: unknown; ports?: OwnerPort[] }) => void) => void;
    };
  }
).parentPort;
const nonce = process.env.FORGE_DESKTOP_NONCE;
const directory = process.env.FORGE_DESKTOP_DATA;
const resources = process.env.FORGE_DESKTOP_RESOURCES;
if (!nonce || !directory || !resources || (!parentPort && !process.send))
  throw Error("Desktop service requires its owning process");
if (!path.isAbsolute(directory) || !path.isAbsolute(resources))
  throw Error("Absolute desktop paths required");
fs.mkdirSync(directory, { recursive: true });
process.chdir(directory);
const offlineTransport = rehearsalTransport(directory, process.env);
const app = createApp(path.join(directory, "projects"), {
  transport: offlineTransport,
  env: { FORGE_OPENCODE_BINARY: process.env.FORGE_OPENCODE_BINARY ?? path.join(resources, "tools/opencode/opencode.exe") },
  credentialVault: offlineTransport ? undefined : windowsCredentialVault(
    path.join(directory, "provider-keys.dpapi"),
  ),
  pluginPath: path.join(resources, "plugin", "Forge.plugin.luau"),
  audioHelperPath: path.join(
    resources,
    "tools",
    "audio-capture",
    "TakkoAudioCapture.exe",
  ),
});
app.use(express.static(path.join(resources, "web")));
app.get("/{*path}", (_req, res) =>
  res.sendFile(path.join(resources, "web", "index.html")),
);
const server = app.listen(0, "127.0.0.1", () => {
  const address = server.address();
  if (!address || typeof address === "string")
    throw Error("Missing service address");
  const message = { type: "ready", nonce, port: address.port };
  if (parentPort) parentPort.postMessage(message);
  else process.send!(message);
});
const liveness = serviceLease(Date.now);
let closing = false;
let exitReason = "process-exit";
let ownerPort: OwnerPort | undefined;
// Fixed-schema, bounded, overwrite-only record. Never serialize messages or errors.
process.once("exit", (code) => {
  try {
    fs.writeFileSync(path.join(directory, "service-exit.json"), JSON.stringify({
      version: 1, at: new Date().toISOString(), pid: process.pid,
      reason: exitReason, code, heartbeatAgeMs: liveness.heartbeatAge(),
    }) + "\n");
  } catch { /* A failed diagnostic write must not prevent termination. */ }
});
function shutdown(reason: string) {
  if (closing) return;
  closing = true;
  exitReason = reason;
  closeOwnedStudioChildren();
  clearInterval(lease);
  // The main process enforces the outer shutdown deadline; this closes idle sockets.
  server.close(() => process.exit(0));
  server.closeIdleConnections();
  setTimeout(() => process.exit(0), 4000).unref();
}
function receive(message: unknown, ports?: OwnerPort[]) {
  if (!message || typeof message !== "object") return;
  const command = message as { nonce?: string; type?: string };
  if (command.nonce !== nonce) return;
  if (command.type === "owner" && !ownerPort && ports?.length === 1) {
    ownerPort = ports[0];
    ownerPort.on("close", () => shutdown("parent-disconnect"));
    ownerPort.start();
  }
  if (command.type === "heartbeat") liveness.heartbeat();
  if (command.type === "shutdown") shutdown("parent-shutdown");
}
if (parentPort) parentPort.on("message", (event) => receive(event.data, event.ports));
else {
  process.on("message", (message) => receive(message));
  process.on("disconnect", () => shutdown("parent-disconnect"));
}
const lease = setInterval(() => {
  if (liveness.expired()) shutdown("heartbeat-expired");
}, 2000);
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
