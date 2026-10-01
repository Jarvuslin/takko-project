import type { Spec } from "../src/generation/schema";
import type { NativeAcceptance } from "../src/generation/native-acceptance";

// Frozen observable contracts, not game implementations. This batch evaluates
// acquisition/integration/build/repair from an approved spec, not proposal UX.
export const finalCases = [
  {
    id: "combat", rig: "R6",
    request: "Build a tiny R6 fighting demo on the default baseplate. Use a Marketplace training dummy and an existing R6 punch animation from a Marketplace model. F punches the stationary target six studs in front of spawn. Each valid hit increments server-owned player attribute Hits once. A readable HUD named DemoHUD contains a TextLabel named Counter showing Hits: N. Animate the actual player punch. Reject distant hits, debounce rapid requests and retain the counter across respawn. Use actual inspected asset content, never invent animation IDs or replace the selected assets with generated primitives.",
    needs: [
      { id: "target", query: "training dummy", role: "Stationary punch target, reuse its actual geometry", position: [0, 3, -6], deliveryRole: "visible_prop" },
      { id: "punch", query: "R6 punch animation", role: "Existing R6 punch KeyframeSequence or playable Animation inside a model, use its captured animation content", position: [0, 0, 0], deliveryRole: "source_data" },
    ],
  },
  {
    id: "npc", rig: "R15",
    request: "Build a tiny R15 meet-the-patroller demo on the default baseplate. Acquire a working Marketplace patrol NPC with existing walking behavior. Preserve its useful behavior, rewire script placement or references if needed, and let it move at least two studs within eight seconds. E while within eight studs greets it and increments server-owned player attribute Greetings exactly once. A readable HUD named DemoHUD contains a TextLabel named Counter showing Greetings: N. Reject distant interactions and retain the counter across respawn. Never replace the NPC's useful walking scripts with a new unrelated implementation.",
    needs: [{ id: "npc", query: "patrol npc", role: "Working walking NPC with scripts and rig. Preserve useful movement behavior and integrate greeting", position: [0, 3, -8], deliveryRole: "visible_prop" }],
  },
  {
    id: "audio", rig: "R15",
    request: "Build a tiny R15 sound-button demo on the default baseplate. Acquire a free Marketplace radio model containing a Sound. Inspect its hierarchy and sources. Extract and reuse the actual nested audio, without running unrelated radio scripts or rendering an unnecessary rig. E near a labeled button at (0, 1, -6) increments server-owned player attribute Presses once and plays that Sound locally. Expose the playing Sound as DemoSound under SoundService. A readable HUD named DemoHUD contains a TextLabel named Counter showing Presses: N. Reject presses beyond eight studs, debounce requests and retain the count across respawn. Do not invent an audio ID or use built-in audio.",
    needs: [{ id: "radio", query: "radio", role: "Source container for a real nested Sound. Inspect scripts and extract useful audio without unrelated behavior", position: [0, 0, 0], deliveryRole: "source_data" }],
  },
] as const;
export type FinalCase = typeof finalCases[number];
export function finalSpec(c: FinalCase, scope: string): Spec {
  return {
    title: "Final evaluation " + c.id,
    summary: c.request + " Spawn at (0, 3, 0), facing negative Z. ServerScriptService, ReplicatedStorage and StarterPlayerScripts files must stay under the supplied namespace. These names are observable acceptance interfaces, not supplied implementation. Asset behavior, content, permissions and integration must be established by the actual production acquisition path.",
    visualDirection: "Use the existing baseplate. Clear target/button/NPC, readable desktop HUD and no floating arena.",
    requirements: [{ id: "demo", description: c.request, acceptance: "Real keyboard interaction updates the server-owned counter and HUD. Actual asset behavior/media runs. Distance rejects invalid actions. State survives respawn.", origin: "user", sourceId: "request", sourceQuote: c.request, category: "mechanic", priority: "required" }],
    questions: [],
    assetStrategy: "Inspect and reuse the complete chosen Marketplace content. Preserve useful behavior. Missing evidence is unknown. Source review is not native behavior verification.",
    assetNeeds: c.needs.map(n => ({ ...n, position: [...n.position], requirementId: "demo", kind: "Model", constraints: n.role + ". Match the complete requested demo, verify actual contents before declaring compatibility.", required: true, maxSize: 8 })),
    tasks: [{ id: "demo", title: "Integrate the acquired content and complete the demo", requirements: ["demo"], dependsOn: [], files: [`ServerScriptService/${scope}/Game.server.luau`, `StarterPlayer/StarterPlayerScripts/${scope}/Controller.client.luau`, `ReplicatedStorage/${scope}/Contract.module.luau`] }],
  };
}
const result = (expression: string, detail: string) => `return game:GetService("HttpService"):JSONEncode({passed=(${expression}),detail=tostring(${detail})})`;
export function finalAcceptance(c: FinalCase, scope: string, revision: number): NativeAcceptance {
  const attribute = c.id === "combat" ? "Hits" : c.id === "npc" ? "Greetings" : "Presses";
  const player = `local p=game:GetService("Players").LocalPlayer `;
  const serverPlayer = `local p=game:GetService("Players"):GetPlayers()[1] assert(p,"missing player") `;
  const root = `workspace:FindFirstChild(${JSON.stringify(scope)})`;
  const steps: NativeAcceptance["steps"] = [
    { id: "spawn", description: "Living player on default baseplate and counter initialized", datamodel: "Client", code: player + `task.wait(3) local ch=p.Character local h=ch and ch:FindFirstChildOfClass("Humanoid") local r=ch and ch:FindFirstChild("HumanoidRootPart") ` + result(`h~=nil and h.Health>0 and r~=nil and r.Position.Y>0 and p:GetAttribute("${attribute}")==0`, `p:GetAttribute("${attribute}")`) },
  ];
  if (c.id === "npc") steps.push({ id: "npc-walk", description: "Retained NPC walks at least two studs in eight seconds", datamodel: "Server", code: `local root=${root} local h=root and root:FindFirstChildWhichIsA("Humanoid",true) local r=h and h.Parent:FindFirstChild("HumanoidRootPart") assert(r,"missing retained NPC rig") local before=r.Position task.wait(8) local d=(r.Position-before).Magnitude ` + result("d>=2 and h.Health>0", "d") });
  steps.push({ id: "approach", description: "Place the test player near the actual interaction", datamodel: "Server", code: serverPlayer + (c.id === "npc" ? `local root=${root} local h=root and root:FindFirstChildWhichIsA("Humanoid",true) local r=h and h.Parent:FindFirstChild("HumanoidRootPart") assert(r,"missing NPC") p.Character:PivotTo(CFrame.new(r.Position+Vector3.new(0,0,4),r.Position)) ` : `p.Character:PivotTo(CFrame.new(0,3,-2)) `) + result("true", '"test positioning only"') });
  if (c.id === "combat") steps.push({ id: "animation-observer", description: "Install runtime-only punch playback observer", datamodel: "Client", code: player + `p:SetAttribute("AcceptancePunchFrames",0) task.spawn(function() local endAt=os.clock()+8 while os.clock()<endAt do local h=p.Character and p.Character:FindFirstChildOfClass("Humanoid") local a=h and h:FindFirstChildOfClass("Animator") if a then for _,t in a:GetPlayingAnimationTracks() do if t.Priority.Value>=Enum.AnimationPriority.Action.Value and t.IsPlaying and t.Length>0 then p:SetAttribute("AcceptancePunchFrames",p:GetAttribute("AcceptancePunchFrames")+1) end end end task.wait(.03) end end) ` + result("true", '"observer armed, no gameplay source changed"') });
  steps.push({ id: "keyboard-hit", description: "Real keyboard action creates exactly one server-confirmed increment", datamodel: "Client", keys: [c.id === "combat" ? "F" : "E"], code: player + `task.wait(.6) ` + result(`p:GetAttribute("${attribute}")==1`, `p:GetAttribute("${attribute}")`) });
  if (c.id === "combat") steps.push({ id: "punch-playback", description: "Actual action-priority animation plays on the player", datamodel: "Client", code: player + result('(p:GetAttribute("AcceptancePunchFrames") or 0)>0', 'p:GetAttribute("AcceptancePunchFrames")') });
  if (c.id === "audio") steps.push({ id: "audio-playback", description: "Extracted asset audio loads and advances during a second press", datamodel: "Client", keys: ["E"], code: `local s=game:GetService("SoundService"):FindFirstChild("DemoSound") local before=s and s.TimePosition task.wait(.2) ` + result("s~=nil and s.IsLoaded and s.TimeLength>0 and s.IsPlaying and s.TimePosition~=before", 's and (s.SoundId.." time="..s.TimePosition) or "missing DemoSound"') });
  steps.push({ id: "hud", description: "One desktop HUD shows the real counter", datamodel: "Client", code: player + `local guis=p:WaitForChild("PlayerGui") local count=0 local hud for _,g in guis:GetChildren() do if g.Name=="DemoHUD" then count+=1 hud=g end end local label=hud and hud:FindFirstChild("Counter",true) ` + result(`count==1 and label~=nil and label.Text=="${attribute}: "..tostring(p:GetAttribute("${attribute}"))`, 'label and label.Text or "missing Counter"') });
  steps.push({ id: "far-setup", description: "Move test player beyond interaction range", datamodel: "Server", code: serverPlayer + `p:SetAttribute("AcceptanceBefore",p:GetAttribute("${attribute}")) p.Character:PivotTo(CFrame.new(80,3,0)) ` + result("true", '"test positioning only"') });
  steps.push({ id: "far-reject", description: "Distant key press does not award a hit or interaction", datamodel: "Client", keys: [c.id === "combat" ? "F" : "E"], code: player + `task.wait(.6) ` + result(`p:GetAttribute("${attribute}")==p:GetAttribute("AcceptanceBefore")`, `p:GetAttribute("${attribute}")`) });
  steps.push({ id: "respawn", description: "Server counter survives a real character reload", datamodel: "Server", code: serverPlayer + `local before=p:GetAttribute("${attribute}") p:LoadCharacterAsync() task.wait(1) ` + result(`p:GetAttribute("${attribute}")==before`, `p:GetAttribute("${attribute}")`) });
  return { revision, repair: true, steps };
}
