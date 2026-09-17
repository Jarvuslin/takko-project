import { expect, it } from "vitest";
import { approve, build, createProject, revise } from "../src/core/project";
import { exportPlace } from "../src/core/recipe";

// Historical characterization, deliberately labeled as defects. Replace these
// assertions with requirement-coverage expectations when the generator changes.
function output(request: string) {
  const p = revise(createProject(request), 1, {
    style: "jade",
    device: "both",
    pace: "quick",
  });
  return build(approve(p, p.revision));
}
it("v0.1 defect: incompatible requested mechanics produce identical places", () => {
  const boxing = output("A boxing fighting game with stamina and punch combos");
  const spells = output(
    "A ranged magic combat game with fireballs and mana, no punches",
  );
  expect(boxing.request).not.toBe(spells.request);
  expect(exportPlace(boxing.artifact!)).toBe(exportPlace(spells.artifact!));
});
it("v0.1 defect: missing requested animations do not stop a completed build", () => {
  const p = output(
    "A sword fighting game with sword swing animations and parries",
  );
  expect(p.assets).toEqual([]);
  expect(p.stage).toBe("built");
  expect(p.checks.find((c) => c.id === "assets")?.status).toBe("pending");
  expect(
    p.artifact!.files.some((f) => /\bLoadAnimation\s*\(/.test(f.source)),
  ).toBe(false);
});
it("v0.1 defect: an incidental keyword passes the genre gate", () => {
  expect(() =>
    createProject("A firefighting rescue game about saving cats"),
  ).not.toThrow();
});
