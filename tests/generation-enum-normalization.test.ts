import { expect, it } from "vitest";
import {
  normalizeKnownEnumValue,
  normalizeKnownSceneEnums,
} from "../src/generation/normalize-scene";
import {
  capabilities,
  scenePropertyError,
} from "../src/generation/capabilities";
import type { Bundle } from "../src/generation/schema";

it("canonicalizes the actual Material and Font names that caused sequential paid-trial rejections", () => {
  const bundle: Bundle = {
    files: [],
    coverage: [],
    assets: [],
    scene: [
      {
        path: "Workspace/Scope/Ground",
        className: "Part",
        properties: { Anchored: true, Material: "Slate" },
      },
      {
        path: "Workspace/Scope/Spawn",
        className: "SpawnLocation",
        properties: { Material: "Enum.Material.Metal" },
      },
      {
        path: "Workspace/Scope/Label",
        className: "TextLabel",
        properties: { Text: "SELL • 5 COINS / CRYSTAL", Font: "GothamBold" },
      },
    ],
  };
  const before = structuredClone(bundle),
    canonical = normalizeKnownSceneEnums(bundle);
  expect(canonical.scene[0].properties.Material).toEqual({
    type: "Enum",
    enum: "Material",
    value: capabilities.enums.Material.Slate,
  });
  expect(canonical.scene[1].properties.Material).toEqual({
    type: "Enum",
    enum: "Material",
    value: capabilities.enums.Material.Metal,
  });
  expect(canonical.scene[2].properties.Font).toEqual({
    type: "Enum",
    enum: "Font",
    value: capabilities.enums.Font.GothamBold,
  });
  expect(canonical.scene[2].properties.Text).toBe("SELL • 5 COINS / CRYSTAL");
  for (const node of canonical.scene)
    for (const [name, value] of Object.entries(node.properties))
      expect(scenePropertyError(node.className, name, value)).toBeNull();
  expect(bundle).toEqual(before);
  expect(normalizeKnownSceneEnums(canonical)).toEqual(canonical);
});
it.each([
  "slate",
  " Slate",
  "Slate ",
  "Enum.Font.Slate",
  "Material.Slate",
  "InventedSlate",
  "__proto__",
])("does not guess or reinterpret invalid enum name %s", (value) => {
  const canonical = normalizeKnownEnumValue("Part", "Material", value);
  expect(canonical).toBe(value);
  expect(scenePropertyError("Part", "Material", canonical)).not.toBeNull();
});
it("does not change ordinary strings, unknown properties, numeric guesses or invalid typed descriptors", () => {
  expect(normalizeKnownEnumValue("TextLabel", "Text", "GothamBold")).toBe(
    "GothamBold",
  );
  expect(normalizeKnownEnumValue("Part", "UnknownProperty", "Slate")).toBe(
    "Slate",
  );
  expect(
    normalizeKnownEnumValue(
      "Part",
      "Material",
      capabilities.enums.Material.Slate,
    ),
  ).toBe(capabilities.enums.Material.Slate);
  const wrong = {
    type: "Enum" as const,
    enum: "Font",
    value: capabilities.enums.Font.GothamBold,
  };
  expect(normalizeKnownEnumValue("Part", "Material", wrong)).toBe(wrong);
  expect(scenePropertyError("Part", "Material", wrong)).not.toBeNull();
});
it("every accepted exact enum name is supported by that class property in the native snapshot", () => {
  let checked = 0;
  for (const className of ["Part", "TextLabel", "SpawnLocation", "WedgePart"]) {
    for (const [name, property] of Object.entries(
      capabilities.classes[className].properties,
    )) {
      if (!property.enum) continue;
      for (const item of Object.keys(capabilities.enums[property.enum] ?? {})) {
        expect(
          scenePropertyError(
            className,
            name,
            normalizeKnownEnumValue(className, name, item),
          ),
        ).toBeNull();
        checked++;
      }
    }
  }
  expect(checked).toBeGreaterThan(20);
});
