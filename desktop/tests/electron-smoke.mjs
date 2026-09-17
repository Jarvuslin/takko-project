// Native Electron smoke with an invisible renderer and a disposable workspace.
import { app, BrowserWindow, utilityProcess } from "electron";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { ServiceSupervisor } from "../supervisor.mjs";
import { rendererPreferences, contentSecurityPolicy } from "../policy.mjs";

const temporary = await fs.mkdtemp(
  path.join(os.tmpdir(), "forge-electron-smoke-"),
);
app.setPath("userData", temporary);
app.disableHardwareAcceleration();
const resources = path.resolve(process.argv[2] ?? "dist-desktop");
let supervisor;
let window;
const deadline = setTimeout(() => {
  console.error("Electron smoke exceeded 25 seconds");
  app.exit(1);
}, 25000);
async function run() {
  try {
    await app.whenReady();
    console.log("Electron ready; starting isolated utility process");
    supervisor = new ServiceSupervisor((nonce) => {
      const child = utilityProcess.fork(
        path.join(resources, "service.cjs"),
        [],
        {
          cwd: temporary,
          stdio: "pipe",
          env: {
            ...process.env,
            NODE_ENV: "production",
            FORGE_DESKTOP_NONCE: nonce,
            FORGE_DESKTOP_DATA: temporary,
            FORGE_DESKTOP_RESOURCES: resources,
          },
        },
      );
      child.stderr?.on("data", (data) =>
        console.error(data.toString().slice(0, 2000)),
      );
      return child;
    });
    const origin = await supervisor.start();
    console.log("Utility process ready; loading invisible renderer");
    window = new BrowserWindow({
      show: false,
      webPreferences: rendererPreferences,
    });
    window.webContents.session.webRequest.onHeadersReceived(
      (details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            "Content-Security-Policy": [contentSecurityPolicy],
          },
        });
      },
    );
    const errors = [];
    window.webContents.on("console-message", (_event, details) => {
      if (details.level === "error") errors.push(details.message);
    });
    await window.loadURL(origin);
    console.log("Renderer loaded; checking isolated API");
    const result = await window.webContents.executeJavaScript(`(async () => ({
    node: typeof process, require: typeof require,
    projects: await fetch('/api/projects').then(r => r.json()),
    title: document.title, root: !!document.querySelector('#root'),
    prompt: !!document.querySelector('textarea#new-request')
  }))()`);
    assert.equal(window.isVisible(), false);
    assert.equal(result.node, "undefined");
    assert.equal(result.require, "undefined");
    assert.deepEqual(result.projects, []);
    assert.equal(result.root, true);
    assert.equal(result.prompt, true, "React dashboard prompt should render");
    assert.equal(result.title, "Takko — Roblox creation studio");
    assert.ok(
      !errors.some((error) => /Content Security Policy|Refused to/.test(error)),
      errors.join("\n"),
    );
    window.destroy();
    window = null;
    await supervisor.stop();
    assert.equal(supervisor.state, "stopped");
    console.log(
      "PASS native Electron utility process, invisible sandboxed renderer, local API, CSP and graceful shutdown",
    );
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    clearTimeout(deadline);
    if (window && !window.isDestroyed()) window.destroy();
    await supervisor?.stop();
    // Chromium may retain cache handles until app exit; leave only a disposable temp dir.
    console.log("Disposable smoke directory:", temporary);
    app.exit(process.exitCode ?? 0);
  }
}
void run();
