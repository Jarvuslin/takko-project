# Maze generation recovery and native verification — 2026-09-14

The Models dialog now closes after Save succeeds, restores focus to its launcher, and remains open with the error when saving fails. Save & fetch model catalog remains open so the user can select a model.

## Generator changes

The earlier Humanoid/joint/reference contract fix remains in place. This follow-up also fixes `.module.luau` names in both XML exports and plugin application, accepts absent asset source URLs without claiming missing assets are implemented, and permits builders to register necessary new scripts omitted by a scene-only plan. Other tasks' ownership and project boundaries remain enforced.

Provider timeouts can fall through to configured alternatives; cancellation still stops. An unaffordable route can fall through to an affordable configured alternative without increasing the cap. Truncated/incomplete provider responses remain rejected, but their reported usage/cost is retained instead of automatically charging the entire reservation. That billing improvement is prospective: earlier unknown costs were not retroactively invented or refunded.

Starting a fresh build now preserves the previous artifact and review in history. Incomplete-build Repair still resumes completed-task checkpoints. The live server was reloaded while idle, preserving the user's four session keys; no credentials were written into source, evidence, or reload helpers.

## What happened to the actual model run

The original project is `d0dab662-25dd-4705-a0ef-ed45134bf4bf`, approved revision 4, Brainrot Maze Sprint. Qwen produced character, buff, HUD, respawn, and sound scripts, but the saved result had significant runtime defects. A Gemini review identified anchored characters, nonexistent Roblox signals, server camera manipulation, invalid disconnects, recursive lifecycle code and missing spawn geometry. Its repair response was truncated.

The project's cap remained **$0.25**. The ledger reached **242,678 microdollars ($0.242678)**, including conservative reservations for calls without usable billing metadata. This is not a statement that the provider invoiced that exact amount. A mistaken fresh-build invocation was stopped; scripts were recovered from the saved full provider response and geometry from the earlier checkpoint, retaining all charges and documenting recovery in project events. No successful autonomous full-game generation is claimed.

## Local engineering repair

`scripts/repair-brainrot-maze.ts` applies the sources in `repairs/brainrot-maze/` to that exact saved project. It checkpoints the current project first, retains the model-written acceptance tests, adds independent gameplay scenarios, and compiles/validates before enabling export/apply. This is a repair of one user project, not a preset inserted into the generic generator.

The repaired game has a connected, unanchored R6 mug character, procedural walk cycle, a navigable maze, server-authoritative zone speed/glow, client FOV and adaptive sound, a health HUD, and a short-delay respawn at the entrance. The sound is Roblox's bundled wind ambience, not composed music or an invented uploaded asset. Built-in audio provenance is checked against a small explicit supported list; playback is verified separately.

A real solo test caught stale HUD state after respawn. Moving its controller from a StarterGui Folder to StarterPlayerScripts fixed the lifecycle: the persistent ScreenGui now has a persistent controller, with health subscriptions rebound to each new character.

## Verification

Final `npm run check` passed: **105 unit tests, 16 desktop/mobile browser cases, five plugin mock scenarios, six retained offline combat cases, compiler/guard checks, TypeScript/Vite build and production HTTP smoke**. Offline fixtures remain distinct from real model runs and Studio integration.

In a separate native Studio process, the installed Forge plugin paired with localhost:4318, polled the real apply operation, installed the actual repaired project under an undo recording, ran its protected tests, and delivered the matching artifact hash back to Forge.

- **13 solo tests passed**, including walking more than six studs, zone entry/exit, glow creation/removal, speed restoration, real damage, new character after death, entrance positioning, HUD damage/respawn updates, client FOV/adaptive sound, and loaded/playing audio.
- **Three multiplayer scenarios passed** using `StudioTestService:ExecuteMultiplayerTestAsync(2, ...)`: independent speed/FOV/HUD/audio across two real clients; respawn of one player without affecting the other; actual client leave followed by `AddPlayers(1)` and fresh character/HUD/buff state.
- Both reports captured **zero runtime error logs**. Roblox platform/plugin startup HTTP warnings are not included in that claim.

Evidence: [native reports](results/maze-studio-verification.json). The tested artifact hash is `b3ef9f5a6c861fa1361be00b64f696ff30fe9b85e5804ad6ee91c03b32fc778f`. Tests ran in `.forge/evaluation/Forge-maze-playtest.rbxlx`; the unrelated farm place was preserved.

[Actual Studio client preview](results/maze-studio-play.png) shows the mug character at the entrance, readable health HUD, maze walls, and visible green buff pool. A separate live preview of this same exported artifact was left open in Studio after testing. The standard disk plugin was restored; the temporary preview launcher exists only in that already-open session.

The temporary verification driver is installed with `scripts/install-studio-plugin.ts --maze-verify` and runs only in the named disposable place. Restore the standard disk plugin afterward by running that installer without flags. Multiplayer tests use the [official StudioTestService API](https://create.roblox.com/docs/reference/engine/classes/StudioTestService).

## Remaining limit

The reported schema/export/plugin defects and this project's observed runtime failures are fixed. Fresh, fully automatic generation quality has not been demonstrated by the repaired maze. A further paid end-to-end run requires permission to raise the current project cap; it must be reported separately from the local engineering repair. Visual polish and a composed music track are also not established by these assertions.
