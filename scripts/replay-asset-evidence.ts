// $0 capture/evidence rehearsal. No inference client or credentials are loaded.
import fs from "node:fs";
import { StudioMarketplace } from "../src/marketplace/studio";
import {
  rankByVotes,
  assessEvidenceOptions,
  votePrior,
} from "../src/marketplace/relevance";
import { studioAnimationPack } from "../src/marketplace/animations";
import type { Project } from "../src/generation/schema";
const base = "docs/results/asset-evidence-selection-20260926";
const directory = process.argv[2] ?? base + "/same-candidates";
if (fs.existsSync(directory)) throw Error("Refusing to overwrite rehearsal");
fs.mkdirSync(directory);
const p: Project = JSON.parse(
  fs.readFileSync(
    "docs/results/opencode-step3-live-20260925/terminal-project.json",
    "utf8",
  ),
);
const group = p.assetDiscovery!.groups.find((g) => g.preview === "animation")!;
const provider = new StudioMarketplace();
const top = rankByVotes(group.options).slice(0, 10);
const captureLog: unknown[] = [];
for (const option of group.options) delete option.previewData;
for (const option of top) {
  const started = Date.now();
  try {
    const metadata = await provider.metadata(
      p.assetDiscovery!.studioId,
      option.assetId,
    );
    const raw = await provider.animations(
      p.assetDiscovery!.studioId,
      metadata,
      100,
    );
    fs.writeFileSync(
      directory + "/pack-" + option.assetId + ".json",
      JSON.stringify(raw, null, 2),
    );
    option.previewData = {
      pack: studioAnimationPack(raw),
      revisionKey: raw.revisionKey,
    };
    captureLog.push({
      id: option.assetId,
      votePrior: votePrior(option),
      entries: raw.entries.length,
      usable: option.previewData.pack!.entries.length,
      bytes: Buffer.byteLength(JSON.stringify(raw)),
      elapsedMs: Date.now() - started,
    });
  } catch (error) {
    captureLog.push({
      id: option.assetId,
      error: (error as Error).message,
      elapsedMs: Date.now() - started,
    });
  }
  fs.writeFileSync(
    directory + "/capture-log.json",
    JSON.stringify(captureLog, null, 2),
  );
}
const requests: unknown[] = [],
  skipped: unknown[] = [];
await assessEvidenceOptions(
  p,
  group,
  async (request) => {
    requests.push(request);
    return null;
  },
  (assessment) => {
    if (assessment.error) skipped.push(assessment);
  },
);
fs.writeFileSync(
  directory + "/prepared-requests.json",
  JSON.stringify(requests, null, 2),
);
fs.writeFileSync(
  directory + "/comparison.json",
  JSON.stringify(
    {
      at: new Date().toISOString(),
      candidateIds: group.options.map((o) => o.assetId),
      captureCandidateIds: top.map((o) => o.assetId),
      captureLog,
      preparedRequests: requests.length,
      skipped,
      before: p.decisionAdvice
        ?.filter((d) => d.task === "asset-relevance")
        .map((d) => ({
          at: d.at,
          confidence: d.result.answers.next?.confidence,
          choice:
            d.result.answers.next?.type === "choice"
              ? d.result.answers.next.choice
              : null,
        })),
      afterConfidence: null,
      afterReason:
        "No inference authorized. Native evidence and bounded requests measured, not Jev confidence or semantics.",
      paidCalls: 0,
      costUSD: 0,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    candidates: group.options.length,
    captured: captureLog.length,
    requests: requests.length,
    skipped: skipped.length,
    paidCalls: 0,
  }),
);
