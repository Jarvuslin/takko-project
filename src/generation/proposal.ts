import { structuredQuestionSchema } from "./questions";
import { isDeepStrictEqual } from "node:util";
import { createHash } from "node:crypto";
import { z } from "zod";
import { assetNeedSchema } from "./asset-contract";
import { ConflictError } from "../errors";
import { specSchema, type Project, type Spec } from "./schema";
import { assetNeedAuthoringIssues } from "./marketplace-policy";
import { worldChoiceSchema } from "./world-policy";
import { assetSearches } from "../marketplace/discovery";
import { assetNeedForGroup } from "../marketplace/asset-binding";
import { captureProposalPicks, needDefinition } from "../marketplace/proposal-picks";

export const sectionId = z.enum(["mechanics", "theme", "environment"]);
export type SectionId = z.infer<typeof sectionId>;
const section = z
  .object({
    text: z.string().trim().min(1).max(6000),
    assumptions: z.array(z.string().min(1).max(600)).max(12),
    unresolved: z.array(z.string().min(1).max(600)).max(12),
  })
  .strict();
export const proposalDraftSchema = z
  .object({
    title: specSchema.shape.title,
    questions: z.array(structuredQuestionSchema).max(36).optional(),
    world: worldChoiceSchema.optional(),
    assetNeeds: z.array(assetNeedSchema).max(16).optional(),
    mechanics: section,
    theme: section,
    environment: section,
  })
  .strict()
  .superRefine((proposal, ctx) => {
    for (const issue of assetNeedAuthoringIssues(proposal.assetNeeds ?? []))
      ctx.addIssue({ code: "custom", ...issue });
  });
export const proposalPatchSchema = z
  .object({
    world: worldChoiceSchema.optional(),
    assetNeeds: z.array(assetNeedSchema).max(16).optional(),
    questions: z.array(structuredQuestionSchema).max(36).optional(),
    baseRevision: z.number().int(),
    baseHash: z.string(),
    changes: z
      .array(z.object({ id: sectionId, value: section }).strict())
      .min(1)
      .max(3),
    summary: z.string().min(1).max(1200),
  })
  .strict();
export type Proposal = Omit<z.infer<typeof proposalDraftSchema>, "assetNeeds"> & {
  assetNeeds?: (z.infer<typeof assetNeedSchema> & { pick?: import("../marketplace/proposal-picks").ProposalPick })[];
  assetStateVersion?: 1;
  revision: number;
  hash: string;
  approval?: { hash: string; revision: number; at: string };
  changed: (SectionId | "assets")[];
  summary?: string;
};
export function proposalHash(p: Project) {
  const q = p.proposal;
  return createHash("sha256")
    .update(
      JSON.stringify([
        q && [
          q.title,
          q.mechanics,
          q.theme,
          q.environment,
          ...(q.questions ? [q.questions] : []),
          ...(q.assetNeeds ? [q.assetNeeds] : []),
        ],
        p.assetAttachments ?? [],
        ...(q?.assetStateVersion === 1 ? [] : [p.assetDiscovery?.choices ?? {},
        p.assetDiscovery?.groups.map((g) => [
          g.id,
          g.options
            .filter(
              (o) => o.assetId === p.assetDiscovery?.choices?.[g.id]?.assetId,
            )
            .map((o) => [
              o.assetId,
              o.versionId,
              o.updated,
              o.previewData?.revisionKey,
              o.previewData?.pack?.entries.find(
                (e) => e.key === p.assetDiscovery?.choices?.[g.id]?.clipKey,
              ),
            ]),
        ]) ?? []]),
        ...(p.world ? [p.world] : []),
        ...(p.platform ? [p.platform] : []),
        ...(p.rig ? [p.rig] : []),
        ...(p.excludedAssetIds?.length ? [p.excludedAssetIds] : []),
      ]),
    )
    .digest("hex");
}
export function refreshProposal(p: Project, changed: Proposal["changed"] = []) {
  if (!p.proposal) return;
  captureProposalPicks(p);
  const hash = proposalHash(p);
  if (hash !== p.proposal.hash) {
    p.proposal.approval = undefined;
    p.approvedRevision = null;
    p.proposal.changed = [...new Set([...p.proposal.changed, ...changed])];
  }
  p.proposal.hash = hash;
  p.proposal.revision = p.revision;
}
export function editScope(text: string): SectionId[] {
  const result: SectionId[] = [];
  if (/theme|style|colou?r|aesthetic|lighting|winter|summer/i.test(text))
    result.push("theme");
  if (
    /mechanic|combat|jump|fight|movement|damage|speed|rule|economy/i.test(text)
  )
    result.push("mechanics");
  if (/environment|layout|map|arena|terrain|place|room/i.test(text))
    result.push("environment");
  return result.length ? result : ["mechanics", "theme", "environment"];
}
export function applyProposalPatch(
  p: Project,
  raw: unknown,
  allowed: SectionId[],
) {
  const patch = proposalPatchSchema.parse(raw),
    q = p.proposal;
  if (
    !q ||
    patch.baseRevision !== p.revision ||
    patch.baseHash !== proposalHash(p)
  )
    throw new ConflictError(
      "This proposal changed. Review it before applying this edit.",
    );
  if (
    new Set(patch.changes.map((c) => c.id)).size !== patch.changes.length ||
    patch.changes.some((c) => !allowed.includes(c.id))
  )
    throw new ConflictError(
      "The edit replaces an unrelated or duplicate proposal section.",
    );
  if (
    (!patch.assetNeeds ||
      JSON.stringify(patch.assetNeeds) === JSON.stringify(q.assetNeeds)) &&
    patch.changes.every(
      (c) => JSON.stringify(c.value) === JSON.stringify(q[c.id]),
    )
  )
    throw new ConflictError(
      "The edit contains no content change. The saved proposal and approval are retained.",
    );
  const next = structuredClone(q);
  if (patch.questions) next.questions = patch.questions;
  if (patch.assetNeeds) {
    if (!allowed.includes("mechanics"))
      throw new ConflictError("Asset slot changes require a mechanics edit.");
    next.assetNeeds = patch.assetNeeds.map(n => {
      const previous = q.assetNeeds?.find(old => old.id === n.id);
      return previous && isDeepStrictEqual(needDefinition(previous), n) ? { ...n, pick: previous.pick } : n;
    });
  }
  for (const change of patch.changes) next[change.id] = change.value;
  let nextDiscovery = p.assetDiscovery;
  if (patch.assetNeeds && p.assetDiscovery) {
    const prior = p.assetDiscovery;
    const retained = new Map(prior.groups.flatMap(group => {
      const need = assetNeedForGroup({ spec: null, proposal: q }, group);
      return need && patch.assetNeeds!.some(n => isDeepStrictEqual(n, needDefinition(need)))
        ? [[need.id, group] as const] : [];
    }));
    const groups = assetSearches({ ...p, spec: null, proposal: next }).map(search =>
      retained.get(search.assetNeedId!) ?? { ...search, options: [] },
    );
    const retainedIds = new Set([...retained.values()].map(g => g.id));
    nextDiscovery = {
      ...prior,
      groups,
      choices: Object.fromEntries(Object.entries(prior.choices ?? {}).filter(([id]) => retainedIds.has(id))),
      pinned: prior.pinned?.filter(id => retainedIds.has(id)),
      approved: false,
      recommendationRevision: undefined,
      analysisError: undefined,
    };
  }
  p.proposal = next;
  if (patch.assetNeeds) {
    const removed = (q.assetNeeds ?? []).filter(old => !next.assetNeeds?.some(n => n.id === old.id && isDeepStrictEqual(needDefinition(old), needDefinition(n)))).map(n => n.pick?.assetId ?? n.selectedAssetId).filter(Boolean);
    p.assetAttachments = p.assetAttachments?.filter(a => !removed.includes(a.assetId));
  }
  p.assetDiscovery = nextDiscovery;
  p.revision++;
  p.proposal.summary = patch.summary;
  refreshProposal(p, [
    ...patch.changes.map((c) => c.id),
    ...(patch.assetNeeds ? ["assets" as const] : []),
  ]);
  if (p.assetDiscovery) p.assetDiscovery.revision = p.revision;
  p.stage = "draft";
}
export type ProposalPlan = {
  hash: string;
  revision: number;
  tasks: Record<
    string,
    { sections: (SectionId | "assets")[]; scenePaths: string[] }
  >;
};
export function affectedTasks(p: Project): string[] {
  if (!p.spec) return [];
  if (!p.proposalPlan || p.spec.tasks.some((t) => !p.proposalPlan!.tasks[t.id]))
    throw new ConflictError(
      "This saved build has no complete proposal dependency map. Files and evidence are retained. Broad regeneration requires an explicit new build decision.",
    );
  const changed = new Set(p.proposal?.changed ?? []);
  const affected = new Set(
    p.spec.tasks
      .filter((t) =>
        p.proposalPlan!.tasks[t.id].sections.some((s) => changed.has(s)),
      )
      .map((t) => t.id),
  );
  for (let i = 0; i < p.spec.tasks.length; i++)
    for (const task of p.spec.tasks)
      if (
        task.dependsOn.some((id) => affected.has(id)) ||
        p.spec.tasks.some(
          (other) =>
            affected.has(other.id) &&
            other.requirements.some((id) => task.requirements.includes(id)),
        )
      )
        affected.add(task.id);
  return [...affected];
}
export const scopedPlanSchema = z
  .object({
    tasks: specSchema.shape.tasks,
    requirements: specSchema.shape.requirements,
    visualDirection: specSchema.shape.visualDirection,
  })
  .strict();
export function mergeScopedPlan(
  p: Project,
  patch: z.infer<typeof scopedPlanSchema>,
  ids: string[],
): Spec {
  const before = p.spec!;
  const required = new Set(
    before.tasks
      .filter((t) => ids.includes(t.id))
      .flatMap((t) => t.requirements),
  );
  const exact = (a: string[], b: string[]) =>
    a.length === b.length &&
    new Set(a).size === a.length &&
    a.every((id) => b.includes(id));
  if (
    !exact(
      patch.tasks.map((t) => t.id),
      ids,
    ) ||
    !exact(
      patch.requirements.map((r) => r.id),
      [...required],
    )
  )
    throw Error(
      `A scoped plan must replace only the affected tasks and requirements, preserving their IDs. Expected tasks: ${ids.join(", ")}. Received tasks: ${patch.tasks.map((t) => t.id).join(", ") || "none"}. Expected requirements: ${[...required].join(", ")}. Received requirements: ${patch.requirements.map((r) => r.id).join(", ") || "none"}.`,
    );
  for (const task of patch.tasks) {
    const original = before.tasks.find((t) => t.id === task.id)!;
    if (
      !exact(task.files, original.files) ||
      !exact(task.requirements, original.requirements) ||
      !exact(task.dependsOn, original.dependsOn)
    )
      throw Error(
        `Task ${task.id}: This edit changes file ownership or contracts beyond the declared dependency set. A broader plan must be reviewed explicitly.`,
      );
    if (
      original.proposalSections?.some(
        (s) => !task.proposalSections?.includes(s),
      )
    )
      throw Error(
        `Task ${task.id}: A scoped edit cannot drop existing proposal dependencies: ${original.proposalSections.filter((s) => !task.proposalSections?.includes(s)).join(", ")}.`,
      );
  }
  return {
    ...before,
    visualDirection: patch.visualDirection,
    tasks: before.tasks.map((t) => patch.tasks.find((n) => n.id === t.id) ?? t),
    requirements: before.requirements.map(
      (r) => patch.requirements.find((n) => n.id === r.id) ?? r,
    ),
  };
}
/** Pure candidate validation. Task labels describe extra dependencies, not source coverage. */
export function proposalPlanFor(
  p: Project,
  spec: Spec,
): ProposalPlan | undefined {
  if (!p.proposal) return;
  const sourceSections = new Map<string, SectionId>();
  const errors: string[] = [];
  for (const section of sectionId.options) {
    const sourceId = `proposal:${section}`;
    for (const r of spec.requirements)
      if (r.sourceId === sourceId && r.origin === "user")
        sourceSections.set(r.id, section);
    const requirements = spec.requirements.filter(
      (r) =>
        r.sourceId === sourceId &&
        r.origin === "user" &&
        r.priority === "required",
    );
    if (!requirements.length)
      errors.push(
        `Missing proposal requirement coverage: ${sourceId}. Add a requirement owned by an existing or necessary task. If no separate implementation is needed, explicitly describe which existing approved content satisfies it without adding scope.`,
      );
    for (const requirement of requirements) {
      if (!spec.tasks.some((t) => t.requirements.includes(requirement.id)))
        errors.push(
          `Unowned proposal requirement: ${requirement.id} (${sourceId}).`,
        );
    }
  }
  if (errors.length) throw Error(errors.join("\n"));
  const assetRequirements = new Set(
    (spec.assetNeeds ?? []).flatMap((n) => [
      n.requirementId,
      ...(n.intent?.relatedRequirementIds ?? []),
    ]),
  );
  return {
    hash: p.proposal.hash,
    revision: p.revision,
    tasks: Object.fromEntries(
      spec.tasks.map((t) => [
        t.id,
        {
          sections: [
            ...new Set([
              ...(t.proposalSections ?? []),
              ...t.requirements.flatMap((id) =>
                sourceSections.has(id) ? [sourceSections.get(id)!] : [],
              ),
              ...(t.requirements.some((id) => assetRequirements.has(id))
                ? ["assets" as const]
                : []),
            ]),
          ],
          scenePaths: p.proposalPlan?.tasks[t.id]?.scenePaths ?? [],
        },
      ]),
    ),
  };
}
export function bindProposalPlan(p: Project) {
  if (!p.proposal || !p.spec) return;
  p.proposalPlan = proposalPlanFor(p, p.spec);
  p.proposal.changed = [];
}
