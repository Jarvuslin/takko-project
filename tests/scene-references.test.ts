import { it, expect } from "vitest";
import { XMLParser } from "fast-xml-parser";
import { bundleSchema } from "../src/generation/schema";
import { validateBundle } from "../src/generation/validation";
import { exportBundle } from "../src/generation/export";
import { newProject } from "../src/generation/store";

function rig() {
  const p = newProject("Create an animated character", 1e6);
  const root = `Workspace/${p.scope}/Character`;
  const ref = (name: string) => ({ type: "Ref", path: root + "/" + name });
  const b = bundleSchema.parse({
    scene: [
      {
        path: root,
        className: "Model",
        properties: { PrimaryPart: ref("Root") },
      },
      {
        path: root + "/Neck",
        className: "Motor6D",
        properties: { Part0: ref("Root"), Part1: ref("Head") },
      },
      {
        path: root + "/Humanoid",
        className: "Humanoid",
        properties: { RequiresNeck: false },
      },
      {
        path: root + "/Humanoid/Animator",
        className: "Animator",
        properties: {},
      },
      {
        path: root + "/Outline",
        className: "Highlight",
        properties: { Adornee: { type: "Ref", path: root } },
      },
      {
        path: root + "/Root",
        className: "Part",
        properties: { Anchored: true },
      },
      {
        path: root + "/Head",
        className: "Part",
        properties: { Anchored: false },
      },
      {
        path: root + "/Weld",
        className: "WeldConstraint",
        properties: { Part0: ref("Root"), Part1: { type: "Ref", path: null } },
      },
    ],
  });
  return { p, b, root };
}
it("accepts character classes and exports forward joint references to real XML referents", () => {
  const { p, b } = rig();
  expect(validateBundle(b, p).every((c) => c.status === "passed")).toBe(true);
  const doc = new XMLParser({ ignoreAttributes: false }).parse(
    exportBundle(b, p.scope),
  );
  const items: any[] = [];
  function collect(n: any) {
    for (const x of Array.isArray(n) ? n : [n]) {
      if (!x) continue;
      items.push(x);
      collect(x.Item ?? []);
    }
  }
  collect(doc.roblox.Item);
  const named = (name: string) =>
    items.find((n) => n.Properties?.string?.["#text"] === name);
  const refs = named("Neck").Properties.Ref;
  expect(refs.find((r: any) => r["@_name"] === "Part0")["#text"]).toBe(
    named("Root")["@_referent"],
  );
  expect(refs.find((r: any) => r["@_name"] === "Part1")["#text"]).toBe(
    named("Head")["@_referent"],
  );
  expect(exportBundle(b, p.scope)).toContain('<Ref name="Part1">null</Ref>');
});
it("rejects missing, external and wrong-class references before Studio application", () => {
  for (const target of ["Workspace/Other/Root", "missing", "Humanoid"]) {
    const { p, b, root } = rig();
    b.scene[1].properties.Part0 = {
      type: "Ref",
      path: target.startsWith("Workspace") ? target : root + "/" + target,
    };
    expect(validateBundle(b, p).find((c) => c.id === "structure")?.status).toBe(
      "failed",
    );
  }
  const { p, b, root } = rig();
  b.scene[1].properties.Part0 = root + "/Root";
  expect(
    validateBundle(b, p).find((c) => c.id === "structure")?.detail,
  ).toContain("requires");
  b.scene[1].properties.Part0 = { type: "Ref", path: root + "/Missing" };
  expect(() => exportBundle(b, p.scope)).toThrow("Missing reference target");
});
