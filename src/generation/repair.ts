import type { Bundle } from "./schema";

function canonical(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value && typeof value === "object")
    return (
      "{" +
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => JSON.stringify(key) + ":" + canonical(entry))
        .join(",") +
      "}"
    );
  return JSON.stringify(value);
}

/** A repair must alter the artifact before a fresh review can clear its failures. */
export function assertRepairChanges(base: Bundle, patch: Bundle): void {
  const changed = <T>(before: T[], updates: T[], key: (item: T) => string) => {
    const effective = new Map(before.map((item) => [key(item), item]));
    for (const update of updates) effective.set(key(update), update);
    return canonical([...effective.values()]) !== canonical(before);
  };
  if (
    changed(base.files, patch.files, (file) => file.path) ||
    changed(base.scene, patch.scene, (node) => node.path) ||
    changed(base.coverage, patch.coverage, (item) => item.requirementId) ||
    changed(base.assets, patch.assets, (item) => item.id)
  )
    return;
  throw Error(
    "Repair did not change the artifact. Return changed files, scene nodes or asset/coverage data that address the reported failures. Repeating existing output cannot resolve them; existing acceptance tests remain protected.",
  );
}
