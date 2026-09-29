import { test, expect, type Page } from "./workspace-fixture";
function refreshProposal(p: any, _changed?: string[]) {
  p.proposal.hash = "offline-proposal-hash-" + p.revision;
  p.proposal.revision = p.revision;
}
test("a prompt submitted before the first status poll still prepares its proposal", async ({
  page,
}) => {
  let p: any;
  let release!: () => void;
  const created = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/status", async (route) => {
    await created;
    await route.fulfill({
      json: {
        studios: [],
        proposals: true,
        concepts: true,
        assetChoices: false,
        studioConnectionGate: false,
      },
    });
  });
  await page.route("**/api/projects", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    const response = await route.fetch();
    p = await response.json();
    release();
    return route.fulfill({ response, json: p });
  });
  await page.route("**/api/projects/*/proposal", async (route) => {
    const section = { text: "Saved content", assumptions: [], unresolved: [] };
    p.proposal = {
      title: "Prompt proposal",
      revision: p.revision,
      hash: "fixture",
      changed: [],
      mechanics: section,
      theme: section,
      environment: section,
    };
    await route.fulfill({ json: p });
  });
  await page.goto("/");
  await page.getByLabel("Game idea").fill("Build a wind gliding game");
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Game proposal" }),
  ).toContainText("Prompt proposal");
});

async function fixture(page: Page, fail = false) {
  let p = await (
    await page.request.post("/api/projects", {
      data: { request: "Build a gliding game" },
    })
  ).json();
  const section = (text: string) => ({ text, assumptions: [], unresolved: [] });
  p.proposal = {
    title: "Wind islands",
    revision: 1,
    hash: "",
    changed: [],
    mechanics: section("Glide and collect energy"),
    theme: section("Warm sunrise"),
    environment: section("Three islands around the spawn"),
  };
  p.assetDiscovery = {
    id: crypto.randomUUID(),
    revision: 1,
    studioId: "",
    groups: [
      {
        id: "animation",
        label: "Glide animation",
        query: "glide",
        kind: "Model",
        preview: "animation",
        options: [],
      },
    ],
    choices: { animation: { skip: true } },
    approved: true,
  };
  refreshProposal(p);
  let sent = 0,
    approvals = 0;
  await page.route(`**/api/projects/${p.id}{,/**}`, async (route) => {
    const action = new URL(route.request().url()).pathname.split("/")[4];
    if (action === "studio-operations") return route.fulfill({ json: [] });
    if (route.request().method() === "POST") {
      const b = route.request().postDataJSON();
      if (action === "messages") {
        sent++;
        if (fail) {
          p.error = "The edit failed. Previous proposal retained.";
          p.stage = "failed";
          p.pendingProposalEdit = {
            id: b.id,
            text: b.text,
            baseRevision: p.revision,
            baseHash: p.proposal.hash,
          };
        } else {
          p.revision++;
          p.proposal.theme.text = "Snowy winter";
          p.proposal.summary = "Updated theme only";
          p.conversation.push({
            id: b.id,
            kind: "user",
            text: b.text,
            revision: p.revision,
            at: new Date().toISOString(),
          });
          p.assetDiscovery.revision = p.revision;
          refreshProposal(p, ["theme"]);
        }
      }
      if (action === "approve-proposal") {
        expect(b.hash).toBe(p.proposal.hash);
        approvals++;
        p.proposal.approval = {
          hash: b.hash,
          revision: p.revision,
          at: new Date().toISOString(),
        };
      }
    }
    return route.fulfill({ json: p });
  });
  await page.goto("/?project=" + p.id);
  return { project: p, counts: () => ({ sent, approvals }) };
}
test("partial builds visibly retain unmet requirements alongside available code", async ({
  page,
}) => {
  const { project: p } = await fixture(page);
  p.stage = "ready_to_test";
  p.artifact = {
    files: [],
    scene: [],
    assets: [],
    coverage: [
      {
        requirementId: "glideMotion",
        status: "blocked",
        detail:
          "Selected animation acquisition failed. No replacement was approved.",
        files: [],
      },
    ],
  };
  await page.reload();
  const gap = page.getByRole("status", { name: "Unmet requirements" });
  await expect(gap).toContainText("Build has unmet requirements");
  await expect(gap).toContainText("Selected animation acquisition failed");
});
test("persistent proposal exposes one build approval and preserves untouched sections after chat", async ({
  page,
}) => {
  const f = await fixture(page);
  const proposal = page.getByRole("region", { name: "Game proposal" });
  await expect(proposal).toContainText("Warm sunrise");
  await expect(
    page.getByRole("button", { name: "Approve brief", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Approve specification", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Change theme to winter");
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .press("Enter");
  await expect(proposal).toContainText("Snowy winter");
  await expect(proposal).toContainText("Glide and collect energy");
  await expect(proposal).toContainText("Three islands around the spawn");
  await expect(
    page.getByRole("textbox", { name: "Message", exact: true }),
  ).toHaveValue("");
  await page
    .getByRole("button", { name: "Approve & build", exact: true })
    .click();
  await expect(proposal).toContainText("Proposal approved");
  expect(f.counts()).toEqual({ sent: 1, approvals: 1 });
  await page.screenshot({
    path: `test-artifacts/conversation-planning/proposal-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.reload();
  await expect(
    page.getByRole("region", { name: "Game proposal" }),
  ).toContainText("Snowy winter");
});
test("a failed edit retains the visible proposal and unsent request", async ({
  page,
}) => {
  await fixture(page, true);
  const message = page.getByRole("textbox", { name: "Message", exact: true });
  await message.fill("Change theme to winter");
  await message.press("Enter");
  await expect(
    page.getByRole("region", { name: "Game proposal" }),
  ).toContainText("Warm sunrise");
  await expect(
    page.getByRole("button", { name: "Discard pending edit" }),
  ).toBeVisible();
  await expect(message).toHaveValue("Change theme to winter");
  await page.reload();
  await expect(message).toHaveValue("Change theme to winter");
});
