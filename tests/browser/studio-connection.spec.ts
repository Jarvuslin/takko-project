import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { newProject } from "../../src/generation/store";

test("disconnected projects show setup, offline hides architecture, reconnect opens it", async ({
  page,
}, info) => {
  const p = newProject("Combat practice with a target dummy", 1000000);
  let connected = false;
  await page.route("**/api/projects", (r) =>
    r.fulfill({ json: [{ id: p.id, name: p.name, stage: p.stage }] }),
  );
  await page.route(`**/api/projects/${p.id}`, (r) => r.fulfill({ json: p }));
  await page.route("**/api/status", (r) =>
    r.fulfill({
      json: {
        studios: [],
        studioConnectionGate: true,
        concepts: true,
        assetChoices: true,
      },
    }),
  );
  await page.route("**/api/marketplace/studios", (r) =>
    r.fulfill(
      connected
        ? {
            json: {
              studios: [{ id: crypto.randomUUID(), name: "Test place" }],
            },
          }
        : {
            status: 502,
            json: {
              error:
                "Roblox’s Studio connector was not found. Enable Studio as an MCP server.",
            },
          },
    ),
  );
  await page.route("**/api/projects/*/asset-options", (r) =>
    r.fulfill({
      status: 502,
      json: { error: "Offline fixture does not search live assets" },
    }),
  );
  await page.goto("/?project=" + p.id);
  await expect(
    page.getByRole("heading", { name: "Connect your creative space" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Game architecture" }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Roblox’s Studio connector was not found.", {
      exact: false,
    }),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: `test-artifacts/asset-choices/connection-${info.project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Continue offline", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Project conversation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Game architecture" }),
  ).toHaveCount(0);
  if (info.project.name === "desktop") {
    await page.locator("summary[aria-label='Projects']").click();
    await page
      .getByRole("navigation", { name: "Projects", exact: true })
      .getByRole("button", { name: p.name, exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Connect your creative space" }),
    ).toBeVisible();
  }
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Connect your creative space" }),
  ).toBeVisible();
  connected = true;
  await page
    .locator(".studio-welcome")
    .getByRole("button", { name: "Connect to Studio", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Game architecture" }),
  ).toBeVisible();
});

test("a created project checks Studio before showing its architecture", async ({
  page,
}) => {
  await page.route("**/api/status", (r) =>
    r.fulfill({ json: { studios: [], studioConnectionGate: true } }),
  );
  await page.route("**/api/marketplace/studios", (r) =>
    r.fulfill({ json: { studios: [] } }),
  );
  await page.goto("/");
  await page
    .getByPlaceholder("Describe your game. Start with the fun part.")
    .fill("A quiet forest game");
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Connect your creative space" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Game architecture" }),
  ).toHaveCount(0);
});
