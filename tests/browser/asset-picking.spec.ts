import { test, expect } from "./workspace-fixture";
import type { Page } from "@playwright/test";
import { tsImport } from "tsx/esm/api";
const { pickerFixture } = (await tsImport(
  "../asset-picking-fixture.ts",
  import.meta.url,
)) as typeof import("../asset-picking-fixture");
import { pickStatus } from "../../src/marketplace/pick-status";
let f: Awaited<ReturnType<typeof pickerFixture>>;
test.beforeEach(async ({ page }) => {
  f = await pickerFixture();
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes("thumbnails")) return route.fulfill({ json: {} });
    const response = await route.fetch({
      url: f.origin + url.pathname + url.search,
      headers: { ...route.request().headers(), origin: f.origin },
    });
    if (url.pathname === "/api/status")
      return route.fulfill({
        json: { ...(await response.json()), studioConnectionGate: false },
      });
    return route.fulfill({ response });
  });
  await page.goto("/?project=" + f.project().id);
  await expect(
    page.getByRole("region", { name: "Assets for this game", exact: true }),
  ).toBeVisible();
});
test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: "wait" });
  await f.close();
});
const card = (page: Page) =>
  page.getByRole("region", { name: "Assets for this game", exact: true });
const row = (page: Page, name = "Target dummy") =>
  card(page).getByRole("region", { name, exact: true });

test("card and Marketplace persist each real listing and clip through reload and revision changes", async ({
  page,
}, info) => {
  await expect(card(page)).toContainText("0 of 3 ready");
  await expect(
    card(page).getByRole("button", { name: "Approve & build", exact: true }),
  ).toBeDisabled();
  await row(page)
    .getByRole("button", { name: "Choose asset", exact: true })
    .click();
  await expect(
    page.getByText("Choosing: Target dummy", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Search Marketplace", { exact: true }),
  ).toHaveValue("punching training dummy");
  await page
    .getByLabel("Search Marketplace", { exact: true })
    .fill("target dummy");
  await page
    .getByRole("button", { name: "Search assets", exact: true })
    .click();
  await expect(page.locator(".market-card").first()).toContainText(
    f.dummies[0].name,
  );
  await page.screenshot({
    path: `test-artifacts/takko-refresh/picking-${info.project.name}.png`,
  });
  await page
    .locator(".market-card")
    .nth(1)
    .getByRole("button", { name: "Use this", exact: true })
    .click();
  await expect(row(page)).toContainText("Ready");
  await page.reload();
  await expect(row(page)).toContainText(f.dummies[1].name);
  const p = f.project();
  f.app.locals.engine.revise(p.id, p.revision, p.request, p.answers);
  await page.reload();
  await expect(row(page)).toContainText(f.dummies[1].name);
  await row(page, "Punch animation")
    .getByRole("button", { name: "Choose asset", exact: true })
    .click();
  await page.getByRole("button", { name: "Use this", exact: true }).click();
  const sheet = page.getByRole("dialog", {
    name: `Clips from ${f.animation.name}`,
  });
  await expect(sheet).toBeVisible();
  const group = f
    .project()
    .assetDiscovery!.groups.find((g) => g.id === "punchAnimation")!;
  const entry = group.options
    .find((o) => o.assetId === f.animation.assetId)!
    .previewData!.pack!.entries.find((e) => e.clip)!;
  await sheet
    .getByRole("button", {
      name: new RegExp(entry.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    })
    .first()
    .click();
  await sheet
    .getByRole("button", { name: "Use this clip", exact: true })
    .click();
  await expect(row(page, "Punch animation")).toContainText("Ready");
  await row(page, "Hit sound")
    .getByRole("button", { name: "Choose asset", exact: true })
    .click();
  await page.getByRole("button", { name: "Use this", exact: true }).click();
  await expect(card(page)).toContainText("3 of 3 ready");
  await expect(
    card(page).getByRole("button", { name: "Approve & build", exact: true }),
  ).toBeEnabled();
  await page.reload();
  await expect(card(page)).toContainText("3 of 3 ready");
  await card(page).scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `test-artifacts/takko-refresh/card-ready-${info.project.name}.png`,
  });
  expect(f.state.calls).toBe(0);
});

test("excluded listings are visible and Escape returns to chat", async ({
  page,
}) => {
  const p = f.project();
  p.excludedAssetIds = [f.dummies[0].assetId];
  f.app.locals.engine.store.save(p);
  await page.reload();
  await row(page)
    .getByRole("button", { name: "Choose asset", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Excluded by you", exact: true }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.locator(".marketplace-picking")).toHaveCount(0);
  await expect(
    row(page).getByRole("button", { name: "Choose asset", exact: true }),
  ).toBeFocused();
});

test("checking, amber Keep it, and disconnected red recovery keep the build gated", async ({
  page,
}) => {
  f.state.scripts = 1;
  let done!: () => void;
  f.state.delay = new Promise<void>((r) => (done = r));
  await row(page)
    .getByRole("button", { name: "Choose asset", exact: true })
    .click();
  await page
    .locator(".market-card")
    .nth(1)
    .getByRole("button", { name: "Use this", exact: true })
    .click();
  await expect(
    page.locator(".marketplace-picking").getByText("Checking", { exact: true }),
  ).toBeVisible();
  done();
  await expect(row(page)).toContainText("Check this pick");
  await row(page).getByRole("button", { name: "Keep it", exact: true }).click();
  await expect(row(page)).toContainText("Kept by you");
  f.state.connected = false;
  await row(page).getByRole("button", { name: "Change", exact: true }).click();
  await page
    .locator(".market-card")
    .nth(2)
    .getByRole("button", { name: "Use this", exact: true })
    .click();
  await expect(row(page)).toContainText("Problem");
  await expect(row(page)).toContainText("Studio isn't connected");
  await expect(
    card(page).getByRole("button", { name: "Approve & build", exact: true }),
  ).toBeDisabled();
});

for (const relevant of [true, false])
  test(`Choose for me shows a cost and ${relevant ? "keeps a relevant pick" : "leaves an irrelevant page empty"}`, async ({
    page,
  }) => {
    f.state.relevant = relevant;
    await row(page)
      .getByRole("button", { name: "Choose for me", exact: true })
      .click();
    await expect(row(page)).toContainText("Estimated maximum");
    expect(f.state.calls).toBe(0);
    await row(page)
      .getByRole("button", { name: /Choose for me ·/ })
      .click();
    await expect.poll(() => f.state.calls).toBeGreaterThan(0);
    if (relevant) await expect(row(page)).toContainText("Best relevant match");
    else
      await expect(row(page)).toContainText("Nothing on this page is relevant");
    expect(!!f.project().assetDiscovery?.choices?.targetDummy?.assetId).toBe(
      relevant,
    );
  });
