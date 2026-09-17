// Independent native integration fixture, not a generated customer game.
import fs from "node:fs";
import { GenerationStore, newProject } from "../src/generation/store";
import { bundleSchema } from "../src/generation/schema";
import { validateBundle, compileSources } from "../src/generation/validation";
import { specification, fixtureBundle } from "../tests/generation-fixtures";

const project = newProject(
  "Verify texture, click detection and UI scene capabilities in Studio",
  0,
);
project.name = "Forge scene capability verification";
project.spec = specification(project.request, project.scope);
const bundle = fixtureBundle(project.request, project.scope);
const part = `Workspace/${project.scope}/Ground`;
const gui = `StarterGui/${project.scope}/CapabilityGui`;
bundle.scene.push(
  {
    path: part + "/Texture",
    className: "Texture",
    properties: {
      Face: { type: "Enum", enum: "NormalId", value: 1 },
      StudsPerTileU: 4,
      StudsPerTileV: 4,
    },
  },
  {
    path: part + "/Decal",
    className: "Decal",
    properties: { Face: { type: "Enum", enum: "NormalId", value: 0 } },
  },
  {
    path: part + "/ClickDetector",
    className: "ClickDetector",
    properties: { MaxActivationDistance: 32 },
  },
  { path: gui, className: "ScreenGui", properties: { ResetOnSpawn: false } },
  {
    path: gui + "/Scroll",
    className: "ScrollingFrame",
    properties: {
      Size: { type: "UDim2", value: [0, 300, 0, 200] },
      CanvasSize: { type: "UDim2", value: [0, 0, 0, 400] },
    },
  },
  {
    path: gui + "/Scroll/Entry",
    className: "TextBox",
    properties: {
      Text: "COOKIE",
      Size: { type: "UDim2", value: [0, 100, 0, 40] },
    },
  },
  {
    path: gui + "/Scroll/Grid",
    className: "UIGridLayout",
    properties: { CellSize: { type: "UDim2", value: [0, 100, 0, 40] } },
  },
  {
    path: gui + "/Scroll/Scale",
    className: "UIScale",
    properties: { Scale: 0.8 },
  },
  {
    path: gui + "/Scroll/Entry/Aspect",
    className: "UIAspectRatioConstraint",
    properties: { AspectRatio: 2 },
  },
);
project.artifact = bundleSchema.parse(bundle);
project.review = {
  issues: [],
  tests: [
    {
      id: "native_scene_capabilities",
      requirementId: "core",
      mode: "server",
      source: `return function(ctx)
 local part=workspace:WaitForChild(ctx.scope):WaitForChild("Ground")
 assert(part.Texture:IsA("Texture") and part.Texture.Face==Enum.NormalId.Top,"Texture face did not apply")
 assert(part.Texture.StudsPerTileU==4 and part.Texture.StudsPerTileV==4,"Texture dimensions did not apply")
 assert(part.Decal:IsA("Decal") and part.Decal.Face==Enum.NormalId.Right,"Decal face did not apply")
 assert(part.ClickDetector:IsA("ClickDetector") and part.ClickDetector.MaxActivationDistance==32,"ClickDetector did not apply")
 end`,
    },
    {
      id: "native_ui_capabilities",
      requirementId: "core",
      mode: "client",
      source: `return function(ctx)
 local gui=game:GetService("Players").LocalPlayer:WaitForChild("PlayerGui"):WaitForChild(ctx.scope):WaitForChild("CapabilityGui")
 local scroll=gui:WaitForChild("Scroll")
 assert(scroll:IsA("ScrollingFrame") and scroll.CanvasSize.Y.Offset==400,"CanvasSize did not apply")
 assert(scroll.Entry:IsA("TextBox") and scroll.Entry.Text=="COOKIE","TextBox did not apply")
 assert(scroll.Grid:IsA("UIGridLayout") and scroll.Grid.CellSize.X.Offset==100,"Grid did not apply")
 assert(math.abs(scroll.Scale.Scale-0.8)<0.001 and scroll.Entry.Aspect.AspectRatio==2,"UI sizing did not apply")
 end`,
    },
  ],
};
project.checks = [
  ...validateBundle(project.artifact, project),
  ...(await compileSources(project.artifact, project.review.tests)),
];
if (project.checks.some((c) => c.status === "failed"))
  throw Error(JSON.stringify(project.checks));
project.approvedRevision = project.revision;
project.completedBuildTasks = project.spec.tasks.map((t) => t.id);
project.stage = "ready_to_test";
new GenerationStore(".forge/projects").save(project);
fs.writeFileSync(
  ".forge/evaluation/capability-project.json",
  JSON.stringify({ id: project.id, scope: project.scope }),
);
console.log(JSON.stringify({ id: project.id, stage: project.stage }));
