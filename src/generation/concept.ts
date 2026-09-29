import {
  structuredQuestionSchema,
  questionInstructions,
  fallbackQuestion,
} from "./questions";
import { requirementSources } from "./brief-sources";
import { z } from "zod";
import { scopeQuestions, scopeQuestionId } from "./scope-questions";
import type { Project } from "./schema";

const sentence = z.string().trim().min(1).max(500);
// Aim for short UI copy without paying for a correction when a useful summary
// slightly exceeds the presentation target. Keep a separate hard safety bound.
const description = z
  .string()
  .trim()
  .min(1)
  .max(1000)
  .describe(
    "Use one to three short sentences, ideally under 350 characters. Preserve the complete intended loop.",
  );
export const conceptSchema = z
  .object({
    title: z.string().trim().min(1).max(80),
    playerExperience: description,
    visualDirection: description,
    assumptions: z.array(sentence).max(4),
    questions: z
      .array(
        z.union([
          structuredQuestionSchema,
          z
            .object({
              id: z.string().regex(/^[a-z][a-z0-9_]{0,59}$/),
              prompt: sentence,
              selection: z.enum(["single", "multiple", "text"]).optional(),
              optional: z.boolean().optional(),
              options: z.array(z.string().trim().min(1).max(180)).max(5),
            })
            .strict(),
        ]),
      )
      .max(3),
    firstPlaytest: z
      .object({
        goal: sentence,
        steps: z
          .array(sentence)
          .min(1)
          .max(8)
          .describe(
            "Aim for two to four short player actions after building. Assume the game already contains the required objects. Do not ask the user to place objects, write scripts, or configure Studio.",
          ),
        expected: sentence,
      })
      .strict(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      new Set(value.questions.map((q) => q.id)).size !== value.questions.length
    )
      ctx.addIssue({ code: "custom", message: "Question IDs must be unique" });
  });

const decisionSchema = z
  .object({
    questionId: z
      .string()
      .min(1)
      .max(80)
      .nullable()
      .describe(
        "The saved answered question ID, or null for a new inferred default.",
      ),
    topic: sentence,
    choice: sentence.describe(
      "One concrete selected direction, not alternatives or a request for the user to decide.",
    ),
    sourceIds: z.array(z.string().min(1).max(100)).min(1).max(12),
  })
  .strict();
const playtestCheck = z
  .object({ step: z.number().int().min(1).max(8), expected: sentence })
  .strict();
// Read older proposals without pretending they satisfy the newer decision contract.
export const conceptResponseSchema = conceptSchema.safeExtend({
  decisions: z.array(decisionSchema).max(12).optional(),
  unresolvedIssues: z.array(sentence).max(3).optional(),
  firstPlaytest: conceptSchema.shape.firstPlaytest.extend({
    checks: z.array(playtestCheck).max(8).optional(),
  }),
});
export const conceptOutputSchema = z
  .object({
    ...conceptResponseSchema.shape,
    questions:
      conceptResponseSchema.shape.questions.describe(questionInstructions),
    decisions: z.array(decisionSchema).max(12),
    unresolvedIssues: z.array(sentence).max(3),
    firstPlaytest: z
      .object({
        goal: sentence,
        actions: z
          .array(
            z
              .object({
                action: sentence,
                expected: sentence,
              })
              .strict(),
          )
          .min(1)
          .max(8)
          .describe(
            "Two to four player actions after building. Pair every action, including walking or waiting, with its observable outcome in the same object.",
          ),
        expected: sentence,
      })
      .strict(),
  })
  .strict();
// Generate action/outcome pairs, then derive stable step numbers for saved/UI data.
// Legacy complete responses remain readable without inventing missing outcomes.
export const conceptGeneratedResponseSchema = z.preprocess((raw) => {
  if (!raw || typeof raw !== "object" || !("firstPlaytest" in raw)) return raw;
  const playtest = raw.firstPlaytest;
  if (!playtest || typeof playtest !== "object" || !("actions" in playtest))
    return raw;
  const value = conceptOutputSchema.parse(raw);
  const { actions, ...rest } = value.firstPlaytest;
  return {
    ...value,
    firstPlaytest: {
      ...rest,
      steps: actions.map((item) => item.action),
      checks: actions.map((item, index) => ({
        step: index + 1,
        expected: item.expected,
      })),
    },
  };
}, conceptResponseSchema);
export type GameConcept = z.infer<typeof conceptResponseSchema> & {
  revision: number;
  readiness?: "needs_choices" | "needs_revision" | "review";
  notices?: string[];
};
export function conceptCanPlan(concept: GameConcept) {
  return (
    concept.readiness === "review" &&
    concept.questions.length === 0 &&
    !!concept.decisions?.length &&
    concept.unresolvedIssues?.length === 0 &&
    concept.firstPlaytest.checks?.length === concept.firstPlaytest.steps.length
  );
}
const normalizedQuestion = (text: string) =>
  text
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
export function assessConcept(
  value: z.infer<typeof conceptResponseSchema>,
  p: Pick<
    Project,
    | "request"
    | "revision"
    | "answers"
    | "answerQuestions"
    | "conceptQuestions"
    | "briefChanges"
    | "architecture"
  >,
): GameConcept {
  const missing = scopeQuestions(value.assumptions, p);
  value = {
    ...value,
    questions: value.questions.map((q) => {
      if (!("recommendedOptionId" in q)) return q;
      const source = missing.find(
        (s) =>
          s === q.source ||
          s.replace(
            "Should this limit apply, or should the mechanic support more? ",
            "",
          ) === q.source,
      );
      return source ? { ...q, id: scopeQuestionId(source), source } : q;
    }),
  };
  if (missing.length && !value.questions.length) {
    value = {
      ...value,
      questions: missing
        .slice(0, 3)
        .map((prompt) => fallbackQuestion(scopeQuestionId(prompt), prompt)),
    };
  }
  const known = { ...p.conceptQuestions, ...p.answerQuestions };
  const seen = new Set<string>();
  for (const question of value.questions) {
    const normalized = normalizedQuestion(question.prompt);
    const previous = Object.entries(known).find(
      ([, prompt]) => normalizedQuestion(prompt) === normalized,
    );
    if (p.answers[question.id] || (previous && p.answers[previous[0]]))
      throw Error(
        "Do not repeat answered choices, including under a new question ID.",
      );
    if (previous && previous[0] !== question.id)
      throw Error("Reuse the saved question ID for an existing decision.");
    if (
      known[question.id] &&
      normalizedQuestion(known[question.id]) !== normalized
    )
      throw Error(
        "A saved question ID cannot be assigned to a different decision.",
      );
    if (seen.has(normalized)) throw Error("Ask each decision only once.");
    seen.add(normalized);
  }
  const sourceIds = new Set([
    ...requirementSources(p).map((source) => source.id),
  ]);
  const resolved = new Set<string>();
  for (const decision of value.decisions ?? []) {
    if (decision.sourceIds.some((id) => !sourceIds.has(id)))
      throw Error(
        "Decision source IDs must refer to the current user sources.",
      );
    if (decision.questionId !== null) {
      const id = decision.questionId;
      if (
        !p.answers[id] ||
        resolved.has(id) ||
        !decision.sourceIds.includes("answer:" + id)
      )
        throw Error(
          "Each answered decision must use its saved ID and matching answer source exactly once.",
        );
      if (decision.choice.trim() === "Choose a sensible default for me.")
        throw Error("Delegated decisions need a concrete selected default.");
      resolved.add(id);
    }
  }
  const notices: string[] = [];
  if (
    !value.decisions ||
    !value.unresolvedIssues ||
    !value.firstPlaytest.checks
  )
    notices.push(
      "This proposal needs updated decision records and player checks before planning.",
    );
  if (!value.questions.length && !value.decisions?.length)
    notices.push("Choose a concrete game direction before planning.");
  for (const id of Object.keys(p.answers))
    if (!resolved.has(id))
      notices.push(
        `The answer to ${known[id] ?? id} has not been applied to a decision yet.`,
      );
  const checks = value.firstPlaytest.checks;
  if (
    checks &&
    (checks.length !== value.firstPlaytest.steps.length ||
      new Set(checks.map((c) => c.step)).size !== checks.length ||
      checks.some((c) => c.step > value.firstPlaytest.steps.length))
  )
    throw Error(
      "Each playtest action needs one observable outcome with a matching step number.",
    );
  notices.push(...(value.unresolvedIssues ?? []));
  return {
    ...value,
    revision: p.revision,
    notices,
    readiness: value.questions.length
      ? "needs_choices"
      : notices.length
        ? "needs_revision"
        : "review",
  };
}

export const conceptInstructions = `Propose a small, concrete interpretation of this game idea for someone with no programming or Studio experience. Describe what the player does, what changes as a result, and why they would continue. Use plain language. No code, task graph, asset search, invented asset IDs, or claims of testing.
Preserve all explicit user requirements. A first playtest is a way to test one representative interaction after building, not permission to remove the rest of the requested game. Keep uncertain reference-game details visible instead of inventing facts.
Ask zero to three short questions only when different answers would materially change the core game. Supply two or three distinct concrete choices. Reuse question IDs when still discussing the same choice. Do not ask about technical implementation or incidental decoration. Never repeat a question already answered. If the user delegates a choice, choose a sensible default and list it in assumptions. If they ask you to choose everything or ask no questions, return questions: []. State the defaults you inferred in assumptions, separate from user requirements.
Keep the two descriptions to one to three short sentences each, ideally under 350 characters. Ask at most one question per underlying decision: do not repeat the same genre choice as a motivation or mood question. Do not add offline decay or offline progression unless requested. Once choices are delegated or resolved, pick a specific default rather than leaving either/or alternatives. A small first playtest does not limit normal session length or the scope of the game.
Record concrete selected choices in decisions. For every saved answer, include exactly one decision using that questionId and its answer:ID source. Use questionId null and sourceIds ["request"] for inferred defaults. Do not invent source IDs. State remaining material uncertainty in questions or unresolvedIssues rather than claiming a resolved concept. An empty question list by itself does not establish readiness. Reuse identities from knownQuestions. Never rename an answered decision to ask it again.
The firstPlaytest is a proposed manual check with a clear observable result. Describe two to four actions a beginner can take as a player after building. Required pets, objects and interactions must already be supplied by the game. Do not ask the user to create or place objects, write scripts, or configure Studio as part of this playtest. Return actions as objects with action and expected together. Every action, including walking or waiting, must have its own observable outcome. Do not return separate steps/checks arrays or step numbers. Keep setup work out of player actions. It is not evidence that a game exists or works. Return only the compact concept JSON.`;
