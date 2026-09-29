import { rankByVotes } from "./relevance";
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
import { assetIdSchema, type AssetMetadata } from "./types";
import {
  animationPackSchema,
  studioAnimationPack,
  animationTier,
} from "./animations";
import { modelPreviewSchema } from "./preview";
import { refreshProposal } from "../generation/proposal";
import { assetNeedForGroup } from "./asset-binding";
import { searchWithCoreNoun } from "./search-with-core-noun";
import { pickStatus } from "./pick-status";

// Search may expose only an update timestamp. Inspection can add a stronger
// version identity without changing the content that was listed.
function sameListedContent(listed: AssetMetadata, inspected: AssetMetadata) {
  return (
    listed.assetId === inspected.assetId &&
    listed.kind === inspected.kind &&
    (listed.versionId
      ? listed.versionId === inspected.versionId
      : !!listed.updated && listed.updated === inspected.updated)
  );
}

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
        if (
          prior?.recommendationRevision === p.revision &&
          !b.groupId &&
          !b.refresh
        ) return p;
        const finishRecommendations = !!(
          prior &&
          p.proposal &&
          !prior.approved &&
          !b.groupId &&
          !b.refresh
        );
        if (prior && !b.groupId && !b.refresh && !finishRecommendations)
          return p;
        const searches =
          prior?.groups.map((group) => {
            const need = assetNeedForGroup(p, group);
            return need ? { ...group, assetNeedId: need.id } : group;
          }) ?? assetSearches(p).map((s) => ({ ...s, options: [] }));
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
          recommendationRevision: p.revision,
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
          group.options = group.options.filter(o=>!p.excludedAssetIds?.includes(o.assetId));
          const savedChoice=discovery.choices?.[group.id]?.assetId;
          if(savedChoice && p.excludedAssetIds?.includes(savedChoice) && discovery.choices) {
            delete discovery.choices[group.id];
            discovery.pinned=discovery.pinned?.filter(id=>id!==group.id);
          }
          if (finishRecommendations && (group.options.length || group.error)) continue;
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
            const fetchPage = async (query: string, cursor?: string) => library.provider.searchPage
              ? await library.provider.searchPage(
                  b.studioId,
                  query,
                  group.kind,
                  cursor,
                )
              : {
                  assets: await library.provider.search(
                    b.studioId,
                    query,
                    group.kind,
                  ),
                  nextCursor: undefined,
                  total: undefined,
                };
            const page = await searchWithCoreNoun(group, fetchPage, b.cursor, p.excludedAssetIds);
            if (page.fallbackError) group.error = page.fallbackError;
            const seen = new Set(group.options.map((a) => a.assetId));
            let captured = 0;
            for (const a of rankByVotes(page.assets)) {
              if (a.kind !== group.kind || seen.has(a.assetId) || p.excludedAssetIds?.includes(a.assetId)) continue;
              seen.add(a.assetId);
              if (captured >= 10) {
                group.options.push(a);
                library.remember(a);
                continue;
              }
              captured++;
              if (group.preview === "animation") {
                // Metadata cannot distinguish authoring packs from game-ready clips.
                // Check before offering a choice, not after approval during a build.
                if (!library.provider.animations) continue;
                try {
                  const metadata = await library.provider.metadata(
                    b.studioId,
                    a.assetId,
                  );
                  if (
                    metadata.assetId !== a.assetId ||
                    metadata.kind !== a.kind
                  )
                    continue;
                  const pack = studioAnimationPack(
                    animationPackSchema.parse(
                      await library.provider.animations(
                        b.studioId,
                        metadata,
                        100,
                      ),
                    ),
                  );
                  if (
                    pack.assetId !== a.assetId ||
                    pack.revisionKey !== revisionKey(metadata) ||
                    !pack.entries.length
                  )
                    continue;
                  group.options.push({
                    ...metadata,
                    votes: a.votes ?? metadata.votes,
                    previewData: { pack, revisionKey: revisionKey(metadata) },
                  });
                } catch {
                  // Unknown availability is not a selectable animation. Search can be retried.
                  continue;
                }
              } else {
                const option: (typeof group.options)[number] = { ...a };
                if (group.preview === "model" && library.provider.preview) {
                  try {
                    const metadata = await library.provider.metadata(
                      b.studioId,
                      a.assetId,
                    );
                    if (
                      metadata.assetId !== a.assetId ||
                      metadata.kind !== a.kind
                    )
                      throw new Error("Asset changed");
                    option.previewData = {
                      model: modelPreviewSchema.parse(
                        await library.provider.preview(b.studioId, metadata),
                      ),
                      revisionKey: revisionKey(metadata),
                    };
                    option.versionId = metadata.versionId;
                    option.updated = metadata.updated;
                  } catch {
                    option.previewError =
                      "Geometry capture unavailable. Preview this option before choosing.";
                  }
                }
                group.options.push(option);
              }
              library.remember(a);
            }
            if (group.preview === "animation" && !group.options.length)
              group.error =
                "No mapped playable clips were found. Search for another animation or choose Find later.";
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
        if (b.groupId) refreshProposal(latest, ["assets"]);
        store.save(latest);
        // User-entered queries only browse listings. They never dispatch paid assessment.
        if (b.groupId) return latest;
        const assessed = await engine.assessAssetChoices(
          latest.id,
          b.revision,
          b.groupId,
        );
        if (assessed.assetDiscovery?.analysisError) return assessed;
        if (assessed.proposal) {
          const draft = assessed.assetDiscovery!;
            for (const group of draft.groups) {
              if (draft.pinned?.includes(group.id)) continue;
              if (group.preview === "animation" && !group.relevance?.clipKey && draft.choices)
                delete draft.choices[group.id];
            const option =
              group.options.find(
                (o) => o.assetId === group.relevance?.candidateId,
              ) ?? (!group.relevance ? group.options[0] : undefined);
            if (!option) continue;
            try {
              const inspected = (
                await library.inspect(draft.studioId, option.assetId)
              ).asset;
              option.inspectionLimitations = inspected.inspection?.limitations;
              if (inspected.inspection?.status !== "no_issues_found") continue;
              if (!sameListedContent(option, inspected)) continue;
              let clipKey: string | undefined;
              if (group.preview === "animation") {
                if (!library.provider.animations) continue;
                const pack = studioAnimationPack(
                  animationPackSchema.parse(
                    option.previewData?.pack?.revisionKey ===
                      revisionKey(inspected)
                      ? option.previewData.pack
                      : await library.provider.animations(
                          draft.studioId,
                          inspected,
                          100,
                        ),
                  ),
                );
                if (
                  pack.assetId !== option.assetId ||
                  pack.revisionKey !== revisionKey(inspected)
                )
                  continue;
                option.previewData = { pack, revisionKey: revisionKey(inspected) };
                clipKey = group.relevance?.clipKey;
                if (!clipKey) {
                  // A previous automatic recommendation is not a user's selection.
                  if (draft.choices) delete draft.choices[group.id];
                  continue;
                }
                if (
                  !pack.entries.some(
                    (e) => e.key === clipKey && animationTier(e) !== "unusable",
                  )
                )
                  continue;
                if (!clipKey) continue;
                option.previewData = {
                  pack,
                  revisionKey: revisionKey(inspected),
                };
              }
              option.versionId = inspected.versionId;
              option.updated = inspected.updated;
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
            const pack = studioAnimationPack(
              animationPackSchema.parse(
                await library.provider.animations(
                  discovery.studioId,
                  metadata,
                  100,
                ),
              ),
            );
            if (pack.assetId !== b.assetId)
              throw new RequestError("The preview returned a different asset.");
            option.previewData = {
              pack,
              notice:
                "Previews capture up to 100 clips per pack within transfer limits. Roblox permissions still apply when using animations in your game.",
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
          const inspected = (
            await library.inspect(discovery.studioId, option.assetId)
          ).asset;
          option.inspectionLimitations = inspected.inspection?.limitations;
          delete option.previewError;
          option.previewData.revisionKey = revisionKey(metadata);
          option.versionId = metadata.versionId;
          option.updated = metadata.updated;
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
            acknowledgeInspectionLimitations: z.boolean().optional(),
            kept: z.boolean().optional(),
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
      const discovery = structuredClone(p.assetDiscovery!);
      for (const [id, choice] of Object.entries(b.choices)) {
        const saved = p.assetDiscovery?.choices?.[id];
        if (saved?.assetId === choice.assetId && saved?.sourceReview) Object.assign(choice, { sourceReview: saved.sourceReview });
      }
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
        {
          assetId: string;
          contentHash: string;
          usage: string;
          acknowledgeInspectionLimitations?: boolean;
        }
      >();
      const receipts: string[] = [];
      for (const group of discovery.groups) {
        const choice = b.choices[group.id];
        if(choice.assetId && p.excludedAssetIds?.includes(choice.assetId)) throw new ConflictError("This asset is excluded for this project run.");
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
              (e) =>
                e.key === choice.clipKey && animationTier(e) !== "unusable",
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
          (p.proposal && !sameListedContent(option, inspected)) ||
          (option.previewData?.revisionKey &&
            option.previewData.revisionKey !== revisionKey(inspected) &&
            (group.preview === "animation" ||
              !sameListedContent(option, inspected)))
        )
          throw new ConflictError(
            "The asset changed since preview. Preview it again before approving.",
          );
        if (
          inspected.inspection?.status === "limited" &&
          (!option.previewData || !choice.acknowledgeInspectionLimitations)
        )
          throw new RequestError(
            "Inspection coverage is incomplete. Preview this asset and acknowledge its coverage limitation before choosing it.",
          );
        if (
          inspected.inspection?.status !== "no_issues_found" &&
          inspected.inspection?.status !== "limited" &&
          inspected.inspection?.status !== "review_required"
        )
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
        // Commit richer metadata only with the entire validated selection.
        option.versionId = inspected.versionId;
        option.updated = inspected.updated;
        option.inspection = inspected.inspection;
        option.isFree = inspected.isFree ?? option.isFree ?? true;
        const reviewed = { ...p, assetDiscovery: { ...discovery, choices: b.choices } };
        const readiness = pickStatus(reviewed, group);
        if (!readiness.canBuild)
          throw new RequestError(`${group.label}: ${readiness.reason ?? readiness.label}`);
        const usage = `${group.label}${entry ? `: clip ${entry.name} (${entry.animationId ? "rbxassetid://" + entry.animationId : "embedded key " + entry.key}), ${entry.clip!.rig}` : ""}`;
        const previous = selected.get(option.assetId);
        selected.set(option.assetId, {
          assetId: option.assetId,
          contentHash: inspected.inspection.contentHash,
          acknowledgeInspectionLimitations:
            choice.acknowledgeInspectionLimitations,
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
