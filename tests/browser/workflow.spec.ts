import { test, expect } from "./workspace-fixture";
import AxeBuilder from "@axe-core/playwright";
import { createServer } from "node:http";
import { fakeTransport, profile } from "../generation-fixtures";

test("model dialog traps keyboard focus and restores its launcher", async ({
  page,
}) => {
  await page.goto("/#models");
  const launcher = page.getByRole("button", { name: "Add model", exact: true });
  await launcher.click();
  const dialog = page.getByRole("dialog");
  const close = dialog.getByRole("button", { name: "Close dialog" });
  await expect(close).toBeFocused();
  await close.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", { name: "Cancel", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(launcher).toBeFocused();
});

test("project selection survives refresh and detail controls support keyboard activation", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.getByLabel("Game idea").fill("A small puzzle game");
  await page.getByRole("button", { name: "Create project" }).click();
  await expect(page).toHaveURL(/project=/);
  await page.reload();
  await expect(page.locator(".chat-thread-scroll")).toContainText(
    "A small puzzle game",
  );
  const build = page.getByRole("button", {
    name: "Build details",
    exact: true,
  });
  await build.focus();
  await build.press("Enter");
  await expect(
    page.getByRole("dialog", { name: "Build details" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(build).toBeFocused();
  await page
    .getByRole("button", { name: "Studio details", exact: true })
    .press("Enter");
  await expect(
    page.getByRole("dialog", { name: "Studio details" }),
  ).toBeVisible();
});

test("catalog search selects a model and its published rates", async ({
  page,
}) => {
  await page.request.put("/api/models", {
    data: {
      profiles: [],
      routes: { planner: [], builder: [], reviewer: [], repair: [] },
      budgetMicros: 250000,
      repairLimit: 1,
    },
  });
  await page.route("**/api/model-catalog", (r) =>
    r.fulfill({
      json: [
        {
          id: "test/economy",
          name: "Economy",
          inputRate: 0.1,
          outputRate: 0.4,
        },
        { id: "test/large", name: "Large", inputRate: 5, outputRate: 15 },
      ],
    }),
  );
  await page.goto("/#models");
  await page.getByRole("button", { name: "Add model", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await connectFixture(page, true);
  await dialog.getByLabel("Search provider models").fill("economy");
  await dialog.getByRole("button", { name: /Economy.*economy/ }).click();
  await expect(dialog.getByLabel("Model ID", { exact: true })).toHaveCount(0);
  await dialog
    .getByRole("button", { name: "Edit model details", exact: true })
    .click();
  await expect(dialog.getByLabel("Model ID", { exact: true })).toHaveValue(
    "test/economy",
  );
  await expect(dialog.getByLabel("Reading price")).toHaveValue("0.1");
  await expect(dialog.getByLabel("Writing price")).toHaveValue("0.4");
  expect(
    (await (await page.request.get("/api/models")).json()).profiles,
  ).toHaveLength(0);
  await dialog.getByRole("button", { name: "Add to library" }).click();
  await expect(dialog).toBeHidden();
  const saved = await (await page.request.get("/api/models")).json();
  expect(saved.profiles[0].model).toBe("test/economy");
  await page.request.delete("/api/model-profiles/" + saved.profiles[0].id);
});

test("welcomes multiple game ideas without generating a preset or claiming a connection", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "What do you want to build?" }),
  ).toBeVisible();
  await page
    .getByLabel("Game idea")
    .fill(
      "Make a farming loop with crop growth, harvesting, selling and a shop",
    );
  await expect(page.getByLabel("Game idea")).toHaveValue(/farming/);
  await page.getByRole("button", { name: "Create project" }).click();
  await expect(page.getByLabel("Project request")).toHaveValue(/farming/);
  await page.getByRole("button", { name: "Prepare proposal from saved conversation" }).click();
  await expect(page.getByRole("alert")).toContainText("Configure");
  await page
    .getByRole("button", { name: "Studio details", exact: true })
    .click();
  await expect(page.getByText("Awaiting connection")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Download Takko.rbxmx" }),
  ).toHaveAttribute("href", "/api/studio/plugin");
  await page.screenshot({
    path: `test-artifacts/forge-v2-studio-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
test("configures provider keys without reflecting secrets or persisting them in browser storage", async ({
  page,
}) => {
  await page.request.put("/api/models", {
    data: {
      profiles: [],
      routes: { planner: [], builder: [], reviewer: [], repair: [] },
      budgetMicros: 2e6,
      repairLimit: 1,
    },
  });
  await page.goto("/#models");
  await page.getByRole("button", { name: "Add model", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await connectFixture(page, true);
  await dialog
    .getByRole("button", { name: "Can't find it? Enter a model ID" })
    .click();
  await dialog.getByLabel("Library name").fill("My model");
  await dialog.getByLabel("Model ID", { exact: true }).fill("test/model");

  await dialog.getByLabel("Reading price").fill("0.1");
  await dialog.getByLabel("Writing price").fill("0.2");
  await dialog.getByRole("button", { name: "Add to library" }).click();
  await expect(dialog).toBeHidden();
  await page
    .getByRole("button", { name: "Edit My model", exact: true })
    .click();
  await expect(
    dialog.getByText(/Available to all models from this provider/),
  ).toBeVisible();
  await expect(dialog.getByLabel("API key", { exact: true })).toHaveCount(0);
  const settings = await (await page.request.get("/api/models")).text();
  expect(settings).not.toContain("browser-test-secret");
  expect(
    await page.evaluate(
      () => JSON.stringify(localStorage) + JSON.stringify(sessionStorage),
    ),
  ).not.toContain("browser-test-secret");
  await dialog
    .getByRole("button", { name: "Remove model", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Remove from library" }).click();
  await expect(dialog).toBeHidden();
});

test("keeps the model editor open when saving fails", async ({ page }) => {
  await page.goto("/#models");
  await page.getByRole("button", { name: "Add model", exact: true }).click();
  await page.route("**/api/model-profiles/*", (r) =>
    r.fulfill({
      status: 400,
      json: { error: "Unable to save model settings" },
    }),
  );
  const dialog = page.getByRole("dialog");
  await connectFixture(page, true);
  await dialog
    .getByRole("button", { name: "Can't find it? Enter a model ID" })
    .click();
  await dialog.getByLabel("Model ID", { exact: true }).fill("sample/model");
  await dialog.getByRole("button", { name: "Add to library" }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("alert")).toContainText(
    "Unable to save model settings",
  );
});

test("welcome and model settings pass accessibility checks and fit the viewport", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-artifacts/forge-v2-welcome-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page
    .locator(".topbar")
    .getByRole("button", { name: "Models", exact: true })
    .click();
  expect(
    (await new AxeBuilder({ page }).include(".settings-workspace").analyze())
      .violations,
  ).toEqual([]);
});

import { mockProviderConnections, connectFixture } from "./provider-fixture";
test.beforeEach(async ({ page }) => {
  await mockProviderConnections(page);
});

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: "ignoreErrors" });
});
