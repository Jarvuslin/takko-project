import { packager } from "@electron/packager";
import fs from "node:fs";
const electronVersion = JSON.parse(
  fs.readFileSync("node_modules/electron/package.json", "utf8"),
).version;
const paths = await packager({
  dir: "dist-desktop",
  // Stage first. Cutover of the one installed bundle requires the app to exit.
  out: process.env.TAKKO_PACKAGE_OUT || ".forge/update-stage/app",
  name: "Takko",
  electronVersion,
  platform: process.platform,
  arch: process.arch,
  overwrite: false,
  asar: false,
});
console.log("Unsigned local application bundle:", paths.join(", "));
