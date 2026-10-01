import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { buildAudioCapture } from "../scripts/build-audio-capture.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const output = path.join(root, "dist-desktop");
if (
  path.dirname(path.resolve(output)) !== path.resolve(root) ||
  path.basename(output) !== "dist-desktop"
)
  throw Error("Unexpected desktop output directory");
// Rebuild a generated directory only; never retain removed assets or stale compilers.
await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
await build({
  entryPoints: [path.join(root, "desktop/service.ts")],
  outfile: path.join(output, "service.cjs"),
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node22",
  sourcemap: true,
});
for (const file of [
  "main.mjs",
  "identity.mjs",
  "policy.mjs",
  "supervisor.mjs",
  "parent-channel.mjs",
  "service-environment.mjs",
  "status.html",
])
  await fs.copyFile(path.join(root, "desktop", file), path.join(output, file));
await fs.cp(path.join(root, "dist"), path.join(output, "web"), {
  recursive: true,
});
await fs.mkdir(path.join(output, "plugin"), { recursive: true });
await fs.copyFile(
  path.join(root, "plugin/Forge.plugin.luau"),
  path.join(output, "plugin/Forge.plugin.luau"),
);
const candidates = [".forge/tools/luau"];
for (const tool of ["luau-compile", "luau-ast"]) {
const compilerName = tool + (process.platform === "win32" ? ".exe" : "");
let copied = false;
for (const directory of candidates) {
  const source = path.join(root, directory, compilerName);
  if (
    await fs.stat(source).then(
      (stat) => stat.isFile(),
      () => false,
    )
  ) {
    await fs.mkdir(path.join(output, "tools/luau"), { recursive: true });
    await fs.copyFile(source, path.join(output, "tools/luau", compilerName));
    copied = true;
    break;
  }
}
if (!copied) throw Error("Required desktop Luau tool unavailable: " + compilerName);
}
const audioHelper = path.join(
  root,
  ".forge/tools/audio-capture/TakkoAudioCapture.exe",
);
if (process.platform === "win32") buildAudioCapture(path.dirname(audioHelper));
if (
  await fs.stat(audioHelper).then(
    (stat) => stat.isFile(),
    () => false,
  )
) {
  await fs.mkdir(path.join(output, "tools/audio-capture"), { recursive: true });
  await fs.copyFile(
    audioHelper,
    path.join(output, "tools/audio-capture/TakkoAudioCapture.exe"),
  );
}
const pkg = JSON.parse(
  await fs.readFile(path.join(root, "package.json"), "utf8"),
);
const codingRuntime = path.join(root, ".forge/tools/opencode-1.18.31/opencode.exe");
await fs.mkdir(path.join(output, "tools/rojo"), { recursive: true });
await fs.copyFile(path.join(root, ".forge/tools/rojo-7.7.0/rojo.exe"), path.join(output, "tools/rojo/rojo.exe"));
if (await fs.stat(codingRuntime).then(s => s.isFile(), () => false)) {
  await fs.mkdir(path.join(output, "tools/opencode"), { recursive: true });
  await fs.copyFile(codingRuntime, path.join(output, "tools/opencode/opencode.exe"));
}
await fs.writeFile(
  path.join(output, "package.json"),
  JSON.stringify(
    {
      name: "takko-desktop",
      productName: "Takko",
      version: pkg.version,
      description: pkg.description,
      private: true,
      main: "main.mjs",
      type: "module",
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Desktop resources built in dist-desktop. No application was launched.",
);
