import { afterEach, expect, it, vi } from "vitest";
import { pickerFixture, pickerStudio } from "./asset-picking-fixture";
import { pickStatus } from "../src/marketplace/pick-status";
import { GenerationStore } from "../src/generation/store";
const fixtures: Awaited<ReturnType<typeof pickerFixture>>[] = [];
async function fixture() {
  const f = await pickerFixture();
  fixtures.push(f);
  return f;
}
afterEach(async () => {
  for (const f of fixtures.splice(0)) await f.close();
});
it("approves the already reviewed references in one action and refuses incomplete choices", async () => {
  const f = await fixture();
  let p = f.project();
  expect(
    (await f.command("approve-proposal", { hash: p.proposal!.hash })).status,
  ).toBe(400);
  await f.search();
  await f.choose();
  await f.search("punchAnimation", "punch animation");
  await f.choose(f.animation.assetId, "punchAnimation");
  p = f.project();
  const g = p.assetDiscovery!.groups.find((g) => g.id === "punchAnimation")!,
    clip = g.options[0].previewData!.pack!.entries.find((e) => e.clip)!;
  await f.command("asset-picks/clip", {
    groupId: g.id,
    assetId: f.animation.assetId,
    clipKey: clip.key,
  });
  await f.search("hitSound", "punch hit sound");
  await f.choose(f.sound.assetId, "hitSound");
  p = f.project();
  expect(p.assetAttachments).toHaveLength(3);
  const start = vi
    .spyOn(f.app.locals.engine, "start")
    .mockImplementation(() => f.project());
  const approved = await f.command("approve-proposal", {
    hash: p.proposal!.hash,
  });
  expect(approved.status).toBe(202);
  expect(start).toHaveBeenCalledOnce();
  expect(f.state.calls).toBe(0);
});
it("browses exact queries in source order without inspections, captures or model calls", async () => {
  const f = await fixture(),
    result = await f.search("targetDummy", " target dummy ");
  expect(result.status).toBe(200);
  expect(result.data.assets.map((a: any) => a.assetId)).toEqual(
    f.dummies.map((a) => a.assetId),
  );
  expect(f.state.searches).toEqual([" target dummy "]);
  expect(f.state.inspections).toEqual([]);
  expect(f.state.captures).toEqual([]);
  expect(f.state.calls).toBe(0);
});
it("persists a manual pick before inspection, survives a new store and a revision change", async () => {
  const f = await fixture();
  await f.search();
  let finish!: () => void;
  f.state.delay = new Promise<void>((r) => (finish = r));
  const picking = f.choose();
  await expect
    .poll(() => f.project().assetDiscovery?.choices?.targetDummy?.assetId)
    .toBe(f.dummies[1].assetId);
  expect(
    new GenerationStore(f.directory).get(f.project().id).assetDiscovery?.choices
      ?.targetDummy?.operation,
  ).toBe("checking");
  finish();
  expect((await picking).status).toBe(200);
  const saved = f.project();
  const p = f.app.locals.engine.revise(
    saved.id,
    saved.revision,
    saved.request,
    saved.answers,
  );
  expect(p.revision).toBe(saved.revision + 1);
  expect(p.assetDiscovery?.choices?.targetDummy?.assetId).toBe(
    f.dummies[1].assetId,
  );
  expect(pickStatus(p, p.assetDiscovery!.groups[0]).state).toBe("ready");
  await f.search("targetDummy", "other query");
  expect(f.project().assetDiscovery?.choices?.targetDummy?.assetId).toBe(
    f.dummies[1].assetId,
  );
});
it("keeps exclusions visible but refuses selection and records a disconnected Studio as a durable problem", async () => {
  const f = await fixture();
  const p = f.project();
  p.excludedAssetIds = [f.dummies[0].assetId];
  f.app.locals.engine.store.save(p);
  expect((await f.search()).data.assets[0].assetId).toBe(f.dummies[0].assetId);
  expect((await f.choose(f.dummies[0].assetId)).status).toBe(409);
  f.state.connected = false;
  const chosen = (await f.choose()).data;
  expect(pickStatus(chosen, chosen.assetDiscovery.groups[0])).toMatchObject({
    state: "problem",
    canBuild: false,
  });
  expect(chosen.assetDiscovery.choices.targetDummy.error).toMatch(
    /Studio isn't connected/,
  );
});
it("requires an explicit Keep it for scripts and incomplete inspection", async () => {
  const f = await fixture();
  await f.search();
  f.state.scripts = 1;
  f.state.limited = true;
  let p = (await f.choose()).data;
  expect(pickStatus(p, p.assetDiscovery.groups[0]).state).toBe("warning");
  p = (await f.choose(f.dummies[1].assetId, "targetDummy", true)).data;
  expect(pickStatus(p, p.assetDiscovery.groups[0]).state).toBe("ready");
  expect(
    p.assetDiscovery.choices.targetDummy.acknowledgeInspectionLimitations,
  ).toBe(true);
});
it("captures only the chosen animation and persists an actual producer clip key", async () => {
  const f = await fixture();
  await f.search("punchAnimation", "punch animation");
  expect(f.state.captures).toEqual([]);
  let p = (await f.choose(f.animation.assetId, "punchAnimation")).data;
  const g = p.assetDiscovery.groups.find((g: any) => g.id === "punchAnimation"),
    clip = g.options[0].previewData.pack.entries.find((e: any) => e.clip);
  expect(f.state.captures).toEqual([f.animation.assetId]);
  expect(pickStatus(p, g).canBuild).toBe(false);
  p = (
    await f.command("asset-picks/clip", {
      groupId: g.id,
      assetId: f.animation.assetId,
      clipKey: clip.key,
    })
  ).data;
  expect(p.assetDiscovery.choices.punchAnimation.clipKey).toBe(clip.key);
  expect(
    pickStatus(
      p,
      p.assetDiscovery.groups.find((g: any) => g.id === "punchAnimation"),
    ).state,
  ).toBe("ready");
});
it.each([true, false])(
  "Choose for me requires an estimate and only picks a relevant result (%s)",
  async (relevant) => {
    const f = await fixture();
    f.state.relevant = relevant;
    const estimate = await f.command("asset-picks/estimate", {
      groupId: "targetDummy",
      studioId: pickerStudio,
    });
    expect(estimate.status).toBe(200);
    expect(estimate.data.estimatedMicros).toBeGreaterThan(0);
    expect(f.state.calls).toBe(0);
    const result = await f.command("asset-picks/auto", {
      token: estimate.data.token,
    });
    expect(result.status).toBe(200);
    expect(f.state.calls).toBe(estimate.data.calls);
    expect(!!result.data.assetDiscovery.choices.targetDummy.assetId).toBe(
      relevant,
    );
    if (!relevant) {
      expect(result.data.assetDiscovery.choices.targetDummy.reason).toMatch(
        /Nothing on this page is relevant/,
      );
      expect(f.state.inspections).toEqual([]);
    }
    expect(result.data.charges.length).toBe(estimate.data.calls);
    expect(
      (await f.command("asset-picks/auto", { token: estimate.data.token }))
        .status,
    ).toBe(409);
  },
);
it("rejects stale estimates and estimates above the remaining project cap", async () => {
  const f = await fixture();
  const q = (
    await f.command("asset-picks/estimate", {
      groupId: "targetDummy",
      studioId: pickerStudio,
    })
  ).data;
  await f.search("targetDummy", "different query");
  expect((await f.command("asset-picks/auto", { token: q.token })).status).toBe(
    409,
  );
  const p = f.project();
  p.reservedMicros = p.budgetMicros - 1;
  f.app.locals.engine.store.save(p);
  expect(
    (
      await f.command("asset-picks/estimate", {
        groupId: "targetDummy",
        studioId: pickerStudio,
      })
    ).status,
  ).toBe(400);
  expect(f.state.calls).toBe(0);
});
