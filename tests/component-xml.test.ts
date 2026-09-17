import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { exportBundle } from "../src/generation/export";
import {
  mergeNativeComponentXml,
  type NativeComponentXml,
} from "../src/generation/component-xml";
const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  trimValues: false,
});
const scope = "Forge_ComponentExport";
const empty = { files: [], scene: [], assets: [], coverage: [] };
const base = exportBundle(empty, scope);
const source =
  'local text = "<Ref name=\\"Part0\\">RBX1</Ref> & 001"\nreturn text';
const model = `<roblox version="4"><Item class="Model" referent="RBX1"><Properties><string name="Name">Imported</string><bool name="Sandboxed">true</bool><SecurityCapabilities name="Capabilities">123456789012345678</SecurityCapabilities><SharedString name="ModelMeshData">abc</SharedString></Properties><Item class="Part" referent="2"><Properties><string name="Name">Part</string><float name="Transparency">0.100000001</float></Properties></Item><Item class="Weld" referent="3"><Properties><string name="Name">Joint</string><Ref name="Part0">2</Ref><Ref name="Part1">null</Ref></Properties></Item><Item class="Script" referent="4"><Properties><string name="Name">Client</string><token name="RunContext">2</token><bool name="Disabled">false</bool><ProtectedString name="Source"><![CDATA[${source}]]></ProtectedString></Properties></Item></Item><SharedStrings><SharedString md5="abc">AAE=</SharedString></SharedStrings></roblox>`;
function artifact(
  xml = model,
  destinationPath = `Workspace/${scope}/Assets/first`,
): NativeComponentXml {
  return {
    xml,
    destinationPath,
    sha256: createHash("sha256").update(xml).digest("hex"),
  };
}
function walk(item: any): any[] {
  return [
    item,
    ...(Array.isArray(item.Item)
      ? item.Item
      : item.Item
        ? [item.Item]
        : []
    ).flatMap(walk),
  ];
}
function all(xml: string) {
  return parser.parse(xml).roblox.Item.flatMap(walk);
}

describe("native component XML export", () => {
  it("preserves complete property types, exact source and internal references while remapping collisions", () => {
    const result = exportBundle(empty, scope, [
      artifact(),
      artifact(model, `Workspace/${scope}/Assets/second`),
    ]);
    expect(XMLValidator.validate(result)).toBe(true);
    const nodes = all(result),
      ids = nodes.map((n: any) => n["@_referent"]);
    expect(new Set(ids).size).toBe(ids.length);
    const imported = nodes.filter(
      (n: any) => n.Properties.string?.["#text"] === "Imported",
    );
    expect(imported).toHaveLength(2);
    for (const m of imported) {
      expect(m.Properties.SecurityCapabilities["#text"]).toBe(
        "123456789012345678",
      );
      const parts = walk(m),
        part = parts.find((n) => n["@_class"] === "Part"),
        joint = parts.find((n) => n["@_class"] === "Weld"),
        script = parts.find((n) => n["@_class"] === "Script");
      expect(joint.Properties.Ref[0]["#text"]).toBe(part["@_referent"]);
      expect(joint.Properties.Ref[1]["#text"]).toBe("null");
      expect(script.Properties.ProtectedString["#text"]).toBe(source);
      expect(script.Properties.token["#text"]).toBe("2");
      expect(script.Properties.bool["#text"]).toBe("false");
      expect(part.Properties.float["#text"]).toBe("0.100000001");
    }
    expect(
      parser.parse(result).roblox.SharedStrings.SharedString["#text"],
    ).toBe("AAE=");
    expect(result).toContain("Sandboxed");
  });
  it("leaves legacy exports byte-identical when no components are supplied", () => {
    expect(mergeNativeComponentXml(base, scope, [])).toBe(base);
    expect(exportBundle(empty, scope, [])).toBe(base);
  });
  it.each([
    ["malformed XML", model.slice(0, -9), "Invalid component XML"],
    [
      "external reference",
      model.replace('<Ref name="Part0">2', '<Ref name="Part0">RBX999'),
      "escapes",
    ],
    [
      "duplicate referent",
      model.replace('referent="2"', 'referent="RBX1"'),
      "Duplicate",
    ],
    [
      "missing shared payload",
      model.replace(
        '<SharedStrings><SharedString md5="abc">AAE=</SharedString></SharedStrings>',
        "",
      ),
      "Missing component shared",
    ],
    [
      "multiple roots",
      model.replace(
        "<SharedStrings>",
        '<Item class="Model" referent="other"><Properties><string name="Name">Other</string></Properties></Item><SharedStrings>',
      ),
      "one component root",
    ],
    [
      "service root",
      model.replace('class="Model"', 'class="Workspace"'),
      "one component root",
    ],
    [
      "DTD",
      model.replace("<roblox", "<!DOCTYPE roblox><roblox"),
      "declaration",
    ],
    ["non-version-4", model.replace('version="4"', 'version="3"'), "version 4"],
    [
      "duplicate name property",
      model.replace(
        '<string name="Name">Imported</string>',
        '<string name="Name">Imported</string><string name="Name">Other</string>',
      ),
      "one Name",
    ],
  ])("rejects %s before exporting", (_name, xml, error) => {
    expect(() => exportBundle(empty, scope, [artifact(xml)])).toThrow(error);
  });
  it("rejects content tampering against its expected digest", () => {
    expect(() =>
      exportBundle(empty, scope, [{ ...artifact(), xml: model + " " }]),
    ).toThrow("identity");
  });
  it("rejects conflicting shared payloads instead of corrupting another component", () => {
    expect(() =>
      exportBundle(empty, scope, [
        artifact(),
        artifact(
          model.replace("AAE=", "AgM="),
          `Workspace/${scope}/Assets/second`,
        ),
      ]),
    ).toThrow("Conflicting shared");
  });
  it.each([
    `Workspace/Other/asset`,
    `Workspace/${scope}/../asset`,
    `Workspace/${scope}/Assets/first/../bad`,
  ])("rejects escaping destination %s", (destination) => {
    expect(() =>
      exportBundle(empty, scope, [artifact(model, destination)]),
    ).toThrow("namespace");
  });
  it("rejects overlapping component destinations and generated content collisions", () => {
    expect(() =>
      exportBundle(empty, scope, [
        artifact(),
        artifact(model, `Workspace/${scope}/Assets/first/child`),
      ]),
    ).toThrow("overlap");
    expect(() =>
      exportBundle(
        {
          ...empty,
          scene: [
            {
              path: `Workspace/${scope}/Assets/first`,
              className: "Folder",
              properties: {},
            },
          ],
        },
        scope,
        [artifact()],
      ),
    ).toThrow("collides");
  });
});
