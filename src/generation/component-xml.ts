import { createHash } from "node:crypto";
import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";
import { safePath } from "./validation";

/** Explicit host-supplied artifacts, never part of a model-authored Bundle. */
export type NativeComponentXml = {
  destinationPath: string;
  xml: string;
  sha256: string;
};
type Element = { [key: string]: any };
const options = {
  preserveOrder: true,
  ignoreAttributes: false,
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: false,
  cdataPropName: "#cdata",
  commentPropName: "#comment",
};
const parser = new XMLParser(options);
const builder = new XMLBuilder(options);
const hash = (text: string) => createHash("sha256").update(text).digest("hex");
const meaningful = (elements: Element[]) =>
  elements.filter(
    (e) =>
      !("#comment" in e) &&
      !("?xml" in e) &&
      !("#text" in e && /^\s*$/.test(e["#text"])),
  );
function content(element: Element, tag: string): Element[] {
  if (!Array.isArray(element[tag]))
    throw Error("Malformed component XML " + tag);
  return element[tag];
}
function scalar(element: Element, tag: string): string {
  const children = content(element, tag);
  if (children.some((e) => Object.keys(e).some((key) => key !== "#text")))
    throw Error("Non-text component XML " + tag);
  return children.map((e) => e["#text"] ?? "").join("");
}
function root(text: string): Element[] {
  if (
    Buffer.byteLength(text) > 16 * 1024 * 1024 ||
    /<!DOCTYPE|<!ENTITY/i.test(text)
  )
    throw Error("Component XML size or declaration is unsupported");
  if (XMLValidator.validate(text) !== true)
    throw Error("Invalid component XML");
  const top = meaningful(parser.parse(text));
  if (top.length !== 1 || !top[0].roblox || top[0][":@"]?.["@_version"] !== "4")
    throw Error("Expected one Roblox version 4 document");
  const children = meaningful(content(top[0], "roblox"));
  if (
    children.some((e) => !e.Item && !e.SharedStrings && !e.External && !e.Meta)
  )
    throw Error("Unsupported component document element");
  return children;
}
function itemName(item: Element) {
  const properties = content(item, "Item").filter((e) => e.Properties);
  if (properties.length !== 1)
    throw Error("Component item requires one Properties block");
  const names = content(properties[0], "Properties").filter(
    (e) => e.string && e[":@"]?.["@_name"] === "Name",
  );
  if (names.length !== 1) throw Error("Component item requires one Name");
  return scalar(names[0], "string");
}
function folder(name: string, referent: string): Element {
  return {
    Item: [
      {
        Properties: [
          { string: [{ "#text": name }], ":@": { "@_name": "Name" } },
        ],
      },
    ],
    ":@": { "@_class": "Folder", "@_referent": referent },
  };
}

/** Retains property types/values and source text; rewrites only local referents. */
export function mergeNativeComponentXml(
  baseXml: string,
  scope: string,
  components: NativeComponentXml[],
): string {
  if (!components.length) return baseXml;
  if (components.length > 16) throw Error("Too many native components");
  if (
    Buffer.byteLength(baseXml) +
      components.reduce((n, c) => n + Buffer.byteLength(c.xml), 0) >
    64 * 1024 * 1024
  )
    throw Error("Combined component input exceeds export bound");
  const paths = components.map((c) => safePath(c.destinationPath, scope));
  if (
    paths.some((p, i) =>
      paths.some((q, j) => i !== j && (p === q || p.startsWith(q + "/"))),
    )
  )
    throw Error("Component destinations overlap");
  const base = root(baseXml);
  const shared = new Map<string, Element>();
  const used = new Set<string>();
  let sequence = 0;
  function allocate() {
    let id: string;
    do {
      id = "TakkoNative" + ++sequence;
    } while (used.has(id));
    used.add(id);
    return id;
  }
  function items(
    elements: Element[],
    visit: (item: Element) => void,
    depth = 0,
  ) {
    if (depth > 100) throw Error("Component XML hierarchy exceeds depth bound");
    for (const e of elements)
      if (e.Item) {
        visit(e);
        items(content(e, "Item"), visit, depth + 1);
      }
  }
  items(base, (item) => {
    const id = item[":@"]?.["@_referent"];
    if (typeof id !== "string" || used.has(id))
      throw Error("Invalid base referent");
    used.add(id);
  });
  function collectShared(elements: Element[]) {
    const local = new Set<string>();
    for (const block of elements.filter((e) => e.SharedStrings))
      for (const entry of meaningful(content(block, "SharedStrings"))) {
        if (!entry.SharedString) throw Error("Invalid SharedStrings entry");
        const id = entry[":@"]?.["@_md5"];
        if (typeof id !== "string" || !id || local.has(id))
          throw Error("Duplicate or invalid shared string identity");
        local.add(id);
        const previous = shared.get(id);
        if (
          previous &&
          scalar(previous, "SharedString") !== scalar(entry, "SharedString")
        )
          throw Error("Conflicting shared string payload");
        if (!previous) shared.set(id, entry);
      }
    return local;
  }
  collectShared(base);
  for (const [componentIndex, component] of components.entries()) {
    if (
      !/^[a-f0-9]{64}$/.test(component.sha256) ||
      hash(component.xml) !== component.sha256
    )
      throw Error("Component XML identity mismatch");
    const document = root(component.xml),
      imported = document.filter((e) => e.Item);
    if (
      imported.length !== 1 ||
      [
        "DataModel",
        "Workspace",
        "ServerStorage",
        "ServerScriptService",
        "ReplicatedStorage",
        "StarterGui",
        "StarterPlayer",
      ].includes(imported[0][":@"]?.["@_class"])
    )
      throw Error("Expected one component root, not a service or place");
    const strings = collectShared(document),
      refs = new Map<string, string>();
    let count = 0;
    items(imported, (item) => {
      if (++count > 3000) throw Error("Component XML instance bound exceeded");
      itemName(item);
      const id = item[":@"]?.["@_referent"];
      if (
        typeof id !== "string" ||
        !id ||
        id === "null" ||
        id === "nil" ||
        refs.has(id)
      )
        throw Error("Duplicate or invalid component referent");
      refs.set(id, allocate());
    });
    items(imported, (item) => {
      item[":@"]["@_referent"] = refs.get(item[":@"]["@_referent"]);
      for (const properties of content(item, "Item").filter(
        (e) => e.Properties,
      ))
        for (const prop of content(properties, "Properties")) {
          if (prop.Ref) {
            const value = scalar(prop, "Ref");
            if (value !== "null" && value !== "nil") {
              const remapped = refs.get(value);
              if (!remapped)
                throw Error("Component reference escapes retained hierarchy");
              prop.Ref = [{ "#text": remapped }];
            }
          }
          if (prop.SharedString && !strings.has(scalar(prop, "SharedString")))
            throw Error("Missing component shared string payload");
        }
    });
    let siblings = base;
    const segments = paths[componentIndex].split("/");
    for (const [i, segment] of segments.entries()) {
      const matches = siblings.filter((e) => e.Item && itemName(e) === segment);
      if (matches.length > 1) throw Error("Ambiguous component destination");
      if (i === segments.length - 1 && matches.length)
        throw Error("Component destination collides with generated content");
      let match = matches[0];
      if (!match) {
        if (i === 0) throw Error("Missing destination service");
        match = folder(segment, allocate());
        siblings.push(match);
      }
      siblings = content(match, "Item");
    }
    siblings.push(imported[0]);
  }
  const body = base.filter((e) => !e.SharedStrings);
  if (shared.size) body.push({ SharedStrings: [...shared.values()] });
  const output = builder.build([{ roblox: body, ":@": { "@_version": "4" } }]);
  if (Buffer.byteLength(output) > 64 * 1024 * 1024)
    throw Error("Combined place exceeds export bound");
  return output;
}
