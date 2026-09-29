import type { Bundle, PropertyValue } from "./schema";
import { recordedTemplate, type WorldDecision } from "./world-policy";
import { instancePath, roots } from "./validation";
import {
  mergeNativeComponentXml,
  type NativeComponentXml,
} from "./component-xml";
export const xml = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
function property(
  name: string,
  v: PropertyValue,
  refs: Map<string, string>,
): string {
  const n = xml(name);
  if (typeof v === "string")
    return [
      "SoundId",
      "AnimationId",
      "Image",
      "Texture",
      "MeshId",
      "TextureID",
      "SkyboxBk", "SkyboxDn", "SkyboxFt", "SkyboxLf", "SkyboxRt", "SkyboxUp",
      "MoonTextureId", "SunTextureId",
    ].includes(name)
      ? `<Content name="${n}"><url>${xml(v)}</url></Content>`
      : `<string name="${n}">${xml(v)}</string>`;
  if (typeof v === "boolean") return `<bool name="${n}">${v}</bool>`;
  if (typeof v === "number") return `<double name="${n}">${v}</double>`;
  if (v.type === "Ref") {
    const target = v.path === null ? "null" : refs.get(v.path);
    if (!target) throw Error("Missing reference target " + v.path);
    return `<Ref name="${n}">${target}</Ref>`;
  }
  if (v.type === "Enum") return `<token name="${n}">${v.value}</token>`;
  const fields = {
    Vector3: ["X", "Y", "Z"],
    Vector2: ["X", "Y"],
    Color3: ["R", "G", "B"],
    CFrame: [
      "X",
      "Y",
      "Z",
      "R00",
      "R01",
      "R02",
      "R10",
      "R11",
      "R12",
      "R20",
      "R21",
      "R22",
    ],
    UDim: ["S", "O"],
    UDim2: ["XS", "XO", "YS", "YO"],
  }[v.type];
  const tag = v.type === "CFrame" ? "CoordinateFrame" : v.type;
  return `<${tag} name="${n}">${fields.map((f, i) => `<${f}>${v.value[i]}</${f}>`).join("")}</${tag}>`;
}
export function exportBundle(
  b: Bundle,
  scope: string,
  components: NativeComponentXml[] = [],
  world?: WorldDecision,
  rig?: import("./rig-policy").RigDecision,
) {
  type Node = {
    name: string;
    className: string;
    props: Record<string, PropertyValue>;
    source?: string;
    children: Map<string, Node>;
    referent?: string;
  };
  const root: Node = {
    name: "",
    className: "",
    props: {},
    children: new Map(),
  };
  const ensure = (p: string) => {
    let n = root;
    for (const part of p.split("/")) {
      if (!n.children.has(part))
        n.children.set(part, {
          name: part,
          className:
            root === n
              ? part
              : part === "StarterPlayerScripts"
                ? "StarterPlayerScripts"
                : "Folder",
          props: {},
          children: new Map(),
        });
      n = n.children.get(part)!;
    }
    return n;
  };
  for (const r of roots) ensure(r + "/" + scope);
  // Roblox's serialized GameSettingsAvatar uses GameAvatarType (R6=0, R15=1).
  // https://create.roblox.com/docs/reference/engine/enums/GameAvatarType
  // Official Studio API dump, setup.rbxcdn.com/versionQTStudio + -API-Dump.json:
  // StarterPlayer.GameSettingsAvatar CanLoad/CanSave=true, RobloxScriptSecurity.
  // Plugins use documented StarterCharacter instead of writing this protected property.
  if (rig?.selected) ensure("StarterPlayer").props.GameSettingsAvatar = { type: "Enum", enum: "GameAvatarType", value: rig.selected === "R6" ? 0 : 1 };
  for (const item of recordedTemplate({world})?.nodes ?? []) {
    const n = ensure(item.path);
    n.className = item.className;
    n.props = item.properties;
  }
  if (world?.kind === "baseplate_template") ensure("Workspace/Terrain").className = "Terrain";
  for (const item of b.scene) {
    const n = ensure(item.path);
    n.className = item.className;
    n.props = item.properties;
  }
  for (const f of b.files) {
    const n = ensure(instancePath(f.path));
    n.className = f.kind;
    n.source = f.source;
  }
  let id = 0;
  const refs = new Map<string, string>();
  const assign = (n: Node, p: string) => {
    n.referent = "RBX" + ++id;
    refs.set(p, n.referent);
    for (const child of n.children.values())
      assign(child, p + "/" + child.name);
  };
  for (const n of root.children.values()) assign(n, n.name);
  const render = (n: Node): string =>
    `<Item class="${n.className}" referent="${n.referent}"><Properties><string name="Name">${xml(n.name)}</string>${Object.entries(
      n.props,
    )
      .map(([k, v]) => property(k, v, refs))
      .join(
        "",
      )}${n.source !== undefined ? `<ProtectedString name="Source">${xml(n.source)}</ProtectedString>` : ""}</Properties>${[...n.children.values()].map(render).join("")}</Item>`;
  const document = `<roblox version="4"><External>null</External><External>nil</External>${[...root.children.values()].map(render).join("")}</roblox>`;
  return mergeNativeComponentXml(document, scope, components);
}
