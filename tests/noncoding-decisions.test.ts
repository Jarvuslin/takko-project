import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  assetDecisionRequest,
  assessCandidatePage,
  briefDecisionRequest,
  completeDecision,
  decisionBody,
  JEV_MODEL,
  selectedCandidate,
  validateDecisionProfile,
  validateDecisionResult,
  type DecisionRequest,
} from "../src/generation/decisions";
import { Configuration } from "../src/generation/settings";
import { Engine } from "../src/generation/engine";
import { GenerationStore } from "../src/generation/store";
import {
  proposalDraftSchema,
  refreshProposal,
} from "../src/generation/proposal";
import { DispatchDenied } from "../src/generation/providers";
import { profile } from "./generation-fixtures";
import type {
  AssetCandidate,
  AssetNeed,
} from "../src/generation/asset-contract";

const model = () => ({
  ...profile("openrouter"),
  baseUrl: "https://openrouter.ai/api/v1",
  model: JEV_MODEL,
  inputRate: 0.042,
  outputRate: 0,
});
const need: AssetNeed = {
  id: "dummy",
  requirementId: "practice",
  role: "Practice dummy",
  kind: "Model",
  query: "training dummy",
  constraints: "Passive target for fist practice",
  position: [0, 0, 0],
  maxSize: 12,
  required: true,
};
const candidates: AssetCandidate[] = [
  {
    id: "123",
    name: "Training dummy",
    kind: "Model",
    description: "Stationary target model",
    creator: "Fixture",
    source: "creator_store",
    sourceUrl: "https://create.roblox.com/store/asset/123",
    price: 0,
  },
  {
    id: "456",
    name: "House",
    kind: "Model",
    description: "Decorative building",
    creator: "Fixture",
    source: "creator_store",
    sourceUrl: "https://create.roblox.com/store/asset/456",
    price: 0,
  },
];
function response(request: DecisionRequest) {
  return {
    model: "typesafe/jev-1.13-20260917",
    answers: Object.fromEntries(
      Object.entries(request.questions).map(([key, q]) => {
        const allowed =
          q.type === "choice"
            ? Object.keys(q.criteria)
            : q.criteria.map((_, i) => String(i));
        const pick = key === "next" ? "candidate_0" : allowed[0];
        return [
          key,
          {
            type: q.type,
            ...(q.type === "choice" ? { choice: pick } : { score: 0 }),
            confidence: 0.95,
            probabilities: Object.fromEntries(
              allowed.map((a) => [a, a === pick ? 1 : 0]),
            ),
          },
        ];
      }),
    ),
    usage: { input_tokens: 1000, output_tokens: 90, cost: 0.000042 },
  };
}
const request = () =>
  assetDecisionRequest("Fist practice game", need, candidates)!;
const dirs: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const d of dirs.splice(0))
    fs.rmSync(d, { recursive: true, force: true });
});
function fixture(transport?: typeof fetch, budget = 100000) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "takko-decisions-"));
  dirs.push(directory);
  const config = new Configuration(path.join(directory, "config"));
  const decision = model(),
    coding = profile();
  config.save({
    profiles: [coding, decision],
    routes: {
      planner: [coding.id],
      builder: [coding.id],
      reviewer: [coding.id],
      repair: [],
      decisions: [decision.id],
    },
    budgetMicros: budget,
    repairLimit: 0,
  });
  config.connect(decision, "fixture-connection");
  const fake = vi.fn(async (_url: unknown, init: any) =>
    Response.json(response(JSON.parse(init.body))),
  ) as typeof fetch;
  const store = new GenerationStore(directory),
    engine = new Engine(store, config, transport ?? fake);
  const p = engine.create("A fist practice game with a dummy");
  const section = { text: p.request, assumptions: [], unresolved: [] };
  p.proposal = {
    ...proposalDraftSchema.parse({
      title: "Practice",
      mechanics: section,
      theme: section,
      environment: section,
      assetNeeds: [need],
    }),
    revision: p.revision,
    hash: "",
    changed: [],
  };
  refreshProposal(p);
  p.assetDiscovery = {
    id: randomUUID(),
    revision: p.revision,
    studioId: randomUUID(),
    groups: [
      {
        id: "dummy",
        label: "Practice dummy",
        kind: "Model",
        preview: "model",
        query: "training dummy",
        options: candidates.map((c) => ({
          assetId: c.id,
          name: c.name,
          kind: c.kind,
          creatorName: c.creator,
          updated: "v1",
        })),
      },
    ],
  };
  store.save(p);
  return {
    config,
    engine,
    store,
    p,
    decision,
    coding,
    transport: transport ?? fake,
  };
}
describe("Jev Decisions transport", () => {
  it("uses the pinned endpoint, disallows redirects and preserves provider usage", async () => {
    const transport = vi.fn(async (url, init) => {
      expect(url).toBe("https://openrouter.ai/api/alpha/decisions");
      expect(init?.redirect).toBe("error");
      const body = JSON.parse(String(init?.body));
      expect(body.provider.allow_fallbacks).toBe(false);
      expect(body).not.toHaveProperty("messages");
      return Response.json(response(body));
    }) as typeof fetch;
    const result = await completeDecision(
      model(),
      "fixture",
      request(),
      new AbortController().signal,
      transport,
    );
    expect(result.costMicros).toBe(42);
    expect(result.inputTokens).toBe(1000);
    expect(selectedCandidate(JSON.parse(result.text), candidates)?.id).toBe(
      "123",
    );
  });
  it.each([
    { baseUrl: "https://evil.invalid" },
    { provider: "compatible" },
    { inputRate: 0 },
    { model: "typesafe/jev-latest" },
  ])(
    "rejects unsafe/incompatible profile %j before dispatch",
    async (change) => {
      const transport = vi.fn();
      await expect(
        completeDecision(
          { ...model(), ...change } as any,
          "fixture",
          request(),
          new AbortController().signal,
          transport,
        ),
      ).rejects.toThrow();
      expect(transport).not.toHaveBeenCalled();
    },
  );
  it("retains cost when a decision selects an unoffered ID", async () => {
    const data = response(request());
    (data.answers.next as any).choice = "invented";
    try {
      await completeDecision(
        model(),
        "fixture",
        request(),
        new AbortController().signal,
        vi.fn(async () => Response.json(data)) as typeof fetch,
      );
      throw Error("expected rejection");
    } catch (error) {
      expect((error as any).completion.costMicros).toBe(42);
    }
  });
  it("retains usage on HTTP failure and never retries", async () => {
    const fetcher = vi.fn(async () =>
      Response.json(response(request()), { status: 429 }),
    );
    await expect(
      completeDecision(
        model(),
        "fixture",
        request(),
        new AbortController().signal,
        fetcher as typeof fetch,
      ),
    ).rejects.toMatchObject({ completion: { costMicros: 42 } });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it.each([
    { input_tokens: -1, output_tokens: 10, cost: 0.000042 },
    { input_tokens: 100, output_tokens: "wrong", cost: 0.000042 },
    { input_tokens: 100, output_tokens: 10, cost: -1 },
  ])("rejects malformed billing %j", async (usage) => {
    await expect(
      completeDecision(
        model(),
        "fixture",
        request(),
        new AbortController().signal,
        vi.fn(async () =>
          Response.json({ ...response(request()), usage }),
        ) as typeof fetch,
      ),
    ).rejects.toThrow(/billing/);
  });
  it("rejects oversized inputs without trimming intent", () => {
    expect(() =>
      decisionBody({ ...request(), state: "x".repeat(20000) }),
    ).toThrow(/input limit/);
    expect(
      briefDecisionRequest({ request: "x".repeat(20000), answers: {} }),
    ).toBeNull();
  });
  it.each(["unknown_model", "bad_confidence", "bad_distribution", "extra_key"])(
    "rejects %s",
    (kind) => {
      const data: any = response(request());
      if (kind === "unknown_model") data.model = "other";
      if (kind === "bad_confidence") data.answers.next.confidence = 2;
      if (kind === "bad_distribution") data.answers.next.probabilities.none = 1;
      if (kind === "extra_key") data.answers.surprise = data.answers.next;
      expect(() =>
        validateDecisionResult(
          { model: data.model, answers: data.answers },
          request(),
        ),
      ).toThrow();
    },
  );
  it("returns no selected asset for uncertain or none decisions", () => {
    const data: any = response(request());
    data.answers.next.confidence = 0.3;
    expect(selectedCandidate(data, candidates)).toBeNull();
    data.answers.next.confidence = 1;
    data.answers.next.choice = "none";
    expect(selectedCandidate(data, candidates)).toBeNull();
  });
  it.each([
    "No fighting. I want to explore an alien language museum.",
    "Should pets rescue others or battle?",
    "Punch the dummy, play sound and particles, and increment a hit counter.",
  ])("preserves the full original brief: %s", (brief) => {
    const value = briefDecisionRequest({
      request: brief,
      answers: {},
      briefChanges: [],
    })!;
    expect((value.state as any).originalBrief).toBe(brief);
    expect(
      Object.values(value.questions).some(
        (q) => q.type === "choice" && "other" in q.criteria,
      ),
    ).toBe(true);
    expect(JSON.stringify(value)).not.toContain('"approved"');
  });
});
describe("non-coding route through the real Engine", () => {
  it("sends corrections and interpreted answers with the original asset brief", async () => {
    const f = fixture();
    f.p.request = "A fighting game using R15 animations";
    f.p.answers = { rig: "Use R6 instead" };
    f.p.answerQuestions = {
      rig: "Which character rig should the animation use?",
    };
    f.p.briefChanges = [
      {
        id: randomUUID(),
        text: "Change the game to R6. The original R15 requirement is replaced.",
        at: new Date().toISOString(),
        revision: 1,
      } as any,
    ];
    f.store.save(f.p);
    await f.engine.assessAssetChoices(f.p.id, 1);
    const sent = JSON.parse((f.transport as any).mock.calls[0][1].body);
    expect(sent.state.originalBrief).toBe(f.p.request);
    expect(sent.state.clarificationAnswers).toEqual(f.p.answers);
    expect(sent.state.clarificationQuestions).toEqual(f.p.answerQuestions);
    expect(sent.state.briefChanges).toEqual(f.p.briefChanges);
  });
  it("treats valid replies without optional confidence as uncertain", () => {
    const value: any = response(request());
    delete value.answers.next.confidence;
    delete value.answers.next.probabilities;
    const result = validateDecisionResult(
      { model: value.model, answers: value.answers },
      request(),
    );
    expect(selectedCandidate(result, candidates)).toBeNull();
  });
  it("accepts the retained native Jev score reply with its exact criterion legend", () => {
    const value = JSON.parse(
      fs.readFileSync(
        "tests/fixtures/regression/jev-noncoding-workflow/rejected-score-response.json",
        "utf8",
      ),
    );
    const page = Array.from({ length: 10 }, (_, i) => ({
      ...candidates[0],
      id: String(i),
    }));
    const request = assetDecisionRequest("Practice fighting", need, page)!;
    expect(validateDecisionResult(value, request).answers.fit_0).toMatchObject({
      type: "score",
      score: 3.98,
    });
    value.answers.fit_0.legend["0"] = "Changed criterion";
    expect(() => validateDecisionResult(value, request)).toThrow(/legend/);
  });
  it("does not recommend a partial-page winner when another batch is uncertain", async () => {
    const page = Array.from({ length: 30 }, (_, i) => ({
      ...candidates[0],
      id: String(i),
    }));
    let calls = 0;
    const selected = await assessCandidatePage(
      "Practice fighting",
      need,
      page,
      async (request) => {
        const value = response(request);
        if (++calls === 2) (value.answers.next as any).confidence = 0.2;
        return value as any;
      },
    );
    expect(calls).toBe(2);
    expect(selected).toBeNull();
  });
  it("rechecks the budget between candidate batches and keeps completed billing", async () => {
    const f = fixture(undefined, 2700);
    const template = f.p.assetDiscovery!.groups[0].options[0];
    f.p.assetDiscovery!.groups[0].options = Array.from(
      { length: 30 },
      (_, i) => ({ ...template, assetId: String(1000 + i) }),
    );
    f.store.save(f.p);
    const p = await f.engine.assessAssetChoices(f.p.id, 1);
    expect(p.charges).toHaveLength(1);
    expect(p.charges[0].chargedMicros).toBe(42);
    expect(p.assetDiscovery!.analysisError).toMatch(/budget/i);
    expect(p.assetDiscovery!.groups[0].relevance).toBeUndefined();
    expect(p.reservedMicros).toBe(0);
  });
  it("gates all 30 Creator Store candidates in bounded batches before rating", async () => {
    const f = fixture();
    const template = f.p.assetDiscovery!.groups[0].options[0];
    f.p.assetDiscovery!.groups[0].options = Array.from(
      { length: 30 },
      (_, i) => ({
        ...template,
        assetId: String(1000 + i),
        name: "Candidate " + i,
      }),
    );
    f.store.save(f.p);
    const p = await f.engine.assessAssetChoices(f.p.id, 1);
    expect(p.charges).toHaveLength(2);
    const requests = (f.transport as any).mock.calls.map((call: any[]) =>
      JSON.parse(call[1].body),
    );
    expect(
      requests
        .slice(0, 2)
        .flatMap((r: any) => r.state.candidates.map((c: any) => c.id)),
    ).toEqual(Array.from({ length: 30 }, (_, i) => String(1000 + i)));
    expect(Object.keys(requests[0].questions)).toHaveLength(16);
    expect(Object.keys(requests[1].questions)).toHaveLength(14);
    expect(p.assetDiscovery!.groups[0].options).toHaveLength(30);
    expect(p.assetDiscovery!.approved).toBeUndefined();
    expect(p.assetDiscovery!.groups[0].relevance?.candidateId).toBe("1000");
  });
  it("stops on unknown billing instead of using the answer", async () => {
    const transport = vi.fn(async (_url: any, init: any) => {
      const data: any = response(JSON.parse(init.body));
      delete data.usage;
      return Response.json(data);
    }) as typeof fetch;
    const f = fixture(transport);
    const p = await f.engine.assessAssetChoices(f.p.id, 1);
    expect(p.assetDiscovery?.groups[0].relevance).toBeUndefined();
    expect(p.assetDiscovery?.analysisError).toMatch(/billing/);
    expect(p.charges[0]).toMatchObject({
      chargedMicros: 2688,
      billingSource: "reservation",
    });
  });
  it("clears the job even when no candidate is eligible for analysis", async () => {
    const f = fixture();
    f.p.assetDiscovery!.groups[0].options = [];
    f.store.save(f.p);
    await f.engine.assessAssetChoices(f.p.id, 1);
    await expect(f.engine.assessAssetChoices(f.p.id, 1)).resolves.toMatchObject(
      { jobId: null },
    );
    expect(f.transport).not.toHaveBeenCalled();
  });
  it("rejects a late response after model routing changes", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const transport = vi.fn(async (_url: any, init: any) => {
      await gate;
      return Response.json(response(JSON.parse(init.body)));
    }) as typeof fetch;
    const f = fixture(transport),
      run = f.engine.assessAssetChoices(f.p.id, 1);
    await vi.waitFor(() => expect(transport).toHaveBeenCalledTimes(1));
    const cfg = f.config.read();
    cfg.routes.decisions = [];
    f.config.save(cfg);
    release();
    const p = await run;
    expect(p.assetDiscovery?.groups[0].relevance).toBeUndefined();
    expect(p.assetDiscovery?.analysisError).toMatch(/stale/);
    expect(p.charges[0].chargedMicros).toBe(42);
  });
  it("rejects a completed answer after cancellation and releases its reservation", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const transport = vi.fn(async (_url: any, init: any) => {
      await gate;
      return Response.json(response(JSON.parse(init.body)));
    }) as typeof fetch;
    const f = fixture(transport),
      run = f.engine.assessAssetChoices(f.p.id, 1);
    await vi.waitFor(() => expect(transport).toHaveBeenCalledTimes(1));
    f.engine.cancel(f.p.id);
    release();
    const p = await run;
    expect(p.assetDiscovery?.groups[0].relevance).toBeUndefined();
    expect(p.reservedMicros).toBe(0);
    expect(p.charges).toHaveLength(1);
    expect(p.charges[0].chargedMicros).toBe(42);
  });
  it("retains financial settlement when diagnostic writing fails", async () => {
    const f = fixture(
      vi.fn(async () =>
        Response.json({ ...response(request()), answers: {} }),
      ) as typeof fetch,
    );
    vi.spyOn(f.store, "trace").mockImplementation(() => {
      throw Error("Diagnostic disk failed");
    });
    const p = await f.engine.assessAssetChoices(f.p.id, 1);
    expect(p.charges).toHaveLength(1);
    expect(p.charges[0].chargedMicros).toBe(42);
    expect(p.reservedMicros).toBe(0);
  });
  it("preserves newer project state and settles a rejected stale reply", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const transport = vi.fn(async (_url: any, init: any) => {
      await gate;
      return Response.json(response(JSON.parse(init.body)));
    }) as typeof fetch;
    const f = fixture(transport),
      run = f.engine.assessAssetChoices(f.p.id, 1);
    await vi.waitFor(() => expect(transport).toHaveBeenCalledTimes(1));
    const changed = f.store.get(f.p.id);
    changed.revision++;
    changed.request = "A new request that must survive";
    f.store.save(changed);
    release();
    const p = await run;
    expect(p.revision).toBe(2);
    expect(p.request).toBe(changed.request);
    expect(p.charges[0].chargedMicros).toBe(42);
    expect(p.reservedMicros).toBe(0);
    expect(p.assetDiscovery?.groups[0].relevance).toBeUndefined();
  });
  it("assesses actual offered metadata, saves advice and charges, but never approves/imports", async () => {
    const f = fixture();
    const p = await f.engine.assessAssetChoices(f.p.id, 1);
    expect(p.assetDiscovery?.groups[0].relevance).toMatchObject({
      candidateId: "123",
      state: "metadata_only",
    });
    expect(p.assetDiscovery?.approved).toBeUndefined();
    expect(p.artifact).toBeNull();
    expect(p.charges).toHaveLength(1);
    expect(p.charges[0]).toMatchObject({
      chargedMicros: 42,
      reservedMicros: 2688,
      billingSource: "provider",
    });
    expect(p.reservedMicros).toBe(0);
    await f.engine.assessAssetChoices(p.id, 1);
    expect(f.transport).toHaveBeenCalledTimes(1);
  });
  it("changed metadata invalidates cached advice", async () => {
    const f = fixture();
    const p = await f.engine.assessAssetChoices(f.p.id, 1);
    p.assetDiscovery!.groups[0].options[0].updated = "v2";
    f.store.save(p);
    await f.engine.assessAssetChoices(p.id, 1);
    expect(f.transport).toHaveBeenCalledTimes(2);
  });
  it("disabled route has no additional calls", async () => {
    const f = fixture();
    const cfg = f.config.read();
    cfg.routes.decisions = [];
    f.config.save(cfg);
    const p = await f.engine.assessAssetChoices(f.p.id, 1);
    expect(p.charges).toEqual([]);
    expect(f.transport).not.toHaveBeenCalled();
  });
  it("defers paid relevance until authored needs exist while still rejecting stale revisions", async () => {
    const f = fixture();
    delete f.p.proposal;
    f.store.save(f.p);
    await expect(f.engine.assessAssetChoices(f.p.id, 2)).rejects.toThrow(
      /changed/,
    );
    const p = await f.engine.assessAssetChoices(f.p.id, 1);
    expect(p.charges).toEqual([]);
    expect(f.transport).not.toHaveBeenCalled();
  });
  it("enforces the project budget before dispatch", async () => {
    const f = fixture(undefined, 1000);
    const p = await f.engine.assessAssetChoices(f.p.id, 1);
    expect(f.transport).not.toHaveBeenCalled();
    expect(p.assetDiscovery?.analysisError).toMatch(/budget/);
    expect(p.charges).toEqual([]);
  });
  it("enforces generation and cumulative reservation budgets before dispatch", async () => {
    for (const mode of ["generation", "cumulative"]) {
      const f = fixture();
      if (mode === "generation") {
        f.p.generation = {
          id: randomUUID(),
          budgetMicros: 1000,
          chargeStart: 0,
        };
        f.store.save(f.p);
      } else {
        const cfg = f.config.read();
        cfg.reservationBudgetMicros = 1000;
        f.config.save(cfg);
      }
      await f.engine.assessAssetChoices(f.p.id, 1);
      expect(f.transport).not.toHaveBeenCalled();
    }
  });
  it("enforces executionPolicy and records no charge for denied dispatch", async () => {
    const f = fixture();
    const engine = new Engine(
      f.store,
      f.config,
      f.transport,
      undefined,
      undefined,
      {
        beforeDispatch: () => {
          throw new DispatchDenied("Run not authorized");
        },
      },
    );
    const p = await engine.assessAssetChoices(f.p.id, 1);
    expect(f.transport).not.toHaveBeenCalled();
    expect(p.charges).toEqual([]);
  });
  it("settles malformed replies once without fallback or asset selection", async () => {
    const transport = vi.fn(async () =>
      Response.json({ ...response(request()), answers: {} }),
    ) as typeof fetch;
    const f = fixture(transport);
    const p = await f.engine.assessAssetChoices(f.p.id, 1);
    expect(p.charges).toHaveLength(1);
    expect(p.charges[0].chargedMicros).toBe(42);
    expect(p.reservedMicros).toBe(0);
    expect(transport).toHaveBeenCalledTimes(1);
    expect(p.assetDiscovery?.groups[0].relevance).toBeUndefined();
    expect(p.assetDiscovery?.analysisError).toMatch(/invalid decisions/);
  });
  it("cannot assign Jev to coding or regular models to decisions", () => {
    const f = fixture();
    const cfg = f.config.read();
    cfg.routes.builder = [f.decision.id];
    expect(() => f.config.save(cfg)).toThrow(/non-coding/);
    cfg.routes.builder = [f.coding.id];
    cfg.routes.decisions = [f.coding.id];
    expect(() => f.config.save(cfg)).toThrow(/require Jev/);
  });
  it("rejects changed revision and approved asset pools without spending", async () => {
    const f = fixture();
    await expect(f.engine.assessAssetChoices(f.p.id, 2)).rejects.toThrow(
      /changed/,
    );
    f.p.proposal!.approval = { hash: f.p.proposal!.hash, revision: f.p.revision, at: new Date().toISOString() };
    f.store.save(f.p);
    await expect(f.engine.assessAssetChoices(f.p.id, 1)).rejects.toThrow(
      /changed/,
    );
    expect(f.transport).not.toHaveBeenCalled();
  });
});
