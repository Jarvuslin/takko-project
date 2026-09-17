import { createHash } from "node:crypto";
import fs from "node:fs";
import { approve, build, createProject, revise } from "../src/core/project";
import { exportPlace } from "../src/core/recipe";

// Characterization of the rejected v0.1 generator, not a quality pass criterion.
// Keep these cases as counterexamples when replacing the generation path.
const cases = [
  {
    id: "boxing",
    group: "contrasting-combat",
    request:
      "Make a boxing fighting game with a three-punch combo and stamina.",
  },
  {
    id: "magic",
    group: "contrasting-combat",
    request:
      "Make a combat game with ranged fireballs, mana and an ice shield. No punches.",
  },
  {
    id: "swords",
    group: "contrasting-combat",
    request:
      "Make a sword duel game with timed parries, sword animations and round scoring.",
  },
  {
    id: "boss",
    group: "contrasting-combat",
    request:
      "Make a cooperative boss fight with enemy telegraphs, dodge rolls and phases.",
  },
  {
    id: "obby",
    group: "other-genres",
    request:
      "Make a lava obstacle course with checkpoints and moving platforms.",
  },
  {
    id: "racing",
    group: "other-genres",
    request: "Make a kart racing game with laps and drifting.",
  },
  {
    id: "farming",
    group: "other-genres",
    request: "Make a farming game with growing crops and harvesting.",
  },
  {
    id: "rescue",
    group: "keyword-trap",
    request: "Make a firefighting rescue game about saving cats.",
  },
];
const choices = { style: "jade", device: "both", pace: "quick" } as const;
const sha = (text: string) => createHash("sha256").update(text).digest("hex");
const results = cases.map((testCase) => {
  try {
    let project = revise(createProject(testCase.request), 1, choices);
    project = build(approve(project, project.revision));
    const artifact = project.artifact!;
    const sources = artifact.files.map((f) => f.source).join("\n");
    return {
      ...testCase,
      accepted: true,
      placeSha256: sha(exportPlace(artifact)),
      fileHashes: artifact.files.map(({ path, sha256 }) => ({ path, sha256 })),
      selectedAssets: project.assets.length,
      // These signals describe this inspected source, not all possible ways to animate.
      attackAnimationLoadCallPresent: /\bLoadAnimation\s*\(/.test(sources),
      soundInstanceCreationPresent: /Instance\.new\(["']Sound["']\)/.test(
        sources,
      ),
      generatedSourceFiles: artifact.files.length,
      buildReportedStage: project.stage,
      checks: project.checks,
    };
  } catch (error) {
    return { ...testCase, accepted: false, error: String(error) };
  }
});
const combat = results.filter(
  (r) => r.group === "contrasting-combat" && r.accepted,
);
const hashes = new Set(combat.map((r) => r.placeSha256));
const report = {
  ranAt: new Date().toISOString(),
  scope:
    "Offline execution of the real v0.1 project/build/export path. No model calls, Studio mutations or subjective quality grading.",
  summary: {
    contrastingCombatRequests: combat.length,
    distinctCombatPlaceHashes: hashes.size,
    otherGenreRequestsRejected: results.filter(
      (r) => r.group === "other-genres" && !r.accepted,
    ).length,
    nonCombatKeywordTrapAccepted: results.find((r) => r.id === "rescue")!
      .accepted,
  },
  results,
};
fs.mkdirSync("docs/results", { recursive: true });
fs.writeFileSync(
  "docs/results/generation-diagnosis.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report.summary, null, 2));
console.log(
  "Saved docs/results/generation-diagnosis.json. Findings are defects, not passing generation-quality tests.",
);
