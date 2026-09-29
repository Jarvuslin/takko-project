import fs from "node:fs";
import { test, expect } from "./workspace-fixture";
test("build approval reports pending work and rejection beside the button", async ({
  page,
}) => {
  const p = JSON.parse(
    fs.readFileSync(
      "docs/results/approval-stall-20260928/project-stopped.json",
      "utf8",
    ),
  );
  p.clarificationQuestions = [];
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
  let release: () => void = () => {};
  const gate = new Promise<void>((r) => (release = r));
  await page.route(`**/api/projects/${p.id}{,/**}`, async (r) => {
    const action = new URL(r.request().url()).pathname.split("/")[4];
    if (action === "approve-proposal") {
      await gate;
      return r.fulfill({
        status: 400,
        json: {
          error: "Choose an option or Find later for every asset group.",
        },
      });
    }
    return r.fulfill({ json: action === "studio-operations" ? [] : p });
  });
  await page.goto(`/?project=${p.id}`);
  const proposal = page.getByRole("region", { name: "Game proposal" });
  await expect(
    proposal.getByText(/Before building, choose an asset or Find later/),
  ).toBeVisible();
  await proposal
    .getByRole("button", { name: "Approve & build", exact: true })
    .click();
  try {
    await expect(
      proposal.getByRole("button", { name: "Checking build approval…" }),
    ).toBeDisabled();
  } finally {
    release();
  }
  await expect(
    proposal
      .getByRole("alert")
      .filter({
        hasText: "Build did not start: Choose an option or Find later",
      }),
  ).toBeVisible();
  await expect(
    proposal.getByRole("button", { name: "Approve & build", exact: true }),
  ).toBeEnabled();
});
