import type { Project } from "./schema";
import type { StructuredQuestion } from "./questions";

export type Platform = "pc" | "mobile" | "console" | "vr";
export type PlatformDecision = {
  kind: "pc" | "custom";
  targets: Platform[];
  source: "default" | "request";
  sourceQuote?: string;
  question?: string;
};
export const platformQuestionId = "target_platform";
const question = "Which platforms should this game support?";
const pc = (): PlatformDecision => ({
  kind: "pc",
  targets: ["pc"],
  source: "default",
});

/** Only user-authored input changes this decision. Planner prose is never a source. */
export function requestedPlatform(
  source: string,
  previous: PlatformDecision = pc(),
): PlatformDecision {
  const positive = source.replace(
    /\b(?:no|without|do not add|don't add|do not support|don't support|not for|not)\s+[^.!?;]+/gi,
    "",
  );
  const targets: Platform[] = [];
  if (/\b(pc|desktop|keyboard|mouse)\b/i.test(positive)) targets.push("pc");
  if (/\b(mobile|phone|tablet|touchscreen|touch|tap)\b/i.test(positive))
    targets.push("mobile");
  if (
    /\b(?:console|gamepad|xbox|playstation)\b|\bcontroller\b(?!\s+(?:scripts?|to bind|owns)\b|\.client)/i.test(
      positive,
    )
  )
    targets.push("console");
  if (/\b(vr|virtual reality)\b/i.test(positive)) targets.push("vr");
  if (!targets.length) return previous;
  const ambiguous =
    /\b(maybe|perhaps|might|unsure|not sure|optionally|either)\b/i.test(
      positive,
    ) ||
    /\b(?:pc|desktop|mobile|phone|tablet|console|gamepad|controller|vr)\s+or\s+(?:pc|desktop|mobile|phone|tablet|console|gamepad|controller|vr)\b/i.test(
      positive,
    ) ||
    /\bmobile (?:enemies|targets|objects|units|platforms)\b/i.test(positive) ||
    /\b(?:debug|developer) console\b/i.test(positive) ||
    /\b(?:camera|character|movement) controller\b/i.test(positive) ||
    (/\b(?:touch|tap)\b/i.test(positive) &&
      !/\b(mobile|phone|tablet|touchscreen|touch (?:input|controls?|buttons?|support)|(?:support|enable) touch)\b/i.test(
        positive,
      ));
  if (ambiguous) return { ...previous, question };
  return {
    kind: targets.length === 1 && targets[0] === "pc" ? "pc" : "custom",
    targets,
    source: "request",
    sourceQuote: source.slice(0, 1200),
  };
}
export const initialPlatform = (request: string) => requestedPlatform(request);
export function updatedPlatform(
  p: Project,
  source?: string,
  answers = p.answers,
) {
  if (!p.platform) return undefined; // No retroactive migration of existing games.
  let next = source ? requestedPlatform(source, p.platform) : p.platform;
  if (next.question && answers[platformQuestionId])
    next = requestedPlatform(answers[platformQuestionId], next);
  return next;
}
export function platformLabel(p: PlatformDecision) {
  return p.kind === "pc"
    ? "PC · keyboard and mouse"
    : p.targets
        .map(
          (t) =>
            ({
              pc: "PC",
              mobile: "Mobile · touch",
              console: "Console · gamepad",
              vr: "VR",
            })[t],
        )
        .join(" + ");
}
export function platformInstructions(p: Pick<Project, "platform">) {
  if (!p.platform)
    return "This existing project has no platform decision. Preserve its existing controls and platform scope.";
  return p.platform.kind === "pc"
    ? "Saved target: PC, keyboard and mouse only. Do not add touch buttons, tap wording, gamepad/controller bindings, console/VR support or mobile layout work. Never copy device support from examples or asset scripts into the requirements. Only an explicit user platform decision can change this default." +
        (p.platform.question
          ? " Ask the pending platform question before approval."
          : "")
    : `Saved target platforms: ${p.platform.targets.join(", ")}. Implement only these platforms. Do not expand support from model-authored assumptions.`;
}
export function platformQuestion(p: Project): StructuredQuestion | undefined {
  if (!p.platform?.question) return;
  return {
    id: platformQuestionId,
    source: question,
    prompt: question,
    options: [
      {
        id: "pc",
        label: "PC · keyboard and mouse",
        description: "Use desktop keyboard and mouse controls only.",
      },
      {
        id: "mobile",
        label: "Mobile · touch",
        description: "Support phone and tablet touch controls.",
      },
      {
        id: "console",
        label: "Console · gamepad",
        description: "Support console gamepad controls.",
      },
    ],
    recommendedOptionId: "pc",
    recommendationReason:
      "PC with keyboard and mouse is the default. Use Other for VR or a specific combination.",
    allowOther: true,
  };
}
/** Catch the observed planning failure before it becomes an approved game requirement. */
export function platformPlanningIssues(
  p: Pick<Project, "platform">,
  value: unknown,
): string[] {
  if (p.platform?.kind !== "pc") return [];
  const strings = (v: unknown): string[] =>
    typeof v === "string"
      ? [v]
      : Array.isArray(v)
        ? v.flatMap(strings)
        : v && typeof v === "object"
          ? Object.entries(v)
              .filter(
                ([k]) =>
                  ![
                    "sourceQuote",
                    "question",
                    "questions",
                    "unresolved",
                  ].includes(k),
              )
              .flatMap(([, v]) => strings(v))
          : [];
  const invalid = strings(value).some((s) =>
    /\b(tap(?:ping)?|touchscreen|gamepad|mobile|VR)\b|\btouch (?:input|controls?|buttons?|support)|\bcontroller (?:support|bindings?|R\d|buttons?)|\bconsole (?:support|controls?|players?|version)/i.test(
      s.replace(
        /\b(?:no|without|do not add|don't add|do not support|don't support|not for|not)\s+[^.!?;]+/gi,
        "",
      ),
    ),
  );
  return invalid
    ? [
        "The saved platform is PC with keyboard and mouse only. Remove unrequested tap/touch wording, mobile layouts and controller/console/VR support from the plan. Keep the requested mechanic using keyboard and mouse.",
      ]
    : [];
}
