import fs from "node:fs";
import path from "node:path";
import { createApp } from "../src/server/app";
import {
  assetChoiceBrief,
  studioId as fixtureStudio,
} from "../tests/browser/asset-choices-fixture";
const output = path.resolve("docs/results/asset-choices/live");
fs.mkdirSync(output, { recursive: true });
const app = createApp(path.resolve(".forge/asset-choices-live-data"), {
  env: {},
});
const server = app.listen(0, "127.0.0.1");
await new Promise<void>((r) => server.once("listening", r));
const origin = "http://127.0.0.1:" + (server.address() as any).port;
const report: Record<string, unknown> = {
  at: new Date().toISOString(),
  origin,
  cost: 0,
  fixtureStudioUsed: false,
};
try {
  const studios = await app.locals.assetLibrary.provider.studios();
  if (studios.length !== 1 || studios[0].id === fixtureStudio)
    throw Error("Need one real Studio for this read-only verification");
  report.studio = studios[0];
  async function post(action: string, body: unknown) {
    const r = await fetch(origin + "/api/" + action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) throw Error(data.error);
    return data;
  }
  let p = await post("projects", { request: assetChoiceBrief });
  p = await post(`projects/${p.id}/asset-options`, {
    revision: p.revision,
    studioId: studios[0].id,
  });
  fs.writeFileSync(
    path.join(output, "search.json"),
    JSON.stringify(p.assetDiscovery, null, 2),
  );
  console.log(
    "Live search",
    p.assetDiscovery.groups.map((g: any) => ({
      role: g.label,
      count: g.options.length,
      error: g.error,
    })),
  );
  for (const id of ["dummy", "combat"]) {
    const group = p.assetDiscovery.groups.find((g: any) => g.id === id);
    if (!group?.options.length) continue;
    const assetId = group.options[0].assetId;
    p = await post(`projects/${p.id}/asset-preview`, {
      revision: p.revision,
      discoveryId: p.assetDiscovery.id,
      groupId: id,
      assetId,
    });
    const option = p.assetDiscovery.groups.find((g: any) => g.id === id)
      .options[0];
    fs.writeFileSync(
      path.join(output, id + "-preview.json"),
      JSON.stringify(option, null, 2),
    );
    console.log(
      "Live preview",
      id,
      assetId,
      option.previewError ?? {
        parts: option.previewData?.model?.parts.length,
        clips: option.previewData?.pack?.entries.filter((e: any) => e.clip)
          .length,
      },
    );
  }
  report.projectId = p.id;
  report.paidCalls = p.charges.length;
  report.insertedAssets = 0;
  report.approved = false;
} catch (error) {
  report.error = String(error);
  process.exitCode = 1;
} finally {
  await new Promise<void>((r) => server.close(() => r()));
  report.serverClosed = true;
  fs.writeFileSync(
    path.join(output, "RESULTS.json"),
    JSON.stringify(report, null, 2),
  );
}
