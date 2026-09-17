import { packager } from "@electron/packager";
import fs from "node:fs";
const electronVersion = JSON.parse(
  fs.readFileSync("node_modules/electron/package.json", "utf8"),
).version;
const paths = await packager({
  dir: "dist-desktop",
  out: "release",
  name: "Takko",
  electronVersion,
  platform: process.platform,
  arch: process.arch,
  overwrite: false,
  asar: false,
});
console.log("Unsigned local application bundle:", paths.join(", "));
