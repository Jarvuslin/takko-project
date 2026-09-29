import {
  architectureSchema,
  type GameArchitecture,
} from "../generation/architecture";
import type { Project } from "../generation/schema";

export function projectGraph(project: Project): GameArchitecture {
  const saved = project.architecture,
    proposal = project.spec?.architectureProposal;
  if (!saved)
    return proposal ? layoutGraph(proposal) : { nodes: [], edges: [] };
  if (!proposal) return saved;
  const nodes = [
    ...saved.nodes,
    ...proposal.nodes.filter((n) => !saved.nodes.some((s) => s.id === n.id)),
  ];
  const edges = [
    ...saved.edges,
    ...proposal.edges.filter((e) => !saved.edges.some((s) => s.id === e.id)),
  ];
  const merged = architectureSchema.safeParse({ nodes, edges });
  return merged.success
    ? nodes.length === saved.nodes.length
      ? merged.data
      : layoutGraph(merged.data)
    : saved;
}

// A deterministic breadth-first layout. Cycles stay together without recursive traversal.
export function layoutGraph(graph: GameArchitecture): GameArchitecture {
  const ranks = new Map<string, number>();
  const roots = graph.nodes.filter(
    (n) => !graph.edges.some((e) => e.to === n.id),
  );
  const visit = (id: string) => {
    const queue = [id];
    ranks.set(id, 0);
    for (let i = 0; i < queue.length; i++) {
      const current = queue[i];
      for (const edge of graph.edges.filter((e) => e.from === current)) {
        if (!ranks.has(edge.to)) {
          ranks.set(edge.to, ranks.get(current)! + 1);
          queue.push(edge.to);
        }
      }
    }
  };
  for (const node of [...roots, ...graph.nodes])
    if (!ranks.has(node.id)) visit(node.id);
  const rows = new Map<number, number>();
  return {
    ...graph,
    nodes: graph.nodes.map((node) => {
      const rank = ranks.get(node.id) ?? 0,
        row = rows.get(rank) ?? 0;
      rows.set(rank, row + 1);
      return {
        ...node,
        x: 60 + (rank % 14) * 270,
        y: 70 + row * 155 + Math.floor(rank / 14) * 2000,
      };
    }),
  };
}

export function systemEvidence(project: Project, id: string) {
  const requirements =
    project.spec?.requirements.filter(
      (r) => r.sourceId === `architecture:node:${id}`,
    ) ?? [];
  const tasks =
    project.spec?.tasks.filter((t) =>
      requirements.some((r) => t.requirements.includes(r.id)),
    ) ?? [];
  const files = [...new Set(tasks.flatMap((t) => t.files))];
  const complete =
    tasks.length > 0 &&
    tasks.every((t) => project.completedBuildTasks?.includes(t.id));
  return {
    files,
    status: complete
      ? "Built · needs test"
      : tasks.length
        ? "Planned"
        : "Design",
    active:
      !!project.jobId &&
      tasks.some((t) => !project.completedBuildTasks?.includes(t.id)),
  };
}
