import { z } from "zod";
import type { Phase, Project } from "./schema";
export function contractFeedback(error: z.ZodError, input: unknown) {
  const missingDescriptions = error.issues.filter(
    (issue) =>
      issue.path.length === 3 &&
      issue.path[0] === "requirements" &&
      typeof issue.path[1] === "number" &&
      issue.path[2] === "description" &&
      (input as any)?.requirements?.[issue.path[1]]?.description === undefined,
  );
  const aggregate: string[] = [];
  if (missingDescriptions.length) {
    const locations = missingDescriptions.slice(0, 12).map((issue) => {
      const index = issue.path[1] as number;
      const id = (input as any)?.requirements?.[index]?.id;
      return `requirements[${index}]${typeof id === "string" ? ` (id ${JSON.stringify(id.slice(0, 64))})` : ""}`;
    });
    aggregate.push(
      `Missing required requirement.description in ${locations.join(", ")}${missingDescriptions.length > 12 ? ` and ${missingDescriptions.length - 12} more requirements` : ""}. ` +
        "Every requirement needs a nonempty description stating the behavior or outcome to implement in plain language. " +
        "sourceId and sourceQuote identify evidence; they do not replace description. " +
        "Return the complete corrected plan, retaining all other plan fields; do not return only descriptions or a partial patch.",
    );
  }
  const missing = new Set(missingDescriptions);
  const details = error.issues
    .filter((issue) => !missing.has(issue))
    .slice(0, 12 - aggregate.length)
    .map((issue) => {
      let received: any = input;
      for (const key of issue.path) received = received?.[key];
      if (issue.path[0] === "scene" && issue.path.at(-1) === "className") {
        const node = (input as any)?.scene?.[issue.path[1] as number];
        return `Scene node ${JSON.stringify(node?.path)} uses unsupported class ${JSON.stringify(received)}. Use a class in runtimeReference.sceneClasses; do not invent a substitute or claim a blocked feature is implemented.`;
      }
      return issue.path.join(".") + ": " + issue.message;
    });
  return [...aggregate, ...details].join("; ");
}
export class GenerationFailure extends Error {
  readonly diagnostic: NonNullable<Project["failure"]>;
  constructor(
    phase: Phase,
    task: { id: string; title: string } | undefined,
    attempts: number,
    details: string,
  ) {
    super(
      `Could not complete ${task ? task.title : phase}. ${details.length > 240 ? details.slice(0, 237) + "…" : details}`,
    );
    this.diagnostic = {
      code: "GENERATION_OUTPUT_REJECTED",
      phase,
      taskId: task?.id,
      attempts,
      details,
      at: new Date().toISOString(),
    };
  }
}
export class InputRequired extends Error {}
