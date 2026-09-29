import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { _electron, expect } from "@playwright/test";
import {
  focusFlow,
  questionFlow,
  browseFlow,
} from "../tests/browser/surgical-ux-flows";
const executablePath = path.resolve(process.argv[2]);
const output = path.resolve(
  process.argv[3] ?? "docs/results/surgical-ux/native1",
);
fs.mkdirSync(output, { recursive: true });
const report: any = {
  at: new Date().toISOString(),
  executablePath,
  paidCalls: 0,
};
const app = await _electron.launch({
  executablePath,
  args: [
    "--user-data-dir=" +
      path.resolve(".forge/surgical-ux-native", path.basename(output)),
  ],
  timeout: 30000,
});
try {
  const page = await app.firstWindow();
  await page.waitForURL("http://127.0.0.1:*/");
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const origin = new URL(page.url()).origin;
  report.identity = await app.evaluate(({ app, BrowserWindow }) => ({
    packaged: app.isPackaged,
    exe: app.getPath("exe"),
    profile: app.getPath("userData"),
    bounds: BrowserWindow.getAllWindows()[0].getBounds(),
  }));
  await focusFlow(page, origin);
  report.focus = true;
  // Public Creator Store data through the actual packaged utility service, no browser mocks.
  const studios = await (
    await page.request.get(origin + "/api/marketplace/studios")
  ).json();
  assert.ok(studios.studios?.length);
  report.studios = studios;
  await page
    .getByRole("button", { name: "Browse Marketplace assets", exact: true })
    .click();
  const market = page.getByRole("complementary", {
    name: "Marketplace",
    exact: true,
  });
  await expect(market.getByLabel("Marketplace Studio")).not.toHaveValue("");
  await market
    .getByLabel("Search Marketplace", { exact: true })
    .fill("training dummy");
  await market
    .getByRole("button", { name: "Search assets", exact: true })
    .click();
  await expect(market.getByRole("article")).toHaveCount(30, { timeout: 30000 });
  await market
    .getByRole("button", { name: "Load more results", exact: true })
    .click();
  await expect(market.getByRole("article")).toHaveCount(60, { timeout: 30000 });
  await expect(
    market.getByRole("article").first().locator(".asset-votes"),
  ).toContainText("votes");
  await market.getByRole("article").first().scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      market
        .locator(".market-thumbnail img")
        .first()
        .evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0),
    )
    .toBe(true);
  await page.screenshot({ path: path.join(output, "live-marketplace.png") });
  report.liveMarketplace = {
    count: 60,
    votes: await market
      .getByRole("article")
      .first()
      .locator(".asset-votes")
      .innerText(),
    thumbnails: true,
  };
  await page
    .getByRole("button", { name: "Close Marketplace", exact: true })
    .click();
  const created = await page.request.post(origin + "/api/projects", {
    data: { request: "A training yard with a practice dummy" },
  });
  assert.equal(created.ok(), true);
  const project = await created.json();
  await page.goto(origin + "/?project=" + project.id);
  await page
    .getByRole("button", { name: "Preview & choose assets", exact: true })
    .click({ timeout: 30000 });
  const chooser = page.getByRole("dialog", {
    name: "Choose assets",
    exact: true,
  });
  await expect(chooser.getByRole("article")).toHaveCount(30, {
    timeout: 30000,
  });
  await chooser
    .getByRole("button", { name: "Load more results", exact: true })
    .click();
  await expect(chooser.getByRole("article")).toHaveCount(60, {
    timeout: 30000,
  });
  await chooser
    .getByRole("article")
    .first()
    .getByRole("button", { name: "Preview", exact: true })
    .click();
  const preview = page.getByRole("dialog", {
    name: "Training Dummy",
    exact: true,
  });
  await expect(preview.locator("canvas")).toHaveCount(1, { timeout: 90000 });
  await expect
    .poll(async () =>
      Number(await preview.locator("canvas").getAttribute("data-triangles")),
    )
    .toBeGreaterThan(0);
  await page.screenshot({ path: path.join(output, "live-dummy-preview.png") });
  await preview
    .getByRole("button", { name: "Choose this asset", exact: true })
    .click();
  await expect(
    chooser
      .getByRole("article")
      .first()
      .getByRole("button", { name: "Selected ✓", exact: true }),
  ).toBeVisible();
  report.liveChooser = {
    count: 60,
    previewCanvas: true,
    selected: true,
    approved: false,
  };
  await page.keyboard.press("Escape");
  // Model responses are explicit offline fixtures. No paid model invocation.
  await questionFlow(page, origin, path.join(output, "question.png"), true);
  report.question = true;
  await app.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].maximize(),
  );
  await expect
    .poll(() =>
      app.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0].isMaximized(),
      ),
    )
    .toBe(true);
  await browseFlow(
    page,
    origin,
    path.join(output, "maximized-preview.png"),
    true,
  );
  report.maximized = true;
  await app.evaluate(({ BrowserWindow }) => {
    const w = BrowserWindow.getAllWindows()[0];
    w.unmaximize();
    w.setSize(1000, 720);
  });
  await expect
    .poll(() =>
      app.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0].isMaximized(),
      ),
    )
    .toBe(false);
  await browseFlow(
    page,
    origin,
    path.join(output, "restored-preview.png"),
    true,
  );
  report.restored = true;
  await app.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].setSize(860, 640),
  );
  await browseFlow(
    page,
    origin,
    path.join(output, "minimum-preview.png"),
    true,
  );
  report.minimum = await page.evaluate(() => ({
    width: innerWidth,
    height: innerHeight,
  }));
  await page
    .getByRole("button", { name: "Preview & choose assets", exact: true })
    .click();
  const animationBrowser = page.getByRole("dialog", {
    name: "Choose assets",
    exact: true,
  });
  await animationBrowser
    .getByRole("button", { name: "Fighting animation", exact: true })
    .click();
  await animationBrowser
    .getByRole("article")
    .first()
    .getByRole("button", { name: "Preview", exact: true })
    .click();
  const animation = page.getByRole("dialog", {
    name: "Fighting animation option 1",
    exact: true,
  });
  await animation
    .getByLabel("Clip from Fighting animation option 1")
    .selectOption("Kick");
  await expect(animation.locator("canvas")).toHaveCount(1);
  await expect(animationBrowser.locator(".asset-option.selected")).toHaveCount(
    0,
  );
  await animation.getByRole("slider", { name: /Position in/ }).fill("0.75");
  await page.screenshot({ path: path.join(output, "animation-choice.png") });
  await animation
    .getByRole("button", { name: "Choose this asset", exact: true })
    .click();
  await expect(
    animationBrowser.getByRole("button", { name: "Selected ✓", exact: true }),
  ).toBeVisible();
  await animationBrowser
    .getByRole("article")
    .first()
    .getByRole("button", { name: "Preview", exact: true })
    .click();
  await expect(
    animation.getByLabel("Clip from Fighting animation option 1"),
  ).toHaveValue("Kick");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await expect(page.locator("canvas")).toHaveCount(0);
  report.animationChoice = {
    source: "offline fixture",
    clip: "Kick",
    explicitSelection: true,
    rendererReleased: true,
  };
  report.errors = errors;
  assert.deepEqual(errors, []);
  report.passed = true;
} catch (e) {
  report.error = String(e);
  const page = await app.firstWindow();
  await page
    .screenshot({ path: path.join(output, "failure.png") })
    .catch(() => {});
  throw e;
} finally {
  fs.writeFileSync(
    path.join(output, "report.json"),
    JSON.stringify(report, null, 2),
  );
  await app.close();
}
