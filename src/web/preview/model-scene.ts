import * as THREE from "three";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";
import type { ModelPreview } from "../../marketplace/preview";
import { robloxFrame } from "./native-animation";

function geometry(shape: ModelPreview["parts"][number]["shape"]) {
  if (shape === "Ball") return new THREE.SphereGeometry(0.5, 20, 12);
  if (shape === "Cylinder")
    return new THREE.CylinderGeometry(0.5, 0.5, 1, 20).rotateZ(Math.PI / 2);
  if (shape === "Wedge" || shape === "CornerWedge") {
    const points = [
      [-0.5, -0.5, -0.5],
      [0.5, -0.5, -0.5],
      [-0.5, -0.5, 0.5],
      [0.5, -0.5, 0.5],
      [0.5, 0.5, 0.5],
    ];
    if (shape === "Wedge") points.push([-0.5, 0.5, 0.5]);
    return new ConvexGeometry(points.map((p) => new THREE.Vector3(...p)));
  }
  return new THREE.BoxGeometry(1, 1, 1);
}

export function createModelScene(model: ModelPreview) {
  const root = new THREE.Group();
  // Bucket opacity into 16 levels to bound draw calls independently of part count.
  const groups = new Map<string, ModelPreview["parts"]>();
  for (const part of model.parts) {
    const key = part.shape + ":" + Math.round(part.transparency * 15);
    const group = groups.get(key) ?? [];
    group.push(part);
    groups.set(key, group);
  }
  for (const [key, parts] of groups) {
    const approximate = parts[0].shape === "approximate";
    const opacity = 1 - Number(key.split(":")[1]) / 15;
    const mesh = new THREE.InstancedMesh(
      geometry(parts[0].shape),
      new THREE.MeshStandardMaterial({
        wireframe: approximate,
        transparent: opacity < 1,
        opacity: Math.max(0.03, opacity),
        roughness: 0.8,
      }),
      parts.length,
    );
    mesh.name = key;
    parts.forEach((part, i) => {
      mesh.setMatrixAt(
        i,
        robloxFrame(part.frame).scale(new THREE.Vector3(...part.size)),
      );
      const color = new THREE.Color(...part.color);
      if (approximate) color.lerp(new THREE.Color("#efb45b"), 0.65);
      mesh.setColorAt(i, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingBox();
    mesh.computeBoundingSphere();
    root.add(mesh);
  }
  return { root };
}
