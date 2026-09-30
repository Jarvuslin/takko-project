import { z } from "zod";
export const rigJoints = {
  R6: ["Torso", "Head", "Left Arm", "Right Arm", "Left Leg", "Right Leg"],
  R15: [
    "LowerTorso",
    "UpperTorso",
    "Head",
    "LeftUpperArm",
    "LeftLowerArm",
    "LeftHand",
    "RightUpperArm",
    "RightLowerArm",
    "RightHand",
    "LeftUpperLeg",
    "LeftLowerLeg",
    "LeftFoot",
    "RightUpperLeg",
    "RightLowerLeg",
    "RightFoot",
  ],
};
const vector = z.tuple([
  z.number().finite().min(-20).max(20),
  z.number().finite().min(-20).max(20),
  z.number().finite().min(-20).max(20),
]);
const position = z.tuple([
  z.number().finite().min(-10000).max(10000),
  z.number().finite().min(-10000).max(10000),
  z.number().finite().min(-10000).max(10000),
]);
const frame = z.array(z.number().finite().min(-10000).max(10000)).length(12);
/** Local joint rotations in radians. Explicit format, not an arbitrary Roblox asset ID. */
export const animationClipSchema = z
  .object({
    version: z.literal(1),
    name: z.string().trim().min(1).max(80),
    rig: z.enum(["R6", "R15"]),
    duration: z.number().finite().min(0).max(30),
    sourcePoseDigest: z.string().regex(/^[a-f0-9]{64}$/).optional(),
    nativeRig: z
      .array(
        z
          .object({
            name: z.string().max(40),
            parent: z.string().max(40),
            size: z.tuple([
              z.number().positive().max(100),
              z.number().positive().max(100),
              z.number().positive().max(100),
            ]),
            c0: frame,
            c1: frame,
          })
          .strict(),
      )
      .min(1)
      .max(15)
      .optional(),
    tracks: z
      .array(
        z
          .object({
            joint: z.string().max(40),
            keys: z
              .array(
                z
                  .object({
                    time: z.number().finite().min(0).max(30),
                    rotation: vector,
                    position: position.optional(),
                    easing: z
                      .enum([
                        "Linear",
                        "Constant",
                        "Elastic",
                        "Cubic",
                        "CubicV2",
                        "Bounce",
                      ])
                      .optional(),
                    direction: z.enum(["In", "Out", "InOut"]).optional(),
                    weight: z.number().finite().min(0).max(1).optional(),
                  })
                  .strict(),
              )
              .min(1)
              .max(300),
          })
          .strict(),
      )
      .min(1)
      .max(15),
  })
  .strict()
  .superRefine((clip, ctx) => {
    if (clip.nativeRig) {
      const seen = new Set(["HumanoidRootPart"]);
      for (const part of clip.nativeRig) {
        if (
          seen.has(part.name) ||
          !seen.has(part.parent) ||
          !rigJoints[clip.rig].includes(part.name)
        )
          ctx.addIssue({
            code: "custom",
            message: "Invalid native rig hierarchy.",
          });
        seen.add(part.name);
      }
      if (rigJoints[clip.rig].some((name) => !seen.has(name)))
        ctx.addIssue({ code: "custom", message: "Native rig is incomplete." });
    }
    if (new Set(clip.tracks.map((t) => t.joint)).size !== clip.tracks.length)
      ctx.addIssue({
        code: "custom",
        message: "A joint can only have one track.",
      });
    for (const track of clip.tracks) {
      if (!rigJoints[clip.rig].includes(track.joint))
        ctx.addIssue({
          code: "custom",
          message: `Joint ${track.joint} does not belong to ${clip.rig}.`,
        });
      if (
        track.keys.some(
          (k, i) =>
            k.time > clip.duration ||
            (i > 0 && k.time <= track.keys[i - 1].time),
        )
      )
        ctx.addIssue({
          code: "custom",
          message: "Key times must increase and stay within the clip duration.",
        });
    }
  });
export type AnimationClip = z.infer<typeof animationClipSchema>;
export type SavedAnimation = {
  id: string;
  clip: AnimationClip;
  revision: number;
  at: string;
  source: "user-import";
};
export function sampleRotation(
  clip: AnimationClip,
  joint: string,
  time: number,
): [number, number, number] {
  const keys = clip.tracks.find((t) => t.joint === joint)?.keys;
  if (!keys) return [0, 0, 0];
  const next = keys.findIndex((k) => k.time >= time);
  if (next <= 0) return keys[next === 0 ? 0 : keys.length - 1].rotation;
  const a = keys[next - 1],
    b = keys[next],
    t = (time - a.time) / (b.time - a.time);
  return a.rotation.map((v, i) => v + (b.rotation[i] - v) * t) as [
    number,
    number,
    number,
  ];
}
