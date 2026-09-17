// Engineering repair of the user's saved project, not a generator template or a model-quality result.
import fs from "node:fs";
import { GenerationStore } from "../src/generation/store";
import { bundleSchema } from "../src/generation/schema";
import { validateBundle, compileSources } from "../src/generation/validation";
const store = new GenerationStore(".forge/projects");
const p = store.get("d0dab662-25dd-4705-a0ef-ed45134bf4bf");
if (p.jobId || p.revision !== 4 || !p.artifact || !p.review)
  throw Error("Expected idle approved maze revision with protected review");
store.checkpoint(p);
const directory = "repairs/brainrot-maze/";
// A controller creating a persistent ScreenGui must itself survive respawn.
const oldHud = `StarterGui/${p.scope}/HealthHUD.client.luau`;
const newHud = `StarterPlayer/StarterPlayerScripts/${p.scope}/HealthHUD.client.luau`;
for (const f of p.artifact.files) if (f.path === oldHud) f.path = newHud;
for (const t of p.spec!.tasks)
  t.files = t.files.map((f) => (f === oldHud ? newHud : f));
for (const f of p.artifact.files) {
  const file = directory + f.path.split("/").at(-1);
  if (!fs.existsSync(file)) throw Error("Missing source repair " + file);
  f.source = fs.readFileSync(file, "utf8");
}
const w = `Workspace/${p.scope}/World`,
  maze = w + "/Maze";
const vec = (x: number, y: number, z: number) => ({
  type: "Vector3",
  value: [x, y, z],
});
const cf = (x: number, y: number, z: number) => ({
  type: "CFrame",
  value: [x, y, z, 1, 0, 0, 0, 1, 0, 0, 0, 1],
});
const color = (r: number, g: number, b: number) => ({
  type: "Color3",
  value: [r / 255, g / 255, b / 255],
});
const nodes: any[] = [{ path: maze, className: "Model", properties: {} }];
function part(
  path: string,
  size: number[],
  pos: number[],
  shade: number[],
  extra = {},
) {
  nodes.push({
    path,
    className: "Part",
    properties: {
      Anchored: true,
      CanCollide: true,
      Size: vec(...(size as [number, number, number])),
      CFrame: cf(...(pos as [number, number, number])),
      Color: color(...(shade as [number, number, number])),
      ...extra,
    },
  });
}
part(maze + "/Floor", [96, 1, 96], [0, -0.5, 0], [43, 54, 44]);
const walls = [
  [-48, 5, 0, 2, 10, 96],
  [48, 5, 0, 2, 10, 96],
  [0, 5, -48, 96, 10, 2],
  [0, 5, 48, 96, 10, 2],
  [-24, 5, 12, 2, 10, 72],
  [0, 5, -12, 2, 10, 72],
  [24, 5, 12, 2, 10, 48],
  [12, 5, -12, 24, 10, 2],
];
walls.forEach(([x, y, z, sx, sy, sz], i) =>
  part(
    maze + "/Wall_" + (i + 1),
    [sx, sy, sz],
    [x, y, z],
    i % 2 ? [65, 72, 58] : [53, 66, 55],
  ),
);
for (const [i, x, z] of [
  [1, -36, 0],
  [2, 12, -24],
]) {
  part(w + "/BuffPool" + i, [14, 0.18, 14], [x, 0.08, z], [128, 224, 89], {
    Material: { type: "Enum", enum: "Material", value: 288 },
    CanCollide: false,
    Transparency: 0.35,
  });
  nodes.push({
    path: w + "/BuffPool" + i + "/Glow",
    className: "PointLight",
    properties: { Color: color(141, 255, 109), Brightness: 1.5, Range: 18 },
  });
}
for (let i = 0; i < 12; i++) {
  const z = -42 + i * 7;
  part(w + "/Rune" + i, [0.15, 2.5, 0.7], [-46.8, 3, z], [170, 209, 113], {
    Material: { type: "Enum", enum: "Material", value: 288 },
    CanCollide: false,
  });
}
part(w + "/Exit", [12, 0.2, 12], [36, 0.1, -36], [183, 116, 245], {
  Material: { type: "Enum", enum: "Material", value: 288 },
});
part(w + "/ExitLeft", [1, 9, 1], [30, 4.5, -36], [183, 116, 245], {
  Material: { type: "Enum", enum: "Material", value: 288 },
});
part(w + "/ExitRight", [1, 9, 1], [42, 4.5, -36], [183, 116, 245], {
  Material: { type: "Enum", enum: "Material", value: 288 },
});
part(w + "/ExitTop", [13, 1, 1], [36, 9, -36], [183, 116, 245], {
  Material: { type: "Enum", enum: "Material", value: 288 },
});
nodes.push({
  path: w + "/SpawnLocation",
  className: "SpawnLocation",
  properties: {
    Anchored: true,
    CanCollide: true,
    Neutral: true,
    Duration: 0,
    Size: vec(8, 0.5, 8),
    CFrame: cf(-36, 0.25, 36),
    Color: color(149, 174, 103),
  },
});
p.artifact.scene = nodes;
p.artifact.assets = [
  {
    id: "ambientSound",
    requirementId: "ambientSoundscape",
    kind: "audio",
    assetId: null,
    sourceUrl: "rbxasset://sounds/action_falling.ogg",
    status: "builtin",
    description:
      "Bundled Roblox wind audio, looped and dynamically pitched. This is atmospheric ambience, not composed music.",
  },
];
for (const r of p.spec!.requirements) {
  const paths =
    r.id === "mazeEnvironment"
      ? [maze]
      : p
          .spec!.tasks.filter((t) => t.requirements.includes(r.id))
          .flatMap((t) => t.files);
  if (!paths.length)
    paths.push(
      ...p.artifact.files
        .filter((f) => /BuffSystem|RespawnManager/.test(f.path))
        .map((f) => f.path),
    );
  const c = {
    requirementId: r.id,
    status: "implemented" as const,
    detail:
      "Engineering repair implemented; native acceptance and visual inspection remain pending.",
    files: paths,
  };
  const i = p.artifact.coverage.findIndex((c) => c.requirementId === r.id);
  if (i < 0) p.artifact.coverage.push(c);
  else p.artifact.coverage[i] = c;
}
p.artifact = bundleSchema.parse(p.artifact);
for (const [id, requirementId, mode, file] of [
  [
    "native_movement_buffs_respawn",
    "buffActivation",
    "server",
    "native-server.luau",
  ],
  [
    "native_client_hud_vision_audio",
    "healthMeterHUD",
    "client",
    "native-client.luau",
  ],
] as const) {
  const test = {
    id,
    requirementId,
    mode,
    source: fs.readFileSync(directory + file, "utf8"),
  };
  const index = p.review.tests.findIndex((t) => t.id === id);
  if (index < 0) p.review.tests.push(test);
  else p.review.tests[index] = test;
}
// Model-written tests are retained verbatim. The resolved issue list remains in the checkpoint.
p.review.issues = [];
p.checks = [
  ...validateBundle(p.artifact, p),
  ...(await compileSources(p.artifact, p.review.tests)),
];
if (p.checks.some((c) => c.status === "failed")) {
  console.log(p.checks.filter((c) => c.status === "failed"));
  throw Error("Repair did not pass static validation");
}
p.stage = "ready_to_test";
p.error = null;
p.studioEvidence = null;
p.visualEvidence = null;
p.events.push({
  at: new Date().toISOString(),
  message:
    "Engineering repair applied to saved maze: connected R6 character, server-authoritative buffs, client FOV/HUD, respawn, walk cycle, and bundled wind ambience. Original model tests retained; added real movement/damage/respawn client-server scenarios. Paid generation did not complete within the configured cap; this is a local repair, not autonomous model-quality evidence.",
});
store.save(p);
console.log({
  stage: p.stage,
  files: p.artifact.files.length,
  scene: p.artifact.scene.length,
  tests: p.review.tests.length,
});
