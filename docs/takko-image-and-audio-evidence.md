# Takko image and audio asset evidence

Implemented 2026-09-15. This extends the application-owned asset loop; no assistant-selected assets or manually authored game were supplied as worker output.

## Images

The worker can search Image candidates, import the selected result into an owned quarantine, verify the resolved texture loads, mount the Decal on a preview surface, obtain native screenshots and request visual evaluation. Placement uses the declared position and size, followed by another capture/evaluation. The exported Part/Decal retains the actual texture ID separately from the searched Creator Store candidate ID. Unsupported descendants and material/UV properties are rejected rather than silently omitted.

## Audio

Takko launches its own bounded Windows helper to record the selected Studio process and its children. It does not record a microphone or the system-wide mix. The controller requires exactly one connected Studio and one installed Studio process, checks process creation identity, records a quiet baseline, and asks the native adapter to play only the owned candidate. Already-playing Studio Sounds/AudioPlayers cause rejection. Clips and receipts are stored with SHA-256 identifiers.

Each inspection and placed verification requires its own recording, bound to the candidate, run token, Studio and process incarnation. WAV validation rejects malformed data, silence, clipping and a noisy baseline. These checks establish usable evidence, not sound suitability. The configured evaluator receives the actual WAV as multimodal input and must explicitly accept its audio fit. Metrics or waveform summaries cannot substitute for listening.

Gemini and OpenRouter request adapters support WAV input; the selected model must itself support audio. Unsupported providers/models fail without automatic fallback. The first configured reviewer route is used; a second route is not silently substituted. Provider-reported cost is retained when available; otherwise configured-rate estimates remain estimates, with an additional audio input reservation.

Current limits: Windows process loopback; one Studio; native playback capped at five seconds; bounded capture; short non-positional asset previews. This is process isolation, not isolation of an individual Sound: later unrelated audio inside the same Studio process could contaminate a clip. Final-game timing, layering, spatial audio, animation and interaction still require independent native gameplay verification. Animation retrieval remains unsupported.

Build the helper with `npm run audio:build`. The Windows desktop build also compiles and copies it into its service resources using the existing absolute Windows Framework C# compiler. No SDK download or Python installation is involved.

## Verification and current runtime

`npm run check` passed: 549 unit/API tests across 50 files, 10 desktop checks, 36 browser tests, six offline combat scenarios, 14 mocked plugin scenarios, compilation, guards, builds and HTTP smoke. Provider and Studio adapter tests use controlled doubles; they are not paid model or live Studio results.

A separate real Windows self-test captured a synthetic 440 Hz tone from one owned helper process while another owned process played 1760 Hz. It passed target inclusion, other-process exclusion and quiet-baseline assertions. This establishes native helper operation on this machine only. It did not record Studio, evaluate an ASMR asset or measure game quality. See [verification record](results/takko-image-audio-verification.json).

The updated isolated app runs at http://127.0.0.1:4324 with `.forge/asset-loop-runtime` storage. The final discovery check and key-presence flags are recorded separately. Live image import, Studio sound capture, paid listening evaluation and Butter Crunch generation remain unrun. A connected disposable Studio, a worker key and an explicitly audio-capable reviewer are needed for that experiment. Freeze a Butter Crunch-specific benchmark case before scoring; the existing generic ASMR case is a different task.

## Python Install Manager interruption

Read-only inspection found `python` and `python3` resolve to Microsoft Store execution aliases under the user's WindowsApps directory. Takko has no Python requirement; no direct Python invocation was found in its source, launch scripts or desktop code. The Store activation broker does not identify which original caller triggered the popup, so its cause cannot be attributed conclusively.

The workspace instructions now prohibit bare Python alias probes. If a separate future task needs Python, use the already-installed bundled runtime by verified absolute path. No Python installation, alias setting change or Store process manipulation was performed.

## Primary references

- [Microsoft: why python.exe opens the Store](https://learn.microsoft.com/en-us/windows/dev-environment/python#why-does-running-pythonexe-open-the-microsoft-store)
- [Windows process-loopback capture](https://learn.microsoft.com/en-us/samples/microsoft/windows-classic-samples/applicationloopbackaudio-sample/)
- [Process loopback modes](https://learn.microsoft.com/en-us/windows/win32/api/audioclientactivationparams/ne-audioclientactivationparams-process_loopback_mode)
- [Roblox Decal](https://create.roblox.com/docs/reference/engine/classes/Decal)
- [Roblox Sound objects](https://create.roblox.com/docs/sound/objects)
- [Gemini audio input](https://ai.google.dev/gemini-api/docs/audio)
- [OpenRouter multimodal API](https://openrouter.ai/blog/insights/every-modality-one-api/)
