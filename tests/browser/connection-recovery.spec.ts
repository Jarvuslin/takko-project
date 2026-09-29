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
  await expect.poll(() => f.calls.includes("asset-options")).toBe(true);
  f.project().answers = { changed: "New saved answer from another view" };
  f.project().request = "Updated saved combat brief with a dummy and animation";
  f.project().revision++;
  f.project().assetDiscovery = undefined;
  await expect(page.getByLabel("Project request")).toHaveValue(
    f.project().request,
  );
  await page
    .getByRole("button", { name: "Preview & choose assets", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Choose assets",
    exact: true,
  });
  await expect(dialog).not.toContainText("You have unsaved brief changes");
  await expect(dialog).toContainText("Studio connected");
  await expect(dialog).not.toContainText("after Studio connects");
  await expect(
    dialog.getByRole("button", { name: "Search again", exact: true }),
  ).toBeEnabled();
});

test("own query returns results while real local brief edits survive a server revision", async ({
  page,
}) => {
  const f = await assetChoiceFixture(page);
  await expect.poll(() => f.calls.includes("asset-options")).toBe(true);
  await page.getByText("Edit original brief", { exact: true }).click();
  const request = page.getByLabel("Project request");
  await request.fill("My unsaved local request");
  f.project().answers = { attack: "single punch" };
  f.project().revision++;
  f.project().assetDiscovery!.revision = f.project().revision;
  await expect(
    page.getByText(`Revision ${f.project().revision}`, { exact: true }),
  ).toBeVisible();
  await expect(request).toHaveValue("My unsaved local request");
  await page
    .getByRole("button", { name: "Preview & choose assets", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Choose assets",
    exact: true,
  });
  await expect(dialog).toContainText("You have unsaved brief changes");
  await dialog.getByLabel("Search for Practice dummy").fill("dummy");
  const response = page.waitForResponse(
    (r) =>
      r.url().endsWith("/asset-options") &&
      r.request().postDataJSON()?.query === "dummy",
  );
  await dialog
    .getByRole("button", { name: "Search again", exact: true })
    .click();
  expect((await response).ok()).toBe(true);
  await expect(dialog.locator(".asset-option")).toHaveCount(30);
  await expect(
    dialog.getByRole("heading", { name: "dummy", exact: true }),
  ).toBeVisible();
  await expect(dialog.locator("small.muted")).toHaveText("Practice dummy");
  expect(
    f.calls.filter((c) => ["concept", "plan", "build", "PATCH"].includes(c)),
  ).toEqual([]);
});
test("answer key order is clean and actual answer drafts survive incoming revisions", async ({
  page,
}) => {
  const f = await assetChoiceFixture(page);
  await expect.poll(() => f.calls.includes("asset-options")).toBe(true);
  f.project().answers = { attack: "punch", rig: "R6" };
  await page.evaluate(({ id, revision }) => {
    sessionStorage.setItem(
      "takko-answers-" + id,
      JSON.stringify({ revision, answers: { rig: "R6", attack: "punch" } }),
    );
  }, f.project());
  await page.reload();
  await page
    .getByRole("button", { name: "Preview & choose assets", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Choose assets", exact: true }),
  ).not.toContainText("You have unsaved brief changes");
  await page.keyboard.press("Escape");
  await page.evaluate(({ id, revision }) => {
    sessionStorage.setItem(
      "takko-answers-" + id,
      JSON.stringify({ revision, answers: { rig: "R6", attack: "kick" } }),
    );
  }, f.project());
  await page.reload();
  await page.getByText("Edit original brief", { exact: true }).click();
  f.project().revision++;
  f.project().assetDiscovery!.revision = f.project().revision;
  await expect(
    page.getByText(`Revision ${f.project().revision}`, { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Approve brief", exact: true })
    .click();
  await expect.poll(() => f.project().answers.attack).toBe("kick");
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
