import { expect, test } from "./workspace-fixture";
import AxeBuilder from "@axe-core/playwright";
import { profile } from "../generation-fixtures";
import { mockProviderConnections, connectFixture } from "./provider-fixture";
test.beforeEach(async ({ request, page }) => {
  await mockProviderConnections(page);
  const a = { ...profile(), name: "Everyday" },
    b = { ...profile(), name: "Fast builder" },
    c = { ...profile(), name: "Reviewer" };
  await request.put("/api/models", {
    data: {
      profiles: [a, b, c],
      routes: {
        planner: [a.id],
        builder: [b.id],
        reviewer: [c.id],
        repair: [b.id],
        componentReviewer: [c.id],
      },
      budgetMicros: 10e6,
      generationBudgetMicros: 2e6,
      repairLimit: 2,
    },
  });
  await page.route("**/api/model-catalog", (r) =>
    r.fulfill({
      json: [
        {
          id: "openai/example",
          name: "Example model",
          inputRate: 0.15,
          outputRate: 0.6,
        },
      ],
    }),
  );
});
test("preset keeps ordered backups, specialist roles and its own budget after reload", async ({
  page,
}) => {
  const before = await (await page.request.get("/api/models")).json();
  await page.goto("/#presets");
  await page
    .getByRole("button", { name: "Edit My first preset", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .locator(".preset-role")
    .filter({ has: page.getByLabel("builder primary") })
    .locator("summary")
    .click();
  await dialog
    .getByLabel("builder fallback 1")
    .selectOption(before.profiles[0].id);
  await dialog
    .getByLabel("builder fallback 2")
    .selectOption(before.profiles[2].id);
  await dialog.getByLabel("Per generation (USD)").fill(".8");
  await dialog.getByLabel("Per project (USD)").fill("5");
  await dialog.getByRole("button", { name: "Save preset" }).click();
  await expect(dialog).toBeHidden();
  const after = await (await page.request.get("/api/models")).json();
  expect(after.routes).toEqual({
    ...before.routes,
    builder: [
      before.profiles[1].id,
      before.profiles[0].id,
      before.profiles[2].id,
    ],
  });
  expect(after.generationBudgetMicros).toBe(800000);
  expect(after.budgetMicros).toBe(5e6);
  await page.reload();
  await expect(page.locator(".preset-card")).toContainText(
    "$0.80 / generation",
  );
});

test("Jev is optional non-coding work and cannot become the coding model", async ({
  page,
  request,
}) => {
  const settings = await (await request.get("/api/models")).json();
  const jev = {
    ...profile("openrouter"),
    name: "Jev decisions",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "typesafe/jev-1.13",
    inputRate: 0.042,
    outputRate: 0,
  };
  const saved = await request.put("/api/models", {
    data: {
      routes: settings.routes,
      presets: settings.presets,
      activePresetId: settings.activePresetId,
      budgetMicros: settings.budgetMicros,
      generationBudgetMicros: settings.generationBudgetMicros,
      repairLimit: settings.repairLimit,
      profiles: [...settings.profiles.map(({ hasKey, ...p }: any) => p), jev],
    },
  });
  expect(saved.ok(), await saved.text()).toBe(true);
  await page.goto("/#presets");
  await page
    .getByRole("button", { name: "Edit My first preset", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog
      .getByLabel("builder primary")
      .locator('option[value="' + jev.id + '"]'),
  ).toHaveCount(0);
  await dialog.getByText("Specialist overrides", { exact: true }).click();
  await dialog
    .getByLabel("Non-coding decisions", { exact: true })
    .selectOption(jev.id);
  await expect(
    dialog.getByText("Jev interprets the brief and assesses asset relevance.", {
      exact: false,
    }),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "Save preset", exact: true })
    .click();
  const after = await (await request.get("/api/models")).json();
  expect(after.routes.decisions).toEqual([jev.id]);
  expect(after.routes.builder).toEqual(settings.routes.builder);
  await page.reload();
  await page
    .getByRole("button", { name: "Edit My first preset", exact: true })
    .click();
  await dialog.getByText("Specialist overrides", { exact: true }).click();
  await expect(
    dialog.getByLabel("Non-coding decisions", { exact: true }),
  ).toHaveValue(jev.id);
});
test("creates a named preset and activates it without generation", async ({
  page,
}) => {
  const calls: string[] = [];
  page.on("request", (r) => {
    if (/\/api\/projects\/[^/]+\/(plan|build|repair)$/.test(r.url()))
      calls.push(r.url());
  });
  await page.goto("/#presets");
  await page.getByRole("button", { name: "Create preset" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Preset name").fill("Speed team");
  await dialog.getByRole("button", { name: "rocket icon" }).click();
  await dialog
    .getByLabel("Use one model for all")
    .selectOption({ label: "Fast builder" });
  await dialog.getByLabel("Per generation (USD)").fill(".5");
  await dialog.getByRole("button", { name: "Save preset" }).click();
  await expect(dialog).toBeHidden();
  expect(
    (await (await page.request.get("/api/models")).json())
      .generationBudgetMicros,
  ).toBe(2e6);
  const card = page.locator(".preset-card").filter({ hasText: "Speed team" });
  await card.getByRole("button", { name: "Use preset" }).click();
  await expect(card).toContainText("Active for future work");
  await page.reload();
  await expect(card).toContainText("🚀");
  expect(
    (await (await page.request.get("/api/models")).json())
      .generationBudgetMicros,
  ).toBe(500000);
  expect(calls).toEqual([]);
});
test("draft and one-off limit survive opening Models", async ({ page }) => {
  let release!: () => void;
  let requested!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const requestStarted = new Promise<void>((resolve) => {
    requested = resolve;
  });
  await page.route("**/api/models", async (route) => {
    const response = await route.fetch();
    requested();
    await gate;
    await route.fulfill({ response });
  });
  await page.goto("/");
  await page.getByLabel("Game idea").fill("An island with a cozy village");
  await page
    .getByRole("button", { name: "Budget for this generation" })
    .click();
  await requestStarted;
  await page.getByLabel("Generation limit (USD)").fill(".75");
  const loaded = page.waitForResponse("**/api/models");
  release();
  await loaded;
  await expect(page.getByLabel("Generation limit (USD)")).toHaveValue(".75");
  await page.getByRole("button", { name: "Use limit" }).click();
  await page
    .getByRole("navigation", { name: "Workspace" })
    .getByRole("button", { name: "Presets", exact: true })
    .click();
  await page.goBack();
  await expect(page.getByLabel("Game idea")).toHaveValue(
    "An island with a cozy village",
  );
  await expect(
    page.getByRole("button", { name: "Budget for this generation" }),
  ).toContainText("$0.75");
});
test("unsaved preset dismissal keeps saved values", async ({ page }) => {
  await page.goto("/#presets");
  await page
    .getByRole("button", { name: "Edit My first preset", exact: true })
    .click();
  await page.getByLabel("Preset name").fill("Unsaved");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Keep editing" }).click();
  await expect(page.getByLabel("Preset name")).toHaveValue("Unsaved");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Discard changes" }).click();
  await expect(page.locator(".preset-card")).not.toContainText("Unsaved");
});
test("provider catalog loads automatically and persists selected models", async ({
  page,
}) => {
  await page.goto("/#models");
  await connectFixture(page);
  await page
    .getByRole("button", { name: /Example model.*openai\/example/ })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("Model ID", { exact: true })).toHaveCount(0);
  await dialog
    .getByRole("button", { name: "Edit model details", exact: true })
    .click();
  await expect(dialog.getByLabel("Model ID", { exact: true })).toHaveValue(
    "openai/example",
  );
  await dialog.getByRole("button", { name: "Add to library" }).click();
  await expect(dialog).toBeHidden();
  await page.reload();
  await page.getByRole("searchbox", { name: "Search models" }).fill("Example");
  await expect(page.locator(".model-row")).toHaveCount(1);
  await expect(page.locator(".model-row img")).toHaveAttribute(
    "src",
    "/brands/openai.svg",
  );
  await expect
    .poll(() =>
      page
        .locator(".model-row img")
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0);
});
test("provider change clears catalog and matching credentials are reused", async ({
  page,
}) => {
  const settings = await (await page.request.get("/api/models")).json();
  await page.request.put("/api/models/" + settings.profiles[0].id + "/key", {
    data: { key: "fixture-only-key" },
  });
  await page.goto("/#models");
  await page.getByRole("button", { name: "Add model", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Anthropic", exact: true }).click();
  await expect(
    dialog.getByText(
      "Connect this provider to browse its models. Your key is shared by every model you add from this provider.",
    ),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: /Example model.*openai/ }),
  ).toHaveCount(0);
  await dialog
    .getByRole("button", { name: "Other / local", exact: true })
    .click();
  await dialog
    .getByLabel("Provider endpoint")
    .fill(settings.profiles[0].baseUrl);
  await expect(dialog.getByLabel("API key", { exact: true })).toHaveValue("");
  await expect(dialog.getByText(/A key is already available/)).toBeVisible();
});

test("strict concept opt-in is saved for Anthropic and cleared when switching models", async ({
  page,
}) => {
  await page.route("**/api/model-catalog", (route) =>
    route.fulfill({
      json: [
        {
          id: "anthropic/claude-haiku-4.5",
          name: "Haiku test",
          inputRate: 1,
          outputRate: 5,
        },
      ],
    }),
  );
  await page.goto("/#models");
  await connectFixture(page);
  await page
    .getByRole("button", { name: /Haiku test.*anthropic\/claude-haiku/ })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.locator("summary").filter({ hasText: "Advanced" }).click();
  await dialog
    .getByLabel("Check concept response structure", { exact: true })
    .check();
  await dialog.getByRole("button", { name: "Add to library" }).click();
  await expect(dialog).toBeHidden();
  let settings = await (await page.request.get("/api/models")).json();
  const saved = settings.profiles.find(
    (p: any) => p.model === "anthropic/claude-haiku-4.5",
  );
  expect(saved.structuredOutput).toBe("anthropic");
  await page.reload();
  await page
    .getByRole("searchbox", { name: "Search models" })
    .fill("Haiku test");
  await page
    .locator(".model-row")
    .getByRole("button", { name: /Edit/ })
    .click();
  await dialog
    .getByRole("button", { name: "Edit model details", exact: true })
    .click();
  await dialog.getByLabel("Model ID", { exact: true }).fill("openai/example");
  await dialog.getByRole("button", { name: "Save model", exact: true }).click();
  await expect(dialog).toBeHidden();
  settings = await (await page.request.get("/api/models")).json();
  expect(
    settings.profiles.find((p: any) => p.id === saved.id).structuredOutput,
  ).toBeUndefined();
});
test("Models and Presets pages and dialogs pass accessibility and keep actions visible", async ({
  page,
}, info) => {
  for (const route of ["models", "presets"]) {
    await page.goto("/#" + route);
    await expect(
      page.getByRole("heading", {
        name: route === "models" ? "Models" : "Presets",
        exact: true,
      }),
    ).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `docs/results/model-library-${route}-${info.project.name}.png`,
      fullPage: true,
    });
    await page
      .getByRole("button", {
        name: route === "models" ? "Add model" : "Create preset",
        exact: true,
      })
      .click();
    const dialog = page.getByRole("dialog");
    // Contrast must be sampled after the entrance fade, not at partial opacity.
    await dialog.evaluate(async (element) => {
      await Promise.all(
        element.getAnimations({ subtree: true }).map(animation => animation.finished),
      );
    });
    expect(
      (await new AxeBuilder({ page }).include("dialog").analyze()).violations,
    ).toEqual([]);
    const box = await dialog
      .getByRole("button", {
        name: route === "models" ? "Add to library" : "Save preset",
      })
      .boundingBox();
    expect(box!.y + box!.height).toBeLessThanOrEqual(
      page.viewportSize()!.height,
    );
    await page.screenshot({
      path: `docs/results/model-library-${route}-dialog-${info.project.name}.png`,
    });
    await page.keyboard.press("Escape");
  }
});
test("project-specific preset route survives refresh", async ({ page }) => {
  const p = await (
    await page.request.post("/api/projects", {
      data: { request: "A castle puzzle adventure" },
    })
  ).json();
  await page.goto("/?project=" + p.id + "#presets");
  await page.reload();
  await expect(page).toHaveURL(new RegExp(p.id + "#presets"));
  await expect(
    page
      .getByRole("navigation", { name: "Workspace" })
      .getByRole("button", { name: "Presets", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

test("Presets is a separate sidebar page directly below Models", async ({
  page,
}) => {
  await page.goto("/#models");
  const nav = page.getByRole("navigation", { name: "Workspace" });
  await expect(nav.getByRole("button")).toHaveText(["Models", "Presets"]);
  await expect(
    page.getByRole("tablist", { name: "Models workspace" }),
  ).toHaveCount(0);
  await page
    .getByRole("searchbox", { name: "Search models" })
    .fill("A model search");
  await nav.getByRole("button", { name: "Presets", exact: true }).click();
  await expect(page).toHaveURL(/#presets$/);
  await expect(
    page.getByRole("heading", { name: "Presets", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("searchbox", { name: "Search presets" }),
  ).toHaveValue("");
  await expect(
    nav.getByRole("button", { name: "Presets", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    nav.getByRole("button", { name: "Models", exact: true }),
  ).not.toHaveAttribute("aria-current", "page");
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Models", exact: true }),
  ).toBeVisible();
  await page.goto("/#routing");
  await expect(
    page.getByRole("heading", { name: "Presets", exact: true }),
  ).toBeVisible();
});

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: "ignoreErrors" });
});
