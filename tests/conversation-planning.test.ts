import { afterEach, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Engine } from "../src/generation/engine";
import { Configuration } from "../src/generation/settings";
import { GenerationStore, newProject } from "../src/generation/store";
import {
  fixtureBundle,
  specification,
  profile,
  fakeTransport,
  fixtureReview,
} from "./generation-fixtures";
import {
  proposalDraftSchema,
  refreshProposal,
  applyProposalPatch,
  affectedTasks,
  proposalHash,
} from "../src/generation/proposal";
import { createApp } from "../src/server/app";
import type { Project } from "../src/generation/schema";
import type { Server } from "node:http";
import type { OpenCodeBackend } from "../src/generation/opencode-runtime";
import legacyProject from "./fixtures/conversation-legacy-project.json";
import { requirementSources } from "../src/generation/requirements";
import { assetDependencyHash } from "../src/generation/asset-evidence-binding";

const dirs: string[] = [];
afterEach(() =>
  dirs.splice(0).forEach((d) => fs.rmSync(d, { recursive: true, force: true })),
);
function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-proposal-"));
  dirs.push(dir);
  const store = new GenerationStore(dir);
  const engine = new Engine(store, new Configuration(path.join(dir, "config")));
  const p = newProject("Build a gliding game with warm lighting", 1000000);
  p.spec = specification(p.request, p.scope);
  p.artifact = fixtureBundle(p.request, p.scope);
  p.completedBuildTasks = ["coreTask"];
  p.generation = { id: randomUUID(), chargeStart: 0, budgetMicros: 100000 };
  store.save(p);
  return { store, engine, p };
}
it("retains legacy files and completed work when a chat edit is saved", () => {
  const { engine, p } = setup();
  const next = engine.submitChange(p.id, p.revision, randomUUID(), {
    text: "Change only the theme to winter",
  });
  expect(next.artifact).toEqual(p.artifact);
  expect(next.completedBuildTasks).toEqual(p.completedBuildTasks);
  expect(next.spec).toEqual(p.spec);
  expect(next.generation).toMatchObject(p.generation!);
});

const draft = proposalDraftSchema.parse({
  title: "Wind glider",
  mechanics: {
    text: "Glide to collect wind energy",
    assumptions: [],
    unresolved: [],
  },
  theme: {
    text: "Warm sunrise",
    assumptions: ["Readable HUD"],
    unresolved: [],
  },
  environment: {
    text: "A loop of floating islands with a central spawn",
    assumptions: [],
    unresolved: [],
  },
});
function attachProposal(p: Project) {
  p.proposal = {
    ...structuredClone(draft),
    revision: p.revision,
    hash: "",
    changed: [],
  };
  refreshProposal(p);
  return p;
}
it("names unresolved assets before applying unanswered defaults", () => {
  const {engine,store}=setup();
  const real:Project=JSON.parse(fs.readFileSync("docs/results/approved-reference-finish-20260927/terminal-project.json","utf8"));
  real.jobId=null;
  real.proposal!.approval=undefined;
  store.save(real);
  expect(()=>engine.approveProposal(real.id,real.revision,real.proposal!.hash)).toThrow(/Choose or skip/i);
});
const servers: Server[] = [];
afterEach(async () => {
  for (const server of servers.splice(0))
    await new Promise<void>((resolve) => server.close(() => resolve()));
});
async function apiFixture(opencode = false, directBuild = false) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-proposal-api-"));
  dirs.push(dir);
  const calls: any[] = [];
  const control = { malformed: false, delay: 0, badScope: false, failTask: "" };
  const fallback = fakeTransport();
  const transport: typeof fetch = async (url, init) => {
    const body = JSON.parse(String(init?.body));
    const c = JSON.parse(
      body.messages[1].content.split(
        "\nYour last response failed validation.",
      )[0],
    );
    calls.push(c);
    if (control.delay)
      await new Promise((resolve) => setTimeout(resolve, control.delay));
    let output: any;
    if (c.kind === "proposal")
      output = control.malformed ? { bad: true } : draft;
    else if (c.kind === "proposal-edit")
      output = control.malformed
        ? { bad: true }
        : {
            baseRevision: c.edit.baseRevision,
            baseHash: c.edit.baseHash,
            changes: [
              {
                id: control.badScope ? "mechanics" : "theme",
                value: { ...draft.theme, text: c.edit.text },
              },
            ],
            summary: "Updated theme only",
          };
    else if (c.kind === "scoped-plan")
      output = {
        tasks: c.spec.tasks.filter((t: any) =>
          c.affectedTaskIds.includes(t.id),
        ),
        requirements: c.spec.requirements.filter((r: any) =>
          c.spec.tasks.some(
            (t: any) =>
              c.affectedTaskIds.includes(t.id) && t.requirements.includes(r.id),
          ),
        ),
        visualDirection: c.proposal.theme.text,
      };
    else if (
      c.coordination?.step === "area" ||
      (opencode && /PHASE: planner/.test(body.messages[0].content))
    ) {
      const base = specification(c.request, c.namespace);
      output = {
        ...(opencode
          ? {
              title: base.title,
              summary: base.summary,
              visualDirection: base.visualDirection,
              questions: [],
            }
          : {}),
        requirements: ["core", "theme", "hud"].map((id) => ({
          ...base.requirements[0],
          id: "core_" + id,
          origin: "user",
          sourceId: `proposal:${id === "core" ? "mechanics" : id === "theme" ? "theme" : "environment"}`,
          sourceQuote: "",
          description: id,
        })),
        tasks: ["core", "theme", "hud"].map((id) => ({
          id: "core_" + id,
          title: "Implement " + id,
          requirements: ["core_" + id],
          dependsOn: id === "hud" ? ["core_theme"] : [],
          files: [`ServerScriptService/${c.namespace}/${id}.server.luau`],
          proposalSections: [
            id === "core"
              ? "mechanics"
              : id === "theme"
                ? "theme"
                : "environment",
          ],
        })),
        assetNeeds: [],
        referenceDecisions: [],
      };
    } else if (c.task) {
      const owned = c.task.files.length ? c.task.files : [`ServerScriptService/${c.namespace}/Game.server.luau`];
      output = {
        files: owned.map((file: string) => ({
          path: file,
          kind: "Script",
          source: `local value = ${JSON.stringify(c.approvedProposal?.theme.text ?? "warm")}\nprint(value)`,
        })),
        scene: [],
        coverage: c.task.requirements.map((id: string) => ({
          requirementId: id,
          status: "implemented",
          detail: "Fixture only",
          files: owned,
        })),
        assets: [],
      };
      if (control.failTask === c.task.id)
        output = { bad: "Known billed malformed worker reply" };
    } else if (/PHASE: reviewer/.test(body.messages[0].content)) {
      output = {
        issues: [],
        tests: c.spec.requirements.map((r: any) => ({
          ...fixtureReview.tests[0],
          id: r.id + "Test",
          requirementId: r.id,
        })),
      };
    } else return fallback(url, init);
    return Response.json({
      choices: [
        { finish_reason: "stop", message: { content: JSON.stringify(output) } },
      ],
      usage: { prompt_tokens: 100, completion_tokens: 200 },
    });
  };
  const backend: OpenCodeBackend = {
    preflight() {},
    async run(job) {
      const submit = job.tools.find((tool) => tool.name === "submit_task")!;
      const context = job.tools.find((tool) => tool.name === "task_context")!;
      for (const task of job.project.spec!.tasks) {
        if (job.project.completedBuildTasks?.includes(task.id)) continue;
        const c = await context.execute({ taskId: task.id });
        const response = await transport("http://offline.invalid", {
          body: JSON.stringify({
            messages: [
              { content: "PHASE: builder" },
              { content: JSON.stringify(c) },
            ],
          }),
        });
        const payload = await response.json();
        const args = submit.schema.parse({
          taskId: task.id,
          patch: JSON.parse(payload.choices[0].message.content),
        });
        await submit.execute(args);
      }
    },
  };
  const app = createApp(dir, {
    env: {},
    transport,
    ...(opencode ? { executionPolicy: { opencode: backend, directBuild } } : {}),
  });
  const model = { ...profile(), inputRate: 0.01, outputRate: 0.01 };
  app.locals.config.save({
    profiles: [model],
    routes: {
      planner: [model.id],
      builder: [model.id],
      reviewer: [model.id],
      repair: [],
    },
    budgetMicros: 1000000,
    generationBudgetMicros: 800000,
    repairLimit: 0,
  });
  const engine = app.locals.engine as Engine;
  // Contract/dependency tests deliberately use an offline compiler double.
  (engine as any).compiler = async () => [
    {
      id: "mock-compile",
      status: "passed",
      detail: "Offline compiler fixture",
    },
  ];
  const store = engine.store;
  const server = app.listen(0, "127.0.0.1");
  servers.push(server);
  await new Promise<void>((r) => server.once("listening", r));
  const base = `http://127.0.0.1:${(server.address() as any).port}/api`;
  const post = async (route: string, body: unknown) => {
    const r = await fetch(base + route, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: r.status, data: await r.json() };
  };
  const p = engine.create("Build a wind gliding game");
  return { p, post, engine, store, calls, control, app };
}
async function prepared(opencode = false, directBuild = false) {
  const f = await apiFixture(opencode, directBuild);
  expect(
    (await f.post(`/projects/${f.p.id}/proposal`, { revision: 1 })).status,
  ).toBe(202);
  let p = await f.engine.wait(f.p.id);
  expect(p.error).toBeNull();
  if (p.rig && !p.rig.selected) p = f.engine.revise(p.id, p.revision, p.request, { ...p.answers, character_rig: "R15" });
  p.assetDiscovery = {
    id: randomUUID(),
    revision: p.revision,
    studioId: "",
    groups: [],
    choices: {},
    approved: true,
  };
  refreshProposal(p);
  f.store.save(p);
  return { ...f, p };
}
async function built(opencode = false, directBuild = false) {
  const f = await prepared(opencode, directBuild);
  expect(
    (
      await f.post(`/projects/${f.p.id}/approve-proposal`, {
        revision: f.p.revision,
        hash: f.p.proposal!.hash,
      })
    ).status,
  ).toBe(202);
  const p = await f.engine.wait(f.p.id);
  expect(p.error).toBeNull();
  expect(p.stage).toBe("ready_to_test");
  return { ...f, p };
}
it("approves the actual proposal API result and saves code through one direct coding session without a paid planning call", async () => {
  const f = await built(true, true);
  expect(f.p.spec!.tasks).toHaveLength(1);
  expect(f.p.completedBuildTasks).toEqual(["implementation"]);
  expect(f.p.artifact!.files.length).toBeGreaterThan(0);
  expect(f.p.coordination).toBeUndefined();
  expect(f.calls.filter(c => c.coordination || c.kind === "scoped-plan")).toEqual([]);
  expect(f.calls.filter(c => c.kind !== "proposal" && !c.task && !c.artifact && !c.current && !c.spec)).toEqual([]);
});
it("patches theme through the message API, preserving mechanics, layout, animation and cumulative budget", async () => {
  const f = await prepared(),
    before = structuredClone(f.p);
  before.assetDiscovery!.choices = {
    animation: { assetId: "123", clipKey: "punch" },
  };
  refreshProposal(before);
  f.store.save(before);
  expect(
    (
      await f.post(`/projects/${before.id}/messages`, {
        revision: before.revision,
        id: randomUUID(),
        text: "Change only theme to winter",
      })
    ).status,
  ).toBe(200);
  const next = await f.engine.wait(before.id);
  expect(next.proposal!.mechanics).toEqual(before.proposal!.mechanics);
  expect(next.proposal!.environment).toEqual(before.proposal!.environment);
  expect(next.assetDiscovery!.choices).toEqual(before.assetDiscovery!.choices);
  expect(next.generation).toEqual(before.generation);
  expect(next.charges.length).toBe(before.charges.length + 1);
  expect(next.proposal!.theme.text).toContain("winter");
});
it.each(["malformed", "badScope"] as const)(
  "keeps the prior proposal and request on %s edits, while retaining cost",
  async (failure) => {
    const f = await prepared();
    f.control[failure] = true;
    await f.post(`/projects/${f.p.id}/messages`, {
      revision: f.p.revision,
      id: randomUUID(),
      text: "Change theme to winter",
    });
    const next = await f.engine.wait(f.p.id);
    expect(next.stage).toBe("failed");
    expect(next.proposal).toEqual(f.p.proposal);
    expect(next.pendingProposalEdit!.text).toContain("winter");
    expect(next.charges.length).toBeGreaterThan(f.p.charges.length);
    expect(next.generation).toEqual(f.p.generation);
  },
);
it("cancels after dispatch without accepting a late edit or losing its receipt", async () => {
  const f = await prepared();
  f.control.delay = 50;
  await f.post(`/projects/${f.p.id}/messages`, {
    revision: f.p.revision,
    id: randomUUID(),
    text: "Change theme to winter",
  });
  await f.post(`/projects/${f.p.id}/cancel`, {});
  const p = await f.engine.wait(f.p.id);
  expect(p.stage).toBe("interrupted");
  expect(p.proposal).toEqual(f.p.proposal);
  expect(p.charges).toHaveLength(f.p.charges.length + 1);
  expect(p.reservedMicros).toBe(0);
});
it("rejects stale revision and hash patches atomically", () => {
  const { p } = setup();
  attachProposal(p);
  const before = structuredClone(p);
  for (const invalid of [
    { baseRevision: 0, baseHash: p.proposal!.hash },
    { baseRevision: p.revision, baseHash: "stale" },
  ]) {
    expect(() =>
      applyProposalPatch(
        p,
        {
          ...invalid,
          changes: [{ id: "theme", value: draft.theme }],
          summary: "change",
        },
        ["theme"],
      ),
    ).toThrow(/changed/);
    expect(p).toEqual(before);
  }
});
it("binds approval to exact content and queues concurrent messages while building", async () => {
  const f = await prepared();
  f.control.delay = 30;
  expect(
    (
      await f.post(`/projects/${f.p.id}/approve-proposal`, {
        revision: f.p.revision,
        hash: "stale",
      })
    ).status,
  ).toBe(409);
  expect(
    (
      await f.post(`/projects/${f.p.id}/approve-proposal`, {
        revision: f.p.revision,
        hash: f.p.proposal!.hash,
      })
    ).status,
  ).toBe(202);
  expect(
    (
      await f.post(`/projects/${f.p.id}/messages`, {
        revision: f.p.revision,
        id: randomUUID(),
        text: "Change theme to snow",
      })
    ).status,
  ).toBe(200);
  await f.engine.wait(f.p.id);
});
it("runs one approval through planning and coordination, then rebuilds only theme and transitive HUD consumers", async () => {
  const f = await built(),
    before = structuredClone(f.p);
  const receipts = before.coordination!.workers;
  await f.post(`/projects/${before.id}/messages`, {
    revision: before.revision,
    id: randomUUID(),
    text: "Change theme to winter",
  });
  const edited = await f.engine.wait(before.id);
  expect(affectedTasks(edited).sort()).toEqual(["core_hud", "core_theme"]);
  expect(edited.artifact).toEqual(before.artifact);
  expect(edited.completedBuildTasks).toEqual(before.completedBuildTasks);
  const start = f.calls.length;
  await f.post(`/projects/${before.id}/approve-proposal`, {
    revision: edited.revision,
    hash: edited.proposal!.hash,
  });
  const result = await f.engine.wait(before.id);
  expect(result.error).toBeNull();
  expect(result.stage).toBe("ready_to_test");
  expect(
    f.calls
      .slice(start)
      .filter((c) => c.task)
      .map((c) => c.task.id),
  ).toEqual(["core_theme", "core_hud"]);
  expect(result.artifact!.files.find((x) => x.path.includes("/core."))).toEqual(
    before.artifact!.files.find((x) => x.path.includes("/core.")),
  );
  expect(result.coordination!.workers.slice(0, receipts.length)).toEqual(
    receipts,
  );
  expect(result.generation).toEqual(before.generation);
  expect(result.world).toEqual(before.world);
  const followupContexts=f.calls.slice(start).filter(c=>c.kind==="scoped-plan" || c.task);
  expect(followupContexts.length).toBeGreaterThan(1);
  for(const c of followupContexts) {
    expect(c.existingProject.existingScene).toEqual(before.artifact!.scene);
    expect(c.existingProject.existingFiles).toEqual(before.artifact!.files);
    expect(c.existingProject.world).toEqual(before.world);
  }
  expect(result.proposal!.approval!.hash).toBe(proposalHash(result));
});
it("preserves the prior artifact on a failed incremental build and resumes completed replacement workers", async () => {
  const f = await built();
  await f.post(`/projects/${f.p.id}/messages`, {
    revision: f.p.revision,
    id: randomUUID(),
    text: "Change theme to winter",
  });
  let p = await f.engine.wait(f.p.id);
  f.control.failTask = "core_hud";
  await f.post(`/projects/${p.id}/approve-proposal`, {
    revision: p.revision,
    hash: p.proposal!.hash,
  });
  p = await f.engine.wait(p.id);
  expect(p.stage).toBe("failed");
  expect(p.artifact).toEqual(f.p.artifact);
  expect(p.implementationCandidate!.completedBuildTasks).toContain(
    "core_theme",
  );
  f.control.failTask = "";
  const start = f.calls.length;
  expect((await f.post(`/projects/${p.id}/retry-step`, { revision: p.revision })).status).toBe(202);
  p = await f.engine.wait(p.id);
  expect(p.error).toBeNull();
  expect(p.stage).toBe("ready_to_test");
  expect(
    f.calls
      .slice(start)
      .filter((c) => c.task)
      .map((c) => c.task.id),
  ).toEqual(["core_hud"]);
});
it("re-edits through OpenCode approval/build, retaining the published artifact on failure and resuming only changed consumers", async () => {
  const f = await built(true);
  const original = structuredClone(f.p);
  expect(original.executionMode).toBe("opencode");
  expect(original.coordination).toBeUndefined();
  await f.post(`/projects/${original.id}/messages`, {
    revision: original.revision,
    id: randomUUID(),
    text: "Change theme to winter",
  });
  let p = await f.engine.wait(original.id);
  expect(p.proposal!.mechanics).toEqual(original.proposal!.mechanics);
  expect(p.assetDiscovery!.choices).toEqual(original.assetDiscovery!.choices);
  expect(p.artifact).toEqual(original.artifact);
  f.control.failTask = "core_hud";
  await f.post(`/projects/${p.id}/approve-proposal`, {
    revision: p.revision,
    hash: p.proposal!.hash,
  });
  p = await f.engine.wait(p.id);
  expect(p.stage).toBe("failed");
  expect(p.artifact).toEqual(original.artifact);
  expect(p.implementationCandidate!.completedBuildTasks).toContain(
    "core_theme",
  );
  expect(p.generation).toEqual(original.generation);
  f.control.failTask = "";
  const start = f.calls.length;
  await f.post(`/projects/${p.id}/approve-proposal`, {
    revision: p.revision,
    hash: p.proposal!.hash,
  });
  p = await f.engine.wait(p.id);
  expect(p.error).toBeNull();
  expect(p.stage).toBe("ready_to_test");
  expect(
    f.calls
      .slice(start)
      .filter((c) => c.task)
      .map((c) => c.task.id),
  ).toEqual(["core_hud"]);
  expect(p.artifact!.files.find((f) => f.path.includes("/core."))).toEqual(
    original.artifact!.files.find((f) => f.path.includes("/core.")),
  );
  expect(p.proposal!.approval!.hash).toBe(proposalHash(p));
  expect(p.generation).toEqual(original.generation);
});
it("queues messages and blocks approval during native apply and unknown native outcomes", async () => {
  const f = await built();
  const bridge = f.app.locals.bridge;
  const session = bridge.connect("Fixture", {
    protocolVersion: 2,
    capabilities: ["apply", "test"],
  });
  const op = bridge.enqueue(f.p.id, session.id, "apply");
  expect(op.state).toBe("queued");
  expect(
    (
      await f.post(`/projects/${f.p.id}/messages`, {
        revision: f.p.revision,
        id: randomUUID(),
        text: "Change theme",
      })
    ).status,
  ).toBe(200);
  expect(
    (
      await f.post(`/projects/${f.p.id}/approve-proposal`, {
        revision: f.p.revision,
        hash: f.p.proposal!.hash,
      })
    ).status,
  ).toBe(409);
  expect(f.store.get(f.p.id).artifact).toEqual(f.p.artifact);
  bridge.poll(session.id);
  const saved = f.store.get(f.p.id);
  saved.approvedRevision = null;
  f.store.save(saved);
  expect(bridge.status(session.id, op.id).state).toBe("unknown");
  expect(
    (
      await f.post(`/projects/${f.p.id}/messages`, {
        revision: f.p.revision,
        id: randomUUID(),
        text: "Change theme",
      })
    ).status,
  ).toBe(200);
});
it("repeated edits cannot reopen the original spending boundary", async () => {
  const f = await prepared();
  let p = f.p;
  for (const text of ["Change theme to winter", "Change theme to autumn"]) {
    const id = randomUUID();
    const body = { revision: p.revision, id, text };
    await f.post(`/projects/${p.id}/messages`, body);
    p = await f.engine.wait(p.id);
    expect(p.error).toBeNull();
    const calls = f.calls.length;
    expect((await f.post(`/projects/${p.id}/messages`, body)).status).toBe(200);
    expect(f.calls.length).toBe(calls);
    expect(p.generation!.id).toBe(f.p.generation!.id);
    expect(p.generation!.chargeStart).toBe(0);
  }
  p.generation!.budgetMicros = Math.max(
    1000,
    p.charges.reduce((sum, c) => sum + c.chargedMicros, 0),
  );
  f.store.save(p);
  const configured = f.engine.config.read();
  f.engine.config.save({
    ...configured,
    profiles: configured.profiles.map((model) => ({
      ...model,
      inputRate: 1,
      outputRate: 2,
    })),
  });
  const calls = f.calls.length;
  await f.post(`/projects/${p.id}/messages`, {
    revision: p.revision,
    id: randomUUID(),
    text: "Change theme to spring",
  });
  const exhausted = await f.engine.wait(p.id);
  expect(exhausted.error).toContain("Generation budget");
  expect(f.calls.length).toBe(calls);
  expect(exhausted.proposal).toEqual(p.proposal);
});
it("loads a saved legacy project without inventing dependency coverage or relabeling evidence", async () => {
  const { store, engine, p } = setup();
  attachProposal(p);
  p.studioEvidence = {
    revision: 1,
    artifactHash: "original",
    checks: [],
    logs: [],
    at: "2026-09-01T00:00:00Z",
  };
  store.save(p);
  const loaded = store.get(p.id);
  expect(() => affectedTasks(loaded)).toThrow(
    /no complete proposal dependency map/,
  );
  expect(loaded.artifact).toEqual(p.artifact);
  expect(loaded.studioEvidence).toEqual(p.studioEvidence);
  expect(() => engine.start(p.id, p.revision, "plan")).toThrow();
});
it("takes the saved legacy fixture through proposal and message APIs, then reports missing build dependencies", async () => {
  const f = await apiFixture();
  let p = structuredClone(legacyProject) as Project;
  f.store.save(p);
  expect(
    (await f.post(`/projects/${p.id}/proposal`, { revision: p.revision }))
      .status,
  ).toBe(202);
  p = await f.engine.wait(p.id);
  expect(p.proposal).toBeDefined();
  expect(p.artifact).toEqual(legacyProject.artifact);
  if (p.rig && !p.rig.selected) p = f.engine.revise(p.id, p.revision, p.request, { ...p.answers, character_rig: "R15" });
  await f.post(`/projects/${p.id}/messages`, {
    revision: p.revision,
    id: randomUUID(),
    text: "Change theme to winter",
  });
  p = await f.engine.wait(p.id);
  p.assetDiscovery = {
    id: randomUUID(),
    revision: p.revision,
    studioId: "",
    groups: [],
    choices: {},
    approved: true,
  };
  refreshProposal(p);
  f.store.save(p);
  const approval = await f.post(`/projects/${p.id}/approve-proposal`, {
    revision: p.revision,
    hash: p.proposal!.hash,
  });
  expect(approval.status).toBe(409);
  expect(approval.data.error).toContain("dependency map");
  const retained = f.store.get(p.id);
  expect(retained.artifact).toEqual(legacyProject.artifact);
  expect(retained.studioEvidence).toEqual(legacyProject.studioEvidence);
  expect(retained.completedBuildTasks).toEqual(
    legacyProject.completedBuildTasks,
  );
});
it("commits planning answers with the proposal patch and binds accepted sections as planning sources", async () => {
  const f = await prepared();
  let p = f.p;
  p.spec = specification(p.request, p.scope);
  p.spec.questions = [
    {
      id: "lighting",
      prompt: "Which lighting style?",
      options: ["Winter", "Summer"],
    },
  ];
  f.store.save(p);
  expect(requirementSources(p).some((s) => s.id.startsWith("proposal:"))).toBe(
    false,
  );
  await f.post(`/projects/${p.id}/messages`, {
    revision: p.revision,
    id: randomUUID(),
    text: "Change theme to winter",
    answers: { lighting: "Winter" },
  });
  p = await f.engine.wait(p.id);
  expect(p.answers.lighting).toBe("Winter");
  expect(p.answerQuestions?.lighting).toBe("Which lighting style?");
  expect(f.calls.at(-1).answers.lighting).toBe("Winter");
  p.proposal!.approval = {
    hash: p.proposal!.hash,
    revision: p.revision,
    at: new Date().toISOString(),
  };
  expect(
    requirementSources(p).find((s) => s.id === "proposal:theme")?.text,
  ).toContain("winter");
});
it("a failed proposal migration retains the legacy approval as well as its files", async () => {
  const f = await apiFixture();
  f.control.malformed = true;
  const p = structuredClone(legacyProject) as Project;
  f.store.save(p);
  await f.post(`/projects/${p.id}/proposal`, { revision: p.revision });
  const failed = await f.engine.wait(p.id);
  expect(failed.stage).toBe("failed");
  expect(failed.approvedRevision).toBe(p.approvedRevision);
  expect(failed.artifact).toEqual(p.artifact);
});
it("rejects no-op patches without creating a stale implementation revision", () => {
  const { p } = setup();
  attachProposal(p);
  const before = structuredClone(p);
  expect(() =>
    applyProposalPatch(
      p,
      {
        baseRevision: p.revision,
        baseHash: p.proposal!.hash,
        changes: [{ id: "theme", value: p.proposal!.theme }],
        summary: "No change",
      },
      ["theme"],
    ),
  ).toThrow(/no content change/i);
  expect(p).toEqual(before);
});
it("asset reuse includes upstream rig contracts even when the asset task only declares assets", () => {
  const { p } = setup();
  attachProposal(p);
  p.spec!.requirements.push({
    ...p.spec!.requirements[0],
    id: "animation",
    description: "Animation for the rig",
  });
  p.spec!.tasks[0].proposalSections = ["mechanics"];
  p.spec!.tasks.push({
    id: "animationTask",
    title: "Use animation",
    requirements: ["animation"],
    dependsOn: ["coreTask"],
    files: [],
    proposalSections: ["assets"],
  });
  p.proposalPlan = {
    hash: p.proposal!.hash,
    revision: p.revision,
    tasks: {
      coreTask: { sections: ["mechanics"], scenePaths: [] },
      animationTask: { sections: ["assets"], scenePaths: [] },
    },
  };
  const need = {
    id: "animation",
    requirementId: "animation",
    role: "Run animation",
    kind: "Animation" as const,
    query: "run",
    constraints: "Match the rig",
    required: true,
    position: [0, 0, 0] as [number, number, number],
    maxSize: 12,
  };
  const before = assetDependencyHash(p, need);
  p.proposal!.mechanics.text = "Use R15 instead of R6";
  expect(assetDependencyHash(p, need)).not.toBe(before);
});
it("rejects repairing a retained stale artifact under the new proposal approval", async () => {
  const f = await built();
  f.p.staleImplementation = true;
  f.p.stage = "failed";
  f.store.save(f.p);
  const response = await f.post(`/projects/${f.p.id}/repair`, {
    revision: f.p.revision,
  });
  await f.engine.wait(f.p.id);
  expect(response.status).toBe(409);
  expect(response.data.error).toContain("Approve & build");
});
it("retains unknown-cost reservations across interruption recovery", () => {
  const { store, p } = setup();
  attachProposal(p);
  p.jobId = randomUUID();
  p.reservedMicros = 9876;
  store.save(p);
  store.recover();
  const loaded = store.get(p.id);
  expect(loaded.proposal).toEqual(p.proposal);
  expect(loaded.generation).toEqual(p.generation);
  expect(loaded.charges.at(-1)!.chargedMicros).toBe(9876);
  expect(loaded.reservedMicros).toBe(0);
});

it("durably applies a queued change after the current worker, retaining its output and cap", async () => {
  const f = await prepared();
  f.control.delay = 80;
  await f.post(`/projects/${f.p.id}/approve-proposal`, { revision: f.p.revision, hash: f.p.proposal!.hash });
  const finished = f.engine.wait(f.p.id);
  await vi.waitFor(() => expect(f.calls.some(c => c.task)).toBe(true));
  const before = f.store.get(f.p.id);
  const id = randomUUID();
  const body = { revision: before.revision, id, text: "Change only the theme to winter" };
  const queued = await f.post(`/projects/${f.p.id}/messages`, body);
  expect(queued.data.queuedMessages[0].status).toBe("queued");
  expect((await f.post(`/projects/${f.p.id}/messages`, body)).status).toBe(200);
  expect((await f.post(`/projects/${f.p.id}/messages`, { ...body, text: "Something else" })).status).toBe(409);
  await finished;
  const p = f.store.get(f.p.id);
  expect(p.queuedMessages).toHaveLength(1);
  expect(p.queuedMessages![0].status, p.error ?? JSON.stringify(p.queuedMessages)).toBe("applied");
  expect(p.completedBuildTasks).toContain("core_core");
  expect(p.artifact!.files.length).toBeGreaterThan(0);
  expect(p.proposal!.theme.text).toContain("winter");
  expect(p.stage).toBe("draft");
  expect(p.generation!.budgetMicros).toBe(before.generation!.budgetMicros);
  expect(f.calls.filter(c => c.kind === "proposal-edit")).toHaveLength(1);
  expect(f.calls.find(c => c.kind === "proposal-edit").conversation.some((t: any) => t.id === id)).toBe(true);
});
it("Stop holds queued changes without a planner retry", async () => {
  const f = await prepared(); f.control.delay = 100;
  await f.post(`/projects/${f.p.id}/approve-proposal`, { revision: f.p.revision, hash: f.p.proposal!.hash });
  const finished = f.engine.wait(f.p.id);
  await vi.waitFor(() => expect(f.calls.some(c => c.task)).toBe(true));
  const p = f.store.get(f.p.id);
  f.engine.submitChange(p.id, p.revision, randomUUID(), { text: "Change only the theme to winter" });
  f.engine.cancel(p.id); await finished;
  expect(f.store.get(p.id).queuedMessages![0].status).toBe("held");
  expect(f.calls.filter(c => c.kind === "proposal-edit")).toHaveLength(0);
});

it("exhausted queue allowance holds the message without a paid dispatch or automatic retry", async () => {
  const f = await prepared();
  const p = f.store.get(f.p.id);
  p.generation!.budgetMicros = 1000;
  p.generation!.chargeStart = 0;
  p.charges[0].chargedMicros = 1000;
  p.queuedMessages = [{ id: randomUUID(), hash: "offline", text: "Change only theme to winter", revision: p.revision, jobId: randomUUID(), at: new Date().toISOString(), status: "held" }];
  f.store.save(p);
  const before = f.calls.length;
  const result = await f.engine.applyQueuedChanges(p.id);
  expect(result.queuedMessages![0].status).toBe("held");
  expect(f.calls).toHaveLength(before);
  expect(result.generation!.budgetMicros).toBe(1000);
});
