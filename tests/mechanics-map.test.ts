import { describe, expect, it } from "vitest";
import { mapData } from "../src/web/MechanicsMap";
import type { Project } from "../src/generation/schema";
import { specification } from "./generation-fixtures";

describe("mechanics map evidence", () => {
  it("does not invent mechanics for a project without a plan", () => {
    expect(mapData({ spec: null } as Project)).toEqual({
      nodes: [],
      edges: [],
    });
  });
  it("uses declared dependencies and recorded build progress, not artifact presence", () => {
    const spec = specification("farming", "Forge_test");
    spec.tasks.push({
      id: "hud",
      title: "Harvest HUD",
      files: [],
      requirements: ["core"],
      dependsOn: ["coreTask"],
    });
    const project = {
      spec,
      artifact: { files: [] },
      completedBuildTasks: ["coreTask"],
    } as unknown as Project;
    const { nodes, edges } = mapData(project);
    expect(nodes.map((node) => [node.id, node.built])).toEqual([
      ["coreTask", true],
      ["hud", false],
    ]);
    expect(edges.map(({ from, to }) => [from.id, to.id])).toEqual([
      ["coreTask", "hud"],
    ]);
    expect(
      nodes.every((node) => Number.isFinite(node.x) && Number.isFinite(node.y)),
    ).toBe(true);
  });
});
