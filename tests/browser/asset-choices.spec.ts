import { test, expect } from "./workspace-fixture";
import AxeBuilder from "@axe-core/playwright";
import { assetChoiceFixture } from "./asset-choices-fixture";

test("asset relevance is labelled as advice and never selects a candidate", async ({
  page,
}) => {
  const f = await assetChoiceFixture(page);
  await expect
    .poll(() => f.project().assetDiscovery?.groups.length ?? 0)
    .toBeGreaterThan(0);
  const group = f.project().assetDiscovery!.groups[0];
  group.relevance = {
    candidateId: group.options[0].assetId,
    state: "metadata_only",
    at: new Date().toISOString(),
  };
  await page.reload();
  await page.getByRole("button", { name: "Preview & choose assets" }).click();
  const dialog = page.getByRole("dialog", { name: "Choose assets" });
  await expect(
    dialog.getByText("Suggested relevance · preview required"),
  ).toBeVisible();
  await expect(
    dialog.getByText(
      "Jev suggested a match from its listing. Contents and gameplay are still unverified.",
    ),
  ).toBeVisible();
  await expect(dialog.locator(".asset-option.selected")).toHaveCount(0);
});
import { specification } from "../generation-fixtures";

test("already planned briefs still discover assets and expose brief approval", async ({
  page,
}) => {
  const f = await assetChoiceFixture(page);
  await expect(page.getByText(/6 asset groups/)).toBeVisible();
  const p = f.project();
  p.spec = specification(p.request, p.scope);
  p.stage = "review";
  p.assetDiscovery = undefined;
  await page.reload();
  await expect(page.getByText(/6 asset groups/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Approve brief", exact: true }),
  ).toBeEnabled();
  await expect
    .poll(() => f.calls.filter((c) => c === "asset-options").length)
    .toBe(2);
});
test("brief searches automatically, previews geometry and clips, then approves without typing", async ({
  page,
}, info) => {
  const f = await assetChoiceFixture(page);
  await expect(
    page.getByText(
      "6 asset groups · preview a few options and choose what fits.",
    ),
  ).toBeVisible();
  expect(f.calls).toEqual(["asset-options"]);
  await page
    .getByRole("button", { name: "Approve brief", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Brief approved", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Preview & choose assets" }).click();
  const dialog = page.getByRole("dialog", { name: "Choose assets" });
  const dummy = dialog.getByRole("region", {
    name: "Practice dummy",
    exact: true,
  });
  await dummy
    .getByRole("button", { name: "Preview", exact: true })
    .first()
    .click();
  let preview = page.getByRole("dialog", {
    name: "Practice dummy option 1",
    exact: true,
  });
  await expect(preview.locator("canvas")).toBeVisible();
  await preview
    .getByRole("button", { name: "Choose this asset", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Fighting animation", exact: true })
    .click();
  const combat = dialog.getByRole("region", {
    name: "Fighting animation",
    exact: true,
  });
  await combat
    .getByRole("button", { name: "Preview", exact: true })
    .first()
    .click();
  preview = page.getByRole("dialog", {
    name: "Fighting animation option 1",
    exact: true,
  });
  await preview
    .getByLabel("Clip from Fighting animation option 1")
    .selectOption("Kick");
  expect(f.project().assetDiscovery?.choices?.combat).toBeUndefined();
  await expect(preview.locator("canvas")).toBeVisible();
  await preview.getByRole("slider", { name: /Position in/ }).fill("0.75");
  await preview
    .getByRole("button", { name: "Choose this asset", exact: true })
    .click();
  await page.screenshot({
    path: `test-artifacts/surgical-ux/options-${info.project.name}.png`,
  });
  for (const label of [
    "Sprint animation",
    "Walk animation",
    "Sound effects",
    "Visual effects",
  ]) {
    await dialog.getByRole("button", { name: label, exact: true }).click();
    await dialog
      .getByRole("region", { name: label, exact: true })
      .getByRole("radio", { name: "Find later", exact: true })
      .check();
  }
  expect(
    (await new AxeBuilder({ page }).include(".focused-dialog").analyze())
      .violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await page.reload();
  await page.getByRole("button", { name: "Preview & choose assets" }).click();
  await dialog
    .getByRole("button", { name: "Fighting animation ✓", exact: true })
    .click();
  await expect(
    dialog.getByRole("button", { name: "Selected ✓", exact: true }),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "Approve assets & create plan" })
    .click();
  await expect(
    page.getByText("Asset choices approved", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Approve specification", exact: true }),
  ).toBeVisible();
  expect(f.calls.filter((c) => c === "plan")).toHaveLength(1);
  expect(f.project().assetDiscovery?.choices?.combat.clipKey).toBe("Kick");
  expect(f.errors).toEqual([]);
});
test("dirty and changed briefs invalidate approval and search again", async ({
  page,
}) => {
  const f = await assetChoiceFixture(page);
  await expect(page.getByText(/6 asset groups/)).toBeVisible();
  await page
    .getByRole("button", { name: "Approve brief", exact: true })
    .click();
  await page.getByText("Edit original brief", { exact: true }).click();
  await page
    .getByLabel("Project request", { exact: true })
    .fill("A fishing game with a pond and fish models");
  await page
    .getByRole("button", { name: "Approve brief", exact: true })
    .click();
  await expect(page.getByText(/1 asset groups/)).toBeVisible();
  expect(f.calls.filter((c) => c === "asset-options")).toHaveLength(2);
  expect(f.project().revision).toBe(2);
  expect(f.project().assetDiscovery?.approved).toBeUndefined();
});
test("connection failures and empty results give an explicit recovery path", async ({
  page,
}) => {
  await assetChoiceFixture(page);
  await page.route("**/api/marketplace/studios", (r) =>
    r.fulfill({ json: { studios: [] } }),
  );
  await page.reload();
  await page.getByRole("button", { name: "Preview & choose assets" }).click();
  await expect(
    page.getByRole("dialog").getByText("Studio disconnected", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Find assets", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Connect Studio", exact: true }),
  ).toBeVisible();
});
