import { expect, it } from "vitest";
import { assetSearches } from "../src/marketplace/discovery";

it("uses a focused hit-effect query for fist-fighting VFX", () => {
  const groups = assetSearches({
    request: "Fist fighting with VFX and SFX",
    answers: {},
  });
  expect(groups.find((group) => group.id === "effects")?.query).toBe("hit vfx");
  expect(groups.find((group) => group.id === "sound")?.query).toBe(
    "punch impact",
  );
});

it.each(["fist-fighting", "punching", "boxing"])(
  "uses a punch-specific animation query for an explicit %s brief",
  (style) => {
    const groups = assetSearches({
      request: `A simple ${style} game with Marketplace animations, a dummy, VFX and SFX`,
      answers: {},
    });
    expect(groups.find((group) => group.id === "combat")).toMatchObject({
      query: "punch animation",
      kind: "Model",
      preview: "animation",
    });
    expect(groups.map((group) => group.id)).toEqual([
      "dummy",
      "combat",
      "sound",
      "effects",
    ]);
  },
);

it("retains explicit rig requirements in the punch-specific search", () => {
  const groups = assetSearches({
    request: "Fist fighting animations",
    answers: { rig: "R15" },
  });
  expect(groups.find((group) => group.id === "combat")?.query).toBe(
    "punch animation R15",
  );
});
