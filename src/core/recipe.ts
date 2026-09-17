import fs from "node:fs";
import { createHash } from "node:crypto";
import type { Choices } from "./project";
export type Artifact = {
  recipeVersion: string;
  files: { path: string; source: string; sha256: string }[];
};
export const palette = {
  cinder: [230, 164, 84],
  jade: [113, 194, 158],
  violet: [181, 164, 223],
};
export function generateArtifact(choices: Choices): Artifact {
  const color = palette[choices.style ?? "cinder"];
  const cooldown = choices.pace === "quick" ? 0.45 : 0.85;
  const config = `return { title = "${choices.style === "jade" ? "Jade Circuit" : choices.style === "violet" ? "Dusk Arena" : "Cinder Arena"}", touch = ${choices.device === "both"}, accent = {${color.join(",")}}, abilities = { strike = {damage = 15, range = 8, cooldown = ${cooldown}}, burst = {damage = 30, range = 12, cooldown = 4} } }\n`;
  const files = [
    { path: "ReplicatedStorage/Forge/Config.luau", source: config },
    ...["CombatCore.luau", "Combat.server.luau", "Combat.client.luau"].map(
      (name) => ({
        path:
          (name.includes("client")
            ? "StarterPlayer/StarterPlayerScripts/"
            : "ServerScriptService/") + name,
        source: fs.readFileSync(
          new URL(`../../recipes/combat/${name}`, import.meta.url),
          "utf8",
        ),
      }),
    ),
  ];
  return {
    recipeVersion: "combat-slice/0.1.0",
    files: files.map((f) => ({
      ...f,
      sha256: createHash("sha256").update(f.source).digest("hex"),
    })),
  };
}
function xml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
export function exportPlace(artifact: Artifact) {
  let ref = 0;
  const item = (cls: string, name: string, properties = "", children = "") =>
    `<Item class="${cls}" referent="RBX${++ref}"><Properties><string name="Name">${xml(name)}</string>${properties}</Properties>${children}</Item>`;
  const script = (path: string, cls: string, name: string) => {
    const file = artifact.files.find((f) => f.path === path);
    if (!file) throw Error(`Missing required source: ${path}`);
    return item(
      cls,
      name,
      `<ProtectedString name="Source">${xml(file.source)}</ProtectedString>`,
    );
  };
  const floor = item(
    "Part",
    "ArenaFloor",
    '<bool name="Anchored">true</bool><Vector3 name="size"><X>100</X><Y>1</Y><Z>100</Z></Vector3>',
  );
  const spawn = item(
    "SpawnLocation",
    "Spawn",
    '<bool name="Anchored">true</bool><bool name="Neutral">true</bool><Vector3 name="size"><X>6</X><Y>1</Y><Z>6</Z></Vector3><CoordinateFrame name="CFrame"><X>0</X><Y>1</Y><Z>10</Z><R00>1</R00><R01>0</R01><R02>0</R02><R10>0</R10><R11>1</R11><R12>0</R12><R20>0</R20><R21>0</R21><R22>1</R22></CoordinateFrame>',
  );
  return `<?xml version="1.0" encoding="utf-8"?><roblox version="4">${item("Workspace", "Workspace", "", floor + spawn)}${item("ReplicatedStorage", "ReplicatedStorage", "", item("Folder", "Forge", "", item("RemoteEvent", "Combat") + script("ReplicatedStorage/Forge/Config.luau", "ModuleScript", "Config")))}${item("ServerScriptService", "ServerScriptService", "", script("ServerScriptService/CombatCore.luau", "ModuleScript", "CombatCore") + script("ServerScriptService/Combat.server.luau", "Script", "Combat"))}${item("StarterPlayer", "StarterPlayer", "", item("StarterPlayerScripts", "StarterPlayerScripts", "", script("StarterPlayer/StarterPlayerScripts/Combat.client.luau", "LocalScript", "Combat")))}</roblox>`;
}
