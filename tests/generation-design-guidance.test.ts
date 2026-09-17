import { expect, it } from "vitest";
import { generationDesignGuidance } from "../src/generation/design-guidance";
import { specification } from "./generation-fixtures";
import type { Spec } from "../src/generation/schema";

function themedSpecification(): Spec {
  const spec = specification(
    "Build a polished themed collect-and-upgrade game",
    "Scope",
  );
  spec.requirements.push(
    {
      ...spec.requirements[0],
      id: "world",
      category: "world",
      description:
        "An orchard with a navigable collection route and a focal upgrade stall",
      acceptance:
        "From spawn the player can identify the orchard route and upgrade stall and reach both over walkable terrain.",
    },
    {
      ...spec.requirements[0],
      id: "upgrade",
      category: "mechanic",
      description: "Spend collection rewards on a visible capacity improvement",
      acceptance:
        "Purchasing a capacity upgrade deducts the displayed cost and increases the enforced carry capacity; HUD shows the new capacity.",
    },
    {
      ...spec.requirements[0],
      id: "music",
      category: "audio",
      priority: "optional",
      description: "Background music if an available asset is supplied",
      acceptance:
        "A supplied playable audio asset can be used without blocking core play when absent.",
    },
  );
  spec.tasks[0].requirements = ["core", "upgrade"];
  spec.tasks.push({
    id: "level",
    title: "Build the orchard route and stall",
    requirements: ["world"],
    dependsOn: [],
    files: [],
  });
  return spec;
}
it("keeps a technical demonstration narrow without manufacturing world, progression or asset obligations", () => {
  const spec = specification(
    "Only test one collect counter; no upgrades or sound",
    "Scope",
  );
  const original = structuredClone(spec);
  for (const phase of ["builder", "reviewer", "repair"] as const) {
    const guidance = generationDesignGuidance(
      phase,
      { spec },
      phase === "builder" ? "coreTask" : undefined,
    );
    expect(
      guidance.applicableRequirements.map((requirement) => requirement.id),
    ).toEqual(["core"]);
    expect(guidance.applicableRequirements[0].acceptance).toBe(
      spec.requirements[0].acceptance,
    );
    expect(guidance.evidenceBoundary.status).toBe(
      "native_verification_pending",
    );
  }
  expect(spec).toEqual(original);
});
it("gives each builder only the approved design targets its task owns", () => {
  const spec = themedSpecification();
  const gameplay = generationDesignGuidance("builder", { spec }, "coreTask");
  const level = generationDesignGuidance("builder", { spec }, "level");
  expect(
    gameplay.applicableRequirements.map((requirement) => requirement.id),
  ).toEqual(["core", "upgrade"]);
  expect(
    level.applicableRequirements.map((requirement) => requirement.id),
  ).toEqual(["world"]);
  expect(level.applicableRequirements[0]).toMatchObject({
    category: "world",
    acceptance: spec.requirements[1].acceptance,
  });
  expect(
    gameplay.applicableRequirements.some(
      (requirement) => requirement.id === "music",
    ),
  ).toBe(false);
});
it("review and repair preserve optional asset status while covering all approved requirements", () => {
  const spec = themedSpecification();
  for (const phase of ["reviewer", "repair"] as const) {
    const guidance = generationDesignGuidance(phase, { spec });
    expect(
      guidance.applicableRequirements.map((requirement) => requirement.id),
    ).toEqual(spec.requirements.map((requirement) => requirement.id));
    expect(
      guidance.applicableRequirements.find(
        (requirement) => requirement.id === "music",
      )?.priority,
    ).toBe("optional");
  }
});
it("planning does not carry stale approved requirements into a new plan and invalid execution scope fails clearly", () => {
  const guidance = generationDesignGuidance("planner", {
    spec: themedSpecification(),
  });
  expect(guidance.applicableRequirements).toEqual([]);
  expect(() =>
    generationDesignGuidance("builder", { spec: null }, "coreTask"),
  ).toThrow("existing specification");
  expect(() =>
    generationDesignGuidance(
      "builder",
      { spec: themedSpecification() },
      "unknown",
    ),
  ).toThrow("known task owner");
});
it("callers cannot modify saved requirements or shared guidance through returned context", () => {
  const spec = themedSpecification();
  const original = structuredClone(spec);
  const guidance = generationDesignGuidance("builder", { spec }, "level");
  guidance.applicableRequirements[0].acceptance = "Changed externally";
  guidance.instructions.length = 0;
  guidance.scopePolicy.length = 0;
  expect(spec).toEqual(original);
  const fresh = generationDesignGuidance("builder", { spec }, "level");
  expect(fresh.applicableRequirements[0].acceptance).toBe(
    spec.requirements[1].acceptance,
  );
  expect(fresh.instructions.length).toBeGreaterThan(0);
  expect(fresh.scopePolicy.length).toBeGreaterThan(0);
});
