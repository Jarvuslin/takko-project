import { test, expect } from "./workspace-fixture";

for (const path of ["/", "/design-lab", "/design-lab/"]) {
  test(`opens the real app at ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByLabel("Game idea")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create project", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".design-lab")).toHaveCount(0);
  });
}
