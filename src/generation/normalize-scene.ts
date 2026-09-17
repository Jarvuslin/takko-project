import { capabilities } from "./capabilities";
import type { Bundle, PropertyValue } from "./schema";

/** Converts only exact names from the captured native enum for this property. */
export function normalizeKnownEnumValue(
  className: string,
  propertyName: string,
  value: PropertyValue,
): PropertyValue {
  if (typeof value !== "string") return value;
  const expected =
    capabilities.classes[className]?.properties[propertyName]?.enum;
  if (!expected) return value;
  const prefix = `Enum.${expected}.`;
  const itemName = value.startsWith(prefix)
    ? value.slice(prefix.length)
    : value;
  const items = capabilities.enums[expected];
  if (!items || !Object.hasOwn(items, itemName)) return value;
  return { type: "Enum", enum: expected, value: items[itemName] };
}

/** Canonicalizes representation only; it never guesses a class, property or enum item. */
export function normalizeKnownSceneEnums(bundle: Bundle): Bundle {
  return {
    ...bundle,
    scene: bundle.scene.map((node) => ({
      ...node,
      properties: Object.fromEntries(
        Object.entries(node.properties).map(([name, value]) => [
          name,
          normalizeKnownEnumValue(node.className, name, value),
        ]),
      ),
    })),
  };
}
