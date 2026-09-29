import fs from "node:fs";
import { describe, expect, it, vi } from "vitest";
import type { Project } from "../src/generation/schema";
import {
  buildAssetNeeds,
  approvedAssetAdapter,
} from "../src/marketplace/approved-adapter";
import { assetSearches } from "../src/marketplace/discovery";

function failedProject(): Project {
  return JSON.parse(
    fs.readFileSync(
      "docs/results/opencode-fighting-live-20260924/terminal-project.json",
      "utf8",
    ),
  );
}

describe("approved asset links from real planner output", () => {
  it("builds the four real planned needs without catalog IDs in requirement prose or duplicating the animation pack", () => {
    const p = failedProject();
    const before = JSON.stringify(p);
    const ids = Object.values(p.assetDiscovery!.choices!).map(
      (c) => c.assetId!,
    );
    for (const r of p.spec!.requirements)
      for (const id of ids)
        expect(r.description + " " + r.acceptance).not.toContain(id);
    const needs = buildAssetNeeds(p);
    expect(needs).toHaveLength(4);
    expect(needs.map((n) => [n.id, n.requirementId])).toEqual(
      p.spec!.assetNeeds!.map((n) => [n.id, n.requirementId]),
    );
    // The import receives a Model pack. Keep the logical need identity, while
    // the saved specification still describes the Animation behavior.
    expect(needs.find((n) => n.id === "punchAnimationAsset")?.kind).toBe(
      "Model",
    );
    expect(
      p.spec!.assetNeeds!.find((n) => n.id === "punchAnimationAsset")?.kind,
    ).toBe("Animation");
    expect(JSON.stringify(p)).toBe(before);
  });

  it("stamps spec-derived discovery groups with the originating need identity", () => {
    const p = failedProject();
    const groups = assetSearches(p);
    expect(groups).toHaveLength(4);
    for (const need of p.spec!.assetNeeds!)
      expect(groups).toContainEqual(
        expect.objectContaining({ assetNeedId: need.id, query: need.query }),
      );
    expect(
      groups.find((g) => (g as any).assetNeedId === "punchAnimationAsset"),
    ).toMatchObject({ kind: "Model", preview: "animation" });
  });

  it("retains approved selection identity when all model-authored catalog numbers are absent", async () => {
    const p = failedProject();
    // Same output shape and roles, but prose is not an identity protocol.
    for (const need of p.spec!.assetNeeds!)
      need.constraints =
        "Use the selected reference and preserve the requested behavior.";
    const needs = buildAssetNeeds(p);
    const native = {
      identity: "offline",
      search: vi.fn(),
      inspect: vi.fn(async () => ({})),
    };
    const adapter = approvedAssetAdapter(native as any, p);
    const expected: Record<string, string> = {
      trainingDummyAsset: "1245720733",
      punchAnimationAsset: "12061946559",
      impactSfxAsset: "132504023010884",
      impactVfxAsset: "86089736228455",
    };
    for (const need of needs) {
      const result = await adapter.search(
        need,
        need.query,
        new AbortController().signal,
      );
      expect(result.candidates.map((c) => c.id)).toEqual([expected[need.id]]);
    }
    expect(native.search).not.toHaveBeenCalled();
  });

  it("uses an explicit need identity ahead of misleading roles and random uploader names in an unrelated genre", async () => {
    const p = failedProject();
    const need = {
      ...p.spec!.assetNeeds![0],
      id: "fishingDock",
      requirementId: "castFromDock",
      role: "Fishing dock",
      query: "wooden fishing pier",
      constraints: "Let the player stand next to the water.",
    };
    p.spec!.assetNeeds = [need];
    p.spec!.requirements = [
      {
        ...p.spec!.requirements[0],
        id: "castFromDock",
        description: "The player can stand on a dock to cast into the pond.",
        acceptance: "Casting is available from the dock.",
      },
    ];
    const group = p.assetDiscovery!.groups[0];
    group.assetNeedId = need.id;
    group.label = "Old display wording";
    group.query = "outdated search";
    const choice = p.assetDiscovery!.choices![group.id];
    group.options.find((o) => o.assetId === choice.assetId)!.name =
      "🌟 NEW!! xX_zQ7_998_Xx 🌟";
    p.assetDiscovery!.groups = [group];
    const built = buildAssetNeeds(p);
    expect(built.map((n) => [n.id, n.requirementId])).toEqual([
      ["fishingDock", "castFromDock"],
    ]);
    const adapter = approvedAssetAdapter({ identity: "offline" } as any, p);
    expect(
      (await adapter.search(built[0], "anything", new AbortController().signal))
        .candidates[0].id,
    ).toBe(choice.assetId);
    await expect(
      adapter.search(
        { ...built[0], requirementId: "other" },
        "anything",
        new AbortController().signal,
      ),
    ).resolves.toMatchObject({ candidates: [] });
  });

  it("does not guess past stale links or equally matching needs", () => {
    const p = failedProject();
    p.assetDiscovery!.groups[0].assetNeedId = "deletedNeed";
    expect(() => buildAssetNeeds(p)).toThrow("stale");
    delete p.assetDiscovery!.groups[0].assetNeedId;
    p.spec!.assetNeeds!.push({ ...p.spec!.assetNeeds![0], id: "anotherDummy" });
    expect(() => buildAssetNeeds(p)).toThrow("Ambiguous");
  });

  it("keeps the old numeric-prose representation as an explicit legacy fallback only", () => {
    const p = failedProject();
    p.assetDiscovery!.groups = [p.assetDiscovery!.groups[0]];
    p.spec!.assetNeeds = [];
    p.spec!.requirements = [
      {
        ...p.spec!.requirements[0],
        id: "legacy",
        description: "Legacy saved reference 1245720733",
        acceptance: "Visible target",
      },
    ];
    expect(buildAssetNeeds(p)).toMatchObject([
      { requirementId: "legacy", kind: "Model" },
    ]);
    p.spec!.requirements = [];
    expect(() => buildAssetNeeds(p)).toThrow("linked requirement");
  });
});
