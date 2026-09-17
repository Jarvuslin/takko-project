import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  assessAssetExecution,
  scoreQualityWithAssetExecution,
} from "../src/benchmark/asset-execution";
import { getBenchmarkCase } from "../src/benchmark/cases";
import { createEvidenceFileManifest } from "../src/benchmark/evidence-files";
import { type QualitySubmission } from "../src/benchmark/quality";
import { newProject } from "../src/generation/store";
import type { AssetPipelineRun } from "../src/generation/asset-contract";
import { bundleHash } from "../src/generation/validation";
import { benchmarkQualityCli } from "../scripts/benchmark-quality";

// Synthetic retained-project records only. No native observations or provider calls.
const definition = getBenchmarkCase("dev.asset-integration");
const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
function fixture(status: AssetPipelineRun["status"] = "failed") {
  const project = newProject(definition.prompt, 1_000_000);
  const run: AssetPipelineRun = {
    version: 1,
    runId: "offline-run",
    revision: project.revision,
    inputHash: "",
    status,
    startedAt: "2026-09-15T00:00:00Z",
    finishedAt: status === "running" ? undefined : "2026-09-15T00:00:01Z",
    adapter: "offline-adapter",
    policy: {
      maxSearches: 2,
      maxCandidates: 3,
      allowEscalation: false,
      workerRoute: "offline-worker",
      evaluatorRoute: "offline-evaluator",
    },
    needs: [
      {
        id: "prop",
        requirementId: "decor",
        kind: "Model",
        role: "Decor",
        query: "bakery",
        constraints: "Suitable style",
        required: true,
        position: [0, 0, 0],
        maxSize: 12,
      },
    ],
    entries: [
      {
        needId: "prop",
        status: "failed",
        reason: "No suitable returned candidate",
        attempts: 0,
      },
    ],
    events: [],
    error: "No suitable returned candidate",
  };
  run.inputHash = digest(
    JSON.stringify({
      revision: project.revision,
      request: project.request,
      needs: run.needs,
      studio: project.assetStudioId,
      worker: run.policy.workerRoute,
      evaluator: run.policy.evaluatorRoute,
    }),
  );
  project.assetPipeline = run;
  return project;
}
function submission(project: ReturnType<typeof fixture>): QualitySubmission {
  return {
    candidateId: "offline-candidate",
    artifactHash: bundleHash(project.artifact!),
    caseId: definition.id,
    caseVersion: definition.version,
    protocolVersion: "test",
    track: definition.track,
    budgetMicros: 0,
    runKind: "prospective",
    assistance: "untouched_model",
    toolProfile: "offline",
    environmentProfile: "offline",
    evidence: [],
    dimensionScores: [],
    gateResults: [],
    devChecks: [],
  };
}
function markPassed(project: ReturnType<typeof fixture>) {
  const run = project.assetPipeline!;
  run.status = "passed";
  delete run.error;
  run.entries[0] = {
    needId: "prop",
    status: "passed",
    attempts: 1,
    selected: {
      id: "123",
      name: "Offline prop",
      kind: "Model",
      creator: "test",
      sourceUrl: "https://example.test/asset",
      price: 0,
      source: "creator_store",
    },
    bundle: {
      scene: [
        { path: "Workspace/Test/Prop", className: "Part", properties: {} },
      ],
      files: [],
      assets: [],
      coverage: [],
    },
  };
}
function pinnedFixture() {
  const project = fixture(),
    run = project.assetPipeline!;
  const profile = {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Offline",
    provider: "compatible" as const,
    baseUrl: "http://127.0.0.1:1234/v1",
    model: "offline-model",
    inputRate: 0,
    outputRate: 0,
    maxOutputTokens: 512,
    jsonMode: true,
  };
  const inputContext = {
    revision: project.revision,
    request: project.request,
    needs: structuredClone(run.needs),
    studio: project.assetStudioId,
    worker: profile,
    evaluator: { ...profile, id: "00000000-0000-4000-8000-000000000002" },
  };
  return {
    ...project,
    assetPipeline: {
      ...run,
      policy: {
        ...run.policy,
        workerRoute: inputContext.worker.id,
        evaluatorRoute: inputContext.evaluator.id,
      },
      inputContext,
      inputHash: digest(JSON.stringify(inputContext)),
    },
  };
}
const folders: string[] = [];
afterEach(() => {
  for (const folder of folders.splice(0)) {
    if (
      path.dirname(path.resolve(folder)) !== path.resolve(os.tmpdir()) ||
      !path.basename(folder).startsWith("takko-asset-assessment-")
    )
      throw Error("Unsafe test cleanup");
    fs.rmSync(folder, { recursive: true, force: true });
  }
});
function temp() {
  const folder = fs.mkdtempSync(
    path.join(os.tmpdir(), "takko-asset-assessment-"),
  );
  folders.push(folder);
  return folder;
}

describe("retained asset execution assessment (offline fixtures)", () => {
  it("validates the frozen full-profile hash preimage without reordering its properties", () => {
    const project = pinnedFixture();
    expect(assessAssetExecution(project).execution).toMatchObject({
      inputBinding: "full_profiles",
      inputHash: project.assetPipeline.inputHash,
    });
    project.assetPipeline.inputContext.worker.model = "changed-model";
    expect(() => assessAssetExecution(project)).toThrow("input hash");
  });
  it("accepts a delta run only when every need matches the frozen aggregate scope", () => {
    const project = pinnedFixture();
    project.assetPipeline.inputContext.needs.push({
      ...project.assetPipeline.needs[0],
      id: "extra",
    });
    project.assetPipeline.inputHash = digest(
      JSON.stringify(project.assetPipeline.inputContext),
    );
    expect(assessAssetExecution(project).execution).toMatchObject({
      inputNeedCount: 2,
    });
    project.assetPipeline.needs[0].query = "changed query";
    expect(() => assessAssetExecution(project)).toThrow(
      "Frozen asset input context",
    );
  });
  it("accepts and hash-binds an explicit full component-reviewer profile without changing the ordinary evaluator route", () => {
    const project = pinnedFixture();
    const inputContext = {
      ...project.assetPipeline.inputContext,
      componentReviewer: {
        ...project.assetPipeline.inputContext.evaluator,
        id: "00000000-0000-4000-8000-000000000003",
        model: "offline-source-reviewer",
        inputRate: 3,
      },
    };
    project.assetPipeline.inputContext = inputContext;
    project.assetPipeline.inputHash = digest(JSON.stringify(inputContext));
    const original = structuredClone(project);
    expect(assessAssetExecution(project).execution).toMatchObject({
      inputBinding: "full_profiles",
      inputHash: project.assetPipeline.inputHash,
    });
    expect(project).toEqual(original);
    expect(project.assetPipeline.policy.evaluatorRoute).toBe(
      inputContext.evaluator.id,
    );
    inputContext.componentReviewer.model = "changed-source-reviewer";
    expect(() => assessAssetExecution(project)).toThrow("input hash");
  });
  it.each(["id", "rate", "unknown-field"])(
    "rejects a malformed component-reviewer profile even when the outer context hash matches (%s)",
    (mode) => {
      const project = pinnedFixture();
      const componentReviewer = {
        ...project.assetPipeline.inputContext.evaluator,
      } as Record<string, unknown>;
      if (mode === "id") componentReviewer.id = "not-a-profile-id";
      if (mode === "rate") componentReviewer.inputRate = -1;
      if (mode === "unknown-field") componentReviewer.accepted = true;
      const inputContext = {
        ...project.assetPipeline.inputContext,
        componentReviewer,
      };
      const raw = {
        ...project,
        assetPipeline: {
          ...project.assetPipeline,
          inputContext,
          inputHash: digest(JSON.stringify(inputContext)),
        },
      };
      expect(() => assessAssetExecution(raw)).toThrow(/componentReviewer/);
    },
  );
  it("hash-binds an optional full component adapter profile while preserving the selection worker", () => {
    const project = pinnedFixture();
    const inputContext = {
      ...project.assetPipeline.inputContext,
      componentAdapter: {
        ...project.assetPipeline.inputContext.worker,
        model: "selected-component-adapter",
        inputRate: 3,
      },
    };
    project.assetPipeline.inputContext = inputContext;
    project.assetPipeline.inputHash = digest(JSON.stringify(inputContext));
    expect(assessAssetExecution(project).execution?.inputBinding).toBe(
      "full_profiles",
    );
    expect(project.assetPipeline.policy.workerRoute).toBe(
      inputContext.worker.id,
    );
    inputContext.componentAdapter.inputRate = 4;
    expect(() => assessAssetExecution(project)).toThrow("input hash");
  });
  it.each(["id", "rate", "unknown-field"])(
    "rejects an invalid component adapter with recomputed context hash: %s",
    (mode) => {
      const project = pinnedFixture();
      const componentAdapter = {
        ...project.assetPipeline.inputContext.worker,
      } as Record<string, unknown>;
      if (mode === "id") componentAdapter.id = "wrong-id";
      if (mode === "rate") componentAdapter.outputRate = -1;
      if (mode === "unknown-field") componentAdapter.accepted = true;
      const inputContext = {
        ...project.assetPipeline.inputContext,
        componentAdapter,
      };
      expect(() =>
        assessAssetExecution({
          ...project,
          assetPipeline: {
            ...project.assetPipeline,
            inputContext,
            inputHash: digest(JSON.stringify(inputContext)),
          },
        }),
      ).toThrow(/componentAdapter/);
    },
  );
  it.each(["route", "studio", "revision"])(
    "rejects frozen-context attribution mismatch: %s",
    (kind) => {
      const project = pinnedFixture();
      if (kind === "route")
        project.assetPipeline.policy.workerRoute = "other-route";
      if (kind === "studio") project.assetStudioId = "other-studio";
      if (kind === "revision") project.assetPipeline.inputContext.revision++;
      expect(() => assessAssetExecution(project)).toThrow(
        "Frozen asset input context",
      );
    },
  );
  it.each(["failed", "interrupted", "escalation_required"] as const)(
    "records %s before any game artifact as failed, not pending",
    (status) => {
      const project = fixture(status),
        before = structuredClone(project);
      const result = assessAssetExecution(project, {
        definition,
        recordOrigin: "offline_test",
      });
      expect(result.status).toBe("failed");
      expect(result.finalScore).toBeNull();
      expect(result.project.artifactHash).toBeNull();
      expect(
        result.gates.find((g) => g.gate === "asset_integration")?.status,
      ).toBe("failed");
      expect(result.provenance.recordOrigin).toBe("offline_test");
      expect(result.execution).toMatchObject({
        revision: project.revision,
        inputHash: project.assetPipeline!.inputHash,
      });
      expect(project).toEqual(before);
      expect(result).not.toHaveProperty("evidence");
    },
  );
  it("makes uncertainty fail even when status still says running", () => {
    const project = fixture("running");
    project.assetPipeline!.requiresReconciliation = true;
    expect(assessAssetExecution(project).status).toBe("failed");
  });
  it("keeps missing/running execution pending and labels unknown record origin honestly", () => {
    const project = fixture("running");
    expect(assessAssetExecution(project)).toMatchObject({
      status: "pending",
      provenance: { recordOrigin: "unverified" },
    });
    project.assetPipeline = null;
    expect(assessAssetExecution(project)).toMatchObject({
      status: "pending",
      execution: null,
    });
  });
  it("never converts a passed asset stage or optional failure into native/full-game acceptance", () => {
    const project = fixture();
    markPassed(project);
    const passed = assessAssetExecution(project, { definition });
    expect(passed.status).toBe("pending");
    expect(passed.gates.every((g) => g.status === "pending")).toBe(true);
    project.assetPipeline!.needs[0].required = false;
    project.assetPipeline!.entries[0] = {
      needId: "prop",
      status: "failed",
      attempts: 1,
    };
    const run = project.assetPipeline!;
    run.inputHash = digest(
      JSON.stringify({
        revision: project.revision,
        request: project.request,
        needs: run.needs,
        worker: run.policy.workerRoute,
        evaluator: run.policy.evaluatorRoute,
      }),
    );
    expect(assessAssetExecution(project).status).toBe("pending");
  });
  it("emits only provenance hashes/summary, not source, image, secrets or raw event payloads", () => {
    const project = fixture();
    project.assetPipeline!.events.push({
      at: "2026-09-15T00:00:00Z",
      step: "inspect_error",
      needId: "prop",
      data: { image: "private-image", privateField: "private-value" },
    });
    const result = assessAssetExecution(project);
    expect(result.execution?.recordHash).toBe(
      digest(JSON.stringify(project.assetPipeline)),
    );
    expect(JSON.stringify(result)).not.toContain("private-value");
    expect(JSON.stringify(result)).not.toContain("private-image");
    expect(result.gates.map((g) => g.gate)).toEqual([
      "asset_sourcing",
      "asset_integration",
    ]);
  });
  it.each(["revision", "inputHash", "request", "entry", "case"])(
    "rejects mismatched attribution: %s",
    (kind) => {
      const project = fixture();
      if (kind === "revision") project.revision++;
      if (kind === "inputHash")
        project.assetPipeline!.inputHash = "f".repeat(64);
      if (kind === "request" || kind === "case")
        project.request = "A different game prompt";
      if (kind === "entry")
        project.assetPipeline!.entries[0].needId = "unknown";
      expect(() =>
        assessAssetExecution(project, kind === "case" ? { definition } : {}),
      ).toThrow();
    },
  );
  it("rejects malformed records and contradictory passed required needs", () => {
    expect(() => assessAssetExecution({ schemaVersion: 2 })).toThrow();
    const project = fixture("passed");
    expect(() => assessAssetExecution(project)).toThrow(
      "incomplete required need",
    );
    project.assetPipeline!.entries[0].status = "passed";
    expect(() => assessAssetExecution(project)).toThrow("candidate/export");
  });
  it("vetoes an artifact-backed quality result without inventing native evidence", () => {
    const project = fixture();
    project.artifact = { files: [], scene: [], assets: [], coverage: [] };
    const input = submission(project);
    const result = scoreQualityWithAssetExecution(definition, input, project, {
      recordOrigin: "offline_test",
    });
    expect(result.status).toBe("failed");
    expect(result.finalScore).toBeNull();
    expect(
      result.gates.find((g) => g.gate === "asset_integration"),
    ).toMatchObject({ status: "failed", evidenceIds: [] });
    expect(result.systemExecution.provenance.recordOrigin).toBe("offline_test");
    expect(input.evidence).toEqual([]);
    expect(() =>
      scoreQualityWithAssetExecution(
        definition,
        { ...input, artifactHash: "f".repeat(64) },
        project,
      ),
    ).toThrow("artifact does not match");
    project.artifact = null;
    expect(() =>
      scoreQualityWithAssetExecution(definition, input, project),
    ).toThrow("artifact does not match");
  });
  it("leaves quality observation gates pending when the asset stage passed", () => {
    const project = fixture();
    markPassed(project);
    project.artifact = { files: [], scene: [], assets: [], coverage: [] };
    const result = scoreQualityWithAssetExecution(
      definition,
      submission(project),
      project,
    );
    expect(result.status).toBe("pending");
    expect(result.gates.every((g) => g.status === "pending")).toBe(true);
  });
  it("CLI writes an explicit pre-artifact failure with exact file hash and refuses overwrite", () => {
    const folder = temp(),
      file = path.join(folder, "project.json"),
      out = path.join(folder, "assessment.json");
    const bytes = JSON.stringify(fixture(), null, 2);
    fs.writeFileSync(file, bytes);
    const args = [
      "asset-execution",
      "--project",
      file,
      "--case",
      definition.id,
      "--out",
      out,
    ];
    expect(benchmarkQualityCli(args, folder)).toMatchObject({
      status: "failed",
      finalScore: null,
      providerCalls: 0,
    });
    const result = JSON.parse(fs.readFileSync(out, "utf8"));
    expect(result.sourceFileSha256).toBe(digest(bytes));
    expect(result.provenance.recordOrigin).toBe("unverified");
    expect(() => benchmarkQualityCli(args, folder)).toThrow();
  });
  it("score CLI includes retained execution veto after existing evidence-file verification", () => {
    const folder = temp(),
      project = fixture();
    project.artifact = { files: [], scene: [], assets: [], coverage: [] };
    const input = submission(project);
    const save = (name: string, data: unknown) => {
      const file = path.join(folder, name);
      fs.writeFileSync(file, JSON.stringify(data));
      return file;
    };
    const projectPath = save("project.json", project),
      inputPath = save("submission.json", input),
      manifest = save(
        "manifest.json",
        createEvidenceFileManifest(input, folder),
      ),
      out = path.join(folder, "scored");
    expect(
      benchmarkQualityCli(
        [
          "score",
          "--submission",
          inputPath,
          "--manifest",
          manifest,
          "--asset-project",
          projectPath,
          "--out",
          out,
        ],
        folder,
      ),
    ).toMatchObject({ status: "failed", finalScore: null });
    const result = JSON.parse(
      fs.readFileSync(path.join(out, "result.json"), "utf8"),
    );
    expect(result.systemExecution.status).toBe("failed");
    expect(result.integrity.integrity).toBe("verified");
    expect(fs.readFileSync(path.join(out, "report.md"), "utf8")).toContain(
      "System asset execution",
    );
  });
});
