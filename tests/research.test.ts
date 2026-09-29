import { afterEach, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Engine } from "../src/generation/engine";
import { Configuration } from "../src/generation/settings";
import { GenerationStore } from "../src/generation/store";
import { profile, specification } from "./generation-fixtures";
import {
  evaluatePlanners,
  retryTruncatedPlannerCells,
} from "../scripts/evaluate-planners";
import {
  citationSources,
  researchInputHash,
  researchIsCurrent,
  validateResearch,
  validateReferenceDecisions,
  type Research,
} from "../src/generation/research";

const url = "https://www.roblox.com/games/109983668079237/Steal-a-Brainrot";
const research: Research = {
  referenceGame: "Steal a Brainrot",
  summary: "Acquire income-producing characters and steal rivals' characters.",
  mechanics: [
    {
      id: "steal",
      description: "Steal characters from other players",
      importance: "core",
      sourceUrls: [url],
    },
  ],
  unknowns: ["Exact balance values are not verified."],
};
const annotations = [
  {
    type: "url_citation",
    url_citation: {
      url,
      title: "Original experience",
      content: "Buy, steal, generate money, rebirth.",
    },
  },
];
const dirs: string[] = [];
afterEach(() => {
  dirs.splice(0).forEach((d) => fs.rmSync(d, { recursive: true, force: true }));
});
function setup(mode: "valid" | "forged" | "missing" = "valid", budget = 1e6) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-research-"));
  dirs.push(dir);
  const config = new Configuration(path.join(dir, "config")),
    model = {
      ...profile("openrouter"),
      baseUrl: "https://openrouter.ai/api/v1",
    };
  config.save({
    profiles: [model],
    routes: {
      planner: [model.id],
      builder: [model.id],
      reviewer: [model.id],
      repair: [model.id],
    },
    researchEnabled: true,
    budgetMicros: budget,
    repairLimit: 0,
  });
  config.setKey(model.id, "test-key");
  const phases: string[] = [];
  const transport = (async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    const phase = body.messages[0].content.includes("PHASE: research")
      ? "research"
      : "planner";
    phases.push(phase);
    const context = JSON.parse(
      body.messages[1].content.split("\nYour last response")[0],
    );
    let value: unknown = research;
    if (phase === "research") {
      expect(body.plugins[0]).toMatchObject({
        id: "web",
        engine: "exa",
        max_results: 5,
      });
      if (mode === "forged")
        value = {
          ...research,
          mechanics: [
            {
              ...research.mechanics[0],
              sourceUrls: ["https://invented.example/game"],
            },
          ],
        };
    } else {
      expect(body.plugins).toBeUndefined();
      expect(context.referenceResearch.sources[0].url).toBe(url);
      const spec = specification(context.request, context.namespace);
      // First planner drops stealing; backend must buy a correction rather than accept it.
      if (phases.filter((p) => p === "planner").length > 1)
        spec.referenceDecisions = [
          {
            mechanicId: "steal",
            action: "include",
            requirementIds: ["core"],
            reason: "Preserve the reference loop.",
          },
        ];
      value = spec;
    }
    return Response.json({
      choices: [
        {
          message: {
            content: JSON.stringify(value),
            annotations:
              phase === "research" && mode !== "missing" ? annotations : [],
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 100,
        cost: phase === "research" ? 0.01 : 0.002,
      },
    });
  }) as typeof fetch;
  const store = new GenerationStore(dir),
    engine = new Engine(store, config, transport);
  return { config, store, engine, phases, dir };
}
it("retrieves cited evidence before planning, rejects lost mechanics and reuses current evidence", async () => {
  const { engine, phases } = setup();
  let p = engine.create("Make a Steal a Brainrot style game");
  engine.start(p.id, 1, "plan");
  p = await engine.wait(p.id);
  expect(p.stage).toBe("review");
  expect(phases).toEqual(["research", "planner", "planner"]);
  expect(p.charges.reduce((s, c) => s + c.chargedMicros, 0)).toBe(14000);
  expect(p.research!.sources[0].excerpt).toContain("Buy, steal");
  engine.start(p.id, 1, "plan");
  await engine.wait(p.id);
  expect(phases.filter((p) => p === "research")).toHaveLength(1);
  p = engine.revise(p.id, 1, p.request, { change: "No stealing" });
  expect(p.research).not.toBeNull();
  expect(researchIsCurrent(p)).toBe(false);
});
it.each(["forged", "missing"] as const)(
  "does not plan using %s source citations",
  async (mode) => {
    const { engine, phases } = setup(mode);
    const p = engine.create("Make a Steal a Brainrot style game");
    engine.start(p.id, 1, "plan");
    const result = await engine.wait(p.id);
    expect(result.stage).toBe("failed");
    expect(result.spec).toBeNull();
    expect(result.research).toBeNull();
    expect(phases).toEqual(["research", "research"]);
    expect(result.failure?.phase).toBe("research");
  },
);
it("reserves search and retrieved-context costs before any paid request", async () => {
  const { engine, phases } = setup("valid", 7000);
  const p = engine.create("Make a Steal a Brainrot style game");
  engine.start(p.id, 1, "plan");
  const result = await engine.wait(p.id);
  expect(phases).toEqual([]);
  expect(result.error).toContain("budget");
});
it("requires real user provenance for omissions and invalidates changed or stale research", async () => {
  const { engine } = setup();
  let p = engine.create("Make a Steal a Brainrot game but omit stealing");
  engine.start(p.id, 1, "plan");
  p = await engine.wait(p.id);
  p.spec!.referenceDecisions = [
    {
      mechanicId: "steal",
      action: "omit",
      requirementIds: [],
      reason: "User adaptation",
      userSourceId: "request",
      userQuote: "not in request",
    },
  ];
  expect(() => validateReferenceDecisions(p.spec!, p)).toThrow("quotation");
  p.spec!.referenceDecisions[0].userQuote = "omit stealing";
  expect(() => validateReferenceDecisions(p.spec!, p)).not.toThrow();
  expect(researchIsCurrent(p)).toBe(true);
  expect(researchInputHash({ ...p, answers: { a: "changed" } })).not.toBe(
    p.research!.inputHash,
  );
  p.research!.retrievedAt = "2020-01-01";
  expect(researchIsCurrent(p)).toBe(false);
});
it("rejects unsafe citation links, duplicate mechanics, and citations invented by the model", () => {
  expect(
    citationSources([
      { type: "url_citation", url_citation: { url: "javascript:alert(1)" } },
      { type: "url_citation", url_citation: { url: "https://127.0.0.1/" } },
    ]),
  ).toEqual([]);
  expect(() =>
    validateResearch(
      {
        ...research,
        mechanics: [research.mechanics[0], research.mechanics[0]],
      },
      citationSources(annotations),
    ),
  ).toThrow("Duplicate");
});
it("keeps the comparison isolated, shares one aggregate budget and refuses to overwrite results", async () => {
  const { config, dir } = setup();
  const original = config.read();
  const transport = (async (address, init) => {
    if (String(address).endsWith("/models"))
      return Response.json({
        data: [
          "openai/gpt-4.1-mini",
          "openai/gpt-5.6-sol",
          "anthropic/claude-sonnet-5",
        ].map((id) => ({
          id,
          name: id,
          pricing: { prompt: "0.000001", completion: "0.00001" },
        })),
      });
    const body = JSON.parse(String(init?.body)),
      isResearch = !!body.plugins;
    const context = JSON.parse(body.messages[1].content);
    const spec = specification(context.request, context.namespace);
    spec.referenceDecisions = context.referenceResearch
      ? [
          {
            mechanicId: "steal",
            action: "include",
            requirementIds: ["core"],
            reason: "Keep stealing",
          },
        ]
      : [];
    return Response.json({
      choices: [
        {
          message: {
            content: JSON.stringify(isResearch ? research : spec),
            annotations: isResearch ? annotations : [],
          },
          finish_reason: "stop",
        },
      ],
      usage: { prompt_tokens: 1000, completion_tokens: 5900, cost: 0.06 },
    });
  }) as typeof fetch;
  const out = path.join(dir, "evaluation");
  const report = await evaluatePlanners(config, out, 200000, transport);
  expect(report.chargedMicros).toBeLessThanOrEqual(200000);
  expect(
    report.results.some((r: any) => /budget/i.test(r.error ?? r.skipped ?? "")),
  ).toBe(true);
  expect(config.read()).toEqual(original);
  expect(JSON.stringify(report)).not.toContain("test-key");
  await expect(
    evaluatePlanners(config, out, 200000, transport),
  ).rejects.toThrow("fresh output");
});
it("includes previous charges in expanded-output reruns and preserves original evidence", async () => {
  const { config, dir } = setup();
  const out = path.join(dir, "expanded-budget-test");
  fs.mkdirSync(out);
  const original = {
    prompt: "Build a game",
    aggregateCapMicros: 200000,
    chargedMicros: 199001,
    candidates: config.read().profiles,
    results: [
      {
        model: config.read().profiles[0].model,
        withResearch: false,
        error: "Output truncated",
      },
    ],
  };
  const raw = JSON.stringify(original);
  fs.writeFileSync(path.join(out, "report.json"), raw);
  let calls = 0;
  const report = await retryTruncatedPlannerCells(config, out, (async () => {
    calls++;
    throw Error("Budget must prevent this request");
  }) as typeof fetch);
  expect(calls).toBe(0);
  expect(report.chargedMicros).toBe(199001);
  expect(report.results).toMatchObject([
    { skipped: "Aggregate cap exhausted" },
  ]);
  expect(fs.readFileSync(path.join(out, "report.json"), "utf8")).toBe(raw);
  await expect(retryTruncatedPlannerCells(config, out)).rejects.toThrow(
    "already exist",
  );
});
