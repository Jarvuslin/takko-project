import type { Express } from "express";
import { z } from "zod";
import { AssetLibrary } from "./library";
import {
  marketplaceKindSchema,
  parseAssetReference,
  assetIdSchema,
} from "./types";

export function marketplaceRoutes(
  app: Express,
  library: AssetLibrary,
  transport: typeof fetch = fetch,
) {
  app.get("/api/marketplace/studios", async (_req, res) =>
    res.json({ studios: await library.provider.studios() }),
  );
  app.get("/api/marketplace/library", (req, res) =>
    res.json({
      assets: library.list(
        z.enum(["all", "liked", "saved"]).parse(req.query.filter ?? "all"),
      ),
    }),
  );
  app.post("/api/marketplace/search", async (req, res) => {
    const b = z
      .object({
        studioId: z.uuid(),
        query: z.string().min(1).max(200).refine(q=>!!q.trim()),
        kind: marketplaceKindSchema,
        cursor: z.string().min(1).max(4096).optional(),
      })
      .strict()
      .parse(req.body);
    const page = library.provider.searchPage
      ? await library.provider.searchPage(b.studioId, b.query, b.kind, b.cursor)
      : {
          assets: await library.provider.search(b.studioId, b.query, b.kind),
          nextCursor: undefined,
          total: undefined,
        };
    res.json({
      nextCursor: page.nextCursor,
      total: page.total,
      assets: page.assets.map((m) => ({
        ...library.remember(m),
        name: m.name,
        creatorName: m.creatorName,
        votes: m.votes,
      })),
    });
  });
  app.post("/api/marketplace/inspect", async (req, res) => {
    const b = z
      .object({ studioId: z.uuid(), reference: z.string().min(1).max(1000) })
      .strict()
      .parse(req.body);
    res.json(
      await library.inspect(b.studioId, parseAssetReference(b.reference)),
    );
  });
  app.patch("/api/marketplace/library/:id", (req, res) => {
    const patch = z
      .object({ liked: z.boolean().optional(), saved: z.boolean().optional() })
      .strict()
      .parse(req.body);
    res.json(library.preferences(assetIdSchema.parse(req.params.id), patch));
  });
  const thumbnails = new Map<string, { url: string; at: number }>();
  app.get("/api/marketplace/thumbnails", async (req, res) => {
    const ids = z
      .array(assetIdSchema)
      .min(1)
      .max(20)
      .parse(String(req.query.ids ?? "").split(","));
    const missing = ids.filter(
      (id) =>
        !thumbnails.has(id) || Date.now() - thumbnails.get(id)!.at > 600000,
    );
    if (missing.length) {
      try {
        const response = await transport(
          "https://thumbnails.roblox.com/v1/assets?assetIds=" +
            missing.join(",") +
            "&size=420x420&format=Png&isCircular=false",
          { signal: AbortSignal.timeout(8000), redirect: "error" },
        );
        if (response.ok) {
          const data = (await response.json()) as any;
          for (const row of data.data ?? []) {
            const id = String(row.targetId);
            let url: URL;
            try {
              url = new URL(row.imageUrl);
            } catch {
              continue;
            }
            if (
              ids.includes(id) &&
              row.state === "Completed" &&
              url.protocol === "https:" &&
              !url.username &&
              !url.password &&
              !url.port &&
              /(^|\.)rbxcdn\.com$/.test(url.hostname)
            )
              thumbnails.set(id, { url: url.href, at: Date.now() });
          }
        }
      } catch {
        /* Thumbnail availability never authorizes an asset or blocks search. */
      }
    }
    if (thumbnails.size > 1000)
      for (const id of [...thumbnails.keys()].slice(0, 500))
        thumbnails.delete(id);
    res.json(
      Object.fromEntries(
        ids.flatMap((id) =>
          thumbnails.has(id) ? [[id, thumbnails.get(id)!.url]] : [],
        ),
      ),
    );
  });
}
