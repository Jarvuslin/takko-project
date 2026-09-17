import fs from "node:fs";
import path from "node:path";
import { xml } from "../src/generation/export";
const verify = process.argv.includes("--verify");
const mazeVerify = process.argv.includes("--maze-verify");
const projectVerify = process.argv.indexOf("--project-verify");
const cookieVerify = process.argv.includes("--cookie-verify");
if (cookieVerify && projectVerify < 0) throw Error("--cookie-verify requires --project-verify <UUID>");
const directory = path.join(process.env.LOCALAPPDATA!, "Roblox", "Plugins");
fs.mkdirSync(directory, { recursive: true });
let source = fs.readFileSync("plugin/Forge.plugin.luau", "utf8");
if (projectVerify >= 0) {
  const id = process.argv[projectVerify + 1];
  if (!/^[0-9a-f-]{36}$/i.test(id ?? ""))
    throw Error("Supply a project UUID after --project-verify");
  source +=
    "\nlocal verification={id=" +
    JSON.stringify(id) +
    "}\n";
  if (cookieVerify) {
    const behavior = fs.readFileSync("tests/cookie-behavior.luau", "utf8");
    if (behavior.includes("]====]")) throw Error("Unsafe Luau long string delimiter");
    source += `verification.behaviorSource=[====[${behavior}]====]\n`;
  }
  source += fs.readFileSync("tests/project-studio-driver.luau", "utf8");
}
if (verify) {
  const info = JSON.parse(
    fs.readFileSync(
      ".forge/evaluation/scene-verification-project.json",
      "utf8",
    ),
  );
  source +=
    "\nlocal verification={id=" +
    JSON.stringify(info.id) +
    ",scope=" +
    JSON.stringify(info.scope) +
    "}\n" +
    fs.readFileSync("tests/studio-driver.luau", "utf8");
}
if (mazeVerify) {
  source +=
    "\nlocal verification={id='d0dab662-25dd-4705-a0ef-ed45134bf4bf',scope='Forge_d0dab66225dd'}\n";
  for (const [name, file] of [
    ["multiplayerServer", "multiplayer-server.luau"],
    ["multiplayerClient", "multiplayer-client.luau"],
  ]) {
    const text = fs.readFileSync("repairs/brainrot-maze/" + file, "utf8");
    if (text.includes("]====]"))
      throw Error("Unsafe Luau long string delimiter");
    source += `local ${name}=[====[${text}]====]\n`;
  }
  source += fs.readFileSync("tests/maze-studio-driver.luau", "utf8");
}
const destination = path.join(directory, "Forge.rbxmx");
if (fs.existsSync(destination))
  fs.copyFileSync(destination, destination + ".backup");
fs.writeFileSync(
  destination,
  `<roblox version="4"><External>null</External><External>nil</External><Item class="Script" referent="RBX0"><Properties><string name="Name">Forge</string><ProtectedString name="Source">${xml(source)}</ProtectedString></Properties></Item></roblox>`,
);
console.log(
  "Installed " +
    (verify || mazeVerify || projectVerify >= 0
      ? "temporary verification build: "
      : "Forge: ") +
    destination,
);
