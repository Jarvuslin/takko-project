import { afterEach, expect, it } from "vitest";
import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Check } from "../src/generation/schema";

const execute = promisify(execFile);
const workspace = process.cwd();
const compilerDirectory = path.resolve("research/tools/luau");
const loader = createRequire(import.meta.url).resolve("tsx");
const validationUrl = pathToFileURL(
  path.resolve("src/generation/validation.ts"),
).href;
const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0))
    fs.rmSync(directory, { recursive: true, force: true });
});

async function compileFrom(
  cwd: string,
  compilerPath: string,
): Promise<Check[]> {
  // A child isolates cwd and environment changes from other tests and the app.
  const script = `
    const { compileSources } = await import(${JSON.stringify(validationUrl)});
    const checks = await compileSources({ files: [] }, [
      { id: "valid", source: "local value: number = 42\\nreturn value" },
      { id: "invalid", source: "local =" }
    ]);
    process.stdout.write(JSON.stringify(checks));
  `;
  const { stdout } = await execute(
    process.execPath,
    [
      "--import",
      pathToFileURL(loader).href,
      "--input-type=module",
      "-e",
      script,
    ],
    {
      cwd,
      env: { ...process.env, LUAU_BIN_DIR: compilerPath },
      windowsHide: true,
      timeout: 12000,
    },
  );
  return JSON.parse(stdout);
}

it("reports an explicit missing compiler instead of falling back to the workspace compiler", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "forge-compiler-"));
  temporaryDirectories.push(directory);
  const checks = await compileFrom(workspace, directory);
  expect(checks).toEqual([
    {
      id: "luau",
      status: "failed",
      detail:
        "Luau compiler is missing at configured LUAU_BIN_DIR: " +
        path.join(
          directory,
          "luau-compile" + (process.platform === "win32" ? ".exe" : ""),
        ),
    },
  ]);
});

it.each(["absolute", "relative"] as const)(
  "uses a configured %s compiler location when the worker cwd is a separate data directory",
  async (kind) => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "forge-compiler-"));
    temporaryDirectories.push(directory);
    const checks = await compileFrom(
      directory,
      kind === "absolute"
        ? compilerDirectory
        : path.relative(directory, compilerDirectory),
    );
    expect(checks).toHaveLength(2);
    expect(checks[0]).toMatchObject({ id: "compile:valid", status: "passed" });
    expect(checks[1]).toMatchObject({
      id: "compile:invalid",
      status: "failed",
    });
    expect(checks[1].detail).toContain("SyntaxError");
    expect(fs.readdirSync(path.join(directory, ".forge/validation"))).toEqual(
      [],
    );
  },
);
