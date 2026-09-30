import { Matrix4, Vector3, Quaternion, Euler } from "three";
import type { AnimationClip } from "../generation/animation";
import type { NativeRoles } from "./role-capture";

/** Proposed boundaries from captured frames, never proof of punch gameplay.
 * Only labeled R6 sequences with complete native joints are eligible.
 */
export function punchSegments(clip: AnimationClip, sequence: NativeRoles["sequences"][number]) {
  if (clip.rig !== "R6" || !clip.nativeRig || sequence.poseDigest !== clip.sourcePoseDigest) return;
  const hits = sequence.frames.filter(frame => /^(Dmg|Heavy)$/.test(frame.name));
  if (!hits.length || sequence.loop) return;
  const frame = (c: number[]) => new Matrix4().set(c[3], c[4], c[5], c[0], c[6], c[7], c[8], c[1], c[9], c[10], c[11], c[2], 0, 0, 0, 1);
  const fistZ = (time: number, arm: string) => {
    const matrices = new Map([["HumanoidRootPart", new Matrix4()]]);
    for (const part of clip.nativeRig!) {
      const key = clip.tracks.find(t => t.joint === part.name)?.keys.find(k => Math.abs(k.time - time) < 1e-6);
      if (!key || (key.weight ?? 1) !== 1 || !matrices.has(part.parent)) return;
      const pose = new Matrix4().compose(new Vector3(...(key.position ?? [0, 0, 0])), new Quaternion().setFromEuler(new Euler(...key.rotation)), new Vector3(1, 1, 1));
      matrices.set(part.name, matrices.get(part.parent)!.clone().multiply(frame(part.c0)).multiply(pose).multiply(frame(part.c1).invert()));
    }
    const part = clip.nativeRig!.find(p => p.name === arm), matrix = matrices.get(arm);
    return part && matrix ? new Vector3(0, -part.size[1] / 2, 0).applyMatrix4(matrix).z : undefined;
  };
  const strikes = hits.map(hit => {
    const right = fistZ(hit.time, "Right Arm"), left = fistZ(hit.time, "Left Arm");
    if (right === undefined || left === undefined || Math.abs(right - left) < 1e-5) return;
    return { time: hit.time, label: hit.name, arm: right < left ? "Right Arm" : "Left Arm", rightFistZ: right, leftFistZ: left };
  });
  if (strikes.some(s => !s)) return;
  const ends: number[] = [];
  for (let i = 0; i < strikes.length - 1; i++) {
    const candidates = sequence.frames.filter(f => f.time > strikes[i]!.time && f.time < strikes[i + 1]!.time)
      .map(f => ({ time: f.time, z: fistZ(f.time, strikes[i + 1]!.arm) })).filter(f => f.z !== undefined)
      .sort((a, b) => b.z! - a.z! || a.time - b.time);
    if (!candidates.length) return;
    ends.push(candidates[0].time);
  }
  ends.push(clip.duration);
  return {
    authority: "Authored hit names plus pose geometry. Suggested holds are inferred, medium confidence. Native playback and collision timing remain unverified. This evidence does not authorize choosing a combo mechanic.",
    derivation: "At each Dmg/Heavy frame, the forward-most local-root fist identifies the striking arm. Between hits, hold at the captured frame where the NEXT striking fist is rear-most. Preserve original 1x timing.",
    segments: strikes.map((strike, i) => ({ index: i + 1, start: i ? ends[i - 1] : 0, hit: strike!.time, end: ends[i], label: strike!.label, arm: strike!.arm })),
    nativePlayback: "not_verified" as const,
  };
}
