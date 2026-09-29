import { test, expect } from "./workspace-fixture";

test("selected B workspace docks editing below the visible graph and preserves contracts", async ({
  page,
}, info) => {
  if (info.project.name === "desktop")
    await page.setViewportSize({ width: 1440, height: 900 });
  const project = await (
    await page.request.post("/api/projects", {
      data: { request: "Arena architecture dock regression" },
    })
  ).json();
  const architecture = {
    nodes: [
      {
        id: "combat",
        name: "Combat",
        purpose: "Verify hits",
        authority: "server",
        x: 40,
        y: 50,
      },
      {
        id: "energy",
        name: "Energy",
        purpose: "Award energy",
        authority: "server",
        x: 320,
        y: 50,
      },
      {
        id: "hud",
        name: "Ability HUD",
        purpose: "Show energy",
        authority: "client",
        x: 600,
        y: 190,
      },
    ],
    edges: [
      {
        id: "hit",
        from: "combat",
        to: "energy",
        event: "Hit confirmed",
        effect: "Add ten energy",
        kind: "event",
      },
      {
        id: "meter",
        from: "energy",
        to: "hud",
        event: "Energy changed",
        effect: "Update ability meter",
        kind: "state",
      },
    ],
  };
  const save = await page.request.post(
    `/api/projects/${project.id}/architecture`,
    {
      data: {
        id: crypto.randomUUID(),
        revision: project.revision,
        architecture,
      },
    },
  );
  expect(save.ok()).toBeTruthy();
  await page.goto("/?project=" + project.id);
  const surface = page.locator(".map-surface");
  const closedHeight = (await surface.boundingBox())!.height;
  await page.getByRole("button", { name: "Edit Combat", exact: true }).click();
  const inspector = page.getByRole("complementary", {
    name: "Architecture inspector",
  });
  await expect(inspector).toBeVisible();
  await expect
    .poll(async () => {
      const map = (await surface.boundingBox())!;
      const dock = (await inspector.boundingBox())!;
      return map.y + map.height <= dock.y;
    })
    .toBe(true);
  await expect
    .poll(async () => {
      const map = (await surface.boundingBox())!;
      for (const card of await page.locator(".architecture-node").all()) {
        const box = (await card.boundingBox())!;
        if (box.y < map.y - 1 || box.y + box.height > map.y + map.height + 1)
          return false;
      }
      return true;
    })
    .toBe(true);
  if (info.project.name === "desktop") {
    expect((await surface.boundingBox())!.height).toBeLessThan(closedHeight);
    const chat = (await page
      .getByRole("region", { name: "Project conversation" })
      .boundingBox())!;
    expect((await surface.boundingBox())!.width).toBeGreaterThan(
      chat.width * 1.8,
    );
    const cards = await page.locator(".architecture-node").all();
    for (const label of await page.locator(".architecture-wires text").all()) {
      const l = (await label.boundingBox())!;
      const wires = (await page.locator(".architecture-wires").boundingBox())!;
      expect(l.y + l.height).toBeLessThanOrEqual(wires.y + wires.height);
      for (const card of cards) {
        const c = (await card.boundingBox())!;
        expect(
          l.x + l.width <= c.x ||
            l.x >= c.x + c.width ||
            l.y + l.height <= c.y ||
            l.y >= c.y + c.height,
        ).toBe(true);
      }
    }
  }
  await page.getByLabel("System name", { exact: true }).fill("Combat rules");
  await page.getByRole("button", { name: "Close inspector" }).click();
  await page
    .getByRole("button", { name: "Review changes", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save architecture", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Review changes", exact: true }),
  ).toBeHidden();
  const saved = await (
    await page.request.get("/api/projects/" + project.id)
  ).json();
  expect(saved.architecture.nodes[0].name).toBe("Combat rules");
  expect(saved.architecture.edges).toEqual(architecture.edges);
  expect(saved.charges).toEqual([]);
  await page
    .getByRole("button", { name: "Edit Combat rules", exact: true })
    .click();
  await page.screenshot({
    path: `test-artifacts/b-foundation/dock-${info.project.name}.png`,
  });
});

test("B icon navigation retains project selection and real model settings", async ({
  page,
}, info) => {
  const p = await (
    await page.request.post("/api/projects", {
      data: { request: "B icon rail " + crypto.randomUUID() },
    })
  ).json();
  await page.goto("/?project=" + p.id);
  if (info.project.name === "desktop") {
    await expect(page.locator(".workspace-native")).toBeVisible();
    await page.getByTitle("Projects", { exact: true }).click();
    await page.getByRole("searchbox", { name: "Search projects" }).fill(p.name);
    await page
      .getByRole("navigation", { name: "Projects", exact: true })
      .getByRole("button", { name: p.name, exact: true })
      .click();
    await expect(page.locator(".project-library")).not.toHaveAttribute(
      "open",
      "",
    );
  } else {
    await expect(
      page.getByLabel("Open project", { exact: true }),
    ).toBeVisible();
  }
  await page
    .getByRole("navigation", { name: "Workspace", exact: true })
    .getByRole("button", { name: "Models", exact: true })
    .click();
  await expect(page).toHaveURL(/#models$/);
  await expect(page.locator(".workspace-native")).toHaveCount(0);
});
