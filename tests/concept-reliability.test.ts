import { afterEach, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Engine } from "../src/generation/engine";
import { Configuration } from "../src/generation/settings";
import { GenerationStore } from "../src/generation/store";
import * as providers from "../src/generation/providers";
import { profile } from "./generation-fixtures";
import { conceptFixture, conceptProposalFixture } from "./concept.fixture";

const dirs: string[] = [];
function setup(reply: unknown, policy?: any, transport?: typeof fetch) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-concept-policy-"));
  dirs.push(dir);
  const model = profile();
  const config = new Configuration(path.join(dir, "config"));
  config.save({
    profiles: [model],
    routes: { planner: [model.id], builder: [], reviewer: [], repair: [] },
    budgetMicros: 2e6,
    repairLimit: 0,
  });
  const calls: any[] = [];
  const store = new GenerationStore(dir);
  const engine = new (Engine as any)(
    store,
    config,
    async (url: any, init: any) => {
      if (init?.body) calls.push(JSON.parse(init.body));
      if (transport) return transport(url, init);
      return Response.json({
        choices: [
          {
            finish_reason: "stop",
            message: { content: JSON.stringify(reply) },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 200 },
      });
    },
    undefined,
    undefined,
    policy,
  ) as Engine;
  return { engine, store, calls, config, model };
}
afterEach(() => {
  for (const dir of dirs.splice(0)) {
    if (
      path.dirname(path.resolve(dir)) !== path.resolve(os.tmpdir()) ||
      !path.basename(dir).startsWith("takko-concept-policy-")
    )
      throw Error("Unsafe cleanup");
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
it("stops invalid concepts after one dispatch and retains the actual field error", async () => {
  const { engine, calls } = setup({ ...conceptFixture(false), title: "" });
  const p = engine.create("Build a rescue game");
  engine.start(p.id, 1, "concept");
  const saved = await engine.wait(p.id);
  expect(calls).toHaveLength(1);
  expect(saved.error).toMatch(/title/);
  expect(saved.error).not.toMatch(/connection/);
  expect(saved.charges).toHaveLength(1);
});
it("honors a one-attempt policy for planning independently of repairLimit", async () => {
  const { engine, calls } = setup(
    {},
    { maxAttempts: 1, allowFallbacks: false },
  );
  const p = engine.create("Build a racing game");
  engine.start(p.id, 1, "plan");
  const saved = await engine.wait(p.id);
  expect(calls).toHaveLength(1);
  expect(saved.stage).toBe("failed");
  expect(saved.failure?.attempts).toBe(1);
});
it.each([undefined, 4])(
  "bounds real planner corrections at the explicit policy or default: %s",
  async (maxAttempts) => {
    const replies = [1, 2].map((i) =>
      JSON.parse(
        fs.readFileSync(
          `tests/fixtures/regression/planner-recovery/planner-output-${i}.json`,
          "utf8",
        ),
      ),
    );
    let count = 0;
    const { engine, calls } = setup(
      null,
      { ...(maxAttempts ? { maxAttempts } : {}), allowFallbacks: false },
      async () =>
        Response.json({
          choices: [
            {
              finish_reason: "stop",
              message: { content: JSON.stringify(replies[count++ % 2]) },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 200 },
        }),
    );
    const p = engine.create("A game from the preserved planner contract");
    engine.start(p.id, 1, "plan");
    const saved = await engine.wait(p.id);
    expect(calls).toHaveLength(maxAttempts ?? 2);
    expect(saved.failure?.attempts).toBe(maxAttempts ?? 2);
    expect(saved.charges).toHaveLength(maxAttempts ?? 2);
    expect(saved.reservedMicros).toBe(0);
    if (maxAttempts === 4)
      expect(calls[2].messages[1].content).toContain(
        "Edge e8 connects hit_counter_state to itself",
      );
  },
);
it("runs the dispatch gate before transport and adds no charge for a known local refusal", async () => {
  const { engine, calls } = setup(conceptFixture(false), {
    beforeDispatch: () => {
      throw new (providers as any).DispatchDenied(
        "Test call allowance exhausted",
      );
    },
  });
  const p = engine.create("Build a racing game");
  engine.start(p.id, 1, "concept");
  const saved = await engine.wait(p.id);
  expect(calls).toHaveLength(0);
  expect(saved.charges).toHaveLength(0);
  expect(saved.reservedMicros).toBe(0);
  expect(saved.error).toContain("Test call allowance exhausted");
});
it("preserves conservative accounting for an uncertain network failure", async () => {
  const { engine } = setup(null, undefined, async () => {
    throw Error("socket closed");
  });
  const p = engine.create("Build a rescue game");
  engine.start(p.id, 1, "concept");
  const saved = await engine.wait(p.id);
  expect(saved.charges).toHaveLength(1);
  expect(saved.charges[0].billingSource).toBe("reservation");
  expect(saved.charges[0].chargedMicros).toBe(saved.charges[0].reservedMicros);
});
it("retains a legacy proposal for inspection but does not equate no questions with readiness", async () => {
  const legacy = conceptFixture(false);
  const { engine } = setup(legacy);
  const p = engine.create("Build a rescue game");
  engine.start(p.id, 1, "concept");
  const saved = await engine.wait(p.id);
  expect(saved.concept?.playerExperience).toBe(legacy.playerExperience);
  expect((saved.concept as any)?.readiness).toBe("needs_revision");
  expect(() => engine.start(p.id, 1, "plan")).not.toThrow();
  await engine.wait(p.id);
});
it("rejects an answered question with unchanged wording under a new ID", async () => {
  const proposal = conceptFixture();
  const question = proposal.questions[0];
  proposal.questions[0] = { ...question, id: "renamed_decision" };
  const { engine, store, calls } = setup(proposal);
  const p = engine.create("Build a rescue game");
  p.answers.play_style = "A relaxed search";
  p.answerQuestions = { play_style: question.prompt };
  store.save(p);
  engine.start(p.id, 1, "concept");
  const saved = await engine.wait(p.id);
  expect(saved.stage).toBe("failed");
  expect(saved.error).toMatch(/answered/i);
  expect(calls).toHaveLength(1);
});
it("preserves the original validation error when a later transport dispatch is denied", async () => {
  let responses = 0;
  const { engine, calls } = setup(null, { maxAttempts: 2 }, async () => {
    if (++responses === 2)
      throw new providers.DispatchDenied(
        "Run allowance exhausted before dispatch",
      );
    return Response.json({
      choices: [{ message: { content: "{}" } }],
      usage: { prompt_tokens: 1, completion_tokens: 1 },
    });
  });
  const p = engine.create("Build a racing game");
  engine.start(p.id, 1, "plan");
  const saved = await engine.wait(p.id);
  expect(calls).toHaveLength(2);
  expect(saved.charges).toHaveLength(1);
  expect(saved.reservedMicros).toBe(0);
  expect(saved.failure?.details).toContain("title");
  expect(saved.failure?.details).toContain("Run allowance exhausted");
  expect(saved.failure?.attempts).toBe(1);
});
it("requires a concrete decision for a delegated answer", async () => {
  const proposal = conceptProposalFixture(false);
  const { engine } = setup(proposal);
  let p = engine.create("Build a cozy farming game");
  p = engine.revise(p.id, 1, p.request, {
    pacing: "Choose a sensible default for me.",
  });
  engine.start(p.id, p.revision, "concept");
  const saved = await engine.wait(p.id);
  expect(saved.concept?.readiness).toBe("needs_revision");
  expect(saved.concept?.notices?.join(" ")).toContain("not been applied");
  expect(() => engine.start(p.id, p.revision, "plan")).not.toThrow();
  await engine.wait(p.id);
});
it.each([
  "unknown source",
  "duplicate answer",
  "unselected default",
  "bad step",
])("blocks inconsistent decision evidence: %s", async (kind) => {
  const proposal = conceptProposalFixture(false, {
    pacing: "Choose a sensible default for me.",
  });
  if (kind === "unknown source") proposal.decisions[0].sourceIds = ["invented"];
  if (kind === "duplicate answer")
    proposal.decisions.push(proposal.decisions[1]);
  if (kind === "unselected default")
    proposal.decisions[1].choice = "Choose a sensible default for me.";
  if (kind === "bad step") proposal.firstPlaytest.checks[1].step = 1;
  const { engine } = setup(proposal);
  let p = engine.create("Build a cozy farming game");
  p = engine.revise(p.id, 1, p.request, {
    pacing: "Choose a sensible default for me.",
  });
  engine.start(p.id, p.revision, "concept");
  const saved = await engine.wait(p.id);
  expect(saved.stage).toBe("failed");
  expect(saved.concept).toBeNull();
});
it("keeps unresolved concept advice visible without a separate planning approval", async () => {
  const proposal = {
    ...conceptProposalFixture(false),
    unresolvedIssues: ["The core game direction still needs a choice."],
  };
  const { engine } = setup(proposal);
  const p = engine.create("Make a game about exploring space");
  engine.start(p.id, 1, "concept");
  const saved = await engine.wait(p.id);
  expect(saved.concept?.readiness).toBe("needs_revision");
  expect(saved.concept?.notices).toContain(proposal.unresolvedIssues[0]);
  expect(() => engine.start(p.id, 1, "plan")).not.toThrow();
  await engine.wait(p.id);
});
it("does not require or call disabled backup profiles for a concept", async () => {
  const { engine, config, model, calls } = setup(conceptProposalFixture(false));
  const backup = {
    ...profile("openrouter"),
    baseUrl: "https://openrouter.ai/api/v1",
  };
  config.save({
    ...config.read(),
    profiles: [model, backup],
    routes: {
      planner: [model.id, backup.id],
      builder: [],
      reviewer: [],
      repair: [],
    },
  });
  const p = engine.create("Build a racing game");
  engine.start(p.id, 1, "concept");
  expect((await engine.wait(p.id)).concept?.readiness).toBe("review");
  expect(calls).toHaveLength(1);
});
it("does not bill a transport that explicitly reports no inference dispatch", async () => {
  const { engine } = setup(null, undefined, async () => {
    throw new providers.DispatchDenied("Inference was not dispatched");
  });
  const p = engine.create("Build a racing game");
  engine.start(p.id, 1, "concept");
  const saved = await engine.wait(p.id);
  expect(saved.charges).toEqual([]);
  expect(saved.failure?.attempts).toBe(0);
  expect(saved.error).toContain("Inference was not dispatched");
});
it("cancels during dispatch authorization without sending or billing inference", async () => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const { engine, calls } = setup(conceptProposalFixture(false), {
    beforeDispatch: () => gate,
  });
  const p = engine.create("Build a racing game");
  engine.start(p.id, 1, "concept");
  engine.cancel(p.id);
  release();
  const saved = await engine.wait(p.id);
  expect(saved.stage).toBe("interrupted");
  expect(calls).toHaveLength(0);
  expect(saved.charges).toHaveLength(0);
  expect(saved.reservedMicros).toBe(0);
});
it.each([true, false])(
  "checks strict endpoint support before inference and accounts for wire schema bytes: %s",
  async (supported) => {
    const proposal = conceptProposalFixture(false);
    const { engine, config, model, calls } = setup(
      null,
      undefined,
      async (_url, init) =>
        init?.method === "POST"
          ? Response.json({
              choices: [
                {
                  message: { content: JSON.stringify(proposal) },
                  finish_reason: "stop",
                },
              ],
              usage: { prompt_tokens: 100, completion_tokens: 200 },
            })
          : Response.json({
              data: {
                endpoints: [
                  {
                    tag: "anthropic",
                    supported_parameters: supported
                      ? ["structured_outputs", "response_format"]
                      : [],
                  },
                ],
              },
            }),
    );
    config.save({
      ...config.read(),
      profiles: [
        {
          ...model,
          provider: "openrouter",
          baseUrl: "https://openrouter.ai/api/v1",
          model: "anthropic/claude-haiku-4.5",
          structuredOutput: "anthropic",
        },
      ],
    });
    config.setKey(model.id, "offline-fixture");
    const p = engine.create("Build a rescue game");
    engine.start(p.id, 1, "concept");
    const saved = await engine.wait(p.id);
    if (!supported) {
      expect(calls).toHaveLength(0);
      expect(saved.charges).toHaveLength(0);
      expect(saved.failure?.attempts).toBe(0);
      return;
    }
    expect(saved.concept?.readiness).toBe("review");
    expect(calls).toHaveLength(1);
    const body = calls[0];
    expect(body.messages[0].content).not.toContain("OUTPUT SCHEMA:");
    const input =
      Buffer.byteLength(body.messages.map((m: any) => m.content).join("")) +
      Buffer.byteLength(
        JSON.stringify(body.response_format.json_schema.schema),
      ) +
      1024;
    expect(saved.charges[0].reservedMicros).toBe(
      input * model.inputRate + model.maxOutputTokens * model.outputRate,
    );
  },
);
