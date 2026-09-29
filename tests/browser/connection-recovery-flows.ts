import { expect, type Page, type Locator } from "@playwright/test";
import { assetChoiceFixture, studioId } from "./asset-choices-fixture";

export async function aligned(field: Locator, button: Locator) {
  // Modal entrance transforms can change between two locator reads. Wait for
  // the measured row to settle rather than relaxing the one-pixel tolerance.
  await expect
    .poll(async () => {
      const [a, b] = await Promise.all([
        field.boundingBox(),
        button.boundingBox(),
      ]);
      if (!a || !b) return Infinity;
      return Math.max(
        Math.abs(a.height - b.height),
        b.x >= a.x + a.width ? Math.abs(a.y - b.y) : 0,
      );
    })
    .toBeLessThanOrEqual(1);
}
export async function connectionRecoveryFlow(
  page: Page,
  origin = "",
  screenshot?: string,
) {
  const f = await assetChoiceFixture(page, origin);
  await expect
    .poll(() => f.project().assetDiscovery?.groups.length ?? 0)
    .toBeGreaterThan(0);
  let searches = 0,
    checks = 0,
    release: (() => void) | undefined,
    mode = "ready";
  await page.route("**/api/marketplace/search", async (r) => {
    searches++;
    return searches === 1
      ? r.fulfill({
          status: 503,
          json: { error: "Search temporarily unavailable" },
        })
      : r.fulfill({
          json: { assets: f.project().assetDiscovery!.groups[0].options },
        });
  });
  await page.route("**/api/marketplace/studios", async (r) => {
    checks++;
    if (mode === "hold")
      await new Promise<void>((resolve) => {
        release = resolve;
      });
    if (mode === "error")
      return r.fulfill({
        status: 503,
        json: { error: "Studio connector unavailable" },
      });
    return r.fulfill({
      json: { studios: [{ id: studioId, name: "Training yard" }] },
    });
  });
  await page.getByRole("button", { name: "Marketplace", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Marketplace", exact: true });
  await expect(dialog).toContainText("Studio connected");
  const refresh = dialog.getByRole("button", {
    name: "Refresh connection",
    exact: true,
  });
  await aligned(dialog.getByLabel("Marketplace Studio"), refresh);
  await dialog
    .getByLabel("Search Marketplace", { exact: true })
    .fill("target dummy");
  await dialog
    .getByRole("button", { name: "Search assets", exact: true })
    .click();
  await expect(dialog).toContainText("Search temporarily unavailable");
  mode = "hold";
  await refresh.click();
  await expect(
    dialog.getByRole("button", { name: "Checking…", exact: true }),
  ).toBeDisabled();
  await expect(
    dialog.locator(".marketplace-connection .spinner"),
  ).toBeVisible();
  expect(searches).toBe(1);
  mode = "ready";
  release!();
  await expect(dialog).toContainText("Studio connected");
  await dialog
    .getByRole("button", { name: "Search assets", exact: true })
    .click();
  await expect(dialog.getByRole("article")).toHaveCount(30);
  expect(searches).toBe(2);
  await aligned(
    dialog.getByLabel("Search Marketplace", { exact: true }),
    dialog.getByRole("button", { name: "Search assets", exact: true }),
  );
  if (screenshot) await page.screenshot({ path: screenshot });
  mode = "error";
  await refresh.click();
  await expect(dialog).toContainText("Connection check failed");
  await expect(dialog.getByLabel("Marketplace Studio")).toHaveValue("");
  mode = "ready";
  await refresh.click();
  await expect(dialog).toContainText("Studio connected");
  expect(searches).toBe(2);
  expect(f.errors).toEqual([]);
  return { checks, searches };
}
