import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { capabilities } from "../src/generation/capabilities";
import {
  bundleHash,
  compileSources,
  validateBundle,
} from "../src/generation/validation";
import { exportBundle } from "../src/generation/export";
import {
  bundleSchema,
  type Project,
  type Bundle,
  type PropertyValue,
} from "../src/generation/schema";
import { refineCrystalHollowFeedback } from "./refine-crystal-hollow-feedback";

type Vec = [number, number, number];
type Node = Bundle["scene"][number];
const v = (value: Vec): PropertyValue => ({ type: "Vector3", value });
const color = (value: Vec): PropertyValue => ({ type: "Color3", value });
const enumValue = (name: string, item: string): PropertyValue => {
  const value = capabilities.enums[name]?.[item];
  if (value === undefined) throw Error(`Unknown native enum ${name}.${item}`);
  return { type: "Enum", enum: name, value };
};

/** Orthonormal Y-X-Z rotation, degrees; Roblox CoordinateFrame row-major order. */
export function quarryPose(
  position: Vec,
  yaw = 0,
  pitch = 0,
  roll = 0,
): PropertyValue {
  const [y, x, z] = [yaw, pitch, roll].map((n) => (n * Math.PI) / 180);
  const cy = Math.cos(y),
    sy = Math.sin(y),
    cx = Math.cos(x),
    sx = Math.sin(x),
    cz = Math.cos(z),
    sz = Math.sin(z);
  return {
    type: "CFrame",
    value: [
      ...position,
      cy * cz + sy * sx * sz,
      -cy * sz + sy * sx * cz,
      sy * cx,
      cx * sz,
      cx * cz,
      -sx,
      -sy * cz + cy * sx * sz,
      sy * sz + cy * sx * cz,
      cy * cx,
    ],
  };
}
const C = {
  ground: [0.31, 0.41, 0.4],
  rock: [0.29, 0.36, 0.43],
  rockLight: [0.43, 0.51, 0.54],
  rockDark: [0.21, 0.28, 0.35],
  path: [0.66, 0.65, 0.53],
  moss: [0.3, 0.49, 0.4],
  cyan: [0.18, 0.77, 0.86],
  violet: [0.57, 0.43, 0.85],
  pale: [0.59, 0.94, 0.93],
  wood: [0.39, 0.26, 0.18],
  gold: [0.91, 0.65, 0.29],
  cream: [0.97, 0.88, 0.66],
} satisfies Record<string, Vec>;

/** Authored expert art direction. Does not change any source file or input object. */
export function polishCrystalHollowScene(input: Project): Project {
  if (!input.artifact || input.jobId)
    throw Error("Requires a finished Crystal Hollow artifact");
  const project = structuredClone(input),
    scene = project.artifact!.scene;
  const root = `Workspace/${project.scope}/World`,
    art = root + "/Art";
  if (scene.some((n) => n.path === art))
    throw Error("Visual polish already applied");
  const get = (name: string) => {
    const node = scene.find((n) => n.path === root + "/" + name);
    if (!node) throw Error("Missing authored identity: " + name);
    return node;
  };
  const style = (
    node: Node,
    size: Vec,
    at: Vec,
    tint: Vec,
    material = "Slate",
    yaw = 0,
    pitch = 0,
    roll = 0,
  ) => {
    Object.assign(node.properties, {
      Anchored: true,
      Size: v(size),
      CFrame: quarryPose(at, yaw, pitch, roll),
      Color: color(tint),
      Material: enumValue("Material", material),
    });
    return node;
  };
  const clearancePoints: [number, number][] = [];
  for (let i = 1; i <= 6; i++) {
    const pose = get(`Nodes/Node${String(i).padStart(2, "0")}`).properties
      .CFrame as { value: number[] };
    clearancePoints.push([pose.value[0], pose.value[2]]);
  }
  for (let z = -24; z <= 6; z += 2) clearancePoints.push([-25, z], [25, z]);
  for (let x = -25; x <= 25; x += 2) clearancePoints.push([x, -24]);
  clearancePoints.push([-16, 10], [14, 10], [0, 18]);
  const add = (
    name: string,
    size: Vec,
    at: Vec,
    tint: Vec,
    material = "Slate",
    yaw = 0,
    pitch = 0,
    roll = 0,
    wedge = false,
    collide = false,
  ) => {
    const node: Node = {
      path: art + "/" + name,
      className: wedge ? "WedgePart" : "Part",
      properties: { CanCollide: collide, CanTouch: false },
    };
    style(node, size, at, tint, material, yaw, pitch, roll);
    // Conservatively keep the full rotated bounding box (including wedge empty space)
    // outside four-stud node approach disks and sampled eight-stud route corridors.
    if (name.startsWith("Cliff")) {
      const distance = Math.hypot(at[0], at[2]);
      for (
        let step = 0;
        clearancePoints.some((point) => quarryBoxNearPoint(node, point, 4));
        step++
      ) {
        if (step >= 15) throw Error("Unable to clear cliff approach: " + name);
        at = [
          at[0] + (at[0] / distance) * 2,
          at[1],
          at[2] + (at[2] / distance) * 2,
        ];
        node.properties.CFrame = quarryPose(at, yaw, pitch, roll);
      }
    }
    scene.push(node);
    return node;
  };
  scene.push({ path: art, className: "Folder", properties: {} });
  // A circular quarry island removes the square slab silhouette; its top stays y=0.
  style(
    get("Ground"),
    [2, 96, 96],
    [0, -1, 0],
    C.ground,
    "Ground",
    0,
    0,
    90,
  ).properties.Shape = enumValue("PartType", "Cylinder");
  style(
    get("Spawn"),
    [5, 0.25, 5],
    [0, 0.2, 18],
    C.path,
    "Sandstone",
  ).properties.Transparency = 1;
  style(get("PathSpawn"), [8, 0.18, 22], [0, 0.1, 7], C.path, "Sandstone");
  style(get("PathCross"), [39, 0.18, 7], [0, 0.11, 5], C.path, "Sandstone");
  style(get("PathBeacon"), [8, 0.18, 31], [0, 0.12, -10], C.path, "Sandstone");
  style(get("TerraceWest"), [17, 2.5, 25], [-35, 0.55, -19], C.rockLight);
  style(get("TerraceEast"), [17, 2.5, 25], [35, 0.55, -19], C.rockLight);
  style(get("RampNorth"), [10, 1.8, 12], [0, 0.8, -29], C.path, "Sandstone");
  // Varied layered cliffs frame the playable area, with a broad foreground entrance.
  for (let i = 0; i < 21; i++) {
    const angle = ((i * 15 + 30) * Math.PI) / 180;
    const radius = 42 + Math.sin(i * 2.4) * 2;
    const x = Math.cos(angle) * radius,
      z = -Math.sin(angle) * radius;
    if (z > 31 && Math.abs(x) < 24) continue;
    const h = 11 + ((i * 7) % 11),
      yaw = (-angle * 180) / Math.PI + 90;
    add(
      `Cliff${i}Mass`,
      [13, h, 10],
      [x, h / 2 - 0.6, z],
      i % 3 ? C.rock : C.rockLight,
      "Slate",
      yaw,
      0,
      ((i % 3) - 1) * 7,
      false,
      true,
    );
    add(
      `Cliff${i}Crown`,
      [10, 7 + (i % 5), 9],
      [x + Math.sin(i), h + 1, z],
      C.rockLight,
      "Slate",
      yaw + 27,
      0,
      -8,
      true,
      true,
    );
    add(
      `Cliff${i}Foot`,
      [11, 4, 12],
      [x * 0.9, 1.2, z * 0.9],
      C.moss,
      "Ground",
      yaw + 18,
      0,
      0,
      true,
      true,
    );
  }
  // Low, continuous links connect the six harvest positions without stairs on the first loop.
  const links: [Vec, Vec][] = [
    [
      [-19, 0, 5],
      [-25, 0, 4],
    ],
    [
      [19, 0, 5],
      [24, 0, 4],
    ],
    [
      [-25, 0, 4],
      [-25, 0, -24],
    ],
    [
      [24, 0, 4],
      [25, 0, -24],
    ],
    [
      [-25, 0, -24],
      [0, 0, -24],
    ],
    [
      [0, 0, -24],
      [25, 0, -24],
    ],
  ];
  links.forEach(([a, b], i) => {
    const dx = b[0] - a[0],
      dz = b[2] - a[2],
      length = Math.hypot(dx, dz);
    add(
      `QuarryWalk${i}`,
      [5.5, 0.16, length + 1],
      [(a[0] + b[0]) / 2, 0.12, (a[2] + b[2]) / 2],
      C.path,
      "Sandstone",
      (Math.atan2(dx, dz) * 180) / Math.PI,
      0,
      0,
      false,
      true,
    );
  });
  for (let i = 0; i < 10; i++) {
    add(
      `WalkPaver${i}`,
      [3.4, 0.09, 2.1],
      [i % 2 ? 1.1 : -1.1, 0.25, 20 - i * 3.4],
      i % 3 ? C.cream : C.rockLight,
      "Sandstone",
      ((i % 3) - 1) * 9,
    );
  }
  // Every harvest cluster remains one named BasePart plus exactly two child shards.
  for (let i = 1; i <= 6; i++) {
    const name = `Nodes/Node${String(i).padStart(2, "0")}`;
    const main = get(name),
      pose = main.properties.CFrame as { value: number[] };
    const [x, , z] = pose.value,
      yaw = i * 53;
    style(
      main,
      [2.2, 4.2 + (i % 3) * 0.65, 2.1],
      [x, 2.5, z],
      i % 2 ? C.cyan : C.violet,
      "SmoothPlastic",
      yaw,
      5,
      -9,
    );
    style(
      get(name + "/CrystalA"),
      [1.5, 3.3, 1.6],
      [x - 1.25, 1.65, z + 0.25],
      C.pale,
      "Neon",
      yaw + 55,
      -17,
      -22,
    ).className = "WedgePart";
    style(
      get(name + "/CrystalB"),
      [1.8, 2.7, 1.6],
      [x + 1.2, 1.4, z + 0.6],
      C.violet,
      "SmoothPlastic",
      yaw - 45,
      20,
      26,
    ).className = "WedgePart";
    add(
      `Node${i}Bed`,
      [5, 0.45, 4.3],
      [x, 0.2, z],
      C.rockDark,
      "Slate",
      yaw,
      0,
      0,
      false,
      false,
    );
    add(
      `Node${i}Ore`,
      [2, 0.6, 1.5],
      [x + 1.8, 0.3, z - 1.2],
      C.rockLight,
      "Slate",
      yaw + 30,
      0,
      0,
      true,
    );
  }
  // The merchant is a warm canvas kiosk; the upgrade station is an open purple smithy.
  for (const [name, x, tint] of [
    ["SellStation", -16, C.wood],
    ["UpgradeStation", 14, C.rockDark],
  ] as const) {
    style(
      get(name),
      [6, 2.6, 4],
      [x, 1.4, 10],
      tint,
      name === "SellStation" ? "WoodPlanks" : "Slate",
    );
    add(
      `${name}Counter`,
      [7, 0.45, 4.6],
      [x, 2.9, 10],
      name === "SellStation" ? C.gold : C.rockLight,
      "WoodPlanks",
    );
    for (const side of [-1, 1])
      add(
        `${name}Post${side < 0 ? "L" : "R"}`,
        [0.4, 6.7, 0.4],
        [x + side * 3.3, 3.35, 8.3],
        C.wood,
        "Wood",
      );
  }
  for (let i = 0; i < 5; i++)
    add(
      `MerchantCanvas${i}`,
      [1.5, 0.25, 6],
      [-19 + i * 1.5, 6.7, 9.4],
      i % 2 ? C.cream : C.gold,
      "Fabric",
      0,
      -7,
    );
  add(
    "MerchantCrate",
    [2.4, 2.1, 2.4],
    [-21, 1.1, 10],
    C.wood,
    "WoodPlanks",
    15,
  );
  add(
    "MerchantOre",
    [1.2, 1.8, 1.2],
    [-21, 2.6, 10],
    C.cyan,
    "SmoothPlastic",
    32,
    0,
    -20,
    true,
  );
  add("MerchantScalesStem", [0.2, 1.4, 0.2], [-17.5, 3.8, 10], C.gold, "Metal");
  add("MerchantScalesBeam", [2, 0.15, 0.15], [-17.5, 4.5, 10], C.gold, "Metal");
  add(
    "MerchantScalesPan",
    [0.8, 0.1, 0.8],
    [-18.2, 3.65, 10],
    C.cream,
    "Metal",
  );
  add("SmithyRoof", [7.7, 0.4, 4.4], [14, 7, 8.5], C.violet, "Slate", 0, -9);
  add("SmithyAnvilFoot", [1.3, 0.8, 1.4], [14, 3.5, 10], C.rockDark, "Metal");
  add("SmithyAnvilTop", [2.8, 0.4, 1.3], [14, 4.1, 10], C.rockLight, "Metal");
  add(
    "SmithyPickHandle",
    [0.22, 2.4, 0.22],
    [16.5, 4.3, 9.5],
    C.wood,
    "Wood",
    0,
    0,
    -28,
  );
  add(
    "SmithyPickHead",
    [2.3, 0.35, 0.35],
    [17.05, 5.35, 9.5],
    C.pale,
    "Metal",
    0,
    0,
    -28,
    true,
  );
  add("SmithyBag", [1.4, 1.8, 1.1], [11.6, 3.9, 9.8], C.gold, "Fabric", -14);
  for (const [name, x, text, tint] of [
    ["SellSign", -16, "CRYSTAL EXCHANGE\nSELL  •  5 COINS EACH", C.gold],
    ["UpgradeSign", 14, "QUARRY WORKSHOP\nPICK POWER  /  BIGGER BAG", C.pale],
  ] as const) {
    style(get(name), [7.6, 2.1, 0.3], [x, 5.35, 11.5], C.rockDark, "Wood");
    const gui = get(name + "/SurfaceGui");
    Object.assign(gui.properties, {
      Face: enumValue("NormalId", "Back"),
      AlwaysOnTop: false,
      CanvasSize: { type: "Vector2", value: [760, 210] },
    });
    Object.assign(get(name + "/SurfaceGui/TextLabel").properties, {
      Size: { type: "UDim2", value: [1, 0, 1, 0] },
      Text: text,
      TextColor3: color(tint),
      Font: enumValue("Font", "GothamBold"),
    });
  }
  // A stepped monument and faceted crown make the beacon an unmistakable focal point.
  style(
    get("Beacon"),
    [3.8, 6.5, 3.8],
    [0, 5.4, -18],
    C.cyan,
    "SmoothPlastic",
    45,
    0,
    -6,
  );
  style(
    get("Beacon/BeaconViolet"),
    [2.6, 7.5, 2.6],
    [-2.5, 4.7, -18],
    C.violet,
    "SmoothPlastic",
    15,
    -8,
    -23,
  ).className = "WedgePart";
  style(
    get("Beacon/BeaconCyan"),
    [2, 6.5, 2],
    [2.5, 4.3, -18],
    C.pale,
    "Neon",
    80,
    12,
    24,
  ).className = "WedgePart";
  add(
    "BeaconPlinth",
    [10, 0.6, 9],
    [0, 0.3, -18],
    C.rockDark,
    "Slate",
    12,
    0,
    0,
    false,
    true,
  );
  add(
    "BeaconDais",
    [7, 0.6, 6.8],
    [0, 0.8, -18],
    C.rockLight,
    "Slate",
    45,
    0,
    0,
    false,
    true,
  );
  add(
    "BeaconCrown",
    [3.8, 4.3, 3.8],
    [0, 10.4, -18],
    C.pale,
    "SmoothPlastic",
    45,
    0,
    -6,
    true,
  );
  add(
    "BeaconCrownFacet",
    [3.5, 3.9, 3.5],
    [0, 10.2, -18],
    C.cyan,
    "Neon",
    225,
    0,
    6,
    true,
  );
  // Keep the original arch identities but give the stone lintel an asymmetric silhouette.
  style(get("ArchLeft"), [5, 11, 7], [31, 5, -8], C.rock, "Slate", -12, 0, 8);
  style(
    get("ArchRight"),
    [6, 14, 8],
    [42, 6.5, -8],
    C.rockLight,
    "Slate",
    13,
    0,
    -7,
  );
  style(
    get("ArchTop"),
    [17, 3.5, 7],
    [36, 12, -8],
    C.rockLight,
    "Slate",
    0,
    0,
    8,
  );
  add(
    "ArchCrest",
    [9, 5, 6],
    [38, 15, -8],
    C.moss,
    "Slate",
    30,
    0,
    0,
    true,
    true,
  );
  // Foreground planting and interior rock islands break empty ground, outside the routes.
  const gardens: Vec[] = [
    [-11, 0, -7],
    [12, 0, -8],
    [-15, 0, -30],
    [15, 0, -31],
    [-30, 0, 21],
    [29, 0, 21],
    [-11, 0, 28],
    [12, 0, 28],
  ];
  gardens.forEach(([x, , z], i) => {
    add(
      `Garden${i}Rock`,
      [7, 2.3, 5],
      [x, 0.8, z],
      i % 2 ? C.rockLight : C.rock,
      "Slate",
      i * 31,
      0,
      0,
      true,
      true,
    );
    for (let j = 0; j < 3; j++)
      add(
        `Garden${i}Fern${j}`,
        [0.65, 2.4 + j * 0.3, 1.7],
        [x + 2 + j * 0.45, 1.1, z + 1],
        j % 2 ? C.moss : C.gold,
        "SmoothPlastic",
        j * 50 + i * 25,
        0,
        (j - 1) * 23,
        true,
      );
  });
  for (const [i, x, z] of [
    [0, -7, 17],
    [1, 7, 17],
    [2, -10, -17],
    [3, 10, -17],
  ] as const) {
    add(`Lantern${i}Post`, [0.3, 3.2, 0.3], [x, 1.6, z], C.wood, "Wood");
    const lamp = add(
      `Lantern${i}Glow`,
      [0.8, 1, 0.8],
      [x, 3.3, z],
      C.cream,
      "Neon",
    );
    scene.push({
      path: lamp.path + "/Light",
      className: "PointLight",
      properties: {
        Color: color(C.gold),
        Brightness: 1.4,
        Range: 13,
        Shadows: false,
      },
    });
    add(
      `Lantern${i}Cap`,
      [1.1, 0.25, 1.1],
      [x, 3.95, z],
      C.rockDark,
      "Metal",
      45,
    );
  }
  for (const entry of project.artifact!.coverage) {
    if (entry.requirementId === "world")
      entry.detail =
        "Authored expert visual pass adds a circular quarry floor, layered cliffs, linked paths, faceted harvest clusters, merchant kiosk, workshop, beacon crown and planting. Original 35–45-entry benchmark budget intentionally superseded; original review/protected tests are historical evidence. Native visual acceptance remains pending.";
    if (entry.requirementId === "onboarding")
      entry.detail =
        "Runtime node/station/spawn identities and horizontal positions preserved. Low paths connect the first loop; station boards use explicit CanvasSize and full-board labels. Native sign legibility, collisions and first-minute play remain pending.";
  }
  project.studioEvidence = null;
  project.visualEvidence = null;
  project.stage = "ready_to_test";
  project.error =
    "Authored expert visual candidate; fresh native gameplay and visual acceptance required. Original 45-entry art budget intentionally superseded.";
  return project;
}

/** XZ distance to a conservative rotated world AABB; wedge corners count as solid. */
export function quarryBoxNearPoint(
  node: Node,
  point: [number, number],
  radius: number,
) {
  const s = (node.properties.Size as { value: number[] }).value;
  const c = (node.properties.CFrame as { value: number[] }).value;
  const halfX =
    (Math.abs(c[3]) * s[0] + Math.abs(c[4]) * s[1] + Math.abs(c[5]) * s[2]) / 2;
  const halfZ =
    (Math.abs(c[9]) * s[0] + Math.abs(c[10]) * s[1] + Math.abs(c[11]) * s[2]) /
    2;
  return (
    Math.hypot(
      Math.max(0, Math.abs(point[0] - c[0]) - halfX),
      Math.max(0, Math.abs(point[1] - c[2]) - halfZ),
    ) < radius
  );
}

export function verifyQuarryScene(project: Project) {
  const b = project.artifact!,
    root = `Workspace/${project.scope}/World`;
  const nodes = b.scene.filter((n) => n.path.startsWith(root + "/"));
  if (new Set(b.scene.map((n) => n.path)).size !== b.scene.length)
    throw Error("Duplicate authored paths");
  for (let i = 1; i <= 6; i++) {
    const p = root + `/Nodes/Node${String(i).padStart(2, "0")}`;
    const children = nodes.filter(
      (n) =>
        n.path.startsWith(p + "/") && !n.path.slice(p.length + 1).includes("/"),
    );
    if (
      children.length !== 2 ||
      children.some((n) => n.className !== "WedgePart")
    )
      throw Error("Harvest cluster child contract changed");
    const center = (
      nodes.find((n) => n.path === p)!.properties.CFrame as { value: number[] }
    ).value;
    if (
      nodes.some(
        (n) =>
          n.path.includes("/Art/Cliff") &&
          quarryBoxNearPoint(n, [center[0], center[2]], 4),
      )
    )
      throw Error("Cliff blocks harvest approach: " + p);
  }
  for (const node of nodes)
    if (node.properties.CFrame && node.properties.Anchored !== true)
      throw Error("Unanchored art: " + node.path);
  if (nodes.length > 350)
    throw Error("Authored art exceeds the 350-entry candidate budget");
  return {
    worldEntries: nodes.length + 1,
    harvestNodes: 6,
    childShardsPerNode: 2,
    authoredGeometry: nodes.filter((n) => n.properties.CFrame).length,
    nativeVerification: "pending",
  };
}

async function main() {
  if (!process.argv[2] || !process.argv[3])
    throw Error(
      "Usage: tsx scripts/polish-crystal-hollow.ts input-project.json NEW-output-directory [NEW-place.rbxlx]",
    );
  const input = resolve(process.argv[2]),
    output = resolve(process.argv[3]);
  if (existsSync(output))
    throw Error("Destination already exists; choose a new candidate directory");
  const download = process.argv[4] ? resolve(process.argv[4]) : null;
  if (download && existsSync(download))
    throw Error("Place destination already exists; refusing overwrite");
  const raw = readFileSync(input),
    original = JSON.parse(raw.toString()) as Project;
  const project = refineCrystalHollowFeedback(
    polishCrystalHollowScene(original),
  );
  const artifact = project.artifact!;
  bundleSchema.parse(artifact);
  const invariants = verifyQuarryScene(project),
    checks = [
      ...validateBundle(artifact, project),
      ...(await compileSources(artifact)),
    ];
  if (checks.some((c) => c.status === "failed"))
    throw Error(JSON.stringify(checks.filter((c) => c.status === "failed")));
  project.checks = [
    ...checks,
    {
      id: "polished-native",
      status: "pending",
      detail:
        "New authored visual/feedback candidate requires Studio verification.",
    },
  ];
  const exported = exportBundle(artifact, project.scope),
    sha = (data: string | Buffer) =>
      createHash("sha256").update(data).digest("hex");
  const changedSources = artifact.files
    .filter(
      (f) =>
        original.artifact!.files.find((x) => x.path === f.path)?.source !==
        f.source,
    )
    .map((f) => f.path);
  const verification = {
    createdAt: new Date().toISOString(),
    provenance:
      "authored expert art direction plus separately tested feedback refinement; not unassisted model output",
    input,
    originalProjectSha256: sha(raw),
    originalBundleHash: bundleHash(original.artifact!),
    bundleHash: bundleHash(artifact),
    placeSha256: sha(exported),
    invariants,
    changedSources,
    checks,
    limits: [
      "No native Studio verification by this script",
      "Original protected tests/review retained as historical evidence, not a new pass",
      "Original 35–45 world-entry benchmark budget intentionally superseded for expert art pass",
    ],
  };
  mkdirSync(output, { recursive: true });
  writeFileSync(join(output, "original-project.json"), raw);
  writeFileSync(join(output, "project.json"), JSON.stringify(project, null, 2));
  writeFileSync(join(output, "Takko-Crystal-Hollow-Polished.rbxlx"), exported);
  writeFileSync(
    join(output, "verification.json"),
    JSON.stringify(verification, null, 2),
  );
  if (download) writeFileSync(download, exported, { flag: "wx" });
  console.log(JSON.stringify(verification, null, 2));
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
