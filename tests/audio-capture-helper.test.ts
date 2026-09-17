import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

// These executable tests stop at argument/identity validation. Recording is
// opt-in through native/audio-capture/selftest.mjs, using owned synthetic tones.
describe.skipIf(process.platform !== 'win32')('process-only audio helper boundary', () => {
  let directory: string;
  let executable: string;
  beforeAll(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'takko-audio-'));
    const built = execFileSync(process.execPath, ['scripts/build-audio-capture.mjs', directory], {
      encoding: 'utf8', windowsHide: true, timeout: 30000,
    });
    executable = JSON.parse(built.trim()).executable;
  }, 35000);
  afterAll(() => {
    if (directory && path.dirname(directory) === path.resolve(os.tmpdir()) && path.basename(directory).startsWith('takko-audio-')) {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
  function args(overrides: Record<string, string> = {}) {
    return Object.entries({ '--pid': String(process.pid), '--started-at': '2000-01-01T00:00:00.0000000Z', '--duration-ms': '500', '--output': path.join(directory, 'capture.wav'), ...overrides }).flat();
  }
  function rejected(input: string[], code: string) {
    const result = spawnSync(executable, input, { encoding: 'utf8', windowsHide: true, shell: false, timeout: 3000 });
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stderr).toBe('');
    const events = result.stdout.trim().split('\n').map(line => JSON.parse(line));
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ event: 'error', code, semanticVerified: false });
    expect(fs.existsSync(path.join(directory, 'capture.wav'))).toBe(false);
  }
  it('compiles a real x64 executable with the installed explicit compiler', () => {
    const bytes = fs.readFileSync(executable);
    expect(bytes.subarray(0, 2).toString()).toBe('MZ');
    expect(bytes.readUInt16LE(bytes.readUInt32LE(0x3c) + 4)).toBe(0x8664);
  });
  it.each(['--system', '--microphone', '--exclude-pid', '--mode'])('rejects unimplemented capture option %s', option => {
    rejected([...args(), option, '1'], 'arguments');
  });
  it.each(['0', '499', '8001', '-1', '500.5'])('rejects unbounded duration %s before native activation', value => {
    rejected(args({ '--duration-ms': value }), 'arguments');
  });
  it('rejects missing, duplicate and odd option lists', () => {
    rejected([], 'arguments');
    rejected([...args(), '--pid', String(process.pid)], 'arguments');
    rejected([...args(), '--pid'], 'arguments');
  });
  it('rejects invalid PID and timestamps without an explicit timezone', () => {
    rejected(args({ '--pid': '0' }), 'arguments');
    rejected(args({ '--started-at': '2026-09-15T12:00:00' }), 'arguments');
  });
  it('rejects an existing target with the wrong creation time without creating output', () => {
    rejected(args(), 'identity');
  });
  it('rejects output outside a caller-owned capture directory and non-WAV output', () => {
    rejected(args({ '--output': path.join(os.tmpdir(), 'audio-capture-forbidden.wav') }), 'output');
    rejected(args({ '--output': path.join(directory, 'capture.mp3') }), 'output');
    rejected(args({ '--output': 'capture.wav' }), 'output');
  });
  it('preserves existing output bytes and does not overwrite', () => {
    const output = path.join(directory, 'existing.wav');
    fs.writeFileSync(output, 'preserve');
    rejected(args({ '--output': output }), 'output');
    expect(fs.readFileSync(output, 'utf8')).toBe('preserve');
  });
  it('prevents tone mode from being combined with capture parameters', () => {
    rejected([...args(), '--selftest-tone-hz', '440'], 'arguments');
  });
});
