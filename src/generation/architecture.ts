import { z } from "zod";

const id = z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/);
export const architectureSchema = z
  .object({
    nodes: z
      .array(
        z
          .object({
            id,
            name: z.string().trim().min(1).max(80),
            purpose: z.string().trim().min(5).max(600),
            authority: z.enum(["server", "client", "shared"]),
            x: z.number().finite().min(0).max(4000),
            y: z.number().finite().min(0).max(4000),
          })
          .strict(),
      )
      .max(24),
    edges: z
      .array(
        z
          .object({
            id,
            from: id,
            to: id,
            event: z.string().trim().min(1).max(80),
            effect: z.string().trim().min(5).max(600),
            kind: z.enum(["event", "state"]),
          })
          .strict(),
      )
      .max(48),
  })
  .strict()
  .superRefine((graph, ctx) => {
    if (graph.nodes.length + graph.edges.length > 32)
      ctx.addIssue({
        code: "custom",
        message:
          "Use at most 32 systems and connections together so each can be planned and checked.",
      });
    const nodes = new Set(graph.nodes.map((n) => n.id));
    if (
      nodes.size !== graph.nodes.length ||
      new Set(graph.edges.map((e) => e.id)).size !== graph.edges.length
    )
      ctx.addIssue({
        code: "custom",
        message: `Each system and connection needs a unique ID. Duplicate systems: ${
          graph.nodes
            .filter(
              (n, i) =>
                graph.nodes.findIndex((other) => other.id === n.id) !== i,
            )
            .map((n) => n.id)
            .join(", ") || "none"
        }. Duplicate connections: ${
          graph.edges
            .filter(
              (e, i) =>
                graph.edges.findIndex((other) => other.id === e.id) !== i,
            )
            .map((e) => e.id)
            .join(", ") || "none"
        }.`,
      });
    for (const edge of graph.edges) {
      if (!nodes.has(edge.from) || !nodes.has(edge.to))
        ctx.addIssue({
          code: "custom",
          message: `Edge ${edge.id} references system '${[edge.from, edge.to].filter((id) => !nodes.has(id)).join("', '")}', which does not exist in this architecture.`,
        });
      if (edge.from === edge.to)
        ctx.addIssue({
          code: "custom",
          message: `Edge ${edge.id} connects ${edge.from} to itself. Internal lifecycle behaviour belongs on the system, not as an edge. Remove it.`,
        });
    }
    if (
      new Set(
        graph.edges.map(
          (e) => `${e.from}:${e.to}:${e.kind}:${e.event.toLowerCase()}`,
        ),
      ).size !== graph.edges.length
    )
      ctx.addIssue({
        code: "custom",
        message: `This event connection already exists. Conflicting edges: ${graph.edges
          .filter((e, i, all) =>
            all.some(
              (other, j) =>
                i !== j &&
                e.from === other.from &&
                e.to === other.to &&
                e.kind === other.kind &&
                e.event.toLowerCase() === other.event.toLowerCase(),
            ),
          )
          .map((e) => e.id)
          .join(", ")}.`,
      });
  });
export type GameArchitecture = z.infer<typeof architectureSchema>;
export function architectureSemantics(graph: GameArchitecture) {
  return JSON.stringify({
    nodes: [...graph.nodes]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((n) => [n.id, n.name, n.purpose, n.authority]),
    edges: [...graph.edges]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((e) => [e.id, e.from, e.to, e.event, e.effect, e.kind]),
  });
}
export function architectureSources(graph?: GameArchitecture) {
  if (!graph) return [];
  return [
    ...graph.nodes.map((n) => ({
      id: `architecture:node:${n.id}`,
      answerId: null,
      text: `System ${n.name} (${n.authority}): ${n.purpose}`,
    })),
    ...graph.edges.map((e) => ({
      id: `architecture:edge:${e.id}`,
      answerId: null,
      text: `${graph.nodes.find((n) => n.id === e.from)!.name} → ${graph.nodes.find((n) => n.id === e.to)!.name}, ${e.kind} "${e.event}": ${e.effect}`,
    })),
  ];
}
