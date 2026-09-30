import { test, expect } from "./workspace-fixture";
import type { Page } from "@playwright/test";
import { tsImport } from "tsx/esm/api";
const { pickerFixture } = (await tsImport(
  "../asset-picking-fixture.ts",
  import.meta.url,
)) as typeof import("../asset-picking-fixture");
import { pickStatus } from "../../src/marketplace/pick-status";
import { recommendRig } from "../../src/generation/rig-policy";
let f: Awaited<ReturnType<typeof pickerFixture>>;
test.beforeEach(async ({ page }) => {
  f = await pickerFixture();
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes("thumbnails")) return route.fulfill({ json: {} });
    const response = await route.fetch({
      url: f.origin + url.pathname + url.search,
      headers: { ...route.request().headers(), origin: f.origin },
    });
    if (url.pathname === "/api/status")
      return route.fulfill({
        json: { ...(await response.json()), studioConnectionGate: false },
      });
    return route.fulfill({ response });
  });
  await page.goto("/?project=" + f.project().id);
  await expect(
    page.getByRole("region", { name: "Assets for this game", exact: true }),
  ).toBeVisible();
});
test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: "wait" });
  await f.close();
});
const card = (page: Page) =>
  page.getByRole("region", { name: "Assets for this game", exact: true });
const row = (page: Page, name = "Target dummy") =>
  card(page).getByRole("region", { name, exact: true });

test("the inline rig choice recommends the captured animation rig and saves a receipt", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await f.search("punchAnimation", "punch animation");
  const chosen = (await f.choose(f.animation.assetId, "punchAnimation")).data;
  const group = chosen.assetDiscovery.groups.find((g: any) => g.id === "punchAnimation");
  const clip = group.options[0].previewData.pack.entries.find((e: any) => e.clip);
  await f.command("asset-picks/clip", { groupId: group.id, assetId: f.animation.assetId, clipKey: clip.key });
  const p = f.project(); delete p.rig; p.rig = recommendRig(p); f.app.locals.engine.store.save(p);
  await page.reload();
  const question = page.getByRole("region", { name: "Current question", exact: true });
  await expect(question).toContainText("animation");
  await question.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-artifacts/chat-parts-1-3/real-rig-question.png", fullPage: true });
  await question.getByRole("radio", { name: new RegExp(`^${clip.clip.rig} `) }).check();
  await question.getByRole("button", { name: "Save answer", exact: true }).click();
  await expect(page.getByText(`✓ Rig: ${clip.clip.rig}`, { exact: true })).toBeVisible();
  expect(f.project().rig?.selected).toBe(clip.clip.rig);
});

test("removing a detected pick stays removed after reload", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await f.search(); await f.choose(); await page.reload();
  await expect(row(page)).toContainText(f.dummies[1].name);
  await row(page).scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-artifacts/chat-parts-1-3/real-asset-needs.png", fullPage: true });
  await row(page).getByRole("button", { name: `Remove ${f.dummies[1].name}`, exact: true }).click();
  await expect(row(page)).toContainText("Attach one from the Marketplace and press Enter");
  await page.reload();
  expect(f.project().assetDiscovery?.choices?.targetDummy?.assetId).toBeUndefined();
});

test("a Marketplace card dropped onto a need assigns and verifies that exact listing without a row search", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Browse Marketplace assets", exact: true })
    .click();
  const panel = page.getByRole("complementary", {
    name: "Marketplace",
    exact: true,
  });
  await panel
    .getByLabel("Search Marketplace", { exact: true })
    .fill("target dummy");
  await panel
    .getByRole("button", { name: "Search assets", exact: true })
    .click();
  const listing = panel.locator(".market-card").nth(1);
  await expect(listing).toContainText(f.dummies[1].name);
  const searches = [...f.state.searches];
  await listing.dragTo(row(page));
  await expect(row(page)).toContainText(f.dummies[1].name);
  await expect(row(page)).toContainText("Ready");
  await page
    .getByRole("button", { name: "Close Marketplace", exact: true })
    .click();
  await page.reload();
  await expect(row(page)).toContainText(f.dummies[1].name);
  expect(f.state.searches).toEqual(searches);
  expect(f.state.inspections).toEqual([f.dummies[1].assetId]);
  expect(f.state.calls).toBe(0);
});

test("composer drop reaches the proposal planner and fills the chosen need from the inspection cache", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByText(
      "Studio is not connected. Animation clips need the Takko plugin.",
      { exact: false },
    ),
  ).toBeVisible();
  await page.getByLabel("Game idea").fill(f.project().request);
  await page
    .getByRole("button", { name: "Browse Marketplace assets", exact: true })
    .click();
  const panel = page.getByRole("complementary", {
    name: "Marketplace",
    exact: true,
  });
  await panel
    .getByLabel("Search Marketplace", { exact: true })
    .fill("target dummy");
  await panel
    .getByRole("button", { name: "Search assets", exact: true })
    .click();
  const listing = panel.locator(".market-card").nth(1);
  await expect(listing).toContainText(f.dummies[1].name);
  await listing.dragTo(page.getByLabel("Game idea"));
  await expect(
    page.getByLabel(`Use for ${f.dummies[1].name}`, { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Close Marketplace", exact: true })
    .click();
  await page
    .getByLabel(`Use for ${f.dummies[1].name}`, { exact: true })
    .fill("targetDummy");
  const searches = [...f.state.searches];
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(row(page)).toContainText(f.dummies[1].name);
  await expect(row(page)).toContainText("Ready");
  expect(f.state.plannerContexts).toHaveLength(1);
  expect(
    f.state.plannerContexts[0].gameContext.selectedAssets.assets[0],
  ).toMatchObject({
    assetId: f.dummies[1].assetId,
    usage: "targetDummy",
  });
  expect(f.state.searches).toEqual(searches);
  expect(f.state.inspections).toEqual([f.dummies[1].assetId]);
  await page.reload();
  await expect(row(page)).toContainText(f.dummies[1].name);
  await expect(row(page)).toContainText("Ready");
  expect(f.state.searches).toEqual(searches);
});

test("card and Marketplace persist each real listing and clip through reload and revision changes", async ({
  page,
}, info) => {
  await expect(card(page)).toContainText("0 of 3 ready");
  await expect(row(page).locator(".need-purpose")).toHaveCSS(
    "text-wrap-mode",
    "nowrap",
  );
  await expect(
    card(page).getByRole("button", { name: "Approve & build", exact: true }),
  ).toBeDisabled();
  await row(page)
    .getByRole("button", { name: "Choose asset", exact: true })
    .click();
  await expect(
    page.getByText("Choosing: Target dummy", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Search Marketplace", { exact: true }),
  ).toHaveValue("punching training dummy");
  await page
    .getByLabel("Search Marketplace", { exact: true })
    .fill("target dummy");
  await page
    .getByRole("button", { name: "Search assets", exact: true })
    .click();
  await expect(page.locator(".market-card").first()).toContainText(
    f.dummies[0].name,
  );
  await page.screenshot({
    path: `test-artifacts/takko-refresh/picking-${info.project.name}.png`,
  });
  await page
    .locator(".market-card")
    .nth(1)
    .getByRole("button", { name: "Use this", exact: true })
    .click();
  await expect(row(page)).toContainText("Ready");
  await page.reload();
  await expect(row(page)).toContainText(f.dummies[1].name);
  const p = f.project();
  f.app.locals.engine.revise(p.id, p.revision, p.request, p.answers);
  await page.reload();
  await expect(row(page)).toContainText(f.dummies[1].name);
  await row(page, "Punch animation")
    .getByRole("button", { name: "Choose asset", exact: true })
    .click();
  await page.getByRole("button", { name: "Use this", exact: true }).click();
  const sheet = page.getByRole("dialog", {
    name: `Clips from ${f.animation.name}`,
  });
  await expect(sheet).toBeVisible();
  const group = f
    .project()
    .assetDiscovery!.groups.find((g) => g.id === "punchAnimation")!;
  const entry = group.options
    .find((o) => o.assetId === f.animation.assetId)!
    .previewData!.pack!.entries.find((e) => e.clip)!;
  await sheet
    .getByRole("button", {
      name: new RegExp(entry.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    })
    .first()
    .click();
  await sheet
    .getByRole("button", { name: "Use this clip", exact: true })
    .click();
  await expect(row(page, "Punch animation")).toContainText("Ready");
  await row(page, "Hit sound")
    .getByRole("button", { name: "Choose asset", exact: true })
    .click();
  await page.getByRole("button", { name: "Use this", exact: true }).click();
  await expect(card(page)).toContainText("3 of 3 ready");
  await expect(
    card(page).getByRole("button", { name: "Approve & build", exact: true }),
  ).toBeEnabled();
  await page.reload();
  await expect(card(page)).toContainText("3 of 3 ready");
  await card(page).scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `test-artifacts/takko-refresh/card-ready-${info.project.name}.png`,
  });
  expect(f.state.calls).toBe(0);
});

test("excluded listings are visible and Escape returns to chat", async ({
  page,
}) => {
  const p = f.project();
  p.excludedAssetIds = [f.dummies[0].assetId];
  f.app.locals.engine.store.save(p);
  await page.reload();
  await row(page)
    .getByRole("button", { name: "Choose asset", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Excluded by you", exact: true }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.locator(".marketplace-picking")).toHaveCount(0);
  await expect(
    row(page).getByRole("button", { name: "Choose asset", exact: true }),
  ).toBeFocused();
});

test("automatic source review becomes green and disconnected recovery keeps the build gated", async ({
  page,
}) => {
  f.state.scripts = 1;
  let done!: () => void;
  f.state.delay = new Promise<void>((r) => (done = r));
  await row(page)
    .getByRole("button", { name: "Choose asset", exact: true })
    .click();
  await page
    .locator(".market-card")
    .nth(1)
    .getByRole("button", { name: "Use this", exact: true })
    .click();
  await expect(
    page.locator(".marketplace-picking").getByText("Checking", { exact: true }),
  ).toBeVisible();
  done();
  await expect(row(page)).toContainText("1 scripts kept");
  expect(
    await row(page).evaluate((e) => {
      const bounds = e.getBoundingClientRect();
      const pill = e.querySelector(".pick-pill")!.getBoundingClientRect();
      return pill.right <= bounds.right && e.scrollWidth <= e.clientWidth;
    }),
  ).toBe(true);
  await expect(row(page)).toContainText("Validation $");
  f.state.connected = false;
  await row(page).getByRole("button", { name: "Change", exact: true }).click();
  await page
    .locator(".market-card")
    .nth(2)
    .getByRole("button", { name: "Use this", exact: true })
    .click();
  await expect(row(page)).toContainText("Problem");
  await expect(row(page)).toContainText("Studio isn't connected");
  await expect(
    card(page).getByRole("button", { name: "Approve & build", exact: true }),
  ).toBeDisabled();
});

for (const relevant of [true, false])
  test(`Choose for me shows a cost and ${relevant ? "keeps a relevant pick" : "leaves an irrelevant page empty"}`, async ({
    page,
  }) => {
    f.state.relevant = relevant;
    await row(page)
      .getByRole("button", { name: "Choose for me", exact: true })
      .click();
    await expect(row(page)).toContainText("Estimated maximum");
    expect(f.state.calls).toBe(0);
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/asset-picks/auto", async (route) => {
      await pending;
      await route.fallback();
    });
    await row(page)
      .getByRole("button", { name: /Choose for me ·/ })
      .click();
    await expect(row(page)).toContainText("Finding a match");
    release();
    await expect.poll(() => f.state.calls).toBeGreaterThan(0);
    if (relevant) await expect(row(page)).toContainText("Best relevant match");
    else
      await expect(row(page)).toContainText("Nothing on this page is relevant");
    expect(!!f.project().assetDiscovery?.choices?.targetDummy?.assetId).toBe(
      relevant,
    );
  });

test("long real asset names stay bounded and result actions align", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await row(page)
    .getByRole("button", { name: "Choose asset", exact: true })
    .click();
  await page
    .getByLabel("Search Marketplace", { exact: true })
    .fill("target dummy");
  await page
    .getByRole("button", { name: "Search assets", exact: true })
    .click();
  await expect(page.locator(".market-card")).toHaveCount(f.dummies.length);
  const longest = f.dummies.reduce((a, b) =>
    a.name.length > b.name.length ? a : b,
  );
  const result = page.locator(".market-card").filter({
    has: page.getByRole("link", { name: longest.name, exact: true }),
  });
  const title = result.locator("a");
  await expect(title).toHaveAttribute("title", longest.name);
  await expect(title).toHaveCSS("-webkit-line-clamp", "2");
  const positions = await page.locator(".market-card").evaluateAll((cards) =>
    cards.map((card) => {
      const box = card.getBoundingClientRect();
      const action = card.querySelector(".pick-use")!.getBoundingClientRect();
      const name = card.querySelector("a")!.getBoundingClientRect();
      return {
        top: box.top,
        bottom: box.bottom,
        actionBottom: action.bottom,
        right: box.right,
        actionRight: action.right,
        nameRight: name.right,
      };
    }),
  );
  for (const p of positions) {
    expect(p.bottom - p.actionBottom).toBeLessThanOrEqual(10);
    expect(p.actionRight).toBeLessThanOrEqual(p.right);
    expect(p.nameRight).toBeLessThanOrEqual(p.right);
    for (const peer of positions.filter(
      (other) => Math.abs(other.top - p.top) < 1,
    ))
      expect(Math.abs(peer.actionBottom - p.actionBottom)).toBeLessThanOrEqual(
        1,
      );
  }
  await page.screenshot({
    path: "test-artifacts/takko-refresh/long-name-picking-desktop.png",
  });
  await result.getByRole("button", { name: "Use this", exact: true }).click();
  const picked = row(page).locator(".chosen-asset strong");
  await expect(picked).toHaveText(longest.name);
  await expect(picked).toHaveAttribute("title", longest.name);
  await expect(picked).toHaveCSS("white-space", "nowrap");
  await expect(picked).toHaveCSS("text-overflow", "ellipsis");
  await page
    .getByRole("separator", { name: "Resize Takko panel" })
    .press("Home");
  const contained = await row(page).evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return [...element.querySelectorAll("button, .chosen-asset strong")].every(
      (control) => control.getBoundingClientRect().right <= bounds.right + 1,
    );
  });
  expect(contained).toBe(true);
  const attachment = page.locator(".asset-attachment strong");
  await expect(attachment).toHaveCount(0);
  await page.screenshot({
    path: "test-artifacts/takko-refresh/long-name-desktop.png",
  });
});

test("a build message survives reload and becomes Applied through the persisted queue API", async ({ page }) => {
  const p = f.project(); p.jobId = crypto.randomUUID(); p.stage = "generating";
  f.app.locals.engine.store.save(p);
  await page.reload();
  await page.getByLabel("Message", { exact: true }).fill("Make it louder");
  await page.getByLabel("Message", { exact: true }).press("Enter");
  await expect(page.getByText("Queued · after this step", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Queued · after this step", { exact: true })).toBeVisible();
  const boundary = f.project(); boundary.jobId = null; f.app.locals.engine.store.save(boundary);
  await f.app.locals.engine.applyQueuedChanges(p.id);
  await expect(page.getByText("Applied", { exact: true })).toBeVisible();
  expect(f.state.plannerContexts.at(-1).conversation.some((t: any) => t.text === "Make it louder")).toBe(true);
});

test("Enter attaches a missing sound and later natural language reaches the same planner conversation", async ({ page }) => {
  await page.getByRole("button", { name: "Browse Marketplace assets", exact: true }).click();
  const panel = page.getByRole("complementary", { name: "Marketplace", exact: true });
  await panel.getByLabel("Search Marketplace", { exact: true }).fill("hit sound");
  await panel.getByRole("button", { name: "Search assets", exact: true }).click();
  // The Marketplace search kind is selected explicitly so the real fixture provider returns audio.
  await panel.getByLabel("Asset type", { exact: true }).selectOption("Audio");
  await panel.getByRole("button", { name: "Search assets", exact: true }).click();
  await panel.locator(".market-card").first().getByRole("button", { name: "Add to chat", exact: true }).click();
  await page.getByRole("button", { name: "Close Marketplace", exact: true }).click();
  await page.getByLabel("Message", { exact: true }).press("Enter");
  await expect.poll(() => f.state.plannerContexts.length).toBeGreaterThan(0);
  await expect.poll(() => f.project().jobId).toBeNull();
  await expect(page.getByRole("region", { name: "Chat status" })).toHaveAttribute("data-state", "Needs you");
  await expect(row(page, "Hit sound")).toContainText(f.sound.name);
  await page.getByLabel("Message", { exact: true }).fill("Use a straw dummy instead");
  await page.getByLabel("Message", { exact: true }).press("Enter");
  await expect.poll(() => f.state.plannerContexts.length).toBe(2);
  expect(f.state.plannerContexts.at(-1).edit.text).toBe("Use a straw dummy instead");
  await expect.poll(() => f.project().proposal?.assetNeeds?.find(n => n.id === "targetDummy")?.query).toBe("straw dummy");
  expect(f.state.plannerContexts.at(-1).conversation.length).toBeGreaterThan(1);
});
