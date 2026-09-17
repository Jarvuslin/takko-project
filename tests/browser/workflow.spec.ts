import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createServer } from "node:http";
import { fakeTransport, profile } from "../generation-fixtures";

test("model dialog traps keyboard focus and restores its launcher", async ({
  page,
}) => {
  await page.goto("/");
  const launcher = page
    .getByRole("button", { name: "Models", exact: false })
    .first();
  await launcher.click();
  const dialog = page.getByRole("dialog");
  const close = dialog.getByRole("button", { name: "Close models" });
  await expect(close).toBeFocused();
  await expect(
    dialog.getByRole("button", { name: "Save model settings" }),
  ).toBeVisible();
  await close.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", { name: "Save model settings" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(launcher).toBeFocused();
});

test("project selection survives refresh and tabs support arrow keys", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.getByLabel("Game idea").fill("A small puzzle game");
  await page.getByRole("button", { name: "Create project" }).click();
  await expect(page).toHaveURL(/project=/);
  await page.reload();
  await expect(page.getByLabel("Project request")).toHaveValue(
    "A small puzzle game",
  );
  if (testInfo.project.name === "mobile")
    await expect(page.getByLabel("Open project")).toBeVisible();
  const brief = page.getByRole("tab", { name: "Brief", exact: true });
  await brief.focus();
  await brief.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Build", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: "Studio", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
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
  await page.route("**/api/models/*/catalog", (r) =>
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
  await page.goto("/");
  await page
    .getByRole("button", { name: "Models", exact: false })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Add model" }).click();
  await dialog
    .getByRole("button", { name: "Save & fetch model catalog" })
    .click();
  await dialog.getByLabel("Search available models").fill("economy");
  await dialog
    .getByLabel("Select a model from the catalog")
    .selectOption("test/economy");
  await expect(dialog.getByLabel("Model ID", { exact: true })).toHaveValue(
    "test/economy",
  );
  await expect(dialog.getByLabel("Input USD")).toHaveValue("0.1");
  await expect(dialog.getByLabel("Output USD")).toHaveValue("0.4");
  await dialog.getByRole("button", { name: "Remove", exact: true }).click();
  await dialog.getByRole("button", { name: "Save model settings" }).click();
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
  await page.getByRole("button", { name: "Plan this game" }).click();
  await expect(page.getByRole("alert")).toContainText("Configure");
  await page.getByRole("tab", { name: "Studio", exact: true }).click();
  await expect(page.getByText("Awaiting connection")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Download Takko.rbxmx" }),
  ).toHaveAttribute("href", "/api/studio/plugin");
  await page.screenshot({
    path: `docs/results/forge-v2-studio-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
test("configures provider keys without reflecting secrets or persisting them in browser storage", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Models", exact: false })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const existing = dialog.getByRole("button", { name: "Remove", exact: true });
  while (await existing.count()) await existing.first().click();
  await dialog.getByRole("button", { name: "Add model" }).click();
  await dialog.getByLabel("Profile name").fill("My model");
  await dialog.getByLabel("Model ID", { exact: true }).fill("test/model");
  await dialog
    .getByLabel("API key", { exact: false })
    .fill("browser-test-secret");
  await dialog.getByLabel("Input USD").fill("0.1");
  await dialog.getByLabel("Output USD").fill("0.2");
  await dialog.getByRole("button", { name: "Save model settings" }).click();
  await expect(dialog).toBeHidden();
  const launcher = page
    .getByRole("button", { name: "Models", exact: false })
    .first();
  await expect(launcher).toBeFocused();
  await launcher.click();
  await expect(dialog.getByLabel("API key", { exact: false })).toHaveValue("");
  const settings = await (await page.request.get("/api/models")).text();
  expect(settings).not.toContain("browser-test-secret");
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    "browser-test-secret",
  );
  await existing.first().click();
  await dialog.getByRole("button", { name: "Save model settings" }).click();
});
test("keeps the models dialog open when saving fails", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Models", exact: false })
    .first()
    .click();
  await page.route("**/api/models", async (route) => {
    if (route.request().method() === "PUT")
      await route.fulfill({
        status: 400,
        json: { error: "Unable to save model settings" },
      });
    else await route.continue();
  });
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Save model settings" }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("status")).toContainText(
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
    path: `docs/results/forge-v2-welcome-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Models", exact: false })
    .first()
    .click();
  expect(
    (await new AxeBuilder({ page }).include("[role=dialog]").analyze())
      .violations,
  ).toEqual([]);
});
test("builds an approved non-combat project through a real HTTP provider adapter", async ({
  page,
}, testInfo) => {
  const transport = fakeTransport({ question: true });
  const server = createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    const response = await transport("http://fixture", {
      method: "POST",
      body,
    });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(await response.text());
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const model = {
    ...profile(),
    baseUrl:
      "http://127.0.0.1:" + (server.address() as { port: number }).port + "/v1",
  };
  try {
    await page.request.put("/api/models", {
      data: {
        profiles: [model],
        routes: {
          planner: [model.id],
          builder: [model.id],
          reviewer: [model.id],
          repair: [model.id],
        },
        budgetMicros: 2e6,
        repairLimit: 1,
      },
    });
    await page.goto("/");
    await page.getByLabel("Game idea").fill("Build a farming game");
    await page.getByRole("button", { name: "Create project" }).click();
    await page.getByRole("button", { name: "Plan this game" }).click();
    await expect(
      page.getByRole("button", { name: "Approve specification" }),
    ).toBeDisabled();
    await page.getByRole("button", { name: "Desktop", exact: true }).click();
    await page
      .getByRole("button", { name: "Save answers & update plan" })
      .click();
    await expect(
      page.getByRole("button", { name: "Approve specification" }),
    ).toBeEnabled();
    await expect(
      page.getByText("From your clarification", { exact: false }),
    ).toBeVisible();
    await page.screenshot({
      path: `docs/results/forge-v2-brief-${testInfo.project.name}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Approve specification" }).click();
    await page.getByRole("button", { name: "Generate game" }).click();
    await expect(
      page.getByText("ready to test", { exact: true }),
    ).toBeVisible();
    await page.getByRole("tab", { name: "Source", exact: true }).click();
    await expect(page.locator("code")).toContainText("Harvest");
    await expect(page.locator("code")).not.toContainText("CombatCore");
    await expect(
      page.getByRole("link", { name: "Download place" }),
    ).toBeVisible();
    const projectId = new URL(page.url()).searchParams.get("project");
    await page.route("**/api/projects/" + projectId, async (route) => {
      const response = await route.fetch();
      const project = await response.json();
      await route.fulfill({
        response,
        json: {
          ...project,
          stage: "failed",
          checks: [],
          error: "Builder stopped before final validation",
        },
      });
    });
    await page.reload();
    await page.getByRole("tab", { name: "Source", exact: true }).click();
    await expect(
      page.getByRole("link", { name: "Download place" }),
    ).toHaveCount(0);
  } finally {
    await page.request.put("/api/models", {
      data: {
        profiles: [],
        routes: { planner: [], builder: [], reviewer: [], repair: [] },
        budgetMicros: 2e6,
        repairLimit: 1,
      },
    });
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
  }
});
