import { test, expect } from "./workspace-fixture";
import fs from "node:fs";
import { proposalQuestions } from "../../src/generation/proposal-questions";
import { focusFlow, browseFlow } from "./surgical-ux-flows";
test("pointer and keyboard focus use different shared treatments", async ({
  page,
}) => {
  await focusFlow(page);
});
test("paged browsing preserves scroll, chooses from preview and releases its renderer in a short window", async ({
  page,
}, info) => {
  await page.setViewportSize({
    width: 1000,
    height: 520,
  });
  await browseFlow(
    page,
    "",
    `test-artifacts/surgical-ux/short-preview-${info.project.name}.png`,
  );
});
test("long proposal questions keep editing and next actions reachable in a short desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 600 });
  const p = JSON.parse(fs.readFileSync("docs/results/question-modal-20260928/live-project-before.json", "utf8"));
  p.clarificationQuestions = proposalQuestions(p);
  p.clarificationQuestions[0].prompt = "Which details should guide your training yard? ".repeat(12);
  await page.route("**/api/status", r => r.fulfill({ json: { studios: [], proposals: true, assetChoices: false, studioConnectionGate: false } }));
  await page.route("**/api/projects", r => r.fulfill({ json: [p] }));
  await page.route("**/api/projects/" + p.id + "**", r => r.fulfill({ json: r.request().url().endsWith("studio-operations") ? [] : p }));
  await page.goto("/?project=" + p.id);
  const q = page.getByRole("region", { name: "Current question", exact: true });
  await q.getByRole("radio", { name: "Other", exact: true }).check();
  const answer = q.getByRole("textbox", { name: "Your answer", exact: true });
  await answer.fill("Custom training detail. ".repeat(100));
  await answer.scrollIntoViewIfNeeded();
  await expect(answer).toBeInViewport();
  const next = q.getByRole("button", { name: "Next", exact: true });
  await next.scrollIntoViewIfNeeded();
  await expect(next).toBeInViewport();
  await next.click();
  await expect(q).toContainText("Question 2 of");
});
