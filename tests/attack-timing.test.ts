import { afterEach, it, expect } from "vitest";
import capture from "./fixtures/generalization/development/animation-R15-punch-animation.json";
import { pickerFixture } from "./asset-picking-fixture";
import { inspectSnapshot } from "../src/marketplace/inspection";
import { snapshotSchema } from "../src/marketplace/types";
import { animationPackSchema } from "../src/marketplace/animations";
import { revisionKey } from "../src/marketplace/library";
import { assetRoleEvidence } from "../src/marketplace/role-evidence";
import { projectProposalPicks } from "../src/marketplace/proposal-picks";
const fixtures: Awaited<ReturnType<typeof pickerFixture>>[] = [];
afterEach(async () => {
  for (const f of fixtures.splice(0)) await f.close();
});
it("requires explicit user timing acceptance and rejects stale or invalid edits through the production route", async () => {
  const f = await pickerFixture();
  fixtures.push(f);
  const p = f.project(),
    need = p.proposal!.assetNeeds!.find((n) => n.id === "punchAnimation")!;
  const pack = animationPackSchema.parse(capture.animations),
    entry = pack.entries.find((e) => e.clip)!;
  need.pick = { assetId: capture.metadata.assetId, clipKey: entry.key };
  need.assetRole = "animation";
  p.rig!.selected = "R15";
  projectProposalPicks(p);
  const g = p.assetDiscovery!.groups.find((g) => g.id === need.id)!;
  const inspection = inspectSnapshot(snapshotSchema.parse(capture.snapshot));
  inspection.nativeRevisionKey = revisionKey({...capture.metadata,kind:"Model"});
  g.options = [
    {
      ...capture.metadata,
      kind: "Model",
      inspection,
      previewData: { pack, revisionKey: pack.revisionKey },
    },
  ];
  f.app.locals.engine.store.save(p);
  const evidence = assetRoleEvidence(p, g),
    timing = (evidence.details as any).timing;
  expect(evidence.status).toBe("unknown");
  expect(timing.segments.length).toBeGreaterThan(0);
  const decision = {
    key: timing.key,
    source: "user",
    segments: timing.segments.map(({ start, hit, end }: any) => ({
      start,
      hit,
      end,
    })),
  };
  const body = { groupId: g.id, assetId: capture.metadata.assetId, decision };
  expect(
    (
      await f.command("asset-picks/timing", {
        ...body,
        decision: { ...decision, key: "stale" },
      })
    ).status,
  ).toBe(409);
  expect(
    (
      await f.command("asset-picks/timing", {
        ...body,
        decision: {
          ...decision,
          segments: decision.segments.map((s: any) => ({ ...s, hit: s.end })),
        },
      })
    ).status,
  ).toBe(409);
  const accepted = await f.command("asset-picks/timing", body);
  expect(accepted.status).toBe(200);
  const after = f.project(),
    group = after.assetDiscovery!.groups.find((x) => x.id === g.id)!;
  expect(assetRoleEvidence(after, group).status).toBe("ready");
  expect(
    after.proposal!.assetNeeds!.find((n) => n.id === need.id)!.pick!
      .timingDecision?.source,
  ).toBe("user");
  after.rig!.selected = "R6";
  expect(assetRoleEvidence(after, group).status).toBe("blocked");
});
