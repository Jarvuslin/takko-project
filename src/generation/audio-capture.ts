import { spawn, execFile, type ChildProcess } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  inspectPcmWav,
  validateStudioAudio,
  type StudioAudioCapture,
  type StudioAudioEvidence,
} from "./audio-evidence";

type Binding = { pid: number; startedAt: string; executable: string };
type Client = {
  callTool(
    name: string,
    args: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<unknown>;
};
const execFileAsync = promisify(execFile);
export type AudioCaptureOptions = {
  helperPath: string;
  evidenceDirectory: string;
  localAppData?: string;
  /** Dependency injection for isolated tests; production uses native process discovery. */
  processes?: (signal: AbortSignal) => Promise<Binding[]>;
  spawnHelper?: (file: string, args: string[]) => ChildProcess;
  baselineDelayMs?: number;
};
async function processes(signal: AbortSignal): Promise<Binding[]> {
  if (process.platform !== "win32")
    throw Error("Studio process audio capture requires Windows");
  const powershell = path.join(
    process.env.SystemRoot ?? "C:\\Windows",
    "System32",
    "WindowsPowerShell",
    "v1.0",
    "powershell.exe",
  );
  const script =
    "$ErrorActionPreference='Stop'; $items=@(Get-Process -Name RobloxStudioBeta -ErrorAction SilentlyContinue | ForEach-Object { [pscustomobject]@{pid=$_.Id;startedAt=$_.StartTime.ToUniversalTime().ToString('o');executable=$_.Path} }); ConvertTo-Json -InputObject $items -Compress";
  const result = await execFileAsync(
    powershell,
    ["-NoProfile", "-NonInteractive", "-Command", script],
    { windowsHide: true, timeout: 10000, maxBuffer: 65536, signal },
  );
  return JSON.parse(result.stdout.trim() || "[]");
}
function unpack(raw: any): any {
  for (let i = 0; i < 5; i++) {
    if (raw?.isError)
      throw Error("Studio discovery failed during audio binding");
    if (typeof raw === "string") {
      raw = JSON.parse(raw);
      continue;
    }
    if (raw?.structuredContent) {
      raw = raw.structuredContent;
      continue;
    }
    if (Array.isArray(raw?.content)) {
      const text = raw.content.filter((b: any) => b.type === "text");
      if (text.length === 1) {
        raw = text[0].text;
        continue;
      }
    }
    return raw;
  }
  throw Error("Unsupported Studio audio binding response");
}
function cancelled(signal: AbortSignal) {
  if (signal.aborted) throw Error("Studio audio capture cancelled");
}

/** Only an unambiguous connected Studio and its verified installed process may be captured. */
export function createStudioAudioCapture(
  client: Client,
  options: AudioCaptureOptions,
): StudioAudioCapture {
  const discover = options.processes ?? processes;
  const captureSpawn =
    options.spawnHelper ??
    ((file, args) =>
      spawn(file, args, {
        windowsHide: true,
        shell: false,
        stdio: ["pipe", "pipe", "pipe"],
      }));
  async function bind(studioId: string, signal: AbortSignal) {
    cancelled(signal);
    const studios = unpack(
      await client.callTool("list_roblox_studios", {}, signal),
    );
    if (
      !Array.isArray(studios?.studios) ||
      studios.studios.length !== 1 ||
      studios.studios[0].id !== studioId
    )
      throw Error(
        "Audio capture requires exactly one connected, explicitly selected Studio",
      );
    const matches = await discover(signal);
    if (!Array.isArray(matches) || matches.length !== 1)
      throw Error(
        "Audio capture requires one unambiguous Roblox Studio process",
      );
    const match = matches[0],
      root = options.localAppData ?? process.env.LOCALAPPDATA;
    if (
      !root ||
      !Number.isSafeInteger(match.pid) ||
      match.pid <= 0 ||
      !Number.isFinite(Date.parse(match.startedAt)) ||
      typeof match.executable !== "string"
    )
      throw Error("Invalid Studio process identity");
    const relative = path.win32.relative(
      path.win32.join(root, "Roblox", "Versions"),
      match.executable,
    );
    if (!/^version-[A-Za-z0-9]+\\RobloxStudioBeta\.exe$/i.test(relative))
      throw Error("Audio target is not an installed Roblox Studio executable");
    return match;
  }
  const capture: StudioAudioCapture = async (input, playback, signal) => {
    cancelled(signal);
    if (
      !path.isAbsolute(options.helperPath) ||
      !fs.existsSync(options.helperPath)
    )
      throw Error(
        "Native Studio audio helper is unavailable; no recording or external rescue was attempted",
      );
    const binding = await bind(input.studioId, signal);
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "takko-audio-"));
    const output = path.join(temporary, "capture.wav");
    let capturedAt = "",
      completion:
        | {
            sha256: string;
            frames: number;
            sampleRate: number;
            channels: number;
            leadingSilenceFrames: number;
          }
        | undefined;
    let child: ChildProcess | undefined, playPromise: Promise<void> | undefined;
    let childClosed = false,
      closePromise = Promise.resolve(),
      failed = false;
    try {
      await new Promise<void>((resolve, reject) => {
        let buffer = "",
          ready = false,
          complete = false,
          settled = false,
          playbackFinished = false,
          stderr = "";
        const fail = (error: Error) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          signal.removeEventListener("abort", abort);
          child?.kill();
          reject(error);
        };
        const abort = () => fail(Error("Studio audio capture cancelled"));
        const timer = setTimeout(
          () => fail(Error("Studio audio capture helper timed out")),
          14000,
        );
        signal.addEventListener("abort", abort, { once: true });
        if (signal.aborted) {
          abort();
          return;
        }
        try {
          child = captureSpawn(options.helperPath, [
            "--pid",
            String(binding.pid),
            "--started-at",
            binding.startedAt,
            "--duration-ms",
            "8000",
            "--output",
            output,
          ]);
          closePromise = new Promise<void>((resolve) =>
            child!.once("close", () => {
              childClosed = true;
              resolve();
            }),
          );
        } catch (error) {
          fail(error as Error);
          return;
        }
        child.once("error", (error) => fail(error));
        child.stderr?.on("data", (chunk) => {
          stderr = (stderr + String(chunk)).slice(-1000);
        });
        child.stdout?.on("data", (chunk) => {
          if (settled) return;
          buffer += String(chunk);
          if (buffer.length > 65536) {
            fail(Error("Oversized audio helper response"));
            return;
          }
          let newline: number;
          while ((newline = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, newline).trim();
            buffer = buffer.slice(newline + 1);
            if (!line) continue;
            let value: any;
            try {
              value = JSON.parse(line);
            } catch {
              fail(Error("Invalid audio helper response"));
              return;
            }
            if (!value || typeof value !== "object" || Array.isArray(value)) {
              fail(Error("Invalid audio helper event object"));
              return;
            }
            if (value.event === "ready") {
              if (
                ready ||
                value.processId !== binding.pid ||
                value.startedAt !== binding.startedAt ||
                value.mode !== "include_process_tree" ||
                value.durationMs !== 8000 ||
                !Number.isFinite(Date.parse(value.captureStartedAt))
              ) {
                fail(Error("Audio helper readiness identity mismatch"));
                return;
              }
              ready = true;
              capturedAt = value.captureStartedAt;
              playPromise = (async () => {
                await new Promise((r) =>
                  setTimeout(r, options.baselineDelayMs ?? 500),
                );
                cancelled(signal);
                if (settled) throw Error("Audio capture ended before playback");
                await playback();
                playbackFinished = true;
              })();
              playPromise.catch((error) =>
                fail(error instanceof Error ? error : Error(String(error))),
              );
            } else if (value.event === "complete") {
              if (
                !ready ||
                complete ||
                typeof value.output !== "string" ||
                path.resolve(value.output) !== output ||
                value.processId !== binding.pid ||
                value.startedAt !== binding.startedAt ||
                value.mode !== "include_process_tree" ||
                value.status !== "captured" ||
                !Number.isSafeInteger(value.leadingSilenceFrames) ||
                value.leadingSilenceFrames < 0
              ) {
                fail(Error("Audio helper completion mismatch"));
                return;
              }
              if (!playbackFinished) {
                fail(
                  Error(
                    "Audio capture ended before native playback verification completed",
                  ),
                );
                return;
              }
              complete = true;
              completion = value;
            } else if (value.event === "error")
              fail(
                Error(
                  "Audio helper failed: " +
                    String(value.message ?? "unknown error"),
                ),
              );
            else {
              fail(Error("Unexpected audio helper event"));
              return;
            }
          }
        });
        child.once("close", (code) => {
          if (settled) return;
          if (code !== 0 || !ready || !complete) {
            fail(
              Error(
                "Audio helper exited without a completed recording" +
                  (stderr ? ": " + stderr : ""),
              ),
            );
            return;
          }
          settled = true;
          clearTimeout(timer);
          signal.removeEventListener("abort", abort);
          resolve();
        });
      });
      await playPromise;
      cancelled(signal);
      const after = await bind(input.studioId, signal);
      if (
        after.pid !== binding.pid ||
        after.startedAt !== binding.startedAt ||
        after.executable !== binding.executable
      )
        throw Error("Studio process identity changed during audio capture");
      const bytes = fs.readFileSync(output),
        wav = inspectPcmWav(bytes, completion?.leadingSilenceFrames);
      if (
        !completion ||
        completion.sha256 !== wav.sha256 ||
        completion.frames !== wav.frames ||
        completion.sampleRate !== wav.sampleRate ||
        completion.channels !== wav.channels
      )
        throw Error("Audio helper receipt does not match recorded PCM");
      const file = path.resolve(options.evidenceDirectory, wav.sha256 + ".wav");
      const evidence: StudioAudioEvidence = {
        dataUrl: "data:audio/wav;base64," + bytes.toString("base64"),
        sha256: wav.sha256,
        durationMs: wav.durationMs,
        sampleRate: wav.sampleRate,
        channels: wav.channels,
        rms: wav.rms,
        peak: wav.peak,
        source: {
          kind: "studio_process_loopback",
          mode: "include_process_tree",
          ...input,
          processId: binding.pid,
          processStartedAt: binding.startedAt,
          capturedAt,
          file,
          leadingSilenceFrames: completion.leadingSilenceFrames,
        },
      };
      validateStudioAudio(evidence, input);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      if (fs.existsSync(file)) {
        if (!fs.readFileSync(file).equals(bytes))
          throw Error("Audio evidence hash collision");
      } else fs.writeFileSync(file, bytes, { flag: "wx" });
      return evidence;
    } catch (error) {
      failed = true;
      throw error;
    } finally {
      if (child && !childClosed) {
        child.kill();
        let closeTimeout: ReturnType<typeof setTimeout> | undefined;
        try {
          await Promise.race([
            closePromise,
            new Promise((r) => {
              closeTimeout = setTimeout(r, 1000);
            }),
          ]);
        } finally {
          clearTimeout(closeTimeout);
        }
      }
      // Only the exact fresh temporary output owned by this capture is removed.
      try {
        if (child && !childClosed)
          throw Error(
            "Audio helper did not close; temporary recording cleanup is unresolved",
          );
        if (fs.existsSync(output)) fs.unlinkSync(output);
        fs.rmdirSync(temporary);
      } catch (error) {
        if (!failed) throw error;
      }
    }
  };
  capture.bindStudio = bind;
  return capture;
}
