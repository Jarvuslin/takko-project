import { describe, expect, it } from "vitest";
import {
  polishedGenerationPrompt,
  polishedGenerationSpecification,
  polishedGenerationBriefSource,
} from "../scripts/polished-generation-spec";
import { specSchema } from "../src/generation/schema";
import { newProject } from "../src/generation/store";
import {
  orderedTasks,
  validateSpec,
  instancePath,
} from "../src/generation/validation";

describe("authored Crystal Hollow evaluation brief", () => {
  it("passes the current specification schema and source/dependency validator for fresh scopes", () => {
    expect(polishedGenerationBriefSource).toBe("authored benchmark brief");
    for (let run = 0; run < 2; run++) {
      const project = newProject(polishedGenerationPrompt, 2_000_000);
      const specification = specSchema.parse(
        polishedGenerationSpecification(project.scope),
      );
      expect(validateSpec(specification, project)).toEqual(specification);
      expect(specification.questions).toEqual([]);
      expect(specification.summary).toContain(
        `Workspace/${project.scope}/World`,
      );
    }
  });

  it("grounds every required feature in an exact authored prompt quotation and one task owner", () => {
    const specification = polishedGenerationSpecification("Forge_Quarry");
    for (const requirement of specification.requirements) {
      expect(requirement.sourceQuote.length).toBeGreaterThan(20);
      expect(polishedGenerationPrompt).toContain(requirement.sourceQuote);
      expect(requirement.sourceId).toBe("request");
      expect(requirement.origin).toBe("user");
      expect(
        specification.tasks.filter((task) =>
          task.requirements.includes(requirement.id),
        ),
      ).toHaveLength(1);
    }
  });

  it("keeps seven exclusively owned Luau files and orders every shared interface dependency", () => {
    const specification = polishedGenerationSpecification("Forge_Quarry");
    expect(specification.tasks.length).toBeLessThanOrEqual(7);
    const files = specification.tasks.flatMap((task) => task.files);
    expect(files).toHaveLength(7);
    expect(new Set(files.map(instancePath)).size).toBe(7);
    const order = orderedTasks(specification).map((task) => task.id);
    for (const task of specification.tasks)
      for (const dependency of task.dependsOn)
        expect(order.indexOf(dependency)).toBeLessThan(order.indexOf(task.id));
    expect(order.indexOf("world")).toBeLessThan(order.indexOf("gameplay"));
    expect(order.indexOf("gameplay")).toBeLessThan(
      order.indexOf("presentation"),
    );
    expect(order.indexOf("hud")).toBeLessThan(order.indexOf("presentation"));
    expect(files.filter((file) => file.endsWith(".server.luau"))).toHaveLength(
      1,
    );
    expect(files.filter((file) => file.endsWith(".client.luau"))).toHaveLength(
      1,
    );
  });

  it("keeps edit-mode world acceptance separate from runtime and visual evidence", () => {
    const specification = polishedGenerationSpecification("Forge_Quarry");
    const world = specification.requirements.find(
      (requirement) => requirement.id === "world",
    )!;
    expect(world.acceptance).toContain("Before Play, artifact.scene");
    expect(world.acceptance).toContain("35–45 world entries");
    expect(specification.summary).toContain("no runtime-only construction");
    expect(specification.summary).toContain(
      "not a claim of an observed gameplay/visual pass",
    );
    expect(
      specification.tasks.find((task) => task.id === "world")?.requirements,
    ).toEqual(["world", "onboarding"]);
  });
});
