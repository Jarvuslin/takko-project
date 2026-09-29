import { createHash } from "node:crypto";
import type { AssetNeed, AssetPipelineRun } from "./asset-contract";
import type { Project } from "./schema";

/** Content/dependency binding for reuse. Original runs and native receipts are never relabelled. */
export function assetDependencyHash(
  p: Project,
  need: AssetNeed,
): string | undefined {
  if (!p.proposal || !p.proposalPlan || !p.spec) return;
  const requirements = [
    need.requirementId,
    ...(need.intent?.relatedRequirementIds ?? []),
  ];
  const roots = p.spec.tasks.filter((t) =>
    t.requirements.some((id) => requirements.includes(id)),
  );
  const dependencies = new Set<string>();
  const visit = (id: string): boolean => {
    if (dependencies.has(id)) return true;
    const task = p.spec!.tasks.find((t) => t.id === id);
    if (!task) return false;
    dependencies.add(id);
    return task.dependsOn.every(visit);
  };
  if (!roots.every((t) => visit(t.id))) return;
  const tasks = p.spec.tasks.filter((t) => dependencies.has(t.id));
  for (const task of tasks)
    for (const id of task.requirements)
      if (!requirements.includes(id)) requirements.push(id);
  if (!tasks.length || tasks.some((t) => !p.proposalPlan!.tasks[t.id])) return;
  const sections = [
    ...new Set(tasks.flatMap((t) => p.proposalPlan!.tasks[t.id].sections)),
  ]
    .filter((s) => s !== "assets")
    .sort();
  const text = [
    need.role,
    need.query,
    need.constraints,
    ...p.spec.requirements
      .filter((r) => requirements.includes(r.id))
      .map((r) => r.description + " " + r.acceptance),
  ].join(" ");
  const groups =
    p.assetDiscovery?.groups.filter(
      (g) =>
        g.id === need.id ||
        g.label.toLowerCase() === need.role.toLowerCase() ||
        (p.assetDiscovery?.choices?.[g.id]?.assetId &&
          text.includes(p.assetDiscovery.choices[g.id].assetId!)),
    ) ?? [];
  const choices = groups.map((g) => [
    g.id,
    p.assetDiscovery!.choices?.[g.id],
    g.options.find(
      (o) => o.assetId === p.assetDiscovery!.choices?.[g.id]?.assetId,
    )?.previewData?.pack,
  ]);
  const ids = groups.map((g) => p.assetDiscovery!.choices?.[g.id]?.assetId);
  return createHash("sha256")
    .update(
      JSON.stringify({
        need,
        scope: p.scope,
        studio: p.assetStudioId,
        requirements: p.spec.requirements.filter((r) =>
          requirements.includes(r.id),
        ),
        tasks: tasks.map((t) => ({ ...t, files: undefined })),
        sections: sections.map((s) => [s, p.proposal![s]]),
        choices,
        attachments: p.assetAttachments?.filter((a) => ids.includes(a.assetId)),
      }),
    )
    .digest("hex");
}
export function bindAssetEvidence(p: Project, run: AssetPipelineRun) {
  if (!p.proposal || run.status !== "passed") return;
  for (const entry of run.entries.filter((e) => e.status === "passed")) {
    const need = run.needs.find((n) => n.id === entry.needId);
    const fingerprint = need && assetDependencyHash(p, need);
    if (fingerprint)
      (p.assetEvidenceBindings ??= {})[entry.needId] = {
        fingerprint,
        origin: entry.reusedFrom ?? {
          runId: run.runId,
          revision: run.revision,
          inputHash: run.inputHash,
        },
      };
  }
}
