import { test, expect } from "./workspace-fixture";
import { randomUUID } from "node:crypto";
test.use({ video: "on" });

test("four selected assets leave the conversation and send controls usable in a short window", async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 575 });
  const p = await (
    await page.request.post("/api/projects", {
      data: { request: "A fighting game with a dummy and hit effects" },
    })
  ).json();
  p.assetAttachments = [
    "Dummy",
    "Punch animation",
    "Hit sound",
    "Hit effect",
  ].map((name, i) => ({
    assetId: String(100 + i),
    name,
    kind: "Model",
    creatorName: "Fixture",
    contentHash: "a".repeat(64),
    revisionKey: "version:1",
    inspectedAt: new Date().toISOString(),
    scannerVersion: 1,
    scriptCount: 0,
    usage: name,
  }));
  await page.route("**/api/projects/" + p.id, (route) =>
    route.fulfill({ json: p }),
  );
  await page.goto("/?project=" + p.id);
  await expect(page.getByText("Studio is not connected. Animation clips need the Takko plugin.", { exact: false })).toBeVisible();
  await expect(
    page.getByLabel("Use for Hit effect", { exact: true }),
  ).toHaveValue("Hit effect");
  const thread = page.locator(".chat-thread-scroll");
  expect((await thread.boundingBox())!.height).toBeGreaterThanOrEqual(140);
  const send = page.getByRole("button", {
    name: "Send message and update plan",
  });
  const bounds = (await send.boundingBox())!;
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(575);
  await page
    .getByLabel("Use for Hit effect", { exact: true })
    .fill("Keep its burst");
  await expect(
    page.getByLabel("Use for Hit effect", { exact: true }),
  ).toBeInViewport();
});

test("reviewed node connections persist and do not dispatch generation", async ({
  page,
}, info) => {
  const p = await (
    await page.request.post("/api/projects", {
      data: { request: "A combat game with energy" },
    })
  ).json();
  let generations = 0;
  await page.route(/\/api\/projects\/[^/]+\/(plan|build|concept)$/, (route) => {
    generations++;
    return route.abort();
  });
  await page.goto(`/?project=${p.id}`);
  const dialog = page.getByRole("region", { name: "Game architecture" });
  await dialog.getByRole("button", { name: "Add system", exact: true }).click();
  await dialog.getByLabel("System name", { exact: true }).fill("Combat");
  await dialog
    .getByLabel("What does it do?", { exact: true })
    .fill("Validate attacks and deal damage on the server.");
  await dialog.getByRole("button", { name: "Close inspector" }).click();
  await dialog.getByRole("button", { name: "Add system", exact: true }).click();
  await dialog.getByLabel("System name", { exact: true }).fill("Energy");
  await dialog
    .getByLabel("What does it do?", { exact: true })
    .fill("Store each player's energy.");
  await dialog
    .getByRole("button", { name: "Connections", exact: true })
    .first()
    .click();
  await dialog
    .getByLabel("From", { exact: true })
    .selectOption({ label: "Combat" });
  await dialog
    .getByLabel("To", { exact: true })
    .selectOption({ label: "Energy" });
  await dialog.getByLabel("When", { exact: true }).fill("Hit confirmed");
  await dialog
    .getByLabel("Then", { exact: true })
    .fill("Award ten energy after server validation.");
  await dialog
    .getByRole("button", { name: "Add connection", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Review changes", exact: true })
    .click();
  await expect(dialog).toContainText(
    "Saving does not change Studio or spend money",
  );
  expect(
    (await (await page.request.get(`/api/projects/${p.id}`)).json())
      .architecture,
  ).toBeUndefined();
  await dialog
    .getByRole("button", { name: "Save architecture", exact: true })
    .click();
  await expect(
    dialog.getByRole("button", { name: "Review changes", exact: true }),
  ).toBeHidden();
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel("Saved conversation")).toContainText(
    "2 systems, 1 connections",
  );
  await page.reload();
  await expect(
    dialog.getByRole("button", { name: "Edit Combat", exact: true }),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "Connections", exact: true })
    .click();
  await expect(dialog).toContainText(
    "Award ten energy after server validation",
  );
  await dialog.screenshot({
    path: `test-artifacts/chat-architecture-${info.project.name}.png`,
  });
  await page.keyboard.press("Escape");
  expect(generations).toBe(0);
});

test("chat retains message drafts and opens technical details without losing them", async ({
  page,
}) => {
  const p = await (
    await page.request.post("/api/projects", {
      data: { request: "A cooperative garden game" },
    })
  ).json();
  await page.goto(`/?project=${p.id}`);
  await page
    .getByLabel("Message", { exact: true })
    .fill("Add a shared harvest basket");
  await page.reload();
  const composer = await page.locator(".chat-composer").boundingBox();
  expect(composer!.y + composer!.height).toBeLessThanOrEqual(
    page.viewportSize()!.height + 1,
  );
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue(
    "Add a shared harvest basket",
  );
  await page
    .getByRole("button", { name: "Source details", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Source details" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue(
    "Add a shared harvest basket",
  );
  await page.getByRole("button", { name: "History", exact: true }).click();
  await page
    .getByLabel("Search saved messages", { exact: true })
    .fill("garden");
  await expect(page.getByRole("dialog")).toContainText(
    "A cooperative garden game",
  );
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "History", exact: true }),
  ).toBeFocused();
});

test("actual imported keyframes move the inline rig and survive refresh", async ({
  page,
}, info) => {
  const p = await (
    await page.request.post("/api/projects", {
      data: { request: "A punch animation preview" },
    })
  ).json();
  const clip = {
    version: 1,
    name: "Test punch",
    rig: "R6",
    duration: 1,
    tracks: [
      {
        joint: "Right Arm",
        keys: [
          { time: 0, rotation: [0, 0, 0] },
          { time: 0.5, rotation: [-1.5, 0, 0] },
          { time: 1, rotation: [0, 0, 0] },
        ],
      },
    ],
  };
  await page.goto(`/?project=${p.id}`);
  await page.getByText("Preview an animation clip", { exact: true }).click();
  await page.getByLabel("Animation clip JSON", { exact: true }).setInputFiles({
    name: "punch.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(clip)),
  });
  const viewer = page.getByRole("img", {
    name: "Test punch on R6",
  });
  await page.locator(".animation-player").scrollIntoViewIfNeeded();
  await expect(viewer).toBeVisible();
  await viewer.scrollIntoViewIfNeeded();
  await expect(viewer).toHaveAttribute("data-renderer", "webgl");
  await expect
    .poll(async () => Number(await viewer.getAttribute("data-triangles")))
    .toBeGreaterThan(50);
  const start = await viewer.getAttribute("data-time");
  await expect.poll(() => viewer.getAttribute("data-time")).not.toBe(start);
  await page
    .getByRole("button", { name: "Pause animation", exact: true })
    .click();
  const scrub = page.getByRole("slider", {
    name: "Position in Test punch on R6",
    exact: true,
  });
  await scrub.fill("0");
  await viewer.scrollIntoViewIfNeeded();
  await expect(viewer).toHaveAttribute("data-time", "0.000");
  const first = await viewer.evaluate((el) =>
    (el as HTMLCanvasElement).toDataURL(),
  );
  await scrub.fill("0.5");
  await viewer.scrollIntoViewIfNeeded();
  await expect(viewer).toHaveAttribute("data-time", "0.500");
  const second = await viewer.evaluate((el) =>
    (el as HTMLCanvasElement).toDataURL(),
  );
  expect(first).not.toBe(second);
  const camera = await viewer.getAttribute("data-camera");
  await expect(page.getByText("Camera", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Restart animation" }),
  ).toHaveCount(0);
  await viewer.press("ArrowRight");
  await viewer.scrollIntoViewIfNeeded();
  await expect(viewer).not.toHaveAttribute("data-camera", camera!);
  await page
    .getByRole("button", { name: "Play animation", exact: true })
    .click();
  await expect.poll(() => viewer.getAttribute("data-time")).not.toBe("0.500");
  await page
    .getByRole("button", { name: "Pause animation", exact: true })
    .click();
  await expect(
    page.getByText(/Studio playback has not been verified/),
  ).toBeVisible();
  await viewer.screenshot({
    path: `test-artifacts/chat-animation-${info.project.name}.png`,
  });
  await page.reload();
  await page.locator(".animation-player").scrollIntoViewIfNeeded();
  await expect(viewer).toBeVisible();
  const mismatch = await page.request.post(`/api/projects/${p.id}/animations`, {
    data: {
      id: randomUUID(),
      revision: p.revision,
      clip: { ...clip, rig: "R15" },
    },
  });
  expect(mismatch.status()).toBe(400);
});
