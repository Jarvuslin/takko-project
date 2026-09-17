import { describe, expect, it } from "vitest";
import {
  polishCrystalHollowScene,
  quarryPose,
  verifyQuarryScene,
  quarryBoxNearPoint,
} from "../scripts/polish-crystal-hollow";
import { newProject } from "../src/generation/store";
import { fixtureBundle } from "./generation-fixtures";
import { scenePropertyError } from "../src/generation/capabilities";
import { exportBundle } from "../src/generation/export";
import { XMLParser } from "fast-xml-parser";
import type { Project } from "../src/generation/schema";

// Contract-shaped authored fixture; tests never depend on private paid-run files.
function fixture(): Project {
  const p = newProject("Crystal Hollow visual refinement", 1e6);
  p.artifact = fixtureBundle(p.request, p.scope);
  const root = `Workspace/${p.scope}/World`;
  const names = [
    "Ground",
    "Spawn",
    "PathSpawn",
    "PathCross",
    "PathBeacon",
    "TerraceWest",
    "TerraceEast",
    "RampNorth",
    "SellStation",
    "UpgradeStation",
    "SellSign",
    "UpgradeSign",
    "Beacon",
    "Beacon/BeaconViolet",
    "Beacon/BeaconCyan",
    "ArchLeft",
    "ArchRight",
    "ArchTop",
  ];
  p.artifact.scene = [{ path: root, className: "Folder", properties: {} }];
  for (const name of names)
    p.artifact.scene.push({
      path: root + "/" + name,
      className: name === "Spawn" ? "SpawnLocation" : "Part",
      properties: {
        CanCollide: true,
        Anchored: true,
        CFrame: quarryPose([0, 0, 0]),
      },
    });
  p.artifact.scene.push({
    path: root + "/Nodes",
    className: "Folder",
    properties: {},
  });
  for (const [index, x, z] of [
    [1, -6, 10],
    [2, -25, 4],
    [3, 24, 4],
    [4, -25, -24],
    [5, 25, -24],
    [6, 0, -34],
  ]) {
    const path = root + `/Nodes/Node${String(index).padStart(2, "0")}`;
    for (const suffix of ["", "/CrystalA", "/CrystalB"])
      p.artifact.scene.push({
        path: path + suffix,
        className: suffix ? "Part" : "WedgePart",
        properties: {
          Anchored: true,
          CanCollide: !suffix,
          CFrame: quarryPose([x, 2.2, z]),
        },
      });
  }
  for (const name of ["SellSign", "UpgradeSign"]) {
    p.artifact.scene.push({
      path: root + "/" + name + "/SurfaceGui",
      className: "SurfaceGui",
      properties: {},
    });
    p.artifact.scene.push({
      path: root + "/" + name + "/SurfaceGui/TextLabel",
      className: "TextLabel",
      properties: {},
    });
  }
  return p;
}

describe("authored Crystal Hollow visual refinement", () => {
  it("preserves original evidence, source bytes, runtime paths and horizontal interaction positions", () => {
    const original = fixture(),
      snapshot = JSON.stringify(original),
      p = polishCrystalHollowScene(original);
    expect(JSON.stringify(original)).toBe(snapshot);
    expect(p.artifact!.files).toEqual(original.artifact!.files);
    expect(p.artifact!.assets).toEqual(original.artifact!.assets);
    for (const old of original.artifact!.scene) {
      const now = p.artifact!.scene.find((n) => n.path === old.path)!;
      expect(now).toBeDefined();
      if (/\/Nodes\/Node\d\d$/.test(old.path)) {
        const a = (old.properties.CFrame as { value: number[] }).value,
          b = (now.properties.CFrame as { value: number[] }).value;
        expect([b[0], b[2]]).toEqual([a[0], a[2]]);
      }
    }
    expect(p.stage).toBe("ready_to_test");
    expect(p.studioEvidence).toBeNull();
    expect(p.visualEvidence).toBeNull();
    expect(() => polishCrystalHollowScene(p)).toThrow("already applied");
    expect(verifyQuarryScene(p)).toMatchObject({
      harvestNodes: 6,
      childShardsPerNode: 2,
      nativeVerification: "pending",
    });
  });

  it("uses valid native properties, orthonormal rotations and anchored scoped decorations", () => {
    const p = polishCrystalHollowScene(fixture());
    for (const node of p.artifact!.scene) {
      for (const [name, value] of Object.entries(node.properties))
        expect(
          scenePropertyError(node.className, name, value),
          node.path + "." + name,
        ).toBeNull();
      if (node.properties.CFrame) {
        expect(node.properties.Anchored).toBe(true);
        const a = (node.properties.CFrame as { value: number[] }).value.slice(
          3,
        );
        for (let i = 0; i < 3; i++)
          for (let j = 0; j < 3; j++)
            expect(
              a[i * 3] * a[j * 3] +
                a[i * 3 + 1] * a[j * 3 + 1] +
                a[i * 3 + 2] * a[j * 3 + 2],
            ).toBeCloseTo(i === j ? 1 : 0, 10);
      }
      if (node.path.includes("/Art/"))
        expect(node.path).toMatch(
          new RegExp(`^Workspace/${p.scope}/World/Art/`),
        );
    }
    expect(
      p.artifact!.scene.filter((n) => n.path.includes("/Cliff")).length,
    ).toBeGreaterThan(40);
    expect(
      p.artifact!.scene.filter((n) => n.className === "WedgePart").length,
    ).toBeGreaterThan(45);
  });

  it("keeps first-loop central paths walkable and labels fit the authored boards", () => {
    const p = polishCrystalHollowScene(fixture()),
      scene = p.artifact!.scene;
    for (const name of ["PathSpawn", "PathCross", "PathBeacon"]) {
      const n = scene.find((n) => n.path.endsWith("/" + name))!;
      const size = (n.properties.Size as { value: number[] }).value;
      expect(Math.min(size[0], size[2])).toBeGreaterThanOrEqual(7);
      expect(size[1]).toBeLessThan(0.3);
    }
    // Conservative rotated AABB catches accidental tall art across the spawn→center corridor.
    for (const n of scene.filter(
      (n) => n.path.includes("/Art/") && n.properties.CanCollide === true,
    )) {
      const s = (n.properties.Size as { value: number[] }).value;
      if (s[1] < 0.7) continue;
      const c = (n.properties.CFrame as { value: number[] }).value;
      const halfX =
        (Math.abs(c[3]) * s[0] +
          Math.abs(c[4]) * s[1] +
          Math.abs(c[5]) * s[2]) /
        2;
      const halfZ =
        (Math.abs(c[9]) * s[0] +
          Math.abs(c[10]) * s[1] +
          Math.abs(c[11]) * s[2]) /
        2;
      expect(
        c[0] + halfX <= -3 ||
          c[0] - halfX >= 3 ||
          c[2] + halfZ <= 0 ||
          c[2] - halfZ >= 22,
        n.path,
      ).toBe(true);
    }
    for (const n of scene.filter((n) => n.className === "TextLabel"))
      expect(n.properties.Size).toEqual({ type: "UDim2", value: [1, 0, 1, 0] });
    for (const n of scene.filter((n) => n.className === "SurfaceGui"))
      expect(n.properties.CanvasSize).toEqual({
        type: "Vector2",
        value: [760, 210],
      });
  });

  it("keeps four-stud cliff clearance at every harvest node and along the terrace approach loops", () => {
    const p = polishCrystalHollowScene(fixture()),
      scene = p.artifact!.scene;
    const points: [number, number][] = scene
      .filter((n) => /\/Nodes\/Node\d\d$/.test(n.path))
      .map((n) => {
        const c = (n.properties.CFrame as { value: number[] }).value;
        return [c[0], c[2]];
      });
    for (let z = -24; z <= 6; z += 1) points.push([-25, z], [25, z]);
    for (let x = -25; x <= 25; x += 1) points.push([x, -24]);
    for (const cliff of scene.filter((n) => n.path.includes("/Art/Cliff")))
      for (const point of points)
        expect(
          quarryBoxNearPoint(cliff, point, 3.8),
          `${cliff.path} at ${point}`,
        ).toBe(false);
  });

  it("exports a parseable deterministic place with all geometry present before Play", () => {
    const p = polishCrystalHollowScene(fixture());
    const xml = exportBundle(p.artifact!, p.scope);
    expect(new XMLParser().parse(xml).roblox).toBeDefined();
    expect(xml).toContain("MerchantCanvas0");
    expect(xml).toContain("BeaconCrown");
    expect(xml).toBe(
      exportBundle(
        polishCrystalHollowScene(fixtureWithScope(p.scope)).artifact!,
        p.scope,
      ),
    );
    function fixtureWithScope(scope: string) {
      const q = fixture();
      const old = q.scope;
      q.scope = scope;
      q.artifact = JSON.parse(
        JSON.stringify(q.artifact).replaceAll(old, scope),
      );
      return q;
    }
  });
});
