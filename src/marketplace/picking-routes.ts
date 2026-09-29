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
import { assetIdSchema } from "./types";
import { revisionKey, type AssetLibrary } from "./library";
import { animationPackSchema, studioAnimationPack } from "./animations";
import { assessEvidenceOptions } from "./relevance";
import { pickStatus } from "./pick-status";
import { modelPreviewSchema } from "./preview";

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
    }
  }
  function initialize(p: Project) {
    if (!p.assetDiscovery)
      p.assetDiscovery = {
        id: randomUUID(),
        revision: p.revision,
        studioId: "",
        groups: assetSearches(p).map((g) => ({ ...g, options: [] })),
        choices: {},
      };
    const d = p.assetDiscovery;
    d.revision = p.revision;
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
      const usage = `${g.label}${entry ? `: clip ${entry.name} (${entry.animationId ? "rbxassetid://" + entry.animationId : "embedded key " + entry.key}), ${entry.clip!.rig}` : ""}`;
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
  app.post("/api/projects/:id/asset-picks", (req, res) => {
    const b = base.strict().parse(req.body);
    const p = current(req.params.id, b.revision);
    if (engine.assetOperations.has(p.id))
      throw new ConflictError("Wait for asset work to finish.");
    initialize(p);
    res.json(store.save(p));
  });
  async function search(
    p: Project,
    groupId: string,
    studioId: string,
    query: string,
    cursor?: string,
  ) {
    const g = group(p, groupId),
      d = p.assetDiscovery!;
    const page = library.provider.searchPage
      ? await library.provider.searchPage(studioId, query, g.kind, cursor)
      : {
          assets: await library.provider.search(studioId, query, g.kind),
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
        const option = g.options.find((o) => o.assetId === b.assetId);
        if (!option)
          throw new RequestError(
            "Choose an asset from the current Marketplace results.",
          );
        const previous = d.choices?.[g.id];
        (d.choices ??= {})[g.id] = {
          assetId: b.assetId,
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
        (d.choices ??= {})[g.id] = { operation: "finding" };
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
