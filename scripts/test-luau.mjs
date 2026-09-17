import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const suffix = process.platform === "win32" ? ".exe" : "";
const folder = process.env.LUAU_BIN_DIR ?? "research/tools/luau";
function run(binary, args) {
  const result = spawnSync(path.resolve(folder, binary + suffix), args, {
    encoding: "utf8",
  });
  if (result.error)
    throw Error(`Install Luau or set LUAU_BIN_DIR: ${result.error.message}`);
  if (result.status !== 0) throw Error(result.stdout + result.stderr);
  return result.stdout;
}
process.stdout.write(run("luau", ["tests/combat.luau"]));
const generated = spawnSync(
  process.execPath,
  ["--import", "tsx", "scripts/export-sample.ts"],
  { encoding: "utf8" },
);
if (generated.error || generated.status !== 0)
  throw Error(generated.stderr || String(generated.error));
for (const name of fs
  .readdirSync(".forge/sample", { recursive: true })
  .filter((f) => f.endsWith(".luau"))) {
  run("luau-compile", [path.join(".forge/sample", name)]);
  console.log("COMPILES " + name);
}
