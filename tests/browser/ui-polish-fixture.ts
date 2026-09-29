import type { Page } from "@playwright/test";
import { newProject } from "../../src/generation/store";
import { recordConversation } from "../../src/generation/conversation";
import { conceptProposalFixture } from "../concept.fixture";
import { specification } from "../generation-fixtures";

export function createPolishProject(
  mode: "multiple" | "simple" | "build" = "multiple",
) {
  let p = newProject(
    "UI QA: Practice punches and kicks in a training yard. Offline fixture.",
    2e6,
  );
  const proposal = conceptProposalFixture();
  p.concept = {
    ...proposal,
    revision: 1,
    readiness: "needs_choices",
    title: "Practice arena",
    playerExperience:
      "Practice punches and kicks on a training dummy. Land a combo and see clear feedback.",
    visualDirection: "Bright, stylized training yard.",
    assumptions: [],
    decisions: [],
    firstPlaytest: {
      goal: "Land a hit and see the dummy react.",
      steps: ["Walk to the dummy.", "Land a punch."],
      expected: "A visible hit reaction.",
      checks: [
        { step: 1, expected: "Movement works." },
        { step: 2, expected: "The dummy reacts." },
      ],
    },
    questions:
      mode === "simple"
        ? [{ id: "rig", prompt: "Use R6 or R15?", options: ["R6", "R15"] }]
        : [
            {
              id: "combat",
              prompt: "What combat style should the player use?",
              options: ["Fists only", "Fists + kicks", "Weapons"],
            },
            {
              id: "feedback",
              prompt: "Which feedback matters most?",
              options: ["Impact sounds", "Hit effects", "Combo meter"],
              selection: "multiple",
            },
            {
              id: "look",
              prompt: "Anything else about the training yard?",
              options: [],
              selection: "text",
              optional: true,
            },
          ],
  };
  p.conceptQuestions = Object.fromEntries(
    p.concept.questions.map((q) => [q.id, q.prompt]),
  );
  p.answerQuestions = p.conceptQuestions;
  p.stage = "clarification";
  recordConversation(p);
  if (mode === "build") {
    p.concept = null;
    p.spec = specification(p.request, p.scope);
    p.stage = "review";
    p.completedBuildTasks = [p.spec.tasks[0].id];
    p.architecture = {
      nodes: [
        {
          id: "combat",
          name: "Combat",
          purpose: "Validate hits",
          authority: "server",
          x: 40,
          y: 50,
        },
        {
          id: "energy",
          name: "Energy",
          purpose: "Store energy",
          authority: "server",
          x: 320,
          y: 50,
        },
      ],
      edges: [
        {
          id: "hit",
          from: "combat",
          to: "energy",
          kind: "event",
          event: "Hit confirmed",
          effect: "Add ten energy",
        },
      ],
    };
  }
  return p;
}

export async function polishFixture(
  page: Page,
  mode: "multiple" | "simple" | "build" = "multiple",
) {
  let p = createPolishProject(mode);
  const calls: string[] = [];
  let preferences = {};
  await page.route("**/api/ui-preferences", async (r) => {
    if (r.request().method() === "PUT")
      preferences = r.request().postDataJSON();
    await r.fulfill({ json: preferences });
  });
  await page.route("**/api/status", (r) =>
    r.fulfill({ json: { concepts: true, studios: [] } }),
  );
  await page.route("**/api/projects", (r) =>
    r.fulfill({ json: [{ id: p.id, name: p.name, stage: p.stage }] }),
  );
  await page.route(
    (url) => url.pathname.startsWith(`/api/projects/${p.id}`),
    async (r) => {
      const action = new URL(r.request().url()).pathname.split("/")[4];
      if (action === "studio-operations") return r.fulfill({ json: [] });
      if (r.request().method() !== "GET") {
        calls.push(action ?? r.request().method());
        const before = structuredClone(p);
        const body = r.request().postDataJSON();
        if (r.request().method() === "PATCH") {
          p = { ...p, answers: body.answers, revision: p.revision + 1 };
          recordConversation(p, before);
        }
        if (action === "concept")
          p = {
            ...p,
            concept: {
              ...p.concept!,
              revision: p.revision,
              questions: [],
              readiness: "review",
              decisions: [
                {
                  questionId: "combat",
                  topic: "Combat",
                  choice: p.answers.combat ?? p.answers.rig,
                  sourceIds: ["answer:combat"],
                },
              ],
              unresolvedIssues: [],
            },
            stage: "draft",
          };
      }
      await r.fulfill({ json: p });
    },
  );
  return { id: p.id, calls, project: () => p };
}
