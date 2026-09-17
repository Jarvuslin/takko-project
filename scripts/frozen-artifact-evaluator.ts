import { createHash } from "node:crypto";
import { z } from "zod";
import { bundleSchema, type Bundle } from "../src/generation/schema";
import { scenePropertyError } from "../src/generation/capabilities";
import { roots, instancePath, safePath } from "../src/generation/validation";

// This is evaluation transport, not a game generator. No scene or source changes
// are invented: unsupported transport cases fail before returning any operations.
function text(value: string) {
  return (
    '"' +
    [...Buffer.from(value, "utf8")]
      .map((byte) =>
        byte >= 32 && byte <= 126 && byte !== 34 && byte !== 92
          ? String.fromCharCode(byte)
          : "\\" + String(byte).padStart(3, "0"),
      )
      .join("") +
    '"'
  );
}
function literal(value: unknown): string {
  if (value === null) return "nil";
  if (typeof value === "string") return text(value);
  if (typeof value === "boolean" || typeof value === "number")
    return String(value);
  if (Array.isArray(value)) return "{" + value.map(literal).join(",") + "}";
  if (value && typeof value === "object")
    return (
      "{" +
      Object.entries(value)
        .map(([key, item]) => `[${text(key)}]=${literal(item)}`)
        .join(",") +
      "}"
    );
  throw Error("Unsupported frozen artifact value");
}
const scriptClasses = new Set(["Script", "LocalScript", "ModuleScript"]);

export function createFrozenArtifactEvaluation(
  input: Bundle,
  scope: string,
  studioId: string,
) {
  if (!/^[A-Za-z][A-Za-z0-9_]{0,80}$/.test(scope))
    throw Error("Invalid exact project scope");
  z.uuid().parse(studioId);
  const frozenArtifactJson = JSON.stringify(input);
  const artifact = bundleSchema.parse(JSON.parse(frozenArtifactJson));
  const artifactSha256 = createHash("sha256")
    .update(frozenArtifactJson)
    .digest("hex");
  const classes = new Map(roots.map((root) => [root + "/" + scope, "Folder"]));
  const declared = new Set<string>();
  for (const node of artifact.scene) {
    if (!classes.has(node.path)) safePath(node.path, scope);
    else if (node.className !== "Folder" || Object.keys(node.properties).length)
      throw Error("Namespace roots must be empty Folder declarations");
    if (declared.has(node.path))
      throw Error("Duplicate scene path " + node.path);
    if (scriptClasses.has(node.className))
      throw Error("Scripts are forbidden in evaluator scene transport");
    if (node.className === "MeshPart")
      throw Error(
        "MeshPart requires the application import transport; evaluator does not support it",
      );
    declared.add(node.path);
    classes.set(node.path, node.className);
    for (const [name, value] of Object.entries(node.properties)) {
      if (["Parent", "Name", "Source", "ClassName"].includes(name))
        throw Error("Reserved scene property " + name);
      const error = scenePropertyError(node.className, name, value);
      if (error) throw Error(error);
      if (
        typeof value === "object" &&
        "value" in value &&
        Array.isArray(value.value)
      ) {
        const lengths: Record<string, number[]> = {
          Vector3: [3],
          Color3: [3],
          Vector2: [2],
          UDim: [2],
          UDim2: [4],
          CFrame: [3, 12],
        };
        if (!lengths[value.type]?.includes(value.value.length))
          throw Error("Invalid property constructor length");
      }
    }
  }
  const files = artifact.files.map((file) => {
    safePath(file.path, scope);
    const canonical = instancePath(file.path);
    if (canonical.split("/").some((part) => part.includes(".")))
      throw Error(
        "Script paths containing literal dots cannot use official multi_edit dot notation",
      );
    if (classes.has(canonical))
      throw Error("Script/scene or script/script path collision " + canonical);
    classes.set(canonical, file.kind);
    return { ...file, canonical };
  });
  // Match plugin ensure: missing parents are Folders, declared parents retain class.
  for (const target of [...classes.keys()]) {
    let parent = target.slice(0, target.lastIndexOf("/"));
    while (!roots.includes(parent)) {
      if (!classes.has(parent)) classes.set(parent, "Folder");
      if (scriptClasses.has(classes.get(parent)!))
        throw Error(
          "A script cannot be an implicit scene/file parent in this evaluator",
        );
      parent = parent.slice(0, parent.lastIndexOf("/"));
    }
  }
  for (const node of artifact.scene)
    for (const value of Object.values(node.properties)) {
      if (
        typeof value === "object" &&
        value.type === "Ref" &&
        value.path !== null
      ) {
        if (!classes.has(value.path))
          throw Error(
            "Reference escapes or misses the frozen artifact: " + value.path,
          );
        if (scriptClasses.has(classes.get(value.path)!))
          throw Error(
            "References to separately applied script leaves are unsupported by the scene-only evaluator",
          );
      }
    }
  const scene = [...artifact.scene].sort(
    (a, b) => a.path.split("/").length - b.path.split("/").length,
  );
  const fileParents = [
    ...new Set(
      files.map((file) =>
        file.canonical.slice(0, file.canonical.lastIndexOf("/")),
      ),
    ),
  ];
  const common = `local SCOPE=${text(scope)}
local HASH=${text(artifactSha256)}
local SCENE=${literal(scene)}
local ROOTS={Workspace=workspace,ReplicatedStorage=game:GetService("ReplicatedStorage"),ServerScriptService=game:GetService("ServerScriptService"),ServerStorage=game:GetService("ServerStorage"),StarterGui=game:GetService("StarterGui"),["StarterPlayer/StarterPlayerScripts"]=game:GetService("StarterPlayer").StarterPlayerScripts}
assert(not game:GetService("RunService"):IsRunning(),"Verified Edit state required")
local function value(v,nodes)
 if type(v)~="table" then return v end
 if v.type=="Ref" then if v.path==nil then return nil end;assert(nodes[v.path],"Missing reference target "..v.path);return nodes[v.path] end
 if v.type=="Enum" then for _,item in Enum[v.enum]:GetEnumItems() do if item.Value==v.value then return item end end;error("Unknown enum value") end
 local constructors={Vector3=Vector3.new,Vector2=Vector2.new,Color3=Color3.new,CFrame=CFrame.new,UDim2=UDim2.new,UDim=UDim.new}
 assert(constructors[v.type],"Unknown property type");return constructors[v.type](table.unpack(v.value))
end
`;
  const applyLuau =
    common +
    `local parents=${literal(fileParents)}
local nodes,created={},{}
-- Inspect every target before making any change, including roots unused by this bundle.
for prefix,parent in ROOTS do
 local found=parent:FindFirstChild(SCOPE)
 assert(not found or (found.ClassName=="Folder" and #found:GetChildren()==0),"Target scope is nonempty or not a Folder: "..prefix.."/"..SCOPE)
 nodes[prefix.."/"..SCOPE]=found
end
local function make(class,name,parent)
 local object=Instance.new(class);table.insert(created,object);object.Name=name;object.Parent=parent;return object
end
local function ensure(p,class)
 if nodes[p] then assert(not class or nodes[p].ClassName==class,"Conflicting instance classes: "..p);return nodes[p] end
 local parentPath,name=p:match("^(.*)/([^/]+)$");assert(parentPath and name~="." and name~="..","Invalid path")
 local parent=nodes[parentPath] or ensure(parentPath,"Folder")
 local object=make(class or "Folder",name,parent);nodes[p]=object;return object
end
local ok,err=pcall(function()
 for prefix,parent in ROOTS do local key=prefix.."/"..SCOPE;if not nodes[key] then nodes[key]=make("Folder",SCOPE,parent) end end
 for _,item in SCENE do ensure(item.path,item.className) end
 for _,parent in parents do ensure(parent) end
 for _,item in SCENE do for name,v in item.properties do nodes[item.path][name]=value(v,nodes) end end
end)
if not ok then
 local cleanupErrors={}
 for index=#created,1,-1 do local cleaned,problem=pcall(function() created[index]:Destroy() end);if not cleaned then table.insert(cleanupErrors,tostring(problem)) end end
 return {ok=false,artifactSha256=HASH,error=tostring(err),cleanupConfirmed=#cleanupErrors==0,cleanupErrors=cleanupErrors,scriptsApplied=false}
end
return {ok=true,artifactSha256=HASH,sceneCount=#SCENE,createdCount=#created,scriptsApplied=false,verification="pending exact scripts and property verification"}
`;
  const verifyLuau =
    common +
    `local FILES=${literal(files)}
local EXPECTED=${literal(Object.fromEntries(classes))}
local nodes,failures={},{}
local propertiesChecked,filesChecked=0,0
local function find(p)
 local pieces=p:split("/");local object=game:GetService(pieces[1])
 for index=2,#pieces do object=object and object:FindFirstChild(pieces[index]);if not object then return nil end end
 return object
end
for p,class in EXPECTED do
 local object=find(p);nodes[p]=object
 if not object then table.insert(failures,{path=p,reason="missing"}) elseif object.ClassName~=class then table.insert(failures,{path=p,reason="class mismatch",expected=class,actual=object.ClassName}) end
end
local function near(a,b,tolerance) return math.abs(a-b)<=(tolerance or 0.0001) end
local function equal(a,b)
 local kind=typeof(b);if typeof(a)~=kind then return false end
 if kind=="number" then return near(a,b) end
 if kind=="Vector3" then return near(a.X,b.X) and near(a.Y,b.Y) and near(a.Z,b.Z) end
 if kind=="Vector2" then return near(a.X,b.X) and near(a.Y,b.Y) end
 -- Engine Color3 properties may floor to 8-bit channels. Permit at most one
 -- channel step plus float epsilon; larger actual color changes still fail.
 if kind=="Color3" then local t=1/255+0.000001;return near(a.R,b.R,t) and near(a.G,b.G,t) and near(a.B,b.B,t) end
 if kind=="CFrame" then local aa,bb={a:GetComponents()},{b:GetComponents()};for i=1,12 do if not near(aa[i],bb[i]) then return false end end;return true end
 if kind=="UDim" then return near(a.Scale,b.Scale) and near(a.Offset,b.Offset) end
 if kind=="UDim2" then return equal(a.X,b.X) and equal(a.Y,b.Y) end
 return a==b
end
for _,item in SCENE do
 for name,v in item.properties do
  propertiesChecked+=1
  local ok,matched=pcall(function() return nodes[item.path] and equal(nodes[item.path][name],value(v,nodes)) end)
  if not ok or not matched then table.insert(failures,{path=item.path,property=name,reason=ok and "property mismatch" or tostring(matched)}) end
 end
end
local editor=game:GetService("ScriptEditorService")
for _,file in FILES do
 filesChecked+=1
 local ok,source=pcall(function() return nodes[file.canonical] and editor:GetEditorSource(nodes[file.canonical]) end)
 if not ok or source~=file.source then table.insert(failures,{path=file.canonical,reason="exact script source mismatch"}) end
end
return {ok=#failures==0,artifactSha256=HASH,sceneCount=#SCENE,propertiesChecked=propertiesChecked,filesChecked=filesChecked,failures=failures,nativeGameplayVerified=false}
`;
  const scriptRequests = files.map((file) => ({
    studio_id: studioId,
    datamodel_type: "Edit" as const,
    file_path: "game." + file.canonical.replaceAll("/", "."),
    className: file.kind,
    edits: [{ old_string: "", new_string: file.source }],
  }));
  return {
    frozenArtifactJson,
    artifactSha256,
    applyLuau,
    verifyLuau,
    scriptRequests,
  };
}
