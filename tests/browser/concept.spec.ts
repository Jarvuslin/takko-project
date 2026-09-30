import { proposalDraftSchema } from "../../src/generation/proposal";
import { expect, test } from "./workspace-fixture";
import { newProject } from "../../src/generation/store";
import { assessConcept } from "../../src/generation/concept";
import { conceptProposalFixture } from "../concept.fixture";
import recorded from "../fixtures/asset-picking/real-proposal.json" with { type: "json" };
const { hash, revision, changed, ...recordedDraft } = recorded.proposal;
const savedProposal = { ...proposalDraftSchema.parse(recordedDraft), hash, revision };

for (const unresolved of [false, true]) test(`legacy concept ${unresolved ? "with unresolved choices" : "ready"} opens the conversation and prepares a proposal`, async ({ page }) => {
  const p = newProject(recorded.request, 2e6);
  p.concept = assessConcept(conceptProposalFixture(unresolved), p);
  const calls: string[] = [];
  await page.route("**/api/projects", r => r.fulfill({ json: [p] }));
  await page.route("**/api/projects/" + p.id + "**", r => {
    const action = new URL(r.request().url()).pathname.split("/")[4];
    if (action === "studio-operations") return r.fulfill({ json: [] });
    if (r.request().method() === "POST") {
      calls.push(action);
      if (action === "proposal") p.proposal = { ...structuredClone(savedProposal), changed: [] };
    }
    return r.fulfill({ json: p });
  });
  await page.goto("/?project=" + p.id);
  await expect(page.getByLabel("Message", { exact: true })).toBeEditable();
  await expect(page.getByRole("button", { name: "Approve brief", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Prepare proposal from saved conversation", exact: true }).click();
  await expect(page.getByRole("button", { name: "Prepare proposal from saved conversation", exact: true })).toHaveCount(0);
  expect(calls).toEqual(["proposal"]);
  await page.reload();
  await expect(page.getByLabel("Message", { exact: true })).toBeEditable();
});

test("completed work updates the conversation without another sidebar scan", async ({ page }) => {
  const p = newProject(recorded.request, 2e6);
  let reads = 0, lists = 0;
  await page.route("**/api/projects", r => { lists++; return r.fulfill({ json: [p] }); });
  await page.route("**/api/projects/" + p.id, r => {
    reads++;
    return r.fulfill({ json: reads === 1 ? { ...p, jobId: p.id, stage: "planning" } : { ...p, name: "Completed proposal", proposal: recorded.proposal } });
  });
  await page.goto("/?project=" + p.id);
  await expect.poll(() => reads).toBeGreaterThan(1);
  await page.getByTitle("Projects", { exact: true }).click();
  await expect(page.getByRole("navigation", { name: "Projects", exact: true }).getByRole("button", { name: "Completed proposal", exact: true })).toBeVisible();
  expect(lists).toBe(1);
});
