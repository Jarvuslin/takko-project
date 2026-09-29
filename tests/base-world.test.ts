import fs from "node:fs";
import { expect, it } from "vitest";
import { exportBundle } from "../src/generation/export";
import { exportedHierarchy } from "../src/generation/instance-path-check";
import { generationDesignGuidance } from "../src/generation/design-guidance";
import type { Project } from "../src/generation/schema";
import { newProject } from "../src/generation/store";

for (const file of [
  "docs/results/approved-reference-finish-20260927/terminal-project.json",
  "benchmarks/runs/butter-crunch-marketplace-v6-20260916/grok/final-project.json",
]) {
  const p: Project = JSON.parse(fs.readFileSync(file, "utf8"));
  it(`exports the verified base world below the real content: ${file}`, () => {
    const world = newProject(p.request,8000000).world;
    const hierarchy = exportedHierarchy(exportBundle(p.artifact!, p.scope, [], world));
    expect(hierarchy.get("Workspace/Baseplate")).toBe("Part");
    expect(hierarchy.get("Lighting/Sky")).toBe("Sky");
    expect(hierarchy.get("Lighting/Atmosphere")).toBe("Atmosphere");
  });
  it(`gives every generation phase the existing ground contract: ${file}`, () => {
    for (const phase of ["planner", "builder", "reviewer", "repair"] as const) {
      const context = generationDesignGuidance(phase, {...p,world:newProject(p.request,8000000).world}, p.spec!.tasks[0].id);
      expect(JSON.stringify(context)).toContain("baseplate");
      expect(JSON.stringify(context)).toContain("y=0");
    }
  });
}
