import { describe, expect, it } from "vitest";
import { contractFeedback } from "../src/generation/diagnostics";
import { specSchema } from "../src/generation/schema";
import { specification } from "./generation-fixtures";

function plan(count = 3) {
  const spec = specification("Offline diagnostics fixture", "Fixture");
  return {
    ...spec,
    requirements: Array.from({ length: count }, (_, index) => ({
      ...spec.requirements[0],
      id: "req" + index,
      sourceId: "request",
      sourceQuote: "Offline diagnostics fixture",
    })) as Record<string, unknown>[],
  };
}
function feedback(input: unknown) {
  const result = specSchema.safeParse(input);
  expect(result.success).toBe(false);
  if (result.success) throw Error("Expected invalid fixture");
  return contractFeedback(result.error, input);
}

describe("planner description feedback (offline invalid-output fixtures)", () => {
  it("aggregates omitted descriptions by index and ID without supplying or inserting descriptions", () => {
    const input = plan();
    for (const requirement of input.requirements)
      delete requirement.description;
    const before = structuredClone(input);
    const message = feedback(input);
    expect(message).toContain('requirements[0] (id "req0")');
    expect(message).toContain('requirements[1] (id "req1")');
    expect(message).toContain('requirements[2] (id "req2")');
    expect(
      message.match(/Missing required requirement\.description/g),
    ).toHaveLength(1);
    expect(message).toContain(
      "behavior or outcome to implement in plain language",
    );
    expect(message).toContain(
      "sourceId and sourceQuote identify evidence; they do not replace description",
    );
    expect(message).toContain(
      "complete corrected plan, retaining all other plan fields",
    );
    expect(message).not.toContain("Offline diagnostics fixture");
    expect(input).toEqual(before);
    expect(
      input.requirements.every(
        (requirement) => !("description" in requirement),
      ),
    ).toBe(true);
    expect(specSchema.safeParse(input).success).toBe(false);
  });

  it("preserves actionable feedback for other missing fields after aggregating many descriptions", () => {
    const input = plan(20);
    for (const requirement of input.requirements)
      delete requirement.description;
    delete (input as any).summary;
    const message = feedback(input);
    expect(message).toContain('requirements[11] (id "req11")');
    expect(message).not.toContain("requirements[12]");
    expect(message).toContain("and 8 more requirements");
    expect(message).toContain("summary:");
    expect(message.length).toBeLessThan(1600);
  });

  it("includes indices when IDs are missing and caps unvalidated ID text", () => {
    const input = plan(2);
    for (const requirement of input.requirements)
      delete requirement.description;
    delete input.requirements[0].id;
    input.requirements[1].id = "A".repeat(5000);
    const message = feedback(input);
    expect(message).toContain("requirements[0], requirements[1]");
    expect(message).toContain('id "' + "A".repeat(64) + '"');
    expect(message).not.toContain("A".repeat(65));
    expect(message).toContain("requirements.0.id:");
    expect(message.length).toBeLessThan(1600);
  });

  it("does not label a supplied invalid description as omitted or invent replacement text", () => {
    const input = plan(1);
    input.requirements[0].description = null;
    const message = feedback(input);
    expect(message).toContain("requirements.0.description:");
    expect(message).not.toContain("Missing required requirement.description");
    expect(input.requirements[0].description).toBeNull();
  });

  it("accepts the worker's complete corrected plan only after descriptions are actually supplied", () => {
    const input = plan(1);
    delete input.requirements[0].description;
    feedback(input);
    expect(specSchema.safeParse(input).success).toBe(false);
    input.requirements[0].description =
      "The worker supplies the required behavior description.";
    expect(specSchema.safeParse(input).success).toBe(true);
  });
});
