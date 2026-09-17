import { expect, it } from "vitest";
import { bundleSchema } from "../src/generation/schema";
import {
  sceneClasses,
  scenePropertyError,
} from "../src/generation/capabilities";
import { contractFeedback } from "../src/generation/diagnostics";
import { exportBundle } from "../src/generation/export";
import { validateBundle } from "../src/generation/validation";
import { newProject } from "../src/generation/store";

it("uses the native class catalog for textures, interaction and UI without accepting services or script containers", () => {
  for (const name of [
    "Texture",
    "Decal",
    "ClickDetector",
    "ScrollingFrame",
    "TextBox",
    "UIGridLayout",
    "UIScale",
    "UIAspectRatioConstraint",
  ])
    expect(sceneClasses).toContain(name);
  for (const name of [
    "Workspace",
    "HttpService",
    "Script",
    "ModuleScript",
    "LocalScript",
    "InventedClass",
  ])
    expect(sceneClasses).not.toContain(name);
});
it("rejects invalid property names, types and enum values before Studio", () => {
  expect(
    scenePropertyError("Texture", "Face", {
      type: "Enum",
      enum: "NormalId",
      value: 1,
    }),
  ).toBeNull();
  expect(
    scenePropertyError("Texture", "Face", {
      type: "Enum",
      enum: "Top",
      value: 0,
    }),
  ).toContain("Enum.NormalId");
  expect(
    scenePropertyError("Texture", "Face", {
      type: "Enum",
      enum: "NormalId",
      value: 99,
    }),
  ).toContain("Enum.NormalId");
  expect(scenePropertyError("Part", "Scale", 2)).toContain("not a writable");
  expect(scenePropertyError("Part", "Anchored", "true")).toContain(
    "requires boolean",
  );
  expect(
    scenePropertyError("Part", "Size", { type: "Vector3", value: [1, 1, 1] }),
  ).toBeNull();
});
it("reports distinct property problems together rather than spending a model correction on each node", () => {
  const p = newProject("A small scene", 1e6);
  const b = bundleSchema.parse({
    files: [],
    assets: [],
    coverage: [],
    scene: [
      ...Array.from({ length: 12 }, (_, i) => ({
        path: `Workspace/${p.scope}/Rock${i}`,
        className: "Part",
        properties: { Material: "NotAMaterial" },
      })),
      {
        path: `Workspace/${p.scope}/Label`,
        className: "TextLabel",
        properties: { Font: "NotAFont" },
      },
    ],
  });
  const result = validateBundle(b, p).find((c) => c.id === "structure")!;
  expect(result.status).toBe("failed");
  expect(result.detail).toContain("Part.Material requires Enum.Material");
  expect(result.detail).toContain("TextLabel.Font requires Enum.Font");
  expect(result.detail).toContain("(+9 more)");
  expect(result.detail).toContain(`/Label.Font`);
  expect(result.detail.match(/Part.Material requires/g)).toHaveLength(1);
});
it("describes the offending object instead of emitting hundreds of enum options", () => {
  const input = {
    scene: [
      {
        path: "Workspace/Forge_Test/Cookie",
        className: "CookieShape",
        properties: {},
      },
    ],
  };
  const result = bundleSchema.safeParse(input);
  expect(result.success).toBe(false);
  if (!result.success) {
    const message = contractFeedback(result.error, input);
    expect(message).toContain('"CookieShape"');
    expect(message).toContain("Workspace/Forge_Test/Cookie");
    expect(message.length).toBeLessThan(400);
    expect(message).not.toContain("expected one of");
  }
});
it("exports a supported Texture and face enum through the same manifest", () => {
  const bundle = bundleSchema.parse({
    scene: [
      {
        path: "Workspace/Forge_Test/Cookie",
        className: "Part",
        properties: {},
      },
      {
        path: "Workspace/Forge_Test/Cookie/Texture",
        className: "Texture",
        properties: {
          Face: { type: "Enum", enum: "NormalId", value: 1 },
          Texture: "rbxassetid://123",
        },
      },
    ],
  });
  const result = exportBundle(bundle, "Forge_Test");
  expect(result).toContain('<Item class="Texture"');
  expect(result).toContain('<token name="Face">1</token>');
  expect(result).toContain(
    '<Content name="Texture"><url>rbxassetid://123</url></Content>',
  );
});
it("rejects invented built-in texture paths even when the model omits the asset declaration", () => {
  const p = newProject("Make a cookie game", 1e6);
  const b = bundleSchema.parse({
    scene: [
      {
        path: `Workspace/${p.scope}/Cookie/Texture`,
        className: "Texture",
        properties: { Texture: "rbxasset://textures/ui/Cookie.png" },
      },
    ],
  });
  expect(
    validateBundle(b, p).some(
      (c) => c.id.startsWith("unknown-builtin:") && c.status === "failed",
    ),
  ).toBe(true);
  b.scene[0].properties.Texture =
    "rbxasset://textures/particles/smoke_main.dds";
  expect(
    validateBundle(b, p).some((c) => c.id.startsWith("unknown-builtin:")),
  ).toBe(false);
});
