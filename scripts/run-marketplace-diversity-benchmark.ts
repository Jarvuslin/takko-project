import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { specSchema } from "../src/generation/schema";
import { validateMarketplaceDiscovery } from "../src/generation/marketplace-policy";
import {
  runAssetBenchmark,
  type BenchmarkOptions,
} from "./run-butter-crunch-benchmark";

export const diversityCases = {
  "bubble-wrap":
    "59b69a324da1e8fe89738777319e8c34704f1c56ed8c5a0fdc4f2e86eb13c756",
  "combat-training":
    "f656b6db34b2a4832302a7251c6aa277275070ce3b44eefcbf96a4ca914d336e",
  "checkpoint-parkour":
    "a4aa6ccf3beaa5332b515754e31e053eb394cd62cc69a8b545f50ba1e177a6ed",
} as const;
export type DiversityCase = keyof typeof diversityCases;

/** Read-only sourcing gate. Semantic fidelity and native quality remain separate evaluations. */
export function diversityPlanGate(raw: unknown): string[] {
  const parsed = specSchema.safeParse(raw);
  if (!parsed.success)
    return ["Plan does not satisfy the application specification schema"];
  const spec = parsed.data,
    failures: string[] = [];
  if (spec.questions.length)
    failures.push(
      "Plan requests clarification; benchmark cannot author answers",
    );
  if (!spec.assetNeeds?.some((need) => need.kind === "Model"))
    failures.push("Missing Model discovery need; complete behavior coverage requires separate semantic evaluation");
  try {
    validateMarketplaceDiscovery(spec, true);
  } catch (error) {
    failures.push(String(error));
  }
  return failures;
}

export async function runDiversityBenchmark(
  caseId: DiversityCase,
  options: BenchmarkOptions,
  dependencies: Parameters<typeof runAssetBenchmark>[2] = {},
) {
  if (!Object.hasOwn(diversityCases, caseId))
    throw Error("Unknown diversity case");
  // One campaign controller at a time. A stale lock requires checking settlement, not deletion/retry.
  const lockPath = path.resolve(
    options.root ?? ".",
    ".forge/marketplace-diversity.lock",
  );
  fs.mkdirSync(path.dirname(lockPath), { recursive: true });
  const lock = fs.openSync(lockPath, "wx");
  let safeToRelease = false;
  try {
    fs.writeFileSync(
      lock,
      JSON.stringify({
        pid: process.pid,
        caseId,
        output: options.output,
        at: new Date().toISOString(),
      }),
    );
    const result = await runAssetBenchmark(
      options,
      {
        id: "marketplace-diversity-v8/" + caseId,
        promptRelative: `benchmarks/fixtures/marketplace-diversity-v1/${caseId}.txt`,
        promptSha256: diversityCases[caseId],
        exportFilename: `Takko-${caseId}.rbxlx`,
        budgetPolicy: "settled-plus-active",
        planGate: diversityPlanGate,
      },
      dependencies,
    );
    safeToRelease =
      result.noFurtherCallsPending &&
      result.routesRestored &&
      !result.requiresReconciliation;
    return result;
  } finally {
    fs.closeSync(lock);
    if (safeToRelease) fs.unlinkSync(lockPath);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const [caseId, studioId, output, priorCharged, priorReservations] =
    process.argv.slice(2);
  const result = await runDiversityBenchmark(caseId as DiversityCase, {
    version: 15,
    model: "x-ai/grok-build-0.1",
    studioId,
    output,
    priorChargedMicros: Number(priorCharged),
    priorReservationsMicros: Number(priorReservations),
    budgetMicros: 1_000_000,
  });
  console.log(JSON.stringify(result, null, 2));
  if (
    !result.noFurtherCallsPending ||
    !result.routesRestored ||
    result.requiresReconciliation
  )
    process.exitCode = 2;
  else if (result.error) process.exitCode = 1;
}
