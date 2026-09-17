/** Put reusable references before varying task data without dropping or summarizing it.
 * Everything remains user-message data; no external text is elevated to instructions.
 */
export function generationContextJson(context: unknown): string {
  if (!context || typeof context !== "object" || Array.isArray(context))
    return JSON.stringify(context);
  const value = context as Record<string, unknown>;
  const ordered: Record<string, unknown> = {};
  if (Object.hasOwn(value, "runtimeReference")) {
    const reference = value.runtimeReference;
    if (
      reference &&
      typeof reference === "object" &&
      !Array.isArray(reference)
    ) {
      const { hierarchy, references, ...shared } = reference as Record<
        string,
        unknown
      >;
      const scoped: Record<string, unknown> = { ...shared };
      if (Object.hasOwn(reference, "references"))
        scoped.references = references;
      if (Object.hasOwn(reference, "hierarchy")) scoped.hierarchy = hierarchy;
      ordered.runtimeReference = scoped;
    } else ordered.runtimeReference = reference;
  }
  if (Object.hasOwn(value, "instructions"))
    ordered.instructions = value.instructions;
  for (const [key, entry] of Object.entries(value))
    if (!Object.hasOwn(ordered, key)) ordered[key] = entry;
  return JSON.stringify(ordered);
}
