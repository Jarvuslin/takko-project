export type V = [number, number, number];
export type Part = {
  name: string;
  parent?: string;
  anchor: V;
  center: V;
  size: V;
};
export const r6: Part[] = [
  { name: "Torso", anchor: [0, 0, 0], center: [0, 0, 0], size: [2, 2, 1] },
  {
    name: "Head",
    parent: "Torso",
    anchor: [0, 1, 0],
    center: [0, 0.5, 0],
    size: [1, 1, 1],
  },
  ...([-1, 1] as const).flatMap((side): Part[] => [
    {
      name: side < 0 ? "Left Arm" : "Right Arm",
      parent: "Torso",
      anchor: [side * 1.5, 1, 0],
      center: [0, -1, 0],
      size: [1, 2, 1],
    },
    {
      name: side < 0 ? "Left Leg" : "Right Leg",
      parent: "Torso",
      anchor: [side * 0.5, -1, 0],
      center: [0, -1, 0],
      size: [1, 2, 1],
    },
  ]),
];
export const r15: Part[] = [
  {
    name: "LowerTorso",
    anchor: [0, 0, 0],
    center: [0, -0.5, 0],
    size: [2, 1, 1],
  },
  {
    name: "UpperTorso",
    parent: "LowerTorso",
    anchor: [0, 0, 0],
    center: [0, 0.5, 0],
    size: [2, 1, 1],
  },
  {
    name: "Head",
    parent: "UpperTorso",
    anchor: [0, 1, 0],
    center: [0, 0.5, 0],
    size: [1, 1, 1],
  },
  ...([-1, 1] as const).flatMap((s): Part[] => {
    const side = s < 0 ? "Left" : "Right";
    return [
      {
        name: side + "UpperArm",
        parent: "UpperTorso",
        anchor: [s * 1.5, 1, 0],
        center: [0, -0.5, 0],
        size: [1, 1, 1],
      },
      {
        name: side + "LowerArm",
        parent: side + "UpperArm",
        anchor: [0, -1, 0],
        center: [0, -0.4, 0],
        size: [0.9, 0.8, 0.9],
      },
      {
        name: side + "Hand",
        parent: side + "LowerArm",
        anchor: [0, -0.8, 0],
        center: [0, -0.2, 0],
        size: [0.9, 0.4, 0.9],
      },
      {
        name: side + "UpperLeg",
        parent: "LowerTorso",
        anchor: [s * 0.5, -1, 0],
        center: [0, -0.5, 0],
        size: [1, 1, 1],
      },
      {
        name: side + "LowerLeg",
        parent: side + "UpperLeg",
        anchor: [0, -1, 0],
        center: [0, -0.4, 0],
        size: [0.9, 0.8, 0.9],
      },
      {
        name: side + "Foot",
        parent: side + "LowerLeg",
        anchor: [0, -0.8, 0],
        center: [0, -0.2, -0.15],
        size: [0.9, 0.4, 1.2],
      },
    ];
  }),
];
