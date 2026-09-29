import snapshot from "./roblox-capabilities.json" with { type: "json" };
type Property = { type: string; engineType: string; enum?: string };
export const capabilities = snapshot as {
  studioVersion: string;
  classes: Record<
    string,
    { superclass: string; properties: Record<string, Property> }
  >;
  enums: Record<string, Record<string, number>>;
};
export const sceneClasses = Object.keys(capabilities.classes) as [
  string,
  ...string[],
];
export function scenePropertyError(
  className: string,
  name: string,
  value: unknown,
) {
  const property = capabilities.classes[className]?.properties[name];
  if (!property)
    return `${className}.${name} is not a writable supported property in Studio ${capabilities.studioVersion}.`;
  if (property.enum) {
    const v = value as { type?: string; enum?: string; value?: number };
    if (
      !v ||
      v.type !== "Enum" ||
      v.enum !== property.enum ||
      !Object.values(capabilities.enums[property.enum] ?? {}).includes(v.value!)
    )
      return `${className}.${name} requires Enum.${property.enum} using {type:"Enum",enum:"${property.enum}",value:<numeric item value>}. Allowed items: ${JSON.stringify(capabilities.enums[property.enum])}`;
  } else if (["string", "number", "boolean"].includes(property.type)) {
    if (typeof value !== property.type)
      return `${className}.${name} requires ${property.type}.`;
  } else {
    const expected = property.type === "Instance" ? "Ref" : property.type;
    const v = value as { type?: string };
    if (!v || typeof v !== "object" || v.type !== expected)
      return `${className}.${name} requires ${expected}. If this type is not supported by the manifest schema, construct it in a task-owned Luau script.`;
  }
  return null;
}
