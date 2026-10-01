import fs from "node:fs";
const root = "docs/results/generalization/stratified";
const manifest = JSON.parse(fs.readFileSync("docs/results/generalization/stratified-manifest.json", "utf8"));
const rows = fs.readdirSync(root).filter(f => /^\d+\.json$/.test(f)).map(f => JSON.parse(fs.readFileSync(root + "/" + f, "utf8")));
const playback = fs.existsSync(root + "/playback.json") ? JSON.parse(fs.readFileSync(root + "/playback.json", "utf8")) : null;
const compared = rows.filter(r => r.oracle && r.verdict);
const strata = manifest.strata.map((s: any) => {
 const selected = rows.filter(r => r.stratum === s.id);
 const matching = selected.filter(r => r.matchesStratum);
 return { id: s.id, minimum: s.minimum, draws: selected.length,
   distinct: new Set(selected.filter(r => r.selected).map(r => r.selected.assetId)).size,
   filled: new Set(matching.map(r => r.selected.assetId)).size,
   matchedSlots: matching.map(r => r.slot),
   comparisons: selected.filter(r => r.oracle && r.verdict).length,
   ready: selected.filter(r => r.verdict?.status === "ready").length,
   blocked: selected.filter(r => r.verdict?.status === "blocked").length,
   unknown: selected.filter(r => r.verdict?.status === "unknown").length,
   wrongRoles: selected.filter(r => r.wrongRole).map(r => r.slot),
   errors: selected.filter(r => r.error || r.oracleError).map(r => r.slot),
 };
});
const summary = { at: new Date().toISOString(), seed: manifest.seed, productionCommit: manifest.productionCommit,
 plannedDraws: manifest.slots.length, draws: rows.length,
 distinctSelected: new Set(rows.filter(r => r.selected).map(r => r.selected.assetId)).size,
 comparisons: compared.length, falsePasses: compared.filter(r => r.falsePass).map(r => r.slot),
 falseBlocks: compared.filter(r => r.falseBlock).map(r => r.slot),
 wrongRoles: compared.filter(r => r.wrongRole).map(r => r.slot),
 duplicates: rows.filter(r => r.duplicate).map(r => r.slot),
 errors: rows.filter(r => r.error || r.oracleError).map(r => ({ slot: r.slot, error: r.error, oracleError: r.oracleError })),
 strata, unfilledStrata: strata.filter((s: any) => s.filled < s.minimum).map((s: any) => s.id),
 playback, cost: 0,
 limits: "Independent structural census and selected-clip event metadata. Unlabeled motion does not establish authored hit count. Ready is not semantic gameplay verification. No Marketplace-wide accuracy claim. No code changes or swapped draws after exposure.",
};
fs.writeFileSync(root + "/summary.json", JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify(summary, null, 2));
