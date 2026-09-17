import fs from "node:fs";
import { createProject, revise, approve, build } from "../src/core/project";
import { exportPlace } from "../src/core/recipe";
let project = revise(createProject("An arena combat prototype"), 1, {
  style: "jade",
  device: "both",
  pace: "quick",
});
project = build(approve(project, project.revision));
fs.mkdirSync(".forge/sample", { recursive: true });
fs.writeFileSync(
  ".forge/sample/Jade-Circuit.rbxlx",
  exportPlace(project.artifact!),
);
for (const file of project.artifact!.files) {
  const target = ".forge/sample/" + file.path;
  fs.mkdirSync(target.slice(0, target.lastIndexOf("/")), { recursive: true });
  fs.writeFileSync(target, file.source);
}
fs.writeFileSync(
  ".forge/sample/project.json",
  JSON.stringify(project, null, 2),
);
console.log(
  "Sample generated at .forge/sample/Jade-Circuit.rbxlx (Studio playtest pending)",
);
