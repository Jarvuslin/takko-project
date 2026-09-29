// Launch the actual packaged entry point. Fixtures never invoke a provider or Studio.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { _electron, chromium, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createPolishProject } from "../tests/browser/ui-polish-fixture";
import {
  mockProviderConnections,
  connectFixture,
} from "../tests/browser/provider-fixture";
import { GenerationStore } from "../src/generation/store";

const executablePath = path.resolve(process.argv[2]);
const output = path.resolve(process.argv[3]);
const data = path.resolve(".forge/ui-polish-native", path.basename(output));
fs.mkdirSync(output, { recursive: true });
fs.mkdirSync(data, { recursive: true });
const store = new GenerationStore(path.join(data, "projects"));
const questions = createPolishProject();
const build = createPolishProject("build");
store.save(questions);
store.save(build);
const report: Record<string, unknown> = {
  executablePath,
  data,
  startedAt: new Date().toISOString(),
  paidCalls: 0,
};
let app: Awaited<ReturnType<typeof _electron.launch>> | undefined;
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
const errors: string[] = [];
async function shot(page: Page, name: string) {
  await page.screenshot({
    path: path.join(output, name + ".png"),
    animations: "disabled",
  });
}
async function launch() {
  const instance = await _electron.launch({
    executablePath,
    args: ["--user-data-dir=" + data],
    timeout: 30000,
  });
  app = instance;
  const page = await instance.firstWindow();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.waitForURL("http://127.0.0.1:*/");
  await expect(page.locator("#new-request")).toBeVisible();
  return page;
}
try {
  let page = await launch();
  const origin = new URL(page.url()).origin;
  report.origin = origin;
  report.identity = await app!.evaluate(({ app, BrowserWindow }) => ({
    packaged: app.isPackaged,
    executable: app.getPath("exe"),
    data: app.getPath("userData"),
    minimum: BrowserWindow.getAllWindows()[0].getMinimumSize(),
    preferences: (({ sandbox, contextIsolation, nodeIntegration }) => ({
      sandbox,
      contextIsolation,
      nodeIntegration,
    }))(BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences()),
  }));
  assert.equal((report.identity as any).packaged, true);
  assert.equal((report.identity as any).data, data);
  assert.deepEqual((report.identity as any).preferences, {
    sandbox: true,
    contextIsolation: true,
    nodeIntegration: false,
  });
  assert.deepEqual((report.identity as any).minimum, [860, 640]);
  await app!.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].setContentSize(1440, 900),
  );
  await page.goto(origin + "/?project=" + build.id);
  await expect(
    page.getByRole("button", { name: "Edit Combat", exact: true }),
  ).toBeVisible();
  await shot(page, "desktop-workspace");
  const geometry = (p: Page) =>
    p.evaluate(`(() => {
    const b = (selector) => { const r = document.querySelector(selector).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
    return { canvas: b(".map-surface"), chat: b(".chat-panel"), composer: b(".chat-composer"), font: getComputedStyle(document.body).fontFamily };
  })()`);
  report.desktopGeometry = await geometry(page);
  assert.equal((report.desktopGeometry as any).chat.width, 400);
  browser = await chromium.launch();
  const web = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await web.goto(origin + "/?project=" + build.id);
  await expect(
    web.getByRole("button", { name: "Edit Combat", exact: true }),
  ).toBeVisible();
  report.browserGeometry = await geometry(web);
  assert.deepEqual(report.desktopGeometry, report.browserGeometry);
  await shot(web, "browser-parity-workspace");
  await browser.close();
  browser = undefined;
  const separator = page.getByRole("separator", { name: "Resize Takko panel" });
  await separator.press("Home");
  await expect(separator).toHaveAttribute("aria-valuenow", "320");
  const rect = (await separator.boundingBox())!;
  await page.mouse.move(rect.x + 6, rect.y + 80);
  await page.mouse.down();
  await page.mouse.move(100, rect.y + 120, { steps: 3 });
  await page.mouse.up();
  await expect(separator).toHaveAttribute("aria-valuenow", "640");
  await shot(page, "desktop-wide-panel");
  await separator.dblclick();
  await expect(separator).toHaveAttribute("aria-valuenow", "400");
  await app!.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].setSize(860, 640),
  );
  await expect(page.getByLabel("Message", { exact: true })).toBeVisible();
  assert.ok((await page.locator(".chat-panel").boundingBox())!.width >= 320);
  assert.ok(
    (await page
      .getByRole("region", { name: "Game architecture" })
      .boundingBox())!.width >= 379,
  );
  await shot(page, "desktop-minimum-window");
  await app!.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].maximize(),
  );
  await expect
    .poll(() =>
      app!.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0].isMaximized(),
      ),
    )
    .toBe(true);
  await shot(page, "desktop-maximized");
  await app!.evaluate(({ BrowserWindow }) => {
    const w = BrowserWindow.getAllWindows()[0];
    w.unmaximize();
    w.setContentSize(1440, 900);
  });
  await expect
    .poll(() =>
      app!.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0].isMaximized(),
      ),
    )
    .toBe(false);
  await page.getByRole("button", { name: "Edit Combat", exact: true }).click();
  await shot(page, "desktop-inspector");
  await page
    .getByRole("complementary", { name: "Architecture inspector" })
    .getByRole("button", { name: "Connections", exact: true })
    .click();
  await expect(page.getByLabel("From", { exact: true })).toBeVisible();
  await shot(page, "desktop-connections");
  await page.getByRole("button", { name: "Close inspector" }).click();
  await page.locator(".compact-plan > summary").click();
  await expect(page.locator(".compact-plan")).toContainText("Complete");
  await page.locator(".compact-plan").scrollIntoViewIfNeeded();
  await expect(page.locator(".compact-plan li").first()).toBeInViewport();
  await shot(page, "desktop-build-plan");
  for (const name of ["Source", "Studio", "Build"]) {
    await page
      .getByRole("button", { name: name + " details", exact: true })
      .click();
    await expect(
      page.getByRole("dialog", { name: name + " details" }),
    ).toBeVisible();
    await shot(page, "desktop-" + name.toLowerCase());
    await page.keyboard.press("Escape");
  }
  await page.getByRole("button", { name: "History", exact: true }).click();
  await shot(page, "desktop-history");
  await page.keyboard.press("Escape");
  const input = page.getByLabel("Message", { exact: true });
  await input.fill("Keep the yard small");
  await input.press("Shift+Enter");
  await input.press("x");
  await expect(input).toHaveValue("Keep the yard small\nx");
  await shot(page, "desktop-composer");
  await page
    .getByRole("button", { name: "Browse Marketplace assets", exact: true })
    .click();
  await expect(page.locator("#asset-search")).toBeFocused();
  await shot(page, "desktop-marketplace");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", {
      name: "Browse Marketplace assets",
      exact: true,
    }),
  ).toBeFocused();
  await page.goto(origin + "/?project=" + questions.id);
  await page
    .getByRole("button", { name: "Answer questions", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("radio", { name: "Fists + kicks", exact: true })
    .check();
  await shot(page, "desktop-clarification");
  report.questionAxe = (
    await new AxeBuilder({ page })
      .setLegacyMode()
      .include(".clarification-flow")
      .analyze()
  ).violations;
  assert.deepEqual(report.questionAxe, []);
  await dialog
    .getByRole("button", { name: "Continue", exact: true })
    .press("Enter");
  await dialog
    .getByRole("checkbox", { name: "Hit effects", exact: true })
    .check();
  await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  await dialog.getByRole("button", { name: "Skip", exact: true }).click();
  await shot(page, "desktop-answer-review");
  await dialog
    .getByRole("button", { name: "Confirm answers", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Edit answers", exact: true }),
  ).toBeFocused();
  await shot(page, "desktop-answer-draft");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Edit answers", exact: true }).click();
  assert.equal(
    await dialog.evaluate((e) => getComputedStyle(e).animationName),
    "none",
  );
  await page.keyboard.press("Escape");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  // Import a local synthetic track through the real packaged API, no Studio session.
  await page.getByText("Preview an animation clip", { exact: true }).click();
  await page.getByLabel("Animation clip JSON", { exact: true }).setInputFiles({
    name: "qa-punch.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        version: 1,
        name: "QA punch",
        rig: "R6",
        duration: 1,
        tracks: [
          {
            joint: "Right Arm",
            keys: [
              { time: 0, rotation: [0, 0, 0] },
              { time: 0.5, rotation: [-1.5, 0, 0] },
              { time: 1, rotation: [0, 0, 0] },
            ],
          },
        ],
      }),
    ),
  });
  const viewer = page.getByRole("img", { name: "QA punch on R6" });
  await viewer.scrollIntoViewIfNeeded();
  await expect(viewer).toHaveAttribute("data-renderer", "webgl");
  await expect
    .poll(async () => Number(await viewer.getAttribute("data-triangles")))
    .toBeGreaterThan(50);
  await page
    .getByRole("button", { name: "Pause animation", exact: true })
    .click();
  const scrub = page.getByRole("slider", {
    name: "Position in QA punch on R6",
    exact: true,
  });
  await scrub.fill("0");
  const first = await viewer.evaluate((e) =>
    (e as HTMLCanvasElement).toDataURL(),
  );
  await scrub.fill("0.5");
  await expect(viewer).toHaveAttribute("data-time", "0.500");
  assert.notEqual(
    await viewer.evaluate((e) => (e as HTMLCanvasElement).toDataURL()),
    first,
  );
  await shot(page, "desktop-animation");
  await page.goto(origin + "/#models");
  await shot(page, "desktop-models-disconnected");
  await mockProviderConnections(page);
  await page.route("**/api/model-catalog", (route) =>
    route.fulfill({
      json: [
        {
          id: "anthropic/qa-model",
          name: "QA model",
          inputRate: 3,
          outputRate: 15,
          contextLength: 200000,
        },
      ],
    }),
  );
  await page.reload();
  await connectFixture(page);
  await page
    .getByRole("button", { name: /QA model.*anthropic\/qa-model/ })
    .click();
  await expect(dialog.getByLabel("Model ID", { exact: true })).toHaveCount(0);
  await shot(page, "desktop-add-model");
  report.modelAxe = (
    await new AxeBuilder({ page })
      .setLegacyMode()
      .include(".focused-dialog")
      .analyze()
  ).violations;
  assert.deepEqual(report.modelAxe, []);
  await page.keyboard.press("Escape");
  await page.goto(origin + "/#presets");
  await shot(page, "desktop-presets");
  await page.goto(origin + "/?project=" + build.id);
  await separator.press("Home");
  await separator.press("Shift+ArrowLeft");
  await expect(separator).toHaveAttribute("aria-valuenow", "368");
  await expect
    .poll(
      async () =>
        (await (await page.request.get(origin + "/api/ui-preferences")).json())
          .agentWidth,
    )
    .toBe(368);
  await app!.close();
  app = undefined;
  await expect
    .poll(async () => {
      try {
        await fetch(origin + "/api/status");
        return false;
      } catch {
        return true;
      }
    })
    .toBe(true);
  page = await launch();
  const secondOrigin = new URL(page.url()).origin;
  report.relaunchOrigin = secondOrigin;
  await page.goto(secondOrigin + "/?project=" + build.id);
  await expect(
    page.getByRole("separator", { name: "Resize Takko panel" }),
  ).toHaveAttribute("aria-valuenow", "368");
  report.widthAcrossLaunches = 368;
  report.errors = errors;
  assert.deepEqual(errors, []);
  report.result = "passed";
} catch (error) {
  report.result = "failed";
  report.error = String(error);
  if (app) {
    const windows = app.windows();
    if (windows[0]) await shot(windows[0], "failure").catch(() => {});
  }
  throw error;
} finally {
  await browser?.close();
  await app?.close();
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(
    path.join(output, "RESULTS.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
}
