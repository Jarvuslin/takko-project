import type { ConversationTurn } from "../generation/conversation";
import type { Project } from "../generation/schema";

/** Recognize only exact legacy answer records. Never reinterpret arbitrary chat. */
export function clarificationReceipt(
  turn: ConversationTurn,
  project: Pick<Project, "answers" | "answerQuestions" | "conceptQuestions">,
) {
  if (turn.clarifications) return turn.clarifications;
  if (turn.kind !== "user") return [];
  const prompts = { ...project.conceptQuestions, ...project.answerQuestions };
  const candidates = Object.entries(project.answers)
    .filter(([id, answer]) => prompts[id] && answer)
    .map(([id, answer]) => ({ id, prompt: prompts[id], answer }));
  let remaining = turn.text;
  const result: typeof candidates = [];
  while (remaining) {
    const entry = candidates.find((a) => {
      const text = `${a.prompt}: ${a.answer}`;
      return (
        !result.includes(a) &&
        (remaining === text || remaining.startsWith(text + "\n"))
      );
    });
    if (!entry) return [];
    result.push(entry);
    remaining = remaining
      .slice(`${entry.prompt}: ${entry.answer}`.length)
      .replace(/^\n/, "");
  }
  return result;
}
