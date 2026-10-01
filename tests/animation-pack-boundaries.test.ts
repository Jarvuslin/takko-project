import fs from "node:fs";
import { expect, it, vi } from "vitest";
import { StudioMarketplace } from "../src/marketplace/studio";
import { animationClipSchema } from "../src/generation/animation";
import { animationPackSchema, studioAnimationPack } from "../src/marketplace/animations";
import { animationSegments } from "../src/marketplace/animation-segments";
import { pickerFixture } from "./asset-picking-fixture";
import { metadataSchema } from "../src/marketplace/types";
import { GenerationStore } from "../src/generation/store";
const captured = (id: string) => JSON.parse(fs.readFileSync(`tests/fixtures/generalization/pack-fixes/${id}.json`, "utf8"));
it("captures a bounded selection in the native 262-entry pack while preserving the earlier oversized failure", () => {
  const failed = captured("13734483218");
  const row = captured("13734483218-selected-bounded");
  const pack = animationPackSchema.parse(row.selected);
  const entry = pack.entries.find(e => e.key === row.selectedKey)!;
  expect(failed.summary.captured).toBe(false);
  expect(entry.clip!.authored!.frames).toHaveLength(row.manifest.entries.find((e: any) => e.key === row.selectedKey).frameCount);
  expect(pack.coverage!.total).toBe(262);
  expect(pack.coverage!.inspectedKeys).toEqual([row.selectedKey]);
  expect(pack.coverage!.uncheckedKeys).toHaveLength(261);
});
for (const id of ["85284763604545", "16840174248"]) it(`binds authored events and looping to the actual captured poses of ${id}`, () => {
  const row = captured(id);
  const entry = animationPackSchema.parse(row.selected).entries.find(e => e.key === row.selectedKey)!;
  const clip = animationClipSchema.parse(entry.clip);
  expect(clip.authored!.frames).toEqual(row.oracle.frames);
  expect(clip.authored!.loop).toBe(row.oracle.loop);
  expect(clip.authored!.priority).toBe(row.oracle.priority);
  expect(clip.authored!.poseDigest).toBe(clip.sourcePoseDigest);
  expect(animationClipSchema.safeParse({ ...clip, authored: { ...clip.authored, poseDigest: "0".repeat(64) } }).success).toBe(false);
  const timing = animationSegments(clip, undefined, "punch attack");
  expect(timing.reason).not.toMatch(/not bound/);
  if (row.oracle.loop) expect(timing.segments).toEqual([]);
});
for (const id of ["16840174248", "13734483218"]) it(`lists the real oversized ${id} pack without capturing unchecked poses`, async () => {
  const row = captured(id), provider = new StudioMarketplace();
  const metadata = metadataSchema.parse(row.metadata);
  vi.spyOn(provider, "metadata").mockResolvedValue(metadata);
  const transfer = vi.spyOn(provider as any, "transferred").mockImplementation(async (_s, source: any) => {
    expect(source).toContain("if -1 < 0 then");
    return { entries: row.manifest.entries.map(({ key, name, animationId }: any) => ({ key, name, ...(animationId ? { animationId } : {}) })), context: row.manifest.context };
  });
  const pack = await provider.animations("fixture", metadata);
  expect(transfer).toHaveBeenCalledTimes(1);
  expect(pack.coverage!.total).toBe(row.manifest.entries.length);
  expect(pack.coverage!.inspectedKeys).toEqual([]);
  expect(pack.entries.every(e => e.unchecked)).toBe(true);
  expect(studioAnimationPack(pack).entries).toHaveLength(row.manifest.entries.length);
});
for (const id of ["16840174248", "13734483218"]) it(`captures only the selected ${id} clip and does not repeat its recorded outcome`, async () => {
  const row = captured(id), provider = new StudioMarketplace();
  const metadata = metadataSchema.parse(row.metadata);
  vi.spyOn(provider, "metadata").mockResolvedValue(metadata);
  const selected = row.selected.entries.find((e: any) => e.key === row.selectedKey);
  const indices: number[] = [];
  vi.spyOn(provider as any, "transferred").mockImplementation(async (_s, source: any) => {
    const index = Number(/if (-?\d+) < 0 then/.exec(source)?.[1]); indices.push(index);
    if (index === -1) return { entries: row.manifest.entries.map(({ key, name, animationId }: any) => ({ key, name, ...(animationId ? { animationId } : {}) })), context: row.manifest.context };
    expect(row.manifest.entries[index].key).toBe(row.selectedKey);
    if (selected.error) throw Error(selected.error);
    return selected.clip;
  });
  const first = await provider.animations("fixture", metadata, 100, row.selectedKey);
  const second = await provider.animations("fixture", metadata, 100, row.selectedKey);
  expect(indices.filter(i => i >= 0)).toHaveLength(1);
  expect(second).toEqual(first);
  expect(first.entries.filter(e => e.clip)).toHaveLength(selected.clip ? 1 : 0);
  expect(first.coverage!.uncheckedKeys).toHaveLength(first.entries.length - (selected.clip ? 1 : 0));
});
it("captures a chosen real manifest entry through the route and persists producer coverage", async () => {
  const f = await pickerFixture();
  try {
    const row = captured("16840174248");
    const metadata = metadataSchema.parse(row.metadata);
    const manifest = animationPackSchema.parse(row.manifest);
    const selected = animationPackSchema.parse(row.selected);
    const store = new GenerationStore(f.directory), p = f.project();
    const group = p.assetDiscovery!.groups[0];
    group.preview = "animation";
    group.options = [{ ...metadata, previewData: { pack: manifest, revisionKey: manifest.revisionKey } }];
    const need = p.proposal!.assetNeeds!.find(n => n.id === group.id)!;
    need.assetRole = "animation";
    need.selectedAssetId = metadata.assetId;
    need.pick = { assetId: metadata.assetId, option: group.options[0] };
    p.assetDiscovery!.choices = { [group.id]: { assetId: metadata.assetId } };
    p.assetDiscovery!.studioId = "fixture";
    p.assetStudioId = "fixture";
    store.save(p);
    vi.spyOn(f.provider, "metadata").mockResolvedValue(metadata);
    const capture = vi.spyOn(f.provider, "animations").mockResolvedValue(selected);
    const response = await f.command("asset-picks/clip-capture", { groupId: group.id, assetId: metadata.assetId, clipKey: row.selectedKey });
    expect(response.status, JSON.stringify(response.data)).toBe(200);
    expect(capture).toHaveBeenCalledWith("fixture", metadata, 100, row.selectedKey);
    const saved = store.get(p.id).assetDiscovery!.groups[0].options[0].previewData!.pack!;
    expect(saved.coverage).toEqual(selected.coverage);
    expect(saved.entries.find(e => e.key === row.selectedKey)!.clip).toEqual(selected.entries.find(e => e.key === row.selectedKey)!.clip);
    await f.command("asset-picks/clip-capture", { groupId: group.id, assetId: metadata.assetId, clipKey: row.selectedKey });
    expect(capture).toHaveBeenCalledTimes(1);
  } finally { await f.close(); }
});
it("inspects a dropped pack selection in place without appending packs or repeating failed captures", async () => {
  const f = await pickerFixture();
  try {
    const row = captured("13734483218");
    vi.spyOn(f.provider, "metadata").mockResolvedValue(metadataSchema.parse(row.metadata));
    const capture = vi.spyOn(f.provider, "animations")
      .mockResolvedValueOnce(animationPackSchema.parse(row.manifest) as any)
      .mockResolvedValueOnce(animationPackSchema.parse(row.selected) as any);
    const command = (selectedKey?: string) => f.command("marketplace-animations", {
      studioId: "392fce6b-fea7-4de3-bb2e-49a95231c3f5", reference: row.assetId, ...(selectedKey ? { selectedKey } : {}),
    });
    const listed = await command(); expect(listed.status).toBe(200);
    const inspected = await command(row.selectedKey); expect(inspected.status).toBe(200);
    expect(inspected.data.animationPacks).toHaveLength(1);
    expect(inspected.data.animationPacks[0].id).toBe(listed.data.animationPacks[0].id);
    expect(inspected.data.animationPacks[0].entries.find((e: any) => e.key === row.selectedKey).error).toBeTruthy();
    const repeated = await command(row.selectedKey); expect(repeated.status).toBe(200);
    expect(capture).toHaveBeenCalledTimes(2);
  } finally { await f.close(); }
});
