import { capabilities, sceneClasses } from "./capabilities";
/** Runtime reference and native Studio capability snapshot. */
export function robloxContext(scope: string) {
  return {
    version: "2026-09-14",
    studioVersion: capabilities.studioVersion,
    sceneClasses,
    textures:
      'Texture and Decal are supported. Face requires {type:"Enum",enum:"NormalId",value:1} for Top, never enum:"Top". Discover requested images through the Marketplace asset pipeline, preferably as part of a complete reusable component. Inspect and verify the selected image before integration. Do not invent IDs or require the user to supply an image that the worker can discover. If retrieval or verification cannot complete, report the specific gap instead of claiming a replacement satisfies the request.',
    hierarchy: {
      namespace: scope,
      examplePath: `Workspace/${scope}/World/Ground`,
      lookup: `local root = workspace:WaitForChild("${scope}")\nlocal ground = root:WaitForChild("World"):WaitForChild("Ground")`,
      rule: "Manifest slash paths describe separate nested Instances. FindFirstChild and WaitForChild take ONE child name, never a slash path. Never create a Folder whose name combines namespace and /children. Script filenames lose .server.luau, .client.luau, .module.luau or .luau at runtime. Example: BuffUtils.module.luau becomes BuffUtils.",
    },
    sceneProperties:
      "Name and Parent come from the path: omit both from properties. BasePart uses Color (Color3 value), Size (Vector3), CFrame, Anchored and CanCollide; it has no Color3 or Scale property. Set a walkable ground surface and a collidable spawn. LocalScripts run in StarterGui or StarterPlayerScripts; shared ModuleScripts in ReplicatedStorage are required explicitly.",
    references: {
      example: { type: "Ref", path: `Workspace/${scope}/Character/Torso` },
      rule: "Part0, Part1, PrimaryPart, Attachment0/1 and Adornee use {type:'Ref',path:'exact scene path'}, never strings or nested Instances. Null path clears a reference. All referenced nodes must be declared in this bundle or existing dependencies. References resolve after construction, so forward references work. Humanoid, Animator, AnimationController, Motor6D, Weld, WeldConstraint and Highlight are supported scene classes. Motor6D requires BasePart Part0/Part1 and CFrame C0/C1. Models containing a Humanoid need a connected, unanchored rig to move, not just disconnected decorative parts.",
    },
    animation:
      "Resize individual Parts with Size, recolor with Color, and animate via TweenService:Create(part, TweenInfo.new(seconds), {Size=targetSize, Color=targetColor}). Models scale with ScaleTo(number) and move with PivotTo(CFrame). Do not invent Part.Scale. Keep a crop's bottom above its soil while changing height.",
    interactions:
      "ProximityPrompt.Triggered connects on the server and supplies player. Validate humanoid health, distance, rate limits, ownership and current state on the server. Do not trust client attributes or RemoteEvent payloads. Per-player state requires indexing by player/UserId, not just a shared object name; clean associated objects and connections when they leave.",
    presentation:
      "A ScreenGui belongs in PlayerGui at runtime; LocalScripts may create it there. Put GUI Frames inside a ScreenGui, not directly inside PlayerGui. For a ResetOnSpawn=false HUD, keep its controller in StarterPlayerScripts or inside that persistent ScreenGui. A LocalScript directly under a StarterGui Folder restarts after respawn and can create duplicate, stale HUDs. Rebind health subscriptions on CharacterAdded and disconnect old connections. Send initial state after the client is ready, or use replicated attributes/value objects that the HUD reads initially and observes for changes. A one-time FireClient during PlayerAdded can be missed.",
    audio:
      "Audio is Marketplace-only. Discover complete reusable components first, preserving included sound references and provenance; search separately for missing sounds. Audio must pass the asset pipeline's loading, playback and listening checks before acceptance. Built-in, generated, placeholder and procedural audio are not permitted fallbacks. If verified audio is unavailable, report the unmet requirement rather than silently substituting sound. Do not invent IDs or claim unperformed playback tests.",
    verification:
      "FindFirstChild absence is a failure when an object is required: assert its presence before checking behavior. Tests must not skip absent objects, compare fabricated state tables, or call nonexistent signal Fire methods. Keep tests out of the live player loop; use the protected review harness for acceptance tests. Report untestable interactions honestly.",
  };
}
