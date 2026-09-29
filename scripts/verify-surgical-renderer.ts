import fs from "node:fs";
import path from "node:path";
import express from "express";
import { chromium, expect } from "@playwright/test";
import { createApp } from "../src/server/app";
import { GenerationStore } from "../src/generation/store";
import {
  focusFlow,
  questionFlow,
  browseFlow,
} from "../tests/browser/surgical-ux-flows";
const output = path.resolve(
  process.argv[2] ?? "docs/results/surgical-ux/renderer2",
);
fs.mkdirSync(output, { recursive: true });
const data = path.resolve(".forge/surgical-renderer-projects");
const store = new GenerationStore(data);
const liveDir = ".forge/surgical-ux-native/native1/projects";
const p = fs
  .readdirSync(liveDir)
  .filter((n) => n.endsWith(".json"))
  .map((n) => JSON.parse(fs.readFileSync(path.join(liveDir, n), "utf8")))
  .find((p) => p.assetDiscovery);
store.save(p);
const unavailable = async (): Promise<never> => {
  throw Error("Offline verification");
};
const app = createApp(data, {
  env: {},
  marketplaceProvider: {
    studios: async () => [],
    search: unavailable,
    metadata: unavailable,
    snapshot: unavailable,
  },
});
app.use(express.static(".forge/surgical-renderer-web"));
app.get("/{*path}", (_req, res) =>
  res.sendFile(path.resolve(".forge/surgical-renderer-web/index.html")),
);
const server = app.listen(0, "127.0.0.1");
await new Promise<void>((r) => server.once("listening", r));
const origin = "http://127.0.0.1:" + (server.address() as any).port;
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1200, height: 800 },
});
const page = await context.newPage();
try {
  await page.route("**/api/status", (r) =>
    r.fulfill({
      json: {
        studios: [],
        assetChoices: true,
        concepts: true,
        studioConnectionGate: false,
      },
    }),
  );
  await page.goto(origin + "/?project=" + p.id);
  await page
    .getByRole("button", { name: "Preview & choose assets", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Choose assets", exact: true })
    .getByRole("button", { name: "Preview", exact: true })
    .first()
    .click();
  const preview = page.getByRole("dialog", {
    name: "Training Dummy",
    exact: true,
  });
  await expect
    .poll(async () =>
      Number(await preview.locator("canvas").getAttribute("data-triangles")),
    )
    .toBeGreaterThan(0);
  await page.screenshot({ path: path.join(output, "real-dummy-geometry.png") });
  const geometry = {
    triangles: await preview.locator("canvas").getAttribute("data-triangles"),
    camera: await preview.locator("canvas").getAttribute("data-camera"),
  };
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await focusFlow(page, origin);
  await questionFlow(page, origin, path.join(output, "question.png"));
  await page.setViewportSize({ width: 1000, height: 520 });
  await browseFlow(page, origin, path.join(output, "short-preview.png"));
  fs.writeFileSync(
    path.join(output, "report.json"),
    JSON.stringify(
      { passed: true, geometry, offline: true, paidCalls: 0 },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
  await new Promise<void>((r) => server.close(() => r()));
}
