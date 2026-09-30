import { test, expect } from "./workspace-fixture";
import AxeBuilder from "@axe-core/playwright";
import { polishFixture } from "./ui-polish-fixture";







test("panel pointer and keyboard resize respect bounds and survive reload", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const f = await polishFixture(page, "build");
  await page.goto("/?project=" + f.id);
  const separator = page.getByRole("separator", { name: "Resize Takko panel" });
  const chat = page.getByRole("region", { name: "Project conversation" });
  await separator.press("Home");
  await expect(separator).toHaveAttribute("aria-valuenow", "320");
  await separator.press("ArrowLeft");
  await expect(separator).toHaveAttribute("aria-valuenow", "336");
  const box = (await separator.boundingBox())!;
  await page.mouse.move(box.x + 6, box.y + 100);
  await page.mouse.down();
  await page.mouse.move(150, box.y + 150, { steps: 5 });
  await page.mouse.up();
  await expect(separator).toHaveAttribute("aria-valuenow", "640");
  expect((await chat.boundingBox())!.width).toBe(640);
  await page.reload();
  await expect(separator).toHaveAttribute("aria-valuenow", "640");
  await page.setViewportSize({ width: 860, height: 640 });
  expect(
    (await page
      .getByRole("region", { name: "Game architecture" })
      .boundingBox())!.width,
  ).toBeGreaterThanOrEqual(379);
  expect((await chat.boundingBox())!.width).toBeGreaterThanOrEqual(320);
  await expect(
    page.getByRole("textbox", { name: "Message", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-artifacts/ui-polish/minimum-desktop.png",
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(separator).toHaveAttribute("aria-valuenow", "640");
  await separator.dblclick();
  await expect(separator).toHaveAttribute("aria-valuenow", "400");
});

test("inspector, source, Studio, plan and composer stay usable", async ({
  page,
}, info) => {
  const f = await polishFixture(page, "build");
  await page.goto("/?project=" + f.id);
  await page.getByRole("button", { name: "Edit Combat", exact: true }).click();
  const inspector = page.getByRole("complementary", {
    name: "Architecture inspector",
  });
  await expect(
    inspector.getByLabel("System name", { exact: true }),
  ).toBeVisible();
  await expect(inspector.getByLabel("From", { exact: true })).toHaveCount(0);
  await inspector
    .getByRole("button", { name: "Connections", exact: true })
    .click();
  await expect(inspector.getByLabel("From", { exact: true })).toBeVisible();
  await inspector.getByRole("button", { name: "Close inspector" }).click();
  for (const name of ["Source", "Studio", "Build"]) {
    await page
      .getByRole("button", { name: name + " details", exact: true })
      .click();
    await expect(
      page.getByRole("dialog", { name: name + " details" }),
    ).toBeVisible();
    if (name === "Studio") {
      await expect(page.locator(".studio-view")).toContainText(
        "Play in Studio to check",
      );
      expect(
        (await page.locator(".studio-view").boundingBox())!.height,
      ).toBeLessThan(180);
    }
    await page
      .getByRole("button", { name: "Close dialog", exact: true })
      .click();
  }
  await page.locator(".compact-plan > summary").click();
  await expect(page.locator(".compact-plan")).toContainText("Complete");
  const composer = page.getByRole("textbox", { name: "Message", exact: true });
  await composer.fill("Keep the training yard small");
  await composer.press("Shift+Enter");
  await composer.press("x");
  await expect(composer).toHaveValue("Keep the training yard small\nx");
  expect(f.calls).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-artifacts/ui-polish/workspace-${info.project.name}.png`,
  });
});
