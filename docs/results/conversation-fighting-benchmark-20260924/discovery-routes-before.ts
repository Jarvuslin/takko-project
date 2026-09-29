import type { Express } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { GenerationStore } from "../generation/store";
import type { Engine } from "../generation/engine";
import { conceptCanPlan } from "../generation/concept";
import { appendTurn } from "../generation/conversation";
import { ConflictError, RequestError } from "../errors";
import { revisionKey, type AssetLibrary } from "./library";
import { assetSearches, type AssetDiscovery } from "./discovery";
import { assetIdSchema } from "./types";
import { animationPackSchema } from "./animations";
import { modelPreviewSchema } from "./preview";
import { refreshProposal } from "../generation/proposal";

export function discoveryRoutes(
  app: Express,
  store: GenerationStore,
  engine: Engine,
  library: AssetLibrary,
) {
  const revision = z.number().int().positive();
  const pending = engine.assetOperations;
  function current(id: string, rev: number, discoveryId?: string) {
    const p = store.get(id);
    const blocked = engine.mutationBlocker?.(id);
    if (blocked) throw new ConflictError(blocked);
    if (
      p.revision !== rev ||
      p.jobId ||
      (discoveryId && p.assetDiscovery?.id !== discoveryId)
    )
      throw new ConflictError(
        "The brief changed or work is running. Refresh these asset choices.",
      );
    return p;
  }
  async function exclusive<T>(id: string, run: () => Promise<T>) {
    if (pending.has(id))
      throw new ConflictError(
        "Asset work is already running. Wait for it to finish.",
      );
    pending.add(id);
    try {
      return await run();
    } finally {
      pending.delete(id);
    }
  }
  app.post("/api/projects/:id/approve-brief", (req, res) => {
    const b = z.object({ revision }).strict().parse(req.body);
    let p = current(req.params.id, b.revision);
    if (p.concept) {
      if (p.concept.revision !== p.revision || !conceptCanPlan(p.concept))
        throw new ConflictError(
          "Save your answers and update the brief before approving it.",
        );
      p = engine.acceptConcept(p.id, p.revision);
    }
    if (p.briefApprovedRevision !== p.revision) {
      p.briefApprovedRevision = p.revision;
      appendTurn(
        p,
        "user",
        "Approved brief. Review Marketplace choices before planning.",
      );
    }
    res.json(store.save(p));
  });
  app.post("/api/projects/:id/asset-options", async (req, res) => {
    const b = z
      .object({
        revision,
        studioId: z.uuid(),
        groupId: z.string().max(80).optional(),
        query: z.string().trim().min(1).max(200).optional(),
        refresh: z.boolean().optional(),
        cursor: z.string().min(1).max(4096).optional(),
        discoveryId: z.uuid().optional(),
      })
      .strict()
      .parse(req.body);
    res.json(
      await exclusive(req.params.id, async () => {
        const p = current(req.params.id, b.revision, b.discoveryId);
        if (p.assetDiscovery?.approved && !p.proposal)
          throw new ConflictError(
            "Change the brief before replacing approved asset choices.",
          );
        const prior =
          p.assetDiscovery?.revision === p.revision &&
          p.assetDiscovery.studioId === b.studioId
            ? p.assetDiscovery
            : undefined;
        if (prior && !b.groupId && !b.refresh) return p;
        const searches =
          prior?.groups ?? assetSearches(p).map((s) => ({ ...s, options: [] }));
        if (b.groupId && !searches.some((s) => s.id === b.groupId))
          throw new RequestError("Unknown asset group.");
        const paging = b.cursor !== undefined;
        const priorGroup = prior?.groups.find((g) => g.id === b.groupId);
        if (
          paging &&
          (!b.discoveryId ||
            !priorGroup ||
            priorGroup.nextCursor !== b.cursor ||
            (b.query && b.query !== priorGroup.query))
        )
          throw new ConflictError(
            "Search results changed. Refresh before loading more.",
          );
        const discovery: AssetDiscovery = {
          id: randomUUID(),
          revision: p.revision,
          studioId: b.studioId,
          groups: structuredClone(searches),
          ...(p.proposal
            ? {
                choices: structuredClone(prior?.choices ?? {}),
                pinned: prior?.pinned ?? [],
              }
            : {}),
        };
        // Serial searches avoid opening many Studio MCP processes at once. Each failure is retained.
        for (const group of discovery.groups) {
          if (b.groupId && group.id !== b.groupId) continue;
          group.query = b.query ?? group.query;
          if (!paging) {
            group.options = discovery.pinned?.includes(group.id)
              ? group.options.filter(
                  (o) => o.assetId === discovery.choices?.[group.id]?.assetId,
                )
              : [];
            delete group.nextCursor;
            delete group.total;
          }
          delete group.error;
          delete group.relevance;
          try {
            const page = library.provider.searchPage
              ? await library.provider.searchPage(
                  b.studioId,
                  group.query,
                  group.kind,
                  b.cursor,
                )
              : {
                  assets: await library.provider.search(
                    b.studioId,
                    group.query,
                    group.kind,
                  ),
                  nextCursor: undefined,
                  total: undefined,
                };
            const seen = new Set(group.options.map((a) => a.assetId));
            group.options.push(
              ...page.assets
                .filter((a) => {
                  if (a.kind !== group.kind || seen.has(a.assetId))
                    return false;
                  seen.add(a.assetId);
                  return true;
                })
                .map((a) => {
                  library.remember(a);
                  return a;
                }),
            );
            group.nextCursor = page.nextCursor;
            group.total = page.total;
          } catch (error) {
            group.error =
              error instanceof RequestError
                ? error.message
                : "Search failed. Check Studio and retry this search.";
          }
        }
        const latest = current(p.id, b.revision);
        latest.assetDiscovery = discovery;
        store.save(latest);
        const assessed = await engine.assessAssetChoices(
          latest.id,
          b.revision,
          b.groupId,
        );
        if (assessed.proposal) {
          const draft = assessed.assetDiscovery!;
          for (const group of draft.groups) {
            if (draft.pinned?.includes(group.id)) continue;
            const option =
              group.options.find(
                (o) => o.assetId === group.relevance?.candidateId,
              ) ?? (!group.relevance ? group.options[0] : undefined);
            if (!option) continue;
            try {
              const inspected = (
                await library.inspect(draft.studioId, option.assetId)
              ).asset;
              if (inspected.inspection?.status !== "no_issues_found") continue;
              let clipKey: string | undefined;
              if (group.preview === "animation") {
                if (!library.provider.animations) continue;
                const pack = animationPackSchema.parse(
                  await library.provider.animations(
                    draft.studioId,
                    inspected,
                    8,
                  ),
                );
                if (
                  pack.assetId !== option.assetId ||
                  pack.revisionKey !== revisionKey(inspected)
                )
                  continue;
                clipKey = pack.entries.find((e) => e.clip)?.key;
                if (!clipKey) continue;
                option.previewData = {
                  pack,
                  revisionKey: revisionKey(inspected),
                };
              }
              (draft.choices ??= {})[group.id] = {
                assetId: option.assetId,
                ...(clipKey ? { clipKey } : {}),
              };
            } catch {
              group.error =
                "Recommendation could not be inspected. The proposal remains saved.";
            }
          }
          current(assessed.id, b.revision, draft.id);
          refreshProposal(assessed, ["assets"]);
          store.save(assessed);
          if (
            draft.groups.length &&
            draft.groups.every(
              (g) =>
                draft.choices?.[g.id]?.assetId || draft.choices?.[g.id]?.skip,
            )
          ) {
            pending.delete(assessed.id);
            try {
              return await saveChoices(
                assessed.id,
                {
                  revision: b.revision,
                  discoveryId: draft.id,
                  choices: draft.choices!,
                },
                true,
              );
            } catch (error) {
              const retained = current(assessed.id, b.revision);
              retained.assetDiscovery!.analysisError =
                "Recommendations remain unresolved: " +
                (error as Error).message;
              return store.save(retained);
            }
          }
          return assessed;
        }
        return assessed;
      }),
    );
  });
  app.post("/api/projects/:id/defer-assets", (req, res) => {
    const b = z.object({ revision }).strict().parse(req.body);
    const p = current(req.params.id, b.revision);
    if (pending.has(p.id))
      throw new ConflictError("Wait for asset work to finish.");
    if (!p.proposal && p.briefApprovedRevision !== p.revision)
      throw new ConflictError("Approve the current brief first.");
    const next = engine.revise(
      p.id,
      p.revision,
      p.request,
      p.answers,
      (p.assetAttachments ?? []).filter(
        (a) => !p.assetChoiceAttachmentIds?.includes(a.assetId),
      ),
    );
    if (p.concept && conceptCanPlan(p.concept)) {
      next.concept = { ...p.concept, revision: next.revision };
      next.conceptAcceptedRevision = next.revision;
    }
    next.briefApprovedRevision = next.revision;
    next.assetChoiceAttachmentIds = [];
    const groups = assetSearches(p).map((g) => ({ ...g, options: [] }));
    next.assetDiscovery = {
      id: randomUUID(),
      revision: next.revision,
      studioId: "",
      groups,
      approved: true,
      choices: Object.fromEntries(groups.map((g) => [g.id, { skip: true }])),
    };
    appendTurn(
      next,
      "user",
      "Approved planning with asset discovery deferred. Requested assets remain in scope and unresolved.",
    );
    res.json(store.save(next));
  });
  app.post("/api/projects/:id/reopen-assets", (req, res) => {
    const b = z.object({ revision }).strict().parse(req.body);
    const p = current(req.params.id, b.revision);
    if (pending.has(p.id))
      throw new ConflictError("Wait for asset work to finish.");
    if (!p.assetDiscovery?.approved)
      throw new ConflictError("Asset choices are not approved yet.");
    const next = engine.revise(
      p.id,
      p.revision,
      p.request,
      p.answers,
      p.assetAttachments,
    );
    if (p.concept && conceptCanPlan(p.concept)) {
      next.concept = { ...p.concept, revision: next.revision };
      next.conceptAcceptedRevision = next.revision;
    }
    next.briefApprovedRevision = next.revision;
    // Empty deferred reviews must perform a fresh search when Studio becomes available.
    if (p.assetDiscovery.studioId)
      next.assetDiscovery = {
        ...p.assetDiscovery,
        id: randomUUID(),
        revision: next.revision,
        approved: false,
      };
    appendTurn(
      next,
      "user",
      "Reopened asset choices. Review and approve the updated choices before planning again.",
    );
    res.json(store.save(next));
  });
  app.post("/api/projects/:id/asset-preview", async (req, res) => {
    const b = z
      .object({
        revision,
        discoveryId: z.uuid(),
        groupId: z.string().max(80),
        assetId: assetIdSchema,
      })
      .strict()
      .parse(req.body);
    res.json(
      await exclusive(req.params.id, async () => {
        const p = current(req.params.id, b.revision, b.discoveryId);
        const discovery = p.assetDiscovery!;
        const group = discovery.groups.find((g) => g.id === b.groupId);
        const option = group?.options.find((a) => a.assetId === b.assetId);
        if (!option || !group)
          throw new RequestError(
            "Select an asset from the current search results.",
          );
        try {
          const metadata = await library.provider.metadata(
            discovery.studioId,
            b.assetId,
          );
          if (metadata.assetId !== b.assetId || metadata.kind !== option.kind)
            throw new ConflictError("The asset changed. Search again.");
          if (group.preview === "animation") {
            if (!library.provider.animations)
              throw new RequestError(
                "This connection cannot load animation previews.",
              );
            const pack = animationPackSchema.parse(
              await library.provider.animations(
                discovery.studioId,
                metadata,
                8,
              ),
            );
            if (pack.assetId !== b.assetId)
              throw new RequestError("The preview returned a different asset.");
            option.previewData = {
              pack,
              notice:
                "Previews load up to eight clips per pack. Use Marketplace to browse larger packs. Roblox permissions still apply when using animations in your game.",
            };
          } else if (group.preview === "model") {
            if (!library.provider.preview)
              throw new RequestError(
                "This connection cannot load model previews.",
              );
            option.previewData = {
              model: modelPreviewSchema.parse(
                await library.provider.preview(discovery.studioId, metadata),
              ),
            };
          } else {
            option.previewData = {
              notice:
                group.preview === "audio"
                  ? "Listen on the Creator Store page. Audio availability depends on Roblox permissions."
                  : "View the asset on its Creator Store page.",
            };
          }
          delete option.previewError;
          option.previewData.revisionKey = revisionKey(metadata);
        } catch (error) {
          option.previewError =
            error instanceof RequestError
              ? error.message
              : "Roblox could not load this preview. Try another option or open its Creator Store page.";
          delete option.previewData;
        }
        if (Buffer.byteLength(JSON.stringify(discovery)) > 16 * 1024 * 1024)
          throw new RequestError(
            "Asset previews exceed the 16 MB project limit. Search again with a smaller pack.",
          );
        const latest = current(p.id, b.revision, b.discoveryId);
        latest.assetDiscovery = discovery;
        refreshProposal(latest, ["assets"]);
        return store.save(latest);
      }),
    );
  });
  const choiceInput = z
    .object({
      revision,
      discoveryId: z.uuid(),
      choices: z.record(
        z.string().max(80),
        z
          .object({
            assetId: assetIdSchema.optional(),
            clipKey: z.string().max(1024).optional(),
            skip: z.boolean().optional(),
          })
          .strict(),
      ),
    })
    .strict();
  async function saveChoices(
    id: string,
    b: z.infer<typeof choiceInput>,
    approveOnly = false,
  ) {
    return exclusive(id, async () => {
      const p = current(id, b.revision, b.discoveryId);
      if (!p.proposal && p.briefApprovedRevision !== p.revision)
        throw new ConflictError("Approve the current brief first.");
      const discovery = p.assetDiscovery!;
      if (discovery.approved && !p.proposal)
        throw new ConflictError("These choices are already approved.");
      if (
        Object.keys(b.choices).length !== discovery.groups.length ||
        discovery.groups.some((g) => !b.choices[g.id])
      )
        throw new RequestError(
          "Choose an option or Find later for every asset group.",
        );
      const selected = new Map<
        string,
        { assetId: string; contentHash: string; usage: string }
      >();
      const receipts: string[] = [];
      for (const group of discovery.groups) {
        const choice = b.choices[group.id];
        if (choice.skip) {
          if (choice.assetId || choice.clipKey)
            throw new RequestError("A skipped group cannot select an asset.");
          receipts.push(group.label + ": find later");
          continue;
        }
        const option = group.options.find((a) => a.assetId === choice.assetId);
        if (!option)
          throw new RequestError(
            "Choose an asset from the current search results.",
          );
        const entry = choice.clipKey
          ? option.previewData?.pack?.entries.find(
              (e) => e.key === choice.clipKey && e.clip,
            )
          : undefined;
        if (group.preview === "animation" && !entry)
          throw new RequestError(
            "Preview and choose a playable animation clip first, or choose Find later.",
          );
        const inspected = (
          await library.inspect(discovery.studioId, option.assetId)
        ).asset;
        if (
          inspected.kind !== option.kind ||
          (p.proposal &&
            (!revisionKey(option) ||
              revisionKey(option) !== revisionKey(inspected))) ||
          (option.previewData?.revisionKey &&
            option.previewData.revisionKey !== revisionKey(inspected))
        )
          throw new ConflictError(
            "The asset changed since preview. Preview it again before approving.",
          );
        if (inspected.inspection?.status !== "no_issues_found")
          throw new RequestError(
            `${option.name} needs a source review. Choose another option or Find later.`,
          );
        if (
          entry &&
          option.previewData?.pack?.revisionKey !==
            (inspected.versionId
              ? "version:" + inspected.versionId
              : inspected.updated
                ? "updated:" + inspected.updated
                : "")
        )
          throw new ConflictError(
            "The animation changed since preview. Preview it again before approving.",
          );
        const usage = `${group.label}${entry ? `: clip ${entry.name} (${entry.animationId ? "rbxassetid://" + entry.animationId : "embedded key " + entry.key}), ${entry.clip!.rig}` : ""}`;
        const previous = selected.get(option.assetId);
        selected.set(option.assetId, {
          assetId: option.assetId,
          contentHash: inspected.inspection.contentHash,
          usage: [previous?.usage, usage]
            .filter(Boolean)
            .join(". ")
            .slice(0, 500),
        });
        receipts.push(usage + " · " + option.name + " #" + option.assetId);
      }
      const retained = (p.assetAttachments ?? []).filter(
        (a) =>
          !selected.has(a.assetId) &&
          !p.assetChoiceAttachmentIds?.includes(a.assetId),
      );
      if (retained.length + selected.size > 8)
        throw new RequestError(
          "This project supports eight attached assets. Remove an attachment or reuse an animation pack.",
        );
      const attachments = [
        ...retained,
        ...library.attachments([...selected.values()]),
      ];
      current(p.id, b.revision, b.discoveryId);
      pending.delete(p.id);
      const next = approveOnly
        ? p
        : engine.revise(p.id, p.revision, p.request, p.answers, attachments);
      if (approveOnly) next.assetAttachments = attachments;
      if (next.proposal)
        next.proposal.changed = [
          ...new Set([...(p.proposal?.changed ?? []), "assets" as const]),
        ];
      // Asset selection changes references, not the already approved game direction.
      if (p.concept && conceptCanPlan(p.concept)) {
        next.concept = { ...p.concept, revision: next.revision };
        next.conceptAcceptedRevision = next.revision;
      }
      next.briefApprovedRevision = next.revision;
      next.assetDiscovery = {
        ...discovery,
        revision: next.revision,
        approved: true,
        choices: b.choices,
        pinned: p.proposal
          ? [
              ...new Set([
                ...(discovery.pinned ?? []),
                ...Object.keys(b.choices).filter(
                  (id) =>
                    JSON.stringify(b.choices[id]) !==
                    JSON.stringify(discovery.choices?.[id]),
                ),
              ]),
            ]
          : discovery.pinned,
      };
      next.assetStudioId = discovery.studioId;
      next.assetChoiceAttachmentIds = [...selected.keys()];
      refreshProposal(next, ["assets"]);
      appendTurn(
        next,
        "user",
        (p.proposal
          ? "Saved inspected asset recommendations. "
          : "Approved asset choices. ") + receipts.join(". "),
      );
      return store.save(next);
    });
  }
  app.post("/api/projects/:id/approve-assets", async (req, res) => {
    res.json(await saveChoices(req.params.id, choiceInput.parse(req.body)));
  });
  return { saveChoices };
}
