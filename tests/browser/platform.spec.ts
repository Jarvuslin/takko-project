import { test, expect } from "./workspace-fixture";
import { tsImport } from "tsx/esm/api";
const { pickerFixture } = (await tsImport(
  "../asset-picking-fixture.ts",
  import.meta.url,
)) as typeof import("../asset-picking-fixture");
let f: Awaited<ReturnType<typeof pickerFixture>>;
test.beforeEach(async ({ page }) => {
  f = await pickerFixture();
  await page.route("**/api/**", async (route) => {
    const u = new URL(route.request().url());
    if (u.pathname.includes("thumbnails")) return route.fulfill({ json: {} });
    const response = await route.fetch({
      url: f.origin + u.pathname + u.search,
      headers: { ...route.request().headers(), origin: f.origin },
    });
    return u.pathname === "/api/status"
      ? route.fulfill({
          json: { ...(await response.json()), studioConnectionGate: false },
        })
      : route.fulfill({ response });
  });
});
test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: "wait" });
  await f.close();
});
test("new projects show the PC chip while legacy projects keep their existing platform scope", async ({
  page,
}) => {
  const p = f.app.locals.engine.create("A stationary dummy punching game");
  await page.goto("/?project=" + p.id);
  await expect(page.locator(".platform-chip")).toHaveText(
    "PC · keyboard and mouse",
  );
  await page.reload();
  await expect(page.locator(".platform-chip")).toHaveText(
    "PC · keyboard and mouse",
  );
  await page.goto("/?project=" + f.project().id);
  await expect(
    page.getByRole("region", { name: "Assets for this game", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".platform-chip")).toHaveCount(0);
  expect(f.state.calls).toBe(0);
});
test("ambiguous platform opens a free question and persists an explicit VR and PC answer", async ({
  page,
}) => {
  const p = f.app.locals.engine.create(
    "Maybe mobile support for a punching game",
  );
  await page.goto("/?project=" + p.id);
  const dialog = page.getByRole("dialog", {
    name: "Question 1 of 1",
    exact: true,
  });
  await expect(dialog).toContainText(
    "Which platforms should this game support?",
  );
  await expect(dialog).toContainText("without a model call");
  await dialog.getByRole("radio", { name: "Other", exact: true }).check();
  await dialog.getByLabel("Your answer").fill("PC keyboard and mouse and VR");
  await dialog
    .getByRole("button", { name: "Review answers", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Submit answers", exact: true })
    .click();
  await expect(page.locator(".platform-chip")).toHaveText("PC + VR");
  await page.reload();
  await expect(page.locator(".platform-chip")).toHaveText("PC + VR");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(f.state.calls).toBe(0);
});
