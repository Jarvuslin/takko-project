import type { Bundle, Check } from "./schema";
import { XMLParser } from "fast-xml-parser";
import { runtimeSourceAst } from "./runtime-source-check";
import { instancePath } from "./validation";

// Container contents, not merely properties tagged NotReplicated.
// https://create.roblox.com/docs/reference/engine/classes/ServerStorage
// https://create.roblox.com/docs/reference/engine/classes/ServerScriptService
// KeyframeSequence is deliberately absent: the current docs do not mark it
// non-replicating, and the preserved scratch Play probe found it on both sides.
export const serverOnlyContainers = new Set([
  "ServerStorage",
  "ServerScriptService",
]);
// Class tag, not a property tag:
// https://create.roblox.com/docs/reference/engine/classes/Camera
export const nonReplicatingClasses = new Set(["Camera"]);

export function exportedHierarchy(xml: string) {
  const parsed = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
  }).parse(xml);
  const nodes = new Map<string, string>();
  const list = (v: any): any[] =>
    v === undefined ? [] : Array.isArray(v) ? v : [v];
  const visit = (item: any, parent: string) => {
    const name = list(item.Properties?.string).find(
      (p) => p["@_name"] === "Name",
    )?.["#text"];
    if (typeof name !== "string") throw Error("Export item has no Name");
    const path = parent ? parent + "/" + name : name;
    nodes.set(path, item["@_class"]);
    list(item.Item).forEach((c) => visit(c, path));
  };
  list(parsed.roblox?.Item).forEach((i) => visit(i, ""));
  return nodes;
}

type Value = string | { path: string } | undefined;
/** Bounded static resolution. Unknown dynamic lookups are reported pending,
 * never passed. This is not an interpreter or a proof of runtime availability. */
export function checkInstancePaths(
  xml: string,
  files: Bundle["files"],
  scope: string,
): Check[] {
  const nodes = exportedHierarchy(xml);
  const results = new Map<string, Check>();
  const observations: { file: string; path: string; location: string }[] = [];
  const dependencies = new Map<string, Set<string>>();
  const clientFiles = new Set(
    files
      .filter(
        (f) =>
          f.kind === "LocalScript" ||
          f.path.startsWith("StarterPlayer/") ||
          f.path.startsWith("StarterGui/"),
      )
      .map((f) => instancePath(f.path)),
  );
  const created = new Set<string>();
  const key = (n: any) => JSON.stringify(n?.local ?? n);
  const pathOf = (v: Value) => (typeof v === "object" ? v.path : undefined);
  for (const file of files) {
    let ast: any;
    try {
      ast = runtimeSourceAst(file.source);
    } catch (e) {
      results.set(file.path, {
        id: "instance-path:parse:" + file.path,
        status: "failed",
        detail: file.path + ": " + (e as Error).message,
      });
      continue;
    }
    const aliases = new Map<string, Value>();
    const newInstances = new Map<string, { name?: string; parent?: string }>();
    const report = (path: string, location: string) => {
      if (path.split("/").includes(scope))
        observations.push({ file: file.path, path, location });
    };
    const expr = (n: any): Value => {
      if (!n) return;
      if (n.type === "AstExprConstantString") return n.value;
      if (n.type === "AstExprLocal") return aliases.get(key(n));
      if (n.type === "AstExprGroup" || n.type === "AstExprTypeAssertion")
        return expr(n.expr);
      if (n.type === "AstExprGlobal") {
        if (n.global === "game") return { path: "" };
        if (n.global === "workspace" || n.global === "Workspace")
          return { path: "Workspace" };
        if (n.global === "script") return { path: instancePath(file.path) };
      }
      if (n.type === "AstExprIndexName" || n.type === "AstExprIndexExpr") {
        const parent = pathOf(expr(n.expr));
        const name = n.type === "AstExprIndexName" ? n.index : expr(n.index);
        if (parent !== undefined && typeof name === "string") {
          if (name === "Parent")
            return { path: parent.split("/").slice(0, -1).join("/") };
          const path = parent ? parent + "/" + name : name;
          // Do not turn arbitrary properties (Position, Health, etc.) into instances.
          if (
            nodes.has(path) ||
            parent === "" ||
            parent.split("/").includes(scope)
          )
            return { path };
        }
      }
      if (n.type === "AstExprCall") {
        const fn = n.func;
        const method = fn?.index;
        const parent = pathOf(expr(fn?.expr));
        const arg = expr(n.args?.[0]);
        if (method === "GetService" && parent === "" && typeof arg === "string")
          return { path: arg };
        if (
          ["WaitForChild", "FindFirstChild"].includes(method) &&
          parent !== undefined
        ) {
          if (typeof arg === "string") {
            const path = parent ? parent + "/" + arg : arg;
            report(path, n.location);
            return { path };
          }
          if (parent.split("/").includes(scope)) {
            const id = "instance-path:dynamic:" + file.path + ":" + n.location;
            results.set(id, {
              id,
              status: "pending",
              detail:
                file.path +
                ": dynamic lookup under " +
                parent +
                " requires runtime verification (" +
                n.location +
                ")",
            });
          }
        }
        if (fn?.global === "require") {
          const target = pathOf(arg);
          if (target) {
            const owner = instancePath(file.path);
            const deps = dependencies.get(owner) ?? new Set();
            deps.add(target);
            dependencies.set(owner, deps);
          }
        }
      }
    };
    const config = (n: any) => {
      let segments: string[] | undefined;
      if (
        n.type === "AstExprTable" &&
        n.items?.length &&
        n.items.every(
          (i: any) => i.kind === "item" && typeof expr(i.value) === "string",
        )
      )
        segments = n.items.map((i: any) => expr(i.value));
      if (n.type === "AstExprConstantString" && /[/.]/.test(n.value))
        segments = n.value
          .replace(/^game[/.]/, "")
          .split(n.value.includes("/") ? "/" : ".");
      if (!segments?.includes(scope) || segments.length < 2) return;
      const explicit = nodes.has(segments[0]) && segments[0] !== scope;
      const candidates = explicit
        ? [segments.join("/")]
        : [...nodes.keys()]
            .filter((p) => p.endsWith("/" + scope))
            .map(
              (p) =>
                p +
                "/" +
                segments!.slice(segments!.indexOf(scope) + 1).join("/"),
            );
      const exact = candidates.find((p) => nodes.has(p));
      // Resolve relative config paths against the longest real hierarchy prefix.
      const score = (p: string) =>
        p
          .split("/")
          .reduce(
            (n, _, i, a) =>
              nodes.has(a.slice(0, i + 1).join("/")) ? i + 1 : n,
            0,
          );
      const best = exact ?? candidates.sort((a, b) => score(b) - score(a))[0];
      if (best) report(best, n.location);
    };
    const visit = (n: any) => {
      if (!n || typeof n !== "object") return;
      if (n.type === "AstStatLocal" || n.type === "AstStatAssign") {
        n.vars?.forEach((v: any, i: number) => {
          const localKey =
            n.type === "AstStatLocal"
              ? key(v)
              : v.type === "AstExprLocal"
                ? key(v)
                : undefined;
          const value = n.values?.[i];
          if (localKey) {
            const resolved = expr(value);
            if (resolved !== undefined) aliases.set(localKey, resolved);
            if (
              value?.type === "AstExprCall" &&
              value.func?.index === "new" &&
              value.func.expr?.global === "Instance"
            )
              newInstances.set(localKey, {});
          }
          if (v.type === "AstExprIndexName") {
            const createdNode = newInstances.get(key(v.expr));
            if (createdNode) {
              const resolved = expr(value);
              if (v.index === "Name" && typeof resolved === "string")
                createdNode.name = resolved;
              if (v.index === "Parent") createdNode.parent = pathOf(resolved);
              if (createdNode.name && createdNode.parent)
                created.add(createdNode.parent + "/" + createdNode.name);
            }
          }
        });
      }
      config(n);
      if (n.type === "AstExprCall") expr(n);
      for (const child of Object.values(n)) {
        if (Array.isArray(child)) child.forEach(visit);
        else if (child && typeof child === "object") visit(child);
      }
    };
    visit(ast.root ?? ast);
  }
  for (let changed = true; changed;) {
    changed = false;
    for (const file of [...clientFiles])
      for (const target of dependencies.get(file) ?? [])
        if (!clientFiles.has(target)) {
          clientFiles.add(target);
          changed = true;
        }
  }
  const distance = (a: string[], b: string[]) => {
    let row = b.map((_, i) => i + 1);
    row.unshift(0);
    for (let i = 0; i < a.length; i++) {
      const next = [i + 1];
      for (let j = 0; j < b.length; j++)
        next.push(
          Math.min(
            next[j] + 1,
            row[j + 1] + 1,
            row[j] + (a[i] === b[j] ? 0 : 1),
          ),
        );
      row = next;
    }
    return row[b.length];
  };
  for (const o of observations) {
    const id = "instance-path:" + o.file + ":" + o.path;
    const client = clientFiles.has(instancePath(o.file));
    const hidden = o.path.split("/").some((_, i, a) => {
      const className = nodes.get(a.slice(0, i + 1).join("/")) ?? a[0];
      return (
        serverOnlyContainers.has(className) ||
        nonReplicatingClasses.has(className)
      );
    });
    let status: Check["status"] = "passed",
      detail = o.file + ": " + o.path;
    if (client && hidden) {
      status = "failed";
      detail +=
        " is not client-visible. Use a replicated interface or move client-required data to ReplicatedStorage.";
    } else if (!nodes.has(o.path)) {
      if (created.has(o.path)) {
        status = "pending";
        detail +=
          " is created by source at runtime, not present in the export. Verify creation order in Play.";
      } else {
        status = "failed";
        const near = [...nodes.keys()]
          .filter((p) => p.split("/").includes(scope))
          .sort(
            (a, b) =>
              distance(o.path.split("/"), a.split("/")) -
              distance(o.path.split("/"), b.split("/")),
          )[0];
        detail +=
          "; missing from exported hierarchy; nearest real path: " +
          (near ?? "none");
      }
    }
    results.set(id, { id, status, detail });
  }
  return [...results.values()];
}
