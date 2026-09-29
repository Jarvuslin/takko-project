import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
const output = path.resolve(
  process.argv[2] ?? "docs/results/post-plan-replay-20260925",
);
fs.mkdirSync(output, { recursive: true });
const files = [
  "src/generation/proposal.ts",
  "src/generation/plan-validation.ts",
  "src/marketplace/asset-binding.ts",
  "src/marketplace/approved-adapter.ts",
  "src/generation/asset-pipeline.ts",
  "src/generation/opencode-runtime.ts",
  "src/generation/engine.ts",
];
const rows: {
  file: string;
  line: number;
  expression: string;
  category: string;
}[] = [];
for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const lines = source.split(/\r?\n/);
  const start = file.endsWith("engine.ts")
    ? source.indexOf('if (kind === "proposal-build")')
    : 0;
  const end = file.endsWith("engine.ts")
    ? source.indexOf('if (!worker && p.executionMode === "opencode")', start)
    : source.length;
  let offset = 0;
  for (let i = 0; i < lines.length; i++) {
    const here = offset;
    offset += lines[i].length + (source.includes("\r\n") ? 2 : 1);
    if (
      !/^\s*(?:if\s*\(.*\)\s*)?throw\b/.test(lines[i]) ||
      here < start ||
      here > end
    )
      continue;
    let last = i;
    while (last < lines.length - 1 && !/;\s*(?:\/\/.*)?$/.test(lines[last]))
      last++;
    const expression = lines
      .slice(i, last + 1)
      .join(" ")
      .trim()
      .replace(/\s+/g, " ");
    let category =
      file.includes("plan-validation") || file.includes("asset-binding")
        ? "Candidate structure/provenance"
        : file.includes("asset-pipeline")
          ? "External acquisition, evidence or lifecycle"
          : file.includes("opencode-runtime")
            ? "Runtime protocol/admission"
            : file.includes("approved-adapter")
              ? "Approved selection enforcement"
              : "Approval/edit state or patch contract";
    if (
      file.endsWith("proposal.ts") &&
      here > source.indexOf("export function proposalPlanFor")
    )
      category = "Candidate structure/provenance";
    if (/Approved asset (option|attachment) is missing/.test(expression))
      category = "Approval/edit state or patch contract";
    if (
      file.includes("asset-pipeline") &&
      /Asset needs must have unique IDs|Asset need query/.test(expression)
    )
      category = "Candidate structure/provenance";
    if (
      file.endsWith("engine.ts") &&
      /Takko resolved the requested assets|Builder returned an empty task|taskFailures\.map|Task scripts must compile/.test(
        expression,
      )
    )
      category = "Worker output or compiler contract";
    rows.push({
      file,
      line: i + 1,
      expression,
      category,
    });
  }
}
const verification = [];
for (const folder of [
  "opencode-fighting-live-20260924",
  "opencode-minimal-fighting-20260925",
]) {
  const dir = path.resolve("docs/results", folder),
    manifestPath = path.join(dir, "evidence-manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    for (const entry of manifest.files) {
      const file = path.join(dir, entry.path);
      verification.push({
        file,
        unchanged:
          fs.existsSync(file) &&
          createHash("sha256").update(fs.readFileSync(file)).digest("hex") ===
            entry.sha256,
      });
    }
  }
}
// The earlier benchmark has an independently retained manifest from the binding fix.
const previous = JSON.parse(
  fs.readFileSync(
    "docs/results/opencode-minimal-fighting-20260925/protected-before.json",
    "utf8",
  ),
);
for (const entry of previous) {
  verification.push({
    file: entry.path,
    unchanged:
      fs.existsSync(entry.path) &&
      createHash("sha256").update(fs.readFileSync(entry.path)).digest("hex") ===
        entry.sha256,
  });
}
fs.writeFileSync(
  path.join(output, "gate-inventory.json"),
  JSON.stringify(
    {
      at: new Date().toISOString(),
      method:
        "Text inventory of explicit throw statements in the named files and Engine proposal-build through OpenCode-dispatch segment. Not branch coverage. Schema refinements and called helpers have additional guards.",
      rows,
    },
    null,
    2,
  ),
);
fs.writeFileSync(
  path.join(output, "GATES.md"),
  `# Post-plan gate inventory\n\n${rows.length} textual throw sites in the selected current-source surface. This is an inventory, not a claim that all paths executed. The diagnosis's historical 54 is not a branch-coverage target. State conflicts, external failures and unsafe-content rejection must remain blockers.\n\n| File | Line | Category | Throw expression |\n|---|---:|---|---|\n${rows.map((r) => `| ${r.file} | ${r.line} | ${r.category} | ${r.expression.replaceAll("|", "\\|").replaceAll("`", "")} |`).join("\n")}\n`,
);
const unique = [
  ...new Map(verification.map((v) => [path.resolve(v.file), v])).values(),
];
fs.writeFileSync(
  path.join(output, "protected-evidence.json"),
  JSON.stringify(
    {
      at: new Date().toISOString(),
      files: unique.length,
      unchanged: unique.filter((v) => v.unchanged).length,
      changed: unique.filter((v) => !v.unchanged),
    },
    null,
    2,
  ),
);
if (unique.some((v) => !v.unchanged)) throw Error("Preserved evidence changed");
console.log(
  JSON.stringify({
    sites: rows.length,
    protectedFiles: unique.length,
    categories: Object.fromEntries(
      [...new Set(rows.map((r) => r.category))].map((c) => [
        c,
        rows.filter((r) => r.category === c).length,
      ]),
    ),
  }),
);
