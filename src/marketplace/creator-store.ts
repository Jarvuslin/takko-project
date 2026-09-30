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
  filteredCount?: number;
};
const types = { Model: 10, Animation: 10, MeshPart: 40, Audio: 3, Image: 13 };
const pageSchema = z.object({
  creatorStoreAssets: z
    .array(
      z.object({
        asset: z.object({
          id: z.number().int().positive().safe(),
          name: z.string(),
          assetTypeId: z.number(),
          updateTime: z.string().optional(),
          scriptCount: z.number().int().nonnegative().optional(),
        }),
        creator: z.object({ name: z.string() }),
        creatorStoreProduct: z
          .object({
            purchasePrice: z.object({
              quantity: z.object({
                significand: z.number(),
                exponent: z.number(),
              }),
            }),
          })
          .optional(),
        voting: z
          .object({
            showVotes: z.boolean(),
            upVotes: z.number().int().nonnegative(),
            downVotes: z.number().int().nonnegative(),
          })
          .optional(),
      }),
    )
    .max(100),
  nextPageToken: z.string().max(4096).nullish(),
  totalResults: z.number().int().nonnegative().optional(),
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
  private csrf = "";
  private async load(
    query: string,
    kind: MarketplaceKind,
    cursor?: string,
  ): Promise<SearchPage> {
    const url = "https://apis.roblox.com/toolbox-service/v2/assets:search";
    const body = JSON.stringify({
      searchCategoryType: kind === "Animation" ? "Model" : kind === "Image" ? "Decal" : kind,
      query,
      maxPageSize: 50,
      searchView: "Core",
      ...(cursor ? { pageToken: cursor } : {}),
    });
    const send = () =>
      this.transport(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.csrf ? { "x-csrf-token": this.csrf } : {}),
        },
        body,
        signal: AbortSignal.timeout(15000),
        redirect: "error",
      });
    try {
      let response = await send();
      // Roblox's anonymous CSRF handshake is the only automatic repeat.
      if (response.status === 403 && response.headers.get("x-csrf-token")) {
        this.csrf = response.headers.get("x-csrf-token")!;
        response = await send();
      }
      if (!response.ok)
        throw new UpstreamError(
          `Creator Store returned HTTP ${response.status}. Try this search again.`,
        );
      const page = pageSchema.parse(await response.json());
      const seen = new Set<string>();
      let filteredCount = 0;
      const assets = page.creatorStoreAssets.flatMap((row) => {
        const id = assetIdSchema.parse(String(row.asset.id));
        if (
          row.creatorStoreProduct?.purchasePrice.quantity.significand !== 0 ||
          row.asset.assetTypeId !== types[kind] ||
          seen.has(id)
        ) {
          filteredCount++;
          return [];
        }
        seen.add(id);
        return [
          metadataSchema.parse({
            assetId: id,
            name: row.asset.name.slice(0, 200),
            kind: kind === "Animation" ? "Model" : kind,
            creatorName: row.creator.name.slice(0, 200),
            updated: row.asset.updateTime ?? "",
            isFree: true,
            scriptCount: row.asset.scriptCount,
            ...(row.voting?.showVotes
              ? {
                  votes: { up: row.voting.upVotes, down: row.voting.downVotes },
                }
              : {}),
          }),
        ];
      });
      return {
        assets,
        filteredCount,
        total: page.totalResults,
        ...(page.nextPageToken && page.nextPageToken !== cursor
          ? { nextCursor: page.nextPageToken }
          : {}),
      };
    } catch (error) {
      if (error instanceof UpstreamError) throw error;
      throw new UpstreamError(
        "Creator Store search is unavailable. Try this search again.",
      );
    }
  }
}
