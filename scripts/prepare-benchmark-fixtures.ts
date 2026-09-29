import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import {
  bundleSchema,
  type Bundle,
  type Project,
} from "../src/generation/schema";
import { exportBundle } from "../src/generation/export";
import {
  bundleHash,
  compileSources,
  validateBundle,
} from "../src/generation/validation";
import { newProject } from "../src/generation/store";
import {
  benchmarkCases,
  primaryBenchmarkCaseIds,
  type BenchmarkCase,
} from "../src/benchmark/cases";

export const frozenQuarryArtifactHash =
  "5190a564e55264c10ac8d1a4da30ef3a076cdf88c77d6a149c8479a3b6603eb9";
export const fixtureSha256 = (value: string | Buffer) =>
  createHash("sha256").update(value).digest("hex");
export type FixtureManifest = {
  schemaVersion: 1;
  fixtureId: string;
  fixtureVersion: "1.0.0";
  purpose: "starting_fixture_not_candidate_quality_evidence";
  scope: string;
  artifactSha256: string;
  bundleFileSha256: string;
  exportHash: string;
  bundlePath: "bundle.json";
  exportPath: "export.rbxlx";
  caseBindings: { caseId: string; caseVersion: string; promptSha256: string }[];
  provenance: string;
};

export function freshGameBundle(): Bundle {
  const root = "Workspace/Forge_BenchmarkFresh";
  return bundleSchema.parse({
    files: [],
    coverage: [],
    assets: [],
    scene: [
      { path: root, className: "Folder", properties: {} },
      {
        path: root + "/Ground",
        className: "Part",
        properties: {
          Anchored: true,
          CanCollide: true,
          Size: { type: "Vector3", value: [64, 2, 64] },
          CFrame: {
            type: "CFrame",
            value: [0, -1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
          },
          Color: { type: "Color3", value: [0.4, 0.4, 0.4] },
        },
      },
      {
        path: root + "/Spawn",
        className: "SpawnLocation",
        properties: {
          Anchored: true,
          CanCollide: true,
          Neutral: true,
          Size: { type: "Vector3", value: [6, 0.5, 6] },
          CFrame: {
            type: "CFrame",
            value: [0, 0.25, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
          },
        },
      },
    ],
  });
}

export function fixtureFiles(
  fixtureId: string,
  bundleInput: unknown,
  scope: string,
  definitions: BenchmarkCase[],
  provenance: string,
) {
  const bundle = bundleSchema.parse(bundleInput);
  const bundleText = JSON.stringify(bundle) + "\n";
  const exported = exportBundle(bundle, scope);
  const manifest: FixtureManifest = {
    schemaVersion: 1,
    fixtureId,
    fixtureVersion: "1.0.0",
    purpose: "starting_fixture_not_candidate_quality_evidence",
    scope,
    artifactSha256: bundleHash(bundle),
    bundleFileSha256: fixtureSha256(bundleText),
    exportHash: fixtureSha256(exported),
    bundlePath: "bundle.json",
    exportPath: "export.rbxlx",
    caseBindings: definitions.map((c) => ({
      caseId: c.id,
      caseVersion: c.version,
      promptSha256: fixtureSha256(c.prompt),
    })),
    provenance,
  };
  return {
    bundle,
    bundleText,
    exported,
    manifest,
    manifestText: JSON.stringify(manifest, null, 2) + "\n",
  };
}

/** Fixed bindings prevent a historical fixture being silently graded against another brief. */
export function verifyFixtureBinding(
  manifest: FixtureManifest,
  definition: BenchmarkCase,
) {
  if (manifest.schemaVersion !== 1 || manifest.fixtureVersion !== "1.0.0")
    throw Error("Unsupported fixture version");
  const binding = manifest.caseBindings.find((b) => b.caseId === definition.id);
  if (
    !binding ||
    binding.caseVersion !== definition.version ||
    binding.promptSha256 !== fixtureSha256(definition.prompt)
  )
    throw Error(
      "Fixture case/version/prompt binding mismatch: " + definition.id,
    );
  if (manifest.purpose !== "starting_fixture_not_candidate_quality_evidence")
    throw Error("Not a starting fixture");
}

export function readBenchmarkFixture(
  directory: string,
  definition: BenchmarkCase,
) {
  const manifest = JSON.parse(
    readFileSync(join(directory, "manifest.json"), "utf8"),
  ) as FixtureManifest;
  verifyFixtureBinding(manifest, definition);
  // Only fixed local filenames are accepted, even if a manifest is edited.
  if (
    manifest.bundlePath !== "bundle.json" ||
    manifest.exportPath !== "export.rbxlx"
  )
    throw Error("Unexpected fixture path");
  const bytes = readFileSync(join(directory, "bundle.json")),
    exported = readFileSync(join(directory, "export.rbxlx"));
  const bundle = bundleSchema.parse(JSON.parse(bytes.toString()));
  if (
    fixtureSha256(bytes) !== manifest.bundleFileSha256 ||
    bundleHash(bundle) !== manifest.artifactSha256 ||
    fixtureSha256(exported) !== manifest.exportHash
  )
    throw Error("Fixture file hash mismatch");
  // These are immutable historical starting worlds, independently pinned by
  // the catalog's bundle and export hashes below. A newer exporter may add a
  // new base world. Re-rendering here would silently redefine the benchmark.
  if (
    definition.fixture.artifactSha256 &&
    definition.fixture.artifactSha256 !== manifest.artifactSha256
  )
    throw Error("Catalog artifact hash mismatch");
  if (
    definition.fixture.exportHash &&
    definition.fixture.exportHash !== manifest.exportHash
  )
    throw Error("Catalog export hash mismatch");
  return { bundle, manifest };
}

function writeFixture(
  directory: string,
  files: ReturnType<typeof fixtureFiles>,
) {
  const outputs = {
    "bundle.json": files.bundleText,
    "export.rbxlx": files.exported,
    "manifest.json": files.manifestText,
  };
  for (const [name, content] of Object.entries(outputs)) {
    const path = join(directory, name);
    if (existsSync(path) && readFileSync(path, "utf8") !== content)
      throw Error("Refusing to overwrite a different fixture: " + path);
  }
  mkdirSync(directory, { recursive: true });
  for (const [name, content] of Object.entries(outputs))
    if (!existsSync(join(directory, name)))
      writeFileSync(join(directory, name), content, { flag: "wx" });
}

async function main() {
  if (!process.argv[2])
    throw Error(
      "Usage: tsx scripts/prepare-benchmark-fixtures.ts frozen-project.json [new-output-root]",
    );
  const input = JSON.parse(
    readFileSync(resolve(process.argv[2]), "utf8"),
  ) as Project;
  const quarry = bundleSchema.parse(input.artifact);
  if (bundleHash(quarry) !== frozenQuarryArtifactHash)
    throw Error(
      "Input is not the pinned authored Crystal Hollow visual V2 artifact",
    );
  const fresh = freshGameBundle(),
    p = newProject("Prepared empty benchmark fixture", 0);
  p.scope = "Forge_BenchmarkFresh";
  const checks = [
    ...validateBundle(quarry, input),
    ...(await compileSources(quarry)),
    ...validateBundle(fresh, p),
  ];
  if (checks.some((c) => c.status === "failed"))
    throw Error(JSON.stringify(checks.filter((c) => c.status === "failed")));
  const output = resolve(process.argv[3] ?? "benchmarks/fixtures/v1");
  const q = fixtureFiles(
    "quarry-asset-integration",
    quarry,
    input.scope,
    benchmarkCases.filter((c) => c.id === "dev.asset-integration"),
    "Exact public bundle from frozen authored Crystal Hollow visual V2. Historical coverage is retained but is not this development task's quality evidence. No project wrapper, model traces, credentials or private source path included. Native baseline history is documented separately.",
  );
  const f = fixtureFiles(
    "fresh-game",
    fresh,
    p.scope,
    benchmarkCases.filter(
      (c) =>
        c.track === "game_quality" &&
        !primaryBenchmarkCaseIds.some((id) => id === c.id),
    ),
    "Authored empty floor/spawn template shared byte-for-byte across all three GameBench cases. No generated gameplay or quality result.",
  );
  writeFixture(join(output, q.manifest.fixtureId), q);
  writeFixture(join(output, f.manifest.fixtureId), f);
  const primary = fixtureFiles(
    "fresh-game-primary-v1",
    fresh,
    p.scope,
    benchmarkCases.filter((c) =>
      primaryBenchmarkCaseIds.some((id) => id === c.id),
    ),
    "Identical authored empty floor/spawn template for the three user-selected primary archetypes. Separate prompt bindings preserve the original supplementary fresh-game fixture unchanged. No generated gameplay or quality result.",
  );
  writeFixture(join(output, primary.manifest.fixtureId), primary);
  console.log(
    JSON.stringify(
      {
        fixtureRoot: output,
        fixtures: [q.manifest, f.manifest, primary.manifest],
        validation:
          "Quarry structure and seven Luau scripts compile; fresh template structure valid. No new Studio verification.",
      },
      null,
      2,
    ),
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
