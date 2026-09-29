import { expect, test } from "./workspace-fixture";
import { randomUUID } from "node:crypto";

test("dropped animation pack opens all entries, switches real WebGL clips and survives reload", async ({
  page,
}) => {
  const response = await page.request.post("/api/projects", {
    data: { request: "Animation pack preview test" },
  });
  let project = await response.json();
  const studioId = "392fce6b-fea7-4de3-bb2e-49a95231c3f5";
  await page.addInitScript(
    (id) => localStorage.setItem("takko-marketplace-studio", id),
    studioId,
  );
  const clip = {
    version: 1,
    name: "Punch",
    rig: "R6",
    duration: 1,
    tracks: [
      {
        joint: "Right Arm",
        keys: [
          { time: 0, rotation: [0, 0, 0] },
          { time: 1, rotation: [1.5, 0, 0] },
        ],
      },
    ],
  };
  const pack = {
    id: randomUUID(),
    assetId: "123",
    name: "Combat pack",
    revisionKey: "version:456",
    at: new Date().toISOString(),
    revision: project.revision,
    entries: [
      { key: "1/1", name: "Punch", clip },
      {
        key: "1/2",
        name: "Kick",
        clip: {
          ...clip,
          name: "Kick",
          tracks: [{ ...clip.tracks[0], joint: "Right Leg" }],
        },
      },
      {
        key: "1/3",
        name: "Private move",
        error: "Roblox denied access to this clip.",
      },
    ],
  };
  await page.route(`**/api/projects/${project.id}`, (route) =>
    route.fulfill({ json: project }),
  );
  await page.route("**/api/marketplace/inspect", (route) =>
    route.fulfill({
      json: {
        cacheHit: false,
        asset: {
          assetId: "123",
          name: "Combat pack",
          kind: "Model",
          creatorName: "Fixture",
          updated: "today",
          versionId: "456",
          liked: false,
          saved: false,
          inspection: {
            status: "no_issues_found",
            contentHash: "a".repeat(64),
            inspectedAt: new Date().toISOString(),
            scannerVersion: 1,
            scriptCount: 0,
            nodeCount: 3,
            findings: [],
          },
        },
      },
    }),
  );
  let imports = 0;
  await page.route(
    `**/api/projects/${project.id}/marketplace-animations`,
    async (route) => {
      expect(route.request().postDataJSON()).toEqual({
        revision: project.revision,
        studioId,
        reference: "123",
      });
      imports++;
      project = {
        ...project,
        animationPacks: [pack],
        conversation: [
          ...project.conversation,
          {
            id: randomUUID(),
            kind: "media",
            text: "Combat pack · 3 animations",
            animationPackId: pack.id,
            at: pack.at,
            revision: project.revision,
          },
        ],
      };
      await route.fulfill({ json: project });
    },
  );
  await page.goto(`/?project=${project.id}`);
  const transfer = await page.evaluateHandle(() => {
    const data = new DataTransfer();
    data.setData(
      "text/uri-list",
      "https://create.roblox.com/store/asset/123/Combat",
    );
    return data;
  });
  await page
    .locator(".chat-composer")
    .dispatchEvent("drop", { dataTransfer: transfer });
  const select = page.getByRole("combobox", {
    name: "Animation from Combat pack",
  });
  await expect(select).toHaveCount(1);
  await select.scrollIntoViewIfNeeded();
  await expect(select.locator("option")).toHaveCount(3);
  let viewer = page.getByRole("img", { name: "Punch on R6", exact: true });
  await page.locator(".animation-player").scrollIntoViewIfNeeded();
  await expect(viewer).toHaveAttribute("data-renderer", "webgl");
  await expect
    .poll(async () => Number(await viewer.getAttribute("data-triangles")))
    .toBeGreaterThan(50);
  await expect(page.getByText("Camera", { exact: true })).toHaveCount(0);
  const previewControls = page.locator(".animation-gallery .viewport-controls");
  const controlSizes = await previewControls
    .locator("button")
    .evaluateAll((buttons) =>
      buttons.map((button) => ({
        width: button.getBoundingClientRect().width,
        height: button.getBoundingClientRect().height,
        font: Number.parseFloat(getComputedStyle(button).fontSize),
      })),
    );
  expect(controlSizes.length).toBeGreaterThan(0);
  for (const size of controlSizes) {
    expect(size.width).toBeGreaterThanOrEqual(36);
    expect(size.height).toBeGreaterThanOrEqual(36);
    expect(size.font).toBeGreaterThanOrEqual(12);
  }
  const overflow = await previewControls.evaluate(
    (element) => element.scrollWidth - element.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(
    page.getByRole("combobox", { name: "Playback speed" }),
  ).toHaveCount(0);
  await select.selectOption("1/2");
  await page.locator(".animation-player").scrollIntoViewIfNeeded();
  viewer = page.getByRole("img", { name: "Kick on R6", exact: true });
  await expect(viewer).toHaveAttribute("data-renderer", "webgl");
  await expect(page.locator(".animation-gallery canvas")).toHaveCount(1);
  await select.selectOption("1/3");
  await expect(
    page.getByText("Roblox denied access to this clip."),
  ).toBeVisible();
  await expect(page.locator(".animation-gallery canvas")).toHaveCount(0);
  await page.reload();
  await expect(select.locator("option")).toHaveCount(3);
  expect(imports).toBe(1);
});
