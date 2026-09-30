import fs from "node:fs";
import { it, expect } from "vitest";
import {
  animationSegments,
  limbEndpoints,
  validSegments,
} from "../src/marketplace/animation-segments";
import { animationClipSchema } from "../src/generation/animation";
import { nativeRolesSchema } from "../src/marketplace/role-capture";
const load = (name: string) =>
  JSON.parse(
    fs.readFileSync(
      "tests/fixtures/generalization/development/" + name + ".json",
      "utf8",
    ),
  );
const r15 = load("animation-R15-punch-animation"),
  r6 = load("animation-R6-idle-animation");
const cases: {clip: ReturnType<typeof animationClipSchema.parse>; seq: ReturnType<typeof nativeRolesSchema.parse>["sequences"][number]}[] = r15.animations.entries
  .filter((e: any) => e.clip)
  .map((e: any) => ({
    clip: animationClipSchema.parse(e.clip),
    seq: nativeRolesSchema
      .parse(r15.snapshot.nativeRoles)
      .sequences.find((s) => s.key === e.key)!,
  }));
it.each(cases)(
  "derives R15 native chains and low-confidence motion without authored hit labels",
  ({ clip, seq }) => {
    const result = animationSegments(clip, seq, "Player punch attack");
    expect(limbEndpoints(clip, clip.duration / 2)).toHaveLength(4);
    expect(result.segments.length).toBeGreaterThan(0);
    expect(
      result.segments.every(
        (s) => s.source === "motion" && s.confidence === "low",
      ),
    ).toBe(true);
    expect(validSegments(result.segments, clip.duration)).toBe(true);
    expect(result.requiresAcceptance).toBe(true);
  },
);
it("does not invent attacks for actual looping idle or absent attack intent", () => {
  const e = r6.animations.entries.find((e: any) => e.name === "idle");
  const seq = nativeRolesSchema
    .parse(r6.snapshot.nativeRoles)
    .sequences.find((s) => s.key === e.key)!;
  expect(
    animationSegments(animationClipSchema.parse(e.clip), seq, "Player attacks")
      .segments,
  ).toEqual([]);
  expect(
    animationSegments(cases[0].clip, cases[0].seq, "Preview the animation")
      .segments,
  ).toEqual([]);
});
it("refuses timing without native identity and invalid user bounds", () => {
  expect(
    animationSegments(cases[0].clip, undefined, "Player attacks").segments,
  ).toEqual([]);
  const proposal = animationSegments(
    cases[0].clip,
    cases[0].seq,
    "Player punch attack",
  );
  expect(
    validSegments(
      proposal.segments.map((s) => ({ ...s, hit: s.end })),
      cases[0].clip.duration,
    ),
  ).toBe(false);
});
