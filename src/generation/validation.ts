import { createHash, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { isDeepStrictEqual } from "node:util";
import fs from "node:fs";
import path from "node:path";
import type { Bundle, Check, Project, Spec } from "./schema";
import { unmetAssetRequirements } from "./asset-gaps";
import { architectureSources } from "./architecture";
import { bindRequirementSources } from "./requirements";
import {
  isRetrievedAsset,
  isInspectedApprovedReference,
  isRetrievedMeshProperty,
  retrievedContentIds,
  retrievedBundles,
  suppliedAssetReferences,
} from "./asset-provenance";
import { scenePropertyError } from "./capabilities";
import { sequenceAssetIssues } from "./scope-questions";
import { platformPlanningIssues } from "./platform-policy";
import builtins from "./roblox-builtin-assets.json";
const builtinAssets: Record<string, string> = builtins.assets;
export const roots = [
  "Workspace",
  "ReplicatedStorage",
  "ServerScriptService",
  "ServerStorage",
  "StarterGui",
  "StarterPlayer/StarterPlayerScripts",
];
export const instancePath = (p: string) =>
  p.replace(/(?:\.server|\.client|\.module)?\.luau$/, "");
export function safePath(p: string, scope: string) {
  if (
    !roots.some((r) => p.startsWith(r + "/" + scope + "/")) ||
    !p
      .split("/")
      .every((s) => /^[A-Za-z0-9_ .-]+$/.test(s) && s !== "." && s !== "..") ||
    p.split("/").length > 14
  )
    throw Error("Path must stay inside the project namespace: " + p);
  return p;
}
export function validateSpec(
  s: Spec,
  p: Project,
  options: { partial?: boolean } = {},
) {
  const bound = bindRequirementSources(s, p);
  s = bound.spec;
  const errors: string[] = [...bound.errors, ...sequenceAssetIssues(s.assetNeeds??[],p),...platformPlanningIssues(p,s)];
  for (const source of options.partial
    ? []
    : architectureSources(p.architecture)) {
    const requirement = s.requirements.find(
      (r) =>
        r.origin === "user" &&
        r.sourceId === source.id &&
        r.priority === "required",
    );
    if (!requirement)
      errors.push(`Architecture contract not planned: ${source.id}`);
  }
  const ids = new Set(s.requirements.map((r) => r.id));
  if (ids.size !== s.requirements.length)
    errors.push(
      "Duplicate requirement IDs: " +
        s.requirements
          .filter(
            (r, i) =>
              s.requirements.findIndex((other) => other.id === r.id) !== i,
          )
          .map((r) => r.id)
          .join(", "),
    );
  const tasks = new Map(s.tasks.map((t) => [t.id, t]));
  if (tasks.size !== s.tasks.length)
    errors.push(
      "Duplicate task IDs: " +
        s.tasks
          .filter(
            (t, i) => s.tasks.findIndex((other) => other.id === t.id) !== i,
          )
          .map((t) => t.id)
          .join(", "),
    );
  if (new Set(s.questions.map((q) => q.id)).size !== s.questions.length)
    errors.push(
      "Duplicate question IDs: " +
        s.questions
          .filter(
            (q, i) => s.questions.findIndex((other) => other.id === q.id) !== i,
          )
          .map((q) => q.id)
          .join(", "),
    );
  const seen = new Set<string>(),
    active = new Set<string>(),
    files = new Set<string>();
  const visit = (id: string) => {
    if (active.has(id)) throw Error("Task dependency cycle at " + id);
    if (seen.has(id)) return;
    const t = tasks.get(id);
    if (!t) throw Error("Unknown task dependency " + id);
    active.add(id);
    t.dependsOn.forEach(visit);
    active.delete(id);
    seen.add(id);
  };
  for (const t of s.tasks) {
    try {
      visit(t.id);
    } catch (e) {
      errors.push((e as Error).message);
    }
    for (const id of t.requirements)
      if (!ids.has(id))
        errors.push("Task " + t.id + " references unknown requirement " + id);
    for (const f of t.files) {
      try {
        safePath(f, p.scope);
      } catch (e) {
        errors.push((e as Error).message);
      }
      if (!f.endsWith(".luau"))
        errors.push(
          "Task files must end in .luau: task " + t.id + ", file " + f,
        );
      if (
        f.endsWith(".client.luau") &&
        !/^(StarterGui|StarterPlayer)\//.test(f)
      )
        errors.push(
          `Task ${t.id}: LocalScript must be in a client container: ${f}`,
        );
      if (f.endsWith(".server.luau") && !f.startsWith("ServerScriptService/"))
        errors.push(
          `Task ${t.id}: Server Script must be in ServerScriptService: ${f}`,
        );
      if (files.has(instancePath(f)))
        errors.push("Two tasks own the same script: " + f);
      files.add(instancePath(f));
    }
  }
  for (const r of s.requirements)
    if (
      r.priority === "required" &&
      !s.tasks.some((t) => t.requirements.includes(r.id))
    )
      errors.push("Unplanned requirement " + r.id);
  if (errors.length) throw Error([...new Set(errors)].join("\n"));
  return s;
}
export function orderedTasks(s: Spec) {
  const result: Spec["tasks"] = [],
    seen = new Set<string>();
  function visit(id: string) {
    if (seen.has(id)) return;
    const t = s.tasks.find((t) => t.id === id)!;
    t.dependsOn.forEach(visit);
    seen.add(id);
    result.push(t);
  }
  s.tasks.forEach((t) => visit(t.id));
  return result;
}
export function bundleHash(b: Bundle) {
  return createHash("sha256").update(JSON.stringify(b)).digest("hex");
}
/** retainedRoots must come from host-validated integration records, never model output. */
export function validateBundle(
  b: Bundle,
  p: Project,
  retainedRoots: readonly string[] = [],
): Check[] {
  const checks: Check[] = [];
  const add = (id: string, ok: boolean, detail: string) =>
    checks.push({ id, status: ok ? "passed" : "failed", detail });
  const all = new Set<string>();
  try {
    for (const item of [...b.scene, ...b.files]) {
      const namespaceRoot = roots.some(
        (root) => item.path === root + "/" + p.scope,
      );
      if (namespaceRoot) {
        if (
          !("className" in item) ||
          item.className !== "Folder" ||
          Object.keys(item.properties).length
        )
          throw Error(
            "Project namespace roots must be empty Folder declarations: " +
              item.path,
          );
      } else safePath(item.path, p.scope);
      const canonical = instancePath(item.path);
      if (
        p.assetPipeline?.entries.some(
          (e) =>
            e.component &&
            (canonical === e.component.destinationPath ||
              canonical.startsWith(e.component.destinationPath + "/")),
        )
      )
        throw Error(
          "Generated content overlaps a retained native component: " +
            canonical,
        );
      if (all.has(canonical)) throw Error("Duplicate instance " + canonical);
      all.add(canonical);
    }
    for (const f of b.files) {
      if (!f.path.endsWith(".luau"))
        throw Error("Script must end in .luau: " + f.path);
      if (
        f.kind === "LocalScript" &&
        !/^(StarterGui|StarterPlayer)\//.test(f.path)
      )
        throw Error("LocalScript must be in a client container: " + f.path);
      if (f.kind === "Script" && !f.path.startsWith("ServerScriptService/"))
        throw Error("Server Script must be in ServerScriptService: " + f.path);
    }
    const propertyErrors = new Map<string, string[]>();
    for (const n of b.scene) {
      for (const [name, value] of Object.entries(n.properties)) {
        const error = isRetrievedMeshProperty(p, n, name, value)
          ? null
          : scenePropertyError(n.className, name, value);
        if (!error) continue;
        const locations = propertyErrors.get(error) ?? [];
        locations.push(n.path + "." + name);
        propertyErrors.set(error, locations);
      }
    }
    if (propertyErrors.size) {
      const groups = [...propertyErrors]
        .slice(0, 8)
        .map(
          ([error, locations]) =>
            error +
            " Nodes: " +
            locations.slice(0, 3).join(", ") +
            (locations.length > 3 ? ` (+${locations.length - 3} more)` : ""),
        );
      throw Error(
        "Scene property errors:\n" +
          groups.join("\n") +
          (propertyErrors.size > 8
            ? `\n${propertyErrors.size - 8} additional error types omitted.`
            : ""),
      );
    }
    for (const n of b.scene)
      for (const [name, v] of Object.entries(n.properties)) {
        if (
          !/^[A-Za-z][A-Za-z0-9]*$/.test(name) ||
          [
            "Source",
            "Parent",
            "Name",
            "ClassName",
            "Disabled",
            "RunContext",
          ].includes(name)
        )
          throw Error("Unsupported property " + n.path + "." + name);
        const propertyError = isRetrievedMeshProperty(p, n, name, v)
          ? null
          : scenePropertyError(n.className, name, v);
        if (propertyError) throw Error(propertyError + " Node: " + n.path);
        if (typeof v === "object" && v.type === "Ref") {
          if (v.path !== null) {
            safePath(v.path, p.scope);
            if (!all.has(v.path))
              throw Error(
                "Missing reference target " +
                  v.path +
                  " for " +
                  n.path +
                  "." +
                  name,
              );
            const target = b.scene.find((node) => node.path === v.path);
            if (
              ["Part0", "Part1", "PrimaryPart"].includes(name) &&
              !["Part", "MeshPart", "SpawnLocation"].includes(
                target?.className ?? "",
              )
            )
              throw Error(name + " must reference a BasePart: " + v.path);
            if (
              ["Attachment0", "Attachment1"].includes(name) &&
              target?.className !== "Attachment"
            )
              throw Error(name + " must reference an Attachment: " + v.path);
          }
        } else if (
          [
            "Part0",
            "Part1",
            "PrimaryPart",
            "Attachment0",
            "Attachment1",
            "Adornee",
          ].includes(name)
        ) {
          throw Error(
            n.path +
              "." +
              name +
              ' requires {type:"Ref",path:"exact scene path"}',
          );
        } else if (typeof v === "object" && v.type !== "Enum") {
          const lengths = {
            Vector3: 3,
            Color3: 3,
            CFrame: 12,
            UDim2: 4,
            UDim: 2,
            Vector2: 2,
          };
          if (v.value.length !== lengths[v.type])
            throw Error(
              "Invalid " + v.type + " value at " + n.path + "." + name,
            );
        }
      }
    add(
      "structure",
      true,
      "Paths, script placement, property shapes and duplicate instances checked.",
    );
  } catch (e) {
    add("structure", false, (e as Error).message);
  }
  const known = new Set(p.spec?.requirements.map((r) => r.id));
  for (const c of b.coverage)
    if (
      !known.has(c.requirementId) ||
      c.files.some(
        (f) =>
          !retainedRoots.includes(f) &&
          ![...b.files, ...b.scene].some((x) => x.path === f),
      )
    )
      add(
        "coverage-reference:" + c.requirementId,
        false,
        "Coverage references an unknown requirement or missing script.",
      );
  for (const r of p.spec?.requirements ?? [])
    if (r.priority === "required") {
      const gaps = unmetAssetRequirements(p).filter(
        (g) => g.requirementId === r.id,
      );
      if (gaps.length) {
        checks.push({
          id: "coverage:" + r.id,
          status: "pending",
          detail:
            "UNMET: " + gaps.map((g) => g.role + ": " + g.reason).join("\n"),
        });
        continue;
      }
      const c = b.coverage.filter((c) => c.requirementId === r.id);
      add(
        "coverage:" + r.id,
        c.length === 1 &&
          c[0].status === "implemented" &&
          c[0].files.length > 0,
        c.length === 1 && c[0].status === "implemented" && c[0].files.length > 0
          ? c[0].detail
          : "Missing implemented coverage with at least one existing script OR scene node path for requirement " +
              r.id +
              ". Report those paths in coverage.files.",
      );
    }
  const supplied = suppliedAssetReferences(p);
  for (const imported of retrievedBundles(p)) {
    for (const node of imported.scene)
      add(
        "asset-integrity:" + node.path,
        b.scene.some((actual) => isDeepStrictEqual(actual, node)),
        "Imported geometry must match the retained verified export; changed or removed content requires a new asset verification run.",
      );
    for (const asset of imported.assets)
      add(
        "asset-provenance:" + asset.id,
        b.assets.some((actual) => isDeepStrictEqual(actual, asset)),
        "Retain the original asset acquisition record in the generated project.",
      );
  }
  for (const a of b.assets) {
    if (
      a.status === "needed" &&
      !a.assetId &&
      unmetAssetRequirements(p)
        .filter((g) => g.kind === "missing_dependency")
        .some((g) => g.requirementId === a.requirementId)
    ) {
      checks.push({
        id: "asset:" + a.id,
        status: "pending",
        detail:
          "Asset remains missing after acquisition. Its required behavior is blocked.",
      });
      continue;
    }
    const approved =
      a.assetId && new RegExp("(^|\\D)" + a.assetId + "(\\D|$)").test(supplied);
    add(
      "asset:" + a.id,
      isInspectedApprovedReference(p, a) ||
        (a.kind === "audio"
          ? isRetrievedAsset(p, a)
          : (a.status === "procedural" && !a.assetId) ||
            (a.status === "builtin" &&
              !a.assetId &&
              builtinAssets[a.sourceUrl ?? ""] === a.kind) ||
            (a.status === "provided" &&
              !!approved &&
              !["model", "mesh"].includes(a.kind)) ||
            isRetrievedAsset(p, a)),
      isInspectedApprovedReference(p, a)
        ? "Approved, safely inspected content reference. Search-hint conflict is advisory. Fit, integration and gameplay remain unverified."
        : a.kind === "audio" && !isRetrievedAsset(p, a)
          ? "Audio requires retained Marketplace acquisition and native playback/listening evidence from the asset pipeline; provided IDs and built-in/procedural substitutes do not establish it."
          : a.status === "provided" && ["model", "mesh"].includes(a.kind)
            ? "A provided model or mesh ID is only a reference. Acquire its actual hierarchy through the native asset pipeline before claiming integration. Empty containers are not imported assets."
            : isRetrievedAsset(p, a)
              ? "Retrieved by Takko's asset loop with retained native receipts; full-game integration still requires its own checks."
              : a.status === "builtin"
                ? "Built-in asset checked against the installed content catalog; rendering/playback still requires Studio testing."
                : a.status === "procedural"
                  ? "Procedural asset; playback still requires Studio testing."
                  : approved
                    ? "User-supplied ID; permissions and playback still require Studio testing."
                    : "An asset is missing or its ID was not supplied by the user.",
    );
  }
  const ids = new Set(
    b.assets
      .filter((a) => a.status === "provided" || isRetrievedAsset(p, a))
      .map((a) => a.assetId),
  );
  for (const assetId of retrievedContentIds(p)) ids.add(assetId);
  const serialized = JSON.stringify({ files: b.files, scene: b.scene });
  for (const match of serialized.matchAll(/rbxasset:\/\/[^\s"'\\]+/g)) {
    if (builtinAssets[match[0]] === "audio")
      add(
        "marketplace-audio:" + match[0],
        false,
        "Built-in audio bypasses Marketplace sourcing. Retrieve and verify the requested sound through the asset pipeline.",
      );
    if (!builtinAssets[match[0]])
      add(
        "unknown-builtin:" + match[0],
        false,
        "Built-in asset does not exist in the installed Studio content catalog: " +
          match[0] +
          ". Supply a real asset or report it as needed.",
      );
  }
  for (const match of serialized.matchAll(/rbxassetid:\/\/(\d+)/g))
    if (!ids.has(match[1]))
      add(
        "undeclared-asset:" + match[1],
        false,
        "Asset references must have a provenance entry.",
      );
  return checks;
}
export async function compileSources(
  b: Bundle,
  extra: { source: string; id: string }[] = [],
  signal?: AbortSignal,
): Promise<Check[]> {
  const binary = "luau-compile" + (process.platform === "win32" ? ".exe" : "");
  const configuredDirectory = process.env.LUAU_BIN_DIR;
  const candidates =
    configuredDirectory !== undefined
      ? [path.resolve(configuredDirectory, binary)]
      : [
          path.join(".forge/tools/luau", binary),
          path.join("research/tools/luau", binary),
        ];
  const compiler = candidates.map((x) => path.resolve(x)).find(fs.existsSync);
  if (!compiler)
    return [
      {
        id: "luau",
        status: "failed",
        detail:
          configuredDirectory !== undefined
            ? "Luau compiler is missing at configured LUAU_BIN_DIR: " +
              candidates[0]
            : "Luau compiler is missing. Run scripts/setup-luau.ps1.",
      },
    ];
  const dir = path.resolve(".forge/validation", randomUUID());
  fs.mkdirSync(dir, { recursive: true });
  const checks: Check[] = [];
  try {
    for (const [i, f] of [
      ...b.files.map((f) => ({ id: f.path, source: f.source })),
      ...extra,
    ].entries()) {
      if (signal?.aborted) throw Error("Generation cancelled");
      const file = path.join(dir, i + ".luau");
      fs.writeFileSync(file, f.source);
      const result = await new Promise<{ code: number | null; error: string }>(
        (resolve) => {
          const child = spawn(compiler, ["--null", file], {
            windowsHide: true,
            signal,
            stdio: ["ignore", "ignore", "pipe"],
          });
          let error = "";
          child.stderr.on(
            "data",
            (d) => (error += d.toString().slice(0, 5000)),
          );
          child.on("error", () =>
            resolve({ code: 1, error: "Compiler unavailable or cancelled" }),
          );
          const timer = setTimeout(() => child.kill(), 10000);
          child.on("close", (code) => {
            clearTimeout(timer);
            resolve({ code, error });
          });
        },
      );
      checks.push({
        id: "compile:" + f.id,
        status: result.code === 0 ? "passed" : "failed",
        detail:
          result.code === 0
            ? "Luau syntax compiled."
            : result.error.replaceAll(dir, "generated").slice(0, 3000),
      });
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  return checks;
}
