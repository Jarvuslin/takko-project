import { z } from "zod";
import { Matrix4, Vector3, Quaternion, Euler } from "three";
import type { AnimationClip } from "../generation/animation";
import type { NativeRoles } from "./role-capture";

export const segmentSchema = z
  .object({
    start: z.number().finite().nonnegative(),
    hit: z.number().finite().nonnegative(),
    end: z.number().finite().positive(),
  })
  .strict();
export const timingDecisionSchema = z
  .object({
    key: z.string().max(2000000),
    segments: z.array(segmentSchema).min(1).max(100),
    source: z.literal("user"),
  })
  .strict();
export type TimingDecision = z.infer<typeof timingDecisionSchema>;
export function validSegments(
  segments: z.infer<typeof segmentSchema>[],
  duration: number,
) {
  return (
    segments.length > 0 &&
    segments.every(
      (s, i) =>
        s.start <= s.hit &&
        s.hit < s.end &&
        s.end <= duration &&
        (i === 0 ? s.start === 0 : s.start === segments[i - 1].end),
    )
  );
}
type Sequence = NativeRoles["sequences"][number];
type Strike = {
  time: number;
  label: string;
  source: "marker" | "keyframe" | "motion";
  confidence: "medium" | "low";
};
const hitLabel =
  /(?:^|[^a-z])(hit|hitstart|damage|dmg|heavy|impact|strike|attack|swing|punch)(?:[\d_\s-]*$|[^a-z])/i;
const nonAttack =
  /\b(idle|run|walk|dance|jump|fall|swim|climb|sit|dash|charge)\b/i;
const frame = (c: number[]) =>
  new Matrix4().set(
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

/** Root-relative endpoint geometry from the captured native joint chain.
 * Sparse keys are interpolated as a motion proposal, never native playback proof.
 */
export function limbEndpoints(clip: AnimationClip, time: number) {
  if (!clip.nativeRig) return [];
  const matrices = new Map([["HumanoidRootPart", new Matrix4()]]);
  for (const part of clip.nativeRig) {
    const parent = matrices.get(part.parent),
      keys = clip.tracks.find((t) => t.joint === part.name)?.keys;
    if (!parent) return [];
    if (!keys?.length) {
      matrices.set(
        part.name,
        parent
          .clone()
          .multiply(frame(part.c0))
          .multiply(frame(part.c1).invert()),
      );
      continue;
    }
    const next = keys.findIndex((k) => k.time >= time),
      b = keys[next < 0 ? keys.length - 1 : next],
      a = keys[Math.max(0, next < 0 ? keys.length - 1 : next - 1)];
    const t =
      a === b
        ? 0
        : Math.max(0, Math.min(1, (time - a.time) / (b.time - a.time)));
    const q = new Quaternion()
      .setFromEuler(new Euler(...a.rotation))
      .slerp(new Quaternion().setFromEuler(new Euler(...b.rotation)), t);
    const p = new Vector3(...(a.position ?? [0, 0, 0])).lerp(
      new Vector3(...(b.position ?? [0, 0, 0])),
      t,
    );
    const weight = (a.weight ?? 1) + ((b.weight ?? 1) - (a.weight ?? 1)) * t;
    q.slerp(new Quaternion(), 1 - weight);
    p.multiplyScalar(weight);
    matrices.set(
      part.name,
      parent
        .clone()
        .multiply(frame(part.c0))
        .multiply(new Matrix4().compose(p, q, new Vector3(1, 1, 1)))
        .multiply(frame(part.c1).invert()),
    );
  }
  const ends =
    clip.rig === "R6"
      ? ["Left Arm", "Right Arm", "Left Leg", "Right Leg"]
      : ["LeftHand", "RightHand", "LeftFoot", "RightFoot"];
  return ends.flatMap((name) => {
    const part = clip.nativeRig!.find((p) => p.name === name),
      m = matrices.get(name);
    return part && m
      ? [{ name, point: new Vector3(0, -part.size[1] / 2, 0).applyMatrix4(m) }]
      : [];
  });
}

export function animationSegments(
  clip: AnimationClip,
  sequence: Sequence | undefined,
  intent: string,
) {
  const key = JSON.stringify([
    "segments-v1",
    clip.sourcePoseDigest,
    clip.nativeRig,
    sequence?.frames,
    sequence?.loop,
    intent,
  ]);
  const empty = (reason: string) => ({
    key,
    reason,
    segments: [] as Array<{
      index: number;
      start: number;
      hit: number;
      end: number;
      label: string;
      source: Strike["source"];
      confidence: Strike["confidence"];
    }>,
    requiresAcceptance: true as const,
    nativePlayback: "not_verified" as const,
  });
  if (!sequence || sequence.poseDigest !== clip.sourcePoseDigest)
    return empty(
      "Timing metadata is not bound to this native clip. Timing remains unknown.",
    );
  if (sequence.loop || nonAttack.test(clip.name))
    return empty("Looping or non-attack clip. No attack segments proposed.");
  if (!/\b(attack|punch|combat|strike|swing|combo|hit|damage)\b/i.test(intent))
    return empty(
      "No attack interaction requested. Motion does not establish attack intent.",
    );
  let strikes: Strike[] = sequence.frames.flatMap((f) =>
    f.markers
      .filter((m) => hitLabel.test(m.name))
      .map((m) => ({
        time: f.time,
        label: m.name + (m.value ? ": " + m.value : ""),
        source: "marker" as const,
        confidence: "medium" as const,
      })),
  );
  if (!strikes.length)
    strikes = sequence.frames
      .filter((f) => hitLabel.test(f.name))
      .map((f) => ({
        time: f.time,
        label: f.name,
        source: "keyframe",
        confidence: "medium",
      }));
  if (!strikes.length) {
    // Do not override ambiguous authored event labels with motion guesses.
    if (
      sequence.frames.some(
        (f) => f.markers.length || !/^Keyframe\d*$/i.test(f.name),
      )
    )
      return empty(
        "Authored labels have unknown semantics. Select another clip or clarify its events.",
      );
    const samples = sequence.frames.map((f) => ({
      time: f.time,
      limbs: limbEndpoints(clip, f.time),
    }));
    for (let i = 1; i < samples.length - 1; i++) {
      const prev = samples[i - 1],
        cur = samples[i],
        next = samples[i + 1];
      const peak = cur.limbs.some((l) => {
        const a = prev.limbs.find((x) => x.name === l.name),
          b = next.limbs.find((x) => x.name === l.name);
        if (!a || !b || cur.time <= prev.time || next.time <= cur.time)
          return false;
        const extent = l.point.length(),
          before = a.point.length(),
          after = b.point.length();
        return (
          extent > before + 0.01 &&
          extent >= after &&
          (extent - before) / (cur.time - prev.time) > 0.1
        );
      });
      if (
        peak &&
        (!strikes.length || cur.time - strikes[strikes.length - 1].time >= 0.12)
      )
        strikes.push({
          time: cur.time,
          label: "Native limb extension peak",
          source: "motion",
          confidence: "low",
        });
    }
  }
  strikes = strikes
    .filter(
      (s, i, all) =>
        s.time < clip.duration && all.findIndex((t) => t.time === s.time) === i,
    )
    .sort((a, b) => a.time - b.time);
  if (!strikes.length)
    return empty(
      "No unambiguous event or limb extension peak found. Attack timing remains unknown.",
    );
  const ends = strikes.map((s, i) =>
    i + 1 < strikes.length ? (s.time + strikes[i + 1].time) / 2 : clip.duration,
  );
  return {
    ...empty(
      "Proposed timings require your acceptance. Holds are inferred between events. Verify native playback and collision timing before relying on them.",
    ),
    segments: strikes.map((s, i) => ({
      index: i + 1,
      start: i ? ends[i - 1] : 0,
      hit: s.time,
      end: ends[i],
      label: s.label,
      source: s.source,
      confidence: s.confidence,
    })),
  };
}
