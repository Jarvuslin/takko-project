import { test, expect } from "./workspace-fixture";
import { specification } from "../generation-fixtures";

test("coordinator activity exposes saved and interrupted worker results without claiming gameplay verification", async ({
  page,
}, info) => {
  const p = await (
    await page.request.post("/api/projects", {
      data: { request: "A gliding game with energy and a readable HUD" },
    })
  ).json();
  expect(p.executionMode).toBe("coordinator");
  await page.route("**/api/projects/" + p.id, (route) =>
    route.fulfill({
      json: {
        ...p,
        stage: "interrupted",
        spec: specification(p.request, p.scope),
        coordination: {
          version: 1,
          revision: 1,
          inputHash: "fixture",
          status: "executing",
          areas: {},
          decisions: 2,
          repairs: 0,
          workers: [
            {
              id: "saved",
              kind: "build",
              objective: "Implement server-owned gliding energy",
              status: "completed",
              startedAt: new Date().toISOString(),
            },
            {
              id: "paused",
              kind: "review",
              objective: "Check energy recovery and HUD integration",
              status: "interrupted",
              error: "Review interrupted. Completed work is saved.",
              startedAt: new Date().toISOString(),
            },
          ],
        },
      },
    }),
  );
  await page.goto("/?project=" + p.id);
  const activity = page
    .locator("details")
    .filter({
      has: page.locator(":scope > summary", {
        hasText: "Coordinator activity",
      }),
    })
    .first();
  await activity.locator(":scope > summary").click();
  await expect(activity).toContainText("1 completed assignments");
  await expect(activity).toContainText("Gameplay still needs Studio testing.");
  await activity
    .getByText("Check energy recovery and HUD integration", { exact: true })
    .click();
  await expect(activity).toContainText(
    "Review interrupted. Completed work is saved.",
  );
  const explanation = activity.getByText(
    "Review interrupted. Completed work is saved.",
    { exact: true },
  );
  await explanation.scrollIntoViewIfNeeded();
  await expect(explanation).toBeInViewport();
  expect(
    await activity.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
  ).toBe(true);
  await page.screenshot({
    path: `docs/results/coordinator-workers/activity-${info.project.name}.png`,
  });
});
