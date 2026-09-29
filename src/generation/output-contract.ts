/** Provider grammar is a subset of local validation. Never remove local checks. */
export type OutputContract = { name: string; schema: Record<string, unknown> };

export function anthropicOutputSchema(
  input: Record<string, unknown>,
): Record<string, unknown> {
  const visit = (node: any): any => {
    if (!node || typeof node !== "object" || Array.isArray(node)) return node;
    const result = { ...node };
    const hints: string[] = [];
    for (const key of [
      "minLength",
      "maxLength",
      "minimum",
      "maximum",
      "exclusiveMinimum",
      "exclusiveMaximum",
      "multipleOf",
      "maxItems",
      "uniqueItems",
    ]) {
      if (key in result) {
        hints.push(`${key}: ${JSON.stringify(result[key])}`);
        delete result[key];
      }
    }
    if (typeof result.minItems === "number" && result.minItems > 1) {
      hints.push(`minItems: ${result.minItems}`);
      result.minItems = 1;
    }
    if (hints.length)
      result.description = [
        result.description,
        "Locally validated constraints: " + hints.join(", "),
      ]
        .filter(Boolean)
        .join(". ");
    for (const key of ["properties", "$defs", "definitions"])
      if (result[key])
        result[key] = Object.fromEntries(
          Object.entries(result[key]).map(([name, value]) => [
            name,
            visit(value),
          ]),
        );
    if (result.items) result.items = visit(result.items);
    for (const key of ["anyOf", "allOf", "oneOf"])
      if (result[key]) result[key] = result[key].map(visit);
    if (result.type === "object") result.additionalProperties = false;
    delete result.$schema;
    return result;
  };
  return visit(input);
}
