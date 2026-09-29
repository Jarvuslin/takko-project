import { test, expect } from "./workspace-fixture";
import { polishFixture } from "./ui-polish-fixture";
import { focusFlow, questionFlow, browseFlow } from "./surgical-ux-flows";
test("pointer and keyboard focus use different shared treatments", async ({
  page,
}) => {
  await focusFlow(page);
});
test("Question opens, preserves Back choices and custom answers, and leaves a compact receipt", async ({
  page,
}, info) => {
  await questionFlow(
    page,
    "",
    `docs/results/surgical-ux/question-${info.project.name}.png`,
  );
});
test("paged browsing preserves scroll, chooses from preview and releases its renderer in a short window", async ({
  page,
}, info) => {
  await page.setViewportSize({
    width: info.project.name === "mobile" ? 390 : 1000,
    height: 520,
  });
  await browseFlow(
    page,
    "",
    `docs/results/surgical-ux/short-preview-${info.project.name}.png`,
  );
});
test("long structured questions scroll while their actions remain reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 860, height: 440 });
  const f = await polishFixture(page);
  f.project().concept!.questions[0].prompt =
    "Which details should guide your training yard? ".repeat(12);
  f.project().concept!.questions[0].options = Array.from(
    { length: 20 },
    (_, i) => `Training detail ${i + 1}`,
  );
  await page.goto("/?project=" + f.id);
  const q = page.getByRole("dialog", { name: "Question", exact: true });
  await q
    .getByRole("radio", { name: "Training detail 20", exact: true })
    .check();
  await q
    .getByLabel("Your answer", { exact: true })
    .fill("Custom training detail. ".repeat(100));
  await expect(q.getByLabel("Your answer", { exact: true })).toBeInViewport();
  await expect(
    q.getByRole("button", { name: "Next", exact: true }),
  ).toBeInViewport();
  await q.getByRole("button", { name: "Next", exact: true }).click();
  await expect(q).toContainText("Which feedback matters most?");
});
