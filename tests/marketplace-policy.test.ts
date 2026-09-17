import { expect, it } from "vitest";
import {
  validateMarketplaceDiscovery,
  marketplaceFirstInstructions,
} from "../src/generation/marketplace-policy";
import { generationDesignGuidance } from "../src/generation/design-guidance";
import { specification } from "./generation-fixtures";
import type { AssetNeed } from "../src/generation/asset-contract";

function plan(kind: AssetNeed["kind"] = "Model", query = "interactive object") {
  const spec = specification("Build a simple interaction", "Scope");
  spec.assetNeeds = [
    {
      id: "component",
      requirementId: "core",
      role: "Main reusable component",
      kind,
      query,
      constraints: "Inspect included behavior and media",
      required: false,
      position: [0, 0, 0],
      maxSize: 12,
    },
  ];
  return spec;
}
it("accepts short component discovery without replacing the worker query", () => {
  const spec = plan();
  const before = structuredClone(spec);
  expect(() => validateMarketplaceDiscovery(spec)).not.toThrow();
  expect(spec).toEqual(before);
});
it.each([
  "small yellow polished interactive object model",
  "small+yellow+polished+interactive+object",
])("rejects an overqualified initial Model query: %s", (query) => {
  expect(() => validateMarketplaceDiscovery(plan("Model", query))).toThrow(
    "short subject query",
  );
});
it("requires complete component discovery before bare mesh sourcing", () => {
  const spec = plan("MeshPart");
  expect(() => validateMarketplaceDiscovery(spec)).toThrow(
    "Model discovery need",
  );
  spec.assetNeeds!.push({
    ...spec.assetNeeds![0],
    id: "unrelated",
    kind: "Model",
    requirementId: "different-component",
  });
  expect(() => validateMarketplaceDiscovery(spec)).toThrow("same requirement");
  spec.assetNeeds!.push({
    ...spec.assetNeeds![0],
    id: "assembly",
    kind: "Model",
  });
  expect(() => validateMarketplaceDiscovery(spec)).not.toThrow();
});
it("does not manufacture Model searches for audio, image or asset-free tasks", () => {
  for (const kind of ["Audio", "Image"] as const)
    expect(() =>
      validateMarketplaceDiscovery(
        plan(kind, "a longer precise media search phrase"),
      ),
    ).not.toThrow();
  const spec = plan();
  spec.assetNeeds = [];
  expect(() => validateMarketplaceDiscovery(spec)).not.toThrow();
});
it("sends reuse-first policy to every generation phase without inventing asset IDs", () => {
  const spec = plan();
  for (const phase of ["planner", "builder", "reviewer", "repair"] as const) {
    const guidance = generationDesignGuidance(
      phase,
      { spec },
      phase === "builder" ? "coreTask" : undefined,
    );
    expect(guidance.instructions).toEqual(
      expect.arrayContaining([...marketplaceFirstInstructions]),
    );
    expect(guidance.evidenceBoundary.status).toBe(
      "native_verification_pending",
    );
    expect(guidance.instructions.join(" ")).not.toMatch(/rbxassetid:\/\/\d+/);
  }
});
