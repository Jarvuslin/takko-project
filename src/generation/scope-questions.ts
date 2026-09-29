import type { Project } from "./schema";
import type { Proposal } from "./proposal";
import type { AssetNeed } from "./asset-contract";
import { createHash } from "node:crypto";
import { answeredScopeSource } from "./scope-answer";
type Sources = Pick<Project, "request" | "answers" | "briefChanges" | "answerQuestions">;
const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
export const scopeQuestionId = (question: string) =>
  "scope_" + createHash("sha256").update(question).digest("hex").slice(0, 12);
export const isScopeQuestionAnswered = (question: string, p: Sources) =>
  !!p.answers[scopeQuestionId(question)] || !!answeredScopeSource(question, p);
export function scopeQuestions(assumptions: string[], p: Sources): string[] {
  const rawSources = [
    p.request,
    ...Object.values(p.answers),
    ...(p.briefChanges ?? []).map((c) => c.text),
  ];
  const sources = rawSources.map(normalize);
  if (
    sources.some((s) =>
      /\b(choose everything|choose for me|ask no questions)\b/.test(s),
    )
  )
    return [];
  const closedScope = sources.some((s) =>
    /\b(?:exactly|only) (?:the )?(?:\w+ )?requested (?:elements|features|mechanics)\b/.test(
      s,
    ),
  );
  // An explicit closed scope authorizes omitting extras, not omitting something
  // the user actually named. Remove negative clauses before checking that case.
  const positiveSources = rawSources
    .map((s) =>
      s.replace(
        /\b(?:no|without|do not add|don't add|exclude)\b[^.!?;]*/gi,
        " ",
      ),
    )
    .map(normalize);
  return assumptions
    .filter((text) => {
      // Preserve clause boundaries and inspect nested limits independently, e.g.
      // a single keybind (incidental) with no combo (a consequential omission).
      const clauses = [
        ...text
          .toLowerCase()
          .matchAll(
            /(?=\b((?:no|without|single|only|exactly one)\s+[^,.!?;]+))/g,
          ),
      ].map((m) => normalize(m[1]));
      return clauses.some(
        (clause) =>
          !/^(?:no|without) (?:custom rig|custom engine|external service|persistence|leaderboard)/.test(
            clause,
          ) &&
          !/^single (?:swing|frame|event|keybind|mapped gamepad button)\b/.test(
            clause,
          ) &&
          !/^only (?:during|when|after|before|for the current)\b/.test(
            clause,
          ) &&
          (!closedScope ||
            (() => {
              const omitted = clause.match(
                /^(?:no|without) (?:additional )?(\w+)/,
              )?.[1];
              return (
                !!omitted &&
                positiveSources.some((s) =>
                  s
                    .split(" ")
                    .some(
                      (word) =>
                        word.replace(/s$/, "") === omitted.replace(/s$/, ""),
                    ),
                )
              );
            })()) &&
          !sources.some((s) => s.includes(clause)),
      );
    })
    .map((text) =>
      `Should this limit apply, or should the mechanic support more? ${text}`.slice(
        0,
        490,
      ),
    )
    .filter((question) => !isScopeQuestionAnswered(question, p));
}
/** Keep narrowed mechanics visibly unresolved until the user chooses. */
export function questionProposalScope(proposal: Proposal, p: Sources) {
  const questions = scopeQuestions(proposal.mechanics.assumptions, p);
  proposal.mechanics.unresolved = [
    ...new Set([...proposal.mechanics.unresolved, ...questions]),
  ];
}

export function sequenceAssetIssues(needs: AssetNeed[], p: Sources, declaredMechanics = ""): string[] {
  const issues: string[] = [];
  const groups = new Map<string, AssetNeed[]>();
  for (const need of needs)
    if (need.sequence)
      groups.set(need.sequence.id, [
        ...(groups.get(need.sequence.id) ?? []),
        need,
      ]);
  for (const [id, slots] of groups) {
    const total = slots[0].sequence!.total;
    if (
      slots.some(
        (s) => s.kind !== "Animation" || s.sequence!.total !== total,
      ) ||
      slots.length !== total ||
      new Set(slots.map((s) => s.sequence!.step)).size !== total ||
      slots.some((s) => s.sequence!.step > total)
    )
      issues.push(
        `Animated sequence ${id} requires one separate Animation asset slot for every step 1..${total}.`,
      );
  }
  const sources = [
    p.request,
    declaredMechanics,
    ...Object.values(p.answers),
    ...(p.briefChanges ?? []).map((c) => c.text),
  ].join("\n");
  const numbers: Record<string, number> = {
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
  };
  for (const match of sources.matchAll(
    /\b(\d+|two|three|four|five|six)[ -](?:step|hit|move)[ -]?(?:s)?\s+(?:animation\s+)?(?:sequence|combo)\b/gi,
  )) {
    const count = numbers[match[1].toLowerCase()] ?? Number(match[1]);
    if (
      ![...groups.values()].some(
        (slots) => slots.length === count && slots[0].sequence!.total === count,
      )
    )
      issues.push(
        `The user's ${match[0]} needs ${count} individually selectable Animation slots with sequence metadata. A single clip cannot silently replace that choice.`,
      );
  }
  return issues;
}
