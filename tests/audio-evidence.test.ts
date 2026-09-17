import { expect, it } from "vitest";
import {
  inspectPcmWav,
  validateStudioAudio,
  type StudioAudioEvidence,
  type StudioAudioAudition,
} from "../src/generation/audio-evidence";
export function audioFixture({
  silent = false,
  baseline = false,
  clipped = false,
} = {}) {
  const rate = 16000,
    bytes = Buffer.alloc(44 + rate * 2);
  bytes.write("RIFF", 0);
  bytes.writeUInt32LE(bytes.length - 8, 4);
  bytes.write("WAVEfmt ", 8);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(rate, 24);
  bytes.writeUInt32LE(rate * 2, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write("data", 36);
  bytes.writeUInt32LE(rate * 2, 40);
  for (let i = 0; i < rate; i++)
    bytes.writeInt16LE(
      silent || (!baseline && i < rate * 0.3)
        ? 0
        : clipped
          ? 32767
          : Math.round(Math.sin(i * 0.14) * 8000),
      44 + i * 2,
    );
  return bytes;
}
function evidence(bytes = audioFixture()): StudioAudioEvidence {
  const wav = inspectPcmWav(bytes);
  return {
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
      studioId: "studio",
      candidateId: "123",
      token: "owned",
      processId: 1234,
      processStartedAt: "2026-09-15T12:00:00Z",
      capturedAt: "2026-09-15T13:00:00Z",
      file: "fixture.wav",
    },
  };
}
const binding = { studioId: "studio", candidateId: "123", token: "owned" };
const audition: StudioAudioAudition = {
  runtimeNonce: "d07d09ea-3740-461c-bf1f-e91d9c27a114",
  soundId: "rbxassetid://123",
  nativeTimeLengthSeconds: 0.6,
  playbackSpeed: 1,
  playbackLimitSeconds: 5,
  playbackElapsedSeconds: 0.62,
  maxTimePositionSeconds: 0.59,
  endedNaturally: true,
  playbackWindowTruncated: false,
};
it("keeps native source duration independent of the measured recorder window", () => {
  const e = evidence();
  e.source.audition = { ...audition };
  expect(validateStudioAudio(e, binding).durationMs).toBe(1000);
  expect(e.source.audition.nativeTimeLengthSeconds).toBe(0.6);
  const legacy = evidence();
  expect(legacy.source.audition).toBeUndefined();
  expect(validateStudioAudio(legacy, binding).durationMs).toBe(1000);
});
it.each([
  { nativeTimeLengthSeconds: 0 },
  { nativeTimeLengthSeconds: NaN },
  { playbackElapsedSeconds: 8 },
  { maxTimePositionSeconds: 9 },
  { playbackSpeed: 2 },
  { endedNaturally: false },
  { runtimeNonce: "invented" },
])("rejects invalid native playback observations: %j", (defect) => {
  const e = evidence();
  e.source.audition = { ...audition, ...defect };
  expect(() => validateStudioAudio(e, binding)).toThrow(
    "audition observations",
  );
});
it("measures actual bounded PCM without treating waveform statistics as semantic fit", () => {
  const result = validateStudioAudio(evidence(), binding);
  expect(result.durationMs).toBe(1000);
  expect(result.baselineRms).toBe(0);
  expect(result.rms).toBeGreaterThan(0.01);
});
it.each(["silent", "baseline", "clipped"] as const)(
  "rejects %s clips",
  (kind) => {
    expect(() =>
      validateStudioAudio(evidence(audioFixture({ [kind]: true })), binding),
    ).toThrow();
  },
);
it.each(["candidateId", "token", "studioId"] as const)(
  "rejects mismatched %s",
  (key) => {
    const e = evidence();
    e.source[key] = "different";
    expect(() => validateStudioAudio(e, binding)).toThrow("bound");
  },
);
it("rejects altered hashes, measurements and encodings", () => {
  const e = evidence();
  e.sha256 = "0".repeat(64);
  expect(() => validateStudioAudio(e, binding)).toThrow("bytes");
  const f = evidence();
  f.durationMs = 8000;
  expect(() => validateStudioAudio(f, binding)).toThrow("bytes");
  const g = evidence();
  g.dataUrl += "=";
  expect(() => validateStudioAudio(g, binding)).toThrow();
});
it("startup padding cannot masquerade as a quiet native baseline", () => {
  const e = evidence();
  e.source.leadingSilenceFrames = 4000;
  expect(() => validateStudioAudio(e, binding)).toThrow("baseline");
  e.source.leadingSilenceFrames = 5000;
  expect(() => validateStudioAudio(e, binding)).toThrow("startup gap");
});
it.each(["riff-size", "sample-rate", "block-align", "float", "truncated"])(
  "rejects malformed %s WAV",
  (kind) => {
    let bytes = audioFixture();
    if (kind === "riff-size") bytes.writeUInt32LE(1, 4);
    if (kind === "sample-rate") bytes.writeUInt32LE(1, 24);
    if (kind === "block-align") bytes.writeUInt16LE(8, 32);
    if (kind === "float") bytes.writeUInt16LE(3, 20);
    if (kind === "truncated") bytes = bytes.subarray(0, 100);
    expect(() => inspectPcmWav(bytes)).toThrow();
  },
);
