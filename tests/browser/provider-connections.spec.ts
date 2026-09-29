import { test, expect } from "./workspace-fixture";
import { mockProviderConnections, connectFixture } from "./provider-fixture";
test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: "ignoreErrors" });
});
test("catalog stays locked for rejected keys, then two models reuse one validated provider", async ({
  page,
}, info) => {
  await mockProviderConnections(page);
  await page.request.put("/api/models", {
    data: {
      profiles: [],
      routes: { planner: [], builder: [], reviewer: [], repair: [] },
      budgetMicros: 2000000,
      repairLimit: 1,
    },
  });
  let catalogCalls = 0,
    validations = 0;
  page.on("request", (r) => {
    if (r.url().endsWith("/api/provider-connections")) validations++;
  });
  await page.route("**/api/model-catalog", (route) => {
    catalogCalls++;
    return route.fulfill({
      json: [
        {
          id: "openai/alpha",
          name: "Alpha",
          inputRate: 0.1,
          outputRate: 0.4,
          contextLength: 128000,
        },
        {
          id: "anthropic/beta",
          name: "Beta",
          inputRate: 1,
          outputRate: 5,
          contextLength: 200000,
        },
      ],
    });
  });
  await page.goto("/#models");
  const explorer = page.getByRole("region", {
    name: "Explore providers",
    exact: true,
  });
  await expect(
    explorer.getByRole("button", { name: "Validate & connect" }),
  ).toBeDisabled();
  expect(catalogCalls).toBe(0);
  await explorer
    .getByLabel("API key", { exact: true })
    .fill("rejected-fixture");
  await explorer.getByRole("button", { name: "Validate & connect" }).click();
  await expect(explorer.getByRole("alert")).toContainText("rejected");
  expect(catalogCalls).toBe(0);
  await connectFixture(page);
  await expect(explorer.locator(".catalog-cost").first()).toBeVisible();
  for (const name of ["Alpha", "Beta"]) {
    await explorer
      .getByRole("button", { name: new RegExp(name + ".*Add") })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel("API key", { exact: true })).toHaveCount(0);
    await dialog.getByRole("button", { name: "Add to library" }).click();
    await expect(dialog).toBeHidden();
  }
  await page.reload();
  await expect(page.locator(".model-row")).toHaveCount(2);
  expect(validations).toBe(2);
  await page
    .getByRole("button", { name: "Test connection for Alpha", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "No generation was run" }),
  ).toBeVisible();
  expect(validations).toBe(3);
  expect(
    await page.evaluate(
      () => JSON.stringify(localStorage) + JSON.stringify(sessionStorage),
    ),
  ).not.toContain("browser-test-secret");
  await explorer
    .getByRole("button", { name: "Anthropic", exact: true })
    .click();
  await expect(
    explorer.getByRole("button", { name: "Validate & connect" }),
  ).toBeDisabled();
  await expect(
    explorer.getByRole("searchbox", { name: "Search provider models" }),
  ).toHaveCount(0);
  await explorer
    .getByRole("button", { name: "OpenRouter", exact: true })
    .click();
  await expect(
    explorer.getByRole("searchbox", { name: "Search provider models" }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-artifacts/provider-models/library-${info.project.name}.png`,
    fullPage: true,
  });
});
