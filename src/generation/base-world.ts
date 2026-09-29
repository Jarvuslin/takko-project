import template from "./baseplate-template.json" with { type: "json" };
import type { PropertyValue } from "./schema";

/** Read from the default Baseplate in Studio 0.740.0.7400927 via documented RunScript. */
export const baseWorld = {
  version: 1,
  source: template.source,
  studioVersion: template.version,
  groundTop: 0,
  instructions: [
    "The host already provides a standard baseplate with its top at y=0, Lighting, Sky and Atmosphere. Build directly on this ground.",
    "Do not add a duplicate floor slab, enclosed box, ceiling or raised platform unless a user requirement calls for it. Keep spawn close to the ground unless the requested spatial design requires elevation.",
    "Keep template lighting unchanged. Do not modify Lighting, Sky, Atmosphere or post-effects, or create PointLight, SpotLight or SurfaceLight instances, unless a user-backed requirement explicitly requests a lighting mood (night, dark interior, horror) or visible light sources (lamps, torches). Preserve unchanged existing lighting during follow-ups. Native images are required to judge lighting.",
  ],
  nodes: template.instances.map((item) => ({
    path: item.path.replaceAll(".", "/"),
    className: item.className,
    properties: Object.fromEntries(Object.entries(item.properties).map(([key, value]) => [
      key,
      Array.isArray(value)
        ? { type: ["Size", "Position"].includes(key) ? "Vector3" : "Color3", value }
        : typeof value === "object" && value !== null
          ? { type: "Enum", enum: key, value: value.value }
          : value,
    ])) as Record<string, PropertyValue>,
  })),
};
