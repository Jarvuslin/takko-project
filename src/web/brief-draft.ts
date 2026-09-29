export function sameAnswers(
  a: Record<string, string>,
  b: Record<string, string>,
) {
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) => Object.hasOwn(b, key) && a[key] === b[key])
  );
}
