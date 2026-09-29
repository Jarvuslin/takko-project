import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { _electron, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  aligned,
  connectionRecoveryFlow,
} from "../tests/browser/connection-recovery-flows";
import { assetChoiceFixture } from "../tests/browser/asset-choices-fixture";

const executablePath = path.resolve(process.argv[2]);
const output = path.resolve(
  process.argv[3] ?? "docs/results/connection-recovery/native1",
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
      path.resolve(".forge/connection-recovery-native", path.basename(output)),
  ],
  timeout: 30000,
});
try {
  const page = await app.firstWindow();
  await page.waitForURL("http://127.0.0.1:*/");
  const origin = new URL(page.url()).origin;
  const detected = await (
    await page.request.get(origin + "/api/marketplace/studios")
  ).json();
  report.detectedStudios = detected.studios;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  report.identity = await app.evaluate(({ app, BrowserWindow }) => ({
    packaged: app.isPackaged,
    exe: app.getPath("exe"),
    profile: app.getPath("userData"),
    bounds: BrowserWindow.getAllWindows()[0].getBounds(),
  }));
  report.origin = origin;
  await page
    .getByRole("button", { name: "Browse Marketplace assets", exact: true })
    .click();
  const market = page.getByRole("dialog", { name: "Marketplace", exact: true });
  if (!detected.studios.length) {
    await expect(market).toContainText("Studio disconnected", {
      timeout: 30000,
    });
    await market
      .getByRole("button", { name: "Refresh connection", exact: true })
      .click();
    await expect(market).toContainText("Studio disconnected", {
      timeout: 30000,
    });
    await page.screenshot({
      path: path.join(output, "actual-disconnected.png"),
    });
    report.actualDisconnected = true;
    await page.route("**/api/marketplace/studios", (r) =>
      r.fulfill({
        json: {
          studios: [
            {
              id: "392fce6b-fea7-4de3-bb2e-49a95231c3f5",
              name: "Connection test fixture",
            },
          ],
        },
      }),
    );
    await market
      .getByRole("button", { name: "Refresh connection", exact: true })
      .click();
    report.connectionFixture = true;
  }
  await expect(market).toContainText("Studio connected", { timeout: 30000 });
  await market
    .getByRole("button", { name: "Refresh connection", exact: true })
    .click();
  await expect(market).toContainText("Studio connected", { timeout: 30000 });
  await aligned(
    market.getByLabel("Marketplace Studio"),
    market.getByRole("button", { name: "Refresh connection", exact: true }),
  );
  await aligned(
    market.getByLabel("Asset type"),
    market.getByRole("button", { name: "Search assets", exact: true }),
  );
  await market
    .getByLabel("Search Marketplace", { exact: true })
    .fill("training dummy");
  await market
    .getByRole("button", { name: "Search assets", exact: true })
    .click();
  await expect(market.getByRole("article")).toHaveCount(30, { timeout: 30000 });
  await expect
    .poll(() =>
      market
        .locator(".market-thumbnail img")
        .first()
        .evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0),
    )
    .toBe(true);
  await page.screenshot({ path: path.join(output, "live-marketplace.png") });
  report.liveMarketplace = {
    count: 30,
    connected: true,
    refreshed: true,
    aligned: true,
    thumbnailLoaded: true,
  };
  assert.deepEqual(
    (
      await new AxeBuilder({ page })
        .setLegacyMode(true)
        .include(".focused-dialog")
        .analyze()
    ).violations,
    [],
  );
  await market
    .getByRole("button", { name: "Close Marketplace", exact: true })
    .click();

  const response = await page.request.post(origin + "/api/projects", {
    data: { request: "A training yard with a practice dummy" },
  });
  assert.equal(response.ok(), true);
  const project = await response.json();
  await page.goto(origin + "/?project=" + project.id);
  await page
    .getByRole("button", { name: "Preview & choose assets", exact: true })
    .click({ timeout: 30000 });
  const chooser = page.getByRole("dialog", {
    name: "Choose assets",
    exact: true,
  });
  await expect(chooser).toContainText("Studio connected", { timeout: 30000 });
  await expect(chooser.getByRole("article")).toHaveCount(30, {
    timeout: 30000,
  });
  await expect
    .poll(() =>
      chooser
        .locator(".asset-choice-thumbnail")
        .first()
        .evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0),
    )
    .toBe(true);
  await aligned(
    chooser.getByLabel("Asset search Studio"),
    chooser.getByRole("button", { name: "Refresh connection", exact: true }),
  );
  await page.screenshot({ path: path.join(output, "live-chooser.png") });
  report.liveChooser = { count: 30, connected: true, aligned: true };
  await app.evaluate(({ BrowserWindow }) => {
    const window = BrowserWindow.getAllWindows()[0];
    window.unmaximize();
    window.setBounds({ width: 860, height: 640 });
  });
  report.recovery = await connectionRecoveryFlow(
    page,
    origin,
    path.join(output, "recovered-minimum-window.png"),
  );
  await page
    .getByRole("dialog", { name: "Choose assets", exact: true })
    .getByRole("button", { name: "Close dialog", exact: true })
    .click();
  const f = await assetChoiceFixture(page, origin);
  f.project().error =
    "Output truncated: raise the model output limit or reduce task size";
  f.project().stage = "failed";
  await page.reload();
  await expect(
    page.getByText("The model ran out of reply space", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Open model settings", exact: true })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "Open model settings", exact: true }),
  ).toBeInViewport();
  await page.screenshot({ path: path.join(output, "truncation-recovery.png") });
  await page
    .getByRole("button", { name: "Open model settings", exact: true })
    .click();
  await expect(page).toHaveURL(/#models$/);
  assert.deepEqual(
    f.calls.filter((c) => ["plan", "concept", "build"].includes(c)),
    [],
  );
  report.modelRecovery = true;
  report.rendererErrors = errors;
  assert.deepEqual(errors, []);
  report.ok = true;
} catch (error) {
  report.error = (error as Error).stack;
  throw error;
} finally {
  await app.close();
  report.closed = true;
  fs.writeFileSync(
    path.join(output, "report.json"),
    JSON.stringify(report, null, 2),
  );
}
