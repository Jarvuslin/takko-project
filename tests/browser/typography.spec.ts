import { test, expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { specification } from "../generation-fixtures";

async function expectTextFits(locator: Locator): Promise<void> {
  await expect(locator).toBeVisible();
  expect(
    await locator.evaluate(
      (element) => element.scrollWidth <= element.clientWidth + 1,
    ),
  ).toBe(true);
}

async function fontsReady(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("body")).toHaveCSS("font-family", /Segoe UI/);
}

test("system typography requires no external fonts and fits the minimal responsive layout", async ({
  page,
}, testInfo) => {
  const externalFonts: string[] = [];
  await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => {
    externalFonts.push(route.request().url());
    return route.abort();
  });
  await page.goto("/");
  await expect(page).toHaveTitle("Takko — Roblox creation studio");
  await expect(page.getByRole("link", { name: "Takko home" })).toContainText(
    "takko",
  );
  await fontsReady(page);
  expect(externalFonts).toEqual([]);
  await expect(page.locator(".welcome h1")).toHaveCSS("font-weight", "600");
  await expect(page.locator(".welcome h1")).toHaveCSS(
    "font-family",
    /Segoe UI/,
  );
  await expect(page.getByLabel("Game idea")).toHaveCSS(
    "font-family",
    /Segoe UI/,
  );
  await expect(page.getByRole("button", { name: "Create project" })).toHaveCSS(
    "font-family",
    /Segoe UI/,
  );

  const widths =
    testInfo.project.name === "desktop" ? [768, 1024, 1440] : [375, 390];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await expectTextFits(page.locator(".welcome h1"));
    await expectTextFits(page.locator(".welcome form"));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.screenshot({
    path: `docs/results/forge-minimal-type-dashboard-${testInfo.project.name}.png`,
    fullPage: true,
  });
  if (testInfo.project.name === "desktop")
    await page.screenshot({
      path: "docs/results/takko-desktop.png",
      fullPage: true,
    });
});

test("workspace typography keeps prose readable and controls usable", async ({
  page,
}, testInfo) => {
  const created = await (
    await page.request.post("/api/projects", {
      data: { request: "A cooperative farming game with a harvest shop" },
    })
  ).json();
  const fixture = {
    ...created,
    spec: specification(created.request, created.scope),
  };
  await page.route("**/api/projects/" + created.id, (route) =>
    route.fulfill({ json: fixture }),
  );
  await page.goto("/?project=" + created.id);
  await fontsReady(page);
  await expect(page.getByRole("heading", { name: "Your request" })).toHaveCSS(
    "font-family",
    /Segoe UI/,
  );
  const prose = page.locator(".spec-summary p");
  await expect(prose).toHaveCSS("font-family", /Segoe UI/);
  expect(
    await prose.evaluate((element) =>
      parseFloat(getComputedStyle(element).fontSize),
    ),
  ).toBeGreaterThanOrEqual(14);
  await expectTextFits(page.locator(".chat-heading"));
  await expectTextFits(page.locator(".tabs"));
  await expectTextFits(page.getByLabel("Project request"));
  await page
    .getByLabel("Message", { exact: true })
    .fill("Let players sell harvested crops together.");
  await expectTextFits(page.locator(".chat-composer"));
  await page.getByRole("tab", { name: "Source", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "The generated project" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Brief", exact: true }).click();
  await page.getByLabel("Project request").scrollIntoViewIfNeeded();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `docs/results/forge-minimal-type-workspace-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
