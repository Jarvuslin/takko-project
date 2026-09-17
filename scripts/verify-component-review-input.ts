import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { loadComponentReviewEvidence } from "../src/generation/component-review";

// Local verification of real previously captured native payloads, no model or Studio calls.
const [directory, destination] = process.argv.slice(2);
if (!directory || !destination)
  throw Error("Usage: NATIVE_RESULT_DIRECTORY FRESH_OUTPUT_DIRECTORY");
fs.mkdirSync(destination, { recursive: false });
const captured = JSON.parse(
  fs.readFileSync(path.join(directory, "result.json"), "utf8"),
);
const checks = [];
for (const row of captured.results) {
  const evidence = loadComponentReviewEvidence(
    path.join(directory, row.case),
    row.result.sha256,
    row.inputHash,
  );
  if (evidence.candidateId !== row.candidate.id)
    throw Error("Candidate identity mismatch");
  const bindings = evidence.sourceBodies.flatMap((body) =>
    body.bindings.map((binding) => ({ ...binding, sourceHash: body.sha256 })),
  );
  if (
    bindings.length !== row.result.sourceCount ||
    new Set(bindings.map((binding) => binding.index)).size !== bindings.length
  )
    throw Error("Source binding inventory mismatch");
  for (const body of evidence.sourceBodies) {
    if (createHash("sha256").update(body.source).digest("hex") !== body.sha256)
      throw Error("Source body hash mismatch");
  }
  const source = row.inputContext.assetTarget.need;
  const context = {
    need: source,
    gameContext: row.inputContext,
    requirementIds: [
      ...new Set([
        source.requirementId,
        ...(source.intent?.relatedRequirementIds ?? []),
      ]),
    ],
    evidence,
  };
  const bytes = Buffer.from(JSON.stringify(context, null, 2) + "\n");
  fs.writeFileSync(
    path.join(destination, row.case + ".review-input.json"),
    bytes,
    { flag: "wx" },
  );
  checks.push({
    case: row.case,
    candidateId: evidence.candidateId,
    packetHash: evidence.packetHash,
    sourceBodies: evidence.sourceBodies.length,
    sourceBindings: bindings.length,
    sourceBytes: evidence.sourceBodies.reduce(
      (n, body) => n + Buffer.byteLength(body.source),
      0,
    ),
    inputBytes: bytes.length,
    inputFileHash: createHash("sha256").update(bytes).digest("hex"),
    requirementIds: context.requirementIds,
    semanticReviewPerformed: false,
  });
}
const result = {
  kind: "offline-review-input-verification-of-retained-native-evidence",
  passed: true,
  paidCalls: 0,
  nativeOperations: 0,
  importedCodeExecuted: false,
  checks,
};
fs.writeFileSync(
  path.join(destination, "verification.json"),
  JSON.stringify(result, null, 2) + "\n",
  { flag: "wx" },
);
console.log(JSON.stringify(result, null, 2));
