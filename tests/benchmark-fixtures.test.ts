import { describe, expect, it } from "vitest";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { benchmarkCases, getBenchmarkCase } from "../src/benchmark/cases";
import { bundleSchema } from "../src/generation/schema";
import { exportBundle } from "../src/generation/export";
import { validateBundle } from "../src/generation/validation";
import { newProject } from "../src/generation/store";
import {
  fixtureFiles,
  fixtureSha256,
  freshGameBundle,
  frozenQuarryArtifactHash,
  readBenchmarkFixture,
  verifyFixtureBinding,
} from "../scripts/prepare-benchmark-fixtures";

describe("prepared public benchmark starting fixtures", () => {
  it("pins exact bundle/export hashes and exposes no private project wrapper", () => {
    const prepared = benchmarkCases.filter(
      (c) => c.fixture.status === "prepared",
    );
    expect(prepared.map((c) => c.id)).toEqual([
      "dev.asset-integration",
      "game.crystal-hollow",
      "game.round-combat",
      "game.lantern-adventure",
      "game.asmr-interaction",
      "game.collect-and-steal",
      "game.small-fighting",
    ]);
    let total = 0;
    for (const directory of new Set(prepared.map((c) => c.fixture.directory!)))
      for (const name of ["bundle.json", "export.rbxlx", "manifest.json"])
        total += statSync(join(directory, name)).size;
    expect(total).toBeLessThan(400_000);
    for (const c of prepared) {
      const { bundle, manifest } = readBenchmarkFixture(
        c.fixture.directory!,
        c,
      );
      expect(bundleSchema.safeParse(bundle).success).toBe(true);
      expect(Object.keys(bundle).sort()).toEqual([
        "assets",
        "coverage",
        "files",
        "scene",
      ]);
      expect(manifest.artifactSha256).toBe(c.fixture.artifactSha256);
      expect(manifest.exportHash).toBe(c.fixture.exportHash);
      expect(manifest.purpose).toBe(
        "starting_fixture_not_candidate_quality_evidence",
      );
      const serialized = JSON.stringify(manifest);
      expect(serialized).not.toMatch(
        /(?:[CD]:[\\/]|apiKey|charges|profiles|providerModel)/,
      );
      expect(c.status).toBe("unrun");
    }
  });

  it("retains the exact authored quarry artifact and its working interaction identities", () => {
    const c = getBenchmarkCase("dev.asset-integration"),
      { bundle, manifest } = readBenchmarkFixture(c.fixture.directory!, c);
    expect(manifest.artifactSha256).toBe(frozenQuarryArtifactHash);
    expect(bundle.files).toHaveLength(7);
    expect(
      bundle.scene.some((n) => n.path.endsWith("/World/SellStation")),
    ).toBe(true);
    expect(
      bundle.files.find((f) => f.path.endsWith("Economy.module.luau"))?.source,
    ).toContain("state.TotalSold += sold");
    expect(
      bundle.files.find((f) => f.path.endsWith("Game.server.luau"))?.source,
    ).toContain("sell");
    expect(manifest.provenance).toContain("Historical coverage");
    const remade = fixtureFiles(
      manifest.fixtureId,
      bundle,
      manifest.scope,
      [c],
      manifest.provenance,
    );
    expect(remade.bundleText).toBe(
      readFileSync(join(c.fixture.directory!, "bundle.json"), "utf8"),
    );
    expect(remade.exported).toBe(
      readFileSync(join(c.fixture.directory!, "export.rbxlx"), "utf8"),
    );
    expect(remade.manifest).toEqual(manifest);
  });

  it("gives all six game genres identical bytes while preserving separate primary prompt bindings", () => {
    const games = benchmarkCases.filter((c) => c.track === "game_quality");
    expect(new Set(games.map((c) => c.fixture.artifactSha256)).size).toBe(1);
    expect(new Set(games.map((c) => c.fixture.exportHash)).size).toBe(1);
    const { bundle, manifest } = readBenchmarkFixture(
      games[0].fixture.directory!,
      games[0],
    );
    expect(bundle).toEqual(freshGameBundle());
    expect(bundle.files).toEqual([]);
    expect(bundle.coverage).toEqual([]);
    expect(bundle.assets).toEqual([]);
    expect(bundle.scene.map((n) => n.className)).toEqual([
      "Folder",
      "Part",
      "SpawnLocation",
    ]);
    const p = newProject("Fresh benchmark fixture", 0);
    p.scope = manifest.scope;
    expect(
      validateBundle(bundle, p).every((check) => check.status === "passed"),
    ).toBe(true);
    expect(fixtureSha256(exportBundle(bundle, manifest.scope))).toBe(
      manifest.exportHash,
    );
    const primary = getBenchmarkCase("game.asmr-interaction");
    const prepared = readBenchmarkFixture(primary.fixture.directory!, primary);
    expect(prepared.bundle).toEqual(bundle);
    expect(prepared.manifest.caseBindings.map((b) => b.caseId)).toEqual([
      "game.asmr-interaction",
      "game.collect-and-steal",
      "game.small-fighting",
    ]);
    expect(manifest.caseBindings.map((b) => b.caseId)).toEqual([
      "game.crystal-hollow",
      "game.round-combat",
      "game.lantern-adventure",
    ]);
    expect(() => verifyFixtureBinding(manifest, primary)).toThrow(
      "binding mismatch",
    );
  });

  it("rejects applying a pinned fixture to a different case, version or changed brief", () => {
    const c = getBenchmarkCase("dev.asset-integration"),
      { manifest } = readBenchmarkFixture(c.fixture.directory!, c);
    expect(() =>
      verifyFixtureBinding(manifest, getBenchmarkCase("game.crystal-hollow")),
    ).toThrow("binding mismatch");
    expect(() =>
      verifyFixtureBinding(manifest, { ...c, version: "2.0.0" }),
    ).toThrow("binding mismatch");
    expect(() =>
      verifyFixtureBinding(manifest, {
        ...c,
        prompt: c.prompt + " Also implement combat.",
      }),
    ).toThrow("binding mismatch");
    expect(() =>
      readBenchmarkFixture(c.fixture.directory!, {
        ...c,
        fixture: { ...c.fixture, artifactSha256: "0".repeat(64) },
      }),
    ).toThrow("Catalog artifact hash mismatch");
    expect(() =>
      readBenchmarkFixture(c.fixture.directory!, {
        ...c,
        fixture: { ...c.fixture, exportHash: "0".repeat(64) },
      }),
    ).toThrow("Catalog export hash mismatch");
  });
});
