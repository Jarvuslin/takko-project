import { test, expect } from "./workspace-fixture";
import AxeBuilder from "@axe-core/playwright";
import { polishFixture } from "./ui-polish-fixture";

test("focused decisions retain choices, support multiple and skip, and save a compact receipt", async ({
  page,
}, info) => {
  const f = await polishFixture(page);
  await page.goto("/?project=" + f.id);

  const dialog = page.getByRole("dialog", {
    name: "Question",
  });
  await expect(
    dialog.getByRole("button", { name: "Next", exact: true }),
  ).toBeDisabled();
  await dialog
    .getByRole("radio", { name: "Fists + kicks", exact: true })
    .check();
  await dialog
    .getByRole("radio", { name: "Fists + kicks", exact: true })
    .press("Enter");
  await dialog
    .getByRole("checkbox", { name: "Impact sounds", exact: true })
    .check();
  await dialog
    .getByRole("checkbox", { name: "Hit effects", exact: true })
    .check();
  await dialog.getByRole("button", { name: "Back", exact: true }).click();
  await expect(
    dialog.getByRole("radio", { name: "Fists + kicks", exact: true }),
  ).toBeChecked();
  await dialog.getByRole("button", { name: "Next", exact: true }).click();
  await expect(
    dialog.getByRole("checkbox", { name: "Hit effects", exact: true }),
  ).toBeChecked();
  await dialog.screenshot({
    path: `docs/results/ui-polish/questions-${info.project.name}.png`,
  });
  expect(
    (await new AxeBuilder({ page }).include(".clarification-flow").analyze())
      .violations,
  ).toEqual([]);
  await dialog.getByRole("button", { name: "Next", exact: true }).click();
  await dialog.getByRole("button", { name: "Skip", exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(f.calls).toEqual([]);
  await expect(
    page.getByRole("button", { name: "Edit answers", exact: true }),
  ).toBeFocused();
  await page.reload();
  await expect(page.locator(".clarifications")).toContainText("Fists + kicks");
  await page
    .getByRole("button", { name: "Update my concept", exact: true })
    .click();
  await expect(page.locator(".saved-clarifications")).toContainText(
    "Fists + kicks",
  );
  expect(f.calls).toEqual(["PATCH", "concept"]);
  await page.screenshot({
    path: `docs/results/ui-polish/receipt-${info.project.name}.png`,
  });
  await page
    .locator(".saved-clarifications")
    .getByRole("button", { name: "Edit answers" })
    .click();
  await dialog.getByLabel("Your answer", { exact: true }).fill("Fists only");
  await dialog.getByRole("button", { name: "Next", exact: true }).click();
  await dialog.getByRole("button", { name: "Send", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Approve brief" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Update concept", exact: true })
    .click();
  expect(f.project().answers.combat).toBe("Fists only");
  await expect
    .poll(() => f.calls)
    .toEqual(["PATCH", "concept", "PATCH", "concept"]);
});

test("dialog custom input, focus loop, Escape and restored draft work without submission", async ({
  page,
}) => {
  const f = await polishFixture(page);
  await page.goto("/?project=" + f.id);

  const d = page.getByRole("dialog");

  await d
    .getByLabel("Your answer", { exact: true })
    .fill("A staff with a defensive kick");
  await d.getByRole("button", { name: "Next", exact: true }).press("Tab");
  await expect(
    d.getByRole("button", { name: "Close dialog", exact: true }),
  ).toBeFocused();
  await d
    .getByRole("button", { name: "Close dialog", exact: true })
    .press("Shift+Tab");
  await expect(
    d.getByRole("button", { name: "Next", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(d).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Edit answers", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Edit answers", exact: true }).click();
  await expect(d.getByLabel("Your answer", { exact: true })).toHaveValue(
    "A staff with a defensive kick",
  );
  expect(f.calls).toEqual([]);
});

test("one simple decision stays inline and custom answers remain available", async ({
  page,
}) => {
  const f = await polishFixture(page, "simple");
  await page.goto("/?project=" + f.id);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("radio", { name: "R6", exact: true }).check();
  await expect(
    page.getByRole("radio", { name: "R6", exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Other…", exact: true }).click();
  await page
    .getByLabel("Your answer", { exact: true })
    .fill("Let players choose their rig");
  await page
    .getByRole("button", { name: "Update my concept", exact: true })
    .click();
  expect(f.project().answers.rig).toBe("Let players choose their rig");
});

test("panel pointer and keyboard resize respect bounds and survive reload", async ({
  page,
}, info) => {
  test.skip(
    info.project.name === "mobile",
    "The phone uses stacked panels instead of a horizontal divider.",
  );
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
  await page.screenshot({ path: "docs/results/ui-polish/minimum-desktop.png" });
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
    path: `docs/results/ui-polish/workspace-${info.project.name}.png`,
  });
});
