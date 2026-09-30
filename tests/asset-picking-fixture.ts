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
import nativeTarget from "./fixtures/asset-roles/10161087974.json";
import nativeAnimation from "./fixtures/asset-roles/6125989440.json";
import nativeClimb from "./fixtures/asset-roles/6125989440-climb.json";
import { nativeRolesSchema } from "../src/marketplace/role-capture";

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
    plannerContexts: [] as any[],
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
        // Route contract mock: reuse real native structural output. Catalog IDs
        // and script fault injections below are not claims about those assets.
        nativeRoles: nativeRolesSchema.parse((m.assetId === animation.assetId ? nativeAnimation : nativeTarget).snapshot.nativeRoles),
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
      const pack = structuredClone(recordedAnimation.previewData.pack);
      // Refresh the selected published clip through the real native producer.
      pack.entries = pack.entries.filter(e => e.key === "1/20/1/1");
      pack.entries[0].clip = nativeClimb.clip;
      return animationPackSchema.parse(pack);
    },
  };
  const transport: typeof fetch = async (_url, init) => {
    state.calls++;
    const request = JSON.parse(String(init?.body));
    if (request.messages) {
      const context = JSON.parse(request.messages[1].content);
      state.plannerContexts.push(context);
      const { revision, hash, changed, ...raw } = recordedBrief.proposal;
      // The preserved proposal predates PC defaults. This offline planner response
      // uses the same content with its legacy touch controls translated to mouse.
      const draft = proposalDraftSchema.parse(
        JSON.parse(
          JSON.stringify(raw)
            .replaceAll(
              "Clicking (PC) or tapping (mobile/console equivalent)",
              "Clicking",
            )
            .replaceAll("click/tap", "click"),
        ),
      );
      draft.assetNeeds = draft.assetNeeds?.map((n) => ({
        ...n,
        selectedAssetId: context.gameContext?.selectedAssets?.assets.find(
          (a: any) => a.usage === n.id,
        )?.assetId ?? context.proposal?.assetNeeds?.find((need: any) => need.id === n.id)?.selectedAssetId,
      }));
      if (/straw dummy/i.test(context.edit?.text ?? "")) {
        draft.assetNeeds = draft.assetNeeds?.map(n => n.id === "targetDummy" ? { ...n, query: "straw dummy", selectedAssetId: undefined } : n);
      }
      return Response.json({
        choices: [{ message: { content: JSON.stringify(context.kind === "proposal-edit" ? { baseRevision: context.edit.baseRevision, baseHash: context.edit.baseHash, changes: [{ id: /arena|floor/i.test(context.edit.text) ? "environment" : "mechanics", value: { ...(/arena|floor/i.test(context.edit.text) ? draft.environment : draft.mechanics), text: (/arena|floor/i.test(context.edit.text) ? draft.environment.text : draft.mechanics.text) + " Updated from chat." } }], ...(/arena|floor/i.test(context.edit.text) ? {} : { assetNeeds: draft.assetNeeds }), summary: "Using the attached asset for its matching need." } : draft) } }],
        usage: { prompt_tokens: 100, completion_tokens: 100, cost: 0 },
      });
    }
    return Response.json({
      model: JEV_MODEL,
      answers: Object.fromEntries(
        Object.keys(request.questions).map((key) => [
          key,
          {
            ...(request.questions[key].type === "score"
              ? { type: "score", score: 0 }
              : {
                  type: "choice",
                  choice:
                    "yes" in request.questions[key].criteria
                      ? state.relevant
                        ? "yes"
                        : "no"
                      : Object.keys(request.questions[key].criteria)[0],
                }),
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
  engine.config.setKey(coding.id, "offline-fixture-key");
  const p: Project = engine.create(recordedBrief.request);
  p.rig = { selected: "R6", recommended: "R6", reason: "Explicit route-test choice matching the captured clip." };
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
