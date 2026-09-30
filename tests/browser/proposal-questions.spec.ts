import fs from "node:fs";
import { test, expect } from "./workspace-fixture";
import { proposalQuestions } from "../../src/generation/proposal-questions";
import { structuredQuestionSchema } from "../../src/generation/questions";

test("unanswered proposal questions offer displayed defaults without an extra approval gate", async ({
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
  await expect(page.getByRole("region", { name: "Current question", exact: true })).toBeVisible();
  await expect.poll(() => connectionChecks).toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("region",{name:"Assets for this game",exact:true})).toBeVisible();
  await expect(page.getByRole("button",{name:"Approve & build",exact:true})).toBeEnabled();
  await expect(page.getByRole("region",{name:"Assets for this game",exact:true})).toContainText("recommended option for unanswered choices");
  expect(searches).toBe(0);
});

test("real saved proposal questions support sequential inline choices, Other and free answers", async ({
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
  const dialog = page.getByRole("region", { name: "Current question", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("radio")).toHaveCount(4);
  await expect(dialog.getByText("· Recommended", { exact: true })).toHaveCount(
    1,
  );
  await page.screenshot({
    path: `test-artifacts/question-modal-20260928/modal-${info.project.name}.png`,
    fullPage: true,
  });
  expect(approvals).toBe(0);
  await dialog.getByRole("radio", { name: "Other", exact: true }).check();
  await dialog.getByLabel("Your answer").fill("A distinct choice typed inline.");
  await expect(dialog.getByLabel("Your answer")).toHaveValue("A distinct choice typed inline.");
  for (let i = 0; i < questions.length; i++) {
    await expect(dialog).toContainText(`Question ${i + 1} of ${questions.length}`);
    if (i === 1) {
      await dialog.getByRole("button", { name: "Back", exact: true }).click();
      await expect(dialog.getByRole("radio").first()).toBeChecked();
      await dialog.getByRole("button", { name: "Next", exact: true }).click();
    }
    await dialog.getByRole("radio").first().check();
    await dialog
      .getByRole("button", {
        name: i === questions.length - 1 ? "Save answer" : "Next",
        exact: true,
      })
      .click();
  }
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
