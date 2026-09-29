// Verifies the real desktop/main.mjs window setup. Observes the actual BrowserWindow
// it creates rather than re-creating one, so this tests the shipped code path.
// Runs against an isolated --user-data-dir. Never touches a running Takko.
import { app, BrowserWindow, nativeTheme } from "electron";
import fs from "node:fs/promises";
import path from "node:path";

const out = process.argv[3] ?? ".";
app.disableHardwareAcceleration();
const events = [];
const t0 = Date.now();
const mark = (name) => events.push(`${name} @+${Date.now() - t0}ms`);

let observed = null;
app.on("browser-window-created", (_e, win) => {
  observed = win;
  mark("browser-window-created");
  mark(`  visible-at-creation=${win.isVisible()}`);
  win.once("ready-to-show", () => mark("ready-to-show"));
  win.once("show", () => mark("show"));
});

const deadline = setTimeout(async () => {
  console.error("RESULT_JSON " + JSON.stringify({ error: "timeout", events }));
  app.exit(1);
}, 150000);

// Importing the real main module runs it, exactly as the packaged app does.
await import(path.resolve(process.argv[2], "main.mjs") .replace(/\\/g, "/").replace(/^([A-Za-z]):/, "file:///$1:"));

async function settle(ms) { await new Promise((r) => setTimeout(r, ms)); }

async function run() {
  await app.whenReady();
  for (let i = 0; i < 100 && !observed; i++) await settle(100);
  if (!observed) { console.error("RESULT_JSON " + JSON.stringify({ error: "no window", events })); return app.exit(1); }
  const win = observed;

  // First paint: this is the status page, the frame the user sees at launch.
  for (let i = 0; i < 60 && !win.isVisible(); i++) await settle(100);
  const early = {
    visible: win.isVisible(),
    backgroundColor: win.getBackgroundColor(),
    themeSource: nativeTheme.themeSource,
    shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
    bounds: win.getBounds(),
    url: win.webContents.getURL().split("/").pop(),
    title: win.getTitle(),
  };
  let capErr = null;
  try { const shot1 = await win.capturePage(); await fs.writeFile(path.join(out, "shell-1-startup.png"), shot1.toPNG()); } catch (e) { capErr = String(e.message); }

  // Sample the frame repeatedly while the service starts and the app navigates,
  // so a flash of a non-matching colour would show up as an off-palette frame.
  const samples = [];
  for (let i = 0; i < 24; i++) {
    try { const img = await win.capturePage({ x: 2, y: 2, width: 6, height: 6 }); const bmp = img.toBitmap();
      samples.push(`#${bmp[2].toString(16).padStart(2,"0")}${bmp[1].toString(16).padStart(2,"0")}${bmp[0].toString(16).padStart(2,"0")}`); } catch (e) { samples.push("ERR"); }
    await settle(250);
  }

  const late = {
    url: win.webContents.getURL().replace(/^(https?:\/\/[^/]+).*$/, "$1"),
    title: win.getTitle(),
    bodyBg: await win.webContents.executeJavaScript(
      "getComputedStyle(document.body).backgroundColor"
    ).catch((e) => "ERR " + e.message),
    rootBg: await win.webContents.executeJavaScript(
      "getComputedStyle(document.documentElement).backgroundColor"
    ).catch((e) => "ERR " + e.message),
    fontFamily: await win.webContents.executeJavaScript(
      "getComputedStyle(document.body).fontFamily"
    ).catch((e) => "ERR " + e.message),
    tokenCount: await win.webContents.executeJavaScript(
      "getComputedStyle(document.documentElement).getPropertyValue('--control-min').trim()"
    ).catch((e) => "ERR " + e.message),
    focusRing: await win.webContents.executeJavaScript(
      "getComputedStyle(document.documentElement).getPropertyValue('--focus-ring').trim()"
    ).catch((e) => "ERR " + e.message),
  };
  try { const shot2 = await win.capturePage(); await fs.writeFile(path.join(out, "shell-2-workspace.png"), shot2.toPNG()); } catch (e) { capErr = (capErr??"")+" | "+e.message; }

  clearTimeout(deadline);
  console.error("RESULT_JSON " + JSON.stringify({ events, early, samples, late, capErr }, null, 1));
  app.exit(0);
}
void run();
