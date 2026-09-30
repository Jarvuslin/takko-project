import { test, expect, _electron, type ElectronApplication, type Page } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { tsImport } from "tsx/esm/api";
const { chatJourneyFixture, chooseJourneyAssets } = await tsImport("../chat-journey-fixture.ts", import.meta.url) as typeof import("../chat-journey-fixture");
let f: Awaited<ReturnType<typeof chatJourneyFixture>>, app: ElectronApplication, page: Page;
const card = () => page.getByRole("region", { name: "Assets for this game", exact: true });
const row = (name: string) => card().getByRole("region", { name, exact: true });
test.beforeEach(async () => {
  f = await chatJourneyFixture();
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "takko-electron-journey-"));
  const env = Object.fromEntries(Object.entries(process.env).filter((entry): entry is [string,string] => entry[1] !== undefined)); delete env.ELECTRON_RUN_AS_NODE;
  app = await _electron.launch({ args: [path.resolve("dist-desktop"), "--user-data-dir=" + directory], env });
  page = await app.firstWindow();
  await page.waitForURL(/127\.0\.0\.1/);
  await page.route("**/api/**", async route => {
    const url = new URL(route.request().url());
    if (url.pathname.includes("thumbnails")) return route.fulfill({ json: {} });
    const response = await route.fetch({ url: f.origin + url.pathname + url.search, headers: { ...route.request().headers(), origin: f.origin } });
    if (url.pathname === "/api/status") return route.fulfill({ json: { ...await response.json(), studioConnectionGate: false } });
    await route.fulfill({ response });
  });
  await page.goto(new URL("/?project=" + f.project().id, page.url()).href);
  await expect(card()).toBeVisible();
});
test.afterEach(async ({}, info) => {
  if (page && !page.isClosed()) {
    await page.screenshot({ path: info.outputPath("final.png"), fullPage: true });
    await page.unrouteAll({ behavior: "wait" });
  }
  await app?.close();
  await f?.close();
});
async function clean() {
  await expect(page.getByText(/Save asset replacements|unsaved brief|save (?:your|the) brief|exceeds Jev's input limit|Multiple approved groups/)).toHaveCount(0);
  await expect(page.locator(".chat-composer .asset-attachment")).toHaveCount(0);
}
async function send(text: string) {
  await page.getByLabel("Message", { exact: true }).fill(text);
  await page.getByRole("button", { name: "Send message and update plan" }).click();
  await expect(page.locator(".chat-thread-scroll").getByText(text, { exact: true }).first()).toBeVisible({ timeout: 1000 });
}
async function build() {
  await card().getByRole("button", { name: "Approve & build", exact: true }).click();
  await expect(page.getByRole("button", { name: "Stop build" })).toBeVisible({ timeout: 1000 });
  await expect(page.getByRole("region", { name: "Ready to test", exact: true })).toBeVisible({ timeout: 30000 });
  await clean();
}
test("a: three attached assets, rig, build and an applied queued follow-up", async () => {
  await page.goto(new URL("/", page.url()).href);
  await page.getByLabel("Game idea").fill(f.project().request);
  for (const [query, kind, index, name, usage] of [
    ["target dummy", "Model", 1, f.dummies[1].name, "targetDummy"],
    ["punch animation", "Model", 0, f.animation.name, "punchAnimation"],
    ["hit sound", "Audio", 0, f.sound.name, "hitSound"],
  ] as const) {
    await page.getByRole("button", { name: "Browse Marketplace assets", exact: true }).click();
    const panel = page.getByRole("complementary", { name: "Marketplace", exact: true });
    await panel.getByLabel("Asset type", { exact: true }).selectOption(kind);
    await panel.getByLabel("Search Marketplace", { exact: true }).fill(query);
    await panel.getByRole("button", { name: "Search assets", exact: true }).click();
    const listing = panel.locator(".market-card").nth(index);
    await expect(listing).toContainText(name);
    await listing.dragTo(page.getByLabel("Game idea"));
    await expect(page.getByLabel(`Use for ${name}`, { exact: true })).toBeVisible({ timeout: 1000 });
    await page.getByRole("button", { name: "Close Marketplace", exact: true }).click();
    await page.getByLabel(`Use for ${name}`, { exact: true }).fill(usage);
  }
  await page.getByRole("button", { name: "Create project", exact: true }).click();
  await expect(card()).toContainText("3 of the 3 assets");
  const question = page.getByRole("region", { name: "Current question", exact: true });
  while (await question.isVisible()) {
    await question.getByRole("radio").first().check();
    await question.getByRole("button", { name: /^(Next|Save answers?|Save & update proposal)$/ }).click();
    await page.waitForTimeout(150);
  }
  const clipButton = row("Punch animation").getByRole("button", { name: /Choose.*clip|Choose animation/i });
  if (await clipButton.count()) await clipButton.first().click();
  const sheet = page.getByRole("dialog");
  if (await sheet.isVisible()) { await sheet.locator(".clip-options button:not([disabled])").first().click(); await sheet.getByRole("button", { name: "Use this clip", exact: true }).click(); }
  f.control.buildDelay = 1800;
  await card().getByRole("button", { name: "Approve & build", exact: true }).click();
  await expect(page.getByRole("button", { name: "Stop build" })).toBeVisible({ timeout: 1000 });
  await send("Use a darker arena floor");
  await expect(page.getByText("Applied", { exact: true }).first()).toBeVisible({ timeout: 30000 });
  await build();
});
test("b: no relevant sound, chat skip, build", async () => {
  await chooseJourneyAssets(f, true);
  await f.command("asset-picks/remove", { groupId: "hitSound" });
  f.state.relevant = false;
  await page.reload();
  await row("Hit sound").getByRole("button", { name: "Choose for me", exact: true }).click();
  await expect(row("Hit sound")).toContainText("Estimated maximum", { timeout: 1000 });
  await row("Hit sound").getByRole("button", { name: /Choose for me ·/ }).click();
  await expect(row("Hit sound")).toContainText("Nothing on this page is relevant");
  await expect(row("Hit sound").getByRole("button", { name: "Broader search" })).toBeVisible();
  await send("skip the sound for now");
  await expect(row("Hit sound")).toContainText("Skipped");
  await build();
});
test("c: choose a Sound inside a Model without a preview, then build", async () => {
  await chooseJourneyAssets(f, true);
  const original = f.provider.snapshot;
  f.provider.snapshot = async (...args: Parameters<typeof original>) => ({ ...await original(...args), nodes: [{ name: "SoundPack.Hit", className: "Sound", soundId: `rbxassetid://${f.sound.assetId}` }] });
  await f.choose(f.dummies[2].assetId, "hitSound");
  await page.reload();
  await row("Hit sound").getByRole("button", { name: "Use sound Hit", exact: true }).click();
  await expect(row("Hit sound")).toContainText("Ready", { timeout: 1000 });
  await build();
  expect(f.control.contexts.some(c => c.gameContext?.assetChoices?.groups.some((g: any) => g.choice?.sound?.assetId === f.sound.assetId))).toBe(true);
});
test("d: a straw dummy edit changes the need and allows a replacement", async () => {
  await chooseJourneyAssets(f); await page.reload();
  await send("Use a straw dummy instead");
  await expect.poll(() => f.project().proposal?.assetNeeds?.[0].query).toBe("straw dummy");
  await row("Target dummy").getByRole("button", { name: "Choose asset", exact: true }).click();
  await expect(page.getByLabel("Search Marketplace", { exact: true })).toHaveValue("straw dummy", { timeout: 1000 });
  await page.locator(".market-card").nth(2).getByRole("button", { name: "Use this", exact: true }).click();
  await expect(row("Target dummy")).toContainText(f.dummies[2].name);
  await clean();
});
test("e: Stop mid-build and Continue", async () => {
  await chooseJourneyAssets(f); f.control.buildDelay = 2500; await page.reload();
  await card().getByRole("button", { name: "Approve & build", exact: true }).click();
  await expect.poll(() => f.control.buildCalls).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Stop build" }).click();
  await expect(page.getByRole("region", { name: "Chat status" })).toContainText(/Stopping|Stopped/, { timeout: 1000 });
  await expect(page.getByRole("region", { name: "Stopped", exact: true })).toBeVisible({ timeout: 5000 });
  f.control.buildDelay = 500;
  await page.getByRole("button", { name: /^Continue ·/ }).click();
  await expect(page.getByRole("button", { name: "Stop build" })).toBeVisible({ timeout: 1000 });
  await expect(page.getByRole("region", { name: "Ready to test", exact: true })).toBeVisible({ timeout: 30000 });
  await clean();
});
test("f: recorded failed worker checkpoints migrate and Retry resumes the missing area", async () => {
  const p = JSON.parse(fs.readFileSync("tests/fixtures/chat-recovery/failed-project.json", "utf8"));
  const saved = structuredClone(p.coordination.areas);
  f.app.locals.engine.store.save(p);
  const original = f.app.locals.engine.transport;
  f.app.locals.engine.transport = async (url: any, init: any) => {
    const body = JSON.parse(String(init.body));
    const context = body.messages && JSON.parse(body.messages[1].content);
    if (context?.coordination?.step === "area") return Response.json({ choices: [{ message: { content: fs.readFileSync("tests/fixtures/chat-recovery/failed-worker-response.txt", "utf8").replace(/^```json\s*|\s*```$/g, "") } }], usage: { prompt_tokens: 100, completion_tokens: 100, cost: 0 } });
    return original(url, init);
  };
  await page.goto(new URL("/?project=" + p.id, page.url()).href);
  await page.getByRole("button", { name: /^Retry from this step/ }).click();
  await expect(page.getByRole("button", { name: "Stop build" })).toBeVisible({ timeout: 1000 });
  await expect.poll(() => f.app.locals.engine.store.get(p.id).stage).toBe("review");
  const result = f.app.locals.engine.store.get(p.id);
  for (const [id, value] of Object.entries(saved)) expect(result.coordination.areas[id]).toEqual(value);
  expect(result.error).toBeNull();
});
test("g: sending while working keeps the message and shows Queued", async () => {
  await chooseJourneyAssets(f); f.control.buildDelay = 2500; await page.reload();
  await card().getByRole("button", { name: "Approve & build", exact: true }).click();
  await expect.poll(() => f.control.buildCalls).toBeGreaterThan(0);
  await send("Add a visible combo counter");
  await expect(page.getByText("Queued · after this step", { exact: true }).first()).toBeVisible({ timeout: 1000 });
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue("");
  await expect(page.getByText("Applied", { exact: true }).first()).toBeVisible({ timeout: 30000 });
  await clean();
});

test("exploratory: odd-order picks, interrupted browsing, multiline chat and desktop layout", async ({}, info) => {
  await row("Hit sound").getByRole("button", { name: "Skip for now", exact: true }).click();
  await expect(row("Hit sound")).toContainText("Skipped", { timeout: 1000 });
  await row("Target dummy").getByRole("button", { name: "Choose asset", exact: true }).click();
  await expect(page.getByRole("complementary", { name: "Marketplace", exact: true })).toBeVisible({ timeout: 1000 });
  await page.getByLabel("Asset type", { exact: true }).selectOption("Audio");
  await expect(page.locator(".market-card").first()).toContainText(f.sound.name, { timeout: 1000 });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("complementary", { name: "Marketplace", exact: true })).toHaveCount(0);
  await row("Punch animation").getByRole("button", { name: "Skip for now", exact: true }).click();
  await expect(row("Punch animation")).toContainText("Skipped", { timeout: 1000 });
  const message = page.getByLabel("Message", { exact: true });
  await message.fill("First line"); await message.press("Shift+Enter"); await message.type("Second line");
  await expect(message).toHaveValue("First line\nSecond line");
  await message.fill("");
  await page.reload();
  await expect(row("Hit sound")).toContainText("Skipped");
  await expect(row("Punch animation")).toContainText("Skipped");
  await row("Target dummy").getByRole("button", { name: "Choose asset", exact: true }).click();
  await page.locator(".market-card").nth(1).getByRole("button", { name: "Use this", exact: true }).click();
  await expect(row("Target dummy")).toContainText(f.dummies[1].name);
  if (await page.getByRole("button", { name: "Close Marketplace", exact: true }).isVisible()) await page.getByRole("button", { name: "Close Marketplace", exact: true }).click();
  for (const [width, height] of [[1280, 800], [1920, 1080]]) {
    await app.evaluate(({ BrowserWindow }, [w,h]) => BrowserWindow.getAllWindows()[0].setSize(w,h), [width,height]);
    await page.getByRole("button", { name: "Latest ↓", exact: true }).click();
    const boxes = await page.evaluate(() => {
      const thread = document.querySelector(".chat-thread-scroll")!.getBoundingClientRect();
      const input = document.querySelector("#followup")!.getBoundingClientRect();
      return { bottom: thread.bottom, inputTop: input.top, inputBottom: input.bottom, height: innerHeight, overflow: document.documentElement.scrollWidth > innerWidth };
    });
    expect(boxes.bottom).toBeLessThanOrEqual(boxes.inputTop);
    expect(boxes.inputBottom).toBeLessThanOrEqual(boxes.height);
    expect(boxes.overflow).toBe(false);
    await page.screenshot({ path: info.outputPath(`desktop-${width}.png`) });
  }
  await clean();
  await expect(page.getByRole("alert")).toHaveCount(0);
});
