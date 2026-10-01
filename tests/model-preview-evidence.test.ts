import fs from "node:fs";
import { expect, it } from "vitest";
import * as THREE from "three";
import { createModelScene } from "../src/web/preview/model-scene";
import { modelPreviewSchema } from "../src/marketplace/preview";

it("renders captured geometry using instancing and distinguishes approximate surfaces", () => {
  const model = modelPreviewSchema.parse(
    JSON.parse(
      fs.readFileSync(
        "tests/fixtures/regression/asset-evidence-selection/model-preview-capture.json",
        "utf8",
      ),
    ),
  );
  const { root } = createModelScene(model);
  const meshes = root.children as THREE.InstancedMesh[];
  expect(meshes.every((m) => m.isInstancedMesh)).toBe(true);
  expect(meshes.reduce((n, m) => n + m.count, 0)).toBe(model.parts.length);
  const approximate = meshes.find((m) => m.name.startsWith("approximate"))!;
  expect((approximate.material as THREE.MeshStandardMaterial).wireframe).toBe(
    true,
  );
  expect(model.parts.some((p) => p.shape === "Wedge")).toBe(true);
  expect(model.parts.length).toBeGreaterThan(80);
  expect(Buffer.byteLength(JSON.stringify(model))).toBeLessThan(
    4 * 1024 * 1024,
  );
});
