import fs from "node:fs";
import { test, expect } from "./workspace-fixture";
import { randomUUID } from "node:crypto";
import { tsImport } from "tsx/esm/api";
const { specification, fixtureBundle } = (await tsImport(
  "../generation-fixtures.ts",
  import.meta.url,
)) as typeof import("../generation-fixtures");
const { stepRetry } = (await tsImport(
  "../../src/generation/retry.ts",
  import.meta.url,
)) as typeof import("../../src/generation/retry");
const states = [
  "Ready",
  "Working",
  "Needs you",
  "Checking assets",
  "Building",
  "Ready to test",
  "Failed",
  "Stopped",
] as const;
for (const state of states)
  test(`chat state ${state} keeps header and composer visible`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    const p = JSON.parse(
      fs.readFileSync(
        "tests/fixtures/chat-recovery/failed-project.json",
        "utf8",
      ),
    );
    p.clarificationQuestions = [];
    p.jobId = null;
    if (state === "Ready") {
      p.proposal = undefined;
      p.coordination = undefined;
      p.stage = "draft";
      p.error = null;
    }
    if (state === "Needs you") {
      p.stage = "draft";
      p.proposal.approval = undefined;
      p.error = null;
    }
    if (["Working", "Building", "Checking assets"].includes(state)) {
      p.jobId = randomUUID();
      p.stage = state === "Working" ? "planning" : "generating";
      p.error = null;
    }
    if (state === "Checking assets")
      p.assetPipeline = { status: "running", entries: [] };
    if (["Building", "Ready to test"].includes(state)) {
      p.spec = specification(p.request, p.scope);
      p.artifact = fixtureBundle(p.request, p.scope);
      p.completedBuildTasks = [];
    }
    if (state === "Ready to test") {
      p.stage = "ready_to_test";
      p.staleImplementation = false;
      p.checks = [];
      p.error = null;
    }
    if (state === "Stopped") p.stage = "interrupted";
    let stops = 0;
    await page.route("**/api/status", (r) =>
      r.fulfill({
        json: {
          studios: [],
          proposals: true,
          assetChoices: false,
          studioConnectionGate: false,
        },
      }),
    );
    await page.route("**/api/projects", (r) => r.fulfill({ json: [p] }));
    await page.route(`**/api/projects/${p.id}{,/**}`, (r) => {
      const action = new URL(r.request().url()).pathname.split("/")[4];
      if (action === "cancel") {
        stops++;
        p.jobId = null;
        p.stage = "interrupted";
      }
      if (action === "queued-messages" && r.request().url().endsWith("/cancel")) {
        p.queuedMessages[0].status = "cancelled";
        p.conversation.find((t: { id: string }) => t.id === p.queuedMessages[0].id).status = "cancelled";
      }
      return r.fulfill({
        json:
          action === "studio-operations"
            ? []
            : action === "retry-quote"
              ? (stepRetry(p) ?? null)
              : p,
      });
    });
    await page.goto(`/?project=${p.id}`);
    const strip = page.getByRole("region", { name: "Chat status" });
    await expect(strip).toHaveAttribute("data-state", state);
    await expect(strip).toBeInViewport();
    await expect(page.getByLabel("Message", { exact: true })).toBeEditable();
    if (["Ready to test", "Failed", "Stopped"].includes(state)) {
      const end = page.getByRole("region", { name: state, exact: true });
      await expect(end).toBeVisible();
      if (state === "Ready to test")
        await expect(
          end.getByRole("link", { name: "Export place" }),
        ).toBeVisible();
      else
        await expect(
          end.getByText("Technical details", { exact: true }),
        ).toBeVisible();
    }
    await page.screenshot({
      path: `test-artifacts/chat-part4/real-${state.toLowerCase().replaceAll(" ", "-")}.png`,
    });
    await page
      .locator(".chat-thread-scroll")
      .evaluate((el) => (el.scrollTop = el.scrollHeight));
    const bounds = await page.locator(".chat-thread-scroll").boundingBox();
    const composer = await page.locator(".chat-composer").boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(composer!.y + 1);
    expect(composer!.y + composer!.height).toBeLessThanOrEqual(1000);
    if (state === "Failed") {
      const { queueReceipt, markQueued } = (await tsImport("../../src/generation/message-queue.ts", import.meta.url)) as typeof import("../../src/generation/message-queue");
      const retry = page.getByRole("button", { name: /Retry from this step/ });
      await expect(retry).toBeVisible();
      queueReceipt(p, { id: randomUUID(), hash: "test", text: "Make it louder", revision: p.revision, jobId: randomUUID(), at: new Date().toISOString(), status: "queued" });
      markQueued(p, "held", "Work stopped. Review and continue explicitly.");
      const remove = page.getByRole("button", { name: /Remove queued change/ });
      await expect(remove).toBeVisible();
      await expect(retry).toHaveCount(0);
      await remove.click();
      await expect(retry).toBeVisible();
    }
    if (state === "Building") {
      await strip.getByRole("button", { name: "Stop", exact: true }).click();
      expect(stops).toBe(1);
    }
    if (state === "Working") {
      await page
        .getByRole("button", { name: "Stop build", exact: true })
        .click();
      expect(stops).toBe(1);
    }
  });
test("new conversation shows Ready and its preset before the first message", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Chat status" })).toHaveAttribute("data-state", "Ready");
  await page.getByLabel("Game idea").fill("A stationary dummy punching game");
  await page.screenshot({ path: "test-artifacts/chat-part4/real-compose.png" });
  await page.locator(".new-chat-status .chat-preset").click();
  await expect(page).toHaveURL(/#models/);
});
