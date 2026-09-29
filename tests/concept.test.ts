import { afterEach, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Server } from "node:http";
import { createApp } from "../src/server/app";
import { Engine } from "../src/generation/engine";
import { GenerationStore } from "../src/generation/store";
import { conceptSchema, assessConcept } from "../src/generation/concept";
import { fakeTransport, profile } from "./generation-fixtures";
import { conceptFixture, conceptProposalFixture } from "./concept.fixture";
import liveConcept from "./fixtures/concept-live-overlong.json";
import fiveStepConcept from "./fixtures/concept-live-five-steps.json";

const directories: string[] = [],
  servers: Server[] = [];
async function setup(
  options: {
    output?: (context: any) => unknown;
    delay?: number;
    budget?: number;
  } = {},
) {
  const calls: { body: any; context: any }[] = [];
  const fallback = fakeTransport();
  const transport: typeof fetch = async (url, init) => {
    const body = JSON.parse(String(init?.body));
    const context = JSON.parse(
      body.messages[1].content.split(
        "\nYour last response failed validation.",
      )[0],
    );
    calls.push({ body, context });
    if (context.kind !== "concept") return fallback(url, init);
    if (options.delay) await new Promise((r) => setTimeout(r, options.delay));
    if (init?.signal?.aborted) throw Error("Generation cancelled");
    return Response.json({
      choices: [
        {
          finish_reason: "stop",
          message: {
            content: JSON.stringify(
              options.output
                ? options.output(context)
                : conceptProposalFixture(
                    !context.answers.play_style,
                    context.answers,
                  ),
            ),
          },
        },
      ],
      usage: { prompt_tokens: 100, completion_tokens: 200 },
    });
  };
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-concept-"));
  directories.push(dir);
  const app = createApp(dir, { transport, env: {} });
  const model = profile();
  app.locals.config.save({
    profiles: [model],
    routes: { planner: [model.id], builder: [], reviewer: [], repair: [] },
    budgetMicros: 2e6,
    generationBudgetMicros: options.budget ?? 100000,
    repairLimit: 0,
  });
  const server = app.listen(0, "127.0.0.1");
  servers.push(server);
  await new Promise<void>((r) => server.once("listening", r));
  const base =
    "http://127.0.0.1:" + (server.address() as { port: number }).port;
  return {
    calls,
    dir,
    app,
    engine: app.locals.engine as Engine,
    api: (route: string, method = "GET", body?: unknown) =>
      fetch(base + "/api" + route, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
  };
}
afterEach(async () => {
  for (const server of servers.splice(0))
    await new Promise<void>((r) => server.close(() => r()));
  for (const dir of directories.splice(0)) {
    if (
      path.dirname(path.resolve(dir)) !== path.resolve(os.tmpdir()) ||
      !path.basename(dir).startsWith("takko-concept-")
    )
      throw Error("Unexpected test cleanup path");
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

it("exposes the concept API and makes only a bounded planner call before any full plan", async () => {
  const { api, engine, calls, app } = await setup();
  app.locals.config.save({
    ...app.locals.config.read(),
    researchEnabled: true,
  });
  expect((await (await api("/status")).json()).concepts).toBe(true);
  const p = engine.create("Make a pet game with rescue and trading");
  const response = await api(`/projects/${p.id}/concept`, "POST", {
    revision: p.revision,
  });
  expect(response.status).toBe(202);
  const saved = await engine.wait(p.id);
  expect(saved.concept).toEqual(assessConcept(conceptProposalFixture(), p));
  expect(saved.stage).toBe("clarification");
  expect(saved.spec).toBeNull();
  expect(saved.artifact).toBeNull();
  expect(calls).toHaveLength(1);
  expect(calls[0].body.max_tokens).toBe(2048);
  const advertised = JSON.parse(
    calls[0].body.messages[0].content.split("OUTPUT SCHEMA: ")[1],
  );
  expect(advertised.properties.firstPlaytest).toBeDefined();
  expect(advertised.properties.tasks).toBeUndefined();
  expect(calls[0].context.userSources[0].text).toBe(p.request);
  expect(saved.charges).toHaveLength(1);
  expect(saved.charges[0].chargedMicros).toBe(500);
  expect(saved.reservedMicros).toBe(0);
});

it("honors the configured reasoning and output allowance during concept generation", async () => {
  const { engine, calls, app } = await setup();
  const settings = app.locals.config.read();
  app.locals.config.save({
    ...settings,
    profiles: settings.profiles.map((model: any) => ({
      ...model,
      maxOutputTokens: 32768,
    })),
  });
  const project = engine.create(
    "A fighting practice game with animations and a dummy",
  );
  engine.start(project.id, 1, "concept");
  const saved = await engine.wait(project.id);
  expect(saved.error).toBeNull();
  expect(calls[0].body.max_tokens).toBe(32768);
  expect(saved.charges).toHaveLength(1);
});

it("stores paired player actions and outcomes without model-generated step references", async () => {
  const { engine, calls } = await setup({
    output: () => ({
      ...conceptProposalFixture(false),
      firstPlaytest: {
        goal: "Hit a practice dummy and see the hit count change.",
        actions: [
          {
            action: "Walk up to the dummy.",
            expected: "The player reaches the dummy.",
          },
          {
            action: "Punch the dummy once.",
            expected: "The hit counter increases from zero to one.",
          },
        ],
        expected: "One landed punch produces one counted hit.",
      },
    }),
  });
  const project = engine.create(
    "A fist-fighting practice game with a dummy and hit counter",
  );
  engine.start(project.id, 1, "concept");
  const saved = await engine.wait(project.id);
  expect(saved.error).toBeNull();
  expect(saved.concept?.firstPlaytest.steps).toEqual([
    "Walk up to the dummy.",
    "Punch the dummy once.",
  ]);
  expect(saved.concept?.firstPlaytest.checks).toEqual([
    { step: 1, expected: "The player reaches the dummy." },
    { step: 2, expected: "The hit counter increases from zero to one." },
  ]);
  expect(saved.concept?.readiness).toBe("review");
  const advertised = JSON.parse(
    calls[0].body.messages[0].content.split("OUTPUT SCHEMA: ")[1],
  );
  expect(
    advertised.properties.firstPlaytest.properties.actions.items.required,
  ).toEqual(["action", "expected"]);
  expect(advertised.properties.firstPlaytest.properties.checks).toBeUndefined();
  expect(calls).toHaveLength(1);
});

it("rejects a paired action with a missing outcome instead of inventing one", async () => {
  const { engine, calls } = await setup({
    output: () => ({
      ...conceptProposalFixture(false),
      firstPlaytest: {
        goal: "Test fighting",
        actions: [{ action: "Punch once" }],
        expected: "A hit is counted",
      },
    }),
  });
  const project = engine.create("A fighting game");
  engine.start(project.id, 1, "concept");
  const saved = await engine.wait(project.id);
  expect(saved.stage).toBe("failed");
  expect(saved.concept).toBeNull();
  expect(saved.error).toContain("expected");
  expect(calls).toHaveLength(1);
});

it("blocks full planning and approval while concept choices remain, without more calls", async () => {
  const { engine, api, calls } = await setup();
  const p = engine.create("Make a pet rescue game");
  engine.start(p.id, 1, "concept");
  await engine.wait(p.id);
  const blocked = await api(`/projects/${p.id}/plan`, "POST", { revision: 1 });
  expect(blocked.status).toBe(409);
  expect(() => engine.approve(p.id, 1)).toThrow("Plan the request");
  expect(calls).toHaveLength(1);
});

it.each([
  "A relaxed search",
  "Choose a sensible default for me.",
  "A cooperative search where friends carry pets together",
])(
  "preserves the answer and question, shares the allowance, then hands the concept to the planner: %s",
  async (answer) => {
    const { engine, calls, dir, api } = await setup();
    let p = engine.create("Make a pet game with rescue and trading");
    engine.start(p.id, 1, "concept");
    p = await engine.wait(p.id);
    const cycle = p.generation!.id;
    const revision = await api(`/projects/${p.id}`, "PATCH", {
      revision: 1,
      request: p.request,
      answers: { play_style: answer },
      assetAttachments: [],
    });
    expect(revision.status).toBe(200);
    p = await revision.json();
    expect(p.concept?.revision).toBe(1);
    expect(p.answerQuestions?.play_style).toBe(
      "How should rescuing pets feel?",
    );
    engine.start(p.id, p.revision, "concept");
    p = await engine.wait(p.id);
    expect(p.generation!.id).toBe(cycle);
    expect(p.generation!.chargeStart).toBe(0);
    expect(p.concept?.questions).toEqual([]);
    expect(calls[1].context.answers.play_style).toBe(answer);
    expect(calls[1].context.answerQuestions.play_style).toBe(
      "How should rescuing pets feel?",
    );
    expect(new GenerationStore(dir).get(p.id).concept).toEqual(p.concept);
    engine.start(p.id, p.revision, "plan");
    const planned = await engine.wait(p.id);
    expect(planned.stage, planned.error ?? undefined).toBe("review");
    expect(planned.generation!.id).toBe(cycle);
    expect(planned.charges).toHaveLength(4);
    expect(calls[2].context.proposedConcept).toEqual(p.concept);
    expect(calls[2].context.userSources).toContainEqual({
      id: "answer:play_style",
      text: answer,
      answerId: "play_style",
    });
    expect(planned.approvedRevision).toBeNull();
    expect(engine.approve(p.id, p.revision).approvedRevision).toBe(p.revision);
  },
);

it("retains a clear concept at its original revision and invalidates approval on request revision", async () => {
  const { engine } = await setup({
    output: () => conceptProposalFixture(false),
  });
  let p = engine.create("Choose everything for a relaxed pet rescue game");
  engine.start(p.id, 1, "concept");
  p = await engine.wait(p.id);
  expect(p.stage).toBe("draft");
  expect(p.concept?.questions).toHaveLength(0);
  p = engine.revise(p.id, 1, "Make a racing game instead", {});
  expect(p.concept?.revision).toBe(1);
  expect(p.approvedRevision).toBeNull();
  expect(() => engine.start(p.id, 1, "concept")).toThrow();
});

it("supports coordinated planning without a preceding concept", async () => {
  const { engine, calls } = await setup();
  const p = engine.create("Make a small pet rescue game");
  engine.start(p.id, 1, "plan");
  const saved = await engine.wait(p.id);
  expect(saved.stage, saved.error ?? undefined).toBe("review");
  expect(saved.concept).toBeUndefined();
  expect(calls[0].context.conceptAuthority).toBeUndefined();
  expect(calls.map((call) => call.context.coordination.step)).toEqual([
    "outline",
    "area",
  ]);
});

it("rejects malformed concepts and repeated answered choices without producing a plan", async () => {
  const { engine, calls } = await setup({ output: () => conceptFixture() });
  let p = engine.create("Make a small pet rescue game");
  p = engine.revise(p.id, 1, p.request, { play_style: "A relaxed search" });
  engine.start(p.id, p.revision, "concept");
  const saved = await engine.wait(p.id);
  expect(saved.stage).toBe("failed");
  expect(saved.concept).toBeNull();
  expect(saved.spec).toBeNull();
  expect(calls).toHaveLength(1);
  expect(saved.charges).toHaveLength(1);
  expect(
    conceptSchema.safeParse({ ...conceptFixture(), tasks: [] }).success,
  ).toBe(false);
  const q = conceptFixture().questions[0];
  expect(
    conceptSchema.safeParse({ ...conceptFixture(), questions: [q, q] }).success,
  ).toBe(false);
  expect(
    conceptSchema.safeParse({ ...conceptFixture(), questions: [q, q, q, q] })
      .success,
  ).toBe(false);
});

it("accepts the saved live clarification without spending a correction attempt on its display length", async () => {
  // Exact parsed output from the failed 2026-09-20 live trial. No live request.
  expect(liveConcept.playerExperience.length).toBe(522);
  expect(liveConcept.visualDirection.length).toBe(531);
  const { engine, calls } = await setup({ output: () => liveConcept });
  let p = engine.create(
    "A relaxed solo pet rescue game with shelter care, coins and unlockable forest paths. No combat or offline decay.",
  );
  engine.start(p.id, p.revision, "concept");
  p = await engine.wait(p.id);
  expect(p.stage).toBe("clarification");
  expect(p.concept).toMatchObject({
    ...liveConcept,
    questions:expect.arrayContaining([expect.objectContaining({prompt:expect.stringContaining("no active mini-game")})]),
    revision: p.revision,
    readiness: "needs_choices",
  });
  expect(calls).toHaveLength(1);
  expect(p.charges).toHaveLength(1);
  expect(() => engine.start(p.id, p.revision, "plan")).not.toThrow();
  await engine.wait(p.id);
  expect(p.concept?.playerExperience).toBe(liveConcept.playerExperience);
  for (const field of ["playerExperience", "visualDirection"])
    expect(
      conceptSchema.safeParse({ ...liveConcept, [field]: "x".repeat(1001) })
        .success,
    ).toBe(false);
});

it("retains a five-step live response without a paid format correction and still bounds oversized guides", async () => {
  // Exact failed live response. Acceptance verifies structure, not its novice usability.
  expect(fiveStepConcept.firstPlaytest.steps).toHaveLength(5);
  const { engine, calls } = await setup({ output: () => fiveStepConcept });
  const p = engine.create(
    "A relaxed solo pet rescue game with coins and forest paths",
  );
  engine.start(p.id, p.revision, "concept");
  const saved = await engine.wait(p.id);
  expect(saved.stage).toBe("clarification");
  expect(saved.concept?.firstPlaytest.steps).toEqual(
    fiveStepConcept.firstPlaytest.steps,
  );
  expect(saved.spec).toBeNull();
  expect(calls).toHaveLength(1);
  expect(saved.charges).toHaveLength(1);
  for (const steps of [
    [],
    Array(9).fill("Walk to the shelter"),
    ["x".repeat(501)],
  ])
    expect(
      conceptSchema.safeParse({
        ...fiveStepConcept,
        firstPlaytest: { ...fiveStepConcept.firstPlaytest, steps },
      }).success,
    ).toBe(false);
});

it("does not call a provider when the concept reservation exceeds the allowance", async () => {
  const { engine, calls } = await setup({ budget: 1000 });
  const p = engine.create("Make a small pet rescue game");
  engine.start(p.id, 1, "concept");
  const saved = await engine.wait(p.id);
  expect(saved.stage).toBe("failed");
  expect(saved.error).toMatch(/budget/i);
  expect(calls).toHaveLength(0);
  expect(saved.reservedMicros).toBe(0);
});

it("cancels concept work and rejects overlapping mutations", async () => {
  const { engine } = await setup({ delay: 60 });
  const p = engine.create("Make a small pet rescue game");
  engine.start(p.id, 1, "concept");
  expect(() => engine.start(p.id, 1, "concept")).toThrow();
  expect(() => engine.revise(p.id, 1, p.request, {})).toThrow();
  engine.cancel(p.id);
  const saved = await engine.wait(p.id);
  expect(saved.stage).toBe("interrupted");
  expect(saved.jobId).toBeNull();
  expect(saved.concept).toBeNull();
  expect(saved.reservedMicros).toBe(0);
});
