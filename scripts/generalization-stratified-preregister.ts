// Offline only. Commit this manifest before invoking any new search.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const file = "docs/results/generalization/stratified-manifest.json";
assert.ok(!fs.existsSync(file), "Never overwrite a preregistered draw");
const excluded = new Set<string>();
const roots = ["docs/results", "tests/fixtures", "research", ".forge/trial-rehearsal", ".forge/trial-probes", path.join(process.env.APPDATA!, "Forge Desktop/projects")];
let files = 0;
function walk(directory: string) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (["node_modules", ".git", "Cache", "Code Cache", "GPUCache", "blob_storage", "Local Storage"].includes(entry.name)) continue;
    const name = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(name);
    else if (/\.(json|md|ts|luau|txt)$/i.test(name)) {
      files++;
      // Conservative superset includes nested escaped asset IDs and all exposed
      // result pages, not only selected IDs. Extra numeric exclusions are harmless.
      const text = fs.readFileSync(name, "utf8");
      for (const id of text.match(/(?<![\w.])[1-9]\d{6,15}(?![\w.])/g) ?? []) excluded.add(id);
      for (const match of text.replaceAll('\\"', '"').replaceAll('\\"', '"').matchAll(/(?:assetId"\s*:\s*"?|rbxassetid:\/\/)([1-9]\d{0,15})/gi)) excluded.add(match[1]);
    }
  }
}
for (const root of roots) walk(root);
const strata = [
  { id: "r6_single", role: "animation", kind: "Animation", minimum: 2, draws: 4, queries: ["R6 single punch animation", "R6 jab animation", "R6 sword slash animation"] },
  { id: "r6_multi", role: "animation", kind: "Animation", minimum: 2, draws: 4, queries: ["R6 combo punch animation", "R6 combat animations", "R6 attack combo"] },
  { id: "r15_single", role: "animation", kind: "Animation", minimum: 2, draws: 4, queries: ["R15 punch animation", "R15 jab animation", "R15 single attack"] },
  { id: "r15_multi", role: "animation", kind: "Animation", minimum: 2, draws: 4, queries: ["R15 punch combo", "R15 combat animation pack", "R15 multi hit animation"] },
  { id: "labeled", role: "animation", kind: "Animation", minimum: 2, draws: 4, queries: ["animation hit markers", "punch animation damage keyframes", "combat animation events"] },
  { id: "unlabeled", role: "animation", kind: "Animation", minimum: 2, draws: 4, queries: ["punch keyframe animation", "unlabeled animation", "R15 attack animation"] },
  { id: "nonattack", role: "animation", kind: "Animation", minimum: 2, draws: 4, queries: ["idle animation", "dance animation", "run animation"] },
  { id: "large", role: "animation", kind: "Animation", minimum: 1, draws: 2, queries: ["huge animation pack", "all animations pack", "dance animation collection"] },
  ...[
    ["character", "Model", "NPC rig"], ["static_target", "Model", "training target dummy"],
    ["tool", "Model", "sword tool"], ["prop", "Model", "wooden chest"],
    ["vfx", "Model", "magic particles"], ["sound", "Model", "sound effects"],
    ["mesh", "MeshPart", "rock mesh"], ["image", "Image", "arrow icon"],
  ].map(([id, kind, query]) => ({ id, role: id, kind, minimum: 2, draws: 2, queries: [query] })),
];
const seed = 202610011; let state = seed;
function rand() { let t = state += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }
const slots = strata.flatMap(stratum => Array.from({ length: stratum.draws }, () => ({ stratum: stratum.id, role: stratum.role, kind: stratum.kind, query: stratum.queries[Math.floor(rand() * stratum.queries.length)], rankDraw: rand(), clipDraw: rand() }))).map((row, index) => ({ slot: index + 1, ...row }));
const manifest = {
  seed, preparedAt: new Date().toISOString(), productionCommit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  exclusionRoots: roots, exclusionFiles: files, excludedIds: [...excluded].sort(), strata, slots,
  protocol: {
    search: "StudioMarketplace.searchPage production free filtering, first page, no pagination. Draw floor(rankDraw * eligible.length) from every result surviving the frozen exclusions, preserving API order. No replacements or retries. Duplicates remain recorded failures, not additional assets.",
    clips: "Cheap production manifest first. Draw floor(clipDraw * entries.length) from all entries, including unsupported ones. Capture only that chosen clip. No clip swaps or retries. Record all uninspected entries.",
    oracle: "Independent detached native instance census and selected sequence metadata. Authored hit labels/markers (hit, damage, dmg, heavy, strike, impact, punch) establish single/multi event count only when non-looping and matching the rig. Unlabeled motion proposals cannot establish ground-truth hit count. Record that limitation and unfilled attack strata. Labeled means any non-default keyframe name or marker. Nonattack means loop or idle/run/dance name. Large means over 100 sequences/references, 10000 instances, or any raw sequence over 300 frames.",
    minimums: "Count unique selected assets satisfying their assigned stratum according to the independent oracle. Every draw is retained even after a stratum is filled. Failed/inaccessible/duplicate/mismatched draws remain failures or unfilled, never substitutions.",
    playback: "First eligible captured attack clip in each of r6_single, r6_multi, r15_single, r15_multi in slot order, using its proposed timings diagnostically, with no fallback after failure. Use first captured structurally valid static target from this sample. If a stratum or target is unfilled, record missing playback, do not substitute known assets. Play is playback evidence, not approval or full-game behavior.",
    scope: "Role readiness is structural only. Report unknowns separately and never mark unchecked contents ready. Sound draws are Models with contained Sounds, not standalone audio. No inference, publishing or save-over.",
  },
};
fs.writeFileSync(file, JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify({ slots: slots.length, exclusions: excluded.size, files, productionCommit: manifest.productionCommit }));
