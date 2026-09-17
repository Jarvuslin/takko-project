import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import type { ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, it, vi } from 'vitest';
import { createStudioAudioCapture } from '../src/generation/audio-capture';

function fixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'takko-audio-lifecycle-'));
  const helper = path.join(directory, 'helper.exe');
  fs.writeFileSync(helper, 'fixture');
  const controller = new AbortController();
  const binding = { pid: 4242, startedAt: '2026-09-15T12:00:00.1234567Z', executable: 'C:\\Users\\fixture\\AppData\\Local\\Roblox\\Versions\\version-abcd\\RobloxStudioBeta.exe' };
  const child = new EventEmitter() as ChildProcess;
  Object.assign(child, { stdout: new PassThrough(), stderr: new PassThrough(), exitCode: null, killed: false });
  let closed = false;
  child.kill = vi.fn(() => {
    if (!child.killed) {
      Object.assign(child, { killed: true });
      setTimeout(() => { closed = true; Object.assign(child, { exitCode: 1 }); child.emit('close', 1, null); }, 25);
    }
    return true;
  });
  let output = '';
  let spawned!: () => void;
  const spawning = new Promise<void>(resolve => { spawned = resolve; });
  const capture = createStudioAudioCapture({ callTool: async () => ({ studios: [{ id: 'studio' }] }) }, {
    helperPath: helper, evidenceDirectory: path.join(directory, 'evidence'),
    localAppData: 'C:\\Users\\fixture\\AppData\\Local', processes: async () => [binding], baselineDelayMs: 0,
    spawnHelper: (_file, args) => { output = args[args.indexOf('--output') + 1]; spawned(); return child; },
  });
  const emit = (value: unknown) => child.stdout!.emit('data', Buffer.from(JSON.stringify(value) + '\n'));
  const ready = () => emit({ event: 'ready', processId: binding.pid, startedAt: binding.startedAt, mode: 'include_process_tree', durationMs: 8000, captureStartedAt: new Date().toISOString(), sampleRate: 44100, channels: 2, bitsPerSample: 16 });
  return { directory, controller, binding, child, capture, spawning, emit, ready, output: () => output, closed: () => closed,
    clean: () => { controller.abort(); child.kill(); fs.rmSync(directory, { recursive: true, force: true }); } };
}

it.each([null, { event: 'complete', output: 123 }])('malformed helper JSON %j rejects without throwing out of stream handler', async value => {
  const f = fixture();
  try {
    const outcome = f.capture({ studioId: 'studio', candidateId: '123', token: 'owned' }, async () => {}, f.controller.signal).catch(error => error);
    await f.spawning;
    if (value !== null) f.ready();
    let thrown: unknown;
    try { f.emit(value); } catch (error) { thrown = error; f.controller.abort(); }
    const result = await outcome;
    expect(thrown).toBeUndefined();
    expect(result).toBeInstanceOf(Error);
  } finally { f.clean(); }
});

it('cancellation settles despite an unresolved native playback and waits for owned helper close', async () => {
  const f = fixture();
  let playbackStarted!: () => void;
  const started = new Promise<void>(resolve => { playbackStarted = resolve; });
  let finishPlayback!: () => void;
  const pending = new Promise<void>(resolve => { finishPlayback = resolve; });
  try {
    const outcome = f.capture({ studioId: 'studio', candidateId: '123', token: 'owned' }, () => { playbackStarted(); return pending; }, f.controller.signal).catch(error => error);
    await f.spawning;
    fs.writeFileSync(f.output(), 'partial');
    f.ready(); await started; f.controller.abort();
    const result = await Promise.race([outcome, new Promise(resolve => setTimeout(() => resolve('hung'), 1500))]);
    finishPlayback();
    await outcome;
    expect(result).toBeInstanceOf(Error);
    expect(f.closed()).toBe(true);
    expect(fs.existsSync(f.output())).toBe(false);
  } finally { finishPlayback?.(); f.clean(); }
});
