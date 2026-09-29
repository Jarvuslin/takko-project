import { expect, test, type Page } from "./workspace-fixture";
import AxeBuilder from "@axe-core/playwright";
import { conceptFixture, conceptProposalFixture } from "../concept.fixture";
import { assessConcept } from "../../src/generation/concept";
import { specification } from "../generation-fixtures";

async function setup(page: Page) {
  let p = await (
    await page.request.post("/api/projects", {
      data: { request: "Make a pet rescue game with trading" },
    })
  ).json();
  const calls: { action: string; body: any }[] = [];
  await page.route(
    (url) =>
      url.pathname === `/api/projects/${p.id}` ||
      url.pathname.startsWith(`/api/projects/${p.id}/`),
    async (route) => {
      const req = route.request();
      const action = new URL(req.url()).pathname.split("/")[4] ?? "project";
      if (action === "studio-operations") return route.fulfill({ json: [] });
      if (req.method() !== "GET") {
        const body = req.postDataJSON();
        calls.push({ action, body });
        if (req.method() === "PATCH")
          p = {
            ...p,
            request: body.request,
            answers: body.answers,
            revision: p.revision + 1,
            concept: null,
            spec: null,
          };
        if (action === "concept")
          p = {
            ...p,
            concept: assessConcept(
              conceptProposalFixture(!p.answers.play_style, p.answers),
              p,
            ),
            stage: p.answers.play_style ? "draft" : "clarification",
          };
        if (action === "plan")
          p = {
            ...p,
            spec: specification(p.request, p.scope),
            stage: "review",
          };
        if (action === "approve-brief")
          p = { ...p, briefApprovedRevision: p.revision };
      }
      await route.fulfill({ json: p });
    },
  );
  await page.goto("/?project=" + p.id);
  return { calls };
}

test("concept choices, explicit delegation, reload and planning handoff", async ({
  page,
}, info) => {
  const { calls } = await setup(page);
  await page
    .getByRole("button", { name: "Shape my idea", exact: true })
    .click();
  const card = page.getByRole("region", { name: "Your game concept" });
  await expect(card).toBeVisible();
  await expect(
    card.getByRole("button", { name: "Update my concept", exact: true }),
  ).toBeDisabled();
  await expect(card.getByRole("button", { name: "Approve brief" })).toHaveCount(
    0,
  );
  await card
    .getByRole("radio", { name: "A relaxed search", exact: true })
    .click();
  await expect(
    card.getByRole("radio", { name: "A relaxed search", exact: true }),
  ).toBeChecked();
  await card
    .getByRole("button", { name: "Choose for me", exact: true })
    .click();
  await expect(
    card.getByRole("button", { name: "Choose for me", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(calls.map((c) => c.action)).toEqual(["concept"]);
  await card.screenshot({
    path: `test-artifacts/concept-choices-${info.project.name}.png`,
  });
  expect(
    (await new AxeBuilder({ page }).include(".game-concept").analyze())
      .violations,
  ).toEqual([]);
  await card
    .getByRole("button", { name: "Update my concept", exact: true })
    .click();
  expect(calls.find((c) => c.action === "project")?.body.answers).toEqual({
    play_style: "Choose a sensible default for me.",
  });
  await expect(
    card.getByRole("button", { name: "Approve brief" }),
  ).toBeEnabled();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Tiny pet rescue" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Approve brief" }).click();
  await expect(
    page.getByText("Brief approved. Preview and choose assets below."),
  ).toBeVisible();
  expect(calls.filter((c) => c.action === "approve-brief")).toHaveLength(1);
  expect(calls.filter((c) => c.action === "plan")).toHaveLength(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("custom answers are retained and edited requests cannot use a stale concept", async ({
  page,
}) => {
  const { calls } = await setup(page);
  await page
    .getByRole("button", { name: "Shape my idea", exact: true })
    .click();
  await page.getByRole("button", { name: "Other…", exact: true }).click();
  await page.getByLabel("Your answer").fill("Friends carry pets together");
  await page
    .getByRole("button", { name: "Update my concept", exact: true })
    .click();
  expect(
    calls.find((c) => c.action === "project")?.body.answers.play_style,
  ).toBe("Friends carry pets together");
  await page.getByText("Edit original brief", { exact: true }).click();
  await page
    .getByLabel("Project request", { exact: true })
    .fill("Make a cooperative pet rescue game");
  await expect(
    page.getByRole("button", { name: "Approve brief" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Update concept from request", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Approve brief" }),
  ).toBeEnabled();
  expect(calls.filter((c) => c.action === "project").at(-1)?.body.request).toBe(
    "Make a cooperative pet rescue game",
  );
  expect(calls.filter((c) => c.action === "plan")).toHaveLength(0);
});

test("older running servers retain direct planning without offering an unavailable action", async ({
  page,
}) => {
  await page.route("**/api/status", (route) =>
    route.fulfill({
      json: { mode: "multi-model", configured: true, studios: [] },
    }),
  );
  await setup(page);
  await expect(
    page.getByRole("button", { name: "Plan this game" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Shape my idea", exact: true }),
  ).toHaveCount(0);
});

test("a completed concept appears without waiting for another library scan", async ({
  page,
}) => {
  const p = await (
    await page.request.post("/api/projects", {
      data: { request: "Make a pet rescue game" },
    })
  ).json();
  let reads = 0,
    listReads = 0;
  await page.route("**/api/projects", (route) => {
    listReads++;
    // A failed sidebar refresh must not hide already completed project work.
    return listReads > 1
      ? route.abort()
      : route.fulfill({
          json: [{ id: p.id, name: p.name, stage: "planning" }],
        });
  });
  await page.route("**/api/projects/" + p.id, (route) => {
    reads++;
    return route.fulfill({
      json:
        reads === 1
          ? { ...p, jobId: p.id, stage: "planning" }
          : {
              ...p,
              name: "Tiny pet rescue",
              concept: assessConcept(conceptProposalFixture(false), p),
            },
    });
  });
  await page.goto("/?project=" + p.id);
  await expect(
    page.getByRole("button", { name: "Approve brief" }),
  ).toBeEnabled();
  {
    await page.getByTitle("Projects", { exact: true }).click();
    await expect(
      page
        .getByRole("navigation", { name: "Projects", exact: true })
        .getByRole("button", { name: "Tiny pet rescue", exact: true }),
    ).toBeVisible();
  }
  expect(listReads).toBe(1);
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("legacy and unresolved concepts remain inspectable without a planning action", async ({
  page,
}) => {
  const p = await (
    await page.request.post("/api/projects", {
      data: { request: "Make a game about a space station" },
    })
  ).json();
  let unresolved = false;
  await page.route("**/api/projects/" + p.id, (route) =>
    route.fulfill({
      json: {
        ...p,
        concept: unresolved
          ? assessConcept(
              {
                ...conceptProposalFixture(false),
                unresolvedIssues: [
                  "Choose whether the station focuses on trading or exploration.",
                ],
              },
              p,
            )
          : { ...conceptFixture(false), revision: p.revision },
      },
    }),
  );
  await page.goto("/?project=" + p.id);
  await expect(
    page.getByText("This saved concept needs an update before planning."),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve brief" })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("button", { name: "Update my concept", exact: true }),
  ).toBeEnabled();
  unresolved = true;
  await page.reload();
  await expect(
    page.getByText(
      "Choose whether the station focuses on trading or exploration.",
    ),
  ).toBeVisible();
  await expect(
    page.getByText("Choices to review", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve brief" })).toHaveCount(
    0,
  );
});
