import {
  app,
  BrowserWindow,
  Menu,
  dialog,
  nativeTheme,
  utilityProcess,
  MessageChannelMain,
  shell,
} from "electron";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ServiceSupervisor } from "./supervisor.mjs";
import { attachParentChannel } from "./parent-channel.mjs";
import { serviceEnvironment } from "./service-environment.mjs";
import { desktopIdentity, desktopDataDirectory } from "./identity.mjs";
import {
  isServiceUrl,
  isRobloxBrowserLink,
  isRobloxThumbnailRequest,
  rendererPreferences,
  contentSecurityPolicy,
} from "./policy.mjs";

const resources = path.dirname(fileURLToPath(import.meta.url));
if (process.env.FORGE_REHEARSAL_FILE && !path.isAbsolute(app.commandLine.getSwitchValue("user-data-dir")))
  throw Error("Offline rehearsal requires an explicit absolute --user-data-dir");
// This application has its own identity; it never attaches to a running web server.
app.setName(desktopIdentity.name);
const dataDirectory = desktopDataDirectory(
  app.getPath("appData"),
  app.commandLine.getSwitchValue("user-data-dir"),
);
app.setPath("userData", dataDirectory);
if (!app.requestSingleInstanceLock()) app.quit();
else {
  let window;
  let origin = null;
  let quitting = false;
  let starting = false;
  const failureUrl = pathToFileURL(path.join(resources, "status.html")).href;
  const supervisor = new ServiceSupervisor((nonce) => {
    const env = serviceEnvironment(process.env);
    const child = utilityProcess.fork(path.join(resources, "service.cjs"), [], {
      cwd: dataDirectory,
      env: {
        ...env,
        NODE_ENV: "production",
        FORGE_DESKTOP_NONCE: nonce,
        FORGE_DESKTOP_DATA: dataDirectory,
        FORGE_DESKTOP_RESOURCES: resources,
        LUAU_BIN_DIR: path.join(resources, "tools", "luau"),
        FORGE_ROJO_BINARY: path.join(resources, "tools", "rojo", "rojo.exe"),
      },
      stdio: "ignore",
      serviceName: "Takko local service",
    });
    attachParentChannel(child, nonce, new MessageChannelMain());
    return child;
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
          "\nUse Service → Retry service to restart. Provider keys saved with Windows encryption are restored automatically.",
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
      nativeTheme.themeSource = "dark";
      window = new BrowserWindow({
        width: 1440,
        height: 960,
        minWidth: 860,
        minHeight: 640,
        show: false,
        title: "Takko",
        backgroundColor: "#111111",
        webPreferences: rendererPreferences,
      });
      window.webContents.session.setPermissionRequestHandler(
        (_contents, _permission, callback) => callback(false),
      );
      window.webContents.session.setPermissionCheckHandler(() => false);
      const openRobloxLink = (url) => {
        if (isRobloxBrowserLink(url))
          void shell
            .openExternal(url)
            .catch(() =>
              dialog.showErrorBox(
                "Could not open Roblox",
                "Open the Creator Store or Roblox documentation in your browser and try again.",
              ),
            );
      };
      window.webContents.setWindowOpenHandler(({ url }) => {
        openRobloxLink(url);
        return { action: "deny" };
      });
      const allowed = (url) =>
        url === failureUrl || (origin && isServiceUrl(url, origin));
      window.webContents.on("will-navigate", (event, url) => {
        if (!allowed(url)) {
          event.preventDefault();
          openRobloxLink(url);
        }
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
          callback({
            cancel:
              !allowed(details.url) &&
              !localImage &&
              !isRobloxThumbnailRequest(details.url, details.resourceType),
          });
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
      // loadURL resolves before the first frame is painted, so showing on it alone
      // races ahead of ready-to-show. Wait for the paint, with a timeout covering a
      // renderer that never fires it.
      const painted = new Promise((resolve) =>
        window.once("ready-to-show", resolve),
      );
      await window.loadURL(failureUrl);
      await Promise.race([
        painted,
        new Promise((resolve) => setTimeout(resolve, 4000)),
      ]);
      if (!window.isDestroyed() && !window.isVisible()) window.show();
      await start();
    })
    .catch((error) => {
      dialog.showErrorBox("Takko desktop could not start", String(error));
      app.quit();
    });
}
