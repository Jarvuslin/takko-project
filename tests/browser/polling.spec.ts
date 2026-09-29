import { expect, test } from "./workspace-fixture";

test("a slow project poll cannot overlap or restore a project after navigating home", async ({
  page,
}) => {
  const p = await (
    await page.request.post("/api/projects", {
      data: { request: "A polling fixture game" },
    })
  ).json();
  let count = 0;
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/status", (route) =>
    route.fulfill({ json: { studios: [] } }),
  );
  await page.route("**/api/projects/" + p.id, async (route) => {
    count++;
    if (count > 1) await held;
    await route.fulfill({ json: p });
  });
  await page.goto("/?project=" + p.id);
  await page.getByRole("button", { name: "Studio details", exact: true }).click();
  await expect.poll(() => count).toBe(2);
  await page.waitForTimeout(3200);
  expect(count).toBe(2);
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Takko home" }).click();
  await expect(page.getByLabel("Game idea")).toBeVisible();
  release();
  await page.waitForTimeout(500);
  await expect(page.getByLabel("Game idea")).toBeVisible();
});

test("slow polls do not overlap and a transient failure clears after recovery", async ({
  page,
}) => {
  let count = 0;
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/status", async (route) => {
    count++;
    if (count === 1) {
      await held;
      await route.fulfill({
        status: 503,
        json: { error: "Temporary poll failure" },
      });
    } else await route.fulfill({ json: { studios: [] } });
  });
  await page.goto("/");
  await expect.poll(() => count).toBe(1);
  // Hold longer than two old interval ticks. There must still be only one request.
  await page.waitForTimeout(3200);
  expect(count).toBe(1);
  release();
  await expect(page.getByRole("alert")).toHaveText(/Temporary poll failure/);
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("a successful poll does not clear an action error", async ({ page }) => {
  let count = 0;
  await page.route("**/api/status", (route) => {
    count++;
    return route.fulfill({ json: { studios: [] } });
  });
  await page.route("**/api/projects", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({ status: 500, json: { error: "Creation failed" } })
      : route.fulfill({ json: [] }),
  );
  await page.goto("/");
  await page.getByLabel("Game idea").fill("A test game with coins");
  await page.getByRole("button", { name: /Create project/i }).click();
  await expect(page.getByRole("alert")).toContainText("Creation failed");
  const previous = count;
  await expect.poll(() => count).toBeGreaterThan(previous);
  await expect(page.getByRole("alert")).toContainText("Creation failed");
});
