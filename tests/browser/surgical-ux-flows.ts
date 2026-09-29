import { expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { assetChoiceFixture } from "./asset-choices-fixture";
import { polishFixture } from "./ui-polish-fixture";

export async function focusFlow(page: Page, origin = "") {
  await page.goto(origin + "/");
  const input = page.locator("textarea").first();
  await input.click();
  expect(await input.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe(
    "none",
  );
  await input.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  expect(await input.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe(
    "solid",
  );
  expect(await input.evaluate((e) => getComputedStyle(e).outlineColor)).toBe(
    "rgb(156, 187, 201)",
  );
}
export async function questionFlow(
  page: Page,
  origin = "",
  screenshot?: string,
  legacy = false,
) {
  const f = await polishFixture(page);
  await page.goto(origin + "/?project=" + f.id);
  const q = page.getByRole("dialog", { name: "Question", exact: true });
  await expect(q).toBeVisible();
  await q.getByRole("radio", { name: "Fists + kicks", exact: true }).check();
  await q.getByRole("button", { name: "Next", exact: true }).click();
  await q.getByRole("checkbox", { name: "Hit effects", exact: true }).check();
  await q.getByLabel("Your answer", { exact: true }).press("Tab");
  await expect(
    q.getByRole("button", { name: "Back", exact: true }),
  ).toBeFocused();
  expect(
    await q
      .getByRole("button", { name: "Back", exact: true })
      .evaluate((e) => getComputedStyle(e).outlineStyle),
  ).toBe("solid");
  await q.getByRole("button", { name: "Back", exact: true }).click();
  await expect(
    q.getByRole("radio", { name: "Fists + kicks", exact: true }),
  ).toBeChecked();
  await q
    .getByLabel("Your answer", { exact: true })
    .fill("Fists + kicks, with a block and dodge");
  await q.getByRole("button", { name: "Next", exact: true }).click();
  await expect(
    q.getByRole("checkbox", { name: "Hit effects", exact: true }),
  ).toBeChecked();
  if (screenshot) await page.screenshot({ path: screenshot });
  expect(
    (
      await new AxeBuilder({ page })
        .setLegacyMode(legacy)
        .include(".clarification-flow")
        .analyze()
    ).violations,
  ).toEqual([]);
  await q.getByRole("button", { name: "Next", exact: true }).click();
  await q.getByRole("button", { name: "Skip", exact: true }).click();
  await expect(q).toBeHidden();
  await expect(page.locator(".clarifications")).toContainText(
    "Fists + kicks, with a block and dodge",
  );
  await expect(
    page.getByRole("button", { name: "Edit answers", exact: true }),
  ).toBeFocused();
  expect(f.calls).toEqual([]);
}
export async function browseFlow(
  page: Page,
  origin = "",
  screenshot?: string,
  legacy = false,
) {
  await page.route("**/api/status", (r) =>
    r.fulfill({
      json: {
        studios: [],
        concepts: true,
        assetChoices: true,
        studioConnectionGate: false,
      },
    }),
  );
  const f = await assetChoiceFixture(page, origin);
  await page
    .getByRole("button", { name: "Preview & choose assets", exact: true })
    .click();
  const browser = page.getByRole("dialog", {
    name: "Choose assets",
    exact: true,
  });
  await expect(browser.getByRole("article")).toHaveCount(30);
  await expect(browser.getByRole("article").first()).toContainText(
    "92% · 100 votes",
  );
  await expect(page.locator("canvas")).toHaveCount(0);
  await browser
    .getByRole("button", { name: "Load more results", exact: true })
    .click();
  await expect(browser.getByRole("article")).toHaveCount(60);
  await browser.getByRole("article").nth(42).scrollIntoViewIfNeeded();
  const body = browser.locator(":scope > .dialog-body");
  const position = await body.evaluate((e) => e.scrollTop);
  const calls = f.calls.length;
  await browser
    .getByRole("article")
    .nth(42)
    .getByRole("button", { name: "Preview", exact: true })
    .press("Tab");
  const select = browser
    .getByRole("article")
    .nth(42)
    .getByRole("button", { name: "Select", exact: true });
  await expect(select).toBeFocused();
  expect(await select.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe(
    "solid",
  );
  await browser
    .getByRole("article")
    .nth(42)
    .getByRole("button", { name: "Preview", exact: true })
    .click();
  let preview = page.getByRole("dialog", {
    name: "Practice dummy option 43",
    exact: true,
  });
  await expect(preview.locator("canvas")).toHaveCount(1);
  await expect
    .poll(async () =>
      Number(await preview.locator("canvas").getAttribute("data-triangles")),
    )
    .toBeGreaterThan(0);
  await preview
    .getByRole("button", { name: "Back to results", exact: true })
    .click();
  await expect(page.locator("canvas")).toHaveCount(0);
  expect(await body.evaluate((e) => e.scrollTop)).toBe(position);
  expect(f.calls.slice(calls)).toEqual(["asset-preview"]);
  await browser
    .getByRole("article")
    .nth(43)
    .getByRole("button", { name: "Preview", exact: true })
    .click();
  preview = page.getByRole("dialog", {
    name: "Practice dummy option 44",
    exact: true,
  });
  await expect(preview.locator("canvas")).toHaveCount(1);
  await preview
    .getByRole("button", { name: "Reload preview", exact: true })
    .scrollIntoViewIfNeeded();
  await expect(
    preview.getByRole("button", { name: "Reload preview", exact: true }),
  ).toBeInViewport();
  await expect(
    preview.getByRole("button", { name: "Choose this asset", exact: true }),
  ).toBeInViewport();
  if (screenshot) await page.screenshot({ path: screenshot });
  expect(
    (
      await new AxeBuilder({ page })
        .setLegacyMode(legacy)
        .include(".asset-preview-dialog")
        .analyze()
    ).violations,
  ).toEqual([]);
  await preview
    .getByRole("button", { name: "Choose this asset", exact: true })
    .click();
  await expect(
    browser
      .getByRole("article")
      .nth(43)
      .getByRole("button", { name: "Selected ✓", exact: true }),
  ).toBeVisible();
  expect(f.project().assetDiscovery?.approved).not.toBe(true);
  await expect(browser.getByRole("article")).toHaveCount(60);
  await expect(browser.getByLabel("Search for Practice dummy")).toHaveValue(
    "training dummy",
  );
  await browser
    .getByRole("article")
    .nth(43)
    .getByRole("button", { name: "Preview", exact: true })
    .click();
  await preview
    .getByRole("button", { name: "Remove selection", exact: true })
    .click();
  await expect(
    preview.getByRole("button", { name: "Choose this asset", exact: true }),
  ).toBeEnabled();
  await page.keyboard.press("Escape");
  await expect(preview).toBeHidden();
  await expect(browser).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await browser.getByLabel("Search for Practice dummy").fill("wooden dummy");
  await browser
    .getByRole("button", { name: "Search again", exact: true })
    .click();
  await expect(browser.getByRole("article")).toHaveCount(30);
  expect(f.project().assetDiscovery?.groups[0].query).toBe("wooden dummy");
  expect(f.errors).toEqual([]);
  await page.keyboard.press("Escape");
}
