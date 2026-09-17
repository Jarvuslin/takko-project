import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { inspectPcmWav } from "../src/generation/audio-evidence";
import type { ChildProcess } from "node:child_process";
import { it, expect, vi } from "vitest";
import { createStudioAudioCapture } from "../src/generation/audio-capture";

function wav() {
  const rate = 16000,
    b = Buffer.alloc(44 + rate * 2);
  b.write("RIFF");
  b.writeUInt32LE(b.length - 8, 4);
  b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24);
  b.writeUInt32LE(rate * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36);
  b.writeUInt32LE(rate * 2, 40);
  for (let i = 4800; i < rate; i++)
    b.writeInt16LE(Math.round(Math.sin(i / 20) * 7000), 44 + i * 2);
  return b;
}
function setup(mode = "ok") {
  const dir = fs.mkdtempSync(
      path.join(os.tmpdir(), "takko-audio-controller-test-"),
    ),
    helper = path.join(dir, "helper.exe");
  fs.writeFileSync(helper, "");
  const input = { studioId: "studio", candidateId: "123", token: "owned" },
    binding = {
      pid: 4242,
      startedAt: "2026-09-15T12:00:00.1234567Z",
      executable:
        "C:\\Users\\fixture\\AppData\\Local\\Roblox\\Versions\\version-abcd\\RobloxStudioBeta.exe",
    };
  const client = {
    callTool: vi.fn(async () => ({
      studios:
        mode === "ambiguous-studio"
          ? [{ id: "studio" }, { id: "other" }]
          : [{ id: "studio" }],
    })),
  };
  let reads = 0;
  const processes = vi.fn(async () => {
    reads++;
    return mode === "ambiguous-process"
      ? [binding, binding]
      : [
          {
            ...binding,
            ...(mode === "wrong-exe" ? { executable: "C:\\OtherApp.exe" } : {}),
            ...(mode === "pid-reused" && reads > 1
              ? { startedAt: "2026-09-15T13:00:00.1234567Z" }
              : {}),
          },
        ];
  });
  const spawnHelper = vi.fn((_file: string, args: string[]) => {
    let killed = false;
    const child = new EventEmitter() as any;
    child.stdout = new PassThrough();
    child.stderr = new PassThrough();
    child.kill = vi.fn(() => {
      killed = true;
      queueMicrotask(() => child.emit("close", 1));
      return true;
    });
    const output = args[args.indexOf("--output") + 1];
    setTimeout(() => {
      if (killed) return;
      child.stdout.write(
        JSON.stringify({
          event: "ready",
          processId: mode === "wrong-ready" ? 1 : 4242,
          startedAt: binding.startedAt,
          mode: "include_process_tree",
          durationMs: 8000,
          captureStartedAt: new Date().toISOString(),
        }) + "\n",
      );
      setTimeout(() => {
        if (killed) return;
        if (mode !== "missing-file") fs.writeFileSync(output, wav());
        child.stdout.write(
          JSON.stringify({
            event: "complete",
            output,
            status: "captured",
            processId: 4242,
            startedAt: binding.startedAt,
            mode: "include_process_tree",
            ...inspectPcmWav(wav()),
            leadingSilenceFrames: 0,
          }) + "\n",
        );
        child.emit("close", 0);
      }, 15);
    }, 0);
    return child as ChildProcess;
  });
  const capture = createStudioAudioCapture(client, {
    helperPath: helper,
    evidenceDirectory: path.join(dir, "evidence"),
    localAppData: "C:\\Users\\fixture\\AppData\\Local",
    processes,
    spawnHelper,
    baselineDelayMs: 0,
  });
  return {
    dir,
    input,
    capture,
    client,
    processes,
    spawnHelper,
    clean: () => fs.rmSync(dir, { recursive: true, force: true }),
  };
}
it("binds one selected Studio, captures once, persists verified WAV and removes owned temporary output", async () => {
  const s = setup();
  try {
    const playback = vi.fn(async () => {});
    const e = await s.capture(s.input, playback, new AbortController().signal);
    expect(playback).toHaveBeenCalledOnce();
    expect(s.processes).toHaveBeenCalledTimes(2);
    expect(e.source.processId).toBe(4242);
    expect(fs.readFileSync(e.source.file)).toEqual(wav());
    const args = s.spawnHelper.mock.calls[0][1];
    expect(args).toContain("2026-09-15T12:00:00.1234567Z");
    expect(fs.existsSync(args[args.indexOf("--output") + 1])).toBe(false);
  } finally {
    s.clean();
  }
});
it.each(["ambiguous-studio", "ambiguous-process", "wrong-exe"])(
  "refuses %s before starting any recording",
  async (mode) => {
    const s = setup(mode);
    try {
      const play = vi.fn(async () => {});
      await expect(
        s.capture(s.input, play, new AbortController().signal),
      ).rejects.toThrow();
      expect(s.spawnHelper).not.toHaveBeenCalled();
      expect(play).not.toHaveBeenCalled();
    } finally {
      s.clean();
    }
  },
);
it.each(["wrong-ready", "missing-file", "pid-reused"])(
  "rejects %s instead of returning audio evidence",
  async (mode) => {
    const s = setup(mode);
    try {
      await expect(
        s.capture(s.input, async () => {}, new AbortController().signal),
      ).rejects.toThrow();
    } finally {
      s.clean();
    }
  },
);
it("rejects recording that ends before native playback verification", async () => {
  const s = setup();
  try {
    await expect(
      s.capture(
        s.input,
        async () => {
          await new Promise((r) => setTimeout(r, 40));
        },
        new AbortController().signal,
      ),
    ).rejects.toThrow("before native playback");
  } finally {
    s.clean();
  }
});
it("pre-aborted capture never discovers or spawns", async () => {
  const s = setup();
  try {
    await expect(
      s.capture(s.input, async () => {}, AbortSignal.abort()),
    ).rejects.toThrow("cancelled");
    expect(s.client.callTool).not.toHaveBeenCalled();
    expect(s.spawnHelper).not.toHaveBeenCalled();
  } finally {
    s.clean();
  }
});
