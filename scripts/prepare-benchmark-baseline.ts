import fs from "node:fs";
import path from "node:path";
import { bundleSchema } from "../src/generation/schema";
import { inspectBenchmarkArtifact } from "../src/benchmark/inventory";
import { benchmarkVersion, getBenchmarkCase } from "../src/benchmark/cases";
import {
  qualitySubmissionSchema,
  type QualityEvidence,
} from "../src/benchmark/quality";
import { benchmarkQualityCli } from "./benchmark-quality";

// Retrospective attribution only. Does not run a model or interact with Studio.
const directory = "benchmarks/runs/crystal-hollow-v2-retrospective-r2";
if (fs.existsSync(directory))
  throw Error("Baseline already exists; preserve its evidence");
const bundle = bundleSchema.parse(
  JSON.parse(
    fs.readFileSync(
      "benchmarks/fixtures/v1/quarry-asset-integration/bundle.json",
      "utf8",
    ),
  ),
);
const inventory = inspectBenchmarkArtifact(bundle);
const historicalUri =
  "docs/results/crystal-hollow-polished-native-verification.json";
const historical = JSON.parse(fs.readFileSync(historicalUri, "utf8"));
if (historical.artifactHash !== inventory.artifactHash)
  throw Error("Historical evidence belongs to another artifact");
const definition = getBenchmarkCase("game.crystal-hollow");
fs.mkdirSync(directory, { recursive: true });
const write = (name: string, value: unknown) =>
  fs.writeFileSync(
    path.join(directory, name),
    JSON.stringify(value, null, 2) + "\n",
    { flag: "wx" },
  );
write("inventory.json", inventory);
const evidence: QualityEvidence[] = [
  {
    id: "historical-core",
    artifactHash: inventory.artifactHash,
    kind: "native_test",
    uri: historicalUri,
    outcome: "passed",
    gates: [],
    observation:
      "Historical solo V2 session: real harvest/sale/upgrade inputs, goal and respawn checks passed; console empty at completion. This does not verify new case requirements, multiple clients, touch or longform play.",
  },
  {
    id: "authored-inventory",
    artifactHash: inventory.artifactHash,
    kind: "source_inspection",
    uri: directory + "/inventory.json",
    outcome: "observed",
    observation:
      "Authored manifest and source mention inventory. No declared custom animation/audio IDs or mesh assets. Counts and source mentions do not prove runtime behavior or quality.",
  },
  {
    id: "historical-spawn",
    artifactHash: inventory.artifactHash,
    kind: "screenshot",
    uri: "docs/results/crystal-hollow-polished-spawn.jpg",
    outcome: "observed",
    dimensions: ["art_environment"],
    observation:
      "Previously captured V2 native spawn view; preserved for calibration, no numeric aesthetic score assigned.",
  },
  {
    id: "historical-goal",
    artifactHash: inventory.artifactHash,
    kind: "screenshot",
    uri: "docs/results/crystal-hollow-polished-goal.jpg",
    outcome: "observed",
    dimensions: ["art_environment"],
    observation:
      "Previously captured V2 goal view. A still image cannot verify action animation, audio or a sustained play loop.",
  },
];
write(
  "submission.json",
  qualitySubmissionSchema.parse({
    candidateId: "Crystal Hollow V2 historical expert-assisted baseline",
    artifactHash: inventory.artifactHash,
    caseId: definition.id,
    caseVersion: definition.version,
    protocolVersion: benchmarkVersion,
    track: definition.track,
    budgetMicros: null,
    runKind: "retrospective",
    assistance: "expert_assisted",
    toolProfile:
      "historical-json-generation-plus-expert-Studio-tools-no-worker-store-search",
    environmentProfile: "historical-Windows-solo-Studio-uncontrolled",
    evidence,
    dimensionScores: [],
    // Old solo checks are observations, not passes for the broader new case.
    gateResults: [],
    devChecks: [],
  }),
);
benchmarkQualityCli([
  "freeze-evidence",
  "--submission",
  directory + "/submission.json",
  "--out",
  directory + "/evidence-manifest.json",
]);
benchmarkQualityCli([
  "score",
  "--submission",
  directory + "/submission.json",
  "--manifest",
  directory + "/evidence-manifest.json",
  "--out",
  directory + "/evaluation",
]);
console.log(
  JSON.stringify({
    directory,
    artifactHash: inventory.artifactHash,
    providerCalls: 0,
    nativeCalls: 0,
  }),
);
