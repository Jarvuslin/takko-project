import fs from "node:fs";
import { z } from "zod";
import { plannerOutputSchema } from "../src/generation/requirements";
import {
  specSchema,
  taskSchema,
  type Project,
  type Spec,
} from "../src/generation/schema";
import {
  proposalDraftSchema,
  proposalPlanFor,
} from "../src/generation/proposal";
import { validateSpec } from "../src/generation/validation";
import { validateReferenceDecisions } from "../src/generation/research";
import { validateMarketplaceDiscovery } from "../src/generation/marketplace-policy";
import { validateImplementationPlan } from "../src/generation/plan-validation";
import { buildAssetNeeds } from "../src/marketplace/approved-adapter";
import { assetNeedSchema } from "../src/generation/asset-contract";
import { parseJson } from "../src/generation/providers";

export const corpus = [
  ...[0, 1, 2].map((index) => ({ run: "planner-recovery", index })),
  ...[0, 1, 2, 3, 4].map((index) => ({ run: "planner-invalid-output", index })),
];
export type Finding = { stage: string; detail: string };
export function inspectPlannerOutput(
  raw: string,
  project: Project,
  proposal = false,
) {
  const findings: Finding[] = [],
    blocked: string[] = [],
    omitted: string[] = [];
  const record = (stage: string, error: unknown) => {
    if (error instanceof z.ZodError) {
      for (const issue of error.issues)
        findings.push({
          stage,
          detail: `${issue.path.join(".") || "$"}: ${issue.message}`,
        });
    } else
      for (const detail of String(
        error instanceof Error ? error.message : error,
      ).split("\n"))
        findings.push({ stage, detail });
  };
  const check = (stage: string, fn: () => unknown) => {
    try {
      return fn();
    } catch (error) {
      record(stage, error);
    }
  };
  let value: any;
  try {
    value = parseJson(raw);
  } catch (error) {
    record("JSON", error);
    return {
      pass: false,
      findings,
      blocked: ["All typed validation: malformed JSON"],
      omitted,
    };
  }
  if (proposal) {
    check("proposalSchema", () => proposalDraftSchema.parse(value));
    return {
      pass: !findings.length,
      findings,
      blocked: [
        "Implementation-only gates: proposal output, not an implementation plan",
      ],
      omitted,
    };
  }
  const parsed = plannerOutputSchema(project).safeParse(value);
  if (!parsed.success) record("plannerSchema", parsed.error);
  // Diagnostic projection only. Never accepted or dispatched. Preserve every raw
  // violation above, then omit ONLY independently invalid optional metadata so
  // unrelated semantic gates can still run. Required-field failures stay blocked.
  let diagnostic = structuredClone(value);
  if (!parsed.success) {
    if (
      !diagnostic ||
      typeof diagnostic !== "object" ||
      Array.isArray(diagnostic)
    )
      return {
        pass: false,
        findings,
        blocked: ["Semantic gates require an object"],
        omitted,
      };
    if (
      diagnostic.architectureProposal &&
      !specSchema.shape.architectureProposal.safeParse(
        diagnostic.architectureProposal,
      ).success
    ) {
      delete diagnostic.architectureProposal;
      omitted.push("architectureProposal (schema issues retained)");
    }
    for (const [index, task] of (Array.isArray(diagnostic.tasks)
      ? diagnostic.tasks
      : []
    ).entries()) {
      if (!task || typeof task !== "object") continue;
      if (
        !taskSchema.shape.proposalSections.safeParse(task.proposalSections)
          .success
      ) {
        delete task.proposalSections;
        omitted.push(
          `tasks.${index}.proposalSections (schema issues retained)`,
        );
      }
    }
  }
  const structural = specSchema.safeParse(diagnostic);
  if (!structural.success) {
    record("structuralSchema", structural.error);
    blocked.push(
      "Semantic gates require structurally typed fields. No placeholder values inserted.",
    );
    return { pass: false, findings, blocked, omitted };
  }
  let spec: Spec = structural.data;
  const bound = check("validateSpec", () => validateSpec(spec, project));
  if (bound) spec = bound as Spec;
  check("referenceDecisions", () => validateReferenceDecisions(spec, project));
  check("marketplaceDiscovery", () => validateMarketplaceDiscovery(spec, true));
  // Exercise per-need gates independently too, without inventing requirements or
  // dropping companion Model needs that are needed by the MeshPart rule.
  for (const need of spec.assetNeeds ?? [])
    check("marketplaceDiscovery", () =>
      validateMarketplaceDiscovery(
        {
          ...spec,
          assetNeeds: [
            need,
            ...(spec.assetNeeds ?? []).filter((n) => n !== need),
          ],
        },
        true,
      ),
    );
  const candidate = { ...project, spec };
  check("proposalPlanFor", () => proposalPlanFor(candidate, spec));
  check("buildAssetNeeds", () =>
    z.array(assetNeedSchema).max(16).parse(buildAssetNeeds(candidate)),
  );
  for (const group of project.assetDiscovery?.groups ?? []) {
    check("buildAssetNeeds", () =>
      buildAssetNeeds({
        ...candidate,
        assetDiscovery: { ...project.assetDiscovery!, groups: [group] },
      }),
    );
  }
  check("completeCallback", () => validateImplementationPlan(spec, project));
  return {
    pass: parsed.success && !findings.length,
    findings: findings.filter(
      (f, i, a) =>
        a.findIndex((o) => o.stage === f.stage && o.detail === f.detail) === i,
    ),
    blocked,
    omitted,
  };
}
export type CorpusEntry = {
  run: string;
  index: number;
  file?: string;
  projectFile?: string;
  proposal?: boolean;
};
export function replayCorpus(entries: CorpusEntry[] = corpus) {
  return entries.map(
    ({
      run,
      index,
      file: suppliedFile,
      projectFile: suppliedProject,
      proposal,
    }) => {
      const base = `tests/fixtures/regression/${run}`;
      const file =
        suppliedFile ??
        `${base}/planner-output-${index}.${index === 3 ? "txt" : "json"}`;
      const projectFile = suppliedProject ?? `${base}/terminal-project.json`;
      // terminal-project retains the actual approval saved by Approve & build.
      // before-build precedes that action and cannot authorize proposal sources.
      const project: Project = JSON.parse(fs.readFileSync(projectFile, "utf8"));
      return {
        run,
        index,
        file,
        projectFile,
        ...inspectPlannerOutput(
          fs.readFileSync(file, "utf8"),
          project,
          proposal ?? index === 0,
        ),
      };
    },
  );
}
