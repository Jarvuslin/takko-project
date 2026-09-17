// Independent Studio integration fixture; this is not model-generated gameplay.
import fs from "node:fs";
import { GenerationStore, newProject } from "../src/generation/store";
import { bundleSchema, type Review } from "../src/generation/schema";
import { validateBundle, compileSources } from "../src/generation/validation";
import { exportBundle } from "../src/generation/export";

const p = newProject(
  "Verify character references, joint movement and Studio client/server integration",
  250000,
);
p.name = "Forge Studio connection verification";
const w = `Workspace/${p.scope}`;
const rig = w + "/Rig";
const cf = (x: number, y: number, z: number) => ({
  type: "CFrame",
  value: [x, y, z, 1, 0, 0, 0, 1, 0, 0, 0, 1],
});
const vec = (x: number, y: number, z: number) => ({
  type: "Vector3",
  value: [x, y, z],
});
const ref = (path: string) => ({ type: "Ref", path });
p.artifact = bundleSchema.parse({
  scene: [
    {
      path: w + "/Ground",
      className: "Part",
      properties: {
        Anchored: true,
        Size: vec(80, 1, 80),
        CFrame: cf(0, -0.5, 0),
        Color: { type: "Color3", value: [0.16, 0.23, 0.2] },
      },
    },
    {
      path: w + "/Spawn",
      className: "SpawnLocation",
      properties: {
        Anchored: true,
        Size: vec(6, 1, 6),
        CFrame: cf(0, 0.5, 12),
        Neutral: true,
      },
    },
    {
      path: rig,
      className: "Model",
      properties: { PrimaryPart: ref(rig + "/HumanoidRootPart") },
    },
    {
      path: rig + "/Humanoid",
      className: "Humanoid",
      properties: { RequiresNeck: false },
    },
    { path: rig + "/Humanoid/Animator", className: "Animator", properties: {} },
    {
      path: rig + "/HumanoidRootPart",
      className: "Part",
      properties: {
        Anchored: true,
        CanCollide: false,
        Transparency: 1,
        Size: vec(2, 2, 1),
        CFrame: cf(0, 4, 0),
      },
    },
    {
      path: rig + "/Torso",
      className: "Part",
      properties: {
        CanCollide: false,
        Size: vec(2, 2, 1),
        CFrame: cf(0, 4, 0),
        Color: { type: "Color3", value: [0.5, 0.8, 0.1] },
      },
    },
    {
      path: rig + "/Head",
      className: "Part",
      properties: {
        CanCollide: false,
        Size: vec(2, 1, 1),
        CFrame: cf(0, 5.5, 0),
      },
    },
    {
      path: rig + "/HumanoidRootPart/RootJoint",
      className: "Motor6D",
      properties: {
        Part0: ref(rig + "/HumanoidRootPart"),
        Part1: ref(rig + "/Torso"),
      },
    },
    {
      path: rig + "/Torso/Neck",
      className: "Motor6D",
      properties: {
        Part0: ref(rig + "/Torso"),
        Part1: ref(rig + "/Head"),
        C0: cf(0, 1.5, 0),
      },
    },
    {
      path: rig + "/Outline",
      className: "Highlight",
      properties: { Adornee: ref(rig), FillTransparency: 1 },
    },
    {
      path: rig + "/Torso/Prompt",
      className: "ProximityPrompt",
      properties: {
        ActionText: "Inspect rig",
        ObjectText: "Forge verification",
        MaxActivationDistance: 15,
      },
    },
  ],
  files: [
    {
      path: `StarterPlayer/StarterPlayerScripts/${p.scope}/Hud.client.luau`,
      kind: "LocalScript",
      source: `local gui=Instance.new('ScreenGui') gui.Name='ForgeConnectionHUD' gui.ResetOnSpawn=false gui.Parent=game:GetService('Players').LocalPlayer:WaitForChild('PlayerGui')
local label=Instance.new('TextLabel') label.Size=UDim2.new(1,0,0,50) label.Text='FORGE / Studio connection verification' label.TextSize=24 label.Parent=gui
`,
    },
  ],
  coverage: [
    {
      requirementId: "integration",
      status: "implemented",
      detail: "Independent integration fixture",
      files: [rig],
    },
  ],
});
p.spec = {
  title: p.name,
  summary: p.request,
  visualDirection: "Integration fixture",
  questions: [],
  requirements: [
    {
      id: "integration",
      description: p.request,
      sourceQuote: p.request,
      origin: "user",
      category: "world",
      priority: "required",
      acceptance:
        "Engine references and movement match the manifest; client runs.",
    },
  ],
  tasks: [
    {
      id: "integration",
      title: "Integration fixture",
      requirements: ["integration"],
      dependsOn: [],
      files: p.artifact.files.map((f) => f.path),
    },
  ],
};
p.review = {
  issues: [],
  tests: [
    {
      id: "rigReferences",
      requirementId: "integration",
      mode: "server",
      source: `return function(ctx)
local rig=workspace:WaitForChild(ctx.scope):WaitForChild('Rig')
local root=rig:WaitForChild('HumanoidRootPart') local torso=rig:WaitForChild('Torso') local head=rig:WaitForChild('Head')
assert(rig.PrimaryPart==root,'PrimaryPart did not resolve')
assert(root.RootJoint.Part0==root and root.RootJoint.Part1==torso,'Root joint references invalid')
assert(torso.Neck.Part0==torso and torso.Neck.Part1==head,'Neck references invalid')
assert(rig.Outline.Adornee==rig,'Highlight Adornee invalid')
assert(rig.Humanoid.Animator:IsA('Animator'),'Animator missing')
local before=head.Position
torso.Neck.C0=CFrame.new(0,3,0)
task.wait(.5)
assert(head.Position.Y>before.Y+1,'Motor6D did not move the connected head')
torso.Neck.C0=CFrame.new(0,1.5,0)
task.wait(.5)
assert((head.Position-before).Magnitude<.2,'Joint did not return to its original position')
end`,
    },
    {
      id: "clientHud",
      requirementId: "integration",
      mode: "client",
      source: `return function(ctx)
local player=game:GetService('Players').LocalPlayer
local gui=player:WaitForChild('PlayerGui'):WaitForChild('ForgeConnectionHUD',8)
assert(gui and gui:FindFirstChildOfClass('TextLabel'),'Client HUD was not initialized')
local char=player.Character or player.CharacterAdded:Wait()
assert(char:WaitForChild('Humanoid').Health>0,'Player failed to spawn alive')
end`,
    },
  ],
} satisfies Review;
p.approvedRevision = p.revision;
p.checks = [
  ...validateBundle(p.artifact, p),
  ...(await compileSources(p.artifact, p.review.tests)),
];
if (p.checks.some((c) => c.status === "failed"))
  throw Error(JSON.stringify(p.checks));
p.stage = "ready_to_test";
new GenerationStore(".forge/projects").save(p);
fs.mkdirSync(".forge/evaluation", { recursive: true });
fs.writeFileSync(
  ".forge/evaluation/Forge-scene-verification.rbxlx",
  exportBundle(p.artifact, p.scope).replace(
    "</roblox>",
    '<Item class="HttpService" referent="HttpFixture"><Properties><bool name="HttpEnabled">true</bool></Properties></Item></roblox>',
  ),
);
fs.writeFileSync(
  ".forge/evaluation/scene-verification-project.json",
  JSON.stringify({ id: p.id, scope: p.scope }),
);
console.log(JSON.stringify({ id: p.id, scope: p.scope, checks: p.checks }));
