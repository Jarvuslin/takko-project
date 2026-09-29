import type { z } from "zod";
import type { conceptSchema } from "../src/generation/concept";

export function conceptFixture(
  questions = true,
): z.infer<typeof conceptSchema> {
  return {
    title: "Tiny pet rescue",
    playerExperience:
      "Find a lost pet, bring it home, and earn a new trail to explore.",
    visualDirection: "A friendly forest with clear paths and bright shelters.",
    assumptions: ["Start with one small forest and expand from there."],
    questions: questions
      ? [
          {
            id: "play_style",
            prompt: "How should rescuing pets feel?",
            options: ["A relaxed search", "A race against the clock"],
          },
        ]
      : [],
    firstPlaytest: {
      goal: "Rescue one pet and see the reward.",
      steps: ["Walk up to a lost pet.", "Bring it to the shelter."],
      expected: "The pet stays at the shelter and a new trail opens.",
    },
  };
}

export function conceptProposalFixture(
  questions = true,
  answers: Record<string, string> = {},
) {
  const base = conceptFixture(questions);
  return {
    ...base,
    decisions: [
      {
        questionId: null,
        topic: "Game loop",
        choice: "Find pets and bring them to a shelter to open trails.",
        sourceIds: ["request"],
      },
      ...Object.keys(answers).map((id) => ({
        questionId: id,
        topic: "Rescue style",
        choice:
          answers[id] === "Choose a sensible default for me."
            ? "A relaxed search"
            : answers[id],
        sourceIds: ["answer:" + id],
      })),
    ],
    unresolvedIssues: [],
    firstPlaytest: {
      ...base.firstPlaytest,
      checks: base.firstPlaytest.steps.map((_, i) => ({
        step: i + 1,
        expected:
          i === 0
            ? "The pet follows the player."
            : "The pet stays at the shelter and the trail opens.",
      })),
    },
  };
}
