import fs from "node:fs";
import path from "node:path";
import {
  persistComponentDerivative,
  readComponentOriginal,
} from "../src/generation/component-derivative";

// Offline replay of retained native payloads against the current host validator.
const directory = path.resolve(process.argv[2] ?? "");
const result = JSON.parse(
  fs.readFileSync(path.join(directory, "result.json"), "utf8"),
);
const checks = [];
for (const row of result.results) {
  const folder = path.join(directory, row.case);
  const reviewFile = path.join(folder, path.basename(row.result.reviewFile));
  const review = JSON.parse(fs.readFileSync(reviewFile, "utf8"));
  const derivative = readComponentOriginal(
    folder,
    review.derivative.archiveHash,
    review.derivative.manifestHash,
  );
  const retained = persistComponentDerivative(
    folder,
    review.original,
    { snapshot: derivative.snapshot, security: review.security },
    review.binding,
  );
  if (
    retained.sha256 !== row.result.sha256 ||
    retained.sourceCount !== row.result.sourceCount
  )
    throw Error("Retained review identity changed");
  checks.push({
    case: row.case,
    sourceCount: retained.sourceCount,
    uniqueSources: retained.uniqueSourceBodies,
    changedInstances: retained.changedInstances,
    derivativeHash: retained.derivative.sha256,
    reviewHash: retained.sha256,
  });
}
console.log(
  JSON.stringify(
    { kind: "offline-revalidation-of-native-evidence", passed: true, checks },
    null,
    2,
  ),
);
