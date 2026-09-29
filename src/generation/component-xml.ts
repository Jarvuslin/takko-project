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
/** Delivery overlay only. Never edits the retained original or executes rejected sources. */
export function disableReviewedScripts(component: NativeComponentXml, sources: string[]): NativeComponentXml {
  if (!sources.length) return component;
  if (hash(component.xml) !== component.sha256) throw Error("Component XML identity mismatch");
  const doc = parser.parse(component.xml);
  const visit = (elements: Element[]) => {
    for (const e of elements) if (e.Item) {
      const props = content(e, "Item").find(x => x.Properties)?.Properties ?? [];
      const source = props.find((x: Element) => x.ProtectedString && x[":@"]?.["@_name"] === "Source");
      if (source && sources.includes(itemName(e))) {
        // Empty ModuleScripts too: they have no Disabled property and can be required.
        source.ProtectedString = [{ "#text": "-- Disabled by the asset role review in the delivered copy." }];
        if (e[":@"]?.["@_class"] !== "ModuleScript") {
          const disabled = props.find((x: Element) => x.bool && x[":@"]?.["@_name"] === "Disabled");
          if (disabled) disabled.bool = [{ "#text": "true" }];
          else props.push({ bool: [{ "#text": "true" }], ":@": { "@_name": "Disabled" } });
        }
      }
      visit(content(e, "Item"));
    } else if (e.roblox) visit(e.roblox);
  };
  visit(doc);
  const xml = builder.build(doc);
  return { ...component, xml, sha256: hash(xml) };
}
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

/** Host naming overlay. Retained source XML and descendant names are untouched. */
export function nameComponentRoot(
  component: NativeComponentXml,
  name: string,
): NativeComponentXml {
  if (!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(name))
    throw Error("Invalid component instance name");
  if (hash(component.xml) !== component.sha256)
    throw Error("Component XML identity mismatch");
  const children = root(component.xml);
  const items = children.filter((e) => e.Item);
  if (items.length !== 1) throw Error("Expected one component root for naming");
  itemName(items[0]); // Validate one existing name before changing it.
  const properties = content(items[0], "Item").find((e) => e.Properties)!;
  const named = content(properties, "Properties").find(
    (e) => e.string && e[":@"]?.["@_name"] === "Name",
  )!;
  named.string = [{ "#text": name }];
  const xml = builder.build([{ roblox: children, ":@": { "@_version": "4" } }]);
  return { ...component, xml, sha256: hash(xml) };
}

/** Retains property types/values and source text; rewrites only local referents. */
export function anchorComponentParts(component: NativeComponentXml): NativeComponentXml {
  if(hash(component.xml)!==component.sha256) throw Error("Component XML identity mismatch");
  const children=root(component.xml);
  const visit=(elements:Element[])=>{
    for(const e of elements) if(e.Item) {
      if(["Part","MeshPart","UnionOperation","WedgePart","CornerWedgePart","TrussPart","Seat","VehicleSeat","SpawnLocation"].includes(e[":@"]?.["@_class"])) {
        const props=content(content(e,"Item").find(p=>p.Properties)!,"Properties");
        const anchored=props.find(p=>p.bool && p[":@"]?.["@_name"]==="Anchored");
        if(anchored) anchored.bool=[{"#text":"true"}];
        else props.push({bool:[{"#text":"true"}],":@":{"@_name":"Anchored"}});
      }
      visit(content(e,"Item"));
    }
  };
  visit(children);
  const xml=builder.build([{roblox:children,":@":{"@_version":"4"}}]);
  return {...component,xml,sha256:hash(xml)};
}

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
