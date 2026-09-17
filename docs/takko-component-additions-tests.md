# Real worker-authored scripts and native bubble-wrap behavior

2026-09-16. The component adaptation interface now supports adding real scripts during Edit, with explicit parent, execution context and restricted permissions. A fresh raw Gemini 3.7 Flash response used this interface successfully. In Studio, its unchanged code handled 72 real clicks, completion, reset and another pop. This is a component diagnostic, not a finished game or a general model-quality result.

## Changes and regression checks

- `component-adaptation.ts` accepts bounded `addSources`, validates retained parents, unique sibling names, class/run-context combinations, source size and captured permission templates. New scripts are sandboxed and inherit only an existing restricted template's capabilities. The worker cannot choose elevated permissions. Native application verifies the actual template and preserves the resulting settings through recapture.
- Expected inventory reconstruction accounts for additions, remaps retained children/source bindings and rebuilds post-edit review evidence, including security profiles. Historical manifests without additions retain their record shape.
- `runtime-source-check.ts` parses Luau ASTs and rejects actual direct `.Source` / `["Source"]` assignment targets, including compound assignment. Source-looking comments and strings do not trigger it. The previous raw worker's failing runtime assignment is a regression fixture. This is a bounded direct-property rule, not complete alias or data-flow analysis.
- The native adaptation diagnostic compiles new sources and applies them before imported code executes. The scoped playtest utility records original enablement and source hashes, pauses existing scripts, and provides durable, ownership-checked restoration code before staging a fixture.

Targeted tests: **43 passed**, including 11 added adaptation cases and 6 AST cases. Full **`npm run check` passed 848 unit/API, 10 desktop and 36 browser tests**, plus Luau, plugin, guards, build and production smoke. [Full log](../research/results/component-additions-v1/check.log). The diagnostic staging utility was subsequently exercised through actual staging and restoration in Studio.

## Raw worker result

One call used the frozen worker-selected bubble-wrap component, original game context and previous review. The root agent supplied no replacement game code, manual asset choice or edited worker manifest. The worker removed the original loader/reset subtrees, replaced all 72 pop scripts, and added `BubbleBreakManager` (Server) and `BubbleBreakClient` (Client). It retained all 72 sound bindings and left desk backdrop/lighting as outstanding integration work.

The first response passed the new contract. Native application and recapture verified **367 instances, 74 script bindings, 3 unique source bodies and 72 sound bindings**, including the new scripts' execution and security settings. The runtime Source-assignment workaround is absent. [Raw worker records](../research/results/component-additions-v1/worker/results.json), [native receipt](results/takko-component-additions/native/bubble-wrap-result.json).

The call cost **$0.0664305**, with 29,364 input and 11,842 output tokens. Official key status settled at usage $3.033418386 and **$6.966581614 remaining** of the shared $10 limit at 08:27:28 UTC. The settled delta exactly equals this call. The encrypted saved credential was reused; no re-entry was required. The immediately-after-call status had lagged and is preserved separately from the settled result.

## Native Play observations

Place1, engine 0.739.0.7390687. The diagnostic paused three existing scripts without changing their sources. The test used official mouse input and character navigation; it did not fire gameplay events, write counters, patch generated source or substitute sounds. A test camera was positioned overhead.

| Check | Observed result |
|---|---|
| Startup | HUD 0/72; 72 click detectors and 72 loaded sounds |
| First bubble | 1/72 |
| Same bubble again | Stayed 1/72 |
| Second bubble | 2/72 |
| Reset button | 0/72, completion hidden |
| Initial 72-coordinate sweep | 35/72; raycasts identified existing Place1 geometry occluding remaining bubbles |
| Isolated rerun | Moved only the owned test component +100 studs X in Edit, restarted, navigated the character to it; 72 real clicks reached 72/72 and completion became visible |
| Reset after completion | 0/72, completion hidden |
| Pop after reset | 1/72 |
| Console | No output returned |
| Cleanup | Play stopped; all three original source hashes checked, enabled states restored; owned fixture and restoration record removed |

[Raw observations and restoration receipt](results/takko-component-additions/play/play-evidence.json), [completion screenshot](results/takko-component-additions/play/completed-72.png), [initial occlusion screenshot](results/takko-component-additions/play/initial-occlusion.png).

The screenshot still contains a white `0` overlay from the pre-existing place. It is not a clean visual acceptance image. The complete sheet, banner and button are visible, and the counter value was independently read from the generated HUD. No audio-listening or sound-playback-timing acceptance was performed; loaded Sound assets and retained bindings alone do not prove audio quality. Reset during an active tween, multiplayer, touch input and full-game presentation remain untested.

A separate Rojo-built component place opened successfully in a second Studio process (PID25668), but that session was not exposed through MCP. No Play result is claimed for that file. The native test above used the already authorized Place1 session, which is now back in Edit with original scripts enabled.

## Remaining work

These modules and diagnostics are **not yet wired into the production asset pipeline's accept/export path**. The running app remains the previous PID36672 on port4324; no activation is claimed. Connect verified component derivatives to integration/export, preserve deterministic checks and native behavior gates, then run fresh varied end-to-end trials. Combat animation/dummy/hit counter/SFX, parkour fall recovery, Marketplace sourcing quality and complete game acceptance remain outstanding. This frozen-component replay does not measure whether a fresh worker finds the correct asset or fully understands a new game brief.
