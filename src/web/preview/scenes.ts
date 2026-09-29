import * as THREE from "three";
import { r6, r15 } from "./rig";
import { sampleRotation, type AnimationClip } from "../../generation/animation";
import { robloxFrame, samplePose } from "./native-animation";
export type PreviewScene = {
  root: THREE.Object3D;
  bounds?: THREE.Box3;
  update?: (time: number) => void;
};
export type PreviewSceneFactory = () => PreviewScene;
export function createRigScene(clip: AnimationClip): PreviewScene {
  const root = new THREE.Group(),
    joints = new Map<string, THREE.Group>();
  const parts =
    clip.nativeRig?.map((p) => ({
      ...p,
      parent: p.parent === "HumanoidRootPart" ? undefined : p.parent,
      anchor: [0, 0, 0] as [number, number, number],
      center: [0, 0, 0] as [number, number, number],
    })) ?? (clip.rig === "R6" ? r6 : r15);
  const native = new Map(
    clip.nativeRig?.map((p) => [
      p.name,
      { c0: robloxFrame(p.c0), inverseC1: robloxFrame(p.c1).invert() },
    ]),
  );
  for (const part of parts) {
    const pivot = new THREE.Group();
    pivot.name = part.name;
    pivot.position.fromArray(part.anchor);
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(...part.size),
      new THREE.MeshStandardMaterial({
        color:
          part.name === "Head"
            ? 0xd8d4cc
            : /Torso/.test(part.name)
              ? 0x73757a
              : 0xb2b2b4,
        roughness: 0.8,
      }),
    );
    mesh.position.fromArray(part.center);
    pivot.add(mesh);
    (part.parent ? joints.get(part.parent)! : root).add(pivot);
    joints.set(part.name, pivot);
  }
  const update = (time: number) => {
    for (const [name, joint] of joints) {
      const offsets = native.get(name);
      if (offsets) {
        joint.matrixAutoUpdate = false;
        joint.matrix
          .copy(offsets.c0)
          .multiply(
            samplePose(clip.tracks.find((t) => t.joint === name)?.keys, time),
          )
          .multiply(offsets.inverseC1);
      } else joint.rotation.set(...sampleRotation(clip, name, time));
    }
    root.updateMatrixWorld(true);
  };
  const bounds = new THREE.Box3();
  const times = new Set([
    0,
    clip.duration,
    ...clip.tracks.flatMap((t) => t.keys.map((k) => k.time)),
  ]);
  for (let i = 0; i <= 60; i++) times.add((i * clip.duration) / 60);
  for (const t of times) {
    update(t);
    bounds.union(new THREE.Box3().setFromObject(root));
  }
  update(0);
  return { root, bounds, update };
}
export function disposeScene(root: THREE.Object3D) {
  const materials = new Set<THREE.Material>(),
    geometries = new Set<THREE.BufferGeometry>();
  root.traverse((object) => {
    if ((object as THREE.InstancedMesh).isInstancedMesh)
      (object as THREE.InstancedMesh).dispose();
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) geometries.add(mesh.geometry);
    if (mesh.material)
      for (const m of Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material])
        materials.add(m);
  });
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
}
