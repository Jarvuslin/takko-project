import { test, expect } from "./workspace-fixture";
import { aligned, connectionRecoveryFlow } from "./connection-recovery-flows";
import { assetChoiceFixture } from "./asset-choices-fixture";

test("connection refresh shows progress, retries failed discovery, clears stale Studio and aligns controls", async ({
  page,
}, info) => {
  await connectionRecoveryFlow(
    page,
    "",
    `test-artifacts/connection-recovery/chooser-${info.project.name}.png`,
  );
});

test("Marketplace uses the same connection status and aligned search controls", async ({
  page,
}) => {
  await page.route("**/api/marketplace/studios", (r) =>
    r.fulfill({
      json: {
        studios: [
          { id: "392fce6b-fea7-4de3-bb2e-49a95231c3f5", name: "Training yard" },
        ],
      },
    }),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Browse Marketplace assets", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Marketplace", exact: true });
  await expect(dialog).toContainText("Studio connected");
  await aligned(
    dialog.getByLabel("Marketplace Studio"),
    dialog.getByRole("button", { name: "Refresh connection", exact: true }),
  );
  await aligned(
    dialog.getByLabel("Asset type"),
    dialog.getByRole("button", { name: "Search assets", exact: true }),
  );
  await expect
    .poll(async () => {
      const select = (await dialog.getByLabel("Asset type").boundingBox())!;
      const button = (await dialog
        .getByRole("button", { name: "Search assets", exact: true })
        .boundingBox())!;
      return Math.abs(select.y - button.y);
    })
    .toBeLessThanOrEqual(1);
});

test("a connected Studio with unsaved answers explains the search blocker", async ({
  page,
}) => {
  await page.route("**/api/status", (r) =>
    r.fulfill({
      json: {
        concepts: true,
        assetChoices: true,
        studioConnectionGate: false,
        studios: [],
      },
    }),
  );
  const f = await assetChoiceFixture(page);
  await expect.poll(() => f.calls.includes("asset-options")).toBe(true);
  f.project().answers = { changed: "New saved answer from another view" };
  f.project().assetDiscovery = undefined;
  await page
    .getByRole("button", { name: "Preview & choose assets", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Choose assets",
    exact: true,
  });
  await expect(dialog).toContainText("You have unsaved brief changes");
  await expect(dialog).toContainText("Studio connected");
  await expect(dialog).not.toContainText("after Studio connects");
  await expect(
    dialog.getByRole("button", { name: "Find assets", exact: true }),
  ).toBeDisabled();
});
test("truncation recovery opens Models without dispatching another generation", async ({
  page,
}) => {
  await page.route("**/api/status", (r) =>
    r.fulfill({
      json: {
        concepts: true,
        assetChoices: true,
        studioConnectionGate: false,
        studios: [],
      },
    }),
  );
  const f = await assetChoiceFixture(page);
  f.project().error =
    "Output truncated: raise the model output limit or reduce task size";
  f.project().stage = "failed";
  await page.reload();
  await expect(
    page.getByText("The model ran out of reply space", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Open model settings", exact: true })
    .click();
  await expect(page).toHaveURL(/#models$/);
  expect(
    f.calls.filter((c) => ["plan", "concept", "build"].includes(c)),
  ).toEqual([]);
});
