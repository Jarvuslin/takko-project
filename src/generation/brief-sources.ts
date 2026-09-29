import type { Project } from "./schema";
import { architectureSources } from "./architecture";
export type SourceProject = Pick<Project, "request" | "answers"> &
  Partial<
    Pick<
      Project,
      | "briefChanges"
      | "architecture"
      | "concept"
      | "conceptAcceptedRevision"
      | "revision"
      | "proposal"
    >
  >;
export function requirementSources(p: SourceProject) {
  return [
    { id: "request", text: p.request, answerId: null as string | null },
    ...(p.briefChanges ?? []).map((change) => ({
      id: `message:${change.id}`,
      text: change.text,
      answerId: null as string | null,
    })),
    ...architectureSources(p.architecture),
    ...(p.proposal?.approval?.hash === p.proposal?.hash && p.proposal?.approval
      ? (["mechanics", "theme", "environment"] as const).map((id) => ({
          id: `proposal:${id}`,
          text: [p.proposal![id].text, ...p.proposal![id].assumptions].join(
            "\n",
          ),
          answerId: null as string | null,
        }))
      : []),
    ...(p.concept &&
    p.conceptAcceptedRevision !== undefined &&
    p.conceptAcceptedRevision === p.revision
      ? (p.concept.decisions ?? []).map((d, i) => ({
          id: `decision:${i}`,
          text: `${d.topic}: ${d.choice}`,
          answerId: null as string | null,
        }))
      : []),
    ...Object.entries(p.answers)
      .filter(([, value]) => value.trim())
      .map(([id, text]) => ({
        id: "answer:" + id,
        text,
        answerId: id,
      })),
  ];
}
