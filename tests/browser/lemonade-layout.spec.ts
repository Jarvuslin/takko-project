import { test, expect } from "./workspace-fixture";
import AxeBuilder from "@axe-core/playwright";
import { profile, specification } from "../generation-fixtures";

test("research routing preference survives save and reopen", async ({
  page,
}) => {
  const before = await (await page.request.get("/api/models")).json();
  await page.goto("/#routing");
  await page
    .getByRole("button", { name: "Edit My first preset", exact: true })
    .first()
    .click();
  const toggle = page.getByRole("checkbox", {
    name: "Research before planning",
  });
  await toggle.check();
  await page.getByRole("button", { name: "Save preset", exact: true }).click();
  await page
    .getByRole("button", { name: "Edit My first preset", exact: true })
    .first()
    .click();
  await expect(page.getByLabel("research primary")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.reload();
  await page
    .getByRole("button", { name: "Edit My first preset", exact: true })
    .first()
    .click();
  await expect(toggle).toBeChecked();
  await page.request.put("/api/models", {
    data: {
      ...before,
      profiles: before.profiles.map(({ hasKey, ...p }: any) => p),
    },
  });
});

test("shows reference research, uncertainty and source links in the brief", async ({
  page,
}) => {
  const p = await (
    await page.request.post("/api/projects", {
      data: { request: "A Steal a Brainrot style game" },
    })
  ).json();
  const fixture = {
    ...p,
    spec: specification(p.request, p.scope),
    research: {
      referenceGame: "Steal a Brainrot",
      summary: "Acquire and steal income-producing characters.",
      retrievedAt: p.createdAt,
      mechanics: [
        {
          id: "steal",
          importance: "core",
          description: "Carry a rival's character back to your base",
          sourceUrls: [
            "https://www.roblox.com/games/109983668079237/Steal-a-Brainrot",
          ],
        },
      ],
      unknowns: ["Exact lock timing is unverified"],
      sources: [
        {
          url: "https://www.roblox.com/games/109983668079237/Steal-a-Brainrot",
          title: "Original Roblox experience",
          excerpt: "",
        },
      ],
    },
  };
  await page.route("**/api/projects/" + p.id, (route) =>
    route.fulfill({ json: fixture }),
  );
  await page.goto("/?project=" + p.id);
  await expect(
    page.getByText("Game research · Steal a Brainrot", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Exact lock timing is unverified")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Original Roblox experience" }),
  ).toHaveAttribute("href", fixture.research.sources[0].url);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("shows a concise generation failure with expandable diagnostics", async ({
  page,
}) => {
  const p = await (
    await page.request.post("/api/projects", {
      data: { request: "Build a cookie scene" },
    })
  ).json();
  const fixture = {
    ...p,
    spec: specification(p.request, p.scope),
    stage: "failed",
    error: "Could not complete Cookie scene. Unsupported class CookieShape.",
    failure: {
      code: "GENERATION_OUTPUT_REJECTED",
      phase: "builder",
      taskId: "coreTask",
      attempts: 2,
      details:
        "Scene node Workspace/Forge_Test/Cookie uses unsupported class CookieShape.",
      at: p.createdAt,
    },
  };
  await page.route("**/api/projects/" + p.id, (route) =>
    route.fulfill({ json: fixture }),
  );
  await page.goto("/?project=" + p.id);
  const alert = page.getByRole("alert");
  await expect(alert).toContainText("Could not complete Cookie scene");
  await alert.getByText("Generation diagnostics", { exact: true }).click();
  await expect(alert.locator("pre")).toBeVisible();
  await expect(alert.locator("pre")).toContainText("CookieShape");
});

test("minimal prompt and saved preset preserve real role preferences", async ({
  page,
}, testInfo) => {
  const economy = {
    ...profile(),
    name: "Economy model",
    model: "fixture/economy",
    outputRate: 0.4,
  };
  const large = {
    ...profile(),
    name: "Large model",
    model: "fixture/large",
    outputRate: 8,
  };
  const settings = {
    profiles: [economy, large],
    routes: {
      research: [large.id],
      planner: [large.id],
      builder: [large.id],
      reviewer: [large.id],
      repair: [large.id],
    },
    budgetMicros: 250000,
    repairLimit: 1,
  };
  await page.request.put("/api/models", { data: settings });
  try {
    await page.goto("/");
    await page
      .getByLabel("Game idea")
      .fill("Build a shop UI with item previews");
    await expect(page.getByLabel("Game idea")).toBeFocused();
    await page
      .getByRole("button", { name: "Presets", exact: true })
      .last()
      .click();
    await page
      .getByRole("button", { name: "Edit My first preset", exact: true })
      .click();
    await page.getByLabel("builder primary").selectOption(economy.id);
    await page
      .getByRole("button", { name: "Save preset", exact: true })
      .click();
    const saved = await (await page.request.get("/api/models")).json();
    expect(saved.routes).toEqual({ ...settings.routes, builder: [economy.id] });
    expect(saved.budgetMicros).toBe(250000);
    await page.goBack();
    await expect(page.getByLabel("Game idea")).toHaveValue(
      "Build a shop UI with item previews",
    );
    await page.screenshot({
      path: `test-artifacts/forge-minimal-dashboard-${testInfo.project.name}.png`,
      fullPage: true,
    });
  } finally {
    await page.request.put("/api/models", {
      data: {
        ...settings,
        profiles: [],
        routes: { planner: [], builder: [], reviewer: [], repair: [] },
      },
    });
  }
});

test("minimal task list, source, history and follow-up use the current project", async ({
  page,
}, testInfo) => {
  const created = await (
    await page.request.post("/api/projects", {
      data: { request: "A farming game with a harvest shop" },
    })
  ).json();
  const spec = specification(created.request, created.scope);
  spec.tasks.push({
    id: "shop",
    title: "Harvest shop",
    requirements: ["core"],
    dependsOn: ["coreTask"],
    files: [],
  });
  const fixture = {
    ...created,
    spec,
    completedBuildTasks: ["coreTask"],
    events: [{ at: created.createdAt, message: "Fixture plan recorded" }],
  };
  await page.route("**/api/projects/" + created.id, (route) =>
    route.request().method() === "GET"
      ? route.fulfill({ json: fixture })
      : route.continue(),
  );
  await page.goto("/?project=" + created.id);
  await expect(page.getByLabel("Mechanics map")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Explore", exact: true }),
  ).toHaveCount(0);
  await page.locator(".compact-plan > summary").click();
  const plan = page.locator(".plan-aside");
  await expect(plan).toContainText("Harvest shop");
  await plan.locator("li summary").filter({ hasText: "Harvest shop" }).click();
  await expect(plan).toContainText("After: Implement core loop");
  await expect(
    plan.locator("li").filter({ hasText: "Implement core loop" }).first(),
  ).toContainText("Complete");
  await expect(
    plan.locator("li").filter({ hasText: "Harvest shop" }),
  ).toContainText("Planned");
  await plan
    .locator("li summary")
    .filter({ hasText: "Implement core loop" })
    .click();
  await plan
    .getByRole("button", { name: /ServerScriptService.*Game.server.luau/ })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Source details" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Conversation history" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByLabel("Message", { exact: true }).focus();
  await page
    .getByLabel("Message", { exact: true })
    .fill("Add a shop with item previews");
  await expect(page.getByLabel("Message", { exact: true })).toBeFocused();
  // The inspection and unsent message interactions must not mutate the saved project.
  const unchanged = await (
    await page.request.get("/api/projects/" + created.id)
  ).json();
  expect(unchanged.revision).toBe(created.revision);
  expect(unchanged.request).toBe(created.request);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-artifacts/forge-minimal-workspace-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("sending a follow-up preserves the original request and updates the plan once", async ({
  page,
}) => {
  const created = await (
    await page.request.post("/api/projects", {
      data: { request: "A cooperative farming game" },
    })
  ).json();
  let plans = 0;
  await page.route("**/api/projects/" + created.id + "/plan", async (route) => {
    plans++;
    const saved = await (
      await page.request.get("/api/projects/" + created.id)
    ).json();
    expect(route.request().postDataJSON().revision).toBe(saved.revision);
    await route.fulfill({
      json: { ...saved, spec: specification(saved.request, saved.scope) },
    });
  });
  await page.goto("/?project=" + created.id);
  await page
    .getByLabel("Message", { exact: true })
    .fill("Add a crop selling shop");
  await page
    .getByRole("button", { name: "Send message and update plan" })
    .click();
  await expect(page.getByLabel("Project request")).toHaveValue(
    "A cooperative farming game",
  );
  await expect(page.getByLabel("Message", { exact: true })).toBeEmpty();
  expect(plans).toBe(1);
  await page.reload();
  await expect(page.getByLabel("Saved conversation")).toContainText(
    "Add a crop selling shop",
  );
});
