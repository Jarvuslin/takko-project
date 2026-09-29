import { afterEach, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Server } from "node:http";
import { createApp } from "../src/server/app";
import { GenerationStore, newProject } from "../src/generation/store";
import {
  architectureSchema,
  architectureSemantics,
  architectureSources,
  type GameArchitecture,
} from "../src/generation/architecture";
import { requirementSources } from "../src/generation/requirements";
import { validateSpec } from "../src/generation/validation";
import {
  animationClipSchema,
  sampleRotation,
} from "../src/generation/animation";
import { specification, fixtureBundle } from "./generation-fixtures";
import { appendTurn } from "../src/generation/conversation";
import { conceptFixture } from "./concept.fixture";

const dirs: string[] = [],
  servers: Server[] = [];
function store() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-chat-"));
  dirs.push(dir);
  return new GenerationStore(dir);
}
async function setup() {
  const db = store();
  const app = createApp(db.directory, { env: {} });
  const server = app.listen(0, "127.0.0.1");
  servers.push(server);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api`;
  return {
    db,
    app,
    api: (route: string, method = "GET", body?: unknown) =>
      fetch(base + route, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
  };
}
afterEach(async () => {
  for (const server of servers.splice(0))
    await new Promise<void>((resolve) => server.close(() => resolve()));
  for (const dir of dirs.splice(0))
    fs.rmSync(dir, { recursive: true, force: true });
});
const graph: GameArchitecture = {
  nodes: [
    {
      id: "combat",
      name: "Combat",
      purpose: "Server verifies punches and damage.",
      authority: "server",
      x: 30,
      y: 30,
    },
    {
      id: "energy",
      name: "Energy",
      purpose: "Store energy for each player.",
      authority: "server",
      x: 300,
      y: 30,
    },
  ],
  edges: [
    {
      id: "hit-energy",
      from: "combat",
      to: "energy",
      kind: "event",
      event: "Hit confirmed",
      effect: "Add ten energy to the attacker after validating the hit.",
    },
  ],
};
const clip = {
  version: 1 as const,
  name: "Punch",
  rig: "R6" as const,
  duration: 1,
  tracks: [
    {
      joint: "Right Arm",
      keys: [
        { time: 0, rotation: [0, 0, 0] as [number, number, number] },
        { time: 0.5, rotation: [-1.5, 0, 0] as [number, number, number] },
        { time: 1, rotation: [0, 0, 0] as [number, number, number] },
      ],
    },
  ],
};

it("treats proposed decisions as user sources only after revision-bound acceptance", () => {
  const p = newProject("Make a pet game", 500000);
  p.concept = {
    ...conceptFixture(false),
    revision: 1,
    decisions: [
      {
        questionId: null,
        topic: "Game direction",
        choice: "A rescue adventure",
        sourceIds: ["request"],
      },
    ],
  };
  expect(requirementSources(p).some((s) => s.id.startsWith("decision:"))).toBe(
    false,
  );
  p.conceptAcceptedRevision = 1;
  expect(
    requirementSources(p).find((s) => s.id === "decision:0")?.text,
  ).toContain("A rescue adventure");
  p.revision = 2;
  expect(requirementSources(p).some((s) => s.id.startsWith("decision:"))).toBe(
    false,
  );
});

it("persists follow-ups separately, deduplicates retries and rejects conflicting IDs", async () => {
  const { db, api } = await setup();
  const p = db.save(newProject("A cooperative farming game", 500000));
  const body = {
    revision: p.revision,
    id: randomUUID(),
    text: "Add a crop selling shop",
  };
  const first = await (
    await api(`/projects/${p.id}/messages`, "POST", body)
  ).json();
  expect(first.request).toBe(p.request);
  expect(first.revision).toBe(2);
  expect(first.briefChanges).toEqual([{ id: body.id, text: body.text }]);
  expect((await api(`/projects/${p.id}/messages`, "POST", body)).status).toBe(
    200,
  );
  expect(
    db.get(p.id).conversation?.filter((t) => t.id === body.id),
  ).toHaveLength(1);
  expect(
    (
      await api(`/projects/${p.id}/messages`, "POST", {
        ...body,
        text: "Different",
      })
    ).status,
  ).toBe(409);
  expect(
    (
      await api(`/projects/${p.id}/messages`, "POST", {
        ...body,
        id: randomUUID(),
      })
    ).status,
  ).toBe(409);
  expect(
    requirementSources(db.get(p.id)).find((s) => s.id === `message:${body.id}`)
      ?.text,
  ).toBe(body.text);
});
it("keeps a long conversation while bounding active instructions without silently dropping them", async () => {
  const { db, api } = await setup();
  const p = db.save(newProject("A game with a long brief", 500000));
  for (let i = 0; i < 6; i++) {
    const current = db.get(p.id);
    const response = await api(`/projects/${p.id}/messages`, "POST", {
      revision: current.revision,
      id: randomUUID(),
      text: "x".repeat(6000),
    });
    expect(response.status).toBe(i < 5 ? 200 : 409);
  }
  expect(db.get(p.id).briefChanges).toHaveLength(5);
  expect(db.get(p.id).request).toBe(p.request);
});
it("archives the original artifact and invalidates approval when architecture changes", async () => {
  const { db, api } = await setup();
  const p = newProject("An arena fighting game", 500000);
  p.spec = specification(p.request, p.scope);
  p.artifact = fixtureBundle(p.request, p.scope);
  p.stage = "ready_to_test";
  p.approvedRevision = 1;
  db.save(p);
  const result = await (
    await api(`/projects/${p.id}/architecture`, "POST", {
      revision: 1,
      id: randomUUID(),
      architecture: graph,
    })
  ).json();
  expect(result.architecture).toEqual(graph);
  expect(result.approvedRevision).toBeNull();
  expect(result.artifact).toEqual(p.artifact);
  expect(result.staleImplementation).toBe(true);
  const history = fs.readdirSync(path.join(db.directory, "history"));
  expect(history).toHaveLength(1);
  const archived = JSON.parse(
    fs.readFileSync(path.join(db.directory, "history", history[0]), "utf8"),
  );
  expect(archived.artifact).toEqual(p.artifact);
});

it("moving nodes preserves the approved plan and artifact without a new generation", async () => {
  const { db, api } = await setup();
  const p = newProject("An arena with energy", 500000);
  p.architecture = structuredClone(graph);
  p.spec = specification(p.request, p.scope);
  p.artifact = fixtureBundle(p.request, p.scope);
  p.approvedRevision = 1;
  p.stage = "ready_to_test";
  db.save(p);
  const moved = structuredClone(graph);
  moved.nodes[0].x += 100;
  expect(architectureSemantics(architectureSchema.parse(moved))).toBe(
    architectureSemantics(graph),
  );
  const response = await api(`/projects/${p.id}/architecture`, "POST", {
    id: randomUUID(),
    revision: 1,
    architecture: moved,
  });
  expect(response.status).toBe(200);
  const saved = db.get(p.id);
  expect(saved.revision).toBe(1);
  expect(saved.approvedRevision).toBe(1);
  expect(saved.artifact).toEqual(p.artifact);
  expect(saved.charges).toEqual([]);
});
it("rejects dangling, duplicate, self and oversized architecture contracts, while allowing game loops", () => {
  expect(architectureSchema.safeParse(graph).success).toBe(true);
  for (const edges of [
    [{ ...graph.edges[0], to: "missing" }],
    [{ ...graph.edges[0], to: "combat" }],
    [graph.edges[0], { ...graph.edges[0], id: "other" }],
  ])
    expect(architectureSchema.safeParse({ ...graph, edges }).success).toBe(
      false,
    );
  expect(
    architectureSchema.safeParse({
      ...graph,
      edges: [
        ...graph.edges,
        {
          ...graph.edges[0],
          id: "return",
          from: "energy",
          to: "combat",
          event: "Ability ready",
        },
      ],
    }).success,
  ).toBe(true);
  expect(
    architectureSchema.safeParse({
      ...graph,
      nodes: [...graph.nodes, graph.nodes[0]],
    }).success,
  ).toBe(false);
});
it("requires every graph system and edge to reach the plan and implementation tasks", () => {
  const p = newProject("An arena fighting game", 500000);
  p.architecture = graph;
  const spec = specification(p.request, p.scope);
  expect(() => validateSpec(spec, p)).toThrow(
    /Architecture contract not planned/,
  );
  for (const [i, source] of architectureSources(graph).entries()) {
    const r = {
      ...spec.requirements[0],
      id: `arch${i}`,
      sourceId: source.id,
      sourceQuote: source.text,
      description: source.text,
    };
    spec.requirements.push(r);
    spec.tasks[0].requirements.push(r.id);
  }
  expect(validateSpec(spec, p).requirements).toHaveLength(4);
  spec.tasks[0].requirements.pop();
  expect(() => validateSpec(spec, p)).toThrow(/Unplanned requirement/);
});
it("preserves failed runs and more than 120 events across process reloads", () => {
  const db = store(),
    p = db.save(newProject("A saved chat game", 500000));
  p.jobId = randomUUID();
  db.save(p);
  for (let i = 0; i < 125; i++) {
    p.events.push({
      at: new Date(Date.now() + i).toISOString(),
      message: `event ${i}`,
    });
    p.events = p.events.slice(-120);
    db.save(p);
  }
  p.stage = "failed";
  p.error = "Provider rejected this request";
  p.jobId = null;
  db.save(p);
  const restored = new GenerationStore(db.directory).get(p.id);
  const turn = restored.conversation!.find((t) => t.kind === "run")!;
  expect(turn.status).toBe("failed");
  expect(turn.events).toHaveLength(125);
  expect(turn.text).toContain("Provider rejected");
  expect(restored.events).toHaveLength(120);
});
it("paginates stable turns and returns a bounded current-project transcript", async () => {
  const { db, api } = await setup();
  const p = newProject("A long conversation", 500000);
  db.save(p);
  for (let i = 0; i < 65; i++) appendTurn(p, "user", `message ${i}`);
  db.save(p);
  const latest = await (await api(`/projects/${p.id}`)).json();
  expect(latest.conversation).toHaveLength(30);
  const older = await (
    await api(
      `/projects/${p.id}/conversation?before=${latest.conversationBefore}&limit=30`,
    )
  ).json();
  expect(older.turns).toHaveLength(30);
  expect(
    new Set([...latest.conversation, ...older.turns].map((t) => t.id)).size,
  ).toBe(60);
  expect(
    (await api(`/projects/${p.id}/conversation?before=missing`)).status,
  ).toBe(400);
});
it("does not invent historical dialogue for legacy projects", () => {
  const db = store(),
    p = newProject("Existing saved request", 500000);
  fs.writeFileSync(path.join(db.directory, p.id + ".json"), JSON.stringify(p));
  db.save(db.get(p.id));
  const turns = db.get(p.id).conversation!;
  expect(turns).toHaveLength(1);
  expect(turns[0].kind).toBe("snapshot");
  expect(turns[0].text).toContain("Earlier conversation was not recorded");
});
it("validates rig compatibility and interpolates actual clip poses", () => {
  const parsed = animationClipSchema.parse(clip);
  expect(sampleRotation(parsed, "Right Arm", 0.25)).toEqual([-0.75, 0, 0]);
  expect(sampleRotation(parsed, "Head", 0.5)).toEqual([0, 0, 0]);
  expect(sampleRotation(parsed, "Right Arm", 0.5)).not.toEqual(
    sampleRotation(parsed, "Right Arm", 0),
  );
  expect(animationClipSchema.safeParse({ ...clip, rig: "R15" }).success).toBe(
    false,
  );
  expect(
    animationClipSchema.safeParse({ ...clip, duration: 0.25 }).success,
  ).toBe(false);
  expect(
    animationClipSchema.safeParse({
      ...clip,
      tracks: [
        {
          ...clip.tracks[0],
          keys: [clip.tracks[0].keys[1], clip.tracks[0].keys[0]],
        },
      ],
    }).success,
  ).toBe(false);
});
it("persists imported clips and their provenance without changing or verifying the game", async () => {
  const { db, api } = await setup();
  const p = db.save(newProject("An animation preview game", 500000));
  const body = { id: randomUUID(), revision: 1, clip };
  expect((await api(`/projects/${p.id}/animations`, "POST", body)).status).toBe(
    200,
  );
  expect((await api(`/projects/${p.id}/animations`, "POST", body)).status).toBe(
    200,
  );
  const saved = db.get(p.id);
  expect(saved.animationClips).toHaveLength(1);
  expect(saved.animationClips![0].source).toBe("user-import");
  expect(saved.artifact).toBeNull();
  expect(saved.studioEvidence).toBeNull();
  expect(saved.conversation!.at(-1)?.animationId).toBe(body.id);
  expect(
    (
      await api(`/projects/${p.id}/animations`, "POST", {
        ...body,
        clip: { ...clip, name: "Other" },
      })
    ).status,
  ).toBe(409);
});
