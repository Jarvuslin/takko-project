import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { afterEach, expect, it } from "vitest";
import { benchmarkQualityCli } from "../scripts/benchmark-quality";
import { benchmarkVersion, getBenchmarkCase } from "../src/benchmark/cases";
import { qualitySubmissionSchema, scoreQuality } from "../src/benchmark/quality";
import { createEvidenceFileManifest } from "../src/benchmark/evidence-files";

it.each(["score", "compare"])(
  "%s rejects prose-only Marketplace pass claims even with valid file hashes",
  (command) => {
    const f = fixture();
    fs.writeFileSync(
      path.join(f.root, "claim.json"),
      JSON.stringify({ claim: "Searched and integrated successfully" }),
    );
    const submission = qualitySubmissionSchema.parse({
      ...f.submission,
      evidence: [
        {
          id: "claim",
          artifactHash: f.submission.artifactHash,
          kind: "asset_provenance",
          uri: "claim.json",
          observation: "Fixture unsupported claim",
          outcome: "passed",
          gates: ["asset_sourcing"],
        },
      ],
      gateResults: [
        { gate: "asset_sourcing", status: "passed", evidenceIds: ["claim"] },
      ],
    });
    fs.writeFileSync(f.file, JSON.stringify(submission));
    fs.writeFileSync(
      f.manifest,
      JSON.stringify(createEvidenceFileManifest(submission, f.root)),
    );
    const args =
      command === "score"
        ? ["score", "--submission", f.file, "--manifest", f.manifest]
        : [
            "compare",
            "--a",
            f.file,
            "--a-manifest",
            f.manifest,
            "--b",
            f.file,
            "--b-manifest",
            f.manifest,
          ];
    expect(() =>
      benchmarkQualityCli(
        [...args, "--out", path.join(f.root, "output")],
        f.root,
      ),
    ).toThrow("requires a full structured asset-sourcing record");
  },
);

const directories: string[] = [];

it("creates a separate masked review packet and rejects an unfinished review", () => {
  const f = fixture();
  const candidates = ["worker-a", "worker-b"].map((candidateId) =>
    qualitySubmissionSchema.parse({
      ...f.submission,
      candidateId,
      budgetMicros: 2_000_000,
      runKind: "prospective",
      seed: "case-seed",
      replicateId: "r1",
    }),
  );
  const files = candidates.map((submission, i) => {
    const file = path.join(f.root, `candidate-${i}.json`),
      manifest = path.join(f.root, `candidate-${i}-manifest.json`);
    fs.writeFileSync(file, JSON.stringify(submission));
    fs.writeFileSync(
      manifest,
      JSON.stringify(createEvidenceFileManifest(submission, f.root)),
    );
    return { file, manifest };
  });
  const out = path.join(f.root, "pairwise");
  benchmarkQualityCli(
    [
      "pairwise",
      "--a",
      files[0].file,
      "--a-manifest",
      files[0].manifest,
      "--b",
      files[1].file,
      "--b-manifest",
      files[1].manifest,
      "--seed",
      "review-seed",
      "--out",
      out,
    ],
    f.root,
  );
  const packet = path.join(out, "reviewer/packet.json"),
    review = path.join(out, "reviewer/form.json");
  expect(fs.readFileSync(packet, "utf8")).not.toContain("worker-a");
  expect(
    fs.readFileSync(path.join(out, "private-mapping.json"), "utf8"),
  ).toContain("worker-a");
  expect(() =>
    benchmarkQualityCli(
      [
        "review-check",
        "--packet",
        packet,
        "--review",
        review,
        "--out",
        path.join(out, "checked.json"),
      ],
      f.root,
    ),
  ).toThrow();
});

it("does not award a score to a retrospective submission with no case gates", () => {
  const { submission } = fixture();
  const result = scoreQuality(getBenchmarkCase(submission.caseId), submission);
  expect(result.finalScore).toBeNull();
  expect(result.gates.every(g => g.status === "pending")).toBe(true);
});

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "takko-benchmark-cli-"));
  directories.push(root);
  const definition = getBenchmarkCase("game.crystal-hollow");
  const submission = qualitySubmissionSchema.parse({
    candidateId: "test-fixture",
    artifactHash: "a".repeat(64),
    caseId: definition.id,
    caseVersion: definition.version,
    protocolVersion: benchmarkVersion,
    track: definition.track,
    budgetMicros: null,
    runKind: "retrospective",
    assistance: "expert_assisted",
    toolProfile: "test-only",
    environmentProfile: "test-only",
    evidence: [],
    dimensionScores: [],
    gateResults: [],
    devChecks: [],
  });
  const file = path.join(root, "submission.json"),
    manifest = path.join(root, "manifest.json");
  fs.writeFileSync(file, JSON.stringify(submission));
  benchmarkQualityCli(
    ["freeze-evidence", "--submission", file, "--out", manifest],
    root,
  );
  return { root, file, manifest, submission };
}
afterEach(() => {
  for (const directory of directories.splice(0)) {
    if (
      path.dirname(path.resolve(directory)) !== path.resolve(os.tmpdir()) ||
      !path.basename(directory).startsWith("takko-benchmark-cli-")
    )
      throw Error("Unexpected cleanup target");
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
it("issues pending rather than a fabricated score and preserves existing outputs", () => {
  const f = fixture(),
    out = path.join(f.root, "score");
  const result = benchmarkQualityCli(
    ["score", "--submission", f.file, "--manifest", f.manifest, "--out", out],
    f.root,
  );
  expect(result).toMatchObject({
    status: "pending",
    finalScore: null,
    providerCalls: 0,
  });
  expect(fs.readFileSync(path.join(out, "report.md"), "utf8")).toContain(
    "not issued",
  );
  expect(() =>
    benchmarkQualityCli(
      ["score", "--submission", f.file, "--manifest", f.manifest, "--out", out],
      f.root,
    ),
  ).toThrow("already exists");
});
it("refuses a stale submission before writing scores", () => {
  const f = fixture(),
    out = path.join(f.root, "score");
  fs.writeFileSync(
    f.file,
    JSON.stringify({ ...f.submission, candidateId: "changed" }),
  );
  expect(() =>
    benchmarkQualityCli(
      ["score", "--submission", f.file, "--manifest", f.manifest, "--out", out],
      f.root,
    ),
  ).toThrow("Submission or artifact changed");
  expect(fs.existsSync(out)).toBe(false);
});
it("does not rank retrospective results as a controlled model comparison", () => {
  const a = fixture(),
    b = fixture(),
    out = path.join(a.root, "comparison.json");
  benchmarkQualityCli(
    [
      "compare",
      "--a",
      a.file,
      "--a-manifest",
      a.manifest,
      "--b",
      b.file,
      "--b-manifest",
      b.manifest,
      "--out",
      out,
    ],
    a.root,
  );
  const result = JSON.parse(fs.readFileSync(out, "utf8"));
  expect(result.comparable).toBe(false);
  expect(result.numericComparisonReady).toBe(false);
  expect(result.delta).toBeNull();
});
