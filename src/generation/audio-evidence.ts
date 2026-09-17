import { createHash } from "node:crypto";

/** Completed, bound recording whose candidate signal is unsuitable to evaluate. */
export class AudioCandidateEvidenceError extends Error {}

/** Native client observations, separate from the recorder's padded WAV window. */
export type StudioAudioAudition = {
  runtimeNonce: string;
  soundId: string;
  nativeTimeLengthSeconds: number;
  playbackSpeed: number;
  playbackLimitSeconds: number;
  playbackElapsedSeconds: number;
  maxTimePositionSeconds: number;
  endedNaturally: boolean;
  playbackWindowTruncated: boolean;
};

export function validateAudioAudition(value: StudioAudioAudition) {
  if (
    !value ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      value.runtimeNonce,
    ) ||
    !/^(?:rbxassetid:\/\/\d+|https?:\/\/www\.roblox\.com\/asset\/\?id=\d+)$/.test(
      value.soundId,
    ) ||
    !Number.isFinite(value.nativeTimeLengthSeconds) ||
    value.nativeTimeLengthSeconds <= 0 ||
    value.playbackSpeed !== 1 ||
    value.playbackLimitSeconds !== 5 ||
    !Number.isFinite(value.playbackElapsedSeconds) ||
    value.playbackElapsedSeconds <= 0 ||
    value.playbackElapsedSeconds > 5.5 ||
    !Number.isFinite(value.maxTimePositionSeconds) ||
    value.maxTimePositionSeconds <= 0 ||
    value.maxTimePositionSeconds > value.nativeTimeLengthSeconds + 0.1 ||
    typeof value.endedNaturally !== "boolean" ||
    value.playbackWindowTruncated !== !value.endedNaturally
  )
    throw Error("Invalid bound native audio audition observations");
}

export type StudioAudioEvidence = {
  dataUrl: string;
  sha256: string;
  durationMs: number;
  sampleRate: number;
  channels: number;
  rms: number;
  peak: number;
  source: {
    kind: "studio_process_loopback";
    mode: "include_process_tree";
    studioId: string;
    candidateId: string;
    token: string;
    processId: number;
    processStartedAt: string;
    capturedAt: string;
    file: string;
    leadingSilenceFrames?: number;
    audition?: StudioAudioAudition;
  };
};
export type StudioProcessBinding = {
  pid: number;
  startedAt: string;
  executable: string;
};
export type StudioAudioCapture = ((
  input: { studioId: string; candidateId: string; token: string },
  playback: () => Promise<void>,
  signal: AbortSignal,
) => Promise<StudioAudioEvidence>) & {
  /** Resolves the selected Studio to an unambiguous installed process incarnation. */
  bindStudio?: (
    studioId: string,
    signal: AbortSignal,
  ) => Promise<StudioProcessBinding>;
};

/** Decode the bounded PCM contract emitted by the native capture helper. */
export function inspectPcmWav(bytes: Buffer, leadingSilenceFrames = 0) {
  if (
    bytes.length < 44 ||
    bytes.length > 5 * 1024 * 1024 ||
    bytes.toString("ascii", 0, 4) !== "RIFF" ||
    bytes.toString("ascii", 8, 12) !== "WAVE" ||
    bytes.readUInt32LE(4) + 8 !== bytes.length
  )
    throw Error("Invalid bounded WAV container");
  let format:
    { channels: number; sampleRate: number; blockAlign: number } | undefined;
  let pcm: Buffer | undefined;
  for (let offset = 12; offset < bytes.length;) {
    if (offset + 8 > bytes.length) throw Error("Truncated WAV chunk");
    const kind = bytes.toString("ascii", offset, offset + 4),
      size = bytes.readUInt32LE(offset + 4),
      start = offset + 8,
      end = start + size;
    if (end > bytes.length) throw Error("Truncated WAV payload");
    if (kind === "fmt ") {
      if (
        format ||
        size < 16 ||
        bytes.readUInt16LE(start) !== 1 ||
        bytes.readUInt16LE(start + 14) !== 16
      )
        throw Error("WAV must contain one PCM16 format");
      const channels = bytes.readUInt16LE(start + 2),
        sampleRate = bytes.readUInt32LE(start + 4),
        blockAlign = bytes.readUInt16LE(start + 12);
      if (
        ![1, 2].includes(channels) ||
        sampleRate < 8000 ||
        sampleRate > 48000 ||
        blockAlign !== channels * 2 ||
        bytes.readUInt32LE(start + 8) !== sampleRate * blockAlign
      )
        throw Error("Unsupported WAV sample format");
      format = { channels, sampleRate, blockAlign };
    } else if (kind === "data") {
      if (pcm) throw Error("Duplicate WAV data");
      pcm = bytes.subarray(start, end);
    }
    offset = end + (size % 2);
    if (offset > bytes.length) throw Error("Missing WAV padding");
  }
  if (!format || !pcm?.length || pcm.length % format.blockAlign)
    throw Error("Missing or incomplete PCM frames");
  const frames = pcm.length / format.blockAlign,
    durationMs = (frames / format.sampleRate) * 1000;
  if (durationMs < 500 || durationMs > 8100)
    throw Error("Audio evidence must last 0.5–8.1 seconds");
  if (
    !Number.isSafeInteger(leadingSilenceFrames) ||
    leadingSilenceFrames < 0 ||
    leadingSilenceFrames > format.sampleRate * 0.25
  )
    throw Error("Invalid native audio startup gap");
  let sum = 0,
    peak = 0,
    clipped = 0,
    baselineSum = 0;
  const count = pcm.length / 2,
    baselineStart = leadingSilenceFrames * format.channels,
    baselineCount = Math.min(
      count - baselineStart,
      Math.floor(format.sampleRate * 0.2) * format.channels,
    );
  for (let i = 0; i < count; i++) {
    const value = pcm.readInt16LE(i * 2) / 32768;
    sum += value * value;
    peak = Math.max(peak, Math.abs(value));
    if (Math.abs(value) >= 0.999) clipped++;
    if (i >= baselineStart && i < baselineStart + baselineCount)
      baselineSum += value * value;
  }
  return {
    ...format,
    frames,
    durationMs,
    rms: Math.sqrt(sum / count),
    peak,
    clippedFraction: clipped / count,
    baselineRms: Math.sqrt(baselineSum / baselineCount),
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}

export function validateStudioAudio(
  value: StudioAudioEvidence,
  expected: { studioId?: string; candidateId: string; token: string },
) {
  if (
    !value ||
    !/^data:audio\/wav;base64,[A-Za-z0-9+/]+={0,2}$/.test(value.dataUrl) ||
    value.dataUrl.length > 7 * 1024 * 1024
  )
    throw Error("Actual bounded WAV evidence is required");
  const base64 = value.dataUrl.slice("data:audio/wav;base64,".length),
    bytes = Buffer.from(base64, "base64");
  if (bytes.toString("base64") !== base64) throw Error("Invalid WAV encoding");
  const wav = inspectPcmWav(bytes, value.source?.leadingSilenceFrames ?? 0),
    source = value.source;
  if (
    !source ||
    source.kind !== "studio_process_loopback" ||
    source.mode !== "include_process_tree" ||
    source.candidateId !== expected.candidateId ||
    source.token !== expected.token ||
    !source.studioId ||
    (expected.studioId && source.studioId !== expected.studioId) ||
    !Number.isSafeInteger(source.processId) ||
    source.processId < 1 ||
    !Number.isFinite(Date.parse(source.processStartedAt)) ||
    !Number.isFinite(Date.parse(source.capturedAt)) ||
    !source.file
  )
    throw Error(
      "Audio evidence is not bound to the selected asset and Studio process",
    );
  if (
    value.sha256 !== wav.sha256 ||
    value.durationMs !== wav.durationMs ||
    value.sampleRate !== wav.sampleRate ||
    value.channels !== wav.channels ||
    value.rms !== wav.rms ||
    value.peak !== wav.peak
  )
    throw Error("Audio receipt does not match recorded bytes");
  if (source.audition !== undefined) validateAudioAudition(source.audition);
  if (wav.baselineRms > 0.001)
    throw Error(
      "Studio audio baseline was not quiet; candidate evidence is contaminated",
    );
  if (wav.rms < 0.0001 || wav.peak < 0.001)
    throw new AudioCandidateEvidenceError(
      "Audio capture is silent or too faint to evaluate",
    );
  if (wav.clippedFraction > 0.01)
    throw new AudioCandidateEvidenceError(
      "Audio capture is excessively clipped",
    );
  return wav;
}
