import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { StudioAssetAdapter } from "../src/generation/studio-asset-adapter";
import { StdioStudioClient } from "../src/generation/studio-mcp-client";

// Product regression replay of frozen selections, explicitly NOT a fresh autonomous benchmark.
const [studioId, directory] = process.argv.slice(2);
if (!/^[a-f0-9-]{36}$/.test(studioId ?? "") || !directory)
  throw Error("Usage: STUDIO_UUID FRESH_OUTPUT_DIRECTORY");
const output = path.resolve(directory);
fs.mkdirSync(output, { recursive: false });
const client = new StdioStudioClient();
const results = [];
let activeCase:
  { name: string; scope: string; sourceProject: string } | undefined;
try {
  for (const name of ["combat-training", "bubble-wrap", "checkpoint-parkour"]) {
    const projectFile = `benchmarks/runs/marketplace-diversity-v2-20260916/${name}/final-project.json`;
    const project = JSON.parse(fs.readFileSync(projectFile, "utf8"));
    const selected = project.assetPipeline.events.find(
      (e: any) => e.step === "candidate_selected",
    );
    const need = project.assetPipeline.needs.find(
      (n: any) => n.id === selected.needId,
    );
    const scope =
      "ArchiveRegression_" + randomUUID().replaceAll("-", "").slice(0, 12);
    activeCase = { name, scope, sourceProject: project.id };
    const adapter = new StudioAssetAdapter(client, {
      studioId,
      scope,
      evidenceDirectory: path.join(output, name),
    });
    const signal = AbortSignal.timeout(60000);
    const search = await adapter.search(need, need.query, signal);
    const candidate = search.candidates.find(
      (c) => c.id === selected.data.candidate.id,
    );
    if (!candidate)
      throw Error(
        "Frozen selection is no longer offered; do not substitute another asset",
      );
    const inspection = await adapter.inspect(
      need,
      candidate,
      name + "-regression",
      signal,
    );
    const component = inspection.receipts.find(
      (r) => r.operation === "component_archive",
    );
    // Always remove only this owned import. A cleanup exception stops the entire replay.
    const cleanup = await adapter.discard(
      inspection,
      AbortSignal.timeout(15000),
    );
    const record = {
      case: name,
      sourceProject: project.id,
      scope,
      candidate,
      component: component?.data ?? null,
      inspectionReceipts: inspection.receipts,
      capabilityBlock: inspection.capabilityBlock,
      safe: inspection.safe,
      cleanup,
      paidCalls: 0,
      benchmark: false,
      importedCodeExecuted: false,
    };
    fs.writeFileSync(
      path.join(output, name + ".json"),
      JSON.stringify(record, null, 2),
      { flag: "wx" },
    );
    results.push(record);
    activeCase = undefined;
    console.log(
      JSON.stringify({
        case: name,
        component: record.component,
        safe: record.safe,
      }),
    );
  }
  fs.writeFileSync(
    path.join(output, "result.json"),
    JSON.stringify(
      { kind: "frozen-selection-native-archive-regression", studioId, results },
      null,
      2,
    ),
    { flag: "wx" },
  );
} catch (error) {
  // Preserve terminal evidence without dumping source payloads to the console or
  // assuming a timed-out native mutation is safe to repeat/clean up.
  const failure = {
    kind: "frozen-selection-native-archive-regression-failure",
    studioId,
    activeCase,
    completedCases: results.map((r) => r.case),
    error: error instanceof Error ? error.message : String(error),
    effects: (error as any)?.effects ?? "unknown",
    receipts: (error as any)?.receipts ?? [],
    paidCalls: 0,
    benchmark: false,
  };
  fs.writeFileSync(
    path.join(output, "failure.json"),
    JSON.stringify(failure, null, 2),
    { flag: "wx" },
  );
  console.error(
    JSON.stringify({
      error: failure.error,
      effects: failure.effects,
      evidenceFile: path.join(output, "failure.json"),
    }),
  );
  process.exitCode = 1;
} finally {
  client.close();
}
