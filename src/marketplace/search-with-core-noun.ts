import type { AssetSearch } from "./discovery";
import type { AssetMetadata } from "./types";

type Page = {
  assets: AssetMetadata[];
  nextCursor?: string;
  total?: number;
  fallbackError?: string;
};

export function coreNoun(group: Pick<AssetSearch, "query" | "preview">) {
  const words = group.query.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const subject = words.filter(
    (w) =>
      !/^(animation|animations|pack|sound|sounds|sfx|audio|r6|r15)$/.test(w),
  );
  return group.preview === "audio" || group.preview === "animation"
    ? subject[0]
    : subject.at(-1);
}

/** Listing names are a free search hint, never proof of semantic relevance. */
export async function searchWithCoreNoun(
  group: Pick<AssetSearch, "query" | "preview" | "kind">,
  search: (query: string, cursor?: string) => Promise<Page>,
  cursor?: string,
  excluded: string[] = [],
): Promise<Page> {
  const page = await search(group.query, cursor);
  const noun = coreNoun(group);
  const matching = page.assets.filter(
    (a) =>
      a.kind === group.kind &&
      !excluded.includes(a.assetId) &&
      noun &&
      a.name.toLowerCase().includes(noun),
  );
  if (
    cursor ||
    !noun ||
    noun === group.query.trim().toLowerCase() ||
    matching.length >= 3
  )
    return page;
  let broader: Page;
  try {
    broader = await search(noun);
  } catch {
    return {
      ...page,
      fallbackError: `The broader search for "${noun}" failed. Original results are retained. Try searching again.`,
    };
  }
  const seen = new Set(page.assets.map((a) => a.assetId));
  return {
    ...page,
    assets: [
      ...page.assets,
      ...broader.assets.filter((a) => {
        if (seen.has(a.assetId)) return false;
        seen.add(a.assetId);
        return true;
      }),
    ],
  };
}
