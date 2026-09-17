import { describe, it, expect } from "vitest";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { generateArtifact, exportPlace } from "../src/core/recipe";
import { createHash } from "node:crypto";
describe("Roblox artifact integrity", () => {
  it("exports valid XML with exact original scripts and all service containers", () => {
    const a = generateArtifact({
      style: "jade",
      device: "both",
      pace: "quick",
    });
    const xml = exportPlace(a);
    expect(XMLValidator.validate(xml)).toBe(true);
    const parsed = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: false,
    }).parse(xml);
    expect(
      parsed.roblox.Item.map((i: { "@_class": string }) => i["@_class"]),
    ).toEqual([
      "Workspace",
      "ReplicatedStorage",
      "ServerScriptService",
      "StarterPlayer",
    ]);
    const scripts: string[] = [];
    const walk = (node: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(node)) {
        if (key === "ProtectedString")
          scripts.push((value as { "#text": string })["#text"]);
        else if (value && typeof value === "object") {
          if (Array.isArray(value)) value.forEach(walk);
          else walk(value as Record<string, unknown>);
        }
      }
    };
    walk(parsed);
    expect(scripts).toHaveLength(4);
    for (const file of a.files) {
      expect(scripts).toContain(file.source.trim());
      expect(file.sha256).toBe(
        createHash("sha256").update(file.source).digest("hex"),
      );
    }
  });
  it("escapes script markup without changing decoded source", () => {
    const a = generateArtifact({});
    a.files[0].source = 'return "<&>\\\"" -- </ProtectedString>';
    const xml = exportPlace(a);
    expect(XMLValidator.validate(xml)).toBe(true);
    expect(xml).toContain("&lt;/ProtectedString&gt;");
  });
  it("fails rather than shipping an incomplete place", () => {
    const a = generateArtifact({});
    a.files.pop();
    expect(() => exportPlace(a)).toThrow(/Missing required source/);
  });
  it.each(["cinder", "jade", "violet"] as const)(
    "generates repeatable %s artifacts with no random asset IDs",
    (style) => {
      const choices = {
        style,
        pace: "quick" as const,
        device: "both" as const,
      };
      expect(generateArtifact(choices)).toEqual(generateArtifact(choices));
      expect(
        generateArtifact(choices).files.some((f) =>
          f.source.includes("rbxassetid://"),
        ),
      ).toBe(false);
    },
  );
});
