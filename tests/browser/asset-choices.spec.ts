import { test, expect } from "./workspace-fixture";
import AxeBuilder from "@axe-core/playwright";
import { assetChoiceFixture } from "./asset-choices-fixture";

test("legacy recommendations stay unselected until an explicit pick", async ({
  page,
}) => {
  const f = await assetChoiceFixture(page);
  await expect
    .poll(() => f.project().assetDiscovery?.groups.length ?? 0)
    .toBe(6);
  const g = f.project().assetDiscovery!.groups[0];
  g.relevance = {
    candidateId: g.options[0].assetId,
    state: "metadata_only",
    at: new Date().toISOString(),
  };
  await page.reload();
  const card = page.getByRole("region", {
    name: "Assets for this game",
    exact: true,
  });
  await expect(card).toContainText("0 of 6 ready");
  await expect(
    card.getByRole("button", { name: "Approve & build", exact: true }),
  ).toBeDisabled();
  expect(f.project().assetDiscovery?.choices?.[g.id]).toBeUndefined();
  expect(f.calls).not.toContain("asset-options");
});
test("asset card is accessible and empty browsing never approves the game", async ({
  page,
}) => {
  const f = await assetChoiceFixture(page);
  const card = page.getByRole("region", {
    name: "Assets for this game",
    exact: true,
  });
  await expect(card).toContainText("0 of 6 ready");
  expect(
    (await new AxeBuilder({ page }).include(".need-card").analyze()).violations,
  ).toEqual([]);
  await card
    .getByRole("button", { name: "Choose asset", exact: true })
    .first()
    .click();
  const picker = page.getByRole("complementary", {
    name: "Marketplace",
    exact: true,
  });
  await expect(picker.locator(".market-card")).toHaveCount(30);
  await page.keyboard.press("Escape");
  expect(f.project().assetDiscovery?.approved).not.toBe(true);
  expect(f.calls).not.toContain("plan");
});
test("dirty brief blocks building while manual search remains available", async ({
  page,
}) => {
  const f = await assetChoiceFixture(page);
  await expect(page.locator(".need-card")).toBeVisible();
  await page.getByText("Edit original brief", { exact: true }).click();
  await page
    .getByLabel("Project request", { exact: true })
    .fill("A fishing game with a pond and fish models");
  await expect(page.locator(".need-card")).toContainText(
    "Save your brief changes before building.",
  );
  await expect(
    page.getByRole("button", { name: "Approve & build", exact: true }),
  ).toBeDisabled();
  await page
    .locator(".need-card")
    .getByRole("button", { name: "Choose asset", exact: true })
    .first()
    .click();
  await expect(
    page.getByLabel("Search Marketplace", { exact: true }),
  ).toBeEditable();
  expect(f.calls).not.toContain("plan");
});
