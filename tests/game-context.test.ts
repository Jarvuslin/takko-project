import { expect, it } from "vitest";
import { gameContext } from "../src/generation/game-context";
import { plannerOutputSchema } from "../src/generation/requirements";
import { assetNeedSchema } from "../src/generation/asset-contract";
import { validateMarketplaceDiscovery } from "../src/generation/marketplace-policy";
import { researchInputHash } from "../src/generation/research";
import type { Project } from "../src/generation/schema";
import { specification } from "./generation-fixtures";

function fixture(request = "Build a butter ASMR interaction") {
  const p: Pick<
    Project,
    "revision" | "request" | "answers" | "spec" | "research"
  > = {
    revision: 1,
    request,
    answers: {
      controls:
        "Click or tap; count once after the squash and recovery finish. No upgrades.",
    },
    spec: specification(request, "Scope"),
    research: null,
  };
  const need = assetNeedSchema.parse({
    id: "butter",
    requirementId: "core",
    role: "Main satisfying interaction",
    kind: "Model",
    query: "butter",
    constraints: "Match the clarified interaction",
    position: [0, 3, 0],
    intent: {
      experienceRole: "Satisfying tactile ASMR feedback",
      interaction: "Click/tap, squash, recover, then increment once",
      reusableFeatures: [
        "Butter mesh",
        "Squash/recovery animation",
        "Press/release sounds",
      ],
      relatedRequirementIds: ["core"],
    },
  });
  p.spec!.assetNeeds = [need];
  return { p, need };
}

it("keeps precise experience, negative constraints and asset purpose while discovery query stays broad", () => {
  const { p, need } = fixture();
  const context = gameContext(p, need);
  expect(context.assetTarget!.need.query).toBe("butter");
  expect(context.assetTarget!.need.intent!.interaction).toContain(
    "then increment once",
  );
  expect(context.userSources[1].text).toContain("No upgrades");
  expect(context.playerExperience!.requirements).toEqual(p.spec!.requirements);
  context.playerExperience!.requirements[0].description = "mutation";
  expect(p.spec!.requirements[0].description).toBe(p.request);
});

it("does not turn the same object into ASMR when the requested game uses it as a cooking ingredient", () => {
  const { p, need } = fixture(
    "Build a cooking game using butter as an ingredient",
  );
  p.answers = { controls: "Drag butter into the mixing bowl. No sounds." };
  need.intent = {
    experienceRole: "Recipe ingredient",
    interaction: "Drag into bowl to add ingredient",
    reusableFeatures: ["Butter mesh"],
    relatedRequirementIds: ["core"],
  };
  const context = gameContext(p, need);
  expect(context.assetTarget!.need.query).toBe("butter");
  expect(JSON.stringify(context)).not.toMatch(/ASMR|squash|press\/release/i);
  expect(context.userSources[1].text).toContain("No sounds");
});

it("keeps reference unknowns/citations but excludes research for different user input", () => {
  const { p } = fixture();
  p.research = {
    referenceGame: "Reference",
    summary: "Observed loop",
    mechanics: [
      {
        id: "loop",
        description: "Interaction loop",
        importance: "core",
        sourceUrls: ["https://example.com/reference"],
      },
    ],
    unknowns: ["Exact sound not observed"],
    sources: [
      {
        url: "https://example.com/reference",
        title: "Reference",
        excerpt: "Untrusted page text",
      },
    ],
    inputHash: researchInputHash(p),
    retrievedAt: "2026-09-16T00:00:00Z",
    method: "openrouter-exa",
  };
  expect(gameContext(p).referenceResearch).toMatchObject({
    status: "input_matched",
    unknowns: p.research.unknowns,
    sources: [{ url: "https://example.com/reference", title: "Reference" }],
  });
  p.answers.controls = "Use a different interaction";
  expect(gameContext(p).referenceResearch).toEqual({
    status: "input_mismatch",
  });
});

it("does not represent a previous plan as approved intent during replanning", () => {
  const { p } = fixture();
  p.spec!.summary = "Old interpretation";
  expect(gameContext(p, undefined, true).playerExperience).toBeNull();
  expect(gameContext(p, undefined, true).userSources[1].text).toContain(
    "Click or tap",
  );
});

it("binds research to question meaning as well as literal answers and preserves legacy hashes without questions", () => {
  const base = { request: "Build a game", answers: { setting: "Yes" } };
  expect(researchInputHash({ ...base, answerQuestions: {} })).toBe(
    researchInputHash(base),
  );
  expect(
    researchInputHash({
      ...base,
      answerQuestions: { setting: "Enable sound?" },
    }),
  ).not.toBe(
    researchInputHash({
      ...base,
      answerQuestions: { setting: "Enable combat?" },
    }),
  );
});

it("requires grounded intent for new planner output while explicitly labeling legacy needs", () => {
  const { p, need } = fixture();
  p.spec!.requirements[0].sourceId = "request";
  expect(plannerOutputSchema(p).safeParse(p.spec).success).toBe(true);
  expect(() => validateMarketplaceDiscovery(p.spec!, true)).not.toThrow();
  need.intent!.relatedRequirementIds = ["invented"];
  expect(() => validateMarketplaceDiscovery(p.spec!, true)).toThrow(
    "existing requirements",
  );
  delete need.intent;
  expect(assetNeedSchema.safeParse(need).success).toBe(true);
  expect(plannerOutputSchema(p).safeParse(p.spec).success).toBe(false);
  expect(() => validateMarketplaceDiscovery(p.spec!, true)).toThrow(
    "needs intent",
  );
  expect(gameContext(p, need).assetTarget!.intentStatus).toBe(
    "not_recorded_use_linked_requirements",
  );
});
