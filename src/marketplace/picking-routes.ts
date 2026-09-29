import { stepRetry } from "../generation/retry";
import type { Express } from "express";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import type { Engine } from "../generation/engine";
import type { GenerationStore } from "../generation/store";
import type { Project } from "../generation/schema";
import { ConflictError, RequestError } from "../errors";
import { refreshProposal } from "../generation/proposal";
import {
  DECISION_INPUT_ALLOWANCE,
  validateDecisionProfile,
} from "../generation/decisions";
import {
  assetSearches,
  type AssetDiscovery,
  type AssetOption,
} from "./discovery";
import { assetIdSchema, marketplaceKindSchema, type MarketplaceKind } from "./types";
import { skipProposalNeed, proposalNeed } from "./proposal-picks";
import { revisionKey, type AssetLibrary } from "./library";
import { animationPackSchema, studioAnimationPack } from "./animations";
import { assessEvidenceOptions } from "./relevance";
import { pickStatus } from "./pick-status";
import { modelPreviewSchema } from "./preview";
import { matchMessageAssets, normalizeNeeds } from "./normalize-needs";

/** Free browsing and durable picks. Only a current, explicit quote dispatches inference. */
export function pickingRoutes(
  app: Express,
  store: GenerationStore,
  engine: Engine,
  library: AssetLibrary,
) {
  const base = z.object({ revision: z.number().int().positive() });
  const quotes = new Map<
    string,
    {
      projectId: string;
      revision: number;
      discoveryId: string;
      groupId: string;
      cost: number;
      expires: number;
      fingerprint: string;
    }
  >();
  const fingerprint = (p: Project, g: AssetDiscovery["groups"][number]) =>
    createHash("sha256")
      .update(
        JSON.stringify([
          p.request,
          p.answers,
          p.assetDiscovery?.choices,
          g.query,
          g.options.map((o) => [o.assetId, o.updated, o.versionId]),
          p.excludedAssetIds,
          engine.config.read().routes.decisions,
          engine.config
            .read()
            .profiles.filter((p) =>
              engine.config.read().routes.decisions?.includes(p.id),
            ),
        ]),
      )
      .digest("hex");
  const current = (id: string, revision?: number) => {
    const p = store.get(id);
    const blocked = engine.mutationBlocker?.(id);
    if (blocked) throw new ConflictError(blocked);
    if (p.jobId || (revision !== undefined && p.revision !== revision))
      throw new ConflictError(
        "The project changed or work is running. Refresh before choosing an asset.",
      );
    return p;
  };
  async function exclusive<T>(id: string, run: () => Promise<T>) {
    if (engine.assetOperations.has(id))
      throw new ConflictError("Wait for the current asset check to finish.");
    engine.assetOperations.add(id);
    try {
      return await run();
    } finally {
      engine.assetOperations.delete(id);
      const p = store.get(id);
      if (!p.jobId && p.queuedMessages?.some(q => q.status === "queued")) void engine.applyQueuedChanges(id);
    }
  }
  function initialize(p: Project) {
    if (!p.assetDiscovery) matchMessageAssets(p);
    if (!p.assetDiscovery)
      p.assetDiscovery = {
        id: randomUUID(),
        revision: p.revision,
        studioId: "",
        groups: assetSearches(p).map((g) => ({ ...g, options: [] })),
        choices: {},
      };
    normalizeNeeds(p, id => library.get(id));
    const d = p.assetDiscovery;
    d.revision = p.revision;
    // Reuse inspected composer attachments. Binding is explicit planner output,
    // never a name/type guess. Unbound attachments remain visible in their own row.
    for (const a of p.assetAttachments ?? []) {
      if (p.excludedAssetIds?.includes(a.assetId)) continue;
      const needs = (p.spec?.assetNeeds ?? p.proposal?.assetNeeds ?? []).filter(
        (n) => n.selectedAssetId === a.assetId,
      );
      let targets = d.groups.filter((g) =>
        needs.some((n) => n.id === (g.assetNeedId ?? g.id)),
      );
      if (
        !targets.length &&
        !(p.spec?.assetNeeds ?? p.proposal?.assetNeeds)?.length &&
        !Object.values(d.choices ?? {}).some((c) => c.assetId === a.assetId)
      ) {
        const id = `attached_${a.assetId}`;
        let row = d.groups.find((g) => g.id === id);
        if (!row) {
          row = {
            id,
            label: a.usage || a.name,
            query: a.name,
            kind: a.kind,
            preview:
              a.kind === "Animation"
                ? "animation"
                : a.kind === "Audio"
                  ? "audio"
                  : a.kind === "Image"
                    ? "image"
                    : "model",
            options: [],
          };
          d.groups.push(row);
        }
        targets = [row];
      }
      for (const g of targets) {
        if (d.choices?.[g.id]) continue;
        const cached = library.get(a.assetId);
        if (!cached) continue;
        const { liked: _liked, saved: _saved, ...option } = cached;
        if (
          g.preview === "animation" &&
          ["Animation", "Model"].includes(option.kind)
        )
          g.kind = option.kind;
        if (!g.options.some((o) => o.assetId === a.assetId))
          g.options.push(option);
        (d.choices ??= {})[g.id] = {
          assetId: a.assetId,
          reason: "Chosen by you in chat. Static inspection only.",
        };
        try {
          library.attachments([
            { assetId: a.assetId, contentHash: a.contentHash, usage: a.usage },
          ]);
        } catch {
          d.choices[g.id].error =
            "This attachment needs current verification. Choose it again to check it.";
        }
        d.pinned = [...new Set([...(d.pinned ?? []), g.id])];
        p.assetChoiceAttachmentIds = [
          ...new Set([...(p.assetChoiceAttachmentIds ?? []), a.assetId]),
        ];
      }
    }
    for (const g of d.groups) {
      const c = d.choices?.[g.id];
      if (c?.operation && !engine.assetOperations.has(p.id)) {
        delete c.operation;
        c.error =
          "The previous asset check was interrupted. Choose the asset again to retry.";
      }
      let selected = g.options.find(
        (o) => o.assetId === d.choices?.[g.id]?.assetId,
      );
      // Legacy searches replaced the entire result page, including a saved pick.
      // Recover its actual cached listing without changing the choice or searching.
      if (!selected && c?.assetId) {
        const cached = library.get(c.assetId);
        if (cached) {
          const { liked: _liked, saved: _saved, ...option } = cached;
          selected = option;
          g.options.push(selected);
        }
      }
      if (selected && !selected.inspection) {
        const saved = library.get(selected.assetId);
        if (
          saved?.inspection &&
          (!selected.versionId || selected.versionId === saved.versionId)
        ) {
          selected.inspection = saved.inspection;
          selected.isFree ??= true; // Legacy discovery only admitted free listings.
        }
      }
    }
    return d;
  }
  function group(p: Project, id: string) {
    const g = initialize(p).groups.find((g) => g.id === id);
    if (!g)
      throw new RequestError(
        "This asset need no longer exists. Return to chat.",
      );
    return g;
  }
  function save(p: Project) {
    if (p.assetDiscovery?.studioId) p.assetStudioId = p.assetDiscovery.studioId;
    // Approval receives the same references already shown in the reviewed card.
    // Derive attachments now so approval does not introduce a second hash change.
    const selected = new Map<
      string,
      {
        assetId: string;
        contentHash: string;
        usage: string;
        acknowledgeInspectionLimitations?: boolean;
      }
    >();
    for (const g of p.assetDiscovery?.groups ?? []) {
      if (!pickStatus(p, g).canBuild) continue;
      const c = p.assetDiscovery!.choices![g.id],
        o = g.options.find((o) => o.assetId === c.assetId);
      if (!o?.inspection) continue;
      const entry = o.previewData?.pack?.entries.find(
        (e) => e.key === c.clipKey,
      );
      const sound = proposalNeed(p, g.id)?.pick?.sound;
      const usage = `${g.label}${sound ? `: sound ${sound.name} at ${sound.path}, rbxassetid://${sound.assetId}. Preview unavailable, playback requires Studio testing.` : ""}${entry ? `: clip ${entry.name} (${entry.animationId ? "rbxassetid://" + entry.animationId : "embedded key " + entry.key}), ${entry.clip!.rig}` : ""}`;
      selected.set(o.assetId, {
        assetId: o.assetId,
        contentHash: o.inspection.contentHash,
        usage: [selected.get(o.assetId)?.usage, usage]
          .filter(Boolean)
          .join(". ")
          .slice(0, 500),
        acknowledgeInspectionLimitations: c.acknowledgeInspectionLimitations,
      });
    }
    const retained = (p.assetAttachments ?? []).filter(
      (a) =>
        !selected.has(a.assetId) &&
        !p.assetChoiceAttachmentIds?.includes(a.assetId),
    );
    p.assetAttachments = [
      ...retained,
      ...library.attachments([...selected.values()]),
    ];
    p.assetChoiceAttachmentIds = [...selected.keys()];
    refreshProposal(p, ["assets"]);
    return store.save(p);
  }
  app.post("/api/projects/:id/asset-picks", async (req, res) => {
    const b = base
      .extend({ studioId: z.string().max(100).optional() })
      .strict()
      .parse(req.body);
    let p = current(req.params.id, b.revision);
    // Rendering a failed checkpoint must not revalidate and invalidate its input.
    if (stepRetry(p)) { res.json(p); return; }
    if (engine.assetOperations.has(p.id))
      throw new ConflictError("Wait for asset work to finish.");
    initialize(p);
    res.json(
      await exclusive(req.params.id, async () => {
        for (const g of p.assetDiscovery!.groups) {
          const c = p.assetDiscovery!.choices?.[g.id];
          const o = g.options.find((o) => o.assetId === c?.assetId);
          if (
            b.studioId &&
            c?.assetId &&
            !c.error &&
            o &&
            (!c.sourceReview || g.preview === "animation" && !o.previewData?.pack)
          ) {
            p = await verify(p, g, o, b.studioId);
          }
        }
        refreshProposal(p, ["assets"]);
        return store.save(p);
      }),
    );
  });
  async function search(
    p: Project,
    groupId: string,
    studioId: string,
    query: string,
    cursor?: string,
    kind?: MarketplaceKind,
  ) {
    const g = group(p, groupId),
      d = p.assetDiscovery!;
    const page = library.provider.searchPage
      ? await library.provider.searchPage(studioId, query, kind ?? g.kind, cursor)
      : {
          assets: await library.provider.search(studioId, query, kind ?? g.kind),
          nextCursor: undefined,
          total: undefined,
          filteredCount: 0,
        };
    current(p.id, p.revision);
    d.studioId = studioId;
    // Browsing never clears a saved pick, warning, or clip.
    const selected = g.options.find(
      (o) => o.assetId === d.choices?.[g.id]?.assetId,
    );
    const options = page.assets.map((a): AssetOption => {
      const known = g.options.find(
        (o) =>
          o.assetId === a.assetId &&
          !!a.updated &&
          o.updated === a.updated &&
          o.versionId === a.versionId,
      );
      const cached = library.get(a.assetId);
      return {
        ...known,
        ...a,
        isFree: a.isFree ?? true,
        inspection:
          known?.inspection ??
          (cached &&
          !!a.updated &&
          cached.updated === a.updated &&
          cached.versionId === a.versionId
            ? cached.inspection
            : undefined),
      };
    });
    for (const a of page.assets) library.remember(a);
    g.options = [...(cursor ? g.options : []), ...options].filter(
      (a, i, all) => all.findIndex((b) => b.assetId === a.assetId) === i,
    );
    if (selected)
      g.options = [
        selected,
        ...g.options.filter((a) => a.assetId !== selected.assetId),
      ];
    g.needQuery ??= g.query;
    g.query = query;
    g.nextCursor = page.nextCursor;
    g.total = page.total;
    return {
      project: store.save(p),
      assets: options,
      nextCursor: page.nextCursor,
      total: page.total,
      filteredCount: page.filteredCount ?? 0,
    };
  }
  app.post("/api/projects/:id/asset-picks/search", async (req, res) => {
    const b = base
      .extend({
        groupId: z.string().max(80),
        studioId: z.string().max(100),
        query: z
          .string()
          .min(1)
          .max(200)
          .refine((q) => !!q.trim()),
        cursor: z.string().max(4096).optional(),
        kind: marketplaceKindSchema.optional(),
      })
      .strict()
      .parse(req.body);
    res.json(
      await exclusive(req.params.id, () =>
        search(
          current(req.params.id, b.revision),
          b.groupId,
          b.studioId,
          b.query,
          b.cursor,
          b.kind,
        ),
      ),
    );
  });
  async function verify(
    p: Project,
    g: AssetDiscovery["groups"][number],
    option: AssetOption,
    studioId: string,
    keep = false,
  ) {
    const d = p.assetDiscovery!,
      c = d.choices![g.id];
    try {
      const studios = await library.provider.studios();
      if (!studioId || !studios.some((s) => s.id === studioId))
        throw new RequestError(
          "Studio isn't connected. Connect Studio, then choose this asset again.",
        );
      const inspected = (await library.inspect(studioId, option.assetId)).asset;
      if (
        (g.preview === "animation" || g.preview === "audio") &&
        ["Animation", "Model"].includes(inspected.kind)
      )
        g.kind = inspected.kind;
      if (
        inspected.kind !== g.kind ||
        inspected.isFree === false ||
        option.isFree === false
      )
        throw new RequestError(
          "This asset must be free and the right type. Choose another asset.",
        );
      const { liked: _liked, saved: _saved, ...verified } = inspected;
      Object.assign(option, verified, { isFree: true });
      if (!inspected.inspection)
        throw new RequestError(
          "Static inspection did not return a result. Choose this asset again to retry.",
        );
      const snapshot = library.sourceSnapshot(option.assetId);
      if (g.preview === "audio" && inspected.kind === "Model") {
        option.previewData = { ...option.previewData, sounds: (snapshot?.nodes ?? []).flatMap(node => {
          const match = node.className === "Sound" && node.soundId?.match(/^(?:rbxassetid:\/\/|https?:\/\/www\.roblox\.com\/asset\/?\?id=)([1-9]\d*)$/);
          return match && assetIdSchema.safeParse(match[1]).success ? [{ path: node.name, name: node.name.split(".").at(-1)!, assetId: match[1] }] : [];
        }) };
        if (!option.previewData.sounds?.length) throw new RequestError("This model has no captured sound IDs. Choose another asset or Skip for now.");
      }
      if (snapshot && inspected.inspection?.status !== "blocked") {
        store.save(p);
        await engine.reviewAttachedSources(p, g.id, snapshot, inspected.inspection!.contentHash);
      }
      if (g.preview === "animation") {
        if (!library.provider.animations)
          throw new RequestError(
            "This Studio connection cannot capture animation clips. Reconnect Studio and try again.",
          );
        const pack = studioAnimationPack(
          animationPackSchema.parse(
            await library.provider.animations(studioId, inspected, 100),
          ),
        );
        if (
          pack.assetId !== option.assetId ||
          pack.revisionKey !== revisionKey(inspected)
        )
          throw new RequestError(
            "The animation pack changed during capture. Choose it again to retry.",
          );
        option.previewData = { pack, revisionKey: revisionKey(inspected) };
        if (!pack.entries.some((e) => e.clip))
          throw new RequestError(
            "This pack has no playable captured clips. Choose another animation pack.",
          );
      } else {
        option.previewData = {
          ...option.previewData,
          revisionKey: revisionKey(inspected),
        };
        if (g.preview === "model" && library.provider.preview) {
          try {
            option.previewData.model = modelPreviewSchema.parse(
              await library.provider.preview(studioId, inspected),
            );
          } catch (error) {
            option.previewData.notice = (error as Error).message;
          }
        }
      }
      d.studioId = studioId;
      if (keep) {
        c.kept = true;
        c.acknowledgeInspectionLimitations = true;
      }
      delete c.error;
    } catch (error) {
      c.error = (error as Error).message;
      delete c.kept;
    } finally {
      delete c.operation;
    }
    current(p.id, p.revision);
    try {
      return save(p);
    } catch (error) {
      c.error = `Your pick was saved, but its attachment check failed: ${(error as Error).message} Choose this asset again to retry.`;
      delete c.kept;
      refreshProposal(p, ["assets"]);
      return store.save(p);
    }
  }
  app.post("/api/projects/:id/asset-picks/choose", async (req, res) => {
    const b = base
      .extend({
        groupId: z.string().max(80),
        assetId: assetIdSchema,
        studioId: z.string().max(100),
        keep: z.boolean().optional(),
      })
      .strict()
      .parse(req.body);
    res.json(
      await exclusive(req.params.id, async () => {
        const p = current(req.params.id, b.revision),
          g = group(p, b.groupId),
          d = p.assetDiscovery!;
        if (p.excludedAssetIds?.includes(b.assetId))
          throw new ConflictError("Excluded by you. Choose another asset.");
        let option = g.options.find((o) => o.assetId === b.assetId);
        if (!option) {
          const cached = library.get(b.assetId);
          if (cached) {
            const { liked: _liked, saved: _saved, ...listing } = cached;
            option = listing;
            g.options.push(option);
          }
        }
        if (!option)
          throw new RequestError(
            "Choose an asset from the current Marketplace results.",
          );
        const previous = d.choices?.[g.id];
        const need = (p.spec?.assetNeeds ?? p.proposal?.assetNeeds)?.find(n => n.id === g.id);
        if (need) need.selectedAssetId = b.assetId;
        (d.choices ??= {})[g.id] = {
          assetId: b.assetId,
          fromMessage: false,
          operation: "checking",
          ...(previous?.assetId === b.assetId && previous.clipKey
            ? { clipKey: previous.clipKey }
            : {}),
        };
        d.approved = false;
        d.pinned = [...new Set([...(d.pinned ?? []), g.id])];
        // Save the click independently of every verification/attachment step.
        refreshProposal(p, ["assets"]);
        store.save(p);
        return verify(p, g, option, b.studioId, b.keep);
      }),
    );
  });
  app.post("/api/projects/:id/asset-picks/skip", (req, res) => {
    const b = base.extend({ groupId: z.string().max(80) }).strict().parse(req.body);
    const p = current(req.params.id, b.revision);
    if (!skipProposalNeed(p, b.groupId)) throw new RequestError("This need no longer exists. Return to chat.");
    refreshProposal(p, ["assets"]);
    res.json(store.save(p));
  });
  app.post("/api/projects/:id/asset-picks/remove", (req, res) => {
    const b = base.extend({ groupId: z.string().max(80) }).strict().parse(req.body);
    const p = current(req.params.id, b.revision), g = group(p, b.groupId);
    const assetId = p.assetDiscovery!.choices?.[g.id]?.assetId;
    delete p.assetDiscovery!.choices?.[g.id];
    for (const n of [...(p.proposal?.assetNeeds ?? []), ...(p.spec?.assetNeeds ?? [])]) if (n.id === g.id || n.selectedAssetId === assetId) delete n.selectedAssetId;
    p.assetAttachments = p.assetAttachments?.filter(a => a.assetId !== assetId);
    p.assetDiscovery!.approved = false;
    refreshProposal(p, ["assets"]);
    res.json(store.save(p));
  });
  app.post("/api/projects/:id/asset-picks/clip", (req, res) => {
    const b = base
      .extend({
        groupId: z.string().max(80),
        assetId: assetIdSchema,
        clipKey: z.string().max(1024),
      })
      .strict()
      .parse(req.body);
    const p = current(req.params.id, b.revision),
      g = group(p, b.groupId),
      c = p.assetDiscovery!.choices?.[g.id];
    if (engine.assetOperations.has(p.id))
      throw new ConflictError("Wait for the asset check to finish.");
    const o = g.options.find((o) => o.assetId === b.assetId);
    if (
      c?.assetId !== b.assetId ||
      !o?.previewData?.pack?.entries.some((e) => e.key === b.clipKey && e.clip)
    )
      throw new ConflictError("Choose a playable clip from the selected pack.");
    c.clipKey = b.clipKey;
    delete c.error;
    res.json(save(p));
  });
  app.post("/api/projects/:id/asset-picks/sound", (req, res) => {
    const b = base.extend({ groupId: z.string().max(80), assetId: assetIdSchema, path: z.string().max(1024) }).strict().parse(req.body);
    const p = current(req.params.id, b.revision), g = group(p, b.groupId);
    const need = proposalNeed(p, b.groupId);
    const choice = p.assetDiscovery?.choices?.[g.id];
    const option = g.options.find(o => o.assetId === b.assetId);
    const sound = option?.previewData?.sounds?.find(s => s.path === b.path);
    if (!need?.pick || choice?.assetId !== b.assetId || !sound) throw new RequestError("Choose a captured sound from this asset.");
    need.pick.sound = sound;
    res.json(save(p));
  });
  app.post("/api/projects/:id/asset-picks/estimate", async (req, res) => {
    const b = base
      .extend({ groupId: z.string().max(80), studioId: z.string().max(100) })
      .strict()
      .parse(req.body);
    res.json(
      await exclusive(req.params.id, async () => {
        const p = current(req.params.id, b.revision),
          g = group(p, b.groupId);
        const settings = engine.config.read();
        const profile = settings.profiles.find(
          (m) => m.id === settings.routes.decisions?.[0],
        );
        if (!profile)
          throw new RequestError("Choose a relevance model in Presets first.");
        validateDecisionProfile(profile);
        const result = await search(p, g.id, b.studioId, g.query);
        const firstPage = {
          ...g,
          options: result.assets.filter(
            (a) => !p.excludedAssetIds?.includes(a.assetId),
          ),
        };
        let calls = 0;
        await assessEvidenceOptions(
          p,
          firstPage,
          async () => {
            calls++;
            return null;
          },
          undefined,
          true,
        );
        const cost = Math.ceil(
          calls * DECISION_INPUT_ALLOWANCE * profile.inputRate,
        );
        const remaining =
          p.budgetMicros -
          p.reservedMicros -
          p.charges.reduce((n, c) => n + c.chargedMicros, 0);
        if (cost > remaining)
          throw new RequestError(
            "The estimated relevance cost exceeds this project's remaining cap. Choose an asset manually.",
          );
        const token = randomUUID();
        if (quotes.size >= 100) {
          const oldest = quotes.keys().next().value!;
          quotes.delete(oldest);
          quoteOptions.delete(oldest);
        }
        quotes.set(token, {
          projectId: p.id,
          revision: p.revision,
          discoveryId: p.assetDiscovery!.id,
          groupId: g.id,
          cost,
          expires: Date.now() + 300000,
          fingerprint: fingerprint(p, g),
        });
        // The quote is bound to the exact first page, excluding user exclusions.
        quoteOptions.set(token, firstPage.options);
        return { project: result.project, token, estimatedMicros: cost, calls };
      }),
    );
  });
  const quoteOptions = new Map<string, AssetOption[]>();
  app.post("/api/projects/:id/asset-picks/auto", async (req, res) => {
    const b = base.extend({ token: z.uuid() }).strict().parse(req.body);
    res.json(
      await exclusive(req.params.id, async () => {
        const p = current(req.params.id, b.revision),
          q = quotes.get(b.token),
          options = quoteOptions.get(b.token);
        quotes.delete(b.token);
        quoteOptions.delete(b.token);
        if (
          !q ||
          !options ||
          q.projectId !== p.id ||
          q.revision !== p.revision ||
          q.discoveryId !== p.assetDiscovery?.id ||
          q.expires < Date.now()
        )
          throw new ConflictError(
            "This estimate expired. Request a new estimate before choosing for me.",
          );
        const g = group(p, q.groupId),
          d = p.assetDiscovery!;
        if (q.fingerprint !== fingerprint(p, g))
          throw new ConflictError(
            "The picks or search changed. Request a new estimate.",
          );
        if (
          q.cost >
          p.budgetMicros -
            p.reservedMicros -
            p.charges.reduce((n, c) => n + c.chargedMicros, 0)
        )
          throw new ConflictError(
            "The estimated cost now exceeds the remaining cap. Choose manually.",
          );
        g.options = options.filter(
          (o) => !p.excludedAssetIds?.includes(o.assetId),
        );
        (d.choices ??= {})[g.id] = { operation: "finding", fromMessage: false };
        d.approved = false;
        save(p);
        let assessed: Project;
        try {
          assessed = await engine.assessAssetChoices(
            p.id,
            p.revision,
            g.id,
            true,
          );
        } catch (error) {
          const latest = store.get(p.id),
            failed = latest.assetDiscovery!.choices![g.id];
          delete failed.operation;
          failed.error = (error as Error).message;
          return save(latest);
        }
        const nextGroup = group(assessed, g.id),
          choice = assessed.assetDiscovery!.choices![g.id];
        delete choice.operation;
        const match = nextGroup.options.find(
          (o) => o.assetId === nextGroup.relevance?.candidateId,
        );
        if (!match) {
          choice.reason =
            assessed.assetDiscovery?.analysisError ??
            "Nothing on this page is relevant. Choose an asset or try another search.";
          return save(assessed);
        }
        choice.assetId = match.assetId;
        choice.operation = "checking";
        choice.reason =
          "Best relevant match on this page, ranked by votes after the relevance check.";
        save(assessed);
        return verify(
          assessed,
          nextGroup,
          match,
          assessed.assetDiscovery!.studioId,
        );
      }),
    );
  });
}
