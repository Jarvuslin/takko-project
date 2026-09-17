import { expect, it } from "vitest";
import { newProject } from "../src/generation/store";
import { validateBundle } from "../src/generation/validation";
import {
  isRetrievedAsset,
  isRetrievedMeshProperty,
  retrievedContentIds,
} from "../src/generation/asset-provenance";
import type { AssetPipelineRun } from "../src/generation/asset-contract";
import type { Bundle, Project } from "../src/generation/schema";
import { fixtureBundle, specification } from "./generation-fixtures";

// Private server-run state is explicitly seeded here; generated bundle metadata alone must never confer trust.
function fixture() {
  const project = newProject("Build a farming game with an orchard tree", 2e6);
  project.spec = specification(project.request, project.scope);
  const imported: Bundle = {
    files: [],
    coverage: [],
    scene: [
      {
        path: `Workspace/${project.scope}/Tree`,
        className: "MeshPart",
        properties: {
          MeshId: "rbxassetid://202",
          TextureID: "rbxassetid://303",
          Anchored: true,
        },
      },
    ],
    assets: [
      {
        id: "tree",
        requirementId: "core",
        kind: "mesh",
        status: "retrieved",
        assetId: "101",
        sourceUrl: "https://create.roblox.com/store/asset/101",
        description: "Exact export retained by server-owned asset run",
      },
    ],
  };
  const artifact = fixtureBundle(project.request, project.scope);
  artifact.scene.push(...structuredClone(imported.scene));
  artifact.assets.push(...structuredClone(imported.assets));
  project.artifact = artifact;
  const run: AssetPipelineRun = {
    version: 1,
    runId: "server-run",
    revision: project.revision,
    inputHash: "a".repeat(64),
    status: "passed",
    startedAt: "2026-09-15T00:00:00Z",
    finishedAt: "2026-09-15T00:00:02Z",
    policy: {
      maxSearches: 2,
      maxCandidates: 3,
      allowEscalation: false,
      workerRoute: "worker",
      evaluatorRoute: "reviewer",
    },
    adapter: "server-adapter",
    needs: [
      {
        id: "tree",
        requirementId: "core",
        role: "Orchard tree",
        kind: "MeshPart",
        query: "orchard tree",
        constraints: "Verified script-free mesh",
        required: true,
        position: [0, 0, 0],
        maxSize: 8,
      },
    ],
    entries: [
      {
        needId: "tree",
        status: "passed",
        attempts: 1,
        selected: {
          id: "101",
          name: "Tree",
          kind: "MeshPart",
          creator: "fixture",
          sourceUrl: "https://create.roblox.com/store/asset/101",
          price: 0,
          source: "creator_store",
        },
        bundle: structuredClone(imported),
      },
    ],
    events: [
      {
        at: "2026-09-15T00:00:01Z",
        needId: "tree",
        step: "place_result",
        data: {
          receipts: [
            {
              operation: "place",
              studioId: "bound-studio",
              data: { mocked: true },
            },
          ],
        },
      },
      {
        at: "2026-09-15T00:00:02Z",
        needId: "tree",
        step: "asset_released",
        data: { stillPresentInStudio: false },
      },
    ],
  };
  return { project, imported, artifact, run };
}
function failed(project: Project, bundle: Bundle) {
  return validateBundle(bundle, project).filter(
    (check) => check.status === "failed",
  );
}
it("rejects generated retrieved labels and MeshIds without private server-run provenance", () => {
  const { project, artifact } = fixture();
  expect(failed(project, artifact).map((check) => check.id)).toEqual(
    expect.arrayContaining([
      "structure",
      "asset:tree",
      "undeclared-asset:202",
      "undeclared-asset:303",
    ]),
  );
  expect(isRetrievedAsset(project, artifact.assets[0])).toBe(false);
});
it("accepts the exact retained export from the current completed server run, while retaining a final-game verification caveat", () => {
  const { project, artifact, run } = fixture();
  project.assetPipeline = run;
  expect(failed(project, artifact)).toEqual([]);
  expect(isRetrievedAsset(project, artifact.assets[0])).toBe(true);
  expect(retrievedContentIds(project)).toEqual(new Set(["202", "303"]));
  expect(
    validateBundle(artifact, project).find((check) => check.id === "asset:tree")
      ?.detail,
  ).toContain("full-game integration still requires its own checks");
});
it.each(["assetId", "description", "sourceUrl"] as const)(
  "rejects a forged retrieved asset's changed %s even alongside a genuine server receipt",
  (key) => {
    const { project, artifact, run } = fixture();
    project.assetPipeline = run;
    artifact.assets[0][key] =
      key === "assetId"
        ? "999"
        : key === "description"
          ? "Fabricated approval"
          : "https://example.test/fabricated";
    expect(failed(project, artifact).map((check) => check.id)).toContain(
      "asset:tree",
    );
  },
);
it.each([
  "missing",
  "running",
  "failed",
  "interrupted",
  "stale-revision",
  "failed-entry",
])("does not confer retrieved status from %s run state", (mode) => {
  const { project, artifact, run } = fixture();
  project.assetPipeline = run;
  if (mode === "missing") project.assetPipeline = null;
  else if (mode === "stale-revision") run.revision--;
  else if (mode === "failed-entry") run.entries[0].status = "failed";
  else run.status = mode as AssetPipelineRun["status"];
  expect(failed(project, artifact).map((check) => check.id)).toContain(
    "asset:tree",
  );
  expect(retrievedContentIds(project).size).toBe(0);
});
it.each(["mesh-id", "node-path", "class", "anchored", "texture"])(
  "rejects changing the trusted imported mesh's %s",
  (mutation) => {
    const { project, artifact, run } = fixture();
    project.assetPipeline = run;
    const node = artifact.scene.at(-1)!;
    if (mutation === "mesh-id") node.properties.MeshId = "rbxassetid://999";
    if (mutation === "node-path") node.path += "Forged";
    if (mutation === "class") node.className = "Part";
    if (mutation === "anchored") node.properties.Anchored = false;
    if (mutation === "texture") node.properties.TextureID = "rbxassetid://202";
    expect(
      isRetrievedMeshProperty(project, node, "MeshId", node.properties.MeshId),
    ).toBe(false);
    expect(failed(project, artifact).map((check) => check.id)).toContain(
      "structure",
    );
  },
);
it("does not authorize an arbitrary extra texture merely because one real asset was retrieved", () => {
  const { project, artifact, run } = fixture();
  project.assetPipeline = run;
  artifact.scene.at(-1)!.properties.TextureID = "rbxassetid://888";
  expect(failed(project, artifact).map((check) => check.id)).toContain(
    "undeclared-asset:888",
  );
});

it("rejects removing imported geometry or its acquisition record during a repair", () => {
  const { project, artifact, run } = fixture();
  project.assetPipeline = run;
  const removed = artifact.scene.pop()!;
  artifact.assets = [];
  expect(failed(project, artifact).map((c) => c.id)).toEqual(
    expect.arrayContaining([
      "asset-integrity:" + removed.path,
      "asset-provenance:tree",
    ]),
  );
});
it("retains the resolved native image ID independently of the Creator Store candidate ID", () => {
  const { project, run } = fixture();
  project.assetPipeline = run;
  run.entries[0].bundle!.scene.push({
    path: `Workspace/${project.scope}/ImagePanel/Decal`,
    className: "Decal",
    properties: { Texture: "https://www.roblox.com/asset/?id=404" },
  });
  expect(retrievedContentIds(project)).toContain("404");
  expect(retrievedContentIds(project)).not.toContain("101");
});
