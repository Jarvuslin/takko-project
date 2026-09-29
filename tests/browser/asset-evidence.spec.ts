import fs from "node:fs";
import { test, expect } from "./workspace-fixture";
import { assetChoiceFixture } from "./asset-choices-fixture";
import { retainAssetGaps } from "../../src/generation/asset-gaps";

test("raw animation publishing limitation is visible in the picker and persisted build coverage", async ({
  page,
}) => {
  const f = await assetChoiceFixture(page);
  await expect
    .poll(() => f.project().assetDiscovery?.groups.length ?? 0)
    .toBeGreaterThan(0);
  const group = f
    .project()
    .assetDiscovery!.groups.find((g) => g.preview === "animation")!;
  const option = group.options[0];
  const captured = JSON.parse(
    fs.readFileSync(
      "docs/results/asset-evidence-selection-20260926/captured-pack-12061946559.json",
      "utf8",
    ),
  );
  option.previewData = { pack: captured };
  await page.reload();
  await page.getByRole("button", { name: "Preview & choose assets" }).click();
  const picker = page.getByRole("dialog", { name: "Choose assets" });
  await picker
    .getByRole("button", { name: "Fighting animation", exact: true })
    .click();
  await picker
    .getByRole("region", { name: "Fighting animation", exact: true })
    .getByRole("button", { name: "Preview", exact: true })
    .first()
    .click();
  const preview = page.getByRole("dialog", { name: option.name, exact: true });
  await expect(
    preview
      .getByRole("status")
      .filter({ hasText: "Publishing remains blocked" }),
  ).toBeVisible();
  await expect(
    preview.getByRole("button", { name: "Choose this asset", exact: true }),
  ).toBeEnabled();
  await preview
    .getByRole("button", { name: "Choose this asset", exact: true })
    .click();

  // The actual gap producer consumes the preserved approved project, not a fabricated banner detail.
  const p = JSON.parse(
    fs.readFileSync(
      "docs/results/opencode-step3-live-20260925/terminal-project.json",
      "utf8",
    ),
  );
  const artifact = retainAssetGaps(p, {
    files: [],
    scene: [],
    assets: [],
    coverage: [],
  });
  f.project().artifact = artifact;
  f.project().spec = p.spec;
  f.project().stage = "ready_to_test";
  await page.reload();
  await expect(
    page.getByRole("status", { name: "Unmet requirements" }),
  ).toContainText("Studio testing is available");
  await expect(
    page.getByRole("status", { name: "Unmet requirements" }),
  ).toContainText("Publishing remains blocked");
});

test("captured mesh bounds are visibly labelled and distinct from exact geometry", async ({
  page,
}) => {
  const f = await assetChoiceFixture(page);
  await expect
    .poll(() => f.project().assetDiscovery?.groups.length ?? 0)
    .toBeGreaterThan(0);
  const group = f.project().assetDiscovery!.groups[0];
  const option = group.options[0];
  option.previewData = {
    model: JSON.parse(
      fs.readFileSync(
        "docs/results/asset-evidence-selection-20260926/sword-model-preview.json",
        "utf8",
      ),
    ),
  };
  await page.reload();
  await page.getByRole("button", { name: "Preview & choose assets" }).click();
  await page
    .getByRole("region", { name: "Practice dummy", exact: true })
    .getByRole("button", { name: "Preview", exact: true })
    .first()
    .click();
  const preview = page.getByRole("dialog", { name: option.name, exact: true });
  await expect(preview.locator("canvas")).toBeVisible();
  await expect
    .poll(async () =>
      Number(await preview.locator("canvas").getAttribute("data-triangles")),
    )
    .toBeGreaterThan(0);
  await expect
    .poll(() =>
      preview.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
        const copy = document.createElement("canvas");
        copy.width = canvas.width;
        copy.height = canvas.height;
        const context = copy.getContext("2d")!;
        context.drawImage(canvas, 0, 0);
        const pixels = context.getImageData(0, 0, copy.width, copy.height).data;
        let amber = 0;
        for (let i = 0; i < pixels.length; i += 4)
          if (
            pixels[i] > pixels[i + 1] * 1.15 &&
            pixels[i + 1] > pixels[i + 2] * 1.2 &&
            pixels[i + 1] > 35
          )
            amber++;
        return amber;
      }),
    )
    .toBeGreaterThan(20);
  await expect(preview).toContainText("Amber wireframe boxes");
  await expect(preview).toContainText(
    "Organic meshes such as trees and characters appear as boxes",
  );
  expect(f.errors).toEqual([]);
  await page.screenshot({
    path: `test-artifacts/asset-evidence-selection-20260926/model-${test.info().project.name}.png`,
  });
});
