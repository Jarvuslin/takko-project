import { test, expect } from "./workspace-fixture";

test("asset execution requires explicit Studio selection and shows unavailable connection honestly", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Game idea").fill("Asset execution UI regression");
  await page.getByRole("button", { name: "Create project" }).click();
  await page.getByRole("button", { name: "Build details", exact: true }).click();
  const assets = page.getByRole("region", { name: "Asset execution" });
  await page.route("**/api/asset-studios", (route) =>
    route.fulfill({
      json: {
        content: [{ type: "text", text: JSON.stringify({ studios: [] }) }],
      },
    }),
  );
  await assets.getByRole("button", { name: "Find Studio for assets" }).click();
  await expect(assets.getByRole("status")).toContainText(
    "No Studio is connected",
  );
  await expect(assets.getByLabel("Asset test place")).toHaveCount(0);
  await page.unroute("**/api/asset-studios");
  const id = "11111111-1111-4111-8111-111111111111";
  await page.route("**/api/asset-studios", (route) =>
    route.fulfill({
      json: { studios: [{ id, name: "Disposable asset test" }] },
    }),
  );
  await assets.getByRole("button", { name: "Find Studio for assets" }).click();
  const select = assets.getByLabel("Asset test place");
  await expect(select).toHaveValue("");
  await select.selectOption(id);
  await expect(assets.getByRole("status")).toHaveText(
    "Asset execution will use the selected Studio.",
  );
  await page.reload();
  await page.getByRole("button", { name: "Build details", exact: true }).click();
  await expect(
    assets.getByText("Studio selected for this project."),
  ).toBeVisible();
});
