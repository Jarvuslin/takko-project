import fs from "node:fs";
import { test, expect } from "./workspace-fixture";
import { proposalQuestions } from "../../src/generation/proposal-questions";
import { structuredQuestionSchema } from "../../src/generation/questions";

test("unanswered proposal questions pause automatic Marketplace work even with a connected Studio", async ({
  page,
}) => {
  const p = JSON.parse(
    fs.readFileSync(
      "docs/results/question-modal-20260928/live-project-before.json",
      "utf8",
    ),
  );
  p.clarificationQuestions = proposalQuestions(p);
  delete p.assetDiscovery;
  let searches = 0,
    connectionChecks = 0;
  await page.route("**/api/status", (r) =>
    r.fulfill({
      json: {
        studios: [],
        proposals: true,
        concepts: true,
        assetChoices: true,
        studioConnectionGate: false,
      },
    }),
  );
  await page.route("**/api/marketplace/studios", (r) => {
    connectionChecks++;
    return r.fulfill({
      json: { studios: [{ id: "offline-studio", name: "Offline studio" }] },
    });
  });
  await page.route("**/api/projects", (r) => r.fulfill({ json: [p] }));
  await page.route(`**/api/projects/${p.id}{,/**}`, (r) => {
    const action = new URL(r.request().url()).pathname.split("/")[4];
    if (action === "asset-options") searches++;
    return r.fulfill({ json: action === "studio-operations" ? [] : p });
  });
  await page.goto(`/?project=${p.id}`);
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect.poll(() => connectionChecks).toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Preview & choose assets", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Find assets", exact: true }),
  ).toBeVisible();
  expect(searches).toBe(0);
});

test("real saved proposal questions support review, Other, closing, keyboard and free answers", async ({
  page,
}, info) => {
  const p = JSON.parse(
    fs.readFileSync(
      "docs/results/question-modal-20260928/live-project-before.json",
      "utf8",
    ),
  );
  const questions = proposalQuestions(p).map((q) =>
    structuredQuestionSchema.parse({
      ...q,
      fallback: false,
      options: [
        q.options[0],
        {
          id: "expand",
          label: "Expand this mechanic",
          description: "Ask the planner to extend this specific behavior.",
        },
        {
          id: "replace",
          label: "Choose a different approach",
          description:
            "Ask the planner for a replacement for this part of the game.",
        },
      ],
    }),
  );
  p.clarificationQuestions = questions;
  let writes = 0,
    approvals = 0;
  await page.route("**/api/status", (r) =>
    r.fulfill({
      json: {
        studios: [],
        proposals: true,
        concepts: true,
        assetChoices: false,
        studioConnectionGate: false,
      },
    }),
  );
  await page.route("**/api/projects", (r) => r.fulfill({ json: [p] }));
  await page.route(`**/api/projects/${p.id}{,/**}`, async (r) => {
    const action = new URL(r.request().url()).pathname.split("/")[4];
    if (action === "studio-operations") return r.fulfill({ json: [] });
    if (action === "approve-proposal") approvals++;
    if (r.request().method() === "PATCH") {
      writes++;
      p.answers = r.request().postDataJSON().answers;
      p.clarificationQuestions = [];
      p.revision++;
      for (const id of ["mechanics", "theme", "environment"])
        p.proposal[id].unresolved = [];
    }
    await r.fulfill({ json: p });
  });
  await page.goto(`/?project=${p.id}`);
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("radio")).toHaveCount(4);
  await expect(dialog.getByText("· Recommended", { exact: true })).toHaveCount(
    1,
  );
  await page.screenshot({
    path: `test-artifacts/question-modal-20260928/modal-${info.project.name}.png`,
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  const gate = page.getByRole("button", {
    name: `Answer ${questions.length} questions first`,
  });
  await expect(gate).toBeVisible();
  await gate.click();
  await expect(dialog).toBeVisible();
  expect(approvals).toBe(0);
  const close = dialog.getByRole("button", {
    name: "Close dialog",
    exact: true,
  });
  await close.focus();
  await page.keyboard.press("Shift+Tab");
  expect(
    await dialog.evaluate((el) => el.contains(document.activeElement)),
  ).toBe(true);
  await dialog.getByRole("radio", { name: "Other", exact: true }).check();
  await dialog
    .getByLabel("Your answer")
    .fill("A distinct choice that should survive closing.");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: `${questions.length} questions need answers` })
    .click();
  await expect(dialog.getByLabel("Your answer")).toHaveValue(
    "A distinct choice that should survive closing.",
  );
  for (let i = 0; i < questions.length; i++) {
    await expect(dialog).toHaveAccessibleName(
      `Question ${i + 1} of ${questions.length}`,
    );
    await dialog.getByRole("radio").first().check();
    await dialog
      .getByRole("button", {
        name: i === questions.length - 1 ? "Review answers" : "Next",
        exact: true,
      })
      .click();
  }
  await expect(dialog).toHaveAccessibleName("Review your answers");
  await expect(dialog).toContainText("without a model call");
  await dialog.getByRole("button", { name: "Back", exact: true }).click();
  await expect(dialog).toHaveAccessibleName(
    `Question ${questions.length} of ${questions.length}`,
  );
  await dialog
    .getByRole("button", { name: "Review answers", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Submit answers", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Approve & build", exact: true }),
  ).toBeVisible();
  expect(writes).toBe(1);
  expect(approvals).toBe(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
