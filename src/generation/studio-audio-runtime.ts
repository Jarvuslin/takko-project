import { randomUUID } from "node:crypto";
import type { AssetReceipt } from "./asset-contract";
import type { StudioAudioCapture, StudioAudioEvidence } from "./audio-evidence";
import {
  validateStudioAudio,
  AudioCandidateEvidenceError,
  validateAudioAudition,
  type StudioAudioAudition,
} from "./audio-evidence";
import { isVerifiedClientPlayState, isVerifiedEditState } from "./studio-state";

export class AudioRuntimeError extends Error {
  constructor(
    message: string,
    readonly effects: "owned" | "unknown",
    readonly classification:
      | "candidate_rejected"
      | "infrastructure_failure"
      | "unknown_effects" = effects === "unknown"
      ? "unknown_effects"
      : "infrastructure_failure",
  ) {
    super(message);
  }
}
type Client = {
  callTool(
    name: string,
    args: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<unknown>;
};
function unpack(value: any): any {
  for (let i = 0; i < 6; i++) {
    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
        continue;
      } catch {
        return value;
      }
    }
    if (value?.structuredContent) {
      value = value.structuredContent;
      continue;
    }
    if (value?.content?.length === 1 && value.content[0].type === "text") {
      value = value.content[0].text;
      continue;
    }
    return value;
  }
  return value;
}

/** A client-only nonce is deliberately absent from Edit. After claim, restarting Play cannot
 * inherit permission to stop the replacement runtime. All uncertain dispatches
 * halt without additional mutations, even if a later state read looks familiar. */
export async function auditionStudioAudio(input: {
  client: Client;
  capture: StudioAudioCapture;
  studioId: string;
  candidateId: string;
  token: string;
  scope: string;
  target: string[];
  receipts: AssetReceipt[];
  signal: AbortSignal;
}): Promise<StudioAudioEvidence> {
  const { client, capture, studioId, candidateId, token, receipts } = input;
  if (!capture.bindStudio)
    throw new AudioRuntimeError(
      "Audio capture lacks exact Studio process binding",
      "owned",
    );
  const signal = AbortSignal.any([input.signal, AbortSignal.timeout(45000)]);
  const binding = await capture.bindStudio(studioId, signal);
  const nonce = randomUUID(),
    marker = "TakkoAudition_" + nonce.replaceAll("-", "");
  let started = false,
    claimed = false,
    pending = false,
    uncertain = false,
    stopping = false;
  const record = (operation: string, data: unknown) =>
    receipts.push({ operation, studioId, at: new Date().toISOString(), data });
  record("audio_runtime_binding", { binding, marker, nonce, token });
  const call = async (
    name: string,
    args: Record<string, unknown>,
    active: AbortSignal,
    mutation = false,
  ) => {
    active.throwIfAborted();
    try {
      const raw: any = await client.callTool(name, args, active);
      record(name, raw);
      if (raw?.isError) throw Error("Tool returned an error");
      return unpack(raw);
    } catch (error) {
      record("audio_runtime_failure", {
        operation: name,
        error: String(error),
        effects: mutation ? "unknown" : "owned",
      });
      if (mutation) uncertain = true;
      throw new AudioRuntimeError(
        name + " failed during audio audition",
        mutation ? "unknown" : "owned",
      );
    }
  };
  const verify = async (runtime: boolean, active: AbortSignal) => {
    const deadline = Date.now() + 8000;
    do {
      const current = await capture.bindStudio!(studioId, active);
      if (JSON.stringify(current) !== JSON.stringify(binding))
        throw new AudioRuntimeError(
          "Studio process changed during audition",
          started ? "unknown" : "owned",
        );
      const state = await call(
        "get_studio_state",
        { studio_id: studioId },
        active,
      );
      if (
        runtime ? isVerifiedClientPlayState(state) : isVerifiedEditState(state)
      )
        return;
      // Only a successfully acknowledged start/stop permits bounded readiness polling.
      // Playback/ownership guards do not poll past an unexpected external transition.
      if (
        !((runtime && started && !claimed) || (!runtime && stopping)) ||
        Date.now() >= deadline
      )
        break;
      await new Promise((resolve) => setTimeout(resolve, 150));
    } while (!active.aborted);
    throw new AudioRuntimeError(
      "Unexpected Studio state during audio audition",
      started ? "unknown" : "owned",
    );
  };
  const header = `local Http=game:GetService("HttpService")\nlocal Run=game:GetService("RunService")\nlocal NAME=${JSON.stringify(marker)}\nlocal NONCE=${JSON.stringify(nonce)}\nlocal TOKEN=${JSON.stringify(token)}\nlocal function reply(operation,ok,extra) local r=extra or {};r.marker="takko_audio_runtime_v1";r.operation=operation;r.ok=ok;r.nonce=NONCE;return Http:JSONEncode(r) end\nlocal function unique(parent,name) local found=nil;for _,v in parent:GetChildren() do if v.Name==name then assert(not found,"Ambiguous audition identity");found=v end end;return found end\n`;
  const execute = async (
    operation: string,
    body: string,
    runtime: boolean,
    active: AbortSignal,
    mutation = true,
  ) => {
    await verify(runtime, active);
    const result = await call(
      "execute_luau",
      {
        studio_id: studioId,
        datamodel_type: runtime ? "Client" : "Edit",
        code: header + body,
      },
      active,
      mutation,
    );
    if (
      result?.marker !== "takko_audio_runtime_v1" ||
      result.operation !== operation ||
      result.nonce !== nonce ||
      typeof result.ok !== "boolean"
    ) {
      uncertain = mutation;
      throw new AudioRuntimeError(
        "Unrecognized audio runtime receipt",
        mutation ? "unknown" : "owned",
      );
    }
    if (!["prepare", "load", "playback"].includes(operation) && !result.ok)
      throw new AudioRuntimeError(
        "Audio runtime " + operation + " was not verified",
        "unknown",
      );
    return result;
  };
  const owner = `assert(Run:IsRunning() and Run:IsClient(),"Client runtime required")\nlocal marker=assert(unique(workspace,NAME),"Missing audition marker")\nassert(marker:GetAttribute("TakkoAssetToken")==TOKEN and marker:GetAttribute("RuntimeNonce")==NONCE,"Runtime ownership changed")\n`;
  let audio: StudioAudioEvidence | undefined, failure: unknown;
  try {
    const prep = await execute(
      "prepare",
      `assert(not Run:IsRunning(),"Edit required")
for _,item in game:GetDescendants() do
 if item:IsA("BaseScript") and not item.Disabled and not item:IsDescendantOf(game:GetService("ServerStorage")) then return reply("prepare",false,{reason="Active place scripts prevent isolated audition"}) end
 if (item:IsA("Sound") or item:IsA("AudioPlayer")) and item.IsPlaying then return reply("prepare",false,{reason="Other Studio audio is playing"}) end
end
assert(not unique(workspace,NAME),"Audition marker already exists")
local marker=Instance.new("Folder");marker.Name=NAME;marker:SetAttribute("TakkoAssetToken",TOKEN);marker.Parent=workspace
return reply("prepare",true)`,
      false,
      signal,
    );
    if (!prep.ok) throw new AudioRuntimeError(String(prep.reason), "owned");
    await verify(false, signal);
    await call(
      "start_stop_play",
      { studio_id: studioId, is_start: true },
      signal,
      true,
    );
    started = true;
    await execute(
      "claim",
      `assert(Run:IsRunning() and Run:IsClient(),"Client runtime required")
local marker=assert(unique(workspace,NAME),"Missing audition marker")
assert(marker:GetAttribute("TakkoAssetToken")==TOKEN and marker:GetAttribute("RuntimeNonce")==nil,"Runtime ownership changed")
marker:SetAttribute("RuntimeNonce",NONCE)
return reply("claim",true)`,
      true,
      signal,
    );
    claimed = true;
    // Load before the helper's short recording window, in the actual Client.
    const loaded = await execute(
      "load",
      owner +
        `
local root=workspace
for _,name in ${"{" + input.target.map((v) => JSON.stringify(v)).join(",") + "}"} do root=assert(unique(root,name),"Missing audition target") end
assert(root:GetAttribute("TakkoAssetToken")==TOKEN,"Audio target ownership changed")
local sounds={};local items={root};for _,item in root:GetDescendants() do table.insert(items,item) end
for _,item in items do assert(not item:IsA("LuaSourceContainer"),"Executable audition content");if item:IsA("Sound") then table.insert(sounds,item) end end
assert(#sounds==1,"One audition Sound required")
local sound=sounds[1];sound:Stop();sound.PlayOnRemove=false;sound.TimePosition=0;sound.Volume=0.65;sound.PlaybackSpeed=1;sound.Looped=false
local copy=sound:Clone();copy.Name="Sound";copy.Parent=marker
local done=false;task.spawn(function() pcall(function() game:GetService("ContentProvider"):PreloadAsync({copy}) end);done=true end)
local deadline=os.clock()+8;while not done and os.clock()<deadline do task.wait(0.05) end
return reply("load",done and copy.IsLoaded and copy.TimeLength>0,{soundId=copy.SoundId,nativeTimeLengthSeconds=copy.TimeLength,playbackSpeed=copy.PlaybackSpeed})`,
      true,
      signal,
    );
    if (!loaded.ok)
      throw new AudioRuntimeError(
        "Client audio failed loading",
        "owned",
        "candidate_rejected",
      );
    if (
      typeof loaded.soundId !== "string" ||
      !Number.isFinite(loaded.nativeTimeLengthSeconds) ||
      loaded.nativeTimeLengthSeconds <= 0 ||
      loaded.playbackSpeed !== 1
    )
      throw new AudioRuntimeError(
        "Client audio duration was not verified",
        "owned",
      );
    let played = false,
      callbackError: unknown;
    let audition: StudioAudioAudition | undefined;
    try {
      audio = await capture(
        { studioId, candidateId, token },
        async () => {
          if (played)
            throw new AudioRuntimeError(
              "Audio playback callback may execute only once",
              "owned",
            );
          played = true;
          pending = true;
          try {
            const result = await execute(
              "playback",
              owner +
                `
local sound=assert(unique(marker,"Sound"),"Missing audition Sound")
for _,other in game:GetDescendants() do if other~=sound and (other:IsA("Sound") or other:IsA("AudioPlayer")) then assert(not other.IsPlaying,"Other Studio audio is playing") end end
local progressed=false;local maxPosition=0;local ended=false;local elapsed=0
local endedConnection=sound.Ended:Connect(function() ended=true end)
local ok,err=pcall(function()
 local start=os.clock();sound:Play();local deadline=start+math.min(5,sound.TimeLength+0.1)
 while os.clock()<deadline and not ended do task.wait(0.025);maxPosition=math.max(maxPosition,sound.TimePosition);progressed=progressed or sound.TimePosition>0;assert(Run:IsRunning() and Run:IsClient(),"Runtime changed during playback") end
 elapsed=os.clock()-start
end)
endedConnection:Disconnect()
sound:Stop();sound.TimePosition=0
return reply("playback",ok and progressed,{reason=ok and "" or tostring(err),playbackObserved=progressed,soundId=sound.SoundId,nativeTimeLengthSeconds=sound.TimeLength,playbackSpeed=sound.PlaybackSpeed,playbackLimitSeconds=5,playbackElapsedSeconds=elapsed,maxTimePositionSeconds=maxPosition,endedNaturally=ended,playbackWindowTruncated=not ended})`,
              true,
              signal,
            );
            if (!result.ok || result.playbackObserved !== true)
              throw new AudioRuntimeError(
                "Native audio playback did not advance",
                "owned",
                "candidate_rejected",
              );
            if (
              result.soundId !== loaded.soundId ||
              result.nativeTimeLengthSeconds !==
                loaded.nativeTimeLengthSeconds ||
              result.playbackSpeed !== loaded.playbackSpeed
            )
              throw new AudioRuntimeError(
                "Client audio identity or duration changed during audition",
                "owned",
              );
            audition = {
              runtimeNonce: nonce,
              soundId: result.soundId,
              nativeTimeLengthSeconds: result.nativeTimeLengthSeconds,
              playbackSpeed: result.playbackSpeed,
              playbackLimitSeconds: result.playbackLimitSeconds,
              playbackElapsedSeconds: result.playbackElapsedSeconds,
              maxTimePositionSeconds: result.maxTimePositionSeconds,
              endedNaturally: result.endedNaturally,
              playbackWindowTruncated: result.playbackWindowTruncated,
            };
            validateAudioAudition(audition);
          } catch (error) {
            callbackError = error;
            throw error;
          } finally {
            pending = false;
          }
        },
        signal,
      );
      if (callbackError) throw callbackError;
      if (pending)
        throw new AudioRuntimeError(
          "Capture returned with playback pending",
          "unknown",
        );
      if (!played)
        throw new AudioRuntimeError(
          "Capture did not execute verified native playback",
          "owned",
        );
      if (!audition)
        throw new AudioRuntimeError(
          "Native audio audition observations missing",
          "owned",
        );
      audio = { ...audio, source: { ...audio.source, audition } };
      validateStudioAudio(audio, { studioId, candidateId, token });
      if (
        audio.source.processId !== binding.pid ||
        audio.source.processStartedAt !== binding.startedAt
      )
        throw new AudioRuntimeError(
          "Capture process does not match runtime binding",
          "owned",
        );
    } catch (error) {
      if (callbackError) throw callbackError;
      throw error;
    }
  } catch (error) {
    failure = error;
  }
  // A timed out mutation may still be executing. Never stop or delete behind it.
  if (
    uncertain ||
    pending ||
    (failure instanceof AudioRuntimeError && failure.effects === "unknown")
  )
    throw new AudioRuntimeError(
      failure instanceof Error
        ? failure.message
        : "Audio audition outcome unknown",
      "unknown",
    );
  const restore = AbortSignal.timeout(15000);
  try {
    if (started) {
      if (!claimed)
        throw new AudioRuntimeError(
          "Runtime start was not claimed; stop deferred",
          "unknown",
        );
      await execute(
        "ownership",
        owner + 'return reply("ownership",true)',
        true,
        restore,
        false,
      );
      await call(
        "start_stop_play",
        { studio_id: studioId, is_start: false },
        restore,
        true,
      );
      stopping = true;
    }
    await execute(
      "restore",
      `assert(not Run:IsRunning(),"Edit restoration required")
local marker=unique(workspace,NAME)
if marker then assert(marker:GetAttribute("TakkoAssetToken")==TOKEN and marker:GetAttribute("RuntimeNonce")==nil,"Edit marker ownership changed");marker:Destroy();assert(not unique(workspace,NAME),"Audition marker cleanup failed") end
return reply("restore",true)`,
      false,
      restore,
    );
    record("audio_runtime_restored", {
      token,
      nonce,
      editVerified: true,
      markerRemoved: true,
    });
  } catch (error) {
    throw new AudioRuntimeError(
      "Audio runtime restoration was not verified: " + String(error),
      "unknown",
    );
  }
  if (failure instanceof AudioCandidateEvidenceError)
    throw new AudioRuntimeError(failure.message, "owned", "candidate_rejected");
  if (failure) throw failure;
  if (!audio) throw new AudioRuntimeError("Audio evidence missing", "owned");
  return audio;
}
