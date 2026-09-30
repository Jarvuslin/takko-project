import fs from "node:fs";
import path from "node:path";
import express from "express";
import { createApp } from "../src/server/app";
import { windowsCredentialVault } from "../src/generation/credential-vault";
import { closeOwnedStudioChildren } from "../src/generation/studio-mcp-client";

// Electron utilityProcess supplies parentPort. Node IPC is used only by offline tests.
const parentPort = (
  process as unknown as {
    parentPort?: {
      postMessage: (message: unknown) => void;
      on: (event: string, cb: (event: { data: unknown }) => void) => void;
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
const app = createApp(path.join(directory, "projects"), {
  env: { FORGE_OPENCODE_BINARY: process.env.FORGE_OPENCODE_BINARY ?? path.join(resources, "tools/opencode/opencode.exe") },
  credentialVault: windowsCredentialVault(
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
let heartbeatAt = Date.now();
let closing = false;
function shutdown() {
  if (closing) return;
  closing = true;
  closeOwnedStudioChildren();
  clearInterval(lease);
  // The main process enforces the outer shutdown deadline; this closes idle sockets.
  server.close(() => process.exit(0));
  server.closeIdleConnections();
  setTimeout(() => process.exit(0), 4000).unref();
}
function receive(message: unknown) {
  if (!message || typeof message !== "object") return;
  const command = message as { nonce?: string; type?: string };
  if (command.nonce !== nonce) return;
  if (command.type === "heartbeat") heartbeatAt = Date.now();
  if (command.type === "shutdown") shutdown();
}
if (parentPort) parentPort.on("message", (event) => receive(event.data));
else {
  process.on("message", receive);
  process.on("disconnect", shutdown);
}
const lease = setInterval(() => {
  if (Date.now() - heartbeatAt > 10000) shutdown();
}, 2000);
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
