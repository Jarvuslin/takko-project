import fs from "node:fs";
import assert from "node:assert/strict";
import { XMLParser } from "fast-xml-parser";
import type { Project } from "../src/generation/schema";

export const goldenRoot = "docs/results/approved-reference-finish-20260927";
/** Preserved source submissions are the input. Only the two nonexistent Imported
 * lookups change. Current native placement compatibility is a separate delta. */
export function derivedGolden() {
  const original: Project = JSON.parse(
    fs.readFileSync(goldenRoot + "/terminal-project.json", "utf8"),
  );
  const bundle = structuredClone(original.artifact!);
  const changes: { path: string; before: string; after: string }[] = [];
  for (const file of bundle.files) {
    const before = file.source;
    if (file.path.endsWith("PunchConfig.module.luau"))
      file.source = before.replace(', "Imported"', "");
    if (file.path.endsWith("DummySetup.server.luau"))
      file.source = before.replace(
        'local imported = dummyRoot:WaitForChild("Imported")',
        "local imported = dummyRoot",
      );
    if (before !== file.source)
      changes.push({ path: file.path, before, after: file.source });
  }
  assert.equal(changes.length, 2, "Preserved source contract changed");
  return { original, bundle, changes };
}

/** Independent oracle: read actual serialized names, classes and source text.
 * Does not call exportedHierarchy/checkInstancePaths or create expected nodes. */
export function inspectExport(xml: string) {
  const ordered = new XMLParser({
    preserveOrder: true,
    ignoreAttributes: false,
    parseTagValue: false,
    trimValues: false,
  }).parse(xml);
  const nodes: { path: string; className: string; source?: string }[] = [];
  const walk = (entries: any[], parents: string[]) => {
    for (const entry of entries) {
      if (entry.roblox) walk(entry.roblox, parents);
      if (!entry.Item) continue;
      const properties =
        entry.Item.find((e: any) => e.Properties)?.Properties ?? [];
      const name = properties.find(
        (e: any) => e.string && e[":@"]?.["@_name"] === "Name",
      )?.string;
      const text = (value: any[]) =>
        value
          ?.map(
            (v) =>
              v["#text"] ??
              v["#cdata"]?.map((c: any) => c["#text"]).join("") ??
              "",
          )
          .join("");
      assert.ok(name, "Exported instance has no serialized Name");
      const parts = [...parents, text(name)];
      const source = properties.find(
        (e: any) => e.ProtectedString && e[":@"]?.["@_name"] === "Source",
      )?.ProtectedString;
      nodes.push({
        path: parts.join("/"),
        className: entry[":@"]["@_class"],
        ...(source ? { source: text(source) } : {}),
      });
      walk(entry.Item, parts);
    }
  };
  walk(ordered, []);
  assert.ok(nodes.length, "Empty place");
  return nodes;
}
