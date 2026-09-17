import { describe, it, expect } from "vitest";
import { newProject } from "../src/generation/store";
import { specification } from "./generation-fixtures";
import { validateSpec } from "../src/generation/validation";
import {
  plannerOutputSchema,
  requirementSources,
} from "../src/generation/requirements";
import { z } from "zod";
import { specSchema } from "../src/generation/schema";
import { assetNeedSchema } from "../src/generation/asset-contract";

const answers = {
  playerCharacterAppearance: "Fixed model with Brainrot aesthetic",
  gameMapAndEnvironment: "Predefined maze with Brainrot stylistic elements",
  buffTypesAndEffects: "Speed boost and vision enhancement",
  respawnRules: "Instant respawn after short delay",
  hudElementsDetails: "Health or hunger meter",
  soundRequirementsPriority: "Ambient atmospheric music and sounds",
};
function fixture() {
  const p = newProject("steel a brainrot style game", 250000);
  p.answers = { ...answers };
  const s = specification(p.request, p.scope);
  return { p, s };
}
describe("requirement provenance after clarification", () => {
  it("advertises acquisition required as an explicit boolean while preserving legacy stored defaults", () => {
    const { p } = fixture();
    const advertised = z.toJSONSchema(plannerOutputSchema(p), {
      io: "input",
    }) as any;
    const item = advertised.properties.assetNeeds.items;
    expect(item.required).toContain("required");
    expect(item.properties.required.type).toBe("boolean");
    expect(item.properties.required).not.toHaveProperty("default");
    expect(item.properties.required.description).toContain(
      "successful acquisition is mandatory",
    );
    expect(item.properties.required.description).toContain(
      "existing bounded fallback policy",
    );
    const legacy = {
      id: "visual",
      requirementId: "core",
      role: "Optional visual source",
      kind: "Model",
      query: "visual",
      constraints: "Inspect first",
      position: [0, 0, 0],
    };
    expect(assetNeedSchema.parse(legacy).required).toBe(true);
    expect(assetNeedSchema.parse({ ...legacy, required: false }).required).toBe(
      false,
    );
    expect(
      assetNeedSchema.safeParse({ ...legacy, default: false }).success,
    ).toBe(false);
    expect(
      assetNeedSchema.safeParse({
        ...legacy,
        $schema: "https://json-schema.org/draft/2020-12/schema",
      }).success,
    ).toBe(false);
  });
  it("advertises required current source IDs for user requirements, without guessing missing evidence", () => {
    const { p, s } = fixture();
    const schema = plannerOutputSchema(p);
    const advertised = z.toJSONSchema(schema) as any;
    const user = advertised.properties.requirements.items.oneOf.find(
      (v: any) => v.properties.origin.const === "user",
    );
    expect(user.required).toContain("sourceId");
    expect(user.properties.sourceId.enum).toEqual(
      requirementSources(p).map((source) => source.id),
    );
    expect(schema.safeParse(s).success).toBe(false);
    s.requirements[0].sourceId = "request";
    expect(schema.safeParse(s).success).toBe(true);
    s.requirements[0].sourceId = "answer:missing";
    expect(schema.safeParse(s).success).toBe(false);
    delete s.requirements[0].sourceId;
    s.requirements[0].origin = "inferred";
    expect(schema.safeParse(s).success).toBe(true);
  });
  it("excludes blank or removed answers from subsequent planner contracts", () => {
    const { p, s } = fixture();
    s.requirements[0].sourceId = "answer:respawnRules";
    p.answers.respawnRules = "  ";
    expect(plannerOutputSchema(p).safeParse(s).success).toBe(false);
    expect(() => validateSpec(s, p)).toThrow("Unknown user source");
  });
  it("accepts all six exact answer-prefixed quotations from the reported failure", () => {
    const { p, s } = fixture();
    s.requirements = Object.entries(answers).map(([id, answer]) => ({
      ...s.requirements[0],
      id,
      sourceQuote: id + ": " + answer,
    }));
    s.tasks[0].requirements = Object.keys(answers);
    const result = validateSpec(s, p);
    expect(result.requirements.map((r) => r.sourceId)).toEqual(
      Object.keys(answers).map((id) => "answer:" + id),
    );
    expect(result.requirements.map((r) => r.sourceQuote)).toEqual(
      Object.values(answers),
    );
    expect(s.requirements[0].sourceQuote).toContain(
      "playerCharacterAppearance:",
    );
  });
  it("accepts direct answer excerpts and harmless whitespace differences", () => {
    const { p, s } = fixture();
    s.requirements[0].sourceQuote = "Speed boost  and\nvision enhancement";
    expect(validateSpec(s, p).requirements[0].sourceId).toBe(
      "answer:buffTypesAndEffects",
    );
  });
  it("lets the model choose a source ID without retyping user text", () => {
    const { p, s } = fixture();
    const raw: any = structuredClone(s);
    raw.requirements[0].sourceId = "answer:respawnRules";
    delete raw.requirements[0].sourceQuote;
    const result = validateSpec(specSchema.parse(raw), p);
    expect(result.requirements[0].sourceQuote).toBe(answers.respawnRules);
  });
  it("replaces a paraphrased quote with authoritative text when an explicit source is selected", () => {
    const { p, s } = fixture();
    s.requirements[0].sourceId = "answer:respawnRules";
    s.requirements[0].sourceQuote = "Respawn quickly";
    expect(validateSpec(s, p).requirements[0].sourceQuote).toBe(
      answers.respawnRules,
    );
  });
  it.each([
    "Invented double-jump ability",
    "respawnRules",
    "madeUp: Instant respawn after short delay",
  ])("rejects ungrounded legacy evidence: %s", (quote) => {
    const { p, s } = fixture();
    s.requirements[0].sourceQuote = quote;
    expect(() => validateSpec(s, p)).toThrow("no matching quotation");
  });
  it("rejects fabricated or removed answer IDs even if the supplied quote matches the request", () => {
    const { p, s } = fixture();
    s.requirements[0].sourceId = "answer:missing";
    expect(() => validateSpec(s, p)).toThrow("Unknown user source");
    s.requirements[0].sourceId = "answer:respawnRules";
    delete p.answers.respawnRules;
    expect(() => validateSpec(s, p)).toThrow("Unknown user source");
  });
  it("does not use question options or invented assumptions as answered evidence", () => {
    const { p, s } = fixture();
    s.questions = [
      { id: "jump", prompt: "How high?", options: ["Double jump"] },
    ];
    s.requirements[0].sourceQuote = "Double jump";
    expect(() => validateSpec(s, p)).toThrow("no matching quotation");
    s.requirements[0].origin = "inferred";
    expect(validateSpec(s, p).requirements[0].sourceId).toBeUndefined();
    expect(requirementSources(p)).toHaveLength(7);
  });
  it("preserves legacy request quotations and bounds automatically copied evidence", () => {
    const { p, s } = fixture();
    expect(validateSpec(s, p).requirements[0].sourceId).toBe("request");
    p.request = "x".repeat(12000);
    s.requirements[0].sourceId = "request";
    s.requirements[0].sourceQuote = "";
    expect(validateSpec(s, p).requirements[0].sourceQuote).toHaveLength(3000);
  });
});
