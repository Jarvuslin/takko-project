import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, expect, it } from "vitest";
import { Engine } from "../src/generation/engine";
import { GenerationStore } from "../src/generation/store";
import { Configuration } from "../src/generation/settings";
import { scopeQuestionId } from "../src/generation/scope-questions";
import type { Project } from "../src/generation/schema";
import {
  structuredQuestionSchema,
  optionAnswer,
} from "../src/generation/questions";
import { proposalQuestions } from "../src/generation/proposal-questions";
import { refreshProposal } from "../src/generation/proposal";
import { createApp } from "../src/server/app";
import { profile } from "./generation-fixtures";
const dirs: string[] = [];
afterEach(() =>
  dirs.splice(0).forEach((d) => fs.rmSync(d, { recursive: true, force: true })),
);
const real = () =>
  JSON.parse(
    fs.readFileSync(
      "docs/results/question-modal-20260928/live-project-before.json",
      "utf8",
    ),
  ) as Project;
it("falls back safely when a legacy dependency cannot offer keep or has a maximum-length prompt", () => {
  const p = real(),
    source = "x".repeat(600);
  p.proposal!.theme.unresolved.push(source);
  const q = proposalQuestions(p).find((q) => q.source === source)!;
  expect(structuredQuestionSchema.safeParse(q).success).toBe(true);
  p.proposal!.questions = [
    {
      ...q,
      options: [
        {
          id: "keep",
          label: "Keep",
          description: "Invalid dependency resolution",
        },
        q.options[1],
      ],
      recommendedOptionId: "keep",
    },
  ];
  const safe = proposalQuestions(p).find((q) => q.source === source)!;
  expect(safe.fallback).toBe(true);
  expect(safe.recommendedOptionId).toBe("resolve");
  expect(structuredQuestionSchema.safeParse(safe).success).toBe(true);
});
it("saves a keep answer on the real live proposal without losing its other questions or spending", () => {
  const p = real(),
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-questions-"));
  dirs.push(dir);
  const store = new GenerationStore(dir),
    engine = new Engine(store, new Configuration(path.join(dir, "config")));
  store.save(p);
  const question = p.proposal!.mechanics.unresolved[0],
    id = scopeQuestionId(question);
  const next = engine.revise(p.id, p.revision, p.request, {
    ...p.answers,
    [id]: "Keep these limits",
  });
  expect(next.answers[id]).toBe("Keep these limits");
  expect(next.proposal!.mechanics.unresolved).toEqual(
    p.proposal!.mechanics.unresolved.filter((q) => q !== question),
  );
  expect(next.charges).toEqual(p.charges);
  expect(next.generation).toEqual(p.generation);
  expect(next.proposal!.mechanics.text).toBe(p.proposal!.mechanics.text);
  expect(next.assetDiscovery).toMatchObject({
    choices: p.assetDiscovery?.choices ?? {},
  });
});
it("migrates both real saved proposals with stable IDs and marked fallback choices", () => {
  for (const p of [
    real(),
    JSON.parse(
      fs.readFileSync(
        "docs/results/approved-reference-finish-20260927/terminal-project.json",
        "utf8",
      ),
    ),
  ]) {
    const before = JSON.stringify(p),
      questions = proposalQuestions(p);
    expect(questions.length).toBeGreaterThan(0);
    for (const q of questions) {
      expect(structuredQuestionSchema.safeParse(q).success).toBe(true);
      expect(q.id).toBe(scopeQuestionId(q.source!));
      expect(q.fallback).toBe(true);
    }
    expect(JSON.stringify(p)).toBe(before);
  }
});
it("validates recommendations and unique options rather than accepting an unusable modal", () => {
  const q = proposalQuestions(real())[0];
  expect(
    structuredQuestionSchema.safeParse({ ...q, recommendedOptionId: "absent" })
      .success,
  ).toBe(false);
  expect(
    structuredQuestionSchema.safeParse({
      ...q,
      options: [q.options[0], q.options[0]],
    }).success,
  ).toBe(false);
  expect(
    structuredQuestionSchema.safeParse({ ...q, options: [q.options[0]] })
      .success,
  ).toBe(false);
  expect(optionAnswer(q, "keep")).toBe("Keep these limits");
});
for (const invalid of [false, true])
  it(`PATCH uses planner output for a combo and ${invalid ? "retains the old proposal when slots are missing" : "commits per-step slots while retaining other assets"}`, async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-question-api-"));
    dirs.push(dir);
    let calls = 0;
    const searches: string[] = [];
    const noNative = async () => { throw Error("Offline evidence unavailable"); };
    const transport: typeof fetch = async (_url, init) => {
      calls++;
      const body = JSON.parse(String(init?.body)),
        context = JSON.parse(
          body.messages[1].content.split(
            "\nYour last response failed validation.",
          )[0],
        );
      expect(context.kind).toBe("proposal-edit");
      const needs = context.proposal.assetNeeds;
      const animation = needs.find((n: any) => n.kind === "Animation");
      const output = {
        baseRevision: context.edit.baseRevision,
        baseHash: context.edit.baseHash,
        changes: [
          {
            id: "mechanics",
            value: {
              ...context.proposal.mechanics,
              text:
                context.proposal.mechanics.text +
                "\nUse a 2-hit combo, jab then cross.",
            },
          },
        ],
        assetNeeds: invalid
          ? needs
          : [
              ...needs.filter((n: any) => n.kind !== "Animation"),
              ...[1, 2].map((step) => ({
                ...animation,
                id: animation.id + "_" + step,
                sequence: { id: "punch_combo", step, total: 2 },
              })),
            ],
        summary: "Applied the chosen combo.",
      };
      return Response.json({
        choices: [
          {
            finish_reason: "stop",
            message: { content: JSON.stringify(output) },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 200 },
      });
    };
    const app = createApp(dir, {
      env: {},
      transport,
      marketplaceProvider: {
        studios: async () => [],
        search: async (_studio, query) => { searches.push(query); return []; },
        metadata: noNative,
        snapshot: noNative,
      },
      executionPolicy: { maxAttempts: 1, allowFallbacks: false },
    });
    const model = profile();
    app.locals.config.save({
      profiles: [model],
      routes: {
        planner: [model.id],
        builder: [model.id],
        reviewer: [model.id],
        repair: [],
      },
      budgetMicros: 8000000,
      generationBudgetMicros: 8000000,
      repairLimit: 0,
    });
    const engine = app.locals.engine as Engine,
      p = real();
    engine.store.save(p);
    const server = app.listen(0, "127.0.0.1");
    await new Promise<void>((r) => server.once("listening", r));
    const base = `http://127.0.0.1:${(server.address() as any).port}/api/projects/${p.id}`;
    try {
      const get = await (await fetch(base)).json();
      expect(get.clarificationQuestions).toEqual(proposalQuestions(p));
      const blocked = await fetch(base + "/approve-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revision: p.revision, hash: p.proposal!.hash }),
      });
      expect(blocked.status).toBe(409);
      expect(calls).toBe(0);
      const q = get.clarificationQuestions.find((q: any) =>
        q.source.includes("no combo"),
      );
      const response = await fetch(base, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revision: p.revision,
          request: p.request,
          answers: { ...p.answers, [q.id]: "2-hit combo: jab then cross" },
        }),
      });
      expect(response.status).toBe(200);
      const next = await engine.wait(p.id);
      expect(calls).toBe(1);
      expect(next.generation?.budgetMicros).toBe(p.generation?.budgetMicros);
      expect(next.charges.slice(0, p.charges.length)).toEqual(p.charges);
      expect(next.artifact).toEqual(p.artifact);
      if (invalid) {
        expect(next.error).toMatch(/individually selectable|Animation/);
        expect(next.proposal).toEqual(p.proposal);
        expect(next.answers).toEqual(p.answers);
      } else {
        expect(next.error).toBeNull();
        expect(next.answers[q.id]).toContain("2-hit combo");
        expect(next.answerQuestions?.[q.id]).toBe(q.source);
        expect(proposalQuestions(next).some((x) => x.id === q.id)).toBe(false);
        expect(
          next
            .proposal!.assetNeeds!.filter((n) => n.kind === "Animation")
            .map((n) => n.sequence?.step),
        ).toEqual([1, 2]);
        expect(next.assetDiscovery?.groups.filter(g => g.preview === "animation").map(g => g.assetNeedId)).toEqual(
          next.proposal!.assetNeeds!.filter(n => n.kind === "Animation").map(n => n.id),
        );
        expect(next.assetDiscovery?.groups.filter(g => g.preview !== "animation")).toEqual(
          p.assetDiscovery?.groups.filter(g => g.preview !== "animation"),
        );
        expect(next.proposal!.theme).toEqual(p.proposal!.theme);
        const discovery = await fetch(base + "/asset-options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ revision: next.revision, studioId: next.assetDiscovery!.studioId }),
        });
        expect(discovery.status).toBe(200);
        expect(searches).toEqual(next.proposal!.assetNeeds!.filter(n => n.kind === "Animation").map(n => n.query));
        const discovered = await discovery.json();
        expect(discovered.assetDiscovery.groups.map((g: any) => g.id)).toEqual(next.assetDiscovery!.groups.map(g => g.id));
        expect(calls).toBe(1);
      }
    } finally {
      await new Promise<void>((r) => server.close(() => r()));
    }
  });
it("all keep answers clear the blocking questions, retain spending and survive reloading the store", () => {
  const p = real(),
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-question-reload-"));
  dirs.push(dir);
  const store = new GenerationStore(dir),
    engine = new Engine(store, new Configuration(path.join(dir, "config")));
  store.save(p);
  const answers = Object.fromEntries(
    proposalQuestions(p).map((q) => [q.id, "Keep these limits"]),
  );
  const next = engine.revise(p.id, p.revision, p.request, answers);
  expect(proposalQuestions(next)).toEqual([]);
  const reloaded = new GenerationStore(dir).get(p.id);
  expect(reloaded).toEqual(next);
  expect(reloaded.charges).toEqual(p.charges);
  expect(reloaded.generation).toEqual(p.generation);
  // Asset approval remains an independent gate. No model dispatch is attempted.
  reloaded.assetDiscovery = undefined;
  refreshProposal(reloaded);
  store.save(reloaded);
  expect(() =>
    engine.approveProposal(p.id, reloaded.revision, reloaded.proposal!.hash),
  ).toThrow(/Asset recommendations/);
});
it("a single explicit options-only planner call preserves real proposal content, assets and cumulative budget", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-question-options-"));
  dirs.push(dir);
  let calls = 0;
  const transport: typeof fetch = async (_url, init) => {
    calls++;
    const body = JSON.parse(String(init?.body)),
      c = JSON.parse(body.messages[1].content);
    expect(c.kind).toBe("question-options");
    return Response.json({
      choices: [
        {
          finish_reason: "stop",
          message: {
            content: JSON.stringify({
              questions: c.questions.map((q: any) => ({
                ...q,
                fallback: false,
                options: [
                  ...q.options,
                  {
                    id: "alternative",
                    label: "Alternative approach",
                    description:
                      "Ask for another approach to this exact behavior.",
                  },
                ],
              })),
            }),
          },
        },
      ],
      usage: { prompt_tokens: 100, completion_tokens: 200 },
    });
  };
  const store = new GenerationStore(dir),
    config = new Configuration(path.join(dir, "config")),
    model = profile();
  config.save({
    profiles: [model],
    routes: {
      planner: [model.id],
      builder: [model.id],
      reviewer: [model.id],
      repair: [],
    },
    budgetMicros: 8000000,
    generationBudgetMicros: 8000000,
    repairLimit: 0,
  });
  const engine = new Engine(store, config, transport),
    p = real();
  store.save(p);
  const next = await engine.suggestProposalQuestions(p.id, p.revision);
  expect(calls).toBe(1);
  expect(next.jobId).toBeNull();
  expect(next.answers).toEqual(p.answers);
  for (const section of ["mechanics", "theme", "environment"] as const)
    expect(next.proposal![section]).toEqual(p.proposal![section]);
  expect(next.proposal!.assetNeeds).toEqual(p.proposal!.assetNeeds);
  expect(next.generation).toEqual(p.generation);
  expect(next.charges.slice(0, p.charges.length)).toEqual(p.charges);
  expect(
    proposalQuestions(next).every((q) => q.options.length === 3 && !q.fallback),
  ).toBe(true);
});
