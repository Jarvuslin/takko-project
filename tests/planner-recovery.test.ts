import fs from "node:fs";
import { expect, it } from "vitest";
import { architectureSchema } from "../src/generation/architecture";
import { specSchema } from "../src/generation/schema";
import { validateSpec } from "../src/generation/validation";

const read = (name: string) =>
  JSON.parse(
    fs.readFileSync(`docs/results/demo-export-20260927/${name}.json`, "utf8"),
  );
const original = read("planner-output-1");
const corrected = read("planner-output-2");
const acceptedProject = JSON.parse(
  fs.readFileSync(
    "docs/results/opencode-step3-live-20260925/terminal-project.json",
    "utf8",
  ),
);
const accepted = specSchema.parse(acceptedProject.spec);
it("identifies the preserved corrected planner's self-edge without permitting it", () => {
  const result = architectureSchema.safeParse(corrected.architectureProposal);
  expect(result.success).toBe(false);
  if (result.success) throw Error("Expected rejection");
  expect(result.error.message).toContain(
    "Edge e8 connects hit_counter_state to itself",
  );
  expect(result.error.message).toContain(
    "Internal lifecycle behaviour belongs on the system",
  );
});
it("identifies an edge and its missing endpoint separately from self-reference", () => {
  const graph = structuredClone(original.architectureProposal);
  graph.edges[0].to = "missing_system";
  const result = architectureSchema.safeParse(graph);
  expect(result.success).toBe(false);
  if (result.success) throw Error("Expected rejection");
  expect(result.error.message).toContain(
    `Edge ${graph.edges[0].id} references system 'missing_system'`,
  );
});
it.each(["nodes", "edges"] as const)(
  "identifies duplicated architecture %s",
  (key) => {
    const graph = structuredClone(original.architectureProposal);
    graph[key].push(structuredClone(graph[key][0]));
    const result = architectureSchema.safeParse(graph);
    expect(result.success).toBe(false);
    if (result.success) throw Error("Expected rejection");
    expect(result.error.message).toContain(graph[key][0].id);
  },
);
it("names both edges sharing a connection", () => {
  const graph = structuredClone(original.architectureProposal);
  graph.edges.push({ ...graph.edges[0], id: "duplicate_connection" });
  const result = architectureSchema.safeParse(graph);
  expect(result.success).toBe(false);
  if (result.success) throw Error("Expected rejection");
  expect(result.error.message).toContain(graph.edges[0].id);
  expect(result.error.message).toContain("duplicate_connection");
});
it("keeps the first real planner architecture valid and its invalid enums rejected", () => {
  expect(
    architectureSchema.safeParse(original.architectureProposal).success,
  ).toBe(true);
  expect(specSchema.safeParse(original).success).toBe(false);
});
it.each(["requirements", "tasks", "questions"] as const)(
  "names duplicated planner %s",
  (key) => {
    const spec = structuredClone(accepted);
    if (key === "questions")
      spec.questions = [
        { id: "which_layout", prompt: "Choose layout", options: [] },
      ];
    if (key === "requirements")
      spec.requirements.push(structuredClone(spec.requirements[0]));
    else if (key === "tasks") spec.tasks.push(structuredClone(spec.tasks[0]));
    else spec.questions.push(structuredClone(spec.questions[0]));
    expect(() => validateSpec(spec, acceptedProject)).toThrow(
      new RegExp(`Duplicate .*${spec[key][0].id}`),
    );
  },
);
it("names the task where a dependency cycle closes", () => {
  const spec = structuredClone(accepted);
  spec.tasks[0].dependsOn = [spec.tasks[0].id];
  expect(() => validateSpec(spec, acceptedProject)).toThrow(
    `Task dependency cycle at ${spec.tasks[0].id}`,
  );
});
