import { app, BrowserWindow, Menu, dialog, utilityProcess } from "electron";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ServiceSupervisor } from "./supervisor.mjs";
import { desktopIdentity, desktopDataDirectory } from "./identity.mjs";
import {
  isServiceUrl,
  rendererPreferences,
  contentSecurityPolicy,
} from "./policy.mjs";

const resources = path.dirname(fileURLToPath(import.meta.url));
// This application has its own identity; it never attaches to a running web server.
app.setName(desktopIdentity.name);
const dataDirectory = desktopDataDirectory(app.getPath("appData"));
app.setPath("userData", dataDirectory);
if (!app.requestSingleInstanceLock()) app.quit();
else {
  let window;
  let origin = null;
  let quitting = false;
  let starting = false;
  const failureUrl = pathToFileURL(path.join(resources, "status.html")).href;
  const supervisor = new ServiceSupervisor((nonce) => {
    const env = Object.fromEntries(
      [
        "SystemRoot",
        "SYSTEMROOT",
        "WINDIR",
        "PATH",
        "TEMP",
        "TMP",
        "HOME",
        "USERPROFILE",
      ]
        .filter((key) => process.env[key])
        .map((key) => [key, process.env[key]]),
    );
    return utilityProcess.fork(path.join(resources, "service.cjs"), [], {
      cwd: dataDirectory,
      env: {
        ...env,
        NODE_ENV: "production",
        FORGE_DESKTOP_NONCE: nonce,
        FORGE_DESKTOP_DATA: dataDirectory,
        FORGE_DESKTOP_RESOURCES: resources,
        LUAU_BIN_DIR: path.join(resources, "tools", "luau"),
      },
      stdio: "ignore",
      serviceName: "Takko local service",
    });
  });
  async function start() {
    if (starting || quitting || supervisor.child) return;
    starting = true;
    window.setTitle("Takko — Starting local service");
    try {
      origin = await supervisor.start();
      if (!quitting && !window.isDestroyed()) {
        await window.loadURL(origin);
        window.setTitle(`Takko — ${origin}`);
      }
    } catch {
      // A shared failure event also handles crashes after startup.
    } finally {
      starting = false;
    }
  }
  supervisor.on("failure", (reason) => {
    origin = null;
    if (!quitting && window && !window.isDestroyed()) {
      void window.loadURL(failureUrl);
      window.setTitle("Takko — Local service unavailable");
      dialog.showErrorBox(
        "Takko local service",
        reason +
          "\nUse Service → Retry service to restart. Session-only provider keys must be entered again after a restart.",
      );
    }
  });
  app.on("second-instance", () => {
    if (window) {
      if (window.isMinimized()) window.restore();
      window.focus();
    }
  });
  app.on("before-quit", (event) => {
    if (quitting) return;
    event.preventDefault();
    quitting = true;
    void supervisor.stop().finally(() => app.quit());
  });
  app.on("window-all-closed", () => app.quit());
  void app
    .whenReady()
    .then(async () => {
      fs.mkdirSync(dataDirectory, { recursive: true });
      window = new BrowserWindow({
        width: 1440,
        height: 960,
        minWidth: 860,
        minHeight: 640,
        show: false,
        title: "Takko",
        backgroundColor: "#141414",
        webPreferences: rendererPreferences,
      });
      window.webContents.session.setPermissionRequestHandler(
        (_contents, _permission, callback) => callback(false),
      );
      window.webContents.session.setPermissionCheckHandler(() => false);
      window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
      const allowed = (url) =>
        url === failureUrl || (origin && isServiceUrl(url, origin));
      window.webContents.on("will-navigate", (event, url) => {
        if (!allowed(url)) event.preventDefault();
      });
      window.webContents.on("will-redirect", (event, url) => {
        if (!allowed(url)) event.preventDefault();
      });
      window.webContents.on("will-attach-webview", (event) =>
        event.preventDefault(),
      );
      window.webContents.on("page-title-updated", (event) =>
        event.preventDefault(),
      );
      window.webContents.session.webRequest.onBeforeRequest(
        (details, callback) => {
          const localImage =
            details.resourceType === "image" &&
            (details.url.startsWith("data:") ||
              (origin && details.url.startsWith(`blob:${origin}/`)));
          callback({ cancel: !allowed(details.url) && !localImage });
        },
      );
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
      window.webContents.on(
        "did-fail-load",
        (_event, code, _description, _url, mainFrame) => {
          if (mainFrame && code !== -3 && !quitting) {
            window.setTitle("Takko — Could not load interface");
            // Do not restart a healthy worker or discard session keys on a renderer failure.
          }
        },
      );
      Menu.setApplicationMenu(
        Menu.buildFromTemplate([
          {
            label: "Service",
            submenu: [
              {
                label: "Retry service",
                click: () => {
                  void start();
                },
              },
              {
                label: "Connection details",
                click: () => {
                  void dialog.showMessageBox(window, {
                    type: "info",
                    title: "Takko connection",
                    message: origin ?? "Service unavailable",
                    detail: `Desktop projects: ${path.join(dataDirectory, "projects")}\nEnter this address in the Takko Studio plugin endpoint field. Existing browser projects use a separate data directory.`,
                  });
                },
              },
              { type: "separator" },
              { role: "quit" },
            ],
          },
          { role: "editMenu" },
          {
            label: "View",
            submenu: [
              { role: "reload" },
              { role: "resetZoom" },
              { role: "zoomIn" },
              { role: "zoomOut" },
              { role: "togglefullscreen" },
            ],
          },
        ]),
      );
      await window.loadURL(failureUrl);
      window.show();
      await start();
    })
    .catch((error) => {
      dialog.showErrorBox("Takko desktop could not start", String(error));
      app.quit();
    });
}
