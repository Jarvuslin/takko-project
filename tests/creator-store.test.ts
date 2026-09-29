import { describe, it, expect, vi } from "vitest";
import { CreatorStore } from "../src/marketplace/creator-store";
const detail = (id: number, extra = {}) => ({
  asset: { id, name: "Dummy " + id, typeId: 10, updatedUtc: "2026-09-22" },
  creator: { name: "Creator" },
  fiatProduct: { isFree: true },
  voting: { showVotes: true, upVotes: 92, downVotes: 8 },
  ...extra,
});
describe("Creator Store source pages", () => {
  it("uses source cursors, batches details, caches and coalesces requests without limiting to three", async () => {
    const calls: string[] = [];
    const transport = vi.fn(async (input: any) => {
      const url = new URL(input);
      calls.push(url.href);
      if (url.pathname.endsWith("/details"))
        return Response.json({
          data: url.searchParams
            .get("assetIds")!
            .split(",")
            .map(Number)
            .map((id) => detail(id)),
        });
      const offset = url.searchParams.has("cursor") ? 30 : 0;
      return Response.json({
        data: Array.from({ length: 30 }, (_, i) => ({ id: offset + i + 1 })),
        nextPageCursor: offset ? null : "source-cursor",
        totalResults: 60,
      });
    }) as typeof fetch;
    const source = new CreatorStore(transport);
    const [first, also] = await Promise.all([
      source.search("dummy", "Model"),
      source.search("dummy", "Model"),
    ]);
    expect(first.assets).toHaveLength(30);
    expect(also).toEqual(first);
    expect(calls).toHaveLength(2);
    expect(first.assets[0].votes).toEqual({ up: 92, down: 8 });
    first.assets.length = 0;
    expect((await source.search("dummy", "Model")).assets).toHaveLength(30);
    const second = await source.search("dummy", "Model", "source-cursor");
    expect(second.assets[0].assetId).toBe("31");
    expect(second.nextCursor).toBeUndefined();
    expect(new URL(calls[2]).searchParams.get("cursor")).toBe("source-cursor");
    expect(calls).toHaveLength(4);
  });
  it("omits hidden votes and rejects paid, missing price proof, wrong types and unsolicited detail IDs", async () => {
    const source = new CreatorStore(
      vi.fn(async (input: any) =>
        Response.json(
          new URL(input).pathname.endsWith("/details")
            ? {
                data: [
                  detail(1, {
                    voting: { showVotes: false, upVotes: 1, downVotes: 0 },
                  }),
                  detail(2, { fiatProduct: { isFree: false } }),
                  detail(3, { fiatProduct: undefined }),
                  detail(4, { asset: { id: 4, name: "Audio", typeId: 3 } }),
                  detail(999),
                ],
              }
            : { data: [1, 2, 3, 4].map((id) => ({ id })) },
        ),
      ) as typeof fetch,
    );
    const page = await source.search("dummy", "Model");
    expect(page.assets).toHaveLength(1);
    expect(page.assets[0].votes).toBeUndefined();
  });
  it("preserves failures and does not automatically retry failed pages", async () => {
    const transport = vi.fn(async () => new Response("", { status: 429 }));
    await expect(
      new CreatorStore(transport).search("dummy", "Model"),
    ).rejects.toThrow("HTTP 429");
    expect(transport).toHaveBeenCalledTimes(1);
  });
});
