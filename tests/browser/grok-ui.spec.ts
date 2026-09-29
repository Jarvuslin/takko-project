import { expect, test } from "./workspace-fixture";

test("taco mascot loads in both brand placements and shares the favicon asset", async ({
  page,
}) => {
  await page.goto("/");
  const marks = page.locator("img.takko-mark");
  await expect(marks).toHaveCount(2);
  for (const mark of await marks.all()) {
    await expect(mark).toBeVisible();
    await expect(mark).toHaveAttribute("alt", "");
    await expect(mark).toHaveAttribute("aria-hidden", "true");
    await expect
      .poll(() =>
        mark.evaluate(
          (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  const asset = await marks.first().getAttribute("src");
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    asset!,
  );
  const response = await page.request.get(asset!);
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("image/svg+xml");
  await expect(page.getByRole("link", { name: "Takko home" })).toBeVisible();
});

test("starting points fill the composer without creating or generating a project", async ({
  page,
}) => {
  const mutations: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/") && request.method() !== "GET")
      mutations.push(request.url());
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Build an obby", exact: true })
    .click();
  await expect(page.getByLabel("Game idea")).toHaveValue(/checkpoints/);
  await expect(page.getByLabel("Game idea")).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Make an arena", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Create project", exact: true }),
  ).toBeEnabled();
  await page.getByLabel("Game idea").fill("");
  await expect(
    page.getByRole("button", { name: "Make an arena", exact: true }),
  ).toBeEnabled();
  expect(mutations).toEqual([]);
});

test("recent cards open saved projects and project search only filters navigation", async ({
  page,
}, testInfo) => {
  const a = await (
    await page.request.post("/api/projects", {
      data: { request: "A garden for friends to explore" },
    })
  ).json();
  const b = await (
    await page.request.post("/api/projects", {
      data: { request: "An arena with short rounds" },
    })
  ).json();
  const list = [
    { id: a.id, name: "Satellite Gardens", stage: "draft" },
    { id: b.id, name: "Round Arena", stage: "draft" },
  ];
  await page.route("**/api/projects", (route) => route.fulfill({ json: list }));
  await page.route("**/api/projects/" + a.id, (route) =>
    route.fulfill({ json: { ...a, name: list[0].name } }),
  );
  await page.goto("/");
  const recent = page.getByRole("region", { name: "Recent projects" });
  await expect(recent.getByRole("button")).toHaveCount(2);
  await expect(recent).not.toContainText("Neon Drift");

  const search = page.getByRole("searchbox", { name: "Search projects" });
  await search.fill("satellite");
  await expect(
    page.getByRole("navigation", { name: "Projects" }).getByRole("button"),
  ).toHaveCount(1);
  await search.fill("no-such-project");
  await expect(page.getByText("No matching projects.")).toBeVisible();
  await expect(recent.getByRole("button")).toHaveCount(2);

  await recent.getByRole("button", { name: /Satellite Gardens/ }).click();
  await expect(page.getByLabel("Project request")).toHaveValue(a.request);
  await expect(page).toHaveURL(new RegExp(a.id));

  await page
    .getByRole("button", { name: "Connect to Studio", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Studio details" }),
  ).toBeVisible();
});

test("monochrome layout keeps composer actions reachable at desktop window sizes", async ({
  page,
}, testInfo) => {
  await page.route("**/api/projects", (route) => route.fulfill({ json: [] }));
  await page.goto("/");
  for (const width of [768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(
      page.getByRole("button", { name: "Create project", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: "Browse Marketplace assets",
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page
        .getByRole("button", { name: "Browse Marketplace assets", exact: true })
        .evaluate((button) => button.scrollWidth <= button.clientWidth + 1),
    ).toBe(true);
    const send = await page
      .getByRole("button", { name: "Create project", exact: true })
      .boundingBox();
    expect(send!.x).toBeGreaterThanOrEqual(0);
    expect(send!.x + send!.width).toBeLessThanOrEqual(width);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.screenshot({
    path: `test-artifacts/grok-ui-home-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("project names keep their full hover text within navigation tracks", async ({
  page,
}) => {
  const created = await (
    await page.request.post("/api/projects", {
      data: {
        request:
          "Build a cooperative exploration game in a very large floating garden with friends",
      },
    })
  ).json();
  await page.goto("/");
  const recent = page
    .getByRole("region", { name: "Recent projects" })
    .getByRole("button", { name: new RegExp(created.name) });
  const title = recent.locator("strong");
  await expect(title).toHaveAttribute("title", created.name);
  await expect(title).toHaveCSS("white-space", "nowrap");
  await expect(title).toHaveCSS("text-overflow", "ellipsis");
  await recent.click();
  const crumb = page.locator(".topbar .bounded-name");
  await expect(crumb).toHaveAttribute("title", created.name);
  await expect(crumb).toHaveCSS("text-overflow", "ellipsis");
  await page.getByTitle("Projects", { exact: true }).click();
  const nav = page
    .getByRole("navigation", { name: "Projects", exact: true })
    .getByRole("button", { name: created.name, exact: true });
  await expect(nav.locator(".bounded-name")).toHaveAttribute(
    "title",
    created.name,
  );
  await page.setViewportSize({ width: 860, height: 900 });
  expect(
    await page
      .locator(".topbar")
      .evaluate((header) =>
        [...header.querySelectorAll("button, .bounded-name")].every(
          (child) =>
            child.getBoundingClientRect().right <=
            header.getBoundingClientRect().right + 1,
        ),
      ),
  ).toBe(true);
});
