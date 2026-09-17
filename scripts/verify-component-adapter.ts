import fs from "node:fs";
import path from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { StudioAssetAdapter } from "../src/generation/studio-asset-adapter";
import { StdioStudioClient } from "../src/generation/studio-mcp-client";
import { loadComponentReviewEvidence } from "../src/generation/component-review";
import { validateComponentReview } from "../src/generation/component-review";

// Native infrastructure regression: replay recorded worker edits, rebinding only
// evidence identity after proving that the fresh captured inventory is identical.
// This is not a new raw-model trial, a search benchmark or execution approval.
const [studioId, outputDirectory] = process.argv.slice(2);
const reviewsDirectory = process.argv
  .find((arg) => arg.startsWith("--reviews="))
  ?.slice(10);
if (!/^[a-f0-9-]{36}$/.test(studioId ?? "") || !outputDirectory)
  throw Error("Usage: STUDIO_UUID FRESH_OUTPUT_DIRECTORY");
const output = path.resolve(outputDirectory);
fs.mkdirSync(output, { recursive: false });
const nativeDirectory = "docs/results/takko-component-configuration/native-v1";
const native = JSON.parse(
  fs.readFileSync(path.join(nativeDirectory, "result.json"), "utf8"),
);
const client = new StdioStudioClient();
const results: unknown[] = [];
const save = (name: string, value: unknown) =>
  fs.writeFileSync(
    path.join(output, name),
    JSON.stringify(value, null, 2) + "\n",
  );
let active: unknown;
try {
  for (const [name, workerDirectory] of [
    ["combat-training", "research/results/component-adaptation-v1/worker-v1"],
    ["bubble-wrap", "research/results/component-additions-v1/worker"],
    [
      "checkpoint-parkour",
      "research/results/component-adaptation-v1/worker-v2",
    ],
  ]) {
    const row = native.results.find((r: any) => r.case === name);
    const old = loadComponentReviewEvidence(
      path.join(nativeDirectory, name),
      row.result.sha256,
      row.inputHash,
    );
    const project = JSON.parse(
      fs.readFileSync(
        `benchmarks/runs/marketplace-diversity-v2-20260916/${name}/final-project.json`,
        "utf8",
      ),
    );
    const selected = project.assetPipeline.events.find(
      (e: any) => e.step === "candidate_selected",
    );
    const need = row.inputContext.assetTarget.need;
    const scope =
      "AdapterRegression_" + randomUUID().replaceAll("-", "").slice(0, 12);
    const adapter = new StudioAssetAdapter(client, {
      studioId,
      scope,
      evidenceDirectory: path.join(output, name),
    });
    active = { name, scope };
    save("active.json", active);
    const found = await adapter.search(
      need,
      need.query,
      AbortSignal.timeout(30000),
    );
    const candidate = found.candidates.find(
      (c) => c.id === selected.data.candidate.id,
    );
    if (!candidate)
      throw Error("Frozen worker choice unavailable; no substitution");
    const inspection = await adapter.inspect(
      need,
      candidate,
      name + "-adaptation",
      AbortSignal.timeout(90000),
    );
    active = {
      name,
      scope,
      token: inspection.token,
      receipts: inspection.receipts,
    };
    save("active.json", active);
    let uncertain = false;
    let result: any;
    let integration: unknown;
    let cleanup: unknown;
    try {
      const prepared = await adapter.prepareComponentReview(
        inspection,
        row.inputHash,
        AbortSignal.timeout(90000),
      );
      for (const key of [
        "nodes",
        "sourceBodies",
        "contentReferences",
        "configurationValues",
        "securityProfiles",
      ] as const)
        if (!isDeepStrictEqual(old[key], prepared.evidence[key]))
          throw Error("Fresh capture changed frozen " + key);
      const bytes = fs.readFileSync(
        path.join(workerDirectory, name + "-decision.json"),
      );
      const recorded = JSON.parse(bytes.toString("utf8"));
      const plan = {
        ...recorded,
        packetHash: prepared.evidence.packetHash,
        inputHash: prepared.evidence.inputHash,
      };
      save(name + "-input.json", {
        recordedPlanSha256: createHash("sha256").update(bytes).digest("hex"),
        originalPacketHash: recorded.packetHash,
        reboundPacketHash: plan.packetHash,
        inventoryIdentical: true,
        prepared,
        plan,
      });
      result = await adapter.adaptComponent(
        inspection,
        prepared.evidence,
        plan,
        AbortSignal.timeout(90000),
      );
      if (reviewsDirectory) {
        const bytes = fs.readFileSync(
          path.join(reviewsDirectory, name + "-decision.json"),
        );
        const raw = JSON.parse(bytes.toString("utf8"));
        const review = validateComponentReview(
          {
            ...raw,
            packetHash: result.evidence.packetHash,
            inputHash: row.inputHash,
          },
          result.evidence,
          [
            ...new Set([
              need.requirementId,
              ...(need.intent?.relatedRequirementIds ?? []),
            ]),
          ] as string[],
        );
        save(name + "-review-binding.json", {
          rawReviewSha256: createHash("sha256").update(bytes).digest("hex"),
          rawPacketHash: raw.packetHash,
          review,
          controlledIdentityRebinding: true,
        });
        integration =
          review.disposition === "integration_candidate"
            ? await adapter.prepareComponentIntegration(
                need,
                inspection,
                result.evidence,
                review,
                AbortSignal.timeout(90000),
              )
            : {
                status: "review_blocked",
                disposition: review.disposition,
                reason: review.reason,
              };
      }
      if (
        result.evidence.packetHash === prepared.evidence.packetHash ||
        inspection.safe
      )
        throw Error("Missing derivative or unexpected promotion");
    } catch (error) {
      uncertain = (error as any)?.effects === "unknown";
      save(name + "-error.json", {
        message: String(error),
        effects: (error as any)?.effects,
        receipts: (error as any)?.receipts,
      });
      throw error;
    } finally {
      if (!uncertain) {
        cleanup = await adapter.discard(inspection, AbortSignal.timeout(30000));
        save(name + "-cleanup.json", cleanup);
      }
    }
    const record = {
      case: name,
      candidate,
      scope,
      result,
      integration,
      cleanup,
      paidCalls: 0,
      rawGameBenchmark: false,
      importedCodeExecuted: false,
    };
    save(name + "-result.json", record);
    results.push(record);
    active = undefined;
    console.log(
      JSON.stringify({
        case: name,
        instances: result.evidence.nodes.length,
        sourceBindings: result.evidence.sourceBodies.reduce(
          (n: number, b: any) => n + b.bindings.length,
          0,
        ),
        cleanupCompleted: true,
      }),
    );
  }
} finally {
  save("result.json", {
    kind: "production-native-component-adapter-regression",
    studioId,
    results,
    active,
    paidCalls: 0,
    rawGameBenchmark: false,
    importedCodeExecuted: false,
  });
  await client.close();
}
