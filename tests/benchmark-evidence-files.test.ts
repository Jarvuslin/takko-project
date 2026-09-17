import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { afterEach, expect, it } from "vitest";
import {
  createEvidenceFileManifest,
  verifyEvidenceFileManifest,
} from "../src/benchmark/evidence-files";
import type { QualitySubmission } from "../src/benchmark/quality";

const directories: string[] = [];
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "takko-bench-evidence-"));
  directories.push(root);
  fs.writeFileSync(
    path.join(root, "run.json"),
    JSON.stringify({ observed: "fixture" }),
  );
  const submission: QualitySubmission = {
    candidateId: "fixture",
    artifactHash: "a".repeat(64),
    caseId: "fixture",
    caseVersion: "1",
    protocolVersion: "1",
    track: "dev_task",
    budgetMicros: null,
    runKind: "retrospective",
    assistance: "expert_assisted",
    toolProfile: "fixture",
    environmentProfile: "fixture",
    dimensionScores: [],
    gateResults: [],
    devChecks: [],
    evidence: [
      {
        id: "run",
        artifactHash: "a".repeat(64),
        kind: "native_test",
        uri: "run.json",
        observation: "Fixture only; not a native run",
        outcome: "observed",
      },
    ],
  };
  return { root, submission };
}
afterEach(() => {
  for (const directory of directories.splice(0)) {
    if (
      path.dirname(path.resolve(directory)) !== path.resolve(os.tmpdir()) ||
      !path.basename(directory).startsWith("takko-bench-evidence-")
    )
      throw Error("Unexpected cleanup target");
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

it("detects changed observations, artifact attribution and file contents after freezing", () => {
  const { root, submission } = fixture(),
    manifest = createEvidenceFileManifest(submission, root);
  expect(
    verifyEvidenceFileManifest(submission, manifest, root).verifiedFiles,
  ).toBe(1);
  const altered = structuredClone(submission);
  altered.evidence[0].observation = "new unsupported claim";
  expect(() => verifyEvidenceFileManifest(altered, manifest, root)).toThrow(
    "Submission or artifact changed",
  );
  expect(() =>
    verifyEvidenceFileManifest(
      { ...submission, artifactHash: "b".repeat(64) },
      manifest,
      root,
    ),
  ).toThrow();
  fs.writeFileSync(path.join(root, "run.json"), "changed");
  expect(() => verifyEvidenceFileManifest(submission, manifest, root)).toThrow(
    "Evidence file changed",
  );
});

it("rejects missing files, external URLs, traversal and duplicate evidence manifest IDs", () => {
  const { root, submission } = fixture();
  for (const uri of [
    "missing.json",
    "https://example.test/evidence",
    "../outside.json",
  ]) {
    const changed = structuredClone(submission);
    changed.evidence[0].uri = uri;
    expect(() => createEvidenceFileManifest(changed, root)).toThrow();
  }
  const manifest = createEvidenceFileManifest(submission, root);
  manifest.entries.push(manifest.entries[0]);
  expect(() => verifyEvidenceFileManifest(submission, manifest, root)).toThrow(
    "entries",
  );
});

it("rejects symlinked evidence outside the declared workspace", () => {
  const { root, submission } = fixture(),
    outside = fixture().root;
  fs.symlinkSync(
    outside,
    path.join(root, "linked"),
    process.platform === "win32" ? "junction" : "dir",
  );
  submission.evidence[0].uri = "linked/run.json";
  expect(() => createEvidenceFileManifest(submission, root)).toThrow(
    "escapes workspace",
  );
});
