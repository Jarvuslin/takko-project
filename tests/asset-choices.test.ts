import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Server } from "node:http";
import { createApp } from "../src/server/app";
import { assetSearches } from "../src/marketplace/discovery";
import {
  modelPreviewLuau,
  modelPreviewSchema,
} from "../src/marketplace/preview";
import { StudioMarketplace } from "../src/marketplace/studio";
import { gameContext } from "../src/generation/game-context";
import { suppliedAssetReferences } from "../src/generation/asset-provenance";
import {
  approvedAssetAdapter,
  buildAssetNeeds,
} from "../src/marketplace/approved-adapter";
import { conceptProposalFixture } from "./concept.fixture";
import { assessConcept } from "../src/generation/concept";
import { refreshProposal, proposalHash } from "../src/generation/proposal";
const studioId = "392fce6b-fea7-4de3-bb2e-49a95231c3f5";
const brief =
  "I want a combat game with basic fighting and a target dummy to practice with. I want animation for fighting, sprinting walking as well as sfx and vfx";

it("manual query searches return options without invoking model assessment", async () => {
  const f = await fixture();
  const p = await f.search();
  proposalProject(p);
  p.assetDiscovery.choices = { sound: { assetId: "201" } };
  p.assetDiscovery.pinned = ["sound"];
  f.app.locals.engine.store.save(p);
  const untouched = structuredClone(p.assetDiscovery.groups.slice(1));
  const originalSearch = f.provider.search.getMockImplementation()!;
  f.provider.search.mockImplementation(async (studio, query, kind) =>
    query === "training dummy" ? [] : originalSearch(studio, query, kind));
  const assess = vi.spyOn(f.app.locals.engine, "assessAssetChoices");
  const result = await f.command("asset-options", {
    studioId, groupId: p.assetDiscovery.groups[0].id, query: "training dummy",
  });
  expect(result.status).toBe(200);
  expect(result.data.assetDiscovery.groups[0].options).toHaveLength(4);
  expect(assess).not.toHaveBeenCalled();
  expect(f.provider.search).toHaveBeenLastCalledWith(studioId, "dummy", "Model");
  expect(result.data.assetDiscovery.groups.slice(1)).toEqual(untouched);
  expect(result.data.assetDiscovery.choices).toEqual(p.assetDiscovery.choices);
  expect(result.data.answers).toEqual(p.answers);
  expect(result.data.charges).toEqual(p.charges);
  expect(result.data.proposal.hash).toBe(proposalHash(result.data));
});
const clip = {
  version: 1 as const,
  name: "Punch",
  rig: "R6" as const,
  duration: 1,
  tracks: [
    {
      joint: "Right Arm",
      keys: [
        { time: 0, rotation: [0, 0, 0] },
        { time: 1, rotation: [1, 0, 0] },
      ],
    },
  ],
};
const dirs: string[] = [],
  servers: Server[] = [];
function proposalProject(p: any) {
  const section = {
    text: "Saved game content",
    assumptions: [],
    unresolved: [],
  };
  p.proposal = {
    title: "Combat proposal",
    mechanics: { ...section },
    theme: { ...section },
    environment: { ...section },
    revision: p.revision,
    hash: "",
    changed: [],
  };
  refreshProposal(p);
  return p;
}
async function fixture(request = brief) {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "takko-asset-choice-"),
  );
  dirs.push(directory);
  const provider = {
    studios: vi.fn(async () => [{ id: studioId, name: "Fixture" }]),
    search: vi.fn(async (_s: string, query: string, kind: any) =>
      [1, 2, 3, 4].map((i) => ({
        assetId: String((kind === "Audio" ? 200 : 100) + i),
        name: query + " " + i,
        kind,
        creatorName: "Fixture",
        updated: "v1",
      })),
    ),
    metadata: vi.fn(async (_s: string, id: string) => ({
      assetId: id,
      name: "Fixture " + id,
      kind: Number(id) > 200 ? ("Audio" as const) : ("Model" as const),
      creatorName: "Fixture",
      updated: "v1",
    })),
    snapshot: vi.fn(async () => ({
      nodes: [{ name: "Fixture", className: "Part" }],
      scripts: [],
      complete: true,
      issues: [],
    })),
    animations: vi.fn(async (_s: string, m: any) => ({
      assetId: m.assetId,
      name: m.name,
      revisionKey: "updated:v1",
      entries: [{ key: "punch", name: "Punch", animationId: "333", clip }],
    })),
    preview: vi.fn(async () => ({
      parts: [
        {
          name: "Body",
          shape: "Block" as const,
          size: [2, 2, 1],
          frame: [0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
          color: [0.5, 0.5, 0.5],
          transparency: 0,
        },
      ],
      omitted: 0,
      effects: 0,
    })),
  };
  const app = createApp(directory, {
    env: {},
    marketplaceProvider: provider as any,
  });
  const server = app.listen(0, "127.0.0.1");
  servers.push(server);
  await new Promise<void>((r) => server.once("listening", r));
  const origin = "http://127.0.0.1:" + (server.address() as any).port;
  const post = async (route: string, body: unknown) => {
    const r = await fetch(origin + "/api/" + route, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: r.status, data: await r.json() };
  };
  let p = (await post("projects", { request })).data;
  const command = (action: string, extra = {}) =>
    post(`projects/${p.id}/${action}`, { revision: p.revision, ...extra });
  const search = async () => {
    p = (await command("asset-options", { studioId })).data;
    return p;
  };
  const approveBrief = async () => {
    p = (await command("approve-brief")).data;
    return p;
  };
  const preview = async (groupId: string, assetId = "101") => {
    p = (
      await command("asset-preview", {
        discoveryId: p.assetDiscovery.id,
        groupId,
        assetId,
      })
    ).data;
    return p;
  };
  const choices = () =>
    Object.fromEntries(
      p.assetDiscovery.groups.map((g: any) => [g.id, { skip: true }]),
    );
  return {
    app,
    provider,
    post,
    command,
    search,
    preview,
    approveBrief,
    choices,
    project: () => p,
    directory,
  };
}
it("offers the preserved raw-only mapped pack for Studio asset choices", async () => {
  const f = await fixture();
  const real = JSON.parse(
    fs.readFileSync(
      "docs/results/opencode-step3-live-20260925/terminal-project.json",
      "utf8",
    ),
  );
  const group = real.assetDiscovery.groups.find(
    (g: any) => g.preview === "animation",
  );
  const pack = group.options.find((o: any) => o.previewData?.pack).previewData
    .pack;
  f.provider.animations.mockImplementation(async (_s, m) => ({
    ...structuredClone(pack),
    assetId: m.assetId,
    revisionKey: "updated:v1",
  }));
  const result = await f.search();
  const animationGroups = result.assetDiscovery.groups.filter(
    (g: any) => g.preview === "animation",
  );
  expect(animationGroups.length).toBeGreaterThan(0);
  expect(animationGroups.every((g: any) => g.options.length > 0)).toBe(true);
  expect(animationGroups.every((g: any) => !g.error)).toBe(true);
  await f.approveBrief();
  const chosen = animationGroups[0];
  const approved = await f.command("approve-assets", {
    discoveryId: result.assetDiscovery.id,
    choices: {
      ...f.choices(),
      [chosen.id]: {
        assetId: chosen.options[0].assetId,
        clipKey: pack.entries[0].key,
        kept: true,
      },
    },
  });
  expect(approved.status).toBe(200);
  expect(approved.data.assetDiscovery.choices[chosen.id].clipKey).toBe(
    pack.entries[0].key,
  );
});

it("filters run exclusions before inspecting or recommending actual preserved animation candidates",async()=>{
  for(const run of ["opencode-step3-live-20260925","opencode-fighting-live-20260924"]) {
    const f=await fixture();
    const real=JSON.parse(fs.readFileSync(`docs/results/${run}/terminal-project.json`,"utf8"));
    const group=real.assetDiscovery.groups.find((g:any)=>g.preview==="animation");
    const option=group.options.find((o:any)=>o.previewData?.pack);
    expect(option).toBeTruthy();
    f.provider.search.mockImplementation(async()=>[structuredClone(option)]);
    const file=path.join(f.directory,f.project().id+".json");
    const p=JSON.parse(fs.readFileSync(file,"utf8"));
    p.excludedAssetIds=[option.assetId];
    fs.writeFileSync(file,JSON.stringify(p));
    await f.approveBrief();
    const result=await f.search();
    expect(result.assetDiscovery.groups.flatMap((g:any)=>g.options).some((o:any)=>o.assetId===option.assetId)).toBe(false);
    expect(f.provider.animations).not.toHaveBeenCalled();
  }
});

for (const packFile of [
  "docs/results/asset-evidence-selection-20260926/captured-pack-12061946559.json",
  "docs/results/asset-evidence-selection-20260926/captured-pack-77935648543779.json",
]) it(`leaves an unresolved real multi-clip pack unselected: ${packFile}`, async () => {
  const real = JSON.parse(fs.readFileSync("docs/results/approved-reference-finish-20260927/terminal-project.json", "utf8"));
  const pack = JSON.parse(fs.readFileSync(packFile, "utf8"));
  const f = await fixture(real.request);
  f.provider.animations.mockImplementation(async (_s, m) => ({...pack, assetId:m.assetId, revisionKey:"updated:v1"}));
  f.app.locals.engine.store.save({...f.project(), proposal: {...real.proposal, approval:undefined}});
  const p = await f.search();
  const groups = p.assetDiscovery.groups.filter((g:any)=>g.preview==="animation");
  expect(groups.length).toBeGreaterThan(0);
  for(const g of groups) {
    expect(p.assetDiscovery.choices?.[g.id]?.clipKey).toBeUndefined();
    expect(p.assetDiscovery.choices?.[g.id]?.assetId).toBeUndefined();
    expect(g.options.some((o:any)=>o.previewData?.pack?.entries.length)).toBe(true);
  }
  expect(p.assetDiscovery.approved).not.toBe(true);
});
it("captures the ten highest vote priors completely while retaining the rest of the search page", async () => {
  const f = await fixture("Punching animation");
  const real = JSON.parse(
    fs.readFileSync(
      "docs/results/asset-evidence-selection-20260926/captured-pack-12061946559.json",
      "utf8",
    ),
  );
  f.provider.search.mockImplementation(async () =>
    Array.from({ length: 30 }, (_, i) => ({
      assetId: String(100 + i),
      name: "Listing " + i,
      kind: "Model",
      creatorName: "Fixture",
      updated: "v1",
      votes: { up: i, down: 0 },
    })),
  );
  f.provider.animations.mockImplementation(async (_s, m) => ({
    ...real,
    assetId: m.assetId,
    revisionKey: "updated:v1",
  }));
  const p = await f.search();
  const g = p.assetDiscovery.groups[0];
  expect(g.options).toHaveLength(30);
  expect(g.options.filter((o: any) => o.previewData?.pack)).toHaveLength(10);
  expect(g.options[0].assetId).toBe("129");
  expect(g.options[0].votes).toEqual({ up: 29, down: 0 });
  expect(f.provider.animations).toHaveBeenCalledTimes(10);
  for (const call of f.provider.animations.mock.calls as any[])
    expect(call[2]).toBe(100);
});
it("persists spec-origin need links through discovery and refresh without relying on the raw brief keywords", async () => {
  const f = await fixture("A fishing pond");
  const p = f.project();
  p.spec = JSON.parse(
    fs.readFileSync(
      "docs/results/opencode-fighting-live-20260924/terminal-project.json",
      "utf8",
    ),
  ).spec;
  f.app.locals.engine.store.save(p);
  const found = await f.search();
  expect(found.assetDiscovery.groups.map((g: any) => g.assetNeedId)).toEqual(
    p.spec.assetNeeds.map((n: any) => n.id),
  );
  expect(found.assetDiscovery.groups.map((g: any) => g.query)).toEqual(
    p.spec.assetNeeds.map((n: any) => n.query),
  );
  const refreshed = await f.command("asset-options", {
    studioId,
    refresh: true,
  });
  expect(refreshed.status).toBe(200);
  expect(
    refreshed.data.assetDiscovery.groups.map((g: any) => g.assetNeedId),
  ).toEqual(p.spec.assetNeeds.map((n: any) => n.id));
  const disk = JSON.parse(
    fs.readFileSync(path.join(f.directory, p.id + ".json"), "utf8"),
  );
  expect(disk.assetDiscovery.groups.map((g: any) => g.assetNeedId)).toEqual(
    p.spec.assetNeeds.map((n: any) => n.id),
  );
});

it("keeps inspected recommendations available without defaulting an embedded clip", async () => {
  const f = await fixture();
  f.app.locals.engine.store.save(proposalProject(f.project()));
  const p = await f.search();
  expect(p.assetDiscovery.approved).not.toBe(true);
  expect(p.assetDiscovery.choices.combat).toBeUndefined();
  expect(p.assetDiscovery.groups.find((g:any)=>g.id==="combat").options[0].previewData.pack.entries.length).toBeGreaterThan(0);
  expect(p.proposal.approval).toBeUndefined();
  expect(p.proposal.hash).toBe(proposalHash(p));
  expect(f.provider.snapshot).toHaveBeenCalled();
});
it("replaces one approved recommendation, preserving other choices and pinning the override", async () => {
  const f = await fixture();
  f.app.locals.engine.store.save(proposalProject(f.project()));
  const searched = await f.search();
  const selected={...searched.assetDiscovery.choices};
  for(const group of searched.assetDiscovery.groups) if(group.preview==="animation") {
    const option=group.options.find((o:any)=>o.previewData?.pack?.entries.length);
    selected[group.id]={assetId:option.assetId,clipKey:option.previewData.pack.entries[0].key};
  }
  const accepted=await f.command("approve-assets",{discoveryId:searched.assetDiscovery.id,choices:Object.fromEntries(Object.entries(selected).map(([id,c]:[string,any])=>[id,{...c,kept:true}]))});
  expect(accepted.status).toBe(200);
  const p=accepted.data;
  p.proposal.approval = {
    hash: p.proposal.hash,
    revision: p.revision,
    at: new Date().toISOString(),
  };
  p.artifact = {
    files: [
      {
        path: `ServerScriptService/${p.scope}/old.server.luau`,
        kind: "Script",
        source: "print('retained')",
      },
    ],
    scene: [],
    coverage: [],
    assets: [],
  };
  p.completedBuildTasks = ["original"];
  f.app.locals.engine.store.save(p);
  const choices = { ...p.assetDiscovery.choices, dummy: { assetId: "102" } };
  const r = await f.command("approve-assets", {
    discoveryId: p.assetDiscovery.id,
    choices,
    revision:p.revision,
  });
  expect(r.status).toBe(200);
  expect(r.data.assetDiscovery.choices).toEqual(choices);
  expect(r.data.assetDiscovery.pinned).toEqual(expect.arrayContaining(["dummy"]));
  for(const id of p.assetDiscovery.pinned??[]) expect(r.data.assetDiscovery.pinned).toContain(id);
  expect(r.data.proposal.mechanics).toEqual(p.proposal.mechanics);
  expect(r.data.proposal.theme).toEqual(p.proposal.theme);
  expect(r.data.proposal.approval).toBeUndefined();
  expect(r.data.artifact).toEqual(p.artifact);
  expect(r.data.completedBuildTasks).toEqual(p.completedBuildTasks);
  const refreshed = await f.post(`projects/${p.id}/asset-options`, {
    revision: r.data.revision,
    studioId,
    groupId: "dummy",
    query: "different dummy",
  });
  expect(refreshed.status).toBe(200);
  expect(refreshed.data.assetDiscovery.choices.dummy.assetId).toBe("102");
});
it("rejects changed content at exact proposal approval and retains the prior proposal", async () => {
  const f = await fixture("A practice dummy");
  f.app.locals.engine.store.save(proposalProject(f.project()));
  const p = await f.search();
  f.provider.metadata.mockImplementation(async (_s, id) => ({
    assetId: id,
    name: "Changed",
    kind: "Model",
    creatorName: "Fixture",
    updated: "v2",
  }));
  const r = await f.command("approve-proposal", { hash: p.proposal.hash });
  expect(r.status).toBe(409);
  const saved = f.app.locals.engine.store.get(p.id);
  expect(saved.proposal).toEqual(p.proposal);
  expect(saved.assetAttachments).toEqual(p.assetAttachments);
  expect(saved.proposal.approval).toBeUndefined();
});
it("retains the proposal if a replacement inspection fails", async () => {
  const f = await fixture("A practice dummy");
  f.app.locals.engine.store.save(proposalProject(f.project()));
  const p = await f.search();
  f.provider.snapshot.mockRejectedValueOnce(Error("Inspection failed"));
  const r = await f.command("approve-assets", {
    discoveryId: p.assetDiscovery.id,
    choices: { dummy: { assetId: "102" } },
  });
  expect(r.status).toBeGreaterThanOrEqual(400);
  expect(f.app.locals.engine.store.get(p.id).proposal).toEqual(p.proposal);
  expect(f.app.locals.engine.store.get(p.id).assetDiscovery.choices).toEqual(
    p.assetDiscovery.choices,
  );
});
it("binds richer inspected version metadata to automatic recommendations for any game", async () => {
  const f = await fixture("A fishing pond with a dock");
  f.provider.metadata.mockImplementation(async (_s, id) => ({
    assetId: id,
    name: "Dock",
    kind: "Model",
    creatorName: "Fixture",
    updated: "v1",
    versionId: "9001",
  }));
  f.app.locals.engine.store.save(proposalProject(f.project()));
  const p = await f.search();
  expect(p.assetDiscovery.approved).toBe(true);
  expect(p.assetAttachments[0].revisionKey).toBe("version:9001");
  const g = p.assetDiscovery.groups[0];
  expect(
    g.options.find(
      (o: any) => o.assetId === p.assetDiscovery.choices[g.id].assetId,
    ).versionId,
  ).toBe("9001");
  expect(p.proposal.hash).toBe(proposalHash(p));
});
it("saves an unpreviewed selection when inspection adds a version without changing its listed timestamp", async () => {
  const f = await fixture("A fishing pond with a dock");
  const p = await f.search();
  f.app.locals.engine.store.save(proposalProject(p));
  f.provider.metadata.mockImplementation(async (_s, id) => ({
    assetId: id,
    name: "Dock",
    kind: "Model",
    creatorName: "Fixture",
    updated: "v1",
    versionId: "9001",
  }));
  const groupId = p.assetDiscovery.groups[0].id;
  const r = await f.command("approve-assets", {
    discoveryId: p.assetDiscovery.id,
    choices: { ...f.choices(), [groupId]: { assetId: "101" } },
  });
  expect(r.status).toBe(200);
  expect(r.data.assetDiscovery.groups[0].options[0].versionId).toBe("9001");
  expect(r.data.assetAttachments[0].revisionKey).toBe("version:9001");
  expect(r.data.proposal.mechanics).toEqual(p.proposal.mechanics);
  expect(r.data.proposal.hash).toBe(proposalHash(r.data));
});
it("refreshes displayed identity after an explicit preview and still rejects a later version change", async () => {
  const f = await fixture("A fishing pond with a dock");
  const p = await f.search();
  f.app.locals.engine.store.save(proposalProject(p));
  let versionId = "9001";
  f.provider.metadata.mockImplementation(async (_s, id) => ({
    assetId: id,
    name: "Dock",
    kind: "Model",
    creatorName: "Fixture",
    updated: "v1",
    versionId,
  }));
  const groupId = p.assetDiscovery.groups[0].id;
  const previewed = await f.preview(groupId);
  expect(previewed.assetDiscovery.groups[0].options[0].versionId).toBe("9001");
  versionId = "9002";
  const r = await f.command("approve-assets", {
    discoveryId: p.assetDiscovery.id,
    choices: { ...f.choices(), [groupId]: { assetId: "101" } },
  });
  expect(r.status).toBe(409);
  expect(f.app.locals.engine.store.get(p.id).proposal).toEqual(
    previewed.proposal,
  );
  expect(f.app.locals.engine.store.get(p.id).assetDiscovery).toEqual(
    previewed.assetDiscovery,
  );
});
it("appends real provider pages, retains candidates and rejects stale or mismatched cursors", async () => {
  const f = await fixture("A practice dummy");
  const page = vi.fn(
    async (_s: string, _q: string, kind: any, cursor?: string) => ({
      assets: Array.from({ length: 30 }, (_, i) => ({
        assetId: String((cursor ? 120 : 100) + i),
        name: "Dummy",
        kind,
        creatorName: "Fixture",
        updated: "v1",
      })),
      nextCursor: cursor ? undefined : "source-cursor",
      total: 50,
    }),
  );
  (f.provider as any).searchPage = page;
  const first = await f.search();
  expect(first.assetDiscovery.groups[0].options).toHaveLength(30);
  const groupId = first.assetDiscovery.groups[0].id;
  const body = {
    studioId,
    groupId,
    discoveryId: first.assetDiscovery.id,
    cursor: "source-cursor",
  };
  expect(
    (await f.command("asset-options", { ...body, cursor: "invented" })).status,
  ).toBe(409);
  expect(
    (await f.command("asset-options", { ...body, query: "changed query" }))
      .status,
  ).toBe(409);
  const second = await f.command("asset-options", body);
  expect(second.status).toBe(200);
  expect(second.data.assetDiscovery.groups[0].options).toHaveLength(50);
  expect(second.data.assetDiscovery.groups[0].options[0].assetId).toBe("100");
  expect(second.data.assetDiscovery.groups[0].nextCursor).toBeUndefined();
  expect((await f.command("asset-options", body)).status).toBe(409);
  expect(page).toHaveBeenCalledTimes(2);
});
afterEach(async () => {
  for (const s of servers.splice(0))
    await new Promise<void>((r) => s.close(() => r()));
  for (const d of dirs.splice(0))
    fs.rmSync(d, { recursive: true, force: true });
});
describe("brief asset review", () => {
  it("derives all six requested combat roles without a model call or invented IDs", () => {
    const groups = assetSearches({
      request: brief,
      answers: {},
      briefChanges: [],
    });
    expect(groups.map((g) => g.id)).toEqual([
      "dummy",
      "combat",
      "sprint",
      "walk",
      "sound",
      "effects",
    ]);
    expect(
      groups
        .filter((g) => g.preview === "animation")
        .every((g) => g.kind === "Model"),
    ).toBe(true);
    expect(
      assetSearches({ request: "A fishing pond", answers: {} })[0].query,
    ).toContain("fishing");
    expect(
      assetSearches({ request: brief, answers: { rig: "R15" } })[1].query,
    ).toContain("R15");
  });
  it("keeps every actual option per role and caches the revision without inference", async () => {
    const f = await fixture();
    const p = await f.search();
    expect(p.assetDiscovery.groups).toHaveLength(6);
    expect(
      p.assetDiscovery.groups.every((g: any) => g.options.length === 4),
    ).toBe(true);
    await f.search();
    expect(f.provider.search).toHaveBeenCalledTimes(6);
    expect(p.charges).toEqual([]);
    expect(p.assetAttachments).toBeUndefined();
  });
  it("retains partial errors, supports custom searches and rejects stale discovery IDs", async () => {
    const f = await fixture();
    f.provider.search.mockRejectedValueOnce(Error("offline"));
    let p = await f.search();
    expect(p.assetDiscovery.groups[0].error).toContain("Search failed");
    const oldId = p.assetDiscovery.id;
    p = (
      await f.command("asset-options", {
        studioId,
        groupId: "dummy",
        query: "wooden training dummy",
      })
    ).data;
    expect(p.assetDiscovery.groups[0].query).toBe("wooden training dummy");
    expect(p.assetDiscovery.groups[0].options).toHaveLength(4);
    expect(
      (
        await f.command("asset-preview", {
          discoveryId: oldId,
          groupId: "dummy",
          assetId: "101",
        })
      ).status,
    ).toBe(409);
  });
  it("requires explicit brief approval and complete choices", async () => {
    const f = await fixture();
    const p = await f.search();
    expect(
      (
        await f.command("approve-assets", {
          discoveryId: p.assetDiscovery.id,
          choices: f.choices(),
        })
      ).status,
    ).toBe(409);
    await f.approveBrief();
    expect(
      (
        await f.command("approve-assets", {
          discoveryId: p.assetDiscovery.id,
          choices: {},
        })
      ).status,
    ).toBe(400);
    expect((await f.command("plan")).data.error).toContain("asset choices");
    expect(f.provider.snapshot).not.toHaveBeenCalled();
  });
  it("previews a real clip, persists inspected choices and sends exact references to the planner", async () => {
    const f = await fixture();
    await f.search();
    await f.approveBrief();
    const p = await f.preview("combat");
    const choices = {
      ...f.choices(),
      combat: { assetId: "101", clipKey: "punch", kept: true },
      walk: { skip: true },
    };
    const result = await f.command("approve-assets", {
      discoveryId: p.assetDiscovery.id,
      choices,
    });
    expect(result.status).toBe(200);
    const next = result.data;
    expect(next.revision).toBe(2);
    expect(next.briefApprovedRevision).toBe(2);
    expect(next.assetAttachments[0].usage).toContain("rbxassetid://333");
    expect(next.assetDiscovery.approved).toBe(true);
    expect(suppliedAssetReferences(next)).toContain("333");
    const stale = structuredClone(next);
    stale.revision++;
    expect(suppliedAssetReferences(stale)).not.toContain("333");
    expect(
      gameContext(next).assetChoices?.groups.find(
        (g) => g.role === "Walk animation",
      )?.choice,
    ).toEqual({ skip: true });
    expect(next.charges).toEqual([]);
    expect(next.jobId).toBeNull();
    expect(
      JSON.parse(
        fs.readFileSync(path.join(f.directory, next.id + ".json"), "utf8"),
      ).assetDiscovery.approved,
    ).toBe(true);
  });
  it("does not approve unseen clips or arbitrary asset IDs", async () => {
    const f = await fixture();
    const p = await f.search();
    await f.approveBrief();
    for (const choice of [
      { assetId: "999" },
      { assetId: "101", clipKey: "invented" },
    ]) {
      expect(
        (
          await f.command("approve-assets", {
            discoveryId: p.assetDiscovery.id,
            choices: { ...f.choices(), combat: choice },
          })
        ).status,
      ).toBe(400);
    }
    expect(f.provider.snapshot).not.toHaveBeenCalled();
  });
  it("fails closed for unsafe sources without partially saving selections", async () => {
    const f = await fixture();
    const p = await f.search();
    await f.approveBrief();
    f.provider.snapshot.mockResolvedValueOnce({
      nodes: [],
      scripts: [{ name: "Bad", source: 'loadstring("bad")()' }],
      complete: true,
      issues: [],
    } as any);
    const r = await f.command("approve-assets", {
      discoveryId: p.assetDiscovery.id,
      choices: { ...f.choices(), dummy: { assetId: "101" } },
    });
    expect(r.status).toBe(400);
    expect(r.data.error).toContain("source review");
    expect(
      f.app.locals.engine.store.get(p.id).assetAttachments,
    ).toBeUndefined();
  });
  it("invalidates approval and retains the original options on changed briefs", async () => {
    const f = await fixture();
    const p = await f.search();
    await f.approveBrief();
    const next = f.app.locals.engine.revise(
      p.id,
      p.revision,
      "Make a racing game instead",
      {},
    );
    expect(next.assetDiscovery).toEqual({...p.assetDiscovery,revision:next.revision,approved:false});
    expect(next.briefApprovedRevision).toBeUndefined();
    expect((await f.command("approve-brief")).status).toBe(409);
  });
  it("preserves the accepted concept while attaching assets without another clarification loop", async () => {
    const f = await fixture("Pet rescue with animation");
    let p = f.project();
    p.concept = assessConcept(conceptProposalFixture(false), p);
    f.app.locals.engine.store.save(p);
    await f.search();
    await f.approveBrief();
    p = f.project();
    const r = await f.command("approve-assets", {
      discoveryId: p.assetDiscovery.id,
      choices: f.choices(),
    });
    expect(r.status).toBe(200);
    expect(r.data.concept.revision).toBe(2);
    expect(r.data.conceptAcceptedRevision).toBe(2);
  });
  it("does not approve unresolved concepts", async () => {
    const f = await fixture();
    const p = f.project();
    p.concept = assessConcept(conceptProposalFixture(true), p);
    f.app.locals.engine.store.save(p);
    expect((await f.command("approve-brief")).status).toBe(409);
  });
  it("saves geometry previews and errors honestly without attaching assets", async () => {
    const f = await fixture();
    await f.search();
    let p = await f.preview("dummy");
    expect(
      p.assetDiscovery.groups[0].options[0].previewData.model.parts,
    ).toHaveLength(1);
    f.provider.preview.mockRejectedValueOnce(Error("unavailable"));
    p = await f.preview("effects");
    expect(p.assetDiscovery.groups[5].options[0].previewError).toContain(
      "could not load",
    );
    expect(p.assetAttachments).toBeUndefined();
  });
  it("maps the legacy Animation search type to Creator Store model packs", async () => {
    const callTool = vi.fn(async () => ({
      scope: "creator_store",
      results: [
        {
          assetId: "123",
          name: "Pack",
          source: "creator_store",
          assetType: "Model",
          isFree: true,
          priceCents: 0,
        },
      ],
    }));
    const provider = new StudioMarketplace(
      () => ({ callTool, close: async () => {} }) as any,
    );
    expect((await provider.search(studioId, "walk", "Animation"))[0].kind).toBe(
      "Model",
    );
    expect(callTool.mock.calls[0]).toEqual([
      "search_asset",
      expect.objectContaining({ assetType: "Model", priceFilter: "free" }),
    ]);
  });
  it("blocks a brief mutation while search is active and retains a search error", async () => {
    const f = await fixture();
    const p = f.project();
    f.provider.search.mockImplementationOnce(async () => {
      f.app.locals.engine.revise(
        p.id,
        p.revision,
        "A fishing game instead",
        {},
      );
      return [];
    });
    const r = await f.command("asset-options", { studioId });
    expect(r.status).toBe(200);
    expect(f.app.locals.engine.store.get(p.id).request).toBe(p.request);
    expect(r.data.assetDiscovery.groups[0].error).toContain(
      "Asset work is running",
    );
  });
  it("rejects animation version changes after preview", async () => {
    const f = await fixture();
    await f.search();
    await f.approveBrief();
    const p = await f.preview("combat");
    f.provider.metadata.mockResolvedValueOnce({
      assetId: "101",
      name: "Changed",
      kind: "Model",
      creatorName: "Fixture",
      updated: "v2",
    });
    const r = await f.command("approve-assets", {
      discoveryId: p.assetDiscovery.id,
      choices: { ...f.choices(), combat: { assetId: "101", clipKey: "punch", kept: true } },
    });
    expect(r.status).toBe(409);
    expect(f.app.locals.engine.store.get(p.id).revision).toBe(1);
  });
  it("supports explicitly deferring discovery without claiming any asset was found", async () => {
    const f = await fixture();
    expect((await f.command("defer-assets")).status).toBe(409);
    await f.approveBrief();
    const r = await f.command("defer-assets");
    expect(r.status).toBe(200);
    expect(r.data.assetDiscovery.approved).toBe(true);
    expect(
      r.data.assetDiscovery.groups.every((g: any) => g.options.length === 0),
    ).toBe(true);
    expect(r.data.assetDiscovery.choices.combat).toEqual({ skip: true });
    expect(f.provider.search).not.toHaveBeenCalled();
    expect(r.data.charges).toEqual([]);
  });
  it("only treats the chosen clip as provided, not every previewed animation", async () => {
    const f = await fixture();
    await f.search();
    await f.approveBrief();
    const p = await f.preview("combat");
    p.assetDiscovery.groups[1].options[0].previewData.pack.entries.push({
      key: "other",
      name: "Other",
      animationId: "999999",
      clip,
    });
    f.app.locals.engine.store.save(p);
    const r = await f.command("approve-assets", {
      discoveryId: p.assetDiscovery.id,
      choices: { ...f.choices(), combat: { assetId: "101", clipKey: "punch", kept: true } },
    });
    expect(r.status).toBe(200);
    expect(suppliedAssetReferences(r.data)).toContain("333");
    expect(suppliedAssetReferences(r.data)).not.toContain("999999");
  });
  it("bounds preview data and never parents loaded assets into the place", () => {
    const source = modelPreviewLuau("123");
    expect(source).toContain("root:Destroy()");
    expect(source).toContain("item.Enabled=false");
    expect(source).not.toMatch(/\.Parent\s*=(?!=)/);
    expect(() => modelPreviewLuau("123; bad()")).toThrow();
    expect(
      modelPreviewSchema.safeParse({ parts: [], omitted: 0, effects: 1 })
        .success,
    ).toBe(true);
  });
  it("offers only approved references to the build and blocks silent replacements", async () => {
    const f = await fixture();
    await f.search();
    await f.approveBrief();
    const p = await f.preview("combat");
    const r = await f.command("approve-assets", {
      discoveryId: p.assetDiscovery.id,
      choices: { ...f.choices(), combat: { assetId: "101", clipKey: "punch", kept: true } },
    });
    const native = {
      search: vi.fn(),
      inspect: vi.fn(async () => "inspected"),
      discoverComponentAudio: vi.fn(),
      identity: "fixture",
    };
    const adapter = approvedAssetAdapter(native as any, r.data);
    const results = await adapter.search(
      { kind: "Model", role: "combat" } as any,
      "other models",
      new AbortController().signal,
    );
    expect(results.candidates.map((c) => c.id)).toEqual(["101"]);
    expect(native.search).not.toHaveBeenCalled();
    expect(adapter.discoverComponentAudio).toBeUndefined();
    await expect(
      adapter.search(
        { kind: "Audio", role: "impact" } as any,
        "impact",
        new AbortController().signal,
      ),
    ).rejects.toThrow("No approved asset");
    expect(() =>
      adapter.inspect(
        {} as any,
        { id: "999", kind: "Model" } as any,
        "attempt",
        new AbortController().signal,
      ),
    ).toThrow("not approved");
    await adapter.inspect(
      { kind: "Model", role: "combat" } as any,
      results.candidates[0],
      "attempt",
      new AbortController().signal,
    );
    expect(native.inspect).toHaveBeenCalledTimes(1);
  });
  it("does not offer approved combat models for an unrelated optional backdrop", async () => {
    const f = await fixture();
    await f.search();
    await f.approveBrief();
    const p = await f.preview("combat");
    const r = await f.command("approve-assets", {
      discoveryId: p.assetDiscovery.id,
      choices: { ...f.choices(), combat: { assetId: "101", clipKey: "punch", kept: true } },
    });
    const native = { identity: "fixture", search: vi.fn(), inspect: vi.fn() };
    const adapter = approvedAssetAdapter(native as any, r.data);
    const signal = new AbortController().signal;
    const backdrop = {
      kind: "Model",
      role: "Arena backdrop",
      requirementId: "walls",
      query: "cartoon arena",
      constraints: "Decoration",
      required: false,
    } as any;
    expect(
      (await adapter.search(backdrop, "cartoon arena", signal)).candidates,
    ).toEqual([]);
    expect(
      (await adapter.search(backdrop, "boxing stage", signal)).candidates,
    ).toEqual([]);
    expect(native.search).not.toHaveBeenCalled();
    expect(() =>
      adapter.inspect(
        backdrop,
        { id: "101", kind: "Model" } as any,
        "attempt",
        signal,
      ),
    ).toThrow("not approved for");
    r.data.spec = {
      requirements: [
        {
          id: "punch",
          description: "The player visibly swings an arm when punching",
          acceptance: "Visible swing",
        },
      ],
      assetNeeds: [
        {
          id: "punchMotion",
          requirementId: "punch",
          role: "Fighting animation",
          kind: "Animation",
          query: "punch animation",
          constraints: "A visible arm swing",
          required: true,
          position: [0, 3, 0],
          maxSize: 12,
        },
      ],
    };
    const linked = approvedAssetAdapter(native as any, r.data);
    expect(
      (
        await linked.search(
          {
            ...backdrop,
            id: "punchMotion",
            requirementId: "punch",
            required: true,
          },
          "punch",
          signal,
        )
      ).candidates.map((c) => c.id),
    ).toEqual(["101"]);
    expect(buildAssetNeeds(r.data)).toEqual([
      expect.objectContaining({
        requirementId: "punch",
        kind: "Model",
        id: "punchMotion",
        required: false,
      }),
    ]);
    r.data.spec.requirements = [];
    expect(() => buildAssetNeeds(r.data)).toThrow("linked requirement");
  });
  it("reopens choices without typing and invalidates the previous plan", async () => {
    const f = await fixture();
    await f.search();
    await f.approveBrief();
    const p = f.project();
    const r = await f.command("approve-assets", {
      discoveryId: p.assetDiscovery.id,
      choices: f.choices(),
    });
    const reopened = await f.post(`projects/${p.id}/reopen-assets`, {
      revision: r.data.revision,
    });
    expect(reopened.status).toBe(200);
    expect(reopened.data.revision).toBe(3);
    expect(reopened.data.assetDiscovery.approved).toBe(false);
    expect(reopened.data.briefApprovedRevision).toBe(3);
    expect(reopened.data.spec).toBeNull();
    expect(reopened.data.approvedRevision).toBeNull();
  });
});

it("retains captured options while a clip choice is pending when discovery preceded the proposal", async () => {
  const f = await fixture();
  const searched = await f.search();
  const calls = f.provider.search.mock.calls.length;
  f.app.locals.engine.store.save(proposalProject(searched));
  const p = await f.search();
  expect(p.assetDiscovery.approved).not.toBe(true);
  expect(p.assetDiscovery.groups[0].options).toEqual(
    searched.assetDiscovery.groups[0].options,
  );
  expect(f.provider.search.mock.calls.length).toBe(calls);
});

it("retains a previewed coverage-limited selection only with acknowledgement", async () => {
  const f = await fixture("A target dummy");
  f.provider.snapshot.mockResolvedValue(
    JSON.parse(
      fs.readFileSync(
        "docs/results/opencode-motion-live-20260926/inspection-evidence/14056318312.json",
        "utf8",
      ),
    ).snapshot,
  );
  f.app.locals.engine.store.save(proposalProject(f.project()));
  let p = await f.search();
  expect(p.assetDiscovery.approved).not.toBe(true);
  expect(
    p.assetDiscovery.groups[0].options[0].inspectionLimitations.length,
  ).toBeGreaterThan(0);
  p = await f.preview(p.assetDiscovery.groups[0].id);
  const choices = { [p.assetDiscovery.groups[0].id]: { assetId: "101" } };
  const denied = await f.command("approve-assets", {
    discoveryId: p.assetDiscovery.id,
    choices,
  });
  expect(denied.status).toBe(400);
  expect(denied.data.error).toContain("coverage");
  const accepted = await f.command("approve-assets", {
    discoveryId: p.assetDiscovery.id,
    choices: {
      [p.assetDiscovery.groups[0].id]: {
        assetId: "101",
        acknowledgeInspectionLimitations: true,
        kept: true,
      },
    },
  });
  expect(accepted.status).toBe(200);
  expect(
    accepted.data.assetAttachments[0].inspectionLimitations.length,
  ).toBeGreaterThan(0);
});
