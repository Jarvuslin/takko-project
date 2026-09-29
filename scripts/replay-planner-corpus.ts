import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { replayCorpus } from "./planner-corpus";
const output = process.argv[2];
if (!output || fs.existsSync(output))
  throw Error("Supply a new output directory to preserve prior evidence");
fs.mkdirSync(output, { recursive: true });
const rows = replayCorpus(
  process.argv[3]
    ? JSON.parse(fs.readFileSync(process.argv[3], "utf8"))
    : undefined,
);
fs.writeFileSync(
  path.join(output, "matrix.json"),
  JSON.stringify(rows, null, 2),
);
fs.writeFileSync(
  path.join(output, "MATRIX.md"),
  "# Preserved planner corpus\n\nNo model calls. Raw outputs unchanged. Invalid optional metadata may be omitted ONLY in the labelled diagnostic projection. That does not count as a pass. Proposals are evaluated with their producer contract.\n\n| Output | Accepted unchanged | Violations | Blocked / diagnostic omissions |\n|---|---|---|---|\n" +
    rows
      .map(
        (r) =>
          `| ${r.run}/${r.index} | ${r.pass} | ${r.findings
            .map((f) => `${f.stage}: ${f.detail}`)
            .join("<br>")
            .replaceAll(
              "|",
              "\\|",
            )} | ${[...r.blocked, ...r.omitted].join("<br>")} |`,
      )
      .join("\n") +
    "\n",
);
fs.writeFileSync(
  path.join(output, "sources.json"),
  JSON.stringify(
    rows.map((r) => ({
      file: r.file,
      projectFile: r.projectFile,
      projectSha256: createHash("sha256")
        .update(fs.readFileSync(r.projectFile))
        .digest("hex"),
      sha256: createHash("sha256")
        .update(fs.readFileSync(r.file))
        .digest("hex"),
    })),
    null,
    2,
  ),
);
console.log(
  rows.map((r) => ({
    run: r.run,
    index: r.index,
    pass: r.pass,
    findings: r.findings,
    blocked: r.blocked,
    omitted: r.omitted,
  })),
);
