import fs from "node:fs";
import path from "node:path";
import { parsers } from "prettier/plugins/typescript";
import { z } from "zod";
import { plannerOutputSchema } from "../src/generation/requirements";
import { proposalDraftSchema } from "../src/generation/proposal";
const output = process.argv[2];
if (!output || fs.existsSync(output))
  throw Error("Supply a new evidence directory");
fs.mkdirSync(output, { recursive: true });
const files = [
  "validation",
  "architecture",
  "marketplace-policy",
  "plan-validation",
  "requirements",
  "research",
  "proposal",
]
  .map((f) => `src/generation/${f}.ts`)
  .concat("src/marketplace/asset-binding.ts");
const rows: any[] = [];
for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const ast = await parsers.typescript.parse(source, {});
  function visit(node: any, owner = "schema refinement") {
    if (!node || typeof node !== "object") return;
    if (node.type === "FunctionDeclaration" && owner === "schema refinement")
      owner = node.id?.name ?? owner;
    const text = (n: any) => source.slice(n.range[0], n.range[1]);
    const call =
      node.type === "CallExpression" &&
      (["errors.push", "ctx.addIssue", "issues.push"].includes(
        text(node.callee),
      ) ||
        (owner === "assetNeedAuthoringIssues" && text(node.callee) === "add"));
    if (node.type === "ThrowStatement" || call) {
      const expression = text(node).replace(/\s+/g, " ");
      const planner =
        [
          "safePath",
          "validateSpec",
          "bindRequirementSources",
          "validateReferenceDecisions",
          "validateMarketplaceDiscovery",
          "assetNeedAuthoringIssues",
          "validateImplementationPlan",
          "proposalPlanFor",
          "assetNeedForGroup",
          "approvedAssetLinks",
        ].includes(owner) || file.endsWith("architecture.ts");
      const authored =
        owner === "assetNeedAuthoringIssues"
          ? "proposalDraftSchema + implementation acceptance (shared helper)"
          : file.endsWith("asset-binding.ts")
            ? "selection state originates in picker; linkage checked against plan inside callback"
            : owner === "proposalPlanFor"
              ? "implementation plan, with approved source IDs advertised"
              : owner === "validateReferenceDecisions"
                ? "implementation plan; research precedes it"
                : planner
                  ? "implementation authoring callback; architecture also checked on editor acceptance"
                  : owner === "mergeScopedPlan"
                    ? "scoped plan correction callback"
                    : owner.includes("Proposal")
                      ? "proposal/edit acceptance; host state conflict is not model-repairable"
                      : "bundle/research/runtime path, not a pre-code planner constraint";
      rows.push({
        file,
        line: node.loc.start.line,
        owner,
        expression,
        element: /\.join\(|last\.message|errors|groups/.test(expression)
          ? "aggregate of located failures / collection-level diagnostic (see expression)"
          : /\bid\b|\.id|\.path|\+ p\b|\+ f\b|\+ canonical|sourceId|node|system|connection|\.length|spec\.|group\.label|\+ url/i.test(
                expression,
              )
            ? "element or bounded collection named (see expression)"
            : "generic: review expression; downstream/non-planner if marked",
        correction:
          planner || owner === "mergeScopedPlan"
            ? "yes (planner); repeated downstream check is deterministic on accepted state"
            : owner === "schema refinement" && file.endsWith("proposal.ts")
              ? "proposal schema acceptance, currently one attempt"
              : "not pre-code planner callback",
        authored,
      });
    }
    for (const [key, value] of Object.entries(node)) {
      if (["loc", "range", "tokens", "comments"].includes(key)) continue;
      if (Array.isArray(value)) value.forEach((child) => visit(child, owner));
      else if (value && typeof value === "object") visit(value, owner);
    }
  }
  visit(ast);
}
const project = JSON.parse(
  fs.readFileSync(
    "docs/results/run13-live-20260927/terminal-project.json",
    "utf8",
  ),
);
const schemas = {
  planner: z.toJSONSchema(plannerOutputSchema(project), { io: "input" }),
  proposal: z.toJSONSchema(proposalDraftSchema, { io: "input" }),
};
const constraints: any[] = [];
const keys = new Set([
  "enum",
  "const",
  "pattern",
  "minLength",
  "maxLength",
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "minItems",
  "maxItems",
  "required",
  "additionalProperties",
  "type",
]);
function walk(value: any, location: string) {
  if (!value || typeof value !== "object") return;
  for (const [key, item] of Object.entries(value)) {
    if (keys.has(key))
      constraints.push({
        path: location,
        rule: key,
        value: item,
        element: "Zod issue includes indexed property path",
        correction: "yes at producer schema.parse",
        authored:
          "advertised JSON contract at first proposal/plan authoring; source enums from saved approved data",
      });
    else if (item && typeof item === "object") walk(item, `${location}/${key}`);
  }
}
for (const [name, schema] of Object.entries(schemas)) walk(schema, name);
fs.writeFileSync(
  path.join(output, "schemas.json"),
  JSON.stringify(schemas, null, 2),
);
fs.writeFileSync(
  path.join(output, "sites.json"),
  JSON.stringify(rows, null, 2),
);
fs.writeFileSync(
  path.join(output, "schema-constraints.json"),
  JSON.stringify(constraints, null, 2),
);
const escape = (s: string) => s.replaceAll("|", "\\|");
fs.writeFileSync(
  path.join(output, "GATES.md"),
  "# Planner constraint inventory\n\nAST enumeration, including throws, aggregate error pushes and schema custom issues. Runtime bundle/research/edit checks are retained but explicitly distinguished from planner acceptance. JSON schema custom refinements are represented by source sites, not silently omitted. Counts are source sites, not unique semantic rules. Schema enums, patterns, bounds, required properties, types and strict objects are listed individually below.\n\n| Location / owner | Diagnostic identity | Correction callback | First author/acceptance | Rule |\n|---|---|---|---|---|\n" +
    rows
      .map(
        (r) =>
          `| ${r.file}:${r.line} ${r.owner} | ${r.element} | ${r.correction} | ${r.authored} | ${escape(r.expression)} |`,
      )
      .join("\n") +
    "\n\n## Schema constraints\n\n| Property path | Constraint | Diagnostic identity | Correction | First enforcement |\n|---|---|---|---|---|\n" +
    constraints
      .map(
        (r) =>
          `| ${r.path} | ${r.rule}: ${escape(JSON.stringify(r.value))} | ${r.element} | ${r.correction} | ${r.authored} |`,
      )
      .join("\n") +
    "\n",
);
console.log({
  sourceSites: rows.length,
  schemaConstraints: constraints.length,
  byFile: files.map((file) => ({
    file,
    sites: rows.filter((r) => r.file === file).length,
  })),
});
