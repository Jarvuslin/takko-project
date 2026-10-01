import fs from "node:fs";
import { expect, it } from "vitest";
import { checkInstancePaths } from "../src/generation/instance-path-check";
import { exportBundle } from "../src/generation/export";
import type { Project } from "../src/generation/schema";

const p: Project = JSON.parse(
  fs.readFileSync(
    "tests/fixtures/regression/completed-combat/terminal-project.json",
    "utf8",
  ),
);
const xml = fs.readFileSync(
  "tests/fixtures/regression/completed-combat/game.rbxlx",
  "utf8",
);
const other: Project = JSON.parse(
  fs.readFileSync(
    "tests/fixtures/asset-pipeline/butter-crunch-marketplace-v6/grok/final-project.json",
    "utf8",
  ),
);

it("rejects the preserved missing retained child in both the script and config, naming its real sibling path", () => {
  const checks = checkInstancePaths(xml, p.artifact!.files, p.scope);
  for (const name of ["DummySetup", "PunchConfig"]) {
    expect(
      checks.some(
        (c) =>
          c.status === "failed" &&
          c.detail.includes(name) &&
          c.detail.includes("Imported") &&
          c.detail.includes("nearest"),
      ),
    ).toBe(true);
  }
});

it("checks a different real game's scene lookups and detects removal of the actual producer node", () => {
  const b = structuredClone(other.artifact!);
  const present = checkInstancePaths(
    exportBundle(b, other.scope),
    b.files,
    other.scope,
  );
  expect(
    present.some(
      (c) => c.status === "passed" && c.detail.includes("/World/Butter"),
    ),
  ).toBe(true);
  b.scene = b.scene.filter((s) => !s.path.endsWith("/World/CrunchCount"));
  expect(
    checkInstancePaths(exportBundle(b, other.scope), b.files, other.scope).some(
      (c) => c.status === "failed" && c.detail.includes("/World/CrunchCount"),
    ),
  ).toBe(true);
});

it("does not label the real selected KeyframeSequence non-replicating contrary to the scratch Play observation", () => {
  const checks = checkInstancePaths(xml, p.artifact!.files, p.scope);
  expect(
    checks.some(
      (c) =>
        c.status === "passed" &&
        c.detail.includes("PunchController") &&
        c.detail.endsWith("/AnimSaves/punching animation"),
    ),
  ).toBe(true);
  expect(
    checks.some(
      (c) =>
        c.status === "failed" &&
        c.detail.includes("PunchController") &&
        c.detail.includes("not client-visible"),
    ),
  ).toBe(false);
});

it.each([p, other])(
  "blocks a real client lookup when its actual target is moved to server-only storage ($scope)",
  (project) => {
    const file = project.artifact!.files.find((f) => f.kind === "LocalScript")!;
    const source = file.source.replace(
      /(?:game:GetService\("Workspace"\)|\bworkspace\b)/g,
      'game:GetService("ServerStorage")',
    );
    const place =
      project === p ? xml : exportBundle(project.artifact!, project.scope);
    const checks = checkInstancePaths(
      place
        .replaceAll('class="Workspace"', 'class="ServerStorage"')
        .replaceAll('name="Name">Workspace<', 'name="Name">ServerStorage<'),
      [{ ...file, source }],
      project.scope,
    );
    expect(
      checks.some(
        (c) => c.status === "failed" && c.detail.includes("not client-visible"),
      ),
    ).toBe(true);
  },
);

it.each([p, other])(
  "checks documented non-replicating classes in real client lookup chains ($scope)",
  (project) => {
    const file = project.artifact!.files.find((f) => f.kind === "LocalScript")!;
    const place =
      project === p ? xml : exportBundle(project.artifact!, project.scope);
    // Fault injection into the actual hierarchy, without inventing a passing path.
    const changed = place.replace(
      new RegExp(
        'class="Folder"([^>]*><Properties><string name="Name">' +
          project.scope +
          "</string>)",
      ),
      'class="Camera"$1',
    );
    expect(changed).not.toBe(place);
    expect(
      checkInstancePaths(changed, [file], project.scope).some(
        (c) => c.status === "failed" && c.detail.includes("not client-visible"),
      ),
    ).toBe(true);
  },
);

it("reports the actual runtime-created remote folder as pending instead of fabricating it in the exported hierarchy", () => {
  expect(
    checkInstancePaths(xml, p.artifact!.files, p.scope).some(
      (c) => c.status === "pending" && c.detail.includes("PunchRemoteEvents"),
    ),
  ).toBe(true);
});

it("checks path strings derived from the preserved config array without depending on field names", () => {
  const original = p.artifact!.files.find((f) =>
    f.path.includes("PunchConfig"),
  )!;
  const source = original.source.replace(
    '{ "Forge_8a81efe9b8ed", "Assets", "dummy", "dummy", "Imported", "Training Dummy" }',
    '"Workspace/Forge_8a81efe9b8ed/Assets/dummy/dummy/Imported/Training Dummy"',
  );
  expect(source).not.toBe(original.source);
  expect(
    checkInstancePaths(xml, [{ ...original, source }], p.scope).some(
      (c) => c.status === "failed" && c.detail.includes("nearest real path"),
    ),
  ).toBe(true);
});

it("propagates client execution through require into the real shared config module", () => {
  const b = structuredClone(p.artifact!);
  const config = b.files.find((f) => f.path.includes("PunchConfig"))!;
  config.source = config.source.replace(
    '{ "Forge_8a81efe9b8ed", "Assets", "dummy", "dummy", "Imported", "Training Dummy" }',
    '{ "ServerStorage", "Forge_8a81efe9b8ed", "Assets", "dummy", "dummy", "Training Dummy" }',
  );
  expect(
    checkInstancePaths(xml, b.files, p.scope).some(
      (c) =>
        c.status === "failed" &&
        c.detail.includes("PunchConfig") &&
        c.detail.includes("not client-visible"),
    ),
  ).toBe(true);
});
