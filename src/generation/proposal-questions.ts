import type { Project } from "./schema";
import { scopeQuestions, scopeQuestionId, isScopeQuestionAnswered } from "./scope-questions";
import {
  fallbackQuestion,
  structuredQuestionSchema,
  type StructuredQuestion,
} from "./questions";

export function proposalQuestions(p: Project): StructuredQuestion[] {
  if (!p.proposal) return [];
  const scope = scopeQuestions(p.proposal.mechanics.assumptions, {
    ...p,
    answers: {},
  });
  const sources = [
    ...new Set([
      ...scope,
      ...(["mechanics", "theme", "environment"] as const).flatMap(
        (s) => p.proposal![s].unresolved,
      ),
    ]),
  ];
  return sources
    .filter((source) => !isScopeQuestionAnswered(source, p))
    .map((source) => {
      const id = scopeQuestionId(source);
      const authored = p.proposal!.questions?.find(
        (q) =>
          q.id === id ||
          q.source === source ||
          q.source ===
            source.replace(
              "Should this limit apply, or should the mechanic support more? ",
              "",
            ),
      );
      const parsed = structuredQuestionSchema.safeParse(authored);
      if (parsed.success) {
        const safe = structuredQuestionSchema.safeParse({
          ...parsed.data,
          id,
          source,
          options: parsed.data.options.filter(
            (o) => o.id !== "keep" || scope.includes(source),
          ),
        });
        if (safe.success) return safe.data;
      }
      return fallbackQuestion(id, source, scope.includes(source));
    });
}
export function clearAnsweredQuestions(p: Project) {
  if (!p.proposal) return;
  for (const section of [
    p.proposal.mechanics,
    p.proposal.theme,
    p.proposal.environment,
  ])
    section.unresolved = section.unresolved.filter(
      (q) => !isScopeQuestionAnswered(q, p),
    );
}
