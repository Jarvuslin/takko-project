import fs from "node:fs";
import { expect, it } from "vitest";
import { z } from "zod";
import {
  proposalDraftSchema,
  mergeScopedPlan,
} from "../src/generation/proposal";
import { taskSchema, type Project } from "../src/generation/schema";
import { plannerRequirementContract } from "../src/generation/requirements";
import { validateMarketplaceDiscovery } from "../src/generation/marketplace-policy";
import { inspectPlannerOutput, replayCorpus } from "../scripts/planner-corpus";
import { specSchema } from "../src/generation/schema";
import { validateSpec } from "../src/generation/validation";
import { validateImplementationPlan } from "../src/generation/plan-validation";
const base = "tests/fixtures/regression/planner-invalid-output/";
const read = (name: string) =>
  JSON.parse(fs.readFileSync(base + name + ".json", "utf8"));
it("rejects the real seven-term proposal query at its authoring boundary and identifies the need", () => {
  expect(() => proposalDraftSchema.parse(read("planner-output-0"))).toThrow(
    /dummyModel/,
  );
});
it("explains the independent category and section vocabularies in the actual planner contract", () => {
  const contract = JSON.stringify(
    plannerRequirementContract(read("terminal-project")),
  );
  expect(contract).toContain("requirements[].category");
  expect(contract).toContain("tasks[].proposalSections");
  expect(contract).toContain("ui");
  expect(
    JSON.stringify(z.toJSONSchema(taskSchema).properties?.proposalSections),
  ).toContain("category");
});
it("collects multiple need policy violations with their identities", () => {
  const spec = read("planner-output-1");
  spec.assetNeeds[1].query = spec.assetNeeds[0].query;
  spec.assetNeeds[1].kind = "Model";
  expect(() => validateMarketplaceDiscovery(spec, true)).toThrow(
    spec.assetNeeds[0].id,
  );
  expect(() => validateMarketplaceDiscovery(spec, true)).toThrow(
    spec.assetNeeds[1].id,
  );
});
it("keeps invalid real section labels rejected while exercising every independent downstream gate", () => {
  for (const index of [2, 4]) {
    const result = inspectPlannerOutput(
      JSON.stringify(read(`planner-output-${index}`)),
      read("terminal-project") as Project,
    );
    expect(result.pass).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].detail).toContain("proposalSections");
    expect(result.blocked).toEqual([]);
    expect(result.omitted).toEqual([
      "tasks.7.proposalSections (schema issues retained)",
    ]);
  }
});
it("replays all eight outputs and uses production fence parsing for malformed JSON", () => {
  const rows = replayCorpus();
  expect(rows).toHaveLength(8);
  const malformed = rows.find((r) => r.index === 3)!;
  expect(malformed.pass).toBe(false);
  expect(malformed.findings.map((f) => f.detail).join(" ")).toContain("20993");
});
it("reports independent semantic failures together in the correction callback", () => {
  const spec = specSchema.parse(read("planner-output-1"));
  spec.tasks[0].requirements.push("missing_requirement");
  spec.requirements = spec.requirements.filter(
    (r) => r.sourceId !== "proposal:theme",
  );
  expect(() =>
    validateImplementationPlan(spec, read("terminal-project")),
  ).toThrow("missing_requirement");
  expect(() =>
    validateImplementationPlan(spec, read("terminal-project")),
  ).toThrow("dummyModel");
  expect(() =>
    validateImplementationPlan(spec, read("terminal-project")),
  ).toThrow("proposal:theme");
});
it("rejects proposal IDs, blank text and title sizes that downstream contracts cannot retain", () => {
  const proposal = read("planner-output-0");
  proposal.assetNeeds[0].query = "   ";
  proposal.assetNeeds[0].requirementId = "not a requirement id";
  proposal.assetNeeds.push(structuredClone(proposal.assetNeeds[0]));
  const result = proposalDraftSchema.safeParse(proposal);
  expect(result.success).toBe(false);
  if (result.success) throw Error("Expected rejection");
  expect(result.error.message).toContain("unique IDs");
  expect(result.error.message).toContain("requirementId");
  expect(result.error.message).toContain("blank");
  expect(
    proposalDraftSchema.safeParse({ ...proposal, title: "a".repeat(81) })
      .success,
  ).toBe(false);
});
it("rejects script suffix/container contradictions when the planner first assigns ownership", () => {
  const project = read("terminal-project");
  const spec = specSchema.parse(read("planner-output-1"));
  spec.tasks[0].files = [
    `ReplicatedStorage/${project.scope}/Input.client.luau`,
  ];
  expect(() => validateSpec(spec, project)).toThrow(spec.tasks[0].files[0]);
});
it("checks authored intent links and MeshPart companion discovery before proposal approval", () => {
  const proposal = JSON.parse(
    fs.readFileSync(
      "tests/fixtures/regression/planner-recovery/planner-output-0.json",
      "utf8",
    ),
  );
  proposal.assetNeeds[0].intent.relatedRequirementIds = [
    "different_requirement",
  ];
  proposal.assetNeeds[0].kind = "MeshPart";
  const result = proposalDraftSchema.safeParse(proposal);
  expect(result.success).toBe(false);
  if (result.success) throw Error("Expected rejection");
  expect(result.error.message).toContain("primary requirementId");
  expect(result.error.message).toContain("Model discovery need");
});
it.each(["ownership", "sections", "ids"] as const)(
  "identifies the task in scoped %s failures",
  (kind) => {
    const project = read("terminal-project") as Project;
    const spec = specSchema.parse(read("planner-output-1"));
    project.spec = spec;
    const task = structuredClone(
      spec.tasks.find((t) => t.proposalSections?.length)!,
    );
    const patch = {
      tasks: [task],
      requirements: spec.requirements.filter((r) =>
        task.requirements.includes(r.id),
      ),
      visualDirection: spec.visualDirection,
    };
    if (kind === "ownership")
      task.files.push(`ReplicatedStorage/${project.scope}/Extra.module.luau`);
    if (kind === "sections") delete task.proposalSections;
    if (kind === "ids") patch.tasks = [];
    expect(() => mergeScopedPlan(project, patch, [task.id])).toThrow(task.id);
  },
);
