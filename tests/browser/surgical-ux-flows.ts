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
    "rgb(220, 245, 66)",
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
  const f = await assetChoiceFixture(page, origin);
  await page
    .locator(".need-card")
    .getByRole("button", { name: "Choose asset", exact: true })
    .first()
    .click();
  const browser = page.getByRole("complementary", {
    name: "Marketplace",
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
  const use = browser
    .getByRole("article")
    .nth(42)
    .getByRole("button", { name: "Use this", exact: true });
  await use.scrollIntoViewIfNeeded();
  await use.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(use).toBeFocused();
  expect(await use.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe(
    "solid",
  );
  if (screenshot) await page.screenshot({ path: screenshot });
  expect(
    (
      await new AxeBuilder({ page })
        .setLegacyMode(legacy)
        .include(".marketplace-picking")
        .analyze()
    ).violations,
  ).toEqual([]);
  await use.click();
  await expect(browser).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Practice dummy", exact: true }),
  ).toContainText("Practice dummy option 43");
  expect(f.project().assetDiscovery?.choices?.dummy.assetId).toBe("1043");
  expect(f.project().assetDiscovery?.approved).not.toBe(true);
  await page.reload();
  await expect(
    page.getByRole("region", { name: "Practice dummy", exact: true }),
  ).toContainText("Practice dummy option 43");
  await page
    .getByRole("region", { name: "Practice dummy", exact: true })
    .getByRole("button", { name: "Change", exact: true })
    .click();
  await browser
    .getByLabel("Search Marketplace", { exact: true })
    .fill("wooden dummy");
  await browser
    .getByRole("button", { name: "Search assets", exact: true })
    .click();
  await expect(browser.getByRole("article")).toHaveCount(30);
  expect(f.project().assetDiscovery?.groups[0].query).toBe("wooden dummy");
  expect(f.errors).toEqual([]);
  await page.keyboard.press("Escape");
}
