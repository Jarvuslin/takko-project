import { z } from "zod";

export const structuredQuestionSchema = z
  .object({
    id: z.string().min(1).max(80),
    source: z
      .string()
      .min(1)
      .max(600)
      .optional()
      .describe(
        "Exact unresolved question or assumption this question answers. Copy from the supplied source.",
      ),
    prompt: z.string().trim().min(1).max(600),
    options: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z][a-z0-9_]{0,59}$/),
            label: z.string().trim().min(1).max(180),
            description: z.string().trim().min(1).max(600),
          })
          .strict(),
      )
      .min(2)
      .max(3),
    recommendedOptionId: z.string().min(1).max(60),
    recommendationReason: z.string().trim().min(1).max(600),
    allowOther: z.boolean(),
    fallback: z.boolean().optional(),
  })
  .strict()
  .superRefine((q, ctx) => {
    if (
      new Set(q.options.map((o) => o.id)).size !== q.options.length ||
      !q.options.some((o) => o.id === q.recommendedOptionId)
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Options must have unique IDs and the recommendation must name one option.",
      });
  });
export type StructuredQuestion = z.infer<typeof structuredQuestionSchema>;
export const questionInstructions =
  "For each consequential assumption or unresolved question provide questions with a specific plain-language prompt, 2-3 concrete options with descriptions, one recommendedOptionId and reason, and allowOther:true. Copy its exact original assumption/question into source. Use option id keep only for retaining that exact assumption. Other options must describe actual gameplay alternatives. Never silently narrow requested scope. Preserve supplied scope_ IDs. For an answered animation combo supply one Animation assetNeed with sequence metadata per step.";
export function optionAnswer(q: StructuredQuestion, id: string) {
  const option = q.options.find((o) => o.id === id);
  return option
    ? id === "keep"
      ? "Keep these limits"
      : `${option.label}: ${option.description}`
    : "";
}

export function fallbackQuestion(
  id: string,
  source: string,
  keep = true,
): StructuredQuestion {
  const assumption = source.replace(
    "Should this limit apply, or should the mechanic support more? ",
    "",
  );
  return {
    id,
    source,
    prompt: ("Decide this part of your game: " + assumption).slice(0, 600),
    options: [
      {
        id: keep ? "keep" : "resolve",
        label: keep ? "Keep the proposed behavior" : "Use a suitable default",
        description: assumption,
      },
      {
        id: "change",
        label: "Specify a different behavior",
        description: "Describe your preferred replacement in Other.",
      },
    ],
    recommendedOptionId: keep ? "keep" : "resolve",
    recommendationReason: keep
      ? "Preserves the current proposal without a model call."
      : "Lets the planner resolve this dependency.",
    allowOther: true,
    fallback: true,
  };
}
