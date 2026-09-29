import { test, expect } from "./workspace-fixture";
import type { GameArchitecture } from "../../src/generation/architecture";
const node = (id: string) => ({
  id,
  name: id,
  purpose: "A game system",
  authority: "server" as const,
  x: 30,
  y: 30,
});
test("canvas and conversation stay visible and remote changes never overwrite local edits", async ({
  page,
}, info) => {
  const p = await (
    await page.request.post("/api/projects", {
      data: { request: "A combat game" },
    })
  ).json();
  let graph: GameArchitecture = { nodes: [node("Combat")], edges: [] };
  await page.route("**/api/projects/" + p.id, (r) =>
    r.fulfill({ json: { ...p, architecture: graph } }),
  );
  await page.goto("/?project=" + p.id);
  const map = page.getByRole("region", { name: "Game architecture" }),
    chat = page.getByRole("region", { name: "Project conversation" });
  await expect(map).toBeVisible();
  await expect(chat).toBeVisible();
  await expect(
    page.getByRole("tablist", { name: "Project views" }),
  ).toHaveCount(0);
  const m = await map.boundingBox(),
    c = await chat.boundingBox();
  if (info.project.name === "desktop") {
    expect(m!.width).toBeGreaterThan(c!.width);
    expect(m!.x + m!.width).toBeLessThanOrEqual(c!.x + 1);
  } else {
    expect(m!.y + m!.height).toBeLessThanOrEqual(c!.y + 1);
  }
  graph = { nodes: [node("Combat"), { ...node("Energy"), x: 270 }], edges: [] };
  await expect(
    map.getByRole("button", { name: "Edit Energy", exact: true }),
  ).toBeVisible({ timeout: 7000 });
  await map.getByRole("button", { name: "Edit Combat", exact: true }).click();
  await map.getByLabel("System name", { exact: true }).fill("Local combat");
  await page.reload();
  await map
    .getByRole("button", { name: "Edit Local combat", exact: true })
    .click();
  await expect(map.getByLabel("System name", { exact: true })).toHaveValue(
    "Local combat",
  );
  expect(
    await page.locator(".map-surface").evaluate((el) => el.scrollTop),
  ).toBe(0);
  expect(await map.evaluate((el) => el.scrollTop)).toBe(0);
  graph = {
    ...graph,
    nodes: [...graph.nodes, { ...node("HUD"), x: 270, y: 180 }],
  };
  await expect(map.getByRole("alert")).toContainText(
    "A newer architecture arrived",
    { timeout: 7000 },
  );
  await expect(map.getByLabel("System name", { exact: true })).toHaveValue(
    "Local combat",
  );
  await map.getByRole("button", { name: "Close inspector" }).click();
  await page
    .getByLabel("Message", { exact: true })
    .fill("Make attacks feel faster");
  await map.getByRole("button", { name: "Load latest architecture" }).click();
  await expect(
    map.getByRole("button", { name: "Edit HUD", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue(
    "Make attacks feel faster",
  );
  await page.screenshot({
    path: `test-artifacts/integrated-workspace/workspace-${info.project.name}.png`,
  });
});
test("canvas pan, zoom, dragging and auto layout preserve game connection contracts", async ({
  page,
}, info) => {
  const p = await (
    await page.request.post("/api/projects", {
      data: { request: "A combat game" },
    })
  ).json();
  const architecture: GameArchitecture = {
    nodes: [node("Combat"), { ...node("Energy"), x: 260 }],
    edges: [
      {
        id: "hit",
        from: "Combat",
        to: "Energy",
        kind: "event",
        event: "Hit confirmed",
        effect: "Award energy",
      },
    ],
  };
  await page.request.post(`/api/projects/${p.id}/architecture`, {
    data: { id: crypto.randomUUID(), revision: p.revision, architecture },
  });
  await page.goto("/?project=" + p.id);
  const map = page.getByRole("region", { name: "Game architecture" }),
    surface = page.locator(".map-surface"),
    content = page.locator(".architecture-canvas");
  const before = await content.getAttribute("style");
  await map.getByRole("button", { name: "Zoom in canvas" }).click();
  await expect(content).not.toHaveAttribute("style", before!);
  if (info.project.name === "desktop") {
    const box = (await surface.boundingBox())!;
    await page.mouse.move(box.x + 30, box.y + box.height - 80);
    await page.mouse.down();
    await page.mouse.move(box.x + 80, box.y + box.height - 60);
    await page.mouse.up();
    const system = map.getByRole("button", {
      name: "Edit Combat",
      exact: true,
    });
    const b = (await system.boundingBox())!;
    await page.mouse.move(b.x + 25, b.y + 20);
    await page.mouse.down();
    await page.mouse.move(b.x + 65, b.y + 60, { steps: 5 });
    await page.mouse.up();
    await map.getByRole("button", { name: "Close inspector" }).click();
    await expect(
      map.getByRole("button", { name: "Review changes" }),
    ).toBeVisible();
  }
  await map.getByRole("button", { name: "Auto layout" }).click();
  await map.getByRole("button", { name: "Review changes" }).click();
  await expect(map).toContainText("Only node positions changed");
  await map.getByRole("button", { name: "Save architecture" }).click();
  await expect(
    map.getByRole("button", { name: "Review changes" }),
  ).toBeHidden();
  const saved = await (await page.request.get("/api/projects/" + p.id)).json();
  expect(saved.architecture.edges).toEqual(architecture.edges);
  expect(saved.architecture.nodes[1].x).toBeGreaterThan(
    saved.architecture.nodes[0].x,
  );
});

test("R15 previews respect reduced motion and recover explicitly when graphics context is lost", async ({
  page,
}) => {
  const p = await (
    await page.request.post("/api/projects", {
      data: { request: "Animation accessibility test" },
    })
  ).json();
  const clip = {
    version: 1,
    name: "R15 wave",
    rig: "R15",
    duration: 1,
    tracks: [
      {
        joint: "RightUpperArm",
        keys: [
          { time: 0, rotation: [0, 0, 0] },
          { time: 0.5, rotation: [0, 0, 1.2] },
          { time: 1, rotation: [0, 0, 0] },
        ],
      },
    ],
  };
  const imported = await page.request.post(`/api/projects/${p.id}/animations`, {
    data: { id: crypto.randomUUID(), revision: p.revision, clip },
  });
  expect(imported.ok()).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?project=" + p.id);
  const viewer = page.getByRole("img", {
    name: "R15 wave on R15",
    exact: true,
  });
  await page.locator(".animation-player").scrollIntoViewIfNeeded();
  await viewer.scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "Play animation", exact: true }),
  ).toBeVisible();
  await expect(viewer).toHaveAttribute("data-time", "0.000");
  await expect
    .poll(async () => Number(await viewer.getAttribute("data-triangles")))
    .toBe(180);
  await viewer.dispatchEvent("webglcontextlost");
  await expect(page.getByRole("alert")).toContainText(
    "lost its graphics context",
  );
  await page
    .getByRole("button", { name: "Retry preview", exact: true })
    .click();
  await viewer.scrollIntoViewIfNeeded();
  await expect
    .poll(async () => Number(await viewer.getAttribute("data-triangles")))
    .toBe(180);
  await expect(page.getByRole("alert")).toHaveCount(0);
});
