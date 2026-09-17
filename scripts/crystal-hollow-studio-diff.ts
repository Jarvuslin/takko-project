import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import {
  bundleSchema,
  type Bundle,
  type PropertyValue,
} from "../src/generation/schema";
import {
  capabilities,
  scenePropertyError,
} from "../src/generation/capabilities";

const ROOT = "Workspace/Forge_GenerationPilot/World";
const allowedClasses = new Set([
  "Folder",
  "Model",
  "Part",
  "WedgePart",
  "CornerWedgePart",
  "SpawnLocation",
  "SurfaceGui",
  "BillboardGui",
  "TextLabel",
  "Frame",
  "UICorner",
  "UIStroke",
  "PointLight",
  "SpotLight",
  "SurfaceLight",
]);
const geometry = new Set(["Part", "WedgePart", "CornerWedgePart"]);
const forbiddenProperties = new Set([
  "Source",
  "Name",
  "Parent",
  "ClassName",
  "Disabled",
  "RunContext",
  "RobloxLocked",
]);
const lengths: Record<string, number> = {
  Vector3: 3,
  Color3: 3,
  CFrame: 12,
  UDim2: 4,
  UDim: 2,
  Vector2: 2,
};
type Node = Bundle["scene"][number];
type Change = {
  kind: "add" | "update" | "replace";
  path: string;
  before: Node | null;
  after: Node;
};
function inWorld(value: string) {
  return (
    (value === ROOT || value.startsWith(ROOT + "/")) &&
    value
      .split("/")
      .every(
        (segment) =>
          /^[A-Za-z0-9_ .-]+$/.test(segment) &&
          segment !== "." &&
          segment !== "..",
      )
  );
}
function stringLiteral(value: string) {
  return (
    '"' +
    [...Buffer.from(value, "utf8")]
      .map((byte) =>
        byte >= 32 && byte <= 126 && byte !== 34 && byte !== 92
          ? String.fromCharCode(byte)
          : "\\" + byte.toString().padStart(3, "0"),
      )
      .join("") +
    '"'
  );
}
function literal(value: unknown): string {
  if (value === null) return "nil";
  if (typeof value === "string") return stringLiteral(value);
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (Array.isArray(value)) return "{" + value.map(literal).join(",") + "}";
  if (value && typeof value === "object")
    return (
      "{" +
      Object.entries(value)
        .map(([key, item]) => `[${stringLiteral(key)}]=${literal(item)}`)
        .join(",") +
      "}"
    );
  throw Error("Unsupported Lua value");
}
function validateNodes(bundle: Bundle) {
  const nodes = bundle.scene.filter(
    (node) => node.path === ROOT || node.path.startsWith(ROOT + "/"),
  );
  const map = new Map<string, Node>();
  for (const node of nodes) {
    if (!inWorld(node.path) || map.has(node.path))
      throw Error("Invalid or duplicate world path: " + node.path);
    if (!allowedClasses.has(node.className))
      throw Error("Scene diff class is not allowed: " + node.className);
    for (const [name, value] of Object.entries(node.properties)) {
      if (forbiddenProperties.has(name))
        throw Error("Forbidden scene diff property: " + name);
      const error = scenePropertyError(node.className, name, value);
      if (error) throw Error(node.path + ": " + error);
      if (typeof value === "object") {
        if (value.type === "Ref") {
          if (value.path !== null && !inWorld(value.path))
            throw Error("Reference escapes world: " + value.path);
        } else if (
          value.type !== "Enum" &&
          value.value.length !== lengths[value.type]
        )
          throw Error("Invalid " + value.type + " component count");
      }
    }
    map.set(node.path, node);
  }
  if (!map.has(ROOT))
    throw Error("Both manifests must explicitly declare " + ROOT);
  for (const node of nodes) {
    if (
      node.path !== ROOT &&
      !map.has(node.path.slice(0, node.path.lastIndexOf("/")))
    )
      throw Error("Declare every world parent: " + node.path);
    for (const value of Object.values(node.properties))
      if (
        typeof value === "object" &&
        value.type === "Ref" &&
        value.path !== null &&
        !map.has(value.path)
      )
        throw Error("Missing world reference target: " + value.path);
  }
  return map;
}
export function readCrystalHollowManifest(file: string): Bundle {
  const input = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
  return bundleSchema.parse(input.artifact ?? input);
}
/** Produces an edit-time, scene-only patch. It never sends it to Studio. */
export function createCrystalHollowSceneDiff(
  oldInput: Bundle,
  newInput: Bundle,
  options: { requireOwnUndoRecording?: boolean } = {},
) {
  const requireOwnUndoRecording = options.requireOwnUndoRecording !== false;
  const oldBundle = bundleSchema.parse(oldInput),
    newBundle = bundleSchema.parse(newInput);
  const before = validateNodes(oldBundle),
    after = validateNodes(newBundle);
  for (const oldPath of before.keys())
    if (!after.has(oldPath))
      throw Error("Scene deletion is unsupported: " + oldPath);
  const changes: Change[] = [];
  for (const [nodePath, node] of after) {
    const previous = before.get(nodePath);
    if (!previous) {
      changes.push({ kind: "add", path: nodePath, before: null, after: node });
      continue;
    }
    if (isDeepStrictEqual(previous, node)) continue;
    for (const name of Object.keys(previous.properties))
      if (!Object.hasOwn(node.properties, name))
        throw Error(
          "Explicit property removal is unsupported: " + nodePath + "." + name,
        );
    if (previous.className !== node.className) {
      if (!geometry.has(previous.className) || !geometry.has(node.className))
        throw Error(
          "Only decorative geometry class replacement is supported: " +
            nodePath,
        );
      if (
        [...before.keys(), ...after.keys()].some((other) =>
          other.startsWith(nodePath + "/"),
        )
      )
        throw Error("Cannot replace geometry with children: " + nodePath);
      for (const other of [...oldBundle.scene, ...newBundle.scene])
        for (const value of Object.values(other.properties))
          if (
            typeof value === "object" &&
            value.type === "Ref" &&
            value.path === nodePath
          )
            throw Error("Cannot replace referenced geometry: " + nodePath);
      changes.push({
        kind: "replace",
        path: nodePath,
        before: previous,
        after: node,
      });
    } else
      changes.push({
        kind: "update",
        path: nodePath,
        before: previous,
        after: node,
      });
  }
  if (changes.length > 500)
    throw Error("Scene diff exceeds its 500-operation bound");
  changes.sort(
    (a, b) =>
      a.path.split("/").length - b.path.split("/").length ||
      a.path.localeCompare(b.path),
  );
  const refProperties = Object.fromEntries(
    Object.entries(capabilities.classes).flatMap(([name, info]) => {
      const properties = Object.entries(info.properties)
        .filter(([, property]) => property.type === "Instance")
        .map(([key]) => key);
      return properties.length ? [[name, properties]] : [];
    }),
  );
  const copyProperties = Object.fromEntries(
    [...geometry].map((name) => [
      name,
      Object.keys(capabilities.classes[name].properties).filter(
        (key) =>
          !forbiddenProperties.has(key) &&
          ![
            "Position",
            "Orientation",
            "Rotation",
            "BrickColor",
            "formFactor",
          ].includes(key),
      ),
    ]),
  );
  const lua = `-- Generated scene-only diff. Review before executing in Studio edit mode.
local changes = ${literal(changes)}
local rootPath = ${literal(ROOT)}
local requireOwnUndoRecording = ${literal(requireOwnUndoRecording)}
local knownReferenceProperties = ${literal(refProperties)}
local sharedGeometryProperties = ${literal(copyProperties)}
local runService = game:GetService("RunService")
assert(not runService:IsRunning(), "Stop play mode before applying the scene diff")
local function resolveExact(fullPath, allowMissing)
  local current = game
  local segments = string.split(fullPath, "/")
  for index, segment in ipairs(segments) do
    local found = nil
    for _, child in ipairs(current:GetChildren()) do
      if child.Name == segment then
        assert(found == nil, "Ambiguous instance path: " .. fullPath)
        found = child
      end
    end
    if not found and allowMissing then return nil end
    assert(found, "Missing scene path: " .. fullPath)
    current = found
  end
  return current
end
local world = resolveExact(rootPath)
local originals, prepared, defaults, undoProperties, replacements, objectPaths = {}, {}, {}, {}, {}, {}
local function defaultFor(className)
  if not defaults[className] then defaults[className] = Instance.new(className) end
  return defaults[className]
end
local function canonicalExpected(className, name, value)
  -- Roblox setters can normalize constructor values (for example Part.Color).
  -- Keep these shadows separate from the pristine unspecified-property defaults.
  local shadow = Instance.new(className)
  local success, result = pcall(function()
    shadow[name] = value
    return shadow[name]
  end)
  shadow:Destroy()
  if not success then error(result) end
  return result
end
local function decode(value, lookup)
  if type(value) ~= "table" then return value end
  if value.type == "Ref" then return value.path and (lookup[value.path] or resolveExact(value.path)) or nil end
  if value.type == "Enum" then
    for _, item in ipairs(Enum[value.enum]:GetEnumItems()) do if item.Value == value.value then return item end end
    error("Enum item unavailable in this Studio build: " .. value.enum)
  end
  local constructors = {Vector3=Vector3.new, Color3=Color3.new, CFrame=CFrame.new, UDim2=UDim2.new, UDim=UDim.new, Vector2=Vector2.new}
  assert(constructors[value.type], "Unsupported value type")
  return constructors[value.type](table.unpack(value.value))
end
local function cleanupDefaults()
  for _, object in pairs(defaults) do object:Destroy() end
end
local preflightOk, preflightError = xpcall(function()
  for _, change in ipairs(changes) do
    local object = resolveExact(change.path, true)
    if change.kind == "add" then assert(object == nil, "New path already exists: " .. change.path)
    else
      assert(object and object.ClassName == change.before.className, "Original class changed: " .. change.path)
      assert(object == world or object:IsDescendantOf(world), "Object left the selected world")
      for name, expected in pairs(change.before.properties) do
        local decoded = canonicalExpected(change.before.className, name, decode(expected, originals))
        assert(typeof(object[name]) == typeof(decoded) and object[name] == decoded, "Original property changed: " .. change.path .. "." .. name)
      end
      originals[change.path] = object
      objectPaths[object] = change.path
      if change.kind == "replace" then
        assert(#object:GetChildren() == 0, "Replacement gained children: " .. change.path)
        replacements[object] = true
      end
      for name in pairs(change.after.properties) do
        if change.before.properties[name] == nil then
          assert(object[name] == defaultFor(change.before.className)[name], "Previously unspecified property changed: " .. change.path .. "." .. name)
        end
      end
    end
  end
  if next(replacements) then
    for _, object in ipairs(game:GetDescendants()) do
      for _, name in ipairs(knownReferenceProperties[object.ClassName] or {}) do
        local readable, target = pcall(function() return object[name] end)
        assert(readable, "Cannot inspect reference property: " .. object.ClassName .. "." .. name)
        assert(not replacements[target], "Replacement has a live instance reference: " .. object:GetFullName() .. "." .. name)
      end
    end
  end
  for _, change in ipairs(changes) do
    if change.kind ~= "update" then
      local object = Instance.new(change.after.className)
      object.Name = string.match(change.path, "[^/]+$")
      prepared[change.path] = object
      objectPaths[object] = change.path
      if change.kind == "replace" then
        local old = originals[change.path]
        local shared = {}
        for _, name in ipairs(sharedGeometryProperties[change.after.className]) do shared[name] = true end
        for _, name in ipairs(sharedGeometryProperties[change.before.className]) do if shared[name] then object[name] = old[name] end end
        for name, value in pairs(old:GetAttributes()) do object:SetAttribute(name, value) end
        for _, tag in ipairs(game:GetService("CollectionService"):GetTags(old)) do game:GetService("CollectionService"):AddTag(object, tag) end
      end
    end
  end
  for _, change in ipairs(changes) do
    local object = prepared[change.path] or originals[change.path]
    for name, value in pairs(change.after.properties) do
      local decoded = decode(value, prepared)
      if change.kind == "update" then
        if not undoProperties[object] then undoProperties[object] = {} end
        table.insert(undoProperties[object], {name=name,value=object[name]})
        defaultFor(change.after.className)[name] = decoded -- Check setter types without changing the live scene.
      else object[name] = decoded end
    end
  end
end, debug.traceback)
cleanupDefaults()
if not preflightOk then
  for _, object in pairs(prepared) do object:Destroy() end
  error("Scene preflight failed; live scene unchanged: " .. tostring(preflightError))
end
local history = game:GetService("ChangeHistoryService")
local recording
local recordingOk = pcall(function() recording = history:TryBeginRecording("TakkoCrystalHollowVisual", "Crystal Hollow visual refinement") end)
if not recordingOk or (not recording and requireOwnUndoRecording) then
  for _, object in pairs(prepared) do object:Destroy() end
  error("Undo recording unavailable; live scene unchanged")
end
local detached = {}
local ok, failure = xpcall(function()
  -- Parents are attached first; prepared references resolve to the final instances.
  for _, change in ipairs(changes) do
    local object = prepared[change.path] or originals[change.path]
    if change.kind == "replace" then
      local old = originals[change.path]
      detached[old] = old.Parent
      old.Parent = nil
    end
    if change.kind ~= "update" then
      local parentPath = string.match(change.path, "^(.*)/[^/]+$")
      object.Parent = prepared[parentPath] or resolveExact(parentPath)
    end
    for name, value in pairs(change.after.properties) do object[name] = decode(value, prepared) end
  end
  if recording then history:FinishRecording(recording, Enum.FinishRecordingOperation.Commit) end
end, debug.traceback)
if not ok then
  local rollbackErrors = {}
  local function restore(label, action)
    local restored, why = pcall(action)
    if not restored then table.insert(rollbackErrors, label .. ": " .. tostring(why)) end
  end
  for object, values in pairs(undoProperties) do
    for _, property in ipairs(values) do
      restore((objectPaths[object] or "unknown object") .. "." .. property.name, function()
        object[property.name] = property.value
        assert(object[property.name] == canonicalExpected(object.ClassName, property.name, property.value), "Restored property does not match its original value")
      end)
    end
  end
  for nodePath, object in pairs(prepared) do
    restore(nodePath .. " (remove prepared instance)", function()
      object:Destroy()
      assert(object.Parent == nil, "Prepared instance is still parented")
    end)
  end
  for object, parent in pairs(detached) do
    restore((objectPaths[object] or "unknown object") .. " (restore original parent)", function()
      object.Parent = parent
      assert(object.Parent == parent, "Original parent was not restored")
    end)
  end
  if recording then restore("undo recording", function() history:FinishRecording(recording, Enum.FinishRecordingOperation.Cancel) end) end
  if #rollbackErrors > 0 then
    error("Scene diff failed; rollback incomplete: " .. table.concat(rollbackErrors, "; ") .. " Original failure: " .. tostring(failure))
  end
  error("Scene diff rolled back: " .. tostring(failure))
end
-- Keep detached originals alive in the undo record; never destroy previous identities.
print("Crystal Hollow scene diff applied: " .. tostring(#changes) .. " changes; sources untouched; own undo recorded: " .. tostring(not not recording))
return {applied=#changes, undoRecorded=not not recording, ownUndoRecorded=not not recording}
`;
  return {
    lua,
    changes: changes.map(({ kind, path, before, after }) => ({
      kind,
      path,
      beforeClass: before?.className ?? null,
      afterClass: after.className,
    })),
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const [oldFile, newFile, outputFile, undoOption, ...extra] = process.argv.slice(2);
  if (!oldFile || !newFile || !outputFile)
    throw Error(
      "Usage: crystal-hollow-studio-diff.ts old-project.json new-project.json output.luau [--allow-no-own-undo]",
    );
  if (extra.length || (undoOption && undoOption !== "--allow-no-own-undo"))
    throw Error("Unknown scene diff option");
  const result = createCrystalHollowSceneDiff(
    readCrystalHollowManifest(oldFile),
    readCrystalHollowManifest(newFile),
    { requireOwnUndoRecording: undoOption !== "--allow-no-own-undo" },
  );
  fs.writeFileSync(path.resolve(outputFile), result.lua, { flag: "wx" });
  console.log(
    JSON.stringify(
      { output: path.resolve(outputFile), changes: result.changes },
      null,
      2,
    ),
  );
}
