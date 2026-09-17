import fs from "node:fs";
import { expect, it } from "vitest";
import { assertNoRuntimeSourceWrites } from "../src/generation/runtime-source-check";
it.each([
  'local s=Instance.new("Script"); s.Source="print(1)"',
  'script["Source"] = "return 1"',
  'script.Source ..= "return 1"',
])("rejects an actual protected-source assignment: %s", (source) => {
  expect(() => assertNoRuntimeSourceWrites(source)).toThrow("protected Source");
});
it("ignores comments and strings containing source-looking text", () => {
  expect(() =>
    assertNoRuntimeSourceWrites(
      '-- child.Source="x"\nlocal note=[[script.Source="x"]]\nreturn note',
    ),
  ).not.toThrow();
});
it("detects the retained raw worker failure the reviewer approved", () => {
  const source = fs.readFileSync(
    "docs/results/takko-component-adaptation/native-v2/bubble-wrap/worker-source-4.luau",
    "utf8",
  );
  expect(() => assertNoRuntimeSourceWrites(source)).toThrow("116,1");
});
it("fails on invalid Luau instead of bypassing analysis", () => {
  expect(() => assertNoRuntimeSourceWrites("local x = then")).toThrow("parsed");
});
