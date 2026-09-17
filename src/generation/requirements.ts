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
export function plannerOutputSchema(p: Pick<Project, "request" | "answers">) {
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

export function plannerRequirementContract(
  p: Pick<Project, "request" | "answers">,
) {
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
    allowedUserSourceIds: requirementSources(p).map((source) => source.id),
  };
}

export function requirementSources(p: Pick<Project, "request" | "answers">) {
  return [
    { id: "request", text: p.request, answerId: null as string | null },
    ...Object.entries(p.answers)
      .filter(([, value]) => value.trim())
      .map(([id, text]) => ({
        id: "answer:" + id,
        text,
        answerId: id,
      })),
  ];
}

const comparable = (text: string) =>
  text.trim().replace(/\s+/g, " ").toLowerCase();

/** Bind model citations to current user input; never treat model-authored questions as user answers. */
export function bindRequirementSources(
  spec: Spec,
  p: Pick<Project, "request" | "answers">,
) {
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
