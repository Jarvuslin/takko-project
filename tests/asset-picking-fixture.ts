import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createApp } from "../src/server/app";
import { CreatorStore } from "../src/marketplace/creator-store";
import { metadataSchema, type AssetMetadata } from "../src/marketplace/types";
import { animationPackSchema } from "../src/marketplace/animations";
import {
  proposalDraftSchema,
  refreshProposal,
} from "../src/generation/proposal";
import {
  proposalQuestions,
  clearAnsweredQuestions,
} from "../src/generation/proposal-questions";
import { profile } from "./generation-fixtures";
import { JEV_MODEL } from "../src/generation/decisions";
import type { Project } from "../src/generation/schema";
import recordedPage from "./fixtures/creator-store/target-dummy-v2-20260929.json";
import recordedBrief from "./fixtures/asset-picking/real-proposal.json";
import recordedAnimation from "./fixtures/asset-picking/real-animation-pack.json";
import recordedSound from "./fixtures/asset-picking/real-sound.json";

export const pickerStudio = "392fce6b-fea7-4de3-bb2e-49a95231c3f5";
export async function pickerFixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "takko-picking-"));
  const source = new CreatorStore(async () => Response.json(recordedPage));
  const dummies = (await source.search("target dummy", "Model")).assets;
  const metadata = (a: {
    assetId: string;
    name: string;
    kind: string;
    creatorName: string;
    updated: string;
    versionId?: string;
    votes?: { up: number; down: number };
  }) =>
    metadataSchema.parse({
      assetId: a.assetId,
      name: a.name,
      kind: a.kind,
      creatorName: a.creatorName,
      updated: a.updated,
      versionId: a.versionId,
      votes: a.votes,
      isFree: true,
    });
  const animation = metadata(recordedAnimation),
    sound = metadata(recordedSound);
  const catalog = new Map(
    [...dummies, animation, sound].map((a) => [a.assetId, a]),
  );
  const state = {
    connected: true,
    relevant: true,
    scripts: 0,
    limited: false,
    blocked: false,
    delay: undefined as Promise<void> | undefined,
    searches: [] as string[],
    inspections: [] as string[],
    captures: [] as string[],
    calls: 0,
  };
  const provider = {
    studios: async () =>
      state.connected
        ? [{ id: pickerStudio, name: "Offline Studio fixture" }]
        : [],
    search: async (_s: string, query: string, kind: any) => {
      state.searches.push(query);
      return kind === "Audio"
        ? [sound]
        : /animat/i.test(query)
          ? [animation]
          : dummies;
    },
    metadata: async (_s: string, id: string) =>
      structuredClone(catalog.get(id)!),
    snapshot: async (_s: string, m: AssetMetadata) => {
      state.inspections.push(m.assetId);
      await state.delay;
      return {
        nodes: [
          { name: "Offline contract fixture", className: "Part" },
          ...Array.from({ length: state.scripts }, (_, i) => ({
            name: `Script${i}`,
            className: "Script",
          })),
        ],
        scripts: Array.from({ length: state.scripts }, (_, i) => ({
          name: `Script${i}`,
          source: state.blocked ? "require(123456)" : "local x = 1",
        })),
        complete: !state.limited,
        issues: state.limited ? ["Fixture capture limit"] : [],
      };
    },
    animations: async (_s: string, m: AssetMetadata) => {
      state.captures.push(m.assetId);
      return animationPackSchema.parse(recordedAnimation.previewData.pack);
    },
  };
  const transport: typeof fetch = async (_url, init) => {
    state.calls++;
    const request = JSON.parse(String(init?.body));
    return Response.json({
      model: JEV_MODEL,
      answers: Object.fromEntries(
        Object.keys(request.questions).map((key) => [
          key,
          {
            type: "choice",
            choice: state.relevant ? "yes" : "no",
            confidence: 0.95,
          },
        ]),
      ),
      usage: { input_tokens: 1000, output_tokens: 90, cost: 0.000042 },
    });
  };
  const app = createApp(directory, {
    env: {},
    marketplaceProvider: provider,
    transport,
  });
  const engine = app.locals.engine;
  const decision = {
    ...profile("openrouter"),
    baseUrl: "https://openrouter.ai/api/v1",
    model: JEV_MODEL,
    inputRate: 0.042,
    outputRate: 0,
  };
  const coding = profile();
  engine.config.save({
    profiles: [coding, decision],
    routes: {
      planner: [coding.id],
      builder: [coding.id],
      reviewer: [coding.id],
      repair: [],
      decisions: [decision.id],
    },
    budgetMicros: 8000000,
    repairLimit: 0,
  });
  engine.config.connect(decision, "offline-fixture-key");
  const p: Project = engine.create(recordedBrief.request);
  delete p.platform; // This fixture reproduces the existing pre-platform project.
  const { revision, hash, changed, ...draft } = recordedBrief.proposal;
  p.proposal = {
    ...proposalDraftSchema.parse(draft),
    revision: p.revision,
    hash,
    changed: [],
  };
  p.answers = { ...recordedBrief.answers };
  const questions = proposalQuestions(p);
  for (const q of questions) p.answers[q.id] = q.options[0].label;
  p.answerQuestions = Object.fromEntries(
    questions.map((q) => [q.id, q.source ?? q.prompt]),
  );
  clearAnsweredQuestions(p);
  p.proposal!.revision = p.revision;
  refreshProposal(p);
  engine.store.save(p);
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((r) => server.once("listening", r));
  const origin = `http://127.0.0.1:${(server.address() as any).port}`;
  const project = (): Project => engine.store.get(p.id);
  async function command(action: string, extra: Record<string, unknown> = {}) {
    const r = await fetch(`${origin}/api/projects/${p.id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revision: project().revision, ...extra }),
    });
    return { status: r.status, data: await r.json() };
  }
  await command("asset-picks");
  return {
    app,
    origin,
    state,
    project,
    command,
    catalog,
    dummies,
    animation,
    sound,
    provider,
    directory,
    search: async (groupId = "targetDummy", query = "target dummy") =>
      command("asset-picks/search", { groupId, query, studioId: pickerStudio }),
    choose: async (
      assetId = dummies[1].assetId,
      groupId = "targetDummy",
      keep = false,
    ) =>
      command("asset-picks/choose", {
        assetId,
        groupId,
        studioId: pickerStudio,
        keep,
      }),
    close: async () => {
      server.closeAllConnections();
      await new Promise<void>((r) => server.close(() => r()));
      if (
        path
          .resolve(directory)
          .startsWith(path.join(os.tmpdir(), "takko-picking-"))
      )
        fs.rmSync(directory, { recursive: true, force: true });
    },
  };
}
