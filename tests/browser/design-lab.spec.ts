import { test, expect } from "./workspace-fixture";

test("design lab switches real workspaces without reload, API calls or losing graph edits", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const requests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/"))
      requests.push(request.url());
  });
  await page.goto("/design-lab");
  const time = await page.evaluate(() => performance.timeOrigin);
  await expect(
    page.getByRole("button", { name: "Edit Combat", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit Combat", exact: true }).click();
  await page
    .getByLabel("System name", { exact: true })
    .fill("Combat sandbox edit");
  await page.getByRole("button", { name: "Close inspector" }).click();
  for (const [letter, label] of [
    ["B", "AI Native"],
    ["C", "Game Dev"],
    ["A", "Refined Takko"],
  ]) {
    await page
      .getByRole("button", { name: `${letter} ${label}`, exact: true })
      .click();
    await expect(page.locator(".design-lab")).toHaveClass(
      `design-lab dl-${letter}`,
    );
    await expect(
      page.getByRole("button", {
        name: "Edit Combat sandbox edit",
        exact: true,
      }),
    ).toBeVisible();
    const surface = await page.locator(".map-surface").boundingBox();
    for (const node of await page.locator(".architecture-node").all()) {
      const title = node.locator(".architecture-node-title strong");
      expect(
        await title.evaluate((el) => el.clientHeight),
      ).toBeGreaterThanOrEqual(
        await title.evaluate((el) =>
          Math.floor(parseFloat(getComputedStyle(el).lineHeight)),
        ),
      );
      const box = await node.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(surface!.x);
      expect(box!.x + box!.width).toBeLessThanOrEqual(
        surface!.x + surface!.width + 1,
      );
      expect(box!.y + box!.height).toBeLessThanOrEqual(
        surface!.y + surface!.height + 1,
      );
    }
  }
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(time);
  expect(requests).toEqual([]);
});

test("design lab renders actual imported 3D tracks and playback survives direction switching", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/design-lab");
  const canvas = page.locator('canvas[data-renderer="webgl"]');
  await expect(canvas).toHaveAttribute("data-triangles", /^[1-9]\d*$/);
  const first = await canvas.getAttribute("data-time");
  await expect.poll(() => canvas.getAttribute("data-time")).not.toBe(first);
  await page
    .getByRole("button", { name: "Pause animation", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Play animation", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "B AI Native", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play animation", exact: true }),
  ).toBeVisible();
  const camera = await canvas.getAttribute("data-camera");
  await canvas.focus();
  await canvas.press("ArrowLeft");
  await expect.poll(() => canvas.getAttribute("data-camera")).not.toBe(camera);
  const bounds = await page
    .getByRole("button", { name: "Fullscreen preview" })
    .boundingBox();
  const composer = await page.locator(".dl-composer").boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(composer!.y);
});

test("sandbox state controls, review and composer remain local and keyboard accessible", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/")) requests.push(r.url());
  });
  await page.goto("/design-lab");
  await page
    .getByRole("button", { name: "Design & states", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Generation state").selectOption("failed");
  await page
    .getByRole("combobox", { name: "Studio state", exact: true })
    .selectOption("Syncing");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(
    page.getByRole("button", { name: /Energy update needs attention/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Syncing", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Review changes 3", exact: true })
    .click();
  await page.getByRole("button", { name: "Mark reviewed in sandbox" }).click();
  await expect(
    page.getByRole("button", { name: "Review changes 0", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Message Takko" })
    .fill("Add a training dummy");
  await page.getByRole("button", { name: "Attach an asset" }).click();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(
    page.getByRole("textbox", { name: "Message Takko" }),
  ).toHaveValue("Add a training dummy");
  await page.getByRole("textbox", { name: "Message Takko" }).press("Enter");
  await expect(page.locator(".dl-local-message")).toContainText(
    "Add a training dummy",
  );
  expect(requests).toEqual([]);
});

test("design sandbox respects reduced motion and does not load on production routes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/design-lab/");
  await page.locator(".animation-player").scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "Play animation", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".dl-spinner").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await page.goto("/");
  await expect(page.locator(".design-lab")).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        performance
          .getEntriesByType("resource")
          .filter((r) => /DesignLab|walk\.json|design-lab\.css/.test(r.name))
          .length,
    ),
  ).toBe(0);
});
