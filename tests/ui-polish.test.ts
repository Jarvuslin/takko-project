import { expect, it } from "vitest";
import { conceptSchema } from "../src/generation/concept";
import { specSchema } from "../src/generation/schema";
import { conceptFixture } from "./concept.fixture";
import { specification } from "./generation-fixtures";
import { newProject } from "../src/generation/store";
import { recordConversation } from "../src/generation/conversation";
import { panelLimits } from "../src/web/WorkspaceSplit";
import { answerComplete } from "../src/web/Clarifications";
import { clarificationReceipt } from "../src/web/clarification-receipt";

it("legacy answer summaries require exact known questions and answers", () => {
  const p = newProject("A practice arena", 2e6);
  p.answers = { combat: "Fists + kicks", look: "Bright\nWith a sunny sky" };
  p.answerQuestions = { combat: "How do players fight?", look: "What look?" };
  const turn = {
    id: "legacy",
    kind: "user" as const,
    revision: 1,
    at: p.createdAt,
    text: "How do players fight?: Fists + kicks\nWhat look?: Bright\nWith a sunny sky",
  };
  expect(clarificationReceipt(turn, p)).toHaveLength(2);
  expect(
    clarificationReceipt(
      { ...turn, text: turn.text + "\nAnd an unrelated new request" },
      p,
    ),
  ).toEqual([]);
  expect(clarificationReceipt({ ...turn, kind: "run" }, p)).toEqual([]);
});

it("retains structured clarification receipts and does not fabricate unchanged answers", () => {
  const before = newProject("Build a practice arena", 2e6);
  recordConversation(before);
  const after = structuredClone(before);
  after.answers = { combat: "Fists + kicks", style: "Bright" };
  after.answerQuestions = {
    combat: "Which combat style?",
    style: "Which look?",
  };
  recordConversation(after, before);
  expect(after.conversation?.at(-1)?.clarifications).toEqual([
    { id: "combat", prompt: "Which combat style?", answer: "Fists + kicks" },
    { id: "style", prompt: "Which look?", answer: "Bright" },
  ]);
  const snapshot = structuredClone(after);
  recordConversation(after, snapshot);
  expect(after.conversation).toEqual(snapshot.conversation);
});
it("both planning contracts retain supported decision types and optionality", () => {
  const questions = [
    {
      id: "style",
      prompt: "Choose your style",
      options: ["Bright", "Quiet"],
      selection: "multiple" as const,
      optional: true,
    },
  ];
  expect(
    conceptSchema.parse({ ...conceptFixture(), questions }).questions,
  ).toEqual(questions);
  expect(
    specSchema.parse({
      ...specification("A practice arena", "Forge_test"),
      questions,
    }).questions,
  ).toEqual(questions);
});
it("required empty answers block continuation and explicitly optional answers allow skip", () => {
  const q = { id: "combat", prompt: "Combat?", options: [] };
  expect(answerComplete(q, { combat: "  " })).toBe(false);
  expect(answerComplete(q, { combat: "Fists" })).toBe(true);
  expect(answerComplete({ ...q, optional: true }, {})).toBe(true);
});
it("panel constraints preserve the desktop canvas minimum and cap wide chat", () => {
  expect(panelLimits(744)).toEqual({ min: 320, max: 352 });
  expect(panelLimits(1400)).toEqual({ min: 320, max: 640 });
});
