import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { Engine } from "../src/generation/engine";
import { Configuration } from "../src/generation/settings";
import { GenerationStore, newProject } from "../src/generation/store";

it("a server restart preserves interrupted asset receipts and prevents revising away uncertain effects", () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "takko-asset-recovery-"),
  );
  try {
    const store = new GenerationStore(directory);
    const p = newProject("A game with retrieved models", 2e6);
    p.jobId = "interrupted-job";
    p.assetPipeline = {
      version: 1,
      runId: "interrupted-run",
      revision: p.revision,
      inputHash: "a".repeat(64),
      status: "running",
      startedAt: new Date().toISOString(),
      policy: {
        maxSearches: 2,
        maxCandidates: 3,
        allowEscalation: false,
        workerRoute: "worker",
        evaluatorRoute: "reviewer",
      },
      adapter: "mock-only",
      needs: [],
      entries: [],
      events: [
        {
          at: new Date().toISOString(),
          needId: "",
          step: "inspect_call",
          data: { token: "owned-token", mocked: true },
        },
      ],
    };
    store.save(p);
    const historical = newProject("Preserved failed native audio trial", 2e6);
    historical.assetPipeline = {
      ...structuredClone(p.assetPipeline),
      runId: "historical-failed-run",
      status: "failed",
      requiresReconciliation: true,
      finishedAt: "2026-09-15T00:00:00Z",
      error: "Historical cleanup was conservatively classified as unknown",
      events: [
        {
          at: "2026-09-15T00:00:00Z",
          needId: "audio",
          step: "inspect_error",
          data: {
            effects: "unknown",
            receipts: [{ operation: "cleanup", data: { removed: 2 } }],
          },
        },
      ],
    };
    store.save(historical);
    const engine = new Engine(
      store,
      new Configuration(path.join(directory, "configuration")),
    );
    const recovered = store.get(p.id);
    expect(recovered.assetPipeline?.status).toBe("interrupted");
    expect(recovered.assetPipeline?.requiresReconciliation).toBe(true);
    expect(recovered.assetPipeline?.events).toEqual(p.assetPipeline.events);
    expect(() =>
      engine.revise(p.id, p.revision, "Skip the old assets", {}),
    ).toThrow("unresolved native effects");
    expect(() =>
      engine.bindAssetStudio(
        p.id,
        p.revision,
        "11111111-1111-4111-8111-111111111111",
      ),
    ).toThrow("unresolved native effects");
    expect(store.get(p.id).assetPipeline?.runId).toBe("interrupted-run");
    // New classification logic applies to new operations, never retrospective reinterpretation.
    expect(store.get(historical.id).assetPipeline).toEqual(
      historical.assetPipeline,
    );
    expect(() =>
      engine.revise(historical.id, historical.revision, "Retry audio", {}),
    ).toThrow("unresolved native effects");
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
