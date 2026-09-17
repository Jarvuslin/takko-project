import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL, fileURLToPath } from "node:url";
const sourceRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export function buildAudioCapture(
  outputDirectory = path.resolve(".forge/tools/audio-capture"),
) {
  if (process.platform !== "win32")
    throw Error(
      "Process-only audio capture requires Windows; no installation was attempted",
    );
  const compiler = path.join(
    process.env.SystemRoot ?? "C:\\Windows",
    "Microsoft.NET",
    "Framework64",
    "v4.0.30319",
    "csc.exe",
  );
  if (!fs.existsSync(compiler))
    throw Error(
      "The explicit installed Framework C# compiler is unavailable; no SDK or Python fallback was attempted",
    );
  const output = path.resolve(outputDirectory);
  fs.mkdirSync(output, { recursive: true });
  const executable = path.join(output, "TakkoAudioCapture.exe");
  const result = spawnSync(
    compiler,
    [
      "/nologo",
      "/target:exe",
      "/platform:x64",
      "/optimize+",
      "/reference:System.Web.Extensions.dll",
      `/out:${executable}`,
      path.join(sourceRoot, "native/audio-capture/AudioCapture.cs"),
    ],
    {
      shell: false,
      windowsHide: true,
      encoding: "utf8",
      timeout: 30000,
      maxBuffer: 1024 * 1024,
    },
  );
  if (result.error || result.status !== 0)
    throw Error(
      "Audio helper compilation failed: " +
        (result.error?.message ?? result.stdout + result.stderr),
    );
  return executable;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  console.log(
    JSON.stringify({ executable: buildAudioCapture(process.argv[2]) }),
  );
