import { z } from "zod";
export const assetRoleSchema = z.enum(["character", "static_target", "tool", "prop", "vfx", "sound", "animation", "mesh", "image"]);
export type SupportedAssetRole = z.infer<typeof assetRoleSchema>;
export const assetRoleLabels: Record<SupportedAssetRole, string> = {
  character: "Character or NPC", static_target: "Static target", tool: "Tool or weapon",
  prop: "Prop or environment", vfx: "Visual effect", sound: "Sound", animation: "Animation", mesh: "Mesh", image: "Image or decal",
};
