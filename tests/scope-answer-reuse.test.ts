import fs from "node:fs";
import { expect, it } from "vitest";
import type { Project } from "../src/generation/schema";
import { applyProposalPatch } from "../src/generation/proposal";
import {
  clearAnsweredQuestions,
  proposalQuestions,
} from "../src/generation/proposal-questions";
import {
  questionProposalScope,
  scopeQuestionId,
  scopeQuestions,
} from "../src/generation/scope-questions";

const dir = "docs/results/single-punch-recovery-20260928/";
const read = (name: string) => JSON.parse(fs.readFileSync(dir + name, "utf8"));
const after = (): Project => read("project-after.json");
const duplicateId = "scope_b739c539bf2a";
const answerId = "scope_3a9e8f1bf00e";
const assumption = after().proposal!.mechanics.assumptions.find((s) =>
  s.includes("click/tap-to-punch"),
)!;

it("replays the preserved planner patch through scope creation without reopening the saved decision", () => {
  const p: Project = read("project-before.json");
  const output = read("planner-output.jsonl").output;
  applyProposalPatch(p, output, ["mechanics"]);
  // This is the answer committed by the producing edit API in the preserved run.
  p.answers = after().answers;
  p.answerQuestions = after().answerQuestions;
  questionProposalScope(p.proposal!, p);
  expect(p.proposal!.mechanics.unresolved).toEqual([]);
  expect(proposalQuestions(p)).toEqual([]);
});

it("projects and clears the already-saved duplicate using answer provenance without changing anything else", () => {
  const p = after(),
    before = structuredClone(p);
  expect(p.proposal!.mechanics.unresolved.map(scopeQuestionId)).toContain(
    duplicateId,
  );
  expect(proposalQuestions(p)).toEqual([]);
  expect(p).toEqual(before); // Read projection must be pure.
  clearAnsweredQuestions(p);
  expect(p.proposal!.mechanics.unresolved).toEqual([]);
  before.proposal!.mechanics.unresolved = [];
  expect(p).toEqual(before);
});

for (const extra of [
  "No blocking.",
  "Only one hit per session.",
  "No upgrades.",
  "Only within 2 studs.",
  "No mobile input.",
  "Only one attack every 10 seconds.",
  "Cannot move while punching.",
  "At most two hits per minute.",
  "A long cooldown is required.",
])
  it(`still asks about a new limit on the answered topic: ${extra}`, () => {
    const p = after();
    const source = assumption + " " + extra;
    expect(scopeQuestions([source], p)).toHaveLength(1);
    p.proposal!.mechanics.unresolved = [source];
    expect(proposalQuestions(p)).toHaveLength(1);
    clearAnsweredQuestions(p);
    expect(p.proposal!.mechanics.unresolved).toEqual([source]);
  });

for (const answer of [
  "Use a three-hit combo.",
  "Keep these limits",
  "No combos. Include blocking.",
])
  it(`does not infer the single-punch choice from a different answer: ${answer}`, () => {
    const p = after();
    p.answers[answerId] = answer;
    expect(scopeQuestions([assumption], p)).toHaveLength(1);
  });

it("requires the saved question topic as well as an answer", () => {
  const p = after();
  delete p.answerQuestions;
  expect(scopeQuestions([assumption], p)).toHaveLength(1);
  p.answerQuestions = {
    [answerId]: "What should the score display look like?",
  };
  expect(scopeQuestions([assumption], p)).toHaveLength(1);
});

it("does not infer equivalence when a legacy scope question may have a truncated limit", () => {
  const p = after();
  const text =
    assumption +
    " Additional context is preserved for the user's review. ".repeat(4) +
    "No upgrades.";
  const questions = scopeQuestions([text], p);
  expect(questions).toHaveLength(1);
  expect(questions[0]).toHaveLength(490);
  p.proposal!.mechanics.unresolved = questions;
  clearAnsweredQuestions(p);
  expect(p.proposal!.mechanics.unresolved).toEqual(questions);
});

it("reuses an equivalent quantity decision outside combat but asks about a changed quantity", () => {
  const source =
    "Should this limit apply, or should the mechanic support more? Only one collectible is available.";
  const id = scopeQuestionId(source);
  const p = {
    ...after(),
    request: "A collection game",
    briefChanges: [],
    answers: { [id]: "A single collectible." },
    answerQuestions: { [id]: source },
  };
  expect(scopeQuestions(["Exactly one collectible is available."], p)).toEqual(
    [],
  );
  expect(
    scopeQuestions(["Only two collectibles are available."], p),
  ).toHaveLength(1);
});

it("reuses keep-limits only for equivalent constraints, not new constraints on that topic", () => {
  const source =
    "Should this limit apply, or should the mechanic support more? Only one collectible is available.";
  const id = scopeQuestionId(source);
  const p = {
    ...after(),
    request: "A collection game",
    briefChanges: [],
    answers: { [id]: "Keep these limits" },
    answerQuestions: { [id]: source },
  };
  expect(scopeQuestions(["A single collectible is available."], p)).toEqual([]);
  expect(
    scopeQuestions(["A single collectible is available. No respawns."], p),
  ).toHaveLength(1);
});

it("does not change source questions, choices, spending or proposal content when clearing only the duplicate", () => {
  const p = after();
  const distinct =
    "Should this limit apply, or should the mechanic support more? Only one hit per session.";
  p.proposal!.mechanics.unresolved.push(distinct);
  const before = structuredClone(p);
  clearAnsweredQuestions(p);
  before.proposal!.mechanics.unresolved = [distinct];
  expect(p).toEqual(before);
  expect(proposalQuestions(p).map((q) => q.source)).toEqual([distinct]);
});
