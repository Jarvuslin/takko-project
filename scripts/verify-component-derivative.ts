import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { StudioAssetAdapter } from "../src/generation/studio-asset-adapter";
import { StdioStudioClient } from "../src/generation/studio-mcp-client";
import { gameContext } from "../src/generation/game-context";

// Explicit product regression: replay frozen worker selections without a model,
// new asset choices, game-code edits or any execution of imported scripts.
const [studioId, directory] = process.argv.slice(2);
if (!/^[a-f0-9-]{36}$/.test(studioId ?? "") || !directory)
  throw Error("Usage: STUDIO_UUID FRESH_OUTPUT_DIRECTORY");
const output = path.resolve(directory);
fs.mkdirSync(output, { recursive: false });
const client = new StdioStudioClient();
const results: unknown[] = [];
let active: unknown;
try {
  for (const name of ["combat-training", "bubble-wrap", "checkpoint-parkour"]) {
    const project = JSON.parse(
      fs.readFileSync(
        `benchmarks/runs/marketplace-diversity-v2-20260916/${name}/final-project.json`,
        "utf8",
      ),
    );
    const selected = project.assetPipeline.events.find(
      (event: any) => event.step === "candidate_selected",
    );
    const need = project.assetPipeline.needs.find(
      (entry: any) => entry.id === selected.needId,
    );
    const scope =
      "DerivativeRegression_" + randomUUID().replaceAll("-", "").slice(0, 12);
    const inputContext = gameContext(project, need);
    const inputHash = createHash("sha256")
      .update(JSON.stringify(inputContext))
      .digest("hex");
    const adapter = new StudioAssetAdapter(client, {
      studioId,
      scope,
      evidenceDirectory: path.join(output, name),
    });
    active = { name, scope, inputHash };
    const found = await adapter.search(
      need,
      need.query,
      AbortSignal.timeout(30000),
    );
    const candidate = found.candidates.find(
      (entry) => entry.id === selected.data.candidate.id,
    );
    if (!candidate)
      throw Error(
        "Frozen worker-selected candidate unavailable; no substitution",
      );
    const inspection = await adapter.inspect(
      need,
      candidate,
      name + "-derivative",
      AbortSignal.timeout(90000),
    );
    active = {
      name,
      scope,
      token: inspection.token,
      inputHash,
      receipts: inspection.receipts,
    };
    let result;
    let cleanup;
    try {
      result = await adapter.captureRestrictedComponent(
        inspection,
        inputHash,
        AbortSignal.timeout(90000),
      );
    } catch (error) {
      if ((error as any)?.effects !== "unknown")
        cleanup = await adapter.discard(inspection, AbortSignal.timeout(20000));
      active = { active, cleanup };
      throw error;
    }
    cleanup = await adapter.discard(inspection, AbortSignal.timeout(20000));
    const review = JSON.parse(fs.readFileSync(result.reviewFile, "utf8"));
    if (
      review.sourceBodies.reduce(
        (count: number, body: any) => count + body.bindings.length,
        0,
      ) !== result.sourceCount ||
      !result.derivative.roundTrip.passed ||
      review.executed !== false ||
      inspection.safe ||
      !inspection.capabilityBlock
    )
      throw Error("Derivative review evidence failed acceptance");
    const record = {
      case: name,
      sourceProject: project.id,
      candidate,
      scope,
      inputContext,
      inputHash,
      originalReceipts: inspection.receipts,
      result,
      cleanup,
      paidCalls: 0,
      benchmark: false,
      importedCodeExecuted: false,
    };
    fs.writeFileSync(
      path.join(output, name + ".json"),
      JSON.stringify(record, null, 2) + "\n",
      { flag: "wx" },
    );
    results.push(record);
    active = undefined;
    console.log(
      JSON.stringify({
        case: name,
        instances: result.derivative.instanceCount,
        sources: result.sourceCount,
        uniqueSources: result.uniqueSourceBodies,
        changedInstances: result.changedInstances,
        nativeRestoration: result.derivative.roundTrip.passed,
        originalRetained: true,
        reviewPending: true,
      }),
    );
  }
  fs.writeFileSync(
    path.join(output, "result.json"),
    JSON.stringify(
      {
        kind: "native-component-derivative-product-regression",
        studioId,
        results,
      },
      null,
      2,
    ) + "\n",
    { flag: "wx" },
  );
} catch (error) {
  const failure = {
    active,
    error: error instanceof Error ? error.message : String(error),
    receipts: (error as any)?.receipts ?? [],
    completedCases: results,
    paidCalls: 0,
  };
  fs.writeFileSync(
    path.join(output, "failure.json"),
    JSON.stringify(failure, null, 2) + "\n",
    { flag: "wx" },
  );
  console.error(
    JSON.stringify({
      error: failure.error,
      evidenceFile: path.join(output, "failure.json"),
    }),
  );
  process.exitCode = 1;
} finally {
  client.close();
}
