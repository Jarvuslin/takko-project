import { it, expect } from "vitest";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { exportBundle } from "../src/generation/export";
import { newProject } from "../src/generation/store";
import { fixtureBundle } from "./generation-fixtures";
import { instancePath } from "../src/generation/validation";
it("exports explicit module suffixes with the runtime names used by require", () => {
  const p = newProject("Build a character game", 1e6);
  const b = fixtureBundle(p.request, p.scope);
  const modulePath = `ReplicatedStorage/${p.scope}/PlayerModels.module.luau`;
  b.files.push({ path: modulePath, kind: "ModuleScript", source: "return {}" });
  expect(instancePath(modulePath)).toBe(
    `ReplicatedStorage/${p.scope}/PlayerModels`,
  );
  expect(exportBundle(b, p.scope)).toContain(
    '<string name="Name">PlayerModels</string>',
  );
  expect(exportBundle(b, p.scope)).not.toContain(
    '<string name="Name">PlayerModels.module</string>',
  );
});
it("serializes generated geometry, UI dimensions, enum values and asset content without changing source text", () => {
  const p = newProject("Build a farming game", 1e6),
    b = fixtureBundle(p.request, p.scope);
  b.files[0].source = 'local text = "<tag> & \\"quote\\""';
  b.scene.push(
    {
      path: "StarterGui/" + p.scope + "/Screen",
      className: "ScreenGui",
      properties: { Enabled: true },
    },
    {
      path: "StarterGui/" + p.scope + "/Screen/Icon",
      className: "ImageLabel",
      properties: {
        Image: "rbxassetid://123",
        Position: { type: "UDim2", value: [0, 10, 1, -20] },
        BackgroundTransparency: 1,
        ScaleType: { type: "Enum", enum: "ScaleType", value: 0 },
      },
    },
  );
  const result = exportBundle(b, p.scope);
  expect(XMLValidator.validate(result)).toBe(true);
  expect(result).toContain(
    '<Content name="Image"><url>rbxassetid://123</url></Content>',
  );
  expect(result).toContain(
    '<UDim2 name="Position"><XS>0</XS><XO>10</XO><YS>1</YS><YO>-20</YO></UDim2>',
  );
  expect(result).toContain('<token name="ScaleType">0</token>');
  expect(result).not.toContain("ArenaFloor");
  const parsed = new XMLParser({ ignoreAttributes: false }).parse(result);
  expect(JSON.stringify(parsed)).toContain("local text");
});
