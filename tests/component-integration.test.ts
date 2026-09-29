import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, expect, it } from "vitest";
import { integrationFixture } from "./component-integration.fixture";
import {
  componentBuilderContext,
  loadComponentIntegration,
  projectComponents,
  persistComponentIntegration,
} from "../src/generation/component-integration";
import { newProject } from "../src/generation/store";
import { validateBundle } from "../src/generation/validation";
import { exportBundle } from "../src/generation/export";
const dirs: string[] = [];
it("exports a meaningful need-bound root name without rewriting the retained archive or script sources", () => {
  const { directory, p, f } = setup();
  const original = loadComponentIntegration(directory, f.component);
  const reference = persistComponentIntegration(directory, {
    preparedHash: f.evidence.packetHash,
    evidence: f.evidence,
    review: f.review,
    need: f.need,
    scope: p.scope,
    conversionHash: f.component.conversionHash,
    comparison: f.comparison,
    instanceName: f.need.id,
  } as any);
  expect(reference.rootName).toBe(f.need.id);
  const renamed = loadComponentIntegration(directory, reference);
  expect(renamed.xml.xml).toContain(
    `<string name="Name">${f.need.id}</string>`,
  );
  expect(renamed.evidence.sourceBodies).toEqual(original.evidence.sourceBodies);
  expect(renamed.evidence.nodes).toEqual(original.evidence.nodes);
  expect(loadComponentIntegration(directory, f.component).xml).toEqual(
    original.xml,
  );
  expect(reference.recordHash).not.toBe(f.component.recordHash);
});
afterEach(() => {
  for (const dir of dirs.splice(0)) {
    const real = fs.realpathSync(dir);
    if (
      path.dirname(real) !== fs.realpathSync(os.tmpdir()) ||
      !path.basename(real).startsWith("takko-integration-test-")
    )
      throw Error("Unexpected cleanup");
    fs.rmSync(real, { recursive: true, force: true });
  }
});
function setup(runtimeTouch = false) {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "takko-integration-test-"),
  );
  dirs.push(directory);
  const p = newProject("Component integration fixture", 1000000);
  const f = integrationFixture(directory, p.scope, { runtimeTouch });
  p.assetPipeline = {
    version: 1,
    runId: "fixture",
    revision: p.revision,
    inputHash: f.evidence.inputHash,
    status: "passed",
    startedAt: "fixture",
    policy: {
      maxSearches: 2,
      maxCandidates: 3,
      allowEscalation: false,
      workerRoute: "fixture",
      evaluatorRoute: "fixture",
    },
    adapter: "fixture",
    needs: [f.need],
    entries: [
      {
        needId: f.need.id,
        status: "passed",
        attempts: 1,
        selected: {
          id: "101",
          name: "fixture",
          kind: "Model",
          creator: "fixture",
          source: "creator_store",
          sourceUrl: f.bundle.assets[0].sourceUrl,
          price: 0,
        },
        bundle: f.bundle,
        component: f.component,
        componentContextHash: f.evidence.inputHash,
      },
    ],
    events: [],
  };
  return { directory, p, f };
}
it("persists and revalidates model-selected line citations without rewriting the durable review", () => {
  const { directory, p, f } = setup();
  const review = structuredClone(f.review);
  const dependency = review.sources[0].dependencies[0];
  if (!("sourceQuote" in dependency)) throw Error("Expected quote fixture");
  const { sourceQuote: _quote, ...fields } = dependency;
  review.sources[0].dependencies[0] = {
    ...fields,
    sourceLines: { start: 2, end: 2 },
  };
  const reference = persistComponentIntegration(directory, {
    preparedHash: f.evidence.packetHash,
    evidence: f.evidence,
    review,
    need: f.need,
    scope: p.scope,
    conversionHash: f.conversionHash,
    comparison: f.comparison,
  });
  expect(reference.recordHash).not.toBe(f.component.recordHash);
  const loaded = loadComponentIntegration(directory, reference);
  expect(loaded.record.review).toEqual(review);
  expect(loaded.record.review.sources[0].dependencies[0]).not.toHaveProperty(
    "sourceQuote",
  );
  expect(loaded.evidence).toEqual(f.evidence);
  expect(
    loadComponentIntegration(directory, f.component).record.review,
  ).toEqual(f.review);
});
it("carries observed runtime-only touch evidence through archive reload, review and builder context", () => {
  const { directory, p, f } = setup(true);
  const evidence = projectComponents(p, directory)[0].evidence;
  expect(evidence.runtimeOnlyInstances).toEqual([
    {
      parentIndex: 4,
      name: "TouchInterest",
      className: "TouchTransmitter",
      reconstruction: "touch_listener_required_unverified",
    },
  ]);
  expect(evidence.nodes).toHaveLength(4);
  expect(evidence.sourceBodies).toEqual(f.evidence.sourceBodies);
  expect(componentBuilderContext(p, directory)[0].runtimeOnlyInstances).toEqual(
    evidence.runtimeOnlyInstances,
  );
  expect(evidence.boundary).toContain(
    "do not rely on preexisting marker objects",
  );
});
it("loads bound reviewed evidence, exposes exact retained context and exports original sources", () => {
  const { directory, p, f } = setup();
  const components = projectComponents(p, directory);
  expect(components).toHaveLength(1);
  const context = componentBuilderContext(p, directory)[0];
  expect(context.rootPath).toBe(`Workspace/${p.scope}/Assets/component/Model`);
  expect(context.sourceBodies).toEqual(f.evidence.sourceBodies);
  expect(context.requestedPlacement.position).toEqual([10, 2, 3]);
  expect(context.reference.runtimeVerification).toBe("not_performed");
  const result = exportBundle(
    f.bundle,
    p.scope,
    components.map((c) => c.xml),
  );
  expect(result).toContain("SoundScript2");
  expect(result).toContain("rbxassetid://123");
});
it.each([
  "revision",
  "status",
  "candidate",
  "need",
  "input",
  "scope",
  "reference",
  "record",
  "xml",
])("rejects changed %s binding before component export", (mode) => {
  const { directory, p, f } = setup();
  if (mode === "revision") p.revision++;
  if (mode === "status") p.assetPipeline!.status = "failed";
  if (mode === "candidate") p.assetPipeline!.entries[0].selected!.id = "999";
  if (mode === "need") p.assetPipeline!.needs[0].role = "changed";
  if (mode === "input") p.assetPipeline!.inputHash = "0".repeat(64);
  if (mode === "scope") p.scope = "Forge_Other";
  if (mode === "reference")
    p.assetPipeline!.entries[0].component!.rootName = "Changed";
  if (mode === "record")
    fs.appendFileSync(
      path.join(directory, f.component.recordHash + ".integration.json"),
      " ",
    );
  if (mode === "xml")
    fs.appendFileSync(path.join(directory, f.xmlHash + ".rbxmx"), " ");
  expect(() => projectComponents(p, directory)).toThrow();
});
it("does not certify a failed native comparison or a non-candidate source review", () => {
  const { directory, p, f } = setup();
  const args = {
    preparedHash: f.evidence.packetHash,
    evidence: f.evidence,
    review: f.review,
    need: f.need,
    scope: p.scope,
    conversionHash: f.conversionHash,
    comparison: f.comparison,
  };
  expect(() =>
    persistComponentIntegration(directory, {
      ...args,
      comparison: { ...f.comparison, passed: false },
    }),
  ).toThrow();
  expect(() =>
    persistComponentIntegration(directory, {
      ...args,
      review: { ...f.review, disposition: "needs_more_evidence" },
    }),
  ).toThrow("source/dependency");
});
it("rejects generated declarations within a retained component", () => {
  const { p, f } = setup();
  const bundle = {
    ...f.bundle,
    scene: [
      {
        path: f.component.destinationPath + "/NewPart",
        className: "Part",
        properties: {},
      },
    ],
  };
  expect(
    validateBundle(bundle, p).find((c) => c.id === "structure"),
  ).toMatchObject({
    status: "failed",
    detail: expect.stringContaining("overlaps"),
  });
});
it("rejects protected runtime Source writes in retained code even without an adaptation manifest", () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "takko-integration-test-"),
  );
  dirs.push(directory);
  expect(() =>
    integrationFixture(directory, "Forge_SourceGuard", {
      runtimeSourceWrite: true,
    }),
  ).toThrow(/Source/);
});
