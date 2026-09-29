import * as THREE from "three";
import type { AnimationClip } from "../../generation/animation";
type Key = AnimationClip["tracks"][number]["keys"][number];
/** Standard easing approximations. Roblox engine playback remains the final authority. */
export function poseEase(t: number, key: Key): number {
  if (key.easing === "Constant") return t < 1 ? 0 : 1;
  const bounce = (x: number): number => {
    if (x < 1 / 2.75) return 7.5625 * x * x;
    if (x < 2 / 2.75) return 7.5625 * (x -= 1.5 / 2.75) * x + 0.75;
    if (x < 2.5 / 2.75) return 7.5625 * (x -= 2.25 / 2.75) * x + 0.9375;
    return 7.5625 * (x -= 2.625 / 2.75) * x + 0.984375;
  };
  const inward = (x: number) => {
    switch (key.easing) {
      case "Cubic":
      case "CubicV2":
        return x ** 3;
      case "Bounce":
        return 1 - bounce(1 - x);
      case "Elastic":
        return x === 0 || x === 1
          ? x
          : -(2 ** (10 * x - 10)) *
              Math.sin((x * 10 - 10.75) * ((2 * Math.PI) / 3));
      default:
        return x;
    }
  };
  if (key.direction === "Out") return 1 - inward(1 - t);
  if (key.direction === "InOut")
    return t < 0.5 ? inward(t * 2) / 2 : 1 - inward((1 - t) * 2) / 2;
  return inward(t);
}
export function robloxFrame(c: number[]) {
  return new THREE.Matrix4().set(
    c[3],
    c[4],
    c[5],
    c[0],
    c[6],
    c[7],
    c[8],
    c[1],
    c[9],
    c[10],
    c[11],
    c[2],
    0,
    0,
    0,
    1,
  );
}
export function samplePose(
  keys: Key[] | undefined,
  time: number,
): THREE.Matrix4 {
  if (!keys?.length) return new THREE.Matrix4();
  const next = keys.findIndex((k) => k.time >= time);
  const a = keys[next > 0 ? next - 1 : next === 0 ? 0 : keys.length - 1];
  const b = next > 0 ? keys[next] : a;
  const t = a === b ? 0 : poseEase((time - a.time) / (b.time - a.time), a);
  const rotation = (key: Key) =>
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...key.rotation));
  const q = rotation(a).slerp(rotation(b), t);
  const p = new THREE.Vector3(...(a.position ?? [0, 0, 0])).lerp(
    new THREE.Vector3(...(b.position ?? [0, 0, 0])),
    t,
  );
  const weight = (a.weight ?? 1) + ((b.weight ?? 1) - (a.weight ?? 1)) * t;
  const weighted = new THREE.Quaternion().slerp(
    q,
    Math.max(0, Math.min(1, weight)),
  );
  return new THREE.Matrix4().compose(
    p.multiplyScalar(weight),
    weighted,
    new THREE.Vector3(1, 1, 1),
  );
}
