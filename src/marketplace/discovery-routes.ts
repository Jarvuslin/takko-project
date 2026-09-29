import { rankByVotes } from "./relevance";
import type { Express } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { GenerationStore } from "../generation/store";
import type { Engine } from "../generation/engine";
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
          return assessed;
        }
        return assessed;
      }),
    );
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
}
