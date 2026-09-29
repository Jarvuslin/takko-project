/** Conservative, offline equivalence for scope decisions. Unknown constraints stay
 * questions. Topic overlap alone is never permission to accept another limit. */
export type AnswerSources = {
  answers: Record<string, string>;
  answerQuestions?: Record<string, string>;
};

const words = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const prefix = "Should this limit apply, or should the mechanic support more? ";
const stem = (word: string) => word.replace(/(?:ing|s)$/, "");
const topic = (text: string) =>
  new Set(
    words(text.replace(prefix, ""))
      .split(" ")
      .map(stem)
      .filter(
        (word) =>
          word.length > 2 &&
          ![
            "the",
            "one",
            "single",
            "only",
            "exactly",
            "should",
            "with",
            "without",
            "these",
            "limit",
            "available",
            "required",
            "input",
            "action",
            "type",
          ].includes(word),
      ),
  );

function constraints(text: string): string[] {
  const normalized = text
    .toLowerCase()
    // Input spelling and animation wrappers do not change the chosen action.
    .replace(/click\/tap-to-(\w+) action/g, "$1")
    .replace(
      /\b(single|exactly one|only one)\s*[- ]\s*(\w+) animation\b/g,
      "$1 $2",
    )
    .replace(/\b(combo)(?:[- ](?:chain|system))\b/g, "$1")
    .replace(/\b(?:chained attacks?|attack chaining)\b/g, "attack chain")
    .replace(/\bmultiple distinct attack types\b/g, "multiple attack types");
  const result: string[] = [];
  for (const match of normalized.matchAll(
    /\b(no|without|single|only|exactly one)\s+([^.!?;:]+)/g,
  )) {
    const [, operator, rest] = match;
    if (operator === "no" || operator === "without") {
      for (const item of rest.split(/,|\b(?:and|or)\b/)) {
        const value = words(item)
          .replace(/^(?:no|without) /, "")
          .replace(/^additional /, "")
          .replace(/ (?:was|were|is|are) (?:requested|required)$/, "");
        if (value) result.push("no " + value.replace(/s$/, ""));
      }
    } else {
      const value = words(rest.split(",")[0]).replace(
        / (?:is|are) (?:available|required)$/,
        "",
      );
      result.push(
        operator === "only" && !value.startsWith("one ")
          ? "only " + value
          : "one " + value.replace(/^one /, ""),
      );
    }
  }
  // A new numeric bound must not disappear behind a familiar topic.
  for (const match of normalized.matchAll(/\b\d+(?:\.\d+)?\s+\w+/g))
    result.push(match[0]);
  // These forms carry restrictions too. Retain their full content rather than
  // guessing that a familiar topic authorizes an unfamiliar bound or exclusion.
  for (const match of normalized.matchAll(
    /\b(?:cannot|can not|can't|must not|never|at most|at least|up to|maximum|minimum)\b[^.!?;]*/g,
  ))
    result.push(words(match[0]));
  for (const match of normalized.matchAll(
    /\b(?:short|long|slow|fast|near|far|small|large|low|high|limited|unlimited)\s+\w+/g,
  ))
    result.push(words(match[0]));
  return [...new Set(result)];
}

export function answeredScopeSource(
  source: string,
  p: AnswerSources,
): string | undefined {
  // Legacy scope strings were truncated at 490 characters. Do not infer that
  // the omitted suffix contains no new constraints. Exact-ID answers still work.
  if (source.length === 490) return;
  const limits = constraints(source.replace(prefix, ""));
  if (!limits.length) return;
  for (const [id, answer] of Object.entries(p.answers)) {
    const original = p.answerQuestions?.[id];
    if (!original || !answer.trim()) continue;
    const evidence = answer === "Keep these limits" ? original : answer;
    const chosen = constraints(evidence);
    const originalTopic = topic(original),
      answerTopic = topic(evidence);
    if (
      ![...topic(source)].some(
        (word) => originalTopic.has(word) && answerTopic.has(word),
      )
    )
      continue;
    // A selected single attack, explicitly without chains, also settles whether
    // that attack has multiple variants. This is not permission to remove other
    // combat mechanics (blocking, targets, damage, range, etc.).
    if (
      /\battack\b/.test(original) &&
      chosen.includes("no attack chain") &&
      chosen.some(
        (c) => /^one \w+$/.test(c) && originalTopic.has(stem(c.slice(4))),
      )
    )
      chosen.push("no multiple attack type");
    if (limits.every((limit) => chosen.includes(limit))) return id;
  }
}
