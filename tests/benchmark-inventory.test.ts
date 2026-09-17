import { expect, it } from "vitest";
import { inspectBenchmarkArtifact } from "../src/benchmark/inventory";
import type { Bundle } from "../src/generation/schema";

it("keeps runtime/source hints separate from instantiated assets and quality", () => {
  const b: Bundle = {
    scene: [
      {
        path: "Workspace/Forge_Test/Crystal",
        className: "WedgePart",
        properties: {},
      },
    ],
    files: [
      {
        path: "ServerScriptService/Forge_Test/Game.server.luau",
        kind: "Script",
        source:
          '-- AnimationId is discussed here\nlocal fx = Instance.new("ParticleEmitter")\nlocal gui = Instance.new("ScreenGui")',
      },
    ],
    assets: [],
    coverage: [],
  };
  const result = inspectBenchmarkArtifact(b);
  expect(result.declaredAnimationInstances).toBe(0);
  expect(result.declaredParticleEmitters).toBe(0);
  expect(result.declaredScreenGuis).toBe(0);
  expect(result.sourceMentions.animationApi).toHaveLength(1);
  expect(result.sourceMentions.particleApi).toHaveLength(1);
  expect(result).not.toHaveProperty("score");
  expect(result.unspecifiedPrimitiveMaterials).toBe(1);
});

it("deduplicates declared asset references without calling them played or permission-verified", () => {
  const b: Bundle = {
    files: [],
    coverage: [],
    assets: [
      {
        id: "sfx",
        kind: "audio",
        assetId: "123",
        requirementId: "sound",
        sourceUrl: null,
        status: "provided",
        description: "fixture",
      },
    ],
    scene: [
      {
        path: "Workspace/Forge_Test/Sound",
        className: "Sound",
        properties: { SoundId: "rbxassetid://123" },
      },
    ],
  };
  const result = inspectBenchmarkArtifact(b);
  expect(result.declaredAssetIds.audio).toEqual(["rbxassetid://123"]);
  expect(result.declaredSoundInstances).toBe(1);
  expect(result).not.toHaveProperty("playbackVerified");
});
