import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { _electron, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { assetChoiceFixture } from "../tests/browser/asset-choices-fixture";
import { GenerationStore } from "../src/generation/store";
const executablePath = path.resolve(process.argv[2]);
const output = path.resolve(
  process.argv[3] ?? "docs/results/asset-choices/native",
);
const data = path.resolve(".forge/asset-choices-native", path.basename(output));
fs.mkdirSync(output, { recursive: true });
const store = new GenerationStore(path.join(data, "projects"));
const live = JSON.parse(
  fs.readFileSync(
    ".forge/asset-choices-live-data/0b104c0c-b2bf-4183-8a3e-369d9d71bb75.json",
    "utf8",
  ),
);
store.save(live);
const report: Record<string, unknown> = {
  at: new Date().toISOString(),
  executablePath,
  data,
  paidCalls: 0,
};
let app: Awaited<ReturnType<typeof _electron.launch>> | undefined;
try {
  app = await _electron.launch({
    executablePath,
    args: ["--user-data-dir=" + data],
    timeout: 30000,
  });
  const page = await app.firstWindow();
  await page.waitForURL("http://127.0.0.1:*/");
  const origin = new URL(page.url()).origin;
  report.origin = origin;
  report.identity = await app.evaluate(({ app, BrowserWindow }) => ({
    packaged: app.isPackaged,
    exe: app.getPath("exe"),
    profile: app.getPath("userData"),
    minimum: BrowserWindow.getAllWindows()[0].getMinimumSize(),
  }));
  await app.evaluate(({ shell }) => {
    (globalThis as any).takkoBrowserLinks = [];
    shell.openExternal = async (url) => {
      (globalThis as any).takkoBrowserLinks.push(url);
    };
  });
  // Real packaged utility service, before installing any browser fixture routes.
  const studioResponse = await page.request.get(
    origin + "/api/marketplace/studios",
  );
  const studioResult = await studioResponse.json();
  report.liveDiscovery = { status: studioResponse.status(), ...studioResult };
  assert.equal(studioResponse.status(), 200);
  assert.ok(
    studioResult.studios.length > 0,
    "Open Studio for native connection verification",
  );
  const searchResponse = await page.request.post(
    origin + "/api/marketplace/search",
    {
      data: {
        studioId: studioResult.studios[0].id,
        query: "training dummy",
        kind: "Model",
      },
    },
  );
  const searchResult = await searchResponse.json();
  report.liveSearch = {
    status: searchResponse.status(),
    count: searchResult.assets?.length,
    error: searchResult.error,
  };
  assert.equal(searchResponse.status(), 200);
  assert.ok(searchResult.assets.length > 0);
  await page
    .getByRole("button", { name: "Browse Marketplace assets", exact: true })
    .click();
  const liveMarket = page.getByRole("complementary", { name: "Marketplace" });
  await expect(liveMarket.getByLabel("Marketplace Studio")).not.toHaveValue("");
  await liveMarket
    .getByLabel("Search Marketplace", { exact: true })
    .fill("training dummy");
  await liveMarket
    .getByRole("button", { name: "Search assets", exact: true })
    .click();
  await expect(liveMarket.getByRole("article").first()).toBeVisible();
  await expect(liveMarket.locator(".market-thumbnail img").first()).toBeVisible(
    { timeout: 15000 },
  );
  await expect
    .poll(() =>
      liveMarket
        .locator(".market-thumbnail img")
        .first()
        .evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
    )
    .toBe(true);
  await page.screenshot({ path: path.join(output, "marketplace-live.png") });
  await liveMarket.getByRole("article").first().getByRole("link").click();
  await expect
    .poll(() =>
      app!.evaluate(() => (globalThis as any).takkoBrowserLinks.length),
    )
    .toBe(1);
  report.externalBrowserLinks = await app.evaluate(
    () => (globalThis as any).takkoBrowserLinks,
  );
  assert.equal(new URL(page.url()).origin, origin);
  await page
    .getByRole("button", { name: "Close Marketplace", exact: true })
    .click();
  await page.route("**/api/marketplace/studios", (r) =>
    r.fulfill({ json: { studios: [] } }),
  );
  await page.goto(origin + "/?project=" + live.id);
  await expect(
    page.getByRole("heading", { name: "Connect your creative space" }),
  ).toBeVisible();
  await page.screenshot({ path: path.join(output, "studio-disconnected.png") });
  await page
    .getByRole("button", { name: "Continue offline", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Game architecture" }),
  ).toHaveCount(0);
  report.offlineHidesArchitecture = true;
  await page.unroute("**/api/marketplace/studios");
  await page.route("**/api/status", async (r) => {
    const response = await r.fetch();
    await r.fulfill({
      response,
      json: { ...(await response.json()), studioConnectionGate: false },
    });
  });
  const fixture = await assetChoiceFixture(page, origin);
  await expect(page.getByText(/6 asset groups/)).toBeVisible();
  await page
    .getByRole("button", { name: "Approve brief", exact: true })
    .click();
  await page.getByRole("button", { name: "Preview & choose assets" }).click();
  const dialog = page.getByRole("dialog", { name: "Choose assets" });
  await page.screenshot({ path: path.join(output, "asset-options.png") });
  const combat = dialog.getByRole("region", {
    name: "Fighting animation",
    exact: true,
  });
  await combat
    .getByRole("button", { name: "Preview", exact: true })
    .first()
    .click();
  await combat
    .getByLabel("Clip from Fighting animation option 1")
    .selectOption("Kick");
  await expect(combat.locator("canvas")).toBeVisible();
  await page.screenshot({ path: path.join(output, "animation-preview.png") });
  const axe = await new AxeBuilder({ page })
    .include(".focused-dialog")
    .setLegacyMode()
    .analyze();
  report.axeViolations = axe.violations;
  assert.equal(axe.violations.length, 0);
  for (const label of [
    "Practice dummy",
    "Sprint animation",
    "Walk animation",
    "Sound effects",
    "Visual effects",
  ])
    await dialog
      .getByRole("region", { name: label, exact: true })
      .getByRole("radio", { name: "Find later", exact: true })
      .check();
  await dialog
    .getByRole("button", { name: "Approve assets & create plan" })
    .click();
  await expect(
    page.getByRole("button", { name: "Approve specification", exact: true }),
  ).toBeVisible();
  assert.equal(fixture.calls.filter((c) => c === "plan").length, 1);
  assert.equal(
    fixture.project().assetDiscovery?.choices?.combat.clipKey,
    "Kick",
  );
  report.fixtureCalls = fixture.calls;
  report.rendererErrors = fixture.errors;
  assert.deepEqual(fixture.errors, []);
  // Read retained data from the earlier live Studio extraction in the real renderer.
  await page.unroute("**/api/marketplace/studios");
  await page.route("**/api/marketplace/studios", (r) =>
    r.fulfill({ json: { studios: [] } }),
  );
  await page.goto(origin + "/?project=" + live.id);
  await page.getByRole("button", { name: "Preview & choose assets" }).click();
  const realCombat = page.getByRole("region", {
    name: "Fighting animation",
    exact: true,
  });
  await realCombat
    .getByRole("button", { name: "Show preview", exact: true })
    .first()
    .click();
  await realCombat.locator(".animation-player").scrollIntoViewIfNeeded();
  await expect(realCombat.locator("canvas")).toBeVisible();
  const walkEntry = live.assetDiscovery.groups
    .find((g: any) => g.id === "combat")
    .options[0].previewData.pack.entries.find(
      (e: any) => e.name === "WalkAnim",
    );
  if (walkEntry)
    await realCombat
      .locator('select[aria-label^="Clip from"]')
      .selectOption(walkEntry.key);
  const slider = realCombat.getByRole("slider", { name: /Position in/ });
  await slider.fill("0");
  await page.waitForTimeout(100);
  const before = await realCombat
    .locator("canvas")
    .evaluate((c: HTMLCanvasElement) => c.toDataURL());
  await slider.fill("0.5");
  await page.waitForTimeout(100);
  const after = await realCombat
    .locator("canvas")
    .evaluate((c: HTMLCanvasElement) => c.toDataURL());
  assert.notEqual(before, after);
  report.realClipRenderedAndChangedPose = true;
  await page.screenshot({ path: path.join(output, "live-clip.png") });
  await app.evaluate(({ BrowserWindow }) => {
    BrowserWindow.getAllWindows()[0].setSize(860, 640);
  });
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({ path: path.join(output, "minimum.png") });
  report.passed = true;
} catch (error) {
  report.error = String(error);
  if (app) {
    try {
      const failedPage = await app.firstWindow();
      await failedPage.screenshot({ path: path.join(output, "failure.png") });
      fs.writeFileSync(
        path.join(output, "failure.txt"),
        await failedPage.locator("body").innerText(),
      );
    } catch {}
  }
  process.exitCode = 1;
} finally {
  if (app) await app.close();
  report.closedOwnedInstance = true;
  fs.writeFileSync(
    path.join(output, "RESULTS.json"),
    JSON.stringify(report, null, 2),
  );
}
