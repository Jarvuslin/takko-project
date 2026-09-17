import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { bundleSchema } from "../src/generation/schema";
import { inspectBenchmarkArtifact } from "../src/benchmark/inventory";
import {
  benchmarkVersion,
  primaryBenchmarkCaseIds,
  benchmarkCases,
  getBenchmarkCase,
  comparisonProfiles,
  comparisonProtocol,
  nativeSessionProtocol,
  referenceLibrary,
} from "../src/benchmark/cases";
import {
  qualitySubmissionSchema,
  scoreQuality,
  compareCandidates,
  type QualityResult,
} from "../src/benchmark/quality";
import {
  createEvidenceFileManifest,
  verifyEvidenceFileManifest,
} from "../src/benchmark/evidence-files";
import { assertVerifiedAssetSourcing } from "../src/benchmark/verified-submission";
import {
  assessAssetExecution,
  scoreQualityWithAssetExecution,
  type AssetExecutionAssessment,
} from "../src/benchmark/asset-execution";
import {
  createPairwiseReviewPacket,
  validatePairwiseReview,
} from "../src/benchmark/pairwise";

const read = (file: string) =>
  JSON.parse(
    fs.readFileSync(path.resolve(file), "utf8").replace(/^\uFEFF/, ""),
  );
function readExecutionProject(file: string) {
  const sourceUri = fs.realpathSync(path.resolve(file)),
    stat = fs.statSync(sourceUri);
  if (!stat.isFile() || stat.size > 64 * 1024 * 1024)
    throw Error(
      "Execution project must be a regular file no larger than 64 MiB",
    );
  const bytes = fs.readFileSync(sourceUri);
  return {
    project: JSON.parse(bytes.toString("utf8").replace(/^\uFEFF/, "")),
    sourceUri,
    sourceFileSha256: createHash("sha256").update(bytes).digest("hex"),
  };
}
function write(file: string, value: unknown) {
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  fs.writeFileSync(
    path.resolve(file),
    typeof value === "string" ? value : JSON.stringify(value, null, 2) + "\n",
    { flag: "wx" },
  );
}
const cell = (value: unknown) =>
  String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
export function qualityMarkdown(
  result: QualityResult & { systemExecution?: AssetExecutionAssessment },
) {
  const lines = [
    `# ${cell(result.candidateId)} — ${result.status}`,
    "",
    `Artifact: \`${result.artifactHash}\``,
    "",
    `Final score: **${result.finalScore === null ? "not issued" : result.finalScore.toFixed(2) + " / 10"}**. Missing observations remain pending; failures cannot be averaged away.`,
    "",
    "## Gates",
    "",
    "| Gate | Result |",
    "| --- | --- |",
    ...result.gates.map((g) => `| ${cell(g.gate)} | ${g.status} |`),
  ];
  if (result.systemExecution)
    lines.push(
      "",
      "## System asset execution",
      "",
      `${cell(result.systemExecution.status)}: ${cell(result.systemExecution.reason)}`,
      "",
      "Retained execution records are separate from native gameplay evidence. Source authenticity is not established by hashing.",
    );
  if (result.dimensions.length)
    lines.push(
      "",
      "## Dimensions",
      "",
      "| Dimension | Weight | Score |",
      "| --- | ---: | ---: |",
      ...result.dimensions.map(
        (d) =>
          `| ${cell(d.dimension)} | ${d.weight}% | ${d.score === null ? "pending" : d.score + " / 10"} |`,
      ),
    );
  if (result.devChecks.length)
    lines.push(
      "",
      "## Required checks",
      "",
      "| Check | Result |",
      "| --- | --- |",
      ...result.devChecks.map((c) => `| ${cell(c.id)} | ${c.status} |`),
    );
  lines.push(
    "",
    "Passing file-integrity checks does not authenticate supplied observations or replace a calibrated reviewer. This report does not predict commercial performance.",
    "",
  );
  return lines.join("\n");
}

/** Offline only: this command never calls providers, imports assets or changes Studio. */
export function benchmarkQualityCli(args: string[], root = process.cwd()) {
  const [command, ...rest] = args;
  const get = (flag: string) => {
    const i = rest.indexOf(flag);
    if (i < 0 || !rest[i + 1] || rest[i + 1].startsWith("--"))
      throw Error("Missing " + flag);
    return rest[i + 1];
  };
  if (command === "catalog") {
    const out = get("--out");
    write(out, {
      benchmarkVersion,
      primaryBenchmarkCaseIds,
      benchmarkCases,
      comparisonProfiles,
      comparisonProtocol,
      nativeSessionProtocol,
      referenceLibrary,
    });
    return {
      output: path.resolve(out),
      cases: benchmarkCases.length,
      providerCalls: 0,
    };
  }
  if (command === "inspect") {
    const input = read(get("--project")),
      bundle = bundleSchema.parse(input.artifact ?? input);
    const out = get("--out");
    write(out, inspectBenchmarkArtifact(bundle));
    return { output: path.resolve(out), providerCalls: 0 };
  }
  if (command === "asset-execution") {
    const input = readExecutionProject(get("--project")),
      out = get("--out");
    const definition = rest.includes("--case")
      ? getBenchmarkCase(get("--case"))
      : undefined;
    const assessment = assessAssetExecution(input.project, {
      sourceUri: input.sourceUri,
      definition,
    });
    write(out, { ...assessment, sourceFileSha256: input.sourceFileSha256 });
    return {
      output: path.resolve(out),
      status: assessment.status,
      finalScore: null,
      providerCalls: 0,
    };
  }
  if (command === "freeze-evidence") {
    const submission = qualitySubmissionSchema.parse(read(get("--submission"))),
      out = get("--out");
    write(out, createEvidenceFileManifest(submission, root));
    return {
      output: path.resolve(out),
      note: "Integrity recorded; observation authenticity is not established by hashing",
      providerCalls: 0,
    };
  }
  if (command === "score") {
    const submission = qualitySubmissionSchema.parse(read(get("--submission")));
    const integrity = verifyEvidenceFileManifest(
      submission,
      read(get("--manifest")),
      root,
    );
    const assetEvidence = assertVerifiedAssetSourcing(submission, root);
    const execution = rest.includes("--asset-project")
      ? readExecutionProject(get("--asset-project"))
      : undefined;
    const result = execution
        ? {
            ...scoreQualityWithAssetExecution(
              getBenchmarkCase(submission.caseId),
              submission,
              execution.project,
              { sourceUri: execution.sourceUri },
            ),
            sourceFileSha256: execution.sourceFileSha256,
          }
        : scoreQuality(getBenchmarkCase(submission.caseId), submission),
      out = get("--out");
    if (fs.existsSync(path.resolve(out)))
      throw Error(
        "Output directory already exists; choose a new run directory",
      );
    fs.mkdirSync(path.resolve(out), { recursive: true });
    write(path.join(out, "result.json"), {
      ...result,
      integrity,
      assetEvidence,
    });
    write(path.join(out, "report.md"), qualityMarkdown(result));
    return {
      output: path.resolve(out),
      status: result.status,
      finalScore: result.finalScore,
      providerCalls: 0,
    };
  }
  if (command === "compare") {
    const a = qualitySubmissionSchema.parse(read(get("--a"))),
      b = qualitySubmissionSchema.parse(read(get("--b")));
    verifyEvidenceFileManifest(a, read(get("--a-manifest")), root);
    verifyEvidenceFileManifest(b, read(get("--b-manifest")), root);
    assertVerifiedAssetSourcing(a, root);
    assertVerifiedAssetSourcing(b, root);
    const comparison = compareCandidates(a, b);
    const aResult = scoreQuality(getBenchmarkCase(a.caseId), a),
      bResult = scoreQuality(getBenchmarkCase(b.caseId), b);
    const scored =
      comparison.comparable &&
      aResult.finalScore !== null &&
      bResult.finalScore !== null;
    const out = get("--out");
    write(out, {
      ...comparison,
      numericComparisonReady: scored,
      delta: scored ? aResult.finalScore! - bResult.finalScore! : null,
      A: aResult,
      B: bResult,
      interpretation:
        "Metadata compatibility is necessary, not proof of randomization or a statistically reliable model ranking. Preserve all runs and review traces.",
    });
    return {
      output: path.resolve(out),
      ...comparison,
      numericComparisonReady: scored,
      providerCalls: 0,
    };
  }
  if (command === "pairwise") {
    const a = qualitySubmissionSchema.parse(read(get("--a")));
    const b = qualitySubmissionSchema.parse(read(get("--b")));
    verifyEvidenceFileManifest(a, read(get("--a-manifest")), root);
    verifyEvidenceFileManifest(b, read(get("--b-manifest")), root);
    assertVerifiedAssetSourcing(a, root);
    assertVerifiedAssetSourcing(b, root);
    // Also validate the selected fixed case and all evidence attribution.
    scoreQuality(getBenchmarkCase(a.caseId), a);
    scoreQuality(getBenchmarkCase(b.caseId), b);
    const { packet, form, mapping } = createPairwiseReviewPacket(
      a,
      b,
      get("--seed"),
    );
    const out = get("--out");
    if (fs.existsSync(path.resolve(out)))
      throw Error(
        "Output directory already exists; choose a new review directory",
      );
    fs.mkdirSync(path.resolve(out), { recursive: true });
    write(path.join(out, "reviewer", "packet.json"), packet);
    write(path.join(out, "reviewer", "form.json"), form);
    write(path.join(out, "private-mapping.json"), mapping);
    return {
      output: path.resolve(out),
      providerCalls: 0,
      note: "Share reviewer files only. Media and paths may reveal identity; this is masking, not guaranteed blinding.",
    };
  }
  if (command === "review-check") {
    const review = validatePairwiseReview(
      read(get("--packet")),
      read(get("--review")),
    );
    const out = get("--out");
    write(out, review);
    return {
      output: path.resolve(out),
      providerCalls: 0,
      note: "Review form validated; ratings are supplied observations, not independently authenticated facts.",
    };
  }
  throw Error(
    "Commands: catalog --out FILE; inspect --project FILE --out FILE; asset-execution --project FILE [--case CASE_ID] --out FILE; freeze-evidence --submission FILE --out FILE; score --submission FILE --manifest FILE [--asset-project FILE] --out NEW_DIR; compare --a FILE --a-manifest FILE --b FILE --b-manifest FILE --out FILE; pairwise --a FILE --a-manifest FILE --b FILE --b-manifest FILE --seed SEED --out NEW_DIR; review-check --packet FILE --review FILE --out FILE. All commands are offline and refuse overwriting outputs.",
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    console.log(
      JSON.stringify(benchmarkQualityCli(process.argv.slice(2)), null, 2),
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
