import fs from "node:fs";
import { expect, it } from "vitest";
import {
  derivedGolden,
  goldenRoot,
  inspectExport,
} from "../scripts/rehearsal-golden";
import { checkInstancePaths } from "../src/generation/instance-path-check";

it("derives only the Imported lookup fix while the same actual-node checks reject the preserved input", () => {
  const { original, bundle, changes } = derivedGolden();
  const place = fs.readFileSync(goldenRoot + "/game.rbxlx", "utf8");
  const nodes = inspectExport(place);
  const dummyNodes = nodes.filter(
    (n) =>
      n.path ===
      `Workspace/${original.scope}/Assets/dummy/dummy/Training Dummy`,
  );
  expect(dummyNodes).toHaveLength(1);
  const dummy = dummyNodes[0];
  expect(dummy?.className).toBe("Model");
  expect(nodes.some((n) => n.path.includes("/Imported/"))).toBe(false);
  expect(
    nodes.some(
      (n) =>
        n.className === "KeyframeSequence" &&
        n.path.endsWith("/AnimSaves/punching animation"),
    ),
  ).toBe(true);
  expect(changes.map((c) => c.path.split("/").at(-1))).toEqual([
    "PunchConfig.module.luau",
    "DummySetup.server.luau",
  ]);
  for (const file of original.artifact!.files) {
    const node = nodes.find((n) => n.source === file.source);
    expect(
      node,
      file.path + " must come from the preserved exported source",
    ).toBeDefined();
  }
  expect(
    checkInstancePaths(place, original.artifact!.files, original.scope).filter(
      (c) => c.status === "failed",
    ),
  ).toHaveLength(3);
  expect(
    checkInstancePaths(place, bundle.files, original.scope).filter(
      (c) => c.status === "failed",
    ),
  ).toEqual([]);
  // No native imports, XML hierarchy changes, approval or recorded verdict changes.
  expect(
    JSON.parse(fs.readFileSync(goldenRoot + "/terminal-project.json", "utf8")),
  ).toEqual(original);
});
