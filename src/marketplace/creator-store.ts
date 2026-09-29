import { z } from "zod";
import { UpstreamError } from "../errors";
import {
  assetIdSchema,
  metadataSchema,
  type AssetMetadata,
  type MarketplaceKind,
} from "./types";

export type SearchPage = {
  assets: AssetMetadata[];
  nextCursor?: string;
  total?: number;
};
const types = { Model: 10, Animation: 10, MeshPart: 40, Audio: 3, Image: 13 };
const pageSchema = z.object({
  data: z.array(z.object({ id: z.number().int().positive().safe() })).max(100),
  nextPageCursor: z.string().max(4096).nullish(),
  totalResults: z.number().int().nonnegative().optional(),
});
const detailsSchema = z.object({
  data: z
    .array(
      z.object({
        asset: z.object({
          id: z.number().int().positive().safe(),
          name: z.string(),
          typeId: z.number(),
          updatedUtc: z.string().optional(),
        }),
        creator: z.object({ name: z.string() }),
        voting: z
          .object({
            showVotes: z.boolean(),
            upVotes: z.number().int().nonnegative(),
            downVotes: z.number().int().nonnegative(),
          })
          .optional(),
        fiatProduct: z.object({ isFree: z.boolean() }).optional(),
      }),
    )
    .max(100),
});

/** Public Roblox Toolbox search and batched details. Never reads browser cookies. */
export class CreatorStore {
  private cache = new Map<string, { at: number; value: SearchPage }>();
  private pending = new Map<string, Promise<SearchPage>>();
  constructor(private transport: typeof fetch = fetch) {}
  async search(
    query: string,
    kind: MarketplaceKind,
    cursor?: string,
  ): Promise<SearchPage> {
    const key = JSON.stringify([query, kind, cursor]);
    const hit = this.cache.get(key);
    if (hit && Date.now() - hit.at < 300000) return structuredClone(hit.value);
    let work = this.pending.get(key);
    if (!work) {
      work = this.load(query, kind, cursor)
        .then((value) => {
          if (this.cache.size >= 100)
            this.cache.delete(this.cache.keys().next().value!);
          this.cache.set(key, { at: Date.now(), value });
          return value;
        })
        .finally(() => this.pending.delete(key));
      this.pending.set(key, work);
    }
    return structuredClone(await work);
  }
  private async json(url: URL) {
    const response = await this.transport(url, {
      signal: AbortSignal.timeout(15000),
      redirect: "error",
    });
    if (!response.ok)
      throw new UpstreamError(
        `Creator Store returned HTTP ${response.status}. Try this search again.`,
      );
    return response.json();
  }
  private async load(
    query: string,
    kind: MarketplaceKind,
    cursor?: string,
  ): Promise<SearchPage> {
    const url = new URL(
      "https://apis.roblox.com/toolbox-service/v1/marketplace/" + types[kind],
    );
    url.searchParams.set(
      "keyword",
      kind === "Animation" ? query + " animation" : query,
    );
    url.searchParams.set("num", "30");
    url.searchParams.set("maxPrice", "0");
    if (cursor) url.searchParams.set("cursor", cursor);
    try {
      const page = pageSchema.parse(await this.json(url));
      const ids = [
        ...new Set(page.data.map((r) => assetIdSchema.parse(String(r.id)))),
      ];
      const detailsUrl = new URL(
        "https://apis.roblox.com/toolbox-service/v1/items/details",
      );
      detailsUrl.searchParams.set("assetIds", ids.join(","));
      const rows = ids.length
        ? detailsSchema.parse(await this.json(detailsUrl)).data
        : [];
      const byId = new Map(rows.map((r) => [String(r.asset.id), r]));
      const assets = ids.flatMap((id) => {
        const r = byId.get(id);
        // The source's free flag and actual type are required, even if search filters drift.
        if (
          !r ||
          r.fiatProduct?.isFree !== true ||
          r.asset.typeId !== types[kind]
        )
          return [];
        return [
          metadataSchema.parse({
            assetId: id,
            name: r.asset.name.slice(0, 200),
            kind: kind === "Animation" ? "Model" : kind,
            creatorName: r.creator.name.slice(0, 200),
            updated: r.asset.updatedUtc ?? "",
            ...(r.voting?.showVotes
              ? { votes: { up: r.voting.upVotes, down: r.voting.downVotes } }
              : {}),
          }),
        ];
      });
      return {
        assets,
        ...(page.nextPageCursor && page.nextPageCursor !== cursor
          ? { nextCursor: page.nextPageCursor }
          : {}),
        total: page.totalResults,
      };
    } catch (e) {
      if (e instanceof UpstreamError) throw e;
      throw new UpstreamError(
        "Creator Store search is unavailable. Try this search again.",
      );
    }
  }
}
