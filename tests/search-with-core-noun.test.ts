import { expect, it, vi } from "vitest";
import {
  coreNoun,
  searchWithCoreNoun,
} from "../src/marketplace/search-with-core-noun";
import type { AssetMetadata } from "../src/marketplace/types";

const asset = (assetId: string, name: string): AssetMetadata => ({
  assetId,
  name,
  kind: "Model",
  creatorName: "Fixture",
  updated: "v1",
});
const group = {
  query: "punching training dummy",
  preview: "model" as const,
  kind: "Model" as const,
};

it("broadens sparse matching listings to the core noun and deduplicates", async () => {
  const search = vi.fn(async (q: string) =>
    q === group.query
      ? {
          assets: [asset("1", "Training dummy"), asset("2", "House")],
          nextCursor: "original-page",
        }
      : {
          assets: [asset("1", "Training dummy"), asset("3", "Dummy")],
          nextCursor: "broader-page",
        },
  );
  const page = await searchWithCoreNoun(group, search);
  expect(search.mock.calls.map(([q]) => q)).toEqual([group.query, "dummy"]);
  expect(page.assets.map((a) => a.assetId)).toEqual(["1", "2", "3"]);
  expect(page.nextCursor).toBe("original-page");
});

it("does not broaden plentiful matches, a core noun query or pagination", async () => {
  const search = vi.fn(async () => ({
    assets: [1, 2, 3].map((i) => asset(String(i), "Dummy")),
  }));
  await searchWithCoreNoun(group, search);
  expect(search).toHaveBeenCalledTimes(1);
  search.mockClear();
  await searchWithCoreNoun({ ...group, query: "dummy" }, search);
  expect(search).toHaveBeenCalledTimes(1);
  search.mockClear();
  await searchWithCoreNoun(group, search, "page-2");
  expect(search).toHaveBeenCalledExactlyOnceWith(group.query, "page-2");
});

it("uses the subject rather than media type for sound and animation", () => {
  expect(coreNoun({ query: "punch hit sound", preview: "audio" })).toBe(
    "punch",
  );
  expect(
    coreNoun({ query: "punch attack animation", preview: "animation" }),
  ).toBe("punch");
});

it("retains original results and explains a failed broader search", async () => {
  const original = { assets: [asset("1", "Dummy")] };
  const search = vi
    .fn()
    .mockResolvedValueOnce(original)
    .mockRejectedValueOnce(new Error("Offline"));
  const page = await searchWithCoreNoun(group, search);
  expect(page.assets).toEqual(original.assets);
  expect(page.fallbackError).toContain('broader search for "dummy" failed');
});
