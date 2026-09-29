import fs from "node:fs";
import { expect, it, vi } from "vitest";
import { StudioMarketplace } from "../src/marketplace/studio";

it("retains real raw sibling clips when one embedded Animation has an invalid published identity", async () => {
  const captured = JSON.parse(
    fs.readFileSync(
      "docs/results/asset-evidence-selection-20260926/mixed-manifest-capture.json",
      "utf8",
    ),
  );
  const saved = JSON.parse(
    fs.readFileSync(
      "docs/results/opencode-step3-live-20260925/terminal-project.json",
      "utf8",
    ),
  );
  const metadata = saved.assetDiscovery.groups
    .flatMap((g: any) => g.options)
    .find((o: any) => o.assetId === "2801965424");
  const provider = new StudioMarketplace();
  const boundary = vi
    .spyOn(provider as any, "transferred")
    .mockImplementation(async (_studio, source: any) => {
      const index = Number(/if (-?\d+) < 0 then/.exec(source)?.[1]);
      const record = captured.find((r: any) => r.index === index);
      if (!record) throw Error("Unexpected read of invalid clip identity");
      return record.result;
    });
  vi.spyOn(provider, "metadata").mockResolvedValue(metadata);
  const pack = await provider.animations(
    saved.assetDiscovery.studioId,
    metadata,
    100,
  );
  expect(pack.entries[0].error).toMatch(/identity/i);
  expect(pack.entries[0].animationId).toBeUndefined();
  expect(pack.entries.slice(1).map((e) => e.clip?.duration)).toEqual(
    captured
      .filter((r: any) => r.index >= 1)
      .map((r: any) => r.result.duration),
  );
  expect(pack.entries.slice(1).map((e) => e.key)).toEqual(
    captured[0].result.entries.slice(1).map((e: any) => e.key),
  );
  expect(boundary).toHaveBeenCalledTimes(4);
});
