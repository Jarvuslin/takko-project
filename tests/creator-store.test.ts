import { describe, it, expect, vi } from "vitest";
import { CreatorStore } from "../src/marketplace/creator-store";
import recorded from "./fixtures/creator-store/target-dummy-v2-20260929.json";
import decals from "./fixtures/generalization/development/image-search-response.json";
it("maps image intent to the actual Creator Store Decal category", async()=>{
  const transport=vi.fn(async(_url:unknown,init:any)=>{
    expect(JSON.parse(init.body).searchCategoryType).toBe("Decal");
    return Response.json(decals.response);
  });
  const page=await new CreatorStore(transport).search("arrow","Image");
  expect(page.assets.length).toBeGreaterThan(0);
  expect(page.assets.every(a=>a.kind==="Image")).toBe(true);
});
describe("Creator Store website search", () => {
  it("replays the recorded target dummy v2 response in website order", async () => {
    const transport = vi.fn(async () => Response.json(recorded));
    const page = await new CreatorStore(transport).search(
      "target dummy",
      "Model",
    );
    const expected = recorded.creatorStoreAssets
      .filter(
        (r) =>
          r.asset.assetTypeId === 10 &&
          r.creatorStoreProduct.purchasePrice.quantity.significand === 0,
      )
      .map((r) => String(r.asset.id));
    expect(page.assets.map((a) => a.assetId)).toEqual(expected);
    expect(transport.mock.calls).toHaveLength(1);
    expect(page.nextCursor).toBe(recorded.nextPageToken);
    expect(page.assets[0].name).toBe(recorded.creatorStoreAssets[0].asset.name);
  });
  it("sends the exact typed query, performs one anonymous CSRF handshake, and coalesces/cache-copies pages", async () => {
    const transport = vi.fn(async (_url: unknown, init: any) =>
      init.headers["x-csrf-token"]
        ? Response.json(recorded)
        : new Response(null, {
            status: 403,
            headers: { "x-csrf-token": "offline-token" },
          }),
    );
    const store = new CreatorStore(transport);
    const [a, b] = await Promise.all([
      store.search("  target dummy  ", "Animation"),
      store.search("  target dummy  ", "Animation"),
    ]);
    expect(transport).toHaveBeenCalledTimes(2);
    expect(a).toEqual(b);
    expect(JSON.parse(transport.mock.calls[1][1].body)).toEqual({
      searchCategoryType: "Model",
      query: "  target dummy  ",
      maxPageSize: 50,
      searchView: "Core",
    });
    a.assets.length = 0;
    expect(
      (await store.search("  target dummy  ", "Animation")).assets.length,
    ).toBeGreaterThan(0);
    await store.search("  target dummy  ", "Animation", recorded.nextPageToken);
    expect(JSON.parse(transport.mock.calls[2][1].body).pageToken).toBe(
      recorded.nextPageToken,
    );
  });
  it("counts paid, unknown-price and wrong-type results without reordering accepted rows", async () => {
    const data = structuredClone(recorded) as any;
    data.creatorStoreAssets[0].creatorStoreProduct.purchasePrice.quantity.significand = 5;
    delete data.creatorStoreAssets[1].creatorStoreProduct;
    data.creatorStoreAssets[2].asset.assetTypeId = 3;
    data.creatorStoreAssets[3].voting.showVotes = false;
    const result = await new CreatorStore(async () =>
      Response.json(data),
    ).search("target dummy", "Model");
    expect(result.assets[0].assetId).toBe(
      String(data.creatorStoreAssets[3].asset.id),
    );
    expect(result.assets[0].votes).toBeUndefined();
    expect(result.filteredCount).toBe(3);
  });
  it("preserves failures and does not retry failed pages", async () => {
    const transport = vi.fn(async () => new Response(null, { status: 429 }));
    await expect(
      new CreatorStore(transport).search("dummy", "Model"),
    ).rejects.toThrow("HTTP 429");
    expect(transport).toHaveBeenCalledTimes(1);
  });
});
