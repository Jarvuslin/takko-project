import fs from "node:fs";
import { test, expect } from "./workspace-fixture";
import { assetChoiceFixture } from "./asset-choices-fixture";
import { retainAssetGaps } from "../../src/generation/asset-gaps";

test("raw animation publishing limitation is visible in the clip sheet and persisted coverage", async ({
  page,
}) => {
  const f = await assetChoiceFixture(page);
  await expect
    .poll(() => f.project().assetDiscovery?.groups.length ?? 0)
    .toBeGreaterThan(0);
  const group = f
      .project()
      .assetDiscovery!.groups.find((g) => g.preview === "animation")!,
    option = group.options[0];
  option.previewData = {
    pack: JSON.parse(
      fs.readFileSync(
        "tests/fixtures/regression/asset-evidence-selection/captured-pack-12061946559.json",
        "utf8",
      ),
    ),
  };
  f.project().assetDiscovery!.choices = {
    [group.id]: { assetId: option.assetId },
  };
  await page.reload();
  await page
    .getByRole("region", { name: group.label, exact: true })
    .getByRole("button", { name: "Choose clip", exact: true })
    .click();
  const sheet = page.getByRole("dialog", { name: `Clips from ${option.name}` });
  await expect(
    sheet.getByRole("status").filter({ hasText: "Publishing remains blocked" }),
  ).toBeVisible();
  await expect(
    sheet.getByRole("button", { name: "Use this clip", exact: true }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  const p = JSON.parse(
    fs.readFileSync(
      "tests/fixtures/regression/animation-selection/terminal-project.json",
      "utf8",
    ),
  );
  f.project().artifact = retainAssetGaps(p, {
    files: [],
    scene: [],
    assets: [],
    coverage: [],
  });
  f.project().spec = p.spec;
  f.project().stage = "ready_to_test";
  await page.reload();
  await expect(
    page.getByRole("status", { name: "Unmet requirements" }),
  ).toContainText("Publishing remains blocked");
});
test("chosen model bounds remain labelled and release the renderer when collapsed", async ({
  page,
}) => {
  const f = await assetChoiceFixture(page);
  await expect
    .poll(() => f.project().assetDiscovery?.groups.length ?? 0)
    .toBeGreaterThan(0);
  const group = f.project().assetDiscovery!.groups[0],
    option = group.options[0];
  option.previewData = {
    model: JSON.parse(
      fs.readFileSync(
        "tests/fixtures/regression/asset-evidence-selection/sword-model-preview.json",
        "utf8",
      ),
    ),
  };
  f.project().assetDiscovery!.choices = {
    [group.id]: { assetId: option.assetId },
  };
  await page.reload();
  const row = page.getByRole("region", { name: group.label, exact: true });
  await row.getByText("View captured geometry", { exact: true }).click();
  await expect(row.locator("canvas")).toBeVisible();
  await expect
    .poll(async () =>
      Number(await row.locator("canvas").getAttribute("data-triangles")),
    )
    .toBeGreaterThan(0);
  await expect(row).toContainText("Amber wireframe boxes");
  await expect(row).toContainText(
    "Organic meshes such as trees and characters appear as boxes",
  );
  await row.getByText("View captured geometry", { exact: true }).click();
  await expect(row.locator("canvas")).toHaveCount(0);
  expect(f.errors).toEqual([]);
});
