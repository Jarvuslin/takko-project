import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { StdioStudioClient } from "../src/generation/studio-mcp-client";
import { StudioAssetAdapter } from "../src/generation/studio-asset-adapter";
import { createStudioAudioCapture } from "../src/generation/audio-capture";
import type { Project } from "../src/generation/schema";

// Product regression only: never submit this replay as a worker benchmark result.
// The candidate is taken from an immutable worker decision and must be returned
// again by the original query. This script cannot select a replacement candidate.
const [projectFile, outputDirectory] = process.argv.slice(2);
if (!projectFile || !outputDirectory)
  throw Error("Expected saved project and new output directory");
const source = fs.readFileSync(projectFile);
const project: Project = JSON.parse(source.toString("utf8"));
const run = project.assetPipeline;
if (!run || !project.assetStudioId)
  throw Error("Missing retained worker run/Studio binding");
const selection = run.events.find(
  (event) =>
    event.step === "candidate_selected" &&
    run.needs.find((need) => need.id === event.needId)?.kind === "Audio",
);
if (!selection) throw Error("No worker-selected audio exists to replay");
const selected = (selection.data as any).candidate;
const need = run.needs.find((item) => item.id === selection.needId)!;
const searchEvent = run.events.find(
  (event) => event.needId === need.id && event.step === "search_call",
);
const query = (searchEvent?.data as any)?.query;
if (typeof query !== "string") throw Error("Missing original query");
fs.mkdirSync(outputDirectory, { recursive: false });
const report: Record<string, any> = {
  kind: "native-product-audio-regression",
  benchmarkEligible: false,
  paidCalls: 0,
  sourceProject: path.resolve(projectFile),
  sourceSha256: createHash("sha256").update(source).digest("hex"),
  sourceHashesAtStart: Object.fromEntries(
    [
      "src/generation/studio-audio-runtime.ts",
      "src/generation/studio-asset-adapter.ts",
      "src/generation/audio-capture.ts",
      "src/generation/audio-evidence.ts",
      "src/generation/studio-state.ts",
    ].map((file) => [
      file,
      createHash("sha256").update(fs.readFileSync(file)).digest("hex"),
    ]),
  ),
  selection,
  query,
  studioId: project.assetStudioId,
  scope:
    "TakkoAudioDiagnostic_" + randomUUID().replaceAll("-", "").slice(0, 16),
  startedAt: new Date().toISOString(),
  passed: false,
};
function save() {
  fs.writeFileSync(
    path.join(outputDirectory, "result.json"),
    JSON.stringify(
      report,
      (key, value) =>
        key === "dataUrl" || key === "image"
          ? "[binary evidence stored separately by adapter]"
          : value,
      2,
    ),
  );
}
save();
const client = new StdioStudioClient({ timeoutMs: 60000 });
const signal = AbortSignal.timeout(180000);
const adapter = new StudioAssetAdapter(client, {
  studioId: project.assetStudioId,
  scope: report.scope,
  evidenceDirectory: outputDirectory,
  audioCapture: createStudioAudioCapture(client, {
    helperPath: path.resolve(
      ".forge/tools/audio-capture/TakkoAudioCapture.exe",
    ),
    evidenceDirectory: outputDirectory,
  }),
});
try {
  report.discovery = await client.callTool("list_roblox_studios", {}, signal);
  report.before = await client.callTool(
    "get_studio_state",
    { studio_id: project.assetStudioId },
    signal,
  );
  // Adapter independently verifies the complete state and identity before mutation.
  const results = await adapter.search(need, query, signal);
  report.search = results;
  save();
  const candidate = results.candidates.find((item) => item.id === selected.id);
  if (!candidate)
    throw Error(
      "Historical worker selection is no longer offered; no replacement permitted",
    );
  const inspection = await adapter.inspect(
    need,
    candidate,
    "diagnostic_" + randomUUID().replaceAll("-", ""),
    signal,
  );
  report.inspection = inspection;
  save();
  try {
    if (
      !inspection.safe ||
      !inspection.functional.playbackObserved ||
      !inspection.audio
    )
      throw Error(
        "Native audio inspection did not produce playback and recorded evidence",
      );
    report.placement = await adapter.place(need, inspection, signal);
    save();
  } finally {
    report.cleanup = await adapter.discard(
      inspection,
      AbortSignal.timeout(30000),
    );
    save();
  }
  report.after = await client.callTool(
    "get_studio_state",
    { studio_id: project.assetStudioId },
    signal,
  );
  report.passed =
    report.placement?.passed === true &&
    !!report.placement?.functional?.playbackObserved &&
    !!report.placement?.audio;
} catch (error: any) {
  report.error = {
    message: error.message,
    classification: error.classification,
    effects: error.effects,
    receipts: error.receipts,
  };
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  save();
  await client.close();
  console.log(
    JSON.stringify({
      passed: report.passed,
      error: report.error?.message,
      report: path.resolve(outputDirectory, "result.json"),
    }),
  );
}
