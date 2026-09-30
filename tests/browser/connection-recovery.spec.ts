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
  await expect(
    dialog.getByLabel("Search Marketplace", { exact: true }),
  ).toBeEditable();
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

test("server answer changes under an open tab do not block asset search", async ({
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
  await expect.poll(() => f.calls.includes("asset-picks")).toBe(true);
  f.project().answers = { changed: "New saved answer from another view" };
  f.project().request = "Updated saved combat brief with a dummy and animation";
  f.project().revision++;
  f.project().assetDiscovery = undefined;
  await expect(page.getByLabel("Message", { exact: true })).toBeEditable();
  await page
    .getByRole("button", { name: "Choose asset", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("complementary", {
    name: "Marketplace",
    exact: true,
  });
  await expect(dialog).not.toContainText("You have unsaved brief changes");
  await expect(
    dialog.getByLabel("Search Marketplace", { exact: true }),
  ).toBeEditable();
  await expect(dialog).not.toContainText("after Studio connects");
  await expect(
    dialog.getByRole("button", { name: "Search assets", exact: true }),
  ).toBeEnabled();
});

test("own query returns results while a composer message survives a server revision", async ({
  page,
}) => {
  const f = await assetChoiceFixture(page);
  await expect.poll(() => f.calls.includes("asset-picks")).toBe(true);
  const request = page.getByLabel("Message", { exact: true });
  await request.fill("My unsaved local request");
  f.project().answers = { attack: "single punch" };
  f.project().revision++;
  f.project().assetDiscovery!.revision = f.project().revision;
  f.project().proposal!.revision = f.project().revision;
  await expect(
    page.getByText(`Saved proposal · revision ${f.project().revision}`, { exact: true }),
  ).toBeVisible();
  await expect(request).toHaveValue("My unsaved local request");
  await page
    .getByRole("button", { name: "Choose asset", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("complementary", {
    name: "Marketplace",
    exact: true,
  });
  await expect(page.locator(".need-card")).not.toContainText("Save your brief");
  await dialog.getByLabel("Search Marketplace").fill("dummy");
  const response = page.waitForResponse(
    (r) =>
      r.url().endsWith("/asset-picks/search") &&
      r.request().postDataJSON()?.query === "dummy",
  );
  await dialog
    .getByRole("button", { name: "Search assets", exact: true })
    .click();
  expect((await response).ok()).toBe(true);
  await expect(dialog.locator(".market-card")).toHaveCount(30);
  await expect(
    dialog.getByLabel("Search Marketplace", { exact: true }),
  ).toHaveValue("dummy");
  expect(
    f.calls.filter((c) => ["concept", "plan", "build", "PATCH"].includes(c)),
  ).toEqual([]);
});
test("legacy answer drafts do not restore hidden brief approval gates", async ({
  page,
}) => {
  const f = await assetChoiceFixture(page);
  await expect.poll(() => f.calls.includes("asset-picks")).toBe(true);
  f.project().answers = { attack: "punch", rig: "R6" };
  await page.evaluate(({ id, revision }) => {
    sessionStorage.setItem(
      "takko-answers-" + id,
      JSON.stringify({ revision, answers: { rig: "R6", attack: "punch" } }),
    );
  }, f.project());
  await page.reload();
  await page
    .getByRole("button", { name: "Choose asset", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("complementary", { name: "Marketplace", exact: true }),
  ).not.toContainText("You have unsaved brief changes");
  await page.keyboard.press("Escape");
  await page.evaluate(({ id, revision }) => {
    sessionStorage.setItem(
      "takko-answers-" + id,
      JSON.stringify({ revision, answers: { rig: "R6", attack: "kick" } }),
    );
  }, f.project());
  await page.reload();
  f.project().revision++;
  f.project().assetDiscovery!.revision = f.project().revision;
  f.project().proposal!.revision = f.project().revision;
  await expect(
    page.getByText(`Saved proposal · revision ${f.project().revision}`, { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Message", { exact: true })).toBeEditable();
  expect(f.calls).not.toContain("approve-brief");
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
