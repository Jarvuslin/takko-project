import { requirementSources, type SourceProject } from "./brief-sources";
export { requirementSources } from "./brief-sources";
import { z } from "zod";
import { assetNeedSchema, assetIntentSchema } from "./asset-contract";
import {
  requirementSchema,
  specSchema,
  type Project,
  type Spec,
} from "./schema";

/** Advertise current source choices directly in the planner contract. Legacy saved
 * plans still use specSchema and exact-quotation validation; no source is guessed. */
export function plannerOutputSchema(p: SourceProject) {
  const sourceId = z.enum(requirementSources(p).map((source) => source.id));
  return specSchema.extend({
    assetNeeds: z
      .array(
        assetNeedSchema.extend({
          intent: assetIntentSchema,
          required: z
            .boolean()
            .describe(
              "Set required explicitly. true means successful acquisition is mandatory and failure blocks generation; it does not merely require a Marketplace search. false permits unsuccessful optional visual/course sourcing to follow the existing bounded fallback policy after discovery and inspection. It never waives required audio, gameplay behavior, native verification, or capability gaps. Use the property required, not default.",
            ),
        }),
      )
      .max(16)
      .optional(),
    requirements: z
      .array(
        z.discriminatedUnion("origin", [
          requirementSchema.extend({ origin: z.literal("user"), sourceId }),
          requirementSchema.extend({
            origin: z.literal("inferred"),
            sourceId: sourceId.optional(),
          }),
        ]),
      )
      .min(1)
      .max(40),
  });
}

export function plannerRequirementContract(p: SourceProject) {
  return {
    requiredFieldsForEveryRequirement: [
      "id",
      "description",
      "origin",
      "category",
      "priority",
      "acceptance",
    ],
    description:
      "Every requirement MUST contain a nonempty description: a plain-language statement of the behavior or property to implement. Evidence fields sourceId/sourceQuote do not replace description; acceptance states how to check it.",
    userEvidence:
      "For origin=user, also include sourceId chosen from allowedUserSourceIds. sourceQuote is optional; omit it to let Takko copy the selected source. Do not guess or combine quotations.",
    inferredEvidence:
      "For origin=inferred, explain the inferred requirement in description without inventing user evidence.",
    distinctVocabularies: {
      "requirements[].category": requirementSchema.shape.category.options,
      "tasks[].proposalSections": [
        "mechanics",
        "theme",
        "environment",
        "assets",
      ],
      rule: "category classifies the implementation obligation. proposalSections names approved document sections affected by the task. Never copy category labels into proposalSections. In particular ui, animation, audio, network, lifecycle, presentation, world and singular mechanic are NOT section names. Select document dependencies by their provenance and meaning, not the kind of code. Requirement sourceId supplies mandatory section coverage independently.",
    },
    proposalCoverage:
      "For each approved proposal source (proposal:mechanics, proposal:theme, proposal:environment), include at least one required user requirement with that exact sourceId and assign it to a task. Where existing approved content satisfies a section without new work, state that explicitly as a requirement owned by its existing task. Do not invent features or tasks merely to fill sections. Task proposalSections describe additional dependencies and cannot substitute for requirement provenance.",
    allowedUserSourceIds: requirementSources(p).map((source) => source.id),
  };
}

const comparable = (text: string) =>
  text.trim().replace(/\s+/g, " ").toLowerCase();

/** Bind model citations to current user input; never treat model-authored questions as user answers. */
export function bindRequirementSources(spec: Spec, p: SourceProject) {
  const sources = requirementSources(p);
  const errors: string[] = [];
  const requirements = spec.requirements.map((requirement) => {
    if (requirement.origin !== "user") return requirement;
    if (requirement.sourceId) {
      const source = sources.find((s) => s.id === requirement.sourceId);
      if (!source) {
        errors.push(
          `Unknown user source ${requirement.sourceId} for requirement ${requirement.id}. Choose sourceId from ${JSON.stringify(sources.map((s) => s.id))}.`,
        );
        return requirement;
      }
      // The model chooses a source, the server copies its evidence. Description may paraphrase it.
      const quote = comparable(requirement.sourceQuote);
      return {
        ...requirement,
        sourceQuote:
          quote && comparable(source.text).includes(quote)
            ? requirement.sourceQuote
            : source.text.slice(0, 3000),
      };
    }
    const quote = comparable(requirement.sourceQuote);
    const source =
      quote &&
      sources.find(
        (s) =>
          comparable(s.text).includes(quote) ||
          (s.answerId !== null &&
            comparable(`${s.answerId}: ${s.text}`) === quote),
      );
    if (source)
      return {
        ...requirement,
        sourceId: source.id,
        sourceQuote:
          source.answerId !== null &&
          comparable(`${source.answerId}: ${source.text}`) === quote
            ? source.text
            : requirement.sourceQuote,
      };
    errors.push(
      `User requirement has no matching quotation: ${requirement.id}. Set sourceId to one of ${JSON.stringify(sources.map((s) => s.id))} and omit sourceQuote so Takko copies the selected evidence. For legacy quotations, sourceQuote must copy an exact substring of the original request or a saved clarification answer; paraphrases and joined excerpts are not evidence.`,
    );
    return requirement;
  });
  return { spec: { ...spec, requirements }, errors };
}
